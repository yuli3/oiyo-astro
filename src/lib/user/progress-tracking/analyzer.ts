// Personal Progress Tracking Analyzer
// Created: 2025-09-18

import {
  PersonalityTrend,
  ProgressInsight,
  ProgressMetrics,
  ProgressReport,
  TestProgress,
} from "./types";

export class ProgressAnalyzer {
  /**
   * Analyze personality trait trends over time
   */
  static analyzePersonalityTrends(
    testHistory: TestProgress[],
  ): PersonalityTrend[] {
    const traitData = new Map<
      string,
      Array<{
        date: Date;
        score: number;
        testSlug: string;
      }>
    >();

    // Collect all trait scores over time
    testHistory.forEach((test) => {
      test.personalityScores.forEach((score) => {
        if (!traitData.has(score.trait)) {
          traitData.set(score.trait, []);
        }
        traitData.get(score.trait)!.push({
          date: new Date(test.completedAt),
          score: score.score,
          testSlug: test.testSlug,
        });
      });
    });

    const trends: PersonalityTrend[] = [];

    traitData.forEach((dataPoints, trait) => {
      if (dataPoints.length < 2) return; // Need at least 2 data points for trend

      // Sort by date
      dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

      const firstScore = dataPoints[0];
      const lastScore = dataPoints[dataPoints.length - 1];
      const change = lastScore.score - firstScore.score;

      const changeLabel = this.getChangeLabel(change);

      trends.push({
        change,
        changeLabel,
        currentScore: lastScore.score,
        dataPoints,
        firstRecorded: firstScore.date,
        label: this.getTraitLabel(trait),
        lastRecorded: lastScore.date,
        previousScore:
          dataPoints.length > 1
            ? dataPoints[dataPoints.length - 2].score
            : undefined,
        trait,
      });
    });

    return trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }

  /**
   * Analyze user's test history to generate comprehensive progress insights
   */
  static analyzeUserProgress(
    testHistory: TestProgress[],
    period: "all" | "month" | "quarter" | "week" | "year" = "all",
  ): ProgressReport {
    const filteredHistory = this.filterByPeriod(testHistory, period);

    const metrics = this.calculateMetrics(filteredHistory);
    const trends = this.analyzePersonalityTrends(filteredHistory);
    const insights = this.generateInsights(filteredHistory, trends, metrics);

    return {
      generatedAt: new Date(),
      insights,
      metrics,
      period,
      testHistory: filteredHistory,
      trends,
      userId: filteredHistory[0]?.userId || "anonymous",
    };
  }

