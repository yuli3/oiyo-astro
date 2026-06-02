// Personal Progress Tracking Types
// Created: 2025-09-18

export interface PersonalityScore {
  description: string;
  label: string;
  score: number;
  trait: string;
}

export interface PersonalityTrend {
  change: number; // -100 to +100
  changeLabel:
    | "decrease"
    | "increase"
    | "significant_decrease"
    | "significant_increase"
    | "stable";
  currentScore: number;
  dataPoints: Array<{
    date: Date;
    score: number;
    testSlug: string;
  }>;
  firstRecorded: Date;
  label: string;
  lastRecorded: Date;
  previousScore?: number;
  trait: string;
}

export interface ProgressComparison {
  averageScore: number;
  description: string;
  percentile: number; // 0-100
  trait: string;
  userChange: number;
  userScore: number;
}

export interface ProgressDashboard {
  achievements: Array<{
    description: string;
    id: string;
    title: string;
    unlockedAt: Date;
  }>;
  activeGoals: ProgressGoal[];
  currentMetrics: ProgressMetrics;
  recentInsights: ProgressInsight[];
  recentTrends: PersonalityTrend[];
  user: {
    experiencePoints: number;
    id: string;
    level: number;
    nextLevelPoints: number;
  };
}

export interface ProgressGoal {
  completedAt?: Date;
  createdAt: Date;
  currentValue: number;
  deadline?: Date;
  description: string;
  id: string;
  isCompleted: boolean;
  targetValue: number;
  title: string;
  type: "consistency" | "exploration" | "test_completion" | "trait_improvement";
  userId: string;
}

export interface ProgressInsight {
  createdAt: Date;
  data?: Record<string, unknown>;
  description: string;
  id: string;
  isRead?: boolean;
  severity: "achievement" | "info" | "positive" | "warning";
  title: string;
  type:
    | "consistency"
    | "growth"
    | "milestone"
    | "recommendation"
    | "trait_change";
}

export interface ProgressMetrics {
  averageCompletionTime: number;
  consistencyScore: number; // 0-100
  favoriteCategory: string;
  growthTrend: "declining" | "improving" | "stable";
  lastTestDate: Date;
  streak: number; // Days
  totalCompletions: number;
  totalTests: number;
}

export interface ProgressReport {
  generatedAt: Date;
  insights: ProgressInsight[];
  metrics: ProgressMetrics;
  period: "all" | "month" | "quarter" | "week" | "year";
  testHistory: TestProgress[];
  trends: PersonalityTrend[];
  userId: string;
}

export interface TestProgress {
  completedAt: Date;
  completionTime?: number;
  id: string;
  locale: string;
  personalityScores: PersonalityScore[];
  resultType: string;
  sessionId?: string;
  testId: string;
  testSlug: string;
  testTitle: string;
  userId?: string;
}
