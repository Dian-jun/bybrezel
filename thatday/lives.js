// Stable ordering and explicit relationships: uncertain dates never become exact days.
export const lifeGroups = ["related", "same_day"];
export function mergeRecords(previous, incoming) {
  return [
    ...new Map([...previous, ...incoming].map((r) => [r.id, r])).values(),
  ];
}
export function matchesLife(record, event, group) {
  if (group === "related")
    return record.event_id === event.id && record.relation === "related";
  return (
    event.date_precision === "day" &&
    record.date_precision === "day" &&
    record.date_start === event.date_start &&
    (!record.event_id || record.relation === "same_date")
  );
}
