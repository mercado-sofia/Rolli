"use client";

import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

export type AppSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type AppSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const labelId = useId();

  const selectedOption = options.find((option) => option.value === value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  function handleSelect(option: AppSelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    close();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        id={labelId}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-[52px] w-full items-center justify-between gap-3 rounded-2xl border px-4",
          "text-left text-base transition-[border-color,box-shadow,background-color] duration-200",
          "outline-none focus-visible:border-pink-highlight/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-pink-highlight/10",
          disabled
            ? "cursor-not-allowed border-black/6 bg-[#F5F5F5] text-muted"
            : open
              ? "border-pink-highlight/40 bg-white ring-4 ring-pink-highlight/10"
              : "border-black/8 bg-[#FAFAFA] hover:bg-white",
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            selectedOption ? "font-medium text-ink" : "text-muted/80",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-pink-muted transition-transform duration-200",
            open && "rotate-180 text-pink-highlight",
          )}
          aria-hidden
        />
      </button>

      {open && !disabled ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className={cn(
            "absolute z-50 mt-2 max-h-56 w-full overflow-y-auto overscroll-contain",
            "rounded-2xl border border-container-border bg-white py-1.5 shadow-soft",
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center px-4 py-3 text-left text-sm transition-colors",
                    option.disabled
                      ? "cursor-not-allowed text-muted/50"
                      : "text-ink hover:bg-pink/15 active:bg-pink/20",
                    isSelected && !option.disabled && "bg-pink/10 font-medium",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
