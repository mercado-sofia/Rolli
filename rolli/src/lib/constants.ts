export const APP_NAME = "rolli";

/** Static files under /public — use these paths in metadata and Image src. */
export const PUBLIC_ASSETS = {
  images: {
    logo: "/images/rolli-logo.png",
  },
} as const;

/** Public site URL used in generated invitation links */
export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rolli.app";

export const HANGOUT_LIMITS = {
  maxParticipants: 10,
  minToStart: 2,
  maxToStart: 10,
  maxPhotosPerUser: 10,
  autoEndHours: 24,
  hangoutPollMs: 2000,
} as const;

export const GUIDE_SLIDES = [
  {
    emoji: "📸",
    title: "Everyone captures memories anonymously.",
  },
  {
    emoji: "🎞️",
    title: "Photos stay hidden until the hangout ends.",
  },
  {
    emoji: "🌙",
    title: "Every perspective tells a different story.",
  },
] as const;
