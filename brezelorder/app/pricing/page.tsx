import Link from "next/link";
import { ArrowRight, Banknote, Check, ChevronRight, Clock3, Headset, LayoutDashboard, Mail, MessageSquareText, QrCode, ShieldCheck, Sparkles, Store, TrendingUp, Users } from "lucide-react";

import { startPricingCheckoutAction, submitPricingInquiryAction } from "@/app/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";

function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
        {eyebrow}
      </p>
      <h1 className="display-title mt-3 text-4xl font-semibold text-[var(--brand-ink)] md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--brand-muted)] md:text-lg">
        {description}
      </p>
    </div>
  );
}

export default function PricingPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const isKo = locale === "ko";

  const inquiryState = typeof searchParams?.inquiry === "string" ? searchParams.inquiry : "";
  const checkoutState = typeof searchParams?.checkout === "string" ? searchParams.checkout : "";

  const content = isKo
    ? {
        title: "인건비 부담을 줄이는 QR 테이블 오더",
        eyebrow: "요금 안내",
        description:
          "손님은 QR 코드로 직접 주문하고, 직원은 서비스에 집중하세요. 브레젤 오더는 레스토랑 운영을 더 효율적으로 만드는 QR 테이블 오더입니다.",
        back: "홈으로 돌아가기",
        cta: "무료 체험 시작하기",
        badge: "첫 100개 레스토랑 한정 · 평생 €59 보장 · 2주 무료 체험",
        foundingEyebrow: "🎉 Founding Restaurant",
        foundingTitle: "독일 첫 100개 레스토랑만 제공되는 특별 혜택",
        foundingBadge: "첫 100개 한정",
        foundingPrice: "€59",
        foundingSuffix: "/ 월",
        foundingOriginalPrice: "€89 정상가",
        foundingGuarantee: "평생 €59 보장",
        foundingBenefits: [
          { icon: Sparkles, label: "2주 무료 체험" },
          { icon: ShieldCheck, label: "평생 €59 유지" },
          { icon: LayoutDashboard, label: "메뉴 등록 무료" },
          { icon: QrCode, label: "QR 테이블 사인 무료 제작" },
          { icon: Headset, label: "우선 고객 지원" }
        ],
        salesTitle: "왜 지금 가입해야 하나?",
        salesPoints: [
          {
            icon: Banknote,
            title: "€59 = 직원 약 3~4시간 인건비",
            body: "한 달에 주문 응대 시간만 4시간 줄여도 이용료를 회수할 수 있습니다."
          },
          {
            icon: Clock3,
            title: "주문 응대 시간 감소",
            body: "손님이 직접 주문하니 주문 받는 동선과 대기 시간이 동시에 줄어듭니다."
          },
          {
            icon: Store,
            title: "테이블 회전율 향상",
            body: "피크 타임에도 주문 병목이 줄어 더 빠르게 다음 손님을 받을 수 있습니다."
          },
          {
            icon: TrendingUp,
            title: "객단가 향상",
            body: "메뉴를 천천히 보고 추가 주문까지 이어져 자연스럽게 평균 주문 금액이 올라갑니다."
          }
        ],
        compareTitle: "Founding Restaurant vs 일반 요금",
        compareBody: "초기 혜택과 정가 플랜의 차이를 한눈에 보여줍니다.",
        inquiryTitle: "직접 이야기하고 시작하고 싶다면",
        inquiryBody: "초기 세팅, 메뉴 등록, 운영 방식까지 함께 맞추고 싶다면 문의 폼으로 남겨주세요.",
        setupTitle: "10분 설치 가이드",
        setupBody: "점주가 바로 따라할 수 있도록 준비물, 메뉴 등록, QR 출력, 테스트 주문까지 한 화면에 정리했습니다.",
        setupCta: "설치 가이드 보기",
        faqTitle: "가격 관련 질문",
        faqBody: "가격을 설명할 때는 기능 개수보다 운영 효과가 먼저 보여야 합니다.",
        footerTitle: "작게 시작해서, 매장 운영이 정리되는 지점까지.",
        footerBody: "7일 무료 체험 후 계속 사용할지 결정할 수 있습니다.",
        formTitle: "도입 문의 남기기",
        formDescription: "보통 1영업일 안에 답변드리고, 필요하면 메뉴 등록 방식까지 함께 제안드립니다.",
        restaurantName: "레스토랑 이름",
        city: "도시",
        contactName: "담당자 이름",
        email: "이메일",
        phone: "전화번호",
        desiredPlan: "희망 플랜",
        tableCount: "예상 테이블 수",
        message: "메시지",
        submitInquiry: "문의 보내기",
        starterCheckout: "무료 체험 시작하기",
        teamCheckout: "무료 체험 시작하기",
        contactSales: "상담 문의",
        successInquiry: "문의가 접수되었습니다. 곧 연락드릴게요.",
        errorInquiry: "문의 저장 중 문제가 생겼습니다. 다시 시도해 주세요.",
        missingInquiry: "필수 항목을 먼저 입력해 주세요.",
        checkoutNotReady: "Stripe 키가 아직 연결되지 않아 문의 전환으로 안내합니다.",
        checkoutCancelled: "체크아웃이 취소되었습니다. 원하시면 문의로 먼저 시작할 수 있습니다.",
        checkoutSuccess: "체크아웃이 시작되었습니다. Stripe에서 다음 단계를 완료해 주세요.",
        checkoutError: "체크아웃 세션 생성에 실패했습니다. 문의 폼으로 먼저 받아드릴 수 있습니다.",
        plans: [
          {
            key: "founding",
            name: "Founding Restaurant",
            price: "€59",
            suffix: "/ 월",
            label: "첫 100개 레스토랑 한정",
            description: "가장 먼저 시작하는 레스토랑을 위한 런치 혜택 플랜입니다.",
            features: [
              "평생 €59 유지",
              "2주 무료 체험",
              "메뉴 등록 무료",
              "QR 테이블 사인 무료 제작",
              "우선 고객 지원",
              "QR 주문 / 다국어 / 분석 기능 포함"
            ],
            featured: true
          },
          {
            key: "starter",
            name: "Starter",
            price: "€89",
            suffix: "/ 월",
            label: "일반 시작 요금",
            description: "런치 혜택 종료 후 적용되는 기본 요금입니다.",
            features: [
              "QR 주문",
              "직원 호출",
              "무제한 주문",
              "다국어",
              "분석 기능",
              "별도 온보딩"
            ]
          },
          {
            key: "team",
            name: "Growth",
            price: "맞춤",
            suffix: "/ 월",
            label: "확장/복수 매장",
            description: "다수 매장, 큰 홀, 커스텀 운영 구조가 필요한 경우 상담 후 제안합니다.",
            features: [
              "멀티 매장 대응",
              "도입 지원",
              "추가 운영 기능 협의"
            ]
          }
        ],
        comparisonRows: [
          ["월 요금", "€59", "€89"],
          ["평생 가격 보장", "✅", "❌"],
          ["2주 무료 체험", "✅", "❌"],
          ["메뉴 등록", "무료", "별도"],
          ["QR 사인 제작", "무료", "별도"],
          ["QR 메뉴", "✅", "✅"],
          ["QR 주문", "✅", "✅"],
          ["무제한 주문", "✅", "✅"],
          ["다국어", "✅", "✅"],
          ["분석 기능", "✅", "✅"]
        ],
        faq: [
          ["Founding Restaurant는 왜 더 저렴한가요?", "초기 100개 레스토랑과 함께 제품을 빠르게 다듬기 위한 런치 프로그램이기 때문입니다."],
          ["가격은 정말 평생 유지되나요?", "네. Founding Restaurant로 시작한 매장은 해지 전까지 월 €59가 그대로 유지됩니다."],
          ["2주 무료 체험 후에는 어떻게 되나요?", "무료 체험 후 계속 사용을 원할 때만 Founding Restaurant 월 요금이 적용됩니다."],
          ["언제든 해지할 수 있나요?", "네. 장기 약정 없이 언제든 중단할 수 있습니다."]
        ]
      }
    : {
        title: "QR-Tischbestellung, die Personalkosten spürbar entlastet",
        eyebrow: "Preise",
        description:
          "Gäste bestellen per QR-Code, Ihr Team konzentriert sich auf Service. Brezel Order macht den Restaurantbetrieb einfacher, schneller und profitabler.",
        back: "Zurück zur Startseite",
        cta: "Kostenlose Testphase starten",
        badge: "Nur für die ersten 100 Restaurants · Dauerhaft €59 · 2 Wochen kostenlos testen",
        foundingEyebrow: "🎉 Founding Restaurant",
        foundingTitle: "Sonderkonditionen nur für die ersten 100 Restaurants in Deutschland",
        foundingBadge: "Nur 100 Restaurants",
        foundingPrice: "€59",
        foundingSuffix: "/ Monat",
        foundingOriginalPrice: "€89 regulär",
        foundingGuarantee: "Dauerhaft €59 gesichert",
        foundingBenefits: [
          { icon: Sparkles, label: "2 Wochen kostenlos testen" },
          { icon: ShieldCheck, label: "Dauerhaft €59 behalten" },
          { icon: LayoutDashboard, label: "Menüeinrichtung kostenlos" },
          { icon: QrCode, label: "QR-Tischschilder kostenlos" },
          { icon: Headset, label: "Priorisierter Support" }
        ],
        salesTitle: "Warum sich ein früher Start lohnt",
        salesPoints: [
          {
            icon: Banknote,
            title: "€59 entsprechen nur etwa 3 bis 4 Stunden Lohnkosten",
            body: "Wenn Sie im Monat nur wenige Stunden Bestellaufwand sparen, ist die Gebühr bereits wieder eingespielt."
          },
          {
            icon: Clock3,
            title: "Weniger Zeit für Bestellannahme",
            body: "Weniger Laufwege und weniger Wartezeit, weil Gäste selbst bestellen können."
          },
          {
            icon: Store,
            title: "Bessere Tischrotation",
            body: "Gerade zu Stoßzeiten werden Bestellungen schneller ausgelöst und Tische zügiger wieder frei."
          },
          {
            icon: TrendingUp,
            title: "Höherer Bon pro Tisch",
            body: "Wer in Ruhe durchs Menü geht, bestellt häufiger noch ein Getränk oder eine weitere Runde dazu."
          }
        ],
        compareTitle: "Founding Restaurant vs. regulärer Tarif",
        compareBody: "Die wichtigsten Unterschiede für einen schnellen Kaufentscheid.",
        inquiryTitle: "Lieber erst persönlich besprechen?",
        inquiryBody: "Wenn Sie Start, Menüpflege oder Team-Setup gemeinsam abstimmen möchten, schicken Sie uns kurz Ihre Daten.",
        setupTitle: "10-Minuten-Setup",
        setupBody: "Eine klare Schritt-für-Schritt-Anleitung für Inhaber: vorbereiten, Menü einpflegen, QR drucken, Testbestellung senden, live gehen.",
        setupCta: "Setup-Anleitung öffnen",
        faqTitle: "Fragen zur Preislogik",
        faqBody: "Gute SaaS-Preise wirken glaubwürdig, wenn sie den operativen Hebel klar zeigen.",
        footerTitle: "Klein starten. Ruhiger organisieren. Dann gezielt ausbauen.",
        footerBody: "Nach 7 kostenlosen Tagen entscheiden Sie in Ruhe, ob Brezel Order in Ihren Alltag passt.",
        formTitle: "Verkaufsanfrage senden",
        formDescription: "Wir melden uns in der Regel innerhalb eines Werktags und helfen auf Wunsch direkt bei der Menüeinrichtung.",
        restaurantName: "Restaurantname",
        city: "Stadt",
        contactName: "Ansprechpartner",
        email: "E-Mail",
        phone: "Telefon",
        desiredPlan: "Gewünschter Plan",
        tableCount: "Geplante Anzahl Tische",
        message: "Nachricht",
        submitInquiry: "Anfrage senden",
        starterCheckout: "Kostenlose Testphase starten",
        teamCheckout: "Kostenlose Testphase starten",
        contactSales: "Beratung anfragen",
        successInquiry: "Ihre Anfrage wurde gespeichert. Wir melden uns zeitnah.",
        errorInquiry: "Die Anfrage konnte nicht gespeichert werden. Bitte erneut versuchen.",
        missingInquiry: "Bitte zuerst alle Pflichtfelder ausfüllen.",
        checkoutNotReady: "Stripe ist noch nicht hinterlegt. Nutzen Sie vorerst bitte das Anfrageformular.",
        checkoutCancelled: "Der Checkout wurde abgebrochen. Auf Wunsch starten wir auch erst mit einer Beratung.",
        checkoutSuccess: "Checkout gestartet. Bitte schließen Sie den nächsten Schritt bei Stripe ab.",
        checkoutError: "Die Checkout-Session konnte nicht erstellt werden. Nutzen Sie bitte das Anfrageformular.",
        plans: [
          {
            key: "founding",
            name: "Founding Restaurant",
            price: "€59",
            suffix: "/ Monat",
            label: "Nur für die ersten 100 Restaurants",
            description: "Launch-Vorteile für frühe Restaurantpartner.",
            features: [
              "Dauerhaft €59",
              "2 Wochen kostenlos testen",
              "Menüeinrichtung kostenlos",
              "QR-Tischschilder kostenlos",
              "Priorisierter Support",
              "QR-Bestellung / Mehrsprachigkeit / Analytics"
            ],
            featured: true
          },
          {
            key: "starter",
            name: "Starter",
            price: "€89",
            suffix: "/ Monat",
            label: "Regulärer Einstieg",
            description: "Standardpreis nach Ende des Launch-Angebots.",
            features: [
              "QR-Bestellung",
              "Serviceanfragen",
              "Unbegrenzte Bestellungen",
              "Mehrsprachig",
              "Analytics",
              "Onboarding separat"
            ]
          },
          {
            key: "team",
            name: "Growth",
            price: "Individuell",
            suffix: "/ Monat",
            label: "Mehr Fläche / mehrere Standorte",
            description: "Für größere Gasträume oder mehrere Standorte.",
            features: [
              "Mehrere Standorte",
              "Begleitete Einführung",
              "Abstimmung zusätzlicher Betriebsfunktionen"
            ]
          }
        ],
        comparisonRows: [
          ["Monatspreis", "€59", "€89"],
          ["Dauerhafte Preisgarantie", "✅", "❌"],
          ["2 Wochen kostenlos testen", "✅", "❌"],
          ["Menüeinrichtung", "Kostenlos", "Separat"],
          ["QR-Schilder", "Kostenlos", "Separat"],
          ["QR-Menü", "✅", "✅"],
          ["QR-Bestellung", "✅", "✅"],
          ["Unbegrenzte Bestellungen", "✅", "✅"],
          ["Mehrsprachig", "✅", "✅"],
          ["Analytics", "✅", "✅"]
        ],
        faq: [
          ["Warum ist das Founding Restaurant Angebot günstiger?", "Weil wir die ersten 100 Restaurantpartner bewusst mit einem stärkeren Einstiegsvorteil gewinnen und eng begleiten möchten."],
          ["Bleibt der Preis wirklich dauerhaft bei €59?", "Ja. Solange Sie Kunde bleiben, bleibt der Founding Restaurant Preis aktiv."],
          ["Was passiert nach den 2 kostenlosen Wochen?", "Nur wenn Sie weitermachen möchten, startet der Founding Restaurant Tarif mit €59 pro Monat."],
          ["Kann ich jederzeit kündigen?", "Ja. Es gibt keine langfristige Bindung."]
        ]
      };

  const plans = content.plans;
  const alertMessage =
    inquiryState === "success"
      ? content.successInquiry
      : inquiryState === "error"
        ? content.errorInquiry
        : inquiryState === "missing"
          ? content.missingInquiry
          : checkoutState === "not-ready"
            ? content.checkoutNotReady
            : checkoutState === "cancelled"
              ? content.checkoutCancelled
              : checkoutState === "success"
                ? content.checkoutSuccess
                : checkoutState === "error"
                  ? content.checkoutError
                  : "";

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-ink)]">
      <header className="sticky top-0 z-50 border-b border-[rgba(64,61,57,0.08)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.82)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="display-title text-lg font-semibold text-[var(--brand-ink)]">
            Brezel Order
          </Link>
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
            <Link href="/">
              <Button
                variant="secondary"
                className="rounded-full border-[rgba(64,61,57,0.12)] bg-white px-5 text-[var(--brand-ink)] hover:bg-[var(--brand-panel)]"
              >
                {content.back}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(204,182,255,0.26),transparent_24%),radial-gradient(circle_at_top_right,rgba(235,94,40,0.16),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
          <div className="mt-6 inline-flex rounded-full border border-[rgba(235,94,40,0.12)] bg-[rgba(255,252,242,0.82)] px-4 py-2 text-sm font-medium text-[var(--brand-accent)]">
            {content.badge}
          </div>

          {alertMessage ? (
            <div className="mt-6 rounded-[1.6rem] border border-[rgba(235,94,40,0.16)] bg-[linear-gradient(135deg,rgba(255,240,230,0.9),rgba(245,232,255,0.82))] px-5 py-4 text-sm text-[var(--brand-ink)]">
              {alertMessage}
            </div>
          ) : null}

          <div className="mt-10 rounded-[2.4rem] border border-[rgba(242,107,77,0.18)] bg-[linear-gradient(145deg,#fff7f3,rgba(255,252,242,0.98),#fff1ea)] p-6 shadow-[0_28px_80px_rgba(242,107,77,0.12)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-[var(--brand-accent)] px-3 py-1 text-xs font-semibold text-white">
                    {content.foundingBadge}
                  </span>
                  <span className="text-sm font-semibold text-[var(--brand-accent)]">
                    {content.foundingEyebrow}
                  </span>
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-ink)] md:text-5xl">
                  {content.foundingTitle}
                </h2>
                <div className="mt-8 flex items-end gap-3">
                  <p className="text-6xl font-semibold tracking-[-0.06em] text-[var(--brand-ink)] md:text-7xl">
                    {content.foundingPrice}
                  </p>
                  <p className="pb-3 text-lg text-[var(--brand-muted)]">{content.foundingSuffix}</p>
                </div>
                <p className="mt-3 text-lg text-[var(--brand-muted)] line-through">{content.foundingOriginalPrice}</p>
                <p className="mt-5 text-xl font-semibold text-[var(--brand-accent)] md:text-2xl">
                  {content.foundingGuarantee}
                </p>
                <div className="mt-8 space-y-3">
                  {content.foundingBenefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={benefit.label} className="flex items-center gap-3 rounded-[1.3rem] bg-white/72 px-4 py-3">
                        <div className="rounded-2xl bg-[rgba(242,107,77,0.12)] p-2 text-[var(--brand-accent)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-[var(--brand-ink)] md:text-base">{benefit.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8">
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#de5c3e]"
                  >
                    {content.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-[rgba(64,61,57,0.08)] bg-[#252422] p-6 text-[#FFFCF2]">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F26B4D]">Founding Restaurant</p>
                  <p className="mt-4 text-sm leading-7 text-[#CCC5B9]">
                    {isKo
                      ? "기능 비교보다 중요한 건, 지금 합류하면 평생 가격과 런치 혜택을 함께 가져갈 수 있다는 점입니다."
                      : "Wichtiger als ein Funktionsvergleich ist der frühe Einstiegsvorteil: dauerhafter Preis und Launch-Benefits in einem."}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    isKo ? "평생 €59 유지" : "Dauerhaft €59",
                    isKo ? "무료 메뉴 등록" : "Menüeinrichtung gratis",
                    isKo ? "우선 고객 지원" : "Priorisierter Support"
                  ].map((item) => (
                    <div key={item} className="rounded-[1.6rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] px-4 py-5">
                      <p className="text-base font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.key}
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
                      {plan.label}
                    </p>
                  </div>
                  {plan.featured ? (
                    <span className="rounded-full bg-[var(--brand-accent)] px-3 py-1 text-xs font-semibold text-white">
                      {isKo ? "Launch Offer" : "Launch Offer"}
                    </span>
                  ) : null}
                </div>
                <div className="mt-6">
                  <div className="flex items-end gap-2">
                    <p className="text-5xl font-semibold tracking-[-0.05em] text-[var(--brand-ink)]">
                      {plan.price}
                    </p>
                    {"suffix" in plan ? (
                      <p className="pb-2 text-sm text-[var(--brand-muted)]">{plan.suffix}</p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">
                  {plan.description}
                </p>
                <div className="mt-6 flex-1 space-y-3 border-t border-[rgba(64,61,57,0.1)] pt-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-[var(--brand-accent)]" />
                      <span className="text-sm leading-6 text-[var(--brand-ink)]">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-3">
                  {plan.key === "team" ? (
                    <a
                      href="#contact"
                      className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
                    >
                      {content.contactSales}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <form action={startPricingCheckoutAction}>
                      <input type="hidden" name="plan" value={plan.key === "founding" ? "starter" : plan.key} />
                      <Button className="w-full rounded-full bg-[var(--brand-accent)] px-6 text-white hover:bg-[#d75424]">
                        {plan.key === "starter" ? content.starterCheckout : content.teamCheckout}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}
                  <a
                    href="#contact"
                    className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(64,61,57,0.14)] bg-white/75 px-6 py-3 text-sm font-medium text-[var(--brand-ink)] transition hover:bg-white"
                  >
                    {content.contactSales}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="display-title text-3xl font-semibold md:text-5xl">
                {content.salesTitle}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {content.salesPoints.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div key={point.title} className="rounded-[1.8rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(242,107,77,0.12)] text-[var(--brand-accent)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">{point.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">{point.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2.2rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] p-6 md:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                {content.compareTitle}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--brand-muted)]">
                {content.compareBody}
              </p>
              <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[rgba(64,61,57,0.08)]">
                <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] bg-[#252422] text-sm font-semibold text-[#FFFCF2]">
                  <div className="px-4 py-4">{isKo ? "항목" : "Bereich"}</div>
                  <div className="px-4 py-4">Founding Restaurant</div>
                  <div className="px-4 py-4">{isKo ? "일반 요금" : "Regulär"}</div>
                </div>
                {content.comparisonRows.map((row, index) => (
                  <div
                    key={row[0]}
                    className={`grid grid-cols-[1.2fr_0.9fr_0.9fr] text-sm ${
                      index % 2 === 0 ? "bg-white/75" : "bg-[rgba(255,252,242,0.88)]"
                    }`}
                  >
                    {row.map((cell, cellIndex) => (
                      <div
                        key={`${row[0]}-${cell}`}
                        className={`px-4 py-4 leading-6 ${
                          cellIndex === 0 ? "font-medium text-[var(--brand-ink)]" : "text-[var(--brand-muted)]"
                        }`}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                Sales
              </p>
              <h2 className="display-title mt-3 text-3xl font-semibold md:text-5xl">
                {content.inquiryTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--brand-muted)] md:text-lg">
                {content.inquiryBody}
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 rounded-[1.5rem] bg-[rgba(255,252,242,0.84)] px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-lilac-soft)] text-[var(--brand-accent)]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--brand-ink)]">
                      {isKo ? "Starter에서 더 큰 홀 운영까지 확장 가능" : "Vom kleinen Gastraum bis zum vollen Service sauber skalierbar"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--brand-muted)]">
                      {isKo
                        ? "처음에는 소형 매장 플랜으로 시작하고, 테이블 수가 늘어나면 그대로 상위 플랜으로 옮겨갈 수 있습니다."
                        : "Sie starten mit einer kleinen Tischanzahl und wechseln erst dann in den nächsten Plan, wenn der Gastraum wirklich größer wird."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.5rem] bg-[rgba(255,252,242,0.84)] px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-lilac-soft)] text-[var(--brand-accent)]">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--brand-ink)]">{content.setupTitle}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--brand-muted)]">
                      {content.setupBody}
                    </p>
                    <Link
                      href="/setup"
                      className="mt-3 inline-flex items-center text-sm font-medium text-[var(--brand-accent)] hover:text-[#d75424]"
                    >
                      {content.setupCta}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.5rem] bg-[rgba(255,252,242,0.84)] px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-lilac-soft)] text-[var(--brand-accent)]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--brand-ink)]">{content.formTitle}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--brand-muted)]">
                      {content.formDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2.2rem] border border-[rgba(64,61,57,0.12)] bg-[rgba(255,252,242,0.82)] p-6 md:p-7">
              <form action={submitPricingInquiryAction} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input name="restaurantName" placeholder={content.restaurantName} required />
                  <Input name="city" placeholder={content.city} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input name="contactName" placeholder={content.contactName} required />
                  <Input name="email" type="email" placeholder={content.email} required />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input name="phone" placeholder={content.phone} />
                  <Input name="tableCount" type="number" min="1" placeholder={content.tableCount} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    name="desiredPlan"
                    className="min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-200"
                    defaultValue="starter"
                  >
                    {plans.map((plan) => (
                      <option key={plan.key} value={plan.key}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-2xl border border-dashed border-[rgba(64,61,57,0.14)] bg-white/60 px-4 py-3 text-sm text-[var(--brand-muted)]">
                    {content.badge}
                  </div>
                </div>
                <Textarea name="message" placeholder={content.message} />
                <Button className="w-full rounded-full bg-[var(--brand-accent)] px-6 text-white hover:bg-[#d75424]">
                  {content.submitInquiry}
                  <MessageSquareText className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-3xl">
            <h2 className="display-title text-3xl font-semibold md:text-5xl">
              {content.faqTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--brand-muted)] md:text-lg">
              {content.faqBody}
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {content.faq.map(([q, a]) => (
              <article
                key={q}
                className="rounded-[1.8rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] px-5 py-5"
              >
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                  {q}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--brand-muted)]">{a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[var(--brand-ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-[#FFFCF2] md:px-6">
          <p className="display-title text-2xl font-semibold">Brezel Order</p>
          <p className="max-w-3xl text-sm leading-6 text-white/68">{content.footerTitle}</p>
          <p className="max-w-3xl text-sm leading-6 text-white/52">{content.footerBody}</p>
          <div className="flex flex-wrap gap-5 text-sm text-white/76">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
