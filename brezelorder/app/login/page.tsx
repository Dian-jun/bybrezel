import { LanguageSwitcher } from "@/components/language-switcher";
import { AuthCard } from "@/components/auth/auth-card";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 md:px-6">
        <div className="w-full">
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 flex justify-end">
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
            <p className="text-sm font-semibold text-warm-500">{dict.common.brand}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              {dict.auth.pageTitle}
            </h1>
          </div>
          <AuthCard error={searchParams?.error} labels={dict.auth} />
        </div>
      </div>
    </main>
  );
}
