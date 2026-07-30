// Personal Progress Tracking Repository
// Updated to use Supabase-backed test results (2025-09-18)

import {
  getUserTestResults,
  type UserTestResult,
} from "@/lib/system/database/results";
import { secureCache } from "@/lib/system/storage/secure-cache";

import { ProgressAnalyzer } from "./analyzer";
import type {
  PersonalityScore,
  PersonalityTrend,
  ProgressDashboard,
  ProgressGoal,
  ProgressMetrics,
  TestProgress,
} from "./types";

type SerializedTestProgress = Omit<TestProgress, "completedAt"> & {
  completedAt: string;
};

export class ProgressRepository {
  private static STORAGE_KEYS = {
    PROGRESS_GOALS: "progress-goals",
    PROGRESS_HISTORY: "progress-history",
  } as const;

  static async createGoal(
    userId: string,
    goal: Omit<
      ProgressGoal,
      "createdAt" | "currentValue" | "id" | "isCompleted" | "userId"
    >,
  ): Promise<ProgressGoal> {
    const newGoal: ProgressGoal = {
      createdAt: new Date(),
      currentValue: 0,
      id: `goal-${Date.now()}`,
      isCompleted: false,
      userId,
      ...goal,
    };

    const goals = await this.getUserGoals(userId);
    goals.push(newGoal);
    secureCache.set(`${this.STORAGE_KEYS.PROGRESS_GOALS}-${userId}`, goals);
    return newGoal;
  }

  static async getProgressComparison(_userId: string) {
    const userId = _userId;

    const [userHistory, allResults] = await Promise.all([
      this.getUserProgressHistory(userId),
      getUserTestResults(200).catch((error) => {
        console.error("Error loading comparison dataset:", error);
        return [] as UserTestResult[];
      }),
    ]);

    const userReport = ProgressAnalyzer.analyzeUserProgress(userHistory, "all");

    const peerHistories = new Map<string, TestProgress[]>();
    allResults.forEach((result) => {
      const ownerId = result.user_id;

      if (!ownerId || ownerId === userId) {
        return;
      }

      const progress = this.mapResultToProgress(result, ownerId);
      if (!peerHistories.has(ownerId)) {
        peerHistories.set(ownerId, []);
      }
      peerHistories.get(ownerId)!.push(progress);
    });

    const peerReports = Array.from(peerHistories.values())
      .filter((history) => history.length > 0)
      .map((history) => ProgressAnalyzer.analyzeUserProgress(history, "all"));

    if (peerReports.length === 0) {
      return {
        consistencyScore: Math.round(userReport.metrics.consistencyScore),
        personalityGrowth: 50,
        testingFrequency: 50,
      };
    }

    const totals = peerReports.reduce(
      (acc, report) => {
        acc.totalTests += report.metrics.totalTests;
        acc.totalCompletions += report.metrics.totalCompletions;
        acc.consistencyScore += report.metrics.consistencyScore;
        acc.averageCompletionTime += report.metrics.averageCompletionTime;
        acc.trendCount += report.trends.length;
        acc.streak += report.metrics.streak;
        return acc;
      },
      {
        averageCompletionTime: 0,
        consistencyScore: 0,
        streak: 0,
        totalCompletions: 0,
        totalTests: 0,
        trendCount: 0,
      },
    );

    const peerCount = peerReports.length;
    const averages = {
      averageCompletionTime: totals.averageCompletionTime / peerCount,
      consistencyScore: totals.consistencyScore / peerCount,
      streak: totals.streak / peerCount,
      totalCompletions: totals.totalCompletions / peerCount,
      totalTests: totals.totalTests / peerCount,
      trendCount: totals.trendCount / peerCount,
    };

    const normalizeScore = (userValue: number, peerValue: number) => {
      if (!Number.isFinite(userValue)) return 50;
      if (!Number.isFinite(peerValue) || peerValue <= 0) {
        return Math.max(20, Math.min(95, Math.round(userValue > 0 ? 75 : 45)));
      }

      const ratio = userValue / peerValue;
      const rawScore = 50 + (ratio - 1) * 40;
      return Math.max(10, Math.min(95, Math.round(rawScore)));
    };

    return {
      consistencyScore: normalizeScore(
        userReport.metrics.consistencyScore,
        averages.consistencyScore || 1,
      ),
      personalityGrowth: normalizeScore(
        userReport.trends.length,
        averages.trendCount || 1,
      ),
      testingFrequency: normalizeScore(
        userReport.metrics.totalCompletions,
        averages.totalCompletions || 1,
      ),
    };
  }

