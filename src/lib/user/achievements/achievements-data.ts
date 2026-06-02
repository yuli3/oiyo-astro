// Comprehensive achievements and badges system
// Last updated: 2025-11-13

export enum AchievementType {
  MILESTONE = "milestone",
  RARE = "rare",
  SOCIAL = "social",
  SPECIAL = "special",
  STREAK = "streak",
  TEST_COMPLETION = "test_completion",
}

export enum BadgeTier {
  BRONZE = "bronze",
  DIAMOND = "diamond",
  GOLD = "gold",
  PLATINUM = "platinum",
  SILVER = "silver",
}

export interface Achievement {
  category: string;
  description: { en: string; ko: string };
  emoji: string;
  hidden: boolean;
  icon: string;
  id: string;
  order: number;
  requirement: {
    minScore?: number;
    target?: number | string;
    type: string;
    value?: number;
  };
  reward: {
    badge?: string;
    points: number;
  };
  tier: BadgeTier;
  title: { en: string; ko: string };
  type: AchievementType;
}

// Comprehensive achievement definitions
export const achievements: Achievement[] = [
  // ===== MILESTONE ACHIEVEMENTS =====
  {
    category: "milestone",
    description: {
      en: "Complete your first personality test",
      ko: "첫 성격 테스트를 완료했습니다",
    },
    emoji: "🎯",
    hidden: false,
    icon: "Target",
    id: "first_test",
    order: 1,
    requirement: { type: "test_count", value: 1 },
    reward: { points: 10 },
    tier: BadgeTier.BRONZE,
    title: { en: "First Test Completed", ko: "첫 테스트 완료" },
    type: AchievementType.MILESTONE,
  },
  {
    category: "milestone",
    description: {
      en: "Complete 5 personality tests",
      ko: "5개의 테스트를 완료했습니다",
    },
    emoji: "🗺️",
    hidden: false,
    icon: "Map",
    id: "five_tests",
    order: 2,
    requirement: { type: "test_count", value: 5 },
    reward: { points: 50 },
    tier: BadgeTier.BRONZE,
    title: { en: "Explorer", ko: "탐험가" },
    type: AchievementType.MILESTONE,
  },
  {
    category: "milestone",
    description: {
      en: "Complete 10 personality tests",
      ko: "10개의 테스트를 완료했습니다",
    },
    emoji: "🔍",
    hidden: false,
    icon: "Search",
    id: "ten_tests",
    order: 3,
    requirement: { type: "test_count", value: 10 },
    reward: { points: 100 },
    tier: BadgeTier.SILVER,
    title: { en: "Self-Discovery Expert", ko: "자기발견 전문가" },
    type: AchievementType.MILESTONE,
  },
  {
    category: "milestone",
    description: {
      en: "Complete 25 personality tests",
      ko: "25개의 테스트를 완료했습니다",
    },
    emoji: "👑",
    hidden: false,
    icon: "Crown",
    id: "twenty_five_tests",
    order: 4,
    requirement: { type: "test_count", value: 25 },
    reward: { points: 250 },
    tier: BadgeTier.GOLD,
    title: { en: "Personality Master", ko: "성격 마스터" },
    type: AchievementType.MILESTONE,
  },
  {
    category: "milestone",
    description: {
      en: "Complete 50 personality tests",
      ko: "50개의 테스트를 완료했습니다",
    },
    emoji: "💎",
    hidden: false,
    icon: "Gem",
    id: "fifty_tests",
    order: 5,
    requirement: { type: "test_count", value: 50 },
    reward: { points: 500 },
    tier: BadgeTier.PLATINUM,
    title: { en: "Completionist", ko: "완벽주의자" },
    type: AchievementType.MILESTONE,
  },

  // ===== CATEGORY-SPECIFIC ACHIEVEMENTS =====
  {
    category: "test_completion",
    description: {
      en: "Complete all core personality tests",
      ko: "핵심 성격 테스트를 모두 완료했습니다",
    },
    emoji: "🧠",
    hidden: false,
    icon: "Brain",
    id: "core_personality_complete",
    order: 10,
    requirement: { target: "core_personality", type: "category_complete" },
    reward: { points: 150 },
    tier: BadgeTier.SILVER,
    title: { en: "Core Personality Discovered", ko: "핵심 성격 발견" },
    type: AchievementType.TEST_COMPLETION,
  },
  {
    category: "test_completion",
    description: {
      en: "Complete all relationship tests",
      ko: "인간관계 테스트를 모두 완료했습니다",
    },
    emoji: "💑",
    hidden: false,
    icon: "Heart",
    id: "relationship_expert",
    order: 11,
    requirement: { target: "relationships", type: "category_complete" },
    reward: { points: 200 },
    tier: BadgeTier.GOLD,
    title: { en: "Relationship Expert", ko: "관계 전문가" },
    type: AchievementType.TEST_COMPLETION,
  },
  {
    category: "test_completion",
    description: {
      en: "Complete all wellness tests",
      ko: "건강 및 웰빙 테스트를 모두 완료했습니다",
    },
    emoji: "🧘",
    hidden: false,
    icon: "Sparkles",
    id: "wellness_master",
    order: 12,
    requirement: { target: "wellness", type: "category_complete" },
    reward: { points: 200 },
    tier: BadgeTier.GOLD,
    title: { en: "Wellness Master", ko: "웰니스 마스터" },
    type: AchievementType.TEST_COMPLETION,
  },
  {
    category: "test_completion",
    description: {
      en: "Complete all career tests",
      ko: "커리어 관련 테스트를 모두 완료했습니다",
    },
    emoji: "💼",
    hidden: false,
    icon: "Briefcase",
    id: "career_guru",
    order: 13,
    requirement: { target: "career", type: "category_complete" },
    reward: { points: 200 },
    tier: BadgeTier.GOLD,
    title: { en: "Career Guru", ko: "커리어 구루" },
    type: AchievementType.TEST_COMPLETION,
  },

  // ===== SOCIAL ACHIEVEMENTS =====
  {
    category: "social",
    description: {
      en: "Share your first test result",
      ko: "테스트 결과를 처음으로 공유했습니다",
    },
    emoji: "📤",
    hidden: false,
    icon: "Share2",
    id: "first_share",
    order: 20,
    requirement: { type: "share_count", value: 1 },
    reward: { points: 20 },
    tier: BadgeTier.BRONZE,
    title: { en: "First Share", ko: "첫 공유" },
    type: AchievementType.SOCIAL,
  },
  {
    category: "social",
    description: {
      en: "Share results 10 times",
      ko: "10회 이상 결과를 공유했습니다",
    },
    emoji: "🦋",
    hidden: false,
    icon: "Users",
    id: "social_butterfly",
    order: 21,
    requirement: { type: "share_count", value: 10 },
    reward: { points: 100 },
    tier: BadgeTier.SILVER,
    title: { en: "Social Butterfly", ko: "소셜 나비" },
    type: AchievementType.SOCIAL,
  },
  {
    category: "social",
    description: {
      en: "Get 100+ views on shared results",
      ko: "공유한 결과가 100회 이상 조회되었습니다",
    },
    emoji: "⭐",
    hidden: false,
    icon: "Star",
    id: "influencer",
    order: 22,
    requirement: { type: "share_views", value: 100 },
    reward: { points: 300 },
    tier: BadgeTier.GOLD,
    title: { en: "Influencer", ko: "인플루언서" },
    type: AchievementType.SOCIAL,
  },

  // ===== STREAK ACHIEVEMENTS =====
  {
    category: "streak",
    description: {
      en: "Visit 3 days in a row",
      ko: "3일 연속으로 방문했습니다",
    },
    emoji: "🔥",
    hidden: false,
    icon: "Flame",
    id: "three_day_streak",
    order: 30,
    requirement: { type: "streak_days", value: 3 },
    reward: { points: 30 },
    tier: BadgeTier.BRONZE,
    title: { en: "3-Day Streak", ko: "3일 연속" },
    type: AchievementType.STREAK,
  },
  {
    category: "streak",
    description: {
      en: "Visit 7 days in a row",
      ko: "7일 연속으로 방문했습니다",
    },
    emoji: "🏃",
    hidden: false,
    icon: "Activity",
    id: "seven_day_streak",
    order: 31,
    requirement: { type: "streak_days", value: 7 },
    reward: { points: 70 },
    tier: BadgeTier.SILVER,
    title: { en: "Week Marathon", ko: "1주일 마라톤" },
    type: AchievementType.STREAK,
  },
  {
    category: "streak",
    description: {
      en: "Visit 30 days in a row",
      ko: "30일 연속으로 방문했습니다",
    },
    emoji: "🎖️",
    hidden: false,
    icon: "Medal",
    id: "thirty_day_streak",
    order: 32,
    requirement: { type: "streak_days", value: 30 },
    reward: { points: 300 },
    tier: BadgeTier.GOLD,
    title: { en: "Month Challenge", ko: "한 달 챌린지" },
    type: AchievementType.STREAK,
  },
  {
    category: "streak",
    description: {
      en: "Visit 100 days in a row",
      ko: "100일 연속으로 방문했습니다",
    },
    emoji: "💯",
    hidden: false,
    icon: "Award",
    id: "hundred_day_streak",
    order: 33,
    requirement: { type: "streak_days", value: 100 },
    reward: { points: 1000 },
    tier: BadgeTier.PLATINUM,
    title: { en: "Hundred Days Master", ko: "백일 장인" },
    type: AchievementType.STREAK,
  },

  // ===== SPECIAL ACHIEVEMENTS =====
  {
    category: "special",
    description: {
      en: "Complete a test before 5 AM",
      ko: "새벽 5시 이전에 테스트를 완료했습니다",
    },
    emoji: "🌅",
    hidden: true,
    icon: "Sunrise",
    id: "early_bird",
    order: 40,
    requirement: { type: "time_of_day", value: 5 },
    reward: { points: 50 },
    tier: BadgeTier.GOLD,
    title: { en: "Early Bird", ko: "얼리버드" },
    type: AchievementType.SPECIAL,
  },
  {
    category: "special",
    description: {
      en: "Complete a test after midnight",
      ko: "자정 이후에 테스트를 완료했습니다",
    },
    emoji: "🌙",
    hidden: true,
    icon: "Moon",
    id: "night_owl",
    order: 41,
    requirement: { type: "time_of_day", value: 24 },
    reward: { points: 50 },
    tier: BadgeTier.GOLD,
    title: { en: "Night Owl", ko: "올빼미족" },
    type: AchievementType.SPECIAL,
  },
  {
    category: "special",
    description: {
      en: "Complete 5+ tests in one day",
      ko: "하루에 5개 이상의 테스트를 완료했습니다",
    },
    emoji: "⚡",
    hidden: false,
    icon: "Zap",
    id: "speed_runner",
    order: 42,
    requirement: { type: "tests_per_day", value: 5 },
    reward: { points: 100 },
    tier: BadgeTier.SILVER,
    title: { en: "Speed Runner", ko: "스피드 러너" },
    type: AchievementType.SPECIAL,
  },
  {
    category: "special",
    description: {
      en: "Get perfect scores on 10 tests",
      ko: "모든 질문에 답변하고 높은 점수를 받았습니다",
    },
    emoji: "✨",
    hidden: true,
    icon: "Sparkles",
    id: "perfectionist",
    order: 43,
    requirement: { type: "perfect_scores", value: 10 },
    reward: { points: 500 },
    tier: BadgeTier.PLATINUM,
    title: { en: "Perfectionist", ko: "완벽주의자" },
    type: AchievementType.SPECIAL,
  },
  {
    category: "special",
    description: {
      en: "Complete a test on your birthday",
      ko: "생일에 테스트를 완료했습니다",
    },
    emoji: "🎂",
    hidden: true,
    icon: "Cake",
    id: "birthday_bonus",
    order: 44,
    requirement: { target: "birthday", type: "special_date" },
    reward: { points: 100 },
    tier: BadgeTier.DIAMOND,
    title: { en: "Happy Birthday!", ko: "생일 축하합니다!" },
    type: AchievementType.SPECIAL,
  },
  {
    category: "special",
    description: {
      en: "Complete a test on New Year's Day",
      ko: "새해 첫날에 테스트를 완료했습니다",
    },
    emoji: "🎆",
    hidden: true,
    icon: "Sparkles",
    id: "new_year_special",
    order: 45,
    requirement: { target: "new_year", type: "special_date" },
    reward: { points: 150 },
    tier: BadgeTier.DIAMOND,
    title: { en: "Happy New Year", ko: "새해 복 많이" },
    type: AchievementType.SPECIAL,
  },

  // ===== RARE ACHIEVEMENTS =====
  {
    category: "rare",
    description: {
      en: "Complete at least one test from every category",
      ko: "모든 카테고리의 테스트를 완료했습니다",
    },
    emoji: "🏆",
    hidden: false,
    icon: "Trophy",
    id: "all_categories",
    order: 50,
    requirement: { type: "all_categories", value: 10 },
    reward: { points: 1000 },
    tier: BadgeTier.DIAMOND,
    title: { en: "Expert Collector", ko: "전문가 컬렉터" },
    type: AchievementType.RARE,
  },
  {
    category: "special",
    description: {
      en: "Purchase a premium report",
      ko: "프리미엄 리포트를 구매했습니다",
    },
    emoji: "💳",
    hidden: false,
    icon: "CreditCard",
    id: "premium_member",
    order: 51,
    requirement: { target: "premium_report", type: "purchase" },
    reward: { points: 500 },
    tier: BadgeTier.DIAMOND,
    title: { en: "Premium Member", ko: "프리미엄 멤버" },
    type: AchievementType.SPECIAL,
  },
  {
    category: "rare",
    description: {
      en: "Be among the first to try a new test",
      ko: "새로운 테스트를 가장 먼저 시도했습니다",
    },
    emoji: "🔬",
    hidden: true,
    icon: "FlaskConical",
    id: "beta_tester",
    order: 52,
    requirement: { type: "early_adopter", value: 100 },
    reward: { points: 200 },
    tier: BadgeTier.PLATINUM,
    title: { en: "Beta Tester", ko: "베타 테스터" },
    type: AchievementType.RARE,
  },
  {
    category: "social",
    description: {
      en: "Provide 5+ helpful feedback submissions",
      ko: "5개 이상의 유용한 피드백을 제공했습니다",
    },
    emoji: "📝",
    hidden: false,
    icon: "MessageSquare",
    id: "feedback_hero",
    order: 53,
    requirement: { type: "feedback_count", value: 5 },
    reward: { points: 250 },
    tier: BadgeTier.GOLD,
    title: { en: "Feedback Hero", ko: "피드백 영웅" },
    type: AchievementType.SOCIAL,
  },
];

