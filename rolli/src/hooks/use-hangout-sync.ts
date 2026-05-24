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
};

export function useHangoutSync({
  slug,
  pollMs = HANGOUT_LIMITS.hangoutPollMs,
  enabled = true,
  onActive,
  onWaiting,
  onDeveloping,
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
  const didNotifyActiveRef = useRef(false);
  const didNotifyWaitingRef = useRef(false);
  const didNotifyDevelopingRef = useRef(false);

  useEffect(() => {
    onActiveRef.current = onActive;
    onWaitingRef.current = onWaiting;
    onDevelopingRef.current = onDeveloping;
  }, [onActive, onWaiting, onDeveloping]);

  useEffect(() => {
    didNotifyActiveRef.current = false;
    didNotifyWaitingRef.current = false;
    didNotifyDevelopingRef.current = false;
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

      if (data.status === "active" && onActiveRef.current && !didNotifyActiveRef.current) {
        didNotifyActiveRef.current = true;
        onActiveRef.current(data);
      }

      if (data.status === "waiting" && onWaitingRef.current && !didNotifyWaitingRef.current) {
        didNotifyWaitingRef.current = true;
        onWaitingRef.current(data);
      }

      if (data.status === "developing" && onDevelopingRef.current && !didNotifyDevelopingRef.current) {
        didNotifyDevelopingRef.current = true;
        onDevelopingRef.current(data);
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
