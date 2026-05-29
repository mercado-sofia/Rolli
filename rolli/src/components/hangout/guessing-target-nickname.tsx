"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type GuessingTargetNicknameProps = {
  nickname: string;
  className?: string;
};

export function GuessingTargetNickname({
  nickname,
  className,
}: GuessingTargetNicknameProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const updateOverflow = useCallback(() => {
    const element = textRef.current;
    if (!element) return;
    setOverflows(element.scrollWidth > element.clientWidth + 1);
  }, []);

  useLayoutEffect(() => {
    updateOverflow();
    const element = textRef.current;
    if (!element) return;

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [nickname, updateOverflow]);

  useLayoutEffect(() => {
    if (!overflows) {
      setExpanded(false);
    }
  }, [nickname, overflows]);

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex min-w-0 items-baseline">
        <span
          ref={textRef}
          className="min-w-0 overflow-hidden whitespace-nowrap font-medium text-sm leading-snug text-ink sm:text-base"
        >
          {nickname}
        </span>
        {overflows ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="shrink-0 pl-0.5 font-medium text-sm leading-snug text-ink sm:text-base"
            aria-expanded={expanded}
            aria-label={expanded ? "Hide full nickname" : "Show full nickname"}
          >
            ...
          </button>
        ) : null}
      </div>
      {expanded && overflows ? (
        <p className="mt-1 font-medium text-sm leading-snug wrap-break-word text-ink sm:text-base">
          {nickname}
        </p>
      ) : null}
    </div>
  );
}
