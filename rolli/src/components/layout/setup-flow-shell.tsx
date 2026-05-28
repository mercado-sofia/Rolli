import { type ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import {
  APP_ACTION_INSET_X,
  APP_CONTENT_INSET_X,
} from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type SetupFlowShellProps = {
  header: ReactNode;
  children: ReactNode;
  /** Short instructional line above the footer button */
  hint?: string;
  footer?: ReactNode;
  /** `raised` nudges content slightly above vertical center; default is true center */
  contentAlign?: "center" | "raised";
  className?: string;
};

/** Scroll-safe clearance for absolute header/footer overlays (see SetupFlowHeader). */
const OVERLAY_TOP = "13.25rem";
const OVERLAY_TOP_SM = "14.25rem";
const OVERLAY_BOTTOM = "11.5rem";
const OVERLAY_BOTTOM_SM = "12.5rem";

export function SetupFlowShell({
  header,
  children,
  hint,
  footer,
  contentAlign = "center",
  className,
}: SetupFlowShellProps) {
  const isRaised = contentAlign === "raised";

  return (
    <MobileShell
      variant="app"
      className={cn(
        "relative grid h-dvh max-h-dvh min-h-0 overflow-hidden py-0!",
        isRaised ? "grid-rows-[1.35fr_auto_0.65fr]" : "grid-rows-[1fr_auto_1fr]",
        `[--setup-overlay-top:${OVERLAY_TOP}] [--setup-overlay-bottom:${OVERLAY_BOTTOM}]`,
        `sm:[--setup-overlay-top:${OVERLAY_TOP_SM}] sm:[--setup-overlay-bottom:${OVERLAY_BOTTOM_SM}]`,
        className,
      )}
    >
      {/* Equal-height spacers — header/footer are absolute and do not size these rows */}
      <div className="min-h-0" aria-hidden />

      {/* Middle — centered between spacers; raised uses slightly more space above */}
      <div
        className={cn(
          "flex min-h-0 items-center justify-center",
          APP_CONTENT_INSET_X,
        )}
      >
        <div className="max-h-[calc(100dvh-var(--setup-overlay-top)-var(--setup-overlay-bottom))] w-full overflow-y-auto py-4">
          {children}
        </div>
      </div>

      <div className="min-h-0" aria-hidden />

      {/* Top overlay — back, step indicator, title (out of grid flow) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10",
          APP_CONTENT_INSET_X,
        )}
      >
        <div className="pointer-events-auto pt-[max(1.5rem,env(safe-area-inset-top))] sm:pt-8">
          {header}
        </div>
      </div>

      {/* Bottom overlay — hint + actions (out of grid flow) */}
      {(hint || footer) && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10",
            APP_ACTION_INSET_X,
          )}
        >
          <div className="pointer-events-auto flex flex-col items-center pb-[max(2rem,env(safe-area-inset-bottom))] sm:pb-10">
            {hint ? (
              <p className="w-full max-w-md px-2 text-center text-sm leading-relaxed text-muted">
                {hint}
              </p>
            ) : null}
            {footer ? (
              <div
                className={cn(
                  "flex w-full max-w-md flex-col items-center gap-3",
                  hint ? "mt-14 sm:mt-16" : null,
                )}
              >
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </MobileShell>
  );
}
