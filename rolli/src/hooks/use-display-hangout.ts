"use client";

import { useHangoutSync } from "@/hooks/use-hangout-sync";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

function mergeDisplayHangout(
  slug: string,
  syncedHangout: Hangout | null,
  hangoutStore: Hangout | null,
): Hangout | null {
  if (!syncedHangout) {
    return hangoutStore?.slug === slug ? hangoutStore : null;
  }

  if (!hangoutStore || hangoutStore.slug !== slug) {
    return syncedHangout;
  }

  // Session store updates immediately after abandon; sync can lag behind.
  if (hangoutStore.status === "cancelled" && syncedHangout.status === "waiting") {
    return hangoutStore;
  }

  return syncedHangout;
}

/** Merges live sync with the persisted session hangout for hangout flow pages. */
export function useDisplayHangout(slug: string) {
  const hangoutStore = useSessionStore((state) => state.hangout);
  const { hangout: syncedHangout, loadError, isLoading } = useHangoutSync({ slug });

  return {
    displayHangout: mergeDisplayHangout(slug, syncedHangout, hangoutStore),
    loadError,
    isLoading,
  };
}
