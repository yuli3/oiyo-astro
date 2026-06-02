// Achievement System Data & Badge Definitions

import {
  Achievement,
  AchievementCategory,
  AchievementType,
  BadgeTier,
} from "./types";

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    achievements: ["first_test", "social_sharer", "welcome_explorer"],
    color: "green",
    description: {
      cn: "Commemorating your first steps in personality exploration",
      en: "Commemorating your first steps in personality exploration",
      es: "Commemorating your first steps in personality exploration",
      fr: "Commemorating your first steps in personality exploration",
      ja: "Commemorating your first steps in personality exploration",
      ko: "새로운 여정을 시작하는 기념비적인 순간들",
    },
    icon: "Footprints",
    id: "first_steps",
    name: {
      cn: "First Steps",
      en: "First Steps",
      es: "First Steps",
      fr: "First Steps",
      ja: "First Steps",
      ko: "첫 걸음",
    },
  },
  {
    achievements: ["category_explorer", "test_veteran", "completionist"],
    color: "teal",
    description: {
      cn: "Adventurous souls exploring different personality tests",
      en: "Adventurous souls exploring different personality tests",
      es: "Adventurous souls exploring different personality tests",
      fr: "Adventurous souls exploring different personality tests",
      ja: "Adventurous souls exploring different personality tests",
      ko: "다양한 성격 테스트를 경험하는 모험가",
    },
    icon: "Compass",
    id: "explorer",
    name: {
      cn: "Explorer",
      en: "Explorer",
      es: "Explorer",
      fr: "Explorer",
      ja: "Explorer",
      ko: "탐험가",
    },
  },
  {
    achievements: ["share_master", "viral_result", "community_builder"],
    color: "amber",
    description: {
      cn: "Sharing results and connecting with others",
      en: "Sharing results and connecting with others",
      es: "Sharing results and connecting with others",
      fr: "Sharing results and connecting with others",
      ja: "Sharing results and connecting with others",
      ko: "결과를 공유하고 다른 사람들과 연결하는 활동",
    },
    icon: "Users",
    id: "social",
    name: {
      cn: "Social Connector",
      en: "Social Connector",
      es: "Social Connector",
      fr: "Social Connector",
      ja: "Social Connector",
      ko: "소셜 커넥터",
    },
  },
  {
    achievements: ["daily_visitor", "week_warrior", "month_champion"],
    color: "orange",
    description: {
      cn: "Achievements for consistent activity and dedication",
      en: "Achievements for consistent activity and dedication",
      es: "Achievements for consistent activity and dedication",
      fr: "Achievements for consistent activity and dedication",
      ja: "Achievements for consistent activity and dedication",
      ko: "꾸준한 활동과 지속적인 관심을 보여주는 업적",
    },
    icon: "Target",
    id: "dedication",
    name: {
      cn: "Dedication",
      en: "Dedication",
      es: "Dedication",
      fr: "Dedication",
      ja: "Dedication",
      ko: "헌신자",
    },
  },
  {
    achievements: ["rare_combination", "perfect_match", "fortune_teller"],
    color: "gold",
    description: {
      cn: "Discovering rare results and special combinations",
      en: "Discovering rare results and special combinations",
      es: "Discovering rare results and special combinations",
      fr: "Discovering rare results and special combinations",
      ja: "Discovering rare results and special combinations",
      ko: "특별하고 희귀한 결과나 조합을 발견한 순간",
    },
    icon: "Star",
    id: "special",
    name: {
      cn: "Special Moments",
      en: "Special Moments",
      es: "Special Moments",
      fr: "Special Moments",
      ja: "Special Moments",
      ko: "특별한 순간",
    },
  },
];

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
  // FIRST STEPS CATEGORY
  {
    category: "first_steps",
    description: {
      cn: "Completed your first personality test! Your journey of self-discovery begins.",
      en: "Completed your first personality test! Your journey of self-discovery begins.",
      es: "Completed your first personality test! Your journey of self-discovery begins.",
      fr: "Completed your first personality test! Your journey of self-discovery begins.",
      ja: "Completed your first personality test! Your journey of self-discovery begins.",
      ko: "첫 번째 성격 테스트를 완료했습니다! 자기 발견의 여정이 시작되었어요.",
    },
    hidden: false,
    icon: "PlayCircle",
    id: "first_test",
    requirement: {
      condition: "test_completed",
      target: 1,
      type: "count",
    },
    reward: {
      badge: "newcomer",
      points: 50,
    },
    tier: BadgeTier.BRONZE,
    title: {
      cn: "First Test",
      en: "First Test",
      es: "First Test",
      fr: "First Test",
      ja: "First Test",
      ko: "첫 번째 테스트",
    },
    type: AchievementType.TEST_COMPLETION,
  },
  {
    category: "first_steps",
    description: {
      cn: "Share your results at least three times this week to earn the social badge.",
      en: "Share your results at least three times this week to earn the social badge.",
      es: "Share your results at least three times this week to earn the social badge.",
      fr: "Share your results at least three times this week to earn the social badge.",
      ja: "Share your results at least three times this week to earn the social badge.",
      ko: "이번 주에 최소 3번 결과를 공유하면 소셜 배지를 얻을 수 있어요.",
    },
    hidden: false,
    icon: "Share2",
    id: "social_sharer",
    requirement: {
      condition: "result_shared",
      target: 3,
      type: "count",
    },
    reward: {
      badge: "sharer",
      points: 75,
    },
    tier: BadgeTier.SILVER,
    title: {
      cn: "Social Sharer",
      en: "Social Sharer",
      es: "Social Sharer",
      fr: "Social Sharer",
      ja: "Social Sharer",
      ko: "결과를 친구와 공유하기",
    },
    type: AchievementType.SOCIAL,
  },
  {
    category: "first_steps",
    description: {
      cn: "Completed your first blood type personality test",
      en: "Completed your first blood type personality test",
      es: "Completed your first blood type personality test",
      fr: "Completed your first blood type personality test",
      ja: "Completed your first blood type personality test",
      ko: "첫 번째 혈액형 성격 테스트를 완료했습니다",
    },
    hidden: false,
    icon: "Droplets",
    id: "blood_type_explorer",
    requirement: {
      condition: "completed",
      target: "blood-type",
      type: "specific_test",
    },
    reward: {
      badge: "blood_explorer",
      points: 40,
    },
    tier: BadgeTier.BRONZE,
    title: {
      cn: "Blood Type Explorer",
      en: "Blood Type Explorer",
      es: "Blood Type Explorer",
      fr: "Blood Type Explorer",
      ja: "Blood Type Explorer",
      ko: "혈액형 탐험가",
    },
    type: AchievementType.TEST_COMPLETION,
  },
  {
    category: "first_steps",
    description: {
      cn: "Completed your first Saju analysis. Beginning to meet traditional wisdom!",
      en: "Completed your first Saju analysis. Beginning to meet traditional wisdom!",
      es: "Completed your first Saju analysis. Beginning to meet traditional wisdom!",
      fr: "Completed your first Saju analysis. Beginning to meet traditional wisdom!",
      ja: "Completed your first Saju analysis. Beginning to meet traditional wisdom!",
      ko: "첫 번째 사주 분석을 완료했습니다. 전통의 지혜를 만나는 시작이에요!",
    },
    hidden: false,
    icon: "ScrollText",
    id: "saju_explorer",
    requirement: {
      condition: "completed",
      target: "saju",
      type: "specific_test",
    },
    reward: {
      badge: "saju_initiate",
      points: 60,
    },
    tier: BadgeTier.BRONZE,
    title: {
      cn: "Saju Explorer",
      en: "Saju Explorer",
      es: "Saju Explorer",
      fr: "Saju Explorer",
      ja: "Saju Explorer",
      ko: "사주 탐험가",
    },
    type: AchievementType.TEST_COMPLETION,
  },

  // EXPLORER CATEGORY
  {
    category: "explorer",
    description: {
      cn: "Completed tests from 5 different categories. True versatility!",
      en: "Completed tests from 5 different categories. True versatility!",
      es: "Completed tests from 5 different categories. True versatility!",
      fr: "Completed tests from 5 different categories. True versatility!",
      ja: "Completed tests from 5 different categories. True versatility!",
      ko: "5개의 다른 카테고리에서 테스트를 완료했습니다. 진정한 다재다능함이에요!",
    },
    hidden: false,
    icon: "Grid3x3",
    id: "category_explorer",
    requirement: {
      condition: "different_categories",
      target: 5,
      type: "category_completion",
    },
    reward: {
      badge: "versatile",
      points: 150,
      unlocks: ["advanced_insights"],
    },
    tier: BadgeTier.SILVER,
    title: {
      cn: "Category Explorer",
      en: "Category Explorer",
      es: "Category Explorer",
      fr: "Category Explorer",
      ja: "Category Explorer",
      ko: "카테고리 탐험가",
    },
    type: AchievementType.EXPLORATION,
  },
  {
    category: "explorer",
    description: {
      cn: "Completed 10 tests in total. You are now a true veteran!",
      en: "Completed 10 tests in total. You are now a true veteran!",
      es: "Completed 10 tests in total. You are now a true veteran!",
      fr: "Completed 10 tests in total. You are now a true veteran!",
      ja: "Completed 10 tests in total. You are now a true veteran!",
      ko: "총 10개의 테스트를 완료했습니다. 당신은 이제 진정한 베테랑이에요!",
    },
    hidden: false,
    icon: "Award",
    id: "test_veteran",
    requirement: {
      condition: "tests_completed",
      target: 10,
      type: "count",
    },
    reward: {
      badge: "veteran",
      points: 200,
    },
    tier: BadgeTier.SILVER,
    title: {
      cn: "Test Veteran",
      en: "Test Veteran",
      es: "Test Veteran",
      fr: "Test Veteran",
      ja: "Test Veteran",
      ko: "테스트 베테랑",
    },
    type: AchievementType.TEST_COMPLETION,
  },
  {
    category: "explorer",
    description: {
      cn: "Completed 25 tests. Your self-understanding is now at expert level!",
      en: "Completed 25 tests. Your self-understanding is now at expert level!",
      es: "Completed 25 tests. Your self-understanding is now at expert level!",
      fr: "Completed 25 tests. Your self-understanding is now at expert level!",
      ja: "Completed 25 tests. Your self-understanding is now at expert level!",
      ko: "25개의 테스트를 완료했습니다. 당신의 자기 이해는 이제 전문가 수준이에요!",
    },
    hidden: false,
    icon: "Trophy",
    id: "completionist",
    requirement: {
      condition: "tests_completed",
      target: 25,
      type: "count",
    },
    reward: {
      badge: "master",
      points: 500,
      unlocks: ["expert_analysis", "premium_insights"],
    },
    tier: BadgeTier.GOLD,
    title: {
      cn: "Completionist",
      en: "Completionist",
      es: "Completionist",
      fr: "Completionist",
      ja: "Completionist",
      ko: "완주자",
    },
    type: AchievementType.TEST_COMPLETION,
  },

  // SOCIAL CATEGORY
  {
    category: "social",
    description: {
      cn: "Shared 5 results. Your open mind inspires others!",
      en: "Shared 5 results. Your open mind inspires others!",
      es: "Shared 5 results. Your open mind inspires others!",
      fr: "Shared 5 results. Your open mind inspires others!",
      ja: "Shared 5 results. Your open mind inspires others!",
      ko: "5번의 결과를 공유했습니다. 당신의 오픈마인드가 다른 사람들에게 영감을 줍니다!",
    },
    hidden: false,
    icon: "MessageCircle",
    id: "share_master",
    requirement: {
      condition: "results_shared",
      target: 5,
      type: "count",
    },
    reward: {
      badge: "communicator",
      points: 125,
    },
    tier: BadgeTier.SILVER,
    title: {
      cn: "Share Master",
      en: "Share Master",
      es: "Share Master",
      fr: "Share Master",
      ja: "Share Master",
      ko: "공유 마스터",
    },
    type: AchievementType.SOCIAL,
  },

  // DEDICATION CATEGORY
  {
    category: "dedication",
    description: {
      cn: "Visited for 3 consecutive days. Consistent interest builds good habits!",
      en: "Visited for 3 consecutive days. Consistent interest builds good habits!",
      es: "Visited for 3 consecutive days. Consistent interest builds good habits!",
      fr: "Visited for 3 consecutive days. Consistent interest builds good habits!",
      ja: "Visited for 3 consecutive days. Consistent interest builds good habits!",
      ko: "3일 연속으로 방문했습니다. 꾸준한 관심이 좋은 습관을 만들어요!",
    },
    hidden: false,
    icon: "Calendar",
    id: "daily_visitor",
    requirement: {
      condition: "daily_visits",
      target: 3,
      type: "streak",
    },
    reward: {
      badge: "regular",
      points: 60,
    },
    tier: BadgeTier.BRONZE,
    title: {
      cn: "Daily Visitor",
      en: "Daily Visitor",
      es: "Daily Visitor",
      fr: "Daily Visitor",
      ja: "Daily Visitor",
      ko: "일일 방문자",
    },
    type: AchievementType.STREAK,
  },

  // SPECIAL CATEGORY
  {
    category: "special",
    description: {
      cn: "Discovered a very rare personality combination. You are truly special!",
      en: "Discovered a very rare personality combination. You are truly special!",
      es: "Discovered a very rare personality combination. You are truly special!",
      fr: "Discovered a very rare personality combination. You are truly special!",
      ja: "Discovered a very rare personality combination. You are truly special!",
      ko: "매우 드문 성격 조합을 발견했습니다. 당신은 정말 특별한 사람이에요!",
    },
    hidden: true,
    icon: "Gem",
    id: "rare_combination",
    requirement: {
      condition: "rarity_score_above_95",
      target: "rare_combination",
      type: "specific_result",
    },
    reward: {
      badge: "unique",
      points: 400,
      unlocks: ["rare_insights"],
    },
    tier: BadgeTier.GOLD,
    title: {
      cn: "Rare Combination",
      en: "Rare Combination",
      es: "Rare Combination",
      fr: "Rare Combination",
      ja: "Rare Combination",
      ko: "희귀한 조합",
    },
    type: AchievementType.SPECIAL,
  },
  {
    category: "special",
    description: {
      cn: "Discovered a perfect match between blood type and saju elements!",
      en: "Discovered a perfect match between blood type and saju elements!",
      es: "Discovered a perfect match between blood type and saju elements!",
      fr: "Discovered a perfect match between blood type and saju elements!",
      ja: "Discovered a perfect match between blood type and saju elements!",
      ko: "혈액형과 사주가 완벽하게 일치하는 특별한 조합을 발견했습니다!",
    },
    hidden: true,
    icon: "Heart",
    id: "perfect_match",
    requirement: {
      condition: "blood_type_saju_perfect_match",
      target: "perfect_harmony",
      type: "specific_result",
    },
    reward: {
      badge: "harmonious",
      points: 1000,
      unlocks: ["destiny_insights", "premium_compatibility"],
    },
    tier: BadgeTier.PLATINUM,
    title: {
      cn: "Perfect Match",
      en: "Perfect Match",
      es: "Perfect Match",
      fr: "Perfect Match",
      ja: "Perfect Match",
      ko: "완벽한 매치",
    },
    type: AchievementType.SPECIAL,
  },
];

