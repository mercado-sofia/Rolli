import type { HangoutStatus } from "@/types/hangout";

/** Route for a participant already in this hangout, by status. */
export function hangoutParticipantPath(slug: string, status: HangoutStatus): string {
  if (status === "active") {
    return `/h/${slug}/session`;
  }
  if (status === "waiting") {
    return `/h/${slug}/waiting`;
  }
  return `/h/${slug}/waiting`;
}
