"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { AbandonHangoutControl } from "@/components/hangout/abandon-hangout-control";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
import { CameraCapture } from "@/components/hangout/camera-capture";
import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import { SessionHangoutHeader } from "@/components/hangout/session-hangout-header";
import { MobileShell } from "@/components/layout/mobile-shell";
import { MobileLoadingSpinner } from "@/components/ui/mobile-loading-spinner";
import { Button } from "@/components/ui/button";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import {
  APP_ACTION_MAX_WIDTH,
  APP_PRIMARY_BUTTON_CLASS,
  APP_SAFE_BOTTOM,
} from "@/lib/app-page-layout";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { endHangout } from "@/lib/hangout/hangouts";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

const SESSION_SHELL_CLASS = cn(
  "max-w-md px-0 py-0",
  "md:max-w-lg md:py-6",
  "flex min-h-dvh max-h-dvh flex-col overflow-hidden",
  "supports-[height:100dvh]:min-h-dvh supports-[height:100dvh]:max-h-dvh",
  "md:min-h-[min(calc(100dvh-3rem),52rem)] md:max-h-[min(calc(100dvh-3rem),52rem)]",
);

const SESSION_PANEL_CLASS = cn(
  "flex min-h-0 flex-1 flex-col overflow-hidden bg-white",
  "md:min-h-0 md:rounded-[inherit]",
);

const SESSION_LEAVE_BUTTON_CLASS = cn(
  APP_PRIMARY_BUTTON_CLASS,
  "touch-manipulation border border-ink bg-white text-ink hover:bg-white/95",
);

const SESSION_END_BUTTON_CLASS = cn(
  APP_PRIMARY_BUTTON_CLASS,
  "touch-manipulation border-0 bg-pink-highlight text-white hover:brightness-[1.03]",
);

const SESSION_ACTIONS_CLASS = cn(
  APP_ACTION_MAX_WIDTH,
  "flex w-full flex-col items-stretch gap-3",
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
      <MobileShell
        variant="app"
        desktopFrame
        ambient={false}
        className={SESSION_SHELL_CLASS}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center bg-white px-6">
          <MobileLoadingSpinner />
        </div>
      </MobileShell>
    );
  }

  const footerHint = isFilmKeeper
    ? "End the hangout when everyone is done capturing memories."
    : "Capture your perspective — the Film Keeper will end the hangout when ready.";

  const povLabel = `${participant.nickname.toLowerCase()}'s pov`;

  return (
    <MobileShell
      variant="app"
      desktopFrame
      ambient={false}
      className={SESSION_SHELL_CLASS}
    >
      <div className={SESSION_PANEL_CLASS}>
        <SessionHangoutHeader
          title={displayHangout.title}
          startedAt={displayHangout.startedAt}
          autoEndHours={HANGOUT_LIMITS.autoEndHours}
        />

        <div className="relative z-10 -mt-5 flex min-h-0 flex-1 flex-col overflow-hidden sm:-mt-6">
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain",
              "px-4 pt-2 sm:px-6 sm:pt-4",
            )}
          >
            <div className="mx-auto flex w-full max-w-md flex-col items-center">
              <FilmKeeperPromotionBanner
                visible={showPromotion}
                onDismiss={dismissPromotion}
                className="mb-5 w-full sm:mb-6"
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

              <p className="mt-6 max-w-sm px-2 text-center text-sm leading-relaxed text-ink sm:mt-8 sm:text-base">
                {footerHint}
              </p>
            </div>
          </div>

          <footer
            className={cn(
              "shrink-0 border-t border-container-border/50 bg-white",
              "px-4 pt-4 sm:px-6 sm:pt-5",
              APP_SAFE_BOTTOM,
            )}
          >
            <div className={cn(SESSION_ACTIONS_CLASS, "mx-auto")}>
              {isFilmKeeper && (
                <>
                  {endError && (
                    <p className="text-center text-sm text-pink-accent">{endError}</p>
                  )}
                  <Button
                    variant="secondary"
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
                className={SESSION_LEAVE_BUTTON_CLASS}
              />
              {isFilmKeeper ? (
                <AbandonHangoutControl
                  hangoutId={displayHangout.id}
                  sessionToken={participant.sessionToken}
                  onAbandoned={setHangout}
                  className="min-h-11 touch-manipulation rounded-none px-0 text-pink-accent underline-offset-4 hover:text-pink-deep active:bg-transparent"
                />
              ) : null}
            </div>
          </footer>
        </div>
      </div>
    </MobileShell>
  );
}
