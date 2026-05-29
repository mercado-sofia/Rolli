const PENDING_SLUG_KEY = "rolli-session-guide-pending-slug";

function seenKey(hangoutId: string) {
  return `rolli-session-guide-seen-${hangoutId}`;
}

/** Call when the Film Keeper successfully starts the hangout. */
export function markSessionGuidePending(slug: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_SLUG_KEY, slug);
}

/** True once when landing on session right after start (flag is consumed). */
export function consumeSessionGuidePending(slug: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  if (sessionStorage.getItem(PENDING_SLUG_KEY) !== slug) return false;
  sessionStorage.removeItem(PENDING_SLUG_KEY);
  return true;
}

export function hasSeenSessionGuide(hangoutId: string): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(seenKey(hangoutId)) === "1";
}

export function markSessionGuideSeen(hangoutId: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(seenKey(hangoutId), "1");
}
