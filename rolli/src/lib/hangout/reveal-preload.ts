import { REVEAL_AMBIENT_MUSIC_SRC } from "@/lib/hangout/reveal-music";
import {
  getRevealPreload,
  hasRevealPreload,
  setRevealPreload,
} from "@/lib/hangout/reveal-preload-cache";
import { getRevealState, signRevealPhotoUrls } from "@/lib/hangout/reveal";
import type { RevealPerspective } from "@/types/reveal";

function collectSignedPhotoUrls(perspectives: RevealPerspective[]): string[] {
  return perspectives.flatMap((perspective) =>
    perspective.photos
      .map((photo) => photo.signedUrl)
      .filter((url): url is string => Boolean(url)),
  );
}

export function preloadRevealImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return Promise.resolve();

  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  ).then(() => undefined);
}

let ambientAudioPreload: HTMLAudioElement | null = null;

export function preloadRevealAmbientAudio(): void {
  if (typeof window === "undefined") return;
  if (ambientAudioPreload) return;

  ambientAudioPreload = new Audio(REVEAL_AMBIENT_MUSIC_SRC);
  ambientAudioPreload.preload = "auto";
  ambientAudioPreload.load();
}

export async function preloadRevealState(
  hangoutId: string,
  sessionToken: string,
): Promise<boolean> {
  if (hasRevealPreload(hangoutId)) {
    return true;
  }

  const { data, error } = await getRevealState(hangoutId, sessionToken);
  if (error || !data) {
    return false;
  }

  const signed = await signRevealPhotoUrls(data.perspectives);
  setRevealPreload(hangoutId, signed);
  await preloadRevealImages(collectSignedPhotoUrls(signed));
  return true;
}

export function getPreloadedRevealPerspectives(
  hangoutId: string,
): RevealPerspective[] | null {
  return getRevealPreload(hangoutId)?.perspectives ?? null;
}

export { hasRevealPreload };
