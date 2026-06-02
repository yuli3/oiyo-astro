import type {
  AnalyticsEvent,
  AnalyticsEventInsert,
  ApiResponse,
  Json,
} from "@/types/database";

// Analytics and Event Tracking Database Operations
import {
  getOrCreateSessionId,
  handleDatabaseError,
  supabase,
  supabaseAdmin,
} from "@/lib/system/supabase";

export interface PerformanceMetricsPayload {
  connectionType?: string;
  customMetrics?: Record<string, number>;
  deviceMemory?: number;
  metrics: {
    delta: number;
    name: string;
    rating: "good" | "needs-improvement" | "poor";
    value: number;
  }[];
  pagePath?: string;
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

type JsonRecord = { [key: string]: Json | undefined };

const mergeEventData = (base: JsonRecord, extra?: JsonRecord): Json => ({
  ...base,
  ...(extra ?? {}),
});

const sanitizeJsonRecord = (record: JsonRecord): JsonRecord =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  ) as JsonRecord;

const isJsonRecord = (value: Json | null): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getNumberFromEvent = (data: Json | null, key: string): null | number => {
  if (!isJsonRecord(data)) {
    return null;
  }

  const value = data[key];
  return typeof value === "number" ? value : null;
};

// Error & Monitoring Events
export interface ClientErrorPayload {
  column?: number;
  componentStack?: string;
  extraData?: JsonRecord;
  line?: number;
  message: string;
  sessionId?: string;
  severity?: "critical" | "high" | "low" | "medium";
  source?: string;
  stack?: string;
  userId?: string;
}

// Data cleanup operations
export async function cleanupOldAnalytics(
  daysOld: number = 90,
): Promise<ApiResponse<{ deletedCount: number }>> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await (supabaseAdmin as any)
      .from("analytics_events")
      .delete()
      .lt("created_at", cutoffDate.toISOString())
      .select("id");

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: { deletedCount: data?.length || 0 } };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Analytics Query Operations (Admin only)
export async function getEventStats(
  options: {
    endDate?: string;
    eventType?: string;
    limit?: number;
    startDate?: string;
    userId?: string;
  } = {},
): Promise<
  ApiResponse<{
    browserBreakdown: Array<{ browser: string; count: number }>;
    deviceBreakdown: Array<{ count: number; device_type: string }>;
    topEvents: Array<{ count: number; event_type: string }>;
    totalEvents: number;
    uniqueSessions: number;
    uniqueUsers: number;
  }>
> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    let query = (supabaseAdmin as any).from("analytics_events").select("*");

    if (options.startDate) {
      query = query.gte("created_at", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate);
    }

    if (options.eventType) {
      query = query.eq("event_type", options.eventType);
    }

    if (options.userId) {
      query = query.eq("user_id", options.userId);
    }

    const { data: events, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    // Calculate statistics
    const eventsArray: AnalyticsEvent[] = events ?? [];
    const totalEvents = eventsArray.length;
    const uniqueUsers = new Set(
      eventsArray
        .map((event) => event.user_id)
        .filter((id): id is string => Boolean(id)),
    ).size;
    const uniqueSessions = new Set(
      eventsArray
        .map((event) => event.session_id)
        .filter((id): id is string => Boolean(id)),
    ).size;

    // Top events
    const eventTypeMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();

    eventsArray.forEach((event) => {
      // Event types
      const eventType = event.event_type;
      eventTypeMap.set(eventType, (eventTypeMap.get(eventType) || 0) + 1);

      // Device types
      if (event.device_type) {
        deviceMap.set(
          event.device_type,
          (deviceMap.get(event.device_type) || 0) + 1,
        );
      }

      // Browsers
      if (event.browser) {
        browserMap.set(event.browser, (browserMap.get(event.browser) || 0) + 1);
      }
    });

    const topEvents = Array.from(eventTypeMap.entries())
      .map(([event_type, count]) => ({ count, event_type }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([device_type, count]) => ({ count, device_type }))
      .sort((a, b) => b.count - a.count);

    const browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    const stats = {
      browserBreakdown,
      deviceBreakdown,
      topEvents,
      totalEvents,
      uniqueSessions,
      uniqueUsers,
    };

    return { data: stats };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getTestFunnelAnalytics(
  testId: string,
  options: {
    endDate?: string;
    startDate?: string;
  } = {},
): Promise<
  ApiResponse<{
    abandonmentPoints: Array<{ count: number; question: number }>;
    averageCompletionTime: number;
    conversionRate: number;
    testAbandons: number;
    testCompletions: number;
    testStarts: number;
    testViews: number;
  }>
> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    let query = (supabaseAdmin as any).from("analytics_events").select("*");

    if (options.startDate) {
      query = query.gte("created_at", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate);
    }

    const { data: events, error } = await query
      .or(
        `event_type.eq.test_view,event_type.eq.test_start,event_type.eq.test_complete,event_type.eq.test_abandon`,
      )
      .contains("event_data", { test_id: testId });

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    const eventsArray: AnalyticsEvent[] = events ?? [];
    const testViews = eventsArray.filter(
      (e) => e.event_type === "test_view",
    ).length;
    const testStarts = eventsArray.filter(
      (e) => e.event_type === "test_start",
    ).length;
    const testCompletions = eventsArray.filter(
      (e) => e.event_type === "test_complete",
    ).length;
    const testAbandons = eventsArray.filter(
      (e) => e.event_type === "test_abandon",
    ).length;

    const conversionRate =
      testStarts > 0 ? (testCompletions / testStarts) * 100 : 0;

    // Calculate average completion time
    const completionEvents = eventsArray.filter(
      (event) => event.event_type === "test_complete",
    );
    const completionTimes = completionEvents
      .map((event) =>
        getNumberFromEvent(event.event_data ?? null, "completion_time_seconds"),
      )
      .filter((value): value is number => value !== null);
    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) /
          completionTimes.length
        : 0;

    // Abandonment points
    const abandonMap = new Map<number, number>();
    const abandonEvents = eventsArray.filter(
      (event) => event.event_type === "test_abandon",
    );
    abandonEvents.forEach((event) => {
      const questionNumber = getNumberFromEvent(
        event.event_data ?? null,
        "question_number",
      );
      if (typeof questionNumber === "number") {
        abandonMap.set(
          questionNumber,
          (abandonMap.get(questionNumber) || 0) + 1,
        );
      }
    });

    const abandonmentPoints = Array.from(abandonMap.entries())
      .map(([question, count]) => ({ count, question }))
      .sort((a, b) => a.question - b.question);

    const analytics = {
      abandonmentPoints,
      averageCompletionTime,
      conversionRate,
      testAbandons,
      testCompletions,
      testStarts,
      testViews,
    };

    return { data: analytics };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getUserJourney(
  userId?: string,
  sessionId?: string,
  limit: number = 100,
): Promise<ApiResponse<AnalyticsEvent[]>> {
  if (!userId && !sessionId) {
    return {
      error: handleDatabaseError(
        new Error("Either userId or sessionId must be provided"),
      ),
    };
  }

  try {
    if (!supabase) {
      return { error: { message: "Supabase is not configured" } };
    }

    const client = supabase;
    if (!client) {
      return { error: { message: "Supabase is not configured" } };
    }

    let query = (client as any).from("analytics_events").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query
      .select("*")
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function trackButtonClick(
  buttonName: string,
  location: string,
  userId?: string,
  additionalData?: JsonRecord,
): Promise<ApiResponse<AnalyticsEvent>> {
  const eventData = mergeEventData(
    {
      button_name: buttonName,
      location,
      timestamp: new Date().toISOString(),
    },
    additionalData,
  );

  return trackEvent({
    event_data: eventData,
    event_type: "button_click",
    user_id: userId,
  });
}

export async function trackCareerMatchView(
  testId: string,
  options: {
    jobCategory?: string;
    locale?: string;
    matchLabel?: string;
    matchScore?: number;
    matchSlug: string;
    userId?: string;
  },
): Promise<ApiResponse<AnalyticsEvent>> {
  const timestamp = new Date().toISOString();
  const eventData = mergeEventData(
    sanitizeJsonRecord({
      job_category: options.jobCategory,
      locale: options.locale,
      match_label: options.matchLabel,
      match_score: options.matchScore,
      match_slug: options.matchSlug,
      test_id: testId,
      timestamp,
    }),
  );

  return trackEvent({
    event_data: eventData,
    event_type: "career_match_view",
    user_id: options.userId,
  });
}

export async function trackClientError(
  payload: ClientErrorPayload,
): Promise<ApiResponse<AnalyticsEvent>> {
  const {
    column,
    componentStack,
    extraData,
    line,
    message,
    sessionId,
    severity = "medium",
    source,
    stack,
    userId,
  } = payload;

  const baseData = mergeEventData(
    {
      column,
      component_stack: componentStack,
      line,
      message,
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
      severity,
      source,
      stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    },
    extraData,
  );

  return trackEvent({
    event_data: baseData,
    event_type: "app_error",
    session_id: sessionId,
    user_id: userId,
  });
}

export async function trackDailyReadingOpen(
  readingDate: string,
  options: {
    deliveryChannel?: "app" | "email" | "push";
    locale?: string;
    reminderType?: string;
    userId?: string;
    zodiacSign?: string;
  } = {},
): Promise<ApiResponse<AnalyticsEvent>> {
  const timestamp = new Date().toISOString();
  const eventData = mergeEventData(
    sanitizeJsonRecord({
      delivery_channel: options.deliveryChannel,
      locale: options.locale,
      reading_date: readingDate,
      reminder_type: options.reminderType,
      timestamp,
      zodiac_sign: options.zodiacSign,
    }),
  );

  return trackEvent({
    event_data: eventData,
    event_type: "daily_reading_open",
    user_id: options.userId,
  });
}

// Event Tracking Operations
export async function trackEvent(
  eventData: Omit<AnalyticsEventInsert, "session_id"> & {
    session_id?: string;
  },
): Promise<ApiResponse<AnalyticsEvent>> {
  try {
    const payload: AnalyticsEventInsert = {
      ...eventData,
      session_id: eventData.session_id ?? getOrCreateSessionId(),
    };

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent;
      payload.user_agent = userAgent;

      if (/Mobi|Android/i.test(userAgent)) {
        payload.device_type = "mobile";
      } else if (/Tablet|iPad/i.test(userAgent)) {
        payload.device_type = "tablet";
      } else {
        payload.device_type = "desktop";
      }

      if (userAgent.includes("Chrome")) {
        payload.browser = "Chrome";
      } else if (userAgent.includes("Firefox")) {
        payload.browser = "Firefox";
      } else if (userAgent.includes("Safari")) {
        payload.browser = "Safari";
      } else if (userAgent.includes("Edge")) {
        payload.browser = "Edge";
      }

      if (userAgent.includes("Windows")) {
        payload.os = "Windows";
      } else if (userAgent.includes("Mac")) {
        payload.os = "macOS";
      } else if (userAgent.includes("Linux")) {
        payload.os = "Linux";
      } else if (userAgent.includes("Android")) {
        payload.os = "Android";
      } else if (
        userAgent.includes("iOS") ||
        userAgent.includes("iPhone") ||
        userAgent.includes("iPad")
      ) {
        payload.os = "iOS";
      }
    }

    const client = supabase;
    if (!client) {
      return { error: { message: "Supabase is not configured" } };
    }

    const { data, error } = await (client as any)
      .from("analytics_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Common event tracking helpers
export async function trackPageView(
  path: string,
  userId?: string,
  additionalData?: JsonRecord,
): Promise<ApiResponse<AnalyticsEvent>> {
  const eventData = mergeEventData(
    {
      timestamp: new Date().toISOString(),
    },
    additionalData,
  );

  return trackEvent({
    event_data: eventData,
    event_type: "page_view",
    page_path: path,
    referrer: typeof window !== "undefined" ? document.referrer : undefined,
    user_id: userId,
  });
}

export async function trackPerformanceMetricsEvent(
  payload: PerformanceMetricsPayload,
): Promise<ApiResponse<AnalyticsEvent>> {
  const ratingCounts = payload.metrics.reduce(
    (acc, metric) => {
      acc[metric.rating] = (acc[metric.rating] ?? 0) + 1;
      return acc;
    },
    {
      good: 0,
      "needs-improvement": 0,
      poor: 0,
    } as Record<"good" | "needs-improvement" | "poor", number>,
  );

  const averageMetricValue = payload.metrics.length
    ? Number(
        (
          payload.metrics.reduce((sum, metric) => sum + metric.value, 0) /
          payload.metrics.length
        ).toFixed(2),
      )
    : null;

  const eventData: Json = {
    connectionType: payload.connectionType ?? null,
    customMetrics: sanitizeCustomMetrics(payload.customMetrics),
    deviceMemory:
      typeof payload.deviceMemory === "number" ? payload.deviceMemory : null,
    metrics: payload.metrics.map((metric) => ({
      delta: metric.delta,
      name: metric.name,
      rating: metric.rating,
      value: metric.value,
    })),
    sessionId: payload.sessionId,
    summary: {
      averageMetricValue,
      ratingCounts,
      totalMetrics: payload.metrics.length,
    },
    timestamp: new Date(payload.timestamp).toISOString(),
    url: payload.url,
    userAgent: payload.userAgent,
  };

  const pagePath = payload.pagePath ?? derivePagePath(payload.url);

  return trackEvent({
    event_data: eventData,
    event_type: "performance_metrics",
    page_path: pagePath,
    session_id: payload.sessionId,
  });
}

export async function trackResultShare(
  resultId: string,
  shareMethod: "download" | "image" | "link" | "pdf" | "social" | "webshare",
  platform?: string,
  userId?: string,
): Promise<ApiResponse<AnalyticsEvent>> {
  const eventData = mergeEventData(
    sanitizeJsonRecord({
      platform,
      result_id: resultId,
      share_method: shareMethod,
      timestamp: new Date().toISOString(),
    }),
  );

  return trackEvent({
    event_data: eventData,
    event_type: "result_share",
    user_id: userId,
  });
}

export async function trackRomanceShare(
  testId: string,
  options: {
    compatibilityScore?: number;
    locale?: string;
    matchType: string;
    platform?: string;
    shareMethod?: "download" | "image" | "link" | "pdf" | "social" | "webshare";
    userId?: string;
  },
): Promise<ApiResponse<AnalyticsEvent>> {
  const timestamp = new Date().toISOString();
  const eventData = mergeEventData(
    sanitizeJsonRecord({
      compatibility_score: options.compatibilityScore,
      locale: options.locale,
      match_type: options.matchType,
      platform: options.platform,
      share_method: options.shareMethod,
      test_id: testId,
      timestamp,
    }),
  );

  return trackEvent({
    event_data: eventData,
    event_type: "romance_share",
    user_id: options.userId,
  });
}

export async function trackTestAbandon(
  testId: string,
  testSlug: string,
  questionNumber: number,
  userId?: string,
): Promise<ApiResponse<AnalyticsEvent>> {
  const eventData = mergeEventData({
    question_number: questionNumber,
    test_id: testId,
    test_slug: testSlug,
    timestamp: new Date().toISOString(),
  });

  return trackEvent({
    event_data: eventData,
    event_type: "test_abandon",
    user_id: userId,
  });
}

export async function trackTestComplete(
  testId: string,
  testSlug: string,
  resultType: string,
  completionTimeSeconds: number,
  userId?: string,
): Promise<ApiResponse<AnalyticsEvent>> {
  const eventData = mergeEventData({
    completion_time_seconds: completionTimeSeconds,
    result_type: resultType,
    test_id: testId,
    test_slug: testSlug,
    timestamp: new Date().toISOString(),
  });

  return trackEvent({
    event_data: eventData,
    event_type: "test_complete",
    user_id: userId,
  });
}

export async function trackTestStart(
  testId: string,
  testSlug: string,
  userId?: string,
): Promise<ApiResponse<AnalyticsEvent>> {
  const eventData = mergeEventData({
    test_id: testId,
    test_slug: testSlug,
    timestamp: new Date().toISOString(),
  });

  return trackEvent({
    event_data: eventData,
    event_type: "test_start",
    user_id: userId,
  });
}

function derivePagePath(url: string): string | undefined {
  try {
    return new URL(url).pathname;
  } catch {
    return undefined;
  }
}

function sanitizeCustomMetrics(
  metrics: Record<string, number> | undefined,
): Record<string, number> {
  if (!metrics) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metrics)
      .filter(([, value]) => Number.isFinite(value))
      .map(([key, value]) => [key, Number(value)]),
  );
}
