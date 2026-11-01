import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { normalizeEvent } from "./import-history.mjs";
const canonicalTitle = (title) =>
  title.normalize("NFC").replace(/[\s\p{P}\p{S}]/gu, "");
export function validateAdditions(additions, baseline) {
  const ids = new Set(baseline.map((e) => e.id));
  const keys = new Set(
    baseline.map((e) => `${e.date_start}:${canonicalTitle(e.title)}`),
  );
  return additions.map((raw) => {
    const e = normalizeEvent(raw),
      key = `${e.date_start}:${canonicalTitle(e.title)}`;
    if (ids.has(e.id) || keys.has(key))
      throw Error(`Duplicate historical event: ${e.id}`);
    if (e.verification_status !== "verified")
      throw Error("Reviewed history only");
    if (!e.description.trim() || e.title.endsWith("."))
      throw Error("Description required; no final period in title");
    if (e.date_start > "2026-11-01")
      throw Error("Future event in historical batch");
    ids.add(e.id);
    keys.add(key);
    return e;
  });
}
export function toAppendSQL(additions, baseline = []) {
  const q = (v) =>
    v === null ? "NULL" : `'${String(v).replaceAll("'", "''")}'`;
  const events = validateAdditions(additions, baseline);
  return [
    "-- Reviewed everyday history. Requires existing thatday schema and review_details migration.",
    "-- INSERT ONLY: existing events, sources, personal records and schema are unchanged.",
    "-- Month/year day 01 is a storage anchor; date_precision preserves uncertainty.",
    "BEGIN;",
    "LOCK TABLE public.thatday_historical_events IN SHARE ROW EXCLUSIVE MODE;",
    ...events.map((e) => {
      const fields = [
        e.id,
        e.title,
        e.description,
        e.date_start,
        e.date_end,
        e.date_precision,
        e.category,
        e.verification_status,
        JSON.stringify(e.review ?? {}),
      ];
      const sources = e.sources
        .map(
          (s, i) =>
            `(${[`${e.id}:source:${i}`, s.source_title, s.source_url, s.publisher, s.license, s.retrieved_at].map(q).join(",")})`,
        )
        .join(",\n");
      return `WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT ${fields.map(q).join(",")}
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start=${q(e.date_start)}::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace(${q(e.title)},'[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ${sources}) AS s(id,title,url,publisher,license,retrieved);`;
    }),
    "COMMIT;",
    "-- Read-only verification; 100 on a clean baseline, unchanged on repeat runs.",
    "SELECT count(*) AS everyday_batch_events FROM public.thatday_historical_events WHERE review_details->>'batch'='everyday-history-20261101';",
    "",
  ].join("\n");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [
    input = "docs/thatday/everyday-additions.json",
    output = "supabase/thatday/008_everyday_history.sql",
    baselinePath = "thatday/data/events.json",
  ] = process.argv.slice(2);
  const [events, baseline] = await Promise.all(
    [input, baselinePath].map(async (p) =>
      JSON.parse(await readFile(p, "utf8")),
    ),
  );
  await writeFile(output, toAppendSQL(events, baseline));
  console.log(`Validated ${events.length} insert-only records: ${output}`);
}
