/**
 * Share Analytics Tracking
 * Tracks sharing events for analytics and achievement system
 */

import { createClient } from "@/lib/system/database/supabase";

import type { ShareAnalytics, ShareMethod, SharePlatform } from "./types";

/**
 * Get share statistics for a result
 */
export async function getShareStatistics(resultId: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("shared_result_events")
      .select("share_method, share_platform, shared_at")
      .eq("result_id", resultId)
      .order("shared_at", { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const totalShares = data?.length || 0;
    const methodBreakdown = data?.reduce(
      (acc, event) => {
        acc[event.share_method] = (acc[event.share_method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const platformBreakdown = data?.reduce(
      (acc, event) => {
        if (event.share_platform) {
          acc[event.share_platform] = (acc[event.share_platform] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      methodBreakdown,
      platformBreakdown,
      recentShares: data?.slice(0, 10) || [],
      totalShares,
    };
  } catch (error) {
    console.error("Failed to get share statistics:", error);
    return {
      methodBreakdown: {},
      platformBreakdown: {},
      recentShares: [],
      totalShares: 0,
    };
  }
}

/**
 * Get trending share methods (for analytics dashboard)
 */
export async function getTrendingShareMethods(
  days: number = 7,
): Promise<Array<{ count: number; method: string }>> {
  try {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("shared_result_events")
      .select("share_method, share_platform")
      .gte("shared_at", since.toISOString());

    if (error) throw error;

    const methodCounts = data?.reduce(
      (acc, event) => {
        const key = event.share_platform || event.share_method;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(methodCounts || {})
      .map(([method, count]) => ({ count, method }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Failed to get trending share methods:", error);
    return [];
  }
}

/**
 * Get user's total share count (for achievements)
 */
export async function getUserShareCount(
  userId?: string,
  sessionId?: string,
): Promise<number> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("shared_result_events")
      .select("id", { count: "exact", head: true });

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return 0;
    }

    const { count, error } = await query;

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Failed to get user share count:", error);
    return 0;
  }
}

/**
 * Track share event in database
 */
export async function trackShareEvent(data: ShareAnalytics): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase.from("shared_result_events").insert({
      locale: data.locale,
      metadata: {
        timestamp: data.timestamp.toISOString(),
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
      result_id: data.resultId,
      session_id: data.sessionId || null,
      share_method: data.method,
      share_platform: data.platform || null,
      shared_at: data.timestamp.toISOString(),
      user_id: data.userId || null,
    });

    if (error) {
      console.error("Failed to track share event:", error);
      return false;
    }

    // Increment share count on shared_results table
    if (data.method === "link" || data.method === "social") {
      await incrementShareCount(data.resultId, data.method, data.platform);
    }

    return true;
  } catch (error) {
    console.error("Share tracking error:", error);
    return false;
  }
}

/**
 * Track viral feature engagement
 */
export async function trackViralFeature(
  feature: "compare_with_friends" | "personality_twin" | "qr_scan",
  userId?: string,
  sessionId?: string,
): Promise<void> {
  try {
    const supabase = createClient();

    await supabase.from("analytics_events").insert({
      created_at: new Date().toISOString(),
      event_data: {
        feature,
        timestamp: new Date().toISOString(),
      },
      event_type: `viral_${feature}`,
      session_id: sessionId || null,
      user_id: userId || null,
    });
  } catch (error) {
    console.error("Failed to track viral feature:", error);
  }
}

/**
 * Generate unique share token
 */
function generateShareToken(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Increment share count for a result
 */
async function incrementShareCount(
  resultId: string,
  method: ShareMethod,
  platform?: SharePlatform,
): Promise<void> {
  try {
    const supabase = createClient();

    // Check if shared_results entry exists
    const { data: existing } = await supabase
      .from("shared_results")
      .select("id, view_count")
      .eq("result_id", resultId)
      .single();

    if (existing) {
      // Update existing record
      await supabase
        .from("shared_results")
        .update({
          last_shared_at: new Date().toISOString(),
          view_count: (existing.view_count || 0) + 1,
        })
        .eq("id", existing.id);
    } else {
      // Create new shared_results entry
      await supabase.from("shared_results").insert({
        last_shared_at: new Date().toISOString(),
        result_id: resultId,
        share_method: method,
        share_platform: platform || null,
        share_token: generateShareToken(),
        share_type: "public",
        view_count: 1,
      });
    }
  } catch (error) {
    console.error("Failed to increment share count:", error);
  }
}
