import { notFound } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { GuestOrdering } from "@/components/guest/guest-ordering";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GuestTablePage({
  params
}: {
  params: { restaurantSlug: string; tableCode: string };
}) {
  const supabase = createServerSupabaseClient();
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", params.restaurantSlug)
    .eq("is_live", true)
    .single();

  if (!restaurant) {
    notFound();
  }

  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("code", params.tableCode)
    .single();

  if (!table) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*, menu_items(*, menu_item_variants(*))")
    .eq("restaurant_id", restaurant.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("sort_order", { foreignTable: "menu_items", ascending: true })
    .order("sort_order", { foreignTable: "menu_items.menu_item_variants", ascending: true });

  const { data: historicalOrders } = await supabase
    .from("orders")
    .select("id, status, order_items(menu_item_id)")
    .eq("restaurant_id", restaurant.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(250);

  const safeCategories = (categories ?? []).map((category: any) => ({
    ...category,
    menu_items: (category.menu_items ?? []).filter(
      (item: any) => item.is_visible
    )
  }));

  const recommendationMap = ((historicalOrders ?? []) as any[]).reduce<Record<string, string[]>>(
    (acc, order) => {
      const uniqueItemIds = Array.from(
        new Set((order.order_items ?? []).map((item: any) => item.menu_item_id).filter(Boolean))
      ) as string[];

      for (const sourceId of uniqueItemIds) {
        const related = uniqueItemIds.filter((id) => id !== sourceId);
        const scoreMap = new Map<string, number>(
          (acc[sourceId] ?? []).map((id, index) => [id, Math.max(1, 20 - index)])
        );

        related.forEach((id) => {
          scoreMap.set(id, (scoreMap.get(id) ?? 0) + 1);
        });

        acc[sourceId] = [...scoreMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([id]) => id);
      }

      return acc;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-6xl justify-end px-4 pt-4 pb-3 md:px-6 md:pb-0">
        <LanguageSwitcher
          locale={locale}
          label={dict.common.language}
          options={[
            { value: "de", label: dict.common.german },
            { value: "ko", label: dict.common.korean },
            { value: "en", label: dict.common.english }
          ]}
        />
      </div>
      <GuestOrdering
        restaurantSlug={params.restaurantSlug}
        restaurantName={restaurant.name}
        tableCode={params.tableCode}
        tableName={table.name}
        categories={safeCategories}
        recommendationMap={recommendationMap}
        locale={locale}
        labels={{
          ...dict.guest,
          available: dict.common.available,
          unavailable: dict.common.unavailable,
          requests: dict.requests
        }}
      />
    </main>
  );
}
