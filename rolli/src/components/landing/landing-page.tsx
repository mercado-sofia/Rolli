import { LandingContact } from "@/components/landing/landing-contact";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingGuide } from "@/components/landing/landing-guide";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingPerfectFor } from "@/components/landing/landing-perfect-for";

export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-canvas text-ink supports-[height:100dvh]:min-h-dvh">
      <LandingNavbar />
      <LandingHero />
      <LandingGuide />
      <LandingPerfectFor />
      <LandingContact />
      <LandingFooter />
    </div>
  );
}
