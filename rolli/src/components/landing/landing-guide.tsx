"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type TouchEvent, useRef, useState } from "react";

import { GuideSlideIcon } from "@/components/landing/landing-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GUIDE_SLIDES } from "@/lib/constants";

const GUIDE_DETAILS = [
  {
    heading: "Start your shared roll",
    description:
      "Invite friends, pick your vibe, and let everyone add moments without overthinking angles or perfect poses.",
    tip: "Focus on candid moments and real reactions.",
  },
  {
    heading: "Keep photos hidden during the hangout",
    description:
      "Every shot stays private while the hangout is active, so people stay present instead of checking the gallery.",
    tip: "No peeking, no pressure. Just enjoy the event.",
  },
  {
    heading: "Reveal and relive together",
    description:
      "When the hangout ends, the full roll appears at once and everyone gets the same surprise reveal experience.",
    tip: "Use the reveal as your group recap moment.",
  },
] as const;

export function LandingGuide() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = GUIDE_SLIDES[index];
  const details = GUIDE_DETAILS[index];
  const isLast = index === GUIDE_SLIDES.length - 1;

  function goNext() {
    setIndex((current) => (current + 1) % GUIDE_SLIDES.length);
  }

  function goPrev() {
    setIndex(
      (current) => (current - 1 + GUIDE_SLIDES.length) % GUIDE_SLIDES.length,
    );
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

  return (
    <section
      id="guide"
      className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top,0))] overflow-x-hidden bg-canvas px-5 py-16 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:gap-14">
        <div className="relative mx-auto max-w-xl overflow-visible text-center md:max-w-2xl">
          <p className="text-sm font-medium text-muted">Guide for rolli</p>
          <h2 className="font-display mt-2 text-3xl text-ink md:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
            Three simple steps before the memories roll in.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:items-stretch md:gap-8">
          <div className="order-2 flex flex-col gap-5 rounded-3xl border border-lavender/50 bg-white/70 p-6 shadow-soft md:order-1 md:p-7">
            <div>
              <p className="text-sm font-medium text-muted">Step {index + 1}</p>
              <p className="font-display mt-2 text-xl leading-snug text-ink">
                {slide.title}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-lavender/40 bg-white/80 text-ink transition-colors hover:bg-white"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <p className="text-center text-sm text-muted">
                {index + 1} of {GUIDE_SLIDES.length}
              </p>

              <button
                type="button"
                onClick={goNext}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-lavender/40 bg-white/80 text-ink transition-colors hover:bg-white"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Button
              href="/start"
              className="h-13 self-center px-8 bg-gradient-pastel shadow-glow md:max-w-[240px]"
            >
              {isLast ? "Continue to Start" : "Start a hangout"}
            </Button>
          </div>

          <div
            className="order-1 md:order-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Card gradient className="relative min-h-[min(340px,62dvh)] overflow-hidden md:min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.title}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="flex h-full flex-col justify-center gap-6 px-7 pt-12 pb-16 text-left md:px-10"
                >
                  <div className="flex items-center gap-3">
                    <GuideSlideIcon iconKey={slide.icon} size={42} />
                    <span className="text-sm font-semibold uppercase tracking-overline text-white/90">
                      Detailed guide
                    </span>
                  </div>

                  <p className="font-display text-2xl leading-snug text-white md:text-3xl">
                    {details.heading}
                  </p>

                  <p className="max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
                    {details.description}
                  </p>

                  <p className="text-sm leading-relaxed text-white/80">
                    {details.tip}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2">
                {GUIDE_SLIDES.map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className={`h-2 rounded-full transition-all ${
                      dotIndex === index ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
