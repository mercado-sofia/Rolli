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
    default:
      return `/h/${slug}/waiting`;
  }
}
