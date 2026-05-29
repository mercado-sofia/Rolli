export const REVEAL_COUNTDOWN_MS = 3000;
export const REVEAL_COUNTDOWN_SECONDS = 3;

export function getRevealCountdownEndsAt(
  countdownStartedAt: number | null | undefined,
): number | null {
  if (countdownStartedAt == null) return null;
  return countdownStartedAt + REVEAL_COUNTDOWN_MS;
}

export function getRevealCountdownDisplaySeconds(endsAt: number): number | null {
  const remainingMs = endsAt - Date.now();
  if (remainingMs <= 0) return null;
  return Math.min(REVEAL_COUNTDOWN_SECONDS, Math.ceil(remainingMs / 1000));
}

export function isRevealCountdownActive(
  countdownStartedAt: number | null | undefined,
): boolean {
  const endsAt = getRevealCountdownEndsAt(countdownStartedAt);
  if (!endsAt) return false;
  return Date.now() < endsAt;
}
