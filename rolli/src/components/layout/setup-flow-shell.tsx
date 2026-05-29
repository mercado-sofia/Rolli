import { type ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import {
  SETUP_FLOW_FOOTER_CLASS,
  SETUP_FLOW_FOOTER_HINT_CLASS,
  SETUP_FLOW_FOOTER_INNER_CLASS,
  SETUP_FLOW_HEADER_CLASS,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_INNER_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
  SETUP_FLOW_MAIN_UPPER_CLASS,
  SETUP_FLOW_SHELL_CLASS,
} from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

export {
  SETUP_FLOW_FOOTER_CLASS,
  SETUP_FLOW_HEADER_CLASS,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
  SETUP_FLOW_MAIN_UPPER_CLASS,
};

type SetupFlowShellProps = {
  children: ReactNode;
  className?: string;
};

/** Full-height setup page canvas — place header, main, and footer as normal siblings. */
export function SetupFlowShell({ children, className }: SetupFlowShellProps) {
  return (
    <MobileShell
      variant="app"
      desktopFrame={false}
      className={cn(SETUP_FLOW_SHELL_CLASS, className)}
    >
      <div className={SETUP_FLOW_INNER_CLASS}>{children}</div>
    </MobileShell>
  );
}

type SetupFlowFooterProps = {
  hint?: string;
  children?: ReactNode;
};

/** Optional bottom bar (hint + actions) — same look as before, no slot API on the shell. */
export function SetupFlowFooter({ hint, children }: SetupFlowFooterProps) {
  if (!hint && !children) {
    return null;
  }

  return (
    <footer className={SETUP_FLOW_FOOTER_CLASS}>
      <div className={SETUP_FLOW_FOOTER_INNER_CLASS}>
        {hint ? <p className={SETUP_FLOW_FOOTER_HINT_CLASS}>{hint}</p> : null}
        {children ? (
          <div className="flex w-full flex-col items-stretch gap-3">
            {children}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
