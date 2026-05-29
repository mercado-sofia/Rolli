"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LuFilm } from "react-icons/lu";

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
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
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

  const footerHint = participant.isFilmKeeper
    ? "Start the reveal when memories are ready to share."
    : "Waiting for the Film Keeper to start the reveal…";

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
            <Card border="neutral" className="text-center">
              <HangoutCardIcon icon={LuFilm} />
              <p className="font-display mt-4 text-2xl leading-snug">
                Memories in the darkroom
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Every anonymous perspective is being prepared for the big reveal.
              </p>
            </Card>

            <Card border="neutral">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-muted">Your nickname</dt>
                  <dd className="text-right font-medium text-ink">
                    {participant.nickname}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Status</dt>
                  <dd className="font-medium capitalize text-ink">developing</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </main>

      <SetupFlowFooter hint={footerHint}>
        {participant.isFilmKeeper ? (
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
