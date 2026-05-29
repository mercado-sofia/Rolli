"use client";

import { useParams } from "next/navigation";

import { GuessingExperience } from "@/components/hangout/guessing-experience";
import { AppScrollShell } from "@/components/layout/app-scroll-shell";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { fetchHangoutBySlug } from "@/lib/hangout/hangouts";
import { useSessionStore } from "@/store/session-store";

export default function GuessingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const { displayHangout, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({
    slug,
    hangout: displayHangout,
    isLoading,
    allowGuessingWhenCompleted: true,
  });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const isGuessingPhase =
    displayHangout?.status === "guessing" ||
    displayHangout?.status === "completed";

  async function handleHangoutCompleted() {
    const { data } = await fetchHangoutBySlug(slug);
    if (data) {
      setHangout(data);
    }
  }

  if (isLoading || !hasValidSession || !participant || !displayHangout || !isGuessingPhase) {
    return (
      <AppScrollShell>
        <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
        </div>
        <div className="hidden w-full animate-pulse space-y-6 md:block">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-4 w-28 rounded-full bg-black/10" />
            <div className="mx-auto h-9 w-56 rounded-lg bg-black/10 md:h-10 md:w-72" />
          </div>
          <div className="h-24 w-full rounded-3xl border border-container-border bg-white" />
          <div className="space-y-4">
            <div className="h-36 w-full rounded-3xl border border-container-border bg-white" />
            <div className="h-36 w-full rounded-3xl border border-container-border bg-white" />
          </div>
          <div className="h-12 w-full rounded-full bg-black/10" />
        </div>
      </AppScrollShell>
    );
  }

  return (
    <AppScrollShell>
      <GuessingExperience
        hangoutId={displayHangout.id}
        hangoutSlug={slug}
        sessionToken={participant.sessionToken}
        hangoutTitle={displayHangout.title}
        hangoutStatus={displayHangout.status}
        isFilmKeeper={participant.isFilmKeeper}
        onHangoutCompleted={() => void handleHangoutCompleted()}
      />
    </AppScrollShell>
  );
}
