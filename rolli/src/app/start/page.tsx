import Link from "next/link";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function StartPage() {
  return (
    <MobileShell className="justify-center gap-8">
      <div>
        <p className="text-sm font-medium text-muted">Start</p>
        <h1 className="font-display mt-2 text-3xl leading-tight text-ink sm:text-4xl">
          Ready for tonight&apos;s hangout?
        </h1>
        <p className="mt-3 max-w-sm text-muted">
          Create a new room or paste an invitation link to join friends.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/create">
          <Card gradient className="transition-transform hover:scale-[1.01]">
            <p className="text-sm font-medium text-white/80">Option A</p>
            <h2 className="font-display mt-2 text-2xl">Create Invitation Link</h2>
            <p className="mt-2 text-sm text-white/80">
              You become the Film Keeper and control when memories develop.
            </p>
          </Card>
        </Link>

        <Link href="/join">
          <Card className="transition-transform hover:scale-[1.01]">
            <p className="text-sm font-medium text-muted">Option B</p>
            <h2 className="font-display mt-2 text-2xl text-ink">
              Paste Invitation Link
            </h2>
            <p className="mt-2 text-sm text-muted">
              Join anonymously with a nickname and hidden real name.
            </p>
          </Card>
        </Link>
      </div>

      <Button href="/" variant="secondary">
        Back to home
      </Button>
    </MobileShell>
  );
}
