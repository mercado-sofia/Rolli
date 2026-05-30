"use client";

import { useCallback, useState } from "react";
import { PiSignOutBold } from "react-icons/pi";

import {
  GuideModalShell,
  RolliGuideContent,
} from "@/components/hangout/guide-modals";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useHangoutRoster } from "@/hooks/use-hangout-roster";
import { removeParticipantByKeeper } from "@/lib/hangout/hangout-api";
import { isCurrentFilmKeeper } from "@/lib/hangout/participant";
import { ROLLI_SESSION_GUIDE_CONTENT } from "@/lib/hangout/setup";
import type { Hangout } from "@/types/hangout";
import type { HangoutRosterParticipant } from "@/types/hangout-roster";
import type { Participant } from "@/types/participant";
import { cn } from "@/lib/utils";

export type HangoutMenuMode = "lobby" | "guessing";

type HangoutMenuModalProps = {
  open: boolean;
  onClose: () => void;
  mode: HangoutMenuMode;
  hangoutId: string;
  sessionToken: string;
  hangout: Hangout;
  participant: Participant;
  nickname: string;
  onHangoutUpdate: (hangout: Hangout) => void;
  onHangoutCompleted?: (hangout: Hangout) => void;
};

type MenuTab = "guide" | "participants";

function RosterRow({
  row,
  isSelf,
  canKick,
  onKick,
}: {
  row: HangoutRosterParticipant;
  isSelf: boolean;
  canKick: boolean;
  onKick: (id: string, nickname: string) => void;
}) {
  const showGuessingStatus = row.hasFinishedGuessing !== null;

  return (
    <li className="flex items-center gap-2 rounded-2xl border border-container-border bg-white px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-ink">
            {row.nickname}
            {isSelf ? (
              <span className="font-normal text-muted"> (you)</span>
            ) : null}
          </span>
          {row.isFilmKeeper ? (
            <span className="shrink-0 rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pink-highlight">
              Film Keeper
            </span>
          ) : null}
        </div>
        {showGuessingStatus ? (
          <p
            className={cn(
              "mt-1 text-xs",
              row.hasFinishedGuessing ? "text-ink" : "text-muted",
            )}
          >
            {row.hasFinishedGuessing ? "Done guessing" : "Still guessing"}
          </p>
        ) : null}
      </div>
      {canKick && !isSelf ? (
        <button
          type="button"
          onClick={() => onKick(row.id, row.nickname)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            "border border-black/8 text-ink outline-none transition-colors",
            "hover:bg-black/5 active:scale-95",
          )}
          aria-label={`Remove ${row.nickname} from hangout`}
        >
          <PiSignOutBold size={18} aria-hidden />
        </button>
      ) : null}
    </li>
  );
}

export function HangoutMenuModal({
  open,
  onClose,
  mode,
  hangoutId,
  sessionToken,
  hangout,
  participant,
  nickname,
  onHangoutUpdate,
  onHangoutCompleted,
}: HangoutMenuModalProps) {
  const [tab, setTab] = useState<MenuTab>(mode === "guessing" ? "participants" : "guide");
  const [kickTarget, setKickTarget] = useState<{
    id: string;
    nickname: string;
  } | null>(null);
  const [kicking, setKicking] = useState(false);
  const [kickError, setKickError] = useState<string | null>(null);

  const isFilmKeeper = isCurrentFilmKeeper(participant, hangout);
  const { participants, loading, error, refresh } = useHangoutRoster({
    hangoutId,
    sessionToken,
    enabled: open,
  });

  const activeTab = mode === "guessing" ? "participants" : tab;
  const modalTitle =
    mode === "guessing"
      ? "Participants"
      : activeTab === "guide"
        ? ROLLI_SESSION_GUIDE_CONTENT.title
        : "Participants";

  const handleKickRequest = useCallback((id: string, targetNickname: string) => {
    setKickError(null);
    setKickTarget({ id, nickname: targetNickname });
  }, []);

  const handleCancelKick = useCallback(() => {
    if (kicking) return;
    setKickTarget(null);
    setKickError(null);
  }, [kicking]);

  const handleConfirmKick = useCallback(async () => {
    if (!kickTarget) return;

    setKicking(true);
    setKickError(null);

    const { data, error: removeError } = await removeParticipantByKeeper(
      hangoutId,
      sessionToken,
      kickTarget.id,
    );

    setKicking(false);

    if (removeError || !data) {
      setKickError(removeError ?? "Could not remove participant");
      return;
    }

    setKickTarget(null);
    onHangoutUpdate(data);

    if (data.status === "completed") {
      onHangoutCompleted?.(data);
    }

    void refresh();
  }, [
    hangoutId,
    kickTarget,
    onHangoutCompleted,
    onHangoutUpdate,
    refresh,
    sessionToken,
  ]);

  return (
    <>
      <GuideModalShell
        open={open}
        onClose={onClose}
        titleId="hangout-menu-title"
        title={modalTitle}
        centerTitle
        bodyClassName="px-5 pb-6 sm:px-6"
        panelClassName="w-[min(100%,26rem)]"
      >
        {mode === "lobby" ? (
          <div
            className="mb-4 flex rounded-2xl border border-container-border bg-[#F8F8F8] p-1"
            role="tablist"
            aria-label="Hangout menu"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "guide"}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-medium transition-colors",
                activeTab === "guide"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
              onClick={() => setTab("guide")}
            >
              Rolli guide
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "participants"}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-medium transition-colors",
                activeTab === "participants"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink",
              )}
              onClick={() => setTab("participants")}
            >
              Participants
            </button>
          </div>
        ) : null}

        {activeTab === "guide" ? (
          <RolliGuideContent nickname={nickname} />
        ) : (
          <div className="space-y-3">
            {loading && participants.length === 0 ? (
              <p className="text-center text-sm text-muted">Loading participants…</p>
            ) : null}
            {error ? (
              <p className="text-center text-sm text-pink">{error}</p>
            ) : null}
            {!loading && !error && participants.length === 0 ? (
              <p className="text-center text-sm text-muted">No one in the room yet.</p>
            ) : null}
            {participants.length > 0 ? (
              <ul className="space-y-2">
                {participants.map((row) => (
                  <RosterRow
                    key={row.id}
                    row={row}
                    isSelf={row.id === participant.id}
                    canKick={isFilmKeeper}
                    onKick={handleKickRequest}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </GuideModalShell>

      <ConfirmDialog
        open={kickTarget !== null}
        accent="pink"
        icon={
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pink/15">
            <PiSignOutBold size={36} className="text-pink-highlight" aria-hidden />
          </span>
        }
        title={kickTarget ? `Remove ${kickTarget.nickname}?` : "Remove participant?"}
        description={
          <>
            They will be removed from this hangout and will not block the room. They
            can rejoin with the invite link if the hangout is still open.
          </>
        }
        confirmLabel="Yes, remove"
        cancelLabel="Cancel"
        loading={kicking}
        error={kickError}
        dismissible={!kicking}
        onConfirm={() => void handleConfirmKick()}
        onCancel={handleCancelKick}
      />
    </>
  );
}
