import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  children
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}
