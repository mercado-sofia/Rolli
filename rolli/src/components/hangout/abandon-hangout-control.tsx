"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbMoodSad } from "react-icons/tb";

import { HANGOUT_CANCELLED_MESSAGE } from "@/components/hangout/hangout-invitation-closed";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { abandonHangout } from "@/lib/hangout/hangouts";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";
import type { Hangout } from "@/types/hangout";

export type AbandonHangoutUiState = "idle" | "working" | "success" | "leaving";

type AbandonHangoutControlProps = {
  hangoutId: string;
  sessionToken: string;
  className?: string;
  hideTrigger?: boolean;
  onAbandoned?: (hangout: Hangout) => void;
  onUiStateChange?: (state: AbandonHangoutUiState) => void;
};

type AbandonModalPhase = "confirm" | "success";

export function AbandonHangoutControl({
  hangoutId,
  sessionToken,
  className,
  hideTrigger = false,
  onAbandoned,
  onUiStateChange,
}: AbandonHangoutControlProps) {
  const router = useRouter();
  const leaveForHome = useSessionStore((state) => state.leaveForHome);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<AbandonModalPhase>("confirm");
  const [abandoning, setAbandoning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setPhase("confirm");
    setError(null);
    setOpen(true);
  }

  function handleCancel() {
    if (abandoning) return;
    setOpen(false);
    setError(null);
    onUiStateChange?.("idle");
  }

  async function handleConfirm() {
    onUiStateChange?.("working");
    setAbandoning(true);
    setError(null);

    const { data, error: abandonError } = await abandonHangout(hangoutId, sessionToken);

    if (abandonError || !data) {
      setAbandoning(false);
      setError(abandonError ?? "Could not abandon hangout");
      onUiStateChange?.("idle");
      return;
    }

    onAbandoned?.(data);

    requestAnimationFrame(() => {
      setAbandoning(false);
      setPhase("success");
      onUiStateChange?.("success");
    });
  }

  function handleGoHome() {
    onUiStateChange?.("leaving");
    setOpen(false);
    leaveForHome();
    router.replace("/");
  }

  return (
    <>
      {!hideTrigger ? (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            "touch-manipulation",
            "flex min-h-12 w-full items-center justify-center rounded-full px-4",
            "text-sm font-medium text-muted underline underline-offset-4",
            "transition-colors active:bg-black/5 hover:text-pink-accent",
            "sm:inline-flex sm:min-h-11 sm:w-auto sm:rounded-none sm:px-0 sm:active:bg-transparent",
            className,
          )}
        >
          Abandon hangout
        </button>
      ) : null}

      <ConfirmDialog
        open={open}
        icon={
          phase === "confirm" ? (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pink/15">
              <TbMoodSad size={36} className="text-pink-accent" aria-hidden />
            </span>
          ) : undefined
        }
        title={phase === "confirm" ? "Abandon this hangout?" : "Invitation closed"}
        description={
          phase === "confirm" ? (
            <>
              This closes the room for everyone. Invite links will stop working and
              the hangout cannot be restarted.
            </>
          ) : (
            <>{HANGOUT_CANCELLED_MESSAGE}</>
          )
        }
        confirmLabel={phase === "confirm" ? "Yes, abandon hangout" : "Go home"}
        cancelLabel="Keep waiting"
        loading={phase === "confirm" && abandoning}
        error={phase === "confirm" ? error : null}
        showCancelButton={phase === "confirm"}
        dismissible={phase === "confirm" && !abandoning}
        onConfirm={() => {
          if (phase === "confirm") {
            void handleConfirm();
            return;
          }
          handleGoHome();
        }}
        onCancel={phase === "confirm" ? handleCancel : undefined}
      />
    </>
  );
}
