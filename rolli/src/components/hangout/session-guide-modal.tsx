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
      centerTitle
      titleId="session-guide-title"
      title={content.title}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold",
            "border border-ink bg-ink text-white hover:bg-[#2a2a2a] active:scale-[0.98]",
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
