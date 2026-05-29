"use client";

import { IoCheckmarkCircle, IoClose } from "react-icons/io5";

import { GuideBulletList } from "@/components/hangout/guide-bullet-list";
import { useGuideDialog } from "@/components/hangout/use-guide-dialog";
import { SESSION_GUIDE_CONTENT } from "@/lib/hangout/guide-content";
import { cn } from "@/lib/utils";

type SessionGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SessionGuideModal({ open, onClose }: SessionGuideModalProps) {
  const { dialogRef, handleDialogClose, handleCancel, handleBackdropClick } =
    useGuideDialog(open, onClose);

  const content = SESSION_GUIDE_CONTENT;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "confirm-flow-dialog fixed z-50 m-0 w-full max-w-none border-0 bg-transparent p-0 shadow-none",
        "inset-x-0 bottom-0 top-auto max-h-[min(92dvh,100dvh)]",
        "backdrop:bg-black/50",
      )}
      aria-labelledby="session-guide-title"
      onClose={handleDialogClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "flex max-h-[min(92dvh,100dvh)] flex-col",
          "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2",
        )}
      >
        <div className="flex min-h-0 flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
          <div
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-black/12"
            aria-hidden
          />

          <div className="relative shrink-0 px-5 pb-1 pt-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full",
                "text-black/45 outline-none transition-colors hover:bg-black/5 hover:text-ink",
                "sm:right-5",
              )}
              aria-label="Close guide"
            >
              <IoClose size={22} aria-hidden />
            </button>

            <h2
              id="session-guide-title"
              className="pr-10 font-display text-[1.35rem] leading-tight text-ink"
            >
              {content.title}
            </h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-4 sm:px-6">
            <p className="text-sm leading-relaxed text-muted">{content.intro}</p>

            <h3 className="mt-6 text-sm font-semibold text-ink">
              {content.sectionTitle}
            </h3>

            <GuideBulletList items={content.bullets} className="mt-4" />

            <p className="mt-6 flex items-start gap-2 text-sm font-medium text-ink/85">
              <IoCheckmarkCircle
                className="mt-0.5 shrink-0 text-black/35"
                size={18}
                aria-hidden
              />
              {content.acknowledge}
            </p>
          </div>

          <div className="shrink-0 border-t border-black/6 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-2xl",
                "bg-[#C6D9F5] text-sm font-semibold text-white",
                "transition-all hover:brightness-[1.02] active:scale-[0.99]",
              )}
            >
              {content.primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
