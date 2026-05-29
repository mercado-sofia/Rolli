"use client";

import {
  animate,
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import type { RevealPhoto } from "@/types/reveal";

type RevealPhotoCarouselProps = {
  photos: RevealPhoto[];
  perspectiveLabel: string;
};

const SWIPE_OFFSET_RATIO = 0.14;
const SWIPE_VELOCITY_THRESHOLD = 320;

const SNAP_SPRING = {
  type: "spring" as const,
  stiffness: 560,
  damping: 44,
  mass: 0.5,
};

export function RevealPhotoCarousel({
  photos,
  perspectiveLabel,
}: RevealPhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const x = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const measureSlideWidth = useCallback(() => {
    const width = viewportRef.current?.offsetWidth ?? 0;
    setSlideWidth(width);
  }, []);

  useLayoutEffect(() => {
    measureSlideWidth();
  }, [measureSlideWidth]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(measureSlideWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measureSlideWidth]);

  useEffect(() => {
    if (slideWidth === 0) return;

    const target = -index * slideWidth;
    if (prefersReducedMotion) {
      x.set(target);
      return;
    }

    void animate(x, target, SNAP_SPRING);
  }, [index, prefersReducedMotion, slideWidth, x]);

  const snapBack = useCallback(() => {
    if (slideWidth === 0) return;
    const target = -index * slideWidth;
    if (prefersReducedMotion) {
      x.set(target);
      return;
    }
    void animate(x, target, SNAP_SPRING);
  }, [index, prefersReducedMotion, slideWidth, x]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (slideWidth === 0) return;

      const { offset, velocity } = info;
      const offsetThreshold = slideWidth * SWIPE_OFFSET_RATIO;
      const swipedNext =
        offset.x <= -offsetThreshold ||
        velocity.x <= -SWIPE_VELOCITY_THRESHOLD;
      const swipedPrev =
        offset.x >= offsetThreshold ||
        velocity.x >= SWIPE_VELOCITY_THRESHOLD;

      if (swipedNext && index < photos.length - 1) {
        setIndex((current) => current + 1);
        return;
      }

      if (swipedPrev && index > 0) {
        setIndex((current) => current - 1);
        return;
      }

      snapBack();
    },
    [index, photos.length, slideWidth, snapBack],
  );

  if (photos.length === 0) return null;

  const dragEnabled = photos.length > 1 && !prefersReducedMotion;

  return (
    <div
      className="touch-manipulation select-none"
      aria-roledescription="carousel"
      aria-label={`Photos from ${perspectiveLabel}`}
    >
      <div
        ref={viewportRef}
        className="relative mx-auto aspect-5/6 w-full max-w-sm max-h-[min(48dvh,22rem)] overflow-hidden [contain:layout_paint]"
      >
        <motion.div
          className="flex h-full will-change-transform"
          style={{
            x,
            width: slideWidth > 0 ? slideWidth * photos.length : "100%",
            touchAction: dragEnabled ? "pan-y" : undefined,
          }}
          drag={dragEnabled ? "x" : false}
          dragConstraints={{
            left:
              slideWidth > 0 ? -((photos.length - 1) * slideWidth) : 0,
            right: 0,
          }}
          dragElastic={0.1}
          dragMomentum={false}
          dragTransition={{ power: 0.2, timeConstant: 200 }}
          onDragEnd={dragEnabled ? handleDragEnd : undefined}
        >
          {photos.map((photo, photoIndex) => (
            <CarouselSlide
              key={photo.id}
              photo={photo}
              perspectiveLabel={perspectiveLabel}
              isActive={photoIndex === index}
              isNearActive={Math.abs(photoIndex - index) <= 1}
              width={slideWidth}
            />
          ))}
        </motion.div>
      </div>

      {photos.length > 1 ? (
        <div className="mt-3 flex flex-col items-center gap-1.5">
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

function CarouselSlide({
  photo,
  perspectiveLabel,
  isActive,
  isNearActive,
  width,
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  isActive: boolean;
  isNearActive: boolean;
  width: number;
}) {
  return (
    <div
      className="flex h-full shrink-0 items-center justify-center px-[7%]"
      style={{ width: width > 0 ? width : "100%" }}
      aria-hidden={!isActive}
    >
      <PhotoCard
        photo={photo}
        perspectiveLabel={perspectiveLabel}
        priority={isNearActive}
        className={cn(
          "h-full w-full shadow-soft transition-[transform,opacity] duration-200 ease-out",
          isActive ? "scale-100 opacity-100" : "scale-[0.94] opacity-70",
        )}
      />
    </div>
  );
}

function PhotoCard({
  photo,
  perspectiveLabel,
  priority = false,
  className,
  ...rest
}: {
  photo: RevealPhoto;
  perspectiveLabel: string;
  priority?: boolean;
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
          className="pointer-events-none h-full w-full object-cover select-none"
          draggable={false}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="flex h-full min-h-48 items-center justify-center text-xs text-muted">
          Unavailable
        </div>
      )}
    </div>
  );
}
