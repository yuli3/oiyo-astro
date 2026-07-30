// Achievement System Type Definitions
import type { Locale } from "@/i18n";

export enum AchievementType {
  EXPLORATION = "exploration",
  SOCIAL = "social",
  SPECIAL = "special",
  STREAK = "streak",
  TEST_COMPLETION = "test_completion",
}

export enum BadgeTier {
  BRONZE = "bronze",
  GOLD = "gold",
  PLATINUM = "platinum",
  SILVER = "silver",
}

export interface Achievement {
  category: string; // For organizing achievements
  description: Record<Locale, string>;
  hidden: boolean; // Whether achievement is discoverable before unlock
  icon: string; // Lucide icon name
  id: string;
  requirement: {
    condition?: string; // Additional conditions
    target: number | string;
    type: string; // 'count', 'streak', 'specific_test', 'category_completion'
  };
  reward: {
    badge?: string; // Special badge identifier
    points: number;
    unlocks?: string[]; // Special content or features unlocked
  };
  tier: BadgeTier;
  title: Record<Locale, string>;
  type: AchievementType;
}

export interface AchievementCategory {
  achievements: string[]; // Achievement IDs in this category
  color: string; // Tailwind color class
  description: Record<Locale, string>;
  icon: string;
  id: string;
  name: Record<Locale, string>;
}

// Achievement configuration
export interface AchievementConfig {
  autoSave: boolean;
  enableAnimations: boolean;
  enableNotifications: boolean;
  showProgress: boolean;
}

export interface AchievementDefinitionSummary {
  basePoints?: number;
  category:
    | "community_engagement"
    | "insight_discovery"
    | "social_connection"
    | "streak_achievement"
    | "test_completion";
  ctaKey?: null | string;
  descriptionKey?: string;
  icon?: null | string;
  rarity: BadgeTier;
  requirements?: null | Record<string, unknown>;
  slug: string;
  titleKey?: string;
  translationKey?: string;
  type: "composite" | "event_count" | "special" | "streak" | "threshold";
}

// Event types for achievement tracking
export interface AchievementEvent {
  category?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  testId?: string;
  timestamp: Date;
  type:
    | "category_explored"
    | "daily_visit"
    | "result_shared"
    | "test_completed"
    | "test_started";
  userId?: string;
}

export interface AchievementNotification {
  achievementId: string;
  description: string;
  icon: string;
  points: number;
  tier: BadgeTier;
  timestamp: Date;
  title: string;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  description: string;
  isComplete: boolean;
  percentage: number;
  targetValue: number;
}

// Achievement trigger conditions
export interface AchievementTrigger {
  condition: (
    event: AchievementEvent,
    userHistory: AchievementEvent[],
  ) => boolean;
  eventType: string;
  progressCalculator: (
    event: AchievementEvent,
    userHistory: AchievementEvent[],
  ) => number;
}

export interface UserAchievement {
  achievementId: string;
  notificationShown: boolean;
  progress: number; // Current progress towards requirement
  sessionId?: string; // For anonymous tracking
  unlocked: boolean;
  unlockedAt?: Date;
  userId?: string; // Optional for anonymous users
}

export interface UserAchievementStats {
  completionRate: number;
  nextAchievements: AchievementProgress[];
  recentAchievements: UserAchievement[];
  tierCounts: {
    [BadgeTier.BRONZE]: number;
    [BadgeTier.GOLD]: number;
    [BadgeTier.PLATINUM]: number;
    [BadgeTier.SILVER]: number;
  };
  totalAchievements: number;
  totalPoints: number;
  unlockedAchievements: number;
}

// User progress tracking
export interface UserProgress {
  achievements: UserAchievement[];
  level: number;
  sessionId?: string;
  stats: {
    categoriesExplored: string[];
    consecutiveDays: number;
    resultsShared: number;
    testsCompleted: number;
  };
  streaks: {
    current: number;
    lastActivity: Date;
    longest: number;
  };
  totalPoints: number;
  userId?: string;
}
