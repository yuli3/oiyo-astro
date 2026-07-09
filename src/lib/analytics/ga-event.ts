// Fires a GA4 gtag custom event (test_completed / share_click / ontology_export).
// gtag.js is loaded inline in Layout.astro (G-915L6V38X6) — this only guards
// against SSR (no window) and ad-blocked/not-yet-loaded gtag, never throws.
export function gaEvent(name: string, params?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, params);
}
