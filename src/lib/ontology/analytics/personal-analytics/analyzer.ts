"use client";

import { secureCache } from "@/lib/system/storage/secure-cache";

import type {
  AnalyticsMetrics,
  ComparisonData,
  PersonalityInsight,
  PersonalitySnapshot,
  PersonalityTrend,
  WeeklyDigest,
} from "./types";

/**
 * Personal Analytics Analyzer
 * Analyzes personality test data over time to provide insights and trends
 */
const TEST_RESULT_SOURCES = [
  { alias: "egenteto", key: "egenteto-result" },
  { alias: "color-personality", key: "color-personality-result" },
  { alias: "communication-style", key: "communication-style-result" },
  { alias: "decision-making", key: "decision-making-result" },
  { alias: "travel-personality", key: "travel-personality-result" },
  { alias: "food-personality", key: "food-personality-result" },
  { alias: "music-taste", key: "music-taste-result" },
  { alias: "dream-interpretation", key: "dream-interpretation-latest" },
  { alias: "mbti", key: "mbti_test_data" },
] as const;

export class PersonalAnalyticsAnalyzer {
  private static readonly SNAPSHOT_KEY = "personality-snapshots";
  private static readonly STORAGE_KEY = "personal-analytics";

  /**
   * Analyze personality trends over time
   */
  public analyzeTrends(
    timeframe: "month" | "quarter" | "week" | "year" = "month",
  ): PersonalityTrend[] {
    const snapshots = this.getSnapshots();
    if (snapshots.length < 2) return [];

    const trends: PersonalityTrend[] = [];
    const cutoffDate = this.getCutoffDate(timeframe);
    const recentSnapshots = snapshots.filter(
      (s) => s.timestamp >= cutoffDate.getTime(),
    );

    if (recentSnapshots.length < 2) return trends;

    // Analyze trends for each test type
    const testTypes = this.getCommonTestTypes(recentSnapshots);

    testTypes.forEach((testType) => {
      const dataPoints = recentSnapshots
        .filter((s) => s.testResults[testType])
        .map((s) => ({
          date: s.date,
          label: s.testResults[testType].type,
          value: this.extractNumericValue(s.testResults[testType]),
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      if (dataPoints.length >= 2) {
        const trend = this.calculateTrend(dataPoints);
        const insights = this.generateTrendInsights(
          testType,
          dataPoints,
          trend,
        );

        trends.push({
          changePercentage: trend.changePercentage,
          dataPoints,
          insights,
          testType,
          timeframe,
          trend: trend.direction,
        });
      }
    });

    return trends;
  }

  /**
   * Calculate analytics metrics
   */
  public calculateMetrics(snapshots: PersonalitySnapshot[]): AnalyticsMetrics {
    if (snapshots.length === 0) {
      return {
        averageTestsPerWeek: 0,
        completionTrend: "stable",
        currentStreak: 0,
        growthScore: 0,
        longestStreak: 0,
        mostFrequentTraits: [],
        personalityStability: 0,
        totalSnapshots: 0,
      };
    }

    const sortedSnapshots = [...snapshots].sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    return {
      averageTestsPerWeek: this.calculateAverageTestsPerWeek(snapshots),
      completionTrend: this.analyzeCompletionTrend(snapshots),
      currentStreak: this.calculateCurrentStreak(sortedSnapshots),
      growthScore: this.calculateGrowthScore(snapshots),
      longestStreak: this.calculateLongestStreak(sortedSnapshots),
      mostFrequentTraits: this.findMostFrequentTraits(snapshots),
      personalityStability: this.calculateStability(snapshots),
      totalSnapshots: snapshots.length,
    };
  }

  /**
   * Compare two personality snapshots
   */
  public compareSnapshots(
    current: PersonalitySnapshot,
    previous: PersonalitySnapshot,
  ): ComparisonData {
    const changes: {
      changeType: "changed" | "declined" | "improved" | "stable";
      newValue: number | string;
      oldValue: number | string;
      testType: string;
    }[] = [];
    const timespan = Math.floor(
      (current.timestamp - previous.timestamp) / (1000 * 60 * 60 * 24),
    );

    // Compare each test type
    Object.keys(current.testResults).forEach((testType) => {
      const currentResult = current.testResults[testType];
      const previousResult = previous.testResults[testType];

      if (previousResult) {
        // Compare type changes
        if (currentResult.type !== previousResult.type) {
          changes.push({
            changeType: "changed" as const,
            newValue: currentResult.type,
            oldValue: previousResult.type,
            testType,
          });
        }

        // Compare score changes
        if (currentResult.score && previousResult.score) {
          const scoreDiff = currentResult.score - previousResult.score;
          const changeType =
            scoreDiff > 0
              ? ("improved" as const)
              : scoreDiff < 0
                ? ("declined" as const)
                : ("stable" as const);

          changes.push({
            changeType,
            newValue: currentResult.score,
            oldValue: previousResult.score,
            testType: `${testType}_score`,
          });
        }
      }
    });

    return {
      changes,
      current,
      previous,
      timespan,
    };
  }

  /**
   * Create a personality snapshot from current test results
   */
  public createSnapshot(_locale: string = "ko"): null | PersonalitySnapshot {
    if (typeof window === "undefined") return null;

    try {
      const snapshot: PersonalitySnapshot = {
        completedTests: [],
        completionRate: 0,
        date: new Date().toISOString().split("T")[0],
        id: this.generateSnapshotId(),
        testResults: {},
        timestamp: Date.now(),
        totalTests: 0,
      };

      TEST_RESULT_SOURCES.forEach(({ alias, key }) => {
        const stored = this.readResultFromStorage(key);
        if (!stored) return;

        const normalized = this.normalizeResultData(stored);
        if (!normalized) return;

        snapshot.testResults[alias] = normalized;
        snapshot.completedTests.push(alias);
      });

      snapshot.totalTests = snapshot.completedTests.length;
      const possibleTests = TEST_RESULT_SOURCES.length;
      snapshot.completionRate =
        possibleTests > 0
          ? Math.round((snapshot.totalTests / possibleTests) * 100)
          : 0;

      if (snapshot.completedTests.length > 0) {
        this.saveSnapshot(snapshot);
        return snapshot;
      }

      return null;
    } catch (error) {
      console.error("Error creating personality snapshot:", error);
      return null;
    }
  }

  /**
   * Generate personalized insights from analytics data
   */
  public generateInsights(
    snapshots: PersonalitySnapshot[],
  ): PersonalityInsight[] {
    const insights: PersonalityInsight[] = [];

    if (snapshots.length < 2) return insights;

    // Growth insights
    const growthInsights = this.analyzeGrowthPatterns(snapshots);
    insights.push(...growthInsights);

    // Pattern insights
    const patternInsights = this.analyzePersonalityPatterns(snapshots);
    insights.push(...patternInsights);

    // Achievement insights
    const achievementInsights = this.identifyAchievements(snapshots);
    insights.push(...achievementInsights);

    // Recommendation insights
    const recommendationInsights = this.generateRecommendations(snapshots);
    insights.push(...recommendationInsights);

    return insights.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Generate weekly digest
   */
  public generateWeeklyDigest(): WeeklyDigest {
    const snapshots = this.getSnapshots();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklySnapshots = snapshots.filter(
      (s) => s.timestamp >= weekStart.getTime(),
    );
    const insights = this.generateInsights(snapshots);
    const recentInsights = insights.filter(
      (i) => i.timestamp >= weekStart.getTime(),
    );

    const moodValues: Record<
      NonNullable<PersonalitySnapshot["mood"]>,
      number
    > = {
      negative: 0,
      neutral: 0.5,
      positive: 1,
    };

    const weeklyMoodScores = weeklySnapshots
      .map((snapshot) => snapshot.mood)
      .filter((mood): mood is NonNullable<PersonalitySnapshot["mood"]> =>
        Boolean(mood),
      )
      .map((mood) => moodValues[mood]);

    const moodAverage = weeklyMoodScores.length
      ? weeklyMoodScores.reduce((sum, value) => sum + value, 0) /
        weeklyMoodScores.length
      : 0.5;

    let moodPattern: "declining" | "improving" | "stable" = "stable";
    if (weeklySnapshots.length >= 2 && weeklyMoodScores.length >= 2) {
      const sortedWeekly = [...weeklySnapshots].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      const midIndex = Math.floor(sortedWeekly.length / 2);
      const firstHalf = sortedWeekly.slice(0, Math.max(1, midIndex));
      const secondHalf = sortedWeekly.slice(midIndex);

      const averageMood = (snapshotsSubset: PersonalitySnapshot[]) => {
        const scores = snapshotsSubset
          .map((snapshot) => snapshot.mood)
          .filter((mood): mood is NonNullable<PersonalitySnapshot["mood"]> =>
            Boolean(mood),
          )
          .map((mood) => moodValues[mood]);

        if (scores.length === 0) return moodAverage;
        return scores.reduce((sum, value) => sum + value, 0) / scores.length;
      };

      const firstAverage = averageMood(firstHalf);
      const secondAverage = averageMood(secondHalf);
      const diff = secondAverage - firstAverage;

      if (diff >= 0.1) {
        moodPattern = "improving";
      } else if (diff <= -0.1) {
        moodPattern = "declining";
      }
    }

    return {
      achievements: recentInsights
        .filter((i) => i.type === "achievement")
        .map((i) => i.title),
      moodTrend: {
        average: Number(moodAverage.toFixed(2)),
        pattern: moodPattern,
      },
      newInsights: recentInsights.length,
      personalityShifts: this.identifyWeeklyShifts(weeklySnapshots),
      recommendations: recentInsights
        .filter((i) => i.type === "recommendation")
        .map((i) => i.title),
      testsCompleted: weeklySnapshots.reduce((sum, s) => sum + s.totalTests, 0),
      week: this.getWeekString(new Date()),
    };
  }

  /**
   * Get all stored personality snapshots
   */
  public getSnapshots(): PersonalitySnapshot[] {
    if (typeof window === "undefined") return [];

    try {
      return secureCache.get(
        PersonalAnalyticsAnalyzer.SNAPSHOT_KEY,
        [] as PersonalitySnapshot[],
      );
    } catch (error) {
      console.error("Error getting snapshots:", error);
      return [];
    }
  }

  /**
   * Save a personality snapshot
   */
  public saveSnapshot(snapshot: PersonalitySnapshot): void {
    if (typeof window === "undefined") return;

    try {
      const snapshots = this.getSnapshots();

      // Check if snapshot for today already exists
      const existingIndex = snapshots.findIndex(
        (s) => s.date === snapshot.date,
      );

      if (existingIndex >= 0) {
        // Update existing snapshot
        snapshots[existingIndex] = snapshot;
      } else {
        // Add new snapshot
        snapshots.push(snapshot);
      }

      // Keep only last 100 snapshots to prevent storage bloat
      if (snapshots.length > 100) {
        snapshots.sort((a, b) => b.timestamp - a.timestamp);
        snapshots.splice(100);
      }

      secureCache.set(PersonalAnalyticsAnalyzer.SNAPSHOT_KEY, snapshots);
    } catch (error) {
      console.error("Error saving snapshot:", error);
    }
  }

  // Private helper methods

  private analyzeCompletionTrend(
    snapshots: PersonalitySnapshot[],
  ): "declining" | "improving" | "stable" {
    if (snapshots.length < 2) return "stable";

    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, Math.max(1, midpoint));
    const secondHalf = sorted.slice(midpoint);

    const averageFirst =
      firstHalf.reduce((sum, snapshot) => sum + snapshot.completionRate, 0) /
      firstHalf.length;
    const averageSecond =
      secondHalf.reduce((sum, snapshot) => sum + snapshot.completionRate, 0) /
      secondHalf.length;
    const diff = averageSecond - averageFirst;

    if (diff >= 5) return "improving";
    if (diff <= -5) return "declining";
    return "stable";
  }

  private analyzeGrowthPatterns(
    snapshots: PersonalitySnapshot[],
  ): PersonalityInsight[] {
    if (snapshots.length < 2) return [];

    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    const insights: PersonalityInsight[] = [];
    const timestamp = latest.timestamp;

    const completionDiff = latest.completionRate - first.completionRate;
    if (completionDiff >= 5) {
      const impact =
        completionDiff >= 15 ? "high" : completionDiff >= 8 ? "medium" : "low";
      insights.push({
        description:
          "꾸준한 참여 덕분에 더 많은 성격 테스트 데이터를 확보했어요.",
        id: this.buildInsightId("growth", "completion", timestamp),
        impact,
        testTypes: Array.from(new Set(latest.completedTests)),
        timestamp,
        title: `완료율이 ${Math.round(completionDiff)}% 향상되었어요`,
        type: "growth",
      });
    }

    const firstTests = new Set(first.completedTests);
    const newTests = latest.completedTests.filter(
      (test) => !firstTests.has(test),
    );
    if (newTests.length > 0) {
      const impact = newTests.length >= 3 ? "medium" : "low";
      insights.push({
        description: `최근 ${newTests.map(this.formatTestTypeName).join(", ")} 테스트 결과가 추가되었어요.`,
        id: this.buildInsightId("growth", "new-tests", timestamp),
        impact,
        testTypes: newTests,
        timestamp,
        title: `${newTests.length}개의 새로운 테스트를 완료했어요`,
        type: "growth",
      });
    }

    const scoreProgress = new Map<
      string,
      { end: number; endLabel: string; start: number; startLabel: string }
    >();

    sorted.forEach((snapshot) => {
      Object.entries(snapshot.testResults).forEach(([testType, result]) => {
        if (typeof result.score !== "number") return;

        if (!scoreProgress.has(testType)) {
          scoreProgress.set(testType, {
            end: result.score,
            endLabel: result.type,
            start: result.score,
            startLabel: result.type,
          });
        } else {
          const entry = scoreProgress.get(testType)!;
          entry.end = result.score;
          entry.endLabel = result.type;
        }
      });
    });

    scoreProgress.forEach((entry, testType) => {
      const diff = entry.end - entry.start;
      if (diff >= 5) {
        const impact = diff >= 15 ? "high" : diff >= 8 ? "medium" : "low";
        insights.push({
          description: `${entry.startLabel}에서 ${entry.endLabel}로 발전하며 ${Math.round(diff)}점 향상되었어요.`,
          id: this.buildInsightId("growth", testType, timestamp),
          impact,
          testTypes: [testType],
          timestamp,
          title: `${this.formatTestTypeName(testType)} 점수가 상승 중이에요`,
          type: "growth",
        });
      }
    });

    return insights;
  }

  private analyzePersonalityPatterns(
    snapshots: PersonalitySnapshot[],
  ): PersonalityInsight[] {
    if (snapshots.length === 0) return [];

    const insights: PersonalityInsight[] = [];
    const timestamp = Math.max(...snapshots.map((s) => s.timestamp));

    const typeFrequency = new Map<string, Map<string, number>>();
    snapshots.forEach((snapshot) => {
      Object.entries(snapshot.testResults).forEach(([testType, result]) => {
        if (!typeFrequency.has(testType)) {
          typeFrequency.set(testType, new Map());
        }

        const map = typeFrequency.get(testType)!;
        map.set(result.type, (map.get(result.type) || 0) + 1);
      });
    });

    typeFrequency.forEach((map, testType) => {
      const total = Array.from(map.values()).reduce((acc, val) => acc + val, 0);
      if (total < 2) return;

      const [dominantType, dominantCount] = Array.from(map.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      const ratio = dominantCount / total;

      if (ratio >= 0.6) {
        const impact = ratio >= 0.85 ? "high" : ratio >= 0.7 ? "medium" : "low";
        insights.push({
          description: `${Math.round(ratio * 100)}% 의 기록에서 ${dominantType} 유형이 나타났어요.`,
          id: this.buildInsightId("pattern", testType, timestamp),
          impact,
          testTypes: [testType],
          timestamp,
          title: `${this.formatTestTypeName(testType)} 결과가 일관되게 유지되고 있어요`,
          type: "pattern",
        });
      }
    });

    const traitCounts = new Map<string, number>();
    snapshots.forEach((snapshot) => {
      const traits = new Set<string>();
      Object.values(snapshot.testResults).forEach((result) => {
        result.traits.forEach((trait) => traits.add(trait));
      });
      traits.forEach((trait) => {
        traitCounts.set(trait, (traitCounts.get(trait) || 0) + 1);
      });
    });

    const totalSnapshots = snapshots.length;
    const consistentTraits = Array.from(traitCounts.entries())
      .filter(([, count]) => count / totalSnapshots >= 0.6)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    consistentTraits.forEach(([trait, count]) => {
      const ratio = count / totalSnapshots;
      const impact = ratio >= 0.85 ? "high" : ratio >= 0.7 ? "medium" : "low";
      insights.push({
        description: `${Math.round(ratio * 100)}% 의 기록에서 이 특성이 관찰되었습니다.`,
        id: this.buildInsightId("pattern", `trait-${trait}`, timestamp),
        impact,
        testTypes: [],
        timestamp,
        title: `반복적으로 나타나는 핵심 성향: ${trait}`,
        type: "pattern",
      });
    });

    return insights;
  }

  private buildInsightId(
    prefix: string,
    key: string,
    timestamp: number,
  ): string {
    return `${prefix}_${key}_${timestamp}`;
  }

  private calculateAverageTestsPerWeek(
    snapshots: PersonalitySnapshot[],
  ): number {
    if (snapshots.length === 0) return 0;

    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
    let accumulatedNewTests = 0;

    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i].totalTests - sorted[i - 1].totalTests;
      if (diff > 0) {
        accumulatedNewTests += diff;
      }
    }

    if (accumulatedNewTests === 0) {
      accumulatedNewTests = sorted[sorted.length - 1].totalTests;
    }

    const timespanMs =
      sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    const weeks = Math.max(1, timespanMs / (1000 * 60 * 60 * 24 * 7));
    const average = accumulatedNewTests / weeks;

    return Number(average.toFixed(1));
  }

  private calculateCurrentStreak(snapshots: PersonalitySnapshot[]): number {
    if (snapshots.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(snapshots.map((snapshot) => snapshot.date)),
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    let previousDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const diffDays = Math.round(
        (previousDate.getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        streak += 1;
        previousDate = currentDate;
      } else if (diffDays === 0) {
        previousDate = currentDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateGrowthScore(snapshots: PersonalitySnapshot[]): number {
    if (snapshots.length < 2) return 50;

    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    const completionChange = latest.completionRate - first.completionRate;

    const scoreDiffs: number[] = [];
    const scoreMap = new Map<string, { end: number; start: number }>();

    sorted.forEach((snapshot) => {
      Object.entries(snapshot.testResults).forEach(([testType, result]) => {
        if (typeof result.score !== "number") return;

        if (!scoreMap.has(testType)) {
          scoreMap.set(testType, { end: result.score, start: result.score });
        } else {
          const entry = scoreMap.get(testType)!;
          entry.end = result.score;
        }
      });
    });

    scoreMap.forEach(({ end, start }) => {
      scoreDiffs.push(end - start);
    });

    const averageScoreDiff = scoreDiffs.length
      ? scoreDiffs.reduce((sum, diff) => sum + diff, 0) / scoreDiffs.length
      : 0;

    const newTests = Math.max(0, latest.totalTests - first.totalTests);
    const baseScore = 50;

    const growthScore =
      baseScore +
      completionChange * 0.4 +
      averageScoreDiff * 0.6 +
      newTests * 3;

    return Math.min(100, Math.max(0, Math.round(growthScore)));
  }

  private calculateLongestStreak(snapshots: PersonalitySnapshot[]): number {
    if (snapshots.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(snapshots.map((snapshot) => snapshot.date)),
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let longest = 1;
    let current = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currentDate = new Date(uniqueDates[i]);
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        current += 1;
      } else if (diffDays > 1) {
        current = 1;
      }

      longest = Math.max(longest, current);
    }

    return longest;
  }

  private calculateStability(snapshots: PersonalitySnapshot[]): number {
    const typeConsistency: number[] = [];

    snapshots.forEach((snapshot) => {
      Object.entries(snapshot.testResults).forEach(([testType, _result]) => {
        const occurrences = snapshots
          .map((s) => s.testResults[testType]?.type)
          .filter(Boolean) as string[];

        if (occurrences.length < 2) return;

        const frequency = occurrences.reduce<Record<string, number>>(
          (acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          },
          {},
        );

        const maxCount = Math.max(...Object.values(frequency));
        typeConsistency.push(maxCount / occurrences.length);
      });
    });

    if (typeConsistency.length === 0) return 0.5;

    const average =
      typeConsistency.reduce((sum, value) => sum + value, 0) /
      typeConsistency.length;
    return Math.min(1, Math.max(0, Number(average.toFixed(2))));
  }

  private calculateTrend(
    dataPoints: { date: string; label: string; value: number }[],
  ) {
    if (dataPoints.length < 2) {
      return { changePercentage: 0, direction: "stable" as const };
    }

    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const changePercentage = ((lastValue - firstValue) / firstValue) * 100;

    let direction: "decreasing" | "increasing" | "stable";
    if (Math.abs(changePercentage) < 5) {
      direction = "stable";
    } else if (changePercentage > 0) {
      direction = "increasing";
    } else {
      direction = "decreasing";
    }

    return { changePercentage: Math.round(changePercentage), direction };
  }

  private extractNumericValue(testResult: {
    [key: string]: unknown;
    score?: number;
  }): number {
    return testResult.score || 50; // Default neutral score
  }

  private findMostFrequentTraits(snapshots: PersonalitySnapshot[]): string[] {
    const traitCounts = new Map<string, number>();

    snapshots.forEach((snapshot) => {
      Object.values(snapshot.testResults).forEach((result) => {
        result.traits.forEach((trait) => {
          traitCounts.set(trait, (traitCounts.get(trait) || 0) + 1);
        });
      });
    });

    return Array.from(traitCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([trait]) => trait);
  }

  private formatTestTypeName(testType: string): string {
    return testType
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  private generateRecommendations(
    snapshots: PersonalitySnapshot[],
  ): PersonalityInsight[] {
    if (snapshots.length === 0) return [];

    const latest = snapshots.reduce(
      (acc, cur) => (cur.timestamp > acc.timestamp ? cur : acc),
      snapshots[0],
    );
    const metrics = this.calculateMetrics(snapshots);
    const timestamp = latest.timestamp;
    const recommendations: PersonalityInsight[] = [];

    if (metrics.completionTrend === "declining") {
      recommendations.push({
        actionable: true,
        description:
          "짧은 테스트부터 다시 시작해보면 어떨까요? 하루 1개 테스트만으로도 꾸준함을 유지할 수 있어요.",
        id: this.buildInsightId("recommendation", "re-engage", timestamp),
        impact: "medium",
        recommendation:
          "관심 있는 카테고리에서 소요 시간이 짧은 테스트를 먼저 진행해보세요.",
        testTypes: [],
        timestamp,
        title: "최근에는 테스트 참여가 줄어들었어요",
        type: "recommendation",
      });
    }

    if (metrics.averageTestsPerWeek < 1.5) {
      recommendations.push({
        actionable: true,
        description:
          "주 2회 정도 테스트를 진행하면 더 선명한 성격 패턴을 발견할 수 있어요.",
        id: this.buildInsightId("recommendation", "weekly-habit", timestamp),
        impact: "low",
        recommendation:
          "일정에 맞춰 주초와 주말에 테스트를 배치하면 꾸준히 이어가기 쉬워요.",
        testTypes: [],
        timestamp,
        title: "주간 테스트 루틴을 만들어보세요",
        type: "recommendation",
      });
    }

    if (metrics.personalityStability < 0.6) {
      recommendations.push({
        actionable: true,
        description:
          "이럴 때일수록 반복 테스트를 통해 핵심 성향을 명확히 해두는 것이 도움이 됩니다.",
        id: this.buildInsightId("recommendation", "focus", timestamp),
        impact: "medium",
        recommendation:
          "지난 2주간 가장 많이 달라진 테스트를 다시 진행해보세요.",
        testTypes: [],
        timestamp,
        title: "성격 변화가 자주 관찰되고 있어요",
        type: "recommendation",
      });
    }

    const availableTests = TEST_RESULT_SOURCES.map((test) => test.alias);
    const missingTests = availableTests.filter(
      (test) => !latest.completedTests.includes(test),
    );
    if (missingTests.length > 0) {
      recommendations.push({
        actionable: true,
        description: `${this.formatTestTypeName(missingTests[0])} 테스트부터 체험해보면 새로운 통찰을 얻을 수 있어요.`,
        id: this.buildInsightId("recommendation", "explore", timestamp),
        impact: missingTests.length > 3 ? "medium" : "low",
        recommendation:
          "관심 있는 주제를 선택해 테스트를 추가하면 분석 정확도가 높아집니다.",
        testTypes: missingTests,
        timestamp,
        title: "아직 경험하지 않은 테스트가 있어요",
        type: "recommendation",
      });
    }

    return recommendations;
  }

  private generateSnapshotId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `snapshot_${timestamp}_${randomStr}`;
  }

  private generateTrendInsights(
    testType: string,
    dataPoints: { date: string; label: string; value: number }[],
    trend: {
      changePercentage: number;
      direction: "decreasing" | "increasing" | "stable";
    },
  ): string[] {
    const insights = [];

    if (trend.direction === "increasing") {
      insights.push(
        `${testType} 점수가 ${Math.abs(trend.changePercentage)}% 증가했습니다`,
      );
    } else if (trend.direction === "decreasing") {
      insights.push(
        `${testType} 점수가 ${Math.abs(trend.changePercentage)}% 감소했습니다`,
      );
    } else {
      insights.push(`${testType} 점수가 안정적으로 유지되고 있습니다`);
    }

    return insights;
  }

  private getCommonTestTypes(snapshots: PersonalitySnapshot[]): string[] {
    const testTypeCounts = new Map<string, number>();

    snapshots.forEach((snapshot) => {
      Object.keys(snapshot.testResults).forEach((testType) => {
        testTypeCounts.set(testType, (testTypeCounts.get(testType) || 0) + 1);
      });
    });

    // Return test types that appear in at least 50% of snapshots
    const threshold = Math.ceil(snapshots.length / 2);
    return Array.from(testTypeCounts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([testType]) => testType);
  }

  private getCutoffDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case "month":
        now.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        now.setMonth(now.getMonth() - 3);
        break;
      case "week":
        now.setDate(now.getDate() - 7);
        break;
      case "year":
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    return now;
  }

  private getWeekString(date: Date): string {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return `${start.getFullYear()}-W${Math.ceil(start.getDate() / 7)}`;
  }

  private identifyAchievements(
    snapshots: PersonalitySnapshot[],
  ): PersonalityInsight[] {
    if (snapshots.length === 0) return [];

    const insights: PersonalityInsight[] = [];
    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
    const latest = sorted[sorted.length - 1];
    const timestamp = latest.timestamp;

    const thresholds = [5, 10, 20];
    const highestThreshold = thresholds
      .reverse()
      .find((threshold) => snapshots.length >= threshold);
    if (highestThreshold) {
      insights.push({
        actionable: false,
        description: `꾸준히 기록을 남겨 ${highestThreshold}개의 분석 데이터를 축적했어요.`,
        id: this.buildInsightId(
          "achievement",
          `snapshots-${highestThreshold}`,
          timestamp,
        ),
        impact: highestThreshold >= 10 ? "medium" : "low",
        testTypes: [],
        timestamp,
        title: `${highestThreshold}번째 개인 기록을 달성했어요`,
        type: "achievement",
      });
    }

    const longestStreak = this.calculateLongestStreak(sorted);
    if (longestStreak >= 5) {
      insights.push({
        description: `휴식 없이 ${longestStreak}일 동안 꾸준히 테스트 결과를 업데이트했어요.`,
        id: this.buildInsightId("achievement", "streak", timestamp),
        impact: longestStreak >= 10 ? "high" : "medium",
        testTypes: [],
        timestamp,
        title: `${longestStreak}일 연속 기록 유지`,
        type: "achievement",
      });
    }

    if (latest.completionRate >= 80) {
      insights.push({
        description:
          "다양한 테스트를 경험하며 깊이 있는 자기 분석을 이어가고 있어요.",
        id: this.buildInsightId("achievement", "completion", timestamp),
        impact: latest.completionRate >= 95 ? "high" : "medium",
        testTypes: [...latest.completedTests],
        timestamp,
        title: `테스트 완료율 ${latest.completionRate}% 달성`,
        type: "achievement",
      });
    }

    const uniqueTests = new Set<string>();
    snapshots.forEach((snapshot) =>
      snapshot.completedTests.forEach((test) => uniqueTests.add(test)),
    );
    if (uniqueTests.size >= TEST_RESULT_SOURCES.length) {
      insights.push({
        description: "OIYO가 제공하는 주요 테스트 데이터를 모두 확보했어요.",
        id: this.buildInsightId("achievement", "all-tests", timestamp),
        impact: "high",
        testTypes: Array.from(uniqueTests),
        timestamp,
        title: "모든 핵심 테스트 결과 수집 완료",
        type: "achievement",
      });
    }

    return insights;
  }

  private identifyWeeklyShifts(snapshots: PersonalitySnapshot[]): string[] {
    if (snapshots.length < 2) return [];

    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
    const earliest = sorted[0];
    const latest = sorted[sorted.length - 1];

    const shifts: string[] = [];
    const testTypes = new Set([
      ...Object.keys(earliest.testResults),
      ...Object.keys(latest.testResults),
    ]);

    testTypes.forEach((testType) => {
      const startResult = earliest.testResults[testType];
      const endResult = latest.testResults[testType];

      if (!startResult || !endResult) return;

      if (startResult.type !== endResult.type) {
        shifts.push(
          `${this.formatTestTypeName(testType)} 유형이 ${startResult.type}에서 ${endResult.type}로 변화했어요.`,
        );
      }

      if (
        typeof startResult.score === "number" &&
        typeof endResult.score === "number"
      ) {
        const diff = endResult.score - startResult.score;
        if (Math.abs(diff) >= 7) {
          const direction = diff > 0 ? "상승" : "하락";
          shifts.push(
            `${this.formatTestTypeName(testType)} 점수가 ${Math.abs(Math.round(diff))}점 ${direction}했습니다.`,
          );
        }
      }
    });

    return shifts.slice(0, 5);
  }

  private normalizeResultData(raw: unknown): null | {
    rawData: Record<string, unknown>;
    score?: number;
    traits: string[];
    type: string;
  } {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const record = raw as Record<string, unknown>;

    const typeCandidate =
      record.type ??
      record.primary ??
      record.personalityType ??
      record.result ??
      "unknown";

    const possibleScores: unknown[] = [
      record.score,
      record.totalScore,
      record.percentage,
      record.percent,
      record.tetoScore,
      record.egenScore,
      record.completionRate,
    ];

    const scoreCandidate = [
      ...possibleScores.filter(
        (value): value is number => typeof value === "number",
      ),
    ][0];

    let traits: string[] = [];
    const candidateTraits = [
      record.traits,
      record.characteristics,
      record.dreamPatterns,
    ];

    for (const candidate of candidateTraits) {
      if (Array.isArray(candidate)) {
        traits = candidate.filter(
          (item): item is string => typeof item === "string",
        );
        if (traits.length > 0) {
          break;
        }
      }
    }

    return {
      rawData: record,
      score:
        typeof scoreCandidate === "number"
          ? Math.round(scoreCandidate)
          : undefined,
      traits,
      type: String(typeCandidate),
    };
  }

  private readResultFromStorage(key: string): unknown {
    if (typeof window === "undefined") {
      return null;
    }

    const cached = secureCache.getOrNull<unknown>(key);
    if (cached !== null) {
      return cached;
    }

    const storages: Array<Storage | undefined> = [];

    try {
      storages.push(window.sessionStorage);
    } catch {
      // sessionStorage might not be accessible (Safari private mode etc.)
    }

    for (const storage of storages) {
      if (!storage) continue;
      try {
        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);

        // Persist session-stored data securely for long-term analytics
        secureCache.set(key, parsed);

        return parsed;
      } catch (error) {
        console.warn(`[PersonalAnalytics] Failed to read ${key}:`, error);
      }
    }

    return null;
  }
}

// Export singleton instance
export const personalAnalyticsAnalyzer = new PersonalAnalyticsAnalyzer();
