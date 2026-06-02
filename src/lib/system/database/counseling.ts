/**
 * Counseling Database Service Layer
 * Handles all counseling-related database operations
 */

import type {
  CounselingCategory,
  CounselingInsight,
  CounselingMessage,
  CounselingSession,
  CounselingSessionFilters,
  CounselingSessionFull,
  CounselingSessionStatus,
  CounselingSessionWithTopic,
  CounselingTopicWithCategory,
  CreateCounselingInsightInput,
  CreateCounselingMessageInput,
  CreateCounselingSessionInput,
} from "./counseling-types";

import { createClient } from "./supabase";

// ============================================================================
// COUNSELING CATEGORIES
// ============================================================================

/**
 * Add an insight to a counseling session
 */
export async function addCounselingInsight(
  input: CreateCounselingInsightInput,
): Promise<CounselingInsight> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_insights")
    .insert({
      content: input.content,
      insight_type: input.insight_type,
      is_actionable: input.is_actionable || false,
      priority: input.priority || 0,
      session_id: input.session_id,
      title: input.title || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding counseling insight:", error);
    throw new Error("Failed to add counseling insight");
  }

  return data;
}

/**
 * Add a message to a counseling session
 */
export async function addCounselingMessage(
  input: CreateCounselingMessageInput,
): Promise<CounselingMessage> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_messages")
    .insert({
      content: input.content,
      metadata: input.metadata || {},
      role: input.role,
      session_id: input.session_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding counseling message:", error);
    throw new Error("Failed to add counseling message");
  }

  return data;
}

// ============================================================================
// COUNSELING TOPICS
// ============================================================================

/**
 * Create a new counseling session
 */
export async function createCounselingSession(
  input: CreateCounselingSessionInput,
): Promise<CounselingSession> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_sessions")
    .insert({
      initial_question: input.initial_question,
      locale: input.locale || "en",
      session_id: input.session_id || null,
      session_type: input.session_type || "ai",
      title: input.title || null,
      topic_id: input.topic_id,
      user_context: input.user_context || {},
      user_id: input.user_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating counseling session:", error);
    throw new Error("Failed to create counseling session");
  }

  return data;
}

/**
 * Get all active counseling categories
 */
export async function getCounselingCategories(): Promise<CounselingCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching counseling categories:", error);
    throw new Error("Failed to fetch counseling categories");
  }

  return (data || []).map((cat) => ({
    ...cat,
    description:
      (cat as any).description_en || (cat as any).description_ko
        ? { en: (cat as any).description_en, ko: (cat as any).description_ko }
        : null,
    name: { en: (cat as any).name_en, ko: (cat as any).name_ko },
  }));
}

/**
 * Get a single counseling category by slug
 */
export async function getCounselingCategoryBySlug(
  slug: string,
): Promise<CounselingCategory | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching counseling category:", error);
    throw new Error("Failed to fetch counseling category");
  }

  return {
    ...data,
    description:
      (data as any).description_en || (data as any).description_ko
        ? { en: (data as any).description_en, ko: (data as any).description_ko }
        : null,
    name: { en: (data as any).name_en, ko: (data as any).name_ko },
  };
}

// ============================================================================
// COUNSELING SESSIONS
// ============================================================================

/**
 * Get insights for a session
 */
export async function getCounselingInsights(
  sessionId: string,
): Promise<CounselingInsight[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_insights")
    .select("*")
    .eq("session_id", sessionId)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching counseling insights:", error);
    throw new Error("Failed to fetch counseling insights");
  }

  return data || [];
}

/**
 * Get messages for a session
 */
export async function getCounselingMessages(
  sessionId: string,
): Promise<CounselingMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching counseling messages:", error);
    throw new Error("Failed to fetch counseling messages");
  }

  return data || [];
}

/**
 * Get a full counseling session with all messages and insights
 */
export async function getCounselingSessionFull(
  sessionId: string,
): Promise<CounselingSessionFull | null> {
  const supabase = createClient();

  // Get session with topic
  const { data: session, error: sessionError } = await supabase
    .from("counseling_sessions")
    .select(
      `
      *,
      topic:counseling_topics(
        *,
        category:counseling_categories(*)
      )
    `,
    )
    .eq("id", sessionId)
    .single();

  if (sessionError) {
    if (sessionError.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching counseling session:", sessionError);
    throw new Error("Failed to fetch counseling session");
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("counseling_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching counseling messages:", messagesError);
    throw new Error("Failed to fetch counseling messages");
  }

  // Get insights
  const { data: insights, error: insightsError } = await supabase
    .from("counseling_insights")
    .select("*")
    .eq("session_id", sessionId)
    .order("priority", { ascending: false });

  if (insightsError) {
    console.error("Error fetching counseling insights:", insightsError);
    throw new Error("Failed to fetch counseling insights");
  }

  return {
    ...session,
    insights: insights || [],
    messages: messages || [],
  };
}

/**
 * Get counseling session statistics for a user
 */
export async function getCounselingStats(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_sessions")
    .select("status, session_type, created_at")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching counseling stats:", error);
    return {
      active: 0,
      ai_sessions: 0,
      completed: 0,
      human_sessions: 0,
      total: 0,
    };
  }

  const sessions = data || [];

  return {
    active: sessions.filter((s) => s.status === "active").length,
    ai_sessions: sessions.filter((s) => s.session_type === "ai").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    human_sessions: sessions.filter((s) => s.session_type === "human").length,
    total: sessions.length,
  };
}

// ============================================================================
// COUNSELING MESSAGES
// ============================================================================

/**
 * Get a single counseling topic by slug
 */
