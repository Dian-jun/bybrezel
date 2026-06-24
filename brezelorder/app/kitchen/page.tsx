import { AppShell } from "@/components/app-shell";
import { KitchenBoard } from "@/components/kitchen/kitchen-board";
import { getRestaurantSnapshot, requireRestaurantPermission } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getPermissionFlags, getStaffNavItems } from "@/lib/permissions";

export default async function KitchenPage() {
  const { restaurant, membership, restaurantMembership } =
    await requireRestaurantPermission("can_manage_orders");
  const snapshot = await getRestaurantSnapshot(restaurant.id);
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(
    restaurantMembership,
    membership.is_platform_admin
  );

  const pageLabels = {
    de: {
      title: "Küche",
      subtitle: "Neue Bestellungen direkt in die Produktion ziehen und Schritt für Schritt abarbeiten.",
      noServiceDay:
        "Es gibt noch keinen geöffneten Betriebstag. Sobald der Service-Tag startet, erscheinen neue Bestellungen hier.",
      noOrders: "Aktuell keine Bestellungen in dieser Spalte.",
      newOrders: "Neue Bestellungen",
      acceptedOrders: "Angenommen",
      preparingOrders: "In Zubereitung",
      readyOrders: "Abholbereit",
      items: "Artikel",
      guestNotes: "Hinweise",
      allergyNotes: "Allergiehinweise",
      accept: "Bestellung annehmen",
      startCooking: "Zubereitung starten",
      markReady: "Als abholbereit markieren",
      waitingForService: "Wartet auf Service",
      fresh: "Neu",
      tableFallback: "Tisch",
      createdAt: "seit Eingang",
      guest: "Gast",
      kitchenLoad: "Aktiver Küchen-Feed",
      inQueue: "In der Warteschlange",
      inPrep: "Aktuell in Zubereitung",
      newestOrder: "Neuester Eingang"
    },
    en: {
      title: "Kitchen",
      subtitle: "Pull new orders into the kitchen and move them through prep with one tap.",
      noServiceDay:
        "There is no open service day yet. As soon as service starts, new orders will appear here.",
      noOrders: "There are no orders in this column right now.",
      newOrders: "New orders",
      acceptedOrders: "Accepted",
      preparingOrders: "Preparing",
      readyOrders: "Ready to serve",
      items: "Items",
      guestNotes: "Notes",
      allergyNotes: "Allergy notes",
      accept: "Accept order",
      startCooking: "Start preparing",
      markReady: "Mark ready",
      waitingForService: "Waiting for service",
      fresh: "Fresh",
      tableFallback: "Table",
      createdAt: "since sent",
      guest: "Guest",
      kitchenLoad: "Active kitchen feed",
      inQueue: "Queued",
      inPrep: "In prep",
      newestOrder: "Latest order"
    },
    ko: {
      title: "주방",
      subtitle: "새 주문을 바로 접수하고 조리 흐름대로 한 화면에서 처리합니다.",
      noServiceDay:
        "아직 열린 영업일이 없습니다. 영업일을 시작하면 새 주문이 여기로 들어옵니다.",
      noOrders: "이 칸에 들어온 주문이 아직 없습니다.",
      newOrders: "새 주문",
      acceptedOrders: "접수됨",
      preparingOrders: "조리 중",
      readyOrders: "조리 완료",
      items: "주문 항목",
      guestNotes: "요청사항",
      allergyNotes: "알레르기 메모",
      accept: "주문 접수",
      startCooking: "조리 시작",
      markReady: "조리 완료 처리",
      waitingForService: "홀 서빙 대기",
      fresh: "방금 들어옴",
      tableFallback: "테이블",
      createdAt: "접수 후 경과",
      guest: "손님",
      kitchenLoad: "현재 주방 대기열",
      inQueue: "대기 중",
      inPrep: "조리 중",
      newestOrder: "가장 최근 주문"
    }
  }[locale];

  return (
    <AppShell
      title={pageLabels.title}
      subtitle={pageLabels.subtitle}
      pathname="/kitchen"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={getStaffNavItems({
        locale,
        labels: dict.nav,
        permissions
      })}
    >
      <KitchenBoard
        restaurantId={restaurant.id}
        initialOrders={snapshot.orders as any}
        initialServiceDay={snapshot.currentServiceDay as any}
        locale={locale}
        labels={pageLabels}
      />
    </AppShell>
  );
}
