"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LuFilm } from "react-icons/lu";

import { HangoutCardIcon } from "@/components/hangout/hangout-card-icon";
import { RevealCountdownOverlay } from "@/components/hangout/reveal-countdown-overlay";
import { Button } from "@/components/ui/button";
import { useRevealCountdown } from "@/hooks/use-reveal-countdown";
import type { useRevealPrepare } from "@/hooks/use-reveal-prepare";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { isRevealCountdownActive } from "@/lib/hangout/reveal-countdown";
import {
  getRevealPreload,
  isRevealPreloadUsable,
} from "@/lib/hangout/reveal-preload-cache";
import {
  preloadRevealAmbientAudio,
  preloadRevealState,
} from "@/lib/hangout/reveal-preload";
import { signalRevealPending, startReveal } from "@/lib/hangout/reveal";
import { playRevealAmbientAudio } from "@/lib/hangout/reveal-ambient-audio-controller";
import type { Hangout } from "@/types/hangout";
import { cn } from "@/lib/utils";

function DevelopingStatusMessage({
  revealStarting,
  prepareStatus,
  prepareError,
  photoCount,
  perspectiveCount,
  onRetry,
}: {
  revealStarting: boolean;
  prepareStatus: ReturnType<typeof useRevealPrepare>["status"];
  prepareError: string | null;
  photoCount: number;
  perspectiveCount: number;
  onRetry: () => void;
}) {
  if (revealStarting) {
    return (
      <p className="mt-3 text-sm font-medium leading-relaxed text-pink-highlight">
        Reveal starting…
      </p>
    );
  }

  if (prepareStatus === "loading" || prepareStatus === "idle") {
    return (
      <div className="mt-4 flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-muted">
          Preparing memories…
        </p>
      </div>
    );
  }

  if (prepareStatus === "error") {
    return (
      <div className="mt-3 space-y-3">
        <p className="text-sm leading-relaxed text-pink">
          {prepareError ?? "Could not prepare memories."}
        </p>
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <p className="mt-3 text-sm leading-relaxed text-muted">
      {photoCount > 0
        ? `${photoCount} photo${photoCount === 1 ? "" : "s"} from ${perspectiveCount} perspective${perspectiveCount === 1 ? "" : "s"} ready.`
        : "Memories ready — no photos were captured, but you can still reveal."}
    </p>
  );
}

const DEVELOPING_OVERLAY_PANEL_CLASS = cn(
  "flex flex-col items-center justify-center bg-white px-6 text-center sm:px-8",
);

type DevelopingOverlayPanelProps = {
  className?: string;
  revealStarting: boolean;
  prepare: ReturnType<typeof useRevealPrepare>;
};

function DevelopingOverlayPanel({
  className,
  revealStarting,
  prepare,
}: DevelopingOverlayPanelProps) {
  return (
    <div
      className={cn(DEVELOPING_OVERLAY_PANEL_CLASS, className)}
      role="dialog"
      aria-label="Preparing reveal"
    >
      <HangoutCardIcon
        icon={LuFilm}
        borderTone="ink"
        iconClassName="text-ink"
      />
      <p className="font-display mt-4 max-w-md text-2xl leading-snug">
        {revealStarting ? "Reveal starting" : "Memories in the darkroom"}
      </p>
      <DevelopingStatusMessage
        revealStarting={revealStarting}
        prepareStatus={prepare.status}
        prepareError={prepare.error}
        photoCount={prepare.photoCount}
        perspectiveCount={prepare.perspectiveCount}
        onRetry={prepare.retry}
      />
    </div>
  );
}

export type DevelopingPrepareOverlayProps = {
  hangout: Hangout;
  hangoutId: string;
  sessionToken: string;
  isFilmKeeper: boolean;
  prepare: ReturnType<typeof useRevealPrepare>;
  onHangoutUpdate: (hangout: Hangout) => void;
  onFooterChange: (footer: {
    hint?: string;
    children?: ReactNode;
  }) => void;
};

export function DevelopingPrepareOverlay({
  hangout,
  hangoutId,
  sessionToken,
  isFilmKeeper,
  prepare,
  onHangoutUpdate,
  onFooterChange,
}: DevelopingPrepareOverlayProps) {
  const [starting, setStarting] = useState(false);
  const [signaling, setSignaling] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | null>(
    null,
  );
  const finishingRevealRef = useRef(false);

  const countdownActive = isRevealCountdownActive(countdownStartedAt);
  const revealStarting = Boolean(hangout.revealPendingAt);

  const handleCountdownComplete = useCallback(async () => {
    if (finishingRevealRef.current) return;

    finishingRevealRef.current = true;
    setStarting(true);
    setStartError(null);

    void playRevealAmbientAudio();

    const { data, error } = await startReveal(hangoutId, sessionToken);

    if (error || !data) {
      finishingRevealRef.current = false;
      setStarting(false);
      setCountdownStartedAt(null);
      setStartError(error ?? "Could not start reveal");
      return;
    }

    const cached = getRevealPreload(hangoutId);
    if (!isRevealPreloadUsable(cached)) {
      await preloadRevealState(hangoutId, sessionToken);
    }

    onHangoutUpdate(data);
    setStarting(false);
  }, [hangoutId, onHangoutUpdate, sessionToken]);

  const { displaySeconds } = useRevealCountdown(countdownStartedAt, {
    enabled: isFilmKeeper && hangout.status === "developing",
    onComplete: handleCountdownComplete,
  });

  const handleBeginCountdown = useCallback(async () => {
    if (countdownActive || !prepare.isReady) return;

    setStartError(null);
    setSignaling(true);

    const { data, error } = await signalRevealPending(hangoutId, sessionToken);

    setSignaling(false);

    if (error || !data) {
      setStartError(error ?? "Could not start reveal");
      return;
    }

    onHangoutUpdate(data);
    preloadRevealAmbientAudio();
    setCountdownStartedAt(Date.now());
  }, [
    countdownActive,
    hangoutId,
    onHangoutUpdate,
    prepare.isReady,
    sessionToken,
  ]);

  const guestFooterHint = revealStarting
    ? "Reveal starting…"
    : "Waiting for the Film Keeper to start the reveal…";

  useEffect(() => {
    onFooterChange({
      hint: isFilmKeeper ? undefined : guestFooterHint,
      children: isFilmKeeper ? (
        <>
          {startError && (
            <p className="text-center text-sm text-pink">{startError}</p>
          )}
          <Button
            type="button"
            disabled={
              starting || signaling || countdownActive || !prepare.isReady
            }
            className={APP_PRIMARY_BUTTON_CLASS}
            onClick={() => void handleBeginCountdown()}
          >
            {countdownActive
              ? "Revealing…"
              : signaling
                ? "Starting…"
                : starting
                  ? "Opening reveal…"
                  : !prepare.isReady
                    ? "Preparing…"
                    : "Start reveal"}
          </Button>
        </>
      ) : null,
    });
  }, [
    countdownActive,
    guestFooterHint,
    handleBeginCountdown,
    isFilmKeeper,
    onFooterChange,
    prepare.isReady,
    signaling,
    startError,
    starting,
  ]);

  return (
    <>
      {displaySeconds !== null ? (
        <RevealCountdownOverlay seconds={displaySeconds} />
      ) : null}

      {typeof document !== "undefined"
        ? createPortal(
            <DevelopingOverlayPanel
              revealStarting={revealStarting}
              prepare={prepare}
              className="fixed inset-0 z-30 min-h-dvh supports-[height:100dvh]:min-h-dvh md:hidden"
            />,
            document.body,
          )
        : null}

      <DevelopingOverlayPanel
        revealStarting={revealStarting}
        prepare={prepare}
        className="absolute inset-0 z-20 hidden md:flex"
      />
    </>
  );
}
