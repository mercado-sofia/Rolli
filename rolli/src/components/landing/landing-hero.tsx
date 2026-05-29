"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { PUBLIC_ASSETS } from "@/lib/constants";
import { PolaroidCard, polaroids } from "@/components/landing/polaroid-card";

const mobilePolaroids = [
  { ...polaroids[0], left: "-6%" },
  { ...polaroids[1], right: "-10%" },
  { ...polaroids[2], left: "-8%" },
  { ...polaroids[3], right: "-12%" },
  { ...polaroids[4], left: "2%" },
  { ...polaroids[5], right: "-4%" },
];

function MobileHeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[clamp(200px,34dvh,280px)] w-full max-w-[min(300px,88vw)] shrink-0"
    >
      {mobilePolaroids.map((p, i) => (
        <PolaroidCard key={i} polaroid={p} index={i} size="xs" />
      ))}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative size-[clamp(9rem,26dvh,12rem)] -translate-y-3 overflow-hidden rounded-full border border-white/75 bg-white/85 shadow-soft backdrop-blur-sm sm:-translate-y-4">
          <Image
            src={PUBLIC_ASSETS.images.logo}
            alt="Rolli logo"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

function DesktopPolaroidPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[460px] w-full max-w-md md:-mt-3 lg:-mt-2"
    >
      {polaroids.map((p, i) => (
        <PolaroidCard key={i} polaroid={p} index={i} size="lg" />
      ))}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative h-72 w-72 overflow-hidden rounded-full border border-white/75 bg-white/85 shadow-soft backdrop-blur-sm">
          <Image
            src={PUBLIC_ASSETS.images.logo}
            alt="Rolli logo"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}

function HeroBackgroundEllipses({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: mobile ? "220px" : "882px",
          height: mobile ? "196px" : "784px",
          backgroundColor: "#FFF2FA",
          left: mobile ? "-56px" : "-85px",
          top: mobile ? "210px" : "334px",
          filter: mobile ? "blur(34px)" : undefined,
          opacity: mobile ? 0.9 : 1,
        }}
        animate={{ x: [0, 20, -10, 0], y: [0, -16, 10, 0], scale: [1, 1.02, 0.99, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: mobile ? "190px" : "722px",
          height: mobile ? "168px" : "644px",
          backgroundColor: "#FFE1F4",
          left: mobile ? "-48px" : "-85px",
          top: mobile ? "330px" : "540px",
          filter: mobile ? "blur(32px)" : undefined,
          opacity: mobile ? 0.88 : 1,
        }}
        animate={{ x: [0, -18, 12, 0], y: [0, 14, -12, 0], scale: [1, 0.98, 1.02, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: mobile ? "124px" : "324px",
          height: mobile ? "118px" : "308px",
          backgroundColor: "#FFE1F4",
          right: mobile ? "-26px" : "-100px",
          bottom: mobile ? "-24px" : "-140px",
          filter: mobile ? "blur(26px)" : undefined,
          opacity: mobile ? 0.9 : 1,
        }}
        animate={{ x: [0, -24, 8, 0], y: [0, -10, 14, 0], scale: [1, 1.03, 0.98, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function LandingHero() {
  return (
    <section
      id="hero"
      className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top,0))] overflow-x-hidden"
    >
      {/* Mobile hero — full viewport height; content clears fixed navbar inside */}
      <div className="relative h-dvh min-h-dvh overflow-hidden supports-[height:100svh]:h-svh supports-[height:100svh]:min-h-svh md:hidden">
        <HeroBackgroundEllipses mobile />
        <MobileShell
          ambient={false}
          fillViewport={false}
          backgroundClassName="bg-white"
          className="flex h-full min-h-full flex-col justify-between gap-3 px-5 pt-(--navbar-total-height) pb-[max(2.25rem,calc(env(safe-area-inset-bottom)+1rem))] sm:px-8 sm:pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+1.5rem))]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(185,147,214,0.25) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(0.75rem,2.5dvh,1.5rem)]"
          >
            <MobileHeroCard />

            <div className="mx-auto mt-[clamp(1.25rem,3.5dvh,2rem)] max-w-xs shrink-0 text-center">
              <h1 className="font-display text-[clamp(1.25rem,4.5dvh,1.5rem)] leading-tight tracking-tight text-ink">
                Capture <span style={{ color: "#FBA2C2" }}>memories</span> anonymously.
              </h1>
              <p className="mt-1.5 text-[clamp(0.8125rem,2.2dvh,0.875rem)] leading-relaxed text-pink-muted/80">
                Reveal them only when the hangout ends.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full shrink-0 flex-col items-center pt-1"
          >
            <Button
              href="/start"
              className="h-[54px] w-full max-w-sm bg-gradient-pastel text-[15px] shadow-glow active:scale-[0.98]"
            >
              Start a hangout
            </Button>
          </motion.div>
        </MobileShell>
      </div>

      {/* Desktop hero — bg image, left copy + right polaroid */}
      <div className="relative hidden min-h-dvh overflow-hidden supports-[height:100svh]:min-h-svh md:block">
        <HeroBackgroundEllipses />

        <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-8 py-16 supports-[height:100svh]:min-h-svh lg:px-12">
          <div className="grid w-full grid-cols-2 items-center gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start gap-8 lg:gap-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-lavender-deep/30 bg-gradient-pastel px-4 py-1.5 text-[10px] font-semibold uppercase tracking-overline text-white/90 shadow-glow">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                Anonymous until reveal
              </span>

              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-overline">
                  <span className="text-pink-accent">Disposable</span>{" "}
                  <span className="text-pink-accent">camera</span>
                </p>
                <h1 className="font-display text-4xl leading-tight tracking-tight text-ink lg:text-5xl">
                  Capture <span style={{ color: "#FBA2C2" }}>memories</span> anonymously.
                </h1>
                <p className="max-w-md text-lg leading-relaxed text-pink-muted/80">
                  Reveal them only when the hangout ends.
                </p>
              </div>

              <Button
                href="/start"
                className="mt-3 h-[54px] w-auto min-w-[220px] bg-gradient-pastel px-10 text-[15px] shadow-glow active:scale-[0.98] lg:mt-4"
              >
                Start a hangout
              </Button>
            </motion.div>

            <DesktopPolaroidPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