  /**
   * Calculate basic progress metrics
   */
  static calculateMetrics(testHistory: TestProgress[]): ProgressMetrics {
    if (testHistory.length === 0) {
      return {
        averageCompletionTime: 0,
        consistencyScore: 0,
        favoriteCategory: "none",
        growthTrend: "stable",
        lastTestDate: new Date(),
        streak: 0,
        totalCompletions: 0,
        totalTests: 0,
      };
    }

    const sortedHistory = [...testHistory].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    const uniqueTests = new Set(testHistory.map((t) => t.testSlug)).size;
    const totalCompletions = testHistory.length;

    const completionTimes = testHistory
      .filter((t) => t.completionTime)
      .map((t) => t.completionTime!);
    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    // Calculate favorite category (most frequent test pattern)
    const testCounts = testHistory.reduce(
      (acc, test) => {
        const category = this.categorizeTest(test.testSlug);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const favoriteCategory =
      Object.entries(testCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "personality";

    // Calculate consistency score (based on regularity of testing)
    const consistencyScore = this.calculateConsistencyScore(sortedHistory);

    // Calculate growth trend
    const growthTrend = this.calculateGrowthTrend(testHistory);

    // Calculate streak
    const streak = this.calculateTestingStreak(sortedHistory);

    return {
      averageCompletionTime,
      consistencyScore,
      favoriteCategory,
      growthTrend,
      lastTestDate: sortedHistory[0]?.completedAt || new Date(),
      streak,
      totalCompletions,
      totalTests: uniqueTests,
    };
  }

  /**
   * Generate personalized insights based on progress data
   */
  static generateInsights(
    testHistory: TestProgress[],
    trends: PersonalityTrend[],
    metrics: ProgressMetrics,
  ): ProgressInsight[] {
    const insights: ProgressInsight[] = [];
    const now = new Date();

    // Milestone insights
    if (metrics.totalCompletions === 1) {
      insights.push({
        createdAt: now,
        description:
          "You've completed your first personality test. This is the beginning of your self-discovery journey.",
        id: `milestone-first-${now.getTime()}`,
        severity: "achievement",
        title: "First Step Taken!",
        type: "milestone",
      });
    }

    if (metrics.totalCompletions === 5) {
      insights.push({
        createdAt: now,
        description:
          "You've completed 5 personality tests. You're developing a comprehensive understanding of yourself.",
        id: `milestone-explorer-${now.getTime()}`,
        severity: "achievement",
        title: "Explorer Unlocked!",
        type: "milestone",
      });
    }

    // Consistency insights
    if (metrics.consistencyScore >= 80) {
      insights.push({
        createdAt: now,
        data: { score: metrics.consistencyScore },
        description:
          "Your regular testing pattern shows strong commitment to personal growth.",
        id: `consistency-high-${now.getTime()}`,
        severity: "positive",
        title: "Highly Consistent",
        type: "consistency",
      });
    }

    if (metrics.streak >= 7) {
      insights.push({
        createdAt: now,
        data: { streak: metrics.streak },
        description: `You've been actively exploring your personality for ${metrics.streak} days straight.`,
        id: `streak-week-${now.getTime()}`,
        severity: "achievement",
        title: "Week-Long Streak!",
        type: "consistency",
      });
    }

    // Trait change insights
    trends.forEach((trend) => {
      if (Math.abs(trend.change) >= 20) {
        insights.push({
          createdAt: now,
          data: { change: trend.change, trait: trend.trait },
          description: `Your ${trend.label.toLowerCase()} has ${trend.change > 0 ? "grown" : "shifted"} by ${Math.abs(trend.change).toFixed(1)} points over time.`,
          id: `trait-change-${trend.trait}-${now.getTime()}`,
          severity: Math.abs(trend.change) >= 30 ? "warning" : "info",
          title: `${trend.label} ${trend.change > 0 ? "Increased" : "Decreased"}`,
          type: "trait_change",
        });
      }
    });

    // Growth trend insights
    if (metrics.growthTrend === "improving") {
      insights.push({
        createdAt: now,
        description:
          "Your personality scores show consistent improvement and development.",
        id: `growth-improving-${now.getTime()}`,
        severity: "positive",
        title: "Positive Growth Trend",
        type: "growth",
      });
    }

    // Recommendation insights
    if (metrics.totalTests < 3) {
      insights.push({
        createdAt: now,
        description:
          "Try tests from different categories to get a more complete personality profile.",
        id: `recommendation-explore-${now.getTime()}`,
        severity: "info",
        title: "Explore More Areas",
        type: "recommendation",
      });
    }

    return insights.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  private static calculateConsistencyScore(
    testHistory: TestProgress[],
  ): number {
    if (testHistory.length < 2) return 0;

    // Calculate average time between tests
    const intervals = [];
    for (let i = 1; i < testHistory.length; i++) {
      const interval =
        new Date(testHistory[i - 1].completedAt).getTime() -
        new Date(testHistory[i].completedAt).getTime();
      intervals.push(interval);
    }

    if (intervals.length === 0) return 0;

    // Calculate variance in intervals (lower variance = more consistent)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((acc, interval) => {
        return acc + Math.pow(interval - avgInterval, 2);
      }, 0) / intervals.length;

    // Convert to 0-100 score (lower variance = higher score)
    const maxVariance = Math.pow(avgInterval, 2);
    const score = Math.max(0, 100 - (variance / maxVariance) * 100);

    return Math.min(100, score);
  }

  private static calculateGrowthTrend(
    testHistory: TestProgress[],
  ): "declining" | "improving" | "stable" {
    if (testHistory.length < 3) return "stable";

    // Calculate overall score trend
    const recentTests = testHistory
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      )
      .slice(0, 5);

    const scores = recentTests.map((test) => {
      return (
        test.personalityScores.reduce((sum, score) => sum + score.score, 0) /
        test.personalityScores.length
      );
    });

    if (scores.length < 2) return "stable";

    const trend = scores[0] - scores[scores.length - 1];

    if (trend > 5) return "improving";
    if (trend < -5) return "declining";
    return "stable";
  }

  private static calculateTestingStreak(testHistory: TestProgress[]): number {
    if (testHistory.length === 0) return 0;

    const sortedTests = testHistory.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    let streak = 0;
    let currentDate = new Date();

    for (const test of sortedTests) {
      const testDate = new Date(test.completedAt);
      const daysDiff = Math.floor(
        (currentDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= 1) {
        streak++;
        currentDate = testDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private static categorizeTest(testSlug: string): string {
    if (testSlug.includes("mbti") || testSlug.includes("personality"))
      return "personality";
    if (testSlug.includes("career") || testSlug.includes("job"))
      return "career";
    if (testSlug.includes("relationship") || testSlug.includes("love"))
      return "relationships";
    if (testSlug.includes("lifestyle") || testSlug.includes("habits"))
      return "lifestyle";
    if (testSlug.includes("wellness") || testSlug.includes("health"))
      return "wellness";
    return "general";
  }

  // Helper methods
  private static filterByPeriod(
    testHistory: TestProgress[],
    period: string,
  ): TestProgress[] {
    if (period === "all") return testHistory;

    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return testHistory.filter(
      (test) => new Date(test.completedAt) >= cutoffDate,
    );
  }

  private static getChangeLabel(
    change: number,
  ):
    | "decrease"
    | "increase"
    | "significant_decrease"
    | "significant_increase"
    | "stable" {
    if (change >= 20) return "significant_increase";
    if (change >= 5) return "increase";
    if (change <= -20) return "significant_decrease";
    if (change <= -5) return "decrease";
    return "stable";
  }

  private static getTraitLabel(trait: string): string {
    const labels: Record<string, string> = {
      agreeableness: "Agreeableness",
      analytical: "Analytical Thinking",
      conscientiousness: "Conscientiousness",
      creativity: "Creativity",
      empathy: "Empathy",
      extroversion: "Extroversion",
      leadership: "Leadership",
      neuroticism: "Emotional Stability",
      openness: "Openness",
      social: "Social Skills",
    };

    return labels[trait] || trait.charAt(0).toUpperCase() + trait.slice(1);
  }
}
