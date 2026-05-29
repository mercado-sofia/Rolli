"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { RevealPhotoCarousel } from "@/components/hangout/reveal-photo-carousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useResignPhotosOnVisibility } from "@/hooks/use-resign-photos-on-visibility";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import {
  clearRevealPreload,
  getRevealPreload,
  isRevealPreloadUsable,
} from "@/lib/hangout/reveal-preload-cache";
import {
  finishReveal,
  getRevealState,
  signRevealPhotoUrls,
} from "@/lib/hangout/reveal";
import type { Hangout } from "@/types/hangout";
import type { RevealPerspective } from "@/types/reveal";

export type SetupFlowFooterState = {
  hint?: string;
  children?: ReactNode;
};

type RevealExperienceProps = {
  hangoutId: string;
  sessionToken: string;
  isFilmKeeper: boolean;
  onFinishReveal: (hangout: Hangout) => void;
  onFooterChange?: (footer: SetupFlowFooterState) => void;
  /** When false, reveal UI still loads but footer actions stay hidden (developing overlay). */
  footerEnabled?: boolean;
  /** Re-run cache hydration when developing preload completes. */
  prepareReady?: boolean;
};

export function RevealExperience({
  hangoutId,
  sessionToken,
  isFilmKeeper,
  onFinishReveal,
  onFooterChange,
  footerEnabled = true,
  prepareReady = false,
}: RevealExperienceProps) {
  const preloaded = getRevealPreload(hangoutId);
  const usablePreload = isRevealPreloadUsable(preloaded) ? preloaded : null;
  const [perspectives, setPerspectives] = useState<RevealPerspective[]>(
    usablePreload?.perspectives ?? [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!usablePreload);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [signedAt, setSignedAt] = useState<number | null>(
    usablePreload?.signedAt ?? null,
  );
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const retryLoad = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const resignPhotos = useCallback(async () => {
    const { data, error } = await getRevealState(hangoutId, sessionToken);
    if (error || !data) return;

    const signed = await signRevealPhotoUrls(data.perspectives);
    setPerspectives(signed);
    setSignedAt(Date.now());
  }, [hangoutId, sessionToken]);

  useResignPhotosOnVisibility({
    signedAt,
    onResign: resignPhotos,
    enabled: !loading && perspectives.length > 0,
  });

  const hydrateFromPreloadCache = useCallback(() => {
    const cached = getRevealPreload(hangoutId);
    if (!isRevealPreloadUsable(cached)) {
      return false;
    }

    setPerspectives(cached.perspectives);
    setSignedAt(cached.signedAt);
    setLoadError(null);
    setLoading(false);
    return true;
  }, [hangoutId]);

  useEffect(() => {
    if (prepareReady) {
      hydrateFromPreloadCache();
    }
  }, [hydrateFromPreloadCache, prepareReady]);

  useEffect(() => {
    let cancelled = false;

    if (reloadKey === 0) {
      if (hydrateFromPreloadCache()) {
        return;
      }
      const cached = getRevealPreload(hangoutId);
      if (cached) {
        clearRevealPreload(hangoutId);
      }
    }

    async function load() {
      setLoadError(null);
      setLoading(true);

      const { data, error } = await getRevealState(hangoutId, sessionToken);
      if (cancelled) return;

      if (error || !data) {
        setPerspectives([]);
        setCurrentIndex(0);
        setSignedAt(null);
        setLoadError(error ?? "Could not load reveal");
        setLoading(false);
        return;
      }

      const signed = await signRevealPhotoUrls(data.perspectives);
      if (cancelled) return;

      setPerspectives(signed);
      setCurrentIndex(0);
      setSignedAt(Date.now());
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hangoutId, hydrateFromPreloadCache, reloadKey, sessionToken]);

  const current = perspectives[currentIndex];
  const isLastPerspective = currentIndex >= perspectives.length - 1;
  const totalPhotos = perspectives.reduce(
    (sum, perspective) => sum + perspective.photos.length,
    0,
  );

  const goToNextPerspective = useCallback(() => {
    if (!isLastPerspective) {
      setCurrentIndex((index) => index + 1);
    }
  }, [isLastPerspective]);

  const handleFinishReveal = useCallback(async () => {
    setFinishing(true);
    setFinishError(null);

    const { data, error } = await finishReveal(hangoutId, sessionToken);

    setFinishing(false);

    if (error || !data) {
      setFinishError(error ?? "Could not continue to guessing");
      return;
    }

    onFinishReveal(data);
  }, [hangoutId, onFinishReveal, sessionToken]);

  useEffect(() => {
    if (!footerEnabled || !onFooterChange || loading || loadError) {
      onFooterChange?.({});
      return;
    }

    if (perspectives.length === 0 || totalPhotos === 0) {
      if (!isFilmKeeper) {
        onFooterChange({});
        return;
      }

      onFooterChange({
        hint: "No memories were captured — you can still continue to guessing.",
        children: (
          <>
            {finishError && (
              <p className="text-center text-sm text-pink">{finishError}</p>
            )}
            <Button
              type="button"
              className={APP_PRIMARY_BUTTON_CLASS}
              disabled={finishing}
              onClick={() => void handleFinishReveal()}
            >
              {finishing ? "Continuing…" : "Continue to guessing"}
            </Button>
          </>
        ),
      });
      return;
    }

    if (!isLastPerspective) {
      onFooterChange({
        hint: "Swipe through photos",
        children: (
          <Button
            type="button"
            className={APP_PRIMARY_BUTTON_CLASS}
            onClick={goToNextPerspective}
          >
            Next perspective
          </Button>
        ),
      });
      return;
    }

    if (isFilmKeeper) {
      onFooterChange({
        hint: "Continue when your group is ready.",
        children: (
          <>
            {finishError && (
              <p className="text-center text-sm text-pink">{finishError}</p>
            )}
            <Button
              type="button"
              className={APP_PRIMARY_BUTTON_CLASS}
              disabled={finishing}
              onClick={() => void handleFinishReveal()}
            >
              {finishing ? "Continuing…" : "Continue to guessing"}
            </Button>
          </>
        ),
      });
      return;
    }

    onFooterChange({});
  }, [
    currentIndex,
    finishError,
    finishing,
    footerEnabled,
    isFilmKeeper,
    isLastPerspective,
    loadError,
    loading,
    onFooterChange,
    perspectives.length,
    totalPhotos,
    handleFinishReveal,
    goToNextPerspective,
  ]);

  if (loading) {
    return (
      <p className="w-full text-center text-sm text-muted">
        Developing your memories…
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="w-full space-y-4 text-center">
        <p className="text-sm text-pink">{loadError}</p>
        <Button type="button" variant="secondary" onClick={retryLoad}>
          Try again
        </Button>
      </div>
    );
  }

  if (perspectives.length === 0 || totalPhotos === 0) {
    return (
      <Card border="neutral" className="w-full text-center">
        <p className="text-sm text-muted">
          No memories were captured in this hangout.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.participantId}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex w-full flex-col items-stretch gap-4 sm:gap-5"
          >
            <p className="truncate px-1 text-center text-sm leading-snug">
              <span className="font-medium text-ink">Anonymous</span>
              <span className="mx-1.5 text-muted" aria-hidden>
                ·
              </span>
              <span className="font-display text-lg text-pink-highlight">
                {current.nickname}
              </span>
            </p>

            {current.photos.length > 0 ? (
              <div className="w-full min-w-0">
                <RevealPhotoCarousel
                  key={current.participantId}
                  photos={current.photos}
                  perspectiveLabel={current.nickname}
                />
              </div>
            ) : null}

            {current.photos.length === 0 && (
              <p className="px-4 text-center text-sm text-muted">
                No photos from this perspective.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
