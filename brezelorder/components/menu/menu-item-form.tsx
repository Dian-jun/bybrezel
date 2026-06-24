"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";

type VariantState = {
  id?: string;
  name: string;
  nameKo?: string;
  priceEuro: string;
  sortOrder: string;
};

export function MenuItemForm({
  action,
  categoryOptions,
  submitLabel,
  itemId,
  initialCategoryId,
  initialName = "",
  initialNameKo = "",
  initialDescription = "",
  initialDescriptionKo = "",
  initialPriceEuro = "",
  initialSortOrder = "0",
  initialVisible = true,
  initialAvailable = true,
  initialImageUrl,
  initialVariants = [],
  locale = "ko"
}: {
  action: (formData: FormData) => void | Promise<void>;
  categoryOptions: Array<{ id: string; name: string }>;
  submitLabel: string;
  itemId?: string;
  initialCategoryId?: string;
  initialName?: string;
  initialNameKo?: string;
  initialDescription?: string;
  initialDescriptionKo?: string;
  initialPriceEuro?: string;
  initialSortOrder?: string;
  initialVisible?: boolean;
  initialAvailable?: boolean;
  initialImageUrl?: string | null;
  initialVariants?: VariantState[];
  locale?: Locale;
}) {
  const [variants, setVariants] = useState<VariantState[]>(initialVariants);

  const labels =
    locale === "ko"
      ? {
          category: "카테고리",
          itemName: "메뉴 이름",
          itemNameKo: "메뉴 이름(한국어)",
          description: "설명",
          descriptionKo: "설명(한국어)",
          basePrice: "기본 가격",
          basePriceHint: "옵션/사이즈가 없을 때 사용됩니다.",
          displayOrder: "노출 순서",
          displayOrderHint: "작을수록 먼저 보입니다.",
          image: "메뉴 사진",
          imageHint: "정사각형 또는 4:3 사진이 가장 깔끔합니다.",
          visible: "손님에게 노출",
          available: "현재 주문 가능",
          variants: "옵션 / 사이즈",
          variantsHint: "예: M, L 또는 매운맛 추가. 각 옵션마다 가격을 다르게 줄 수 있습니다.",
          addVariant: "옵션 추가",
          variantName: "옵션명",
          variantNameKo: "옵션명(한국어)",
          variantPrice: "가격",
          remove: "삭제",
          noVariants: "옵션이 없으면 기본 가격만 사용합니다."
        }
      : locale === "en"
        ? {
            category: "Category",
            itemName: "Menu item name",
            itemNameKo: "Menu item name (Korean)",
            description: "Description",
            descriptionKo: "Description (Korean)",
            basePrice: "Base price",
            basePriceHint: "Used when no variant or size is selected.",
            displayOrder: "Sort order",
            displayOrderHint: "Smaller numbers appear first.",
            image: "Menu image",
            imageHint: "Square or 4:3 images work best.",
            visible: "Visible to guests",
            available: "Currently orderable",
            variants: "Options / sizes",
            variantsHint: "For example M, L or extra spicy with different pricing.",
            addVariant: "Add option",
            variantName: "Option name",
            variantNameKo: "Option name (Korean)",
            variantPrice: "Price",
            remove: "Remove",
            noVariants: "If there are no options, only the base price will be used."
          }
        : {
          category: "Kategorie",
          itemName: "Menüname",
          itemNameKo: "Menüname (Koreanisch)",
          description: "Beschreibung",
          descriptionKo: "Beschreibung (Koreanisch)",
          basePrice: "Basispreis",
          basePriceHint: "Wird verwendet, wenn keine Variante gewählt wird.",
          displayOrder: "Anzeigereihenfolge",
          displayOrderHint: "Kleinere Werte erscheinen zuerst.",
          image: "Menüfoto",
          imageHint: "Quadratische oder 4:3 Bilder wirken am besten.",
          visible: "Für Gäste sichtbar",
          available: "Derzeit bestellbar",
          variants: "Optionen / Größen",
          variantsHint: "Zum Beispiel M, L oder Extra scharf mit eigenem Preis.",
          addVariant: "Option hinzufügen",
          variantName: "Optionsname",
          variantNameKo: "Optionsname (Koreanisch)",
          variantPrice: "Preis",
          remove: "Entfernen",
          noVariants: "Ohne Optionen wird nur der Basispreis verwendet."
        };

  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      {itemId ? <input type="hidden" name="itemId" value={itemId} /> : null}
      <input
        type="hidden"
        name="variantsJson"
        value={JSON.stringify(
          variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            nameKo: variant.nameKo ?? "",
            priceEuro: Number(variant.priceEuro || 0),
            sortOrder: Number(variant.sortOrder || 0)
          }))
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.category}</span>
          <select
            name="categoryId"
            defaultValue={initialCategoryId ?? ""}
            className="min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm"
            required
          >
            <option value="">{locale === "ko" ? "카테고리 선택" : locale === "en" ? "Choose category" : "Kategorie wählen"}</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.itemName}</span>
          <Input name="name" defaultValue={initialName} required />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.itemNameKo}</span>
          <Input name="nameKo" defaultValue={initialNameKo} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.description}</span>
          <Textarea name="description" defaultValue={initialDescription} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.descriptionKo}</span>
          <Textarea name="descriptionKo" defaultValue={initialDescriptionKo} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.basePrice}</span>
          <Input name="priceEuro" type="number" step="0.01" min="0" defaultValue={initialPriceEuro} required />
          <p className="text-xs text-stone-500">{labels.basePriceHint}</p>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">{labels.displayOrder}</span>
          <Input name="sortOrder" type="number" defaultValue={initialSortOrder} />
          <p className="text-xs text-stone-500">{labels.displayOrderHint}</p>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium">{labels.image}</span>
        <Input name="image" type="file" accept="image/*" />
        <p className="text-xs text-stone-500">{labels.imageHint}</p>
        {initialImageUrl ? (
          <img src={initialImageUrl} alt={initialName} className="h-28 w-28 rounded-2xl object-cover" />
        ) : null}
      </label>

      <div className="rounded-3xl border border-line bg-stone-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold">{labels.variants}</h4>
            <p className="mt-1 text-sm text-stone-500">{labels.variantsHint}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setVariants((current) => [
                ...current,
                { name: "", nameKo: "", priceEuro: initialPriceEuro || "0", sortOrder: String(current.length) }
              ])
            }
          >
            {labels.addVariant}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {variants.length === 0 ? (
            <p className="text-sm text-stone-500">{labels.noVariants}</p>
          ) : null}
          {variants.map((variant, index) => (
            <div key={`${variant.id ?? "new"}-${index}`} className="grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_1fr_0.9fr_0.6fr_auto]">
              <Input
                placeholder={labels.variantName}
                value={variant.name}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, name: event.target.value } : entry
                    )
                  )
                }
              />
              <Input
                placeholder={labels.variantNameKo}
                value={variant.nameKo ?? ""}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, nameKo: event.target.value } : entry
                    )
                  )
                }
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={labels.variantPrice}
                value={variant.priceEuro}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, priceEuro: event.target.value } : entry
                    )
                  )
                }
              />
              <Input
                type="number"
                placeholder="0"
                value={variant.sortOrder}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, sortOrder: event.target.value } : entry
                    )
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setVariants((current) => current.filter((_, entryIndex) => entryIndex !== index))
                }
              >
                {labels.remove}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {itemId ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm text-stone-600">
            <input type="checkbox" name="isVisible" defaultChecked={initialVisible} className="h-4 w-4 rounded border-line" />
            {labels.visible}
          </label>
          <label className="flex items-center gap-3 text-sm text-stone-600">
            <input type="checkbox" name="isAvailable" defaultChecked={initialAvailable} className="h-4 w-4 rounded border-line" />
            {labels.available}
          </label>
        </div>
      ) : null}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
