import { useEffect } from "react";
import { recordTestOpened } from "@/lib/user/test-achievements";
import { gaEventOnce } from "@/lib/analytics/ga-event";

// 2026-11-03: page-level test_started fallback. Most questionnaire components
// never fire test_started, so completion rate had no denominator. The first
// answer-like click (button / radio / label) inside <main> stands in for
// "first answer". It runs a tick later so a component that fires its own
// test_started in the same click wins, and gaEventOnce then skips this one.
// funnel_source='page' keeps the fallback separable from component events in GA4.
export default function TestPlayBeacon({ testId }: { testId: string }) {
  useEffect(() => {
    if (testId) recordTestOpened(testId);
  }, [testId]);

  useEffect(() => {
    if (!testId) return;
    const main = document.getElementById("main-content");
    if (!main) return;
    const onClick = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('button, [role="radio"], input[type="radio"], input[type="checkbox"], label');
      if (!control || !main.contains(control)) return;
      if (control.closest("[data-funnel-ignore]")) return;
      main.removeEventListener("click", onClick);
      window.setTimeout(() => gaEventOnce("test_started", { test_id: testId, funnel_source: "page" }), 0);
    };
    main.addEventListener("click", onClick);
    return () => main.removeEventListener("click", onClick);
  }, [testId]);

  return null;
}
