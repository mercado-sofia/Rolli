"use client";

import { GuideModal } from "@/components/hangout/guide-modal";
import { GuideStepsCarousel } from "@/components/hangout/guide-steps-carousel";
import { GUIDE_STEPS } from "@/lib/constants";

type RolliGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RolliGuideModal({ open, onClose }: RolliGuideModalProps) {
  const steps = GUIDE_STEPS.map((step) => ({
    icon: step.icon,
    title: step.title,
    heading: step.heading,
    description: step.description,
    tip: step.tip,
  }));

  return (
    <GuideModal open={open} title="Guide for rolli" onClose={onClose}>
      <p className="mb-4 text-center text-sm leading-relaxed text-muted">
        How hangouts, reveals, and guessing work from start to finish.
      </p>
      <GuideStepsCarousel steps={steps} variant="rolli" />
    </GuideModal>
  );
}
