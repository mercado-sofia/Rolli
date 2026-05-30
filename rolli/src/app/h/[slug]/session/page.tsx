"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { TfiMenuAlt } from "react-icons/tfi";
import { TbPhoto } from "react-icons/tb";

import { AbandonHangoutControl } from "@/components/hangout/abandon-hangout-control";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
import { CameraCapture } from "@/components/hangout/camera-capture";
import { ElapsedTimer } from "@/components/hangout/elapsed-timer";
import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import { RolliGuideModal, SessionGuideModal } from "@/components/hangout/guide-modals";
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
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import {
  APP_PRIMARY_BUTTON_CLASS,
  HANGOUT_PINK_GRADIENT_BUTTON_CLASS,
} from "@/lib/app-page-layout";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { endHangout } from "@/lib/hangout/hangout-api";
import { isCurrentFilmKeeper } from "@/lib/hangout/participant";
import {
  consumeSessionGuidePending,
  hasSeenSessionGuide,
  markSessionGuideSeen,
} from "@/lib/hangout/setup";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

function AutoOpenSessionGuide({
  slug,
  hangoutId,
}: {
  slug: string;
  hangoutId: string;
}) {
  const [open, setOpen] = useState(() => {
    const fromStart = consumeSessionGuidePending(slug);
    const firstVisit = !hasSeenSessionGuide(hangoutId);
    return fromStart || firstVisit;
  });

  const close = useCallback(() => {
    markSessionGuideSeen(hangoutId);
    setOpen(false);
  }, [hangoutId]);

  return <SessionGuideModal open={open} onClose={close} />;
}

const SESSION_END_BUTTON_CLASS = cn(
  APP_PRIMARY_BUTTON_CLASS,
  "touch-manipulation",
  HANGOUT_PINK_GRADIENT_BUTTON_CLASS,
);

export default function SessionPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const setParticipant = useSessionStore((state) => state.setParticipant);

  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [rolliGuideOpen, setRolliGuideOpen] = useState(false);

  const { displayHangout, isLoading, loadError, retry } = useDisplayHangout(slug);

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

  function handleOpenEndConfirm() {
    setEndError(null);
    setEndConfirmOpen(true);
  }

  function handleCancelEndConfirm() {
    if (ending) return;
    setEndConfirmOpen(false);
    setEndError(null);
  }

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

    setEndConfirmOpen(false);
    setHangout(data);
    router.replace(`/h/${slug}/reveal`);
  }

  const sessionReady =
    hasValidSession &&
    participant &&
    displayHangout &&
    displayHangout.status === "active";

  const guideMenuButton = (
    <button
      type="button"
      onClick={() => setRolliGuideOpen(true)}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F8F8]",
        "text-ink outline-none transition-colors hover:bg-[#F0F0F0] active:scale-95",
      )}
      aria-label="Open Rolli guide"
    >
      <TfiMenuAlt size={20} strokeWidth={0.25} aria-hidden />
    </button>
  );

  return (
    <HangoutPageLoadGate
      loadingHint="Loading session…"
      loadError={loadError}
      isLoading={isLoading}
      displayHangout={displayHangout}
      forceLoading={!sessionReady}
      onRetry={retry}
      loadingSkeleton={
        <div className="animate-pulse space-y-6">
          <div className="h-28 w-full rounded-3xl border border-container-border bg-white" />
          <div className="h-40 w-full rounded-3xl border border-container-border bg-white" />
        </div>
      }
    >
      {sessionReady ? (
    <SetupFlowShell>
      <AutoOpenSessionGuide slug={slug} hangoutId={displayHangout.id} />
      <RolliGuideModal
        open={rolliGuideOpen}
        nickname={participant.nickname}
        onClose={() => setRolliGuideOpen(false)}
      />

      <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
        <SetupFlowHeader
          showProgress={false}
          title={displayHangout.title}
          sublabel="auto-ends in a day"
          trailingAction={guideMenuButton}
        />
      </header>

      <main className={SETUP_FLOW_MAIN_CLASS}>
        <div
          className={cn(
            SETUP_FLOW_MAIN_INNER_CLASS,
            "flex min-h-0 w-full flex-1 flex-col",
          )}
        >
          <FilmKeeperPromotionBanner
            visible={showPromotion}
            onDismiss={dismissPromotion}
            className="mb-4 w-full shrink-0 sm:mb-6"
          />

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col items-center justify-center gap-6",
              SETUP_FLOW_MAIN_CENTER_CLASS,
            )}
          >
            <div className="flex w-full max-w-md flex-col items-center gap-16 sm:gap-16">
              <ElapsedTimer startedAt={displayHangout.startedAt} />

              <div className="flex flex-col items-center gap-4 sm:gap-5">
                <p className="text-sm tabular-nums text-pink-muted">
                  {photosTaken}/{maxPhotos}
                </p>
                <CameraCapture
                  hangoutId={displayHangout.id}
                  sessionToken={participant.sessionToken}
                  participant={participant}
                  photosTaken={photosTaken}
                  maxPhotos={maxPhotos}
                  onCaptured={setParticipant}
                  appearance="session"
                  povLabel="your pov"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SetupFlowFooter>
        {isFilmKeeper && (
          <>
            <Button
              type="button"
              disabled={ending}
              className={SESSION_END_BUTTON_CLASS}
              onClick={handleOpenEndConfirm}
            >
              End hangout
            </Button>
          </>
        )}
        {isFilmKeeper ? (
          <div className="grid w-full grid-cols-2 gap-3">
            <LeaveRoomButton
              hangoutId={displayHangout.id}
              sessionToken={participant.sessionToken}
              isFilmKeeper
              className={cn(APP_PRIMARY_BUTTON_CLASS, "min-w-0")}
            />
            <AbandonHangoutControl
              hangoutId={displayHangout.id}
              sessionToken={participant.sessionToken}
              triggerVariant="pill"
              onAbandoned={setHangout}
              className={cn(APP_PRIMARY_BUTTON_CLASS, "min-w-0")}
            />
          </div>
        ) : (
          <LeaveRoomButton
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            className={APP_PRIMARY_BUTTON_CLASS}
          />
        )}
      </SetupFlowFooter>

      <ConfirmDialog
        open={endConfirmOpen}
        accent="pink-highlight"
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pink/15">
            <TbPhoto size={36} className="text-pink-highlight" aria-hidden />
          </span>
        }
        title="End the hangout?"
        description={
          <>
            Everyone will stop capturing photos and move to the darkroom while
            memories develop. This can&apos;t be undone.
          </>
        }
        confirmLabel="Yes, end hangout"
        cancelLabel="No"
        loading={ending}
        error={endError}
        dismissible={!ending}
        onConfirm={() => void handleDevelopMemories()}
        onCancel={handleCancelEndConfirm}
      />
    </SetupFlowShell>
      ) : null}
    </HangoutPageLoadGate>
  );
}
