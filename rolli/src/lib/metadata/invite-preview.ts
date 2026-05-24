import { APP_NAME } from "@/lib/constants";

export type InvitePreviewCopy = {
  title: string;
  description: string;
  imageHeading: string;
  imageTagline: string;
};

export function getInvitePreviewCopy(hangoutTitle?: string): InvitePreviewCopy {
  if (hangoutTitle) {
    return {
      title: `You're invited · ${hangoutTitle}`,
      description: `Join "${hangoutTitle}" on ${APP_NAME} — anonymous photos, a delayed reveal, then guess who took each memory.`,
      imageHeading: hangoutTitle,
      imageTagline: "Tap to join the hangout",
    };
  }

  return {
    title: `Join a ${APP_NAME} hangout`,
    description:
      "A cozy anonymous disposable camera for friends. Capture memories now, reveal identities later.",
    imageHeading: "You're invited",
    imageTagline: "Anonymous camera · delayed reveal",
  };
}
