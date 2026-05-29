"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { LuFilm } from "react-icons/lu";

import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import { HangoutCardIcon } from "@/components/hangout/hangout-card-icon";
import { RevealCountdownOverlay } from "@/components/hangout/reveal-countdown-overlay";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { MobileLoadingSpinner } from "@/components/ui/mobile-loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useRevealCountdown } from "@/hooks/use-reveal-countdown";
import { useRevealPrepare } from "@/hooks/use-reveal-prepare";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
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
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

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

export default function DevelopingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);

  const [starting, setStarting] = useState(false);
  const [signaling, setSignaling] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | null>(
    null,
  );
  const finishingRevealRef = useRef(false);

  const { displayHangout, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const isFilmKeeper = isCurrentFilmKeeper(participant, displayHangout);
  const { showPromotion, dismissPromotion } = useFilmKeeperPromotion({
    participant,
    hangout: displayHangout,
  });

  const prepare = useRevealPrepare({
    hangoutId: displayHangout?.id ?? "",
    sessionToken: participant?.sessionToken ?? "",
    enabled:
      Boolean(displayHangout?.id && participant?.sessionToken) &&
      displayHangout?.status === "developing",
  });

  const countdownActive = isRevealCountdownActive(countdownStartedAt);
  const revealStarting = Boolean(displayHangout?.revealPendingAt);

  const handleCountdownComplete = useCallback(async () => {
    if (
      !isFilmKeeper ||
      !participant ||
      !displayHangout ||
      finishingRevealRef.current
    ) {
      return;
    }

    if (displayHangout.status !== "developing") {
      router.replace(`/h/${slug}/reveal`);
      return;
    }

    finishingRevealRef.current = true;
    setStarting(true);
    setStartError(null);

    void playRevealAmbientAudio();

    const { data, error } = await startReveal(
      displayHangout.id,
      participant.sessionToken,
    );

    if (error || !data) {
      finishingRevealRef.current = false;
      setStarting(false);
      setCountdownStartedAt(null);
      setStartError(error ?? "Could not start reveal");
      return;
    }

    const cached = getRevealPreload(displayHangout.id);
    if (!isRevealPreloadUsable(cached)) {
      await preloadRevealState(displayHangout.id, participant.sessionToken);
    }

    setHangout(data);
    setStarting(false);
    router.replace(`/h/${slug}/reveal`);
  }, [displayHangout, isFilmKeeper, participant, router, setHangout, slug]);

  const { displaySeconds } = useRevealCountdown(countdownStartedAt, {
    enabled: isFilmKeeper && displayHangout?.status === "developing",
    onComplete: handleCountdownComplete,
  });

  async function handleBeginCountdown() {
    if (
      !participant ||
      !displayHangout ||
      countdownActive ||
      !prepare.isReady
    ) {
      return;
    }

    setStartError(null);
    setSignaling(true);

    const { data, error } = await signalRevealPending(
      displayHangout.id,
      participant.sessionToken,
    );

    setSignaling(false);

    if (error || !data) {
      setStartError(error ?? "Could not start reveal");
      return;
    }

    setHangout(data);
    router.prefetch(`/h/${slug}/reveal`);
    preloadRevealAmbientAudio();
    setCountdownStartedAt(Date.now());
  }

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "developing"
  ) {
    return (
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
          <div className="hidden animate-pulse md:flex md:flex-col md:gap-6">
            <div className="h-9 w-9 rounded-full bg-black/10" />
            <div className="h-10 w-52 rounded-lg bg-black/10" />
            <div className="h-3 w-28 rounded-full bg-black/10" />
          </div>
        </header>
        <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <MobileLoadingSpinner />
            <div className="hidden animate-pulse space-y-6 md:block">
              <div className="h-48 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-28 w-full rounded-3xl border border-container-border bg-white" />
            </div>
          </div>
        </main>
        <SetupFlowFooter className="hidden md:block" hint="Loading…">
          <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
        </SetupFlowFooter>
      </SetupFlowShell>
    );
  }

  const guestFooterHint = revealStarting
    ? "Reveal starting…"
    : "Waiting for the Film Keeper to start the reveal…";

  return (
    <SetupFlowShell>
      {displaySeconds !== null ? (
        <RevealCountdownOverlay seconds={displaySeconds} />
      ) : null}

      <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
        <SetupFlowHeader
          showProgress={false}
          title={displayHangout.title}
          sublabel="Developing memories"
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          <div className="flex flex-col gap-6">
            <FilmKeeperPromotionBanner
              visible={showPromotion}
              onDismiss={dismissPromotion}
            />
            <Card border="neutral" className="text-center">
              <HangoutCardIcon
                icon={LuFilm}
                borderTone="ink"
                iconClassName="text-ink"
              />
              <p className="font-display mt-4 text-2xl leading-snug">
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
            </Card>
          </div>
        </div>
      </main>

      <SetupFlowFooter hint={isFilmKeeper ? undefined : guestFooterHint}>
        {isFilmKeeper ? (
          <>
            {startError && (
              <p className="text-center text-sm text-pink">{startError}</p>
            )}
            <Button
              type="button"
              disabled={
                starting ||
                signaling ||
                countdownActive ||
                !prepare.isReady
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
        ) : null}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
