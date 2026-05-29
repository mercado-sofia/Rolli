"use client";

import { useParams, useRouter } from "next/navigation";

import { InviteLinkCard } from "@/components/hangout/invite-link-card";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { Button } from "@/components/ui/button";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { buildInviteUrl } from "@/lib/hangout/invite";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";
import { cn } from "@/lib/utils";

export default function HangoutSharePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { displayHangout, isLoading } = useDisplayHangout(slug);

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  if (
    isLoading ||
    !hasValidSession ||
    !displayHangout ||
    displayHangout.status !== "waiting"
  ) {
    return (
      <SetupFlowShell>
        <header className={SETUP_FLOW_HEADER_CLASS}>
          <div className="hidden animate-pulse md:flex md:flex-col md:gap-6">
            <div className="h-9 w-9 rounded-full bg-black/10" />
            <div className="h-3 w-24 rounded-full bg-black/10" />
            <div className="h-10 w-48 rounded-lg bg-black/10" />
          </div>
        </header>
        <main className={cn(SETUP_FLOW_MAIN_CLASS, SETUP_FLOW_MAIN_CENTER_CLASS)}>
          <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
            <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
            </div>
            <div className="hidden h-48 w-full animate-pulse rounded-3xl border border-container-border bg-white md:block" />
          </div>
        </main>
        <SetupFlowFooter hint="Preparing your invite link…">
          <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
        </SetupFlowFooter>
      </SetupFlowShell>
    );
  }

  const waitingPath = `/h/${slug}/waiting`;

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_CLASS}>
        <SetupFlowHeader
          currentStep={setupFlowSteps.createLinkReady}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref={waitingPath}
          backLabel="Back to waiting room"
          title="Ready to roll!"
          sublabel="Share with your friends"
        />
      </header>

      <main
        className={cn(
          SETUP_FLOW_MAIN_CLASS,
          SETUP_FLOW_MAIN_CENTER_CLASS,
        )}
      >
        <div className={SETUP_FLOW_MAIN_INNER_CLASS}>
          <InviteLinkCard
            inviteUrl={buildInviteUrl(slug)}
            hangoutTitle={displayHangout.title}
          />
        </div>
      </main>

      <SetupFlowFooter hint="Copy the link and send it to friends before you start.">
        <Button
          type="button"
          onClick={() => router.push(waitingPath)}
          className={APP_PRIMARY_BUTTON_CLASS}
        >
          Back to waiting room
        </Button>
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}
