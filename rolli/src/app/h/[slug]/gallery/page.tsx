"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { GalleryExperience } from "@/components/hangout/gallery-experience";
import { MobileShell } from "@/components/layout/mobile-shell";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangout = useSessionStore((state) => state.hangout);
  const participant = useSessionStore((state) => state.participant);

  const goToGuessing = useCallback(() => {
    router.replace(`/h/${slug}/guessing`);
  }, [router, slug]);

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
    onGuessing: goToGuessing,
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

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "completed"
  ) {
    return (
      <MobileShell className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell className="gap-6 py-8">
      <GalleryExperience
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        hangoutTitle={displayHangout.title}
      />

      <Link
        href={`/h/${slug}/guessing`}
        className="block text-center text-sm text-muted underline underline-offset-4"
      >
        Back to results
      </Link>
    </MobileShell>
  );
}
