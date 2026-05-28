"use client";

import { useEffect, useState } from "react";

import { HANGOUT_LIMITS } from "@/lib/constants";
import { fetchHangoutBySlug } from "@/lib/hangout/hangouts";
import { createClient } from "@/lib/supabase/client";
import { mapHangout, type HangoutRowJson } from "@/lib/supabase/mappers";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

const POLL_MS = HANGOUT_LIMITS.hangoutPollMs;

type UseHangoutSyncOptions = {
  slug: string;
  enabled?: boolean;
};

export function useHangoutSync({ slug, enabled = true }: UseHangoutSyncOptions) {
  const setHangout = useSessionStore((state) => state.setHangout);
  const sessionHangout = useSessionStore((state) => state.hangout);

  const [hangout, setLocalHangout] = useState<Hangout | null>(
    sessionHangout?.slug === slug ? sessionHangout : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !slug) return;

    let cancelled = false;
    let pollIntervalId: number | undefined;
    let removeChannel: (() => void) | undefined;

    function applyHangout(data: Hangout) {
      if (cancelled) return;
      setLocalHangout(data);
      setHangout(data);
      setLoadError(null);
      setIsLoading(false);
    }

    async function load(): Promise<Hangout | null> {
      const { data, error } = await fetchHangoutBySlug(slug);
      if (cancelled) return null;

      if (error) {
        setLoadError(error);
        setIsLoading(false);
        return null;
      }

      if (!data) {
        setLoadError("Hangout not found");
        setIsLoading(false);
        return null;
      }

      applyHangout(data);
      return data;
    }

    async function setup() {
      const initial = await load();
      if (cancelled) return;

      pollIntervalId = window.setInterval(() => {
        void load();
      }, POLL_MS);

      if (!initial) return;

      const supabase = createClient();
      const channel = supabase
        .channel(`hangout-status:${initial.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "hangouts",
            filter: `id=eq.${initial.id}`,
          },
          (payload) => {
            const row = payload.new as HangoutRowJson;
            if (row.slug !== slug) return;
            applyHangout(mapHangout(row));
          },
        )
        .subscribe();

      removeChannel = () => {
        void supabase.removeChannel(channel);
      };
    }

    void setup();

    return () => {
      cancelled = true;
      if (pollIntervalId) {
        window.clearInterval(pollIntervalId);
      }
      removeChannel?.();
    };
  }, [enabled, setHangout, slug]);

  return { hangout, loadError, isLoading };
}
