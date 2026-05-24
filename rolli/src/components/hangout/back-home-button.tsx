"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session-store";

type BackHomeButtonProps = {
  label?: string;
};

export function BackHomeButton({ label = "Back to home" }: BackHomeButtonProps) {
  const router = useRouter();
  const resetSession = useSessionStore((state) => state.resetSession);

  function handleBackHome() {
    resetSession();
    router.push("/");
  }

  return (
    <Button type="button" variant="secondary" onClick={handleBackHome}>
      {label}
    </Button>
  );
}
