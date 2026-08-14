"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onStoreChange: () => void) {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
    return window.matchMedia(MOBILE_QUERY).matches;
}

/** Disables non-essential motion on small screens and for reduced-motion users. */
export function useLightweightMotion() {
    const isMobile = useSyncExternalStore(subscribe, getSnapshot, () => true);
    const prefersReducedMotion = useReducedMotion();

    return isMobile || Boolean(prefersReducedMotion);
}
