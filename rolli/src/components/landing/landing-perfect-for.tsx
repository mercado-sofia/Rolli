import { GradientIconContainer } from "@/components/ui/gradient-icon-container";
import {
  LandingIcon,
  PERFECT_FOR_ICONS,
} from "@/components/landing/landing-icons";

const useCases = [
  {
    icon: PERFECT_FOR_ICONS.birthdays,
    strokeClass: "text-[#FBA2C2]",
    title: "Birthdays",
    description:
      "Everyone captures the night — no one knows who took what until the reveal.",
  },
  {
    icon: PERFECT_FOR_ICONS.nightsOut,
    strokeClass: "text-[#FBA2C2]",
    title: "Nights out",
    description:
      "Candid moments from every angle, without phones dominating the table.",
  },
  {
    icon: PERFECT_FOR_ICONS.trips,
    strokeClass: "text-[#FBA2C2]",
    title: "Trips & weekends",
    description:
      "One shared roll for the whole crew. Memories develop when you're ready.",
  },
] as const;

export function LandingPerfectFor() {
  return (
    <section
      id="perfect-for"
      className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top,0))] overflow-x-hidden border-t border-lavender/50 bg-white px-5 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-xl text-center md:max-w-2xl">
          <p className="text-sm font-medium text-muted">Perfect for</p>
          <h2 className="font-display mt-2 text-3xl text-ink md:text-4xl">
            Any <span style={{ color: "#FBA2C2" }}>hangout</span> worth remembering
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3 md:gap-6">
          {useCases.map((item) => (
            <article
              key={item.title}
              className="group flex flex-col items-center rounded-3xl border border-lavender bg-white p-8 text-center transition-all duration-300 ease-out hover:-translate-y-2 hover:border-lavender-deep/40 hover:bg-white hover:shadow-glow md:p-10"
            >
              <GradientIconContainer size="lg">
                <LandingIcon
                  icon={item.icon}
                  size={28}
                  className={item.strokeClass}
                />
              </GradientIconContainer>
              <h3 className="font-display mt-5 text-xl text-ink transition-colors duration-300 group-hover:text-pink-accent">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
