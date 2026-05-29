import { type CSSProperties, type ReactNode } from "react";

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
  /** Vertical placement of middle content in the area between header and footer */
  contentAlign?: "center" | "raised" | "upper";
  /** `compact` = back + title only (waiting room); `default` includes step progress */
  headerVariant?: "default" | "compact";
  className?: string;
};

/** Top clearance: safe-area + shell padding + header block (see SetupFlowHeader) */
const OVERLAY_TOP_DEFAULT =
  "calc(max(1.5rem, env(safe-area-inset-top, 0px)) + 11.5rem)";
const OVERLAY_TOP_COMPACT =
  "calc(max(1.5rem, env(safe-area-inset-top, 0px)) + 8.5rem)";

/** Bottom clearance: safe-area + hint/button stack */
const OVERLAY_BOTTOM = "calc(max(2rem, env(safe-area-inset-bottom, 0px)) + 9.5rem)";
const OVERLAY_BOTTOM_WITH_HINT =
  "calc(max(2rem, env(safe-area-inset-bottom, 0px)) + 13.5rem)";

export function SetupFlowShell({
  header,
  children,
  hint,
  footer,
  contentAlign = "center",
  headerVariant = "default",
  className,
}: SetupFlowShellProps) {
  const overlayTop =
    headerVariant === "compact" ? OVERLAY_TOP_COMPACT : OVERLAY_TOP_DEFAULT;
  const overlayBottom = hint ? OVERLAY_BOTTOM_WITH_HINT : OVERLAY_BOTTOM;

  const mainJustify =
    contentAlign === "upper"
      ? "justify-start"
      : contentAlign === "raised"
        ? "justify-center pb-[5dvh]"
        : "justify-center";

  return (
    <MobileShell
      variant="app"
      className={cn(
        "relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden py-0!",
        className,
      )}
    >
      {/* Main scroll region — padded to clear absolute header/footer overlays */}
      <main
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          APP_CONTENT_INSET_X,
          mainJustify,
        )}
        style={
          {
            paddingTop: overlayTop,
            paddingBottom: overlayBottom,
          } as CSSProperties
        }
      >
        <div className="w-full py-2">{children}</div>
      </main>

      {/* Top overlay — back, step indicator, title (out of document flow) */}
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

      {/* Bottom overlay — hint + actions (out of document flow) */}
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
