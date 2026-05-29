"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import {
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import type { RevealPhoto } from "@/types/reveal";

type RevealPhotoCarouselProps = {
  photos: RevealPhoto[];
  perspectiveLabel: string;
};

const SWIPE_OFFSET_THRESHOLD_PX = 48;
const SWIPE_VELOCITY_THRESHOLD = 380;

const SLIDE_TRANSITION = {
  x: { type: "spring", stiffness: 340, damping: 34, mass: 0.85 },
} as const;

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? "72%" : "-72%",
  }),
  center: {
    x: 0,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-72%" : "72%",
  }),
};

export function RevealPhotoCarousel({
  photos,
  perspectiveLabel,
}: RevealPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const current = photos[index];
  const prev = index > 0 ? photos[index - 1] : null;
  const next = index < photos.length - 1 ? photos[index + 1] : null;
  const canGoPrev = index > 0;
  const canGoNext = index < photos.length - 1;

  const measureDragLimit = useCallback(() => {
    const width = viewportRef.current?.offsetWidth ?? 0;
    setDragLimit(Math.max(80, width * 0.38));
  }, []);

  useEffect(() => {
    measureDragLimit();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(measureDragLimit);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measureDragLimit]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setDirection(1);
    setIndex((i) => i + 1);
  }, [canGoNext]);

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [canGoPrev]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipedNext =
        offset.x <= -SWIPE_OFFSET_THRESHOLD_PX ||
        velocity.x <= -SWIPE_VELOCITY_THRESHOLD;
      const swipedPrev =
        offset.x >= SWIPE_OFFSET_THRESHOLD_PX ||
        velocity.x >= SWIPE_VELOCITY_THRESHOLD;

      if (swipedNext && canGoNext) goNext();
      else if (swipedPrev && canGoPrev) goPrev();
    },
    [canGoNext, canGoPrev, goNext, goPrev],
  );

  if (!current) return null;

  const dragEnabled = photos.length > 1 && !prefersReducedMotion;

  return (
    <div
      className="touch-manipulation select-none"
      aria-roledescription="carousel"
      aria-label={`Photos from ${perspectiveLabel}`}
    >
      <div
        ref={viewportRef}
        className="relative mx-auto aspect-5/6 w-full max-w-sm max-h-[min(48dvh,22rem)] overflow-hidden"
      >
        {prev ? (
          <PeekPhotoCard
            photo={prev}
            perspectiveLabel={perspectiveLabel}
            side="left"
          />
        ) : null}
        {next ? (
          <PeekPhotoCard
            photo={next}
            perspectiveLabel={perspectiveLabel}
            side="right"
          />
        ) : null}

        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={current.id}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : SLIDE_TRANSITION
            }
            drag={dragEnabled ? "x" : false}
            dragConstraints={{
              left: canGoNext ? -dragLimit : 0,
              right: canGoPrev ? dragLimit : 0,
            }}
            dragElastic={0.14}
            dragMomentum={false}
            onDragEnd={dragEnabled ? handleDragEnd : undefined}
            className="absolute inset-0 z-10 flex cursor-grab items-center justify-center active:cursor-grabbing"
            style={{ touchAction: dragEnabled ? "pan-y" : undefined }}
          >
            <PhotoCard
              photo={current}
              perspectiveLabel={perspectiveLabel}
              className="h-full w-[86%] shadow-soft"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {photos.length > 1 ? (
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <div className="flex justify-center gap-1.5" aria-hidden>
            {photos.map((photo, dotIndex) => (
              <span
                key={photo.id}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out",
                  dotIndex === index
                    ? "w-5 bg-pink-highlight"
                    : "w-1.5 bg-lavender-deep/35",
                )}
              />
            ))}
          </div>
          <p className="text-xs tabular-nums text-muted">
            {index + 1} of {photos.length}
            <span className="sr-only"> — swipe to see more</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PeekPhotoCard({
  photo,
  perspectiveLabel,
  side,
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  side: "left" | "right";
}) {
  return (
    <PhotoCard
      photo={photo}
      perspectiveLabel={perspectiveLabel}
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 z-0 h-[90%] w-[70%] -translate-y-1/2 opacity-75 shadow-md",
        side === "left" &&
          "left-0 translate-x-[-6%] -rotate-6 origin-bottom-right",
        side === "right" &&
          "right-0 translate-x-[6%] rotate-6 origin-bottom-left",
      )}
    />
  );
}

function PhotoCard({
  photo,
  perspectiveLabel,
  className,
  ...rest
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  className?: string;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-container-border/60 bg-[#F8F8F8]",
        className,
      )}
      {...rest}
    >
      {photo.signedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.signedUrl}
          alt={`Memory from ${perspectiveLabel}`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full min-h-48 items-center justify-center text-xs text-muted">
          Unavailable
        </div>
      )}
    </div>
  );
}
