export const REVEAL_COUNTDOWN_MS = 3000;
export const REVEAL_COUNTDOWN_EXTENDED_MS = 8000;
export const REVEAL_COUNTDOWN_SECONDS = 3;
export const REVEAL_COUNTDOWN_LARGE_ALBUM_PHOTOS = 10;

export function getRevealCountdownMs(photoCount = 0): number {
  return photoCount > REVEAL_COUNTDOWN_LARGE_ALBUM_PHOTOS
    ? REVEAL_COUNTDOWN_EXTENDED_MS
    : REVEAL_COUNTDOWN_MS;
}

export function getRevealCountdownEndsAt(
  countdownStartedAt: number | null | undefined,
  countdownMs = REVEAL_COUNTDOWN_MS,
): number | null {
  if (countdownStartedAt == null) return null;
  return countdownStartedAt + countdownMs;
}

export function getRevealCountdownDisplaySeconds(
  endsAt: number,
  countdownSeconds = REVEAL_COUNTDOWN_SECONDS,
): number | null {
  const remainingMs = endsAt - Date.now();
  if (remainingMs <= 0) return null;
  return Math.min(countdownSeconds, Math.ceil(remainingMs / 1000));
}

export function isRevealCountdownActive(
  countdownStartedAt: number | null | undefined,
  countdownMs = REVEAL_COUNTDOWN_MS,
): boolean {
  const endsAt = getRevealCountdownEndsAt(countdownStartedAt, countdownMs);
  if (!endsAt) return false;
  return Date.now() < endsAt;
}
