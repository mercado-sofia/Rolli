"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { BackHomeButton } from "@/components/hangout/back-home-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  finishGuessing,
  getGuessingResults,
  getGuessingState,
  submitVote,
} from "@/lib/guessing";
import type { HangoutStatus } from "@/types/hangout";
import type { GuessingResults, GuessingState } from "@/types/guessing";

type GuessingExperienceProps = {
  hangoutId: string;
  hangoutSlug: string;
  sessionToken: string;
  hangoutTitle: string;
  hangoutStatus: HangoutStatus;
  isFilmKeeper: boolean;
  onHangoutCompleted: () => void;
};

export function GuessingExperience({
  hangoutId,
  hangoutSlug,
  sessionToken,
  hangoutTitle,
  hangoutStatus,
  isFilmKeeper,
  onHangoutCompleted,
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

  async function handleFinishGuessing() {
    setFinishing(true);
    setFinishError(null);

    const { error } = await finishGuessing(hangoutId, sessionToken);

    setFinishing(false);

    if (error) {
      setFinishError(error);
      return;
    }

    onHangoutCompleted();
  }

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
        <div className="text-center">
          <p className="text-sm font-medium text-muted">Results</p>
          <h2 className="font-display mt-1 text-2xl text-ink">{hangoutTitle}</h2>
          <p className="mt-2 text-sm text-muted">
            You matched {results.myScore.correct} of {results.myScore.total}{" "}
            perspectives correctly.
          </p>
        </div>

        <Card className="text-center">
          <p className="font-display text-4xl">
            {results.myScore.correct}/{results.myScore.total}
          </p>
          <p className="mt-2 text-sm text-muted">Your score</p>
        </Card>

        <div className="space-y-3">
          {results.revealed.map((row) => (
            <Card key={row.participantId}>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm sm:justify-between sm:text-left">
                <span className="font-medium wrap-break-word text-ink">{row.nickname}</span>
                <span className="text-muted">was</span>
                <span className="font-medium wrap-break-word text-ink">{row.realName}</span>
              </div>
            </Card>
          ))}
        </div>

        <Button href={`/h/${hangoutSlug}/gallery`}>View memory gallery</Button>
        <BackHomeButton />
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

  const allVotesIn = state.votesSubmitted >= state.votesRequired;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-muted">Guessing phase</p>
        <h2 className="font-display mt-1 text-2xl text-ink">{hangoutTitle}</h2>
        <p className="mt-2 text-sm text-muted">
          Match each nickname to a real name. Your guesses stay private.
        </p>
      </div>

      <Card className="text-center">
        <p className="text-sm text-muted">Progress</p>
        <p className="mt-1 text-2xl font-semibold text-ink">
          {state.votesSubmitted} / {state.votesRequired}
        </p>
      </Card>

      {submitError && (
        <p className="text-center text-sm text-pink">{submitError}</p>
      )}

      <div className="space-y-4">
        {state.targets.map((target) => {
          const selected = votesByTarget.get(target.participantId) ?? "";
          const isSaving = savingTargetId === target.participantId;

          return (
            <Card key={target.participantId}>
              <p className="text-sm font-medium text-ink">{target.nickname}</p>
              <p className="mt-1 text-xs text-muted">Who is behind this nickname?</p>
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
                      onClick={() => void handleGuess(target.participantId, name)}
                    >
                      {name}
                    </Button>
                  );
                })}
              </div>
              {selected && (
                <p className="mt-2 text-xs text-muted">
                  Your guess: <span className="font-medium text-ink">{selected}</span>
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {state.targets.length === 0 && (
        <Card className="text-center text-sm text-muted">
          No other participants to guess — you&apos;re solo in this hangout.
        </Card>
      )}

      {allVotesIn && isFilmKeeper && (
        <>
          {finishError && (
            <p className="text-center text-sm text-pink">{finishError}</p>
          )}
          <Button
            type="button"
            disabled={finishing}
            onClick={() => void handleFinishGuessing()}
          >
            {finishing ? "Finishing…" : "Reveal results"}
          </Button>
        </>
      )}

      {allVotesIn && !isFilmKeeper && (
        <Card className="text-center">
          <p className="text-sm text-muted">
            All guesses saved. Waiting for the Film Keeper to reveal results…
          </p>
        </Card>
      )}
    </div>
  );
}
