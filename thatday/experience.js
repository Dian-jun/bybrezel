// Pure helpers shared by timeline rendering and behavior tests.
import { escapeHTML, topic } from "./domain.js";
export function memoryYears(ids, events) {
  const chosen = new Set(ids);
  return new Set(
    events.filter((e) => chosen.has(e.id)).map((e) => e.date_start.slice(0, 4)),
  );
}
export function personalSentence(name, text, style) {
  const prefix = style === "quote" ? `@${name}:` : `@${name}${topic(name)}`;
  return `<strong>${escapeHTML(prefix)}</strong> ${escapeHTML(text)}`;
}
export function orderedRows(events, records) {
  return [
    ...events.map((item) => ({
      kind: "event",
      date: item.date_start,
      id: item.id,
      item,
    })),
    ...records.map((item) => ({
      kind: "record",
      date: item.date_start,
      id: item.id,
      item,
    })),
  ].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.kind.localeCompare(b.kind) ||
      a.id.localeCompare(b.id),
  );
}
export async function allPages(loader, key, isCurrent = () => true) {
  let result = [],
    offset = 0,
    seen = new Set();
  do {
    if (seen.has(offset))
      throw Error("기록을 불러오는 중 페이지가 반복되었습니다.");
    seen.add(offset);
    const page = await loader(offset);
    if (!isCurrent()) return null;
    result.push(...page[key]);
    offset = page.next;
  } while (offset !== null && offset !== undefined);
  return [...new Map(result.map((e) => [e.id, e])).values()];
}
