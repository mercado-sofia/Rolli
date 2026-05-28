"use client";

import { useParams, useRouter } from "next/navigation";

import { InviteLinkCard } from "@/components/hangout/invite-link-card";
import { MobileShell } from "@/components/layout/mobile-shell";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { Button } from "@/components/ui/button";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { buildInviteUrl } from "@/lib/invite";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/setup-flow";
import { useSessionStore } from "@/store/session-store";

export default function HangoutSharePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const hangoutStore = useSessionStore((state) => state.hangout);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({ slug });
  const displayHangout = syncedHangout ?? hangoutStore;

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
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  const waitingPath = `/h/${slug}/waiting`;

  return (
    <SetupFlowShell
      hint="Copy the link and send it to friends before you start."
      header={
        <SetupFlowHeader
          currentStep={setupFlowSteps.createLinkReady}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref={waitingPath}
          backLabel="Back to waiting room"
          title="Ready to roll!"
          sublabel="Share with your friends"
        />
      }
      footer={
        <Button
          type="button"
          onClick={() => router.push(waitingPath)}
          className={APP_PRIMARY_BUTTON_CLASS}
        >
          Back to waiting room
        </Button>
      }
    >
      <InviteLinkCard
        inviteUrl={buildInviteUrl(slug)}
        hangoutTitle={displayHangout.title}
      />
    </SetupFlowShell>
  );
}
