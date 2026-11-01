import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { validateDate, categories } from "../../thatday/domain.js";
export function normalizeEvent(e) {
  if (
    !e ||
    typeof e.id !== "string" ||
    !/^[-a-zA-Z0-9_:]{1,100}$/.test(e.id) ||
    typeof e.title !== "string" ||
    !e.title.trim() ||
    e.title.length > 280
  )
    throw Error("Invalid ID or title");
  validateDate(e.date_start, e.date_precision, e.date_end, null);
  if (!categories.includes(e.category)) throw Error("Invalid category");
  if (!Array.isArray(e.sources) || !e.sources.length)
    throw Error("Provenance required");
  for (const s of e.sources) {
    if (
      !s.source_title ||
      !s.publisher ||
      !s.license ||
      !s.retrieved_at ||
      !s.source_url?.startsWith("https://")
    )
      throw Error(
        "Source, HTTPS URL, publisher, license and retrieval date required",
      );
  }
  if (
    !["verified", "pending_review", "curated_sample"].includes(
      e.verification_status,
    )
  )
    throw Error("Explicit review status required");
  return {
    ...e,
    date_end: e.date_precision === "range" ? e.date_end : null,
    description: e.description ?? "",
  };
}
export function toSQL(events) {
  const quote = (v) =>
    v === null ? "NULL" : `'${String(v).replaceAll("'", "''")}'`;
  const unique = new Map();
  for (const raw of events) {
    const e = normalizeEvent(raw);
    const key = `${e.date_start}:${e.title.normalize("NFC")}`;
    if (
      [...unique.values()].some(
        (x) => `${x.date_start}:${x.title.normalize("NFC")}` === key,
      )
    )
      continue;
    if (unique.has(e.id)) throw Error("Conflicting duplicate ID");
    unique.set(e.id, e);
  }
  return (
    "begin;\n" +
    [...unique.values()]
      .flatMap((e) => [
        ...(e.verification_status === "pending_review"
          ? [
              `DO $guard$ BEGIN IF NOT EXISTS (SELECT 1 FROM public.thatday_historical_events WHERE id=${quote(e.id)} AND verification_status IN ('verified','curated_sample')) THEN`,
            ]
          : []),
        `INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details) VALUES (${[e.id, e.title, e.description, e.date_start, e.date_end, e.date_precision, e.category, e.verification_status, JSON.stringify(e.review ?? {})].map(quote).join(",")}) ON CONFLICT(id) DO UPDATE SET title=excluded.title,description=excluded.description,date_start=excluded.date_start,date_end=excluded.date_end,date_precision=excluded.date_precision,category=excluded.category,verification_status=excluded.verification_status,review_details=excluded.review_details,updated_at=now();`,
        `DELETE FROM public.thatday_event_sources WHERE event_id=${quote(e.id)};`,
        ...e.sources.map(
          (s, i) =>
            `INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at) VALUES (${[`${e.id}:source:${i}`, e.id, s.source_title, s.source_url, s.publisher, s.license, s.retrieved_at].map(quote).join(",")});`,
        ),
        ...(e.verification_status === "pending_review"
          ? ["END IF; END $guard$;"]
          : []),
      ])
      .join("\n") +
    "\ncommit;\n"
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const input = process.argv[2] ?? "thatday/data/events.json",
    output = process.argv[3] ?? "supabase/seed.sql";
  await writeFile(output, toSQL(JSON.parse(await readFile(input, "utf8"))));
  console.log(`Validated PostgreSQL import: ${output}`);
}
