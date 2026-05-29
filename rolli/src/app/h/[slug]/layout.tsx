"use client";

import { useParams } from "next/navigation";

import { RevealAmbientAudio } from "@/components/hangout/reveal-ambient-audio";
import { useDisplayHangout } from "@/hooks/use-display-hangout";
import { shouldPlayRevealAmbientMusic } from "@/lib/hangout/reveal-ambient-audio-controller";

export default function HangoutSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { displayHangout } = useDisplayHangout(slug);

  const revealMusicActive = shouldPlayRevealAmbientMusic(
    displayHangout?.status,
    displayHangout?.revealCountdownAt,
  );

  return (
    <>
      <RevealAmbientAudio active={revealMusicActive} />
      {children}
    </>
  );
}
