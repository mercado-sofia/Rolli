import { GradientIconContainer } from "@/components/ui/gradient-icon-container";
import {
  LandingIcon,
  PERFECT_FOR_ICONS,
} from "@/components/landing/landing-icons";

const useCases = [
  {
    icon: PERFECT_FOR_ICONS.birthdays,
    strokeClass: "text-lavender-deep",
    title: "Birthdays",
    description:
      "Everyone captures the night — no one knows who took what until the reveal.",
  },
  {
    icon: PERFECT_FOR_ICONS.nightsOut,
    strokeClass: "text-pink-accent",
    title: "Nights out",
    description:
      "Candid moments from every angle, without phones dominating the table.",
  },
  {
    icon: PERFECT_FOR_ICONS.trips,
    strokeClass: "text-lavender-deep",
    title: "Trips & weekends",
    description:
      "One shared roll for the whole crew. Memories develop when you're ready.",
  },
] as const;

export function LandingPerfectFor() {
  return (
    <section
      id="perfect-for"
      className="scroll-mt-14 border-t border-lavender/50 bg-white px-5 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-xl text-center md:max-w-2xl">
          <p className="text-sm font-medium text-muted">Perfect for</p>
          <h2 className="font-display mt-2 text-3xl text-ink md:text-4xl">
            Any hangout worth remembering
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3 md:gap-6">
          {useCases.map((item) => (
            <article
              key={item.title}
              className="flex flex-col items-center rounded-3xl border border-lavender/60 bg-canvas/60 p-8 text-center md:p-10"
            >
              <GradientIconContainer size="lg">
                <LandingIcon
                  icon={item.icon}
                  size={28}
                  className={item.strokeClass}
                />
              </GradientIconContainer>
              <h3 className="font-display mt-5 text-xl text-ink">{item.title}</h3>
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
