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
        "rounded-3xl p-6 shadow-soft",
        gradient
          ? "bg-gradient-pastel text-white"
          : "border border-white/60 bg-white/80 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
