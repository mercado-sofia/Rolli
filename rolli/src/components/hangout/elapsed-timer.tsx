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
    <Card gradient className="text-center">
      <p className="text-sm text-white/80">Elapsed time</p>
      <p className="font-display mt-2 text-5xl tabular-nums">{elapsedLabel}</p>
      {remainingMs !== null && (
        <p className="mt-3 text-sm text-white/70">
          Auto-ends in {formatDuration(remainingMs)}
        </p>
      )}
    </Card>
  );
}