export async function getCounselingTopicBySlug(
  slug: string,
): Promise<CounselingTopicWithCategory | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_topics")
    .select(
      `
      *,
      category:counseling_categories(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching counseling topic:", error);
    throw new Error("Failed to fetch counseling topic");
  }

  return {
    ...data,
    category: (data as any).category
      ? {
          ...(data as any).category,
          description:
            (data as any).category.description_en ||
            (data as any).category.description_ko
              ? {
                  en: (data as any).category.description_en,
                  ko: (data as any).category.description_ko,
                }
              : null,
          name: {
            en: (data as any).category.name_en,
            ko: (data as any).category.name_ko,
          },
        }
      : undefined,
    description:
      (data as any).description_en || (data as any).description_ko
        ? { en: (data as any).description_en, ko: (data as any).description_ko }
        : null,
    name: { en: (data as any).name_en, ko: (data as any).name_ko },
  } as any;
}

/**
 * Get all topics for a specific category
 */
export async function getCounselingTopicsByCategory(
  categoryId: string,
): Promise<CounselingTopicWithCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_topics")
    .select(
      `
      *,
      category:counseling_categories(*)
    `,
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching counseling topics:", error);
    throw new Error("Failed to fetch counseling topics");
  }

  return (data || []).map((topic) => ({
    ...topic,
    category: (topic as any).category
      ? {
          ...(topic as any).category,
          description:
            (topic as any).category.description_en ||
            (topic as any).category.description_ko
              ? {
                  en: (topic as any).category.description_en,
                  ko: (topic as any).category.description_ko,
                }
              : null,
          name: {
            en: (topic as any).category.name_en,
            ko: (topic as any).category.name_ko,
          },
        }
      : undefined,
    description:
      (topic as any).description_en || (topic as any).description_ko
        ? {
            en: (topic as any).description_en,
            ko: (topic as any).description_ko,
          }
        : null,
    name: { en: (topic as any).name_en, ko: (topic as any).name_ko },
  })) as any;
}

// ============================================================================
// COUNSELING INSIGHTS
// ============================================================================

/**
 * Get user's counseling sessions with filters
 */
export async function getUserCounselingSessions(
  filters: CounselingSessionFilters,
): Promise<CounselingSessionWithTopic[]> {
  const supabase = createClient();

  let query = supabase.from("counseling_sessions").select(`
      *,
      topic:counseling_topics(
        *,
        category:counseling_categories(*)
      )
    `);

  // Apply filters
  if (filters.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters.session_id) {
    query = query.eq("session_id", filters.session_id);
  }
  if (filters.topic_id) {
    query = query.eq("topic_id", filters.topic_id);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.session_type) {
    query = query.eq("session_type", filters.session_type);
  }
  if (filters.locale) {
    query = query.eq("locale", filters.locale);
  }
  if (filters.created_after) {
    query = query.gte("created_at", filters.created_after);
  }
  if (filters.created_before) {
    query = query.lte("created_at", filters.created_before);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching counseling sessions:", error);
    throw new Error("Failed to fetch counseling sessions");
  }

  // Add message and insight counts
  const enriched = await Promise.all(
    (data || []).map(async (session) => {
      const [{ count: insightCount }, { count: messageCount }] =
        await Promise.all([
          supabase
            .from("counseling_insights")
            .select("*", { count: "exact", head: true })
            .eq("session_id", session.id),
          supabase
            .from("counseling_messages")
            .select("*", { count: "exact", head: true })
            .eq("session_id", session.id),
        ]);

      return {
        ...session,
        insight_count: insightCount || 0,
        message_count: messageCount || 0,
      };
    }),
  );

  return enriched;
}

/**
 * Mark an insight action as completed
 */
export async function markInsightActionCompleted(
  insightId: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("counseling_insights")
    .update({ action_completed: true })
    .eq("id", insightId);

  if (error) {
    console.error("Error marking insight action completed:", error);
    throw new Error("Failed to mark insight action completed");
  }
}

/**
 * Search counseling topics by keywords
 */
export async function searchCounselingTopics(
  query: string,
  locale: string = "en",
): Promise<CounselingTopicWithCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("counseling_topics")
    .select(
      `
      *,
      category:counseling_categories(*)
    `,
    )
    .or(
      `name_en.ilike.%${query}%,name_ko.ilike.%${query}%,description_en.ilike.%${query}%,description_ko.ilike.%${query}%,keywords.cs.{${query}}`,
    )
    .eq("is_active", true)
    .limit(10);

  if (error) {
    console.error("Error searching counseling topics:", error);
    throw new Error("Failed to search counseling topics");
  }

  return (data || []).map((topic) => ({
    ...topic,
    category: topic.category
      ? {
          ...(topic.category as any),
          description:
            (topic.category as any).description_en ||
            (topic.category as any).description_ko
              ? {
                  en: (topic.category as any).description_en,
                  ko: (topic.category as any).description_ko,
                }
              : null,
          name: {
            en: (topic.category as any).name_en,
            ko: (topic.category as any).name_ko,
          },
        }
      : undefined,
    description:
      (topic as any).description_en || (topic as any).description_ko
        ? {
            en: (topic as any).description_en,
            ko: (topic as any).description_ko,
          }
        : null,
    name: { en: (topic as any).name_en, ko: (topic as any).name_ko },
  })) as any;
}

// ============================================================================
// ANALYTICS & STATISTICS
// ============================================================================

/**
 * Update counseling session status
 */
export async function updateCounselingSessionStatus(
  sessionId: string,
  status: CounselingSessionStatus,
): Promise<void> {
  const supabase = createClient();

  const updateData: {
    completed_at?: string;
    status: CounselingSessionStatus;
  } = { status };

  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("counseling_sessions")
    .update(updateData)
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating counseling session status:", error);
    throw new Error("Failed to update counseling session status");
  }
}
