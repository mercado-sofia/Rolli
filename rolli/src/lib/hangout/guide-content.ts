export const SESSION_GUIDE_CONTENT = {
  title: "Hangout started",
  bullets: [
    "Tap the camera to capture memories (up to 10 each).",
    "Photos stay hidden until the hangout ends.",
    "The Film Keeper ends the hangout when everyone is done.",
  ],
  primaryLabel: "Got it",
} as const;

export type RolliSessionGuideSection = {
  title: string;
  bullets: readonly string[];
};

export const ROLLI_SESSION_GUIDE_CONTENT = {
  title: "Rolli guide",
  sections: [
    {
      title: "Capturing memories",
      bullets: [
        "Each guest shoots from their own anonymous perspective.",
        "Photos upload while the hangout is active (10 max per person).",
      ],
    },
    {
      title: "Film Keeper",
      bullets: [
        "One host ends the hangout when the group is ready.",
        "If the Keeper leaves, host duties pass to the next guest.",
      ],
    },
    {
      title: "After capture",
      bullets: [
        "Memories develop, then reveal by perspective.",
        "Guess who took each shot, then browse the gallery.",
      ],
    },
  ] satisfies readonly RolliSessionGuideSection[],
} as const;

/** @deprecated Use SESSION_GUIDE_CONTENT — kept for any legacy imports */
export const SESSION_GUIDE_STEPS = SESSION_GUIDE_CONTENT.bullets.map((description, index) => ({
  title: ["Capture", "Stay hidden", "Wrap up"][index] ?? "Tip",
  description,
}));
