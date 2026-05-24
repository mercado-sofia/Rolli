"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CameraCapture } from "@/components/hangout/camera-capture";
import { ElapsedTimer } from "@/components/hangout/elapsed-timer";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { endHangout } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";

export default function SessionPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);
  const setHangout = useSessionStore((state) => state.setHangout);
  const setParticipant = useSessionStore((state) => state.setParticipant);

  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const goToWaiting = useCallback(() => {
    router.replace(`/h/${slug}/waiting`);
  }, [router, slug]);

  const goToDeveloping = useCallback(() => {
    router.replace(`/h/${slug}/developing`);
  }, [router, slug]);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({
    slug,
    onWaiting: goToWaiting,
    onDeveloping: goToDeveloping,
  });

  const displayHangout = syncedHangout ?? hangout;
  const photosRemaining =
    HANGOUT_LIMITS.maxPhotosPerUser - (participant?.photosTaken ?? 0);

  const hasValidSession =
    Boolean(participant) &&
    Boolean(displayHangout) &&
    displayHangout!.slug === slug &&
    participant!.hangoutId === displayHangout!.id;

  useEffect(() => {
    if (isLoading) return;

    if (!participant || !displayHangout || displayHangout.slug !== slug) {
      router.replace(`/h/${slug}`);
      return;
    }

    if (participant.hangoutId !== displayHangout.id) {
      router.replace(`/h/${slug}`);
    }
  }, [isLoading, participant, displayHangout, router, slug]);

  async function handleDevelopMemories() {
    if (!participant || !displayHangout) return;

    setEnding(true);
    setEndError(null);

    const { data, error } = await endHangout(
      displayHangout.id,
      participant.sessionToken,
    );

    setEnding(false);

    if (error || !data) {
      setEndError(error ?? "Could not end hangout");
      return;
    }

    setHangout(data);
    router.replace(`/h/${slug}/developing`);
  }

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "active"
  ) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="justify-center gap-8">
      <div>
        <p className="text-sm font-medium text-muted">Active hangout</p>
        <h1 className="font-display mt-2 text-3xl text-ink">
          {displayHangout.title}
        </h1>
      </div>

      <ElapsedTimer
        startedAt={displayHangout.startedAt}
        autoEndHours={HANGOUT_LIMITS.autoEndHours}
      />

      <Card>
        <p className="text-sm text-muted">Photos remaining</p>
        <p className="mt-2 text-3xl font-semibold text-ink">{photosRemaining}</p>
      </Card>

      <CameraCapture
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        photosRemaining={photosRemaining}
        onCaptured={setParticipant}
      />

      {participant.isFilmKeeper && (
        <>
          {endError && (
            <p className="text-center text-sm text-pink">{endError}</p>
          )}
          <Button
            variant="secondary"
            type="button"
            disabled={ending}
            onClick={handleDevelopMemories}
          >
            {ending ? "Developing…" : "Develop Memories"}
          </Button>
        </>
      )}
    </MobileShell>
  );
}
