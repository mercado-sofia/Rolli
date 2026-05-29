import { pickMoreAdvancedHangoutStatus } from "@/lib/hangout/hangout-status-rank";
import type { Hangout } from "@/types/hangout";

/**
 * Merge a fetched/realtime hangout into session state without downgrading phase
 * (e.g. keep `completed` when a stale poll still returns `guessing`).
 */
export function mergeHangoutUpdate(
  current: Hangout | null,
  incoming: Hangout,
): Hangout {
  if (!current || current.id !== incoming.id || current.slug !== incoming.slug) {
    return incoming;
  }

  if (current.status === "cancelled" && incoming.status === "waiting") {
    return current;
  }

  const status = pickMoreAdvancedHangoutStatus(current.status, incoming.status);

  return { ...current, ...incoming, status };
}
