"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { GalleryExperience } from "@/components/hangout/gallery-experience";
import { AppPageContent } from "@/components/layout/app-page-content";
import { MobileShell } from "@/components/layout/mobile-shell";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";
import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const hangoutStore = useSessionStore((state) => state.hangout);

  const { hangout: syncedHangout, isLoading } = useHangoutSync({ slug });
  const displayHangout = syncedHangout ?? hangoutStore;

  useHangoutRouteGuard({ slug, hangout: displayHangout, isLoading });
  const { participant, hasValidSession } = useHangoutSessionGuard({
    slug,
    hangout: displayHangout,
    isLoading,
  });

  if (
    isLoading ||
    !hasValidSession ||
    !participant ||
    !displayHangout ||
    displayHangout.status !== "completed"
  ) {
    return (
      <MobileShell variant="app" className="justify-center">
        <p className="text-center text-muted">Loading…</p>
      </MobileShell>
    );
  }

  return (
    <MobileShell variant="app" className="gap-6">
      <AppPageContent className="gap-6">
        <GalleryExperience
          hangoutId={displayHangout.id}
          sessionToken={participant.sessionToken}
          hangoutTitle={displayHangout.title}
        />
      </AppPageContent>

      <Link
        href={`/h/${slug}/guessing`}
        className="block text-center text-sm text-muted underline underline-offset-4"
      >
        Back to results
      </Link>
    </MobileShell>
  );
}
