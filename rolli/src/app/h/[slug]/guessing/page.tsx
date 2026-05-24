"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";

export default function GuessingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);

  const goToReveal = useCallback(() => {
    router.replace(`/h/${slug}/reveal`);
  }, [router, slug]);

  const goToDeveloping = useCallback(() => {
    router.replace(`/h/${slug}/developing`);
  }, [router, slug]);

  const goToSession = useCallback(() => {
    router.replace(`/h/${slug}/session`);
  }, [router, slug]);

  const goToWaiting = useCallback(() => {
    router.replace(`/h/${slug}/waiting`);
  }, [router, slug]);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({
    slug,
    onRevealing: goToReveal,
    onDeveloping: goToDeveloping,
    onActive: goToSession,
    onWaiting: goToWaiting,
  });

  const displayHangout = syncedHangout ?? hangout;

  const hasValidSession =
    Boolean(participant) &&
    Boolean(displayHangout) &&
    displayHangout!.slug === slug &&
    participant!.hangoutId === displayHangout!.id;

  useEffect(() => {
    if (isLoading) return;

    if (!participant || !displayHangout || displayHangout.slug !== slug) {
      router.replace(`/h/${slug}`);
      return;
    }

    if (participant.hangoutId !== displayHangout.id) {
      router.replace(`/h/${slug}`);
    }
  }, [isLoading, participant, displayHangout, router, slug]);

  const isGuessingPhase =
    displayHangout?.status === "guessing" ||
    displayHangout?.status === "completed";

  if (isLoading || !hasValidSession || !participant || !displayHangout || !isGuessingPhase) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="justify-center gap-8">
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Guessing phase</p>
        <h1 className="font-display mt-2 text-3xl text-ink">
          {displayHangout.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          Match each anonymous nickname to a real name. Full guessing UI
          arrives in the next update.
        </p>
      </div>

      <Card gradient className="text-center">
        <p className="text-4xl">🕵️</p>
        <p className="font-display mt-4 text-2xl leading-snug">
          Who was who?
        </p>
        <p className="mt-3 text-sm text-white/80">
          The reveal is done — now comes the social deduction round.
        </p>
      </Card>

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Your nickname</dt>
            <dd className="font-medium text-ink">{participant.nickname}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Status</dt>
            <dd className="font-medium capitalize text-ink">
              {displayHangout.status}
            </dd>
          </div>
        </dl>
      </Card>
    </MobileShell>
  );
}
