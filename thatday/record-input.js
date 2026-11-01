// UI context determines the relationship; users never need to select it.
export function recordContext(event, record, inputDate) {
  const unchanged = record && (!inputDate || inputDate === record.date_start);
  if (unchanged)
    return {
      date_start: record.date_start,
      date_end: record.date_end,
      date_precision: record.date_precision,
      relation: record.relation,
      event_id: record.event_id,
    };
  if (record)
    return {
      date_start: inputDate,
      date_end: null,
      date_precision: "day",
      relation: record.relation,
      event_id: record.event_id,
    };
  if (event)
    return {
      date_start: event.date_start,
      date_end: null,
      date_precision:
        event.date_precision === "range" ? "around" : event.date_precision,
      relation: "related",
      event_id: event.id,
    };
  return {
    date_start: inputDate,
    date_end: null,
    date_precision: "day",
    relation: "same_date",
    event_id: null,
  };
}
export const cleanEventTitle = (title) => title.replace(/[.。]+\s*$/u, "");

// Explicit options are opt-in; older records keep their original precision by default.
export function chosenRecordContext(
  event,
  record,
  inputDate,
  { precision, relation } = {},
) {
  const base = recordContext(event, record, inputDate);
  if (!precision && !relation) return base;
  const requested = precision || base.date_precision;
  const date = inputDate || record?.date_start || event?.date_start;
  const chosenRelation = relation || base.relation;
  if (!["related", "same_date"].includes(chosenRelation))
    throw Error("기록 관계를 확인해 주세요.");
  if (requested === "around" && !event && !record?.event_id)
    throw Error("사건 무렵 기록에는 연결한 사건이 필요합니다.");
  if (
    requested === "day" &&
    event &&
    !record &&
    event.date_precision !== "day" &&
    !inputDate
  )
    throw Error("이 사건의 정확한 날짜가 확인되지 않았습니다.");
  if (!["day", "month", "year", "around", "range"].includes(requested))
    throw Error("날짜의 정확도를 확인해 주세요.");
  return {
    ...base,
    date_start:
      requested === "month"
        ? date.slice(0, 7) + "-01"
        : requested === "year"
          ? date.slice(0, 4) + "-01-01"
          : date,
    date_precision: requested,
    date_end: requested === "range" ? base.date_end : null,
    relation: chosenRelation,
    event_id: base.event_id,
  };
}
