"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LuFilm } from "react-icons/lu";

import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import { HangoutCardIcon } from "@/components/hangout/hangout-card-icon";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { MobileLoadingSpinner } from "@/components/ui/mobile-loading-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { startReveal } from "@/lib/hangout/reveal";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

export default function DevelopingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const { displayHangout, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const isFilmKeeper = isCurrentFilmKeeper(participant, displayHangout);
  const { showPromotion, dismissPromotion } = useFilmKeeperPromotion({
    participant,
    hangout: displayHangout,
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
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
          <div className="hidden animate-pulse md:flex md:flex-col md:gap-6">
            <div className="h-9 w-9 rounded-full bg-black/10" />
            <div className="h-10 w-52 rounded-lg bg-black/10" />
            <div className="h-3 w-28 rounded-full bg-black/10" />
          </div>
        </header>
        <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <MobileLoadingSpinner />
            <div className="hidden animate-pulse space-y-6 md:block">
              <div className="h-48 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-28 w-full rounded-3xl border border-container-border bg-white" />
            </div>
          </div>
        </main>
        <SetupFlowFooter className="hidden md:block" hint="Loading…">
          <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
        </SetupFlowFooter>
      </SetupFlowShell>
    );
  }

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
        <SetupFlowHeader
          showProgress={false}
          title={displayHangout.title}
          sublabel="Developing memories"
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          <div className="flex flex-col gap-6">
            <FilmKeeperPromotionBanner
              visible={showPromotion}
              onDismiss={dismissPromotion}
            />
            <Card border="neutral" className="text-center">
              <HangoutCardIcon
                icon={LuFilm}
                borderTone="ink"
                iconClassName="text-ink"
              />
              <p className="font-display mt-4 text-2xl leading-snug">
                Memories in the darkroom
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Every anonymous perspective is being prepared for the big reveal.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <SetupFlowFooter
        hint={
          isFilmKeeper
            ? undefined
            : "Waiting for the Film Keeper to start the reveal…"
        }
      >
        {isFilmKeeper ? (
          <>
            {startError && (
              <p className="text-center text-sm text-pink">{startError}</p>
            )}
            <Button
              type="button"
              disabled={starting}
              className={APP_PRIMARY_BUTTON_CLASS}
              onClick={() => void handleStartReveal()}
            >
              {starting ? "Starting reveal…" : "Start reveal"}
            </Button>
          </>
        ) : null}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
