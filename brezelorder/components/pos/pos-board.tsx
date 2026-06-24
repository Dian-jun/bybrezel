"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, CircleAlert, Info, Minus, Plus, Receipt, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { TableSession } from "@/lib/table-sessions";
import { cn, formatDateTimeByLocale, formatEuro, formatTimeByLocale } from "@/lib/utils";

const GRID_SIZE = 72;
const MIN_POS_CARD_WIDTH = 168;
const MIN_POS_CARD_HEIGHT = 156;

type PosOrder = {
  id: string;
  status: "new" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
  guest_name: string | null;
  guest_token?: string | null;
  notes: string | null;
  created_at: string;
  table_session_id?: string | null;
  restaurant_tables?: { name?: string | null } | null;
  order_items: Array<{
    id: string;
    name_snapshot: string;
    variant_name_snapshot?: string | null;
    price_cents_snapshot: number;
    quantity: number;
  }>;
};

type PosCall = {
  id: string;
  call_type: "call_staff" | "request_bill" | "request_water" | "need_help";
  status: "open" | "completed";
  created_at: string;
  message: string | null;
  table_session_id?: string | null;
};

type PosSession = TableSession & {
  restaurant_tables:
    | {
        name: string;
        assigned_membership?: {
          users?: { full_name?: string | null; email?: string | null } | null;
        } | null;
      }
    | null;
};

type PosCategory = {
  id: string;
  name: string;
  name_ko?: string | null;
  menu_items: Array<{
    id: string;
    name: string;
    name_ko?: string | null;
    description?: string | null;
    description_ko?: string | null;
    price_cents: number;
    is_available: boolean;
    menu_item_variants?: Array<{
      id: string;
      name: string;
      name_ko?: string | null;
      price_cents: number;
      sort_order: number;
    }>;
  }>;
};

type PosTable = {
  id: string;
  name: string;
  pos_x: number;
  pos_y: number;
  pos_w: number;
  pos_h: number;
  pos_rotation?: number | null;
  assigned_membership?: {
    users?: { full_name?: string | null; email?: string | null } | null;
  } | null;
};

type Labels = {
  boardEyebrow: string;
  liveNow: string;
  noSessions: string;
  checkoutRequested: string;
  openSession: string;
  paid: string;
  orderRounds: string;
  openCalls: string;
  total: string;
  lastActivity: string;
  assignedStaff: string;
  unassigned: string;
  sessionDetail: string;
  ordersTitle: string;
  callsTitle: string;
  emptyOrders: string;
  emptyCalls: string;
  markPaid: string;
  closeSession: string;
  processing: string;
  newOrder: string;
  readyOrder: string;
  requestBill: string;
  itemCount: string;
  guestNote: string;
  tableFallback: string;
  manualOrder: string;
  manualOrderDescription: string;
  manualDraftEmpty: string;
  manualCategory: string;
  manualItem: string;
  manualVariant: string;
  manualQuantity: string;
  manualGuestName: string;
  manualGuestEmail: string;
  manualNotes: string;
  manualItemNote: string;
  manualAllergyNote: string;
  manualAddLine: string;
  manualSubmit: string;
  manualSubmitting: string;
  manualSaved: string;
  manualSourceTag: string;
  manualSelectPrompt: string;
  manualTableHint: string;
  manualNoVariant: string;
  manualFavorites: string;
  manualQuickQuantity: string;
  manualCurrentSelection: string;
  manualDraftTitle: string;
  manualQuickAdd: string;
  manualShowDetails: string;
  manualHideDetails: string;
  requestLabels: Record<PosCall["call_type"], string>;
  emptyTable: string;
  activeTable: string;
  layoutHint: string;
};

type ManualDraftItem = {
  key: string;
  menuItemId: string;
  variantId: string | null;
  quantity: number;
  itemNote: string | null;
  allergyNote: string | null;
};

function getAssignedStaffName(session: PosSession, labels: Labels) {
  return (
    session.restaurant_tables?.assigned_membership?.users?.full_name ??
    session.restaurant_tables?.assigned_membership?.users?.email ??
    labels.unassigned
  );
}

function isFresh(date?: string | null, minutes = 8) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < minutes * 60 * 1000;
}

