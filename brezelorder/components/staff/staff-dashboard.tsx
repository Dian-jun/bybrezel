"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarDays, ChevronDown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_STYLES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ServiceDay } from "@/lib/service-days";
import type { TableSession } from "@/lib/table-sessions";
import {
  formatDateByLocale,
  formatDateTimeByLocale,
  formatEuro,
  formatTimeByLocale
} from "@/lib/utils";

type DashboardOrder = {
  id: string;
  status: "new" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
  guest_name: string | null;
  notes: string | null;
  created_at: string;
  table_session_id?: string | null;
  served_at?: string | null;
  served_by_membership?: {
    users?: { full_name?: string | null; email?: string | null } | null;
  } | null;
  restaurant_tables:
    | {
        name: string;
        assigned_membership?: {
          users?: { full_name?: string | null; email?: string | null } | null;
        } | null;
      }
    | null;
  order_items: Array<{
    id: string;
    name_snapshot: string;
    variant_name_snapshot?: string | null;
    price_cents_snapshot: number;
    quantity: number;
    item_note?: string | null;
    allergy_note?: string | null;
  }>;
};

type DashboardCall = {
  id: string;
  call_type: "call_staff" | "request_bill" | "request_water" | "need_help";
  status: "open" | "completed";
  message: string | null;
  created_at: string;
  table_session_id?: string | null;
  completed_at?: string | null;
  completed_by_membership?: {
    users?: { full_name?: string | null; email?: string | null } | null;
  } | null;
  restaurant_tables:
    | {
        name: string;
        assigned_membership?: {
          users?: { full_name?: string | null; email?: string | null } | null;
        } | null;
      }
    | null;
};

type DashboardSession = TableSession & {
  restaurant_tables:
    | {
        name: string;
        assigned_membership?: {
          users?: { full_name?: string | null; email?: string | null } | null;
        } | null;
      }
    | null;
};

type Labels = {
  requests: Record<DashboardCall["call_type"], string>;
  statuses: Record<DashboardOrder["status"] | "completed" | "open", string>;
  guestOrder: string;
  tableFallback: string;
  markCompleted: string;
  servedRevenue: string;
  orderCount: string;
  servedCount: string;
  activeCalls: string;
  completedOrders: string;
  cancelledOrders: string;
  completedCalls: string;
  requestTime: string;
  enableAlerts: string;
  alertsOn: string;
  alertsOff: string;
  serviceDayTitle: string;
  serviceDayOpen: string;
  serviceDayClosed: string;
  serviceDayOpenedAt: string;
  serviceDayDate: string;
  openServiceDay: string;
  closeServiceDay: string;
  serviceDayHint: string;
  noActiveServiceDay: string;
  activeTableSessions: string;
  noActiveTableSessions: string;
  sessionTotal: string;
  sessionOrders: string;
  sessionCheckoutRequested: string;
  markSessionPaid: string;
  assignedStaff: string;
  completedAt: string;
  completedBy: string;
  servedAt: string;
  servedBy: string;
  unassigned: string;
};

function DashboardCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`surface p-5 ${className}`}>{children}</section>;
}

function isRecent(date: string, withinMinutes = 10) {
  return Date.now() - new Date(date).getTime() < withinMinutes * 60 * 1000;
}

