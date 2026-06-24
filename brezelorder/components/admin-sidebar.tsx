"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  ChefHat,
  Home,
  LayoutGrid,
  MenuSquare,
  MonitorSmartphone,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  SlidersHorizontal,
  Settings,
  Shield,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "brezel-admin-sidebar-collapsed";

const SIDEBAR_ICONS = {
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

type SidebarIconKey = keyof typeof SIDEBAR_ICONS;

export function AdminSidebar({
  brand,
  locale,
  pathname,
  labels,
  navItems,
  actions,
  initialCollapsed = false
}: {
  brand: string;
  locale: Locale;
  pathname: string;
  labels: {
    language: string;
  };
  navItems: Array<{ href: string; label: string; iconKey?: SidebarIconKey }>;
  actions?: React.ReactNode;
  initialCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const isKorean = locale === "ko";

  const groupedNav = useMemo(() => {
    const groups = [
      {
        key: "admin",
        title: isKorean ? "관리자" : "Admin",
        items: navItems.filter((item) =>
          ["/admin", "/admin/menu", "/admin/tables", "/admin/qr", "/admin/team", "/admin/analytics", "/admin/settings"].includes(item.href)
        )
      },
      {
        key: "pos",
        title: "POS",
        items: navItems.filter((item) => ["/pos", "/staff", "/kitchen"].includes(item.href))
      },
      {
        key: "platform",
        title: isKorean ? "플랫폼" : "Platform",
        items: navItems.filter((item) => item.href === "/platform")
      }
    ];

    return groups.filter((group) => group.items.length > 0);
  }, [isKorean, navItems]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    document.cookie = `brezel-sidebar-collapsed=${collapsed ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:flex-col lg:rounded-[2rem] lg:border lg:border-[color:var(--sidebar-border)] lg:bg-[var(--sidebar-bg)] lg:py-5 lg:text-[color:var(--sidebar-text)] lg:shadow-[0_24px_60px_rgba(15,23,42,0.16)] lg:transition-[width,padding,box-shadow,background-color,border-color] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "lg:w-[84px] lg:px-3" : "lg:w-[248px] lg:px-4"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-[color:var(--sidebar-border)] pb-4",
          collapsed ? "justify-center" : "justify-between gap-3"
        )}
      >
        <div
          className={cn(
            "min-w-0 overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            collapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-[180px] translate-x-0 opacity-100"
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[1rem]">
              <Image
                src="/brezelorder.png"
                alt="Brezel Order"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[1.08rem] font-semibold tracking-[-0.02em] text-[color:var(--sidebar-text)]">
                {brand}
              </span>
            </span>
          </Link>
        </div>
        {collapsed ? (
          <Link
            href="/"
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_30%_20%,_rgba(242,138,103,0.34),_rgba(196,181,253,0.16)_50%,_rgba(255,255,255,0.02)_100%)] text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[radial-gradient(circle_at_30%_20%,_rgba(242,138,103,0.42),_rgba(196,181,253,0.2)_50%,_rgba(255,255,255,0.03)_100%)]"
            title={brand}
          >
            <Image
              src="/brezelorder.png"
              alt="Brezel Order"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </Link>
        ) : null}

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-[1rem] text-[color:var(--sidebar-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className={cn("no-scrollbar mt-5 flex-1 overflow-y-auto pr-1", collapsed ? "space-y-4" : "space-y-5")}>
        {collapsed ? (
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="relative flex h-11 w-11 items-center justify-center rounded-[0.95rem] text-[color:var(--sidebar-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)]"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            </button>
            <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#202226] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition duration-200 group-hover:opacity-100">
              {isKorean ? "사이드바 열기" : "Sidebar öffnen"}
            </span>
          </div>
        ) : null}

        {groupedNav.map((group) => (
          <div key={group.key} className={cn(!collapsed && "border-t border-[color:var(--sidebar-border)] pt-4 first:border-t-0 first:pt-0")}>
            <div
              className={cn(
                "overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                collapsed ? "max-h-0 -translate-y-1 opacity-0" : "max-h-12 translate-y-0 opacity-100"
              )}
            >
              <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--sidebar-subtle)]">
                {group.title}
              </p>
            </div>

            <div className={cn("space-y-px", collapsed && "space-y-1")}>
              {group.items.map((item) => {
                const Icon = item.iconKey ? SIDEBAR_ICONS[item.iconKey] : undefined;
                const isActive = pathname === item.href;

                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "relative flex items-center text-[14px] font-medium transition-all duration-200",
                        collapsed
                          ? "justify-center rounded-[0.8rem] px-0 py-2.5"
                          : "gap-3 rounded-[0.8rem] px-3 py-2.5",
                        isActive
                          ? "bg-[var(--sidebar-active-bg)] text-[color:var(--sidebar-text)]"
                          : "text-[color:var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[color:var(--sidebar-text)]"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-full transition-all duration-200",
                          isActive
                            ? "bg-[linear-gradient(180deg,#c4b5fd,#f28a67)] opacity-100"
                            : "bg-[color:var(--sidebar-subtle)] opacity-0 group-hover:opacity-20"
                        )}
                      />
                      {Icon ? (
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.9rem] transition-colors duration-200",
                            isActive
                              ? "bg-transparent text-[color:var(--sidebar-text)]"
                              : "bg-transparent text-[color:var(--sidebar-muted)] group-hover:text-[color:var(--sidebar-text)]"
                          )}
                        >
                          <Icon className="h-[17px] w-[17px]" />
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          collapsed ? "max-w-0 translate-x-1 opacity-0" : "max-w-[160px] translate-x-0 opacity-100"
                        )}
                      >
                        <span className="block truncate">{item.label}</span>
                      </span>
                    </Link>

                    {collapsed ? (
                      <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#202226] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition duration-200 group-hover:opacity-100">
                        {item.label}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

    </aside>
  );
}
