import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Hangout } from "@/types/hangout";
import type { Participant } from "@/types/participant";

type SessionState = {
  hangout: Hangout | null;
  participant: Participant | null;
  setSession: (hangout: Hangout, participant: Participant) => void;
  setHangout: (hangout: Hangout | null) => void;
  setParticipant: (participant: Participant | null) => void;
  resetSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hangout: null,
      participant: null,
      setSession: (hangout, participant) => set({ hangout, participant }),
      setHangout: (hangout) => set({ hangout }),
      setParticipant: (participant) => set({ participant }),
      resetSession: () => set({ hangout: null, participant: null }),
    }),
    {
      name: "rolli-session",
    },
  ),
);
