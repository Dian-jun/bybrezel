import { AppShell } from "@/components/app-shell";
import { requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie, type Locale } from "@/lib/i18n";
import { getRestaurantAnalyticsData, getOrderRevenueCents } from "@/lib/analytics";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";
import { formatDateTimeByLocale, formatEuro } from "@/lib/utils";

function hourKey(timestamp: string) {
  return new Date(timestamp).getHours();
}

function normalizeMonthParam(monthParam?: string) {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) return monthParam;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeDateParam(monthKey: string, dateParam?: string, fallbackDateKey?: string) {
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam.startsWith(`${monthKey}-`)) {
    return dateParam;
  }

  return fallbackDateKey ?? `${monthKey}-01`;
}

function shiftDate(dateKey: string, delta: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function isInMonth(date: string, monthKey: string) {
  return date.slice(0, 7) === monthKey;
}

function isSameDate(date: string, dateKey: string) {
  return date.slice(0, 10) === dateKey;
}

function getMonthMeta(monthKey: string, locale: Locale) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const startOffset = locale === "ko" ? firstDay.getDay() : (firstDay.getDay() + 6) % 7;
  const intlLocale = locale === "ko" ? "ko-KR" : locale === "en" ? "en-US" : "de-DE";

  return {
    label: new Intl.DateTimeFormat(intlLocale, {
      year: "numeric",
      month: "long"
    }).format(firstDay),
    daysInMonth: lastDay,
    startOffset
  };
}

function getDayDate(monthKey: string, day: number) {
  return `${monthKey}-${String(day).padStart(2, "0")}`;
}

function getDateLabel(dateKey: string, locale: Locale) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const intlLocale = locale === "ko" ? "ko-KR" : locale === "en" ? "en-US" : "de-DE";

  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function normalizePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  return `?${search.toString()}`;
}

