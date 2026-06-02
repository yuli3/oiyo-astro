"use client";

import type { Metric } from "web-vitals";

import {
  type PerformanceMetricsPayload,
  trackPerformanceMetricsEvent,
} from "@/lib/system/database/analytics";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "@/lib/system/secure-storage";
import { isSupabaseConfigured } from "@/lib/system/supabase";

export interface PerformanceData {
  connectionType?: string;
  customMetrics?: Record<string, number>;
  deviceMemory?: number;
  metrics: WebVitalsMetric[];
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

export interface VitalsThresholds {
  CLS: { good: number; poor: number };
  FCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  INP: { good: number; poor: number };
  LCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

export interface WebVitalsMetric {
  delta: number;
  entries?: PerformanceEntry[];
  id: string;
  name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
  navigationType?: string;
  rating: "good" | "needs-improvement" | "poor";
  value: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
  deviceMemory?: number;
}

interface PerformanceSummary {
  avgLoadTime: number;
  goodMetrics: number;
  interactionCount: number;
  poorMetrics: number;
  sessionId: string;
  totalMetrics: number;
}

const isDevelopment = process.env.NODE_ENV !== "production";
const devLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private batchTimer: null | number = null;
  private customMetrics: Map<string, number> = new Map();
  private isEnabled: boolean = true;
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private sendBuffer: PerformanceData[] = [];
  private sessionId: string;

  private readonly thresholds: VitalsThresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public clearHistory(): void {
    removeSecureItem("performance-history");
    removeSecureItem("performance-metrics");
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public generateReport(): {
    customMetrics: Record<string, number>;
    metrics: WebVitalsMetric[];
    recommendations: string[];
    summary: PerformanceSummary;
  } {
    const metrics = this.getMetrics();
    const customMetrics = this.getCustomMetrics();
    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    metrics.forEach((metric) => {
      if (metric.rating === "poor") {
        switch (metric.name) {
          case "CLS":
            recommendations.push(
              "Reduce layout shifts by setting dimensions for images and ads",
            );
            break;
          case "FID":
            recommendations.push(
              "Improve first input delay by optimizing JavaScript execution",
            );
            break;
          case "LCP":
            recommendations.push(
              "Optimize largest contentful paint by compressing images and improving server response time",
            );
            break;
          case "TTFB":
            recommendations.push(
              "Improve time to first byte by optimizing server performance",
            );
            break;
        }
      }
    });

    const summary: PerformanceSummary = {
      avgLoadTime: customMetrics.totalLoadTime || 0,
      goodMetrics: metrics.filter((m) => m.rating === "good").length,
      interactionCount: customMetrics.interactionCount || 0,
      poorMetrics: metrics.filter((m) => m.rating === "poor").length,
      sessionId: this.sessionId,
      totalMetrics: metrics.length,
    };

    return {
      customMetrics,
      metrics,
      recommendations,
      summary,
    };
  }

  public getCustomMetrics(): Record<string, number> {
    return Object.fromEntries(this.customMetrics);
  }

  public getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }

