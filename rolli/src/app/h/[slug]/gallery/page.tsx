"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { GalleryExperience } from "@/components/hangout/gallery-experience";
import { AppLoadingState } from "@/components/layout/app-loading-state";
import { AppScrollShell } from "@/components/layout/app-scroll-shell";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { useHangoutRouteGuard } from "@/hooks/use-hangout-route-guard";
import { useHangoutSessionGuard } from "@/hooks/use-hangout-session-guard";

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { displayHangout, isLoading } = useDisplayHangout(slug);

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
    return <AppLoadingState />;
  }

  return (
    <AppScrollShell>
      <GalleryExperience
        hangoutId={displayHangout.id}
        sessionToken={participant.sessionToken}
        hangoutTitle={displayHangout.title}
      />

      <Link
        href={`/h/${slug}/guessing`}
        className="inline-flex min-h-11 items-center justify-center text-center text-sm text-muted underline underline-offset-4"
      >
        Back to results
      </Link>
    </AppScrollShell>
  );
}
