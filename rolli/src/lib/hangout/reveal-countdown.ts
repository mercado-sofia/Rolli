export const REVEAL_COUNTDOWN_MS = 3000;
export const REVEAL_COUNTDOWN_SECONDS = 3;

export function getRevealCountdownEndsAt(
  revealCountdownAt: string | null | undefined,
): number | null {
  if (!revealCountdownAt) return null;
  return new Date(revealCountdownAt).getTime() + REVEAL_COUNTDOWN_MS;
}

export function getRevealCountdownDisplaySeconds(endsAt: number): number | null {
  const remainingMs = endsAt - Date.now();
  if (remainingMs <= 0) return null;
  return Math.min(REVEAL_COUNTDOWN_SECONDS, Math.ceil(remainingMs / 1000));
}

export function isRevealCountdownActive(
  revealCountdownAt: string | null | undefined,
): boolean {
  const endsAt = getRevealCountdownEndsAt(revealCountdownAt);
  if (!endsAt) return false;
  return Date.now() < endsAt;
}
