import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormCalloutProps = {
  children: ReactNode;
  className?: string;
};

export function FormCallout({ children, className }: FormCalloutProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/6 bg-[#F8F8F8] px-5 py-4 text-sm leading-relaxed text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
