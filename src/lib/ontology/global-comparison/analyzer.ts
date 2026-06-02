import type { TestResultOverviewStatsRow } from "@/types/database";

// Global Average Comparison Analysis Engine
// import { getUserTestResults } from '@/lib/system/database/results';
// import { trackEvent } from '@/lib/system/database/analytics';
import {
  getGlobalOverviewStats,
  getTestAggregates,
} from "@/lib/system/database/global-comparison";

import type {
  ComparisonInsight,
  ComparisonResult,
  DemographicFilter,
  GlobalAverageData,
  GlobalComparisonStats,
  PersonalityRanking,
  RegionalComparison,
  TrendComparison,
  UserComparison,
} from "./types";

export class GlobalComparisonAnalyzer {
  private static instance: GlobalComparisonAnalyzer;
  private aggregateCache: Map<string, GlobalAverageData[]> = new Map();
  private aggregatePromises: Map<string, Promise<void>> = new Map();
  private overviewPromise: null | Promise<void> = null;
  private overviewStats: null | TestResultOverviewStatsRow = null;

  public static getInstance(): GlobalComparisonAnalyzer {
    if (!GlobalComparisonAnalyzer.instance) {
      GlobalComparisonAnalyzer.instance = new GlobalComparisonAnalyzer();
    }
    return GlobalComparisonAnalyzer.instance;
  }

  // Compare user trends with global trends
  async compareUserTrends(
    _userId: string,
    testType: string,
    personalityType: string,
    userTrendData: { changePercentage: number; trend: string },
    _sessionId?: string,
  ): Promise<null | TrendComparison> {
    try {
      // Mock global trend data (in real implementation, this would come from database)
      const globalTrendData = {
        changePercentage: 2.1,
        trend: "stable" as const,
      };

      const userChangePercentage = userTrendData.changePercentage;
      const globalChangePercentage = globalTrendData.changePercentage;

      const difference = Math.abs(
        userChangePercentage - globalChangePercentage,
      );

      let comparison: TrendComparison["comparison"];
      if (difference <= 3) {
        comparison = "aligned";
      } else if (userChangePercentage > globalChangePercentage) {
        comparison = "outperforming";
      } else {
        comparison = "underperforming";
      }

      const significance = difference / 10; // 0-1 scale

      return {
        comparison,
        globalChangePercentage,
        globalTrend: globalTrendData.trend,
        personalityType,
        significance: Math.min(1, significance),
        testType,
        userChangePercentage,
        userTrend: userTrendData.trend as TrendComparison["userTrend"],
      };
    } catch (error) {
      console.error("Error comparing user trends:", error);
      return null;
    }
  }

  // Compare user score with global averages
  async compareWithGlobal(
    userId: string,
    testType: string,
    personalityType: string,
    userScore: number,
    sessionId?: string,
    demographics?: DemographicFilter,
  ): Promise<ComparisonResult | null> {
    try {
      await this.ensureAggregates(testType);

      const personalityAggregates = this.getPersonalityAggregates(
        testType,
        personalityType,
      );
      if (personalityAggregates.length === 0) {
        console.warn("[GlobalComparisonAnalyzer] No aggregate data available", {
          personalityType,
          testType,
        });
        return null;
      }

      const globalData = personalityAggregates.find(
        (data) => data.region === "global",
      );
      if (!globalData) {
        console.warn("[GlobalComparisonAnalyzer] Missing global aggregate", {
          personalityType,
          testType,
        });
        return null;
      }

      // Calculate user comparison
      const globalComparison = this.calculateUserComparison(
        userScore,
        globalData,
      );

      // Get regional comparisons
      const regionalComparisons = this.getRegionalComparisons(
        personalityAggregates,
        userScore,
      );

      // Generate insights
      const insights = this.generateComparisonInsights(
        testType,
        personalityType,
        userScore,
        globalComparison,
        regionalComparisons,
      );

      // Get global stats
      const stats = await this.calculateGlobalStats(
        testType,
        personalityAggregates,
      );

      const result: ComparisonResult = {
        demographics: demographics || {},
        globalComparison,
        insights,
        personalityType,
        regionalComparisons,
        stats,
        testType,
        timestamp: new Date().toISOString(),
        userScore,
      };

      // Track comparison event
      await this.trackComparisonEvent(
        userId,
        testType,
        globalComparison.percentile,
        sessionId,
      );

      return result;
    } catch (error) {
      console.error("Error comparing with global averages:", error);
      return null;
    }
  }

