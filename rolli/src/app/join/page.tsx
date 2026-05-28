"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";

const JOIN_FORM_ID = "join-hangout-form";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <SetupFlowShell
      hint="Your real name stays hidden until the hangout ends."
      header={
        <SetupFlowHeader
          currentStep={setupFlowSteps.join}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref="/start"
          backLabel="Back to start"
          title="Enter the room"
          sublabel={slug ? "Confirm your identity" : "Paste your invitation link"}
        />
      }
      footer={
        <Button
          type="submit"
          form={JOIN_FORM_ID}
          disabled={isSubmitting}
          className={APP_PRIMARY_BUTTON_CLASS}
        >
          {isSubmitting ? "Joining…" : "Join hangout"}
        </Button>
      }
    >
      <JoinHangoutForm
        slug={slug}
        showInviteLinkField
        formId={JOIN_FORM_ID}
        onSubmittingChange={setIsSubmitting}
      />
    </SetupFlowShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <MobileShell variant="app" className="justify-center">
          <p className="text-center text-muted">Loading…</p>
        </MobileShell>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
