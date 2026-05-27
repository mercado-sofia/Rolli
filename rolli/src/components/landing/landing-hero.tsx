"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const polaroids = [
  { rotate: "-9deg", top: "2%", left: "-6%", bg: "#fce4ec", emoji: "🌸", label: "sakura walk" },
  { rotate: "7deg", top: "0%", right: "-8%", bg: "#ede7f6", emoji: "✨", label: "night out" },
  { rotate: "-5deg", top: "48%", left: "-10%", bg: "#f8bbd0", emoji: "🎉", label: "birthday!!" },
  { rotate: "8deg", top: "46%", right: "-9%", bg: "#e8eaf6", emoji: "🍦", label: "summer" },
  { rotate: "-6deg", bottom: "2%", left: "-4%", bg: "#fce4ec", emoji: "🌙", label: "late night" },
  { rotate: "5deg", bottom: "0%", right: "-5%", bg: "#ede7f6", emoji: "🎶", label: "live music" },
];

function PolaroidCard({
  polaroid,
  index,
}: {
  polaroid: (typeof polaroids)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: polaroid.rotate }}
      animate={{ opacity: 1, scale: 1, rotate: polaroid.rotate }}
      transition={{
        delay: 0.3 + index * 0.07,
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="absolute z-10"
      style={{ top: polaroid.top, bottom: polaroid.bottom, left: polaroid.left, right: polaroid.right }}
    >
      <div
        className="rounded-sm bg-white p-2.5 pb-7"
        style={{ boxShadow: "0 8px 24px rgba(180,120,160,0.18), 0 2px 8px rgba(0,0,0,0.07)", width: "80px" }}
      >
        <div
          className="flex h-16 w-full items-center justify-center rounded-[2px] text-2xl"
          style={{ background: polaroid.bg }}
        >
          {polaroid.emoji}
        </div>
        <p className="mt-1.5 text-center text-[8px] leading-tight text-pink-accent/70">
          {polaroid.label}
        </p>
      </div>
    </motion.div>
  );
}

export function LandingHero() {
  return (
    <MobileShell ambient={false} className="justify-center px-10 py-12">
      {/* Extra ambient orbs */}
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-pink/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-lavender-deep/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-10 left-1/4 h-48 w-48 rounded-full bg-pink/20 blur-3xl" aria-hidden />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: "radial-gradient(circle, rgba(185,147,214,0.25) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col items-center justify-center gap-8"
      >
        {/* Hero card with polaroids */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
        >
          {polaroids.map((p, i) => (
            <PolaroidCard key={i} polaroid={p} index={i} />
          ))}

          {/* Glass card */}
          <div
            className="relative z-20 overflow-hidden rounded-[32px] border border-white/70 bg-white/65 backdrop-blur-2xl"
            style={{ boxShadow: "0 32px 80px rgba(185,147,214,0.22), 0 8px 24px rgba(200,100,150,0.10), inset 0 1px 0 rgba(255,255,255,0.9)" }}
          >
            {/* Badge */}
            <div className="flex justify-center pt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-lavender-deep/30 bg-gradient-pastel px-4 py-1.5 text-[10px] font-semibold uppercase tracking-overline text-white/90 shadow-glow">
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                Anonymous until reveal
              </span>
            </div>

            {/* Gradient hero panel — purple → pink pastel */}
            <div
              className="relative mx-5 mt-5 mb-5 overflow-hidden rounded-3xl"
              style={{
                aspectRatio: "4/3",
                boxShadow: "0 12px 40px rgba(220,100,140,0.35)",
                backgroundImage: "url('/images/card.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Soft highlight */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 40%, transparent 70%)",
                }}
              />
              {/* Hero copy */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/70 bg-white/60 shadow-soft">
                  <Image
                    src="/images/rolli-logo.png"
                    alt="Rolli logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-[13px] font-semibold uppercase tracking-overline text-pink-accent/80">
                  Disposable camera
                </p>
                <h1 className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1.5 text-[16px] font-normal leading-none tracking-tight text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />  
                  {APP_NAME}
                </h1>
              </div>
            </div>

          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center gap-4 pt-1"
        >
          <p className="mx-auto max-w-[280px] text-center text-sm leading-relaxed text-ink mb-2">
            Capture memories anonymously. Reveal them only when the hangout ends.
          </p>
          <Button
            href="/start"
            className="h-[54px] bg-gradient-pastel text-[15px] shadow-glow active:scale-[0.98]"
          >
            Start a hangout
          </Button>
          <Link
            href="/guide"
            className="text-sm text-muted underline decoration-muted/50 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/40"
          >
            Quick guide
          </Link>
        </motion.div>
      </motion.div>
    </MobileShell>
  );
}