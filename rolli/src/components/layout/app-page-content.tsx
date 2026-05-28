import { type ReactNode } from "react";

import { APP_CONTENT_MARGIN_X } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type AppPageContentProps = {
  children: ReactNode;
  className?: string;
};

/** Narrows scrollable / centered body content while keeping action buttons at shell width. */
export function AppPageContent({ children, className }: AppPageContentProps) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col", APP_CONTENT_MARGIN_X, className)}>
      {children}
    </div>
  );
}
