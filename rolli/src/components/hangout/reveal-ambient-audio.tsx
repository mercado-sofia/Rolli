"use client";

import { useEffect } from "react";

import {
  pauseRevealAmbientAudio,
  playRevealAmbientAudio,
} from "@/lib/hangout/reveal-ambient-audio-controller";

type RevealAmbientAudioProps = {
  active: boolean;
};

export function RevealAmbientAudio({ active }: RevealAmbientAudioProps) {
  useEffect(() => {
    if (!active) {
      pauseRevealAmbientAudio();
      return;
    }

    void playRevealAmbientAudio();

    function handleFirstInteraction() {
      void playRevealAmbientAudio();
    }

    document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, { once: true });

    function handleVisibilityChange() {
      if (document.hidden) {
        pauseRevealAmbientAudio(false);
        return;
      }

      void playRevealAmbientAudio();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("pointerdown", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active]);

  return null;
}
