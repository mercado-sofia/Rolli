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
import { Button } from "@/components/ui/button";
import { APP_PRIMARY_BUTTON_CLASS, APP_SETUP_FORM_MAX_WIDTH } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";

const JOIN_FORM_ID = "join-hangout-form";

function JoinPageSkeleton() {
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
        <div className={cn(SETUP_FLOW_MAIN_INNER_CLASS, APP_SETUP_FORM_MAX_WIDTH)}>
          <div className="md:hidden flex min-h-[45dvh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
          </div>
          <div className="hidden h-56 w-full animate-pulse rounded-3xl border border-container-border bg-white md:block" />
        </div>
      </main>
      <SetupFlowFooter hint="Loading join form…">
        <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}

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
    <Suspense fallback={<JoinPageSkeleton />}>
      <JoinPageContent />
    </Suspense>
  );
}
