import { Mail } from "lucide-react";

import { LANDING_CONTACT } from "@/lib/constants";

export function LandingContact() {
  const { email } = LANDING_CONTACT;
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent("Rolli inquiry")}`;

  return (
    <section
      id="contact"
      className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top,0px))] border-t border-lavender/50 bg-canvas px-5 py-14 md:py-20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-muted">Contact</p>
        <h2 className="font-display mt-2 text-2xl text-ink md:text-3xl">
          Questions? Reach out anytime.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">
          If you have feedback, partnership ideas, or need help with Rolli, I&apos;d love to hear
          from you.
        </p>

        <a
          href={mailtoHref}
          className="mt-8 inline-flex max-w-full items-center gap-2.5 break-all rounded-full border border-lavender bg-white px-6 py-3 text-sm font-medium text-ink shadow-soft transition-colors hover:border-lavender-deep/40 hover:text-pink-accent"
        >
          <Mail className="h-4 w-4 shrink-0 text-lavender-deep" aria-hidden />
          {email}
        </a>
      </div>
    </section>
  );
}
