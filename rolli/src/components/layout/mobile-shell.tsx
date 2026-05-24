import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
  ambient?: boolean;
};

export function MobileShell({
  children,
  className,
  ambient = true,
}: MobileShellProps) {
  return (
    <div className="relative min-h-dvh bg-canvas text-ink">
      {ambient && (
        <>
          <div
            className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-peach/40 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-lavender/50 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-pink/30 blur-3xl"
            aria-hidden
          />
        </>
      )}
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
