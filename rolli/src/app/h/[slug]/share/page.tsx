"use client";

import { useParams, useRouter } from "next/navigation";

import { InviteLinkCard } from "@/components/hangout/invite-link-card";
import { AppLoadingState } from "@/components/layout/app-loading-state";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { Button } from "@/components/ui/button";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { buildInviteUrl } from "@/lib/hangout/invite";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";

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
    return <AppLoadingState />;
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
