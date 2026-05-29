"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

import { RevealExperience } from "@/components/hangout/reveal-experience";
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
    return (
      <AppScrollShell>
        <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
        </div>
        <div className="hidden w-full animate-pulse space-y-6 md:block">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-4 w-24 rounded-full bg-black/10" />
            <div className="mx-auto h-9 w-56 rounded-lg bg-black/10 md:h-10 md:w-72" />
          </div>
          <div className="h-24 w-full rounded-3xl border border-container-border bg-white" />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="aspect-3/4 rounded-2xl bg-black/10" />
            <div className="aspect-3/4 rounded-2xl bg-black/10" />
          </div>
          <div className="h-12 w-full rounded-full bg-black/10" />
        </div>
      </AppScrollShell>
    );
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
