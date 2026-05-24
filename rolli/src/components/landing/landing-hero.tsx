"use client";

import { motion } from "framer-motion";

import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function LandingHero() {
  return (
    <MobileShell className="justify-center">
      <div className="film-grain absolute inset-0 opacity-40" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative flex flex-1 flex-col justify-between gap-10"
      >
        <div className="space-y-4 pt-8">
          <p className="text-sm font-medium tracking-wide text-muted">
            disposable camera for friend groups
          </p>
          <h1 className="font-display text-5xl leading-tight text-ink">
            {APP_NAME}
          </h1>
          <p className="max-w-xs text-base leading-relaxed text-muted">
            Capture memories anonymously. Reveal them only when the hangout
            ends.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative aspect-4/5 overflow-hidden rounded-4xl bg-gradient-pastel shadow-soft"
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <p className="text-sm font-medium text-white/80">State of Mind</p>
            <div className="space-y-6">
              <h2 className="font-display text-3xl leading-tight text-white">
                How you feel right now?
              </h2>
              <div className="rounded-full border border-white/30 bg-white/20 px-6 py-3 text-center text-sm font-medium text-white backdrop-blur-md">
                Log a Mood
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3 pb-4">
          <Button href="/guide" variant="secondary">
            Quick Guide
          </Button>
          <Button href="/start">Start</Button>
        </div>
      </motion.div>
    </MobileShell>
  );
}
