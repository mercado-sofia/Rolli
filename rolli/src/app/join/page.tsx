"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

import {
  JoinHangoutForm,
  type JoinHangoutFormHandle,
} from "@/components/hangout/join-hangout-form";
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
import { MobileLoadingSpinner } from "@/components/ui/mobile-loading-spinner";
import { APP_PRIMARY_BUTTON_CLASS, APP_SETUP_FORM_MAX_WIDTH } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup";

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
          <MobileLoadingSpinner />
          <div className="hidden h-56 w-full animate-pulse rounded-3xl border border-container-border bg-white md:block" />
        </div>
      </main>
      <SetupFlowFooter className="hidden md:block" hint="Loading join form…">
        <div className="hidden h-12 w-full animate-pulse rounded-full bg-black/10 md:block" />
      </SetupFlowFooter>
    </SetupFlowShell>
  );
}

function JoinPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;
  const formRef = useRef<JoinHangoutFormHandle>(null);
  const [step, setStep] = useState<1 | 2>(slug ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep =
    step === 1 ? setupFlowSteps.joinLink : setupFlowSteps.joinIdentity;

  async function handleProceedToIdentityStep() {
    const isLinkValid = await formRef.current?.validateLinkStep();
    if (!isLinkValid) return;
    setStep(2);
  }

  return (
    <SetupFlowShell>
      <header className={SETUP_FLOW_HEADER_CLASS}>
        <SetupFlowHeader
          currentStep={currentStep}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref={step === 1 ? "/start" : undefined}
          onBack={step === 2 && !slug ? () => setStep(1) : undefined}
          backLabel={step === 1 ? "Back to start" : "Back to link"}
          title={step === 1 ? "Enter the room" : "Your identity"}
          sublabel={
            step === 1 ? "Paste your invitation link" : "Set your anonymous identity"
          }
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
            ref={formRef}
            slug={slug}
            showInviteLinkField
            step={step}
            formId={JOIN_FORM_ID}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      </main>

      <SetupFlowFooter
        hint={
          step === 1
            ? "Paste the full link your friend sent you."
            : "Your real name stays hidden until the hangout ends."
        }
      >
        {step === 1 ? (
          <Button
            type="button"
            onClick={() => void handleProceedToIdentityStep()}
            disabled={isSubmitting}
            className={APP_PRIMARY_BUTTON_CLASS}
          >
            Proceed
          </Button>
        ) : (
          <Button
            type="submit"
            form={JOIN_FORM_ID}
            disabled={isSubmitting}
            className={APP_PRIMARY_BUTTON_CLASS}
          >
            {isSubmitting ? "Joining…" : "Join hangout"}
          </Button>
        )}
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
