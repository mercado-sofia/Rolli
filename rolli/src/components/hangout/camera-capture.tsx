"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { LuCamera } from "react-icons/lu";

import { AppBackButton } from "@/components/ui/app-back-button";
import { captureMemory } from "@/lib/hangout/photos";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types/participant";

type CameraCaptureProps = {
  hangoutId: string;
  sessionToken: string;
  photosTaken: number;
  maxPhotos: number;
  onCaptured: (participant: Participant) => void;
};

type CameraPhase = "idle" | "opening" | "ready" | "capturing";

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function subscribeToClientMount() {
  return () => {};
}

function getClientMountSnapshot() {
  return true;
}

function getServerMountSnapshot() {
  return false;
}

export function CameraCapture({
  hangoutId,
  sessionToken,
  photosTaken,
  maxPhotos,
  onCaptured,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<CameraPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientMountSnapshot,
    getServerMountSnapshot,
  );

  const photosRemaining = maxPhotos - photosTaken;
  const isDisabled = photosRemaining <= 0 || phase === "capturing";
  const isOverlayOpen = phase !== "idle";

  useEffect(() => {
    if (!isOverlayOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOverlayOpen]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setPhase("idle");
    setError(null);
  }, [stopCamera]);

  const openCamera = useCallback(async () => {
    if (photosRemaining <= 0) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported on this device.");
      return;
    }

    setError(null);
    setPhase("opening");

    await waitForNextFrame();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error("Camera not ready");
      }

      video.srcObject = stream;
      await video.play();
      setPhase("ready");
    } catch {
      stopCamera();
      setPhase("idle");
      setError("Camera access denied. Allow camera permission and try again.");
    }
  }, [photosRemaining, stopCamera]);

  const takePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video || phase !== "ready") return;

    setPhase("capturing");
    setError(null);

    try {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        throw new Error("Camera not ready");
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not capture frame");
      }

      context.drawImage(video, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Could not encode photo"));
          },
          "image/jpeg",
          0.92,
        );
      });

      const { data, error: captureError } = await captureMemory({
        hangoutId,
        sessionToken,
        file: blob,
      });

      if (captureError || !data) {
        throw new Error(captureError ?? "Could not save photo");
      }

      setFlash(true);
      if (flashTimeoutRef.current) {
        window.clearTimeout(flashTimeoutRef.current);
      }
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlash(false);
        flashTimeoutRef.current = null;
      }, 180);

      onCaptured(data.participant);
      stopCamera();
      setPhase("idle");
    } catch (captureErr) {
      setPhase("ready");
      setError(
        captureErr instanceof Error
          ? captureErr.message
          : "Could not capture memory",
      );
    }
  }, [hangoutId, onCaptured, phase, sessionToken, stopCamera]);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        window.clearTimeout(flashTimeoutRef.current);
      }
      stopCamera();
    };
  }, [stopCamera]);

  const overlay =
    mounted && isOverlayOpen
      ? createPortal(
          <CaptureOverlay
            videoRef={videoRef}
            photosTaken={photosTaken}
            maxPhotos={maxPhotos}
            error={error}
            flash={flash}
            isCapturing={phase === "capturing"}
            isOpening={phase === "opening"}
            onClose={closeCamera}
            onCapture={() => void takePhoto()}
          />,
          document.body,
        )
      : null;

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {error && !isOverlayOpen && (
          <p className="text-center text-sm text-pink-accent">{error}</p>
        )}
        <CameraTriggerButton
          disabled={isDisabled}
          onClick={() => void openCamera()}
          aria-label={
            photosRemaining <= 0 ? "No photos left" : "Capture memory"
          }
        />
      </div>
      {overlay}
    </>
  );
}

function CameraAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-pink/15 blur-3xl" />
      <div className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-pink-highlight/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/3 rounded-full bg-lavender/25 blur-3xl" />
    </div>
  );
}

