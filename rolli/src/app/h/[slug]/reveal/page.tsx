"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { RevealExperience } from "@/components/hangout/reveal-experience";
import { MobileShell } from "@/components/layout/mobile-shell";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

export default function RevealPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);
  const setHangout = useSessionStore((state) => state.setHangout);

  const goToDeveloping = useCallback(() => {
    router.replace(`/h/${slug}/developing`);
  }, [router, slug]);

  const goToGuessing = useCallback(() => {
    router.replace(`/h/${slug}/guessing`);
  }, [router, slug]);

  const goToGallery = useCallback(() => {
    router.replace(`/h/${slug}/gallery`);
  }, [router, slug]);

  const goToSession = useCallback(() => {
    router.replace(`/h/${slug}/session`);
  }, [router, slug]);

  const goToWaiting = useCallback(() => {
    router.replace(`/h/${slug}/waiting`);
  }, [router, slug]);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({
    slug,
    onDeveloping: goToDeveloping,
    onGuessing: goToGuessing,
    onCompleted: goToGallery,
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

  const handleFinishReveal = useCallback(
    (updatedHangout: Hangout) => {
      setHangout(updatedHangout);
      goToGuessing();
    },
    [goToGuessing, setHangout],
  );

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "revealing"
  ) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="justify-center gap-6 py-8">
      <RevealExperience
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        hangoutTitle={displayHangout.title}
        isFilmKeeper={participant.isFilmKeeper}
        onFinishReveal={handleFinishReveal}
      />
    </MobileShell>
  );
}
