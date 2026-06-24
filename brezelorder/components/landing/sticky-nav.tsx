"use client";

import { useEffect, useMemo, useState } from "react";

type StickyNavProps = {
  links: Array<[string, string]>;
  className?: string;
};

export function StickyNav({ links, className }: StickyNavProps) {
  const ids = useMemo(() => links.map(([id]) => id), [links]);
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.15, 0.3, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [ids]);

  return (
    <nav className={className}>
      {links.map(([id, label]) => {
        const isActive = activeId === id;

        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={isActive ? "true" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-[linear-gradient(135deg,var(--brand-lilac),var(--brand-accent-soft))] text-[var(--brand-ink)] shadow-[0_10px_24px_rgba(255,106,61,0.12)]"
                : "text-[var(--brand-muted)] hover:bg-[rgba(213,192,255,0.18)] hover:text-[var(--brand-ink)]"
            }`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
