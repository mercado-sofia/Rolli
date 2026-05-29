import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
};

export function Card({ children, className, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        "p-6",
        gradient
          ? "rounded-3xl border border-lavender-deep/25 bg-gradient-pastel text-white"
          : "sm:rounded-3xl sm:border sm:border-black/8 sm:bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
