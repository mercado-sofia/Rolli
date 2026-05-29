"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type TouchEvent, useRef, useState } from "react";

import { GuideSlideIcon } from "@/components/landing/landing-icons";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GuideSlideIconKey } from "@/lib/constants";

export type GuideCarouselStep = {
  icon?: GuideSlideIconKey;
  title: string;
  heading?: string;
  description: string;
  tip?: string;
};

type GuideStepsCarouselProps = {
  steps: readonly GuideCarouselStep[];
  /** Show gradient hero card with icon (Rolli guide). Default simple text slides. */
  variant?: "rolli" | "simple";
  className?: string;
};

export function GuideStepsCarousel({
  steps,
  variant = "simple",
  className,
}: GuideStepsCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const step = steps[index];

  function goNext() {
    setIndex((current) => (current + 1) % steps.length);
  }

  function goPrev() {
    setIndex((current) => (current - 1 + steps.length) % steps.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    const swipeThreshold = 40;

    if (deltaX <= -swipeThreshold) goNext();
    if (deltaX >= swipeThreshold) goPrev();

    touchStartX.current = null;
  }

  if (variant === "rolli" && step.icon) {
    return (
      <div
        className={cn("flex flex-col gap-4", className)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Card
          gradient
          className="relative min-h-[220px] overflow-hidden shadow-soft sm:min-h-[260px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="flex h-full flex-col justify-center gap-4 px-6 py-8 text-left"
            >
              <div className="flex items-center gap-3">
                <GuideSlideIcon iconKey={step.icon} size={36} />
                <span className="text-[11px] font-semibold uppercase tracking-overline text-white/90">
                  Step {index + 1}
                </span>
              </div>
              <p className="font-display text-xl leading-snug text-white">
                {step.heading ?? step.title}
              </p>
              <p className="text-sm leading-relaxed text-white/90">
                {step.description}
              </p>
              {step.tip ? (
                <p className="text-sm leading-relaxed text-white/75">{step.tip}</p>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {steps.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/40",
                )}
                aria-hidden
              />
            ))}
          </div>
        </Card>

        <CarouselControls
          index={index}
          total={steps.length}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-4", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-container-border bg-canvas/80 px-4 py-5 text-center"
        >
          <p className="font-display text-lg leading-snug text-ink">{step.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
        </motion.div>
      </AnimatePresence>

      <CarouselControls
        index={index}
        total={steps.length}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
}

function CarouselControls({
  index,
  total,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-container-border bg-white text-ink transition-colors hover:bg-canvas"
        aria-label="Previous tip"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <p className="text-center text-sm tabular-nums text-muted">
        {index + 1} of {total}
      </p>

      <button
        type="button"
        onClick={onNext}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-container-border bg-white text-ink transition-colors hover:bg-canvas"
        aria-label="Next tip"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
