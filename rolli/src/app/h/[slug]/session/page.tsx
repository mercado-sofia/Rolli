"use client";

import { HANGOUT_LIMITS } from "@/lib/constants";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSessionStore } from "@/store/session-store";

export default function SessionPage() {
  const hangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);
  const photosRemaining =
    HANGOUT_LIMITS.maxPhotosPerUser - (participant?.photosTaken ?? 0);

  return (
    <MobileShell className="justify-center gap-8">
      <div>
        <p className="text-sm font-medium text-muted">Active hangout</p>
        <h1 className="font-display mt-2 text-3xl text-ink">
          {hangout?.title ?? "Hangout"}
        </h1>
      </div>

      <Card gradient className="text-center">
        <p className="text-sm text-white/80">Elapsed time</p>
        <p className="font-display mt-2 text-5xl">00:42:18</p>
      </Card>

      <Card>
        <p className="text-sm text-muted">Photos remaining</p>
        <p className="mt-2 text-3xl font-semibold text-ink">{photosRemaining}</p>
      </Card>

      <Button type="button">Capture memory (mock)</Button>

      {participant?.isFilmKeeper && (
        <Button variant="secondary" type="button">
          Develop Memories
        </Button>
      )}
    </MobileShell>
  );
}
