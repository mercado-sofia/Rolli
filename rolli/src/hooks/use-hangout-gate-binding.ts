"use client";

import { useRef } from "react";

import type { Hangout } from "@/types/hangout";
import type { Participant } from "@/types/participant";

export type HangoutGateBinding = {
  hangoutId: string;
  sessionToken: string;
  hangoutTitle: string;
};

/** Keeps gate credentials after eviction so kicked UI can stay mounted. */
export function useHangoutGateBinding(
  slug: string,
  hangout: Hangout | null | undefined,
  participant: Participant | null | undefined,
): HangoutGateBinding | null {
  const bindingRef = useRef<HangoutGateBinding | null>(null);

  if (
    hangout?.slug === slug &&
    hangout.id &&
    participant?.sessionToken &&
    participant.hangoutId === hangout.id
  ) {
    bindingRef.current = {
      hangoutId: hangout.id,
      sessionToken: participant.sessionToken,
      hangoutTitle: hangout.title,
    };
  }

  return bindingRef.current;
}
