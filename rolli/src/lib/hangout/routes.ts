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

export function normalizeHangoutPath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function isCompletedPhasePath(slug: string, currentPath: string): boolean {
  const path = normalizeHangoutPath(currentPath);
  return (
    path === `/h/${slug}${GUESSING_PATH_SUFFIX}` ||
    path === `/h/${slug}${GALLERY_PATH_SUFFIX}`
  );
}

export function hangoutSharePath(slug: string): string {
  return `/h/${slug}/share`;
}

export function hangoutGalleryPath(slug: string): string {
  return `/h/${slug}${GALLERY_PATH_SUFFIX}`;
}

/**
 * Returns the path to redirect to when the user is on the wrong phase page, or null if OK.
 */
export function getHangoutRouteRedirect(
  slug: string,
  currentPath: string,
  status: HangoutStatus,
): string | null {
  const path = normalizeHangoutPath(currentPath);
  const canonical = hangoutParticipantPath(slug, status);

  if (path === canonical) {
    return null;
  }

  if (status === "completed" && isCompletedPhasePath(slug, path)) {
    return null;
  }

  if (status === "waiting" && path.endsWith(SHARE_PATH_SUFFIX)) {
    return null;
  }

  return canonical;
}
