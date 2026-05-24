"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { Button } from "@/components/ui/button";
import { captureMemory } from "@/lib/photos";
import type { Participant } from "@/types/participant";

type CameraCaptureProps = {
  hangoutId: string;
  sessionToken: string;
  photosRemaining: number;
  onCaptured: (participant: Participant) => void;
};

type CameraPhase = "idle" | "opening" | "ready" | "capturing";

export function CameraCapture({
  hangoutId,
  sessionToken,
  photosRemaining,
  onCaptured,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<CameraPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const isDisabled = photosRemaining <= 0 || phase === "capturing";

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

    setError(null);
    setPhase("opening");

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

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

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
      window.setTimeout(() => setFlash(false), 180);

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
      stopCamera();
    };
  }, [stopCamera]);

  if (phase === "idle") {
    return (
      <>
        {error && <p className="text-center text-sm text-pink">{error}</p>}
        <Button type="button" disabled={isDisabled} onClick={openCamera}>
          {photosRemaining <= 0 ? "No photos left" : "Capture memory"}
        </Button>
      </>
    );
  }

  return (
    <CaptureViewfinder
      videoRef={videoRef}
      error={error}
      flash={flash}
      isCapturing={phase === "capturing"}
      isOpening={phase === "opening"}
      onCancel={closeCamera}
      onCapture={takePhoto}
    />
  );
}

function CaptureViewfinder({
  videoRef,
  error,
  flash,
  isCapturing,
  isOpening,
  onCancel,
  onCapture,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  error: string | null;
  flash: boolean;
  isCapturing: boolean;
  isOpening: boolean;
  onCancel: () => void;
  onCapture: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-ink">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {flash && <FlashOverlay />}
        {isOpening && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40 text-sm text-white">
            Opening camera…
          </div>
        )}
      </div>
      {error && <p className="text-center text-sm text-pink">{error}</p>}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={isCapturing}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isOpening || isCapturing}
          onClick={onCapture}
        >
          {isCapturing ? "Saving…" : "Take photo"}
        </Button>
      </div>
    </div>
  );
}

function FlashOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 animate-pulse bg-white/70" />
  );
}
