"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LuImages } from "react-icons/lu";

import { GuessingTargetNickname } from "@/components/hangout/guessing-target-nickname";
import { PerspectivePhotosOverlay } from "@/components/hangout/perspective-photos-overlay";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";
import { HANGOUT_LIMITS } from "@/lib/constants";
import {
  finishGuessing,
  getGuessingResults,
  getGuessingState,
  submitVote,
} from "@/lib/hangout/guessing";
import { getRevealState, signRevealPhotoUrls } from "@/lib/hangout/reveal";
import type { Hangout } from "@/types/hangout";
import type { HangoutStatus } from "@/types/hangout";
import type { GuessingResults, GuessingState, GuessingTarget } from "@/types/guessing";
import type { RevealPerspective } from "@/types/reveal";

export type SetupFlowFooterState = {
  hint?: string;
  children?: ReactNode;
};

type GuessingExperienceProps = {
  hangoutId: string;
  sessionToken: string;
  hangoutStatus: HangoutStatus;
  isFilmKeeper: boolean;
  onHangoutCompleted: (hangout?: Hangout) => void;
  onFooterChange?: (footer: SetupFlowFooterState) => void;
};

export function GuessingExperience({
  hangoutId,
  sessionToken,
  hangoutStatus,
  isFilmKeeper,
  onHangoutCompleted,
  onFooterChange,
}: GuessingExperienceProps) {
  const [state, setState] = useState<GuessingState | null>(null);
  const [results, setResults] = useState<GuessingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [savingTargetId, setSavingTargetId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [galleryTarget, setGalleryTarget] = useState<GuessingTarget | null>(null);
  const [perspectivePhotos, setPerspectivePhotos] = useState<RevealPerspective[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosLoadError, setPhotosLoadError] = useState<string | null>(null);
  const perspectivePhotosLoadedRef = useRef(false);

  const isCompleted = hangoutStatus === "completed";

  const retryLoad = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadError(null);
      setLoading(true);

      if (isCompleted) {
        const { data, error } = await getGuessingResults(hangoutId, sessionToken);
        if (cancelled) return;

        if (error || !data) {
          setResults(null);
          setLoadError(error ?? "Could not load results");
          setLoading(false);
          return;
        }

        setResults(data);
        setState(null);
        setLoading(false);
        return;
      }

      const { data, error } = await getGuessingState(hangoutId, sessionToken);
      if (cancelled) return;

      if (error || !data) {
        setState(null);
        setLoadError(error ?? "Could not load guessing");
        setLoading(false);
        return;
      }

      setResults(null);
      setState(data);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hangoutId, isCompleted, reloadKey, sessionToken]);

  useEffect(() => {
    perspectivePhotosLoadedRef.current = false;
    setPerspectivePhotos([]);
    setPhotosLoadError(null);
    setPhotosLoading(false);
  }, [hangoutId, reloadKey]);

  const canLoadPerspectivePhotos = !isCompleted && !loading && state !== null;

  useEffect(() => {
    if (!galleryTarget || !canLoadPerspectivePhotos) {
      return;
    }

    if (perspectivePhotosLoadedRef.current) {
      setPhotosLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPerspectivePhotos() {
      setPhotosLoading(true);
      setPhotosLoadError(null);

      try {
        const { data, error } = await getRevealState(hangoutId, sessionToken);
        if (cancelled) return;

        if (error || !data) {
          setPerspectivePhotos([]);
          setPhotosLoadError(error ?? "Could not load photos");
          return;
        }

        const signed = await signRevealPhotoUrls(data.perspectives);
        if (cancelled) return;

        perspectivePhotosLoadedRef.current = true;
        setPerspectivePhotos(signed);
      } finally {
        if (!cancelled) {
          setPhotosLoading(false);
        }
      }
    }

    void loadPerspectivePhotos();

    return () => {
      cancelled = true;
      setPhotosLoading(false);
    };
  }, [canLoadPerspectivePhotos, galleryTarget, hangoutId, sessionToken]);

  const galleryPhotos = useMemo(() => {
    if (!galleryTarget) return [];
    return (
      perspectivePhotos.find(
        (perspective) => perspective.participantId === galleryTarget.participantId,
      )?.photos ?? []
    );
  }, [galleryTarget, perspectivePhotos]);

  useEffect(() => {
    if (isCompleted || hangoutStatus !== "guessing") return;

    let cancelled = false;

    async function poll() {
      const { data, error } = await getGuessingState(hangoutId, sessionToken);
      if (cancelled || error || !data) return;
      setState(data);
    }

    const intervalId = window.setInterval(() => {
      void poll();
    }, HANGOUT_LIMITS.hangoutPollMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [hangoutId, hangoutStatus, isCompleted, sessionToken]);

  const votesByTarget = useMemo(() => {
    const map = new Map<string, string>();
    state?.myVotes.forEach((vote) => {
      map.set(vote.targetParticipantId, vote.guessedRealName);
    });
    return map;
  }, [state?.myVotes]);

  const usedNames = useMemo(() => {
    return new Set(votesByTarget.values());
  }, [votesByTarget]);

  const allVotesIn = (state?.votesSubmitted ?? 0) >= (state?.votesRequired ?? 0);

  const handleFinishGuessing = useCallback(async () => {
    setFinishing(true);
    setFinishError(null);

    const { data, error } = await finishGuessing(hangoutId, sessionToken);

    setFinishing(false);

    if (error) {
      setFinishError(error);
      return;
    }

    onHangoutCompleted(data);
  }, [hangoutId, onHangoutCompleted, sessionToken]);

  async function handleGuess(
    targetParticipantId: string,
    guessedRealName: string,
  ) {
    setSavingTargetId(targetParticipantId);
    setSubmitError(null);

    const { data, error } = await submitVote(
      hangoutId,
      sessionToken,
      targetParticipantId,
      guessedRealName,
    );

    setSavingTargetId(null);

    if (error || !data) {
      setSubmitError(error ?? "Could not save guess");
      return;
    }

    setState(data);
  }

  useEffect(() => {
    if (!onFooterChange || loading || loadError) {
      onFooterChange?.({});
      return;
    }

    if (isCompleted && results) {
      onFooterChange({
        hint: "Browse every perspective in the memory gallery.",
      });
      return;
    }

    if (!state) {
      onFooterChange({});
      return;
    }

    if (allVotesIn && isFilmKeeper) {
      onFooterChange({
        children: (
          <>
            {finishError && (
              <p className="text-center text-sm text-pink">{finishError}</p>
            )}
            <Button
              type="button"
              disabled={finishing}
              className={APP_PRIMARY_BUTTON_CLASS}
              onClick={() => void handleFinishGuessing()}
            >
              {finishing ? "Finishing…" : "Reveal results"}
            </Button>
          </>
        ),
      });
      return;
    }

    if (allVotesIn && !isFilmKeeper) {
      onFooterChange({
        hint: "All guesses saved. Waiting for the Film Keeper to reveal results…",
      });
      return;
    }

    onFooterChange({
      hint: "Match each nickname to a real name. Your guesses stay private.",
    });
  }, [
    allVotesIn,
    finishError,
    finishing,
    handleFinishGuessing,
    isCompleted,
    isFilmKeeper,
    loadError,
    loading,
    onFooterChange,
    results,
    state,
  ]);

  if (loading) {
    return (
      <p className="text-center text-sm text-muted">Loading guessing round…</p>
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

  if (isCompleted) {
    if (!results) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted">Results are not available yet.</p>
          <Button type="button" variant="secondary" onClick={retryLoad}>
            Refresh
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6 pt-5 sm:pt-8">
        <Card border="neutral" className="text-center">
          <p className="text-sm text-muted">Your score</p>
          <p className="font-display mt-1 text-4xl">
            {results.myScore.correct}/{results.myScore.total}
          </p>
          <p className="mt-2 text-sm text-muted">
            You matched {results.myScore.correct} of {results.myScore.total}{" "}
            perspectives correctly.
          </p>
        </Card>

        <div className="space-y-3">
          {results.revealed.map((row) => (
            <Card key={row.participantId} border="neutral">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm sm:justify-between sm:text-left">
                <span className="font-medium wrap-break-word text-ink">
                  {row.nickname}
                </span>
                <span className="text-muted">was</span>
                <span className="font-medium wrap-break-word text-ink">
                  {row.realName}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted">Could not load the guessing round.</p>
        <Button type="button" variant="secondary" onClick={retryLoad}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-w-0 space-y-6 pt-5 sm:pt-8">
        {submitError && (
          <p className="text-center text-sm text-pink">{submitError}</p>
        )}

        <Card border="neutral" className="p-4 sm:p-5">
          <ul className="divide-y divide-container-border/70">
            {state.targets.map((target) => {
              const selected = votesByTarget.get(target.participantId) ?? "";
              const isSaving = savingTargetId === target.participantId;

              const selectOptions = state.realNameOptions.map((name) => ({
                value: name,
                label: name,
                disabled: usedNames.has(name) && selected !== name,
              }));

              return (
                <li
                  key={target.participantId}
                  className="flex items-start gap-2.5 py-4 first:pt-0 last:pb-0 sm:gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setGalleryTarget(target)}
                      className={cn(
                        "mt-0.5 shrink-0 rounded-md p-1 text-pink-highlight transition-colors",
                        "hover:bg-pink/10 hover:text-pink-accent active:scale-95",
                      )}
                      aria-label={`View photos from ${target.nickname}`}
                    >
                      <LuImages className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden />
                    </button>
                    <GuessingTargetNickname
                      nickname={target.nickname}
                      className="min-w-0 flex-1"
                    />
                  </div>
                  <AppSelect
                    className="w-29 shrink-0 self-center sm:w-32"
                    value={selected}
                    placeholder="Guess"
                    disabled={isSaving}
                    aria-label={`Real name for ${target.nickname}`}
                    options={selectOptions}
                    onChange={(name) => void handleGuess(target.participantId, name)}
                  />
                </li>
              );
            })}
          </ul>
        </Card>

      {state.targets.length === 0 && (
        <Card border="neutral" className="text-center text-sm text-muted">
          No other participants to guess — you&apos;re solo in this hangout.
        </Card>
      )}

      {allVotesIn && !isFilmKeeper && (
        <Card border="neutral" className="text-center md:hidden">
          <p className="text-sm text-muted">
            All guesses saved. Waiting for the Film Keeper to reveal results…
          </p>
        </Card>
      )}
      </div>

      <PerspectivePhotosOverlay
        open={galleryTarget !== null}
        onClose={() => setGalleryTarget(null)}
        nickname={galleryTarget?.nickname ?? ""}
        photos={galleryPhotos}
        loading={galleryTarget !== null && photosLoading}
        loadError={photosLoadError}
      />
    </>
  );
}
