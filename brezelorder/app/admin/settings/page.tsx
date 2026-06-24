import { AppShell } from "@/components/app-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireRestaurantContext } from "@/lib/data";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";
import { getAdminNavItems, getPermissionFlags } from "@/lib/permissions";

export default async function AdminSettingsPage() {
  const { membership, restaurantMembership } = await requireRestaurantContext();
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);
  const navItems = getAdminNavItems({
    locale,
    labels: dict.nav,
    permissions,
    includePlatform: membership.is_platform_admin
  });

  return (
    <AppShell
      title={dict.nav.settings}
      subtitle={
        locale === "ko"
          ? "화면 테마와 언어를 이 메뉴에서 한 번에 관리합니다."
          : locale === "en"
            ? "Manage display mode and language from one place."
            : "Hier verwaltest du Darstellung und Sprache an einem Ort."
      }
      pathname="/admin/settings"
      locale={locale}
      labels={{ ...dict.common, ...dict.nav }}
      navItems={navItems}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-5 md:p-6">
          <p className="text-sm font-medium text-stone-500">
            {locale === "ko" ? "화면 설정" : locale === "en" ? "Display" : "Darstellung"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {locale === "ko" ? "라이트 / 다크 모드" : locale === "en" ? "Light / Dark mode" : "Light / Dark"}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {locale === "ko"
              ? "선택한 테마는 이 브라우저에 저장됩니다."
              : locale === "en"
                ? "Your theme preference is stored in this browser."
                : "Die Auswahl wird in diesem Browser gespeichert."}
          </p>
          <div className="mt-5">
            <ThemeToggle locale={locale} variant="inline" />
          </div>
        </section>

        <section className="surface p-5 md:p-6">
          <p className="text-sm font-medium text-stone-500">{dict.common.language}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {locale === "ko" ? "언어 선택" : locale === "en" ? "Language" : "Sprache"}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {locale === "ko"
              ? "관리 화면과 랜딩 페이지 기본 언어를 바로 전환할 수 있습니다."
              : locale === "en"
                ? "Switch the admin UI and landing page language instantly."
                : "Wechsle sofort die Sprache fuer Admin und Landing Page."}
          </p>
          <div className="mt-5">
            <LanguageSwitcher
              locale={locale}
              label={dict.common.language}
              options={[
                { value: "de", label: dict.common.german },
                { value: "ko", label: dict.common.korean },
                { value: "en", label: dict.common.english }
              ]}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
