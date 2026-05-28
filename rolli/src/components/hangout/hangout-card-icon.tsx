import type { IconType } from "react-icons";

import { LANDING_ICON_CLASS } from "@/components/landing/landing-icons";
import { GradientIconContainer } from "@/components/ui/gradient-icon-container";
import { cn } from "@/lib/utils";

type HangoutCardIconProps = {
  icon: IconType;
};

export function HangoutCardIcon({ icon: Icon }: HangoutCardIconProps) {
  return (
    <div className="flex justify-center">
      <GradientIconContainer size="lg">
        <Icon
          size={32}
          className={cn(LANDING_ICON_CLASS, "text-pink-accent")}
          aria-hidden
        />
      </GradientIconContainer>
    </div>
  );
}
