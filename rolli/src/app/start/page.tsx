import Link from "next/link";

import { SetupFlowHeader } from "@/components/layout/setup-flow-header";
import { SetupFlowShell } from "@/components/layout/setup-flow-shell";
import { Card } from "@/components/ui/card";
import { SETUP_FLOW_TOTAL_STEPS, setupFlowSteps } from "@/lib/hangout/setup-flow";

export default function StartPage() {
  return (
    <SetupFlowShell
      hint="Pick create or paste link — you'll be in the room in a moment."
      header={
        <SetupFlowHeader
          currentStep={setupFlowSteps.start}
          totalSteps={SETUP_FLOW_TOTAL_STEPS}
          backHref="/"
          backLabel="Back to home"
          title="Get started"
          sublabel="Choose how to join"
        />
      }
    >
      <div className="flex flex-col gap-4">
        <Link href="/create">
          <Card className="sm:border-pink-highlight/25 transition-transform hover:scale-[1.01] active:scale-[0.99]">
            <p className="text-sm font-medium text-muted">Option A</p>
            <h2 className="font-display mt-2 text-2xl text-ink">Create Invitation Link</h2>
            <p className="mt-2 text-sm text-muted">
              You become the Film Keeper and control when memories develop.
            </p>
          </Card>
        </Link>

        <Link href="/join">
          <Card className="transition-transform hover:scale-[1.01] active:scale-[0.99]">
            <p className="text-sm font-medium text-muted">Option B</p>
            <h2 className="font-display mt-2 text-2xl text-ink">Paste Invitation Link</h2>
            <p className="mt-2 text-sm text-muted">
              Join anonymously with a nickname and hidden real name.
            </p>
          </Card>
        </Link>
      </div>
    </SetupFlowShell>
  );
}
