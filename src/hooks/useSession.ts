// Session Management Hook for Anonymous Users
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { secureCache } from "@/lib/system/storage/secure-cache";
import { getOrCreateSessionId } from "@/lib/system/supabase";
// import { trackEvent } from '@/lib/system/database/analytics';

interface SessionData {
  isReady: boolean;
  lastActivity: Date;
  locale: string;
  sessionId: string;
  startTime: Date;
}

interface UseSessionOptions {
  locale?: string;
  trackPageViews?: boolean;
}

export function useSession(options: UseSessionOptions = {}) {
  const [session, setSession] = useState<null | SessionData>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initSession = () => {
      try {
        const sessionId = getOrCreateSessionId();
        const now = new Date();

        // Get or create session start time
        const sessionStartKey = `oiyo_session_start_${sessionId}`;
        const existingStartTime =
          secureCache.getOrNull<string>(sessionStartKey);
        const startTime = existingStartTime ? new Date(existingStartTime) : now;

        if (!existingStartTime) {
          secureCache.set(sessionStartKey, startTime.toISOString());
        }

        const sessionData: SessionData = {
          isReady: true,
          lastActivity: now,
          locale: options.locale || "en",
          sessionId,
          startTime,
        };

        setSession(sessionData);
        setIsLoading(false);

        // Track session start for new sessions
        if (!existingStartTime) {
          // trackEvent({
          //   event_type: 'session_start',
          //   session_id: sessionId,
          //   event_data: {
          //     locale: options.locale || 'en',
          //     user_agent: navigator.userAgent,
          //     referrer: document.referrer,
          //     timestamp: now.toISOString()
          //   }
          // }).catch(error => {
          //   console.warn('Failed to track session start:', error);
          // });
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
        setIsLoading(false);
      }
    };

    initSession();
  }, [options.locale]);

  // Keep a ref to session for callbacks to avoid dependencies
  const sessionRef = useRef<null | SessionData>(null);

  // Update ref whenever session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Update last activity
  const updateActivity = useCallback(() => {
    if (sessionRef.current) {
      const now = new Date();

      // Update state functional way to avoid dependency on 'session'
      setSession((prev) => (prev ? { ...prev, lastActivity: now } : null));

      // Update localStorage activity timestamp
      const activityKey = `oiyo_last_activity_${sessionRef.current.sessionId}`;
      secureCache.set(activityKey, now.toISOString());
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(
    async (_path: string, _additionalData?: Record<string, unknown>) => {
      if (!sessionRef.current?.isReady) return;

      try {
        updateActivity();
      } catch (error) {
        console.warn("Failed to track page view:", error);
      }
    },
    [updateActivity],
  );

  // Track custom event
  const trackCustomEvent = useCallback(
    async (_eventType: string, _eventData?: Record<string, unknown>) => {
      if (!sessionRef.current?.isReady) return;

      try {
        updateActivity();
      } catch (error) {
        console.warn(`Failed to track ${_eventType}:`, error);
      }
    },
    [updateActivity],
  );

  // Get session duration
  const getSessionDuration = useCallback(() => {
    if (!sessionRef.current) return 0;
    return Math.floor(
      (sessionRef.current.lastActivity.getTime() -
        sessionRef.current.startTime.getTime()) /
        1000,
    );
  }, []);

  // Auto-track page views on path changes
  useEffect(() => {
    if (
      options.trackPageViews &&
      session?.isReady &&
      typeof window !== "undefined"
    ) {
      // Wrap in setTimeout to avoid synchronous state update during render
      const timer = setTimeout(() => {
        trackPageView(window.location.pathname);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [session?.isReady, options.trackPageViews, trackPageView]);

  // Track activity on user interactions
  useEffect(() => {
    if (!session?.isReady) return;

    const handleActivity = () => updateActivity();

    const events = ["click", "scroll", "keydown", "mousemove", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [session?.isReady, updateActivity]);

  return {
    getSessionDuration,
    isLoading,
    isReady: session?.isReady || false,
    session,
    sessionId: session?.sessionId || null,
    trackCustomEvent,
    trackPageView,
    updateActivity,
  };
}