function getPageWindow(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

type AnalyticsView = "overview" | "monthly" | "daily" | "menu" | "operations" | "report";

function normalizeView(view?: string): AnalyticsView {
  const allowed: AnalyticsView[] = ["overview", "monthly", "daily", "menu", "operations", "report"];
  return allowed.includes(view as AnalyticsView) ? (view as AnalyticsView) : "overview";
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams?: { month?: string; date?: string; page?: string; pageSize?: string; view?: string };
}) {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantPermission("can_view_analytics");
  const analytics = await getRestaurantAnalyticsData(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);
  const selectedMonth = normalizeMonthParam(searchParams?.month);
  const selectedView = normalizeView(searchParams?.view);
  const allowedPageSizes = [10, 20, 50, 100];
  const selectedPageSize = allowedPageSizes.includes(Number(searchParams?.pageSize))
    ? Number(searchParams?.pageSize)
    : 20;
  const monthMeta = getMonthMeta(selectedMonth, locale);
  const prevMonth = shiftMonth(selectedMonth, -1);
  const nextMonth = shiftMonth(selectedMonth, 1);

  const orders = analytics.orders as any[];
  const calls = analytics.calls as any[];
  const servedOrders = orders.filter((order) => order.status === "served");
  const cancelledOrders = orders.filter((order) => order.status === "cancelled");
  const monthServedOrders = servedOrders.filter((order) => isInMonth(order.served_at ?? order.created_at, selectedMonth));
  const monthCancelledOrders = cancelledOrders.filter((order) => isInMonth(order.created_at, selectedMonth));
  const monthCalls = calls.filter((call) => isInMonth(call.created_at, selectedMonth));
  const availableItems = (analytics.categories as any[]).flatMap((category) => category.menu_items ?? []);
  const dailyRevenueMap = new Map<string, number>();
  const hourMap = new Map<number, number>();
  const categoryMap = new Map<string, number>();
  const itemMap = new Map<string, number>();
  const tableMap = new Map<string, { revenue: number; count: number }>();
  const callMap = new Map<string, number>();
  const monthRevenueTrend = new Map<string, number>();

  for (const call of monthCalls) {
    callMap.set(call.call_type, (callMap.get(call.call_type) ?? 0) + 1);
  }

  for (const order of servedOrders) {
    const orderMonthKey = (order.served_at ?? order.created_at).slice(0, 7);
    monthRevenueTrend.set(
      orderMonthKey,
      (monthRevenueTrend.get(orderMonthKey) ?? 0) + getOrderRevenueCents(order)
    );
  }

  for (const order of monthServedOrders) {
    hourMap.set(hourKey(order.created_at), (hourMap.get(hourKey(order.created_at)) ?? 0) + 1);
    const dayKey = (order.served_at ?? order.created_at).slice(0, 10);
    const orderRevenue = getOrderRevenueCents(order);
    dailyRevenueMap.set(dayKey, (dailyRevenueMap.get(dayKey) ?? 0) + orderRevenue);
    const tableName = order.restaurant_tables?.name ?? "-";
    tableMap.set(tableName, {
      revenue: (tableMap.get(tableName)?.revenue ?? 0) + orderRevenue,
      count: (tableMap.get(tableName)?.count ?? 0) + 1
    });

    for (const item of order.order_items) {
      itemMap.set(item.name_snapshot, (itemMap.get(item.name_snapshot) ?? 0) + item.quantity);
    }
  }

  for (const category of analytics.categories as any[]) {
    const total = (category.menu_items ?? []).reduce((sum: number, item: any) => {
      const soldCount = monthServedOrders.reduce(
        (itemSum: number, order: any) =>
          itemSum +
          order.order_items
            .filter((orderItem: any) => orderItem.menu_item_id === item.id)
            .reduce((qty: number, orderItem: any) => qty + orderItem.quantity, 0),
        0
      );

      return sum + soldCount * item.price_cents;
    }, 0);
    categoryMap.set(category.name, total);
  }

  const bestItems = [...itemMap.entries()].sort((a, b) => b[1] - a[1]);
  const lowItems = [...itemMap.entries()].sort((a, b) => a[1] - b[1]).slice(0, 5);
  const hourlyPeak = [...hourMap.entries()].sort((a, b) => b[1] - a[1]);
  const tableAverages = [...tableMap.entries()].map(([name, stats]) => ({
    name,
    average: stats.count > 0 ? stats.revenue / stats.count : 0
  }));
  const topTable = [...tableMap.entries()].sort((a, b) => b[1].revenue - a[1].revenue)[0];
  const orderedRevenueDays = [...dailyRevenueMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const latestDayRevenue = orderedRevenueDays.at(-1)?.[1] ?? 0;
  const previousDayRevenue = orderedRevenueDays.at(-2)?.[1] ?? 0;
  const dayOverDayDelta = previousDayRevenue
    ? ((latestDayRevenue - previousDayRevenue) / previousDayRevenue) * 100
    : 0;
  const recentWeekRevenue = orderedRevenueDays.slice(-7).reduce((sum, [, value]) => sum + value, 0);
  const previousWeekRevenue = orderedRevenueDays.slice(-14, -7).reduce((sum, [, value]) => sum + value, 0);
  const weekOverWeekDelta = previousWeekRevenue
    ? ((recentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
    : 0;
  const unavailableCount = availableItems.filter((item: any) => !item.is_available).length;
  const currentOutOfStockRate = availableItems.length
    ? Math.round((unavailableCount / availableItems.length) * 100)
    : 0;

  const totalRevenue = monthServedOrders.reduce((sum, order) => sum + getOrderRevenueCents(order), 0);
  const averageOrderValue = monthServedOrders.length ? totalRevenue / monthServedOrders.length : 0;
  const monthlyTrend = [...monthRevenueTrend.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const trendMax = Math.max(...monthlyTrend.map(([, value]) => value), 1);
  const topDayRevenue = Math.max(...orderedRevenueDays.map(([, value]) => value), 0);
  const topDayDateKey = orderedRevenueDays.find(([, value]) => value === topDayRevenue)?.[0] ?? null;
  const dailyRows = Array.from({ length: monthMeta.daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateKey = getDayDate(selectedMonth, day);
    const dayOfWeek = new Date(dateKey).getDay();
    const isWeekend = locale === "ko" ? dayOfWeek === 0 || dayOfWeek === 6 : dayOfWeek === 0 || dayOfWeek === 6;
    return {
      day,
      dateKey,
      revenue: dailyRevenueMap.get(dateKey) ?? 0,
      isWeekend,
      isTopDay: dateKey === topDayDateKey && topDayRevenue > 0
    };
  });
  const calendarCells = [
    ...Array.from({ length: monthMeta.startOffset }, () => null),
    ...dailyRows
  ];
  const monthDetails = [...monthServedOrders]
    .sort((a, b) => new Date(b.served_at ?? b.created_at).getTime() - new Date(a.served_at ?? a.created_at).getTime());
  const totalPages = Math.max(1, Math.ceil(monthDetails.length / selectedPageSize));
  const currentPage = Math.min(normalizePositiveInt(searchParams?.page, 1), totalPages);
  const pagedDetails = monthDetails.slice(
    (currentPage - 1) * selectedPageSize,
    currentPage * selectedPageSize
  );
  const pageWindow = getPageWindow(currentPage, totalPages);
  const weekdayLabels =
    locale === "ko"
      ? ["일", "월", "화", "수", "목", "금", "토"]
      : locale === "en"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const monthCancelRate = monthServedOrders.length || monthCancelledOrders.length
    ? Math.round((monthCancelledOrders.length / Math.max(monthServedOrders.length + monthCancelledOrders.length, 1)) * 100)
    : 0;
  const latestDateInMonth = orderedRevenueDays.at(-1)?.[0] ?? getDayDate(selectedMonth, 1);
  const selectedDate = normalizeDateParam(selectedMonth, searchParams?.date, latestDateInMonth);
  const previousDate = shiftDate(selectedDate, -1);
  const nextDate = shiftDate(selectedDate, 1);
  const selectedDateLabel = getDateLabel(selectedDate, locale);
  const dailyServedOrders = monthServedOrders.filter((order) =>
    isSameDate(order.served_at ?? order.created_at, selectedDate)
  );
  const dailyCancelledOrders = monthCancelledOrders.filter((order) => isSameDate(order.created_at, selectedDate));
  const dailyCalls = monthCalls.filter((call) => isSameDate(call.created_at, selectedDate));
  const dailyRevenue = dailyServedOrders.reduce((sum, order) => sum + getOrderRevenueCents(order), 0);
  const dailyAverageOrderValue = dailyServedOrders.length ? dailyRevenue / dailyServedOrders.length : 0;
  const dailyItemCount = dailyServedOrders.reduce(
    (sum, order) =>
      sum + order.order_items.reduce((orderSum: number, item: any) => orderSum + item.quantity, 0),
    0
  );
  const dailyHourMap = new Map<number, number>();
  const dailyItemMap = new Map<string, number>();

  for (const order of dailyServedOrders) {
    dailyHourMap.set(hourKey(order.created_at), (dailyHourMap.get(hourKey(order.created_at)) ?? 0) + 1);

    for (const item of order.order_items) {
      dailyItemMap.set(item.name_snapshot, (dailyItemMap.get(item.name_snapshot) ?? 0) + item.quantity);
    }
  }

  const dailyHourlyPeak = [...dailyHourMap.entries()].sort((a, b) => b[1] - a[1]);
  const dailyBestItems = [...dailyItemMap.entries()].sort((a, b) => b[1] - a[1]);
  const dailyTopTable = dailyServedOrders.reduce(
    (best, order) => {
      const revenue = getOrderRevenueCents(order);
      const tableName = order.restaurant_tables?.name ?? "-";

      if (!best || revenue > best.revenue) {
        return { name: tableName, revenue };
      }

      return best;
    },
    null as null | { name: string; revenue: number }
  );
  const exportHref = `/api/analytics/export?month=${selectedMonth}${
    selectedView === "daily" ? `&date=${selectedDate}` : ""
  }`;
  const previousMonthHref = buildQuery({
    month: prevMonth,
    page: 1,
    pageSize: selectedPageSize,
    view: selectedView,
    date: selectedView === "daily" ? undefined : searchParams?.date
  });
  const nextMonthHref = buildQuery({
    month: nextMonth,
    page: 1,
    pageSize: selectedPageSize,
    view: selectedView,
    date: selectedView === "daily" ? undefined : searchParams?.date
  });
  const previousDateHref = buildQuery({
    month: previousDate.slice(0, 7),
    date: previousDate,
    page: 1,
    pageSize: selectedPageSize,
    view: "daily"
  });
  const nextDateHref = buildQuery({
    month: nextDate.slice(0, 7),
    date: nextDate,
    page: 1,
    pageSize: selectedPageSize,
    view: "daily"
  });
  const pageSizeLabel = locale === "ko" ? "보기" : locale === "en" ? "per page" : "pro Seite";
  const detailStart = monthDetails.length ? (currentPage - 1) * selectedPageSize + 1 : 0;
  const detailEnd = Math.min(currentPage * selectedPageSize, monthDetails.length);
  const totalSoldItems = monthServedOrders.reduce(
    (sum, order) =>
      sum +
      order.order_items.reduce((orderSum: number, item: any) => orderSum + item.quantity, 0),
    0
  );
  const peakHour = hourlyPeak[0]?.[0];
  const peakHourCount = hourlyPeak[0]?.[1] ?? 0;
  const topRevenueDays = [...orderedRevenueDays]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  const analyticsTabs: Array<{ key: AnalyticsView; label: string }> = [
    {
      key: "overview",
      label: locale === "ko" ? "요약" : locale === "en" ? "Overview" : "Überblick"
    },
    {
      key: "monthly",
      label: locale === "ko" ? "월별" : locale === "en" ? "Monthly" : "Monat"
    },
    {
      key: "daily",
      label: locale === "ko" ? "일별" : locale === "en" ? "Daily" : "Tage"
    },
    {
      key: "menu",
      label: locale === "ko" ? "메뉴" : locale === "en" ? "Menu" : "Menüs"
    },
    {
      key: "operations",
      label: locale === "ko" ? "운영" : locale === "en" ? "Operations" : "Betrieb"
    },
    {
      key: "report",
      label: locale === "ko" ? "리포트" : locale === "en" ? "Report" : "Report"
    }
  ];
  const showOverview = selectedView === "overview";
  const showMonthly = selectedView === "overview" || selectedView === "monthly";
  const showDaily = selectedView === "overview" || selectedView === "daily";
  const showMenu = selectedView === "overview" || selectedView === "menu";
  const showOperations = selectedView === "overview" || selectedView === "operations";
  const showReport = selectedView === "overview" || selectedView === "report";

  return (
    <AppShell
      title={locale === "ko" ? "통계" : locale === "en" ? "Analytics" : "Analysen"}
      subtitle={
        locale === "ko"
          ? "점주가 일자별 매출과 운영 흐름을 한눈에 볼 수 있는 요약입니다."
          : locale === "en"
            ? "A compact owner view of daily revenue and restaurant activity."
            : "Eine kompakte Inhaberansicht für Tagesumsatz und Betriebsfluss."
      }
      pathname="/admin/analytics"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={getAdminNavItems({
        locale,
        labels: dict.nav,
        permissions,
        includePlatform: membership.is_platform_admin
      })}
    >
      <section className="surface mb-4 p-2">
        <nav className="flex flex-wrap gap-2">
          {analyticsTabs.map((tab) => (
            <a
              key={tab.key}
              href={buildQuery({
                month: selectedMonth,
                page: tab.key === "report" ? currentPage : 1,
                pageSize: selectedPageSize,
                view: tab.key
              })}
              className={`inline-flex min-h-11 items-center rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                selectedView === tab.key
                  ? "bg-ink text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-ink"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.68fr)]">
        <section className="surface overflow-hidden p-0">
          <div className="border-b border-line/70 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            {selectedView === "daily"
              ? locale === "ko"
                ? "일간 리포트"
                : locale === "en"
                  ? "Daily report"
                  : "Tagesreport"
              : locale === "ko"
                ? "월간 리포트"
                : locale === "en"
                  ? "Monthly report"
                  : "Monatsreport"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            {selectedView === "daily" ? selectedDateLabel : monthMeta.label}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            {selectedView === "daily"
              ? locale === "ko"
                ? "선택한 날짜에 실제로 서빙 완료된 주문과 호출 흐름만 따로 확인합니다."
                : locale === "en"
                  ? "Review only the served orders and guest requests recorded on the selected date."
                  : "Prüfe nur die servierten Bestellungen und Serviceanfragen des ausgewählten Tages."
              : locale === "ko"
                ? "이번 달 매출 흐름, 주문 밀집 시간, 카테고리 성과를 한 화면에서 확인할 수 있습니다."
                : locale === "en"
                  ? "See this month’s revenue flow, peak order hours, and category performance in one place."
                  : "Behalte Umsatzfluss, Stoßzeiten und Kategorie-Performance dieses Monats auf einen Blick im Blick."}
          </p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
            {(selectedView === "daily"
              ? [
                  {
                    label: locale === "ko" ? "일 매출" : locale === "en" ? "Daily revenue" : "Tagesumsatz",
                    value: formatEuro(dailyRevenue)
                  },
                  {
                    label: locale === "ko" ? "일 주문 건수" : locale === "en" ? "Orders" : "Bestellungen",
                    value: String(dailyServedOrders.length)
                  },
                  {
                    label: locale === "ko" ? "일 평균 객단가" : locale === "en" ? "Average order value" : "Durchschnitt",
                    value: formatEuro(dailyAverageOrderValue)
                  },
                  {
                    label: locale === "ko" ? "일 호출 건수" : locale === "en" ? "Service requests" : "Serviceanfragen",
                    value: String(dailyCalls.length)
                  }
                ]
              : [
                  {
                    label: locale === "ko" ? "월 매출" : locale === "en" ? "Monthly revenue" : "Monatsumsatz",
                    value: formatEuro(totalRevenue)
                  },
                  {
                    label: locale === "ko" ? "월 주문 건수" : locale === "en" ? "Orders" : "Bestellungen",
                    value: String(monthServedOrders.length)
                  },
                  {
                    label: locale === "ko" ? "평균 객단가" : locale === "en" ? "Average order value" : "Durchschnitt",
                    value: formatEuro(averageOrderValue)
                  },
                  {
                    label: locale === "ko" ? "월 호출 건수" : locale === "en" ? "Service requests" : "Serviceanfragen",
                    value: String(monthCalls.length)
                  }
                ]).map((metric, index) => (
              <div
                key={metric.label}
                className={[
                  "px-6 py-5",
                  "border-line/70",
                  index < 3 ? "xl:border-r" : "",
                  index < 2 ? "sm:border-r xl:border-r" : "",
                  index > 1 ? "border-t sm:border-t xl:border-t-0" : "",
                  index % 2 === 1 ? "sm:border-l-0" : ""
                ].join(" ")}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">{metric.label}</p>
                <p className="mt-3 break-all text-[clamp(1.85rem,3vw,2.4rem)] font-semibold leading-[1.02] tracking-tight text-ink tabular-nums">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="surface flex h-full flex-col justify-between overflow-hidden p-0">
          <div>
            <div className="border-b border-line/70 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
              {selectedView === "daily"
                ? locale === "ko"
                  ? "일 선택"
                  : locale === "en"
                    ? "Day"
                    : "Tag"
                : locale === "ko"
                  ? "월 선택"
                  : locale === "en"
                    ? "Month"
                    : "Monat"}
            </p>
            <div className="mt-4 rounded-[1.2rem] border border-line/70 bg-stone-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <a
                  href={selectedView === "daily" ? previousDateHref : previousMonthHref}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-stone-100"
                  aria-label={
                    selectedView === "daily"
                      ? locale === "ko"
                        ? "이전 날짜"
                        : locale === "en"
                          ? "Previous day"
                          : "Vorheriger Tag"
                      : locale === "ko"
                        ? "이전 달"
                        : locale === "en"
                          ? "Previous month"
                          : "Vorheriger Monat"
                  }
                >
                  &lt;
                </a>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">
                    {selectedView === "daily"
                      ? locale === "ko"
                        ? "선택된 날짜"
                        : locale === "en"
                          ? "Selected day"
                          : "Ausgewählter Tag"
                      : locale === "ko"
                        ? "선택된 월"
                        : locale === "en"
                          ? "Selected month"
                          : "Aktiver Monat"}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {selectedView === "daily" ? selectedDateLabel : monthMeta.label}
                  </p>
                </div>
                <a
                  href={selectedView === "daily" ? nextDateHref : nextMonthHref}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-stone-100"
                  aria-label={
                    selectedView === "daily"
                      ? locale === "ko"
                        ? "다음 날짜"
                        : locale === "en"
                          ? "Next day"
                          : "Nächster Tag"
                      : locale === "ko"
                        ? "다음 달"
                        : locale === "en"
                          ? "Next month"
                          : "Nächster Monat"
                  }
                >
                  &gt;
                </a>
              </div>
              {selectedView === "daily" ? (
                <form method="get" className="mt-4 space-y-3">
                  <input type="hidden" name="view" value="daily" />
                  <input type="hidden" name="month" value={selectedMonth} />
                  <input type="hidden" name="page" value="1" />
                  <input type="hidden" name="pageSize" value={selectedPageSize} />
                  <label className="block text-left text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    {locale === "ko" ? "정확한 날짜 선택" : locale === "en" ? "Exact date" : "Datum wählen"}
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={selectedDate}
                    className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm font-medium text-ink"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-stone-100"
                  >
                    {locale === "ko" ? "이 날짜로 보기" : locale === "en" ? "View this day" : "Diesen Tag anzeigen"}
                  </button>
                </form>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-0 overflow-hidden rounded-[1rem] border border-line/70 bg-white text-xs text-stone-500">
                <div className="border-r border-line/70 px-3 py-3">
                  <span className="block text-stone-400">
                    {selectedView === "daily"
                      ? locale === "ko"
                        ? "일 취소 건수"
                        : locale === "en"
                          ? "Cancelled"
                          : "Storniert"
                      : locale === "ko"
                        ? "전일 대비"
                        : locale === "en"
                          ? "vs previous day"
                          : "Vortag"}
                  </span>
                  <span className="mt-1 block font-semibold text-ink tabular-nums">
                    {selectedView === "daily"
                      ? String(dailyCancelledOrders.length)
                      : `${dayOverDayDelta >= 0 ? "+" : ""}${dayOverDayDelta.toFixed(1)}%`}
                  </span>
                </div>
                <div className="px-3 py-3">
                  <span className="block text-stone-400">
                    {selectedView === "daily"
                      ? locale === "ko"
                        ? "일 판매 수량"
                        : locale === "en"
                          ? "Items sold"
                          : "Verkaufte Artikel"
                      : locale === "ko"
                        ? "주간 비교"
                        : locale === "en"
                          ? "vs previous week"
                          : "Woche"}
                  </span>
                  <span className="mt-1 block font-semibold text-ink tabular-nums">
                    {selectedView === "daily"
                      ? String(dailyItemCount)
                      : `${weekOverWeekDelta >= 0 ? "+" : ""}${weekOverWeekDelta.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className="space-y-3 px-6 py-5">
            <a
              href={exportHref}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              {locale === "ko" ? "엑셀용 CSV 내보내기" : locale === "en" ? "Export CSV for Excel" : "CSV für Excel exportieren"}
            </a>
            <div className="rounded-[1.5rem] border border-dashed border-line/70 px-4 py-4 text-sm text-stone-500">
              {locale === "ko"
                ? "월 변경과 내보내기 기능은 이 패널에서 바로 처리할 수 있습니다."
                : locale === "en"
                  ? "Month changes and exports stay together in this side panel."
                  : "Monatswechsel und Export bleiben bewusst gesammelt in diesem Bereich."}
            </div>
          </div>
        </aside>
      </div>

      {showMonthly || showDaily ? (
        <section className="surface mt-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{locale === "ko" ? "월 선택 캘린더" : locale === "en" ? "Monthly calendar" : "Monatskalender"}</h2>
            <span className="text-xs text-stone-400">{locale === "ko" ? "일자별 실매출" : locale === "en" ? "Revenue by day" : "Tagesumsatz"}</span>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-x-2 gap-y-3 border-b border-line/70 pb-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            {weekdayLabels.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-x-2 gap-y-2">
            {calendarCells.map((cell, index) =>
              cell ? (
                <a
                  key={cell.dateKey}
                  href={buildQuery({
                    month: selectedMonth,
                    date: cell.dateKey,
                    page: 1,
                    pageSize: selectedPageSize,
                    view: "daily"
                  })}
                  className={`min-h-[102px] rounded-[1rem] border px-3 py-3 transition hover:bg-white ${
                    selectedDate === cell.dateKey && selectedView === "daily"
                      ? "border-ink bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                      : ""
                  } ${
                    cell.isTopDay
                      ? "border-warm-200 bg-[linear-gradient(180deg,rgba(255,248,241,0.96),rgba(250,250,249,0.92))]"
                      : cell.isWeekend
                        ? "border-line/60 bg-[rgba(250,250,249,0.85)]"
                        : "border-line/70 bg-stone-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-semibold ${cell.isWeekend ? "text-warm-500" : "text-stone-500"}`}>{cell.day}</span>
                    {cell.isTopDay ? (
                      <span className="rounded-full bg-warm-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-warm-700">
                        {locale === "ko" ? "최고" : locale === "en" ? "Top" : "Top"}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.12em] text-stone-300">
                        {cell.revenue ? (locale === "ko" ? "매출" : locale === "en" ? "Sales" : "Umsatz") : ""}
                      </span>
                    )}
                  </div>
                  <p className="mt-6 break-all text-[13px] font-semibold leading-4 text-ink tabular-nums">
                    {cell.revenue ? formatEuro(cell.revenue) : "-"}
                  </p>
                  <p className="mt-2 text-[11px] text-stone-400">
                    {cell.isWeekend
                      ? locale === "ko"
                        ? "주말"
                        : locale === "en"
                          ? "Weekend"
                          : "Wochenende"
                      : cell.isTopDay
                        ? locale === "ko"
                          ? "이번 달 최고 매출일"
                          : locale === "en"
                            ? "Top sales day"
                            : "Stärkster Umsatztag"
                      : "\u00A0"}
                  </p>
                </a>
              ) : (
                <div key={`empty-${index}`} className="min-h-[98px] rounded-[1rem] border border-dashed border-line/30 bg-transparent" />
              )
            )}
          </div>
        </section>
      ) : null}

      {selectedView === "daily" ? (
        <section className="surface mt-4 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                {locale === "ko" ? "선택한 날짜 상세" : locale === "en" ? "Selected day details" : "Tagesdetails"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{selectedDateLabel}</h2>
            </div>
            <div className="text-sm text-stone-500">
              {locale === "ko"
                ? `주문 ${dailyServedOrders.length}건 · 호출 ${dailyCalls.length}건`
                : locale === "en"
                  ? `${dailyServedOrders.length} orders · ${dailyCalls.length} requests`
                  : `${dailyServedOrders.length} Bestellungen · ${dailyCalls.length} Anfragen`}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <div className="rounded-[1.25rem] border border-line/70 bg-stone-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {locale === "ko" ? "피크 시간대" : locale === "en" ? "Peak hour" : "Stoßzeit"}
              </p>
              <p className="mt-3 text-lg font-semibold text-ink">
                {dailyHourlyPeak[0] ? `${dailyHourlyPeak[0][0]}:00` : "-"}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {dailyHourlyPeak[0]
                  ? `${dailyHourlyPeak[0][1]}${locale === "ko" ? "건 주문" : locale === "en" ? " orders" : " Bestellungen"}`
                  : locale === "ko"
                    ? "해당 일자 주문 없음"
                    : locale === "en"
                      ? "No orders that day"
                      : "Keine Bestellungen an diesem Tag"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-line/70 bg-stone-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {locale === "ko" ? "가장 많이 팔린 메뉴" : locale === "en" ? "Top item" : "Top-Artikel"}
              </p>
              <p className="mt-3 text-lg font-semibold text-ink">{dailyBestItems[0]?.[0] ?? "-"}</p>
              <p className="mt-1 text-sm text-stone-500">
                {dailyBestItems[0]
                  ? `${dailyBestItems[0][1]}${locale === "ko" ? "개 판매" : locale === "en" ? " sold" : " verkauft"}`
                  : locale === "ko"
                    ? "해당 일자 판매 없음"
                    : locale === "en"
                      ? "No sales that day"
                      : "Keine Verkäufe an diesem Tag"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-line/70 bg-stone-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {locale === "ko" ? "최고 단일 테이블" : locale === "en" ? "Top table" : "Stärkster Tisch"}
              </p>
              <p className="mt-3 text-lg font-semibold text-ink">{dailyTopTable?.name ?? "-"}</p>
              <p className="mt-1 text-sm text-stone-500 tabular-nums">
                {dailyTopTable ? formatEuro(dailyTopTable.revenue) : "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[860px] overflow-hidden rounded-[1.25rem] border border-line/70">
              <div className="grid grid-cols-[1.2fr_0.8fr_2.2fr_0.7fr_0.9fr] gap-4 bg-stone-50/80 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                <span>{locale === "ko" ? "서빙 시간" : locale === "en" ? "Served at" : "Serviert um"}</span>
                <span>{locale === "ko" ? "테이블" : locale === "en" ? "Table" : "Tisch"}</span>
                <span>{locale === "ko" ? "주문 내역" : locale === "en" ? "Items" : "Artikel"}</span>
                <span className="text-right">{locale === "ko" ? "수량" : locale === "en" ? "Qty" : "Menge"}</span>
                <span className="text-right">{locale === "ko" ? "금액" : locale === "en" ? "Amount" : "Betrag"}</span>
              </div>
              {dailyServedOrders.length ? (
                dailyServedOrders.map((order, index) => {
                  const amount = getOrderRevenueCents(order);
                  const orderQuantity = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                  const itemSummary = order.order_items
                    .map((item: any) =>
                      `${item.quantity}x ${item.name_snapshot}${item.variant_name_snapshot ? ` · ${item.variant_name_snapshot}` : ""}`
                    )
                    .join(", ");

                  return (
                    <div
                      key={order.id}
                      className={`grid grid-cols-[1.2fr_0.8fr_2.2fr_0.7fr_0.9fr] gap-4 px-5 py-4 text-sm ${
                        index !== dailyServedOrders.length - 1 ? "border-t border-line/50" : ""
                      }`}
                    >
                      <span className="font-medium text-ink">{formatDateTimeByLocale(order.served_at ?? order.created_at, locale)}</span>
                      <span className="text-stone-600">{order.restaurant_tables?.name ?? "-"}</span>
                      <span className="text-stone-600">{itemSummary}</span>
                      <span className="text-right font-medium text-ink">{orderQuantity}</span>
                      <span className="text-right font-semibold text-ink tabular-nums">{formatEuro(amount)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-sm text-stone-500">
                  {locale === "ko"
                    ? "선택한 날짜에는 서빙 완료된 주문이 없습니다."
                    : locale === "en"
                      ? "There are no served orders on the selected date."
                      : "Am ausgewählten Tag gibt es keine servierten Bestellungen."}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-4 columns-1 gap-4 xl:columns-2 [&>section]:mb-4 [&>section]:break-inside-avoid">
        {showOverview || showMonthly ? (
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{locale === "ko" ? "월별 매출 추이" : locale === "en" ? "Monthly revenue trend" : "Umsatztrend pro Monat"}</h2>
            <span className="text-xs text-stone-400">{locale === "ko" ? "최근 6개월" : locale === "en" ? "Last 6 months" : "Letzte 6 Monate"}</span>
          </div>
          <div className="mt-5 space-y-3">
            {monthlyTrend.map(([month, value]) => (
              <div key={month} className="rounded-[1.15rem] border border-line/70 bg-stone-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-stone-600">{month}</span>
                  <span className="font-semibold text-ink tabular-nums">{formatEuro(value)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#c4b5fd,#f28a67)]"
                    style={{ width: `${Math.max((value / trendMax) * 100, value > 0 ? 10 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showOverview || showDaily ? (
        <section className="surface p-5">
          <h2 className="text-lg font-semibold">{locale === "ko" ? "시간대별 주문 몰림" : locale === "en" ? "Orders by hour" : "Bestellungen nach Uhrzeit"}</h2>
          <div className="mt-5 space-y-3">
            {(selectedView === "daily" ? dailyHourlyPeak : hourlyPeak).length ? (selectedView === "daily" ? dailyHourlyPeak : hourlyPeak).map(([hour, count]) => (
              <div key={hour} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <span>{hour}:00</span>
                <span className="font-semibold">{count}{locale === "ko" ? "건" : locale === "en" ? "" : ""}</span>
              </div>
            )) : <p className="text-sm text-stone-500">{selectedView === "daily"
              ? locale === "ko"
                ? "선택한 날짜 주문이 없습니다."
                : locale === "en"
                  ? "No orders on the selected date."
                  : "Keine Bestellungen am ausgewählten Tag."
              : locale === "ko"
                ? "선택한 달 주문이 없습니다."
                : locale === "en"
                  ? "No orders in the selected month."
                  : "Keine Bestellungen im gewählten Monat."}</p>}
          </div>
        </section>
        ) : null}

        {showOverview || showMenu ? (
        <section className="surface p-5">
          <h2 className="text-lg font-semibold">{locale === "ko" ? "카테고리별 매출 비중" : locale === "en" ? "Revenue by category" : "Umsatz nach Kategorie"}</h2>
          <div className="mt-5 space-y-3">
            {[...categoryMap.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{name}</span>
                  <span className="font-semibold">{formatEuro(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#111827,#f28a67)]"
                    style={{ width: `${Math.max((value / Math.max(totalRevenue, 1)) * 100, value > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showOverview || showMenu ? (
        <section className="surface p-5">
          <h2 className="text-lg font-semibold">{locale === "ko" ? "베스트 메뉴" : locale === "en" ? "Best-selling items" : "Top-Menüs"}</h2>
          <div className="mt-5 space-y-3">
            {bestItems.slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <span>{name}</span>
                <span className="font-semibold">{count}{locale === "ko" ? "개" : locale === "en" ? "" : ""}</span>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showOverview || showMenu ? (
        <section className="surface p-5">
          <h2 className="text-lg font-semibold">{locale === "ko" ? "저조 메뉴" : locale === "en" ? "Low-performing items" : "Schwache Menüs"}</h2>
          <div className="mt-5 space-y-3">
            {lowItems.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <span>{name}</span>
                <span className="font-semibold">{count}{locale === "ko" ? "개" : locale === "en" ? "" : ""}</span>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showOverview || showOperations ? (
        <section className="surface p-5">
          <h2 className="text-lg font-semibold">{locale === "ko" ? "테이블별 평균 객단가" : locale === "en" ? "Average spend per table" : "Durchschnitt pro Tisch"}</h2>
          <div className="mt-5 space-y-3">
            {tableAverages.map((table) => (
              <div key={table.name} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <span>{table.name}</span>
                <span className="font-semibold">{formatEuro(table.average)}</span>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showOverview || showOperations ? (
        <section className="surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-line/70 bg-stone-50 px-4 py-4">
              <p className="text-sm text-stone-500">{locale === "ko" ? "현재 품절률" : locale === "en" ? "Current out-of-stock rate" : "Aktuelle Ausfallquote"}</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{currentOutOfStockRate}%</p>
            </div>
            <div className="rounded-[1.5rem] border border-line/70 bg-stone-50 px-4 py-4">
              <p className="text-sm text-stone-500">{locale === "ko" ? "월 취소율" : locale === "en" ? "Monthly cancellation rate" : "Stornoquote im Monat"}</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{monthCancelRate}%</p>
            </div>
          </div>
          <h2 className="mt-5 text-lg font-semibold">{locale === "ko" ? "직원 호출 유형별 빈도" : locale === "en" ? "Request types" : "Serviceanfragen nach Typ"}</h2>
          <div className="mt-4 space-y-3">
            {[...callMap.entries()].map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <span>{dict.requests[type as keyof typeof dict.requests]}</span>
                <span className="font-semibold">{count}{locale === "ko" ? "건" : locale === "en" ? "" : ""}</span>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {showOverview || showDaily ? (
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {locale === "ko" ? "일별 매출 순위" : locale === "en" ? "Top daily revenue" : "Tagesumsatz-Ranking"}
            </h2>
            <span className="text-xs text-stone-400">
              {locale === "ko" ? "상위 7일" : locale === "en" ? "Top 7 days" : "Top 7 Tage"}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {selectedView === "daily" ? (
              dailyCalls.length ? dailyCalls.map((call, index) => (
                <div key={call.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{index + 1}. {dict.requests[call.call_type as keyof typeof dict.requests]}</p>
                    <p className="mt-1 text-xs text-stone-400">{formatDateTimeByLocale(call.created_at, locale)}</p>
                  </div>
                  <span className="font-medium text-stone-500">{call.restaurant_tables?.name ?? "-"}</span>
                </div>
              )) : (
                <p className="text-sm text-stone-500">
                  {locale === "ko"
                    ? "선택한 날짜 호출 데이터가 없습니다."
                    : locale === "en"
                      ? "No service requests on the selected date."
                      : "Keine Serviceanfragen am ausgewählten Tag."}
                </p>
              )
            ) : topRevenueDays.length ? topRevenueDays.map(([dateKey, value], index) => (
              <div key={dateKey} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{index + 1}. {formatDateTimeByLocale(`${dateKey}T12:00:00`, locale).split(" ").slice(0, 3).join(" ")}</p>
                  <p className="mt-1 text-xs text-stone-400">{dateKey}</p>
                </div>
                <span className="font-semibold tabular-nums text-ink">{formatEuro(value)}</span>
              </div>
            )) : (
              <p className="text-sm text-stone-500">
                {locale === "ko" ? "선택한 달 일별 매출 데이터가 없습니다." : locale === "en" ? "No daily revenue data for the selected month." : "Keine Tagesumsätze im gewählten Monat."}
              </p>
            )}
          </div>
        </section>
        ) : null}
      </div>

      {showReport ? (
      <section className="surface mt-4 overflow-hidden p-0">
        <div className="border-b border-line/70 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                {locale === "ko" ? "매출 리포트" : locale === "en" ? "Revenue report" : "Umsatzbericht"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                {locale === "ko" ? "매출 상세 내역" : locale === "en" ? "Revenue details" : "Umsatzdetails"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {locale === "ko"
                  ? "서빙 완료된 주문만 기준으로 실제 매출 흐름을 확인합니다."
                  : locale === "en"
                    ? "Only served orders are included, so this reflects realized revenue."
                  : "Zeigt nur servierte Bestellungen und damit den realisierten Umsatzfluss."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="border-l border-line/70 pl-4">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{locale === "ko" ? "주문 수" : locale === "en" ? "Orders" : "Orders"}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{monthServedOrders.length}</p>
              </div>
              <div className="border-l border-line/70 pl-4">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{locale === "ko" ? "판매 수량" : locale === "en" ? "Items sold" : "Items sold"}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{totalSoldItems}</p>
              </div>
              <div className="border-l border-line/70 pl-4">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{locale === "ko" ? "평균 객단가" : locale === "en" ? "Average" : "Average"}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{formatEuro(averageOrderValue)}</p>
              </div>
              <div className="border-l border-line/70 pl-4">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{locale === "ko" ? "상위 테이블" : locale === "en" ? "Top table" : "Top table"}</p>
                <p className="mt-2 text-lg font-semibold text-ink">{topTable?.[0] ?? "-"}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-0 overflow-hidden rounded-[1.2rem] border border-line/70 bg-stone-50/70 sm:grid-cols-3">
            <div className="border-b border-line/70 px-4 py-4 sm:border-b-0 sm:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                {locale === "ko" ? "최고 매출일" : locale === "en" ? "Top sales day" : "Stärkster Tag"}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {topDayDateKey ? formatDateTimeByLocale(`${topDayDateKey}T12:00:00`, locale).split(" ").slice(0, 3).join(" ") : "-"}
              </p>
              <p className="mt-1 text-sm text-stone-500 tabular-nums">{topDayRevenue ? formatEuro(topDayRevenue) : "-"}</p>
            </div>
            <div className="border-b border-line/70 px-4 py-4 sm:border-b-0 sm:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                {locale === "ko" ? "피크 시간대" : locale === "en" ? "Peak hour" : "Stoßzeit"}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">{peakHour !== undefined ? `${peakHour}:00` : "-"}</p>
              <p className="mt-1 text-sm text-stone-500">{peakHourCount}{locale === "ko" ? "건 주문" : locale === "en" ? " orders" : " Bestellungen"}</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                {locale === "ko" ? "월 취소율" : locale === "en" ? "Cancel rate" : "Stornoquote"}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">{monthCancelRate}%</p>
              <p className="mt-1 text-sm text-stone-500">
                {locale === "ko" ? "서빙 대비 취소 포함" : locale === "en" ? "served vs cancelled" : "serviert vs storniert"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-b border-line/70 bg-stone-50/80 px-6 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500">
            <span>
              {locale === "ko" ? "조회 기간" : locale === "en" ? "Period" : "Zeitraum"}:
              <strong className="ml-2 font-semibold text-ink">{monthMeta.label}</strong>
            </span>
            <span>
              {locale === "ko" ? "노출 범위" : locale === "en" ? "Range" : "Bereich"}:
              <strong className="ml-2 font-semibold text-ink">
                {monthDetails.length ? `${detailStart}-${detailEnd} / ${monthDetails.length}` : "0 / 0"}
              </strong>
            </span>
            <span>
              {locale === "ko" ? "총 매출" : locale === "en" ? "Total revenue" : "Gesamtumsatz"}:
              <strong className="ml-2 font-semibold text-ink">{formatEuro(totalRevenue)}</strong>
            </span>
          </div>
          <form method="get" className="mt-3 flex flex-wrap items-center justify-end gap-2 lg:mt-0">
            <input type="hidden" name="month" value={selectedMonth} />
            <input type="hidden" name="view" value="report" />
            <input type="hidden" name="page" value="1" />
            <label className="text-sm text-stone-500">
              {locale === "ko" ? "페이지당" : locale === "en" ? "Per page" : "Pro Seite"}
            </label>
            <div className="relative">
              <select
                name="pageSize"
                defaultValue={String(selectedPageSize)}
                className="min-h-10 appearance-none rounded-xl border border-line bg-white px-3 pr-9 text-sm font-medium text-ink"
              >
                {allowedPageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}{locale === "ko" ? "개" : locale === "en" ? "" : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">▾</div>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-stone-50"
            >
              {locale === "ko" ? "적용" : locale === "en" ? "Apply" : "Anwenden"}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[0.45fr_1.25fr_0.75fr_2.05fr_0.7fr_0.9fr] gap-4 border-b border-line/70 bg-stone-50/70 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              <span className="text-right">{locale === "ko" ? "순번" : locale === "en" ? "No." : "Nr."}</span>
              <span>{locale === "ko" ? "서빙 시간" : "Served at"}</span>
              <span>{locale === "ko" ? "테이블" : locale === "en" ? "Table" : "Tisch"}</span>
              <span>{locale === "ko" ? "주문 내역" : locale === "en" ? "Items" : "Artikel"}</span>
              <span className="text-right">{locale === "ko" ? "수량" : locale === "en" ? "Qty" : "Menge"}</span>
              <span className="text-right">{locale === "ko" ? "금액" : locale === "en" ? "Amount" : "Betrag"}</span>
            </div>
            {pagedDetails.map((order, index) => {
              const amount = getOrderRevenueCents(order);
              const itemSummary = order.order_items
                .map((item: any) =>
                  `${item.quantity}x ${item.name_snapshot}${item.variant_name_snapshot ? ` · ${item.variant_name_snapshot}` : ""}`
                )
                .join(", ");
              const orderQuantity = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className={`grid grid-cols-[0.45fr_1.25fr_0.75fr_2.05fr_0.7fr_0.9fr] gap-4 px-6 py-4 text-sm transition ${
                    index % 2 === 0 ? "bg-white" : "bg-stone-50/35"
                  } hover:bg-stone-50/85 ${
                    index !== pagedDetails.length - 1 ? "border-b border-line/50" : ""
                  }`}
                >
                  <span className="text-right font-medium tabular-nums text-stone-500">
                    {detailStart + index}
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium text-ink">{formatDateTimeByLocale(order.served_at ?? order.created_at, locale)}</p>
                    <p className="text-xs text-stone-400">
                      {locale === "ko" ? "주문 ID" : locale === "en" ? "Order ID" : "Bestell-ID"} · {String(order.id).slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-ink">
                      {order.restaurant_tables?.name ?? "-"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-2 text-stone-700">{itemSummary}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-stone-400">
                        {locale === "ko" ? "서빙 완료" : locale === "en" ? "Served" : "Serviert"}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                        {locale === "ko" ? "정상 매출" : locale === "en" ? "Revenue" : "Umsatz"}
                      </span>
                    </div>
                  </div>
                  <span className="text-right font-medium tabular-nums text-ink">{orderQuantity}</span>
                  <span className="text-right text-base font-semibold tabular-nums text-ink">{formatEuro(amount)}</span>
                </div>
              );
            })}
            {monthDetails.length === 0 ? (
              <div className="px-6 py-10 text-sm text-stone-500">
                {locale === "ko" ? "선택한 달의 매출 데이터가 없습니다." : locale === "en" ? "No revenue data for the selected month." : "Keine Umsatzdaten für den gewählten Monat."}
              </div>
            ) : null}
          </div>
        </div>
        {monthDetails.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-line/70 bg-stone-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-500">
              {locale === "ko"
                ? `페이지 ${currentPage} / ${totalPages}`
                : locale === "en"
                  ? `Page ${currentPage} / ${totalPages}`
                  : `Seite ${currentPage} / ${totalPages}`}
            </p>
            <div className="flex items-center justify-end gap-2">
              {pageWindow.map((page) => (
                <a
                  key={page}
                  href={buildQuery({ month: selectedMonth, page, pageSize: selectedPageSize, view: "report" })}
                  className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition ${
                    page === currentPage
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink hover:bg-stone-50"
                  }`}
                >
                  {page}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      ) : null}
    </AppShell>
  );
}
