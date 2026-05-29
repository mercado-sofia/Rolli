"use client";

import { GuideBulletList } from "@/components/hangout/guide-bullet-list";
import { GuideModalShell } from "@/components/hangout/guide-modal-shell";
import { SESSION_GUIDE_CONTENT } from "@/lib/hangout/guide-content";
import { HANGOUT_PINK_GRADIENT_BUTTON_CLASS } from "@/lib/app-page-layout";
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
            "flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold",
            HANGOUT_PINK_GRADIENT_BUTTON_CLASS,
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
