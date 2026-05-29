"use client";

import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";

/** Merges live sync with the persisted session hangout for hangout flow pages. */
export function useDisplayHangout(slug: string) {
  const hangoutStore = useSessionStore((state) => state.hangout);
  const { hangout: syncedHangout, loadError, isLoading } = useHangoutSync({ slug });

  return {
    displayHangout: syncedHangout ?? hangoutStore,
    loadError,
    isLoading,
  };
}
