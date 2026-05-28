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
  className?: string;
};

export function SetupFlowShell({
  header,
  children,
  hint,
  footer,
  className,
}: SetupFlowShellProps) {
  return (
    <MobileShell
      variant="app"
      className={cn(
        "grid h-dvh max-h-dvh min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden py-0! supports-[height:100dvh]",
        className,
      )}
    >
      {/* Top row — height only affects the middle row via grid, not absolute overlap */}
      <div
        className={cn(
          "z-10 min-h-0 pt-6 sm:pt-8",
          APP_CONTENT_INSET_X,
        )}
      >
        {header}
      </div>

      {/* Middle row — vertically centered in remaining space between header and footer */}
      <div
        className={cn(
          "flex min-h-0 items-center justify-center overflow-y-auto",
          APP_CONTENT_INSET_X,
        )}
      >
        <div className="w-full py-4">{children}</div>
      </div>

      {/* Bottom row — hint + actions; height shrinks the middle row, not overlaying it */}
      <div
        className={cn(
          "z-10 flex min-h-0 flex-col items-center pb-8 sm:pb-10",
          APP_ACTION_INSET_X,
        )}
      >
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
    </MobileShell>
  );
}
