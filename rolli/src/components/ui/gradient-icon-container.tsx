import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: {
    outer: "h-12 w-12 rounded-xl",
    inner: "rounded-[11px]",
  },
  md: {
    outer: "h-14 w-14 rounded-2xl",
    inner: "rounded-[15px]",
  },
  lg: {
    outer: "h-16 w-16 rounded-2xl",
    inner: "rounded-[15px]",
  },
} as const;

type GradientIconContainerProps = {
  children: ReactNode;
  size?: keyof typeof sizeStyles;
  className?: string;
};

export function GradientIconContainer({
  children,
  size = "md",
  className,
}: GradientIconContainerProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "inline-flex shrink-0 bg-gradient-pastel p-px shadow-glow",
        styles.outer,
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-white",
          styles.inner,
        )}
      >
        {children}
      </div>
    </div>
  );
}
