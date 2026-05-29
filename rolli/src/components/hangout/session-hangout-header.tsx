"use client";

import { useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { formatDuration } from "@/lib/hangout/format-duration";
import { cn } from "@/lib/utils";

type SessionHangoutHeaderProps = {
  title: string;
  startedAt: string | null;
  autoEndHours?: number;
  className?: string;
};

function formatAutoEndLabel(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `auto-ends after ${days} ${days === 1 ? "day" : "days"}`;
  }
  return `auto-ends after ${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function SessionHangoutHeader({
  title,
  startedAt,
  autoEndHours,
  className,
}: SessionHangoutHeaderProps) {
  const elapsedMs = useElapsedTimer(startedAt);
  const elapsedLabel = startedAt ? formatDuration(elapsedMs) : "00:00:00";
  const autoEndLabel =
    autoEndHours !== undefined ? formatAutoEndLabel(autoEndHours) : null;

  return (
    <header
      className={cn(
        "relative shrink-0 overflow-hidden bg-pink-highlight text-center",
        "pt-[max(1.25rem,env(safe-area-inset-top))] pb-14 sm:pb-16 md:pb-18 md:pt-8",
        className,
      )}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center gap-1 px-4 sm:px-6">
        <h1 className="max-w-full truncate font-display text-[clamp(2rem,9vw,3rem)] leading-none tracking-tight text-white lowercase md:text-5xl">
          {title}
        </h1>
        <p className="text-[11px] font-semibold uppercase tracking-overline text-pink-accent sm:text-xs">
          Hangout
        </p>

        <div className="mt-6 flex flex-col items-center gap-1 sm:mt-8 md:mt-10">
          <p className="text-xs font-medium text-white/90 sm:text-sm">Time count</p>
          <p className="font-display text-[clamp(2rem,8vw,2.75rem)] tabular-nums leading-none tracking-tight text-white md:text-5xl">
            {elapsedLabel}
          </p>
          <span
            className="mt-1 h-0.5 w-14 rounded-full bg-[#3498db] sm:w-16"
            aria-hidden
          />
          {autoEndLabel ? (
            <p className="mt-2 max-w-xs text-xs font-medium text-pink-accent sm:text-sm">
              {autoEndLabel}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="pointer-events-none absolute -bottom-7 left-1/2 z-0 h-14 w-[115%] -translate-x-1/2 rounded-[50%] bg-pink-highlight sm:-bottom-8 sm:h-16 md:-bottom-9 md:h-18"
        aria-hidden
      />
    </header>
  );
}
