import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "glass";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white shadow-soft hover:bg-ink/90 active:scale-[0.98]",
  secondary:
    "border border-lavender/40 bg-white/70 text-ink hover:bg-white active:scale-[0.98]",
  glass:
    "border border-white/30 bg-white/25 text-white backdrop-blur-md hover:bg-white/35 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all duration-300",
    variantStyles[variant],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
