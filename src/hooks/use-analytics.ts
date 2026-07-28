"use client";

import { useCallback } from "react";

interface TrackEventOptions {
  eventData?: Record<string, unknown>;
  eventType: string;
  pageUrl?: string;
}

export function useAnalytics() {
  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    try {
      // Get current page URL if not provided
      const pageUrl =
        options.pageUrl ||
        (typeof window !== "undefined" ? window.location.href : undefined);

      // Mirror to GA4 (family property G-915L6V38X6) so events/conversions are
      // visible alongside auto-captured utm_source=ahoxy funnel sessions.
      if (
        typeof window !== "undefined" &&
        typeof (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag ===
          "function"
      ) {
        (window as unknown as { gtag: (...a: unknown[]) => void }).gtag(
          "event",
          options.eventType,
          { ...(options.eventData ?? {}), page_location: pageUrl },
        );
      }

      // OIYO is a static site and does not expose a first-party analytics API.
      // Do not issue a guaranteed 404 or silently create a second data pipeline.
      // GA4 collection itself remains subject to the separate consent/release gate.
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }, []);

  const trackPageView = useCallback(
    (pageName: string) => {
      trackEvent({
        eventData: { page: pageName },
        eventType: "page_view",
      });
    },
    [trackEvent],
  );

  const trackTestStart = useCallback(
    (testName: string) => {
      trackEvent({
        eventData: { testName },
        eventType: "test_started",
      });
    },
    [trackEvent],
  );

  const trackTestComplete = useCallback(
    (testName: string, result: string) => {
      trackEvent({
        eventData: { result, testName },
        eventType: "test_completed",
      });
    },
    [trackEvent],
  );

  const trackEmotionLogged = useCallback(
    (temperature: number, emotionLabel: string) => {
      trackEvent({
        eventData: { emotionLabel, temperature },
        eventType: "emotion_logged",
      });
    },
    [trackEvent],
  );

  const trackAchievementUnlocked = useCallback(
    (achievementSlug: string, xpGained: number) => {
      trackEvent({
        eventData: { achievementSlug, xpGained },
        eventType: "achievement_unlocked",
      });
    },
    [trackEvent],
  );

  const trackShareEvent = useCallback(
    (shareType: string, content: string) => {
      trackEvent({
        eventData: { content, shareType },
        eventType: "content_shared",
      });
    },
    [trackEvent],
  );

  const trackButtonClick = useCallback(
    (buttonName: string, context?: Record<string, unknown>) => {
      trackEvent({
        eventData: { buttonName, ...context },
        eventType: "button_clicked",
      });
    },
    [trackEvent],
  );

  return {
    trackAchievementUnlocked,
    trackButtonClick,
    trackEmotionLogged,
    trackEvent,
    trackPageView,
    trackShareEvent,
    trackTestComplete,
    trackTestStart,
  };
}
