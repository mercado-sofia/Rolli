import { cn } from "@/lib/utils";

type GuideBulletListProps = {
  items: readonly string[];
  className?: string;
};

export function GuideBulletList({ items, className }: GuideBulletListProps) {
  return (
    <ul className={cn("space-y-4", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-left text-sm leading-relaxed text-ink">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
