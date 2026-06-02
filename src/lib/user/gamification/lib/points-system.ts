/**
 * Comprehensive Gamification System
 * Points, Levels, Streaks, and Rewards
 */

export interface LevelInfo {
  emoji: string;
  id: string;
  level: number;
  nextLevelPoints: number;
  pointsRequired: number;
  progressPercentage: number;
  rewards: string[];
  title: { en: string; ko: string };
}

export interface PointsAction {
  action: string;
  multiplier?: number;
  points: number;
  reason?: string;
}

export interface UserStats {
  achievements: string[];
  currentStreak: number;
  lastActivityDate: string;
  level: number;
  longestStreak: number;
  testsCompleted: number;
  totalPoints: number;
  userId: string;
}

export class GamificationEngine {
  // Level titles and requirements
  private readonly LEVELS = [
    {
      emoji: "🌱",
      id: "beginner",
      level: 1,
      points: 0,
      rewards: ["Profile customization"],
      title: { en: "Beginner", ko: "초심자" },
    },
    {
      emoji: "🔍",
      id: "explorer",
      level: 2,
      points: 500,
      rewards: ["Custom avatar"],
      title: { en: "Explorer", ko: "탐험가" },
    },
    {
      emoji: "🎯",
      id: "seeker",
      level: 3,
      points: 1000,
      rewards: ["Advanced insights"],
      title: { en: "Seeker", ko: "구도자" },
    },
    {
      emoji: "🌟",
      id: "discoverer",
      level: 4,
      points: 2000,
      rewards: ["Premium test access"],
      title: { en: "Discoverer", ko: "발견자" },
    },
    {
      emoji: "🧠",
      id: "insightMaster",
      level: 5,
      points: 4000,
      rewards: ["Exclusive content"],
      title: { en: "Insight Master", ko: "통찰의 대가" },
    },
    {
      emoji: "📚",
      id: "wisdomKeeper",
      level: 6,
      points: 7000,
      rewards: ["Priority support"],
      title: { en: "Wisdom Keeper", ko: "지혜의 수호자" },
    },
    {
      emoji: "🔮",
      id: "selfAwareSage",
      level: 7,
      points: 12000,
      rewards: ["VIP badge"],
      title: { en: "Self-Aware Sage", ko: "자각의 현자" },
    },
    {
      emoji: "✨",
      id: "enlightenedOne",
      level: 8,
      points: 20000,
      rewards: ["Lifetime premium"],
      title: { en: "Enlightened One", ko: "깨달은 자" },
    },
    {
      emoji: "👑",
      id: "personalityGuru",
      level: 9,
      points: 35000,
      rewards: ["Hall of Fame"],
      title: { en: "Personality Guru", ko: "성격 구루" },
    },
    {
      emoji: "💎",
      id: "legendary",
      level: 10,
      points: 50000,
      rewards: ["Ultimate status"],
      title: { en: "Legendary", ko: "전설" },
    },
  ];

  // Points for different actions
  private readonly POINTS_TABLE = {
    BOOKMARK_RESULT: 15,
    COMMENT_POSTED: 30,
    COMPARISON_SHARED: 60,
    DAILY_LOGIN: 25,

    EXPLORE_CATEGORY: 10,
    FEEDBACK_PROVIDED: 50,
    // Special Events
    FIRST_TEST: 200,
    HELPED_OTHERS: 40,

    NIGHT_OWL: 50,
    // Premium Actions
    PREMIUM_SUBSCRIBED: 500,
    PROFILE_COMPLETED: 150,
    // Engagement Actions
    READ_INSIGHT: 20,

    REFERRED_FRIEND: 200,
    RETAKE_TEST: 25,
    // Core Actions
    TEST_COMPLETED: 100,

    TEST_SHARED: 50,
    // Social Actions
    TWIN_FOUND: 75,
    WEEKEND_WARRIOR: 150,
  };

  // Streak multipliers
  private readonly STREAK_MULTIPLIERS = {
    3: 1.2, // 3 days: +20%
    7: 1.5, // 1 week: +50%
    14: 2.0, // 2 weeks: +100%
    30: 2.5, // 1 month: +150%
    60: 3.0, // 2 months: +200%
    100: 4.0, // 100 days: +300%
  };