  public async getAggregatesForTest(
    testType: string,
  ): Promise<GlobalAverageData[]> {
    await this.ensureAggregates(testType);
    return this.getAggregatesFromCache(testType);
  }

  // Get personality ranking information
  async getPersonalityRanking(
    testType: string,
    personalityType: string,
    userScore: number,
  ): Promise<null | PersonalityRanking> {
    try {
      await this.ensureAggregates(testType);

      const globalData = this.getGlobalAverage(
        testType,
        personalityType,
        "global",
      );
      const asiaData = this.getGlobalAverage(testType, personalityType, "asia");

      if (!globalData) return null;

      const globalComparison = this.calculateUserComparison(
        userScore,
        globalData,
      );
      const regionalComparison = asiaData
        ? this.calculateUserComparison(userScore, asiaData)
        : null;

      // Calculate ranks
      const globalRank = Math.floor(
        ((100 - globalComparison.percentile) / 100) * globalData.sampleSize,
      );
      const regionalRank =
        regionalComparison && asiaData
          ? Math.floor(
              ((100 - regionalComparison.percentile) / 100) *
                asiaData.sampleSize,
            )
          : 0;

      // Generate strengths and improvements
      const strengths = this.generateStrengths(
        personalityType,
        globalComparison.percentile,
      );
      const improvements = this.generateImprovements(
        personalityType,
        globalComparison.percentile,
      );

      // Calculate rarity score (how uncommon this personality type is)
      const rarityScore = this.calculateRarityScore(personalityType);

      return {
        globalRank,
        improvements,
        percentile: globalComparison.percentile,
        personalityType,
        rarityScore,
        regionalRank,
        strengths,
        testType,
        totalUsers: globalData.sampleSize,
      };
    } catch (error) {
      console.error("Error getting personality ranking:", error);
      return null;
    }
  }

  // Refresh global averages (would connect to real API in production)
  async refreshGlobalAverages(): Promise<void> {
    try {
      this.aggregateCache.clear();
      this.aggregatePromises.clear();
      this.overviewStats = null;
      this.overviewPromise = null;
    } catch (error) {
      console.error("Error refreshing global averages:", error);
    }
  }

  // Calculate global statistics
  private async calculateGlobalStats(
    testType: string,
    currentPersonalityAggregates: GlobalAverageData[],
  ): Promise<GlobalComparisonStats> {
    await this.ensureOverviewStats();

    const allAggregates = this.getAggregatesFromCache(testType);
    const globalAggregates = allAggregates.filter(
      (data) => data.region === "global",
    );
    const totalUsers = globalAggregates.reduce(
      (sum, row) => sum + row.sampleSize,
      0,
    );

    const regionsRepresented = new Set(
      allAggregates
        .filter((data) => data.region !== "global")
        .map((data) => data.region),
    ).size;

    const topPersonalityTypes = globalAggregates
      .slice()
      .sort((a, b) => b.sampleSize - a.sampleSize)
      .slice(0, 4)
      .map((row) => ({
        count: row.sampleSize,
        percentage:
          totalUsers > 0
            ? Number(((row.sampleSize / totalUsers) * 100).toFixed(1))
            : 0,
        type: row.personalityType,
      }));

    const overview = this.overviewStats;
    const dataQuality =
      totalUsers >= 20000
        ? "excellent"
        : totalUsers >= 5000
          ? "good"
          : totalUsers >= 1000
            ? "fair"
            : "limited";

    const fallbackTotalUsers = currentPersonalityAggregates[0]?.sampleSize ?? 0;
    const fallbackTotalTests = globalAggregates.length || 1;

    return {
      averageAge: 0,
      dataQuality,
      genderDistribution: {
        female: 0,
        male: 0,
        other: 0,
      },
      regionsRepresented,
      topPersonalityTypes:
        topPersonalityTypes.length > 0
          ? topPersonalityTypes
          : currentPersonalityAggregates
              .map((row) => ({
                count: row.sampleSize,
                percentage: 0,
                type: row.personalityType,
              }))
              .slice(0, 4),
      totalTests: (overview?.total_tests ?? fallbackTotalTests) || 1,
      totalUsers: totalUsers || fallbackTotalUsers,
    };
  }

