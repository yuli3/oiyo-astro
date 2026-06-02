"use client";

import { useEffect } from "react";

/**
 * Component to mark body as loaded after hydration
 * Prevents FOUC (Flash of Unstyled Content) on Safari and mobile browsers
 */
export function BodyLoaded() {
  useEffect(() => {
    // Mark body as loaded after hydration
    document.body.classList.add("loaded");
  }, []);

  return null;
}
