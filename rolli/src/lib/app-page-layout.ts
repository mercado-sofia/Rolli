/** Horizontal padding for footer / primary buttons */
export const APP_ACTION_PADDING_X = "px-3 sm:px-4";

/** Horizontal padding for headers, forms, and cards */
export const APP_CONTENT_PADDING_X = "px-4 sm:px-7";

/** @deprecated Use APP_ACTION_PADDING_X — inset-* only applies to positioned elements */
export const APP_ACTION_INSET_X = APP_ACTION_PADDING_X;

/** @deprecated Use APP_CONTENT_PADDING_X */
export const APP_CONTENT_INSET_X = APP_CONTENT_PADDING_X;

/** Extra margin on flow content inside MobileShell (pairs with shell px-4). */
export const APP_CONTENT_MARGIN_X = "mx-0 min-w-0 sm:mx-1";

/** Bottom safe-area padding for scrollable app shells */
export const APP_SAFE_BOTTOM = "pb-[max(1.5rem,env(safe-area-inset-bottom))]";

/** Vertical shell padding for app pages */
export const APP_SHELL_PY = "pt-6 sm:pt-8";

/** Default vertical gap between sections on scrollable app pages */
export const APP_PAGE_STACK_GAP = "gap-6";

/** Primary CTA at the bottom of app / setup flows */
export const APP_PRIMARY_BUTTON_CLASS = "h-[54px] w-full max-w-md";

/** White (#FFF) app container with 1px #FFEDF5 border */
export const APP_CONTAINER_SURFACE = "border border-container-border bg-white";

/** Rounded app page container (cards, dialogs) */
export const APP_CONTAINER_CLASS = `${APP_CONTAINER_SURFACE} rounded-3xl`;

/** Same border as default — waiting room and other neutral cards */
export const APP_CONTAINER_SURFACE_NEUTRAL = APP_CONTAINER_SURFACE;

export const APP_CONTAINER_CLASS_NEUTRAL = `${APP_CONTAINER_SURFACE_NEUTRAL} rounded-3xl`;