// Badge tier configurations
export const BADGE_TIER_CONFIG = {
  [BadgeTier.BRONZE]: {
    bgColor: "amber-50",
    borderColor: "amber-200",
    color: "amber-600",
    glowColor: "amber-400",
    name: {
      cn: "Bronze",
      en: "Bronze",
      es: "Bronze",
      fr: "Bronze",
      ja: "Bronze",
      ko: "브론즈",
    },
  },
  [BadgeTier.GOLD]: {
    bgColor: "yellow-50",
    borderColor: "yellow-200",
    color: "yellow-600",
    glowColor: "yellow-400",
    name: {
      cn: "Gold",
      en: "Gold",
      es: "Gold",
      fr: "Gold",
      ja: "Gold",
      ko: "골드",
    },
  },
  [BadgeTier.PLATINUM]: {
    bgColor: "amber-50",
    borderColor: "amber-200",
    color: "amber-600",
    glowColor: "amber-400",
    name: {
      cn: "Platinum",
      en: "Platinum",
      es: "Platinum",
      fr: "Platinum",
      ja: "Platinum",
      ko: "플래티넘",
    },
  },
  [BadgeTier.SILVER]: {
    bgColor: "slate-50",
    borderColor: "green-50",
    color: "green-700",
    glowColor: "green-600/60",
    name: {
      cn: "Silver",
      en: "Silver",
      es: "Silver",
      fr: "Silver",
      ja: "Silver",
      ko: "실버",
    },
  },
};

