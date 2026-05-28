"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

import { RevealExperience } from "@/components/hangout/reveal-experience";
import { AppPageContent } from "@/components/layout/app-page-content";
import { MobileShell } from "@/components/layout/mobile-shell";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

export default function RevealPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);

  const { displayHangout, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const handleFinishReveal = useCallback(
    (updatedHangout: Hangout) => {
      setHangout(updatedHangout);
      router.replace(`/h/${slug}/guessing`);
    },
    [router, setHangout, slug],
  );

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "revealing"
  ) {
    return (
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell variant="app" className="justify-center gap-6">
      <AppPageContent className="gap-6">
        <RevealExperience
          hangoutId={displayHangout.id}
          sessionToken={participant.sessionToken}
          hangoutTitle={displayHangout.title}
          isFilmKeeper={participant.isFilmKeeper}
          onFinishReveal={handleFinishReveal}
        />
      </AppPageContent>
    </MobileShell>
  );
}
