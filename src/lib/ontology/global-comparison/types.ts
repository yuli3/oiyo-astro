export interface ComparisonInsight {
  data: Record<string, unknown>;
  description: string;
  id: string;
  personalityType: string;
  significance: "high" | "low" | "medium";
  testType: string;
  title: string;
  type: "development" | "rare" | "strength" | "unique";
}

export interface ComparisonResult {
  demographics: DemographicFilter;
  globalComparison: UserComparison;
  insights: ComparisonInsight[];
  personalityType: string;
  regionalComparisons: RegionalComparison[];
  stats: GlobalComparisonStats;
  testType: string;
  timestamp: string;
  userScore: number;
}

export interface DemographicFilter {
  ageRange?: "18-25" | "26-35" | "36-45" | "46-55" | "55+";
  educationLevel?: "college" | "graduate" | "high_school" | "postgraduate";
  gender?: "female" | "male" | "other";
  occupation?:
    | "creative"
    | "other"
    | "professional"
    | "service"
    | "student"
    | "technical";
  region?:
    | "africa"
    | "asia"
    | "europe"
    | "global"
    | "north_america"
    | "oceania"
    | "south_america";
}

// Global Average Comparison Types
export interface GlobalAverageData {
  averageScore: number;
  lastUpdated: string;
  percentileRanges: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  personalityType: string;
  region:
    | "africa"
    | "asia"
    | "europe"
    | "global"
    | "north_america"
    | "oceania"
    | "south_america";
  sampleSize: number;
  standardDeviation: number;
  testType: string;
}

export interface GlobalComparisonStats {
  averageAge: number;
  dataQuality: "excellent" | "fair" | "good" | "limited";
  genderDistribution: {
    female: number;
    male: number;
    other: number;
  };
  regionsRepresented: number;
  topPersonalityTypes: Array<{
    count: number;
    percentage: number;
    type: string;
  }>;
  totalTests: number;
  totalUsers: number;
}

export interface PersonalityRanking {
  globalRank: number;
  improvements: string[];
  percentile: number;
  personalityType: string;
  rarityScore: number; // 0-100, how rare this personality type is
  regionalRank: number;
  strengths: string[];
  testType: string;
  totalUsers: number;
}

export interface RegionalComparison {
  average: number;
  comparison: "higher" | "lower" | "similar";
  difference: number;
  region: string;
  userPercentile: number;
}

export interface TrendComparison {
  comparison: "aligned" | "outperforming" | "underperforming";
  globalChangePercentage: number;
  globalTrend: "declining" | "rising" | "stable";
  personalityType: string;
  significance: number;
  testType: string;
  userChangePercentage: number;
  userTrend: "declining" | "rising" | "stable";
}

export interface UserComparison {
  confidence: "high" | "low" | "medium";
  deviation: number;
  globalAverage: number;
  interpretation: "above" | "average" | "below" | "well_above" | "well_below";
  percentile: number;
  rank: string; // e.g., "Top 15%", "Bottom 25%"
  userScore: number;
}
