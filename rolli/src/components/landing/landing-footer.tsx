import { APP_NAME } from "@/lib/constants";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex min-h-10 shrink-0 items-center justify-center bg-pink-deep px-4 py-2 sm:h-10 sm:px-5 sm:py-0">
      <p className="text-center text-[11px] text-white/90 sm:text-xs">
        © {year} {APP_NAME} · made for real hangouts
      </p>
    </footer>
  );
}
