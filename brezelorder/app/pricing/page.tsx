import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Mail, MessageSquareText, ShieldCheck, Store, Users } from "lucide-react";

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
        title: "가격은 단순하게, 가치는 운영에서 느껴지게.",
        eyebrow: "요금 안내",
        description:
          "Brezel Order는 매장 규모가 바로 이해되도록 테이블 수 기준으로 요금을 설계했습니다. 작은 매장은 가볍게 시작하고, 좌석 운영이 커질수록 자연스럽게 확장할 수 있습니다.",
        back: "홈으로 돌아가기",
        cta: "7일 무료 시작",
        badge: "7일 무료 체험 · 월 단위 결제 · 초기 메뉴 등록 지원",
        salesTitle: "왜 테이블 수 기준 가격이 더 설득력 있을까요?",
        salesPoints: [
          "점주는 지금 운영 중인 테이블 수만으로 바로 자기 플랜을 이해할 수 있습니다.",
          "테이블 수는 매장 규모와 회전량을 설명해 주기 때문에 현장 설명이 훨씬 쉽습니다.",
          "직원 수가 자주 바뀌는 매장도 과금 구조를 안정적으로 예측할 수 있습니다."
        ],
        plansTitle: "매장 규모에 맞는 플랜",
        plansBody: "소형 매장부터 다인 좌석 운영 매장까지, 실제 홀 규모에 맞춰 바로 선택할 수 있게 구성했습니다.",
        compareTitle: "무엇이 포함되는지 한눈에 비교",
        compareBody: "현장에서 자주 물어보는 기준만 남겨 비교표를 간결하게 정리했습니다.",
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
        starterCheckout: "Starter 바로 시작",
        teamCheckout: "Team 바로 시작",
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
            key: "starter",
            name: "Starter",
            price: "€29",
            suffix: "/ 월",
            label: "최대 10개 테이블",
            description: "카페, 소형 레스토랑, 점주 중심 운영 매장에 적합합니다.",
            features: [
              "QR 주문",
              "직원 호출",
              "무제한 테이블",
              "메뉴/가격/품절 관리",
              "QR 코드 생성",
              "이메일 영수증"
            ]
          },
          {
            key: "team",
            name: "Growth",
            price: "€49",
            suffix: "/ 월",
            label: "최대 25개 테이블",
            description: "여러 직원이 함께 홀을 운영하는 중형 매장에 적합합니다.",
            features: [
              "Starter의 모든 기능",
              "실시간 직원 대시보드",
              "직원별 테이블 담당 배정",
              "완료 처리 담당 기록",
              "통계 대시보드",
              "우선 지원"
            ],
            featured: true
          },
          {
            key: "custom",
            name: "Scale",
            price: "맞춤 제안",
            label: "26개 테이블 이상",
            description: "대형 홀, 복수 구역 운영, 멀티 매장에 맞는 제안입니다.",
            features: [
              "확장형 테이블 구조",
              "멀티 매장 대응",
              "도입 지원",
              "추가 운영 기능 협의"
            ]
          }
        ],
        comparisonRows: [
          ["테이블 수", "최대 10개", "최대 25개", "26개 이상"],
          ["QR 주문 / 직원 호출", "포함", "포함", "포함"],
          ["실시간 직원 대시보드", "-", "포함", "포함"],
          ["직원별 테이블 배정", "-", "포함", "포함"],
          ["통계 대시보드", "-", "포함", "포함"],
          ["온보딩 지원", "기본", "우선", "맞춤"],
          ["7일 무료 체험", "포함", "포함", "상담 후 제공"]
        ],
        faq: [
          ["왜 테이블 수 기준인가요?", "매장 입장에서는 테이블 수가 가장 직관적인 운영 단위이기 때문입니다. 좌석 규모와 서비스 복잡도를 빠르게 설명할 수 있고, 매달 비용도 예측하기 쉽습니다."],
          ["29유로 / 49유로가 설득력 있나요?", "네. 테이블 주문 한두 번의 응대 시간만 줄어도 한 달 기준으로 충분히 설명 가능한 수준이고, 소형 매장도 부담 없이 시작할 수 있는 가격대입니다."],
          ["웹사이트나 예약 기능도 같이 넣어야 할까요?", "지금 단계에서는 코어 상품과 분리하는 편이 좋습니다. 웹사이트는 향후 업셀 옵션으로 적합하지만, 예약은 제품 범위를 크게 넓히므로 별도 모듈로 다루는 편이 더 안전합니다."]
        ]
      }
    : {
        title: "Einfach im Pricing. Spürbar im Betrieb.",
        eyebrow: "Preise",
        description:
          "Brezel Order wird nach Tischanzahl bepreist, damit Inhaber die Preislogik sofort verstehen. Kleine Betriebe starten leicht, größere Gasträume skalieren ohne komplizierte Rechenlogik.",
        back: "Zurück zur Startseite",
        cta: "7 Tage gratis testen",
        badge: "7 Tage kostenlos · monatlich kündbar · Menüeinrichtung zum Start",
        salesTitle: "Warum Tischanzahl als Preisanker überzeugender ist",
        salesPoints: [
          "Inhaber verstehen sofort, welcher Plan zu ihrem Gastraum passt.",
          "Die Preislogik bleibt stabil, auch wenn sich Schichten oder Mitarbeiter wechseln.",
          "Tischanzahl ist im Verkaufsgespräch deutlich leichter zu erklären als Logins oder Rollen."
        ],
        plansTitle: "Pläne nach Teamgröße",
        plansBody: "Die Staffelung orientiert sich an der realen Fläche im Betrieb: klein starten, bei mehr Sitzplätzen sauber erweitern.",
        compareTitle: "Leistungsvergleich auf einen Blick",
        compareBody: "Nur die Punkte, die im Gespräch mit Inhabern wirklich entscheidend sind.",
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
        starterCheckout: "Starter direkt starten",
        teamCheckout: "Team direkt starten",
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
            key: "starter",
            name: "Starter",
            price: "€29",
            suffix: "/ Monat",
            label: "Bis zu 10 Tische",
            description: "Für Cafés, kleine Restaurants und inhabergeführte Betriebe.",
            features: [
              "QR-Bestellung",
              "Serviceanfragen",
              "Unbegrenzte Tische",
              "Menü-, Preis- und Verfügbarkeitsverwaltung",
              "QR-Code-Erstellung",
              "E-Mail-Belege"
            ]
          },
          {
            key: "team",
            name: "Growth",
            price: "€49",
            suffix: "/ Monat",
            label: "Bis zu 25 Tische",
            description: "Für mittlere Restaurants mit mehreren aktiv betreuten Tischbereichen.",
            features: [
              "Alles aus Starter",
              "Live-Service-Dashboard",
              "Tischzuweisung pro Mitarbeiter",
              "Dokumentierte Abschlüsse und Serviceantworten",
              "Analytics-Dashboard",
              "Priorisierter Support"
            ],
            featured: true
          },
          {
            key: "custom",
            name: "Scale",
            price: "Individuell",
            label: "Ab 26 Tischen",
            description: "Für große Gasträume, mehrere Bereiche oder mehrere Standorte.",
            features: [
              "Erweiterbare Tischstruktur",
              "Mehrere Standorte",
              "Begleitete Einführung",
              "Abstimmung zusätzlicher Betriebsfunktionen"
            ]
          }
        ],
        comparisonRows: [
          ["Tischanzahl", "Bis 10", "Bis 25", "Ab 26"],
          ["QR-Bestellung / Serviceanfragen", "Enthalten", "Enthalten", "Enthalten"],
          ["Live-Service-Dashboard", "-", "Enthalten", "Enthalten"],
          ["Tischzuweisung pro Mitarbeiter", "-", "Enthalten", "Enthalten"],
          ["Analytics-Dashboard", "-", "Enthalten", "Enthalten"],
          ["Onboarding-Unterstützung", "Basis", "Priorisiert", "Individuell"],
          ["7 Tage gratis", "Ja", "Ja", "Nach Absprache"]
        ],
        faq: [
          ["Warum nach Tischen abrechnen?", "Weil Tischanzahl die verständlichste Betriebsgröße ist. Inhaber sehen sofort, welcher Plan zu ihrer Fläche passt, und die Kosten bleiben planbar."],
          ["Sind 29 Euro bzw. 49 Euro realistisch?", "Ja. Schon wenige eingesparte Servicewege und kürzere Wartezeiten pro Woche machen den monatlichen Preis nachvollziehbar."],
          ["Sollten Website und Reservierungen direkt enthalten sein?", "Eher nicht im Kernprodukt. Eine Website ist ein gutes späteres Zusatzmodul. Reservierungen erweitern den Produktumfang deutlich und sollten nur ergänzt werden, wenn sie aktiv nachgefragt werden."]
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
                      Best Value
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
                  {plan.key === "custom" ? (
                    <a
                      href="#contact"
                      className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
                    >
                      {content.contactSales}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <form action={startPricingCheckoutAction}>
                      <input type="hidden" name="plan" value={plan.key} />
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
              <div className="mt-6 space-y-4">
                {content.salesPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-lilac-soft)] text-[var(--brand-accent)]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-7 text-[var(--brand-muted)]">{point}</p>
                  </div>
                ))}
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
                <div className="grid grid-cols-4 bg-[rgba(204,182,255,0.12)] text-sm font-semibold text-[var(--brand-ink)]">
                  <div className="px-4 py-4" />
                  <div className="px-4 py-4">{plans[0]?.name}</div>
                  <div className="px-4 py-4">{plans[1]?.name}</div>
                  <div className="px-4 py-4">{plans[2]?.name}</div>
                </div>
                {content.comparisonRows.map((row, index) => (
                  <div
                    key={row[0]}
                    className={`grid grid-cols-4 text-sm ${
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
