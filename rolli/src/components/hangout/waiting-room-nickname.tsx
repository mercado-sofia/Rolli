"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type WaitingRoomNicknameProps = {
  nickname: string;
};

export function WaitingRoomNickname({ nickname }: WaitingRoomNicknameProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted">Your nickname</dt>
      <dd className="max-w-[60%] text-right">
        {visible ? (
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-medium wrap-break-word text-ink">{nickname}</span>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="text-xs font-medium text-muted underline underline-offset-2 transition-colors hover:text-ink"
            >
              Hide nickname
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setVisible(true)}
            className={cn(
              "inline-flex min-h-10 items-center justify-center rounded-full border border-black/8",
              "bg-[#FAFAFA] px-4 text-sm font-medium text-ink",
              "transition-colors hover:border-pink-highlight/30 hover:bg-white",
            )}
          >
            Show nickname
          </button>
        )}
      </dd>
    </div>
  );
}
