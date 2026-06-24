export const STAFF_REQUEST_KEYS = [
  "call_staff",
  "request_bill",
  "request_water",
  "need_help"
] as const;

export const ORDER_STATUS_STYLES = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-sky-50 text-sky-700 border-sky-200",
  preparing: "bg-violet-50 text-violet-700 border-violet-200",
  ready: "bg-indigo-50 text-indigo-700 border-indigo-200",
  served: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200"
} as const;
