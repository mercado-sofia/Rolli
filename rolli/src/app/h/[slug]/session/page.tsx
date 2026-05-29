"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CameraCapture } from "@/components/hangout/camera-capture";
import { ElapsedTimer } from "@/components/hangout/elapsed-timer";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
import { AppScrollShell } from "@/components/layout/app-scroll-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { endHangout } from "@/lib/hangout/hangouts";
import { useSessionStore } from "@/store/session-store";

export default function SessionPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const setParticipant = useSessionStore((state) => state.setParticipant);

  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const { displayHangout, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const photosRemaining =
    HANGOUT_LIMITS.maxPhotosPerUser - (participant?.photosTaken ?? 0);

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
      <AppScrollShell>
        <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
        </div>
        <div className="hidden w-full animate-pulse space-y-6 md:block">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-black/10" />
            <div className="h-9 w-56 rounded-lg bg-black/10 md:h-10 md:w-72" />
          </div>
          <div className="h-16 w-full rounded-3xl border border-container-border bg-white" />
          <div className="h-28 w-full rounded-3xl border border-container-border bg-white" />
          <div className="h-64 w-full rounded-3xl border border-container-border bg-white" />
          <div className="h-12 w-full rounded-full bg-black/10" />
          <div className="h-12 w-full rounded-full bg-black/10" />
        </div>
      </AppScrollShell>
    );
  }

  return (
    <AppScrollShell>
      <div>
        <p className="text-sm font-medium text-muted">Active hangout</p>
        <h1 className="font-display mt-2 text-[clamp(1.5rem,5vw,1.875rem)] leading-tight text-ink md:text-3xl">
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
            className={APP_PRIMARY_BUTTON_CLASS}
            onClick={() => void handleDevelopMemories()}
          >
            {ending ? "Ending…" : "End hangout"}
          </Button>
        </>
      )}

      <LeaveRoomButton
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        className={APP_PRIMARY_BUTTON_CLASS}
      />
    </AppScrollShell>
  );
}
