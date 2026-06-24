import { AppShell } from "@/components/app-shell";
import { QrManager } from "@/components/qr/qr-manager";
import { getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

export default async function QrPage() {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantPermission("can_manage_qr");
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);

  return (
    <AppShell
      title={dict.admin.qrTitle}
      subtitle={dict.admin.qrSubtitle}
      pathname="/admin/qr"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={getAdminNavItems({
        locale,
        labels: dict.nav,
        permissions,
        includePlatform: membership.is_platform_admin
      })}
    >
      <QrManager slug={restaurant.slug} tables={snapshot.tables as any} appUrl={appUrl} locale={locale} />
    </AppShell>
  );
}
