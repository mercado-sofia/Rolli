"use client";

import { GuideBulletList } from "@/components/hangout/guide-bullet-list";
import { GuideModalShell } from "@/components/hangout/guide-modal-shell";
import { ROLLI_SESSION_GUIDE_CONTENT } from "@/lib/hangout/guide-content";

type RolliGuideModalProps = {
  open: boolean;
  nickname: string;
  onClose: () => void;
};

export function RolliGuideModal({ open, nickname, onClose }: RolliGuideModalProps) {
  const content = ROLLI_SESSION_GUIDE_CONTENT;

  return (
    <GuideModalShell
      open={open}
      onClose={onClose}
      titleId="rolli-guide-title"
      title={content.title}
      centerTitle
      bodyClassName="px-8 pb-8 sm:px-10 sm:pb-9"
      panelClassName="w-[min(100%,26rem)]"
    >
      <div className="space-y-5">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
            <GuideBulletList items={section.bullets} className="mt-2.5" />
          </section>
        ))}

        <div className="border-t border-black/6 pt-5">
          <p className="text-xs text-muted">Your nickname</p>
          <p className="mt-1 text-sm font-medium text-ink">{nickname}</p>
        </div>
      </div>
    </GuideModalShell>
  );
}
