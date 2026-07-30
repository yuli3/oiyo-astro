"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/i18n";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "@/lib/system/secure-storage";

interface CachedTestQuestions {
  cached: number;
  locale: Locale;
  questions: unknown[];
  testType: string;
}

interface OfflineInsight {
  content: Record<string, unknown>;
  id: string;
  locale: Locale;
  timestamp: number;
  viewed: boolean;
}

interface OfflineTestData {
  completed: boolean;
  id: string;
  locale: Locale;
  progress: number;
  questions: unknown[];
  results?: unknown;
  testType: string;
  timestamp: number;
}

type PendingSyncItem = {
  id: string;
  timestamp: number;
  type: "insight" | "result" | "test";
};

export class OfflineManager {
  private static instance: OfflineManager;
  private hasRequestedPreload = false;
  private isOnline: boolean = true;
  private listeners: Set<(online: boolean) => void> = new Set();

  private constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
      this.requestPreloadForCriticalTests();
    }
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Daily Insights Management
  public cacheInsight(
    insight: Record<string, unknown>,
    locale: Locale = "ko",
  ): string {
    const id = `insight-${Date.now()}`;
    const offlineInsight: OfflineInsight = {
      content: insight,
      id,
      locale,
      timestamp: Date.now(),
      viewed: false,
    };

    this.setStorageItem(`offline-insight-${id}`, offlineInsight);
    return id;
  }

  // Test Questions Caching for Offline Use
  public cacheTestQuestions(
    testType: string,
    questions: unknown[],
    locale: Locale = "ko",
  ): void {
    const cacheKey = `questions-${testType}-${locale}`;
    this.setStorageItem(cacheKey, {
      cached: Date.now(),
      locale,
      questions,
      testType,
    });

    void this.postMessageToServiceWorker({
      testData: {
        locale,
        questions,
      },
      testName: testType,
      type: "CACHE_TEST_DATA",
    });
  }

  public cleanup(): void {
    console.log("OfflineManager: Running cleanup...");

    // Remove old offline tests (older than 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (typeof window === "undefined") {
      return;
    }

    const storage = window.localStorage;
    const testKeys = Object.keys(storage).filter((key) =>
      key.startsWith("offline-test-"),
    );

    for (const key of testKeys) {
      const test = this.getStorageItem<null | OfflineTestData>(key);
      if (test && test.timestamp < thirtyDaysAgo) {
        removeSecureItem(key);
        console.log("OfflineManager: Removed old test:", key);
      }
    }

    // Remove old insights (older than 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const insightKeys = Object.keys(storage).filter((key) =>
      key.startsWith("offline-insight-"),
    );

    for (const key of insightKeys) {
      const insight = this.getStorageItem<null | OfflineInsight>(key);
      if (insight && insight.timestamp < weekAgo) {
        removeSecureItem(key);
        console.log("OfflineManager: Removed old insight:", key);
      }
    }
  }

  public completeTest(testId: string, results: unknown): void {
    const testData = this.getTestProgress(testId);
    if (testData) {
      testData.results = results;
      testData.completed = true;
      testData.progress = 100;
      testData.timestamp = Date.now();

      this.setStorageItem(`offline-test-${testId}`, testData);
      this.addToPendingSync("result", testId);

      void this.postMessageToServiceWorker({
        resultData: results,
        testName: testData.testType,
        type: "STORE_OFFLINE_RESULT",
      });

      void this.requestBackgroundSync();

      // Also save to the main result storage
      this.setStorageItem(`${testData.testType}-result`, results);
    }
  }

  public deleteOfflineTest(testId: string): void {
    removeSecureItem(`offline-test-${testId}`);
    this.removeFromPendingSync("test", testId);
  }

  public getCachedInsights(locale?: Locale): OfflineInsight[] {
    const insights: OfflineInsight[] = [];
    if (typeof window === "undefined") {
      return insights;
    }

    const keys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith("offline-insight-"),
    );

    for (const key of keys) {
      const insight = this.getStorageItem<null | OfflineInsight>(key);
      if (insight && (!locale || insight.locale === locale)) {
        insights.push(insight);
      }
    }

    return insights.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getCachedTestQuestions(
    testType: string,
    locale: Locale = "ko",
  ): null | unknown[] {
    const cacheKey = `questions-${testType}-${locale}`;
    const cached = this.getStorageItem<CachedTestQuestions | null>(cacheKey);

    if (cached) {
      // Check if cache is still valid (24 hours)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (cached.cached > dayAgo) {
        return cached.questions;
      } else {
        removeSecureItem(cacheKey);
      }
    }

    return null;
  }

  // Cache Management
  public getCacheSize(): number {
    if (typeof window === "undefined") {
      return 0;
    }

    let total = 0;
    const storage = window.localStorage;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      const value = storage.getItem(key) ?? "";
      total += value.length + key.length;
    }

    return total;
  }

  // Offline Status Indicator
  public getOfflineIndicator(): {
    cacheSize: string;
    isOffline: boolean;
    pendingCount: number;
  } {
    const pendingCount = this.getPendingSyncItems().length;
    const cacheSize = this.formatBytes(this.getCacheSize());

    return {
      cacheSize,
      isOffline: !this.isOnline,
      pendingCount,
    };
  }

  public getOfflineTests(): OfflineTestData[] {
    const tests: OfflineTestData[] = [];
    if (typeof window === "undefined") {
      return tests;
    }

    const storageKeys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith("offline-test-"),
    );

    for (const key of storageKeys) {
      const test = this.getStorageItem<null | OfflineTestData>(key);
      if (test) tests.push(test);
    }

    return tests.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getPendingSyncItems(): PendingSyncItem[] {
    return this.getStorageItem("pending-sync", [] as PendingSyncItem[]);
  }

  public getTestProgress(testId: string): null | OfflineTestData {
    return this.getStorageItem<null | OfflineTestData>(
      `offline-test-${testId}`,
    );
  }

  public markInsightViewed(insightId: string): void {
    const insight = this.getStorageItem<null | OfflineInsight>(
      `offline-insight-${insightId}`,
    );
    if (insight) {
      insight.viewed = true;
      this.setStorageItem(`offline-insight-${insightId}`, insight);
    }
  }

  public onlineStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public requestPreload(): void {
    void this.postMessageToServiceWorker({ type: "PRELOAD_TESTS" });
  }

  // Test Data Management
  public saveTestProgress(
    testType: string,
    questions: unknown[],
    currentProgress: number,
    locale: Locale = "ko",
    answers?: unknown,
  ): string {
    const id = `${testType}-${Date.now()}`;
    const testData: OfflineTestData = {
      completed: false,
      id,
      locale,
      progress: currentProgress,
      questions,
      results: answers ? { answers, progress: currentProgress } : undefined,
      testType,
      timestamp: Date.now(),
    };

    this.setStorageItem(`offline-test-${id}`, testData);
    this.addToPendingSync("test", id);

    void this.postMessageToServiceWorker({
      testData: {
        locale,
        progress: currentProgress,
        questions,
      },
      testName: testType,
      type: "CACHE_TEST_DATA",
    });

    return id;
  }

  public triggerSync(tag: string = "sync-test-results"): void {
    void this.requestBackgroundSync(tag);
  }

  // Sync Management
  private addToPendingSync(type: PendingSyncItem["type"], id: string): void {
    const pending = this.getStorageItem(
      "pending-sync",
      [] as PendingSyncItem[],
    );
    const existingIndex = pending.findIndex(
      (item) => item.id === id && item.type === type,
    );

    if (existingIndex >= 0) {
      pending[existingIndex] = { id, timestamp: Date.now(), type };
    } else {
      pending.push({ id, timestamp: Date.now(), type });
    }

    this.setStorageItem("pending-sync", pending);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  private getStorageItem<T>(key: string): null | T;
  private getStorageItem<T>(key: string, defaultValue: T): T;
  private getStorageItem<T>(key: string, defaultValue?: T): null | T {
    const fallback = (defaultValue ?? null) as null | T;

    try {
      const value = getSecureItem<null | T>(key, fallback);

      if (value === null && defaultValue !== undefined) {
        return defaultValue;
      }

      return value;
    } catch (error) {
      console.error(
        "OfflineManager: Failed to read from secure storage:",
        error,
      );
      return defaultValue ?? null;
    }
  }

  private handleSyncRequest(): void {
    // Handle background sync requests from service worker
    this.syncPendingData();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isOnline));
  }
  private async postMessageToServiceWorker(
    message: Record<string, unknown>,
  ): Promise<void> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const target = registration.active ?? navigator.serviceWorker.controller;
      target?.postMessage(message);
    } catch (error) {
      console.error(
        "OfflineManager: Failed to communicate with service worker:",
        error,
      );
    }
  }
  private removeFromPendingSync(
    type: PendingSyncItem["type"],
    id: string,
  ): void {
    const pending = this.getStorageItem(
      "pending-sync",
      [] as PendingSyncItem[],
    );
    const filtered = pending.filter(
      (item) => !(item.id === id && item.type === type),
    );
    this.setStorageItem("pending-sync", filtered);
  }

  private async requestBackgroundSync(
    tag: string = "sync-test-results",
  ): Promise<void> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (
        registration as ServiceWorkerRegistration & {
          sync?: { register?: (syncTag: string) => Promise<void> };
        }
      ).sync;

      if (syncManager?.register) {
        await syncManager.register(tag);
      } else {
        await this.postMessageToServiceWorker({ tag, type: "REQUEST_SYNC" });
      }
    } catch (error) {
      console.error(
        "OfflineManager: Failed to register background sync:",
        error,
      );
      await this.postMessageToServiceWorker({ tag, type: "REQUEST_SYNC" });
    }
  }

  private requestPreloadForCriticalTests(): void {
    if (this.hasRequestedPreload) {
      return;
    }

    this.hasRequestedPreload = true;
    void this.postMessageToServiceWorker({ type: "PRELOAD_TESTS" });
  }

  // Storage Utilities
  private setStorageItem(key: string, value: unknown): void {
    try {
      setSecureItem(key, value);
    } catch (error) {
      console.error("OfflineManager: Failed to save to secure storage:", error);
      this.cleanup();
    }
  }

  private setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingData();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyListeners();
    });

    // Listen for service worker messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SYNC_TEST_RESULTS") {
          this.handleSyncRequest();
        }

        if (event.data?.type === "OFFLINE_RESULT_STORED") {
          // Trigger listeners so UI updates immediately
          this.notifyListeners();
        }
      });
    }
  }

  private async syncItem(item: PendingSyncItem): Promise<void> {
    // In a real app, this would sync to your backend
    // For now, we'll just log and simulate successful sync
    console.log("OfflineManager: Syncing item to server:", item);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mark as synced (in real app, you'd verify server response)
    return Promise.resolve();
  }

  private async syncPendingData(): Promise<void> {
    if (!this.isOnline) return;

    const pendingItems = this.getPendingSyncItems();
    console.log(
      "OfflineManager: Syncing",
      pendingItems.length,
      "pending items",
    );

    for (const item of pendingItems) {
      try {
        await this.syncItem(item);
        this.removeFromPendingSync(item.type, item.id);
      } catch (error) {
        console.error("OfflineManager: Failed to sync item:", item, error);
      }
    }
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();

// Hook for using offline functionality in components
export function useOffline() {
  const [isOnline, setIsOnline] = useState(offlineManager.getOnlineStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Update pending count
    const updatePendingCount = () => {
      setPendingCount(offlineManager.getPendingSyncItems().length);
    };

    updatePendingCount();

    // Listen for online status changes
    const unsubscribe = offlineManager.onlineStatusChange((online) => {
      setIsOnline(online);
      updatePendingCount();
    });

    // Update pending count periodically
    const interval = setInterval(updatePendingCount, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    isOffline: !isOnline,
    isOnline,
    offlineManager,
    pendingCount,
  };
}