export const BADGE_TIER_STYLES: Record<
  BadgeTier,
  {
    accentGradient: string;
    badgeBackground: string;
    border: string;
    glowOverlay: string;
    gradient: string;
    icon: string;
    indicator: string;
    notificationGradient: string;
    notificationParticle: string;
    progress: string;
  }
> = {
  [BadgeTier.BRONZE]: {
    accentGradient: "bg-gradient-to-br from-amber-600 to-amber-400",
    badgeBackground: "bg-amber-600",
    border: "border-amber-200",
    glowOverlay: "bg-gradient-to-r from-amber-400 to-transparent",
    gradient: "bg-gradient-to-br from-amber-50 to-white",
    icon: "text-amber-600",
    indicator: "bg-amber-600",
    notificationGradient: "bg-gradient-to-br from-white via-white to-amber-50",
    notificationParticle: "bg-amber-400",
    progress: "text-amber-600",
  },
  [BadgeTier.GOLD]: {
    accentGradient: "bg-gradient-to-br from-yellow-600 to-yellow-400",
    badgeBackground: "bg-yellow-500",
    border: "border-yellow-200",
    glowOverlay: "bg-gradient-to-r from-yellow-400 to-transparent",
    gradient: "bg-gradient-to-br from-yellow-50 to-white",
    icon: "text-yellow-600",
    indicator: "bg-yellow-500",
    notificationGradient: "bg-gradient-to-br from-white via-white to-yellow-50",
    notificationParticle: "bg-yellow-400",
    progress: "text-yellow-600",
  },
  [BadgeTier.PLATINUM]: {
    accentGradient: "bg-gradient-to-br from-amber-600 to-amber-400",
    badgeBackground: "bg-amber-600",
    border: "border-amber-200",
    glowOverlay: "bg-gradient-to-r from-amber-400 to-transparent",
    gradient: "bg-gradient-to-br from-amber-50 to-white",
    icon: "text-amber-600",
    indicator: "bg-amber-600",
    notificationGradient: "bg-gradient-to-br from-white via-white to-amber-50",
    notificationParticle: "bg-amber-400",
    progress: "text-amber-600",
  },
  [BadgeTier.SILVER]: {
    accentGradient: "bg-gradient-to-br from-green-700 to-green-600/60",
    badgeBackground: "bg-green-700",
    border: "border-green-50",
    glowOverlay: "bg-gradient-to-r from-green-600/60 to-transparent",
    gradient: "bg-gradient-to-br from-slate-50 to-white",
    icon: "text-green-700",
    indicator: "bg-green-700",
    notificationGradient: "bg-gradient-to-br from-white via-white to-slate-50",
    notificationParticle: "bg-green-600/60",
    progress: "text-green-700",
  },
};

// Points required for each level
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000,
];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i;
    }
  }
  return 0;
}

// Helper functions
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

export function getAchievementsByCategory(categoryId: string): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) => achievement.category === categoryId,
  );
}

export function getAchievementsByTier(tier: BadgeTier): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.tier === tier);
}

export function getAchievementsByType(type: AchievementType): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.type === type);
}

export function getPointsForNextLevel(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  if (currentLevel >= LEVEL_THRESHOLDS.length - 1) {
    return 0; // Max level reached
  }
  return LEVEL_THRESHOLDS[currentLevel + 1] - currentPoints;
}
