"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

import { RevealExperience } from "@/components/hangout/reveal-experience";
import { AppLoadingState } from "@/components/layout/app-loading-state";
import { AppScrollShell } from "@/components/layout/app-scroll-shell";
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
    return <AppLoadingState />;
  }

  return (
    <AppScrollShell>
      <RevealExperience
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        hangoutTitle={displayHangout.title}
        isFilmKeeper={participant.isFilmKeeper}
        onFinishReveal={handleFinishReveal}
      />
    </AppScrollShell>
  );
}
