"use client";

import { GuideModal } from "@/components/hangout/guide-modal";
import { GuideStepsCarousel } from "@/components/hangout/guide-steps-carousel";
import { SESSION_GUIDE_STEPS } from "@/lib/hangout/guide-content";

type SessionGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SessionGuideModal({ open, onClose }: SessionGuideModalProps) {
  return (
    <GuideModal open={open} title="Hangout session" onClose={onClose}>
      <p className="mb-4 text-center text-sm leading-relaxed text-muted">
        A quick guide while you capture memories.
      </p>
      <GuideStepsCarousel steps={SESSION_GUIDE_STEPS} variant="simple" />
    </GuideModal>
  );
}
