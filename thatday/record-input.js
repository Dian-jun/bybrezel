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