export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 600) return 3;
  if (totalPoints < 1000) return 4;
  if (totalPoints < 1500) return 5;
  if (totalPoints < 2100) return 6;
  if (totalPoints < 2800) return 7;
  if (totalPoints < 3600) return 8;
  if (totalPoints < 4500) return 9;
  return 10;
}

// Helper functions
export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((achievement) => achievement.id === id);
}

export function getAchievementProgress(
  userTestCount: number,
  userShareCount: number,
  userStreakDays: number,
): Record<string, number> {
  const progress: Record<string, number> = {};

  achievements.forEach((achievement) => {
    switch (achievement.requirement.type) {
      case "share_count":
        progress[achievement.id] = Math.min(
          100,
          (userShareCount / (achievement.requirement.value || 1)) * 100,
        );
        break;
      case "streak_days":
        progress[achievement.id] = Math.min(
          100,
          (userStreakDays / (achievement.requirement.value || 1)) * 100,
        );
        break;
      case "test_count":
        progress[achievement.id] = Math.min(
          100,
          (userTestCount / (achievement.requirement.value || 1)) * 100,
        );
        break;
      default:
        progress[achievement.id] = 0;
    }
  });

  return progress;
}

export function getAchievementsByCategory(category: string): Achievement[] {
  return achievements.filter(
    (achievement) => achievement.category === category,
  );
}

export function getAchievementsByTier(tier: BadgeTier): Achievement[] {
  return achievements.filter((achievement) => achievement.tier === tier);
}

export function getAchievementsByType(type: AchievementType): Achievement[] {
  return achievements.filter((achievement) => achievement.type === type);
}

export function getPointsForNextLevel(currentPoints: number): number {
  const thresholds = [
    0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500,
  ];
  const currentLevel = calculateLevel(currentPoints);

  if (currentLevel >= 10) return 0; // Max level

  return thresholds[currentLevel] - currentPoints;
}

export function getTotalPossiblePoints(): number {
  return achievements.reduce(
    (total, achievement) => total + achievement.reward.points,
    0,
  );
}

export function getVisibleAchievements(): Achievement[] {
  return achievements.filter((achievement) => !achievement.hidden);
}
