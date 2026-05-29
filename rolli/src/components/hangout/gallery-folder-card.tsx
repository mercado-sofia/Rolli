"use client";

import { LuFolder } from "react-icons/lu";

import { LANDING_ICON_CLASS } from "@/components/landing/landing-icons";
import type { GalleryPastelTheme } from "@/lib/hangout/gallery-colors";
import { cn } from "@/lib/utils";

type GalleryFolderCardProps = {
  nickname: string;
  realName?: string;
  theme: GalleryPastelTheme;
  selected?: boolean;
  onSelect: () => void;
};

export function GalleryFolderCard({
  nickname,
  realName,
  theme,
  selected = false,
  onSelect,
}: GalleryFolderCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex aspect-square w-full flex-col items-center justify-center rounded-3xl border-2 px-4 py-6 text-center transition-[border-color,box-shadow] duration-200",
        selected
          ? "border-(--gallery-accent) shadow-[0_12px_32px_rgba(26,26,26,0.08)]"
          : "border-transparent hover:border-(--gallery-accent) hover:shadow-[0_12px_32px_rgba(26,26,26,0.08)]",
      )}
      style={
        {
          "--gallery-accent": theme.accent,
          backgroundColor: theme.background,
        } as React.CSSProperties
      }
    >
      <LuFolder
        size={44}
        className={cn(LANDING_ICON_CLASS, "shrink-0")}
        style={{ color: theme.accent }}
        aria-hidden
      />
      <p className="mt-4 line-clamp-2 text-base font-semibold text-ink">{nickname}</p>
      {realName ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{realName}</p>
      ) : null}
    </button>
  );
}
