"use client";

import { useEffect, useRef, useState } from "react";

import { HANGOUT_LIMITS } from "@/lib/constants";
import { fetchHangoutBySlug } from "@/lib/hangouts";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

type UseHangoutSyncOptions = {
  slug: string;
  pollMs?: number;
  enabled?: boolean;
  onActive?: (hangout: Hangout) => void;
  onWaiting?: (hangout: Hangout) => void;
  onDeveloping?: (hangout: Hangout) => void;
  onRevealing?: (hangout: Hangout) => void;
  onGuessing?: (hangout: Hangout) => void;
  onCompleted?: (hangout: Hangout) => void;
};

export function useHangoutSync({
  slug,
  pollMs = HANGOUT_LIMITS.hangoutPollMs,
  enabled = true,
  onActive,
  onWaiting,
  onDeveloping,
  onRevealing,
  onGuessing,
  onCompleted,
}: UseHangoutSyncOptions) {
  const setHangout = useSessionStore((state) => state.setHangout);
  const sessionHangout = useSessionStore((state) => state.hangout);

  const [hangout, setLocalHangout] = useState<Hangout | null>(
    sessionHangout?.slug === slug ? sessionHangout : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onActiveRef = useRef(onActive);
  const onWaitingRef = useRef(onWaiting);
  const onDevelopingRef = useRef(onDeveloping);
  const onRevealingRef = useRef(onRevealing);
  const onGuessingRef = useRef(onGuessing);
  const onCompletedRef = useRef(onCompleted);
  const lastNotifiedStatusRef = useRef<Hangout["status"] | null>(null);

  useEffect(() => {
    onActiveRef.current = onActive;
    onWaitingRef.current = onWaiting;
    onDevelopingRef.current = onDeveloping;
    onRevealingRef.current = onRevealing;
    onGuessingRef.current = onGuessing;
    onCompletedRef.current = onCompleted;
  }, [onActive, onWaiting, onDeveloping, onRevealing, onGuessing, onCompleted]);

  useEffect(() => {
    lastNotifiedStatusRef.current = null;
  }, [slug]);

  useEffect(() => {
    if (!enabled || !slug) return;

    let cancelled = false;

    async function load() {
      const { data, error } = await fetchHangoutBySlug(slug);
      if (cancelled) return;

      if (error) {
        setLoadError(error);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setLoadError("Hangout not found");
        setIsLoading(false);
        return;
      }

      setLocalHangout(data);
      setHangout(data);
      setLoadError(null);
      setIsLoading(false);

      if (lastNotifiedStatusRef.current !== data.status) {
        lastNotifiedStatusRef.current = data.status;

        if (data.status === "active" && onActiveRef.current) {
          onActiveRef.current(data);
        }

        if (data.status === "waiting" && onWaitingRef.current) {
          onWaitingRef.current(data);
        }

        if (data.status === "developing" && onDevelopingRef.current) {
          onDevelopingRef.current(data);
        }

        if (data.status === "revealing" && onRevealingRef.current) {
          onRevealingRef.current(data);
        }

        if (data.status === "guessing" && onGuessingRef.current) {
          onGuessingRef.current(data);
        }

        if (data.status === "completed" && onCompletedRef.current) {
          onCompletedRef.current(data);
        }
      }
    }

    const intervalId = window.setInterval(() => {
      void load();
    }, pollMs);

    void load();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [slug, pollMs, enabled, setHangout]);

  return { hangout, loadError, isLoading };
}
