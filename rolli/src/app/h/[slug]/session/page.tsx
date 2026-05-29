"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CameraCapture } from "@/components/hangout/camera-capture";
import { ElapsedTimer } from "@/components/hangout/elapsed-timer";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
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
              <div className="h-16 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-28 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-64 w-full rounded-3xl border border-container-border bg-white" />
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

          <div className="flex flex-col items-center gap-5">
            <p className="font-display text-3xl tabular-nums tracking-tight text-pink-highlight">
              {photosTaken}/{maxPhotos}
            </p>
            <CameraCapture
              hangoutId={displayHangout.id}
              sessionToken={participant.sessionToken}
              photosTaken={photosTaken}
              maxPhotos={maxPhotos}
              onCaptured={setParticipant}
            />
          </div>
        </div>
      </main>

      <SetupFlowFooter hint={footerHint}>
        {isFilmKeeper && (
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
          isFilmKeeper={isFilmKeeper}
          className={APP_PRIMARY_BUTTON_CLASS}
        />
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
