import { createTableAction, deleteTableAction, updateTableAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { TableLayoutEditor } from "@/components/table-layout-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastBanner } from "@/components/ui/toast-banner";
import { getRestaurantMemberships, getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

export default async function TableManagementPage({
  searchParams
}: {
  searchParams?: { toast?: string };
}) {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantPermission("can_manage_tables");
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const memberships = await getRestaurantMemberships(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);
  const toastMessages: Record<string, string> = {
    "table-created": locale === "ko" ? "테이블을 추가했습니다." : locale === "en" ? "Table created." : "Tisch wurde erstellt.",
    "table-saved": locale === "ko" ? "테이블 정보를 저장했습니다." : locale === "en" ? "Table saved." : "Tisch wurde gespeichert.",
    "layout-saved": locale === "ko" ? "변경된 레이아웃을 저장했습니다." : locale === "en" ? "Layout saved." : "Layout wurde gespeichert.",
    "table-deleted": locale === "ko" ? "테이블을 삭제했습니다." : locale === "en" ? "Table deleted." : "Tisch wurde gelöscht.",
    "floorplan-saved": locale === "ko" ? "홀 평면도 이미지를 저장했습니다." : locale === "en" ? "Floor plan saved." : "Grundrissbild wurde gespeichert.",
    "floorplan-empty": locale === "ko" ? "업로드할 평면도 이미지를 선택해 주세요." : locale === "en" ? "Choose a floor plan image to upload." : "Bitte zuerst ein Grundrissbild auswählen.",
    "floorplan-failed": locale === "ko" ? "평면도 이미지를 저장하지 못했습니다." : locale === "en" ? "Could not save the floor plan image." : "Grundrissbild konnte nicht gespeichert werden."
  };
  const layoutTables = snapshot.tables.map((table: any, index: number) => ({
    id: table.id,
    name: table.name,
    pos_x: table.pos_x ?? (index % 4) * 3,
    pos_y: table.pos_y ?? Math.floor(index / 4) * 3,
    pos_w: table.pos_w ?? 2,
    pos_h: table.pos_h ?? 2,
    pos_rotation: table.pos_rotation ?? 0
  }));

  return (
    <AppShell
      title={dict.admin.tableTitle}
      subtitle={dict.admin.tableSubtitle}
      pathname="/admin/tables"
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
      />
      <section className="surface p-5 md:p-6">
        <h2 className="text-base font-semibold">{dict.admin.addTable}</h2>
        <form action={createTableAction} className="mt-4 grid gap-3 md:grid-cols-3">
          <Input name="name" placeholder="Table 8" required />
          <Input name="seats" type="number" min="0" placeholder="Seats" />
          <Input name="sortOrder" type="number" defaultValue={0} placeholder="Sort order" />
          <p className="md:col-span-3 rounded-2xl border border-dashed border-line/70 bg-stone-50 px-4 py-3 text-xs text-stone-500">
            {locale === "ko"
              ? "새 테이블은 자동으로 배치됩니다. 생성 후 아래 배치 보드에서 직접 드래그하여 위치와 크기를 조절하세요."
              : locale === "en"
                ? "New tables are auto-placed first. Then drag and resize them directly in the board below."
                : "Neue Tische werden zuerst automatisch platziert. Danach unten per Drag-and-drop verschieben und skalieren."}
          </p>
          <div className="md:col-span-3">
            <Button type="submit">{dict.common.create}</Button>
          </div>
        </form>
      </section>

      {layoutTables.length ? (
        <div className="mt-6">
          <TableLayoutEditor
            locale={locale}
            tables={layoutTables}
            floorplanImageUrl={restaurant.floorplan_image_url}
          />
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.tables.length === 0 ? (
          <EmptyState
            title={dict.admin.noTables}
            description={dict.admin.noTablesBody}
          />
        ) : null}
        {snapshot.tables.map((table: any) => (
          <div key={table.id} className="surface p-5">
            <form action={updateTableAction} className="space-y-4">
              <input type="hidden" name="tableId" value={table.id} />
              <Input name="name" defaultValue={table.name} />
              <Input name="seats" type="number" defaultValue={table.seats ?? ""} placeholder="Seats" />
              <Input name="sortOrder" type="number" defaultValue={table.sort_order} />
              <p className="rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-500">
                {locale === "ko"
                  ? "위치와 크기는 상단 배치 보드에서 직접 조절합니다. 이 카드에서는 이름, 좌석 수, 담당 직원을 관리합니다."
                  : locale === "en"
                    ? "Position and size are adjusted in the layout board above. Use this card for name, seats, and assignment."
                    : "Position und Größe werden oben im Layout-Board gepflegt. Hier bearbeiten Sie Name, Sitzplätze und Zuständigkeit."}
              </p>
              {permissions.can_manage_staff ? (
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    {locale === "ko" ? "담당 직원" : locale === "en" ? "Assigned staff" : "Zuständige Person"}
                  </span>
                  <select
                    name="assignedMembershipId"
                    defaultValue={table.assigned_membership_id ?? ""}
                    className="min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                  >
                    <option value="">{locale === "ko" ? "미지정" : locale === "en" ? "Unassigned" : "Nicht zugewiesen"}</option>
                    {memberships.map((member: any) => (
                      <option key={member.id} value={member.id}>
                        {member.users?.full_name ?? member.users?.email}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <p className="rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-500">QR code: {table.code}</p>
              {table.assigned_membership ? (
                <p className="rounded-2xl bg-[rgba(255,106,61,0.08)] px-4 py-3 text-xs text-[var(--brand-ink)]">
                  {locale === "ko" ? "현재 담당" : locale === "en" ? "Currently assigned" : "Aktuell zuständig"}:{" "}
                  {table.assigned_membership.users?.full_name ?? table.assigned_membership.users?.email}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="submit">{dict.common.save}</Button>
              </div>
            </form>
            <form action={deleteTableAction} className="mt-3">
              <input type="hidden" name="tableId" value={table.id} />
              <Button type="submit" variant="ghost">
                {dict.common.delete}
              </Button>
            </form>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