  static async getProgressDashboard(
    userId: string,
  ): Promise<ProgressDashboard> {
    try {
      const history = await this.getUserProgressHistory(userId);
      const goals = await this.getUserGoals(userId);

      const report = ProgressAnalyzer.analyzeUserProgress(history, "all");
      const userLevel = this.calculateUserLevel(
        report.metrics.totalCompletions,
      );
      const experiencePoints = report.metrics.totalCompletions * 100;
      const nextLevelPoints = (userLevel + 1) * 500;

      const achievements = this.generateAchievements(report.metrics, history);

      return {
        achievements: achievements.slice(0, 5),
        activeGoals: goals.filter((goal) => !goal.isCompleted),
        currentMetrics: report.metrics,
        recentInsights: report.insights.slice(0, 10),
        recentTrends: report.trends.slice(0, 5),
        user: {
          experiencePoints,
          id: userId,
          level: userLevel,
          nextLevelPoints,
        },
      };
    } catch (error) {
      console.error("Error building progress dashboard:", error);
      return {
        achievements: [],
        activeGoals: [],
        currentMetrics: {
          averageCompletionTime: 0,
          consistencyScore: 0,
          favoriteCategory: "personality",
          growthTrend: "stable",
          lastTestDate: new Date(),
          streak: 0,
          totalCompletions: 0,
          totalTests: 0,
        },
        recentInsights: [],
        recentTrends: [],
        user: {
          experiencePoints: 0,
          id: userId,
          level: 1,
          nextLevelPoints: 500,
        },
      };
    }
  }

  static async getUserGoals(userId: string): Promise<ProgressGoal[]> {
    try {
      return secureCache.get(
        `${this.STORAGE_KEYS.PROGRESS_GOALS}-${userId}`,
        [] as ProgressGoal[],
      );
    } catch (error) {
      console.error("Error retrieving user goals:", error);
      return [];
    }
  }

