"use client";

import { useCallback, useEffect, useState } from "react";

import { getOrCreateSessionId } from "@/lib/system/supabase";
import { ACHIEVEMENTS } from "@/lib/user/achievements/data";
import {
  type AchievementDefinitionSummary,
  type AchievementNotification,
  AchievementType,
  BadgeTier,
  type UserAchievement,
  type UserAchievementStats,
} from "@/lib/user/achievements/types";

interface UseAchievementsProps {
  onAchievementUnlocked?: (notification: AchievementNotification) => void;
  sessionId?: string;
  userId?: string;
}

export function useAchievements(props: UseAchievementsProps = {}) {
  const [userProgress, setUserProgress] = useState<null | {
    achievements: UserAchievement[];
    totalPoints: number;
  }>(null);
  const [stats, setStats] = useState<null | UserAchievementStats>(null);
  const [activityStats, setActivityStats] = useState<null | {
    level: number;
    testsCompleted: number;
    totalScore: number;
    uniqueTests: number;
  }>(null);
  const [notifications, setNotifications] = useState<AchievementNotification[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [definitions, setDefinitions] = useState<
    AchievementDefinitionSummary[]
  >(() => getFallbackDefinitions());

  const applyFallbackState = useCallback(() => {
    const fallbackAchievements: UserAchievement[] = [
      {
        achievementId: "first_test",
        notificationShown: true,
        progress: 1,
        unlocked: true,
        unlockedAt: new Date(),
      },
      {
        achievementId: "social_sharer",
        notificationShown: true,
        progress: 1,
        unlocked: true,
        unlockedAt: new Date(),
      },
    ];

    const fallbackStats: UserAchievementStats = {
      completionRate: (2 / ACHIEVEMENTS.length) * 100,
      nextAchievements: [],
      recentAchievements: fallbackAchievements,
      tierCounts: {
        [BadgeTier.BRONZE]: 1,
        [BadgeTier.GOLD]: 0,
        [BadgeTier.PLATINUM]: 0,
        [BadgeTier.SILVER]: 1,
      },
      totalAchievements: ACHIEVEMENTS.length,
      totalPoints: 150,
      unlockedAchievements: 2,
    };

    setUserProgress({ achievements: fallbackAchievements, totalPoints: 150 });
    setStats(fallbackStats);
    setActivityStats({
      level: 1,
      testsCompleted: 0,
      totalScore: 0,
      uniqueTests: 0,
    });
    setNotifications([]);
    setDefinitions(getFallbackDefinitions());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAchievements = async () => {
      setIsLoading(true);
      try {
        const sessionIdentifier = props.sessionId ?? getOrCreateSessionId();
        const params = new URLSearchParams();

        if (props.userId) {
          params.set("userId", props.userId);
        }

        if (sessionIdentifier) {
          params.set("sessionId", sessionIdentifier);
        }

        const response = await fetch(
          `/api/achievements/stats?${params.toString()}`,
          {
            cache: "no-store",
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load achievements: ${response.status}`);
        }

        const payload = await response.json();
        if (cancelled) return;

        const summary = payload.achievementSummary;
        const fetchedStats = payload.stats;

        if (!summary) {
          applyFallbackState();
          return;
        }

        const summaryDefinitions = Array.isArray(summary.definitions)
          ? summary.definitions
              .map(normalizeDefinition)
              .filter((definition: AchievementDefinitionSummary) =>
                Boolean(definition.slug),
              )
          : getFallbackDefinitions();
        if (summaryDefinitions.length > 0) {
          setDefinitions(summaryDefinitions);
        } else {
          setDefinitions(getFallbackDefinitions());
        }

        const summaryAchievements = (summary.userProgress?.achievements ??
          []) as UserAchievement[];
        const normalizedAchievements: UserAchievement[] =
          summaryAchievements.map((achievement) => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt
              ? new Date(achievement.unlockedAt)
              : undefined,
          }));

        const summaryStats = summary.stats as null | UserAchievementStats;
        const normalizedStats: null | UserAchievementStats = summaryStats
          ? {
              ...summaryStats,
              recentAchievements: (summaryStats.recentAchievements ?? []).map(
                (achievement) => ({
                  ...achievement,
                  unlockedAt: achievement.unlockedAt
                    ? new Date(achievement.unlockedAt)
                    : undefined,
                }),
              ),
            }
          : null;

        const summaryNotifications = (summary.notifications ??
          []) as AchievementNotification[];
        const normalizedNotifications: AchievementNotification[] =
          summaryNotifications.map((notification) => ({
            ...notification,
            timestamp: notification.timestamp
              ? new Date(notification.timestamp)
              : new Date(),
          }));

        setUserProgress({
          achievements: normalizedAchievements,
          totalPoints: summary.userProgress?.totalPoints ?? 0,
        });
        setStats(normalizedStats);
        setActivityStats(
          fetchedStats && typeof fetchedStats.testsCompleted === "number"
            ? {
                level: fetchedStats.level ?? 1,
                testsCompleted: fetchedStats.testsCompleted ?? 0,
                totalScore: fetchedStats.totalScore ?? 0,
                uniqueTests: fetchedStats.uniqueTests ?? 0,
              }
            : null,
        );
        setNotifications(normalizedNotifications);
      } catch (error) {
        console.warn(
          "[useAchievements] Falling back to mock data due to error:",
          error,
        );
        if (!cancelled) {
          applyFallbackState();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAchievements();

    return () => {
      cancelled = true;
    };
  }, [applyFallbackState, props.userId, props.sessionId]);

  const trackEvent = useCallback(
    async (eventType: string, eventData: Record<string, unknown> = {}) => {
      const sessionIdentifier = props.sessionId ?? getOrCreateSessionId();

      try {
        await fetch("/api/achievements/record", {
          body: JSON.stringify({
            eventType,
            payload: eventData,
            sessionId: sessionIdentifier,
            userId: props.userId,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
      } catch (error) {
        console.warn(
          "[useAchievements] Failed to record achievement event:",
          error,
        );
      }
    },
    [props.userId, props.sessionId],
  );

  const dismissNotification = useCallback(
    async (achievementId: string) => {
      let removedNotification: AchievementNotification | null = null;

      setNotifications((prev) => {
        const remaining = prev.filter((notification) => {
          const shouldKeep = notification.achievementId !== achievementId;
          if (!shouldKeep) {
            removedNotification = notification;
          }
          return shouldKeep;
        });
        return remaining;
      });

      const sessionIdentifier = props.sessionId ?? getOrCreateSessionId();

      if (!props.userId && !sessionIdentifier) {
        return;
      }

      try {
        await fetch("/api/achievements/notifications", {
          body: JSON.stringify({
            achievementIds: [achievementId],
            sessionId: sessionIdentifier,
            userId: props.userId,
          }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        });
      } catch (error) {
        console.warn(
          "[useAchievements] Failed to mark notification as dismissed:",
          error,
        );
        const notificationToRestore = removedNotification;
        if (notificationToRestore) {
          setNotifications((prev) => [...prev, notificationToRestore]);
        }
      }
    },
    [props.sessionId, props.userId],
  );

  return {
    activityStats,
    definitions,
    dismissNotification,
    isLoading,
    notifications,
    stats,
    trackEvent,
    userProgress,
  };
}

// Helper functions for tracking
export const trackTestCompletion = (
  testId: string,
  category: string,
  trackEvent: (eventType: string, eventData: Record<string, unknown>) => void,
) => {
  trackEvent("test_completion", { category, testId });
};

type ShareMethod =
  | "download"
  | "image"
  | "link"
  | "pdf"
  | "social"
  | "webshare";

interface TrackShareOptions {
  locale?: string;
  platform?: string;
  resultId?: string;
  sessionId?: string;
  shareMethod?: ShareMethod;
  userId?: string;
}

export const trackResultShare = (
  testId: string,
  trackEvent: (eventType: string, eventData: Record<string, unknown>) => void,
  options: TrackShareOptions = {},
) => {
  const shareMethod = options.shareMethod ?? "link";
  const payload = {
    platform: options.platform,
    shareMethod,
    testId,
  };

  trackEvent("result_shared", payload);

  const sessionIdentifier = options.sessionId ?? getOrCreateSessionId();
  const sharePayload = {
    locale: options.locale,
    platform: options.platform,
    resultId: options.resultId ?? testId,
    sessionId: sessionIdentifier,
    shareMethod,
    testId,
    userId: options.userId,
  };

  try {
    void fetch("/api/share-events", {
      body: JSON.stringify(sharePayload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch (error) {
    console.warn("[useAchievements] Failed to persist share event:", error);
  }
};

export const trackDailyActivity = (
  trackEvent: (eventType: string, eventData?: Record<string, unknown>) => void,
) => {
  trackEvent("daily_activity");
};

function camelize(value: string): string {
  return value.replace(/[-_](\w)/g, (_, char: string) => char.toUpperCase());
}

function getFallbackDefinitions(): AchievementDefinitionSummary[] {
  return ACHIEVEMENTS.map((achievement) => ({
    basePoints: achievement.reward.points,
    category: mapAchievementTypeToCategory(achievement.type),
    ctaKey: `achievements.${camelize(achievement.id)}.cta`,
    descriptionKey: `achievements.${camelize(achievement.id)}.description`,
    icon: achievement.icon,
    rarity: achievement.tier,
    requirements: {
      condition: achievement.requirement.condition,
      target: achievement.requirement.target,
      type: achievement.requirement.type,
    },
    slug: achievement.id,
    titleKey: `achievements.${camelize(achievement.id)}.title`,
    translationKey: camelize(achievement.id),
    type: mapRequirementToDefinitionType(achievement.requirement.type),
  }));
}

function isRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function mapAchievementTypeToCategory(
  type: AchievementType,
): AchievementDefinitionSummary["category"] {
  switch (type) {
    case AchievementType.SOCIAL:
      return "social_connection";
    case AchievementType.SPECIAL:
      return "insight_discovery";
    case AchievementType.STREAK:
      return "streak_achievement";
    case AchievementType.TEST_COMPLETION:
      return "test_completion";
    case AchievementType.EXPLORATION:
    default:
      return "community_engagement";
  }
}

function mapCategory(value: string): AchievementDefinitionSummary["category"] {
  switch (value) {
    case "community_engagement":
    case "insight_discovery":
    case "social_connection":
    case "streak_achievement":
    case "test_completion":
      return value;
    default:
      return "community_engagement";
  }
}

function mapDefinitionType(
  value: string,
): AchievementDefinitionSummary["type"] {
  switch (value) {
    case "composite":
    case "event_count":
    case "special":
    case "streak":
    case "threshold":
      return value;
    default:
      return "threshold";
  }
}

function mapRarity(value: string): BadgeTier {
  switch (value) {
    case "gold":
      return BadgeTier.GOLD;
    case "platinum":
      return BadgeTier.PLATINUM;
    case "silver":
      return BadgeTier.SILVER;
    case "bronze":
    default:
      return BadgeTier.BRONZE;
  }
}

function mapRequirementToDefinitionType(
  requirementType: string,
): AchievementDefinitionSummary["type"] {
  switch (requirementType) {
    case "category_completion":
    case "count":
    case "specific_test":
      return "threshold";
    case "streak":
      return "streak";
    default:
      return "event_count";
  }
}

function normalizeDefinition(
  input: Record<string, unknown>,
): AchievementDefinitionSummary {
  const rawRarity = typeof input.rarity === "string" ? input.rarity : "bronze";
  const rawCategory =
    typeof input.category === "string" ? input.category : "test_completion";
  const rawType = typeof input.type === "string" ? input.type : "threshold";

  return {
    basePoints:
      typeof input.basePoints === "number" ? input.basePoints : undefined,
    category: mapCategory(rawCategory),
    ctaKey: typeof input.ctaKey === "string" ? input.ctaKey : undefined,
    descriptionKey:
      typeof input.descriptionKey === "string"
        ? input.descriptionKey
        : undefined,
    icon: typeof input.icon === "string" ? input.icon : null,
    rarity: mapRarity(rawRarity),
    requirements: isRecord(input.requirements),
    slug: typeof input.slug === "string" ? input.slug : "",
    titleKey: typeof input.titleKey === "string" ? input.titleKey : undefined,
    translationKey:
      typeof input.translationKey === "string"
        ? input.translationKey
        : undefined,
    type: mapDefinitionType(rawType),
  };
}
