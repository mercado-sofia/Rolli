"use client";

import { type MouseEvent, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";

import { useGuideDialog } from "@/components/hangout/use-guide-dialog";
import { cn } from "@/lib/utils";

type GuideModalShellProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
  /** Horizontal padding for body (and footer). */
  bodyClassName?: string;
  /** Center title in the panel; close button floats over the corner. */
  centerTitle?: boolean;
};

export function GuideModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      className={cn(
        "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full",
        "border border-ink bg-white text-ink",
        "outline-none transition-colors hover:bg-black/5 active:scale-95",
      )}
      aria-label="Close"
    >
      <IoClose size={20} aria-hidden />
    </button>
  );
}

export function GuideModalShell({
  open,
  onClose,
  titleId,
  title,
  children,
  footer,
  panelClassName,
  bodyClassName,
  centerTitle = false,
}: GuideModalShellProps) {
  const { dialogRef, requestClose, handleDialogClose, handleCancel } =
    useGuideDialog(open, onClose);

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  function handleBackdropLayerClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "confirm-flow-dialog m-0 h-dvh max-h-dvh w-full max-w-none overflow-hidden",
        "border-0 bg-transparent p-0 shadow-none",
        "backdrop:bg-black/45 supports-[height:100dvh]:h-dvh",
      )}
      aria-labelledby={titleId}
      onClose={handleDialogClose}
      onCancel={handleCancel}
    >
      {/* Full-viewport layer — dialog itself only sizes to content, so flex centering must live here */}
      <div
        className="flex h-full min-h-0 w-full items-center justify-center p-4 sm:p-6"
        onClick={handleBackdropLayerClick}
      >
        <div
          role="document"
          className={cn(
            "relative flex max-h-[min(88dvh,36rem)] w-[min(100%,24rem)] flex-col overflow-hidden",
            "rounded-3xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.2)]",
            panelClassName,
          )}
          onClick={handlePanelClick}
        >
          <GuideModalCloseButton onClose={requestClose} />

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-5 pt-5 sm:pt-6",
              bodyClassName ?? "px-5 sm:px-6",
            )}
          >
            <h2
              id={titleId}
              className={cn(
                "font-display text-xl leading-snug text-ink",
                centerTitle ? "text-center" : "pr-10",
              )}
            >
              {title}
            </h2>
            <div className="mt-4">{children}</div>
          </div>

          {footer ? (
            <div
              className={cn(
                "shrink-0 border-t border-black/6 py-4",
                bodyClassName ?? "px-5 sm:px-6",
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
