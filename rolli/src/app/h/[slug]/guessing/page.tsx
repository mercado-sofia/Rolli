"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { GuessingExperience } from "@/components/hangout/guessing-experience";
import { MobileShell } from "@/components/layout/mobile-shell";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { fetchHangoutBySlug } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";

export default function GuessingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);
  const setHangout = useSessionStore((state) => state.setHangout);

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

  const handleHangoutCompleted = useCallback(async () => {
    const { data } = await fetchHangoutBySlug(slug);
    if (data) {
      setHangout(data);
    }
  }, [setHangout, slug]);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({
    slug,
    onRevealing: goToReveal,
    onDeveloping: goToDeveloping,
    onActive: goToSession,
    onWaiting: goToWaiting,
    onCompleted: () => void handleHangoutCompleted(),
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
    <MobileShell className="justify-center gap-6 py-8">
      <GuessingExperience
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        hangoutTitle={displayHangout.title}
        hangoutStatus={displayHangout.status}
        isFilmKeeper={participant.isFilmKeeper}
        onHangoutCompleted={() => void handleHangoutCompleted()}
      />
    </MobileShell>
  );
}
