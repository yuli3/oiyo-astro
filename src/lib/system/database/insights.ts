import type {
  ApiResponse,
  DailyInsight,
  DailyInsightInsert,
  DailyInsightUpdate,
  TestResult,
} from "@/types/database";

// Daily Insights and AI-Generated Content Database Operations
import {
  handleDatabaseError,
  supabase,
  supabaseAdmin,
} from "@/lib/system/supabase";

// Helper function for generating insights
export async function checkInsightExists(
  date: string,
  personalityType: string,
  locale: string,
): Promise<boolean> {
  try {
    const result = await getDailyInsight(date, personalityType, locale);
    return !!result.data;
  } catch {
    return false;
  }
}

// Cleanup operations
export async function cleanupOldInsights(
  daysOld: number = 365,
): Promise<ApiResponse<{ deletedCount: number }>> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await (supabaseAdmin as any)
      .from("daily_insights")
      .delete()
      .filter("date", "lt", cutoffDate.toISOString().split("T")[0])
      .select("id");

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: { deletedCount: data?.length || 0 } };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Batch operations for insights
export async function createBulkDailyInsights(
  insights: DailyInsightInsert[],
): Promise<ApiResponse<DailyInsight[]>> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    const { data, error } = await (supabaseAdmin as any)
      .from("daily_insights")
      .insert(insights)
      .select();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Daily Insights Operations
export async function createDailyInsight(
  insightData: DailyInsightInsert,
): Promise<ApiResponse<DailyInsight>> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    const { data, error } = await (supabaseAdmin as any)
      .from("daily_insights")
      .insert(insightData)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function deactivateDailyInsight(
  id: string,
): Promise<ApiResponse<DailyInsight>> {
  return updateDailyInsight(id, { is_active: false });
}

