import type { HangoutStatus } from "@/types/hangout";

/** New guests may join via invite link only before capture ends. */
const NEW_GUEST_JOINABLE_STATUSES: HangoutStatus[] = ["waiting", "active"];

/** Prior participants may rejoin with a saved session token until the hangout completes. */
const REJOINABLE_STATUSES: HangoutStatus[] = [
  "waiting",
  "active",
  "developing",
  "revealing",
  "guessing",
];

export function isHangoutJoinable(status: HangoutStatus): boolean {
  return NEW_GUEST_JOINABLE_STATUSES.includes(status);
}

export function isHangoutRejoinable(status: HangoutStatus): boolean {
  return REJOINABLE_STATUSES.includes(status);
}

export function isHangoutInProgress(status: HangoutStatus): boolean {
  return status === "active";
}

/** Footer hint when joining a hangout that has already started capture. */
export function getLateJoinHint(status: HangoutStatus): string | null {
  if (status === "active") {
    return "You can still capture photos after joining.";
  }
  return null;
}
