import { AppShell } from "@/components/app-shell";
import { StaffDashboard } from "@/components/staff/staff-dashboard";
import { getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getPermissionFlags, getStaffNavItems } from "@/lib/permissions";

export default async function StaffPage() {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantPermission("can_manage_orders");
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);

  return (
    <AppShell
      title={dict.staff.title}
      subtitle={dict.staff.subtitle}
      pathname="/staff"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={getStaffNavItems({
        locale,
        labels: dict.nav,
        permissions
      })}
    >
      <StaffDashboard
        restaurantId={restaurant.id}
        initialOrders={snapshot.orders as any}
        initialCalls={snapshot.calls as any}
        initialTableSessions={snapshot.tableSessions as any}
        initialServiceDay={snapshot.currentServiceDay as any}
        locale={locale}
        labels={{
          requests: dict.requests,
          statuses: dict.statuses,
          guestOrder: dict.staff.guestOrder,
          tableFallback: dict.staff.tableFallback,
          markCompleted: dict.staff.markCompleted,
          servedRevenue: dict.staff.servedRevenue,
          orderCount: dict.staff.orderCount,
          servedCount: dict.staff.servedCount,
          activeCalls: dict.staff.activeCalls,
          completedOrders: dict.staff.completedOrders,
          cancelledOrders: dict.staff.cancelledOrders,
          completedCalls: dict.staff.completedCalls,
          requestTime: dict.staff.requestTime,
          enableAlerts: dict.staff.enableAlerts,
          alertsOn: dict.staff.alertsOn,
          alertsOff: dict.staff.alertsOff,
          serviceDayTitle: dict.staff.serviceDayTitle,
          serviceDayOpen: dict.staff.serviceDayOpen,
          serviceDayClosed: dict.staff.serviceDayClosed,
          serviceDayOpenedAt: dict.staff.serviceDayOpenedAt,
          serviceDayDate: dict.staff.serviceDayDate,
          openServiceDay: dict.staff.openServiceDay,
          closeServiceDay: dict.staff.closeServiceDay,
          serviceDayHint: dict.staff.serviceDayHint,
          noActiveServiceDay: dict.staff.noActiveServiceDay,
          activeTableSessions: dict.staff.activeTableSessions,
          noActiveTableSessions: dict.staff.noActiveTableSessions,
          sessionTotal: dict.staff.sessionTotal,
          sessionOrders: dict.staff.sessionOrders,
          sessionCheckoutRequested: dict.staff.sessionCheckoutRequested,
          markSessionPaid: dict.staff.markSessionPaid,
          assignedStaff: dict.staff.assignedStaff,
          completedAt: dict.staff.completedAt,
          completedBy: dict.staff.completedBy,
          servedAt: dict.staff.servedAt,
          servedBy: dict.staff.servedBy,
          unassigned: dict.staff.unassigned
        }}
      />
    </AppShell>
  );
}
