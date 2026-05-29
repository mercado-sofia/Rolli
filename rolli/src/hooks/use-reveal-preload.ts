"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  preloadRevealAmbientAudio,
  preloadRevealState,
} from "@/lib/hangout/reveal-preload";
import {
  getRevealPreload,
  isRevealPreloadUsable,
} from "@/lib/hangout/reveal-preload-cache";

type UseRevealPreloadOptions = {
  slug: string;
  hangoutId: string | undefined;
  sessionToken: string | undefined;
  enabled: boolean;
};

const PRELOAD_POLL_MS = 350;

export function useRevealPreload({
  slug,
  hangoutId,
  sessionToken,
  enabled,
}: UseRevealPreloadOptions) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !hangoutId || !sessionToken) return;

    const preloadHangoutId = hangoutId;
    const preloadSessionToken = sessionToken;

    router.prefetch(`/h/${slug}/reveal`);
    preloadRevealAmbientAudio();

    if (isRevealPreloadUsable(getRevealPreload(preloadHangoutId))) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    async function attemptPreload() {
      if (cancelled || isRevealPreloadUsable(getRevealPreload(preloadHangoutId))) {
        return;
      }

      const ready = await preloadRevealState(preloadHangoutId, preloadSessionToken);
      if (cancelled || ready) return;

      timeoutId = window.setTimeout(() => {
        void attemptPreload();
      }, PRELOAD_POLL_MS);
    }

    void attemptPreload();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled, hangoutId, router, sessionToken, slug]);
}
