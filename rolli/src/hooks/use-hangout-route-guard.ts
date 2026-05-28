"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getHangoutRouteRedirect } from "@/lib/hangout/routes";
import type { Hangout } from "@/types/hangout";

type UseHangoutRouteGuardOptions = {
  slug: string;
  hangout: Hangout | null;
  isLoading: boolean;
  /** When status is completed, stay on /guessing to show results. */
  allowGuessingWhenCompleted?: boolean;
};

export function useHangoutRouteGuard({
  slug,
  hangout,
  isLoading,
  allowGuessingWhenCompleted = false,
}: UseHangoutRouteGuardOptions) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !hangout || hangout.slug !== slug) return;

    const redirectTo = getHangoutRouteRedirect(slug, pathname, hangout.status, {
      allowGuessingWhenCompleted,
    });

    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [
    allowGuessingWhenCompleted,
    hangout,
    isLoading,
    pathname,
    router,
    slug,
  ]);
}
