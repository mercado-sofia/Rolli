"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import {
  SetupFlowFooter,
  SetupFlowShell,
  SETUP_FLOW_HEADER_CLASS,
  SETUP_FLOW_MAIN_CENTER_CLASS,
  SETUP_FLOW_MAIN_CLASS,
  SETUP_FLOW_MAIN_INNER_CLASS,
} from "@/components/layout/setup-flow-shell";
import { AppLoadingState } from "@/components/layout/app-loading-state";
import { Button } from "@/components/ui/button";
import { APP_PRIMARY_BUTTON_CLASS, APP_SETUP_FORM_MAX_WIDTH } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";

const JOIN_FORM_ID = "join-hangout-form";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_CLASS}>
        <SetupFlowHeader
          currentStep={setupFlowSteps.join}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref="/start"
          backLabel="Back to start"
          title="Enter the room"
          sublabel={slug ? "Confirm your identity" : "Paste your invitation link"}
        />
      </header>

      <main
        className={cn(
          SETUP_FLOW_MAIN_CLASS,
          SETUP_FLOW_MAIN_CENTER_CLASS,
        )}
      >
        <div className={cn(SETUP_FLOW_MAIN_INNER_CLASS, APP_SETUP_FORM_MAX_WIDTH)}>
          <JoinHangoutForm
            slug={slug}
            showInviteLinkField
            formId={JOIN_FORM_ID}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      </main>

      <SetupFlowFooter hint="Your real name stays hidden until the hangout ends.">
        <Button
          type="submit"
          form={JOIN_FORM_ID}
          disabled={isSubmitting}
          className={APP_PRIMARY_BUTTON_CLASS}
        >
          {isSubmitting ? "Joining…" : "Join hangout"}
        </Button>
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<AppLoadingState />}>
      <JoinPageContent />
    </Suspense>
  );
}
