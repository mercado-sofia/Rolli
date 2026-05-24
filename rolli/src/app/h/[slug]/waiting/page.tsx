"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchHangoutBySlug, startHangout } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

const POLL_MS = 5000;

export default function WaitingRoomPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const sessionHangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);
  const setHangout = useSessionStore((state) => state.setHangout);

  const [hangout, setLocalHangout] = useState<Hangout | null>(
    sessionHangout?.slug === params.slug ? sessionHangout : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHangout() {
      const { data, error } = await fetchHangoutBySlug(params.slug);
      if (cancelled) return;

      if (error) {
        setLoadError(error);
        return;
      }

      if (data) {
        setLocalHangout(data);
        setHangout(data);
        setLoadError(null);
      }
    }

    const intervalId = window.setInterval(() => {
      void loadHangout();
    }, POLL_MS);

    void loadHangout();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [params.slug, setHangout]);

  const displayHangout = hangout;
  const participantCount = displayHangout?.participantCount ?? 0;
  const isFilmKeeper = participant?.isFilmKeeper ?? false;

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
    router.push(`/h/${params.slug}/session`);
  }

  return (
    <MobileShell className="justify-center gap-8">
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Waiting room</p>
        <h1 className="font-display mt-2 text-3xl text-ink">
          {displayHangout?.title ?? "Your hangout"}
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

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Your nickname</dt>
            <dd className="font-medium text-ink">
              {participant?.nickname ?? "—"}
            </dd>
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
