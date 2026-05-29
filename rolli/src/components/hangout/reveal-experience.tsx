"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useResignPhotosOnVisibility } from "@/hooks/use-resign-photos-on-visibility";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
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
};

export function RevealExperience({
  hangoutId,
  sessionToken,
  isFilmKeeper,
  onFinishReveal,
  onFooterChange,
}: RevealExperienceProps) {
  const [perspectives, setPerspectives] = useState<RevealPerspective[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [signedAt, setSignedAt] = useState<number | null>(null);
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

  useEffect(() => {
    let cancelled = false;

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
  }, [hangoutId, reloadKey, sessionToken]);

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
    if (!onFooterChange || loading || loadError) {
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
        hint: `Perspective ${currentIndex + 1} of ${perspectives.length} — swipe through each anonymous view.`,
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
        hint: "Continue when your group is ready — you can open guessing even if others are still viewing.",
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

    onFooterChange({
      hint: "Waiting for the Film Keeper to open the guessing phase…",
    });
  }, [
    currentIndex,
    finishError,
    finishing,
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
      <p className="text-center text-sm text-muted">Developing your memories…</p>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-pink">{loadError}</p>
        <Button type="button" variant="secondary" onClick={retryLoad}>
          Try again
        </Button>
      </div>
    );
  }

  if (perspectives.length === 0 || totalPhotos === 0) {
    return (
      <Card border="neutral" className="text-center">
        <p className="text-sm text-muted">
          No memories were captured in this hangout.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card border="neutral" className="text-center">
        <p className="text-xs font-medium uppercase tracking-overline text-pink-muted">
          Perspective {currentIndex + 1} of {perspectives.length}
        </p>
      </Card>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.participantId}
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-4"
          >
            <Card className="text-center">
              <p className="text-xs uppercase tracking-widest text-muted">
                Anonymous perspective
              </p>
              <p className="font-display mt-2 text-3xl">{current.nickname}</p>
            </Card>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {current.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-3/4 overflow-hidden rounded-2xl bg-[#F8F8F8]"
                >
                  {photo.signedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.signedUrl}
                      alt={`Memory from ${current.nickname}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      Unavailable
                    </div>
                  )}
                </div>
              ))}
            </div>

            {current.photos.length === 0 && (
              <p className="text-center text-sm text-muted">
                No photos from this perspective.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
