"use client";

import { useEffect, useRef } from "react";

import { REVEAL_AMBIENT_MUSIC_SRC } from "@/lib/hangout/reveal-music";

type RevealAmbientAudioProps = {
  active: boolean;
};

const REVEAL_MUSIC_VOLUME = 0.55;

export function RevealAmbientAudio({ active }: RevealAmbientAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = REVEAL_MUSIC_VOLUME;

    function stopPlayback() {
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      el.currentTime = 0;
      isPlayingRef.current = false;
    }

    async function tryPlay() {
      const el = audioRef.current;
      if (!el || !active || isPlayingRef.current) return;
      try {
        await el.play();
        isPlayingRef.current = true;
      } catch {
        // Autoplay may be blocked until the user interacts with the page.
      }
    }

    if (!active) {
      stopPlayback();
      return;
    }

    void tryPlay();

    function handleFirstInteraction() {
      void tryPlay();
    }

    document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, { once: true });

    function handleVisibilityChange() {
      const el = audioRef.current;
      if (!el || !active) return;
      if (document.hidden) {
        el.pause();
      } else if (isPlayingRef.current) {
        void el.play().catch(() => {});
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("pointerdown", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPlayback();
    };
  }, [active]);

  return (
    <audio
      ref={audioRef}
      src={REVEAL_AMBIENT_MUSIC_SRC}
      preload="auto"
      className="sr-only"
      aria-hidden
    />
  );
}
