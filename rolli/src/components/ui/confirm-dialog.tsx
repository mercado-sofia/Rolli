"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { APP_CONTAINER_CLASS } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  /** Centered icon above the title (e.g. mood icon for playful confirmations) */
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function ConfirmDialog({
  open,
  title,
  description,
  icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  error = null,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-auto w-[min(100%,22rem)] max-w-md",
        APP_CONTAINER_CLASS,
        "p-6 text-ink",
        "backdrop:bg-black/40",
      )}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
    >
      {icon ? <div className="mb-4 flex justify-center">{icon}</div> : null}
      <h2 className="text-center font-display text-xl leading-snug text-ink">{title}</h2>
      <div className="mt-3 text-center text-sm leading-relaxed text-muted">{description}</div>

      {error ? (
        <p className="mt-4 text-center text-sm text-pink">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="h-12 bg-pink-accent text-white hover:bg-pink-accent/90"
        >
          {loading ? "Working…" : confirmLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={onCancel}
          className="h-12"
        >
          {cancelLabel}
        </Button>
      </div>
    </dialog>
  );
}
