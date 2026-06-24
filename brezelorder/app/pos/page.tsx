import { AppShell } from "@/components/app-shell";
import { PosBoard } from "@/components/pos/pos-board";
import { getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

export default async function PosPage() {
  const { restaurant, membership, restaurantMembership } =
    await requireRestaurantPermission("can_manage_orders");
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(
    restaurantMembership,
    membership.is_platform_admin
  );

  return (
    <AppShell
      title={locale === "ko" ? "POS 보드" : locale === "en" ? "POS board" : "POS Board"}
      subtitle={
        locale === "ko"
          ? "테이블별 진행 상태, 누적 금액, 계산 요청을 카운터 시점에서 빠르게 확인하고 마감합니다."
          : locale === "en"
            ? "Monitor table status, running totals, and bill requests quickly from the counter view."
            : "Behalte Tischstatus, laufende Summen und Checkout-Anfragen aus Sicht des Counters im Blick."
      }
      pathname="/pos"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={getAdminNavItems({
        locale,
        labels: dict.nav,
        permissions,
        includePlatform: membership.is_platform_admin
      })}
    >
      <PosBoard
        locale={locale}
        initialTables={snapshot.tables as any}
        initialCategories={snapshot.categories as any}
        initialOrders={snapshot.orders as any}
        initialCalls={snapshot.calls as any}
        initialTableSessions={snapshot.tableSessions as any}
        floorplanImageUrl={restaurant.floorplan_image_url}
        restaurantId={restaurant.id}
        labels={{
          boardEyebrow: locale === "ko" ? "카운터 운영 보기" : locale === "en" ? "Counter view" : "Counter view",
          liveNow: locale === "ko" ? "POS 테이블 맵" : locale === "en" ? "POS table map" : "POS Tischplan",
          noSessions:
            locale === "ko"
              ? "아직 열린 테이블 세션이 없습니다."
              : locale === "en"
                ? "There are no active table sessions yet."
              : "Aktuell ist keine Tischrunde offen.",
          checkoutRequested: locale === "ko" ? "계산 요청" : locale === "en" ? "Bill requested" : "Rechnung angefragt",
          openSession: locale === "ko" ? "진행 중" : locale === "en" ? "Active" : "Läuft",
          paid: locale === "ko" ? "결제 완료" : locale === "en" ? "Paid" : "Bezahlt",
          orderRounds: locale === "ko" ? "주문 라운드" : locale === "en" ? "Order rounds" : "Bestellrunden",
          openCalls: locale === "ko" ? "열린 호출" : locale === "en" ? "Open requests" : "Offene Rufe",
          total: locale === "ko" ? "누적 금액" : locale === "en" ? "Running total" : "Laufende Summe",
          lastActivity: locale === "ko" ? "마지막 활동" : locale === "en" ? "Last activity" : "Letzte Aktivität",
          assignedStaff: dict.staff.assignedStaff,
          unassigned: dict.staff.unassigned,
          sessionDetail: locale === "ko" ? "선택한 테이블 상세" : locale === "en" ? "Selected table details" : "Tischdetails",
          ordersTitle: locale === "ko" ? "주문 내역" : locale === "en" ? "Orders" : "Bestellungen",
          callsTitle: locale === "ko" ? "호출 내역" : locale === "en" ? "Service requests" : "Serviceanfragen",
          emptyOrders:
            locale === "ko" ? "아직 접수된 주문이 없습니다." : locale === "en" ? "No orders recorded yet." : "Noch keine Bestellung erfasst.",
          emptyCalls:
            locale === "ko" ? "열린 호출이 없습니다." : locale === "en" ? "No open requests." : "Keine offene Anfrage.",
          markPaid: locale === "ko" ? "결제 완료 처리" : locale === "en" ? "Mark as paid" : "Als bezahlt markieren",
          closeSession: locale === "ko" ? "세션 종료" : locale === "en" ? "Close session" : "Tischrunde schließen",
          processing: locale === "ko" ? "처리 중..." : locale === "en" ? "Processing..." : "Wird verarbeitet...",
          newOrder: locale === "ko" ? "신규 주문" : locale === "en" ? "New order" : "Neue Bestellung",
          readyOrder: locale === "ko" ? "조리 완료" : locale === "en" ? "Ready to serve" : "Abholbereit",
          requestBill: locale === "ko" ? "계산 필요" : locale === "en" ? "Payment pending" : "Rechnung offen",
          itemCount: locale === "ko" ? "상품 수" : locale === "en" ? "Items" : "Artikel",
          guestNote: locale === "ko" ? "요청사항" : locale === "en" ? "Guest note" : "Hinweis",
          tableFallback: dict.staff.tableFallback,
          requestLabels: dict.requests,
          emptyTable: locale === "ko" ? "비어 있음" : locale === "en" ? "Empty" : "Leer",
          activeTable: locale === "ko" ? "활성 테이블" : locale === "en" ? "Active table" : "Aktiv",
          manualOrder: locale === "ko" ? "직접 주문 추가" : locale === "en" ? "Add manual order" : "Bestellung manuell hinzufügen",
          manualOrderDescription:
            locale === "ko"
              ? "직원이 직접 받은 주문을 이 테이블 세션에 바로 추가합니다."
              : locale === "en"
                ? "Add an order taken directly by staff to this table session."
                : "Füge hier Bestellungen hinzu, die das Team direkt am Tisch aufgenommen hat.",
          manualDraftEmpty:
            locale === "ko"
              ? "메뉴를 추가하면 이곳에 수동 주문 초안이 쌓입니다."
              : locale === "en"
                ? "Selected items for a manual order will appear here."
                : "Ausgewählte Positionen für eine manuelle Bestellung erscheinen hier.",
          manualCategory: locale === "ko" ? "카테고리" : locale === "en" ? "Category" : "Kategorie",
          manualItem: locale === "ko" ? "메뉴" : locale === "en" ? "Item" : "Artikel",
          manualVariant: locale === "ko" ? "옵션" : locale === "en" ? "Option" : "Variante",
          manualQuantity: locale === "ko" ? "수량" : locale === "en" ? "Quantity" : "Menge",
          manualGuestName: locale === "ko" ? "손님 이름(선택)" : locale === "en" ? "Guest name (optional)" : "Gastname (optional)",
          manualGuestEmail: locale === "ko" ? "영수증 이메일(선택)" : locale === "en" ? "Receipt email (optional)" : "Beleg-E-Mail (optional)",
          manualNotes: locale === "ko" ? "주문 메모(선택)" : locale === "en" ? "Order note (optional)" : "Bestellnotiz (optional)",
          manualItemNote: locale === "ko" ? "항목 메모(선택)" : locale === "en" ? "Item note (optional)" : "Artikelnotiz (optional)",
          manualAllergyNote: locale === "ko" ? "알레르기 메모(선택)" : locale === "en" ? "Allergy note (optional)" : "Allergiehinweis (optional)",
          manualAddLine: locale === "ko" ? "항목 추가" : locale === "en" ? "Add line" : "Position hinzufügen",
          manualSubmit: locale === "ko" ? "수동 주문 저장" : locale === "en" ? "Save manual order" : "Manuelle Bestellung speichern",
          manualSubmitting: locale === "ko" ? "저장 중..." : locale === "en" ? "Saving..." : "Wird gespeichert...",
          manualSaved:
            locale === "ko"
              ? "직접 주문이 추가되었습니다."
              : locale === "en"
                ? "Manual order added."
                : "Manuelle Bestellung wurde hinzugefügt.",
          manualSourceTag: locale === "ko" ? "수동 주문" : locale === "en" ? "Manual order" : "Manuell",
          manualSelectPrompt:
            locale === "ko"
              ? "메뉴를 먼저 선택해주세요."
              : locale === "en"
                ? "Please choose a menu item first."
                : "Bitte wähle zuerst einen Artikel aus.",
          manualTableHint:
            locale === "ko"
              ? "빈 테이블에서도 주문을 추가하면 바로 새 세션이 열립니다."
              : locale === "en"
                ? "Adding an order to an empty table opens a new session immediately."
                : "Wenn du für einen leeren Tisch bestellst, wird sofort eine neue Runde geöffnet.",
          manualNoVariant: locale === "ko" ? "기본 옵션" : locale === "en" ? "Base option" : "Basisoption",
          manualFavorites: locale === "ko" ? "빠른 추가" : locale === "en" ? "Quick favorites" : "Schnellauswahl",
          manualQuickQuantity: locale === "ko" ? "빠른 수량" : locale === "en" ? "Quick quantity" : "Schnellmenge",
          manualCurrentSelection:
            locale === "ko"
              ? "현재 선택 메뉴"
              : locale === "en"
                ? "Current selection"
                : "Aktuell ausgewählter Artikel",
          manualDraftTitle: locale === "ko" ? "수동 주문 초안" : locale === "en" ? "Manual order draft" : "Entwurf",
          manualQuickAdd: locale === "ko" ? "한 번 탭해 바로 담기" : locale === "en" ? "Tap once to add" : "Einmal tippen zum Hinzufügen",
          manualShowDetails: locale === "ko" ? "상세 입력" : locale === "en" ? "More details" : "Mehr Details",
          manualHideDetails: locale === "ko" ? "접기" : locale === "en" ? "Hide details" : "Weniger",
          layoutHint:
            locale === "ko"
              ? "테이블 위치는 관리자 > 테이블에서 미리 배치할 수 있고, 주문이 들어오면 해당 자리 카드만 활성화됩니다."
              : locale === "en"
                ? "Table positions can be arranged in Admin > Tables in advance. Only the matching card becomes active when orders arrive."
              : "Die Tischpositionen werden vorab unter Verwaltung > Tische definiert. Bei Aktivität belebt sich nur der passende Platz."
        }}
      />
    </AppShell>
  );
}
