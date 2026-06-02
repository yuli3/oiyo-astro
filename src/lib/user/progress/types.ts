export interface PersonalityDevelopment {
  currentLevel: number;
  dimension: string;
  label: {
    en: string;
    ko: string;
  };
  progress: number;
  recommendations: string[];
  targetLevel: number;
  trend: "down" | "stable" | "up";
}

export interface ProgressChartData {
  date: string;
  improvement?: number;
  score: number;
  testName: string;
}

export interface ProgressFilter {
  limit?: number;
  minScore?: number;
  sortBy?: "date" | "improvement" | "score";
  testTypes?: string[];
  timeRange?: "1y" | "3m" | "6m" | "7d" | "30d" | "all";
}

export interface ProgressInsight {
  data?: Record<string, unknown>;
  description: string;
  icon: string;
  id: string;
  timestamp: string;
  title: string;
  type: "achievement" | "consistency" | "improvement" | "milestone";
}

export interface ProgressStats {
  averageImprovement: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  monthlyGoal: number;
  totalTests: number;
  weeklyAverage: number;
}

export interface TestProgress {
  attempts: number;
  averageScore: number;
  bestScore: number;
  firstTakenAt: string;
  improvement: number;
  lastTakenAt: string;
  latestScore: number;
  testId: string;
  testName: string;
}

// Personal Progress Tracking Types
export interface UserProgress {
  averageScore: number;
  consistencyScore: number;
  createdAt: string;
  growthAreas: string[];
  id: string;
  improvementTrend: "declining" | "improving" | "stable";
  lastTestDate: string;
  sessionId?: string;
  strongestAreas: string[];
  testsTaken: number;
  totalScore: number;
  updatedAt: string;
  userId: string;
}
