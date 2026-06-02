"use client";

import { useCallback } from "react";

interface TrackEventOptions {
  eventData?: Record<string, unknown>;
  eventType: string;
  pageUrl?: string;
  referrer?: string;
  sessionId?: string;
  userId?: string;
}

export function useAnalytics() {
  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    try {
      // Get session ID from localStorage if not provided
      const sessionId = options.sessionId || localStorage.getItem("sessionId");

      // Get current page URL if not provided
      const pageUrl =
        options.pageUrl ||
        (typeof window !== "undefined" ? window.location.href : undefined);
      const referrer =
        options.referrer ||
        (typeof window !== "undefined" ? document.referrer : undefined);

      await fetch("/api/analytics/track", {
        body: JSON.stringify({
          eventData: options.eventData,
          eventType: options.eventType,
          pageUrl,
          referrer,
          sessionId,
          userId: options.userId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
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
