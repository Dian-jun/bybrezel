export const categories = [
  "역사·사회",
  "정치",
  "경제",
  "문화",
  "음악",
  "영화·방송",
  "스포츠",
  "기술",
  "생활",
];
export const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
export function topic(name) {
  const c = name.charCodeAt(name.length - 1);
  return c >= 0xac00 && c <= 0xd7a3
    ? (c - 0xac00) % 28 === 0
      ? "는"
      : "은"
    : "은/는";
}
export function sentence(name, text, style) {
  return style === "quote"
    ? `@${name}: ${text}`
    : `@${name}${topic(name)} ${text}`;
}
export function dateLabel(start, precision, end) {
  const d = start.replaceAll("-", ".");
  return precision === "year"
    ? start.slice(0, 4)
    : precision === "month"
      ? d.slice(0, 7)
      : precision === "range"
        ? `${d}–${end?.replaceAll("-", ".")}`
        : precision === "around"
          ? `${d} 무렵`
          : d;
}
export function normalizeDate(value, precision) {
  return precision === "year"
    ? `${value.slice(0, 4)}-01-01`
    : precision === "month"
      ? `${value.slice(0, 7)}-01`
      : value;
}
export function validDay(v) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v
  );
}
export function validateDate(date, precision, end, eventId, latest = today()) {
  if (!validDay(date) || date < "1950-01-01" || date > latest)
    throw Error("1950년부터 오늘 사이의 날짜를 선택해 주세요.");
  if (!["day", "month", "year", "range", "around"].includes(precision))
    throw Error("날짜의 정확도를 선택해 주세요.");
  if (precision === "month" && !date.endsWith("-01"))
    throw Error("월 기록의 정렬 기준은 해당 월의 첫날입니다.");
  if (precision === "year" && !date.endsWith("-01-01"))
    throw Error("연도 기록의 정렬 기준은 1월 1일입니다.");
  if (precision === "range" && (!validDay(end) || end < date || end > latest))
    throw Error("종료 날짜를 확인해 주세요.");
  if (precision === "around" && !eventId)
    throw Error("사건 무렵 기록에는 연결한 사건이 필요합니다.");
}
export function safetyFlags(text) {
  return [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) && "이메일",
    /(?:\+82[-\s]?)?0?1[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(text) &&
      "전화번호",
    /\d{6}[-\s]?[1-8]\d{6}/.test(text) && "주민등록번호",
    /https?:\/\/|www\./i.test(text) && "외부 링크",
    /(?:로|길)\s*\d+(?:-\d+)?(?:\s|번|호|$)/.test(text) && "상세 주소",
  ].filter(Boolean);
}
export function escapeHTML(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
export function route(base, values = {}) {
  const p = new URLSearchParams(
    Object.entries(values).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );
  return `${base}${p.size ? "?" + p : ""}`;
}
export function normalizeBase(base) {
  if (typeof base !== "string" || !/^\/(?:[a-zA-Z0-9_-]+\/)+$/.test(base))
    throw Error("basePath는 /thatday/와 같은 하위 경로여야 합니다.");
  return base;
}
