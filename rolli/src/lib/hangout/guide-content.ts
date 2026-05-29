export const SESSION_GUIDE_CONTENT = {
  title: "Hangout session",
  intro:
    "You are in the live capture phase. Use this time to collect anonymous memories before the group reveal.",
  sectionTitle: "While the hangout is active",
  bullets: [
    "Tap the camera to capture your perspective — up to 10 photos per person.",
    "Shots stay hidden until the Film Keeper ends the hangout.",
    "Stay present; no peeking at anyone else's roll during capture.",
    "When everyone is done, the Film Keeper taps End hangout to move on.",
  ],
  acknowledge: "Keep this tab open so uploads finish smoothly.",
  primaryLabel: "Got it",
} as const;

export type RolliSessionGuideSection = {
  title: string;
  bullets: readonly string[];
};

export const ROLLI_SESSION_GUIDE_CONTENT = {
  title: "Rolli guide",
  intro: "Quick reference for this hangout — from capture through reveal.",
  sections: [
    {
      title: "Capturing memories",
      bullets: [
        "Each guest shoots from their own anonymous perspective.",
        "Photos upload in the background while the hangout is active.",
        "The counter shows how many shots you have left (10 max).",
      ],
    },
    {
      title: "Film Keeper",
      bullets: [
        "One host ends the hangout when the group is ready.",
        "If the Keeper leaves, host duties pass to the next guest.",
        "Guests can leave anytime and rejoin with the invite link.",
      ],
    },
    {
      title: "After capture",
      bullets: [
        "Memories develop, then reveal by perspective.",
        "Everyone guesses who took each shot, then opens the gallery.",
      ],
    },
  ] satisfies readonly RolliSessionGuideSection[],
} as const;

/** @deprecated Use SESSION_GUIDE_CONTENT — kept for any legacy imports */
export const SESSION_GUIDE_STEPS = SESSION_GUIDE_CONTENT.bullets.map((description, index) => ({
  title: ["Capture", "Stay present", "Wrap up", "Upload"][index] ?? "Tip",
  description,
}));