export async function getAllInsightsForDate(
  date: string,
  locale: string = "en",
): Promise<ApiResponse<DailyInsight[]>> {
  try {
    const client = supabase;
    if (!client) {
      return { error: { message: "Supabase is not configured" } };
    }

    const { data, error } = await (client as any)
      .from("daily_insights")
      .select("*")
      .filter("date", "eq", date)
      .filter("locale", "eq", locale)
      .filter("is_active", "eq", true)
      .order("personality_type", { ascending: true });

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getDailyInsight(
  date: string,
  personalityType: string,
  locale: string = "en",
): Promise<ApiResponse<DailyInsight>> {
  try {
    const client = supabase;
    if (!client) {
      return { error: { message: "Supabase is not configured" } };
    }

    const { data, error } = await (client as any)
      .from("daily_insights")
      .select("*")
      .filter("date", "eq", date)
      .filter("personality_type", "eq", personalityType)
      .filter("locale", "eq", locale)
      .filter("is_active", "eq", true)
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Analytics for insights
export async function getInsightAnalytics(
  options: {
    endDate?: string;
    locale?: "en" | "ko";
    personalityType?: string;
    startDate?: string;
  } = {},
): Promise<
  ApiResponse<{
    aiModelUsage: Array<{ count: number; model: string }>;
    averageMoodScore: number;
    energyForecastDistribution: Array<{ count: number; forecast: string }>;
    insightsByLocale: Array<{ count: number; locale: string }>;
    insightsByPersonalityType: Array<{
      count: number;
      personality_type: string;
    }>;
    recentGeneration: DailyInsight[];
    totalInsights: number;
  }>
> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    let query = (supabaseAdmin as any).from("daily_insights").select("*");

    if (options.startDate) {
      query = query.filter("date", "gte", options.startDate);
    }

    if (options.endDate) {
      query = query.filter("date", "lte", options.endDate);
    }

    if (options.personalityType) {
      query = query.filter("personality_type", "eq", options.personalityType);
    }

    if (options.locale) {
      query = query.filter("locale", "eq", options.locale);
    }

    const { data: insights, error } = await query.select("*");

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    const insightsList: DailyInsight[] = insights ?? [];
    const totalInsights = insightsList.length;

    // Insights by personality type
    const typeMap = new Map<string, number>();
    const localeMap = new Map<string, number>();
    const energyMap = new Map<string, number>();
    const modelMap = new Map<string, number>();
    let totalMoodScore = 0;
    let moodScoreCount = 0;

    insightsList.forEach((insight) => {
      // Personality types
      typeMap.set(
        insight.personality_type,
        (typeMap.get(insight.personality_type) || 0) + 1,
      );

      // Locales
      localeMap.set(insight.locale, (localeMap.get(insight.locale) || 0) + 1);

      // Energy forecast
      if (insight.energy_forecast) {
        energyMap.set(
          insight.energy_forecast,
          (energyMap.get(insight.energy_forecast) || 0) + 1,
        );
      }

      // AI models
      if (insight.ai_model) {
        modelMap.set(
          insight.ai_model,
          (modelMap.get(insight.ai_model) || 0) + 1,
        );
      }

      // Mood scores
      if (typeof insight.mood_score === "number") {
        totalMoodScore += insight.mood_score;
        moodScoreCount++;
      }
    });

    const insightsByPersonalityType = Array.from(typeMap.entries())
      .map(([personality_type, count]) => ({ count, personality_type }))
      .sort((a, b) => b.count - a.count);

    const insightsByLocale = Array.from(localeMap.entries())
      .map(([locale, count]) => ({ count, locale }))
      .sort((a, b) => b.count - a.count);

    const energyForecastDistribution = Array.from(energyMap.entries())
      .map(([forecast, count]) => ({ count, forecast }))
      .sort((a, b) => b.count - a.count);

    const aiModelUsage = Array.from(modelMap.entries())
      .map(([model, count]) => ({ count, model }))
      .sort((a, b) => b.count - a.count);

    const averageMoodScore =
      moodScoreCount > 0 ? totalMoodScore / moodScoreCount : 0;

    // Recent generation (last 10 insights)
    const recentGeneration = insightsList.slice(-10);

    const analytics = {
      aiModelUsage,
      averageMoodScore,
      energyForecastDistribution,
      insightsByLocale,
      insightsByPersonalityType,
      recentGeneration,
      totalInsights,
    };

    return { data: analytics };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getInsightTemplate(
  personalityType: string,
  locale: string,
): Promise<{
  contentStructure: string[];
  focusAreas: string[];
  moodRange: [number, number];
  title: string;
}> {
  // This could be expanded to use database-stored templates
  const templates = {
    en: {
      contentStructure: [
        "Morning reflection",
        "Key focus for today",
        "Relationship insight",
        "Career guidance",
        "Evening wisdom",
      ],
      focusAreas: [
        "productivity",
        "relationships",
        "self-care",
        "creativity",
        "growth",
      ],
      moodRange: [6, 9] as [number, number],
      title: `Daily Insight for ${personalityType}`,
    },
    ko: {
      contentStructure: [
        "아침 성찰",
        "오늘의 핵심 포커스",
        "인간관계 인사이트",
        "커리어 가이드",
        "저녁 지혜",
      ],
      focusAreas: ["생산성", "인간관계", "자기돌봄", "창의성", "성장"],
      moodRange: [6, 9] as [number, number],
      title: `${personalityType}을 위한 오늘의 인사이트`,
    },
  };

  return (
    (templates as Record<string, typeof templates.en | undefined>)[locale] ??
    templates.en
  );
}

export async function getPersonalityTypesNeedingInsights(
  date: string,
  locale: string = "en",
): Promise<ApiResponse<string[]>> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    // Get all personality types that have test results

    const { data: existingTypes, error: typesError } = await (
      supabaseAdmin as any
    )
      .from("test_results")
      .select("result_type")
      .not("result_type", "is", null);

    if (typesError) {
      return { error: handleDatabaseError(typesError) };
    }

    const allTypes = (existingTypes ?? [])
      .map((row: Pick<TestResult, "result_type">) => row.result_type)
      .filter(
        (type: null | string | undefined): type is string =>
          typeof type === "string",
      );

    // Get personality types that already have insights for this date

    const { data: existingInsights, error: insightsError } = await (
      supabaseAdmin as any
    )
      .from("daily_insights")
      .select("personality_type")
      .filter("date", "eq", date)
      .filter("locale", "eq", locale);

    if (insightsError) {
      return { error: handleDatabaseError(insightsError) };
    }

    const existingTypeSet = new Set(
      (existingInsights ?? []).map(
        (insight: Pick<DailyInsight, "personality_type">) =>
          insight.personality_type,
      ),
    );
    const typesNeeding = allTypes.filter(
      (type: string) => !existingTypeSet.has(type),
    );

    return { data: typesNeeding };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getRecentInsights(
  personalityType: string,
  locale: string = "en",
  days: number = 7,
): Promise<ApiResponse<DailyInsight[]>> {
  try {
    const client = supabase;
    if (!client) {
      return { error: { message: "Supabase is not configured" } };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await (client as any)
      .from("daily_insights")
      .select("*")
      .filter("personality_type", "eq", personalityType)
      .filter("locale", "eq", locale)
      .filter("is_active", "eq", true)
      .filter("date", "gte", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getTodaysInsight(
  personalityType: string,
  locale: string = "en",
): Promise<ApiResponse<DailyInsight>> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  return getDailyInsight(today, personalityType, locale);
}

export async function updateDailyInsight(
  id: string,
  updates: DailyInsightUpdate,
): Promise<ApiResponse<DailyInsight>> {
  if (!supabaseAdmin) {
    return {
      error: handleDatabaseError(new Error("Admin client not available")),
    };
  }

  try {
    const { data, error } = await (supabaseAdmin as any)
      .from("daily_insights")
      .update(updates)
      .filter("id", "eq", id)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}
