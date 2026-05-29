"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { BackHomeButton } from "@/components/hangout/back-home-button";
import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import {
  GuessingExperience,
  type SetupFlowFooterState,
} from "@/components/hangout/guessing-experience";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_COMPACT_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
  SETUP_FLOW_MAIN_UPPER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { MobileLoadingSpinner } from "@/components/ui/mobile-loading-spinner";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useFilmKeeperPromotion } from "@/hooks/use-film-keeper-promotion";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { Button } from "@/components/ui/button";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { hangoutGalleryPath } from "@/lib/hangout/routes";
import { fetchHangoutBySlug } from "@/lib/hangout/hangouts";
import type { Hangout } from "@/types/hangout";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

export default function GuessingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const { displayHangout, isLoading } = useDisplayHangout(slug);
  const [footer, setFooter] = useState<SetupFlowFooterState>({});

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const isGuessingPhase =
    displayHangout?.status === "guessing" ||
    displayHangout?.status === "completed";

  const isCompleted = displayHangout?.status === "completed";
  const isFilmKeeper = isCurrentFilmKeeper(participant, displayHangout);
  const { showPromotion, dismissPromotion } = useFilmKeeperPromotion({
    participant,
    hangout: displayHangout,
  });

  async function handleHangoutCompleted(freshHangout?: Hangout) {
    if (freshHangout) {
      setHangout(freshHangout);
      return;
    }

    const { data } = await fetchHangoutBySlug(slug);
    if (data) {
      setHangout(data);
    }
  }

  if (isLoading || !hasValidSession || !participant || !displayHangout || !isGuessingPhase) {
    return (
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_COMPACT_CLASS}>
          <div className="hidden animate-pulse md:flex md:flex-col md:gap-6">
            <div className="h-9 w-9 rounded-full bg-black/10" />
            <div className="h-10 w-52 rounded-lg bg-black/10" />
            <div className="h-3 w-28 rounded-full bg-black/10" />
          </div>
        </header>
        <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_UPPER_CLASS)}>
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <MobileLoadingSpinner />
            <div className="hidden animate-pulse space-y-6 md:block">
              <div className="h-24 w-full rounded-3xl border border-container-border bg-white" />
              <div className="h-36 w-full rounded-3xl border border-container-border bg-white" />
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
          sublabel={isCompleted ? "Results" : "Guessing phase"}
          titleTone="ink"
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_UPPER_CLASS)}>
        <div className={cn(SETUP_FLOW_MAIN_INNER_CLASS, "flex flex-col gap-4")}>
          <FilmKeeperPromotionBanner
            visible={showPromotion}
            onDismiss={dismissPromotion}
          />
          <GuessingExperience
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            hangoutStatus={displayHangout.status}
            isFilmKeeper={isFilmKeeper}
            onHangoutCompleted={(hangout) => void handleHangoutCompleted(hangout)}
            onFooterChange={setFooter}
          />
        </div>
      </main>

      <SetupFlowFooter hint={footer.hint}>
        {isCompleted ? (
          <>
            <Button href={hangoutGalleryPath(slug)} className={APP_PRIMARY_BUTTON_CLASS}>
              View memory gallery
            </Button>
            <BackHomeButton className={APP_PRIMARY_BUTTON_CLASS} />
          </>
        ) : (
          footer.children
        )}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
