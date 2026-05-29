"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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
import {
  HANGOUT_GUESSING_PATH_SUFFIX,
  hangoutGalleryPath,
} from "@/lib/hangout/routes";
import { finishGuessing } from "@/lib/hangout/guessing";
import { fetchHangoutBySlug } from "@/lib/hangout/hangouts";
import type { Hangout } from "@/types/hangout";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

export default function GuessingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const setHangout = useSessionStore((state) => state.setHangout);
  const { displayHangout, isLoading } = useDisplayHangout(slug);
  const [footer, setFooter] = useState<SetupFlowFooterState>({});

  useHangoutRouteGuard({
    slug,
    hangout: displayHangout,
    isLoading,
    guardPathSuffix: HANGOUT_GUESSING_PATH_SUFFIX,
  });

  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const openMemoryGallery = useCallback(async () => {
    if (displayHangout?.status === "guessing" && participant) {
      const { data, error } = await finishGuessing(
        displayHangout.id,
        participant.sessionToken,
      );

      if (data) {
        setHangout(data);
      } else if (error?.includes("not in the guessing phase")) {
        const { data: refreshed } = await fetchHangoutBySlug(slug);
        if (refreshed) {
          setHangout(refreshed);
        }
      }
    }

    router.push(hangoutGalleryPath(slug));
  }, [displayHangout, participant, router, setHangout, slug]);

  const isGuessingPhase =
    displayHangout?.status === "guessing" ||
    displayHangout?.status === "completed";

  const isCompleted = displayHangout?.status === "completed";
  const { showPromotion, dismissPromotion } = useFilmKeeperPromotion({
    participant,
    hangout: displayHangout,
  });

  const handleHangoutCompleted = useCallback(
    async (freshHangout?: Hangout) => {
      if (freshHangout) {
        setHangout(freshHangout);
        return;
      }

      const { data } = await fetchHangoutBySlug(slug);
      if (data) {
        setHangout(data);
      }
    },
    [setHangout, slug],
  );

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
            onHangoutCompleted={handleHangoutCompleted}
            onFooterChange={setFooter}
          />
        </div>
      </main>

      <SetupFlowFooter hint={footer.hint}>
        {footer.showGalleryButton ? (
          <>
            <Button
              type="button"
              className={APP_PRIMARY_BUTTON_CLASS}
              onClick={openMemoryGallery}
            >
              View memory gallery
            </Button>
            <BackHomeButton className={APP_PRIMARY_BUTTON_CLASS} />
          </>
        ) : isCompleted ? (
          <BackHomeButton className={APP_PRIMARY_BUTTON_CLASS} />
        ) : (
          footer.children
        )}
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
