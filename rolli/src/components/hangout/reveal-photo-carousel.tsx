"use client";

import {
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { RevealPhoto } from "@/types/reveal";

type RevealPhotoCarouselProps = {
  photos: RevealPhoto[];
  perspectiveLabel: string;
};

const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_VELOCITY_THRESHOLD = 180;

const SNAP_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.55,
};

const EXIT_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.5,
};

export function RevealPhotoCarousel({
  photos,
  perspectiveLabel,
}: RevealPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const [deckWidth, setDeckWidth] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-160, 0, 160], [-3.5, 0, 3.5]);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    const measure = () => setDeckWidth(deck.offsetWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(deck);
    return () => observer.disconnect();
  }, []);

  const advance = useCallback(
    async (direction: "next" | "prev", releaseVelocity = 0) => {
      if (isAnimating) return;

      const canNext = direction === "next" && index < photos.length - 1;
      const canPrev = direction === "prev" && index > 0;
      if (!canNext && !canPrev) return;

      setIsAnimating(true);

      if (prefersReducedMotion) {
        setIndex((current) =>
          direction === "next" ? current + 1 : current - 1,
        );
        x.set(0);
        setIsAnimating(false);
        return;
      }

      const width = deckWidth || deckRef.current?.offsetWidth || 300;
      const exitX =
        direction === "next"
          ? -(width + 48)
          : width + 48;
      const velocityBoost = Math.min(Math.abs(releaseVelocity) * 0.08, 120);
      const targetExit =
        exitX + (direction === "next" ? -velocityBoost : velocityBoost);

      await animate(x, targetExit, {
        ...EXIT_SPRING,
        velocity: releaseVelocity,
      });

      const enterFrom = direction === "next" ? width * 0.12 : -width * 0.12;
      x.set(enterFrom);
      setIndex((current) =>
        direction === "next" ? current + 1 : current - 1,
      );

      await animate(x, 0, SNAP_SPRING);
      setIsAnimating(false);
    },
    [deckWidth, index, isAnimating, photos.length, prefersReducedMotion, x],
  );

  const snapBack = useCallback(() => {
    if (prefersReducedMotion) {
      x.set(0);
      return;
    }
    void animate(x, 0, SNAP_SPRING);
  }, [prefersReducedMotion, x]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (isAnimating) {
        snapBack();
        return;
      }

      const width = deckWidth || deckRef.current?.offsetWidth || 300;
      const offsetThreshold = width * SWIPE_DISTANCE_RATIO;
      const { offset, velocity } = info;

      const swipedNext =
        offset.x <= -offsetThreshold ||
        velocity.x <= -SWIPE_VELOCITY_THRESHOLD;
      const swipedPrev =
        offset.x >= offsetThreshold ||
        velocity.x >= SWIPE_VELOCITY_THRESHOLD;

      if (swipedNext && index < photos.length - 1) {
        void advance("next", velocity.x);
        return;
      }

      if (swipedPrev && index > 0) {
        void advance("prev", velocity.x);
        return;
      }

      snapBack();
    },
    [advance, deckWidth, index, isAnimating, photos.length, snapBack],
  );

  if (photos.length === 0) return null;

  const dragEnabled = photos.length > 1 && !prefersReducedMotion && !isAnimating;
  const currentPhoto = photos[index];
  const prevPhoto = index > 0 ? photos[index - 1] : null;
  const nextPhoto =
    index < photos.length - 1 ? photos[index + 1] : null;
  const dragLimit = Math.max(deckWidth * 0.45, 120);

  return (
    <div
      className="w-full min-w-0 shrink-0 touch-manipulation select-none"
      aria-roledescription="carousel"
      aria-label={`Photos from ${perspectiveLabel}`}
    >
      <div className="relative mx-auto w-full max-w-76 px-5 sm:max-w-80 sm:px-6">
        <div
          ref={deckRef}
          className="relative aspect-3/4 w-full min-h-48 overflow-visible"
        >
          {prevPhoto ? (
            <StackPeekCard
              photo={prevPhoto}
              perspectiveLabel={perspectiveLabel}
              side="left"
            />
          ) : null}

          {nextPhoto ? (
            <StackPeekCard
              photo={nextPhoto}
              perspectiveLabel={perspectiveLabel}
              side="right"
            />
          ) : null}

          <motion.div
            className={cn(
              "absolute inset-0 z-10 touch-none",
              dragEnabled && "cursor-grab active:cursor-grabbing",
            )}
            style={{ x, rotate, touchAction: dragEnabled ? "none" : "auto" }}
            drag={dragEnabled ? "x" : false}
            dragConstraints={{ left: -dragLimit, right: dragLimit }}
            dragElastic={0.35}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 28 }}
            onDragEnd={dragEnabled ? handleDragEnd : undefined}
          >
            <RevealPhotoCard
              photo={currentPhoto}
              perspectiveLabel={perspectiveLabel}
              priority
              className="shadow-soft"
            />
          </motion.div>
        </div>
      </div>

      {photos.length > 1 ? (
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div className="flex justify-center gap-1.5" aria-hidden>
            {photos.map((photo, dotIndex) => (
              <span
                key={photo.id}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out",
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

function StackPeekCard({
  photo,
  perspectiveLabel,
  side,
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  side: "left" | "right";
}) {
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 scale-[0.97] opacity-80",
        isLeft
          ? "translate-x-[-6%] rotate-[-2.5deg]"
          : "translate-x-[6%] rotate-[2.5deg]",
      )}
      aria-hidden
    >
      <RevealPhotoCard
        photo={photo}
        perspectiveLabel={perspectiveLabel}
        className="shadow-[0_12px_32px_rgba(26,26,26,0.06)]"
      />
    </div>
  );
}

function RevealPhotoCard({
  photo,
  perspectiveLabel,
  priority = false,
  className,
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden rounded-[1.75rem]",
        className,
      )}
    >
      {photo.signedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.signedUrl}
          alt={`Memory from ${perspectiveLabel}`}
          className="h-full w-full object-cover select-none pointer-events-none"
          draggable={false}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted">
          Unavailable
        </div>
      )}
    </div>
  );
}