  /**
   * Pull the user's historical test results from Supabase and convert to progress entries.
   */
  static async getUserProgressHistory(userId: string): Promise<TestProgress[]> {
    try {
      const results = await getUserTestResults();
      const history = results
        .filter((result) => !result.user_id || result.user_id === userId)
        .map((result) => this.mapResultToProgress(result, userId));

      const cachedHistory = this.getCachedProgressHistory(userId);
      const combined = [...history];

      cachedHistory.forEach((cachedEntry) => {
        if (!combined.some((existing) => existing.id === cachedEntry.id)) {
          combined.push(cachedEntry);
        }
      });

      return combined.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );
    } catch (error) {
      console.error("Error loading progress history:", error);
      return this.getCachedProgressHistory(userId);
    }
  }

  /**
   * Persist a progress entry locally to bridge offline sessions or non-authenticated users.
   */
  static async saveTestProgress(testProgress: TestProgress): Promise<void> {
    try {
      const storageKey = this.resolveHistoryStorageKey(
        testProgress.userId,
        testProgress.sessionId,
      );
      const serializedEntry = this.serializeTestProgress(testProgress);

      let existing = secureCache.get<Array<SerializedTestProgress>>(
        storageKey,
        [],
      );

      if (testProgress.userId && testProgress.sessionId) {
        const sessionKey = this.resolveHistoryStorageKey(
          undefined,
          testProgress.sessionId,
        );
        if (sessionKey !== storageKey) {
          const sessionEntries = secureCache.get<Array<SerializedTestProgress>>(
            sessionKey,
            [],
          );
          if (sessionEntries.length > 0) {
            existing = [...sessionEntries, ...existing];
            secureCache.remove(sessionKey);
          }
        }
      }

      const merged = [serializedEntry, ...existing];
      const unique = this.dedupeSerializedProgress(merged);

      unique.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );

      secureCache.set(storageKey, unique.slice(0, 200));
    } catch (error) {
      console.error("Error saving test progress:", error);
    }
  }

  static async updateGoalsProgress(
    userId: string,
    testProgress: TestProgress,
  ): Promise<void> {
    const goals = await this.getUserGoals(userId);
    if (goals.length === 0) {
      return;
    }

    const history = await this.getUserProgressHistory(userId);
    const fullHistory = this.ensureHistoryIncludesTest(history, testProgress);
    const analysis = ProgressAnalyzer.analyzeUserProgress(fullHistory, "all");
    const trends = ProgressAnalyzer.analyzePersonalityTrends(fullHistory);
    const categoryCount = this.countUniqueCategories(fullHistory);
    const bestTraitGain = this.getBestTraitImprovement(trends);

    let goalsUpdated = false;

    goals.forEach((goal) => {
      if (goal.isCompleted) {
        return;
      }

      const previousValue = goal.currentValue;

      switch (goal.type) {
        case "consistency":
          goal.currentValue = Math.max(
            goal.currentValue,
            Math.round(analysis.metrics.consistencyScore),
          );
          break;
        case "exploration":
          goal.currentValue = Math.max(goal.currentValue, categoryCount);
          break;
        case "test_completion":
          goal.currentValue += 1;
          break;
        case "trait_improvement":
          goal.currentValue = Math.max(
            goal.currentValue,
            Math.round(bestTraitGain),
          );
          break;
        default:
          break;
      }

      if (goal.currentValue !== previousValue) {
        goalsUpdated = true;
      }

      if (goal.currentValue >= goal.targetValue && !goal.isCompleted) {
        goal.isCompleted = true;
        goal.completedAt = new Date();
        goalsUpdated = true;
      }
    });

    if (goalsUpdated) {
      secureCache.set(`${this.STORAGE_KEYS.PROGRESS_GOALS}-${userId}`, goals);
    }
  }

  private static calculateUserLevel(totalCompletions: number): number {
    return Math.floor(totalCompletions / 5) + 1;
  }

  private static categorizeTest(testSlug: string): string {
    if (testSlug.includes("career") || testSlug.includes("work"))
      return "career";
    if (
      testSlug.includes("stress") ||
      testSlug.includes("sleep") ||
      testSlug.includes("wellness")
    )
      return "wellness";
    if (
      testSlug.includes("travel") ||
      testSlug.includes("food") ||
      testSlug.includes("lifestyle")
    )
      return "lifestyle";
    if (
      testSlug.includes("friend") ||
      testSlug.includes("love") ||
      testSlug.includes("relationship.compatibility")
    )
      return "relationships";
    if (
      testSlug.includes("art") ||
      testSlug.includes("music") ||
      testSlug.includes("creative")
    )
      return "creative";
    if (
      testSlug.includes("dream") ||
      testSlug.includes("insight") ||
      testSlug.includes("horoscope")
    )
      return "insight";
    return "personality";
  }

  private static countUniqueCategories(history: TestProgress[]): number {
    const categories = new Set<string>();
    history.forEach((entry) => {
      categories.add(this.categorizeTest(entry.testSlug));
    });
    return categories.size;
  }

  private static dedupeSerializedProgress(
    entries: SerializedTestProgress[],
  ): SerializedTestProgress[] {
    const seen = new Set<string>();
    const deduped: SerializedTestProgress[] = [];

    for (const entry of entries) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      deduped.push(entry);
    }

    return deduped;
  }

  private static deserializeTestProgress(
    progress: SerializedTestProgress,
  ): TestProgress {
    return {
      ...progress,
      completedAt: new Date(progress.completedAt),
    };
  }

  private static ensureHistoryIncludesTest(
    history: TestProgress[],
    latest: TestProgress,
  ): TestProgress[] {
    const exists = history.some((entry) => entry.id === latest.id);
    if (exists) {
      return history;
    }

    return [latest, ...history].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  }

  private static extractPersonalityScores(
    result: UserTestResult,
  ): PersonalityScore[] {
    const scores: PersonalityScore[] = [];
    const percentages = result.percentage_scores ?? {};

    Object.entries(percentages).forEach(([trait, value]) => {
      const numericValue = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(numericValue)) {
        scores.push({
          description: this.getTraitDescription(trait),
          label: this.getTraitLabel(trait),
          score: numericValue,
          trait,
        });
      }
    });

    if (scores.length === 0 && typeof result.result.score === "number") {
      scores.push({
        description: "Overall personality assessment score",
        label: "Overall",
        score: result.result.score,
        trait: "overall",
      });
    }

    return scores;
  }

  private static formatTitleFromSlug(slug: string): string {
    return slug
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private static generateAchievements(
    metrics: ProgressMetrics,
    history: TestProgress[],
  ): Array<{
    description: string;
    id: string;
    title: string;
    unlockedAt: Date;
  }> {
    const achievements: Array<{
      description: string;
      id: string;
      title: string;
      unlockedAt: Date;
    }> = [];

    if (metrics.totalCompletions >= 1) {
      achievements.push({
        description: "Completed your first personality test",
        id: "first-test",
        title: "First Steps",
        unlockedAt: history[history.length - 1]?.completedAt || new Date(),
      });
    }

    if (metrics.totalCompletions >= 5) {
      achievements.push({
        description: "Completed 5 personality tests",
        id: "explorer",
        title: "Explorer",
        unlockedAt:
          history[Math.max(history.length - 5, 0)]?.completedAt || new Date(),
      });
    }

    if (metrics.totalCompletions >= 10) {
      achievements.push({
        description: "Completed 10 personality tests",
        id: "expert",
        title: "Personality Expert",
        unlockedAt:
          history[Math.max(history.length - 10, 0)]?.completedAt || new Date(),
      });
    }

    if (metrics.streak >= 7) {
      achievements.push({
        description: "Maintained a 7-day testing streak",
        id: "weekly-streak",
        title: "Weekly Warrior",
        unlockedAt: new Date(),
      });
    }

    return achievements;
  }

  private static getBestTraitImprovement(trends: PersonalityTrend[]): number {
    if (trends.length === 0) {
      return 0;
    }

    return trends.reduce((max, trend) => {
      return trend.change > max ? trend.change : max;
    }, 0);
  }

  private static getCachedProgressHistory(userId: string): TestProgress[] {
    const storageKey = this.resolveHistoryStorageKey(userId);
    try {
      const stored = secureCache.get<Array<SerializedTestProgress>>(
        storageKey,
        [],
      );
      if (!Array.isArray(stored) || stored.length === 0) {
        return [];
      }

      return stored
        .map((entry) => this.deserializeTestProgress(entry))
        .sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
        );
    } catch (error) {
      console.error("Error loading cached progress history:", error);
      return [];
    }
  }

  private static getTestTitle(testSlug: string): string {
    const titles: Record<string, string> = {
      "color-personality": "Color Personality",
      "communication-style": "Communication Style Test",
      "decision-maker": "Decision Making Style",
      egenteto: "Korean Personality Test",
      "food-personality": "Food Personality",
      "love-language": "Love Language Test",
      "travel-personality": "Travel Personality",
    };

    return titles[testSlug] || this.formatTitleFromSlug(testSlug);
  }

  private static getTraitDescription(trait: string): string {
    const descriptions: Record<string, string> = {
      agreeableness: "Compassion, cooperation, and social harmony.",
      conscientiousness: "Self-discipline and organization tendencies.",
      extroversion: "Energy gained through social interaction.",
      introversion: "Energy gained through solitude and reflection.",
      neuroticism: "Sensitivity to stress and emotional stability.",
      openness: "Appreciation for imagination and new experiences.",
    };

    return descriptions[trait.toLowerCase()] || `Trait: ${trait}`;
  }

  private static getTraitLabel(trait: string): string {
    const labels: Record<string, string> = {
      agreeableness: "Agreeableness",
      conscientiousness: "Conscientiousness",
      extroversion: "Extroversion",
      feeling: "Feeling",
      introversion: "Introversion",
      intuition: "Intuition",
      judging: "Judging",
      neuroticism: "Emotional Stability",
      openness: "Openness",
      perceiving: "Perceiving",
      sensing: "Sensing",
      thinking: "Thinking",
    };

    return labels[trait.toLowerCase()] || this.formatTitleFromSlug(trait);
  }

  private static mapResultToProgress(
    result: UserTestResult,
    fallbackUserId: string,
  ): TestProgress {
    const scores = this.extractPersonalityScores(result);
    const testTitle =
      result.test?.name_en || this.getTestTitle(result.test_slug);

    return {
      completedAt: new Date(result.created_at),
      completionTime: result.completion_time_seconds ?? undefined,
      id: result.id,
      locale: result.locale ?? "en",
      personalityScores: scores,
      resultType: result.result.type,
      sessionId: result.session_id ?? undefined,
      testId: result.test_id ?? result.test_slug,
      testSlug: result.test_slug,
      testTitle,
      userId: result.user_id ?? fallbackUserId,
    };
  }

  private static resolveHistoryStorageKey(
    userId?: string,
    sessionId?: string,
  ): string {
    const key =
      (userId && userId.trim()) ||
      (sessionId && sessionId.trim()) ||
      "anonymous";
    return `${this.STORAGE_KEYS.PROGRESS_HISTORY}-${key}`;
  }

  private static serializeTestProgress(
    progress: TestProgress,
  ): SerializedTestProgress {
    return {
      ...progress,
      completedAt: progress.completedAt.toISOString(),
    };
  }
}
