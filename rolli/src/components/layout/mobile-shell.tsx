import { type ReactNode } from "react";

import { APP_SHELL_PY } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type MobileShellProps = {
  children: ReactNode;
  className?: string;
  backgroundClassName?: string;
  ambient?: boolean;
  /** When false, parent controls height (e.g. hero fits below navbar). */
  fillViewport?: boolean;
  /** App pages: tighter vertical padding on mobile; landing keeps default. */
  variant?: "default" | "app";
};

export function MobileShell({
  children,
  className,
  backgroundClassName = "bg-canvas",
  ambient = true,
  fillViewport = true,
  variant = "default",
}: MobileShellProps) {
  const shellPadding =
    variant === "app"
      ? cn("px-4", APP_SHELL_PY)
      : "px-4 py-8 sm:px-5";
  return (
    <div
      className={cn(
        "relative overflow-x-hidden text-ink",
        backgroundClassName,
        fillViewport ? "min-h-dvh" : "h-full min-h-0",
      )}
    >
      {ambient && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-pink/15 blur-3xl" />
          <div className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-pink-highlight/10 blur-3xl" />
        </div>
      )}
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-md flex-col",
          fillViewport ? cn("min-h-dvh", shellPadding) : "h-full min-h-0 py-0",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
