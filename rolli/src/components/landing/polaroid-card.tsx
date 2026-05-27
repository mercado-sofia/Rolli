"use client";

import { motion } from "framer-motion";

import { PolaroidIcon } from "@/components/landing/landing-icons";
import type { PolaroidIconKey } from "@/lib/constants";

export type Polaroid = {
  rotate: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  bg: string;
  icon: PolaroidIconKey;
  label: string;
};

export const polaroids: Polaroid[] = [
  { rotate: "-9deg", bottom: "30%", left: "-12%", bg: "#fce4ec", icon: "flower", label: "sakura walk" },
  { rotate: "7deg", top: "2%", right: "-16%", bg: "#ede7f6", icon: "sparkles", label: "night out" },
  { rotate: "-5deg", bottom: "14%", left: "-14%", bg: "#f8bbd0", icon: "party", label: "birthday!!" },
  { rotate: "8deg", top: "16%", right: "-18%", bg: "#e8eaf6", icon: "iceCream", label: "summer" },
  { rotate: "-6deg", bottom: "2%", left: "-4%", bg: "#e8eaf6", icon: "moon", label: "late night" },
  { rotate: "5deg", top: "30%", right: "-10%", bg: "#ede7f6", icon: "music", label: "live music" },
];

type PolaroidCardProps = {
  polaroid: Polaroid;
  index: number;
  size?: "xs" | "sm" | "lg";
};

export function PolaroidCard({ polaroid, index, size = "sm" }: PolaroidCardProps) {
  const isExtraSmall = size === "xs";
  const isLarge = size === "lg";

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
      style={{
        top: polaroid.top,
        bottom: polaroid.bottom,
        left: polaroid.left,
        right: polaroid.right,
      }}
    >
      <div
        className={`rounded-sm bg-white ${
          isLarge ? "p-3.5 pb-9" : isExtraSmall ? "p-2 pb-5.5" : "p-2.5 pb-7"
        }`}
        style={{
          boxShadow: "0 8px 24px rgba(180,120,160,0.18), 0 2px 8px rgba(0,0,0,0.07)",
          width: isLarge ? "104px" : isExtraSmall ? "62px" : "80px",
        }}
      >
        <div
          className={`flex w-full items-center justify-center rounded-[2px] ${
            isLarge ? "h-20" : isExtraSmall ? "h-12" : "h-16"
          }`}
          style={{ background: polaroid.bg }}
        >
          <PolaroidIcon
            iconKey={polaroid.icon}
            size={isLarge ? 28 : isExtraSmall ? 17 : 22}
          />
        </div>
        <p
          className={`mt-1.5 text-center leading-tight text-pink-accent/70 ${
            isLarge ? "text-[9px]" : isExtraSmall ? "text-[7px]" : "text-[8px]"
          }`}
        >
          {polaroid.label}
        </p>
      </div>
    </motion.div>
  );
}
