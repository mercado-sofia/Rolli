"use client";

import { useParams } from "next/navigation";

import { GuessingExperience } from "@/components/hangout/guessing-experience";
import { AppPageContent } from "@/components/layout/app-page-content";
import { MobileShell } from "@/components/layout/mobile-shell";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { fetchHangoutBySlug } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";

export default function GuessingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const hangoutStore = useSessionStore((state) => state.hangout);
  const setHangout = useSessionStore((state) => state.setHangout);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({ slug });
  const displayHangout = syncedHangout ?? hangoutStore;

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
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell variant="app" className="justify-center gap-6">
      <AppPageContent className="gap-6">
        <GuessingExperience
          hangoutId={displayHangout.id}
          hangoutSlug={slug}
          sessionToken={participant.sessionToken}
          hangoutTitle={displayHangout.title}
          hangoutStatus={displayHangout.status}
          isFilmKeeper={participant.isFilmKeeper}
          onHangoutCompleted={() => void handleHangoutCompleted()}
        />
      </AppPageContent>
    </MobileShell>
  );
}
