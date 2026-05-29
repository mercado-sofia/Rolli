/** Full-viewport loading indicator on small screens; hidden on md+ where skeletons are shown. */
export function MobileLoadingSpinner() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center md:hidden"
      aria-live="polite"
      aria-busy="true"
      role="status"
      aria-label="Loading"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-highlight/25 border-t-pink-highlight" />
    </div>
  );
}
