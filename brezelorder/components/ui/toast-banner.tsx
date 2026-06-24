"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ToastBanner({
  message,
  tone = "success"
}: {
  message?: string | null;
  tone?: "success" | "error";
}) {
  const [visible, setVisible] = useState(Boolean(message));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!message) return;

    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("toast");
      params.delete("toastType");
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [message, pathname, router, searchParams]);

  if (!message || !visible) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded-2xl border px-4 py-3 text-sm font-medium shadow-panel ${
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {message}
    </div>
  );
}
