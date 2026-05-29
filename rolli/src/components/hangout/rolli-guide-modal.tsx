"use client";

import { IoClose } from "react-icons/io5";

import { GuideBulletList } from "@/components/hangout/guide-bullet-list";
import { useGuideDialog } from "@/components/hangout/use-guide-dialog";
import { ROLLI_SESSION_GUIDE_CONTENT } from "@/lib/hangout/guide-content";
import { cn } from "@/lib/utils";

type RolliGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RolliGuideModal({ open, onClose }: RolliGuideModalProps) {
  const { dialogRef, handleDialogClose, handleCancel, handleBackdropClick } =
    useGuideDialog(open, onClose);

  const content = ROLLI_SESSION_GUIDE_CONTENT;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "confirm-flow-dialog fixed z-50 m-0 max-h-none w-full max-w-none border-0 bg-transparent p-0 shadow-none",
        "inset-0 flex items-center justify-center backdrop:bg-black/50",
      )}
      aria-labelledby="rolli-guide-title"
      onClose={handleDialogClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "relative flex max-h-[min(88dvh,32rem)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden",
          "rounded-3xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.18)]",
          "sm:w-[min(100vw-2.5rem,24rem)]",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full",
            "text-black/45 outline-none transition-colors hover:bg-black/5 hover:text-ink",
          )}
          aria-label="Close guide"
        >
          <IoClose size={22} aria-hidden />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-6 pt-5 sm:px-6 sm:pt-6">
          <h2
            id="rolli-guide-title"
            className="pr-9 font-display text-xl leading-snug text-ink"
          >
            {content.title}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted">{content.intro}</p>

          <div className="mt-6 space-y-6">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
                <GuideBulletList items={section.bullets} className="mt-3" />
              </section>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
}
