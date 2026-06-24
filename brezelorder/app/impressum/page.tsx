import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLocaleFromCookie } from "@/lib/i18n";

export default function ImpressumPage() {
  const locale = getLocaleFromCookie();
  const isKo = locale === "ko";

  const content = isKo
    ? {
        title: "Impressum",
        eyebrow: "법적 고지",
        intro:
          "독일 시장용 서비스에 맞춘 `Impressum` 템플릿입니다. 실제 공개 전에는 아래 플레이스홀더를 반드시 법인 정보와 대표자 정보로 교체해 주세요.",
        warningTitle: "배포 전 확인이 필요합니다",
        warningBody:
          "이 페이지는 디자인과 구조를 위한 템플릿입니다. 독일 법적 고지 의무는 사업 형태와 서비스 방식에 따라 달라질 수 있으므로, 실제 운영 전에는 법률 검토를 권장합니다.",
        back: "홈으로 돌아가기",
        company: "서비스 제공자",
        companyBody: "[회사명 또는 개인사업자명]\nBrezel Order / bybrezel\n[도로명, 건물번호]\n[우편번호, 도시]\nDeutschland",
        represented: "대표자",
        representedBody: "[대표자 이름]",
        contact: "연락처",
        contactBody:
          "E-Mail: [hello@bybrezel.com]\nTelefon: [전화번호]\nWebsite: https://www.bybrezel.com",
        tax: "세무 정보",
        taxBody:
          "USt-IdNr. gemäß § 27a UStG: [Umsatzsteuer-ID]\nSteuernummer: [Steuernummer]",
        responsible: "콘텐츠 책임자",
        responsibleBody:
          "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:\n[이름]\n[주소]",
        dispute: "EU 분쟁 해결",
        disputeBody:
          "유럽연합 집행위원회는 온라인 분쟁 해결 플랫폼을 제공합니다:",
        footerTitle: "같은 톤으로 신뢰를 전달하는 법적 페이지",
        footerBody:
          "랜딩 페이지와 동일한 브랜딩 톤을 유지하되, 법적 정보는 가장 읽기 쉬운 구조로 정리하는 것이 좋습니다."
      }
    : {
        title: "Impressum",
        eyebrow: "Rechtliche Angaben",
        intro:
          "Diese Seite ist ein hochwertig gestaltetes Impressum-Template für den deutschen Markt. Vor Veröffentlichung sollten alle Platzhalter durch die echten Unternehmensdaten ersetzt werden.",
        warningTitle: "Vor Veröffentlichung prüfen",
        warningBody:
          "Diese Seite dient als strukturelle Vorlage. Welche Angaben konkret erforderlich sind, hängt von Rechtsform und Angebot ab. Vor dem Livegang ist eine rechtliche Prüfung sinnvoll.",
        back: "Zurück zur Startseite",
        company: "Anbieter",
        companyBody: "[Firmenname oder Name des Einzelunternehmens]\nBrezel Order / bybrezel\n[Straße, Hausnummer]\n[PLZ, Ort]\nDeutschland",
        represented: "Vertreten durch",
        representedBody: "[Name der vertretungsberechtigten Person]",
        contact: "Kontakt",
        contactBody:
          "E-Mail: [hello@bybrezel.com]\nTelefon: [Telefonnummer]\nWebsite: https://www.bybrezel.com",
        tax: "Steuerangaben",
        taxBody:
          "USt-IdNr. gemäß § 27a UStG: [Umsatzsteuer-ID]\nSteuernummer: [Steuernummer]",
        responsible: "Inhaltlich verantwortlich",
        responsibleBody:
          "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:\n[Name]\n[Adresse]",
        dispute: "EU-Streitschlichtung",
        disputeBody:
          "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:",
        footerTitle: "Klar, ruhig und vertrauenswürdig",
        footerBody:
          "Gerade rechtliche Seiten sollten denselben professionellen Ton tragen wie die Produktseite – aber in einer deutlich sachlicheren, leichter scanbaren Form."
      };

  const sections = [
    { title: content.company, body: content.companyBody },
    { title: content.represented, body: content.representedBody },
    { title: content.contact, body: content.contactBody },
    { title: content.tax, body: content.taxBody },
    { title: content.responsible, body: content.responsibleBody }
  ];

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-[var(--brand-ink)]">
      <header className="sticky top-0 z-40 border-b border-[rgba(64,61,57,0.08)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.82)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <p className="display-title text-lg font-semibold text-[var(--brand-ink)]">
            Brezel Order
          </p>
          <Link href="/">
            <Button
              variant="secondary"
              className="rounded-full border-[rgba(64,61,57,0.12)] bg-white px-5 text-[var(--brand-ink)] hover:bg-[var(--brand-panel)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {content.back}
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_right,rgba(235,94,40,0.14),transparent_32%),radial-gradient(circle_at_top_left,rgba(204,182,255,0.28),transparent_28%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
              {content.eyebrow}
            </p>
            <h1 className="display-title mt-4 text-4xl font-semibold md:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--brand-muted)]">
              {content.intro}
            </p>
          </div>

          <div className="mt-10 rounded-[2rem] border border-[rgba(235,94,40,0.14)] bg-[linear-gradient(135deg,rgba(255,240,230,0.96),rgba(245,232,255,0.88))] p-6 md:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)]">
              {content.warningTitle}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--brand-muted)]">
              {content.warningBody}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] border border-[rgba(64,61,57,0.1)] bg-[rgba(255,252,242,0.82)] p-6 md:p-7"
              >
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
                  {section.title}
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--brand-muted)]">
                  {section.body}
                </div>
              </article>
            ))}
          </div>

          <article className="mt-4 rounded-[2rem] border border-[rgba(64,61,57,0.1)] bg-[var(--brand-panel)] p-6 md:p-7">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[var(--brand-ink)]">
              {content.dispute}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--brand-muted)]">
              {content.disputeBody}
            </p>
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-accent)] hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
              <ExternalLink className="h-4 w-4" />
            </a>
          </article>
        </div>
      </section>

      <footer className="bg-[var(--brand-ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-[#FFFCF2] md:px-6">
          <p className="display-title text-2xl font-semibold">Brezel Order</p>
          <p className="max-w-2xl text-sm leading-6 text-white/68">
            {content.footerTitle}
          </p>
          <p className="max-w-3xl text-sm leading-6 text-white/52">
            {content.footerBody}
          </p>
        </div>
      </footer>
    </main>
  );
}
