/**
 * Viral Features
 * "Compare with Friends" and other viral mechanics
 */

import { createClient } from "@/lib/system/database/supabase";
// SharePlatform type is available for future use
// import type { SharePlatform } from './types';

export interface ComparisonData {
  comparisonUrl: string;
  friendCode: string;
  resultType: string;
  sessionId?: string;
  testId: string;
  userId?: string;
}

export interface ComparisonResult {
  comparisonUrl?: string;
  differentTraits?: string[];
  friendCode?: string;
  matchPercentage?: number;
  sharedTraits?: string[];
  success: boolean;
}

/**
 * Compare two test results
 */
export async function compareResults(
  resultId1: string,
  resultId2: string,
): Promise<ComparisonResult> {
  try {
    const supabase = createClient();

    // Fetch both results
    const { data: results, error } = await supabase
      .from("test_results")
      .select("id, result_type, percentage_scores, raw_answers")
      .in("id", [resultId1, resultId2]);

    if (error || !results || results.length !== 2) {
      return { success: false };
    }

    const [result1, result2] = results;

    // Calculate match percentage
    const matchPercentage = calculateMatchPercentage(
      result1.percentage_scores,
      result2.percentage_scores,
    );

    // Find shared traits
    const sharedTraits = findSharedTraits(
      result1.result_type,
      result2.result_type,
    );
    const differentTraits = findDifferentTraits(
      result1.result_type,
      result2.result_type,
    );

    return {
      differentTraits,
      matchPercentage,
      sharedTraits,
      success: true,
    };
  } catch (error) {
    console.error("Failed to compare results:", error);
    return { success: false };
  }
}

/**
 * Create comparison invitation
 */
export async function createComparisonInvite(
  resultId: string,
  userId?: string,
  sessionId?: string,
): Promise<ComparisonResult> {
  try {
    const supabase = createClient();
    const friendCode = generateFriendCode();

    // Store comparison invitation
    const { error } = await supabase
      .from("shared_results")
      .insert({
        metadata: {
          created_at: new Date().toISOString(),
          created_by_session: sessionId || null,
          created_by_user: userId || null,
          is_comparison: true,
        },
        result_id: resultId,
        share_method: "link",
        share_token: friendCode,
        share_type: "friends",
      })
      .select()
      .single();

    if (error) throw error;

    const comparisonUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://oiyo.app"}/compare/${friendCode}`;

    return {
      comparisonUrl,
      friendCode,
      success: true,
    };
  } catch (error) {
    console.error("Failed to create comparison invite:", error);
    return { success: false };
  }
}

/**
 * Generate shareable comparison image
 */
export async function generateComparisonImage(
  result1: { emoji: string; title: string; type: string },
  result2: { emoji: string; title: string; type: string },
  matchPercentage: number,
  text: {
    compareAt: string;
    comparisonTitle: string;
    matchScore: string;
  },
): Promise<string> {
  const html = `
    <div style="
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        color: white;
        font-size: 48px;
        font-weight: 800;
        margin-bottom: 40px;
        text-align: center;
      ">${text.comparisonTitle}</div>

      <div style="display: flex; gap: 40px; margin-bottom: 40px;">
        <div style="
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          min-width: 300px;
        ">
          <div style="font-size: 80px; margin-bottom: 16px;">${result1.emoji}</div>
          <div style="font-size: 32px; font-weight: 700; color: #333;">${result1.title}</div>
        </div>

        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
          color: white;
        ">
          <div style="
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">❤️</div>
        </div>

        <div style="
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          min-width: 300px;
        ">
          <div style="font-size: 80px; margin-bottom: 16px;">${result2.emoji}</div>
          <div style="font-size: 32px; font-weight: 700; color: #333;">${result2.title}</div>
        </div>
      </div>

      <div style="
        background: rgba(255, 255, 255, 0.95);
        border-radius: 24px;
        padding: 32px 64px;
        text-align: center;
      ">
        <div style="font-size: 28px; color: #666; margin-bottom: 12px;">${text.matchScore}</div>
        <div style="font-size: 72px; font-weight: 800; color: #667eea;">${matchPercentage}%</div>
      </div>

      <div style="
        margin-top: 40px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 24px;
      ">${text.compareAt}</div>
    </div>
  `;

  // This would use html2canvas in browser environment
  // For now, return the HTML
  return html;
}

/**
 * Generate friend comparison code
 */
export function generateFriendCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get comparison data by friend code
 */
export async function getComparisonByCode(
  friendCode: string,
): Promise<ComparisonResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("shared_results")
      .select(
        `
        result_id,
        metadata,
        test_results (
          test_id,
          result_type,
          percentage_scores,
          raw_answers
        )
      `,
      )
      .eq("share_token", friendCode)
      .eq("share_type", "friends")
      .single();

    if (error || !data) {
      return { success: false };
    }

    return {
      friendCode,
      success: true,
      // Additional comparison data would be populated here
    };
  } catch (error) {
    console.error("Failed to get comparison:", error);
    return { success: false };
  }
}

/**
 * Get popular comparison combinations
 */
export async function getPopularComparisons(limit: number = 10) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("shared_results")
      .select("result_id, view_count, metadata")
      .eq("share_type", "friends")
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Failed to get popular comparisons:", error);
    return [];
  }
}

/**
 * Calculate match percentage between two results
 */
function calculateMatchPercentage(
  scores1: Record<string, number>,
  scores2: Record<string, number>,
): number {
  const keys = Object.keys(scores1);
  if (keys.length === 0) return 0;

  let totalDifference = 0;
  for (const key of keys) {
    if (scores2[key] !== undefined) {
      totalDifference += Math.abs(scores1[key] - scores2[key]);
    }
  }

  const averageDifference = totalDifference / keys.length;
  return Math.max(0, 100 - averageDifference);
}

/**
 * Find different traits between two result types
 */
function findDifferentTraits(type1: string, type2: string): string[] {
  if (type1 === type2) {
    return [];
  }
  return ["Different approach to problems", "Varied communication styles"];
}

/**
 * Find shared traits between two result types
 */
function findSharedTraits(type1: string, type2: string): string[] {
  // This would be implemented based on actual result type definitions
  // For now, return a placeholder
  if (type1 === type2) {
    return ["Identical personality type"];
  }
  return ["Some shared characteristics"];
}
