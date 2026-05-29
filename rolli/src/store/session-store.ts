import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Hangout } from "@/types/hangout";
import type { Participant } from "@/types/participant";

type SessionState = {
  hangout: Hangout | null;
  participant: Participant | null;
  /** True while exiting a hangout flow for the landing page — guards must not redirect. */
  leavingApp: boolean;
  setSession: (hangout: Hangout, participant: Participant) => void;
  setHangout: (hangout: Hangout | null) => void;
  setParticipant: (participant: Participant | null) => void;
  resetSession: () => void;
  /** Clear session and mark an intentional exit so route guards stay out of the way. */
  leaveForHome: () => void;
  clearLeavingApp: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hangout: null,
      participant: null,
      leavingApp: false,
      setSession: (hangout, participant) =>
        set({ hangout, participant, leavingApp: false }),
      setHangout: (hangout) => set({ hangout }),
      setParticipant: (participant) => set({ participant }),
      resetSession: () =>
        set({ hangout: null, participant: null, leavingApp: false }),
      leaveForHome: () =>
        set({ hangout: null, participant: null, leavingApp: true }),
      clearLeavingApp: () => set({ leavingApp: false }),
    }),
    {
      name: "rolli-session",
      partialize: (state) => ({
        hangout: state.hangout,
        participant: state.participant,
      }),
    },
  ),
);
