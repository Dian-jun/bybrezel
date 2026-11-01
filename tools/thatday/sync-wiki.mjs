// Offline ingestion only. No visitor data, paid API, or service-role credentials.
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { normalizeTime } from "./collect-history.mjs";
import { normalizeEvent, toSQL } from "./import-history.mjs";
const UA =
  "ThatDayWeArchive/1.0 (https://bybrezel.com/thatday/; historical research)";
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export class WikiAPIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
export async function getJSON(url, { fetcher = fetch } = {}) {
  const response = await fetcher(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new WikiAPIError(
      `Wikimedia HTTP ${response.status}; stop and retry later`,
      response.status,
    );
  const body = await response.json();
  if (body.error)
    throw new WikiAPIError(
      `Wikimedia ${body.error.code}; stop and retry later`,
      response.status,
    );
  return body;
}
export function reviewCandidate(candidate, entity, page, retrieved) {
  normalizeEvent(candidate);
  const id = candidate.id.replace(/^wikidata-/, "");
  if (entity.id !== id || entity.missing !== undefined)
    throw Error("Wikidata entity mismatch");
  const copy = structuredClone(candidate);
  copy.verification_status = "pending_review";
  const flags = new Set([
    ...(copy.review?.flags ?? []),
    "human_review_required",
  ]);
  const dateClaims = [];
  for (const property of ["P585", "P580", "P582"])
    for (const claim of entity.claims?.[property] ?? []) {
      if (claim.rank === "deprecated") continue;
      const v = claim.mainsnak?.datavalue?.value;
      if (!v) continue;
      const date = normalizeTime(v.time, v.precision);
      if (!date || !v.calendarmodel?.endsWith("/Q1985727")) {
        flags.add("unsupported_date_or_calendar");
        continue;
      }
      dateClaims.push({
        property,
        ...date,
        statement: claim.id,
        has_references: Boolean(claim.references?.length),
      });
    }
  const same = dateClaims.some(
    (d) =>
      d.property !== "P582" &&
      d.date === copy.date_start &&
      d.precision === copy.date_precision,
  );
  if (!same) flags.add("date_requires_reconciliation");
  if (!dateClaims.length) flags.add("missing_current_date_claim");
  const countries = (entity.claims?.P17 ?? [])
    .filter((c) => c.rank !== "deprecated")
    .map((c) => c.mainsnak?.datavalue?.value?.id);
  if (!countries.includes("Q884")) flags.add("korean_scope_requires_review");
  if (!entity.labels?.ko?.value) flags.add("missing_korean_label");
  // Never change an event's date/precision based on a different claim automatically.
  const article = entity.sitelinks?.kowiki;
  let wikipedia = null;
  if (
    article &&
    page &&
    !("missing" in page) &&
    page.ns === 0 &&
    page.pageprops?.wikibase_item === id &&
    !("disambiguation" in (page.pageprops ?? {}))
  ) {
    const revision = page.revisions?.[0]?.revid;
    const url = page.fullurl;
    if (revision && url?.startsWith("https://ko.wikipedia.org/wiki/")) {
      wikipedia = {
        title: page.title,
        url,
        revision,
        revision_url: `https://ko.wikipedia.org/w/index.php?oldid=${revision}`,
        history_url: `https://ko.wikipedia.org/w/index.php?title=${encodeURIComponent(page.title)}&action=history`,
        checked_at: retrieved,
        body_copied: false,
      };
      copy.sources = copy.sources.filter(
        (s) => new URL(s.source_url).hostname !== "ko.wikipedia.org",
      );
      copy.sources.push({
        source_title: `한국어 위키백과 · ${page.title}`,
        source_url: wikipedia.revision_url,
        publisher: "한국어 위키백과 기여자",
        license:
          "Reference link and revision metadata only; no article text or media copied",
        retrieved_at: retrieved,
      });
    } else flags.add("wikipedia_revision_unavailable");
  } else
    flags.add(
      article
        ? "wikipedia_identity_requires_review"
        : "missing_korean_wikipedia_article",
    );
  copy.review = {
    ...copy.review,
    flags: [...flags],
    wiki_sync: {
      wikidata_id: id,
      entity_revision: entity.lastrevid,
      current_label: entity.labels?.ko?.value ?? null,
      current_date_claims: dateClaims,
      wikipedia,
      checked_at: retrieved,
    },
  };
  return normalizeEvent(copy);
}
async function readJSON(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw e;
  }
}
async function atomicJSON(path, value) {
  await writeFile(path + ".tmp", JSON.stringify(value, null, 2) + "\n");
  await rename(path + ".tmp", path);
}
export async function syncWiki({
  input = "research/history/candidates.json",
  out = "outputs/wiki-review",
  limit = 100,
  offset = 0,
  fetcher = fetch,
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
  now = new Date(),
} = {}) {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 500 ||
    !Number.isInteger(offset) ||
    offset < 0
  )
    throw Error("limit must be 1–500; offset must be non-negative");
  const source = await readJSON(input, null);
  if (!Array.isArray(source)) throw Error("Candidate JSON array required");
  // Never ingest the deployed archive as a candidate list; source identity is explicit.
  const eligible = source.filter(
    (e) =>
      /^wikidata-Q\d+$/.test(e.id) &&
      e.verification_status === "pending_review",
  );
  const selected = eligible.slice(offset, offset + limit);
  if (!selected.length) throw Error("No candidates in requested page");
  if (new Set(selected.map((e) => e.id)).size !== selected.length)
    throw Error("Duplicate candidate identity");
  await mkdir(out, { recursive: true });
  const retrieved = now.toISOString().slice(0, 10),
    cache = await readJSON(resolve(out, "cache.json"), {}),
    results = [],
    errors = [];
  let requests = 0,
    cacheHits = 0,
    stop = false;
  const request = async (url) => {
    requests++;
    const v = await getJSON(url, { fetcher });
    await wait(1100);
    return v;
  };
  for (let i = 0; i < selected.length && !stop; i += 25) {
    const batch = selected.slice(i, i + 25),
      entities = {},
      pages = {};
    const fresh = batch.filter((e) => {
      const c = cache[e.id];
      if (
        c &&
        now.getTime() - Date.parse(c.fetched_at) >= 0 &&
        now.getTime() - Date.parse(c.fetched_at) < 7 * 86400000
      ) {
        entities[e.id] = c.entity;
        pages[e.id] = c.page;
        cacheHits++;
        return false;
      }
      return true;
    });
    try {
      if (fresh.length) {
        const url = new URL("https://www.wikidata.org/w/api.php");
        url.search = new URLSearchParams({
          action: "wbgetentities",
          ids: fresh.map((e) => e.id.slice(9)).join("|"),
          props: "labels|sitelinks|claims",
          languages: "ko|en",
          format: "json",
          maxlag: "5",
        });
        const data = await request(url);
        for (const e of fresh) entities[e.id] = data.entities?.[e.id.slice(9)];
        const titles = fresh
          .map((e) => entities[e.id]?.sitelinks?.kowiki?.title)
          .filter(Boolean);
        if (titles.length) {
          const wiki = new URL("https://ko.wikipedia.org/w/api.php");
          wiki.search = new URLSearchParams({
            action: "query",
            titles: [...new Set(titles)].join("|"),
            prop: "info|pageprops|revisions",
            inprop: "url",
            rvprop: "ids|timestamp",
            format: "json",
            formatversion: "2",
            maxlag: "5",
          });
          const data = await request(wiki);
          const byTitle = new Map(
            (data.query?.pages ?? []).map((p) => [p.title, p]),
          );
          for (const e of fresh)
            pages[e.id] =
              byTitle.get(entities[e.id]?.sitelinks?.kowiki?.title) ?? null;
        }
        for (const e of fresh)
          if (entities[e.id])
            cache[e.id] = {
              fetched_at: now.toISOString(),
              entity: entities[e.id],
              page: pages[e.id] ?? null,
            };
      }
      for (const candidate of batch) {
        try {
          results.push(
            reviewCandidate(
              candidate,
              entities[candidate.id] ?? {},
              pages[candidate.id],
              retrieved,
            ),
          );
        } catch (e) {
          errors.push({ id: candidate.id, error: e.message });
        }
      }
    } catch (e) {
      errors.push({ ids: batch.map((e) => e.id), error: e.message });
      stop = true;
    }
  }
  const report = {
    checked_at: now.toISOString(),
    input_count: eligible.length,
    offset,
    requested: selected.length,
    processed: results.length,
    wikipedia_links: results.filter((e) => e.review.wiki_sync.wikipedia).length,
    requests,
    cache_hits: cacheHits,
    incomplete: results.length !== selected.length,
    errors,
    published_count: 0,
    next_offset:
      offset + results.length < eligible.length
        ? offset + results.length
        : null,
    note: "All candidates require human review; dates and existing published events are never overwritten automatically. No article body/media or visitor data requested.",
  };
  await atomicJSON(resolve(out, "cache.json"), cache);
  await atomicJSON(resolve(out, "candidates.json"), results);
  await atomicJSON(resolve(out, "report.json"), report);
  await writeFile(resolve(out, "pending.sql"), toSQL(results));
  const cards = results
    .map(
      (e) =>
        `<article><h2>${escape(e.title)}</h2><p>${escape(e.date_start)} (${escape(e.date_precision)}) · ${escape(e.category)}</p><p>검토 필요: ${e.review.flags.map(escape).join(", ")}</p><ul>${e.sources.map((s) => `<li><a href="${escape(s.source_url)}" target="_blank" rel="noopener noreferrer">${escape(s.source_title)}</a></li>`).join("")}</ul><pre>${escape(JSON.stringify(e.review.wiki_sync.current_date_claims, null, 2))}</pre></article>`,
    )
    .join("");
  await writeFile(
    resolve(out, "review.html"),
    `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>위키 자료 검토</title><style>body{max-width:850px;margin:30px auto;padding:20px;font:15px/1.8 sans-serif;background:#f4f1e9}h1,h2{font-size:18px}article{border-top:1px solid #aaa;padding:20px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#333}</style><h1>위키 자료 검토 · ${results.length}개</h1><p>자동 공개되지 않은 후보입니다. 사건의 중요도·날짜·중복·출처를 확인한 뒤 승인해야 합니다.</p>${cards}</html>`,
  );
  return report;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { values } = parseArgs({
    options: {
      input: { type: "string" },
      out: { type: "string" },
      limit: { type: "string" },
      offset: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    console.log(
      "Usage: node sync-wiki.mjs [--input CANDIDATES.json] [--out DIRECTORY] [--offset N] [--limit 1–500]",
    );
    process.exit(0);
  }
  const report = await syncWiki({
    ...values,
    limit: Number(values.limit ?? 100),
    offset: Number(values.offset ?? 0),
  });
  console.log(JSON.stringify(report, null, 2));
  if (report.incomplete) process.exitCode = 1;
}
