import { cn } from "@/lib/utils";

/** Horizontal padding for the app page shell (MobileShell variant="app") */
export const APP_SHELL_PADDING_X = "px-3.5 sm:px-5 md:px-7";

/** Horizontal padding for footer / primary buttons (tighter than main content) */
export const APP_ACTION_PADDING_X = "px-2 sm:px-3 md:px-4";

/** Pull setup footers past inner content padding so CTAs read wider than the body */
export const SETUP_FLOW_FOOTER_BLEED_X = "-mx-4 sm:-mx-7 md:-mx-8";

/** Horizontal padding for headers, forms, and cards */
export const APP_CONTENT_PADDING_X = "px-4 sm:px-7 md:px-8";

/** @deprecated Use APP_ACTION_PADDING_X — inset-* only applies to positioned elements */
export const APP_ACTION_INSET_X = APP_ACTION_PADDING_X;

/** @deprecated Use APP_CONTENT_PADDING_X */
export const APP_CONTENT_INSET_X = APP_CONTENT_PADDING_X;

/** Extra margin on flow content inside MobileShell (pairs with APP_SHELL_PADDING_X). */
export const APP_CONTENT_MARGIN_X = "mx-0 min-w-0 sm:mx-1 md:mx-0";

/** Bottom safe-area padding for scrollable app shells */
export const APP_SAFE_BOTTOM = "pb-[max(1.5rem,env(safe-area-inset-bottom))]";

/** Vertical shell padding for app pages */
export const APP_SHELL_PY = "pt-6 sm:pt-8 md:pt-9";

/** Max width of the app page column (MobileShell inner) */
export const APP_SHELL_MAX_WIDTH =
  "max-w-md md:max-w-[28rem] lg:max-w-[34rem]";

/** Wider shell for multi-step setup flows on desktop */
export const APP_SETUP_SHELL_MAX_WIDTH =
  "max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl";

/** Max width for centered hints / footer actions in setup flows */
export const APP_ACTION_MAX_WIDTH = "mx-auto w-full max-w-md md:max-w-lg";

/** Outer MobileShell classes for setup / wizard pages */
export const SETUP_FLOW_SHELL_CLASS = cn(
  APP_SETUP_SHELL_MAX_WIDTH,
  "flex min-h-dvh max-h-dvh flex-col overflow-hidden py-0! supports-[height:100dvh]:min-h-dvh supports-[height:100dvh]:max-h-dvh",
  "md:h-auto md:max-h-none md:min-h-[calc(100dvh-3rem)] md:overflow-visible",
  "lg:min-h-[calc(100dvh-4rem)]",
);

/** Inner column wrapping header, main, and footer */
export const SETUP_FLOW_INNER_CLASS = cn(
  "flex min-h-0 flex-1 flex-col",
  APP_CONTENT_PADDING_X,
  "pt-[max(1.5rem,env(safe-area-inset-top))] sm:pt-6 md:pt-8",
  "pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-8",
);

export const SETUP_FLOW_HEADER_CLASS = "shrink-0 md:mb-8";

export const SETUP_FLOW_HEADER_COMPACT_CLASS = "shrink-0 md:mb-6";

export const SETUP_FLOW_MAIN_CLASS = cn(
  "flex min-h-0 flex-1 flex-col",
  "overflow-y-auto overscroll-y-contain md:overflow-visible",
);

/** Vertically center short content between header and footer */
export const SETUP_FLOW_MAIN_CENTER_CLASS =
  "justify-center md:pb-[4dvh]";

/** Keep content under the header (e.g. waiting room) */
export const SETUP_FLOW_MAIN_UPPER_CLASS = "justify-start";

export const SETUP_FLOW_MAIN_INNER_CLASS = "w-full py-2 md:py-4";

export const SETUP_FLOW_FOOTER_CLASS = cn(
  "shrink-0 border-t border-container-border/60 pt-4 md:pt-5",
  SETUP_FLOW_FOOTER_BLEED_X,
  APP_ACTION_PADDING_X,
);

export const SETUP_FLOW_FOOTER_INNER_CLASS =
  "flex flex-col items-center gap-4 md:gap-5";

export const SETUP_FLOW_FOOTER_HINT_CLASS = cn(
  APP_ACTION_MAX_WIDTH,
  "text-center text-sm leading-relaxed text-muted md:text-base",
);

/** Two-up choice cards (start page, etc.) */
export const APP_CHOICE_GRID_CLASS =
  "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6";

/** Centered single-column forms inside a wide setup shell */
export const APP_SETUP_FORM_MAX_WIDTH = "mx-auto w-full max-w-lg lg:max-w-xl";

/** Raised panel on tablet+ so app pages read as a card on wide screens */
export const APP_SHELL_DESKTOP_FRAME =
  "md:rounded-[1.75rem] md:border md:border-container-border md:bg-white md:shadow-soft";

/** Vertical inset on desktop — panel floats on the canvas */
export const APP_SHELL_DESKTOP_INSET = "md:my-6 lg:my-8";

/** Default vertical gap between sections on scrollable app pages */
export const APP_PAGE_STACK_GAP = "gap-6 md:gap-8";

/** Primary CTA at the bottom of app / setup flows */
export const APP_PRIMARY_BUTTON_CLASS = "h-[54px] w-full";

/** Multi-column photo grids (gallery, etc.) */
export const APP_PHOTO_GRID_CLASS =
  "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4";

/** White (#FFF) app container with 1px #FFEDF5 border */
export const APP_CONTAINER_SURFACE = "border border-container-border bg-white";

/** Rounded app page container (cards, dialogs) */
export const APP_CONTAINER_CLASS = `${APP_CONTAINER_SURFACE} rounded-3xl`;

/** Same border as default — waiting room and other neutral cards */
export const APP_CONTAINER_SURFACE_NEUTRAL = APP_CONTAINER_SURFACE;

export const APP_CONTAINER_CLASS_NEUTRAL = `${APP_CONTAINER_SURFACE_NEUTRAL} rounded-3xl`;
