export type RevealPhoto = {
  id: string;
  storagePath: string;
  capturedAt: string;
  signedUrl?: string;
  fileName?: string;
};

export type RevealPerspective = {
  participantId: string;
  nickname: string;
  realName?: string;
  isFilmKeeper?: boolean;
  photos: RevealPhoto[];
};

export type RevealState = {
  perspectives: RevealPerspective[];
};
