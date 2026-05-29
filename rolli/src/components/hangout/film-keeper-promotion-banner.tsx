"use client";

type FilmKeeperPromotionBannerProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function FilmKeeperPromotionBanner({
  visible,
  onDismiss,
}: FilmKeeperPromotionBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="rounded-2xl border border-lavender-deep/30 bg-gradient-pastel px-4 py-3 text-center text-sm text-white"
    >
      <p>You&apos;re now the Film Keeper.</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-1 text-xs underline underline-offset-2 opacity-90"
      >
        Dismiss
      </button>
    </div>
  );
}
