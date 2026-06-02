"use client";

import { useEffect, useState } from "react";

export interface UserInsight {
  category: string;
  completedAt: string;
  result: any;
  source: "lifestyle" | "mbti" | "ontology" | "wellness";
  type: string;
}

export interface UserInsights {
  mbtiResults: Record<string, any>;
  recentTests: UserInsight[];
  stats: {
    mbtiCount: number;
    totalCompleted: number;
    wellnessCount: number;
  };
  wellnessResults: Record<string, any>;
}

export function useUserInsights() {
  const [insights, setInsights] = useState<UserInsights>({
    mbtiResults: {},
    recentTests: [],
    stats: {
      mbtiCount: 0,
      totalCompleted: 0,
      wellnessCount: 0,
    },
    wellnessResults: {},
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const aggregateInsights = () => {
      const allInsights: UserInsight[] = [];
      const mbtiResults: Record<string, any> = {};
      const wellnessResults: Record<string, any> = {};
      let mbtiCount = 0;
      let wellnessCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        try {
          if (key.startsWith("mbti_result_")) {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            const category = key.replace("mbti_result_", "");
            const insight: UserInsight = {
              category,
              completedAt: data.completedAt,
              result: data.result,
              source: "mbti",
              type: data.result?.type || data.result?.primary || "Unknown",
            };
            allInsights.push(insight);
            mbtiResults[category] = data;
            mbtiCount++;
          } else if (key.startsWith("wellness_result_")) {
            const data = JSON.parse(localStorage.getItem(key) || "{}");
            const category = key.replace("wellness_result_", "");
            const insight: UserInsight = {
              category,
              completedAt: data.completedAt,
              result: data.result,
              source: "wellness",
              type: data.result?.label || data.result?.level || "Unknown",
            };
            allInsights.push(insight);
            wellnessResults[category] = data;
            wellnessCount++;
          }
          // Add other sources here as needed (ontology, lifestyle)
        } catch (e) {
          console.error(`Failed to parse insight for key: ${key}`, e);
        }
      }

      // Sort by completion date descending
      allInsights.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );

      setInsights({
        mbtiResults,
        recentTests: allInsights,
        stats: {
          mbtiCount,
          totalCompleted: mbtiCount + wellnessCount,
          wellnessCount,
        },
        wellnessResults,
      });
      setIsLoaded(true);
    };

    aggregateInsights();

    // Optionally listen for storage changes to sync across tabs
    window.addEventListener("storage", aggregateInsights);
    return () => window.removeEventListener("storage", aggregateInsights);
  }, []);

  return { insights, isLoaded };
}
