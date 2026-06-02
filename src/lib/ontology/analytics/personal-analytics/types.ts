export interface AnalyticsMetrics {
  averageTestsPerWeek: number;
  completionTrend: "declining" | "improving" | "stable";
  currentStreak: number;
  growthScore: number; // 0-100 scale
  longestStreak: number;
  mostFrequentTraits: string[];
  personalityStability: number; // 0-1 scale
  totalSnapshots: number;
}

export interface ComparisonData {
  changes: {
    changeType: "changed" | "declined" | "improved" | "stable";
    newValue: number | string;
    oldValue: number | string;
    testType: string;
  }[];
  current: PersonalitySnapshot;
  previous: PersonalitySnapshot;
  timespan: number; // days between snapshots
}

export interface GoalTracker {
  category: "habits" | "personality" | "skills" | "wellness";
  description: string;
  id: string;
  metrics: {
    current: number;
    target: number;
    unit: string;
  };
  milestones: {
    date: string;
    note?: string;
    value: number;
  }[];
  relatedTests: string[];
  status: "active" | "completed" | "paused";
  targetDate: string;
  title: string;
}

export interface PersonalAnalytics {
  insights: PersonalityInsight[];
  lastUpdated: number;
  metrics: AnalyticsMetrics;
  preferences: {
    focusAreas: string[];
    shareLevel: "anonymous" | "private" | "public";
    trackingFrequency: "daily" | "monthly" | "weekly";
  };
  snapshots: PersonalitySnapshot[];
  trends: PersonalityTrend[];
  userId: string;
}

export interface PersonalityInsight {
  actionable?: boolean;
  description: string;
  id: string;
  impact: "high" | "low" | "medium";
  recommendation?: string;
  testTypes: string[];
  timestamp: number;
  title: string;
  type: "achievement" | "growth" | "pattern" | "recommendation";
}

// Personal Analytics Types
export interface PersonalitySnapshot {
  completedTests: string[];
  completionRate: number;
  date: string;
  id: string;
  mood?: "negative" | "neutral" | "positive";
  notes?: string;
  testResults: {
    [testType: string]: {
      rawData?: Record<string, unknown>;
      score?: number;
      traits: string[];
      type: string;
    };
  };
  timestamp: number;
  totalTests: number;
}

export interface PersonalityTrend {
  changePercentage: number;
  dataPoints: {
    date: string;
    label: string;
    value: number;
  }[];
  insights: string[];
  testType: string;
  timeframe: "month" | "quarter" | "week" | "year";
  trend: "decreasing" | "increasing" | "stable";
}

export interface WeeklyDigest {
  achievements: string[];
  moodTrend: {
    average: number;
    pattern: "declining" | "improving" | "stable";
  };
  newInsights: number;
  personalityShifts: string[];
  recommendations: string[];
  testsCompleted: number;
  week: string;
}
