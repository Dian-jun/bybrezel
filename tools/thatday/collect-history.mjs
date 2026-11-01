import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { today, validDay } from "../../thatday/domain.js";
export function normalizeTime(time, precision) {
  if (
    typeof time !== "string" ||
    !time.startsWith("+") ||
    ![9, 10, 11].includes(Number(precision))
  )
    return null;
  const raw = time.slice(1, 11),
    p =
      Number(precision) === 9
        ? "year"
        : Number(precision) === 10
          ? "month"
          : "day";
  const start =
    p === "year"
      ? raw.slice(0, 4) + "-01-01"
      : p === "month"
        ? raw.slice(0, 7) + "-01"
        : raw;
  return validDay(start) ? { date: start, precision: p } : null;
}
export function categoryFor(title) {
  if (
    /선거|개헌|헌법|대통령|정상.?회담|계엄|탄핵|정변|쿠데타|외교|총선|국회|선언|협정|조약|유엔|UN |민주/.test(
      title,
    )
  )
    return "정치";
  if (
    /올림픽|월드컵|아시안.?게임|스포츠|야구|축구|체육|한국시리즈|리그|선수권|마라톤/.test(
      title,
    )
  )
    return "스포츠";
  if (/영화|방송|아카데미|드라마|텔레비전|TV|시네마/.test(title))
    return "영화·방송";
  if (/음악|가요|가수|음반|노래|콘서트|빌보드|방탄|BTS|강남스타일/.test(title))
    return "음악";
  if (
    /발사|위성|우주|누리호|나로호|인터넷|통신|과학|원자력|휴대전화|컴퓨터/.test(
      title,
    )
  )
    return "기술";
  if (/문학|문화|박람회|세계유산|노벨|훈민정음/.test(title)) return "문화";
  if (/화폐|금융|경제|은행|수출/.test(title)) return "경제";
  if (
    /개통|철도|지하철|공항|고속도로|화폐|금융|경제|은행|연금|보험|생활|수출/.test(
      title,
    )
  )
    return "생활";
  return "역사·사회";
}
export function buildQuery(from, to, limit = 5000) {
  return `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT DISTINCT ?item ?itemLabel ?date ?precision ?calendar ?statement WHERE {
 ?item wdt:P17 wd:Q884; p:P585 ?statement .
 ?statement psv:P585 ?timeNode; wikibase:rank ?rank . FILTER(?rank != wikibase:DeprecatedRank)
 ?timeNode wikibase:timeValue ?date; wikibase:timePrecision ?precision; wikibase:timeCalendarModel ?calendar .
 FILTER(?date >= "${from}T00:00:00Z"^^xsd:dateTime && ?date <= "${to}T23:59:59Z"^^xsd:dateTime)
 SERVICE wikibase:label { bd:serviceParam wikibase:language "ko,en". }
} ORDER BY ?date ?item LIMIT ${limit}`;
}
export function normalizeRows(rows, retrieved = today()) {
  const grouped = new Map(),
    excluded = [];
  for (const row of rows) {
    const id = row.item.value.split("/").at(-1);
    const start = normalizeTime(
      row.date.value.startsWith("+") ? row.date.value : "+" + row.date.value,
      row.precision.value,
    );
    if (!start || !row.calendar.value.endsWith("/Q1985727")) {
      excluded.push({ id, reason: "unsupported_precision_or_calendar" });
      continue;
    }
    const key = id,
      record = grouped.get(key) ?? {
        id: `wikidata-${id}`,
        title: (row.label ?? row.itemLabel)?.value ?? id,
        description: "",
        date_start: start.date,
        date_end: null,
        date_precision: start.precision,
        category: categoryFor((row.label ?? row.itemLabel)?.value ?? id),
        verification_status: "pending_review",
        sources: [
          {
            source_title: `Wikidata ${id} (structured event dates)`,
            source_url: `https://www.wikidata.org/wiki/${id}`,
            publisher: "Wikidata contributors",
            license: "CC0-1.0",
            retrieved_at: retrieved,
          },
        ],
        review: { flags: [], date_claims: [] },
      };
    const end = row.end
      ? normalizeTime(
          row.end.value.startsWith("+") ? row.end.value : "+" + row.end.value,
          row.endPrecision?.value,
        )
      : null;
    record.review.date_claims.push({
      date: start.date,
      precision: start.precision,
      end: end?.date ?? null,
      end_precision: end?.precision ?? null,
      statement: row.statement.value,
    });
    grouped.set(key, record);
  }
  for (const e of grouped.values()) {
    if (!/[가-힣]/.test(e.title)) e.review.flags.push("missing_korean_label");
    const claims = [
      ...new Map(
        e.review.date_claims.map((c) => [
          JSON.stringify([c.date, c.precision, c.end, c.end_precision]),
          c,
        ]),
      ).values(),
    ];
    e.review.date_claims = claims;
    if (claims.length !== 1)
      e.review.flags.push("conflicting_or_multiple_date_claims");
    const c = claims[0];
    if (
      c.end &&
      c.precision === "day" &&
      c.end_precision === "day" &&
      c.end >= c.date
    ) {
      e.date_end = c.end;
      e.date_precision = "range";
    } else if (c.end) e.review.flags.push("mixed_or_uncertain_end_precision");
    if (/^\d{4}년?\s*(대한민국|한국)$/.test(e.title))
      e.review.flags.push("year_overview_not_event");
    if (/리그|시즌|선수권|전국체육|한국시리즈|월드컵.*예선/.test(e.title))
      e.review.flags.push("recurring_sport_review_for_national_significance");
  }
  return {
    events: [...grouped.values()].sort(
      (a, b) =>
        a.date_start.localeCompare(b.date_start) || a.id.localeCompare(b.id),
    ),
    excluded,
  };
}
export async function collect({
  from = "1950-01-01",
  to = today(),
  out = "research/history",
  fetcher = fetch,
} = {}) {
  if (
    !validDay(from) ||
    !validDay(to) ||
    from < "1950-01-01" ||
    to > today() ||
    from > to
  )
    throw Error("Invalid date bounds");
  await mkdir(out, { recursive: true });
  const all = [],
    requests = [];
  let incomplete = false;
  for (
    let year = Math.floor(Number(from.slice(0, 4)) / 10) * 10;
    year <= Number(to.slice(0, 4));
    year += 10
  ) {
    const start = from > `${year}-01-01` ? from : `${year}-01-01`,
      end = to < `${year + 9}-12-31` ? to : `${year + 9}-12-31`;
    const query = buildQuery(start, end);
    await writeFile(`${out}/query-${year}.rq`, query + "\n");
    let res;
    try {
      res = await fetcher(
        "https://query.wikidata.org/sparql?format=json&query=" +
          encodeURIComponent(query),
        {
          headers: {
            "User-Agent":
              "ThatDayWeArchive/1.0 (https://bybrezel.com/thatday/; CC0 history research)",
            Accept: "application/sparql-results+json",
          },
          signal: AbortSignal.timeout(55000),
        },
      );
    } catch (error) {
      requests.push({
        from: start,
        to: end,
        complete: false,
        error: error.name,
      });
      incomplete = true;
      console.log(`${start}: ${error.name}`);
      continue;
    }
    if (!res.ok) {
      requests.push({
        from: start,
        to: end,
        status: res.status,
        complete: false,
      });
      incomplete = true;
      await writeFile(
        `${out}/collection-log.json`,
        JSON.stringify(requests, null, 2),
      );
      if (res.status === 429) break;
      continue;
    }
    const raw = await res.json();
    await writeFile(`${out}/raw-${year}.json`, JSON.stringify(raw));
    const rows = raw.results.bindings;
    all.push(...rows);
    const complete = rows.length < 5000;
    requests.push({
      from: start,
      to: end,
      status: 200,
      rows: rows.length,
      complete,
    });
    if (!complete) incomplete = true;
    console.log(
      `${start}–${end}: ${rows.length} candidate date claims${complete ? "" : " (limit reached)"}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
  const normalized = normalizeRows(all);
  const events = normalized.events.filter(
    (e) =>
      e.date_start >= from &&
      e.date_start <= to &&
      (e.date_end === null || e.date_end <= to),
  );
  const report = {
    scope: "대한민국 주요 사건 전 분야 — 후보 수집",
    from,
    to,
    retrieved_at: today(),
    candidate_count: events.length,
    published_count: 0,
    requests,
    incomplete,
    source_complete: false,
    notes: [
      "Wikidata 자체의 누락은 알 수 없으므로 쿼리 완료가 전체 역사 수록을 뜻하지 않습니다.",
      "모든 자동 수집 자료는 pending_review입니다. 국가 조건은 위치만 한국인 국제 경기 등도 포함하므로 주요 사건 여부를 검토해야 합니다.",
      "P17=대한민국이며 P585 날짜가 있는 항목을 수집합니다. P580만 있거나 국외에서 발생한 한국 관련 사건은 이 쿼리로 수집되지 않습니다. Gregorian 날짜의 일/월/연도 정확도를 보존합니다.",
      "서로 다른 날짜 주장, 기간 종료 정확도, 연도 개요 및 정기 스포츠 기록은 별도 검토 표시합니다.",
    ],
    excluded: normalized.excluded,
  };
  await writeFile(
    `${out}/candidates.json`,
    JSON.stringify(events, null, 2) + "\n",
  );
  await writeFile(
    `${out}/collection-log.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  return report;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { values } = parseArgs({
    options: {
      from: { type: "string" },
      to: { type: "string" },
      out: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    console.log(
      "Usage: node collect-history.mjs [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--out DIRECTORY]",
    );
    process.exit(0);
  }
  const r = await collect(values);
  console.log(
    JSON.stringify({
      candidates: r.candidate_count,
      incomplete: r.incomplete,
      through: r.to,
    }),
  );
  if (r.incomplete) process.exitCode = 1;
}
