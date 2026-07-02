"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChefHat, Clock3, Flame, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_STYLES } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import type { ServiceDay } from "@/lib/service-days";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  formatDateByLocale,
  formatDateTimeByLocale,
  formatTimeByLocale
} from "@/lib/utils";

type KitchenOrder = {
  id: string;
  status: "new" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
  guest_name: string | null;
  notes: string | null;
  created_at: string;
  restaurant_tables:
    | {
        name: string;
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

type KitchenLabels = {
  title: string;
  subtitle: string;
  noServiceDay: string;
  noOrders: string;
  newOrders: string;
  acceptedOrders: string;
  preparingOrders: string;
  readyOrders: string;
  items: string;
  guestNotes: string;
  allergyNotes: string;
  accept: string;
  startCooking: string;
  markReady: string;
  waitingForService: string;
  fresh: string;
  tableFallback: string;
  createdAt: string;
  guest: string;
  kitchenLoad: string;
  inQueue: string;
  inPrep: string;
  newestOrder: string;
};

function isFresh(createdAt: string, withinMinutes = 8) {
  return Date.now() - new Date(createdAt).getTime() <= withinMinutes * 60 * 1000;
}

function minutesSince(createdAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
}

export function KitchenBoard({
  restaurantId,
  initialOrders,
  initialServiceDay,
  locale,
  labels
}: {
  restaurantId: string;
  initialOrders: KitchenOrder[];
  initialServiceDay: ServiceDay | null;
  locale: Locale;
  labels: KitchenLabels;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [currentServiceDay, setCurrentServiceDay] = useState<ServiceDay | null>(initialServiceDay);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const lastSeenRef = useRef<string | null>(initialOrders[0]?.created_at ?? null);

  const kitchenOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["new", "accepted", "preparing", "ready"].includes(order.status)
      ),
    [orders]
  );

  const columns = useMemo(
    () => [
      {
        key: "new" as const,
        title: labels.newOrders,
        orders: kitchenOrders.filter((order) => order.status === "new")
      },
      {
        key: "accepted" as const,
        title: labels.acceptedOrders,
        orders: kitchenOrders.filter((order) => order.status === "accepted")
      },
      {
        key: "preparing" as const,
        title: labels.preparingOrders,
        orders: kitchenOrders.filter((order) => order.status === "preparing")
      },
      {
        key: "ready" as const,
        title: labels.readyOrders,
        orders: kitchenOrders.filter((order) => order.status === "ready")
      }
    ],
    [kitchenOrders, labels]
  );

  const newestOrder = kitchenOrders[0] ?? null;
  const queuedCount = columns[0].orders.length + columns[1].orders.length;
  const preparingCount = columns[2].orders.length;
  const readyCount = columns[3].orders.length;

  async function refreshSnapshot() {
    const response = await fetch("/api/staff-snapshot", { cache: "no-store" });
    const payload = await response.json();
    const nextOrders = (payload.orders ?? []) as KitchenOrder[];
    const nextServiceDay = (payload.currentServiceDay ?? null) as ServiceDay | null;

    lastSeenRef.current = nextOrders[0]?.created_at ?? null;
    setOrders(nextOrders);
    setCurrentServiceDay(nextServiceDay);
  }

  useEffect(() => {
    if (!supabase) return;

    const ordersChannel = supabase
      .channel(`kitchen-orders:${restaurantId}`)
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

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [restaurantId, supabase]);

  async function updateOrder(orderId: string, status: KitchenOrder["status"]) {
    setPendingOrderId(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      await refreshSnapshot();
    } finally {
      setPendingOrderId(null);
    }
  }

  function renderAction(order: KitchenOrder) {
    if (order.status === "new") {
      return (
        <Button
          className="w-full rounded-2xl"
          onClick={() => updateOrder(order.id, "accepted")}
          disabled={pendingOrderId === order.id}
        >
          {labels.accept}
        </Button>
      );
    }

    if (order.status === "accepted") {
      return (
        <Button
          className="w-full rounded-2xl"
          onClick={() => updateOrder(order.id, "preparing")}
          disabled={pendingOrderId === order.id}
        >
          {labels.startCooking}
        </Button>
      );
    }

    if (order.status === "preparing") {
      return (
        <Button
          className="w-full rounded-2xl"
          onClick={() => updateOrder(order.id, "ready")}
          disabled={pendingOrderId === order.id}
        >
          {labels.markReady}
        </Button>
      );
    }

    return (
      <div className="rounded-[1.35rem] border border-dashed border-line/80 bg-stone-50 px-4 py-3 text-sm text-stone-500">
        {labels.waitingForService}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.7fr]">
        <article className="surface p-5">
          <p className="text-sm font-semibold text-warm-500">{labels.title}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{labels.subtitle}</h2>
          <p className="mt-2 text-sm text-stone-500">
            {currentServiceDay
              ? `${formatDateByLocale(currentServiceDay.service_date, locale)} · ${labels.kitchenLoad}`
              : labels.noServiceDay}
          </p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-stone-500">{labels.inQueue}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{queuedCount}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-stone-500">{labels.inPrep}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{preparingCount}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-stone-500">{labels.readyOrders}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{readyCount}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-stone-500">{labels.newestOrder}</p>
          <p className="mt-2 text-base font-semibold text-ink">
            {newestOrder ? formatTimeByLocale(newestOrder.created_at, locale) : "-"}
          </p>
        </article>
      </section>

      {!currentServiceDay ? (
        <section className="surface flex min-h-[220px] items-center justify-center p-8 text-center text-stone-500">
          {labels.noServiceDay}
        </section>
      ) : null}

      {currentServiceDay ? (
        <section className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <article key={column.key} className="surface min-h-[480px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{column.title}</h3>
                  <p className="mt-1 text-sm text-stone-500">{column.orders.length}건</p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
                  {column.orders.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.orders.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-line/70 px-4 py-12 text-center text-sm text-stone-400">
                    {labels.noOrders}
                  </div>
                ) : null}

                {column.orders.map((order) => {
                  const isNewlyArrived = isFresh(order.created_at);
                  const allergyNotes = order.order_items
                    .map((item) => item.allergy_note?.trim())
                    .filter(Boolean) as string[];
                  const itemNotes = order.order_items
                    .map((item) => item.item_note?.trim())
                    .filter(Boolean) as string[];

                  return (
                    <div
                      key={order.id}
                      className="rounded-[1.6rem] border border-line bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warm-500">
                            {order.restaurant_tables?.name ?? labels.tableFallback}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge className={ORDER_STATUS_STYLES[order.status]}>
                              {order.status}
                            </Badge>
                            {isNewlyArrived ? (
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                {labels.fresh}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-ink">{minutesSince(order.created_at)}m</p>
                          <p className="mt-1 text-xs text-stone-400">{labels.createdAt}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.35rem] bg-stone-50/90 px-3 py-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                          <ReceiptText className="h-3.5 w-3.5" />
                          {labels.items}
                        </div>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-3 text-sm text-ink">
                              <div>
                                <p className="font-medium">
                                  {item.quantity}x {item.name_snapshot}
                                  {item.variant_name_snapshot ? ` · ${item.variant_name_snapshot}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.notes ? (
                        <div className="mt-3 rounded-[1.25rem] border border-line/70 bg-white px-3 py-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {labels.guestNotes}
                          </div>
                          <p className="mt-2 text-sm text-ink">{order.notes}</p>
                        </div>
                      ) : null}

                      {allergyNotes.length > 0 ? (
                        <div className="mt-3 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-3 py-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">
                            <Flame className="h-3.5 w-3.5" />
                            {labels.allergyNotes}
                          </div>
                          <ul className="mt-2 space-y-1 text-sm text-rose-900">
                            {allergyNotes.map((note, index) => (
                              <li key={`${order.id}-allergy-${index}`}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {itemNotes.length > 0 ? (
                        <div className="mt-3 rounded-[1.25rem] border border-line/70 bg-white px-3 py-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                            <ChefHat className="h-3.5 w-3.5" />
                            {labels.guestNotes}
                          </div>
                          <ul className="mt-2 space-y-1 text-sm text-ink">
                            {itemNotes.map((note, index) => (
                              <li key={`${order.id}-note-${index}`}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {order.guest_name ? (
                        <p className="mt-3 text-xs text-stone-500">
                          {labels.guest} · {order.guest_name}
                        </p>
                      ) : null}

                      <div className="mt-4">{renderAction(order)}</div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
