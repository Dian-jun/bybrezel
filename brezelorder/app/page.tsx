import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MessageSquareMore,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Store,
  TabletSmartphone,
  Users
} from "lucide-react";

import { StickyNav } from "@/components/landing/sticky-nav";
import { Reveal } from "@/components/landing/reveal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";

function SectionHeader({
  eyebrow,
  title,
  description,
  inverse
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  inverse?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            inverse ? "text-[#FFFCF2]/70" : "text-[var(--brand-accent)]"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`display-title mt-3 text-3xl font-semibold md:text-5xl ${
          inverse ? "text-[#FFFCF2]" : "text-[var(--brand-ink)]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-7 md:text-lg ${
            inverse ? "text-[#FFFCF2]/72" : "text-[var(--brand-muted)]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ProductMockup({
  tableLabel,
  menuLabel,
  requestButtons,
  items,
  feedLabel,
  feedCards,
  dark = false
}: {
  tableLabel: string;
  menuLabel: string;
  requestButtons: string[];
  items: { name: string; sub: string; price: string }[];
  feedLabel: string;
  feedCards: { title: string; body: string }[];
  dark?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[420px] rounded-[2.6rem] border p-4 shadow-[0_26px_80px_rgba(37,36,34,0.18)] lg:w-[420px] lg:min-w-[420px] lg:max-w-[420px] ${
        dark
          ? "border-white/10 bg-[#403D39]/75 backdrop-blur"
          : "border-white/70 bg-[#FFFCF2]/88 backdrop-blur"
      }`}
    >
      <div
        className={`rounded-[2.2rem] border p-4 ${
          dark
            ? "border-white/10 bg-[#252422]"
            : "border-[rgba(64,61,57,0.08)] bg-[#F9F6EF]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${dark ? "text-[#EB5E28]" : "text-[var(--brand-accent)]"}`}>
              {tableLabel}
            </p>
            <p className={`mt-1 text-2xl font-semibold ${dark ? "text-[#FFFCF2]" : "text-[var(--brand-ink)]"}`}>
              Brezel Order
            </p>
          </div>
          <div
            className={`rounded-2xl p-3 ${
              dark ? "bg-[#FFFCF2] text-[#252422]" : "bg-[#252422] text-[#FFFCF2]"
            }`}
          >
            <QrCode className="h-5 w-5" />
          </div>
        </div>

        <div
          className={`mt-5 rounded-[1.8rem] border p-4 ${
            dark
              ? "border-white/10 bg-white/[0.03]"
              : "border-[rgba(64,61,57,0.08)] bg-[#FFFDF8]"
          }`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-[#CCC5B9]" : "text-[var(--brand-muted)]"}`}>
            {menuLabel}
          </p>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.name}
                className={`rounded-2xl border px-4 py-3 ${
                  dark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-[rgba(64,61,57,0.08)] bg-[#FFFCF2]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-medium ${dark ? "text-[#FFFCF2]" : "text-[var(--brand-ink)]"}`}>
                      {item.name}
                    </p>
                    <p className={`mt-1 text-sm ${dark ? "text-[#CCC5B9]" : "text-[var(--brand-muted)]"}`}>
                      {item.sub}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${dark ? "text-[#FFFCF2]" : "text-[var(--brand-ink)]"}`}>
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {requestButtons.map((item) => (
            <div
              key={item}
              className={`rounded-2xl border px-4 py-3 text-center text-sm font-medium ${
                dark
                  ? "border-white/10 bg-white/[0.04] text-[#FFFCF2]"
                  : "border-[rgba(64,61,57,0.08)] bg-[#FFFDF8] text-[var(--brand-ink)]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        <div className={`mt-4 rounded-[1.8rem] p-5 ${dark ? "bg-[#FFFCF2]/8 text-[#FFFCF2]" : "bg-[#252422] text-[#FFFCF2]"}`}>
          <p className={`text-sm ${dark ? "text-[#FFFCF2]/65" : "text-[#CCC5B9]"}`}>{feedLabel}</p>
          <div className="mt-3 space-y-3">
            {feedCards.map((card) => (
              <div key={card.title} className={`rounded-2xl px-4 py-3 ${dark ? "bg-white/[0.06]" : "bg-white/10"}`}>
                <p className="font-medium">{card.title}</p>
                <p className={`mt-1 text-sm ${dark ? "text-[#FFFCF2]/68" : "text-[#CCC5B9]"}`}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const isKo = locale === "ko";

  const content = isKo
    ? {
        builtFor: "독일 레스토랑을 위해 설계됨",
        heroTitle1: "더 빠르게 주문하고",
        heroTitle2: "더 침착하게 운영하세요",
        heroBody:
          "Brezel Order는 기존 POS 위에 얹는 가벼운 주문 레이어입니다. 손님은 QR을 스캔하고, 직원은 더 중요한 서비스에 집중합니다.",
        primaryCta: "7일 무료 시작",
        secondaryCta: "데모 보기",
        navCta: "무료로 시작",
        navLinks: [
          ["overview", "시작"],
          ["problem", "문제"],
          ["experience", "주문 레이어"],
          ["preview", "미리보기"],
          ["pricing", "요금"],
          ["faq", "FAQ"]
        ] as Array<[string, string]>,
        miniPoints: [
          { icon: ShieldCheck, label: "POS 교체 없음" },
          { icon: TabletSmartphone, label: "추가 하드웨어 없음" },
          { icon: Clock3, label: "30분 안에 세팅" }
        ],
        problemEyebrow: "왜 필요한가",
        problemTitle: "매장은 바쁘고, 손님은 기다립니다.",
        problemBody:
          "인력은 부족하고 호출은 반복됩니다. 주문 속도를 높이기 위해 운영 시스템 전체를 바꾸는 것은 너무 큰 일입니다.",
        pains: [
          { icon: Users, title: "인력 부족", body: "반복 주문 응대가 접객 시간을 계속 잠식합니다." },
          { icon: Clock3, title: "주문 지연", body: "피크 타임에는 주문 대기가 길어지고 테이블 회전이 느려집니다." },
          { icon: MessageSquareMore, title: "반복 호출", body: "물, 계산서, 도움 요청이 서비스 흐름을 자주 끊습니다." },
          { icon: CreditCard, title: "무거운 교체 비용", body: "POS를 바꾸는 프로젝트는 비싸고 오래 걸립니다." }
        ],
        layerEyebrow: "가벼운 주문 레이어",
        layerTitleLead: "운영 전환 없이,",
        layerTitleTail: "주문 경험만 바꿉니다.",
        layerBody:
          "기존 워크플로는 그대로 두고 주문과 호출만 더 매끄럽게 만듭니다. 필요한 건 QR과 브라우저뿐입니다.",
        layerPoints: [
          "현재 POS와 함께 사용",
          "손님 앱 설치 불필요",
          "직원 화면은 휴대폰과 태블릿에 최적화"
        ],
        benefitsEyebrow: "왜 Brezel Order인가",
        benefitsTitle: "또 하나의 POS가 아닙니다.",
        benefitsBody: "설비를 늘리지 않고, 주문과 응답만 더 정확하고 빠르게 정리합니다.",
        benefitsAside:
          "운영 프로젝트를 새로 시작하지 않아도, 손님이 체감하는 주문 경험은 충분히 개선할 수 있습니다.",
        benefits: [
          { icon: ShieldCheck, title: "기존 세팅 유지", body: "POS와 결제 단말은 그대로 사용합니다." },
          { icon: TabletSmartphone, title: "추가 장비 불필요", body: "키오스크나 손님용 태블릿 없이 시작합니다." },
          { icon: Smartphone, title: "모바일 우선 UX", body: "손님은 익숙한 휴대폰 화면에서 바로 주문합니다." },
          { icon: Clock3, title: "30분 이내 도입", body: "테이블 생성, QR 출력, 메뉴 입력만 끝내면 바로 운영 가능합니다." }
        ],
        previewEyebrow: "제품 미리보기",
        previewTitle: "손님, 직원, 점주가 같은 흐름을 공유합니다.",
        previewBody: "과장된 기능 대신, 실제 운영에 바로 필요한 화면만 남겼습니다.",
        guests: "손님용",
        staff: "직원용",
        owners: "점주용",
        previewGuestTitle: "메뉴 탐색과 주문",
        previewStaffTitle: "실시간 주문 피드",
        previewOwnerTitle: "간단한 모바일 관리",
        previewGuestPoints: [
          ["QR 메뉴", "카테고리별로 빠르게 이동하고 바로 담을 수 있습니다."],
          ["장바구니", "수량과 총액이 명확하게 보입니다."],
          ["직원 호출", "물, 계산서, 도움 요청을 한 번에 보냅니다."]
        ],
        previewStaffPoints: [
          ["주문 상태 업데이트", "새 주문과 호출이 즉시 들어옵니다."],
          ["테이블 단위 확인", "어느 테이블에서 어떤 요청이 왔는지 빠르게 파악합니다."]
        ],
        previewOwnerPoints: [
          ["가격/품절 수정", "모바일에서 바로 반영합니다."],
          ["QR 생성", "테이블별 링크를 인쇄용으로 정리합니다."],
          ["운영 통계", "주문 흐름과 매출을 빠르게 확인합니다."]
        ],
        timelineEyebrow: "어떻게 동작하나",
        timelineTitle: "QR 스캔부터 서빙까지.",
        timelineBody: "직원이 새 시스템을 배우는 데 오래 걸리지 않도록 흐름을 단순하게 유지합니다.",
        timeline: [
          "테이블 생성",
          "QR 출력",
          "손님 주문",
          "직원 실시간 확인",
          "서빙 완료"
        ],
        pricingEyebrow: "요금 안내",
        pricingTitle: "테이블 수에 맞게 시작하고, 매장 규모에 맞게 확장하세요.",
        pricingBody:
          "점주가 가장 직관적으로 이해할 수 있도록 Brezel Order는 테이블 수 기준으로 요금을 설계했습니다. 작은 매장은 가볍게, 더 큰 홀은 자연스럽게 확장할 수 있습니다.",
        pricingBadge: "월 단위 결제 · 7일 무료 체험 · 초기 메뉴 세팅 지원",
        pricingSupportTitle: "도입은 가볍게, 첫 설정은 더 쉽게",
        pricingSupportBody:
          "첫 7일은 무료로 시작할 수 있고, 런치 초기에는 레스토랑 메뉴 등록을 직접 도와드립니다.",
        pricingFootnote: "장기 계약 없음 · 추가 하드웨어 없음 · 기존 POS 그대로 유지",
        pricingSetupTitle: "10분 설치 가이드",
        pricingSetupBody: "점주가 준비물부터 테스트 주문까지 바로 따라할 수 있는 공개 온보딩 화면도 함께 제공합니다.",
        pricingSetupCta: "설치 가이드 보기",
        pricingPlans: [
          {
            name: "Starter",
            price: "29",
            priceSuffix: "/ 월",
            staffCount: "최대 10개 테이블",
            description: "카페, 소형 레스토랑, 점주 중심 운영 매장에 적합합니다.",
            features: [
              "QR 주문",
              "직원 호출",
              "메뉴/가격 수정",
              "무제한 테이블",
              "QR 코드 생성",
              "이메일 영수증"
            ],
            cta: "Starter로 시작"
          },
          {
            name: "Growth",
            price: "49",
            priceSuffix: "/ 월",
            staffCount: "최대 25개 테이블",
            description: "홀 운영 분배와 호출 대응을 여러 직원이 함께 처리하는 중형 매장에 맞습니다.",
            features: [
              "Starter의 모든 기능",
              "실시간 직원 대시보드",
              "직원별 테이블 담당 배정",
              "완료 처리 담당 기록",
              "기본 통계 대시보드",
              "우선 지원"
            ],
            cta: "Team으로 시작",
            featured: true
          },
          {
            name: "Scale",
            priceText: "맞춤 상담",
            staffCount: "26개 테이블 이상",
            description: "여러 구역 운영이나 더 큰 홀 구조가 있다면 매장 환경에 맞게 제안드립니다.",
            features: [
              "추가 테이블 구조 확장",
              "매장별 운영 구조 설계",
              "온보딩 지원",
              "멀티 매장 대응 옵션"
            ],
            cta: "맞춤 상담 요청"
          }
        ],
        faqEyebrow: "자주 묻는 질문",
        faqTitle: "도입 전에 많이 묻는 질문.",
        faqBody: "기존 운영을 바꾸지 않는다는 점이 가장 중요합니다.",
        faqs: [
          ["POS를 교체해야 하나요?", "아니요. Brezel Order는 기존 POS와 함께 작동합니다."],
          ["새 카드 단말기가 필요한가요?", "아니요. 현재 결제 환경을 그대로 유지하면 됩니다."],
          ["손님이 앱을 설치해야 하나요?", "아니요. 모든 기능은 브라우저에서 동작합니다."],
          ["세팅에는 얼마나 걸리나요?", "보통 30분 정도면 시작할 수 있습니다."],
          ["가격은 어떻게 정해지나요?", "가격은 테이블 수를 기준으로 정합니다. 점주는 현재 운영 중인 좌석 규모만으로 바로 플랜을 이해할 수 있고, 매장 확장 시에도 예측이 쉽습니다."],
          ["무료 체험은 어떻게 제공되나요?", "첫 7일은 무료로 사용해본 뒤 계속 사용할지 결정할 수 있습니다."],
          ["초기 세팅도 도와주나요?", "네. 런치 초기에는 메뉴 등록을 직접 도와드려 30분 안에 시작할 수 있도록 맞춰드립니다."]
        ],
        finalTitle: "레스토랑 운영 생산성을 한 단계 끌어올릴 준비가 되셨나요?",
        finalBody: "주문 흐름과 직원 협업을 더 정리된 방식으로. 기존 운영은 그대로 두고 바로 시작할 수 있습니다.",
        finalPrimary: "7일 무료 시작",
        finalSecondary: "데모 보기",
        footerTagline: "Order faster. Serve smarter.",
        footerLinks: [
          ["#overview", "시작"],
          ["#preview", "제품"],
          ["#pricing", "요금"],
          ["#faq", "FAQ"]
        ] as Array<[string, string]>,
        footerLegal: "Impressum",
        stepLabel: "단계",
        tableLabel: "테이블 7",
        guestMenuLabel: "손님 메뉴",
        mockItems: [
          { name: "양념치킨", sub: "Yangnyeom Chicken · M", price: "€14.90" },
          { name: "브레첼 플래터", sub: "Brezelplatte", price: "€9.50" },
          { name: "탄산수", sub: "Wasser", price: "€3.20" }
        ],
        requestButtons: ["직원 호출", "계산서 요청", "물 요청", "도움 요청"],
        staffFeedLabel: "직원 피드",
        feedCards: [
          { title: "테이블 7 · 신규 주문", body: "메뉴 2개 · 직원 화면으로 즉시 전송" },
          { title: "계산서 요청", body: "새로고침 없이 바로 확인 가능" }
        ]
      }
    : {
        builtFor: "Für Restaurants in Deutschland entwickelt",
        heroTitle1: "Schneller bestellen,",
        heroTitle2: "Ruhiger servieren",
        heroBody:
          "Brezel Order ist eine leichte Bestellschicht auf dem bestehenden Restaurantbetrieb. Gäste scannen einen QR-Code, während sich das Team stärker auf Service konzentrieren kann.",
        primaryCta: "7 Tage gratis testen",
        secondaryCta: "Demo ansehen",
        navCta: "Kostenlos starten",
        navLinks: [
          ["overview", "Start"],
          ["problem", "Problem"],
          ["experience", "Bestellschicht"],
          ["preview", "Vorschau"],
          ["pricing", "Preise"],
          ["faq", "FAQ"]
        ] as Array<[string, string]>,
        miniPoints: [
          { icon: ShieldCheck, label: "Kein POS-Wechsel" },
          { icon: TabletSmartphone, label: "Keine Zusatzhardware" },
          { icon: Clock3, label: "Start in 30 Minuten" }
        ],
        problemEyebrow: "Warum das wichtig ist",
        problemTitle: "Wenn das Team überlastet ist, wird auch der Gastraum langsamer",
        problemBody:
          "Restaurants kämpfen mit Personalmangel, wiederkehrenden Serviceanfragen und langen Wartezeiten beim Bestellen. Das komplette System auszutauschen ist selten realistisch.",
        pains: [
          { icon: Users, title: "Personalmangel", body: "Wiederkehrende Bestellaufnahme nimmt Zeit für echte Gastfreundschaft." },
          { icon: Clock3, title: "Bestellverzögerungen", body: "Zu Stoßzeiten bremsen Wartezeiten den Service und den Tischumschlag." },
          { icon: MessageSquareMore, title: "Wiederholte Anfragen", body: "Wasser, Rechnung und Hilfe unterbrechen den Ablauf immer wieder." },
          { icon: CreditCard, title: "Teure Systemwechsel", body: "Eine vollständige POS-Migration ist teuer, langsam und riskant." }
        ],
        layerEyebrow: "Leichte Bestellschicht",
        layerTitleLead: "Nicht den Betrieb umbauen",
        layerTitleTail: "- nur das Bestellen verbessern",
        layerBody:
          "Brezel Order ergänzt die Abläufe, denen Ihr Team bereits vertraut. QR-Codes, Browser-Bestellung und ein ruhiges Service-Dashboard reichen für den Start.",
        layerPoints: [
          "Funktioniert mit dem bestehenden POS",
          "Keine App-Installation für Gäste",
          "Service-Dashboard für Handy und Tablet optimiert"
        ],
        benefitsEyebrow: "Warum Brezel Order",
        benefitsTitle: "Kein weiteres Kassensystem",
        benefitsBody: "Die bestehende Infrastruktur bleibt vertraut. Bestellungen werden nur einfacher organisiert.",
        benefitsAside:
          "Man braucht keinen kompletten Betriebsumbau, um den Bestellprozess für Gäste spürbar angenehmer zu machen.",
        benefits: [
          { icon: ShieldCheck, title: "Bestehendes Setup behalten", body: "POS und Kartenterminal bleiben genau dort, wo sie heute sind." },
          { icon: TabletSmartphone, title: "Kein Hardware-Rollout", body: "Keine Kioske. Keine Gästetablets. Keine zusätzliche Gerätepflege." },
          { icon: Smartphone, title: "Mobile-First für Gäste", body: "Gäste bestellen auf dem eigenen Smartphone in einer klaren Browser-Oberfläche." },
          { icon: Clock3, title: "In 30 Minuten live", body: "Tische anlegen, QR-Codes drucken, Menü einpflegen und starten." }
        ],
        previewEyebrow: "Produktvorschau",
        previewTitle: "Ein Produkt. Drei ruhige Oberflächen",
        previewBody: "Gastfluss, Service-Dashboard und Inhaber-Tools bleiben bewusst reduziert.",
        guests: "Für Gäste",
        staff: "Für Service",
        owners: "Für Inhaber",
        previewGuestTitle: "Stöbern und bestellen",
        previewStaffTitle: "Live-Bestellfeed",
        previewOwnerTitle: "Schlanke mobile Verwaltung",
        previewGuestPoints: [
          ["QR-Menü", "Kategorien schnell durchgehen und direkt bestellen."],
          ["Warenkorb", "Summen und Mengenänderungen bleiben klar verständlich."],
          ["Serviceanfragen", "Wasser, Rechnung und Hilfe sind nur einen Tap entfernt."]
        ],
        previewStaffPoints: [
          ["Echtzeit-Updates", "Neue Bestellungen und Anfragen erscheinen sofort."],
          ["Tischbezogene Übersicht", "Das Team sieht direkt, welcher Tisch Aufmerksamkeit braucht."]
        ],
        previewOwnerPoints: [
          ["Preise und Verfügbarkeit", "Das Live-Menü direkt vom Handy aus aktualisieren."],
          ["QR-Erstellung", "Saubere Tisch-QR-Bögen zum direkten Druck."],
          ["Betriebsübersicht", "Bestellungen und Serviceaktivität ohne Zusatztools im Blick behalten."]
        ],
        timelineEyebrow: "So funktioniert es",
        timelineTitle: "Vom QR-Scan bis zur servierten Bestellung",
        timelineBody: "Der Ablauf bleibt so kurz, dass das Team ihn in wenigen Minuten versteht.",
        timeline: [
          "Tische anlegen",
          "QR-Codes drucken",
          "Gäste bestellen",
          "Service erhält Updates",
          "Speisen servieren"
        ],
        pricingEyebrow: "Preise",
        pricingTitle: "Nach Tischanzahl starten. Mit dem Gastraum sauber mitwachsen.",
        pricingBody:
          "Brezel Order wird nach Tischanzahl bepreist, damit Inhaber die Logik sofort verstehen. Kleine Betriebe starten leicht, größere Flächen erweitern planbar.",
        pricingBadge: "Monatlich kündbar · 7 Tage kostenlos · Menüeinrichtung zum Start inklusive",
        pricingSupportTitle: "Schneller Start ohne Projektstress",
        pricingSupportBody:
          "Die ersten 7 Tage sind kostenlos. In der frühen Launch-Phase übernehmen wir auf Wunsch auch die Ersteinrichtung Ihres Menüs.",
        pricingFootnote: "Keine Einrichtungsgebühr · Kein POS-Wechsel · Keine Zusatzhardware",
        pricingSetupTitle: "10-Minuten-Setup",
        pricingSetupBody: "Eine klare Inhaber-Anleitung führt durch Vorbereitung, Menüpflege, QR-Druck und die erste Testbestellung.",
        pricingSetupCta: "Setup-Anleitung öffnen",
        pricingPlans: [
          {
            name: "Starter",
            price: "29",
            priceSuffix: "/ Monat",
            staffCount: "Bis zu 10 Tische",
            description: "Für Cafés, kleine Restaurants und inhabergeführte Betriebe.",
            features: [
              "QR-Bestellung",
              "Serviceanfragen",
              "Menü- und Preisverwaltung",
              "Unbegrenzte Tische",
              "QR-Code-Erstellung",
              "E-Mail-Belege"
            ],
            cta: "Starter wählen"
          },
          {
            name: "Growth",
            price: "49",
            priceSuffix: "/ Monat",
            staffCount: "Bis zu 25 Tische",
            description: "Für mittlere Restaurants mit mehreren aktiv betreuten Tischbereichen.",
            features: [
              "Alles aus Starter",
              "Live-Service-Dashboard",
              "Tischzuweisung pro Mitarbeiter",
              "Abschluss- und Servicehistorie",
              "Betriebsübersicht und Kennzahlen",
              "Priorisierter Support"
            ],
            cta: "Team wählen",
            featured: true
          },
          {
            name: "Scale",
            priceText: "Individuell",
            staffCount: "Ab 26 Tischen",
            description: "Für größere Gasträume oder mehrere Standorte mit abgestimmtem Setup.",
            features: [
              "Erweiterbare Tischstruktur",
              "Setup für mehrere Standorte",
              "Begleitete Einführung",
              "Optionen für komplexere Abläufe"
            ],
            cta: "Beratung anfragen"
          }
        ],
        faqEyebrow: "FAQ",
        faqTitle: "Fragen, die Inhaber vor dem Start stellen",
        faqBody: "Das zentrale Versprechen ist einfach: weniger Warten, kein Austausch der Abläufe.",
        faqs: [
          ["Muss ich mein POS austauschen?", "Nein. Brezel Order läuft neben Ihrem bestehenden POS."],
          ["Brauche ich ein neues Kartenlesegerät?", "Nein. Ihr aktuelles Zahlungssystem kann unverändert weiterlaufen."],
          ["Müssen Gäste eine App installieren?", "Nein. Alles funktioniert direkt im Browser."],
          ["Wie lange dauert die Einrichtung?", "Etwa 30 Minuten."],
          ["Wie funktioniert die Preislogik?", "Abgerechnet wird nach Tischanzahl. Das ist für Inhaber sofort verständlich und bleibt auch bei wechselnden Schichten klar kalkulierbar."],
          ["Gibt es eine kostenlose Testphase?", "Ja. Sie können Brezel Order 7 Tage kostenlos testen, bevor ein kostenpflichtiger Plan startet."],
          ["Helfen Sie beim Start?", "Ja. Während der Launch-Phase unterstützen wir auf Wunsch auch direkt bei der Menüeinrichtung."],
          ["Sind Website oder Reservierungen enthalten?", "Nicht im Kernprodukt. Beides ist eher ein optionales Zusatzmodul für später, damit Brezel Order im Alltag bewusst schlank bleibt."]
        ],
        finalTitle: "Bereit, Produktivität und Organisation im Restaurant sichtbar zu verbessern?",
        finalBody: "Weniger Wartezeit für Gäste. Mehr Übersicht für das Team. Ohne den laufenden Betrieb umzubauen.",
        finalPrimary: "7 Tage gratis testen",
        finalSecondary: "Demo ansehen",
        footerTagline: "Order faster. Serve smarter.",
        footerLinks: [
          ["#overview", "Start"],
          ["#preview", "Produkt"],
          ["#pricing", "Preise"],
          ["#faq", "FAQ"]
        ] as Array<[string, string]>,
        footerLegal: "Impressum",
        stepLabel: "Schritt",
        tableLabel: "Tisch 7",
        guestMenuLabel: "Speisekarte",
        mockItems: [
          { name: "Yangnyeom Chicken", sub: "양념치킨 · M", price: "€14.90" },
          { name: "Pretzel Board", sub: "Brezelplatte", price: "€9.50" },
          { name: "Sparkling Water", sub: "Wasser", price: "€3.20" }
        ],
        requestButtons: ["Service rufen", "Rechnung anfragen", "Wasser bestellen", "Hilfe anfordern"],
        staffFeedLabel: "Service-Feed",
        feedCards: [
          { title: "Tisch 7 · Neue Bestellung", body: "2 Artikel · sofort an den Service gesendet" },
          { title: "Rechnung angefragt", body: "Ohne Seitenreload sofort sichtbar" }
        ]
      };

  const flowIcons = [ScanLine, Smartphone, Store, LayoutDashboard, Banknote];
  const timelineSurfaces = [
    "bg-[rgba(239,230,255,0.72)]",
    "bg-[rgba(243,226,249,0.72)]",
    "bg-[rgba(247,223,242,0.72)]",
    "bg-[rgba(251,219,235,0.72)]",
    "bg-[rgba(255,215,200,0.72)]"
  ];
  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-ink)]">
      <header className="sticky top-0 z-50 border-b border-[rgba(64,61,57,0.08)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.82)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="min-w-0">
            <p className="display-title text-lg font-semibold text-[var(--brand-ink)]">
              Brezel Order
            </p>
          </div>
          <StickyNav links={content.navLinks} className="hidden items-center gap-2 lg:flex" />
          <div className="flex items-center gap-3">
            <LanguageSwitcher
              locale={locale}
              label={dict.common.language}
              options={[
                { value: "de", label: dict.common.german },
                { value: "ko", label: dict.common.korean },
                { value: "en", label: dict.common.english }
              ]}
            />
            <Link href="/pricing" className="hidden sm:block">
              <Button className="rounded-full bg-[var(--brand-accent)] px-5 text-white hover:bg-[#d75424]">
                {content.navCta}
              </Button>
            </Link>
          </div>
        </div>
        <div className="border-t border-[rgba(64,61,57,0.06)] lg:hidden">
          <StickyNav
            links={content.navLinks}
            className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 md:px-6"
          />
        </div>
      </header>

      <section id="overview" className="relative overflow-hidden scroll-mt-32">
        <div className="animate-gradient-drift absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_right,rgba(235,94,40,0.18),transparent_32%),radial-gradient(circle_at_top_left,rgba(204,197,185,0.42),transparent_28%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-20 pt-12 md:px-6 md:pb-28 md:pt-16 lg:grid-cols-[1.02fr_0.98fr] xl:gap-4">
          <Reveal className="relative z-10">
            <p className="inline-flex rounded-full border border-[rgba(235,94,40,0.18)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
              {content.builtFor}
            </p>
            <h1 className="display-title mt-6 max-w-[11.5ch] text-4xl font-semibold leading-[1.12] text-[var(--brand-ink)] md:max-w-[12ch] md:text-6xl">
              <span className="block lg:whitespace-nowrap">{content.heroTitle1}</span>
              <span className="mt-2 inline-block overflow-visible pb-[0.14em] lg:whitespace-nowrap bg-[linear-gradient(90deg,var(--brand-lilac),var(--brand-accent))] bg-clip-text text-transparent">
                {content.heroTitle2}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--brand-muted)] md:text-xl">
              {content.heroBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing">
                <Button className="w-full rounded-full bg-[var(--brand-accent)] px-6 text-white hover:bg-[#d75424] sm:w-auto">
                  {content.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/staff">
                <Button
                  variant="secondary"
                  className="w-full rounded-full border-[rgba(64,61,57,0.16)] bg-[rgba(255,252,242,0.68)] px-6 text-[var(--brand-ink)] hover:bg-[rgba(255,252,242,0.9)] sm:w-auto"
                >
                  {content.secondaryCta}
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {content.miniPoints.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.label} delay={120 + index * 90}>
                    <div className="flex items-center gap-3 px-1 py-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-lilac-soft)] text-[var(--brand-accent)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-[var(--brand-ink)]">{item.label}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="relative z-10 lg:justify-self-end" delay={140}>
            <div className="animate-pulse-glow absolute inset-6 rounded-[3rem] bg-[linear-gradient(180deg,rgba(244,223,199,0.72),rgba(255,255,255,0))] blur-3xl" />
            <div className="animate-float-soft">
              <ProductMockup
                tableLabel={content.tableLabel}
                menuLabel={content.guestMenuLabel}
                requestButtons={content.requestButtons}
                items={content.mockItems}
                feedLabel={content.staffFeedLabel}
                feedCards={content.feedCards}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="problem" className="scroll-mt-32 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              eyebrow={content.problemEyebrow}
              title={content.problemTitle}
              description={content.problemBody}
            />
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[rgba(64,61,57,0.12)] md:grid-cols-2 xl:grid-cols-4">
            {content.pains.map((pain, index) => {
              const Icon = pain.icon;

              return (
                <Reveal key={pain.title} delay={index * 90}>
                  <article
                    className={`h-full p-6 md:p-7 ${
                      index % 2 === 0 ? "bg-[var(--brand-panel)]" : "bg-[rgba(204,197,185,0.24)]"
                    }`}
                  >
                    <div className="inline-flex rounded-full bg-[rgba(235,94,40,0.12)] p-3 text-[var(--brand-accent)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                      {pain.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">{pain.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="experience" className="relative overflow-hidden scroll-mt-32 py-16 text-[#FFFCF2] md:py-24">
        <Image
          src="/german-bistro-hero.png"
          alt="German restaurant team and guests in a calm dining atmosphere"
          fill
          className="object-cover blur-[2px]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(47,44,41,0.82),rgba(47,44,41,0.55)_40%,rgba(255,106,61,0.28))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,182,255,0.4),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,106,61,0.28),transparent_34%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal className="relative z-10">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFFCF2]/72">
                {content.layerEyebrow}
              </p>
              <h2 className="display-title mt-3 text-3xl font-semibold text-[#FFFCF2] md:text-5xl">
                <span className="block">{content.layerTitleLead}</span>
                <span className="block">{content.layerTitleTail}</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-[#FFFCF2]/72 md:text-lg">
                {content.layerBody}
              </p>
            </div>
            <div className="mt-8 space-y-4">
              {content.layerPoints.map((point, index) => (
                <Reveal key={point} delay={120 + index * 80}>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-[#FFFCF2]/84">
                    {point}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="preview" className="scroll-mt-32 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeader eyebrow={content.previewEyebrow} title={content.previewTitle} description={content.previewBody} />
          </Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal className="border-t border-[rgba(64,61,57,0.16)] pt-6">
              <p className="max-w-md text-lg leading-8 text-[var(--brand-muted)]">
                {content.benefitsAside}
              </p>
            </Reveal>
            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[rgba(64,61,57,0.12)] md:grid-cols-2">
              {content.benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <Reveal key={benefit.title} delay={index * 90}>
                    <article className="h-full bg-[var(--brand-panel)] p-6 md:p-7">
                      <div className="inline-flex rounded-full bg-[rgba(235,94,40,0.12)] p-3 text-[var(--brand-accent)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                        {benefit.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">{benefit.body}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              eyebrow={content.benefitsEyebrow}
              title={content.benefitsTitle}
              description={content.benefitsBody}
            />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Reveal>
              <article className="flex h-full min-h-[32rem] flex-col rounded-[2rem] border border-[rgba(204,182,255,0.3)] bg-[linear-gradient(135deg,rgba(239,230,255,0.9),rgba(255,255,255,0.96))] p-6 md:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  {content.guests}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--brand-ink)]">
                  {content.previewGuestTitle}
                </h3>
                <div className="mt-6 flex flex-1 flex-col divide-y divide-[rgba(64,61,57,0.12)]">
                  {content.previewGuestPoints.map(([title, body]) => (
                    <div key={title} className="py-4 first:pt-0 last:pb-0">
                      <p className="font-medium text-[var(--brand-ink)]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--brand-muted)]">{body}</p>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>

            <Reveal delay={90}>
              <article className="flex h-full min-h-[32rem] flex-col rounded-[2rem] bg-[linear-gradient(145deg,var(--brand-accent),#ff835f)] p-6 text-white md:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/88">
                  {content.staff}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#FFFCF2]">
                  {content.previewStaffTitle}
                </h3>
                <div className="mt-6 flex flex-1 flex-col divide-y divide-white/20">
                  {content.previewStaffPoints.map(([title, body]) => (
                    <div key={title} className="py-4 first:pt-0 last:pb-0">
                      <p className="font-medium text-[#FFFCF2]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#FFFCF2]/78">{body}</p>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>

            <Reveal delay={180}>
              <article className="flex h-full min-h-[32rem] flex-col rounded-[2rem] border border-[rgba(255,106,61,0.22)] bg-[linear-gradient(135deg,rgba(255,240,230,0.94),rgba(245,232,255,0.92))] p-6 md:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  {content.owners}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--brand-ink)]">
                  {content.previewOwnerTitle}
                </h3>
                <div className="mt-6 flex flex-1 flex-col divide-y divide-[rgba(64,61,57,0.12)]">
                  {content.previewOwnerPoints.map(([title, body]) => (
                    <div key={title} className="py-4 first:pt-0 last:pb-0">
                      <p className="font-medium text-[var(--brand-ink)]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--brand-muted)]">{body}</p>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              eyebrow={content.timelineEyebrow}
              title={content.timelineTitle}
              description={content.timelineBody}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {content.timeline.map((step, index) => {
              const Icon = flowIcons[index];

              return (
                <Reveal key={step} delay={index * 80}>
                  <div className={`h-full min-h-[13.5rem] rounded-[2rem] border border-[rgba(204,182,255,0.22)] p-5 ${timelineSurfaces[index]}`}>
                    <div className="inline-flex rounded-2xl bg-white/70 p-3 text-[var(--brand-accent)] shadow-[0_8px_18px_rgba(255,106,61,0.08)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-[var(--brand-accent)]">
                      {content.stepLabel} {index + 1}
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                      {step}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-32 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              eyebrow={content.pricingEyebrow}
              title={content.pricingTitle}
              description={content.pricingBody}
            />
          </Reveal>
          <Reveal delay={80} className="mt-8">
            <div className="inline-flex rounded-full border border-[rgba(235,94,40,0.12)] bg-[rgba(255,252,242,0.8)] px-4 py-2 text-sm font-medium text-[var(--brand-accent)]">
              {content.pricingBadge}
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {content.pricingPlans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 90}>
                <article
                  className={`flex h-full flex-col rounded-[2.2rem] border p-6 md:p-7 ${
                    plan.featured
                      ? "border-[rgba(235,94,40,0.24)] bg-[linear-gradient(145deg,rgba(255,240,230,0.94),rgba(245,232,255,0.92))] shadow-[0_24px_60px_rgba(235,94,40,0.08)]"
                      : "border-[rgba(64,61,57,0.12)] bg-[rgba(255,252,242,0.82)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                        {plan.name}
                      </p>
                      <p className="mt-3 text-sm font-medium text-[var(--brand-muted)]">
                        {plan.staffCount}
                      </p>
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full bg-[var(--brand-accent)] px-3 py-1 text-xs font-semibold text-white">
                        Best Value
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-6">
                    {plan.price ? (
                      <div className="flex items-end gap-2">
                        <p className="text-5xl font-semibold tracking-[-0.05em] text-[var(--brand-ink)]">
                          €{plan.price}
                        </p>
                        <p className="pb-2 text-sm text-[var(--brand-muted)]">{plan.priceSuffix}</p>
                      </div>
                    ) : (
                      <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)]">
                        {plan.priceText}
                      </p>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">
                    {plan.description}
                  </p>
                  <div className="mt-6 flex-1 space-y-3 border-t border-[rgba(64,61,57,0.1)] pt-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--brand-accent)]" />
                        <span className="text-sm leading-6 text-[var(--brand-ink)]">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Link href="/pricing">
                      <Button
                        className={`w-full rounded-full px-6 ${
                          plan.featured
                            ? "bg-[var(--brand-accent)] text-white hover:bg-[#d75424]"
                            : "bg-[var(--brand-ink)] text-white hover:bg-black"
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="mt-8 rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] p-6 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  {content.pricingSupportTitle}
                </p>
                <p className="mt-4 max-w-md text-base leading-7 text-[var(--brand-muted)]">
                  {content.pricingSupportBody}
                </p>
                <Link
                  href="/setup"
                  className="mt-4 inline-flex items-center text-sm font-medium text-[var(--brand-accent)] hover:text-[#d75424]"
                >
                  {content.pricingSetupCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.6rem] bg-white/70 px-5 py-5">
                  <p className="text-sm leading-7 text-[var(--brand-ink)]">
                    {content.pricingFootnote}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(64,61,57,0.08)] bg-white/50 px-5 py-5">
                  <p className="text-sm font-semibold text-[var(--brand-ink)]">
                    {content.pricingSetupTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
                    {content.pricingSetupBody}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="scroll-mt-32 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              eyebrow={content.faqEyebrow}
              title={content.faqTitle}
              description={content.faqBody}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {content.faqs.map(([q, a], index) => (
              <Reveal key={q} delay={index * 70}>
                <details className="rounded-[1.8rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] px-5 py-5">
                  <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                    {q}
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[var(--brand-muted)]">{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[linear-gradient(120deg,var(--brand-lilac-soft),var(--brand-lilac)_35%,var(--brand-accent-soft)_68%,var(--brand-accent))] px-4 pb-16 pt-8 md:px-0 md:pb-24">
        <div className="mx-auto max-w-6xl px-0 md:px-6">
          <Reveal className="px-6 py-12 text-[var(--brand-ink)] md:px-10 md:py-16">
            <h2 className="display-title max-w-4xl text-4xl font-semibold md:text-6xl">
              {content.finalTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(37,36,34,0.76)] md:text-lg">
              {content.finalBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing">
                <Button className="w-full rounded-full bg-[var(--brand-ink)] px-6 text-white hover:bg-black sm:w-auto">
                  {content.finalPrimary}
                </Button>
              </Link>
              <Link href="/staff">
                <Button
                  variant="secondary"
                  className="w-full rounded-full border-[rgba(37,36,34,0.14)] bg-white/55 px-6 text-[var(--brand-ink)] hover:bg-white/75 sm:w-auto"
                >
                  {content.finalSecondary}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[var(--brand-ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-[#FFFCF2] md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="display-title text-2xl font-semibold">Brezel Order</p>
            <p className="mt-2 text-sm text-white/64">
              {content.footerTagline}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/72">
            {content.footerLinks.map(([href, label]) => (
              href.startsWith("#") ? (
                <a key={href} href={href} className="hover:text-white">
                  {label}
                </a>
              ) : null
            ))}
            <Link href="/pricing" className="hover:text-white">
              {isKo ? "요금" : "Preise"}
            </Link>
            <Link href="/impressum" className="hover:text-white">
              {content.footerLegal}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
