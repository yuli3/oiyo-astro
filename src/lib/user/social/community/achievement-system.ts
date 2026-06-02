import { THEME_COLORS } from "@/lib/system/theme";

import {
  Achievement,
  Badge,
  CommunityUser,
  PersonalityType,
  UserContributionLevel,
} from "./community-types";

export interface AchievementConfig {
  badgeRequirements: {
    rarity: {
      common: { minActions: number; timeframe: number };
      epic: {
        minActions: number;
        specialConditions: string[];
        timeframe: number;
      };
      legendary: {
        minActions: number;
        specialConditions: string[];
        timeframe: number;
      };
      rare: {
        minActions: number;
        specialConditions: string[];
        timeframe: number;
      };
    };
  };
  categories: {
    community: {
      enabled: boolean;
      weights: {
        leadership: number;
        moderation: number;
        participation: number;
      };
    };
    personality: {
      enabled: boolean;
      weights: { discovery: number; growth: number; insights: number };
    };
    social: {
      enabled: boolean;
      weights: { connections: number; engagement: number; helping: number };
    };
    streaks: {
      enabled: boolean;
      weights: { daily: number; monthly: number; weekly: number };
    };
  };
  levelingSystem: {
    contributionMultipliers: Record<UserContributionLevel, number>;
    experienceThresholds: number[];
    personalityBonuses: Record<PersonalityType, number>;
  };
}

export class AchievementSystemService {
  private config: AchievementConfig = {
    badgeRequirements: {
      rarity: {
        common: { minActions: 5, timeframe: 7 * 24 * 60 * 60 * 1000 },
        epic: {
          minActions: 50,
          specialConditions: ["leadership", "innovation", "impact"],
          timeframe: 90 * 24 * 60 * 60 * 1000,
        },
        legendary: {
          minActions: 100,
          specialConditions: ["mastery", "mentorship", "legacy"],
          timeframe: 180 * 24 * 60 * 60 * 1000,
        },
        rare: {
          minActions: 20,
          specialConditions: ["consistency", "quality"],
          timeframe: 30 * 24 * 60 * 60 * 1000,
        },
      },
    },
    categories: {
      community: {
        enabled: true,
        weights: { leadership: 3.0, moderation: 2.5, participation: 1.0 },
      },
      personality: {
        enabled: true,
        weights: { discovery: 2.0, growth: 1.8, insights: 1.5 },
      },
      social: {
        enabled: true,
        weights: { connections: 1.0, engagement: 1.2, helping: 1.5 },
      },
      streaks: {
        enabled: true,
        weights: { daily: 1.0, monthly: 2.0, weekly: 1.5 },
      },
    },
    levelingSystem: {
      contributionMultipliers: {
        active: 1.5,
        contributor: 1.2,
        expert: 2.0,
        legend: 3.0,
        mentor: 2.5,
        newcomer: 1.0,
      },
      experienceThresholds: [
        0, 100, 300, 600, 1200, 2000, 3500, 5500, 8500, 12500, 18000,
      ],
      personalityBonuses: {
        "communication-analytical": 1.05,
        "communication-diplomatic": 1.05,
        "communication-direct": 1.05,
        "communication-supportive": 1.15,
        "egenteto-egennam": 1.1,
        "egenteto-egennye": 1.1,
        "egenteto-tetonam": 1.1,
        "egenteto-tetonye": 1.1,
      },
    },
  };

  /**
   * Award a badge to a user
   */
  public awardBadge(user: CommunityUser, badge: Badge): void {
    const alreadyHasBadge = user.communityStats.badges.some(
      (b) => b.id === badge.id,
    );

    if (!alreadyHasBadge) {
      user.communityStats.badges.push(badge);
    }
  }

  /**
   * Award experience points for user actions
   */
  public awardExperience(
    user: CommunityUser,
    action: string,
    basePoints: number,
    category: "community" | "personality" | "social" | "streaks",
  ): number {
    const contributionMultiplier =
      this.config.levelingSystem.contributionMultipliers[
        user.communityStats.contributionLevel
      ];
    const personalityBonus = this.getPersonalityBonus(user);
    const categoryWeight = this.getCategoryWeight(category, action);

    const finalPoints = Math.round(
      basePoints * contributionMultiplier * personalityBonus * categoryWeight,
    );

    // In a real implementation, this would update the user's experience in the database
    return finalPoints;
  }

