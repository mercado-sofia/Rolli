"use client";

import {
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import type { RevealPhoto } from "@/types/reveal";

type RevealPhotoCarouselProps = {
  photos: RevealPhoto[];
  perspectiveLabel: string;
};

const SWIPE_OFFSET = 72;
const SWIPE_VELOCITY_THRESHOLD = 420;
const EXIT_OFFSET = 320;

const SNAP_SPRING = {
  type: "spring" as const,
  stiffness: 560,
  damping: 44,
  mass: 0.5,
};

const EXIT_TRANSITION = { duration: 0.24, ease: "easeIn" as const };

export function RevealPhotoCarousel({
  photos,
  perspectiveLabel,
}: RevealPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 0, 180], [-12, 0, 12]);
  const prefersReducedMotion = useReducedMotion();

  const advance = useCallback(
    async (direction: "next" | "prev") => {
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

      const exitX = direction === "next" ? -EXIT_OFFSET : EXIT_OFFSET;
      await animate(x, exitX, EXIT_TRANSITION);
      x.set(0);
      setIndex((current) =>
        direction === "next" ? current + 1 : current - 1,
      );
      setIsAnimating(false);
    },
    [index, isAnimating, photos.length, prefersReducedMotion, x],
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

      const { offset, velocity } = info;
      const swipedNext =
        offset.x <= -SWIPE_OFFSET ||
        velocity.x <= -SWIPE_VELOCITY_THRESHOLD;
      const swipedPrev =
        offset.x >= SWIPE_OFFSET ||
        velocity.x >= SWIPE_VELOCITY_THRESHOLD;

      if (swipedNext && index < photos.length - 1) {
        void advance("next");
        return;
      }

      if (swipedPrev && index > 0) {
        void advance("prev");
        return;
      }

      snapBack();
    },
    [advance, index, isAnimating, photos.length, snapBack],
  );

  if (photos.length === 0) return null;

  const dragEnabled = photos.length > 1 && !prefersReducedMotion && !isAnimating;
  const currentPhoto = photos[index];
  const prevPhoto = index > 0 ? photos[index - 1] : null;
  const nextPhoto =
    index < photos.length - 1 ? photos[index + 1] : null;

  return (
    <div
      className="touch-manipulation select-none"
      aria-roledescription="carousel"
      aria-label={`Photos from ${perspectiveLabel}`}
    >
      <div className="relative mx-auto w-full max-w-76 px-5 sm:max-w-80 sm:px-6">
        <div className="relative aspect-3/4 w-full">
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
              "absolute inset-0 z-10",
              dragEnabled && "cursor-grab active:cursor-grabbing",
            )}
            style={{ x, rotate }}
            drag={dragEnabled ? "x" : false}
            dragConstraints={{ left: -240, right: 240 }}
            dragElastic={0.18}
            dragMomentum={false}
            whileDrag={{ scale: 1.02 }}
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
        "pointer-events-none absolute inset-0 z-0 scale-[0.92] opacity-90",
        isLeft
          ? "translate-x-[-15%] rotate-[-8deg] origin-bottom-right"
          : "translate-x-[15%] rotate-[8deg] origin-bottom-left",
      )}
      aria-hidden
    >
      <RevealPhotoCard
        photo={photo}
        perspectiveLabel={perspectiveLabel}
        className="shadow-[0_16px_40px_rgba(26,26,26,0.08)]"
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
