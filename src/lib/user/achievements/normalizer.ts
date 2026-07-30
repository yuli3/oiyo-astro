import type { Locale } from "@/i18n";

import { ACHIEVEMENTS } from "./data";
import {
  type Achievement,
  type AchievementDefinitionSummary,
  AchievementType,
  BadgeTier,
} from "./types";

interface BuildUiAchievementsOptions {
  definitions?: AchievementDefinitionSummary[];
  locale: Locale;
  translate?: (key: string) => string | undefined;
}

export function buildUiAchievements({
  definitions,
  locale,
  translate,
}: BuildUiAchievementsOptions): Achievement[] {
  if (!definitions || definitions.length === 0) {
    return ACHIEVEMENTS.map(cloneAchievement);
  }

  return definitions.map((definition) => {
    const base = ACHIEVEMENTS.find((item) => item.id === definition.slug);
    const tier = base?.tier ?? definition.rarity ?? BadgeTier.BRONZE;
    const type = base?.type ?? mapCategoryToType(definition.category);
    const rewardPoints = base?.reward.points ?? definition.basePoints ?? 0;

    const translationKey = resolveTranslationKey(definition);
    const localizedTitle = translateWithFallback(
      `${translationKey}.title`,
      translate,
      base?.title?.[locale] ?? definition.slug,
    );
    const localizedDescription = translateWithFallback(
      `${translationKey}.description`,
      translate,
      base?.description?.[locale] ?? "",
    );

    const title: Record<Locale, string> = {
      zh: base?.title?.cn ?? definition.slug,
      en: base?.title?.en ?? definition.slug,
      es: base?.title?.es ?? definition.slug,
      fr: base?.title?.fr ?? definition.slug,
      ja: base?.title?.ja ?? definition.slug,
      ko: base?.title?.ko ?? definition.slug,
      [locale]: localizedTitle,
    };

    const description: Record<Locale, string> = {
      zh: base?.description?.cn ?? "",
      en: base?.description?.en ?? "",
      es: base?.description?.es ?? "",
      fr: base?.description?.fr ?? "",
      ja: base?.description?.ja ?? "",
      ko: base?.description?.ko ?? "",
      [locale]: localizedDescription,
    };

    const requirement =
      base?.requirement ?? deriveRequirement(definition.requirements);
    const reward = {
      ...(base?.reward ?? { points: rewardPoints }),
      points: base?.reward?.points ?? rewardPoints,
    };

    return {
      category: base?.category ?? definition.category,
      description,
      hidden: base?.hidden ?? false,
      icon: definition.icon ?? base?.icon ?? "Award",
      id: definition.slug,
      requirement,
      reward,
      tier,
      title,
      type,
    } satisfies Achievement;
  });
}

function camelize(value: string): string {
  return value.replace(/[-_](\w)/g, (_, char: string) => char.toUpperCase());
}

function cloneAchievement(achievement: Achievement): Achievement {
  return {
    ...achievement,
    description: { ...achievement.description },
    requirement: { ...achievement.requirement },
    reward: { ...achievement.reward },
    title: { ...achievement.title },
  };
}

function deriveRequirement(
  requirements: null | Record<string, unknown> | undefined,
): Achievement["requirement"] {
  if (!requirements) {
    return { target: 1, type: "count" };
  }

  const input = requirements as Record<string, unknown>;
  const type = typeof input.type === "string" ? input.type : "count";
  const target = input.target ?? input.value ?? 1;
  const condition =
    typeof input.condition === "string"
      ? input.condition
      : typeof input.metric === "string"
        ? input.metric
        : undefined;

  return {
    condition,
    target: target as number | string,
    type,
  };
}

function mapCategoryToType(
  category: AchievementDefinitionSummary["category"],
): AchievementType {
  switch (category) {
    case "insight_discovery":
      return AchievementType.SPECIAL;
    case "social_connection":
      return AchievementType.SOCIAL;
    case "streak_achievement":
      return AchievementType.STREAK;
    case "test_completion":
      return AchievementType.TEST_COMPLETION;
    case "community_engagement":
    default:
      return AchievementType.EXPLORATION;
  }
}

function normalizeKey(key: string): string {
  return key.startsWith("achievements.")
    ? key.replace("achievements.", "")
    : key;
}

function resolveTranslationKey(
  definition: AchievementDefinitionSummary,
): string {
  if (definition.translationKey) {
    return normalizeKey(definition.translationKey);
  }

  if (definition.titleKey) {
    return normalizeKey(definition.titleKey.replace(/\.title$/, ""));
  }

  return camelize(definition.slug);
}

function translateWithFallback(
  key: string,
  translate: BuildUiAchievementsOptions["translate"],
  fallback: string,
): string {
  const normalizedKey = normalizeKey(key);
  if (translate) {
    try {
      const value = translate(normalizedKey);
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    } catch {
      // Ignore missing translation errors and fall back to provided value.
    }
  }
  return fallback;
}
