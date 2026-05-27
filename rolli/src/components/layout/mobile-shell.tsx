import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
  ambient?: boolean;
  /** When false, parent controls height (e.g. hero fits below navbar). */
  fillViewport?: boolean;
};

export function MobileShell({
  children,
  className,
  ambient = true,
  fillViewport = true,
}: MobileShellProps) {
  return (
    <div
      className={cn(
        "relative overflow-x-hidden bg-canvas text-ink",
        fillViewport ? "min-h-dvh" : "h-full min-h-0",
      )}
    >
      {ambient && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-pink/25 blur-3xl" />
          <div className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-lavender-deep/20 blur-3xl" />
        </div>
      )}
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-md flex-col px-4 sm:px-5",
          fillViewport ? "min-h-dvh py-8" : "h-full min-h-0 py-0",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
