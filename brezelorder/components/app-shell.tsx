import Link from "next/link";
import { cookies } from "next/headers";
import {
  BarChart3,
  ChefHat,
  Home,
  LayoutGrid
  ,
  Menu,
  MenuSquare,
  MonitorSmartphone,
  QrCode,
  SlidersHorizontal,
  Settings,
  Shield,
  Users
} from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export async function AppShell({
  title,
  subtitle,
  pathname,
  children,
  actions,
  locale,
  labels,
  navItems,
  layoutMode = "sidebar",
  headerMode
}: {
  title: string;
  subtitle?: string;
  pathname: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  locale: Locale;
  labels: {
    brand: string;
    language: string;
    german: string;
    korean: string;
    english: string;
    overview: string;
    menu: string;
    tables: string;
    qr: string;
    pos: string;
    staff: string;
    settings: string;
  };
  navItems?: Array<{
    href: string;
    label: string;
    iconKey?: "overview" | "menu" | "tables" | "qr" | "team" | "analytics" | "pos" | "staff" | "kitchen" | "platform" | "settingsPage";
  }>;
  layoutMode?: "sidebar" | "stacked";
  headerMode?: "surface" | "compact";
}) {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = cookieStore.get("brezel-sidebar-collapsed")?.value === "1";
  const resolvedHeaderMode = headerMode ?? (layoutMode === "sidebar" ? "compact" : "surface");
  const defaultNavigation = [
    { href: "/admin", label: labels.overview, iconKey: "overview" as const },
    { href: "/admin/menu", label: labels.menu, iconKey: "menu" as const },
    { href: "/admin/tables", label: labels.tables, iconKey: "tables" as const },
    { href: "/admin/qr", label: labels.qr, iconKey: "qr" as const },
    { href: "/admin/settings", label: labels.settings, iconKey: "settingsPage" as const },
    { href: "/pos", label: labels.pos, iconKey: "pos" as const },
    { href: "/staff", label: labels.staff, iconKey: "staff" as const }
  ];
  const navigation = (navItems ?? defaultNavigation).map((item) => ({
    ...item,
    iconKey:
      item.iconKey ??
      ({
        "/admin": "overview",
        "/admin/menu": "menu",
        "/admin/tables": "tables",
        "/admin/qr": "qr",
        "/admin/team": "team",
        "/admin/analytics": "analytics",
        "/admin/settings": "settingsPage",
        "/pos": "pos",
        "/staff": "staff",
        "/kitchen": "kitchen",
        "/platform": "platform"
      }[item.href] as
        | "overview"
        | "menu"
        | "tables"
        | "qr"
        | "team"
        | "analytics"
        | "pos"
        | "staff"
        | "kitchen"
        | "platform"
        | "settingsPage"
        | undefined)
  }));
  const serverIcons = {
    overview: Home,
    menu: MenuSquare,
    tables: LayoutGrid,
    qr: QrCode,
    team: Users,
    analytics: BarChart3,
    pos: MonitorSmartphone,
    staff: Settings,
    kitchen: ChefHat,
    platform: Shield,
    settingsPage: SlidersHorizontal
  } as const;

  if (layoutMode === "stacked") {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
          <header className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/" className="text-sm font-semibold text-warm-500">
                {labels.brand}
              </Link>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm text-stone-600">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          </header>

          <nav className="surface flex gap-2 overflow-x-auto p-2">
            {navigation.map((item) => {
              const Icon = item.iconKey ? serverIcons[item.iconKey] : undefined;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-max items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium",
                    pathname === item.href
                      ? "bg-ink text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                  )}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <main className="pb-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 md:px-6 md:py-6">
        <AdminSidebar
          brand={labels.brand}
          locale={locale}
          pathname={pathname}
          navItems={navigation}
          initialCollapsed={initialSidebarCollapsed}
          labels={{
            language: labels.language
          }}
          actions={actions}
        />

        <div className="min-w-0 flex-1">
          {resolvedHeaderMode === "surface" ? (
            <header className="surface relative flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between lg:min-h-[156px]">
              <div className="pr-16 lg:pr-0">
                <Link href="/" className="text-sm font-semibold text-warm-500 lg:hidden">
                  {labels.brand}
                </Link>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 max-w-3xl text-sm text-stone-600">{subtitle}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:hidden">{actions}</div>
              <details className="absolute right-5 top-5 lg:hidden">
                <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-line bg-white text-ink shadow-sm transition hover:bg-stone-50">
                  <Menu className="h-5 w-5" />
                </summary>
                <div className="absolute right-0 top-14 z-40 w-[280px] overflow-hidden rounded-[1.4rem] border border-line bg-white p-2 shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
                  <div className="mb-2 border-b border-line/70 px-3 pb-3 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                      {labels.brand}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">{title}</p>
                  </div>
                  <nav className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.iconKey ? serverIcons[item.iconKey] : undefined;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                            pathname === item.href
                              ? "bg-ink text-white"
                              : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                          )}
                        >
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </details>
            </header>
          ) : (
            <header className="relative border-b border-line/60 px-1 pb-2 pt-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0 pr-16 lg:pr-0">
                  <Link href="/" className="text-sm font-semibold text-warm-500 lg:hidden">
                    {labels.brand}
                  </Link>
                  <h1 className="mt-0 text-[1.55rem] font-semibold tracking-tight text-ink md:text-[1.72rem]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1 max-w-3xl text-[13px] leading-5 text-stone-500">{subtitle}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:hidden">{actions}</div>
              </div>
              <details className="absolute right-0 top-5 lg:hidden">
                <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-line bg-white text-ink shadow-sm transition hover:bg-stone-50">
                  <Menu className="h-5 w-5" />
                </summary>
                <div className="absolute right-0 top-14 z-40 w-[280px] overflow-hidden rounded-[1.4rem] border border-line bg-white p-2 shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
                  <div className="mb-2 border-b border-line/70 px-3 pb-3 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                      {labels.brand}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">{title}</p>
                  </div>
                  <nav className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.iconKey ? serverIcons[item.iconKey] : undefined;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                            pathname === item.href
                              ? "bg-ink text-white"
                              : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                          )}
                        >
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </details>
            </header>
          )}

          <main className="mt-6 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