  public getPerformanceHistory(): PerformanceData[] {
    return getSecureItem<PerformanceData[]>("performance-history", []);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  // Public API methods
  public recordCustomMetric(name: string, value: number): void {
    this.customMetrics.set(name, value);
    this.persistMetrics();
  }

  private batchMetrics(data: PerformanceData): void {
    this.sendBuffer.push(data);

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = window.setTimeout(() => {
      if (this.sendBuffer.length > 0) {
        this.sendBatchedMetrics([...this.sendBuffer]);
        this.sendBuffer = [];
      }
    }, 5000);
  }

  private fallbackMetrics(): void {
    // Fallback implementation for basic metrics without web-vitals library
    if ("PerformanceObserver" in window) {
      try {
        // Monitor LCP manually
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as PerformanceEntry[];
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.handleMetric({
              delta: lastEntry.startTime,
              entries: [lastEntry],
              id: `lcp-${Date.now()}`,
              name: "LCP",
              rating: this.getRating("LCP", lastEntry.startTime),
              value: lastEntry.startTime,
            } as WebVitalsMetric);
          }
        });
        lcpObserver.observe({
          buffered: true,
          type: "largest-contentful-paint",
        });

        // Monitor FCP manually
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as PerformanceEntry[];
          entries.forEach((entry) => {
            if (entry.name === "first-contentful-paint") {
              this.handleMetric({
                delta: entry.startTime,
                entries: [entry],
                id: `fcp-${Date.now()}`,
                name: "FCP",
                rating: this.getRating("FCP", entry.startTime),
                value: entry.startTime,
              } as WebVitalsMetric);
            }
          });
        });
        fcpObserver.observe({ buffered: true, type: "paint" });
      } catch (error) {
        console.warn("PerformanceObserver not supported:", error);
      }
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRating(
    name: WebVitalsMetric["name"],
    value: number,
  ): "good" | "needs-improvement" | "poor" {
    const threshold = this.thresholds[name];
    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  private handleMetric(metric: WebVitalsMetric): void {
    if (!this.isEnabled) return;

    this.metrics.set(metric.name, metric);

    // Log significant metrics
    if (metric.rating === "poor") {
      console.warn(`Poor ${metric.name} performance:`, metric.value, metric);
    }

    // Trigger immediate reporting for critical metrics
    if (
      metric.rating === "poor" &&
      ["CLS", "FID", "LCP"].includes(metric.name)
    ) {
      this.reportImmediately();
    }

    // Store metrics securely for persistence
    this.persistMetrics();
  }

  private handleWebVitalsMetric(metric: Metric): void {
    this.handleMetric(this.mapMetric(metric));
  }

  private initialize(): void {
    if (typeof window === "undefined") return;

    // Initialize Web Vitals monitoring
    this.initializeWebVitals();

    // Monitor navigation timing
    this.monitorNavigationTiming();

    // Monitor resource timing
    this.monitorResourceTiming();

    // Monitor user interactions
    this.monitorInteractions();

    // Setup automatic reporting
    this.setupAutoReporting();

    // Handle page visibility changes
    this.setupVisibilityChangeHandling();

    devLog("Performance Monitor initialized with session:", this.sessionId);
  }

  private async initializeWebVitals(): Promise<void> {
    try {
      const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");

      onCLS((metric) => this.handleWebVitalsMetric(metric));
      onFCP((metric) => this.handleWebVitalsMetric(metric));
      onLCP((metric) => this.handleWebVitalsMetric(metric));
      onTTFB((metric) => this.handleWebVitalsMetric(metric));
      onINP((metric) => this.handleWebVitalsMetric(metric));
    } catch (error) {
      console.warn("Web Vitals library not available:", error);
      this.fallbackMetrics();
    }
  }

  private mapMetric(metric: Metric): WebVitalsMetric {
    return {
      delta: metric.delta,
      entries: metric.entries,
      id: metric.id,
      name: metric.name as WebVitalsMetric["name"],
      navigationType: metric.navigationType,
      rating: metric.rating as WebVitalsMetric["rating"],
      value: metric.value,
    };
  }

  private monitorInteractions(): void {
    if (typeof window === "undefined") return;

    let interactionCount = 0;
    let totalInteractionTime = 0;

    ["click", "keydown", "touchstart"].forEach((eventType) => {
      document.addEventListener(
        eventType,
        (_event) => {
          const startTime = performance.now();

          requestIdleCallback(() => {
            const endTime = performance.now();
            const interactionTime = endTime - startTime;

            interactionCount++;
            totalInteractionTime += interactionTime;

            this.recordCustomMetric(
              "avgInteractionTime",
              totalInteractionTime / interactionCount,
            );
            this.recordCustomMetric("interactionCount", interactionCount);

            // Flag slow interactions (>100ms)
            if (interactionTime > 100) {
              console.warn(
                "Slow interaction detected:",
                eventType,
                `${interactionTime.toFixed(2)}ms`,
              );
            }
          });
        },
        { passive: true },
      );
    });
  }

  private monitorNavigationTiming(): void {
    if (typeof window === "undefined" || !("performance" in window)) return;

    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          // Calculate TTFB
          const ttfb = navigation.responseStart - navigation.requestStart;
          this.handleMetric({
            delta: ttfb,
            id: `ttfb-${Date.now()}`,
            name: "TTFB",
            navigationType: navigation.type,
            rating: this.getRating("TTFB", ttfb),
            value: ttfb,
          } as WebVitalsMetric);

          // Track custom timing metrics
          this.recordCustomMetric(
            "domContentLoaded",
            navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
          );
          this.recordCustomMetric(
            "loadComplete",
            navigation.loadEventEnd - navigation.loadEventStart,
          );
          this.recordCustomMetric(
            "totalLoadTime",
            navigation.loadEventEnd - navigation.fetchStart,
          );
        }
      }, 0);
    });
  }

  private monitorResourceTiming(): void {
    if (typeof window === "undefined" || !("PerformanceObserver" in window))
      return;

    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as PerformanceResourceTiming[];

        let totalResourceTime = 0;
        let slowResources = 0;

        entries.forEach((entry) => {
          const loadTime = entry.responseEnd - entry.startTime;
          totalResourceTime += loadTime;

          // Flag slow resources (>2s)
          if (loadTime > 2000) {
            slowResources++;
            console.warn(
              "Slow resource detected:",
              entry.name,
              `${loadTime.toFixed(2)}ms`,
            );
          }
        });

        this.recordCustomMetric(
          "avgResourceLoadTime",
          totalResourceTime / entries.length,
        );
        this.recordCustomMetric("slowResourceCount", slowResources);
      });

      resourceObserver.observe({ buffered: true, type: "resource" });
    } catch (error) {
      console.warn("Resource timing monitoring failed:", error);
    }
  }

  private persistMetrics(): void {
    try {
      const data = {
        customMetrics: Array.from(this.customMetrics.entries()),
        metrics: Array.from(this.metrics.entries()),
        sessionId: this.sessionId,
        timestamp: Date.now(),
      };
      setSecureItem("performance-metrics", data);
    } catch (error) {
      console.warn("Failed to persist metrics:", error);
    }
  }

  private reportImmediately(): void {
    this.reportMetrics(true);
  }

  private reportMetrics(immediate = false): void {
    if (!this.isEnabled || this.metrics.size === 0) return;

    const navigatorInfo = navigator as NavigatorWithConnection;

    const performanceData: PerformanceData = {
      connectionType: navigatorInfo.connection?.effectiveType,
      customMetrics: Object.fromEntries(this.customMetrics),
      deviceMemory: navigatorInfo.deviceMemory,
      metrics: Array.from(this.metrics.values()),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (immediate) {
      this.sendMetrics(performanceData);
    } else {
      this.batchMetrics(performanceData);
    }
  }

  private sendBatchedMetrics(batch: PerformanceData[]): void {
    // Send to analytics endpoint
    this.sendToAnalytics(batch);

    // Log to console for development
    if (process.env.NODE_ENV === "development") {
      devLog("Performance Metrics Batch:", batch);
    }
  }

  private sendMetrics(data: PerformanceData): void {
    this.sendToAnalytics([data]);

    if (process.env.NODE_ENV === "development") {
      devLog("Performance Metrics:", data);
    }
  }

  private async sendToAnalytics(data: PerformanceData[]): Promise<void> {
    // In a real implementation, you would send to your analytics service
    // For now, we'll just store locally and log

    try {
      // Store aggregated data locally
      const existing = getSecureItem<PerformanceData[]>(
        "performance-history",
        [],
      );
      const updated = [...existing, ...data].slice(-100);
      setSecureItem("performance-history", updated);

      if (isSupabaseConfigured()) {
        await Promise.all(
          data.map(async (datum) => {
            const payload = this.toPerformancePayload(datum);
            const response = await trackPerformanceMetricsEvent(payload);

            if (response.error && process.env.NODE_ENV === "development") {
              console.warn(
                "Failed to upload performance metrics:",
                response.error.message,
              );
            }
          }),
        );
      }

      // You could send to services like:
      // - Google Analytics 4
      // - New Relic
      // - DataDog
      // - Custom analytics endpoint

      if (process.env.NODE_ENV === "development") {
        devLog(`Stored ${data.length} performance reports locally`);
      }
    } catch (error) {
      console.error("Failed to store performance data:", error);
    }
  }

  private setupAutoReporting(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);

    // Report on page unload
    window.addEventListener("beforeunload", () => {
      this.reportMetrics(true);
    });

    // Report on page hide (mobile)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.reportMetrics(true);
      }
    });
  }

  private setupVisibilityChangeHandling(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.recordCustomMetric("pageVisible", performance.now());
      } else {
        this.recordCustomMetric("pageHidden", performance.now());
      }
    });
  }

  private toPerformancePayload(
    data: PerformanceData,
  ): PerformanceMetricsPayload {
    return {
      connectionType: data.connectionType,
      customMetrics: data.customMetrics,
      deviceMemory: data.deviceMemory,
      metrics: data.metrics.map((metric) => ({
        delta: metric.delta,
        name: metric.name,
        rating: metric.rating,
        value: metric.value,
      })),
      pagePath:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      url: data.url,
      userAgent: data.userAgent,
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Hook for React components
export function usePerformanceMonitor() {
  return {
    clearHistory: () => performanceMonitor.clearHistory(),
    generateReport: () => performanceMonitor.generateReport(),
    getCustomMetrics: () => performanceMonitor.getCustomMetrics(),
    getHistory: () => performanceMonitor.getPerformanceHistory(),
    getMetrics: () => performanceMonitor.getMetrics(),
    recordMetric: (name: string, value: number) =>
      performanceMonitor.recordCustomMetric(name, value),
  };
}
