"use client";

import { GuideBulletList } from "@/components/hangout/guide-bullet-list";
import { GuideModalShell } from "@/components/hangout/guide-modal-shell";
import { SESSION_GUIDE_CONTENT } from "@/lib/hangout/guide-content";
import { cn } from "@/lib/utils";

type SessionGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SessionGuideModal({ open, onClose }: SessionGuideModalProps) {
  const content = SESSION_GUIDE_CONTENT;

  return (
    <GuideModalShell
      open={open}
      onClose={onClose}
      showHeaderClose={false}
      titleId="session-guide-title"
      title={content.title}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-2xl",
            "bg-pink-accent text-sm font-semibold text-white",
            "transition-all hover:bg-pink-accent/90 active:scale-[0.99]",
          )}
        >
          {content.primaryLabel}
        </button>
      }
    >
      <GuideBulletList items={content.bullets} />
    </GuideModalShell>
  );
}
