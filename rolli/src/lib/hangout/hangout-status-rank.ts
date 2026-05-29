import type { HangoutStatus } from "@/types/hangout";

/** Higher rank = later phase in the hangout lifecycle. */
const STATUS_RANK: Record<HangoutStatus, number> = {
  cancelled: -1,
  waiting: 0,
  active: 1,
  developing: 2,
  revealing: 3,
  guessing: 4,
  completed: 5,
};

export function hangoutStatusRank(status: HangoutStatus): number {
  return STATUS_RANK[status] ?? 0;
}

/** Prefer the hangout that is further along (e.g. store completed vs stale sync guessing). */
export function pickMoreAdvancedHangoutStatus(
  storeStatus: HangoutStatus,
  syncedStatus: HangoutStatus,
): HangoutStatus {
  return hangoutStatusRank(storeStatus) >= hangoutStatusRank(syncedStatus)
    ? storeStatus
    : syncedStatus;
}
