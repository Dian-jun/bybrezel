"use client";

import { useState } from "react";

import { deleteMenuItemAction, updateMenuItemAction } from "@/app/actions";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { formatEuro } from "@/lib/utils";

export function MenuItemCard({
  item,
  categoryOptions,
  locale
}: {
  item: any;
  categoryOptions: Array<{ id: string; name: string }>;
  locale: Locale;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-3xl border border-line bg-stone-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
          ) : null}
          <div>
            <p className="text-lg font-semibold">{item.name}</p>
            {item.name_ko ? (
              <p className="mt-1 text-sm font-medium text-warm-500">{item.name_ko}</p>
            ) : null}
            {item.description ? (
              <p className="mt-2 text-sm text-stone-600">{item.description}</p>
            ) : null}
            {item.description_ko ? (
              <p className="mt-1 text-sm text-stone-500">{item.description_ko}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
              <span className="rounded-full bg-white px-3 py-1">
                {locale === "ko" ? "기본 가격" : locale === "en" ? "Base price" : "Basispreis"} {formatEuro(item.price_cents)}
              </span>
              <span className="rounded-full bg-white px-3 py-1">
                {locale === "ko" ? `옵션 ${item.menu_item_variants?.length ?? 0}개` : locale === "en" ? `${item.menu_item_variants?.length ?? 0} options` : `${item.menu_item_variants?.length ?? 0} Varianten`}
              </span>
              <span className="rounded-full bg-white px-3 py-1">
                {item.is_available
                  ? locale === "ko"
                    ? "주문 가능"
                    : locale === "en"
                      ? "Available"
                    : "Bestellbar"
                  : locale === "ko"
                    ? "품절"
                    : locale === "en"
                      ? "Unavailable"
                    : "Nicht verfügbar"}
              </span>
              <span className="rounded-full bg-white px-3 py-1">
                {locale === "ko" ? `노출 순서 ${item.sort_order}` : locale === "en" ? `Sort order ${item.sort_order}` : `Reihenfolge ${item.sort_order}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditing((current) => !current)}>
            {editing ? (locale === "ko" ? "닫기" : locale === "en" ? "Close" : "Schließen") : locale === "ko" ? "수정" : locale === "en" ? "Edit" : "Bearbeiten"}
          </Button>
          <form action={deleteMenuItemAction}>
            <input type="hidden" name="itemId" value={item.id} />
            <Button type="submit" variant="ghost">
              {locale === "ko" ? "삭제" : locale === "en" ? "Delete" : "Löschen"}
            </Button>
          </form>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 rounded-3xl border border-line bg-white p-4">
          <MenuItemForm
            action={updateMenuItemAction}
            itemId={item.id}
            categoryOptions={categoryOptions}
            initialCategoryId={item.category_id}
            initialName={item.name}
            initialNameKo={item.name_ko ?? ""}
            initialDescription={item.description ?? ""}
            initialDescriptionKo={item.description_ko ?? ""}
            initialPriceEuro={(item.price_cents / 100).toFixed(2)}
            initialSortOrder={String(item.sort_order)}
            initialVisible={item.is_visible}
            initialAvailable={item.is_available}
            initialImageUrl={item.image_url}
            initialVariants={(item.menu_item_variants ?? []).map((variant: any) => ({
              id: variant.id,
              name: variant.name,
              nameKo: variant.name_ko ?? "",
              priceEuro: (variant.price_cents / 100).toFixed(2),
              sortOrder: String(variant.sort_order)
            }))}
            submitLabel={locale === "ko" ? "저장" : locale === "en" ? "Save" : "Speichern"}
            locale={locale}
          />
        </div>
      ) : null}
    </div>
  );
}
