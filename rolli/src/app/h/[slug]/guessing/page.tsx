"use client";

import { useParams } from "next/navigation";

import { GuessingExperience } from "@/components/hangout/guessing-experience";
import { AppLoadingState } from "@/components/layout/app-loading-state";
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
    return <AppLoadingState />;
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
