"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronRight, Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STAFF_REQUEST_KEYS } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { formatEuro } from "@/lib/utils";

type MenuCategory = {
  id: string;
  name: string;
  name_ko?: string | null;
  description: string | null;
  description_ko?: string | null;
  menu_items: Array<{
    id: string;
    name: string;
    name_ko?: string | null;
    description: string | null;
    description_ko?: string | null;
    image_url?: string | null;
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

type CartState = Record<string, number>;
type ItemRequestState = Record<string, { allergyNote: string; itemNote: string }>;

type FlatMenuItem = MenuCategory["menu_items"][number] & {
  categoryName: string;
  categoryNameKo: string | null;
  selectedVariantId: string | null;
};

export function GuestOrdering({
  restaurantSlug,
  restaurantName,
  tableCode,
  tableName,
  categories,
  recommendationMap,
  locale,
  labels
}: {
  restaurantSlug: string;
  restaurantName: string;
  tableCode: string;
  tableName: string;
  categories: MenuCategory[];
  recommendationMap: Record<string, string[]>;
  locale: Locale;
  labels: {
    title: string;
    body: string;
    quickActions: string;
    callStaff: string;
    cartSummary: string;
    floatingCart: string;
    serviceSheetTitle: string;
    serviceSheetBody: string;
    closeSheet: string;
    cart: string;
    addItems: string;
    total: string;
    optionalName: string;
    optionalNote: string;
    sendOrder: string;
    sent: string;
    needSomething: string;
    requestSentSuffix: string;
    available: string;
    unavailable: string;
    requests: Record<(typeof STAFF_REQUEST_KEYS)[number], string>;
    jumpToCategory: string;
    chooseOption: string;
    fromPrice: string;
    email: string;
    recommendedTitle: string;
    recommendedBody: string;
    add: string;
    quantity: string;
    allergyNote: string;
    allergyPlaceholder: string;
    itemNote: string;
    itemNotePlaceholder: string;
  };
}) {
  const [cart, setCart] = useState<CartState>({});
  const [itemRequests, setItemRequests] = useState<ItemRequestState>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeCartKey, setActiveCartKey] = useState<string | null>(null);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [requestSheetOpen, setRequestSheetOpen] = useState(false);
  const [sheetQuantity, setSheetQuantity] = useState(1);
  const [sheetVariantId, setSheetVariantId] = useState<string | null>(null);
  const [sheetAllergyNote, setSheetAllergyNote] = useState("");
  const [sheetItemNote, setSheetItemNote] = useState("");
  const categoryNavRef = useRef<HTMLElement | null>(null);
  const removeLabel = locale === "ko" ? "삭제" : locale === "en" ? "Remove" : "Entfernen";
  const saveLabel = locale === "ko" ? "저장" : locale === "en" ? "Save" : "Speichern";

  function getCategoryOffset() {
    const navBottom = categoryNavRef.current?.getBoundingClientRect().bottom ?? 0;
    return Math.max(navBottom + 12, window.innerWidth >= 768 ? 108 : 88);
  }

  const items: FlatMenuItem[] = useMemo(
    () =>
      categories.flatMap((category) =>
        category.menu_items.map((item) => ({
          ...item,
          categoryName: category.name,
          categoryNameKo: category.name_ko ?? null,
          selectedVariantId:
            selectedVariants[item.id] ??
            item.menu_item_variants?.[0]?.id ??
            null
        }))
      ),
    [categories, selectedVariants]
  );

  const cartItems = items
    .filter((item) => cart[getCartKey(item.id, item.selectedVariantId)] > 0)
    .map((item) => {
      const cartKey = getCartKey(item.id, item.selectedVariantId);
      return {
        ...item,
        selectedVariant:
          item.menu_item_variants?.find((variant) => variant.id === item.selectedVariantId) ?? null,
        cartKey,
        quantity: cart[cartKey],
        request: itemRequests[cartKey] ?? {
          allergyNote: "",
          itemNote: ""
        }
      };
    });

  const totalCents = cartItems.reduce(
    (sum, item) => sum + (item.selectedVariant?.price_cents ?? item.price_cents) * item.quantity,
    0
  );
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function getLocalizedText(base: string, translated?: string | null) {
    if (locale === "ko" && translated) {
      return {
        primary: translated,
        secondary: translated !== base ? base : null
      };
    }

    return {
      primary: base,
      secondary: null
    };
  }

  function getBucket(text: string) {
    const normalized = text.toLowerCase();

    if (/(water|cola|juice|beer|bier|wine|wein|coffee|kaffee|tea|tee|soda|drink|음료|맥주|커피|차|주스|탄산)/.test(normalized)) {
      return "beverage";
    }
    if (/(dessert|cake|kuchen|ice cream|eis|sweet|banana|waffle|초코|디저트|케이크|아이스크림|바나나)/.test(normalized)) {
      return "dessert";
    }
    if (/(fries|salad|side|dip|soup|appetizer|starter|beilage|vorspeise|감자|샐러드|사이드|수프|에피타이저)/.test(normalized)) {
      return "side";
    }
    if (/(pizza|burger|schnitzel|pasta|chicken|meal|plate|bowl|main|메인|치킨|버거|파스타|피자|슈니첼)/.test(normalized)) {
      return "main";
    }

    return "other";
  }

  const recommendedItems = useMemo(() => {
    const cartItemIds = new Set(cartItems.map((item) => item.id));
    const cartCategoryNames = new Set(
      cartItems.map((item) => `${item.categoryName}|${item.categoryNameKo ?? ""}`)
    );
    const cartBuckets = new Set(
      cartItems.map((item) =>
        getBucket(
          [
            item.categoryName,
            item.categoryNameKo ?? "",
            item.name,
            item.name_ko ?? ""
          ].join(" ")
        )
      )
    );
    const pairScores = new Map<string, number>();

    cartItems.forEach((item) => {
      (recommendationMap[item.id] ?? []).forEach((recommendedId, index) => {
        pairScores.set(recommendedId, (pairScores.get(recommendedId) ?? 0) + Math.max(8, 24 - index * 3));
      });
    });

    return items
      .filter((item) => item.is_available && !cartItemIds.has(item.id))
      .map((item) => {
        const itemText = [
          item.categoryName,
          item.categoryNameKo ?? "",
          item.name,
          item.name_ko ?? "",
          item.description ?? "",
          item.description_ko ?? ""
        ].join(" ");
        const bucket = getBucket(itemText);
        let score = 0;

        if (cartItems.length === 0) {
          score += bucket === "main" ? 40 : bucket === "side" ? 24 : 10;
        } else {
          score += pairScores.get(item.id) ?? 0;
          if (cartBuckets.has("main") && !cartBuckets.has("beverage") && bucket === "beverage") score += 60;
          if (cartBuckets.has("main") && !cartBuckets.has("side") && bucket === "side") score += 54;
          if (cartBuckets.has("main") && !cartBuckets.has("dessert") && bucket === "dessert") score += 48;
          if (!cartCategoryNames.has(`${item.categoryName}|${item.categoryNameKo ?? ""}`)) score += 18;
        }

        if (item.image_url) score += 10;
        score += Math.max(0, 18 - item.price_cents / 100);

        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ item }) => item);
  }, [cartItems, items, recommendationMap]);

  const popularityMap = useMemo(() => {
    const scoreMap = new Map<string, number>();

    Object.values(recommendationMap).forEach((relatedIds) => {
      relatedIds.forEach((id, index) => {
        scoreMap.set(id, (scoreMap.get(id) ?? 0) + Math.max(1, 8 - index));
      });
    });

    return scoreMap;
  }, [recommendationMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `brezel-guest:${restaurantSlug}:${tableCode}`;
    const existing = window.localStorage.getItem(storageKey);
    if (existing) {
      setGuestToken(existing);
      return;
    }

    const nextToken =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(storageKey, nextToken);
    setGuestToken(nextToken);
  }, [restaurantSlug, tableCode]);

  useEffect(() => {
    if (!categories.length) return;

    const updateActiveCategory = () => {
      const offset = getCategoryOffset();
      const sections = categories
        .map((category) => ({
          id: category.id,
          element: document.getElementById(`category-${category.id}`)
        }))
        .filter(
          (entry): entry is { id: string; element: HTMLElement } => Boolean(entry.element)
        );

      if (!sections.length) return;

      const passedSections = sections.filter((section) => {
        const top = section.element.getBoundingClientRect().top;
        return top - offset <= 0;
      });

      if (passedSections.length > 0) {
        setActiveCategoryId(passedSections[passedSections.length - 1].id);
        return;
      }

      const nearest = sections.reduce((selected, section) => {
        const topDistance = Math.abs(section.element.getBoundingClientRect().top - offset);
        const selectedDistance = Math.abs(selected.element.getBoundingClientRect().top - offset);
        return topDistance < selectedDistance ? section : selected;
      }, sections[0]);

      setActiveCategoryId(nearest.id);
    };

    updateActiveCategory();
    window.addEventListener("scroll", updateActiveCategory, { passive: true });
    window.addEventListener("resize", updateActiveCategory);

    return () => {
      window.removeEventListener("scroll", updateActiveCategory);
      window.removeEventListener("resize", updateActiveCategory);
    };
  }, [categories]);

  function getCartKey(itemId: string, variantId: string | null) {
    return `${itemId}:${variantId ?? "base"}`;
  }

  function changeQuantity(cartKey: string, nextQuantity: number) {
    setCart((current) => {
      if (nextQuantity <= 0) {
        const clone = { ...current };
        delete clone[cartKey];
        return clone;
      }

      return {
        ...current,
        [cartKey]: nextQuantity
      };
    });

    if (nextQuantity <= 0) {
      setItemRequests((current) => {
        const clone = { ...current };
        delete clone[cartKey];
        return clone;
      });
    }
  }

  function openItemSheet(
    item: FlatMenuItem,
    options?: { cartKey?: string | null; variantId?: string | null; quantity?: number }
  ) {
    const nextVariantId =
      options?.variantId ??
      selectedVariants[item.id] ??
      item.menu_item_variants?.[0]?.id ??
      null;
    const nextCartKey = options?.cartKey ?? getCartKey(item.id, nextVariantId);
    const savedRequest = itemRequests[nextCartKey] ?? { allergyNote: "", itemNote: "" };

    setActiveItemId(item.id);
    setActiveCartKey(options?.cartKey ?? null);
    setSheetVariantId(nextVariantId);
    setSheetQuantity(options?.quantity ?? cart[nextCartKey] ?? 1);
    setSheetAllergyNote(savedRequest.allergyNote);
    setSheetItemNote(savedRequest.itemNote);
  }

  function closeItemSheet() {
    setActiveItemId(null);
    setActiveCartKey(null);
  }

  function commitSheetItem() {
    if (!activeItem) return;

    const nextVariantId = sheetVariantId ?? activeItem.menu_item_variants?.[0]?.id ?? null;
    const nextCartKey = getCartKey(activeItem.id, nextVariantId);

    if (activeItem.menu_item_variants?.length && nextVariantId) {
      setSelectedVariants((current) => ({
        ...current,
        [activeItem.id]: nextVariantId
      }));
    }

    setCart((current) => {
      const clone = { ...current };

      if (activeCartKey && activeCartKey !== nextCartKey) {
        delete clone[activeCartKey];
      }

      clone[nextCartKey] = sheetQuantity;
      return clone;
    });

    setItemRequests((current) => {
      const clone = { ...current };

      if (activeCartKey && activeCartKey !== nextCartKey) {
        delete clone[activeCartKey];
      }

      clone[nextCartKey] = {
        allergyNote: sheetAllergyNote.trim(),
        itemNote: sheetItemNote.trim()
      };

      return clone;
    });

    closeItemSheet();
  }

  function addRecommendedItem(itemId: string) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;

    const selectedVariantId =
      selectedVariants[item.id] ?? item.menu_item_variants?.[0]?.id ?? null;
    const cartKey = getCartKey(item.id, selectedVariantId);
    const currentQuantity = cart[cartKey] ?? 0;

    changeQuantity(cartKey, currentQuantity + 1);
  }

  function scrollToCategory(categoryId: string) {
    const target = document.getElementById(`category-${categoryId}`);
    if (!target) return;

    const offset = getCategoryOffset();
    const nextTop = window.scrollY + target.getBoundingClientRect().top - offset;

    setActiveCategoryId(categoryId);
    window.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth"
    });
  }

  const activeItem = activeItemId ? items.find((item) => item.id === activeItemId) ?? null : null;
  const activeItemLocalized = activeItem ? getLocalizedText(activeItem.name, activeItem.name_ko) : null;
  const activeDescriptionLocalized = activeItem
    ? getLocalizedText(activeItem.description ?? "", activeItem.description_ko)
    : null;
  const activeVariant =
    activeItem?.menu_item_variants?.find((variant) => variant.id === sheetVariantId) ?? null;
  const activePriceCents = activeVariant?.price_cents ?? activeItem?.price_cents ?? 0;

  const recommendedSection = recommendedItems.length > 0 ? (
    <div className="rounded-3xl bg-stone-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warm-100 text-warm-500">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{labels.recommendedTitle}</h3>
          <p className="mt-1 text-sm text-stone-600">{labels.recommendedBody}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {recommendedItems.map((item) => {
          const localizedItem = getLocalizedText(item.name, item.name_ko);
          const localizedDescription = getLocalizedText(item.description ?? "", item.description_ko);

          return (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{localizedItem.primary}</p>
                {localizedDescription.primary ? (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                    {localizedDescription.primary}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-semibold text-stone-900">
                  {formatEuro(item.price_cents)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => addRecommendedItem(item.id)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_12px_30px_rgba(37,36,34,0.12)] ring-1 ring-black/5 hover:bg-stone-50"
                  aria-label={labels.add}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  function renderCartPanel({
    showTitle = true,
    className = "surface p-5"
  }: {
    showTitle?: boolean;
    className?: string;
  } = {}) {
    return (
      <section className={className}>
        {showTitle ? <h2 className="text-xl font-semibold">{labels.cart}</h2> : null}
      <div className="mt-4 space-y-3">
        {cartItems.length === 0 ? (
          <div className="rounded-[1.75rem] bg-ink px-4 py-4 text-sm text-white/78">
            {labels.addItems}
          </div>
        ) : (
          cartItems.map((item) => {
            const localizedItem = getLocalizedText(item.name, item.name_ko);
            const localizedVariant = item.selectedVariant
              ? getLocalizedText(item.selectedVariant.name, item.selectedVariant.name_ko)
              : null;

            return (
              <div
                key={item.cartKey}
                className="rounded-3xl border border-line bg-stone-50 p-4 transition hover:border-[rgba(255,106,61,0.24)] hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      openItemSheet(item, {
                        cartKey: item.cartKey,
                        variantId: item.selectedVariant?.id ?? item.selectedVariantId,
                        quantity: item.quantity
                      })
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="font-medium">
                      {localizedItem.primary}
                      {localizedVariant ? ` · ${localizedVariant.primary}` : ""}
                    </p>
                    {item.request.allergyNote ? (
                      <p className="mt-1 text-xs font-medium text-rose-600">
                        {labels.allergyNote}: {item.request.allergyNote}
                      </p>
                    ) : null}
                    {item.request.itemNote ? (
                      <p className="mt-1 text-xs text-stone-500">
                        {labels.itemNote}: {item.request.itemNote}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-stone-600">
                      {formatEuro((item.selectedVariant?.price_cents ?? item.price_cents) * item.quantity)}
                    </p>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        changeQuantity(item.cartKey, 0);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-500 ring-1 ring-black/6 hover:text-rose-500"
                      aria-label={removeLabel}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 rounded-full bg-white px-1.5 py-1 ring-1 ring-black/6">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          changeQuantity(item.cartKey, item.quantity - 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
                        aria-label={`${labels.quantity} -`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          changeQuantity(item.cartKey, item.quantity + 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white hover:bg-black"
                        aria-label={`${labels.quantity} +`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {message ? (
        <div className="mt-4 rounded-3xl border border-warm-200 bg-warm-100 px-4 py-3 text-sm text-warm-500">
          {message}
        </div>
      ) : null}
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">{labels.total}</p>
          <p className="text-xl font-semibold">{formatEuro(totalCents)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Input
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder={labels.optionalName}
        />
        <Input
          value={guestEmail}
          onChange={(event) => setGuestEmail(event.target.value)}
          type="email"
          placeholder={labels.email}
          required
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={labels.optionalNote}
          className="min-h-24 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm"
        />
        {recommendedSection}
        <Button fullWidth disabled={busy || cartItems.length === 0} onClick={submitOrder}>
          {labels.sendOrder} {cartItems.length > 0 ? `· ${totalQuantity}` : ""}
        </Button>
      </div>
      </section>
    );
  }

  async function submitOrder() {
    if (!guestEmail.trim()) {
      setMessage(
        locale === "ko"
          ? "영수증을 받을 이메일을 입력해주세요."
          : "Bitte gib eine E-Mail für den Beleg ein."
      );
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantSlug,
          tableCode,
          guestToken,
          guestName,
          guestEmail,
          notes,
          items: cartItems.map((item) => ({
            menuItemId: item.id,
            variantId: item.selectedVariant?.id ?? null,
            quantity: item.quantity,
            itemNote: item.request.itemNote || null,
            allergyNote: item.request.allergyNote || null
          }))
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.error ?? "Order could not be sent.");
        return;
      }

      setCart({});
      setItemRequests({});
      setNotes("");
      setMessage(labels.sent);
      setCartSheetOpen(false);
    } catch (error) {
      setMessage(
        locale === "ko"
          ? "주문 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          : "Beim Senden der Bestellung ist ein Fehler aufgetreten. Bitte versuche es erneut."
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendStaffRequest(callType: (typeof STAFF_REQUEST_KEYS)[number]) {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/staff-calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantSlug,
          tableCode,
          guestToken,
          callType
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.error ?? "Request could not be sent.");
        return;
      }

      setMessage(`${labels.requests[callType]}${labels.requestSentSuffix}`);
      setRequestSheetOpen(false);
    } catch (error) {
      setMessage(
        locale === "ko"
          ? "직원 호출 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          : "Beim Senden der Serviceanfrage ist ein Fehler aufgetreten. Bitte versuche es erneut."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-0 py-0 pb-28 md:px-6 md:py-6 lg:pb-6">
      <div className="grid gap-4 lg:grid-cols-[1.16fr_0.84fr]">
        <section className="space-y-4">
          <div className="mx-4 rounded-[1.75rem] border border-line bg-white/92 px-4 py-3 shadow-[0_10px_28px_rgba(37,36,34,0.05)] backdrop-blur md:mx-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  {labels.quickActions}
                </p>
                <p className="mt-1 truncate text-lg font-semibold text-ink">{restaurantName}</p>
                <p className="mt-1 text-sm text-stone-500">{tableName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRequestSheetOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink shadow-[0_8px_20px_rgba(37,36,34,0.06)] transition hover:border-[rgba(255,106,61,0.22)]"
                >
                  <Bell className="h-4 w-4 text-warm-500" />
                  <span>{labels.callStaff}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCartSheetOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] transition hover:bg-black"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{totalQuantity > 0 ? `${totalQuantity}` : "0"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mx-4 rounded-[2rem] border border-line bg-white px-4 py-5 shadow-[0_10px_30px_rgba(37,36,34,0.04)] md:mx-0 md:surface md:p-5">
            <p className="text-sm font-medium text-warm-500">{tableName}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{labels.title}</h1>
            <p className="mt-2 text-sm text-stone-600">{labels.body}</p>
          </div>

          <nav
            ref={categoryNavRef}
            className="sticky top-0 z-20 mx-4 overflow-x-auto border-b border-line bg-canvas/95 py-2 backdrop-blur md:top-4 md:mx-0"
          >
            <div className="flex gap-5">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={`relative min-w-max py-2.5 text-sm font-medium transition ${
                    activeCategoryId === category.id
                      ? "text-ink after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-[var(--brand-lilac)] after:to-[var(--brand-accent)]"
                      : "text-[var(--brand-muted)] hover:text-[var(--brand-ink)]"
                  }`}
                >
                  {getLocalizedText(category.name, category.name_ko).primary}
                </button>
              ))}
            </div>
          </nav>

          {categories.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="scroll-mt-36 mx-4 rounded-[2rem] border border-line bg-white px-4 py-5 shadow-[0_10px_30px_rgba(37,36,34,0.04)] md:scroll-mt-32 md:mx-0 md:surface md:p-5"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {getLocalizedText(category.name, category.name_ko).primary}
                </h2>
                {getLocalizedText(category.name, category.name_ko).secondary ? (
                  <p className="mt-1 text-sm font-medium text-warm-500">
                    {getLocalizedText(category.name, category.name_ko).secondary}
                  </p>
                ) : null}
                {getLocalizedText(category.description ?? "", category.description_ko).primary ? (
                  <p className="mt-2 text-sm text-stone-600">
                    {getLocalizedText(category.description ?? "", category.description_ko).primary}
                  </p>
                ) : null}
                {getLocalizedText(category.description ?? "", category.description_ko).secondary ? (
                  <p className="mt-1 text-xs text-stone-500">
                    {getLocalizedText(category.description ?? "", category.description_ko).secondary}
                  </p>
                ) : null}
              </div>
              <div className="divide-y divide-line">
                {category.menu_items.map((item) => {
                  const localizedItem = getLocalizedText(item.name, item.name_ko);
                  const localizedDescription = getLocalizedText(item.description ?? "", item.description_ko);
                  const selectedVariantId =
                    selectedVariants[item.id] ?? item.menu_item_variants?.[0]?.id ?? null;
                  const cartKey = getCartKey(item.id, selectedVariantId);
                  const quantity = cart[cartKey] ?? 0;
                  const minVariantPrice =
                    item.menu_item_variants && item.menu_item_variants.length > 0
                      ? Math.min(...item.menu_item_variants.map((variant) => variant.price_cents))
                      : null;
                  const enrichedItem: FlatMenuItem = {
                    ...item,
                    categoryName: category.name,
                    categoryNameKo: category.name_ko ?? null,
                    selectedVariantId
                  };
                  const popularityScore = popularityMap.get(item.id) ?? 0;
                  const localizedBucket = getBucket(
                    [
                      category.name,
                      category.name_ko ?? "",
                      item.name,
                      item.name_ko ?? "",
                      item.description ?? "",
                      item.description_ko ?? ""
                    ].join(" ")
                  );
                  const topBadge =
                    popularityScore >= 10
                      ? locale === "ko"
                        ? "인기"
                        : "Beliebt"
                      : localizedBucket === "dessert"
                        ? locale === "ko"
                          ? "추천"
                          : "Empfohlen"
                        : null;

                  return (
                    <article
                      key={item.id}
                      className="cursor-pointer py-4 first:pt-0 last:pb-0"
                      onClick={() => openItemSheet(enrichedItem)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            {topBadge ? (
                              <span className="rounded-full bg-[rgba(204,182,255,0.26)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-ink)]">
                                {topBadge}
                              </span>
                            ) : null}
                            {!item.is_available ? (
                              <span className="rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
                                {labels.unavailable}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="text-lg font-semibold">{localizedItem.primary}</h3>
                          {localizedItem.secondary ? (
                            <p className="mt-1 text-sm font-medium text-warm-500">
                              {localizedItem.secondary}
                            </p>
                          ) : null}
                          {localizedDescription.primary ? (
                            <p className="mt-2 text-sm text-stone-600">{localizedDescription.primary}</p>
                          ) : null}
                          {localizedDescription.secondary ? (
                            <p className="mt-1 text-xs text-stone-500">
                              {localizedDescription.secondary}
                            </p>
                          ) : null}
                          <p className="mt-3 text-base font-semibold text-stone-900">
                            {minVariantPrice !== null
                              ? `${labels.fromPrice} ${formatEuro(minVariantPrice)}`
                              : formatEuro(item.price_cents)}
                          </p>

                          {item.menu_item_variants && item.menu_item_variants.length > 0 ? (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {item.menu_item_variants.map((variant) => {
                                  const localizedVariant = getLocalizedText(variant.name, variant.name_ko);
                                  return (
                                    <button
                                      key={variant.id}
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedVariants((current) => ({
                                          ...current,
                                          [item.id]: variant.id
                                        }));
                                      }}
                                      className={`rounded-full border px-3 py-2 text-sm ${
                                        selectedVariantId === variant.id
                                          ? "border-ink bg-ink text-white"
                                          : "border-line bg-white text-stone-700"
                                      }`}
                                    >
                                      {localizedVariant.primary} · {formatEuro(variant.price_cents)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex w-24 shrink-0 flex-col items-end gap-3 sm:w-28">
                          {item.is_available ? (
                            quantity > 0 ? (
                              <div className="flex w-full items-center justify-between rounded-full border border-line bg-white px-2 py-1 shadow-sm">
                                <button
                                  type="button"
                                  aria-label={`${labels.quantity} -`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    changeQuantity(cartKey, quantity - 1);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-semibold">{quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`${labels.quantity} +`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    changeQuantity(cartKey, quantity + 1);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white hover:bg-black"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openItemSheet(enrichedItem);
                                }}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-[0_12px_30px_rgba(37,36,34,0.12)] ring-1 ring-black/5 hover:bg-stone-50"
                                aria-label={labels.add}
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            )
                          ) : (
                            <span className="h-12" />
                          )}
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-24 w-24 rounded-[1.75rem] bg-stone-100 object-cover sm:h-28 sm:w-28"
                            />
                          ) : (
                            <div className="h-24 w-24 rounded-[1.75rem] bg-stone-100 sm:h-28 sm:w-28" />
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <aside className="hidden space-y-4 px-4 pb-6 md:px-0 lg:sticky lg:top-4 lg:block lg:self-start">
          {renderCartPanel()}

          <section className="surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{labels.needSomething}</h2>
                <p className="mt-1 text-sm text-stone-500">{labels.serviceSheetBody}</p>
              </div>
              <button
                type="button"
                onClick={() => setRequestSheetOpen(true)}
                className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-white"
              >
                {labels.callStaff}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {STAFF_REQUEST_KEYS.map((key) => (
                <Button
                  key={key}
                  variant="secondary"
                  onClick={() => sendStaffRequest(key)}
                  disabled={busy}
                >
                  {labels.requests[key]}
                </Button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {!cartSheetOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink px-4 py-3 shadow-[0_-16px_40px_rgba(17,24,39,0.28)] lg:hidden">
        <button
          type="button"
          onClick={() => setCartSheetOpen(true)}
          className="flex w-full items-center justify-between rounded-[1.5rem] bg-white/6 px-5 py-4 text-left text-white ring-1 ring-white/10"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/60">{labels.cartSummary}</p>
            <p className="mt-1 font-medium">
              {totalQuantity > 0 ? `${totalQuantity} · ${formatEuro(totalCents)}` : labels.addItems}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            {labels.floatingCart}
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
        </div>
      ) : null}

      {activeItem ? (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/30 lg:items-center lg:justify-center lg:bg-black/40"
          onClick={closeItemSheet}
        >
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-white px-4 pb-6 pt-4 shadow-[0_-24px_60px_rgba(37,36,34,0.18)] lg:max-h-[84vh] lg:max-w-2xl lg:rounded-[2rem] lg:px-6 lg:pb-7 lg:pt-5 lg:shadow-[0_24px_80px_rgba(37,36,34,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200 lg:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-warm-500">
                  {getLocalizedText(activeItem.categoryName, activeItem.categoryNameKo).primary}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  {activeItemLocalized?.primary}
                </h2>
                {activeDescriptionLocalized?.primary ? (
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {activeDescriptionLocalized.primary}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeItemSheet}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeItem.image_url ? (
              <img
                src={activeItem.image_url}
                alt={activeItem.name}
                className="mt-5 h-56 w-full rounded-[1.75rem] object-cover"
              />
            ) : null}

            {activeItem.menu_item_variants && activeItem.menu_item_variants.length > 0 ? (
              <div className="mt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                  {labels.chooseOption}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeItem.menu_item_variants.map((variant) => {
                    const localizedVariant = getLocalizedText(variant.name, variant.name_ko);
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSheetVariantId(variant.id)}
                        className={`rounded-full border px-3 py-2 text-sm ${
                          sheetVariantId === variant.id
                            ? "border-ink bg-ink text-white"
                            : "border-line bg-white text-stone-700"
                        }`}
                      >
                        {localizedVariant.primary} · {formatEuro(variant.price_cents)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between rounded-[1.75rem] bg-stone-50 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500">{labels.quantity}</p>
                <p className="mt-1 text-lg font-semibold">{formatEuro(activePriceCents)}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 ring-1 ring-black/5">
                <button
                  type="button"
                  onClick={() => setSheetQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-semibold">{sheetQuantity}</span>
                <button
                  type="button"
                  onClick={() => setSheetQuantity((current) => current + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-black"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">{labels.allergyNote}</p>
                <textarea
                  value={sheetAllergyNote}
                  onChange={(event) => setSheetAllergyNote(event.target.value)}
                  placeholder={labels.allergyPlaceholder}
                  className="min-h-20 w-full rounded-[1.5rem] border border-line bg-white px-4 py-3 text-sm"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">{labels.itemNote}</p>
                <textarea
                  value={sheetItemNote}
                  onChange={(event) => setSheetItemNote(event.target.value)}
                  placeholder={labels.itemNotePlaceholder}
                  className="min-h-24 w-full rounded-[1.5rem] border border-line bg-white px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-6">{recommendedSection}</div>

            <div className="sticky bottom-0 mt-6 bg-white pb-2 pt-4">
              <Button fullWidth onClick={commitSheetItem}>
                {activeCartKey ? saveLabel : labels.add} {sheetQuantity} · {formatEuro(activePriceCents * sheetQuantity)}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {cartSheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/30 lg:hidden" onClick={() => setCartSheetOpen(false)}>
          <div
            className="max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-white px-4 pb-6 pt-4 shadow-[0_-24px_60px_rgba(37,36,34,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{labels.cart}</h2>
              <button
                type="button"
                onClick={() => setCartSheetOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderCartPanel({ showTitle: false, className: "space-y-0 rounded-[2rem] bg-white pb-2" })}
          </div>
        </div>
      ) : null}

      {requestSheetOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/30"
          onClick={() => setRequestSheetOpen(false)}
        >
          <div
            className="w-full rounded-t-[2rem] bg-white px-4 pb-6 pt-4 shadow-[0_-24px_60px_rgba(37,36,34,0.18)] lg:mx-auto lg:mb-10 lg:max-w-xl lg:rounded-[2rem] lg:px-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-200" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{labels.serviceSheetTitle}</h2>
                <p className="mt-2 text-sm text-stone-600">{labels.serviceSheetBody}</p>
              </div>
              <button
                type="button"
                onClick={() => setRequestSheetOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700"
                aria-label={labels.closeSheet}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STAFF_REQUEST_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => sendStaffRequest(key)}
                  disabled={busy}
                  className="rounded-[1.5rem] border border-line bg-stone-50 px-4 py-4 text-left transition hover:border-[rgba(255,106,61,0.22)] hover:bg-white disabled:opacity-60"
                >
                  <p className="font-semibold text-ink">{labels.requests[key]}</p>
                  <p className="mt-1 text-sm text-stone-500">{tableName}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
