"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

type UseHangoutSessionGuardOptions = {
  slug: string;
  hangout: Hangout | null;
  isLoading: boolean;
};

export function useHangoutSessionGuard({
  slug,
  hangout,
  isLoading,
}: UseHangoutSessionGuardOptions) {
  const router = useRouter();
  const participant = useSessionStore((state) => state.participant);

  useEffect(() => {
    if (isLoading) return;

    if (!participant || !hangout || hangout.slug !== slug) {
      router.replace(`/h/${slug}`);
      return;
    }

    if (participant.hangoutId !== hangout.id) {
      router.replace(`/h/${slug}`);
    }
  }, [hangout, isLoading, participant, router, slug]);

  const hasValidSession =
    participant !== null &&
    hangout !== null &&
    hangout.slug === slug &&
    participant.hangoutId === hangout.id;

  return {
    participant: hasValidSession ? participant : null,
    hasValidSession,
  };
}
