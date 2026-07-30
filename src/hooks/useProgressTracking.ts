"use client";

import { useCallback, useEffect, useState } from "react";

import type { TestResultData } from "@/lib/system/database/results";

import { ProgressAnalyzer } from "@/lib/user/progress-tracking/analyzer";
import { ProgressRepository } from "@/lib/user/progress-tracking/repository";
import type {
  PersonalityScore,
  ProgressDashboard,
  TestProgress,
} from "@/lib/user/progress-tracking/types";

type TestResultPayload = Record<string, unknown> & {
  completionTime?: number;
  locale?: string;
  result?: {
    details?: {
      [key: string]: unknown;
      scores?: Record<string, number | string>;
    };
    score?: number;
    type?: string;
  };
  testId?: string;
  testSlug?: string;
  testTitle?: string;
};

interface UseProgressTrackingOptions {
  autoLoad?: boolean;
  userId?: string;
}

export function useProgressTracking({
  autoLoad = true,
  userId,
}: UseProgressTrackingOptions = {}) {
  const [dashboard, setDashboard] = useState<null | ProgressDashboard>(null);
  const [history, setHistory] = useState<TestProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  // Load user's progress dashboard
  const loadDashboard = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ProgressRepository.getProgressDashboard(userId);
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load progress data",
      );
      console.error("Error loading progress dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load user's test history
  const loadHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await ProgressRepository.getUserProgressHistory(userId);
      setHistory(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      console.error("Error loading progress history:", err);
      return [];
    }
  }, [userId]);

  // Record a new test completion
  const recordTestCompletion = useCallback(
    async (testData: {
      completionTime?: number;
      locale?: string;
      personalityScores: PersonalityScore[];
      resultType: string;
      testId: string;
      testSlug: string;
      testTitle: string;
    }) => {
      if (!userId) return;

      try {
        const { locale = "ko", ...rest } = testData;
        const testProgress: TestProgress = {
          completedAt: new Date(),
          id: `progress-${Date.now()}`,
          locale,
          userId,
          ...rest,
        };

        await ProgressRepository.saveTestProgress(testProgress);
        await ProgressRepository.updateGoalsProgress(userId, testProgress);

        // Refresh dashboard to show updated data
        await loadDashboard();

        return testProgress;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to record test completion",
        );
        console.error("Error recording test completion:", err);
        throw err;
      }
    },
    [userId, loadDashboard],
  );

  // Generate progress report for a specific period
  const generateReport = useCallback(
    async (period: "all" | "month" | "quarter" | "week" | "year" = "all") => {
      if (!userId) return null;

      try {
        const testHistory = (await loadHistory()) ?? [];
        return ProgressAnalyzer.analyzeUserProgress(testHistory, period);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate report",
        );
        console.error("Error generating progress report:", err);
        return null;
      }
    },
    [userId, loadHistory],
  );

  // Create a new goal
  const createGoal = useCallback(
    async (goalData: {
      deadline?: Date;
      description: string;
      targetValue: number;
      title: string;
      type:
        | "consistency"
        | "exploration"
        | "test_completion"
        | "trait_improvement";
    }) => {
      if (!userId) return null;

      try {
        const goal = await ProgressRepository.createGoal(userId, goalData);
        await loadDashboard(); // Refresh to show new goal
        return goal;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create goal");
        console.error("Error creating goal:", err);
        throw err;
      }
    },
    [userId, loadDashboard],
  );

  // Get progress comparison with other users
  const getComparison = useCallback(async () => {
    if (!userId) return null;

    try {
      return await ProgressRepository.getProgressComparison(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get comparison");
      console.error("Error getting progress comparison:", err);
      return null;
    }
  }, [userId]);

  // Auto-load dashboard when userId changes
  useEffect(() => {
    if (userId && autoLoad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- invoking async useCallback for data fetching is correct
      loadDashboard();
    }
  }, [userId, autoLoad, loadDashboard]);

  // Utility functions for components
  const getProgressLevel = useCallback(() => {
    if (!dashboard) return 1;
    return dashboard.user.level;
  }, [dashboard]);

  const getExperiencePoints = useCallback(() => {
    if (!dashboard) return 0;
    return dashboard.user.experiencePoints;
  }, [dashboard]);

  const getNextLevelProgress = useCallback(() => {
    if (!dashboard) return 0;
    const { experiencePoints, nextLevelPoints } = dashboard.user;
    return (experiencePoints / nextLevelPoints) * 100;
  }, [dashboard]);

  const hasCompletedTest = useCallback(
    (testSlug: string) => {
      return history.some((test) => test.testSlug === testSlug);
    },
    [history],
  );

  const getTestCount = useCallback(() => {
    return dashboard?.currentMetrics.totalCompletions || 0;
  }, [dashboard]);

  const getStreakDays = useCallback(() => {
    return dashboard?.currentMetrics.streak || 0;
  }, [dashboard]);

  const getRecentTrends = useCallback(() => {
    return dashboard?.recentTrends || [];
  }, [dashboard]);

  const getActiveGoals = useCallback(() => {
    return dashboard?.activeGoals || [];
  }, [dashboard]);

  const getRecentInsights = useCallback(() => {
    return dashboard?.recentInsights || [];
  }, [dashboard]);

  return {
    clearError: () => setError(null),
    createGoal,
    // Data
    dashboard,
    error,

    generateReport,
    getActiveGoals,
    getComparison,
    getExperiencePoints,
    getNextLevelProgress,
    // Utilities
    getProgressLevel,

    getRecentInsights,
    getRecentTrends,
    getStreakDays,
    getTestCount,
    hasCompletedTest,
    history,
    // Actions
    loadDashboard,
    loadHistory,
    loading,

    recordTestCompletion,
    // State management
    refresh: loadDashboard,
  };
}

