import { createRestaurantAction } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getCurrentMembership } from "@/lib/data";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n";

export default async function OnboardingPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const membership = await getCurrentMembership();
  const locale = getLocaleFromCookie();
  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 md:px-6">
        <section className="surface w-full p-6 md:p-8">
          <div className="flex justify-end">
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
          <span className="eyebrow">{dict.admin.onboardingEyebrow}</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{dict.admin.onboardingTitle}</h1>
          <p className="mt-3 text-sm text-stone-600">
            {dict.admin.onboardingBody}
          </p>
          {membership?.restaurant_id ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {dict.admin.alreadyLinked}
            </p>
          ) : null}
          {searchParams?.error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {searchParams.error}
            </p>
          ) : null}
          <form action={createRestaurantAction} className="mt-6 space-y-4">
            <Input name="name" placeholder="Restaurant name" required />
            <Input name="slug" placeholder="Slug, e.g. biergarten-mitte" required />
            <div className="space-y-2">
              <Textarea
                name="address"
                placeholder={
                  locale === "ko"
                    ? "예: Frankfurter Str. 19\n61231 Bad Nauheim"
                    : locale === "en"
                      ? "For example:\nFrankfurter Str. 19\n61231 Bad Nauheim"
                      : "Zum Beispiel:\nFrankfurter Str. 19\n61231 Bad Nauheim"
                }
              />
              <p className="text-xs text-stone-500">
                {locale === "ko"
                  ? "MVP에서는 주소 자동완성보다, 매장에서 바로 이해하기 쉬운 전체 주소 입력이 더 실용적입니다."
                  : locale === "en"
                    ? "For the MVP, a clear full address is usually more practical than a complex autocomplete integration."
                    : "Für das MVP ist eine klare Volladresse meist praktischer als eine komplexe Autocomplete-Integration."}
              </p>
            </div>
            <Input name="contactEmail" type="email" placeholder="kontakt@restaurant.de" />
            <Input name="contactPhone" placeholder="+49 ..." />
            <Button type="submit">{dict.admin.createRestaurant}</Button>
          </form>
        </section>
      </div>
    </main>
  );
}
