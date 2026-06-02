import type {
  ApiResponse,
  UserFeedback,
  UserFeedbackInsert,
  UserFeedbackUpdate,
  UserPreferences,
} from "@/types/database";

// User Preferences and Settings Database Operations
import {
  handleDatabaseError,
  supabase,
  supabaseAdmin,
} from "@/lib/system/supabase";

// User Feedback Operations
export async function createUserFeedback(
  feedbackData: UserFeedbackInsert,
): Promise<ApiResponse<UserFeedback>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_feedback")
      .insert(feedbackData)
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

export async function featureFeedback(
  id: string,
  isFeatured: boolean,
): Promise<ApiResponse<UserFeedback>> {
  return updateFeedback(id, {
    is_featured: isFeatured,
  });
}

export async function getFeaturedTestimonials(
  limit: number = 10,
): Promise<ApiResponse<UserFeedback[]>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_feedback")
      .select(
        `
        *,
        personality_tests (
          id,
          slug,
          name_en,
          name_ko
        )
      `,
      )
      .filter("is_featured", "eq", true)
      .filter("is_public", "eq", true)
      .filter("is_testimonial", "eq", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Feedback Analytics
export async function getFeedbackStats(testId?: string): Promise<
  ApiResponse<{
    averageRating: number;
    pendingModerationCount: number;
    publicFeedbackCount: number;
    ratingDistribution: Array<{ count: number; rating: number }>;
    testimonialCount: number;
    totalFeedback: number;
  }>
> {
  if (!supabaseAdmin) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    let query = (supabaseAdmin as any).from("user_feedback").select("*");
    if (testId) {
      query = query.filter("test_id", "eq", testId);
    }

    const { data: feedback, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    const feedbackList: UserFeedback[] = feedback ?? [];
    const totalFeedback = feedbackList.length;
    const ratings = feedbackList
      .map((item) => item.rating)
      .filter((rating): rating is number => typeof rating === "number");
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    // Rating distribution
    const ratingMap = new Map<number, number>();
    ratings.forEach((rating: number) => {
      ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
    });

    const ratingDistribution = Array.from(ratingMap.entries())
      .map(([rating, count]) => ({ count, rating }))
      .sort((a, b) => a.rating - b.rating);

    const testimonialCount = feedbackList.filter(
      (item) => item.is_testimonial,
    ).length;
    const publicFeedbackCount = feedbackList.filter(
      (item) => item.is_public,
    ).length;
    const pendingModerationCount = feedbackList.filter(
      (item) => !item.moderated_at,
    ).length;

    const stats = {
      averageRating,
      pendingModerationCount,
      publicFeedbackCount,
      ratingDistribution,
      testimonialCount,
      totalFeedback,
    };

    return { data: stats };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Bulk operations for user preferences
export async function getPreferencesAnalytics(): Promise<
  ApiResponse<{
    consentRates: {
      analytics: number;
      marketing: number;
    };
    emailFrequencyDistribution: Array<{ count: number; frequency: string }>;
    languageDistribution: Array<{ count: number; language: string }>;
    themeDistribution: Array<{ count: number; theme: string }>;
    totalUsers: number;
  }>
> {
  if (!supabaseAdmin) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    const { data: preferences, error } = await (supabaseAdmin as any)
      .from("user_preferences")
      .select("*");

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    const preferencesList: UserPreferences[] = preferences ?? [];
    const totalUsers = preferencesList.length;

    // Theme distribution
    const themeMap = new Map<string, number>();
    const languageMap = new Map<string, number>();
    const frequencyMap = new Map<string, number>();
    let analyticsConsent = 0;
    let marketingConsent = 0;

    preferencesList.forEach((pref) => {
      // Themes
      if (pref.theme) {
        themeMap.set(pref.theme, (themeMap.get(pref.theme) || 0) + 1);
      }

      // Languages
      if (pref.language) {
        languageMap.set(
          pref.language,
          (languageMap.get(pref.language) || 0) + 1,
        );
      }

      // Email frequency
      if (pref.email_frequency) {
        frequencyMap.set(
          pref.email_frequency,
          (frequencyMap.get(pref.email_frequency) || 0) + 1,
        );
      }

      // Consent rates
      if (pref.analytics_consent) analyticsConsent++;
      if (pref.marketing_consent) marketingConsent++;
    });

    const themeDistribution = Array.from(themeMap.entries())
      .map(([theme, count]) => ({ count, theme }))
      .sort((a, b) => b.count - a.count);

    const languageDistribution = Array.from(languageMap.entries())
      .map(([language, count]) => ({ count, language }))
      .sort((a, b) => b.count - a.count);

    const emailFrequencyDistribution = Array.from(frequencyMap.entries())
      .map(([frequency, count]) => ({ count, frequency }))
      .sort((a, b) => b.count - a.count);

    const analytics = {
      consentRates: {
        analytics: totalUsers > 0 ? (analyticsConsent / totalUsers) * 100 : 0,
        marketing: totalUsers > 0 ? (marketingConsent / totalUsers) * 100 : 0,
      },
      emailFrequencyDistribution,
      languageDistribution,
      themeDistribution,
      totalUsers,
    };

    return { data: analytics };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getTestFeedback(
  testId: string,
  options: {
    includeTestimonials?: boolean;
    limit?: number;
    offset?: number;
  } = {},
): Promise<ApiResponse<UserFeedback[]>> {
  try {
    const client = requireSupabaseClient();

    let query = (client as any)
      .from("user_feedback")
      .select("*")
      .filter("test_id", "eq", testId)
      .filter("is_public", "eq", true);

    if (options.includeTestimonials) {
      query = query.eq("is_testimonial", true);
    }

    if (options.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getUserFeedback(
  userId: string,
  options: {
    limit?: number;
    testId?: string;
  } = {},
): Promise<ApiResponse<UserFeedback[]>> {
  try {
    const client = requireSupabaseClient();

    let query = (client as any)
      .from("user_feedback")
      .select(
        `
        *,
        personality_tests (
          id,
          slug,
          name_en,
          name_ko
        )
      `,
      )
      .filter("user_id", "eq", userId);

    if (options.testId) {
      query = query.eq("test_id", options.testId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data || [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function moderateFeedback(
  id: string,
  isApproved: boolean,
  moderatorNotes?: string,
): Promise<ApiResponse<UserFeedback>> {
  return updateFeedback(id, {
    is_public: isApproved,
    moderated_at: new Date().toISOString(),
    moderator_notes: moderatorNotes,
  });
}

export async function requestDataDeletion(
  userId: string,
): Promise<ApiResponse<UserPreferences>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_preferences")
      .update({ data_deletion_requested_at: new Date().toISOString() })
      .filter("user_id", "eq", userId)
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

export async function requestDataExport(
  userId: string,
): Promise<ApiResponse<UserPreferences>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_preferences")
      .update({ data_export_requested_at: new Date().toISOString() })
      .filter("user_id", "eq", userId)
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

export async function updateFeedback(
  id: string,
  updates: UserFeedbackUpdate,
): Promise<ApiResponse<UserFeedback>> {
  if (!supabaseAdmin) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    const { data, error } = await (supabaseAdmin as any)
      .from("user_feedback")
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

export async function updateNotificationSettings(
  userId: string,
  settings: {
    analytics_consent?: boolean;
    email_frequency?: "daily" | "monthly" | "never" | "weekly";
    marketing_consent?: boolean;
  },
): Promise<ApiResponse<UserPreferences>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_preferences")
      .update(settings)
      .filter("user_id", "eq", userId)
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

export async function updateUserLanguage(
  userId: string,
  language: "en" | "ko",
): Promise<ApiResponse<UserPreferences>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_preferences")
      .update({ language })
      .filter("user_id", "eq", userId)
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

// User Preferences Operations (already defined in users.ts but extended here)
export async function updateUserTheme(
  userId: string,
  theme: string,
): Promise<ApiResponse<UserPreferences>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_preferences")
      .update({ theme })
      .filter("user_id", "eq", userId)
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

function requireSupabaseClient(): NonNullable<typeof supabase> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}
