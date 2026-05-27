"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { APP_NAME, LANDING_NAV_SECTIONS, PUBLIC_ASSETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-lavender/50 bg-white/85 backdrop-blur-md transition-shadow duration-300",
        isScrolled && "shadow-navbar",
      )}
    >
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5 md:px-8"
        aria-label="Landing page"
      >
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="flex min-w-0 shrink-0 items-center gap-2 rounded-full transition-opacity hover:opacity-80"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-lavender/60 bg-white shadow-soft">
            <Image
              src={PUBLIC_ASSETS.images.logo}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <span className="font-display hidden truncate text-lg leading-none text-ink sm:inline">
            {APP_NAME}
          </span>
        </button>

        <ul className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {LANDING_NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="group cursor-pointer whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-medium text-ink transition-colors sm:px-3 sm:text-sm"
              >
                <span className="relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-pink after:transition-transform after:duration-300 after:content-[''] group-hover:after:scale-x-100">
                  {section.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
