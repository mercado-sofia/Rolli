import type { Participant } from "@/types/participant";

export function isParticipantReadyForGuessing(
  participant: Participant | null | undefined,
): boolean {
  return Boolean(participant?.revealFinishedAt);
}
