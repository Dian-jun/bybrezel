import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
  }
>;

export function Button({
  className,
  variant = "primary",
  fullWidth,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium",
        "focus:outline-none focus:ring-2 focus:ring-warm-300 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-ink text-white hover:bg-black",
        variant === "secondary" &&
          "theme-button-secondary border hover:brightness-[0.98]",
        variant === "ghost" && "theme-button-ghost bg-transparent text-ink",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
