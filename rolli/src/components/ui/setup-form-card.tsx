import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SetupFormCardProps = {
  children: ReactNode;
  className?: string;
};

/** Spacious form container for setup / join flows */
export function SetupFormCard({ children, className }: SetupFormCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-black/6 bg-white",
        "px-5 py-7 shadow-[0_10px_44px_rgba(26,26,26,0.05)] sm:px-6 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
