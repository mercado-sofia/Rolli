"use client";

import { type MouseEvent, type SyntheticEvent, useCallback, useEffect, useRef } from "react";

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
