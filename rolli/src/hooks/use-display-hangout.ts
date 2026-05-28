"use client";

import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";

type UseDisplayHangoutOptions = {
  enabled?: boolean;
};

/** Merges live sync with the persisted session hangout for hangout flow pages. */
export function useDisplayHangout(slug: string, options?: UseDisplayHangoutOptions) {
  const hangoutStore = useSessionStore((state) => state.hangout);
  const { hangout: syncedHangout, loadError, isLoading } = useHangoutSync({
    slug,
    enabled: options?.enabled,
  });

  return {
    displayHangout: syncedHangout ?? hangoutStore,
    loadError,
    isLoading,
  };
}
