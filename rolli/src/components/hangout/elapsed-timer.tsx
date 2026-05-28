"use client";

import { Card } from "@/components/ui/card";
import { useElapsedTimer } from "@/hooks/use-elapsed-timer";
import { formatDuration } from "@/lib/format-duration";

type ElapsedTimerProps = {
  startedAt: string | null;
  autoEndHours?: number;
};

export function ElapsedTimer({ startedAt, autoEndHours }: ElapsedTimerProps) {
  const elapsedMs = useElapsedTimer(startedAt);
  const elapsedLabel = startedAt ? formatDuration(elapsedMs) : "00:00:00";

  const autoEndMs =
    autoEndHours !== undefined ? autoEndHours * 60 * 60 * 1000 : null;
  const remainingMs =
    autoEndMs !== null ? Math.max(0, autoEndMs - elapsedMs) : null;

  return (
    <Card className="text-center">
      <p className="text-sm text-muted">Elapsed time</p>
      <p className="font-display mt-2 text-4xl tabular-nums sm:text-5xl">{elapsedLabel}</p>
      {remainingMs !== null && remainingMs > 0 && (
        <p className="mt-3 text-sm text-muted">
          Auto-ends in {formatDuration(remainingMs)}
        </p>
      )}
      {remainingMs === 0 && (
        <p className="mt-3 text-sm text-ink">
          Time&apos;s up — hangout is ending…
        </p>
      )}
    </Card>
  );
}
