import type { Hangout } from "@/types/hangout";
import type { Participant } from "@/types/participant";

/** Whether this participant is the current Film Keeper (from synced hangout state). */
export function isCurrentFilmKeeper(
  participant: Participant | null,
  hangout: Hangout | null,
): boolean {
  return Boolean(
    participant && hangout && participant.id === hangout.filmKeeperId,
  );
}
