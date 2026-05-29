"use client";

import { useEffect, useRef, useState } from "react";

import {
  getRevealCountdownDisplaySeconds,
  getRevealCountdownEndsAt,
} from "@/lib/hangout/reveal-countdown";

type UseRevealCountdownOptions = {
  enabled?: boolean;
  onComplete?: () => void;
};

export function useRevealCountdown(
  countdownStartedAt: number | null | undefined,
  { enabled = true, onComplete }: UseRevealCountdownOptions = {},
) {
  const [, setTick] = useState(0);
  const completedRef = useRef(false);

  const endsAt =
    enabled && countdownStartedAt != null
      ? getRevealCountdownEndsAt(countdownStartedAt)
      : null;

  const displaySeconds =
    endsAt !== null ? getRevealCountdownDisplaySeconds(endsAt) : null;

  const isActive = displaySeconds !== null;

  useEffect(() => {
    if (!enabled || endsAt === null || !onComplete) {
      completedRef.current = false;
      return;
    }

    const targetEndsAt = endsAt;
    const complete = onComplete;

    function tick() {
      if (Date.now() < targetEndsAt) return;
      if (completedRef.current) return;
      completedRef.current = true;
      complete();
    }

    tick();

    const intervalId = window.setInterval(() => {
      setTick((value) => value + 1);
      tick();
    }, 100);

    return () => {
      window.clearInterval(intervalId);
      completedRef.current = false;
    };
  }, [enabled, endsAt, onComplete]);

  return { displaySeconds, isActive };
}
