"use client";

import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  locale,
  label,
  options
}: {
  locale: Locale;
  label: string;
  options: Array<{ value: Locale; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-600">
      <span>{label}</span>
      <select
        className="min-h-10 rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink"
        defaultValue={locale}
        onChange={(event) => {
          document.cookie = `brezel-locale=${event.target.value}; path=/; max-age=31536000; samesite=lax`;
          window.location.reload();
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
