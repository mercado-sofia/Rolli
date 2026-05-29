"use client";

import { type MouseEvent, type SyntheticEvent, useEffect, useRef } from "react";

export function useGuideDialog(open: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleDialogClose() {
    onClose();
  }

  function handleCancel(event: SyntheticEvent) {
    event.preventDefault();
    onClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  return {
    dialogRef,
    handleDialogClose,
    handleCancel,
    handleBackdropClick,
  };
}
