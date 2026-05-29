"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getHangoutRouteRedirect } from "@/lib/hangout/routes";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

type UseHangoutRouteGuardOptions = {
  slug: string;
  hangout: Hangout | null;
  isLoading: boolean;
};

export function useHangoutRouteGuard({
  slug,
  hangout,
  isLoading,
}: UseHangoutRouteGuardOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const leavingApp = useSessionStore((state) => state.leavingApp);

  useEffect(() => {
    if (isLoading || leavingApp || !hangout || hangout.slug !== slug) return;

    const redirectTo = getHangoutRouteRedirect(slug, pathname, hangout.status);

    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [hangout, isLoading, leavingApp, pathname, router, slug]);
}
