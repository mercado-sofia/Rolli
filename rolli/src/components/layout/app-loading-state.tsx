import { AppScrollShell } from "@/components/layout/app-scroll-shell";

type AppLoadingStateProps = {
  message?: string;
};

export function AppLoadingState({ message = "Loading…" }: AppLoadingStateProps) {
  return (
    <AppScrollShell centered>
      <p className="text-center text-base text-muted">{message}</p>
    </AppScrollShell>
  );
}