function CameraTriggerButton({
  disabled,
  onClick,
  "aria-label": ariaLabel,
  size = "md",
}: {
  disabled?: boolean;
  onClick: () => void;
  "aria-label": string;
  size?: "md" | "lg";
}) {
  const dimensions = size === "lg" ? "h-20 w-20" : "h-18 w-18";
  const iconSize = size === "lg" ? 36 : 34;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex shrink-0 rounded-full border border-lavender-deep/25 bg-gradient-pastel p-px shadow-soft",
        "transition-transform hover:scale-[1.03] active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100",
        dimensions,
      )}
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-white",
          size === "lg" && "shadow-glow",
        )}
      >
        <LuCamera
          size={iconSize}
          strokeWidth={1.75}
          className="text-pink-accent"
          aria-hidden
        />
      </span>
    </button>
  );
}

function ShutterButton({
  disabled,
  isCapturing,
  onClick,
}: {
  disabled?: boolean;
  isCapturing?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={isCapturing ? "Saving photo" : "Take photo"}
      className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-full",
        "border-2 border-lavender-deep/35 bg-white shadow-glow",
        "transition-transform hover:scale-[1.03] active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        isCapturing && "animate-pulse",
      )}
    >
      <span className="sr-only">{isCapturing ? "Saving…" : "Take photo"}</span>
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-pastel transition-all",
          isCapturing ? "h-8 w-8" : "h-13 w-13",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "rounded-full border-2 border-white/90 bg-white",
            isCapturing ? "h-3 w-3" : "h-11 w-11",
          )}
        />
      </span>
    </button>
  );
}

function CaptureOverlay({
  videoRef,
  photosTaken,
  maxPhotos,
  error,
  flash,
  isCapturing,
  isOpening,
  onClose,
  onCapture,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  photosTaken: number;
  maxPhotos: number;
  error: string | null;
  flash: boolean;
  isCapturing: boolean;
  isOpening: boolean;
  onClose: () => void;
  onCapture: () => void;
}) {
  const shutterDisabled = isOpening || isCapturing;

  return (
    <div
      className="fixed inset-0 z-200 flex flex-col overflow-hidden bg-canvas text-ink"
      role="dialog"
      aria-modal="true"
      aria-label="Capture memory"
    >
      <CameraAmbientBackground />

      <header
        className={cn(
          "relative z-10 flex shrink-0 flex-col items-center gap-1 px-4 pb-3",
          "pt-[max(0.75rem,env(safe-area-inset-top))]",
        )}
      >
        <div className="flex w-full max-w-md items-center justify-between gap-4">
          <AppBackButton onBack={onClose} backLabel="Close camera" />
          <div className="h-9 w-9" aria-hidden />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-overline text-pink-muted">
          Capture memory
        </p>
        <p className="font-display text-3xl tabular-nums tracking-tight text-pink-highlight">
          {photosTaken}/{maxPhotos}
        </p>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-2">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-container-border bg-white shadow-soft">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full bg-ink object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-pink/10 via-transparent to-lavender/15"
            aria-hidden
          />
          {flash && <FlashOverlay />}
          {isOpening && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-lavender/50 backdrop-blur-[2px]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
              <p className="text-sm font-medium text-pink-accent">
                Opening camera…
              </p>
            </div>
          )}
        </div>
      </div>

      <footer
        className={cn(
          "relative z-10 flex shrink-0 flex-col items-center gap-3",
          "border-t border-container-border/60 bg-white/95 px-4 pt-5 backdrop-blur-sm",
          "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        )}
      >
        {error && (
          <p className="max-w-sm rounded-2xl bg-pink/10 px-4 py-2 text-center text-sm text-pink-accent">
            {error}
          </p>
        )}
        <ShutterButton
          disabled={shutterDisabled}
          isCapturing={isCapturing}
          onClick={onCapture}
        />
      </footer>
    </div>
  );
}

function FlashOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 animate-pulse bg-linear-to-br from-white/80 via-pink/30 to-lavender/20" />
  );
}
