"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LuFilm } from "react-icons/lu";

import { HangoutCardIcon } from "@/components/hangout/hangout-card-icon";
import { AppPageContent } from "@/components/layout/app-page-content";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { startReveal } from "@/lib/reveal";
import { useSessionStore } from "@/store/session-store";

export default function DevelopingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangoutStore = useSessionStore((state) => state.hangout);
  const setHangout = useSessionStore((state) => state.setHangout);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({ slug });
  const displayHangout = syncedHangout ?? hangoutStore;

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  async function handleStartReveal() {
    if (!participant || !displayHangout) return;

    setStarting(true);
    setStartError(null);

    const { data, error } = await startReveal(
      displayHangout.id,
      participant.sessionToken,
    );

    setStarting(false);

    if (error || !data) {
      setStartError(error ?? "Could not start reveal");
      return;
    }

    setHangout(data);
    router.replace(`/h/${slug}/reveal`);
  }

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "developing"
  ) {
    return (
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell variant="app" className="justify-center gap-8">
      <AppPageContent className="gap-8">
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Hangout ended</p>
        <h1 className="font-display mt-2 text-3xl text-ink">
          {displayHangout.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          Your memories are developing. The reveal is coming soon.
        </p>
      </div>

      <Card className="text-center">
        <HangoutCardIcon icon={LuFilm} />
        <p className="font-display mt-4 text-2xl leading-snug">
          Memories in the darkroom
        </p>
        <p className="mt-3 text-sm text-muted">
          Every anonymous perspective is being prepared for the big reveal.
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
            <dd className="font-medium capitalize text-ink">developing</dd>
          </div>
        </dl>
      </Card>
      </AppPageContent>

      {participant.isFilmKeeper ? (
        <>
          {startError && (
            <p className="text-center text-sm text-pink">{startError}</p>
          )}
          <Button
            type="button"
            disabled={starting}
            onClick={() => void handleStartReveal()}
          >
            {starting ? "Starting reveal…" : "Start reveal"}
          </Button>
        </>
      ) : (
        <p className="text-center text-sm text-muted">
          Waiting for the Film Keeper to start the reveal…
        </p>
      )}
    </MobileShell>
  );
}