export function PosBoard({
  locale,
  initialTables,
  initialCategories,
  initialOrders,
  initialCalls,
  initialTableSessions,
  floorplanImageUrl,
  restaurantId,
  labels
}: {
  locale: Locale;
  initialTables: PosTable[];
  initialCategories: PosCategory[];
  initialOrders: PosOrder[];
  initialCalls: PosCall[];
  initialTableSessions: PosSession[];
  floorplanImageUrl?: string | null;
  restaurantId: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [calls, setCalls] = useState(initialCalls);
  const [sessions, setSessions] = useState(initialTableSessions);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    initialTableSessions.find((session) => session.status === "checkout_requested")?.table_id ??
      initialTableSessions[0]?.table_id ??
      initialTables[0]?.id ??
      null
  );
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"paid" | "close" | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const [manualMessage, setManualMessage] = useState<string | null>(null);
  const [manualCategoryId, setManualCategoryId] = useState(initialCategories[0]?.id ?? "");
  const [manualMenuItemId, setManualMenuItemId] = useState("");
  const [manualVariantId, setManualVariantId] = useState<string>("");
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualGuestName, setManualGuestName] = useState("");
  const [manualGuestEmail, setManualGuestEmail] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualItemNote, setManualItemNote] = useState("");
  const [manualAllergyNote, setManualAllergyNote] = useState("");
  const [manualDetailsOpen, setManualDetailsOpen] = useState(false);
  const [manualDraftItems, setManualDraftItems] = useState<ManualDraftItem[]>([]);

  useEffect(() => {
    if (!initialTables.length) {
      setSelectedTableId(null);
      return;
    }

    setSelectedTableId((current) => {
      if (current && initialTables.some((table) => table.id === current)) return current;
      return (
        sessions.find((session) => session.status === "checkout_requested")?.table_id ??
        sessions[0]?.table_id ??
        initialTables[0]?.id ??
        null
      );
    });
  }, [initialTables, sessions]);

  useEffect(() => {
    if (!manualCategoryId && initialCategories[0]?.id) {
      setManualCategoryId(initialCategories[0].id);
    }
  }, [initialCategories, manualCategoryId]);

  useEffect(() => {
    const category = initialCategories.find((item) => item.id === manualCategoryId) ?? initialCategories[0];
    const firstItem = category?.menu_items.find((item) => item.is_available) ?? category?.menu_items[0];

    if (!category) return;
    if (category.id !== manualCategoryId) {
      setManualCategoryId(category.id);
      return;
    }

    if (!manualMenuItemId || !category.menu_items.some((item) => item.id === manualMenuItemId)) {
      setManualMenuItemId(firstItem?.id ?? "");
      setManualVariantId(firstItem?.menu_item_variants?.[0]?.id ?? "");
    }
  }, [initialCategories, manualCategoryId, manualMenuItemId]);

  useEffect(() => {
    const selectedItem = initialCategories
      .flatMap((category) => category.menu_items)
      .find((item) => item.id === manualMenuItemId);

    if (!selectedItem) return;

    if (selectedItem.menu_item_variants?.length) {
      if (!selectedItem.menu_item_variants.some((variant) => variant.id === manualVariantId)) {
        setManualVariantId(selectedItem.menu_item_variants[0]?.id ?? "");
      }
    } else if (manualVariantId) {
      setManualVariantId("");
    }
  }, [initialCategories, manualMenuItemId, manualVariantId]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    async function refreshSnapshot() {
      const response = await fetch("/api/staff-snapshot", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setOrders(data.orders ?? []);
      setCalls(data.calls ?? []);
      setSessions(data.tableSessions ?? []);
    }

    const interval = window.setInterval(refreshSnapshot, 10000);

    const channel = supabase
      .channel("pos-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        refreshSnapshot
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_calls" },
        refreshSnapshot
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "table_sessions" },
        refreshSnapshot
      )
      .subscribe();

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const sessionSummaries = useMemo(() => {
    return sessions
      .map((session) => {
        const sessionOrders = orders.filter((order) => order.table_session_id === session.id);
        const sessionCalls = calls.filter((call) => call.table_session_id === session.id);
        const totalCents = sessionOrders.reduce(
          (sum, order) =>
            sum +
            order.order_items.reduce(
              (itemSum, item) => itemSum + item.price_cents_snapshot * item.quantity,
              0
            ),
          0
        );
        const itemCount = sessionOrders.reduce(
          (sum, order) =>
            sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0
        );
        const openCalls = sessionCalls.filter((call) => call.status === "open");
        const lastActivityCandidates = [
          session.opened_at,
          session.checkout_requested_at,
          ...sessionOrders.map((order) => order.created_at),
          ...sessionCalls.map((call) => call.created_at)
        ].filter(Boolean) as string[];
        const lastActivity = lastActivityCandidates.sort().at(-1) ?? session.opened_at;
        const hasNewOrder = sessionOrders.some(
          (order) => order.status === "new" && isFresh(order.created_at)
        );
        const hasReadyOrder = sessionOrders.some((order) => order.status === "ready");

        return {
          session,
          orders: sessionOrders,
          calls: sessionCalls,
          totalCents,
          itemCount,
          openCalls,
          lastActivity,
          hasNewOrder,
          hasReadyOrder
        };
      })
      .sort((a, b) => {
        if (a.session.status === "checkout_requested" && b.session.status !== "checkout_requested") {
          return -1;
        }
        if (a.session.status !== "checkout_requested" && b.session.status === "checkout_requested") {
          return 1;
        }
        if (a.hasReadyOrder && !b.hasReadyOrder) return -1;
        if (!a.hasReadyOrder && b.hasReadyOrder) return 1;
        if (a.hasNewOrder && !b.hasNewOrder) return -1;
        if (!a.hasNewOrder && b.hasNewOrder) return 1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });
  }, [calls, orders, sessions]);

  const tableMapItems = useMemo(() => {
    const sessionMap = new Map(
      sessionSummaries.map((summary) => [summary.session.table_id, summary])
    );

    return initialTables
      .map((table, index) => {
        const summary = sessionMap.get(table.id) ?? null;
        return {
          table,
          summary,
          posX: table.pos_x ?? (index % 4) * 3,
          posY: table.pos_y ?? Math.floor(index / 4) * 3,
          posW: table.pos_w ?? 2,
          posH: table.pos_h ?? 2,
          posRotation: table.pos_rotation ?? 0,
          renderWidth: Math.max((table.pos_w ?? 2) * GRID_SIZE, MIN_POS_CARD_WIDTH),
          renderHeight: Math.max((table.pos_h ?? 2) * GRID_SIZE, MIN_POS_CARD_HEIGHT)
        };
      })
      .sort((a, b) => a.posY - b.posY || a.posX - b.posX);
  }, [initialTables, sessionSummaries]);

  const boardWidth = Math.max(
    12,
    ...tableMapItems.map((item) => item.posX + item.posW + 1)
  );
  const boardHeight = Math.max(
    8,
    ...tableMapItems.map((item) => item.posY + item.posH + 1)
  );
  const boardPixelWidth = Math.max(
    boardWidth * GRID_SIZE,
    ...tableMapItems.map((item) => item.posX * GRID_SIZE + item.renderWidth + GRID_SIZE)
  );
  const boardPixelHeight = Math.max(
    boardHeight * GRID_SIZE,
    ...tableMapItems.map((item) => item.posY * GRID_SIZE + item.renderHeight + GRID_SIZE)
  );

  const selectedTable =
    initialTables.find((table) => table.id === selectedTableId) ?? initialTables[0] ?? null;
  const selectedSummary =
    sessionSummaries.find((summary) => summary.session.table_id === selectedTableId) ?? null;
  const hoveredMapItem = tableMapItems.find((item) => item.table.id === hoveredTableId) ?? null;
  const previewItem =
    hoveredMapItem ??
    tableMapItems.find((item) => item.table.id === selectedTableId) ??
    null;
  const previewSummary = previewItem?.summary ?? null;

  const manualCategory =
    initialCategories.find((category) => category.id === manualCategoryId) ?? initialCategories[0] ?? null;
  const manualAvailableItems = (manualCategory?.menu_items ?? []).filter((item) => item.is_available);
  const manualSelectedItem =
    manualAvailableItems.find((item) => item.id === manualMenuItemId) ??
    manualCategory?.menu_items.find((item) => item.id === manualMenuItemId) ??
    null;
  const manualSelectedVariant =
    manualSelectedItem?.menu_item_variants?.find((variant) => variant.id === manualVariantId) ?? null;
  const favoriteManualItems = useMemo(() => {
    const orderFrequency = new Map<string, number>();

    for (const order of orders) {
      for (const item of order.order_items) {
        orderFrequency.set(
          item.name_snapshot,
          (orderFrequency.get(item.name_snapshot) ?? 0) + item.quantity
        );
      }
    }

    return initialCategories
      .flatMap((category) =>
        category.menu_items
          .filter((item) => item.is_available)
          .map((item) => ({
            ...item,
            categoryId: category.id,
            score: orderFrequency.get(item.name) ?? orderFrequency.get(item.name_ko ?? "") ?? 0
          }))
      )
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [initialCategories, orders]);

  function getItemLabel(item: { name: string; name_ko?: string | null }) {
    if (locale === "ko" && item.name_ko) return item.name_ko;
    return item.name;
  }

  function getItemPriceCents(item: PosCategory["menu_items"][number], variantId?: string | null) {
    const variant = item.menu_item_variants?.find((entry) => entry.id === variantId) ?? null;
    return variant?.price_cents ?? item.price_cents;
  }

  function resetManualInputs() {
    setManualQuantity(1);
    setManualItemNote("");
    setManualAllergyNote("");
  }

  function getDraftLabel(item: ManualDraftItem) {
    const menuItem = initialCategories
      .flatMap((category) => category.menu_items)
      .find((menuItem) => menuItem.id === item.menuItemId);
    if (!menuItem) return labels.tableFallback;
    const variant = menuItem.menu_item_variants?.find((entry) => entry.id === item.variantId) ?? null;
    return `${getItemLabel(menuItem)}${variant ? ` · ${getItemLabel(variant)}` : ""}`;
  }

  function getDraftLineTotal(item: ManualDraftItem) {
    const menuItem = initialCategories
      .flatMap((category) => category.menu_items)
      .find((menuItem) => menuItem.id === item.menuItemId);
    if (!menuItem) return 0;
    const variant = menuItem.menu_item_variants?.find((entry) => entry.id === item.variantId) ?? null;
    return (variant?.price_cents ?? menuItem.price_cents) * item.quantity;
  }

  function selectManualItem(categoryId: string, menuItemId: string) {
    const category = initialCategories.find((entry) => entry.id === categoryId);
    const item = category?.menu_items.find((entry) => entry.id === menuItemId);
    setManualCategoryId(categoryId);
    setManualMenuItemId(menuItemId);
    setManualVariantId(item?.menu_item_variants?.[0]?.id ?? "");
    setManualMessage(null);
  }

  function addManualDraftItem(config?: {
    menuItemId?: string;
    quantity?: number;
    variantId?: string | null;
    itemNote?: string | null;
    allergyNote?: string | null;
  }) {
    const targetMenuItemId = config?.menuItemId ?? manualMenuItemId;
    const menuItem = initialCategories
      .flatMap((category) => category.menu_items)
      .find((entry) => entry.id === targetMenuItemId);

    if (!menuItem) {
      setManualMessage(labels.manualSelectPrompt);
      return;
    }

    const nextVariantId =
      config?.variantId !== undefined
        ? config.variantId
        : manualVariantId || menuItem.menu_item_variants?.[0]?.id || null;

    const nextItem: ManualDraftItem = {
      key: `${menuItem.id}:${nextVariantId || "base"}:${Date.now()}`,
      menuItemId: menuItem.id,
      variantId: nextVariantId,
      quantity: Math.max(1, config?.quantity ?? manualQuantity),
      itemNote: config?.itemNote ?? (manualItemNote.trim() || null),
      allergyNote: config?.allergyNote ?? (manualAllergyNote.trim() || null)
    };

    setManualDraftItems((current) => [...current, nextItem]);
    setManualMessage(null);
    resetManualInputs();
  }

  function updateManualDraftItemQuantity(key: string, delta: number) {
    setManualDraftItems((current) =>
      current.flatMap((item) => {
        if (item.key !== key) return [item];

        const nextQuantity = item.quantity + delta;
        if (nextQuantity <= 0) return [];

        return [{ ...item, quantity: nextQuantity }];
      })
    );
  }

  function removeManualDraftItem(key: string) {
    setManualDraftItems((current) => current.filter((item) => item.key !== key));
  }

  const manualDraftTotalCents = manualDraftItems.reduce(
    (total, item) => total + getDraftLineTotal(item),
    0
  );

  async function submitManualOrder() {
    if (!selectedTable || manualDraftItems.length === 0) {
      setManualMessage(labels.manualDraftEmpty);
      return;
    }

    setManualBusy(true);
    setManualMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          tableId: selectedTable.id,
          guestName: manualGuestName.trim() || null,
          guestEmail: manualGuestEmail.trim() || null,
          notes: manualNotes.trim() || null,
          items: manualDraftItems.map((item) => ({
            menuItemId: item.menuItemId,
            variantId: item.variantId,
            quantity: item.quantity,
            itemNote: item.itemNote,
            allergyNote: item.allergyNote
          }))
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setManualMessage(payload.error ?? labels.manualSelectPrompt);
        return;
      }

      setManualDraftItems([]);
      setManualGuestName("");
      setManualGuestEmail("");
      setManualNotes("");
      resetManualInputs();
      setManualMessage(labels.manualSaved);
      setManualOpen(false);
      router.refresh();
    } finally {
      setManualBusy(false);
    }
  }

  async function handleSessionAction(action: "paid" | "close") {
    if (!selectedSummary) return;

    setPendingAction(action);
    const response = await fetch(`/api/table-sessions/${selectedSummary.session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    setPendingAction(null);

    if (!response.ok) return;

    const nextSessions = sessions.filter(
      (session) => session.id !== selectedSummary.session.id
    );
    setSessions(nextSessions);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {tableMapItems.length ? (
        <div
          className={cn(
            "grid gap-5",
            selectedSummary ? "xl:grid-cols-[minmax(0,1.35fr)_380px]" : "xl:grid-cols-1"
          )}
        >
          <section className="relative overflow-hidden rounded-[1.6rem] border border-[#dbe7ff] bg-[linear-gradient(180deg,#f8fbff,#f2f7ff)] p-4 shadow-[0_18px_40px_rgba(148,163,184,0.08)] md:p-5">
            <div className="pointer-events-none absolute right-6 top-6 z-10 flex items-center gap-2">
              <div className="pointer-events-auto group relative">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7ff] bg-white/90 text-stone-500 shadow-[0_10px_24px_rgba(148,163,184,0.08)] transition hover:text-ink"
                  aria-label={locale === "ko" ? "배치 안내" : "Layout-Hinweis"}
                >
                  <Info className="h-4 w-4" />
                </button>
                <div className="pointer-events-none absolute right-0 top-14 w-72 rounded-[1.25rem] border border-[#dbe7ff] bg-white/96 p-3 text-left text-xs leading-5 text-stone-600 opacity-0 shadow-[0_18px_40px_rgba(148,163,184,0.14)] transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {labels.layoutHint}
                </div>
              </div>
              <div className="rounded-full border border-[#dbe7ff] bg-white/92 px-4 py-2 text-sm font-medium text-stone-600 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                {sessionSummaries.length}{" "}
                {locale === "ko" ? "개 테이블 세션 진행 중" : "aktive Tischrunden"}
              </div>
            </div>
            <div className="overflow-auto rounded-[1.5rem]">
              <div
                className="relative min-h-[620px] min-w-full rounded-[1.4rem] p-4 pt-24 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.12)]"
                style={{
                  width: Math.max(boardPixelWidth, 720),
                  height: Math.max(boardPixelHeight, 620),
                  backgroundColor: floorplanImageUrl ? "#334155" : "#dbeafe",
                  backgroundImage: floorplanImageUrl
                    ? `linear-gradient(rgba(15,23,42,0.16), rgba(15,23,42,0.26)), url(${floorplanImageUrl})`
                    : undefined,
                  backgroundSize: floorplanImageUrl ? "cover" : undefined,
                  backgroundPosition: floorplanImageUrl ? "center" : undefined
                }}
              >
                {!floorplanImageUrl ? (
                  <>
                    <div className="absolute inset-0 rounded-[1.4rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.46),_transparent_42%)]" />
                  </>
                ) : (
                  <div className="absolute inset-0 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.2))]" />
                )}

                {tableMapItems.map(({ table, summary, posX, posY, posW, posH, renderWidth, renderHeight }) => {
                  const isSelected = summary?.session.id === selectedSummary?.session.id;
                  const tableLabel = table.name ?? labels.tableFallback;
                  const isActive = Boolean(summary);
                  const isHovered = hoveredTableId === table.id;
                  const isCheckoutRequested = summary?.session.status === "checkout_requested";
                  const hasFreshOrder = Boolean(summary?.hasNewOrder);
                  const hasReadyOrder = Boolean(summary?.hasReadyOrder);

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTableId(table.id)}
                      onMouseEnter={() => setHoveredTableId(table.id)}
                      onMouseLeave={() => setHoveredTableId((current) => (current === table.id ? null : current))}
                      onFocus={() => setHoveredTableId(table.id)}
                      onBlur={() => setHoveredTableId((current) => (current === table.id ? null : current))}
                      className={cn(
                        "absolute overflow-hidden rounded-[1.5rem] border text-left transition duration-200",
                        isCheckoutRequested
                          ? "animate-pos-checkout-glow border-[#f59e0b] bg-[linear-gradient(180deg,#fff8eb,#fff1d6)] text-[#7c2d12]"
                          : isActive
                            ? hasFreshOrder
                              ? "animate-pos-order-pulse border-[#2563eb] bg-[linear-gradient(180deg,#2f6df6,#2557d6)] text-white"
                              : "border-[#285ee8] bg-[linear-gradient(180deg,#285ee8,#214dbf)] text-white shadow-[0_18px_40px_rgba(40,94,232,0.2)]"
                            : "border-[#8ec5ff] bg-white/96 text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.08)]",
                        (isSelected || isHovered) && "ring-4 ring-[rgba(251,191,36,0.45)]",
                        !summary && "hover:border-[#60a5fa] hover:bg-white"
                      )}
                      style={{
                        left: posX * GRID_SIZE,
                        top: posY * GRID_SIZE,
                        width: renderWidth,
                        height: renderHeight,
                        zIndex: isSelected || isHovered ? 20 : summary ? 10 : 1
                      }}
                    >
                      <div className="flex h-full flex-col justify-between p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              "text-sm font-semibold",
                              isCheckoutRequested
                                ? "text-[#b45309]"
                                : isActive
                                  ? "text-white/92"
                                  : "text-sky-700"
                            )}>
                              {tableLabel}
                            </p>
                            <p className={cn(
                              "mt-1 text-[11px] font-medium uppercase tracking-[0.12em]",
                              isCheckoutRequested
                                ? "text-[#c2410c]/70"
                                : isActive
                                  ? "text-white/62"
                                  : "text-slate-400"
                            )}>
                              {isActive ? labels.activeTable : labels.emptyTable}
                            </p>
                          </div>
                          {summary ? (
                            <span
                              className={cn(
                                "mt-1 inline-flex h-2.5 w-2.5 rounded-full",
                                isCheckoutRequested
                                  ? "bg-amber-300"
                                  : hasFreshOrder
                                    ? "bg-[#93c5fd]"
                                    : "bg-white/70"
                              )}
                            />
                          ) : null}
                        </div>

                        {summary ? (
                          <div className="space-y-2">
                            <p className="text-[2rem] font-semibold leading-none tracking-tight">
                              {formatEuro(summary.totalCents)}
                            </p>
                            <div className={cn(
                              "flex flex-wrap items-center gap-2 text-[11px] font-medium",
                              isCheckoutRequested ? "text-[#9a3412]/75" : "text-white/74"
                            )}>
                              <span>{summary.orders.length} {labels.orderRounds}</span>
                              <span className={cn("h-1 w-1 rounded-full", isCheckoutRequested ? "bg-[#fb923c]/60" : "bg-white/55")} />
                              <span>{summary.itemCount} {labels.itemCount}</span>
                            </div>
                            <div className="flex min-h-6 items-end">
                              {isCheckoutRequested ? (
                                <div className="inline-flex rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold text-[#c2410c] ring-1 ring-[#fdba74]">
                                  {labels.checkoutRequested}
                                </div>
                              ) : hasReadyOrder ? (
                                <div className="inline-flex rounded-full bg-[#e0e7ff] px-2.5 py-1 text-[11px] font-semibold text-[#4338ca] ring-1 ring-[#c7d2fe]">
                                  {labels.readyOrder}
                                </div>
                              ) : hasFreshOrder ? (
                                <div className="inline-flex rounded-full bg-[#dbeafe] px-2.5 py-1 text-[11px] font-semibold text-[#1d4ed8] ring-1 ring-[#93c5fd]">
                                  {labels.newOrder}
                                </div>
                              ) : (
                                <div className={cn("text-[11px]", isCheckoutRequested ? "text-[#9a3412]/68" : "text-white/68")}>
                                  {formatTimeByLocale(summary.lastActivity, locale)}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-col justify-end gap-1 text-slate-400">
                            <p className="text-sm font-medium">{locale === "ko" ? "대기 중" : "Leer"}</p>
                            <p className="text-[11px] leading-snug">
                              {locale === "ko"
                                ? "주문이 들어오면 이 위치가 활성화됩니다."
                                : "Wird aktiv, sobald Bestellungen eingehen."}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {previewItem && (previewSummary || hoveredTableId) ? (
                  <div className="pointer-events-none absolute bottom-5 left-5 z-30 w-[320px] max-w-[calc(100%-2.5rem)] rounded-[1.6rem] border border-white/45 bg-white/88 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-warm-500">
                          {previewItem.table.name ?? labels.tableFallback}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-ink">
                          {previewSummary ? labels.sessionDetail : labels.emptyTable}
                        </h3>
                      </div>
                      {previewSummary ? (
                        <div className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                          {formatEuro(previewSummary.totalCents)}
                        </div>
                      ) : null}
                    </div>

                    {previewSummary ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-2xl bg-stone-100 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">
                            {labels.orderRounds}
                          </p>
                          <p className="mt-1 text-base font-semibold text-ink">
                            {previewSummary.orders.length}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-stone-100 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">
                            {labels.itemCount}
                          </p>
                          <p className="mt-1 text-base font-semibold text-ink">
                            {previewSummary.itemCount}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-stone-100 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">
                            {labels.openCalls}
                          </p>
                          <p className="mt-1 text-base font-semibold text-ink">
                            {previewSummary.openCalls.length}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-stone-100 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">
                            {labels.assignedStaff}
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold text-ink">
                            {getAssignedStaffName(previewSummary.session, labels)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-relaxed text-stone-500">
                        {locale === "ko"
                          ? "이 테이블은 아직 비어 있습니다. 주문이 들어오면 이 자리 카드가 자동으로 활성화됩니다."
                          : "Dieser Tisch ist aktuell leer. Sobald eine Bestellung eingeht, wird diese Karte automatisch aktiv."}
                      </p>
                    )}

                    {previewSummary ? (
                      <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
                        <span>{labels.lastActivity}</span>
                        <span>{formatDateTimeByLocale(previewSummary.lastActivity, locale)}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {selectedTable ? (
            <aside className="ops-detail-panel h-fit rounded-[1.8rem] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] xl:sticky xl:top-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#f0b36f]">
                      {selectedTable.name ?? labels.tableFallback}
                    </p>
                    <h3 className="mt-1.5 text-[1.65rem] font-semibold tracking-tight">{labels.sessionDetail}</h3>
                  </div>
                  {selectedSummary?.session.status === "checkout_requested" ? (
                    <Badge className="border-0 bg-[#3b2a12] text-[#ffd08a] ring-1 ring-[#6e4b17]">
                      {labels.requestBill}
                    </Badge>
                  ) : selectedSummary?.hasReadyOrder ? (
                    <Badge className="border-0 bg-[#1f2457] text-[#dbe4ff] ring-1 ring-[#4f5fc7]">
                      {labels.readyOrder}
                    </Badge>
                  ) : selectedSummary?.hasNewOrder ? (
                    <Badge className="border-0 bg-[#1c3268] text-[#d8e5ff] ring-1 ring-[#3659a8]">
                      {labels.newOrder}
                    </Badge>
                  ) : null}
                </div>

                  <div className="ops-detail-card overflow-hidden rounded-[1.4rem]">
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="ops-detail-muted text-[10px] uppercase tracking-[0.16em]">
                        {labels.total}
                      </p>
                      <p className="text-[1.75rem] font-semibold tracking-tight">
                        {formatEuro(selectedSummary?.totalCents ?? 0)}
                      </p>
                    </div>
                    <div className="border-t border-[var(--ops-panel-card-border)] px-4 py-3">
                      <p className="ops-detail-muted text-[10px] uppercase tracking-[0.16em]">
                        {labels.lastActivity}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedSummary
                          ? formatDateTimeByLocale(selectedSummary.lastActivity, locale)
                          : labels.manualTableHint}
                      </p>
                    </div>
                  </div>

                <div className="flex flex-col gap-2.5 sm:flex-row xl:flex-col">
                    <Button
                      fullWidth
                      onClick={() => handleSessionAction("paid")}
                      disabled={pendingAction !== null || !selectedSummary}
                      className={cn(
                        selectedSummary?.session.status === "checkout_requested"
                          ? "min-h-12 rounded-[1rem] bg-[#f59e0b] text-white hover:bg-[#d97706]"
                          : "min-h-12 rounded-[1rem] bg-ink text-white hover:bg-ink/90"
                      )}
                    >
                      {pendingAction === "paid" ? labels.processing : labels.markPaid}
                  </Button>
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={() => handleSessionAction("close")}
                      disabled={pendingAction !== null || !selectedSummary}
                      className="theme-button-secondary min-h-12 rounded-[1rem]"
                    >
                      {pendingAction === "close" ? labels.processing : labels.closeSession}
                    </Button>
                  </div>

                <div className="space-y-3 rounded-[1.35rem] border border-[var(--ops-panel-card-border)] bg-[var(--ops-panel-card)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{labels.manualOrder}</p>
                    <Button
                      type="button"
                      variant={manualOpen ? "secondary" : "primary"}
                      className="h-10 rounded-[0.95rem] px-4"
                      onClick={() => setManualOpen((current) => !current)}
                    >
                      {labels.manualOrder}
                    </Button>
                  </div>

                  {manualOpen ? (
                    <div className="space-y-3">
                      <div className="rounded-[1.2rem] border border-[var(--ops-panel-card-border)] bg-[rgba(255,255,255,0.03)] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{labels.manualQuickQuantity}</p>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setManualQuantity(value)}
                                className={cn(
                                  "flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition",
                                  manualQuantity === value
                                    ? "bg-[var(--ops-panel-text)] text-[var(--ops-panel-bg)]"
                                    : "border border-[var(--ops-panel-card-border)] bg-transparent text-[var(--ops-panel-text)] hover:bg-white/5"
                                )}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {favoriteManualItems.length ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{labels.manualFavorites}</p>
                            <span className="ops-detail-muted text-xs">{labels.manualQuickAdd}</span>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {favoriteManualItems.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  selectManualItem(item.categoryId, item.id);
                                  addManualDraftItem({
                                    menuItemId: item.id,
                                    variantId: item.menu_item_variants?.[0]?.id ?? null
                                  });
                                }}
                                className="rounded-[1.1rem] border border-[var(--ops-panel-card-border)] bg-transparent p-3 text-left transition hover:border-[#f0b36f] hover:bg-white/5"
                              >
                                <p className="truncate text-sm font-semibold">{getItemLabel(item)}</p>
                                <p className="mt-1 text-xs font-medium text-[#f0b36f]">
                                  {formatEuro(getItemPriceCents(item, item.menu_item_variants?.[0]?.id ?? null))}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <p className="text-sm font-semibold">{labels.manualCategory}</p>
                        <div className="flex flex-wrap gap-2">
                          {initialCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => setManualCategoryId(category.id)}
                              className={cn(
                                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                                manualCategoryId === category.id
                                  ? "bg-[var(--ops-panel-text)] text-[var(--ops-panel-bg)]"
                                  : "border border-[var(--ops-panel-card-border)] text-[var(--ops-panel-text)] hover:bg-white/5"
                              )}
                            >
                              {getItemLabel(category)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{labels.manualItem}</p>
                          <span className="ops-detail-muted text-xs">{labels.manualQuickAdd}</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {manualAvailableItems.map((item) => {
                            const isSelected = item.id === manualMenuItemId;
                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "rounded-[1.15rem] border p-3 transition",
                                  isSelected
                                    ? "border-[#f0b36f] bg-[rgba(240,179,111,0.08)]"
                                    : "border-[var(--ops-panel-card-border)] bg-transparent"
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <button
                                    type="button"
                                    className="min-w-0 flex-1 text-left"
                                    onClick={() => selectManualItem(manualCategoryId, item.id)}
                                  >
                                    <p className="truncate text-sm font-semibold">{getItemLabel(item)}</p>
                                    <p className="ops-detail-muted mt-1 line-clamp-2 text-xs">
                                      {locale === "ko" ? item.description_ko || item.description || "" : item.description || ""}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold">
                                      {formatEuro(getItemPriceCents(item, item.menu_item_variants?.[0]?.id ?? null))}
                                    </p>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addManualDraftItem({
                                        menuItemId: item.id,
                                        variantId: item.menu_item_variants?.[0]?.id ?? null
                                      })
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ops-panel-card-border)] text-[var(--ops-panel-text)] hover:border-[#f0b36f] hover:text-[#f0b36f]"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {manualSelectedItem ? (
                        <div className="rounded-[1.2rem] border border-[var(--ops-panel-card-border)] bg-[rgba(255,255,255,0.03)] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{labels.manualCurrentSelection}</p>
                              <p className="ops-detail-muted mt-1 text-xs">{getItemLabel(manualSelectedItem)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-semibold">
                                {formatEuro(
                                  manualSelectedVariant?.price_cents ?? manualSelectedItem.price_cents
                                )}
                              </p>
                              <p className="ops-detail-muted mt-1 text-xs">{labels.manualQuantity}: {manualQuantity}</p>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-3">
                            <label className="space-y-1.5 text-sm">
                              <span className="ops-detail-muted">{labels.manualVariant}</span>
                              <select
                                value={manualVariantId}
                                onChange={(event) => setManualVariantId(event.target.value)}
                                className="w-full rounded-2xl border border-[var(--ops-panel-card-border)] bg-transparent px-3 py-3 text-sm"
                              >
                                {manualSelectedItem.menu_item_variants?.length ? (
                                  manualSelectedItem.menu_item_variants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                      {getItemLabel(variant)} · {formatEuro(variant.price_cents)}
                                    </option>
                                  ))
                                ) : (
                                  <option value="">{labels.manualNoVariant}</option>
                                )}
                              </select>
                            </label>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--ops-panel-card-border)]"
                                onClick={() => setManualQuantity((current) => Math.max(1, current - 1))}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <div className="flex min-h-11 min-w-[4.25rem] items-center justify-center rounded-xl border border-[var(--ops-panel-card-border)] px-4 text-sm font-semibold">
                                {manualQuantity}
                              </div>
                              <button
                                type="button"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--ops-panel-card-border)]"
                                onClick={() => setManualQuantity((current) => current + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <Button
                                type="button"
                                className="ml-auto rounded-[0.95rem]"
                                onClick={() => addManualDraftItem()}
                              >
                                {labels.manualAddLine}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="rounded-[1.2rem] border border-[var(--ops-panel-card-border)] bg-[rgba(255,255,255,0.03)] p-3">
                        <button
                          type="button"
                          onClick={() => setManualDetailsOpen((current) => !current)}
                          className="flex w-full items-center justify-between text-left"
                        >
                          <div>
                            <p className="text-sm font-semibold">{labels.guestNote}</p>
                            <p className="ops-detail-muted mt-1 text-xs">
                              {manualDetailsOpen ? labels.manualNotes : labels.manualGuestEmail}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-[#f0b36f]">
                            {manualDetailsOpen ? labels.manualHideDetails : labels.manualShowDetails}
                          </span>
                        </button>

                        {manualDetailsOpen ? (
                          <div className="mt-3 grid gap-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              <Input
                                value={manualGuestName}
                                onChange={(event) => setManualGuestName(event.target.value)}
                                placeholder={labels.manualGuestName}
                                className="rounded-2xl border-[var(--ops-panel-card-border)] bg-transparent"
                              />
                              <Input
                                value={manualGuestEmail}
                                onChange={(event) => setManualGuestEmail(event.target.value)}
                                placeholder={labels.manualGuestEmail}
                                type="email"
                                className="rounded-2xl border-[var(--ops-panel-card-border)] bg-transparent"
                              />
                            </div>

                            <textarea
                              value={manualNotes}
                              onChange={(event) => setManualNotes(event.target.value)}
                              placeholder={labels.manualNotes}
                              className="min-h-[84px] w-full rounded-2xl border border-[var(--ops-panel-card-border)] bg-transparent px-3 py-3 text-sm"
                            />

                            <div className="grid gap-3 md:grid-cols-2">
                              <textarea
                                value={manualItemNote}
                                onChange={(event) => setManualItemNote(event.target.value)}
                                placeholder={labels.manualItemNote}
                                className="min-h-[88px] w-full rounded-2xl border border-[var(--ops-panel-card-border)] bg-transparent px-3 py-3 text-sm"
                              />
                              <textarea
                                value={manualAllergyNote}
                                onChange={(event) => setManualAllergyNote(event.target.value)}
                                placeholder={labels.manualAllergyNote}
                                className="min-h-[88px] w-full rounded-2xl border border-[var(--ops-panel-card-border)] bg-transparent px-3 py-3 text-sm"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {manualDraftItems.length ? (
                        <div className="space-y-2 rounded-[1.2rem] border border-[var(--ops-panel-card-border)] bg-[rgba(255,255,255,0.03)] p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">{labels.manualDraftTitle}</p>
                              <p className="ops-detail-muted mt-1 text-xs">
                                {manualDraftItems.length} {labels.itemCount}
                              </p>
                            </div>
                            <p className="text-base font-semibold">{formatEuro(manualDraftTotalCents)}</p>
                          </div>

                          {manualDraftItems.map((item) => (
                            <div
                              key={item.key}
                              className="rounded-2xl border border-[var(--ops-panel-card-border)] px-3 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium">{getDraftLabel(item)}</p>
                                  {(item.allergyNote || item.itemNote) ? (
                                    <div className="ops-detail-muted mt-1 space-y-1 text-xs">
                                      {item.allergyNote ? <p>{labels.manualAllergyNote}: {item.allergyNote}</p> : null}
                                      {item.itemNote ? <p>{labels.manualItemNote}: {item.itemNote}</p> : null}
                                    </div>
                                  ) : null}
                                </div>
                                <span className="text-sm font-semibold">{formatEuro(getDraftLineTotal(item))}</span>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ops-panel-card-border)]"
                                    onClick={() => updateManualDraftItemQuantity(item.key, -1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <div className="min-w-8 text-center text-sm font-semibold">{item.quantity}</div>
                                  <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ops-panel-card-border)]"
                                    onClick={() => updateManualDraftItemQuantity(item.key, 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ops-panel-card-border)] text-stone-500 transition hover:text-rose-500"
                                  onClick={() => removeManualDraftItem(item.key)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <Button
                            type="button"
                            className="w-full rounded-[0.95rem]"
                            disabled={manualBusy || manualDraftItems.length === 0}
                            onClick={submitManualOrder}
                          >
                            {manualBusy ? labels.manualSubmitting : labels.manualSubmit}
                          </Button>
                        </div>
                      ) : (
                        <div className="ops-detail-muted rounded-[1.2rem] border border-dashed border-[var(--ops-panel-card-border)] px-4 py-4 text-sm">
                          {labels.manualDraftEmpty}
                        </div>
                      )}

                      {manualMessage ? (
                        <div className="rounded-[1.15rem] border border-[var(--ops-panel-card-border)] bg-[rgba(255,255,255,0.03)] px-3 py-3 text-sm">
                          {manualMessage}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShoppingBag className="h-4 w-4 text-[#f0b36f]" />
                    {labels.ordersTitle}
                  </div>
                  {selectedSummary?.orders.length ? (
                    <div className="ops-detail-card overflow-hidden rounded-[1.3rem]">
                      {selectedSummary.orders.map((order, index) => (
                        <div
                          key={order.id}
                          className={cn(
                            "px-4 py-3.5",
                            index !== 0 && "border-t border-[var(--ops-panel-card-border)]"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">
                                  {order.guest_name || labels.tableFallback}
                                </p>
                                {!order.guest_token ? (
                                  <Badge className="border-0 bg-[rgba(240,179,111,0.16)] text-[#f0b36f] ring-1 ring-[rgba(240,179,111,0.22)]">
                                    {labels.manualSourceTag}
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="ops-detail-muted mt-1 text-sm">
                                {formatDateTimeByLocale(order.created_at, locale)}
                              </p>
                            </div>
                            {order.status === "ready" ? (
                              <Badge className="border-0 bg-[#1f2457] text-[#dbe4ff]">
                                {labels.readyOrder}
                              </Badge>
                            ) : order.status === "new" ? (
                              <Badge className="border-0 bg-[#2e4f95] text-[#e7efff]">
                                {labels.newOrder}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="ops-detail-muted mt-3 space-y-2 text-sm">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-start justify-between gap-3">
                                <div>
                                  <span className="font-medium text-[var(--ops-panel-text)]">{item.quantity}x </span>
                                  {item.name_snapshot}
                                  {item.variant_name_snapshot
                                    ? ` · ${item.variant_name_snapshot}`
                                    : ""}
                                </div>
                                <span className="ops-detail-muted whitespace-nowrap">
                                  {formatEuro(item.price_cents_snapshot * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {order.notes ? (
                            <div className="ops-detail-muted mt-3 border-t border-[var(--ops-panel-card-border)] pt-3 text-sm">
                              <span className="font-medium text-[var(--ops-panel-text)]">{labels.guestNote}: </span>
                              {order.notes}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ops-detail-muted rounded-[1.3rem] border border-dashed border-[var(--ops-panel-card-border)] px-4 py-7 text-sm">
                      {labels.emptyOrders}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <BellRing className="h-4 w-4 text-[#f0b36f]" />
                    {labels.callsTitle}
                  </div>
                  {selectedSummary?.openCalls.length ? (
                    <div className="ops-detail-card overflow-hidden rounded-[1.3rem]">
                      {selectedSummary.openCalls.map((call, index) => (
                        <div
                          key={call.id}
                          className={cn(
                            "px-4 py-3.5",
                            index !== 0 && "border-t border-[var(--ops-panel-card-border)]"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <CircleAlert className="h-4 w-4 text-[#f0b36f]" />
                              <p className="font-medium">
                                {labels.requestLabels[call.call_type]}
                              </p>
                            </div>
                            <span className="ops-detail-muted text-sm">
                              {formatTimeByLocale(call.created_at, locale)}
                            </span>
                          </div>
                          {call.message ? (
                            <p className="ops-detail-muted mt-2 text-sm">{call.message}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ops-detail-muted rounded-[1.3rem] border border-dashed border-[var(--ops-panel-card-border)] px-4 py-7 text-sm">
                      {labels.emptyCalls}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      ) : (
        <div className="surface p-8 text-center text-sm text-stone-500">
          <Receipt className="mx-auto h-6 w-6 text-stone-300" />
          <p className="mt-3">{labels.noSessions}</p>
        </div>
      )}
    </div>
  );
}
