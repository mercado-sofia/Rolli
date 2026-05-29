import { APP_BASE_URL } from "@/lib/constants";

/** Base URL for invitation links (env in prod, current host in dev). */
function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return APP_BASE_URL.replace(/\/$/, "");
}

export function buildInviteUrl(slug: string, origin?: string): string {
  const base = (origin ?? getAppOrigin()).replace(/\/$/, "");
  return `${base}/h/${slug}`;
}

export function extractSlugFromInviteLink(link: string): string {
  const trimmed = link.trim();
  const parts = trimmed.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
}
