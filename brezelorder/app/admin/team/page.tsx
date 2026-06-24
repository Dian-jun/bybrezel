import { saveRestaurantMembershipAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ToastBanner } from "@/components/ui/toast-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRestaurantMemberships, getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

const permissionFieldMap = {
  canManageMenu: "can_manage_menu",
  canManageTables: "can_manage_tables",
  canManageQr: "can_manage_qr",
  canManageStaff: "can_manage_staff",
  canViewAnalytics: "can_view_analytics",
  canManageSettings: "can_manage_settings",
  canManageOrders: "can_manage_orders"
} as const;

export default async function TeamPage({
  searchParams
}: {
  searchParams?: { toast?: string; toastType?: string };
}) {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantPermission("can_manage_staff");
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const memberships = await getRestaurantMemberships(restaurant.id);
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);
  const toastMessages: Record<string, string> = {
    "member-saved": locale === "ko" ? "팀 권한을 저장했습니다." : "Team permissions saved.",
    "member-not-found": locale === "ko" ? "해당 이메일의 사용자를 찾지 못했습니다." : "User with that email was not found."
  };

  const permissionRows = [
    ["canManageMenu", locale === "ko" ? "메뉴 관리" : "Manage menu"],
    ["canManageTables", locale === "ko" ? "테이블 관리" : "Manage tables"],
    ["canManageQr", locale === "ko" ? "QR 관리" : "Manage QR"],
    ["canManageStaff", locale === "ko" ? "팀 권한 관리" : "Manage team"],
    ["canViewAnalytics", locale === "ko" ? "통계 보기" : "View analytics"],
    ["canManageSettings", locale === "ko" ? "설정 관리" : "Manage settings"],
    ["canManageOrders", locale === "ko" ? "주문 처리" : "Manage orders"]
  ] as const;

  return (
    <AppShell
      title={locale === "ko" ? "팀 권한" : "Team permissions"}
      subtitle={locale === "ko" ? "관리자와 직원별로 볼 수 있는 영역과 수정 권한을 제어합니다." : "Control which areas admins and staff can view or edit."}
      pathname="/admin/team"
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

      <section className="surface p-5 md:p-6">
        <h2 className="text-lg font-semibold">{locale === "ko" ? "사용자 추가 또는 권한 부여" : "Add user or assign permissions"}</h2>
        <p className="mt-2 text-sm text-stone-500">
          {locale === "ko"
            ? "매니저 역할은 팀 관리와 통계 확인 권한을 기본으로 가집니다."
            : "Manager roles receive team-management and analytics access by default."}
        </p>
        <form action={saveRestaurantMembershipAction} className="mt-4 space-y-4">
          <Input name="email" type="email" placeholder="staff@restaurant.de" required />
          <select name="role" className="min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm">
            <option value="manager">{locale === "ko" ? "매니저" : "Manager"}</option>
            <option value="staff">{locale === "ko" ? "직원" : "Staff"}</option>
          </select>
          <div className="grid gap-3 md:grid-cols-2">
            {permissionRows.map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-2xl border border-line bg-stone-50 px-4 py-3 text-sm">
                <input type="checkbox" name={key} className="h-4 w-4 rounded border-line" />
                {label}
              </label>
            ))}
          </div>
          <Button type="submit">{locale === "ko" ? "권한 저장" : "Save permissions"}</Button>
        </form>
      </section>

      <div className="mt-4 space-y-4">
        {memberships.map((membership: any) => (
          <section key={membership.id} className="surface p-5 md:p-6">
            <div className="mb-4">
              <p className="text-lg font-semibold">{membership.users?.full_name ?? membership.users?.email}</p>
              <p className="text-sm text-stone-500">{membership.users?.email}</p>
            </div>
            <form action={saveRestaurantMembershipAction} className="space-y-4">
              <input type="hidden" name="membershipId" value={membership.id} />
              <select name="role" defaultValue={membership.role} className="min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm">
                <option value="owner">{locale === "ko" ? "점주" : "Owner"}</option>
                <option value="manager">{locale === "ko" ? "매니저" : "Manager"}</option>
                <option value="staff">{locale === "ko" ? "직원" : "Staff"}</option>
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                {permissionRows.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-2xl border border-line bg-stone-50 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      name={key}
                      defaultChecked={Boolean(
                        membership.permissions?.[permissionFieldMap[key]]
                      )}
                      className="h-4 w-4 rounded border-line"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                <p className="font-medium text-ink">{locale === "ko" ? "담당 테이블" : "Zugewiesene Tische"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(snapshot.tables as any[])
                    .filter((table) => table.assigned_membership_id === membership.id)
                    .map((table) => (
                      <span key={table.id} className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">
                        {table.name}
                      </span>
                    ))}
                  {(snapshot.tables as any[]).filter((table) => table.assigned_membership_id === membership.id).length === 0 ? (
                    <span className="text-xs text-stone-500">
                      {locale === "ko" ? "아직 지정된 테이블이 없습니다." : "Noch keine Tische zugewiesen."}
                    </span>
                  ) : null}
                </div>
              </div>
              <Button type="submit">{locale === "ko" ? "권한 업데이트" : "Update permissions"}</Button>
            </form>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
