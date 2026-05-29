import { type ReactNode } from "react";

import { AppPageContent } from "@/components/layout/app-page-content";
import { MobileShell } from "@/components/layout/mobile-shell";
import { APP_PAGE_STACK_GAP } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type AppScrollShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Vertically center when content is short (e.g. loading) */
  centered?: boolean;
};

/** Scrollable app page shell — safe areas, max width, comfortable stacking gaps */
export function AppScrollShell({
  children,
  className,
  contentClassName,
  centered = false,
}: AppScrollShellProps) {
  return (
    <MobileShell
      variant="app"
      scrollable
      className={cn(centered && "justify-center", className)}
    >
      <AppPageContent className={cn(APP_PAGE_STACK_GAP, contentClassName)}>
        {children}
      </AppPageContent>
    </MobileShell>
  );
}
