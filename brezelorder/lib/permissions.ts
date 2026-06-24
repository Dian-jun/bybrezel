import type { RestaurantPermission } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type MembershipLike = {
  role?: string | null;
  permissions?: Partial<Record<RestaurantPermission, boolean>> | null;
} | null;

export type PermissionFlags = Record<RestaurantPermission, boolean>;

export function getPermissionFlags(
  restaurantMembership: MembershipLike,
  isPlatformAdmin = false
): PermissionFlags {
  const fullAccess =
    isPlatformAdmin ||
    restaurantMembership?.role === "owner" ||
    restaurantMembership?.role === "manager";

  if (fullAccess) {
    return {
      can_manage_menu: true,
      can_manage_tables: true,
      can_manage_qr: true,
      can_manage_staff: true,
      can_view_analytics: true,
      can_manage_settings: true,
      can_manage_orders: true
    };
  }

  return {
    can_manage_menu: Boolean(restaurantMembership?.permissions?.can_manage_menu),
    can_manage_tables: Boolean(restaurantMembership?.permissions?.can_manage_tables),
    can_manage_qr: Boolean(restaurantMembership?.permissions?.can_manage_qr),
    can_manage_staff: Boolean(restaurantMembership?.permissions?.can_manage_staff),
    can_view_analytics: Boolean(restaurantMembership?.permissions?.can_view_analytics),
    can_manage_settings: Boolean(restaurantMembership?.permissions?.can_manage_settings),
    can_manage_orders: Boolean(restaurantMembership?.permissions?.can_manage_orders)
  };
}

export function getAdminNavItems({
  locale,
  labels,
  permissions,
  includePlatform
}: {
  locale: Locale;
  labels: {
    overview: string;
    menu: string;
    tables: string;
    qr: string;
    pos: string;
    staff: string;
    settings: string;
  };
  permissions: PermissionFlags;
  includePlatform?: boolean;
}) {
  return [
    { href: "/admin", label: labels.overview },
    permissions.can_manage_menu ? { href: "/admin/menu", label: labels.menu } : null,
    permissions.can_manage_tables ? { href: "/admin/tables", label: labels.tables } : null,
    permissions.can_manage_qr ? { href: "/admin/qr", label: labels.qr } : null,
    permissions.can_manage_staff
      ? { href: "/admin/team", label: locale === "ko" ? "팀" : "Team" }
      : null,
    permissions.can_view_analytics
      ? { href: "/admin/analytics", label: locale === "ko" ? "통계" : "Analytics" }
      : null,
    permissions.can_manage_orders ? { href: "/pos", label: labels.pos } : null,
    permissions.can_manage_orders ? { href: "/staff", label: labels.staff } : null,
    permissions.can_manage_orders
      ? { href: "/kitchen", label: locale === "ko" ? "주방" : locale === "en" ? "Kitchen" : "Küche" }
      : null,
    permissions.can_manage_settings ? { href: "/admin/settings", label: labels.settings } : null,
    includePlatform ? { href: "/platform", label: locale === "ko" ? "플랫폼" : "Platform" } : null
  ].filter(Boolean) as Array<{ href: string; label: string }>;
}

export function getStaffNavItems({
  locale,
  labels,
  permissions
}: {
  locale: Locale;
  labels: {
    overview: string;
    menu: string;
    tables: string;
    qr: string;
    pos: string;
    staff: string;
    settings: string;
  };
  permissions: PermissionFlags;
}) {
  return [
    permissions.can_manage_orders ? { href: "/staff", label: labels.staff } : null,
    permissions.can_manage_orders ? { href: "/pos", label: labels.pos } : null,
    permissions.can_manage_orders
      ? { href: "/kitchen", label: locale === "ko" ? "주방" : locale === "en" ? "Kitchen" : "Küche" }
      : null,
    permissions.can_manage_tables ? { href: "/admin/tables", label: labels.tables } : null,
    permissions.can_manage_menu ? { href: "/admin/menu", label: labels.menu } : null,
    permissions.can_manage_qr ? { href: "/admin/qr", label: labels.qr } : null,
    permissions.can_view_analytics
      ? { href: "/admin/analytics", label: locale === "ko" ? "통계" : locale === "en" ? "Analytics" : "Analysen" }
      : null,
    permissions.can_manage_staff
      ? { href: "/admin/team", label: locale === "ko" ? "팀" : locale === "en" ? "Team" : "Team" }
      : null,
    permissions.can_manage_settings ? { href: "/admin/settings", label: labels.settings } : null
  ].filter(Boolean) as Array<{ href: string; label: string }>;
}
