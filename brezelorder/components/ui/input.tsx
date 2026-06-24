import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "theme-field min-h-11 w-full rounded-2xl border px-4 py-3 text-sm",
        "focus:border-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-200",
        className
      )}
      {...props}
    />
  );
}
