"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { startHangout } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";

export default function WaitingRoomPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const participant = useSessionStore((state) => state.participant);
  const setHangout = useSessionStore((state) => state.setHangout);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const goToSession = useCallback(() => {
    router.replace(`/h/${slug}/session`);
  }, [router, slug]);

  const { hangout, loadError, isLoading } = useHangoutSync({
    slug,
    onActive: goToSession,
  });

  const participantCount = hangout?.participantCount ?? 0;
  const isFilmKeeper = participant?.isFilmKeeper ?? false;

  const hasValidSession =
    Boolean(participant) &&
    Boolean(hangout) &&
    participant!.hangoutId === hangout!.id;

  useEffect(() => {
    if (isLoading) return;

    if (!participant) {
      router.replace(`/h/${slug}`);
      return;
    }

    if (hangout && participant.hangoutId !== hangout.id) {
      router.replace(`/h/${slug}`);
    }
  }, [isLoading, participant, hangout, router, slug]);

  async function handleStartHangout() {
    if (!participant || !hangout) return;

    setStarting(true);
    setStartError(null);

    const { data, error } = await startHangout(
      hangout.id,
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

  if (isLoading || !hasValidSession || !hangout || !participant) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="justify-center gap-8">
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Waiting room</p>
        <h1 className="font-display mt-2 text-3xl text-ink">
          {hangout.title}
        </h1>
      </div>

      {loadError && (
        <p className="text-center text-sm text-pink">{loadError}</p>
      )}

      <Card gradient className="text-center">
        <p className="text-4xl">🌙</p>
        <p className="font-display mt-4 text-2xl leading-snug">
          {participantCount}{" "}
          {participantCount === 1 ? "memory is" : "memories are"} waiting to
          happen.
        </p>
      </Card>

      {!isFilmKeeper && (
        <p className="text-center text-sm text-muted">
          Waiting for the Film Keeper to start the hangout…
        </p>
      )}

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Your nickname</dt>
            <dd className="font-medium text-ink">{participant.nickname}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Participants</dt>
            <dd className="font-medium text-ink">{participantCount} / 10</dd>
          </div>
          {isFilmKeeper && (
            <div className="rounded-2xl bg-lavender/40 px-4 py-3 text-center text-sm text-ink">
              You are the Film Keeper
            </div>
          )}
        </dl>
      </Card>

      {isFilmKeeper && (
        <>
          {startError && (
            <p className="text-center text-sm text-pink">{startError}</p>
          )}
          <Button
            type="button"
            disabled={participantCount < 2 || starting}
            onClick={handleStartHangout}
          >
            {starting ? "Starting…" : "Start hangout"}
          </Button>
        </>
      )}
    </MobileShell>
  );
}
