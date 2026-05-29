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
import { useRevealPreload } from "@/hooks/use-reveal-preload";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { isRevealCountdownActive } from "@/lib/hangout/reveal-countdown";
import { preloadRevealState } from "@/lib/hangout/reveal-preload";
import { beginRevealCountdown, startReveal } from "@/lib/hangout/reveal";
import { playRevealAmbientAudio } from "@/lib/hangout/reveal-ambient-audio-controller";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

export default function DevelopingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
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

  const countdownActive =
    displayHangout?.status === "developing" &&
    isRevealCountdownActive(displayHangout.revealCountdownAt);

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

    const { data, error } = await startReveal(
      displayHangout.id,
      participant.sessionToken,
    );

    setStarting(false);

    if (error || !data) {
      finishingRevealRef.current = false;
      setStartError(error ?? "Could not start reveal");
      return;
    }

    await preloadRevealState(displayHangout.id, participant.sessionToken);
    setHangout(data);
    router.replace(`/h/${slug}/reveal`);
  }, [displayHangout, isFilmKeeper, participant, router, setHangout, slug]);

  useRevealPreload({
    slug,
    hangoutId: displayHangout?.id,
    sessionToken: participant?.sessionToken,
    enabled: countdownActive,
  });

  const { displaySeconds } = useRevealCountdown(
    displayHangout?.revealCountdownAt,
    {
      enabled: displayHangout?.status === "developing",
      onComplete: isFilmKeeper ? handleCountdownComplete : undefined,
    },
  );

  async function handleBeginCountdown() {
    if (!participant || !displayHangout || countdownActive) return;

    void playRevealAmbientAudio();

    setStarting(true);
    setStartError(null);

    const { data, error } = await beginRevealCountdown(
      displayHangout.id,
      participant.sessionToken,
    );

    setStarting(false);

    if (error || !data) {
      setStartError(error ?? "Could not start countdown");
      return;
    }

    setHangout(data);
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
                Memories in the darkroom
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Every anonymous perspective is being prepared for the big reveal.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <SetupFlowFooter
        hint={
          isFilmKeeper
            ? undefined
            : countdownActive
              ? "Get ready — reveal starting soon…"
              : "Waiting for the Film Keeper to start the reveal…"
        }
      >
        {isFilmKeeper ? (
          <>
            {startError && (
              <p className="text-center text-sm text-pink">{startError}</p>
            )}
            <Button
              type="button"
              disabled={starting || countdownActive}
              className={APP_PRIMARY_BUTTON_CLASS}
              onClick={() => void handleBeginCountdown()}
            >
              {countdownActive
                ? "Revealing…"
                : starting
                  ? "Starting…"
                  : "Start reveal"}
            </Button>
          </>
        ) : null}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
