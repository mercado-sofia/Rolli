"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GUIDE_SLIDES } from "@/lib/constants";

export default function GuidePage() {
  const [index, setIndex] = useState(0);
  const slide = GUIDE_SLIDES[index];
  const isLast = index === GUIDE_SLIDES.length - 1;

  function goNext() {
    setIndex((current) => (current + 1) % GUIDE_SLIDES.length);
  }

  function goPrev() {
    setIndex(
      (current) =>
        (current - 1 + GUIDE_SLIDES.length) % GUIDE_SLIDES.length,
    );
  }

  return (
    <MobileShell className="justify-between gap-8">
      <div>
        <p className="text-sm font-medium text-muted">Quick Guide</p>
        <h1 className="font-display mt-2 text-3xl text-ink">How Rolli works</h1>
      </div>

      <Card gradient className="relative min-h-[420px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="flex h-full flex-col justify-center gap-6 pt-16 text-center"
          >
            <span className="text-5xl">{slide.emoji}</span>
            <p className="font-display text-2xl leading-snug">{slide.title}</p>
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

      <div className="hidden items-center justify-between md:flex">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-lavender/40 bg-white/80 text-ink"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-lavender/40 bg-white/80 text-ink"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3 md:hidden">
          <Button type="button" variant="secondary" onClick={goPrev}>
            Previous
          </Button>
          <Button type="button" onClick={goNext}>
            {isLast ? "Continue" : "Next"}
          </Button>
        </div>
        {isLast ? (
          <Button href="/start">Continue to Start</Button>
        ) : (
          <Link
            href="/start"
            className="text-center text-sm text-muted underline underline-offset-4"
          >
            Skip guide
          </Link>
        )}
      </div>
    </MobileShell>
  );
}
