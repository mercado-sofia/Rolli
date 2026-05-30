"use client";

import {
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { IoClose } from "react-icons/io5";

import { SESSION_GUIDE_CONTENT, ROLLI_SESSION_GUIDE_CONTENT } from "@/lib/hangout/setup";
import { cn } from "@/lib/utils";

export function useGuideDialog(open: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const requestClose = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleDialogClose() {
    onClose();
  }

  function handleCancel(event: SyntheticEvent) {
    event.preventDefault();
    requestClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  }

  return {
    dialogRef,
    requestClose,
    handleDialogClose,
    handleCancel,
    handleBackdropClick,
  };
}

type GuideBulletListProps = {
  items: readonly string[];
  className?: string;
};

export function GuideBulletList({ items, className }: GuideBulletListProps) {
  return (
    <ul className={cn("space-y-4", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-left text-sm leading-relaxed text-ink">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-highlight"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function GuideModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      className={cn(
        "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full",
        "border border-black/8 bg-white text-ink",
        "outline-none transition-colors hover:bg-black/5 active:scale-95",
      )}
      aria-label="Close"
    >
      <IoClose size={20} aria-hidden />
    </button>
  );
}

type GuideModalShellProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
  /** Horizontal padding for body (and footer). */
  bodyClassName?: string;
  /** Center title in the panel; close button floats over the corner. */
  centerTitle?: boolean;
  /** Top-right × control — off when footer has a dismiss CTA (e.g. session start guide). */
  showHeaderClose?: boolean;
};

export function GuideModalShell({
  open,
  onClose,
  titleId,
  title,
  children,
  footer,
  panelClassName,
  bodyClassName,
  centerTitle = false,
  showHeaderClose = true,
}: GuideModalShellProps) {
  const { dialogRef, requestClose, handleDialogClose, handleCancel } =
    useGuideDialog(open, onClose);

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  function handleBackdropLayerClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "confirm-flow-dialog m-0 h-dvh max-h-dvh w-full max-w-none overflow-hidden",
        "border-0 bg-transparent p-0 shadow-none",
        "backdrop:bg-black/45 supports-[height:100dvh]:h-dvh",
      )}
      aria-labelledby={titleId}
      onClose={handleDialogClose}
      onCancel={handleCancel}
    >
      {/* Full-viewport layer — dialog itself only sizes to content, so flex centering must live here */}
      <div
        className="flex h-full min-h-0 w-full items-center justify-center p-4 sm:p-6"
        onClick={handleBackdropLayerClick}
      >
        <div
          role="document"
          className={cn(
            "relative flex max-h-[min(88dvh,36rem)] w-[min(100%,24rem)] flex-col overflow-hidden",
            "rounded-3xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.2)]",
            panelClassName,
          )}
          onClick={handlePanelClick}
        >
          {showHeaderClose ? (
            <GuideModalCloseButton onClose={requestClose} />
          ) : null}

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-5 pt-5 sm:pt-6",
              bodyClassName ?? "px-5 sm:px-6",
            )}
          >
            <h2
              id={titleId}
              className={cn(
                "font-display text-xl leading-snug text-ink",
                centerTitle && "text-center",
                showHeaderClose && !centerTitle && "pr-10",
              )}
            >
              {title}
            </h2>
            <div className="mt-4">{children}</div>
          </div>

          {footer ? (
            <div
              className={cn(
                "shrink-0 border-t border-black/6 py-4",
                bodyClassName ?? "px-5 sm:px-6",
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

type SessionGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SessionGuideModal({ open, onClose }: SessionGuideModalProps) {
  const content = SESSION_GUIDE_CONTENT;

  return (
    <GuideModalShell
      open={open}
      onClose={onClose}
      showHeaderClose={false}
      centerTitle
      titleId="session-guide-title"
      title={content.title}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold",
            "border border-ink bg-ink text-white hover:bg-[#2a2a2a] active:scale-[0.98]",
          )}
        >
          {content.primaryLabel}
        </button>
      }
    >
      <GuideBulletList items={content.bullets} />
    </GuideModalShell>
  );
}

export function RolliGuideContent({ nickname }: { nickname: string }) {
  const content = ROLLI_SESSION_GUIDE_CONTENT;

  return (
    <div className="space-y-5">
      {content.sections.map((section) => (
        <section key={section.title}>
          <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
          <GuideBulletList items={section.bullets} className="mt-2.5" />
        </section>
      ))}

      <div className="border-t border-black/6 pt-5">
        <p className="text-xs text-muted">Your nickname</p>
        <p className="mt-1 text-sm font-medium text-ink">{nickname}</p>
      </div>
    </div>
  );
}

type RolliGuideModalProps = {
  open: boolean;
  nickname: string;
  onClose: () => void;
};

export function RolliGuideModal({ open, nickname, onClose }: RolliGuideModalProps) {
  const content = ROLLI_SESSION_GUIDE_CONTENT;

  return (
    <GuideModalShell
      open={open}
      onClose={onClose}
      titleId="rolli-guide-title"
      title={content.title}
      centerTitle
      bodyClassName="px-8 pb-8 sm:px-10 sm:pb-9"
      panelClassName="w-[min(100%,26rem)]"
    >
      <RolliGuideContent nickname={nickname} />
    </GuideModalShell>
  );
}
