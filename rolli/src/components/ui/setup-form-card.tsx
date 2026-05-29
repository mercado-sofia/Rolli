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
        "px-5 py-7 sm:rounded-[1.75rem] sm:border sm:border-black/6 sm:bg-white sm:px-6 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
