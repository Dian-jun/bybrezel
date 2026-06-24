import { setActiveRestaurantAction, signOutAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getPlatformOverview, isPlatformAdmin, requireAuth } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { redirect } from "next/navigation";

export default async function PlatformPage() {
  await requireAuth();
  const platformAdmin = await isPlatformAdmin();
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);

  if (!platformAdmin) {
    redirect("/admin?error=permission");
  }

  const overview = await getPlatformOverview();

  return (
    <AppShell
      title={locale === "ko" ? "플랫폼 관리자" : "Platform admin"}
      subtitle={locale === "ko" ? "가입된 모든 레스토랑과 시스템 상태를 한눈에 확인하고 관리합니다." : "View and manage all onboarded restaurants in one place."}
      pathname="/platform"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={[{ href: "/platform", label: locale === "ko" ? "플랫폼" : "Platform" }, { href: "/admin", label: dict.nav.overview }]}
      actions={<form action={signOutAction}><Button variant="secondary" type="submit">{dict.common.signOut}</Button></form>}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface p-5"><p className="text-sm text-stone-500">레스토랑 수</p><p className="mt-4 text-3xl font-semibold">{overview.restaurants.length}</p></div>
        <div className="surface p-5"><p className="text-sm text-stone-500">멤버십 수</p><p className="mt-4 text-3xl font-semibold">{overview.memberships.length}</p></div>
        <div className="surface p-5"><p className="text-sm text-stone-500">주문 수</p><p className="mt-4 text-3xl font-semibold">{overview.orders.length}</p></div>
        <div className="surface p-5"><p className="text-sm text-stone-500">운영 중 레스토랑</p><p className="mt-4 text-3xl font-semibold">{overview.restaurants.filter((restaurant: any) => restaurant.is_live).length}</p></div>
      </section>

      <div className="mt-4 grid gap-4">
        {overview.restaurants.map((restaurant: any) => {
          const orderCount = overview.orders.filter((order: any) => order.restaurant_id === restaurant.id).length;
          const memberCount = overview.memberships.filter((membership: any) => membership.restaurant_id === restaurant.id).length;
          return (
            <section key={restaurant.id} className="surface p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xl font-semibold">{restaurant.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{restaurant.slug}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
                    <span className="rounded-full bg-stone-50 px-3 py-1">{orderCount} orders</span>
                    <span className="rounded-full bg-stone-50 px-3 py-1">{memberCount} members</span>
                    <span className="rounded-full bg-stone-50 px-3 py-1">{restaurant.is_live ? "live" : "hidden"}</span>
                  </div>
                </div>
                <form action={setActiveRestaurantAction}>
                  <input type="hidden" name="restaurantId" value={restaurant.id} />
                  <Button type="submit">{locale === "ko" ? "이 레스토랑으로 전환" : "Switch to restaurant"}</Button>
                </form>
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
