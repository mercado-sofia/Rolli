const STORAGE_PREFIX = "rolli-waiting-return:";

export function hangoutInviteReturnPath(slug: string): string {
  return `/h/${slug}`;
}

export function setWaitingReturnPath(slug: string, path: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${STORAGE_PREFIX}${slug}`, path);
}

export function getWaitingReturnPath(slug: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return sessionStorage.getItem(`${STORAGE_PREFIX}${slug}`) ?? fallback;
}

export function clearWaitingReturnPath(slug: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${STORAGE_PREFIX}${slug}`);
}

/** Path to restore when leaving the waiting room after joining from invite or /join. */
export function inferWaitingReturnPathFromJoin(
  slug: string,
  slugFromUrl?: string,
): string {
  if (slugFromUrl) return hangoutInviteReturnPath(slug);
  return `/join?slug=${encodeURIComponent(slug)}`;
}
