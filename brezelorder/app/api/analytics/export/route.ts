import { NextResponse } from "next/server";

import { getRestaurantAnalyticsData, getOrderRevenueCents } from "@/lib/analytics";
import { getCurrentMembership } from "@/lib/data";
import { formatDateTimeByLocale } from "@/lib/utils";

function normalizeMonthParam(monthParam?: string | null) {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) return monthParam;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeDateParam(month: string, dateParam?: string | null) {
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam.startsWith(`${month}-`)) {
    return dateParam;
  }

  return null;
}

export async function GET(request: Request) {
  const membership = await getCurrentMembership();

  if (!membership?.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const month = normalizeMonthParam(url.searchParams.get("month"));
  const date = normalizeDateParam(month, url.searchParams.get("date"));
  const analytics = await getRestaurantAnalyticsData(membership.restaurant_id);

  const servedOrders = analytics.orders
    .filter((order) => order.status === "served")
    .filter((order) => (order.served_at ?? order.created_at).slice(0, 7) === month)
    .filter((order) => (date ? (order.served_at ?? order.created_at).slice(0, 10) === date : true))
    .sort((a, b) => new Date(a.served_at ?? a.created_at).getTime() - new Date(b.served_at ?? b.created_at).getTime());

  const rows = [
    ["주문시간", "테이블", "주문자", "주문내역", "요청사항", "금액(EUR)"],
    ...servedOrders.map((order) => [
      formatDateTimeByLocale(order.served_at ?? order.created_at, "ko"),
      order.restaurant_tables?.name ?? "-",
      order.guest_name ?? "",
      order.order_items
        .map((item) =>
          `${item.quantity}x ${item.name_snapshot}${item.variant_name_snapshot ? ` · ${item.variant_name_snapshot}` : ""}`
        )
        .join(" / "),
      order.notes ?? "",
      String((getOrderRevenueCents(order) / 100).toFixed(2))
    ])
  ];

  const csv = `\uFEFF${rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="brezel-sales-${date ?? month}.csv"`
    }
  });
}
