"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { JoinHangoutForm } from "@/components/hangout/join-hangout-form";
import { MobileShell } from "@/components/layout/mobile-shell";

function JoinPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? undefined;

  return (
    <MobileShell className="justify-center gap-8">
      <div>
        <p className="text-sm font-medium text-muted">Join</p>
        <h1 className="font-display mt-2 text-3xl text-ink">Enter the room</h1>
        <p className="mt-3 text-sm text-muted">
          {slug
            ? "Confirm your identity to join this hangout."
            : "Paste your invitation link and set your anonymous identity."}
        </p>
      </div>

      <JoinHangoutForm slug={slug} showInviteLinkField />
    </MobileShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <MobileShell className="justify-center">
          <p className="text-center text-muted">Loading…</p>
        </MobileShell>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
