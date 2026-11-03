// Fires a GA4 gtag custom event (test_completed / share_click / ontology_export).
// gtag.js is loaded inline in Layout.astro (G-915L6V38X6) — this only guards
// against SSR (no window) and ad-blocked/not-yet-loaded gtag, never throws.
//
// 2026-11-03: every event name sent on this page load is remembered so the
// page-level funnel fallback (gaEventOnce) never doubles an event a component
// already fired itself. Only 11 of ~127 questionnaire components fire
// test_started/test_completed, so the rest had no funnel at all
// (company-brain design/oiyo-uiux-seo-aieo-plan-2026-11-03.md).
const FIRED_KEY = "__oiyoFiredEvents";

function firedEvents(): Set<string> | undefined {
  if (typeof window === "undefined" || !window) return undefined;
  const holder = window as unknown as Record<string, Set<string> | undefined>;
  holder[FIRED_KEY] ??= new Set<string>();
  return holder[FIRED_KEY];
}

export function gaEvent(name: string, params?: Record<string, string>): void {
  if (typeof window === "undefined" || !window) return;
  firedEvents()?.add(name);
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, params);
}

/** Fires only if no event of this name was sent on this page load yet. */
export function gaEventOnce(name: string, params?: Record<string, string>): void {
  const fired = firedEvents();
  if (!fired || fired.has(name)) return;
  gaEvent(name, params);
}
