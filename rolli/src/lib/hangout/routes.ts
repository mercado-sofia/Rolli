import type { HangoutStatus } from "@/types/hangout";

/** Route for a participant already in this hangout, by status. */
export function hangoutParticipantPath(slug: string, status: HangoutStatus): string {
  switch (status) {
    case "active":
      return `/h/${slug}/session`;
    case "waiting":
      return `/h/${slug}/waiting`;
    case "developing":
      return `/h/${slug}/developing`;
    case "revealing":
      return `/h/${slug}/reveal`;
    case "guessing":
      return `/h/${slug}/guessing`;
    case "completed":
      return `/h/${slug}/gallery`;
    case "cancelled":
      return `/h/${slug}`;
    default:
      return `/h/${slug}/waiting`;
  }
}

const GUESSING_PATH_SUFFIX = "/guessing";
const GALLERY_PATH_SUFFIX = "/gallery";
const SHARE_PATH_SUFFIX = "/share";

function isCompletedPhasePath(currentPath: string): boolean {
  return (
    currentPath.endsWith(GUESSING_PATH_SUFFIX) ||
    currentPath.endsWith(GALLERY_PATH_SUFFIX)
  );
}

export function hangoutSharePath(slug: string): string {
  return `/h/${slug}/share`;
}

/**
 * Returns the path to redirect to when the user is on the wrong phase page, or null if OK.
 */
export function getHangoutRouteRedirect(
  slug: string,
  currentPath: string,
  status: HangoutStatus,
): string | null {
  const canonical = hangoutParticipantPath(slug, status);

  if (currentPath === canonical) {
    return null;
  }

  if (status === "completed" && isCompletedPhasePath(currentPath)) {
    return null;
  }

  if (status === "waiting" && currentPath.endsWith(SHARE_PATH_SUFFIX)) {
    return null;
  }

  return canonical;
}
