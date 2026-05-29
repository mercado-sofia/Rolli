"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LuMoon } from "react-icons/lu";

import {
  type AbandonHangoutUiState,
  AbandonHangoutControl,
} from "@/components/hangout/abandon-hangout-control";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
import { HangoutCardIcon } from "@/components/hangout/hangout-card-icon";
import {
  HANGOUT_CANCELLED_FOOTER_HINT,
  HangoutInvitationClosedContent,
} from "@/components/hangout/hangout-invitation-closed";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";
import { hangoutSharePath } from "@/lib/hangout/routes";
import { startHangout } from "@/lib/hangout/hangouts";
import { getWaitingHint } from "@/lib/hangout/waiting-hint";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

export default function WaitingRoomPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const resetSession = useSessionStore((state) => state.resetSession);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [abandonUiState, setAbandonUiState] = useState<AbandonHangoutUiState>("idle");

  const { displayHangout, loadError, isLoading } = useDisplayHangout(slug);
  const isCancelled = displayHangout?.status === "cancelled";
  const pauseGuards = abandonUiState !== "idle";
  const guardIsLoading = isLoading || pauseGuards;
  const showAbandonSuccessModal = abandonUiState === "success";

  const leaveForHome = useCallback(() => {
    setAbandonUiState("leaving");
    resetSession();
    router.replace("/");
  }, [resetSession, router]);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading: guardIsLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading: guardIsLoading,
  });

  const participantCount = displayHangout?.participantCount ?? 0;
  const isFilmKeeper = participant?.isFilmKeeper ?? false;
  const canStart =
    participantCount >= HANGOUT_LIMITS.minToStart &&
    participantCount <= HANGOUT_LIMITS.maxToStart;

  async function handleStartHangout() {
    if (!participant || !displayHangout) return;

    setStarting(true);
    setStartError(null);

    const { data, error } = await startHangout(
      displayHangout.id,
      participant.sessionToken,
    );

    setStarting(false);

    if (error || !data) {
      setStartError(error ?? "Could not start hangout");
      return;
    }

    setHangout(data);
    router.replace(`/h/${slug}/session`);
  }

  if (
    isLoading ||
    !displayHangout ||
    (!isCancelled &&
      (!hasValidSession || !participant || displayHangout.status !== "waiting"))
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
            <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
            </div>
            <div className="hidden animate-pulse space-y-6 md:block">
              <div className="h-40 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-36 w-full rounded-3xl border border-container-border bg-white" />
            </div>
          </div>
        </main>
        <SetupFlowFooter hint="Loading waiting room…">
          <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
        </SetupFlowFooter>
      </SetupFlowShell>
    );
  }

  const waitingHint = getWaitingHint(isFilmKeeper, canStart);
  const footerHint = isCancelled ? HANGOUT_CANCELLED_FOOTER_HINT : waitingHint;

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
        {isCancelled ? (
          <SetupFlowHeader
            currentStep={setupFlowSteps.inviteJoin}
            totalSteps={SETUP_FLOW_TOTAL_STEPS}
            onBack={leaveForHome}
            title={displayHangout.title}
            sublabel="Invitation closed"
          />
        ) : (
          <SetupFlowHeader
            showProgress={false}
            title={displayHangout.title}
            sublabel="Waiting room"
            backHref={hangoutSharePath(slug)}
            backLabel="Back to invite link"
          />
        )}
      </header>

      <main
        className={cn(
          SETUP_FLOW_MAIN_CLASS,
          SETUP_FLOW_MAIN_CENTER_CLASS,
        )}
      >
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          {isCancelled ? (
            <HangoutInvitationClosedContent
              showGoHomeLink={!showAbandonSuccessModal}
              onGoHomeClick={leaveForHome}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {loadError && (
                <p className="text-center text-sm text-pink">{loadError}</p>
              )}

              <Card border="neutral" className="text-center">
                <HangoutCardIcon
                  icon={LuMoon}
                  containerClassName="md:h-14 md:w-14"
                  iconClassName="md:h-7 md:w-7"
                />
                <p className="font-display mt-4 text-2xl leading-snug">
                  {participantCount}{" "}
                  {participantCount === 1
                    ? "friend is in the room"
                    : "friends are in the room"}
                </p>
              </Card>

              <Card border="neutral">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-muted">Your nickname</dt>
                    <dd className="max-w-[60%] text-right font-medium wrap-break-word text-ink">
                      {participant!.nickname}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Participants</dt>
                    <dd className="font-medium text-ink">
                      {participantCount} / {HANGOUT_LIMITS.maxParticipants}
                    </dd>
                  </div>
                  {isFilmKeeper && (
                    <div className="rounded-2xl border border-container-border bg-white px-4 py-3 text-center text-sm text-ink">
                      You are the Film Keeper
                    </div>
                  )}
                </dl>
              </Card>
            </div>
          )}
        </div>
      </main>

      <SetupFlowFooter hint={footerHint}>
        {!isCancelled && isFilmKeeper ? (
          <>
            {startError && (
              <p className="text-center text-sm text-pink">{startError}</p>
            )}
            {!canStart && participantCount > 0 && (
              <p className="text-center text-xs text-muted">
                Need {HANGOUT_LIMITS.minToStart}–{HANGOUT_LIMITS.maxToStart}{" "}
                participants to start
              </p>
            )}
            <Button
              type="button"
              disabled={!canStart || starting}
              onClick={() => void handleStartHangout()}
              className={cn(
                APP_PRIMARY_BUTTON_CLASS,
                "border border-lavender-deep/35 bg-gradient-pastel text-white hover:bg-gradient-pastel active:scale-[0.98]",
              )}
            >
              {starting ? "Starting…" : "Start hangout"}
            </Button>
          </>
        ) : null}
        {!isCancelled && !isFilmKeeper ? (
          <LeaveRoomButton
            hangoutId={displayHangout.id}
            sessionToken={participant!.sessionToken}
            className={APP_PRIMARY_BUTTON_CLASS}
          />
        ) : null}
        {isFilmKeeper && participant ? (
          <AbandonHangoutControl
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            hideTrigger={isCancelled}
            onAbandoned={setHangout}
            onUiStateChange={setAbandonUiState}
          />
        ) : null}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