  // Calculate how rare a personality type is
  private calculateRarityScore(personalityType: string): number {
    // Mock rarity data (in real implementation, based on actual distribution)
    const rarityMap: Record<string, number> = {
      Analyst: 60, // Somewhat rare
      Diplomat: 55, // Somewhat rare
      Direct: 40, // Moderately common
      Egen: 45, // Moderately common
      Explorer: 25, // Common
      Sentinel: 30, // Common
      Teto: 35, // Common
    };

    return rarityMap[personalityType] || 50;
  }

  // Calculate user comparison metrics
  private calculateUserComparison(
    userScore: number,
    globalData: GlobalAverageData,
  ): UserComparison {
    const deviation = userScore - globalData.averageScore;
    const stdDeviation =
      globalData.standardDeviation === 0 ? 1 : globalData.standardDeviation;
    const zScore = deviation / stdDeviation;

    // Calculate percentile using normal distribution approximation
    const percentile = Math.round(this.normalCDF(zScore) * 100);

    // Determine interpretation
    let interpretation: UserComparison["interpretation"];
    if (percentile >= 90) interpretation = "well_above";
    else if (percentile >= 75) interpretation = "above";
    else if (percentile >= 25) interpretation = "average";
    else if (percentile >= 10) interpretation = "below";
    else interpretation = "well_below";

    // Generate rank description - using a label key format for localization if needed,
    // but here we'll keep it simple and just provide the percentile value for the UI to format.
    const rank = `${percentile}%`;

    // Determine confidence based on sample size
    const confidence =
      globalData.sampleSize >= 10000
        ? "high"
        : globalData.sampleSize >= 1000
          ? "medium"
          : "low";

    return {
      confidence,
      deviation: Math.round(deviation * 10) / 10,
      globalAverage: globalData.averageScore,
      interpretation,
      percentile,
      rank,
      userScore,
    };
  }

  private async ensureAggregates(testType: string): Promise<void> {
    if (this.aggregateCache.has(testType)) {
      return;
    }

    const pending = this.aggregatePromises.get(testType);
    if (pending) {
      await pending;
      return;
    }

    const loadPromise = (async () => {
      const { data, error } = await getTestAggregates({ testSlug: testType });

      if (error) {
        console.error(
          "[GlobalComparisonAnalyzer] Failed to load aggregates:",
          error.message,
        );
        this.aggregateCache.set(testType, []);
        return;
      }

      this.aggregateCache.set(testType, data ?? []);
    })();

    this.aggregatePromises.set(testType, loadPromise);
    await loadPromise;
    this.aggregatePromises.delete(testType);
  }

  private async ensureOverviewStats(): Promise<void> {
    if (this.overviewStats) {
      return;
    }

    if (this.overviewPromise) {
      await this.overviewPromise;
      return;
    }

    this.overviewPromise = (async () => {
      const { data, error } = await getGlobalOverviewStats();

      if (error) {
        console.error(
          "[GlobalComparisonAnalyzer] Failed to load overview stats:",
          error.message,
        );
        this.overviewStats = null;
      } else {
        this.overviewStats = data ?? null;
      }
    })();

    await this.overviewPromise;
    this.overviewPromise = null;
  }

  // Generate comparison insights
  private generateComparisonInsights(
    testType: string,
    personalityType: string,
    userScore: number,
    globalComparison: UserComparison,
    regionalComparisons: RegionalComparison[],
  ): ComparisonInsight[] {
    const insights: ComparisonInsight[] = [];

    // High performance insight
    if (globalComparison.percentile >= 90) {
      insights.push({
        data: { percentile: globalComparison.percentile },
        description: `percentile_high_desc`,
        id: `strength_${Date.now()}_1`,
        personalityType,
        significance: "high",
        testType,
        title: "exceptional_performance",
        type: "strength",
      });
    }

    // Unique profile insight
    if (
      globalComparison.percentile <= 10 ||
      globalComparison.percentile >= 90
    ) {
      insights.push({
        data: {
          rarity: Math.min(
            globalComparison.percentile,
            100 - globalComparison.percentile,
          ),
        },
        description: `rarity_desc`,
        id: `unique_${Date.now()}_2`,
        personalityType,
        significance:
          globalComparison.percentile <= 5 || globalComparison.percentile >= 95
            ? "high"
            : "medium",
        testType,
        title: "rare_profile",
        type: "unique",
      });
    }

    // Regional standout insight
    const asiaComparison = regionalComparisons.find((r) => r.region === "asia");
    if (asiaComparison && asiaComparison.userPercentile >= 85) {
      insights.push({
        data: { percentile: asiaComparison.userPercentile, region: "asia" },
        description: `regional_standout_desc`,
        id: `regional_${Date.now()}_3`,
        personalityType,
        significance: "medium",
        testType,
        title: "regional_standout",
        type: "strength",
      });
    }

    // Development opportunity insight
    if (globalComparison.percentile <= 25) {
      insights.push({
        data: {
          currentPercentile: globalComparison.percentile,
          growthPotential: 75 - globalComparison.percentile,
        },
        description: `growth_potential_desc`,
        id: `development_${Date.now()}_4`,
        personalityType,
        significance: "medium",
        testType,
        title: "growth_potential",
        type: "development",
      });
    }

    return insights.slice(0, 4); // Return top 4 insights
  }

