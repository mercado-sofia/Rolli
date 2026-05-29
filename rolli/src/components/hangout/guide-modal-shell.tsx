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
};

export function GuideModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className={cn(
        "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full",
        "bg-gradient-pastel text-white shadow-sm",
        "outline-none transition-all hover:brightness-[1.05] active:scale-95",
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
}: GuideModalShellProps) {
  const { dialogRef, handleDialogClose, handleCancel, handleBackdropClick } =
    useGuideDialog(open, onClose);

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "confirm-flow-dialog fixed inset-0 z-50 m-0 flex max-h-none w-full max-w-none",
        "items-center justify-center border-0 bg-transparent p-4 shadow-none",
        "backdrop:bg-black/45 sm:p-6",
      )}
      aria-labelledby={titleId}
      onClose={handleDialogClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div
        role="document"
        className={cn(
          "relative flex max-h-[min(88dvh,36rem)] w-full max-w-sm flex-col overflow-hidden",
          "rounded-3xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.2)]",
          panelClassName,
        )}
        onClick={handlePanelClick}
      >
        <GuideModalCloseButton onClose={onClose} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
          <h2
            id={titleId}
            className="pr-10 font-display text-xl leading-snug text-ink"
          >
            {title}
          </h2>
          <div className="mt-4">{children}</div>
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-black/6 px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
