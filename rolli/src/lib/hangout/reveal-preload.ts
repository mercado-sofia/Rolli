import {
  clearRevealPreload,
  getRevealPreload,
  isRevealPreloadUsable,
  setRevealPreload,
} from "@/lib/hangout/reveal-preload-cache";
import { getRevealState, signRevealPhotoUrls } from "@/lib/hangout/reveal";
import type { RevealPerspective } from "@/types/reveal";

export function revealPerspectivesHaveSignedUrls(
  perspectives: RevealPerspective[],
): boolean {
  const photos = perspectives.flatMap((perspective) => perspective.photos);
  if (photos.length === 0) return true;
  return photos.every((photo) => Boolean(photo.signedUrl));
}

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

export {
  preloadRevealAmbientAudio,
} from "@/lib/hangout/reveal-ambient-audio-controller";

export async function preloadRevealState(
  hangoutId: string,
  sessionToken: string,
): Promise<boolean> {
  const existing = getRevealPreload(hangoutId);
  if (isRevealPreloadUsable(existing)) {
    return true;
  }
  if (existing) {
    clearRevealPreload(hangoutId);
  }

  const { data, error } = await getRevealState(hangoutId, sessionToken);
  if (error || !data) {
    return false;
  }

  const signed = await signRevealPhotoUrls(data.perspectives);
  if (!revealPerspectivesHaveSignedUrls(signed)) {
    return false;
  }

  setRevealPreload(hangoutId, signed);
  await preloadRevealImages(collectSignedPhotoUrls(signed));
  return true;
}

export function getPreloadedRevealPerspectives(
  hangoutId: string,
): RevealPerspective[] | null {
  return getRevealPreload(hangoutId)?.perspectives ?? null;
}

export { hasRevealPreload } from "@/lib/hangout/reveal-preload-cache";
