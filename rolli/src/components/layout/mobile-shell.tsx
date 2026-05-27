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
    <div
      className={cn(
        "relative min-h-dvh bg-canvas text-ink",
        ambient && "overflow-x-hidden",
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
          "relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
