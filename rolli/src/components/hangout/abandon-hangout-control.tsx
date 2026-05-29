"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbMoodSad } from "react-icons/tb";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { abandonHangout } from "@/lib/hangout/hangouts";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";

type AbandonHangoutControlProps = {
  hangoutId: string;
  sessionToken: string;
  className?: string;
};

export function AbandonHangoutControl({
  hangoutId,
  sessionToken,
  className,
}: AbandonHangoutControlProps) {
  const router = useRouter();
  const resetSession = useSessionStore((state) => state.resetSession);

  const [open, setOpen] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleCancel() {
    if (abandoning) return;
    setOpen(false);
    setError(null);
  }

  async function handleConfirm() {
    setAbandoning(true);
    setError(null);

    const { error: abandonError } = await abandonHangout(hangoutId, sessionToken);

    setAbandoning(false);

    if (abandonError) {
      setError(abandonError);
      return;
    }

    setOpen(false);
    resetSession();
    router.push("/");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "inline-flex min-h-11 items-center justify-center text-sm font-medium text-muted",
          "underline underline-offset-4 transition-colors hover:text-pink-accent",
          className,
        )}
      >
        Abandon hangout
      </button>

      <ConfirmDialog
        open={open}
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pink/15">
            <TbMoodSad size={36} className="text-pink-accent" aria-hidden />
          </span>
        }
        title="Abandon this hangout?"
        description={
          <>
            This closes the room for everyone. Invite links will stop working and
            the hangout cannot be restarted.
          </>
        }
        confirmLabel="Yes, abandon hangout"
        cancelLabel="Keep waiting"
        loading={abandoning}
        error={error}
        onConfirm={() => void handleConfirm()}
        onCancel={handleCancel}
      />
    </>
  );
}
