"use client";

import { AppBackButton } from "@/components/ui/app-back-button";
import { cn } from "@/lib/utils";

type SetupFlowHeaderProps = {
  currentStep?: number;
  totalSteps?: number;
  title: string;
  sublabel: string;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  /** When false, only back + title block (e.g. waiting room). Default true. */
  showProgress?: boolean;
  /** Page title color — default pink; use ink (black) on start page only */
  titleTone?: "pink" | "ink";
  className?: string;
};

export function SetupFlowHeader({
  currentStep = 1,
  totalSteps = 1,
  title,
  sublabel,
  backHref,
  onBack,
  backLabel,
  showProgress = true,
  titleTone = "pink",
  className,
}: SetupFlowHeaderProps) {
  const progress = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <header className={className}>
      <div
        className={cn(
          "relative flex items-start justify-center",
          "md:grid md:grid-cols-[2.5rem_1fr_2.5rem] md:items-center",
        )}
      >
        <div className="absolute left-0 top-0 md:static md:justify-self-start">
          {backHref || onBack ? (
            <AppBackButton backHref={backHref} onBack={onBack} backLabel={backLabel} />
          ) : (
            <div className="h-9 w-9" aria-hidden />
          )}
        </div>

        {showProgress ? (
          <div className="flex flex-col items-center gap-2.5 px-12 md:px-0 md:justify-self-center">
            <p className="text-xs font-medium tabular-nums text-muted">
              {currentStep} / {totalSteps}
            </p>
            <div
              className="relative h-1.5 w-28 overflow-hidden rounded-full bg-black/10 sm:w-32 md:w-48 lg:w-56"
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
        ) : (
          <div className="hidden md:block" aria-hidden />
        )}
      </div>

      <div
        className={cn(
          "text-center",
          showProgress ? "mt-12 sm:mt-14 md:mt-8 md:text-left" : "mt-8 sm:mt-10 md:mt-6 md:text-left",
        )}
      >
        <h1
          className={cn(
            "font-display text-[clamp(2rem,7vw,2.75rem)] leading-tight tracking-tight md:text-[2.5rem] lg:text-[2.75rem]",
            titleTone === "ink" ? "text-ink" : "text-pink-highlight",
          )}
        >
          {title}
        </h1>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-overline text-pink-muted md:text-xs">
          {sublabel}
        </p>
      </div>
    </header>
  );
}
