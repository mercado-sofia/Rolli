import type { RevealPerspective } from "@/types/reveal";

export type RevealPreloadEntry = {
  perspectives: RevealPerspective[];
  signedAt: number;
};

const cache = new Map<string, RevealPreloadEntry>();

export function setRevealPreload(
  hangoutId: string,
  perspectives: RevealPerspective[],
): void {
  cache.set(hangoutId, { perspectives, signedAt: Date.now() });
}

export function getRevealPreload(hangoutId: string): RevealPreloadEntry | null {
  return cache.get(hangoutId) ?? null;
}

export function clearRevealPreload(hangoutId: string): void {
  cache.delete(hangoutId);
}

export function hasRevealPreload(hangoutId: string): boolean {
  return cache.has(hangoutId);
}

export function isRevealPreloadUsable(
  entry: RevealPreloadEntry | null | undefined,
): entry is RevealPreloadEntry {
  if (!entry) return false;

  const photos = entry.perspectives.flatMap((perspective) => perspective.photos);
  if (photos.length === 0) return true;

  return photos.every((photo) => Boolean(photo.signedUrl));
}
