"use client";

import { useParams } from "next/navigation";

import { RevealAmbientAudio } from "@/components/hangout/reveal-ambient-audio";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { shouldPlayRevealAmbientMusic } from "@/lib/hangout/reveal-audio";

export default function HangoutSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { displayHangout } = useDisplayHangout(slug);

  const status = displayHangout?.status;
  const revealMusicActive = shouldPlayRevealAmbientMusic(status);
  const revealMusicPreparing = status === "developing";

  return (
    <>
      <RevealAmbientAudio
        active={revealMusicActive}
        preparing={revealMusicPreparing}
      />
      {children}
    </>
  );
}
