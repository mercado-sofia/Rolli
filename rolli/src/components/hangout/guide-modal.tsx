"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { APP_CONTAINER_CLASS, APP_PRIMARY_BUTTON_CLASS } from "@/lib/app-page-layout";
import { cn } from "@/lib/utils";

type GuideModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  /** Extra classes on the scrollable panel inside the card */
  panelClassName?: string;
};

export function GuideModal({
  open,
  title,
  onClose,
  children,
  closeLabel = "Close",
  panelClassName,
}: GuideModalProps) {
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

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "confirm-flow-dialog fixed z-50 m-0 w-full max-w-none border-0 bg-transparent p-0 shadow-none",
        "inset-x-0 bottom-0 top-auto max-h-[min(92dvh,100dvh)]",
        "backdrop:bg-black/50",
        "md:inset-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-none",
        "md:w-[min(100vw-2rem,26rem)] md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2",
      )}
      aria-labelledby="guide-modal-title"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "flex max-h-[min(92dvh,100dvh)] flex-col items-stretch gap-3",
          "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
          "md:max-h-none md:px-0 md:pb-0 md:pt-0",
        )}
      >
        <div
          className={cn(
            APP_CONTAINER_CLASS,
            "flex min-h-0 flex-col overflow-hidden",
            "rounded-t-[1.75rem] rounded-b-none md:rounded-3xl",
          )}
        >
          <div
            className="mx-auto mb-3 mt-1 h-1 w-10 shrink-0 rounded-full bg-black/12 md:hidden"
            aria-hidden
          />

          <div className="shrink-0 border-b border-container-border/60 px-5 py-4 md:px-6">
            <h2
              id="guide-modal-title"
              className="text-center font-display text-xl leading-snug text-ink"
            >
              {title}
            </h2>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4 md:px-6 md:py-5",
              panelClassName,
            )}
          >
            {children}
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className={cn(
            APP_PRIMARY_BUTTON_CLASS,
            "touch-manipulation bg-white shadow-soft",
          )}
        >
          {closeLabel}
        </Button>
      </div>
    </dialog>
  );
}
