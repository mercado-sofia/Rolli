"use client";

import {
  animate,
  motion,
  type MotionValue,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import type { RevealPhoto } from "@/types/reveal";

type RevealPhotoCarouselProps = {
  photos: RevealPhoto[];
  perspectiveLabel: string;
};

const SWIPE_DISTANCE_RATIO = 0.18;
const SWIPE_VELOCITY_THRESHOLD = 200;

const SNAP_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 42,
  mass: 0.42,
};

const EXIT_SPRING = {
  type: "spring" as const,
  stiffness: 560,
  damping: 44,
  mass: 0.38,
};

function useAdjacentCardMotion(
  x: MotionValue<number>,
  deckWidth: number,
  direction: "next" | "prev",
) {
  const peekOffset = deckWidth > 0 ? deckWidth * 0.06 : 0;
  const travel = deckWidth > 0 ? deckWidth : 1;
  const isNext = direction === "next";

  const inputRange = isNext ? [0, -travel] : [0, travel];
  const xOutputRange = isNext ? [peekOffset, 0] : [-peekOffset, 0];
  const rotateOutputRange = isNext ? [2.5, 0] : [-2.5, 0];

  const slideX = useTransform(x, inputRange, xOutputRange);
  const scale = useTransform(x, inputRange, [0.96, 1]);
  const rotate = useTransform(x, inputRange, rotateOutputRange);
  const opacity = useTransform(
    x,
    isNext ? [0, -travel * 0.35, -travel] : [0, travel * 0.35, travel],
    [0.78, 0.9, 1],
  );

  return { slideX, scale, rotate, opacity };
}

export function RevealPhotoCarousel({
  photos,
  perspectiveLabel,
}: RevealPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const [deckWidth, setDeckWidth] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-160, 0, 160], [-4, 0, 4]);
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

  const commitIndex = useCallback(
    (direction: "next" | "prev") => {
      flushSync(() => {
        setIndex((current) =>
          direction === "next" ? current + 1 : current - 1,
        );
      });
      x.set(0);
    },
    [x],
  );

  const advance = useCallback(
    async (direction: "next" | "prev", releaseVelocity = 0) => {
      if (isAnimating) return;

      const canNext = direction === "next" && index < photos.length - 1;
      const canPrev = direction === "prev" && index > 0;
      if (!canNext && !canPrev) return;

      setIsAnimating(true);

      if (prefersReducedMotion) {
        commitIndex(direction);
        setIsAnimating(false);
        return;
      }

      const width = deckWidth || deckRef.current?.offsetWidth || 300;
      const exitX = direction === "next" ? -width : width;
      const currentX = x.get();
      const alreadyPastExit =
        direction === "next"
          ? currentX <= exitX * 0.55
          : currentX >= exitX * 0.55;

      if (!alreadyPastExit) {
        await animate(x, exitX, {
          ...EXIT_SPRING,
          velocity: releaseVelocity,
        });
      }

      commitIndex(direction);
      setIsAnimating(false);
    },
    [commitIndex, deckWidth, index, isAnimating, photos.length, prefersReducedMotion, x],
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
      const dragX = x.get();
      const { velocity } = info;

      const swipedNext =
        dragX <= -offsetThreshold ||
        velocity.x <= -SWIPE_VELOCITY_THRESHOLD;
      const swipedPrev =
        dragX >= offsetThreshold ||
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
    [advance, deckWidth, index, isAnimating, photos.length, snapBack, x],
  );

  const currentPhoto = photos[index];
  const prevPhoto = index > 0 ? photos[index - 1] : null;
  const nextPhoto =
    index < photos.length - 1 ? photos[index + 1] : null;

  const nextMotion = useAdjacentCardMotion(x, deckWidth, "next");
  const prevMotion = useAdjacentCardMotion(x, deckWidth, "prev");

  useEffect(() => {
    for (const photo of [photos[index + 1], photos[index - 1]]) {
      if (!photo?.signedUrl) continue;
      const img = new Image();
      img.src = photo.signedUrl;
    }
  }, [index, photos]);

  if (photos.length === 0) return null;

  const dragEnabled =
    photos.length > 1 && !prefersReducedMotion && !isAnimating;
  const dragLimit = Math.max(deckWidth * 0.94, 160);

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
            <AdjacentSlideCard
              key={prevPhoto.id}
              photo={prevPhoto}
              perspectiveLabel={perspectiveLabel}
              slideX={prevMotion.slideX}
              scale={prevMotion.scale}
              rotate={prevMotion.rotate}
              opacity={prevMotion.opacity}
            />
          ) : null}

          {nextPhoto ? (
            <AdjacentSlideCard
              key={nextPhoto.id}
              photo={nextPhoto}
              perspectiveLabel={perspectiveLabel}
              slideX={nextMotion.slideX}
              scale={nextMotion.scale}
              rotate={nextMotion.rotate}
              opacity={nextMotion.opacity}
            />
          ) : null}

          <motion.div
            key={currentPhoto.id}
            className={cn(
              "absolute inset-0 z-10 touch-none will-change-transform",
              dragEnabled && "cursor-grab active:cursor-grabbing",
            )}
            style={{ x, rotate, touchAction: dragEnabled ? "none" : "auto" }}
            drag={dragEnabled ? "x" : false}
            dragConstraints={{ left: -dragLimit, right: dragLimit }}
            dragElastic={0.12}
            dragMomentum={false}
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

function AdjacentSlideCard({
  photo,
  perspectiveLabel,
  slideX,
  scale,
  rotate,
  opacity,
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  slideX: MotionValue<number>;
  scale: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-5 will-change-transform"
      style={{ x: slideX, scale, rotate, opacity }}
      aria-hidden
    >
      <RevealPhotoCard
        photo={photo}
        perspectiveLabel={perspectiveLabel}
        preload
        className="shadow-[0_12px_32px_rgba(26,26,26,0.08)]"
      />
    </motion.div>
  );
}

function RevealPhotoCard({
  photo,
  perspectiveLabel,
  priority = false,
  preload = false,
  className,
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  priority?: boolean;
  preload?: boolean;
  className?: string;
}) {
  const shouldEagerLoad = priority || preload;

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
          fetchPriority={shouldEagerLoad ? "high" : "auto"}
          loading={shouldEagerLoad ? "eager" : "lazy"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted">
          Unavailable
        </div>
      )}
    </div>
  );
}
