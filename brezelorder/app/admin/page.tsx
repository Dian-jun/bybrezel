import {
  BarChart3,
  QrCode,
  Settings2,
  UtensilsCrossed
} from "lucide-react";

import { signOutAction, updateRestaurantSettingsAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireRestaurantContext, getRestaurantSnapshot } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

export default async function AdminOverviewPage() {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantContext();
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);
  const quickStats = [
    { label: dict.admin.statsLiveView, icon: BarChart3 },
    { label: dict.admin.statsMenuControl, icon: UtensilsCrossed },
    { label: dict.admin.statsQrSetup, icon: QrCode },
    { label: dict.admin.statsSettings, icon: Settings2 }
  ];
  const navItems = getAdminNavItems({
    locale,
    labels: dict.nav,
    permissions,
    includePlatform: membership.is_platform_admin
  });

  return (
    <AppShell
      title={restaurant.name}
      subtitle={dict.admin.dashboardSubtitle}
      pathname="/admin"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={navItems}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const value = [snapshot.categories.length, snapshot.tables.length, snapshot.orders.length, snapshot.calls.length][index];
          return (
            <div key={stat.label} className="surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">{stat.label}</p>
                <div className="rounded-2xl bg-warm-100 p-2 text-warm-500">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold">{value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface p-5 md:p-6">
          <h2 className="text-xl font-semibold">{dict.admin.restaurantSettings}</h2>
          {permissions.can_manage_settings ? (
            <form action={updateRestaurantSettingsAction} className="mt-5 space-y-4">
              <Input name="name" defaultValue={restaurant.name} placeholder="Restaurant name" required />
              <Input name="contactEmail" defaultValue={restaurant.contact_email ?? ""} type="email" placeholder="Email" />
              <Input name="contactPhone" defaultValue={restaurant.contact_phone ?? ""} placeholder="Phone" />
              <Input name="address" defaultValue={restaurant.address ?? ""} placeholder="Address" />
              <Input name="steuerNumber" defaultValue={restaurant.steuer_number ?? ""} placeholder="Steuernummer" />
              <Input name="iban" defaultValue={restaurant.iban ?? ""} placeholder="IBAN" />
              <Input name="logo" type="file" accept="image/*" />
              <label className="flex items-center gap-3 text-sm text-stone-600">
                <input name="isLive" type="checkbox" defaultChecked={restaurant.is_live} className="h-4 w-4 rounded border-line" />
                {dict.admin.restaurantLive}
              </label>
              <p className="text-xs text-stone-500">
                {locale === "ko"
                  ? "이 설정을 켜야 손님이 QR 링크로 메뉴를 보고 주문할 수 있습니다. 끄면 손님용 페이지가 비공개 상태가 됩니다."
                  : "Nur wenn diese Option aktiv ist, können Gäste über den QR-Link bestellen. Ist sie aus, bleibt die Gastansicht verborgen."}
              </p>
              <Button type="submit">{dict.admin.saveSettings}</Button>
            </form>
          ) : (
            <div className="mt-5 space-y-3">
              {[
                [locale === "ko" ? "이름" : "Name", restaurant.name],
                [locale === "ko" ? "이메일" : "E-Mail", restaurant.contact_email ?? "-"],
                [locale === "ko" ? "전화번호" : "Telefon", restaurant.contact_phone ?? "-"],
                [locale === "ko" ? "주소" : "Adresse", restaurant.address ?? "-"],
                ["Steuernummer", restaurant.steuer_number ?? "-"],
                ["IBAN", restaurant.iban ?? "-"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-stone-500">{label}</p>
                  <p className="mt-1 font-medium text-stone-800">{value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold">{dict.admin.launchChecklist}</h2>
            <form action={signOutAction}>
              <Button variant="secondary" type="submit">
                {dict.common.signOut}
              </Button>
            </form>
          </div>
          <div className="mt-5 space-y-4">
            {[
              [dict.admin.checkTables, `${snapshot.tables.length}${dict.admin.configured}`],
              [dict.admin.checkCategories, `${snapshot.categories.length}${dict.admin.configured}`],
              [dict.admin.checkOrders, `${snapshot.orders.length}${dict.admin.tracked}`],
              [dict.admin.checkCalls, `${snapshot.calls.filter((call: any) => call.status === "open").length}${dict.admin.open}`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-line bg-stone-50 p-4">
                <p className="text-sm text-stone-500">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
