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
      titleId="session-guide-title"
      title={content.title}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-2xl",
            "bg-gradient-pastel text-sm font-semibold text-white",
            "transition-all hover:brightness-[1.03] active:scale-[0.99]",
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
