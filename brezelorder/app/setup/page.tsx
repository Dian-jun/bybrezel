import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  MenuSquare,
  QrCode,
  ScanSearch,
  Store,
  TabletSmartphone,
  TimerReset
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { SetupFlow } from "@/components/setup/setup-flow";
import { Button } from "@/components/ui/button";
import { getCurrentMembership } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";

function SectionTitle({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
        {eyebrow}
      </p>
      <h1 className="display-title mt-3 text-4xl font-semibold text-[var(--brand-ink)] md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-[var(--brand-muted)] md:text-lg">{body}</p>
    </div>
  );
}

export default async function SetupPage() {
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const membership = await getCurrentMembership();
  const isKo = locale === "ko";
  const isEn = locale === "en";
  const onboardingCompleted = Boolean(membership?.restaurant_id);

  const content = isKo
    ? {
        eyebrow: "설치 가이드",
        title: "점주용 10분 온보딩",
        body: "준비물 확인부터 메뉴 입력, QR 출력, 테스트 주문까지. Brezel Order를 오픈 전 직접 설치할 수 있도록 순서대로 정리했습니다.",
        home: "홈",
        pricing: "요금 보기",
        login: "관리자 로그인",
        badge: "평균 설치 시간 10분 · 웹 기반 · 별도 프로그램 설치 없음",
        prepTitle: "시작 전에 준비할 것",
        prepItems: [
          "레스토랑 이름, 주소, 연락처",
          "메뉴명, 설명, 가격",
          "테이블 이름 또는 번호",
          "QR 출력용 프린터 또는 PDF 저장"
        ],
        stepsTitle: "10분 안에 끝내는 설치 순서",
        stepsBody: "아래 순서대로 진행하면 실제 영업 전에 손님용 주문 링크와 직원 화면까지 모두 확인할 수 있습니다.",
        steps: [
          {
            icon: Store,
            time: "1분",
            title: "레스토랑 기본 정보 입력",
            body: "레스토랑 이름, 주소, 연락처, 로고를 먼저 설정합니다. 이 정보는 손님 페이지와 관리자 화면에 함께 반영됩니다."
          },
          {
            icon: MenuSquare,
            time: "3분",
            title: "메뉴와 카테고리 등록",
            body: "카테고리를 만들고 메뉴명, 설명, 가격, 사진을 입력합니다. 사이즈나 옵션이 있으면 같은 화면에서 함께 추가합니다."
          },
          {
            icon: TabletSmartphone,
            time: "1분",
            title: "테이블 생성",
            body: "운영할 테이블 수만큼 이름을 만들고 QR 링크를 연결합니다. 필요하면 POS 화면에서 실제 홀 위치까지 배치할 수 있습니다."
          },
          {
            icon: QrCode,
            time: "2분",
            title: "QR 코드 출력",
            body: "테이블별 QR을 PDF 또는 개별 파일로 내려받아 바로 출력합니다. 테이블 스탠드나 스티커에 붙일 준비만 하면 됩니다."
          },
          {
            icon: ScanSearch,
            time: "2분",
            title: "테스트 주문 보내기",
            body: "직접 QR을 스캔해 메뉴를 담고 테스트 주문을 넣어봅니다. 직원 호출, 장바구니, 주문 상태 흐름을 같이 확인합니다."
          },
          {
            icon: ClipboardCheck,
            time: "1분",
            title: "영업 시작 전 최종 체크",
            body: "직원 화면이 열리는지, 테이블별 주문이 들어오는지, 가격과 언어가 올바른지 마지막으로 확인하고 바로 오픈합니다."
          }
        ],
        checklistTitle: "오픈 직전 체크리스트",
        checklist: [
          "대표 메뉴 3개 이상이 손님 화면에서 정상 노출된다.",
          "직원 호출 4종이 직원 대시보드에 즉시 보인다.",
          "각 테이블 QR이 올바른 링크로 연결된다.",
          "테스트 주문 1건이 직원 화면과 POS 화면에 정상 표시된다.",
          "직원에게 오늘 사용할 화면만 간단히 공유했다."
        ],
        supportTitle: "직접 해도 되고, 함께 열어도 됩니다.",
        supportBody: "런치 초기에는 메뉴 등록을 대신 도와드릴 수 있습니다. 빠르게 시작하고 싶다면 가격 페이지에서 바로 문의를 남겨주세요.",
        supportPrimary: "가격/문의 보기",
        supportSecondary: "지금 로그인",
        progressLabel: "진행도",
        progressComplete: "{count}단계 완료",
        progressPending: "{count}단계 남음",
        stepLabel: "단계",
        currentStepTitle: "지금 진행할 단계",
        completeStep: "1단계 완료",
        nextStep: "다음 단계로 이동",
        finishedTitle: "온보딩 준비가 끝났습니다.",
        finishedBody:
          "이제 관리자 화면에서 실제 운영 데이터를 입력하고 테스트 주문을 한 번만 더 확인하면 바로 손님에게 공개할 수 있습니다.",
        restart: "처음부터 다시 보기",
        openSection: "해당 화면 열기"
      }
    : isEn
      ? {
          eyebrow: "Setup Guide",
          title: "10-minute onboarding for owners",
          body: "From prep to your first test order. This flow turns Brezel Order into a practical launch checklist owners can actually follow before opening.",
          home: "Home",
          pricing: "View pricing",
          login: "Admin login",
          badge: "Average setup time 10 minutes · web-based · no software install",
          prepTitle: "Prepare these first",
          prepItems: [
            "Restaurant name, address, and contact details",
            "Menu names, descriptions, and prices",
            "Table names or numbers",
            "Printer for QR sheets or a place to save PDFs"
          ],
          stepsTitle: "The fastest path to go live",
          stepsBody: "Complete each step in order so the guest menu, QR links, and staff screens are ready before service starts.",
          steps: [
            {
              icon: Store,
              time: "1 min",
              title: "Create the restaurant workspace",
              body: "Start with your restaurant name, address, contact details, and optional logo. These details appear across the guest and admin experience.",
              href: "/admin/onboarding",
              cta: "Open onboarding"
            },
            {
              icon: MenuSquare,
              time: "3 min",
              title: "Enter menu categories and items",
              body: "Add categories, prices, descriptions, photos, and variants so your live menu matches the real service flow.",
              href: "/admin/menu",
              cta: "Open menu setup"
            },
            {
              icon: TabletSmartphone,
              time: "1 min",
              title: "Create your tables",
              body: "Add each table name or number you will operate. You can also arrange them later in the POS layout view.",
              href: "/admin/tables",
              cta: "Open table setup"
            },
            {
              icon: QrCode,
              time: "2 min",
              title: "Generate and print QR codes",
              body: "Download table QR sheets as individual files or PDFs and place them directly on tables.",
              href: "/admin/qr",
              cta: "Open QR setup"
            },
            {
              icon: ScanSearch,
              time: "2 min",
              title: "Send a real test order",
              body: "Scan a table QR, place a sample order, and confirm that requests and order states reach the staff and POS screens correctly.",
              href: "/staff",
              cta: "Open service dashboard"
            },
            {
              icon: ClipboardCheck,
              time: "1 min",
              title: "Run the final opening check",
              body: "Verify language, pricing, QR routing, and staff readiness one last time before making the restaurant live for guests.",
              href: "/admin",
              cta: "Open admin dashboard"
            }
          ],
          checklistTitle: "Pre-opening checklist",
          checklist: [
            "At least three core menu items are visible to guests.",
            "All four service request types arrive in the staff dashboard instantly.",
            "Every table QR opens the correct guest page.",
            "One full test order appears in the service and POS views.",
            "The staff knows which screen will be used during service."
          ],
          supportTitle: "You can launch alone or let us help.",
          supportBody: "During the launch phase, we can also support the first menu setup directly. If you want a faster start, contact us from the pricing page.",
          supportPrimary: "Pricing & contact",
          supportSecondary: "Log in now",
          progressLabel: "Progress",
          progressComplete: "{count} steps completed",
          progressPending: "{count} steps left",
          stepLabel: "Step",
          currentStepTitle: "Current step",
          completeStep: "Mark step complete",
          nextStep: "Move to next step",
          finishedTitle: "Your onboarding plan is ready.",
          finishedBody:
            "Open the admin area, complete the real setup data, run one more test order, and you are ready to open the guest experience.",
          restart: "Start over",
          openSection: "Open this screen"
        }
      : {
        eyebrow: "Setup Guide",
        title: "10-Minuten-Onboarding für Inhaber",
        body: "Von der Vorbereitung bis zur ersten Testbestellung. Diese Anleitung zeigt Schritt für Schritt, wie Brezel Order vor dem ersten Einsatztag eingerichtet wird.",
        home: "Startseite",
        pricing: "Preise ansehen",
        login: "Admin-Login",
        badge: "Durchschnittlich 10 Minuten · webbasiert · keine Software-Installation",
        prepTitle: "Vor dem Start bereitlegen",
        prepItems: [
          "Restaurantname, Adresse und Kontaktdaten",
          "Menünamen, Beschreibungen und Preise",
          "Tischnamen oder Tischnummern",
          "Drucker für QR-Ausdrucke oder PDF-Ablage"
        ],
        stepsTitle: "So richten Sie Brezel Order in 10 Minuten ein",
        stepsBody: "Wenn Sie diese Reihenfolge einhalten, sind Gästelink, Team-Dashboard und Testbestellung noch vor dem ersten Service bereit.",
        steps: [
          {
            icon: Store,
            time: "1 Min",
            title: "Restaurantdaten eintragen",
            body: "Name, Adresse, Kontakt und optional das Logo zuerst anlegen. Diese Angaben erscheinen direkt in den Gästeseiten und im Admin-Bereich."
          },
          {
            icon: MenuSquare,
            time: "3 Min",
            title: "Menü und Kategorien erfassen",
            body: "Kategorien anlegen und Menünamen, Beschreibung, Preis sowie Fotos erfassen. Größen oder Varianten können direkt ergänzt werden."
          },
          {
            icon: TabletSmartphone,
            time: "1 Min",
            title: "Tische anlegen",
            body: "Für jeden aktiven Tisch einen Namen anlegen und den QR-Link erzeugen. Im POS-Layout können die Tische später zusätzlich räumlich platziert werden."
          },
          {
            icon: QrCode,
            time: "2 Min",
            title: "QR-Codes drucken",
            body: "Die QR-Codes pro Tisch als PDF oder Einzeldownload exportieren und direkt für Aufsteller oder Sticker vorbereiten."
          },
          {
            icon: ScanSearch,
            time: "2 Min",
            title: "Testbestellung auslösen",
            body: "QR scannen, Produkte in den Warenkorb legen und eine Testbestellung senden. So prüfen Sie Menü, Serviceanfragen und Statusfluss in einem Schritt."
          },
          {
            icon: ClipboardCheck,
            time: "1 Min",
            title: "Go-live kurz prüfen",
            body: "Kontrollieren Sie noch einmal Sprache, Preise, Mitarbeiteransicht und Tischlinks. Danach ist das System live einsatzbereit."
          }
        ],
        checklistTitle: "Checkliste vor dem ersten Service",
        checklist: [
          "Mindestens drei Kernprodukte sind für Gäste sichtbar.",
          "Alle vier Serviceanfragen kommen im Team-Dashboard sofort an.",
          "Jeder Tisch-QR öffnet die richtige Tischseite.",
          "Eine Testbestellung erscheint korrekt im Service- und POS-Bildschirm.",
          "Das Team weiß, welches Gerät heute für Service und POS genutzt wird."
        ],
        supportTitle: "Sie können allein starten oder gemeinsam live gehen.",
        supportBody: "Zum Marktstart helfen wir auf Wunsch auch direkt beim ersten Menü-Setup. Über die Preis- und Anfrageseite können Sie das sofort anstoßen.",
        supportPrimary: "Preise & Anfrage",
        supportSecondary: "Jetzt einloggen",
        progressLabel: "Fortschritt",
        progressComplete: "{count} Schritte erledigt",
        progressPending: "{count} Schritte offen",
        stepLabel: "Schritt",
        currentStepTitle: "Aktueller Schritt",
        completeStep: "Schritt abschließen",
        nextStep: "Zum nächsten Schritt",
        finishedTitle: "Das Onboarding ist vorbereitet.",
        finishedBody:
          "Jetzt können Sie im Admin-Bereich die echten Betriebsdaten eintragen, eine Testbestellung prüfen und den Gastzugang freischalten.",
        restart: "Ablauf neu starten",
        openSection: "Diesen Bereich öffnen"
      };

  const flowContent = {
    progressLabel: content.progressLabel,
    progressComplete: content.progressComplete,
    progressPending: content.progressPending,
    stepLabel: content.stepLabel,
    currentStepTitle: content.currentStepTitle,
    completeStep: content.completeStep,
    nextStep: content.nextStep,
    finishedTitle: content.finishedTitle,
    finishedBody: content.finishedBody,
    restart: content.restart,
    openSection: content.openSection,
    steps: isKo
      ? [
          {
            icon: Store,
            time: "1분",
            title: "레스토랑 워크스페이스 만들기",
            body: "관리자 온보딩 화면에서 레스토랑 이름, 주소, 연락처를 먼저 저장합니다. 실제 운영 정보가 이 단계부터 시작됩니다.",
            href: "/admin/onboarding",
            cta: "온보딩 열기"
          },
          {
            icon: MenuSquare,
            time: "3분",
            title: "메뉴/카테고리 입력",
            body: "점주가 바로 판매할 메뉴 구조를 입력합니다. 가격, 사진, 옵션까지 넣어야 손님 주문 화면이 실제 운영과 맞아집니다.",
            href: "/admin/menu",
            cta: "메뉴 관리 열기"
          },
          {
            icon: TabletSmartphone,
            time: "1분",
            title: "테이블 생성",
            body: "운영할 테이블 수만큼 생성하고 이름을 정리합니다. 필요하면 POS 배치까지 이어서 설정할 수 있습니다.",
            href: "/admin/tables",
            cta: "테이블 관리 열기"
          },
          {
            icon: QrCode,
            time: "2분",
            title: "QR 코드 출력",
            body: "테이블별 QR을 PDF나 개별 파일로 내려받아 스탠드 또는 스티커에 붙일 준비를 합니다.",
            href: "/admin/qr",
            cta: "QR 설정 열기"
          },
          {
            icon: ScanSearch,
            time: "2분",
            title: "테스트 주문 확인",
            body: "손님 화면에서 직접 주문을 넣고 직원 대시보드와 POS에 정상 반영되는지 확인합니다.",
            href: "/staff",
            cta: "직원 화면 열기"
          },
          {
            icon: ClipboardCheck,
            time: "1분",
            title: "오픈 전 최종 점검",
            body: "언어, 가격, 주문 흐름, 호출 흐름을 마지막으로 확인한 뒤 레스토랑을 공개 상태로 전환합니다.",
            href: "/admin",
            cta: "관리자 화면 열기"
          }
        ]
      : isEn
        ? [
            {
              icon: Store,
              time: "1 min",
              title: "Create the restaurant workspace",
              body: "Start with your restaurant name, address, contact details, and optional logo. These details appear across the guest and admin experience.",
              href: "/admin/onboarding",
              cta: "Open onboarding"
            },
            {
              icon: MenuSquare,
              time: "3 min",
              title: "Enter menu categories and items",
              body: "Add categories, prices, descriptions, photos, and variants so your live menu matches the real service flow.",
              href: "/admin/menu",
              cta: "Open menu setup"
            },
            {
              icon: TabletSmartphone,
              time: "1 min",
              title: "Create your tables",
              body: "Add each table name or number you will operate. You can also arrange them later in the POS layout view.",
              href: "/admin/tables",
              cta: "Open table setup"
            },
            {
              icon: QrCode,
              time: "2 min",
              title: "Generate and print QR codes",
              body: "Download table QR sheets as individual files or PDFs and place them directly on tables.",
              href: "/admin/qr",
              cta: "Open QR setup"
            },
            {
              icon: ScanSearch,
              time: "2 min",
              title: "Send a real test order",
              body: "Scan a table QR, place a sample order, and confirm that requests and order states reach the staff and POS screens correctly.",
              href: "/staff",
              cta: "Open service dashboard"
            },
            {
              icon: ClipboardCheck,
              time: "1 min",
              title: "Run the final opening check",
              body: "Verify language, pricing, QR routing, and staff readiness one last time before making the restaurant live for guests.",
              href: "/admin",
              cta: "Open admin dashboard"
            }
          ]
        : [
            {
              icon: Store,
              time: "1 Min",
              title: "Restaurant-Workspace anlegen",
              body: "Im Onboarding zuerst Name, Adresse und Kontaktdaten speichern. Ab hier beginnt die echte Einrichtung für den Betrieb.",
              href: "/admin/onboarding",
              cta: "Onboarding öffnen"
            },
            {
              icon: MenuSquare,
              time: "3 Min",
              title: "Menü und Kategorien einpflegen",
              body: "Die reale Menüstruktur mit Preisen, Fotos und Varianten eintragen, damit die Gästeseite sofort betriebstauglich ist.",
              href: "/admin/menu",
              cta: "Menüverwaltung öffnen"
            },
            {
              icon: TabletSmartphone,
              time: "1 Min",
              title: "Tische anlegen",
              body: "Alle aktiven Tische mit eindeutigen Namen anlegen. Das POS-Layout kann direkt danach ergänzt werden.",
              href: "/admin/tables",
              cta: "Tischverwaltung öffnen"
            },
            {
              icon: QrCode,
              time: "2 Min",
              title: "QR-Codes drucken",
              body: "Die Tisch-QRs als PDF oder Einzeldatei exportieren und für Aufsteller oder Sticker vorbereiten.",
              href: "/admin/qr",
              cta: "QR-Bereich öffnen"
            },
            {
              icon: ScanSearch,
              time: "2 Min",
              title: "Testbestellung senden",
              body: "Eine Bestellung als Gast auslösen und prüfen, ob Service-Dashboard und POS korrekt reagieren.",
              href: "/staff",
              cta: "Serviceansicht öffnen"
            },
            {
              icon: ClipboardCheck,
              time: "1 Min",
              title: "Go-live prüfen",
              body: "Sprache, Preise, Tischlinks und Serviceabläufe einmal final gegenchecken und dann live schalten.",
              href: "/admin",
              cta: "Admin öffnen"
            }
          ]
  };

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
                {content.home}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(204,182,255,0.2),transparent_24%),radial-gradient(circle_at_top_right,rgba(235,94,40,0.14),transparent_28%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
          <SectionTitle eyebrow={content.eyebrow} title={content.title} body={content.body} />
          <div className="mt-6 inline-flex rounded-full border border-[rgba(235,94,40,0.12)] bg-[rgba(255,252,242,0.82)] px-4 py-2 text-sm font-medium text-[var(--brand-accent)]">
            <TimerReset className="mr-2 h-4 w-4" />
            {content.badge}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] p-6 md:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                {content.prepTitle}
              </p>
              <div className="mt-5 space-y-4">
                {content.prepItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--brand-accent)]" />
                    <p className="text-sm leading-6 text-[var(--brand-ink)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-white/75 p-6 md:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                {content.supportTitle}
              </p>
              <p className="mt-4 text-base leading-7 text-[var(--brand-muted)]">{content.supportBody}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/pricing">
                  <Button className="w-full rounded-full bg-[var(--brand-accent)] px-6 text-white hover:bg-[#d75424] sm:w-auto">
                    {content.supportPrimary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    className="w-full rounded-full border-[rgba(64,61,57,0.14)] bg-white px-6 text-[var(--brand-ink)] hover:bg-[var(--brand-panel)] sm:w-auto"
                  >
                    {content.supportSecondary}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <SetupFlow content={flowContent} serverCompletedSteps={onboardingCompleted ? [0] : []} />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
              Onboarding
            </p>
            <h2 className="display-title mt-3 text-3xl font-semibold text-[var(--brand-ink)] md:text-5xl">
              {content.stepsTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--brand-muted)] md:text-lg">
              {content.stepsBody}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {content.steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[rgba(255,252,242,0.82)] p-6 md:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-lilac-soft)] text-[var(--brand-accent)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-muted)]">
                      {step.time}
                    </span>
                  </div>
                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                    STEP {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--brand-muted)]">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] p-6 md:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
                Go Live
              </p>
              <h2 className="display-title mt-3 text-3xl font-semibold text-[var(--brand-ink)] md:text-5xl">
                {content.checklistTitle}
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {content.checklist.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-[rgba(64,61,57,0.08)] bg-white/70 px-5 py-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--brand-accent)]" />
                    <p className="text-sm leading-6 text-[var(--brand-ink)]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
