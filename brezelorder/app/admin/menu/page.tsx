import {
  createCategoryAction,
  createMenuItemAction,
  deleteCategoryAction,
  deleteMenuItemAction,
  updateCategoryAction,
  updateMenuItemAction
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MenuCategoryCard } from "@/components/menu/menu-category-card";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { Button } from "@/components/ui/button";
import { ToastBanner } from "@/components/ui/toast-banner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

export default async function MenuManagementPage({
  searchParams
}: {
  searchParams?: { toast?: string; toastType?: string };
}) {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantPermission("can_manage_menu");
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);
  const toastMessages: Record<string, string> = {
    "category-created": locale === "ko" ? "카테고리를 추가했습니다." : locale === "en" ? "Category created." : "Kategorie wurde erstellt.",
    "category-saved": locale === "ko" ? "카테고리를 저장했습니다." : locale === "en" ? "Category saved." : "Kategorie wurde gespeichert.",
    "category-deleted": locale === "ko" ? "카테고리를 삭제했습니다." : locale === "en" ? "Category deleted." : "Kategorie wurde gelöscht.",
    "category-delete-blocked":
      locale === "ko"
        ? "주문 이력 또는 연결된 메뉴가 있어 카테고리를 삭제할 수 없습니다."
        : locale === "en"
          ? "This category cannot be deleted because it has order history or linked menu items."
          : "Die Kategorie kann wegen Bestellhistorie oder verknüpften Menüpunkten nicht gelöscht werden.",
    "category-delete-failed":
      locale === "ko"
        ? "카테고리를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."
        : locale === "en"
          ? "Could not delete the category. Please try again."
          : "Die Kategorie konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
    "item-created": locale === "ko" ? "메뉴를 추가했습니다." : locale === "en" ? "Menu item created." : "Menüpunkt wurde erstellt.",
    "item-saved": locale === "ko" ? "메뉴를 저장했습니다." : locale === "en" ? "Menu item saved." : "Menüpunkt wurde gespeichert.",
    "item-deleted": locale === "ko" ? "메뉴를 삭제했습니다." : locale === "en" ? "Menu item deleted." : "Menüpunkt wurde gelöscht."
  };
  const categoryOptions = snapshot.categories.map((category: any) => ({
    id: category.id,
    name: category.name
  }));
  const itemIdsWithOrderHistory = new Set(
    (snapshot.orders as any[]).flatMap((order) =>
      (order.order_items ?? []).map((item: any) => item.menu_item_id)
    )
  );
  const categoryIdsWithOrderHistory = new Set(
    snapshot.categories
      .filter((category: any) =>
        (category.menu_items ?? []).some((item: any) => itemIdsWithOrderHistory.has(item.id))
      )
      .map((category: any) => category.id)
  );

  return (
    <AppShell
      title={dict.admin.menuTitle}
      subtitle={dict.admin.menuSubtitle}
      pathname="/admin/menu"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={getAdminNavItems({
        locale,
        labels: dict.nav,
        permissions,
        includePlatform: membership.is_platform_admin
      })}
    >
      <ToastBanner
        message={searchParams?.toast ? toastMessages[searchParams.toast] : null}
        tone={searchParams?.toastType === "error" ? "error" : "success"}
      />
      <div className="grid gap-4 xl:grid-cols-[0.65fr_1.35fr]">
        <section className="surface p-5 md:p-6">
          <h2 className="text-lg font-semibold">{dict.admin.addCategory}</h2>
          <p className="mt-2 text-sm text-stone-500">
            {locale === "ko"
              ? "카테고리의 노출 순서는 작은 숫자부터 정렬됩니다. 예: 1 = 추천 메뉴, 2 = 메인 메뉴"
              : locale === "en"
                ? "Lower numbers appear first. Example: 1 = featured, 2 = main menu."
                : "Kleinere Werte erscheinen zuerst. Beispiel: 1 = Empfehlungen, 2 = Hauptgerichte."}
          </p>
          <form action={createCategoryAction} className="mt-4 space-y-3">
            <Input name="name" placeholder={locale === "ko" ? "치킨" : locale === "en" ? "Chicken" : "Hähnchen"} required />
            <Input
              name="nameKo"
              placeholder={locale === "ko" ? "카테고리 이름(한국어)" : locale === "en" ? "Category name (Korean)" : "Kategoriename (Koreanisch)"}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Textarea
                name="description"
                placeholder={
                  locale === "ko"
                    ? "카테고리 설명 또는 안내 문구"
                    : locale === "en"
                      ? "Category description or short note"
                      : "Beschreibung oder kurzer Hinweis zur Kategorie"
                }
              />
              <Textarea
                name="descriptionKo"
                placeholder={locale === "ko" ? "설명(한국어)" : locale === "en" ? "Description (Korean)" : "Beschreibung (Koreanisch)"}
              />
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium">
                {locale === "ko" ? "노출 순서" : locale === "en" ? "Display order" : "Anzeigereihenfolge"}
              </span>
              <Input name="sortOrder" type="number" defaultValue={0} />
            </label>
            <Button type="submit">{dict.common.create}</Button>
          </form>
        </section>

        <section className="surface p-5 md:p-6">
          <h2 className="text-lg font-semibold">{dict.admin.addItem}</h2>
          <p className="mt-2 text-sm text-stone-500">
            {locale === "ko"
              ? "메뉴 사진, 기본 가격, 옵션/사이즈 가격까지 한 번에 설정할 수 있습니다."
              : locale === "en"
                ? "Set menu photos, base price, and option or size pricing in one flow."
                : "Foto, Basispreis und Variantenpreise können in einem Schritt gepflegt werden."}
          </p>
          <div className="mt-4">
            <MenuItemForm
              action={createMenuItemAction}
              categoryOptions={categoryOptions}
              submitLabel={dict.common.create}
              locale={locale}
            />
          </div>
        </section>
      </div>

      <div className="mt-4 space-y-4">
        {snapshot.categories.length === 0 ? (
          <EmptyState
            title={dict.admin.noCategories}
            description={dict.admin.noCategoriesBody}
          />
        ) : null}

        {snapshot.categories.map((category: any) => (
          <section key={category.id} className="surface p-5 md:p-6">
            <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
              <MenuCategoryCard
                category={category}
                locale={locale}
                itemCount={(category.menu_items ?? []).length}
                canDelete={!categoryIdsWithOrderHistory.has(category.id)}
                deleteBlockedReason={
                  locale === "ko"
                    ? "주문 이력이 있는 카테고리는 삭제할 수 없습니다."
                    : locale === "en"
                      ? "Categories with order history cannot be deleted."
                      : "Kategorien mit Bestellhistorie können nicht gelöscht werden."
                }
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {locale === "ko" ? "카테고리 내 메뉴" : locale === "en" ? "Items in this category" : "Menüpunkte"}
                  </h3>
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="categoryId" value={category.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      disabled={categoryIdsWithOrderHistory.has(category.id)}
                      title={
                        categoryIdsWithOrderHistory.has(category.id)
                          ? locale === "ko"
                            ? "주문 이력이 있는 카테고리는 삭제할 수 없습니다."
                            : locale === "en"
                              ? "Categories with order history cannot be deleted."
                              : "Kategorien mit Bestellhistorie können nicht gelöscht werden."
                          : undefined
                      }
                    >
                      {dict.common.delete}
                    </Button>
                  </form>
                </div>
                {(category.menu_items ?? []).length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-line p-4 text-sm text-stone-500">
                    {locale === "ko" ? "이 카테고리에는 아직 메뉴가 없습니다." : locale === "en" ? "There are no menu items in this category yet." : "Diese Kategorie enthält noch keine Menüpunkte."}
                  </div>
                ) : null}

                {(category.menu_items ?? []).map((item: any) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    categoryOptions={categoryOptions}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
