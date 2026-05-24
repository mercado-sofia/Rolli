import { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type GlassPanelProps = ComponentPropsWithoutRef<"div">;

export function GlassPanel({
  children,
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-4xl border border-white/30 bg-white/20 p-6 backdrop-blur-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
