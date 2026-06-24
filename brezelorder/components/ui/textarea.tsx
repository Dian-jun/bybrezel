import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "theme-field min-h-24 w-full rounded-2xl border px-4 py-3 text-sm",
        "focus:border-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-200",
        className
      )}
      {...props}
    />
  );
}
