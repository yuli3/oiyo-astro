"use client";

import { useEffect, useRef } from "react";

import { trackClientError } from "@/lib/system/database/analytics";
import { performanceMonitor } from "@/lib/system/performance-monitor";

interface NavigatorWithConnection extends Navigator {
  connection?: {
    addEventListener: (type: string, listener: EventListener) => void;
    downlink: number;
    effectiveType: string;
    removeEventListener: (type: string, listener: EventListener) => void;
    rtt: number;
  };
}

interface PerformanceProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  userId?: string;
}

// Type extensions for non-standard browser APIs
interface PerformanceWithMemory extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

export function PerformanceProvider({
  children,
  enabled = true,
  userId,
}: PerformanceProviderProps) {
  const errorDebounceRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const shouldLogError = (key: string): boolean => {
      const now = Date.now();
      const lastLogged = errorDebounceRef.current.get(key);
      if (lastLogged && now - lastLogged < 30_000) {
        return false;
      }
      errorDebounceRef.current.set(key, now);
      return true;
    };

    const sendErrorEvent = (options: {
      column?: number;
      extraData?: Record<string, boolean | null | number | string>;
      key: string;
      line?: number;
      message: string;
      severity?: "critical" | "high" | "low" | "medium";
      source?: string;
      stack?: string;
    }) => {
      if (!shouldLogError(options.key)) {
        return;
      }

      trackClientError({
        column: options.column,
        extraData: options.extraData,
        line: options.line,
        message: options.message,
        sessionId: performanceMonitor.getSessionId(),
        severity: options.severity,
        source: options.source,
        stack: options.stack,
        userId,
      }).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to submit client error to analytics:", error);
        }
      });
    };

    // Initialize performance monitoring
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing performance monitoring...");
    }

    performanceMonitor.recordCustomMetric("pageLoadStart", performance.now());
    performanceMonitor.recordCustomMetric("reactHydrated", performance.now());

    const handleBeforeUnload = () => {
      performanceMonitor.recordCustomMetric(
        "navigationStart",
        performance.now(),
      );
    };

    const handleLoad = () => {
      performanceMonitor.recordCustomMetric(
        "navigationComplete",
        performance.now(),
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        performanceMonitor.recordCustomMetric("maxScrollDepth", maxScrollDepth);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleFormSubmit = (event: Event) => {
      const target = event.target as HTMLFormElement;
      if (target?.tagName === "FORM") {
        performanceMonitor.recordCustomMetric(
          "formSubmissions",
          (performanceMonitor.getCustomMetrics().formSubmissions || 0) + 1,
        );
      }
    };

    document.addEventListener("submit", handleFormSubmit);

    const handleTestCompletion = () => {
      performanceMonitor.recordCustomMetric(
        "testCompletions",
        (performanceMonitor.getCustomMetrics().testCompletions || 0) + 1,
      );
      performanceMonitor.recordCustomMetric(
        "testCompletionTime",
        performance.now(),
      );
    };

    window.addEventListener("personalityTestCompleted", handleTestCompletion);

    const handleError = (event: ErrorEvent) => {
      performanceMonitor.recordCustomMetric(
        "jsErrors",
        (performanceMonitor.getCustomMetrics().jsErrors || 0) + 1,
      );
      console.warn("JavaScript error recorded:", event.error);

      const message = event.message || event.error?.message || "Unknown error";
      const key = `${message}:${event.filename ?? "unknown"}:${event.lineno ?? 0}:${event.colno ?? 0}`;

      sendErrorEvent({
        column: event.colno ?? undefined,
        key,
        line: event.lineno ?? undefined,
        message,
        severity: "high",
        source: event.filename ?? undefined,
        stack: event.error?.stack,
      });
    };

    window.addEventListener("error", handleError);

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      performanceMonitor.recordCustomMetric(
        "unhandledPromiseRejections",
        (performanceMonitor.getCustomMetrics().unhandledPromiseRejections ||
          0) + 1,
      );
      console.warn("Unhandled promise rejection recorded:", event.reason);

      const describeReason = () => {
        if (event.reason instanceof Error) {
          return event.reason.message;
        }
        if (typeof event.reason === "string") {
          return event.reason;
        }
        try {
          return JSON.stringify(event.reason);
        } catch {
          return String(event.reason);
        }
      };

      const reasonError =
        event.reason instanceof Error
          ? event.reason
          : new Error(describeReason());

      const key = `promise:${reasonError.message}:${reasonError.stack ?? "no-stack"}`;

      sendErrorEvent({
        extraData: {
          rejectionType: typeof event.reason,
          rejectionValue: describeReason(),
        },
        key,
        message: reasonError.message,
        severity: "medium",
        stack: reasonError.stack,
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    const monitorMemory = () => {
      if ("memory" in performance) {
        const memory = (performance as PerformanceWithMemory).memory;
        if (memory) {
          performanceMonitor.recordCustomMetric(
            "memoryUsed",
            memory.usedJSHeapSize,
          );
          performanceMonitor.recordCustomMetric(
            "memoryTotal",
            memory.totalJSHeapSize,
          );
          performanceMonitor.recordCustomMetric(
            "memoryLimit",
            memory.jsHeapSizeLimit,
          );
        }
      }
    };

    const memoryInterval = setInterval(monitorMemory, 30000);
    monitorMemory();

    const handleConnectionChange = () => {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection) {
        performanceMonitor.recordCustomMetric(
          "connectionSpeed",
          connection.downlink || 0,
        );
        performanceMonitor.recordCustomMetric(
          "connectionRTT",
          connection.rtt || 0,
        );
      }
    };

    if ("connection" in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      connection?.addEventListener("change", handleConnectionChange);
      handleConnectionChange();
    }

    let engagementStart = performance.now();
    let totalEngagementTime = 0;

    const updateEngagement = () => {
      if (document.visibilityState === "visible") {
        engagementStart = performance.now();
      } else if (engagementStart > 0) {
        totalEngagementTime += performance.now() - engagementStart;
        performanceMonitor.recordCustomMetric(
          "totalEngagementTime",
          totalEngagementTime,
        );
      }
    };

    document.addEventListener("visibilitychange", updateEngagement);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("submit", handleFormSubmit);
      window.removeEventListener(
        "personalityTestCompleted",
        handleTestCompletion,
      );
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      document.removeEventListener("visibilitychange", updateEngagement);
      clearInterval(memoryInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);

      if ("connection" in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection;
        connection?.removeEventListener("change", handleConnectionChange);
      }

      if (document.visibilityState === "visible" && engagementStart > 0) {
        totalEngagementTime += performance.now() - engagementStart;
        performanceMonitor.recordCustomMetric(
          "totalEngagementTime",
          totalEngagementTime,
        );
      }
    };
  }, [enabled, userId]);

  return <>{children}</>;
}

// Hook to trigger custom performance events
export function usePerformanceEvents() {
  const recordTestStart = (testType: string) => {
    performanceMonitor.recordCustomMetric(
      `${testType}TestStart`,
      performance.now(),
    );
  };

  const recordTestCompletion = (testType: string) => {
    performanceMonitor.recordCustomMetric(
      `${testType}TestComplete`,
      performance.now(),
    );

    // Dispatch custom event for global tracking
    window.dispatchEvent(
      new CustomEvent("personalityTestCompleted", {
        detail: { testType, timestamp: performance.now() },
      }),
    );
  };

  const recordUserAction = (action: string, value?: number) => {
    performanceMonitor.recordCustomMetric(action, value || performance.now());
  };

  return {
    recordTestCompletion,
    recordTestStart,
    recordUserAction,
  };
}
