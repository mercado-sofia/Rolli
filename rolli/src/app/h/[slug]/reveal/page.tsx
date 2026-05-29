"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { FilmKeeperPromotionBanner } from "@/components/hangout/film-keeper-promotion-banner";
import {
  RevealExperience,
  type SetupFlowFooterState,
} from "@/components/hangout/reveal-experience";
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
import { isCurrentFilmKeeper } from "@/lib/hangout/film-keeper";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

export default function RevealPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const setHangout = useSessionStore((state) => state.setHangout);
  const [footer, setFooter] = useState<SetupFlowFooterState>({});

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
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="aspect-3/4 rounded-2xl bg-black/10" />
                <div className="aspect-3/4 rounded-2xl bg-black/10" />
              </div>
            </div>
          </div>
        </main>
        <SetupFlowFooter className="hidden md:block" hint="Loading reveal…">
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
          sublabel="Reveal"
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_UPPER_CLASS)}>
        <div className={cn(SETUP_FLOW_MAIN_INNER_CLASS, "flex flex-col gap-4")}>
          <FilmKeeperPromotionBanner
            visible={showPromotion}
            onDismiss={dismissPromotion}
          />
          <RevealExperience
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            isFilmKeeper={isFilmKeeper}
            onFinishReveal={handleFinishReveal}
            onFooterChange={setFooter}
          />
        </div>
      </main>

      <SetupFlowFooter hint={footer.hint}>{footer.children}</SetupFlowFooter>
    </SetupFlowShell>
  );
}
