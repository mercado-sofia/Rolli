"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { leaveHangout } from "@/lib/hangouts";
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

type LeaveRoomButtonProps = {
  hangoutId: string;
  sessionToken: string;
};

export function LeaveRoomButton({
  hangoutId,
  sessionToken,
}: LeaveRoomButtonProps) {
  const router = useRouter();
  const resetSession = useSessionStore((state) => state.resetSession);

  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLeave() {
    setLeaving(true);
    setError(null);

    const { error: leaveError } = await leaveHangout(hangoutId, sessionToken);

    setLeaving(false);

    if (leaveError) {
      setError(leaveError);
      return;
    }

    resetSession();
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-center text-sm text-pink">{error}</p>}
      <Button
        type="button"
        variant="secondary"
        disabled={leaving}
        onClick={() => void handleLeave()}
      >
        {leaving ? "Leaving…" : "Leave room"}
      </Button>
    </div>
  );
}
