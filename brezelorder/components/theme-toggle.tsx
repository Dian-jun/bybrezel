"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

export function ThemeToggle({
  locale,
  collapsed = false,
  variant = "sidebar"
}: {
  locale: Locale;
  collapsed?: boolean;
  variant?: "sidebar" | "inline";
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("brezel-theme");
    const nextTheme: ThemeMode = saved === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  function updateTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("brezel-theme", nextTheme);
    document.cookie = `brezel-theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
  }

  if (!mounted) return null;

  if (variant === "inline") {
    const lightLabel = locale === "ko" ? "라이트" : locale === "en" ? "Light" : "Hell";
    const darkLabel = locale === "ko" ? "다크" : locale === "en" ? "Dark" : "Dunkel";

    return (
      <div className="grid grid-cols-2 rounded-[0.95rem] border border-line bg-[var(--surface-bg)] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {([
          { value: "light", label: lightLabel, icon: Sun },
          { value: "dark", label: darkLabel, icon: Moon }
        ] as const).map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateTheme(option.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[0.75rem] px-3 py-2 text-sm transition",
                active ? "bg-ink text-white" : "text-stone-500 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (collapsed) {
    const toggleLabel =
      locale === "ko" ? "라이트/다크 전환" : locale === "en" ? "Toggle light / dark mode" : "Hell/Dunkel wechseln";

    return (
      <button
        type="button"
        onClick={() => updateTheme(theme === "light" ? "dark" : "light")}
        className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-white/60 transition hover:bg-white/[0.045] hover:text-white"
        title={toggleLabel}
        aria-label={toggleLabel}
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div className="rounded-[1rem] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/24">
        {locale === "ko" ? "화면" : locale === "en" ? "Theme" : "Theme"}
      </p>
      <div className="mt-2.5 grid grid-cols-2 rounded-[0.95rem] border border-white/7 bg-white/[0.012] p-1">
        {([
          { value: "light", label: locale === "ko" ? "라이트" : locale === "en" ? "Light" : "Hell", icon: Sun },
          { value: "dark", label: locale === "ko" ? "다크" : locale === "en" ? "Dark" : "Dunkel", icon: Moon }
        ] as const).map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateTheme(option.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[0.75rem] px-3 py-2 text-sm transition",
                active ? "bg-white/[0.08] text-white" : "text-white/52 hover:text-white/78"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
