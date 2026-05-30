"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { DevelopingPrepareOverlay } from "@/components/hangout/developing-prepare-overlay";
import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import {
  RevealExperience,
  type SetupFlowFooterState,
} from "@/components/hangout/reveal-experience";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { HangoutPageLoadGate } from "@/components/hangout/hangout-page-load-gate";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useRevealPrepare } from "@/hooks/use-reveal-prepare";
import { DEVELOPING_FLOW_CHROME_CLASS } from "@/lib/app-page-layout";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

export default function RevealPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const [revealFooter, setRevealFooter] = useState<SetupFlowFooterState>({});
  const [developingFooter, setDevelopingFooter] = useState<SetupFlowFooterState>(
    {},
  );

  const { displayHangout, isLoading, loadError, retry } = useDisplayHangout(slug);

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

  const isDeveloping = displayHangout?.status === "developing";
  const isRevealing = displayHangout?.status === "revealing";
  const onRevealPhase = isDeveloping || isRevealing;
  const revealPending = Boolean(displayHangout?.revealPendingAt);

  const prepare = useRevealPrepare({
    hangoutId: displayHangout?.id ?? "",
    sessionToken: participant?.sessionToken ?? "",
    enabled:
      Boolean(displayHangout?.id && participant?.sessionToken) &&
      ((isDeveloping && revealPending) || isRevealing),
  });

  const handleHangoutUpdate = useCallback(
    (updated: Hangout) => {
      setHangout(updated);
    },
    [setHangout],
  );

  const handleFinishReveal = useCallback(
    (updatedHangout: Hangout) => {
      setHangout(updatedHangout);
      router.replace(`/h/${slug}/guessing`);
    },
    [router, setHangout, slug],
  );

  const revealReady =
    hasValidSession &&
    participant &&
    displayHangout &&
    onRevealPhase;

  const activeFooter = isDeveloping ? developingFooter : revealFooter;

  return (
    <HangoutPageLoadGate
      loadingHint="Loading reveal…"
      loadError={loadError}
      isLoading={isLoading}
      displayHangout={displayHangout}
      forceLoading={!revealReady}
      onRetry={retry}
      loadingSkeleton={
        <div className="animate-pulse space-y-6">
          <div className="h-24 w-full rounded-3xl border border-container-border bg-white" />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="aspect-3/4 rounded-2xl bg-black/10" />
            <div className="aspect-3/4 rounded-2xl bg-black/10" />
          </div>
        </div>
      }
    >
      {revealReady ? (
    <SetupFlowShell compact>
      <header
        className={cn(
          SETUP_FLOW_HEADER_COMPACT_CLASS,
          isDeveloping && DEVELOPING_FLOW_CHROME_CLASS,
        )}
      >
        <SetupFlowHeader
          compact
          showProgress={false}
          title={displayHangout.title}
          titleTone="ink"
          sublabel={isDeveloping ? "Developing memories" : undefined}
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
        <div
          className={cn(
            SETUP_FLOW_MAIN_INNER_CLASS,
            "relative flex min-h-0 flex-1 flex-col justify-center gap-4",
          )}
        >
          <FilmKeeperPromotionBanner
            visible={showPromotion}
            onDismiss={dismissPromotion}
          />

          <RevealExperience
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            isFilmKeeper={isFilmKeeper}
            onFinishReveal={handleFinishReveal}
            onFooterChange={setRevealFooter}
            footerEnabled={isRevealing}
            prepareReady={prepare.isReady}
          />

          {isDeveloping ? (
            <DevelopingPrepareOverlay
              hangout={displayHangout}
              hangoutId={displayHangout.id}
              sessionToken={participant.sessionToken}
              isFilmKeeper={isFilmKeeper}
              prepare={prepare}
              onHangoutUpdate={handleHangoutUpdate}
              onFooterChange={setDevelopingFooter}
            />
          ) : null}
        </div>
      </main>

      <SetupFlowFooter
        className={cn(isDeveloping && DEVELOPING_FLOW_CHROME_CLASS)}
        hint={activeFooter.hint}
      >
        {activeFooter.children}
      </SetupFlowFooter>
    </SetupFlowShell>
      ) : null}
    </HangoutPageLoadGate>
  );
}
