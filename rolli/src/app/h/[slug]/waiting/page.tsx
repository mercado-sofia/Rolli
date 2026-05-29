"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LuMoon } from "react-icons/lu";

import { AbandonHangoutControl } from "@/components/hangout/abandon-hangout-control";
import { LeaveRoomButton } from "@/components/hangout/back-home-button";
import { HangoutCardIcon } from "@/components/hangout/hangout-card-icon";
import { MobileShell } from "@/components/layout/mobile-shell";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { HANGOUT_LIMITS } from "@/lib/constants";
import { hangoutSharePath } from "@/lib/hangout/routes";
import { startHangout } from "@/lib/hangout/hangouts";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

export default function WaitingRoomPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const { displayHangout, loadError, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
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
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "waiting"
  ) {
    return (
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  const hint = isFilmKeeper
    ? canStart
      ? "Everyone's here — start when you're ready."
      : undefined
    : "Waiting for the Film Keeper to start the hangout…";

  return (
    <SetupFlowShell
      contentAlign="raised"
      hint={hint}
      header={
        <SetupFlowHeader
          showProgress={false}
          title={displayHangout.title}
          sublabel="Waiting room"
          backHref={hangoutSharePath(slug)}
          backLabel="Back to invite link"
        />
      }
      footer={
        isFilmKeeper ? (
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
            <AbandonHangoutControl
              hangoutId={displayHangout.id}
              sessionToken={participant.sessionToken}
            />
          </>
        ) : (
          <LeaveRoomButton
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            className={APP_PRIMARY_BUTTON_CLASS}
          />
        )
      }
    >
      <div className="flex flex-col gap-6">
        {loadError && (
          <p className="text-center text-sm text-pink">{loadError}</p>
        )}

        <Card className="text-center">
          <HangoutCardIcon icon={LuMoon} />
          <p className="font-display mt-4 text-2xl leading-snug">
            {participantCount}{" "}
            {participantCount === 1
              ? "friend is in the room"
              : "friends are in the room"}
          </p>
        </Card>

        <Card>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted">Your nickname</dt>
              <dd className="max-w-[60%] text-right font-medium wrap-break-word text-ink">
                {participant.nickname}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Participants</dt>
              <dd className="font-medium text-ink">
                {participantCount} / {HANGOUT_LIMITS.maxParticipants}
              </dd>
            </div>
            {isFilmKeeper && (
              <div className="rounded-2xl border border-black/8 bg-[#F8F8F8] px-4 py-3 text-center text-sm text-ink">
                You are the Film Keeper
              </div>
            )}
          </dl>
        </Card>
      </div>
    </SetupFlowShell>
  );
}
