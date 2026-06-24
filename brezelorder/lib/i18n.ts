import { cookies } from "next/headers";

export const locales = ["de", "ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";
export const localeCookieName = "brezel-locale";

const dictionaries = {
  de: {
    common: {
      brand: "Brezel Order",
      language: "Sprache",
      german: "Deutsch",
      korean: "Koreanisch",
      english: "Englisch",
      save: "Speichern",
      delete: "Löschen",
      create: "Erstellen",
      signOut: "Abmelden",
      optional: "Optional",
      available: "Verfügbar",
      unavailable: "Nicht verfügbar",
      visible: "Sichtbar",
      hidden: "Versteckt"
    },
    nav: {
      overview: "Übersicht",
      menu: "Menü",
      tables: "Tische",
      qr: "QR",
      pos: "POS",
      staff: "Service",
      settings: "Einstellungen"
    },
    landing: {
      heroTitle1: "Schneller bestellen.",
      heroTitle2: "Smarter servieren.",
      heroBody:
        "Ein QR-Bestellsystem für deutsche Restaurants, das Wartezeiten reduziert, Teams entlastet und ohne POS-Wechsel live gehen kann.",
      startSetup: "Einrichtung starten",
      openStaff: "Service-Dashboard öffnen",
      whyItWorks: "Warum es funktioniert",
      features: [
        "Kein POS-Austausch",
        "In 30 Minuten startklar",
        "Mobile-first für Gäste und Service",
        "Live-Bestellungen und Serviceanfragen"
      ],
      launchPath: "So geht der Start",
      launchSteps: [
        "Menü und Kategorien direkt am Handy pflegen.",
        "Tische anlegen und QR-Bögen für den Gastraum drucken.",
        "Service-Team sieht Bestellungen live, ohne Zahlungs- oder Kassenwechsel."
      ],
      preview: "Produktvorschau",
      guestOrdering: "Gastbestellung",
      orderSent: "Bestellung an Service gesendet",
      tableNewOrder: "Tisch 7 · Neue Bestellung",
      trusted: "Für kleine und familiengeführte Teams gemacht.",
      trustedBody: "Mehr Zeit für Gastfreundschaft, weniger Zeit fürs Aufnehmen von Bestellungen.",
      startSelling: "Jetzt starten",
      startSellingBody:
        "Nächsten Monat live gehen, ohne bestehende Abläufe austauschen zu müssen.",
      createWorkspace: "Restaurant-Workspace erstellen",
      benefit1Title: "QR-Bestellung mit Premium-Gefühl",
      benefit1Body: "Gäste scannen, stöbern und bestellen in Sekunden ohne App-Download.",
      benefit2Title: "Tische schnell live schalten",
      benefit2Body: "Tische anlegen, QR-Codes erzeugen und druckbare PDFs in einem Ablauf.",
      benefit3Title: "Für den laufenden Service gebaut",
      benefit3Body: "Das Team sieht Bestellungen und Anfragen sofort auf Handy oder Tablet.",
      benefit4Title: "Einfach, sicher, wartbar",
      benefit4Body: "Supabase und Vercel halten das MVP schlank, sicher und leicht betreibbar."
    },
    auth: {
      pageTitle: "Restaurant-Bestellung, der man sofort vertraut.",
      ownerLogin: "Inhaber-Login",
      signInTitle: "Im Restaurant-Workspace anmelden",
      signInBody:
        "Verwalte Menüs, QR-Tische, Live-Bestellungen und Serviceanfragen an einem Ort.",
      signIn: "Anmelden",
      getStarted: "Loslegen",
      signUpTitle: "Erstes Restaurantkonto erstellen",
      signUpBody:
        "Die Einrichtung bleibt bewusst einfach, damit ein Restaurant in unter 30 Minuten live gehen kann.",
      createAccount: "Konto erstellen",
      agree: "Mit der Fortsetzung bestätigst du die Nutzung von Brezel Order für deinen Restaurantbetrieb.",
      back: "Zurück zur Startseite"
    },
    admin: {
      onboardingEyebrow: "Restaurant-Einrichtung",
      onboardingTitle: "Restaurant-Workspace erstellen",
      onboardingBody:
        "Das ist der einzige Pflichtschritt, bevor Menü, Tische und QR-Codes eingerichtet werden können.",
      alreadyLinked:
        "Dieser Benutzer ist bereits mit einem Restaurant verknüpft. Du kannst zurück ins Admin-Dashboard.",
      createRestaurant: "Restaurant erstellen",
      dashboardSubtitle:
        "Restaurant verwalten, Menüverfügbarkeit steuern und Service-Abläufe mobil im Blick behalten.",
      restaurantSettings: "Restaurant-Einstellungen",
      launchChecklist: "Start-Checkliste",
      restaurantLive: "Restaurant ist für Gäste live",
      saveSettings: "Einstellungen speichern",
      statsLiveView: "Live-Ansicht",
      statsMenuControl: "Menü-Steuerung",
      statsQrSetup: "QR-Einrichtung",
      statsSettings: "Einstellungen",
      checkTables: "Tische",
      checkCategories: "Menükategorien",
      checkOrders: "Letzte Bestellungen",
      checkCalls: "Offene Anfragen",
      configured: "eingerichtet",
      tracked: "erfasst",
      open: "offen",
      menuTitle: "Menüverwaltung",
      menuSubtitle:
        "Sichtbarkeit und Verfügbarkeit sind getrennt, damit saisonale oder ausverkaufte Artikel sauber gesteuert werden können.",
      addCategory: "Kategorie hinzufügen",
      addItem: "Menüpunkt hinzufügen",
      noCategories: "Noch keine Kategorien",
      noCategoriesBody:
        "Lege zuerst eine Kategorie an und füge darunter Artikel hinzu. Das Live-Menü soll in wenigen Minuten stehen.",
      tableTitle: "Tischverwaltung",
      tableSubtitle:
        "Halte Tischnamen einfach und eindeutig, damit Gastraum und Dashboard im Service synchron bleiben.",
      addTable: "Tisch hinzufügen",
      noTables: "Noch keine Tische",
      noTablesBody: "Lege Tische für QR-Codes und Live-Bestellrouting an.",
      qrTitle: "QR-Generierung",
      qrSubtitle:
        "Jeder Tisch erhält eine eindeutige Gast-URL, damit Bestellungen und Serviceanfragen sicher beim richtigen Tisch landen."
    },
    guest: {
      title: "Direkt vom Handy bestellen",
      body:
        "Menü ansehen, bestellen oder Service anfragen, ohne auf das Personal warten zu müssen.",
      quickActions: "Schnellzugriff",
      callStaff: "Service rufen",
      cartSummary: "Aktuelle Auswahl",
      floatingCart: "Warenkorb öffnen",
      serviceSheetTitle: "Wie können wir helfen?",
      serviceSheetBody: "Wähle eine Anfrage aus. Das Team sieht sie sofort im Dashboard.",
      closeSheet: "Schließen",
      cart: "Warenkorb",
      addItems: "Füge Artikel hinzu, um eine Bestellung zu starten.",
      total: "Gesamt",
      optionalName: "Optionaler Name",
      email: "E-Mail für Beleg",
      optionalNote: "Optionale Bestellnotiz",
      sendOrder: "Bestellung senden",
      sent: "Bestellung an den Service gesendet.",
      needSomething: "Noch etwas?",
      requestSentSuffix: "-Anfrage wurde gesendet.",
      jumpToCategory: "Zu Kategorie springen",
      chooseOption: "Option wählen",
      fromPrice: "ab",
      recommendedTitle: "Passt gut dazu",
      recommendedBody: "Beliebte Ergänzungen für den letzten Schritt vor dem Absenden.",
      add: "Hinzufügen",
      quantity: "Menge",
      allergyNote: "Allergiehinweis",
      allergyPlaceholder: "z. B. ohne Nüsse, ohne Milch",
      itemNote: "Zusätzlicher Wunsch",
      itemNotePlaceholder: "z. B. extra knusprig oder Sauce separat"
    },
    staff: {
      title: "Service-Dashboard",
      subtitle:
        "Auf Handy oder Tablet während des Service nutzen, um Bestellungen und Gästeanfragen live zu sehen.",
      guestOrder: "Gastbestellung",
      tableFallback: "Tisch",
      markCompleted: "Als erledigt markieren",
      referenceDate: "Schnellauswahl Datum",
      startDate: "Von",
      endDate: "Bis",
      clearPeriod: "Zeitraum löschen",
      servedRevenue: "Umsatz aus servierten Bestellungen",
      orderCount: "Bestellungen",
      servedCount: "Serviert",
      activeCalls: "Offene Anfragen",
      completedOrders: "Abgeschlossene Bestellungen",
      cancelledOrders: "Stornierte Bestellungen",
      completedCalls: "Erledigte Anfragen",
      requestTime: "Anfragezeit",
      enableAlerts: "Benachrichtigungen aktivieren",
      alertsOn: "On",
      alertsOff: "Off",
      referenceDateHint: "Zeigt genau einen verfügbaren Betriebstag.",
      rangeDateHint: "Sobald Von/Bis gesetzt ist, hat der Zeitraum Vorrang.",
      rangePriority: "Zeitraum aktiv",
      serviceDayTitle: "Aktueller Betriebstag",
      serviceDayOpen: "Betriebstag läuft",
      serviceDayClosed: "Kein aktiver Betriebstag",
      serviceDayOpenedAt: "Gestartet um",
      serviceDayDate: "Betriebsdatum",
      openServiceDay: "Betriebstag starten",
      closeServiceDay: "Betriebstag abschließen",
      serviceDayHint:
        "Das Service-Dashboard zeigt nur Bestellungen und Anfragen aus dem aktuell geöffneten Betriebstag.",
      noActiveServiceDay:
        "Sobald ein neuer Betriebstag geöffnet wird, erscheinen hier nur die aktuellen Bestellungen und Anfragen.",
      activeTableSessions: "Aktive Tischrunden",
      noActiveTableSessions: "Noch keine offene Tischrunde",
      sessionTotal: "Aktuelle Summe",
      sessionOrders: "Bestellrunden",
      sessionCheckoutRequested: "Rechnung angefragt",
      markSessionPaid: "Als bezahlt abschließen",
      assignedStaff: "Zuständig",
      completedAt: "Abgeschlossen am",
      completedBy: "Abgeschlossen von",
      servedAt: "Serviert am",
      servedBy: "Serviert von",
      unassigned: "Nicht zugewiesen"
    },
    requests: {
      call_staff: "Service",
      request_bill: "Rechnung",
      request_water: "Wasser",
      need_help: "Hilfe"
    },
    statuses: {
      new: "neu",
      accepted: "angenommen",
      preparing: "in Zubereitung",
      ready: "abholbereit",
      served: "serviert",
      cancelled: "storniert",
      completed: "erledigt",
      open: "offen"
    }
  },
  en: {
    common: {
      brand: "Brezel Order",
      language: "Language",
      german: "German",
      korean: "Korean",
      english: "English",
      save: "Save",
      delete: "Delete",
      create: "Create",
      signOut: "Sign out",
      optional: "Optional",
      available: "Available",
      unavailable: "Unavailable",
      visible: "Visible",
      hidden: "Hidden"
    },
    nav: {
      overview: "Overview",
      menu: "Menu",
      tables: "Tables",
      qr: "QR",
      pos: "POS",
      staff: "Staff",
      settings: "Settings"
    },
    landing: {
      heroTitle1: "Order faster.",
      heroTitle2: "Serve smarter.",
      heroBody:
        "A QR ordering system for restaurants in Germany that reduces waiting time, supports lean teams, and launches without replacing the POS.",
      startSetup: "Start setup",
      openStaff: "Open staff dashboard",
      whyItWorks: "Why it works",
      features: [
        "No POS replacement",
        "Ready in 30 minutes",
        "Mobile-first for guests and staff",
        "Live orders and service requests"
      ],
      launchPath: "How launch works",
      launchSteps: [
        "Manage menus and categories directly from your phone.",
        "Create tables and print QR sheets for the dining room.",
        "Staff sees live orders without changing payments or cash register workflows."
      ],
      preview: "Product preview",
      guestOrdering: "Guest ordering",
      orderSent: "Order sent to staff",
      tableNewOrder: "Table 7 · New order",
      trusted: "Made for small and family-run teams.",
      trustedBody: "More time for hospitality, less time spent taking orders.",
      startSelling: "Start now",
      startSellingBody:
        "Go live next month without replacing the way your restaurant already works.",
      createWorkspace: "Create restaurant workspace",
      benefit1Title: "Premium-feeling QR ordering",
      benefit1Body: "Guests scan, browse, and order in seconds without downloading an app.",
      benefit2Title: "Bring tables live quickly",
      benefit2Body: "Create tables, generate QR codes, and export printable PDFs in one flow.",
      benefit3Title: "Built for live service",
      benefit3Body: "Staff sees orders and requests instantly on phone or tablet.",
      benefit4Title: "Simple, secure, maintainable",
      benefit4Body: "Supabase and Vercel keep the MVP lean, secure, and easy to operate."
    },
    auth: {
      pageTitle: "Restaurant ordering that feels trustworthy from the first second.",
      ownerLogin: "Owner login",
      signInTitle: "Sign in to your restaurant workspace",
      signInBody:
        "Manage menus, QR tables, live orders, and service requests in one place.",
      signIn: "Sign in",
      getStarted: "Get started",
      signUpTitle: "Create your first restaurant account",
      signUpBody:
        "Setup stays intentionally simple so a restaurant can go live in under 30 minutes.",
      createAccount: "Create account",
      agree:
        "By continuing, you confirm that Brezel Order will be used for your restaurant operation.",
      back: "Back to landing page"
    },
    admin: {
      onboardingEyebrow: "Restaurant setup",
      onboardingTitle: "Create restaurant workspace",
      onboardingBody:
        "This is the only required step before menus, tables, and QR codes can be set up.",
      alreadyLinked:
        "This user is already linked to a restaurant. You can return to the admin dashboard.",
      createRestaurant: "Create restaurant",
      dashboardSubtitle:
        "Manage the restaurant, control menu availability, and keep service flow visible on mobile.",
      restaurantSettings: "Restaurant settings",
      launchChecklist: "Opening checklist",
      restaurantLive: "Restaurant is live for guests",
      saveSettings: "Save settings",
      statsLiveView: "Live view",
      statsMenuControl: "Menu control",
      statsQrSetup: "QR setup",
      statsSettings: "Settings",
      checkTables: "Tables",
      checkCategories: "Menu categories",
      checkOrders: "Recent orders",
      checkCalls: "Open requests",
      configured: "configured",
      tracked: "tracked",
      open: "open",
      menuTitle: "Menu management",
      menuSubtitle:
        "Visibility and availability stay separate, so seasonal or sold-out items can be controlled cleanly.",
      addCategory: "Add category",
      addItem: "Add menu item",
      noCategories: "No categories yet",
      noCategoriesBody:
        "Create a category first and add items underneath it. The live menu should be ready in minutes.",
      tableTitle: "Table management",
      tableSubtitle:
        "Keep table names simple and clear so the dining room and dashboard stay aligned during service.",
      addTable: "Add table",
      noTables: "No tables yet",
      noTablesBody: "Create tables for QR codes and live order routing first.",
      qrTitle: "QR generation",
      qrSubtitle:
        "Each table gets a unique guest URL so orders and service requests always land on the correct table."
    },
    guest: {
      title: "Order directly from your phone",
      body:
        "Browse the menu, place an order, or request staff without installing an app.",
      quickActions: "Quick actions",
      callStaff: "Call staff",
      cartSummary: "Current selection",
      floatingCart: "Open cart",
      serviceSheetTitle: "What do you need?",
      serviceSheetBody: "Choose a request and it will appear on the staff screen immediately.",
      closeSheet: "Close",
      cart: "Cart",
      addItems: "Add items to place your order from here.",
      total: "Total",
      optionalName: "Name (optional)",
      email: "Email for receipt",
      optionalNote: "Order note (optional)",
      sendOrder: "Send order",
      sent: "Your order has been sent to staff.",
      needSomething: "Need anything else?",
      requestSentSuffix: " request has been sent.",
      jumpToCategory: "Jump to category",
      chooseOption: "Choose option",
      fromPrice: "From",
      recommendedTitle: "Good to add together",
      recommendedBody: "Suggested add-ons before you send the order.",
      add: "Add",
      quantity: "Quantity",
      allergyNote: "Allergy note",
      allergyPlaceholder: "e.g. no nuts, no milk",
      itemNote: "Extra request",
      itemNotePlaceholder: "e.g. sauce on the side, less spicy"
    },
    staff: {
      title: "Staff dashboard",
      subtitle:
        "Use this on phone or tablet during service to see live orders and guest requests.",
      guestOrder: "Guest order",
      tableFallback: "Table",
      markCompleted: "Mark complete",
      referenceDate: "Quick date",
      startDate: "Start date",
      endDate: "End date",
      clearPeriod: "Clear period",
      servedRevenue: "Served revenue",
      orderCount: "Orders",
      servedCount: "Served",
      activeCalls: "Open requests",
      completedOrders: "Completed orders",
      cancelledOrders: "Cancelled orders",
      completedCalls: "Completed requests",
      requestTime: "Request time",
      enableAlerts: "Enable alerts",
      alertsOn: "On",
      alertsOff: "Off",
      referenceDateHint: "Use this for a quick single-day view.",
      rangeDateHint: "If start and end date are set, the range filter takes priority.",
      rangePriority: "Range filter active",
      serviceDayTitle: "Current service day",
      serviceDayOpen: "Service day open",
      serviceDayClosed: "No open service day",
      serviceDayOpenedAt: "Opened at",
      serviceDayDate: "Service date",
      openServiceDay: "Start service day",
      closeServiceDay: "Close service day",
      serviceDayHint:
        "The staff dashboard only shows orders and requests from the currently open service day.",
      noActiveServiceDay:
        "Once a new service day starts, only today's incoming orders and requests appear here.",
      activeTableSessions: "Active table sessions",
      noActiveTableSessions: "No active table sessions yet",
      sessionTotal: "Current total",
      sessionOrders: "Order rounds",
      sessionCheckoutRequested: "Checkout requested",
      markSessionPaid: "Mark as paid",
      assignedStaff: "Assigned staff",
      completedAt: "Completed at",
      completedBy: "Completed by",
      servedAt: "Served at",
      servedBy: "Served by",
      unassigned: "Unassigned"
    },
    requests: {
      call_staff: "Call staff",
      request_bill: "Request bill",
      request_water: "Request water",
      need_help: "Need help"
    },
    statuses: {
      new: "new",
      accepted: "accepted",
      preparing: "preparing",
      ready: "ready",
      served: "served",
      cancelled: "cancelled",
      completed: "completed",
      open: "open"
    }
  },
  ko: {
    common: {
      brand: "Brezel Order",
      language: "언어",
      german: "독일어",
      korean: "한국어",
      english: "영어",
      save: "저장",
      delete: "삭제",
      create: "생성",
      signOut: "로그아웃",
      optional: "선택",
      available: "주문 가능",
      unavailable: "품절",
      visible: "노출",
      hidden: "숨김"
    },
    nav: {
      overview: "개요",
      menu: "메뉴",
      tables: "테이블",
      qr: "QR",
      pos: "POS",
      staff: "직원",
      settings: "설정"
    },
    landing: {
      heroTitle1: "더 빠르게 주문하고",
      heroTitle2: "더 똑똑하게 서빙하세요.",
      heroBody:
        "독일 레스토랑을 위한 QR 주문 시스템으로, 대기 시간을 줄이고 인력 부족을 보완하면서 POS 교체 없이 바로 운영할 수 있습니다.",
      startSetup: "설치 시작",
      openStaff: "직원 대시보드 열기",
      whyItWorks: "핵심 장점",
      features: [
        "POS 교체 불필요",
        "30분 안에 세팅 가능",
        "손님과 직원 모두 모바일 중심",
        "실시간 주문과 호출"
      ],
      launchPath: "도입 순서",
      launchSteps: [
        "휴대폰으로 메뉴와 카테고리를 입력합니다.",
        "테이블을 만들고 QR 인쇄물을 출력합니다.",
        "결제 시스템을 바꾸지 않고도 직원이 주문을 실시간으로 확인합니다."
      ],
      preview: "제품 미리보기",
      guestOrdering: "손님 주문",
      orderSent: "직원에게 주문 전송됨",
      tableNewOrder: "7번 테이블 · 신규 주문",
      trusted: "가족 운영 식당과 소규모 팀에 맞춰 설계했습니다.",
      trustedBody: "주문 받는 시간은 줄이고, 접객에 더 집중할 수 있습니다.",
      startSelling: "도입 시작",
      startSellingBody: "기존 운영 방식을 바꾸지 않고 다음 달 바로 오픈할 수 있습니다.",
      createWorkspace: "레스토랑 워크스페이스 만들기",
      benefit1Title: "고급스럽게 느껴지는 QR 주문",
      benefit1Body: "손님은 앱 설치 없이 스캔하고 바로 둘러보고 주문할 수 있습니다.",
      benefit2Title: "테이블 세팅을 빠르게",
      benefit2Body: "테이블 생성, QR 코드 생성, 인쇄용 PDF 출력까지 한 흐름으로 처리합니다.",
      benefit3Title: "실제 서비스 운영에 맞춘 구조",
      benefit3Body: "주문과 요청이 직원 폰이나 태블릿에 즉시 표시됩니다.",
      benefit4Title: "단순하고 안정적인 구조",
      benefit4Body: "Supabase와 Vercel 기반으로 MVP를 빠르게 배포하고 유지할 수 있습니다."
    },
    auth: {
      pageTitle: "바로 신뢰할 수 있는 레스토랑 주문 시스템",
      ownerLogin: "사장님 로그인",
      signInTitle: "레스토랑 워크스페이스 로그인",
      signInBody: "메뉴, QR 테이블, 실시간 주문, 직원 호출을 한 곳에서 관리합니다.",
      signIn: "로그인",
      getStarted: "시작하기",
      signUpTitle: "첫 레스토랑 계정 만들기",
      signUpBody:
        "몇 주 안에 실제 매장에 설치할 수 있도록, 30분 안에 끝나는 단순한 온보딩으로 설계했습니다.",
      createAccount: "계정 만들기",
      agree: "계속 진행하면 Brezel Order를 본인 레스토랑 운영에 사용하는 데 동의하는 것입니다.",
      back: "랜딩 페이지로 돌아가기"
    },
    admin: {
      onboardingEyebrow: "레스토랑 설정",
      onboardingTitle: "레스토랑 워크스페이스 생성",
      onboardingBody:
        "이 단계만 끝나면 메뉴 등록, 테이블 생성, QR 코드 발급을 바로 시작할 수 있습니다.",
      alreadyLinked:
        "이 사용자 계정은 이미 레스토랑에 연결되어 있습니다. 관리자 화면으로 돌아가면 됩니다.",
      createRestaurant: "레스토랑 만들기",
      dashboardSubtitle:
        "레스토랑 설정, 메뉴 노출 여부, 서비스 운영 현황을 모바일 중심 화면에서 관리합니다.",
      restaurantSettings: "레스토랑 설정",
      launchChecklist: "오픈 체크리스트",
      restaurantLive: "손님에게 레스토랑을 공개 상태로 설정",
      saveSettings: "설정 저장",
      statsLiveView: "실시간 현황",
      statsMenuControl: "메뉴 관리",
      statsQrSetup: "QR 세팅",
      statsSettings: "설정",
      checkTables: "테이블",
      checkCategories: "메뉴 카테고리",
      checkOrders: "최근 주문",
      checkCalls: "열린 요청",
      configured: "개 설정됨",
      tracked: "건 기록됨",
      open: "건 열림",
      menuTitle: "메뉴 관리",
      menuSubtitle:
        "노출 여부와 주문 가능 여부를 분리해 두어서 계절 메뉴나 품절 메뉴를 쉽게 관리할 수 있습니다.",
      addCategory: "카테고리 추가",
      addItem: "메뉴 항목 추가",
      noCategories: "아직 카테고리가 없습니다",
      noCategoriesBody:
        "먼저 카테고리를 만들고 그 아래에 메뉴를 추가하세요. 몇 분 안에 실제 운영 가능한 메뉴를 만드는 것이 목표입니다.",
      tableTitle: "테이블 관리",
      tableSubtitle:
        "테이블 이름은 단순하고 명확하게 유지해야 실제 홀 운영과 대시보드가 헷갈리지 않습니다.",
      addTable: "테이블 추가",
      noTables: "아직 테이블이 없습니다",
      noTablesBody: "QR 코드와 주문 라우팅에 사용할 테이블을 먼저 생성하세요.",
      qrTitle: "QR 생성",
      qrSubtitle:
        "각 테이블마다 고유 손님 URL을 생성해 주문과 서비스 요청이 정확한 테이블로 들어가게 합니다."
    },
    guest: {
      title: "휴대폰으로 바로 주문하세요",
      body: "메뉴를 보고 주문하거나, 직원 호출을 요청할 수 있습니다. 앱 설치는 필요 없습니다.",
      quickActions: "빠른 실행",
      callStaff: "직원 호출",
      cartSummary: "현재 주문",
      floatingCart: "장바구니 열기",
      serviceSheetTitle: "무엇이 필요하신가요?",
      serviceSheetBody: "원하는 요청을 선택하면 직원 화면에 바로 전달됩니다.",
      closeSheet: "닫기",
      cart: "장바구니",
      addItems: "메뉴를 담으면 여기에서 주문을 보낼 수 있습니다.",
      total: "합계",
      optionalName: "이름 입력(선택)",
      email: "영수증 받을 이메일",
      optionalNote: "요청사항(선택)",
      sendOrder: "주문 보내기",
      sent: "주문이 직원에게 전달되었습니다.",
      needSomething: "추가로 필요하신가요?",
      requestSentSuffix: " 요청이 전송되었습니다.",
      jumpToCategory: "카테고리 바로가기",
      chooseOption: "옵션 선택",
      fromPrice: "부터",
      recommendedTitle: "함께 주문하면 좋은 메뉴",
      recommendedBody: "주문 전 마지막으로 함께 담기 좋은 메뉴를 추천해드려요.",
      add: "추가",
      quantity: "수량",
      allergyNote: "알레르기 요청",
      allergyPlaceholder: "예: 견과류 제외, 우유 제외",
      itemNote: "추가 요청",
      itemNotePlaceholder: "예: 소스는 따로, 조금 덜 맵게"
    },
    staff: {
      title: "직원 대시보드",
      subtitle:
        "서비스 중 휴대폰이나 태블릿에서 사용하여 들어오는 주문과 손님 요청을 실시간으로 확인합니다.",
      guestOrder: "손님 주문",
      tableFallback: "테이블",
      markCompleted: "처리 완료",
      referenceDate: "빠른 날짜 선택",
      startDate: "시작일",
      endDate: "종료일",
      clearPeriod: "기간 초기화",
      servedRevenue: "서빙 완료 기준 매출",
      orderCount: "주문 건수",
      servedCount: "서빙 완료",
      activeCalls: "현재 열린 호출",
      completedOrders: "완료된 주문",
      cancelledOrders: "취소된 주문",
      completedCalls: "완료된 호출",
      requestTime: "호출 시간",
      enableAlerts: "알림 켜기",
      alertsOn: "On",
      alertsOff: "Off",
      referenceDateHint: "하루 단위로 빠르게 볼 때 사용합니다.",
      rangeDateHint: "시작일과 종료일을 넣으면 빠른 날짜 선택보다 기간 필터가 우선 적용됩니다.",
      rangePriority: "기간 필터 적용 중",
      serviceDayTitle: "현재 영업일",
      serviceDayOpen: "영업 중",
      serviceDayClosed: "열린 영업일 없음",
      serviceDayOpenedAt: "시작 시각",
      serviceDayDate: "영업 날짜",
      openServiceDay: "영업일 시작",
      closeServiceDay: "영업일 마감",
      serviceDayHint:
        "직원 대시보드는 현재 열려 있는 영업일의 주문과 호출만 보여줍니다.",
      noActiveServiceDay:
        "새 영업일을 시작하면 그 시점부터 들어오는 오늘 주문과 호출만 이 화면에 표시됩니다.",
      activeTableSessions: "현재 테이블 세션",
      noActiveTableSessions: "아직 열린 테이블 세션이 없습니다",
      sessionTotal: "현재 합계",
      sessionOrders: "주문 라운드",
      sessionCheckoutRequested: "계산 요청됨",
      markSessionPaid: "결제 완료 처리",
      assignedStaff: "담당 직원",
      completedAt: "완료 시각",
      completedBy: "완료 담당자",
      servedAt: "서빙 완료 시각",
      servedBy: "서빙 담당자",
      unassigned: "미지정"
    },
    requests: {
      call_staff: "직원 호출",
      request_bill: "계산서 요청",
      request_water: "물 요청",
      need_help: "도움 요청"
    },
    statuses: {
      new: "신규",
      accepted: "접수",
      preparing: "준비 중",
      ready: "조리 완료",
      served: "서빙 완료",
      cancelled: "취소",
      completed: "완료",
      open: "열림"
    }
  }
} as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromCookie() {
  const value = cookies().get(localeCookieName)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