  /**
   * Get leaderboard position based on points
   */
  calculateLeaderboardPosition(
    userPoints: number,
    totalUsers: number,
  ): {
    percentile: number;
    position: number;
    rank: "Average" | "Top 1%" | "Top 5%" | "Top 10%" | "Top 25%" | "Top 50%";
  } {
    // Simplified calculation - in production, query actual database
    const percentile = Math.random() * 100; // Replace with real calculation

    let rank:
      | "Average"
      | "Top 1%"
      | "Top 5%"
      | "Top 10%"
      | "Top 25%"
      | "Top 50%";
    if (percentile >= 99) rank = "Top 1%";
    else if (percentile >= 95) rank = "Top 5%";
    else if (percentile >= 90) rank = "Top 10%";
    else if (percentile >= 75) rank = "Top 25%";
    else if (percentile >= 50) rank = "Top 50%";
    else rank = "Average";

    return {
      percentile: Math.round(percentile),
      position: Math.floor(((100 - percentile) / 100) * totalUsers),
      rank,
    };
  }

  /**
   * Calculate user level from total points
   */
  calculateLevel(totalPoints: number): LevelInfo {
    let currentLevel = this.LEVELS[0];
    let nextLevel = this.LEVELS[1];

    for (let i = 0; i < this.LEVELS.length; i++) {
      if (totalPoints >= this.LEVELS[i].points) {
        currentLevel = this.LEVELS[i];
        nextLevel = this.LEVELS[i + 1] || this.LEVELS[i];
      } else {
        break;
      }
    }

    const pointsInLevel = totalPoints - currentLevel.points;
    const pointsForNextLevel = nextLevel.points - currentLevel.points;
    const progressPercentage = (pointsInLevel / pointsForNextLevel) * 100;

    return {
      emoji: currentLevel.emoji,
      id: currentLevel.id,
      level: currentLevel.level,
      nextLevelPoints: nextLevel.points,
      pointsRequired: currentLevel.points,
      progressPercentage: Math.min(100, Math.round(progressPercentage)),
      rewards: currentLevel.rewards,
      title: currentLevel.title,
    };
  }

  /**
   * Calculate points for an action with streak multiplier
   */
  calculatePoints(
    action: keyof typeof this.POINTS_TABLE,
    currentStreak: number = 0,
    customMultiplier: number = 1,
  ): PointsAction {
    const basePoints = this.POINTS_TABLE[action] || 0;
    const streakMultiplier = this.getStreakMultiplier(currentStreak);
    const totalMultiplier = streakMultiplier * customMultiplier;

    const finalPoints = Math.round(basePoints * totalMultiplier);

    return {
      action,
      multiplier: totalMultiplier,
      points: finalPoints,
      reason:
        streakMultiplier > 1
          ? `Streak Bonus: ${currentStreak} days!`
          : undefined,
    };
  }

