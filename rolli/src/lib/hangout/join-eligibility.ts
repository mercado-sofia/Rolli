import type { HangoutStatus } from "@/types/hangout";

const JOINABLE_STATUSES: HangoutStatus[] = [
  "waiting",
  "active",
  "developing",
  "revealing",
  "guessing",
];

export function isHangoutJoinable(status: HangoutStatus): boolean {
  return JOINABLE_STATUSES.includes(status);
}

export function isHangoutInProgress(status: HangoutStatus): boolean {
  return status !== "waiting" && isHangoutJoinable(status);
}

/** Footer hint when joining a hangout that has already started. */
export function getLateJoinHint(status: HangoutStatus): string | null {
  switch (status) {
    case "active":
      return "You can still capture photos after joining.";
    case "developing":
      return "Capture is closed — you'll join for the reveal.";
    case "revealing":
      return "You're joining during the reveal — catch up with the group.";
    case "guessing":
      return "You're joining for guessing — match nicknames to real names.";
    default:
      return null;
  }
}