  // Generate improvement suggestions
  private generateImprovements(
    personalityType: string,
    _percentile: number,
  ): string[] {
    const typeKey = personalityType.toLowerCase();
    return [
      `improvement_${typeKey}_1`,
      `improvement_${typeKey}_2`,
      `improvement_${typeKey}_3`,
    ];
  }

  // Generate strengths based on personality type and percentile
  private generateStrengths(
    personalityType: string,
    _percentile: number,
  ): string[] {
    const typeKey = personalityType.toLowerCase();
    return [
      `strength_${typeKey}_1`,
      `strength_${typeKey}_2`,
      `strength_${typeKey}_3`,
      `strength_${typeKey}_4`,
    ];
  }

  private getAggregatesFromCache(testType: string): GlobalAverageData[] {
    return this.aggregateCache.get(testType) ?? [];
  }

  // Get global average for specific test and personality type
  private getGlobalAverage(
    testType: string,
    personalityType: string,
    region: string = "global",
  ): GlobalAverageData | null {
    const personalityAggregates = this.getPersonalityAggregates(
      testType,
      personalityType,
    );
    return personalityAggregates.find((data) => data.region === region) ?? null;
  }

  private getPersonalityAggregates(
    testType: string,
    personalityType: string,
  ): GlobalAverageData[] {
    const aggregates = this.getAggregatesFromCache(testType);
    return aggregates.filter(
      (data) => data.personalityType === personalityType,
    );
  }

  // Get regional comparisons
  private getRegionalComparisons(
    personalityAggregates: GlobalAverageData[],
    userScore: number,
  ): RegionalComparison[] {
    const regionalData = personalityAggregates.filter(
      (data) => data.region !== "global",
    );

    return regionalData.map((data) => {
      const difference = userScore - data.averageScore;
      const percentDiff = Math.abs(difference);

      let comparison: RegionalComparison["comparison"];
      if (percentDiff <= 3) comparison = "similar";
      else if (difference > 0) comparison = "higher";
      else comparison = "lower";

      // Calculate approximate percentile for region
      const stdDeviation =
        data.standardDeviation === 0 ? 1 : data.standardDeviation;
      const zScore = difference / stdDeviation;
      const userPercentile = Math.round(this.normalCDF(zScore) * 100);

      return {
        average: data.averageScore,
        comparison,
        difference: Math.round(difference * 10) / 10,
        region: data.region,
        userPercentile,
      };
    });
  }

  // Normal cumulative distribution function (approximation)
  private normalCDF(z: number): number {
    // Abramowitz and Stegun approximation
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2.0);
    let prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302744))));

    if (z > 0) prob = 1.0 - prob;
    return Math.max(0, Math.min(1, prob));
  }

  // Track comparison analysis event
  private async trackComparisonEvent(
    _userId: string,
    _testType: string,
    _percentile: number,
    _sessionId?: string,
  ): Promise<void> {
    try {
      // await trackEvent({
      //   event_type: 'global_comparison_view',
      //   user_id: userId,
      //   session_id: sessionId,
      //   event_data: {
      //     test_type: testType,
      //     percentile,
      //     category: percentile >= 75 ? 'high_performer' :
      //              percentile >= 25 ? 'average' : 'developing'
      //   }
      // });
    } catch (error) {
      console.error("Error tracking comparison event:", error);
    }
  }
}

export const globalComparisonAnalyzer = GlobalComparisonAnalyzer.getInstance();
