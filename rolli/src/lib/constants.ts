export const APP_NAME = "rolli";

export const LANDING_NAV_SECTIONS = [
  { id: "hero", label: "Home", shortLabel: "Home" },
  { id: "guide", label: "Guide", shortLabel: "Guide" },
  { id: "perfect-for", label: "Perfect for", shortLabel: "For" },
  { id: "contact", label: "Contact", shortLabel: "Contact" },
] as const;

/** Shown on the landing contact section — update with your real address. */
export const LANDING_CONTACT = {
  email: "syraecia@gmail.com",
} as const;

/** Static files under /public — use these paths in metadata and Image src. */
export const PUBLIC_ASSETS = {
  images: {
    logo: "/images/rolli-logo.png",
    landingHeroBg: "/images/landing-hero-bg.png",
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
    icon: "camera",
    title: "Everyone captures memories anonymously.",
  },
  {
    icon: "film",
    title: "Photos stay hidden until the hangout ends.",
  },
  {
    icon: "moon",
    title: "Every perspective tells a different story.",
  },
] as const;

export type GuideSlideIconKey = (typeof GUIDE_SLIDES)[number]["icon"];

export type PolaroidIconKey =
  | "flower"
  | "sparkles"
  | "party"
  | "iceCream"
  | "moon"
  | "music";