// Hook for integrating progress tracking with test components
export function useTestProgressTracking(userId?: string) {
  const { getTestCount, hasCompletedTest, recordTestCompletion } =
    useProgressTracking({
      autoLoad: false,
      userId,
    });

  // Enhanced function to save test result with progress tracking
  const saveTestResultWithProgress = useCallback(
    async (testResult: TestResultPayload) => {
      try {
        const responses =
          "responses" in testResult &&
          typeof testResult.responses === "object" &&
          testResult.responses !== null
            ? (testResult.responses as Record<string, unknown>)
            : {};

        const percentageScores =
          testResult.result?.details?.scores &&
          Object.entries(testResult.result.details.scores).reduce<
            Record<string, number>
          >((acc, [trait, score]) => {
            const numericScore =
              typeof score === "number" ? score : Number(score);
            if (!Number.isNaN(numericScore)) {
              acc[trait] = numericScore;
            }
            return acc;
          }, {});

        const normalizedResult: TestResultData = {
          completionTimeSeconds:
            typeof testResult.completionTime === "number"
              ? testResult.completionTime
              : undefined,
          locale:
            typeof testResult.locale === "string" ? testResult.locale : "en",
          responses,
          result: {
            details: testResult.result?.details
              ? { ...testResult.result.details }
              : undefined,
            percentageScores:
              percentageScores && Object.keys(percentageScores).length > 0
                ? percentageScores
                : undefined,
            score:
              typeof testResult.result?.score === "number"
                ? testResult.result.score
                : undefined,
            type:
              typeof testResult.result?.type === "string"
                ? testResult.result.type
                : "unknown",
          },
          testId:
            typeof testResult.testId === "string"
              ? testResult.testId
              : undefined,
          testSlug:
            typeof testResult.testSlug === "string"
              ? testResult.testSlug
              : undefined,
        };

        if ("userId" in testResult && typeof testResult.userId === "string") {
          normalizedResult.userId = testResult.userId;
        }

        if (
          "sessionId" in testResult &&
          typeof testResult.sessionId === "string"
        ) {
          normalizedResult.sessionId = testResult.sessionId;
        }

        const { saveTestResult } =
          await import("@/lib/system/database/results");
        const savedResult = await saveTestResult(normalizedResult);
        const savedResultId =
          savedResult &&
          typeof savedResult === "object" &&
          "id" in savedResult &&
          typeof (savedResult as { id: unknown }).id === "string"
            ? (savedResult as { id: string }).id
            : undefined;

        if (userId && normalizedResult.result) {
          await recordTestCompletion({
            completionTime: normalizedResult.completionTimeSeconds,
            locale: normalizedResult.locale,
            personalityScores: extractPersonalityScores(testResult),
            resultType: normalizedResult.result.type || "unknown",
            testId:
              normalizedResult.testId ||
              savedResultId ||
              normalizedResult.testSlug ||
              "",
            testSlug: normalizedResult.testSlug || "",
            testTitle:
              typeof testResult.testTitle === "string"
                ? testResult.testTitle
                : normalizedResult.testSlug || "",
          });
        }

        return savedResult;
      } catch (error) {
        console.error("Error saving test result with progress:", error);
        throw error;
      }
    },
    [userId, recordTestCompletion],
  );

  return {
    getTestCount,
    hasCompletedTest,
    recordTestCompletion,
    saveTestResultWithProgress,
  };
}

// Helper function to extract personality scores from test results
function extractPersonalityScores(
  testResult: TestResultPayload,
): PersonalityScore[] {
  const scores: PersonalityScore[] = [];

  if (testResult.result?.details?.scores) {
    Object.entries(testResult.result.details.scores).forEach(
      ([trait, score]) => {
        scores.push({
          description: `${trait} personality trait score`,
          label: trait.charAt(0).toUpperCase() + trait.slice(1),
          score:
            typeof score === "number"
              ? score
              : parseFloat(score as string) || 0,
          trait,
        });
      },
    );
  }

  if (testResult.result?.score && typeof testResult.result.score === "number") {
    scores.push({
      description: "General personality assessment score",
      label: "Overall Score",
      score: testResult.result.score,
      trait: "overall",
    });
  }

  return scores;
}
