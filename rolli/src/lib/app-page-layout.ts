/** Horizontal inset for footer / primary buttons (wider — less side padding). */
export const APP_ACTION_INSET_X = "inset-x-3 sm:inset-x-4";

/** Horizontal inset for headers, forms, and cards (narrower — more side padding). */
export const APP_CONTENT_INSET_X = "inset-x-7 sm:inset-x-8";

/** Extra margin on flow content inside MobileShell (pairs with shell px-4). */
export const APP_CONTENT_MARGIN_X = "mx-3 sm:mx-4";

/** Vertical shell padding for app pages on mobile vs larger screens. */
export const APP_SHELL_PY = "py-6 sm:py-8";

/** Primary CTA at the bottom of app / setup flows */
export const APP_PRIMARY_BUTTON_CLASS = "h-[54px] w-full max-w-md";

/** White (#FFF) app container surface with 2px --pink border */
export const APP_CONTAINER_SURFACE = "border-2 border-pink bg-white";

/** Rounded app page container (cards, dialogs) */
export const APP_CONTAINER_CLASS = `${APP_CONTAINER_SURFACE} rounded-3xl`;

/** White container with neutral border (e.g. waiting room) */
export const APP_CONTAINER_SURFACE_NEUTRAL = "border-2 border-black/8 bg-white";

export const APP_CONTAINER_CLASS_NEUTRAL = `${APP_CONTAINER_SURFACE_NEUTRAL} rounded-3xl`;