  /**
   * Update and calculate current streak
   */
  calculateStreak(lastActivityDate: null | string): {
    currentStreak: number;
    daysSinceLastActivity: number;
    isStreakActive: boolean;
  } {
    if (!lastActivityDate) {
      return {
        currentStreak: 1,
        daysSinceLastActivity: 0,
        isStreakActive: true,
      };
    }

    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const daysDiff = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) {
      // Same day - keep current streak
      return {
        currentStreak: 0,
        daysSinceLastActivity: 0,
        isStreakActive: true,
      };
    } else if (daysDiff === 1) {
      // Yesterday - streak continues
      return {
        currentStreak: 1,
        daysSinceLastActivity: 1,
        isStreakActive: true,
      };
    } else {
      // Streak broken
      return {
        currentStreak: 0,
        daysSinceLastActivity: daysDiff,
        isStreakActive: false,
      };
    }
  }

  /**
   * Calculate total points with all multipliers
   */
  calculateTotalEarnings(
    baseAction: keyof typeof this.POINTS_TABLE,
    streak: number = 0,
    includeSessionBonuses: boolean = true,
  ): {
    bonuses: PointsAction[];
    mainAction: PointsAction;
    total: number;
  } {
    const mainAction = this.calculatePoints(baseAction, streak);
    const bonuses = includeSessionBonuses ? this.getSessionBonuses(streak) : [];
    const total =
      mainAction.points + bonuses.reduce((sum, bonus) => sum + bonus.points, 0);

    return { bonuses, mainAction, total };
  }

  /**
   * Get daily bonus points
   */
  getDailyBonus(consecutiveDays: number): PointsAction {
    const baseBonus = this.POINTS_TABLE.DAILY_LOGIN;
    const dayBonus = Math.min(consecutiveDays * 5, 100); // +5 points per day, max +100

    return {
      action: "DAILY_BONUS",
      multiplier: 1 + dayBonus / baseBonus,
      points: baseBonus + dayBonus,
      reason: `Day ${consecutiveDays} streak!`,
    };
  }

  /**
   * Return key and params for level up message
   */
  getLevelUpMessageData(
    newLevel: number,
  ): null | { key: string; params: { emoji: string; titleId: string } } {
    const levelInfo = this.LEVELS.find((l) => l.level === newLevel);
    if (!levelInfo) return null;

    return {
      key: "growth.levelUp",
      params: {
        emoji: levelInfo.emoji,
        titleId: levelInfo.id,
      },
    };
  }

  /**
   * Get next milestone for streak
   */
  getNextStreakMilestone(currentStreak: number): null | {
    days: number;
    daysRemaining: number;
    multiplier: number;
  } {
    const milestones = Object.keys(this.STREAK_MULTIPLIERS)
      .map(Number)
      .sort((a, b) => a - b);

    for (const milestone of milestones) {
      if (currentStreak < milestone) {
        return {
          days: milestone,
          daysRemaining: milestone - currentStreak,
          multiplier:
            this.STREAK_MULTIPLIERS[
              milestone as keyof typeof this.STREAK_MULTIPLIERS
            ],
        };
      }
    }

    return null;
  }

  /**
   * Get all available bonuses for current session
   */
  getSessionBonuses(streak: number): PointsAction[] {
    const bonuses: PointsAction[] = [];

    if (this.isWeekendWarrior()) {
      bonuses.push({
        action: "WEEKEND_WARRIOR",
        multiplier: 1.5,
        points: this.POINTS_TABLE.WEEKEND_WARRIOR,
        reason: "Weekend Warrior Bonus!",
      });
    }

    if (this.isNightOwl()) {
      bonuses.push({
        action: "NIGHT_OWL",
        multiplier: 1.2,
        points: this.POINTS_TABLE.NIGHT_OWL,
        reason: "Night Owl Bonus!",
      });
    }

    if (streak > 0) {
      const streakBonus = this.getDailyBonus(streak);
      bonuses.push(streakBonus);
    }

    return bonuses;
  }

  /**
   * Calculate night owl bonus (10PM - 2AM)
   */
  isNightOwl(): boolean {
    const hour = new Date().getHours();
    return hour >= 22 || hour <= 2;
  }

  /**
   * Calculate weekend warrior bonus
   */
  isWeekendWarrior(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  /**
   * Get streak multiplier based on current streak
   */
  private getStreakMultiplier(streak: number): number {
    const milestones = Object.keys(this.STREAK_MULTIPLIERS)
      .map(Number)
      .sort((a, b) => b - a);

    for (const milestone of milestones) {
      if (streak >= milestone) {
        return this.STREAK_MULTIPLIERS[
          milestone as keyof typeof this.STREAK_MULTIPLIERS
        ];
      }
    }

    return 1.0;
  }
}

// Export singleton
export const gamificationEngine = new GamificationEngine();

// Convenience exports
export const calculatePoints = (
  action: keyof (typeof gamificationEngine)["POINTS_TABLE"],
  streak?: number,
  multiplier?: number,
) => gamificationEngine.calculatePoints(action, streak, multiplier);

export const calculateLevel = (points: number) =>
  gamificationEngine.calculateLevel(points);

export const calculateStreak = (lastActivityDate: null | string) =>
  gamificationEngine.calculateStreak(lastActivityDate);

export const getLevelUpMessageData = (newLevel: number) =>
  gamificationEngine.getLevelUpMessageData(newLevel);

export const getTotalEarnings = (
  action: keyof (typeof gamificationEngine)["POINTS_TABLE"],
  streak?: number,
) => gamificationEngine.calculateTotalEarnings(action, streak);
