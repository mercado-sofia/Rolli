"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { BackHomeButton } from "@/components/hangout/back-home-button";
import { GalleryExperience } from "@/components/hangout/gallery-experience";
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
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useSessionHydrated } from "@/hooks/use-session-hydrated";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const sessionHydrated = useSessionHydrated();
  const { displayHangout, isLoading, loadError } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  const isCompleted = displayHangout?.status === "completed";
  const showLoadingShell =
    !sessionHydrated ||
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    !isCompleted;

  if (showLoadingShell) {
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
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                <div className="aspect-3/4 rounded-2xl bg-black/10" />
                <div className="aspect-3/4 rounded-2xl bg-black/10" />
              </div>
            </div>
          </div>
        </main>
        <SetupFlowFooter
          className="hidden md:block"
          hint={
            loadError
              ? loadError
              : !isCompleted && displayHangout
                ? "Taking you back to results…"
                : "Loading gallery…"
          }
        >
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
          sublabel="Memory gallery"
        />
      </header>

      <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_UPPER_CLASS)}>
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          <GalleryExperience
            hangoutId={displayHangout.id}
            sessionToken={participant.sessionToken}
            hangoutTitle={displayHangout.title}
          />
        </div>
      </main>

      <SetupFlowFooter hint="Save your favorite memories or head back home.">
        <BackHomeButton className={APP_PRIMARY_BUTTON_CLASS} />
        <Link
          href={`/h/${slug}/guessing`}
          className="inline-flex min-h-11 items-center justify-center text-center text-sm text-muted underline underline-offset-4"
        >
          Back to results
        </Link>
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
