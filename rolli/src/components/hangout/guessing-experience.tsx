"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

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
import type { Hangout } from "@/types/hangout";
import type { HangoutStatus } from "@/types/hangout";
import type { GuessingResults, GuessingState } from "@/types/guessing";

export type SetupFlowFooterState = {
  hint?: string;
  children?: ReactNode;
};

type GuessingExperienceProps = {
  hangoutId: string;
  hangoutSlug: string;
  sessionToken: string;
  hangoutStatus: HangoutStatus;
  isFilmKeeper: boolean;
  onHangoutCompleted: (hangout?: Hangout) => void;
  onFooterChange?: (footer: SetupFlowFooterState) => void;
};

export function GuessingExperience({
  hangoutId,
  hangoutSlug,
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
        children: (
          <Button
            href={`/h/${hangoutSlug}/gallery`}
            className={cn(APP_PRIMARY_BUTTON_CLASS, "hidden md:inline-flex")}
          >
            View memory gallery
          </Button>
        ),
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
    hangoutSlug,
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
      <div className="space-y-6">
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

        <Button
          href={`/h/${hangoutSlug}/gallery`}
          className={cn(APP_PRIMARY_BUTTON_CLASS, "md:hidden")}
        >
          View memory gallery
        </Button>
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
    <div className="min-w-0 space-y-6">
      {submitError && (
        <p className="text-center text-sm text-pink">{submitError}</p>
      )}

      <div className="space-y-4">
        {state.targets.map((target) => {
          const selected = votesByTarget.get(target.participantId) ?? "";
          const isSaving = savingTargetId === target.participantId;

          return (
            <Card key={target.participantId} border="neutral">
              <p className="text-sm font-medium text-ink">{target.nickname}</p>
              <p className="mt-1 text-xs text-muted">
                Who is behind this nickname?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {state.realNameOptions.map((name) => {
                  const takenByOther =
                    usedNames.has(name) && selected !== name;

                  return (
                    <Button
                      key={`${target.participantId}-${name}`}
                      type="button"
                      variant={selected === name ? "primary" : "secondary"}
                      className="min-h-12 w-auto! shrink-0 px-4"
                      disabled={isSaving || takenByOther}
                      onClick={() =>
                        void handleGuess(target.participantId, name)
                      }
                    >
                      {name}
                    </Button>
                  );
                })}
              </div>
              {selected && (
                <p className="mt-2 text-xs text-muted">
                  Your guess:{" "}
                  <span className="font-medium text-ink">{selected}</span>
                </p>
              )}
            </Card>
          );
        })}
      </div>

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
  );
}
