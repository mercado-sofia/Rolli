"use client";

import { type ReactNode } from "react";

import { AppBackButton } from "@/components/ui/app-back-button";
import { cn } from "@/lib/utils";

type SetupFlowHeaderProps = {
  currentStep?: number;
  totalSteps?: number;
  title: string;
  sublabel: string;
  /** Centered line below sublabel (part of top overlay, not main content) */
  detail?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  /** When false, only back + title block (e.g. waiting room). Default true. */
  showProgress?: boolean;
  className?: string;
};

export function SetupFlowHeader({
  currentStep = 1,
  totalSteps = 1,
  title,
  sublabel,
  detail,
  backHref,
  onBack,
  backLabel,
  showProgress = true,
  className,
}: SetupFlowHeaderProps) {
  const progress = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <header className={className}>
      <div className="relative flex items-start justify-center">
        <div className="absolute left-0 top-0">
          {backHref || onBack ? (
            <AppBackButton backHref={backHref} onBack={onBack} backLabel={backLabel} />
          ) : (
            <div className="h-9 w-9" aria-hidden />
          )}
        </div>

        {showProgress ? (
          <div className="flex flex-col items-center gap-2.5 px-12">
            <p className="text-xs font-medium tabular-nums text-muted">
              {currentStep} / {totalSteps}
            </p>
            <div
              className="relative h-1.5 w-28 overflow-hidden rounded-full bg-black/10 sm:w-32"
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-label={`Step ${currentStep} of ${totalSteps}`}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-pink-highlight transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "text-center",
          showProgress ? "mt-12 sm:mt-14" : "mt-8 sm:mt-10",
        )}
      >
        <h1 className="font-display text-[clamp(2rem,7vw,2.75rem)] leading-tight tracking-tight text-pink-highlight">
          {title}
        </h1>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-overline text-pink-muted">
          {sublabel}
        </p>
        {detail ? (
          <p className="mt-8 text-sm text-muted sm:mt-10">{detail}</p>
        ) : null}
      </div>
    </header>
  );
}
