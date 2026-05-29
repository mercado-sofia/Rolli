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
