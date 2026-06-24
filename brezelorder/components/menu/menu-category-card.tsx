"use client";

import { useState } from "react";

import { deleteCategoryAction, updateCategoryAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n";

export function MenuCategoryCard({
  category,
  locale,
  itemCount,
  canDelete,
  deleteBlockedReason
}: {
  category: {
    id: string;
    name: string;
    name_ko: string | null;
    description: string | null;
    description_ko: string | null;
    sort_order: number;
    is_visible: boolean;
  };
  locale: Locale;
  itemCount: number;
  canDelete: boolean;
  deleteBlockedReason: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-3xl border border-line bg-stone-50 p-4">
        <div>
          <p className="text-lg font-semibold">{category.name}</p>
          {category.name_ko ? (
            <p className="mt-1 text-sm font-medium text-warm-500">{category.name_ko}</p>
          ) : null}
          {category.description ? (
            <p className="mt-2 text-sm text-stone-600">{category.description}</p>
          ) : null}
          {category.description_ko ? (
            <p className="mt-1 text-sm text-stone-500">{category.description_ko}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
            <span className="rounded-full bg-white px-3 py-1">
              {locale === "ko" ? `노출 순서 ${category.sort_order}` : locale === "en" ? `Sort order ${category.sort_order}` : `Reihenfolge ${category.sort_order}`}
            </span>
            <span className="rounded-full bg-white px-3 py-1">
              {locale === "ko" ? `메뉴 ${itemCount}개` : locale === "en" ? `${itemCount} items` : `${itemCount} Artikel`}
            </span>
            <span className="rounded-full bg-white px-3 py-1">
              {category.is_visible
                ? locale === "ko"
                  ? "손님 노출"
                  : locale === "en"
                    ? "Visible to guests"
                  : "Für Gäste sichtbar"
                : locale === "ko"
                  ? "숨김"
                  : locale === "en"
                    ? "Hidden"
                  : "Verborgen"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditing((current) => !current)}>
            {editing ? (locale === "ko" ? "닫기" : locale === "en" ? "Close" : "Schließen") : locale === "ko" ? "수정" : locale === "en" ? "Edit" : "Bearbeiten"}
          </Button>
          <form action={deleteCategoryAction}>
            <input type="hidden" name="categoryId" value={category.id} />
            <Button
              type="submit"
              variant="ghost"
              disabled={!canDelete}
              title={!canDelete ? deleteBlockedReason : undefined}
            >
              {locale === "ko" ? "삭제" : locale === "en" ? "Delete" : "Löschen"}
            </Button>
          </form>
        </div>
      </div>
      {!canDelete ? (
        <p className="rounded-2xl bg-[rgba(255,106,61,0.08)] px-4 py-3 text-sm text-[var(--brand-ink)]">
          {deleteBlockedReason}
        </p>
      ) : null}

      {editing ? (
        <form action={updateCategoryAction} className="space-y-3 rounded-3xl border border-line p-4">
          <input type="hidden" name="categoryId" value={category.id} />
          <Input name="name" defaultValue={category.name} />
          <Input
            name="nameKo"
            defaultValue={category.name_ko ?? ""}
            placeholder={locale === "ko" ? "카테고리 이름(한국어)" : locale === "en" ? "Category name (Korean)" : "Kategoriename (Koreanisch)"}
          />
          <Textarea name="description" defaultValue={category.description ?? ""} />
          <Textarea
            name="descriptionKo"
            defaultValue={category.description_ko ?? ""}
            placeholder={locale === "ko" ? "설명(한국어)" : locale === "en" ? "Description (Korean)" : "Beschreibung (Koreanisch)"}
          />
          <label className="space-y-2">
            <span className="text-sm font-medium">
              {locale === "ko" ? "노출 순서" : locale === "en" ? "Sort order" : "Anzeigereihenfolge"}
            </span>
            <Input name="sortOrder" type="number" defaultValue={category.sort_order} />
          </label>
          <label className="flex items-center gap-3 text-sm text-stone-600">
            <input type="checkbox" name="isVisible" defaultChecked={category.is_visible} className="h-4 w-4 rounded border-line" />
            {locale === "ko" ? "손님에게 카테고리 노출" : locale === "en" ? "Show category to guests" : "Kategorie für Gäste sichtbar"}
          </label>
          <Button type="submit">{locale === "ko" ? "저장" : locale === "en" ? "Save" : "Speichern"}</Button>
        </form>
      ) : null}
    </div>
  );
}
