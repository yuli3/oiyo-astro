import { LocalizedContent } from "@/types/manifest";

/**
 * TypeScript types for Counseling and Recommendations features
 * Generated from database schema: add_counseling_and_recommendations.sql
 */

// ============================================================================
// COUNSELING TYPES
// ============================================================================

export interface CounselingCategory {
  color_theme: null | string;
  created_at: string;
  description: LocalizedContent | null;
  icon: null | string;
  id: string;
  is_active: boolean;
  name: LocalizedContent;
  slug: string;
  sort_order: number;
  updated_at: string;
}

export interface CounselingCategoryResponse {
  categories: CounselingCategory[];
  total: number;
}

export interface CounselingInsight {
  action_completed: boolean;
  content: string;
  created_at: string;
  id: string;
  insight_type: CounselingInsightType;
  is_actionable: boolean;
  priority: number;
  session_id: string;
  title: null | string;
}
export type CounselingInsightType =
  | "action_item"
  | "challenge"
  | "recommendation"
  | "strength";

export interface CounselingMessage {
  content: string;
  created_at: string;
  id: string;
  metadata: Record<string, unknown>;
  role: CounselingMessageRole;
  session_id: string;
}

export type CounselingMessageRole = "assistant" | "system" | "user";

export interface CounselingSession {
  completed_at: null | string;
  created_at: string;
  id: string;
  initial_question: string;
  locale: string;
  session_id: null | string;
  session_type: CounselingSessionType;
  status: CounselingSessionStatus;
  title: null | string;
  topic_id: string;
  updated_at: string;
  user_context: Record<string, unknown>;
  user_id: null | string;
}

export interface CounselingSessionFilters {
  created_after?: string;
  created_before?: string;
  locale?: string;
  session_id?: string;
  session_type?: CounselingSessionType;
  status?: CounselingSessionStatus;
  topic_id?: string;
  user_id?: string;
}

export interface CounselingSessionFull extends CounselingSession {
  insights: CounselingInsight[];
  messages: CounselingMessage[];
  topic: CounselingTopicWithCategory;
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface CounselingSessionResponse {
  session: CounselingSessionFull;
}
export type CounselingSessionStatus = "active" | "archived" | "completed";

export type CounselingSessionType = "ai" | "human" | "hybrid";

export interface CounselingSessionWithTopic extends CounselingSession {
  insight_count: number;
  message_count: number;
  topic: CounselingTopicWithCategory;
}

export interface CounselingTopic {
  category_id: string;
  created_at: string;
  description: LocalizedContent | null;
  id: string;
  is_active: boolean;
  keywords: string[];
  name: LocalizedContent;
  recommended_tests: string[]; // UUID array
  slug: string;
  sort_order: number;
  updated_at: string;
}

export interface CounselingTopicResponse {
  topics: CounselingTopicWithCategory[];
  total: number;
}

export interface CounselingTopicWithCategory extends CounselingTopic {
  category: CounselingCategory;
}

// ============================================================================
// INPUT TYPES (for creating/updating records)
// ============================================================================

export interface CreateCounselingInsightInput {
  content: string;
  insight_type: CounselingInsightType;
  is_actionable?: boolean;
  priority?: number;
  session_id: string;
  title?: string;
}

export interface CreateCounselingMessageInput {
  content: string;
  metadata?: Record<string, unknown>;
  role: CounselingMessageRole;
  session_id: string;
}

export interface CreateCounselingSessionInput {
  initial_question: string;
  locale?: string;
  session_id?: string;
  session_type?: CounselingSessionType;
  title?: string;
  topic_id: string;
  user_context?: Record<string, unknown>;
  user_id?: string;
}

export interface CreateUserInterestInput {
  explicit_weight?: number;
  implicit_weight?: number;
  interest_type: UserInterestType;
  interest_value: string;
  session_id?: string;
  user_id?: string;
}

export interface CreateUserRecommendationInput {
  confidence_score?: number;
  expires_at?: string;
  priority_score?: number;
  reason?: string;
  recommendation_type: UserRecommendationType;
  session_id?: string;
  target_id: string;
  target_slug?: string;
  user_id?: string;
}

// ============================================================================
// ENRICHED TYPES (with joined data)
// ============================================================================

export interface RecommendationRule {
  created_at: string;
  description: null | string;
  id: string;
  is_active: boolean;
  priority_score: number;
  rule_name: string;
  rule_type: RecommendationRuleType;
  source_conditions: Record<string, unknown>;
  target_ids: string[]; // UUID array
  target_type: RecommendationTargetType;
  updated_at: string;
}

export type RecommendationRuleType =
  | "behavior_based"
  | "collaborative"
  | "content_based"
  | "test_based";

export type RecommendationTargetType =
  | "content"
  | "counseling_topic"
  | "insight"
  | "test";

export interface UserInterest {
  created_at: string;
  explicit_weight: number; // 0.00 to 1.00
  id: string;
  implicit_weight: number; // 0.00 to 1.00
  interest_type: UserInterestType;
  interest_value: string;
  last_interacted_at: string;
  session_id: null | string;
  total_weight: number; // Generated column
  updated_at: string;
  user_id: null | string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface UserInterestFilters {
  interest_type?: UserInterestType;
  min_total_weight?: number;
  session_id?: string;
  user_id?: string;
}

export type UserInterestType =
  | "category"
  | "counseling_area"
  | "test_type"
  | "topic";

export interface UserRecommendation {
  completed_at: null | string;
  confidence_score: number; // 0.00 to 1.00
  created_at: string;
  dismissed_at: null | string;
  expires_at: null | string;
  id: string;
  is_completed: boolean;
  is_dismissed: boolean;
  priority_score: number; // 0 to 100
  reason: null | string;
  recommendation_type: UserRecommendationType;
  session_id: null | string;
  target_id: string;
  target_slug: null | string;
  user_id: null | string;
}

export interface UserRecommendationEnriched extends UserRecommendation {
  target_data: {
    description?: LocalizedContent;
    icon?: string;
    name?: LocalizedContent;
    slug?: string;
  };
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface UserRecommendationFilters {
  is_completed?: boolean;
  is_dismissed?: boolean;
  min_confidence?: number;
  min_priority?: number;
  not_expired?: boolean;
  recommendation_type?: UserRecommendationType;
  session_id?: string;
  user_id?: string;
}

export interface UserRecommendationsResponse {
  categories: {
    content: number;
    counseling: number;
    insight: number;
    test: number;
  };
  recommendations: UserRecommendationEnriched[];
  total: number;
}

export type UserRecommendationType =
  | "content"
  | "counseling"
  | "insight"
  | "test";