  /**
   * Calculate achievement statistics for leaderboards
   */
  public calculateAchievementStats(users: CommunityUser[]): {
    categoryLeaders: Record<string, { count: number; user: CommunityUser }[]>;
    rareAchievements: { achievement: Achievement; holders: number }[];
    topAchievers: { score: number; user: CommunityUser }[];
  } {
    // Calculate top achievers by total score
    const topAchievers = users
      .map((user) => ({
        score: this.calculateTotalAchievementScore(user),
        user,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Calculate category leaders
    const categories = ["social", "personality", "community", "streaks"];
    const categoryLeaders: Record<
      string,
      { count: number; user: CommunityUser }[]
    > = {};

    categories.forEach((category) => {
      categoryLeaders[category] = users
        .map((user) => ({
          count: user.communityStats.achievements.filter(
            (a) => a.category === category,
          ).length,
          user,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    });

    // Identify rare achievements
    const allAchievements = this.getAchievementDefinitions();
    const rareAchievements = allAchievements
      .filter(
        (achievement) =>
          achievement.difficulty === "hard" ||
          achievement.difficulty === "legendary",
      )
      .map((achievement) => ({
        achievement,
        holders: users.filter((user) =>
          user.communityStats.achievements.some((a) => a.id === achievement.id),
        ).length,
      }))
      .sort((a, b) => a.holders - b.holders);

    return { categoryLeaders, rareAchievements, topAchievers };
  }

  /**
   * Calculate user's current level based on experience points
   */
  public calculateUserLevel(user: CommunityUser): number {
    const totalExperience = this.calculateTotalExperience(user);
    const thresholds = this.config.levelingSystem.experienceThresholds;

    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalExperience >= thresholds[i]) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Check and award achievements based on user activity
   */
  public async checkAndAwardAchievements(
    user: CommunityUser,
    actionType: string,
    actionData: Record<string, unknown>,
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const achievementDefinitions = this.getAchievementDefinitions();

    for (const definition of achievementDefinitions) {
      if (
        this.meetsAchievementCriteria(user, definition, actionType, actionData)
      ) {
        const alreadyEarned = user.communityStats.achievements.some(
          (a) => a.id === definition.id,
        );

        if (!alreadyEarned) {
          const achievement: Achievement = {
            ...definition,
          };

          user.communityStats.achievements.push(achievement);
          newAchievements.push(achievement);

          // Award badges if applicable
          if (definition.rewards.badges.length > 0) {
            const availableBadges = this.getAvailableBadges();
            definition.rewards.badges.forEach((badgeId) => {
              const badge = availableBadges.find((b) => b.id === badgeId);
              if (badge) {
                this.awardBadge(user, badge);
              }
            });
          }

          // Award experience points
          const categoryMapping: Record<
            string,
            "community" | "personality" | "social" | "streaks"
          > = {
            "community-engagement": "community",
            "personality-discovery": "personality",
            "social-connection": "social",
            "streak-achievements": "streaks",
          };
          const expCategory =
            categoryMapping[definition.category] || "community";
          this.awardExperience(
            user,
            "achievement_earned",
            definition.rewards.experiencePoints,
            expCategory,
          );
        }
      }
    }

    return newAchievements;
  }

  /**
   * Generate achievement insights and suggestions
   */
  public generateAchievementInsights(user: CommunityUser): {
    nextMilestones: string[];
    personalityAlignment: string;
    recommendations: string[];
    strengths: string[];
  } {
    const achievements = user.communityStats.achievements;

    const categoryStats = this.analyzeCategoryPerformance(achievements);
    const strengths = this.identifyStrengths(categoryStats);
    const recommendations = this.generateRecommendations(user, categoryStats);
    const nextMilestones = this.identifyNextMilestones(user);
    const personalityAlignment = this.analyzePersonalityAlignment(user);

    return {
      nextMilestones,
      personalityAlignment,
      recommendations,
      strengths,
    };
  }

  /**
   * Get available badges and their requirements
   */
  public getAvailableBadges(): Badge[] {
    return [
      {
        category: "personality-expert",
        color: THEME_COLORS.primary,
        createdAt: Date.now(),
        description: "다양한 성격 테스트를 완료하고 자신을 탐구한 사람",
        iconUrl: "🔍",
        id: "personality_explorer",
        isAutoAwarded: true,
        name: "성격 탐험가",
        nameKo: "성격 탐험가",
        rarity: "common",
        requirementType: "achievement",
        totalAwarded: 0,
      },
    ];
  }

  /**
   * Calculate experience points to next level
   */
  public getExperienceToNextLevel(user: CommunityUser): {
    current: number;
    percentage: number;
    required: number;
  } {
    const currentLevel = this.calculateUserLevel(user);
    const totalExperience = this.calculateTotalExperience(user);
    const thresholds = this.config.levelingSystem.experienceThresholds;

    if (currentLevel >= thresholds.length - 1) {
      return {
        current: totalExperience,
        percentage: 100,
        required: totalExperience,
      };
    }

    const currentThreshold = thresholds[currentLevel];
    const nextThreshold = thresholds[currentLevel + 1];
    const progressInLevel = totalExperience - currentThreshold;
    const requiredForLevel = nextThreshold - currentThreshold;

    return {
      current: progressInLevel,
      percentage: Math.round((progressInLevel / requiredForLevel) * 100),
      required: requiredForLevel,
    };
  }

  /**
   * Get personalized achievement recommendations
   */
  public getPersonalizedRecommendations(
    user: CommunityUser,
  ): Array<Achievement & { personalityMatch: number; progress: number }> {
    const allAchievements = this.getAchievementDefinitions();
    const userPersonalityTypes = this.extractUserPersonalityTypes(user);

    return allAchievements
      .filter((achievement) => {
        // Filter out already earned achievements
        const alreadyEarned = user.communityStats.achievements.some(
          (a) => a.id === achievement.id,
        );
        if (alreadyEarned) return false;

        // Check if user is close to earning this achievement
        const progress = this.calculateAchievementProgress(user, achievement);
        return progress > 0.3; // Show achievements that are at least 30% complete
      })
      .map((achievement) => ({
        ...achievement,
        personalityMatch: this.calculatePersonalityMatch(
          achievement,
          userPersonalityTypes,
        ),
        progress: this.calculateAchievementProgress(user, achievement),
      }))
      .sort((a, b) => {
        // Prioritize by progress and personality match
        const aScore = a.progress * 0.7 + a.personalityMatch * 0.3;
        const bScore = b.progress * 0.7 + b.personalityMatch * 0.3;
        return bScore - aScore;
      })
      .slice(0, 5);
  }

  private analyzeCategoryPerformance(
    achievements: Achievement[],
  ): Record<string, number> {
    const categories = ["social", "personality", "community", "streaks"];
    const stats: Record<string, number> = {};

    categories.forEach((category) => {
      stats[category] = achievements.filter(
        (a) => a.category === category,
      ).length;
    });

    return stats;
  }

  private analyzePersonalityAlignment(user: CommunityUser): string {
    const profile = user.personalityProfile;

    if (!profile) {
      return "성격 프로필을 완성하여 맞춤형 추천을 받아보세요";
    }

    if (profile.completenessScore >= 80) {
      return "당신의 성격과 잘 맞는 활동들을 추천받고 있습니다";
    }

    return "더 많은 테스트를 완료하면 더 정확한 추천을 받을 수 있습니다";
  }

  private calculateAchievementProgress(
    user: CommunityUser,
    achievement: Achievement,
  ): number {
    // Simplified progress calculation - real implementation would track specific metrics
    switch (achievement.category) {
      case "community-engagement":
        const level = user.communityStats.contributionLevel;
        const levelScores = {
          active: 0.6,
          contributor: 0.3,
          expert: 0.8,
          legend: 1.0,
          mentor: 1.0,
          newcomer: 0.1,
        };
        return levelScores[level] || 0;

      case "personality-growth":
        return (
          Math.min(user.personalityProfile?.completenessScore || 0, 100) / 100
        );

      case "twin-connections":
        return Math.min(user.communityStats.reputationScore / 1000, 1);

      default:
        return 0;
    }
  }

  private calculatePersonalityMatch(
    _achievement: Achievement,
    _userTypes: PersonalityType[],
  ): number {
    // Simplified personality matching for achievements - base score for all achievements
    return 0.6; // Default match score
  }

  private calculateTotalAchievementScore(user: CommunityUser): number {
    let score = 0;

    user.communityStats.achievements.forEach((achievement) => {
      score +=
        (achievement.rewards.experiencePoints || 0) *
        (achievement.rarityScore / 10);
    });

    return score;
  }

  private calculateTotalExperience(user: CommunityUser): number {
    let total = 0;

    // Base experience from achievements
    user.communityStats.achievements.forEach((achievement) => {
      total += achievement.rewards.experiencePoints || 0;
    });

    // Experience from badges (badges don't provide experience points directly)

    // Additional experience from reputation (simplified)
    total += user.communityStats.reputationScore;

    return total;
  }

  private extractUserPersonalityTypes(user: CommunityUser): PersonalityType[] {
    const types: PersonalityType[] = [];
    const profile = user.personalityProfile;

    if (profile?.egenteto?.verified) {
      types.push(`egenteto-${profile.egenteto.type}` as PersonalityType);
    }

    if (profile?.communicationStyle?.verified) {
      types.push(
        `communication-${profile.communicationStyle.type}` as PersonalityType,
      );
    }

    return types;
  }

  private generateRecommendations(
    user: CommunityUser,
    categoryStats: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    if (categoryStats.social < 2) {
      recommendations.push("성격 트윈 찾기를 통해 새로운 인연을 만들어보세요");
    }

    if (categoryStats.personality < 2) {
      recommendations.push("다양한 성격 테스트로 자신을 더 깊이 알아가보세요");
    }

    if (categoryStats.community < 2) {
      recommendations.push("고민 상담소에서 다른 사람들을 도와보세요");
    }

    return recommendations;
  }

  private getAchievementDefinitions(): Achievement[] {
    // This would typically come from a database or configuration file
    return [
      {
        category: "personality-growth",
        createdAt: Date.now(),
        description: "Complete your first personality test",
        descriptionKo: "첫 번째 성격 테스트를 완료했습니다",
        difficulty: "easy",
        iconUrl: "🎯",
        id: "first_test_complete",
        isActive: true,
        isProgressive: false,
        isRepeatable: false,
        name: "첫 발걸음",
        nameKo: "첫 발걸음",
        rarityScore: 10,
        requirements: [
          {
            description: "Complete any personality test",
            metric: "tests_completed",
            target: 1,
            type: "action-count",
          },
        ],
        rewards: {
          badges: [],
          experiencePoints: 50,
          titles: [],
        },
        type: "milestone",
      },
    ];
  }

  private getCategoryWeight(
    category: "community" | "personality" | "social" | "streaks",
    _action: string,
  ): number {
    const categoryConfig = this.config.categories[category];
    if (!categoryConfig.enabled) return 0;

    // Simplified weight calculation - in real implementation, this would be more sophisticated
    const weights = categoryConfig.weights as Record<string, number>;
    const firstWeight = Object.values(weights)[0];
    return firstWeight !== undefined ? firstWeight : 1.0;
  }

  private getPersonalityBonus(user: CommunityUser): number {
    const profile = user.personalityProfile;
    let bonus = 1.0;

    if (profile?.egenteto?.verified) {
      const type = `egenteto-${profile.egenteto.type}` as PersonalityType;
      bonus = Math.max(
        bonus,
        this.config.levelingSystem.personalityBonuses[type] || 1.0,
      );
    }

    if (profile?.communicationStyle?.verified) {
      const type =
        `communication-${profile.communicationStyle.type}` as PersonalityType;
      bonus = Math.max(
        bonus,
        this.config.levelingSystem.personalityBonuses[type] || 1.0,
      );
    }

    return bonus;
  }

  private identifyNextMilestones(user: CommunityUser): string[] {
    const milestones: string[] = [];
    const level = this.calculateUserLevel(user);

    if (level < 3) {
      milestones.push(`레벨 ${level + 1} 달성하기`);
    }

    if (user.communityStats.achievements.length < 5) {
      milestones.push("첫 번째 배지 획득하기");
    }

    milestones.push("새로운 성격 테스트 완료하기");
    milestones.push("토론 공간에 참여하기");

    return milestones;
  }

  private identifyStrengths(categoryStats: Record<string, number>): string[] {
    const strengths: string[] = [];

    if (categoryStats.social >= 3) strengths.push("사교적 활동에 뛰어남");
    if (categoryStats.personality >= 2) strengths.push("자기 탐구에 적극적");
    if (categoryStats.community >= 4) strengths.push("커뮤니티 기여도가 높음");
    if (categoryStats.streaks >= 2) strengths.push("꾸준한 활동력 보유");

    return strengths.length > 0 ? strengths : ["새로운 도전을 시작하는 단계"];
  }

  private meetsAchievementCriteria(
    user: CommunityUser,
    achievement: Achievement,
    actionType: string,
    _actionData: Record<string, unknown>,
  ): boolean {
    // Simplified criteria checking - real implementation would be more sophisticated
    switch (achievement.id) {
      case "first_test_complete":
        return (
          actionType === "test_completed" &&
          (user.personalityProfile?.completenessScore || 0) > 0
        );

      default:
        return false;
    }
  }
}
