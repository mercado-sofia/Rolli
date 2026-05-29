import { type ReactNode } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { APP_CONTENT_MARGIN_X, APP_PAGE_STACK_GAP } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type AppPageContentProps = {
  children: ReactNode;
  className?: string;
};

function AppPageContent({ children, className }: AppPageContentProps) {
  return (
    <div
      className={cn("flex w-full min-w-0 flex-col", APP_CONTENT_MARGIN_X, className)}
    >
      {children}
    </div>
  );
}

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
