"use client";

import { useCallback, useEffect, useState } from "react";

// import { useToast } from '@/hooks/use-toast';
import { achievements } from "@/lib/user/achievements/achievements-data";
import {
  gamificationEngine,
  type PointsAction,
  type UserStats,
} from "@/lib/user/gamification/lib/points-system";

const STORAGE_KEY = "oiyo_user_gamification";

const DEFAULT_STATS: UserStats = {
  achievements: [],
  currentStreak: 0,
  lastActivityDate: new Date().toISOString(),
  level: 1,
  longestStreak: 0,
  testsCompleted: 0,
  totalPoints: 0,
  userId: "anonymous",
};

export function useGamification() {
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window !== "undefined") {
      const loaded = localStorage.getItem(STORAGE_KEY);
      if (loaded) {
        try {
          return JSON.parse(loaded);
        } catch (e) {
          console.error("Failed to parse gamification stats", e);
        }
      }
    }
    return DEFAULT_STATS;
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);
  // const { toast } = useToast(); // Deprecated

  // Mark as loaded on mount to handle hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  // Save to storage whenever stats change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats, isLoaded]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setStats(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync gamification stats", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const awardPoints = useCallback(
    (action: keyof (typeof gamificationEngine)["POINTS_TABLE"]) => {
      setStats((prev) => {
        // Calculate Streak
        const streakInfo = gamificationEngine.calculateStreak(
          prev.lastActivityDate,
        );
        const newCurrentStreak = prev.currentStreak;

        // If streak continued or same day, keep it. If broken, reset.
        // Actually calculateStreak logic:
        // 0 diff -> maintain
        // 1 diff -> increment
        // >1 diff -> reset to 1 (start new)

        // We'll rely on our engine's logic but we need to update the state correctly.
        // The engine returns { currentStreak... } based on the date passed.
        // If we are performing an action NOW, we should update the date to NOW.

        // But wait! calculateStreak takes "lastActivityDate".
        // If it returns a streak count, that count is *based on* that last date vs Now.
        // So if I played yesterday, streak is 1. I play today -> streak becomes 2.

        // Let's refine streak update:
        const today = new Date();
        const lastDate = new Date(prev.lastActivityDate);
        const isSameDay = today.toDateString() === lastDate.toDateString();
        const isYesterday =
          new Date(today.setDate(today.getDate() - 1)).toDateString() ===
          lastDate.toDateString();

        let streak = prev.currentStreak;
        if (isSameDay) {
          // streak stays same
        } else if (isYesterday) {
          streak += 1;
        } else {
          // Streak broken or first time
          streak = 1;
        }
        // Note: This logic is simple; the engine has more robust calculation, let's use it if possible.
        // gamificationEngine.calculateStreak returns "currentStreak" assuming "lastActivityDate" is the reference.
        // Actually the engine logic needs the *previous* date to calc the *new* streak.

        const { currentStreak: calculatedStreak } =
          gamificationEngine.calculateStreak(prev.lastActivityDate);
        // Wait, if I call calculateStreak with "yesterday", it returns 1?
        // "diff === 1 -> return { currentStreak: 1 ... }" in current engine code.
        // It seems the engine logic is "streak SO FAR".
        // It doesn't auto-increment for "today's action".

        // Let's override with a simple trusted logic here for now to ensure it works.
        const newStreak =
          calculatedStreak === 0 ? 1 : isSameDay ? streak : streak + 1;

        // Calculate Points
        const { total } = gamificationEngine.calculateTotalEarnings(
          action,
          newStreak,
        );

        const newTotalPoints = prev.totalPoints + total;

        // Calculate Level
        const { level: newLevel } =
          gamificationEngine.calculateLevel(newTotalPoints);

        // Prepare new stats
        const newStats = {
          ...prev,
          currentStreak: newStreak,
          lastActivityDate: new Date().toISOString(),
          level: newLevel,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          testsCompleted:
            action === "TEST_COMPLETED"
              ? prev.testsCompleted + 1
              : prev.testsCompleted,
          totalPoints: newTotalPoints,
        };

        // --- Achievement Check Logic ---
        const newlyUnlocked: string[] = [];
        achievements.forEach((achievement) => {
          if (newStats.achievements.includes(achievement.id)) return;

          let isMet = false;
          switch (achievement.requirement.type) {
            case "streak_days":
              isMet =
                newStats.currentStreak >= (achievement.requirement.value || 0);
              break;
            case "test_count":
              isMet =
                newStats.testsCompleted >= (achievement.requirement.value || 0);
              break;
            // Add more cases as needed
          }

          if (isMet) {
            newlyUnlocked.push(achievement.id);
            // Set the first newly unlocked achievement as the badge to show
            if (!unlockedBadge) {
              setUnlockedBadge(achievement);
            }
          }
        });

        if (newlyUnlocked.length > 0) {
          newStats.achievements = [...newStats.achievements, ...newlyUnlocked];
        }
        // -------------------------------

        return newStats;
      });
    },
    [unlockedBadge],
  );

  const clearUnlockedBadge = useCallback(() => {
    setUnlockedBadge(null);
  }, []);

  return {
    awardPoints,
    clearUnlockedBadge,
    isLoaded,
    levelInfo: gamificationEngine.calculateLevel(stats.totalPoints),
    stats,
    unlockedBadge,
  };
}
