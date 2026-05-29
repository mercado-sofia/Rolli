"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { AbandonHangoutControl } from "@/components/hangout/abandon-hangout-control";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
import { CameraCapture } from "@/components/hangout/camera-capture";
import { ElapsedTimer } from "@/components/hangout/elapsed-timer";
import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
  SETUP_FLOW_MAIN_UPPER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { MobileLoadingSpinner } from "@/components/ui/mobile-loading-spinner";
import { Button } from "@/components/ui/button";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { endHangout } from "@/lib/hangout/hangouts";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

const SESSION_END_BUTTON_CLASS = cn(
  APP_PRIMARY_BUTTON_CLASS,
  "touch-manipulation border border-lavender-deep/35 bg-gradient-pastel text-white hover:bg-gradient-pastel active:scale-[0.98]",
);

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

  const photosTaken = participant?.photosTaken ?? 0;
  const maxPhotos = HANGOUT_LIMITS.maxPhotosPerUser;
  const isFilmKeeper = isCurrentFilmKeeper(participant, displayHangout);
  const { showPromotion, dismissPromotion } = useFilmKeeperPromotion({
    participant,
    hangout: displayHangout,
  });

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
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
          <div className="hidden animate-pulse md:flex md:flex-col md:gap-6">
            <div className="h-9 w-9 rounded-full bg-black/10" />
            <div className="h-10 w-52 rounded-lg bg-black/10" />
            <div className="h-3 w-28 rounded-full bg-black/10" />
          </div>
        </header>
        <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_UPPER_CLASS)}>
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <MobileLoadingSpinner />
            <div className="hidden animate-pulse space-y-6 md:block">
              <div className="h-28 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-40 w-full rounded-3xl border border-container-border bg-white" />
            </div>
          </div>
        </main>
        <SetupFlowFooter className="hidden md:block" hint="Loading session…">
          <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
        </SetupFlowFooter>
      </SetupFlowShell>
    );
  }

  const footerHint = isFilmKeeper
    ? "End the hangout when everyone is done capturing memories."
    : "Capture your perspective — the Film Keeper will end the hangout when ready.";

  const povLabel = `${participant.nickname.toLowerCase()}'s pov`;

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
        <SetupFlowHeader
          showProgress={false}
          title={displayHangout.title}
          sublabel="Active hangout"
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_UPPER_CLASS)}>
        <div className={cn(SETUP_FLOW_MAIN_INNER_CLASS, "flex flex-col gap-6")}>
          <FilmKeeperPromotionBanner
            visible={showPromotion}
            onDismiss={dismissPromotion}
          />

          <ElapsedTimer
            startedAt={displayHangout.startedAt}
            autoEndHours={HANGOUT_LIMITS.autoEndHours}
          />

          <div className="flex flex-col items-center gap-4 sm:gap-5">
            <p className="text-sm tabular-nums text-pink-muted">
              {photosTaken}/{maxPhotos}
            </p>
            <CameraCapture
              hangoutId={displayHangout.id}
              sessionToken={participant.sessionToken}
              photosTaken={photosTaken}
              maxPhotos={maxPhotos}
              onCaptured={setParticipant}
              appearance="session"
              povLabel={povLabel}
            />
          </div>
        </div>
      </main>

      <SetupFlowFooter hint={footerHint}>
        {isFilmKeeper && (
          <>
            {endError && (
              <p className="text-center text-sm text-pink-accent">{endError}</p>
            )}
            <Button
              type="button"
              disabled={ending}
              className={SESSION_END_BUTTON_CLASS}
              onClick={() => void handleDevelopMemories()}
            >
              {ending ? "Ending…" : "End hangout"}
            </Button>
          </>
        )}
        <LeaveRoomButton
          hangoutId={displayHangout.id}
          sessionToken={participant.sessionToken}
          isFilmKeeper={isFilmKeeper}
          className={APP_PRIMARY_BUTTON_CLASS}
        />
        {isFilmKeeper ? (
          <AbandonHangoutControl
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            onAbandoned={setHangout}
            className="min-h-11 touch-manipulation rounded-none px-0 text-pink-accent underline-offset-4 hover:text-pink-deep active:bg-transparent"
          />
        ) : null}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
