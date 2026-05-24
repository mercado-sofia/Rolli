export type GuessResult = {
  participantId: string;
  realName: string;
  correctGuesses: number;
  totalGuesses: number;
};

export type Vote = {
  voterId: string;
  targetParticipantId: string;
  guessedRealName: string;
};
