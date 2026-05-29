import { REVEAL_AMBIENT_MUSIC_SRC } from "@/lib/hangout/reveal-music";

export const REVEAL_MUSIC_VOLUME = 0.55;

let audio: HTMLAudioElement | null = null;

export function getRevealAmbientAudioElement(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("Reveal ambient audio is only available in the browser");
  }

  if (!audio) {
    audio = new Audio(REVEAL_AMBIENT_MUSIC_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = REVEAL_MUSIC_VOLUME;
  }

  return audio;
}

export function preloadRevealAmbientAudio(): void {
  if (typeof window === "undefined") return;
  getRevealAmbientAudioElement().load();
}

export async function playRevealAmbientAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const element = getRevealAmbientAudioElement();
  if (!element.paused) return true;

  try {
    await element.play();
    return true;
  } catch {
    return false;
  }
}

export function pauseRevealAmbientAudio(reset = true): void {
  if (!audio) return;

  audio.pause();
  if (reset) {
    audio.currentTime = 0;
  }
}

export function shouldPlayRevealAmbientMusic(
  status: string | undefined,
  revealCountdownAt: string | null | undefined,
): boolean {
  if (status === "revealing") return true;
  return status === "developing" && revealCountdownAt != null;
}
