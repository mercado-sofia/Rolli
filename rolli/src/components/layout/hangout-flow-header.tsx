"use client";

import { AppBackButton } from "@/components/ui/app-back-button";

type HangoutFlowHeaderProps = {
  title: string;
  sublabel: string;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
};

export function HangoutFlowHeader({
  title,
  sublabel,
  backHref,
  onBack,
  backLabel,
}: HangoutFlowHeaderProps) {
  return (
    <header>
      <div className="relative flex items-start justify-center">
        <div className="absolute left-0 top-0">
          {backHref || onBack ? (
            <AppBackButton backHref={backHref} onBack={onBack} backLabel={backLabel} />
          ) : (
            <div className="h-9 w-9" aria-hidden />
          )}
        </div>
      </div>

      <div className="mt-12 text-center sm:mt-14">
        <h1 className="font-display text-[clamp(2rem,7vw,2.75rem)] leading-tight tracking-tight text-pink-highlight">
          {title}
        </h1>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-overline text-pink-muted">
          {sublabel}
        </p>
      </div>
    </header>
  );
}