export function StaffDashboard({
  restaurantId,
  initialOrders,
  initialCalls,
  initialTableSessions,
  initialServiceDay,
  locale,
  labels
}: {
  restaurantId: string;
  initialOrders: DashboardOrder[];
  initialCalls: DashboardCall[];
  initialTableSessions: DashboardSession[];
  initialServiceDay: ServiceDay | null;
  locale: Locale;
  labels: Labels;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [calls, setCalls] = useState(initialCalls);
  const [tableSessions, setTableSessions] = useState(initialTableSessions);
  const [currentServiceDay, setCurrentServiceDay] = useState<ServiceDay | null>(
    initialServiceDay
  );
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [serviceDayPending, setServiceDayPending] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const lastOrderSeenRef = useRef<string | null>(initialOrders[0]?.created_at ?? null);
  const lastCallSeenRef = useRef<string | null>(initialCalls[0]?.created_at ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("brezel-staff-alerts-enabled");
    if (saved === "true") {
      setAlertsEnabled(true);
      return;
    }

    if (saved === "false") {
      setAlertsEnabled(false);
      return;
    }

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      setAlertsEnabled(true);
    }
  }, []);

  function formatDate(date: string) {
    return formatDateByLocale(date, locale);
  }

  function formatDateTime(date: string) {
    return formatDateTimeByLocale(date, locale);
  }

  function formatTime(date: string) {
    return formatTimeByLocale(date, locale);
  }

  const activeOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "served" && order.status !== "cancelled")
        .sort((a, b) => {
          if (a.status === "ready" && b.status !== "ready") return -1;
          if (a.status !== "ready" && b.status === "ready") return 1;
          if (a.status === "new" && b.status !== "new") return -1;
          if (a.status !== "new" && b.status === "new") return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }),
    [orders]
  );

  const servedOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === "served")
        .sort((a, b) => {
          const aTime = new Date(a.served_at ?? a.created_at).getTime();
          const bTime = new Date(b.served_at ?? b.created_at).getTime();
          return bTime - aTime;
        }),
    [orders]
  );

  const cancelledOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === "cancelled")
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [orders]
  );

  const activeCalls = useMemo(
    () =>
      calls
        .filter((call) => call.status === "open")
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
    [calls]
  );

  const completedCalls = useMemo(
    () =>
      calls
        .filter((call) => call.status === "completed")
        .sort((a, b) => {
          const aTime = new Date(a.completed_at ?? a.created_at).getTime();
          const bTime = new Date(b.completed_at ?? b.created_at).getTime();
          return bTime - aTime;
        }),
    [calls]
  );

  const sessionSummaries = useMemo(() => {
    return tableSessions
      .map((session) => {
        const sessionOrders = orders.filter((order) => order.table_session_id === session.id);
        const sessionCalls = calls.filter((call) => call.table_session_id === session.id);
        const totalCents = sessionOrders.reduce(
          (sum, order) =>
            sum +
            order.order_items.reduce(
              (orderSum, item) => orderSum + item.price_cents_snapshot * item.quantity,
              0
            ),
          0
        );
        const lastActivityAt = [...sessionOrders.map((order) => order.created_at), ...sessionCalls.map((call) => call.created_at)]
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? session.opened_at;

        return {
          session,
          totalCents,
          orderRounds: sessionOrders.length,
          openCalls: sessionCalls.filter((call) => call.status === "open").length,
          lastActivityAt
        };
      })
      .sort((a, b) => {
        if (a.session.status === "checkout_requested" && b.session.status !== "checkout_requested") return -1;
        if (a.session.status !== "checkout_requested" && b.session.status === "checkout_requested") return 1;
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      });
  }, [tableSessions, orders, calls]);

  const servedRevenue = orders
    .filter((order) => order.status === "served")
    .reduce(
      (sum, order) =>
        sum +
        order.order_items.reduce(
          (orderSum, item) => orderSum + item.price_cents_snapshot * item.quantity,
          0
        ),
      0
    );

  function getOrderTotal(order: DashboardOrder) {
    return order.order_items.reduce(
      (sum, item) => sum + item.price_cents_snapshot * item.quantity,
      0
    );
  }

  function getMembershipName(
    membership:
      | { users?: { full_name?: string | null; email?: string | null } | null }
      | null
      | undefined
  ) {
    return membership?.users?.full_name ?? membership?.users?.email ?? labels.unassigned;
  }

  function playAlertTone() {
    if (typeof window === "undefined") return;

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
    oscillator.onended = () => {
      void context.close();
    };
  }

  function triggerArrivalAlert(title: string, body: string) {
    if (!alertsEnabled) return;

    playAlertTone();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([140, 70, 180]);
    }

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  async function refreshSnapshot() {
    const response = await fetch("/api/staff-snapshot", { cache: "no-store" });
    const payload = await response.json();
    const nextOrders = payload.orders as DashboardOrder[];
    const nextCalls = payload.calls as DashboardCall[];
    const nextTableSessions = (payload.tableSessions ?? []) as DashboardSession[];
    const nextServiceDay = (payload.currentServiceDay ?? null) as ServiceDay | null;

    const newestOrder = nextOrders[0]?.created_at ?? null;
    const newestCall = nextCalls[0]?.created_at ?? null;
    const latestOrder = nextOrders[0];
    const latestCall = nextCalls[0];

    if (
      lastOrderSeenRef.current &&
      newestOrder &&
      newestOrder > lastOrderSeenRef.current &&
      latestOrder
    ) {
      triggerArrivalAlert(
        locale === "ko" ? "새 주문이 들어왔습니다" : "Neue Bestellung eingegangen",
        latestOrder.restaurant_tables?.name ?? labels.tableFallback
      );
    }

    if (
      lastCallSeenRef.current &&
      newestCall &&
      newestCall > lastCallSeenRef.current &&
      latestCall
    ) {
      triggerArrivalAlert(
        locale === "ko" ? "새 호출이 들어왔습니다" : "Neue Serviceanfrage",
        `${latestCall.restaurant_tables?.name ?? labels.tableFallback} · ${labels.requests[latestCall.call_type]}`
      );
    }

    lastOrderSeenRef.current = newestOrder;
    lastCallSeenRef.current = newestCall;
    setOrders(nextOrders);
    setCalls(nextCalls);
    setTableSessions(nextTableSessions);
    setCurrentServiceDay(nextServiceDay);
  }

  useEffect(() => {
    const ordersChannel = supabase
      .channel(`orders:${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`
        },
        async () => {
          await refreshSnapshot();
        }
      )
      .subscribe();

    const callsChannel = supabase
      .channel(`staff_calls:${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "staff_calls",
          filter: `restaurant_id=eq.${restaurantId}`
        },
        async () => {
          await refreshSnapshot();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(callsChannel);
    };
  }, [restaurantId, supabase, locale, alertsEnabled]);

  async function updateOrder(orderId: string, status: DashboardOrder["status"]) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
  }

  function getPrimaryOrderAction(order: DashboardOrder) {
    switch (order.status) {
      case "new":
        return "accepted" as const;
      case "accepted":
        return "preparing" as const;
      case "preparing":
        return "ready" as const;
      case "ready":
        return "served" as const;
      default:
        return null;
    }
  }

  async function completeCall(callId: string) {
    await fetch(`/api/staff-calls/${callId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "completed" })
    });
  }

  async function toggleAlerts() {
    if (alertsEnabled) {
      setAlertsEnabled(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("brezel-staff-alerts-enabled", "false");
      }
      return;
    }

    if (typeof Notification === "undefined") {
      setAlertsEnabled(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("brezel-staff-alerts-enabled", "true");
      }
      return;
    }

    if (Notification.permission === "granted") {
      setAlertsEnabled(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("brezel-staff-alerts-enabled", "true");
      }
      return;
    }

    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setAlertsEnabled(enabled);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("brezel-staff-alerts-enabled", String(enabled));
    }
  }

  async function toggleServiceDay(action: "open" | "close") {
    setServiceDayPending(true);

    try {
      await fetch("/api/service-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      });
      await refreshSnapshot();
    } finally {
      setServiceDayPending(false);
    }
  }

  async function markSessionPaid(sessionId: string) {
    await fetch(`/api/table-sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: "paid" })
    });
    await refreshSnapshot();
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-4">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => {
              const isFresh =
                order.status === "new" ||
                order.status === "ready" ||
                isRecent(order.created_at);
              const primaryAction = getPrimaryOrderAction(order);

              return (
                <article
                  key={order.id}
                  className={`surface relative overflow-hidden p-5 ${
                    isFresh
                      ? "border border-[rgba(235,94,40,0.18)] shadow-[0_18px_40px_rgba(235,94,40,0.08)]"
                      : ""
                  }`}
                >
                  {isFresh ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-accent),#f1b199)]" />
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-stone-500">
                          {order.restaurant_tables?.name ?? labels.tableFallback}
                        </p>
                        {isFresh ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(235,94,40,0.12)] px-2 py-1 text-[11px] font-semibold text-[var(--brand-accent)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
                            NEW
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-1 text-xl font-semibold">
                        {order.guest_name ? order.guest_name : labels.guestOrder}
                      </h2>
                      <p className="mt-1 text-xs text-stone-500">
                        {formatDateTime(order.created_at)}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        {labels.assignedStaff} ·{" "}
                        {getMembershipName(order.restaurant_tables?.assigned_membership)}
                      </p>
                    </div>
                    <Badge className={ORDER_STATUS_STYLES[order.status]}>
                      {labels.statuses[order.status]}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-line bg-stone-50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.name_snapshot}</p>
                          <p className="text-sm text-stone-500">x{item.quantity}</p>
                        </div>
                        {item.variant_name_snapshot ? (
                          <p className="mt-1 text-xs text-stone-500">
                            {item.variant_name_snapshot}
                          </p>
                        ) : null}
                        {item.allergy_note ? (
                          <p className="mt-2 text-xs font-medium text-rose-600">
                            Allergy: {item.allergy_note}
                          </p>
                        ) : null}
                        {item.item_note ? (
                          <p className="mt-1 text-xs text-stone-600">
                            Item note: {item.item_note}
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm text-stone-600">
                          {formatEuro(item.price_cents_snapshot * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  {order.notes ? (
                    <p className="mt-4 text-sm text-stone-600">Note: {order.notes}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {primaryAction ? (
                      <Button onClick={() => updateOrder(order.id, primaryAction)}>
                        {labels.statuses[primaryAction]}
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      onClick={() => updateOrder(order.id, "cancelled")}
                    >
                      {labels.statuses.cancelled}
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <DashboardCard className="border border-dashed border-line">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(204,182,255,0.18)] text-[var(--brand-ink)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{labels.serviceDayTitle}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {currentServiceDay ? labels.serviceDayHint : labels.noActiveServiceDay}
                  </p>
                </div>
              </div>
            </DashboardCard>
          )}
        </div>

        <div className="space-y-4">
          {activeCalls.length > 0 ? (
            activeCalls.map((call) => {
              const isFresh = isRecent(call.created_at);

              return (
                <article
                  key={call.id}
                  className={`surface relative overflow-hidden p-5 ${
                    isFresh
                      ? "border border-[rgba(204,182,255,0.28)] shadow-[0_18px_40px_rgba(204,182,255,0.14)]"
                      : ""
                  }`}
                >
                  {isFresh ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-lilac),var(--brand-accent-soft))]" />
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-stone-500">
                          {call.restaurant_tables?.name ?? labels.tableFallback}
                        </p>
                        {isFresh ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(204,182,255,0.18)] px-2 py-1 text-[11px] font-semibold text-[var(--brand-ink)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
                            NEW
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-1 text-xl font-semibold">
                        {labels.requests[call.call_type]}
                      </h2>
                      <p className="mt-1 text-xs text-stone-500">
                        {labels.requestTime} · {formatTime(call.created_at)}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        {labels.assignedStaff} ·{" "}
                        {getMembershipName(call.restaurant_tables?.assigned_membership)}
                      </p>
                    </div>
                    <Badge className="border-warm-200 bg-warm-100 text-warm-500">
                      {labels.statuses.open}
                    </Badge>
                  </div>
                  {call.message ? <p className="mt-3 text-sm text-stone-600">{call.message}</p> : null}
                  <div className="mt-4">
                    <Button fullWidth onClick={() => completeCall(call.id)}>
                      {labels.markCompleted}
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <DashboardCard className="border border-dashed border-line">
              <p className="font-semibold">{labels.activeCalls}</p>
              <p className="mt-1 text-sm text-stone-500">
                {currentServiceDay ? labels.serviceDayHint : labels.noActiveServiceDay}
              </p>
            </DashboardCard>
          )}
        </div>
      </section>

      <section className="surface p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">{labels.activeTableSessions}</p>
            <p className="mt-1 text-lg font-semibold">{sessionSummaries.length}</p>
          </div>
          {currentServiceDay ? (
            <p className="text-xs text-stone-500">{formatDate(currentServiceDay.service_date)}</p>
          ) : null}
        </div>

        {sessionSummaries.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessionSummaries.map(({ session, totalCents, orderRounds, openCalls, lastActivityAt }) => (
              <article
                key={session.id}
                className={`rounded-3xl border p-4 ${
                  session.status === "checkout_requested"
                    ? "border-[rgba(235,94,40,0.22)] bg-[rgba(255,106,61,0.06)]"
                    : "border-line bg-stone-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-stone-500">
                      {session.restaurant_tables?.name ?? labels.tableFallback}
                    </p>
                    <p className="mt-1 font-semibold">{formatEuro(totalCents)}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {labels.sessionOrders} {orderRounds}
                      {openCalls > 0 ? ` · ${labels.activeCalls} ${openCalls}` : ""}
                    </p>
                  </div>
                  {session.status === "checkout_requested" ? (
                    <Badge className="border-warm-200 bg-warm-100 text-warm-500">
                      {labels.sessionCheckoutRequested}
                    </Badge>
                  ) : (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {labels.serviceDayOpen}
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-xs text-stone-500">
                  {labels.assignedStaff} ·{" "}
                  {getMembershipName(session.restaurant_tables?.assigned_membership)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {labels.requestTime} · {formatDateTime(lastActivityAt)}
                </p>

                <div className="mt-4">
                  <Button fullWidth onClick={() => markSessionPaid(session.id)}>
                    {labels.markSessionPaid}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-line bg-stone-50 px-4 py-5 text-sm text-stone-500">
            {labels.noActiveTableSessions}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr_0.8fr_0.8fr]">
        <DashboardCard className="lg:row-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500">{labels.serviceDayTitle}</p>
              <div className="mt-3 inline-flex rounded-full bg-[rgba(17,24,39,0.06)] px-3 py-1 text-sm font-medium text-ink">
                {currentServiceDay ? labels.serviceDayOpen : labels.serviceDayClosed}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAlerts}
              aria-pressed={alertsEnabled}
              className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                alertsEnabled
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-stone-700"
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>{alertsEnabled ? labels.alertsOn : labels.alertsOff}</span>
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-line bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                {labels.serviceDayDate}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {currentServiceDay ? formatDate(currentServiceDay.service_date) : "-"}
              </p>
            </div>

            <div className="rounded-3xl border border-line bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                {labels.serviceDayOpenedAt}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {currentServiceDay ? formatDateTime(currentServiceDay.opened_at) : "-"}
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-line bg-white p-4 text-sm text-stone-500">
              {currentServiceDay ? labels.serviceDayHint : labels.noActiveServiceDay}
            </div>
          </div>

          <div className="mt-5">
            <Button
              fullWidth
              onClick={() => toggleServiceDay(currentServiceDay ? "close" : "open")}
              disabled={serviceDayPending}
            >
              {currentServiceDay ? labels.closeServiceDay : labels.openServiceDay}
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(204,182,255,0.18)] text-[var(--brand-ink)]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-stone-500">{labels.servedRevenue}</p>
              <p className="mt-1 text-3xl font-semibold">{formatEuro(servedRevenue)}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <p className="text-sm text-stone-500">{labels.orderCount}</p>
          <p className="mt-4 text-3xl font-semibold">{orders.length}</p>
          <p className="mt-2 text-sm text-stone-500">
            {labels.servedCount} {servedOrders.length}건
          </p>
        </DashboardCard>

        <DashboardCard>
          <p className="text-sm text-stone-500">{labels.activeCalls}</p>
          <p className="mt-4 text-3xl font-semibold">{activeCalls.length}</p>
        </DashboardCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {servedOrders.length > 0 ? (
          <DashboardCard>
            <details className="group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">{labels.completedOrders}</p>
                  <p className="mt-1 text-lg font-semibold">{servedOrders.length}건</p>
                </div>
                <ChevronDown className="h-5 w-5 text-stone-500 transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-3">
                {servedOrders.map((order) => (
                  <details
                    key={order.id}
                    className="group rounded-3xl border border-line bg-stone-50 p-4"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-stone-500">
                          {order.restaurant_tables?.name ?? labels.tableFallback}
                        </p>
                        <p className="mt-1 font-semibold">
                          {order.guest_name ? order.guest_name : labels.guestOrder}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(order.created_at)} · {formatEuro(getOrderTotal(order))}
                        </p>
                        <p className="mt-2 text-xs text-stone-500">
                          {labels.servedAt} ·{" "}
                          {order.served_at ? formatDateTime(order.served_at) : "-"}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {labels.servedBy} · {getMembershipName(order.served_by_membership)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={ORDER_STATUS_STYLES[order.status]}>
                          {labels.statuses[order.status]}
                        </Badge>
                        <ChevronDown className="h-5 w-5 text-stone-500 transition group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="mt-4 space-y-3 border-t border-line pt-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="rounded-2xl bg-white px-4 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium">
                                {item.name_snapshot}
                                {item.variant_name_snapshot
                                  ? ` · ${item.variant_name_snapshot}`
                                  : ""}
                              </p>
                              {item.allergy_note ? (
                                <p className="mt-1 text-xs font-medium text-rose-600">
                                  Allergy: {item.allergy_note}
                                </p>
                              ) : null}
                              {item.item_note ? (
                                <p className="mt-1 text-xs text-stone-500">
                                  Item note: {item.item_note}
                                </p>
                              ) : null}
                              <p className="mt-1 text-sm text-stone-500">x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-stone-700">
                              {formatEuro(item.price_cents_snapshot * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.notes ? (
                        <p className="text-sm text-stone-600">Note: {order.notes}</p>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          </DashboardCard>
        ) : null}

        {completedCalls.length > 0 ? (
          <DashboardCard>
            <details className="group" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">{labels.completedCalls}</p>
                  <p className="mt-1 text-lg font-semibold">{completedCalls.length}건</p>
                </div>
                <ChevronDown className="h-5 w-5 text-stone-500 transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-3">
                {completedCalls.map((call) => (
                  <article key={call.id} className="rounded-3xl border border-line bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-stone-500">
                          {call.restaurant_tables?.name ?? labels.tableFallback}
                        </p>
                        <p className="mt-1 font-semibold">{labels.requests[call.call_type]}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {labels.requestTime} · {formatDateTime(call.created_at)}
                        </p>
                        <p className="mt-2 text-xs text-stone-500">
                          {labels.completedAt} ·{" "}
                          {call.completed_at ? formatDateTime(call.completed_at) : "-"}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {labels.completedBy} · {getMembershipName(call.completed_by_membership)}
                        </p>
                        {call.message ? (
                          <p className="mt-2 text-sm text-stone-500">{call.message}</p>
                        ) : null}
                      </div>
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        {labels.statuses.completed}
                      </Badge>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          </DashboardCard>
        ) : null}

        {cancelledOrders.length > 0 ? (
          <DashboardCard className="xl:col-span-2">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">{labels.cancelledOrders}</p>
                  <p className="mt-1 text-lg font-semibold">{cancelledOrders.length}건</p>
                </div>
                <ChevronDown className="h-5 w-5 text-stone-500 transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {cancelledOrders.map((order) => (
                  <article key={order.id} className="rounded-3xl border border-line bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-stone-500">
                          {order.restaurant_tables?.name ?? labels.tableFallback}
                        </p>
                        <p className="mt-1 font-semibold">
                          {order.guest_name ? order.guest_name : labels.guestOrder}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(order.created_at)} · {formatEuro(getOrderTotal(order))}
                        </p>
                      </div>
                      <Badge className={ORDER_STATUS_STYLES[order.status]}>
                        {labels.statuses[order.status]}
                      </Badge>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          </DashboardCard>
        ) : null}
      </section>
    </div>
  );
}
