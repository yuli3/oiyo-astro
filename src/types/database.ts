export type AchievementBadgeInsert = TablesMap["achievement_badges"]["Insert"];

export type AchievementBadgeRow = TablesMap["achievement_badges"]["Row"];

export type AchievementBadgeUpdate = TablesMap["achievement_badges"]["Update"];
// Legacy aliases for convenience throughout the codebase
export type AchievementDefinition = TablesMap["achievement_definitions"]["Row"];

export type AchievementDefinitionInsert =
  TablesMap["achievement_definitions"]["Insert"];
export type AchievementDefinitionUpdate =
  TablesMap["achievement_definitions"]["Update"];
export type AchievementProgressInsert =
  TablesMap["achievement_progress"]["Insert"];

export type AchievementProgressRow = TablesMap["achievement_progress"]["Row"];
export type AchievementProgressUpdate =
  TablesMap["achievement_progress"]["Update"];
export type AchievementXpLedgerInsert =
  TablesMap["achievement_xp_ledger"]["Insert"];

export type AchievementXpLedgerRow = TablesMap["achievement_xp_ledger"]["Row"];
export type AchievementXpLedgerUpdate =
  TablesMap["achievement_xp_ledger"]["Update"];
export type AnalyticsEvent = TablesMap["analytics_events"]["Row"];

export type AnalyticsEventInsert = TablesMap["analytics_events"]["Insert"];
export type AnalyticsEventUpdate = TablesMap["analytics_events"]["Update"];
// Generic API response helper used across the project
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code?: string;
    details?: unknown;
    message: string;
  };
  meta?: {
    limit?: number;
    page?: number;
    total?: number;
  };
}

export type CommunityConfession = TablesMap["community_confessions"]["Row"];
export type CommunityConfessionComment =
  TablesMap["community_confession_comments"]["Row"];
export type CommunityConfessionCommentInsert =
  TablesMap["community_confession_comments"]["Insert"];

export type CommunityConfessionCommentUpdate =
  TablesMap["community_confession_comments"]["Update"];
export type CommunityConfessionInsert =
  TablesMap["community_confessions"]["Insert"];
export type CommunityConfessionUpdate =
  TablesMap["community_confessions"]["Update"];

export type ContentSchedule = TablesMap["content_schedule"]["Row"];
export type ContentScheduleInsert = TablesMap["content_schedule"]["Insert"];
export type ContentScheduleUpdate = TablesMap["content_schedule"]["Update"];

export type DailyInsight = TablesMap["daily_insights"]["Row"];
export type DailyInsightInsert = TablesMap["daily_insights"]["Insert"];
export type DailyInsightUpdate = TablesMap["daily_insights"]["Update"];

export type Database = {
  public: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    Functions: {
      oiyo_region_from_country: {
        Args: {
          country_code: null | string;
        };
        Returns: string;
      };
    };
    Tables: {
      achievement_badges: {
        Insert: {
          badge_slug: string;
          earned_at?: null | string;
          earned_via_achievement?: null | string;
          id?: string;
          is_equipped?: boolean | null;
          metadata?: Json | null;
          session_id?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["earned_via_achievement"];
            foreignKeyName: "achievement_badges_earned_via_achievement_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "achievement_definitions";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "achievement_badges_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          badge_slug: string;
          earned_at: null | string;
          earned_via_achievement: null | string;
          id: string;
          is_equipped: boolean | null;
          metadata: Json | null;
          session_id: null | string;
          user_id: null | string;
        };
        Update: {
          badge_slug?: string;
          earned_at?: null | string;
          earned_via_achievement?: null | string;
          id?: string;
          is_equipped?: boolean | null;
          metadata?: Json | null;
          session_id?: null | string;
          user_id?: null | string;
        };
      };
      achievement_definitions: {
        Insert: {
          base_points?: null | number;
          category: string;
          created_at?: null | string;
          cta_key?: null | string;
          description_key: string;
          icon?: null | string;
          id?: string;
          is_repeatable?: boolean | null;
          rarity: string;
          requirements?: Json;
          slug: string;
          title_key: string;
          type: string;
          updated_at?: null | string;
        };
        Relationships: [];
        Row: {
          base_points: null | number;
          category: string;
          created_at: null | string;
          cta_key: null | string;
          description_key: string;
          icon: null | string;
          id: string;
          is_repeatable: boolean | null;
          rarity: string;
          requirements: Json;
          slug: string;
          title_key: string;
          type: string;
          updated_at: null | string;
        };
        Update: {
          base_points?: null | number;
          category?: string;
          created_at?: null | string;
          cta_key?: null | string;
          description_key?: string;
          icon?: null | string;
          id?: string;
          is_repeatable?: boolean | null;
          rarity?: string;
          requirements?: Json;
          slug?: string;
          title_key?: string;
          type?: string;
          updated_at?: null | string;
        };
      };
      achievement_progress: {
        Insert: {
          achievement_id?: null | string;
          created_at?: null | string;
          id?: string;
          notification_sent?: boolean | null;
          progress_metadata?: Json | null;
          progress_value?: null | number;
          session_id?: null | string;
          unlocked?: boolean | null;
          unlocked_at?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["achievement_id"];
            foreignKeyName: "achievement_progress_achievement_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "achievement_definitions";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "achievement_progress_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          achievement_id: null | string;
          created_at: null | string;
          id: string;
          notification_sent: boolean | null;
          progress_metadata: Json | null;
          progress_value: null | number;
          session_id: null | string;
          unlocked: boolean | null;
          unlocked_at: null | string;
          updated_at: null | string;
          user_id: null | string;
        };
        Update: {
          achievement_id?: null | string;
          created_at?: null | string;
          id?: string;
          notification_sent?: boolean | null;
          progress_metadata?: Json | null;
          progress_value?: null | number;
          session_id?: null | string;
          unlocked?: boolean | null;
          unlocked_at?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
        };
      };
      achievement_xp_ledger: {
        Insert: {
          achievement_id?: null | string;
          created_at?: null | string;
          id?: string;
          multiplier_breakdown?: Json | null;
          points: number;
          session_id?: null | string;
          source: string;
          source_id?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["achievement_id"];
            foreignKeyName: "achievement_xp_ledger_achievement_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "achievement_definitions";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "achievement_xp_ledger_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          achievement_id: null | string;
          created_at: null | string;
          id: string;
          multiplier_breakdown: Json | null;
          points: number;
          session_id: null | string;
          source: string;
          source_id: null | string;
          user_id: null | string;
        };
        Update: {
          achievement_id?: null | string;
          created_at?: null | string;
          id?: string;
          multiplier_breakdown?: Json | null;
          points?: number;
          session_id?: null | string;
          source?: string;
          source_id?: null | string;
          user_id?: null | string;
        };
      };
      analytics_events: {
        Insert: {
          browser?: null | string;
          country_code?: null | string;
          created_at?: null | string;
          device_type?: null | string;
          event_data?: Json | null;
          event_type: string;
          id?: string;
          ip_address?: null | unknown;
          os?: null | string;
          page_path?: null | string;
          referrer?: null | string;
          session_id?: null | string;
          user_agent?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "analytics_events_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          browser: null | string;
          country_code: null | string;
          created_at: null | string;
          device_type: null | string;
          event_data: Json | null;
          event_type: string;
          id: string;
          ip_address: null | unknown;
          os: null | string;
          page_path: null | string;
          referrer: null | string;
          session_id: null | string;
          user_agent: null | string;
          user_id: null | string;
        };
        Update: {
          browser?: null | string;
          country_code?: null | string;
          created_at?: null | string;
          device_type?: null | string;
          event_data?: Json | null;
          event_type?: string;
          id?: string;
          ip_address?: null | unknown;
          os?: null | string;
          page_path?: null | string;
          referrer?: null | string;
          session_id?: null | string;
          user_agent?: null | string;
          user_id?: null | string;
        };
      };
      community_confession_comments: {
        Insert: {
          anonymous_identifier?: null | string;
          author_id?: null | string;
          confession_id?: null | string;
          content: string;
          created_at?: null | string;
          id?: string;
          is_supportive?: boolean | null;
          metadata?: Json | null;
          personality_hint?: null | string;
          session_id?: null | string;
        };
        Relationships: [
          {
            columns: ["author_id"];
            foreignKeyName: "community_confession_comments_author_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
          {
            columns: ["confession_id"];
            foreignKeyName: "community_confession_comments_confession_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "community_confessions";
          },
        ];
        Row: {
          anonymous_identifier: null | string;
          author_id: null | string;
          confession_id: null | string;
          content: string;
          created_at: null | string;
          id: string;
          is_supportive: boolean | null;
          metadata: Json | null;
          personality_hint: null | string;
          session_id: null | string;
        };
        Update: {
          anonymous_identifier?: null | string;
          author_id?: null | string;
          confession_id?: null | string;
          content?: string;
          created_at?: null | string;
          id?: string;
          is_supportive?: boolean | null;
          metadata?: Json | null;
          personality_hint?: null | string;
          session_id?: null | string;
        };
      };
      community_confessions: {
        Insert: {
          allowed_personality_types?: null | string[];
          anonymous_identifier?: null | string;
          author_id?: null | string;
          comment_count?: null | number;
          content: string;
          created_at?: null | string;
          id?: string;
          locale?: string;
          metadata?: Json | null;
          personality_hint?: null | string;
          reaction_count?: null | number;
          session_id?: null | string;
          tags?: null | string[];
          updated_at?: null | string;
        };
        Relationships: [
          {
            columns: ["author_id"];
            foreignKeyName: "community_confessions_author_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          allowed_personality_types: null | string[];
          anonymous_identifier: null | string;
          author_id: null | string;
          comment_count: null | number;
          content: string;
          created_at: null | string;
          id: string;
          locale: string;
          metadata: Json | null;
          personality_hint: null | string;
          reaction_count: null | number;
          session_id: null | string;
          tags: null | string[];
          updated_at: null | string;
        };
        Update: {
          allowed_personality_types?: null | string[];
          anonymous_identifier?: null | string;
          author_id?: null | string;
          comment_count?: null | number;
          content?: string;
          created_at?: null | string;
          id?: string;
          locale?: string;
          metadata?: Json | null;
          personality_hint?: null | string;
          reaction_count?: null | number;
          session_id?: null | string;
          tags?: null | string[];
          updated_at?: null | string;
        };
      };
      content_schedule: {
        Insert: {
          content_type: string;
          created_at?: null | string;
          day_of_month?: null | number;
          day_of_week?: null | number;
          delivery_channel?: null | string;
          description?: null | string;
          ends_at?: null | string;
          id?: string;
          is_active?: boolean | null;
          locale?: null | string;
          metadata?: Json | null;
          schedule_cron?: null | string;
          send_time?: null | string;
          slug: string;
          starts_at?: null | string;
          target_audience?: null | string;
          timezone?: null | string;
          title?: null | string;
          updated_at?: null | string;
        };
        Relationships: [];
        Row: {
          content_type: string;
          created_at: null | string;
          day_of_month: null | number;
          day_of_week: null | number;
          delivery_channel: null | string;
          description: null | string;
          ends_at: null | string;
          id: string;
          is_active: boolean | null;
          locale: null | string;
          metadata: Json | null;
          schedule_cron: null | string;
          send_time: null | string;
          slug: string;
          starts_at: null | string;
          target_audience: null | string;
          timezone: null | string;
          title: null | string;
          updated_at: null | string;
        };
        Update: {
          content_type?: string;
          created_at?: null | string;
          day_of_month?: null | number;
          day_of_week?: null | number;
          delivery_channel?: null | string;
          description?: null | string;
          ends_at?: null | string;
          id?: string;
          is_active?: boolean | null;
          locale?: null | string;
          metadata?: Json | null;
          schedule_cron?: null | string;
          send_time?: null | string;
          slug?: string;
          starts_at?: null | string;
          target_audience?: null | string;
          timezone?: null | string;
          title?: null | string;
          updated_at?: null | string;
        };
      };
      daily_insights: {
        Insert: {
          action_tip?: null | string;
          affirmation?: null | string;
          ai_model?: null | string;
          content: string;
          date: string;
          emoji?: null | string;
          energy_forecast?: null | string;
          focus_area?: null | string;
          generated_at?: null | string;
          id?: string;
          is_active?: boolean | null;
          locale?: string;
          lucky_color?: null | string;
          lucky_number?: null | number;
          mood_score?: null | number;
          personality_type: string;
          title: string;
        };
        Relationships: [];
        Row: {
          action_tip: null | string;
          affirmation: null | string;
          ai_model: null | string;
          content: string;
          date: string;
          emoji: null | string;
          energy_forecast: null | string;
          focus_area: null | string;
          generated_at: null | string;
          id: string;
          is_active: boolean | null;
          locale: string;
          lucky_color: null | string;
          lucky_number: null | number;
          mood_score: null | number;
          personality_type: string;
          title: string;
        };
        Update: {
          action_tip?: null | string;
          affirmation?: null | string;
          ai_model?: null | string;
          content?: string;
          date?: string;
          emoji?: null | string;
          energy_forecast?: null | string;
          focus_area?: null | string;
          generated_at?: null | string;
          id?: string;
          is_active?: boolean | null;
          locale?: string;
          lucky_color?: null | string;
          lucky_number?: null | number;
          mood_score?: null | number;
          personality_type?: string;
          title?: string;
        };
      };
      discussion_memberships: {
        Insert: {
          compatibility_score?: null | number;
          id?: string;
          joined_at?: null | string;
          last_seen_at?: null | string;
          notification_preferences?: Json | null;
          role?: null | string;
          session_id?: null | string;
          space_id?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["space_id"];
            foreignKeyName: "discussion_memberships_space_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_spaces";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "discussion_memberships_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          compatibility_score: null | number;
          id: string;
          joined_at: null | string;
          last_seen_at: null | string;
          notification_preferences: Json | null;
          role: null | string;
          session_id: null | string;
          space_id: null | string;
          user_id: null | string;
        };
        Update: {
          compatibility_score?: null | number;
          id?: string;
          joined_at?: null | string;
          last_seen_at?: null | string;
          notification_preferences?: Json | null;
          role?: null | string;
          session_id?: null | string;
          space_id?: null | string;
          user_id?: null | string;
        };
      };
      discussion_messages: {
        Insert: {
          attachments?: Json | null;
          content: string;
          created_at?: null | string;
          deleted_at?: null | string;
          id?: string;
          metadata?: Json | null;
          personality_type?: null | string;
          sentiment?: Json | null;
          session_id?: null | string;
          space_id?: null | string;
          topic_id?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["space_id"];
            foreignKeyName: "discussion_messages_space_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_spaces";
          },
          {
            columns: ["topic_id"];
            foreignKeyName: "discussion_messages_topic_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_topics";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "discussion_messages_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          attachments: Json | null;
          content: string;
          created_at: null | string;
          deleted_at: null | string;
          id: string;
          metadata: Json | null;
          personality_type: null | string;
          sentiment: Json | null;
          session_id: null | string;
          space_id: null | string;
          topic_id: null | string;
          updated_at: null | string;
          user_id: null | string;
        };
        Update: {
          attachments?: Json | null;
          content?: string;
          created_at?: null | string;
          deleted_at?: null | string;
          id?: string;
          metadata?: Json | null;
          personality_type?: null | string;
          sentiment?: Json | null;
          session_id?: null | string;
          space_id?: null | string;
          topic_id?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
        };
      };
      discussion_presence: {
        Insert: {
          id?: string;
          last_seen_at?: null | string;
          metadata?: Json | null;
          session_id?: null | string;
          space_id?: null | string;
          status?: null | string;
          topic_id?: null | string;
          typing_topic_id?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["space_id"];
            foreignKeyName: "discussion_presence_space_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_spaces";
          },
          {
            columns: ["topic_id"];
            foreignKeyName: "discussion_presence_topic_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_topics";
          },
          {
            columns: ["typing_topic_id"];
            foreignKeyName: "discussion_presence_typing_topic_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_topics";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "discussion_presence_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          id: string;
          last_seen_at: null | string;
          metadata: Json | null;
          session_id: null | string;
          space_id: null | string;
          status: null | string;
          topic_id: null | string;
          typing_topic_id: null | string;
          user_id: null | string;
        };
        Update: {
          id?: string;
          last_seen_at?: null | string;
          metadata?: Json | null;
          session_id?: null | string;
          space_id?: null | string;
          status?: null | string;
          topic_id?: null | string;
          typing_topic_id?: null | string;
          user_id?: null | string;
        };
      };
      discussion_spaces: {
        Insert: {
          active_connections?: null | number;
          allowed_personality_types?: null | string[];
          compatibility_min_score?: null | number;
          cover_image_url?: null | string;
          created_at?: null | string;
          created_by?: null | string;
          created_session_id?: null | string;
          description_en?: null | string;
          description_ko?: null | string;
          id?: string;
          is_private?: boolean | null;
          last_activity_at?: null | string;
          locale?: null | string;
          member_count?: null | number;
          metadata?: Json | null;
          moderation_settings?: Json | null;
          name_en: string;
          name_ko: string;
          personality_focus?: null | string[];
          requires_approval?: boolean | null;
          slug: string;
          updated_at?: null | string;
          visibility?: null | string;
        };
        Relationships: [
          {
            columns: ["created_by"];
            foreignKeyName: "discussion_spaces_created_by_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          active_connections: null | number;
          allowed_personality_types: null | string[];
          compatibility_min_score: null | number;
          cover_image_url: null | string;
          created_at: null | string;
          created_by: null | string;
          created_session_id: null | string;
          description_en: null | string;
          description_ko: null | string;
          id: string;
          is_private: boolean | null;
          last_activity_at: null | string;
          locale: null | string;
          member_count: null | number;
          metadata: Json | null;
          moderation_settings: Json | null;
          name_en: string;
          name_ko: string;
          personality_focus: null | string[];
          requires_approval: boolean | null;
          slug: string;
          updated_at: null | string;
          visibility: null | string;
        };
        Update: {
          active_connections?: null | number;
          allowed_personality_types?: null | string[];
          compatibility_min_score?: null | number;
          cover_image_url?: null | string;
          created_at?: null | string;
          created_by?: null | string;
          created_session_id?: null | string;
          description_en?: null | string;
          description_ko?: null | string;
          id?: string;
          is_private?: boolean | null;
          last_activity_at?: null | string;
          locale?: null | string;
          member_count?: null | number;
          metadata?: Json | null;
          moderation_settings?: Json | null;
          name_en?: string;
          name_ko?: string;
          personality_focus?: null | string[];
          requires_approval?: boolean | null;
          slug?: string;
          updated_at?: null | string;
          visibility?: null | string;
        };
      };
      discussion_topics: {
        Insert: {
          created_at?: null | string;
          created_by?: null | string;
          engagement_score?: null | number;
          id?: string;
          is_locked?: boolean | null;
          is_pinned?: boolean | null;
          last_activity_at?: null | string;
          locale?: null | string;
          message_count?: null | number;
          metadata?: Json | null;
          participant_count?: null | number;
          session_id?: null | string;
          slug: string;
          space_id?: null | string;
          summary?: null | string;
          tags?: null | string[];
          title: string;
          updated_at?: null | string;
        };
        Relationships: [
          {
            columns: ["created_by"];
            foreignKeyName: "discussion_topics_created_by_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
          {
            columns: ["space_id"];
            foreignKeyName: "discussion_topics_space_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "discussion_spaces";
          },
        ];
        Row: {
          created_at: null | string;
          created_by: null | string;
          engagement_score: null | number;
          id: string;
          is_locked: boolean | null;
          is_pinned: boolean | null;
          last_activity_at: null | string;
          locale: null | string;
          message_count: null | number;
          metadata: Json | null;
          participant_count: null | number;
          session_id: null | string;
          slug: string;
          space_id: null | string;
          summary: null | string;
          tags: null | string[];
          title: string;
          updated_at: null | string;
        };
        Update: {
          created_at?: null | string;
          created_by?: null | string;
          engagement_score?: null | number;
          id?: string;
          is_locked?: boolean | null;
          is_pinned?: boolean | null;
          last_activity_at?: null | string;
          locale?: null | string;
          message_count?: null | number;
          metadata?: Json | null;
          participant_count?: null | number;
          session_id?: null | string;
          slug?: string;
          space_id?: null | string;
          summary?: null | string;
          tags?: null | string[];
          title?: string;
          updated_at?: null | string;
        };
      };
      personality_tests: {
        Insert: {
          category_id?: null | string;
          created_at?: null | string;
          description_en?: null | string;
          description_ko?: null | string;
          difficulty_level?: null | number;
          duration_minutes?: null | number;
          id?: string;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          name_en: string;
          name_ko: string;
          question_count?: null | number;
          result_types?: null | number;
          seo_keywords_en?: null | string[];
          seo_keywords_ko?: null | string[];
          short_description_en?: null | string;
          short_description_ko?: null | string;
          slug: string;
          tags?: Json | null;
          thumbnail_url?: null | string;
          updated_at?: null | string;
        };
        Relationships: [
          {
            columns: ["category_id"];
            foreignKeyName: "personality_tests_category_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "test_categories";
          },
        ];
        Row: {
          category_id: null | string;
          created_at: null | string;
          description_en: null | string;
          description_ko: null | string;
          difficulty_level: null | number;
          duration_minutes: null | number;
          id: string;
          is_active: boolean | null;
          is_featured: boolean | null;
          name_en: string;
          name_ko: string;
          question_count: null | number;
          result_types: null | number;
          seo_keywords_en: null | string[];
          seo_keywords_ko: null | string[];
          short_description_en: null | string;
          short_description_ko: null | string;
          slug: string;
          tags: Json | null;
          thumbnail_url: null | string;
          updated_at: null | string;
        };
        Update: {
          category_id?: null | string;
          created_at?: null | string;
          description_en?: null | string;
          description_ko?: null | string;
          difficulty_level?: null | number;
          duration_minutes?: null | number;
          id?: string;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          name_en?: string;
          name_ko?: string;
          question_count?: null | number;
          result_types?: null | number;
          seo_keywords_en?: null | string[];
          seo_keywords_ko?: null | string[];
          short_description_en?: null | string;
          short_description_ko?: null | string;
          slug?: string;
          tags?: Json | null;
          thumbnail_url?: null | string;
          updated_at?: null | string;
        };
      };
      shared_result_events: {
        Insert: {
          id?: string;
          locale?: null | string;
          metadata?: Json | null;
          result_id?: null | string;
          session_id?: null | string;
          share_method: string;
          share_platform?: null | string;
          shared_at?: null | string;
          shared_result_id?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["result_id"];
            foreignKeyName: "shared_result_events_result_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "test_results";
          },
          {
            columns: ["shared_result_id"];
            foreignKeyName: "shared_result_events_shared_result_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "shared_results";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "shared_result_events_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          id: string;
          locale: null | string;
          metadata: Json | null;
          result_id: null | string;
          session_id: null | string;
          share_method: string;
          share_platform: null | string;
          shared_at: null | string;
          shared_result_id: null | string;
          user_id: null | string;
        };
        Update: {
          id?: string;
          locale?: null | string;
          metadata?: Json | null;
          result_id?: null | string;
          session_id?: null | string;
          share_method?: string;
          share_platform?: null | string;
          shared_at?: null | string;
          shared_result_id?: null | string;
          user_id?: null | string;
        };
      };
      shared_results: {
        Insert: {
          created_at?: null | string;
          custom_message?: null | string;
          expires_at?: null | string;
          id?: string;
          last_shared_at?: null | string;
          metadata?: Json | null;
          result_id?: null | string;
          share_method?: null | string;
          share_platform?: null | string;
          share_token: string;
          share_type?: null | string;
          view_count?: null | number;
        };
        Relationships: [
          {
            columns: ["result_id"];
            foreignKeyName: "shared_results_result_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "test_results";
          },
        ];
        Row: {
          created_at: null | string;
          custom_message: null | string;
          expires_at: null | string;
          id: string;
          last_shared_at: null | string;
          metadata: Json | null;
          result_id: null | string;
          share_method: null | string;
          share_platform: null | string;
          share_token: string;
          share_type: null | string;
          view_count: null | number;
        };
        Update: {
          created_at?: null | string;
          custom_message?: null | string;
          expires_at?: null | string;
          id?: string;
          last_shared_at?: null | string;
          metadata?: Json | null;
          result_id?: null | string;
          share_method?: null | string;
          share_platform?: null | string;
          share_token?: string;
          share_type?: null | string;
          view_count?: null | number;
        };
      };
      test_categories: {
        Insert: {
          created_at?: null | string;
          description_en?: null | string;
          description_ko?: null | string;
          icon?: null | string;
          id?: string;
          is_active?: boolean | null;
          name_en: string;
          name_ko: string;
          slug: string;
          sort_order?: null | number;
        };
        Relationships: [];
        Row: {
          created_at: null | string;
          description_en: null | string;
          description_ko: null | string;
          icon: null | string;
          id: string;
          is_active: boolean | null;
          name_en: string;
          name_ko: string;
          slug: string;
          sort_order: null | number;
        };
        Update: {
          created_at?: null | string;
          description_en?: null | string;
          description_ko?: null | string;
          icon?: null | string;
          id?: string;
          is_active?: boolean | null;
          name_en?: string;
          name_ko?: string;
          slug?: string;
          sort_order?: null | number;
        };
      };
      test_results: {
        Insert: {
          completion_time_seconds?: null | number;
          created_at?: null | string;
          id?: string;
          ip_address?: null | unknown;
          is_shared?: boolean | null;
          locale?: null | string;
          percentage_scores?: Json | null;
          raw_answers?: Json | null;
          result_description_en?: null | string;
          result_description_ko?: null | string;
          result_title_en?: null | string;
          result_title_ko?: null | string;
          result_type: string;
          session_id?: null | string;
          shared_at?: null | string;
          test_id?: null | string;
          user_agent?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["test_id"];
            foreignKeyName: "test_results_test_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "personality_tests";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "test_results_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          completion_time_seconds: null | number;
          created_at: null | string;
          id: string;
          ip_address: null | unknown;
          is_shared: boolean | null;
          locale: null | string;
          percentage_scores: Json | null;
          raw_answers: Json | null;
          result_description_en: null | string;
          result_description_ko: null | string;
          result_title_en: null | string;
          result_title_ko: null | string;
          result_type: string;
          session_id: null | string;
          shared_at: null | string;
          test_id: null | string;
          user_agent: null | string;
          user_id: null | string;
        };
        Update: {
          completion_time_seconds?: null | number;
          created_at?: null | string;
          id?: string;
          ip_address?: null | unknown;
          is_shared?: boolean | null;
          locale?: null | string;
          percentage_scores?: Json | null;
          raw_answers?: Json | null;
          result_description_en?: null | string;
          result_description_ko?: null | string;
          result_title_en?: null | string;
          result_title_ko?: null | string;
          result_type?: string;
          session_id?: null | string;
          shared_at?: null | string;
          test_id?: null | string;
          user_agent?: null | string;
          user_id?: null | string;
        };
      };
      user_feedback: {
        Insert: {
          comment?: null | string;
          created_at?: null | string;
          id?: string;
          is_featured?: boolean | null;
          is_public?: boolean | null;
          is_testimonial?: boolean | null;
          moderated_at?: null | string;
          moderator_notes?: null | string;
          rating?: null | number;
          test_id?: null | string;
          user_id?: null | string;
          user_initials?: null | string;
          user_location?: null | string;
        };
        Relationships: [
          {
            columns: ["test_id"];
            foreignKeyName: "user_feedback_test_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "personality_tests";
          },
          {
            columns: ["user_id"];
            foreignKeyName: "user_feedback_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          comment: null | string;
          created_at: null | string;
          id: string;
          is_featured: boolean | null;
          is_public: boolean | null;
          is_testimonial: boolean | null;
          moderated_at: null | string;
          moderator_notes: null | string;
          rating: null | number;
          test_id: null | string;
          user_id: null | string;
          user_initials: null | string;
          user_location: null | string;
        };
        Update: {
          comment?: null | string;
          created_at?: null | string;
          id?: string;
          is_featured?: boolean | null;
          is_public?: boolean | null;
          is_testimonial?: boolean | null;
          moderated_at?: null | string;
          moderator_notes?: null | string;
          rating?: null | number;
          test_id?: null | string;
          user_id?: null | string;
          user_initials?: null | string;
          user_location?: null | string;
        };
      };
      user_persona_profiles: {
        Insert: {
          birth_city?: null | string;
          birth_time?: null | string;
          birthdate?: null | string;
          blood_type?: null | string;
          budget_focus?: null | string;
          career_interest_slugs?: null | string[];
          chinese_zodiac?: null | string;
          created_at?: null | string;
          dominant_love_language?: null | string;
          dream_roles?: null | string[];
          enneagram_type?: null | string;
          financial_goals?: Json | null;
          id?: string;
          interests?: null | string[];
          investment_profile?: null | string;
          mbti_type?: null | string;
          metadata?: Json | null;
          romance_focus?: null | string;
          session_id?: null | string;
          spending_style?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
          wellness_focus?: null | string[];
          zodiac_sign?: null | string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "user_persona_profiles_user_id_fkey";
            isOneToOne: false;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          birth_city: null | string;
          birth_time: null | string;
          birthdate: null | string;
          blood_type: null | string;
          budget_focus: null | string;
          career_interest_slugs: null | string[];
          chinese_zodiac: null | string;
          created_at: null | string;
          dominant_love_language: null | string;
          dream_roles: null | string[];
          enneagram_type: null | string;
          financial_goals: Json | null;
          id: string;
          interests: null | string[];
          investment_profile: null | string;
          mbti_type: null | string;
          metadata: Json | null;
          romance_focus: null | string;
          session_id: null | string;
          spending_style: null | string;
          updated_at: null | string;
          user_id: null | string;
          wellness_focus: null | string[];
          zodiac_sign: null | string;
        };
        Update: {
          birth_city?: null | string;
          birth_time?: null | string;
          birthdate?: null | string;
          blood_type?: null | string;
          budget_focus?: null | string;
          career_interest_slugs?: null | string[];
          chinese_zodiac?: null | string;
          created_at?: null | string;
          dominant_love_language?: null | string;
          dream_roles?: null | string[];
          enneagram_type?: null | string;
          financial_goals?: Json | null;
          id?: string;
          interests?: null | string[];
          investment_profile?: null | string;
          mbti_type?: null | string;
          metadata?: Json | null;
          romance_focus?: null | string;
          session_id?: null | string;
          spending_style?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
          wellness_focus?: null | string[];
          zodiac_sign?: null | string;
        };
      };
      user_preferences: {
        Insert: {
          analytics_consent?: boolean | null;
          created_at?: null | string;
          data_deletion_requested_at?: null | string;
          data_export_requested_at?: null | string;
          email_frequency?: null | string;
          id?: string;
          language?: null | string;
          marketing_consent?: boolean | null;
          share_results_default?: boolean | null;
          theme?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "user_preferences_user_id_fkey";
            isOneToOne: true;
            referencedColumns: ["id"];
            referencedRelation: "users";
          },
        ];
        Row: {
          analytics_consent: boolean | null;
          created_at: null | string;
          data_deletion_requested_at: null | string;
          data_export_requested_at: null | string;
          email_frequency: null | string;
          id: string;
          language: null | string;
          marketing_consent: boolean | null;
          share_results_default: boolean | null;
          theme: null | string;
          updated_at: null | string;
          user_id: null | string;
        };
        Update: {
          analytics_consent?: boolean | null;
          created_at?: null | string;
          data_deletion_requested_at?: null | string;
          data_export_requested_at?: null | string;
          email_frequency?: null | string;
          id?: string;
          language?: null | string;
          marketing_consent?: boolean | null;
          share_results_default?: boolean | null;
          theme?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
        };
      };
      users: {
        Insert: {
          avatar_url?: null | string;
          created_at?: null | string;
          display_name?: null | string;
          email?: null | string;
          email_notifications?: boolean | null;
          id?: string;
          is_active?: boolean | null;
          is_premium?: boolean | null;
          last_login_at?: null | string;
          preferred_locale?: null | string;
          premium_expires_at?: null | string;
          push_notifications?: boolean | null;
          timezone?: null | string;
          updated_at?: null | string;
          username?: null | string;
        };
        Relationships: [];
        Row: {
          avatar_url: null | string;
          created_at: null | string;
          display_name: null | string;
          email: null | string;
          email_notifications: boolean | null;
          id: string;
          is_active: boolean | null;
          is_premium: boolean | null;
          last_login_at: null | string;
          preferred_locale: null | string;
          premium_expires_at: null | string;
          push_notifications: boolean | null;
          timezone: null | string;
          updated_at: null | string;
          username: null | string;
        };
        Update: {
          avatar_url?: null | string;
          created_at?: null | string;
          display_name?: null | string;
          email?: null | string;
          email_notifications?: boolean | null;
          id?: string;
          is_active?: boolean | null;
          is_premium?: boolean | null;
          last_login_at?: null | string;
          preferred_locale?: null | string;
          premium_expires_at?: null | string;
          push_notifications?: boolean | null;
          timezone?: null | string;
          updated_at?: null | string;
          username?: null | string;
        };
      };
    };
    Views: {
      test_result_aggregates: {
        Row: {
          average_score: null | string;
          last_updated: null | string;
          percentile_10: null | string;
          percentile_25: null | string;
          percentile_50: null | string;
          percentile_75: null | string;
          percentile_90: null | string;
          region: null | string;
          result_type: null | string;
          sample_size: null | number;
          standard_deviation: null | string;
          test_slug: null | string;
        };
      };
      test_result_enriched: {
        Row: {
          country_code: null | string;
          created_at: null | string;
          id: null | string;
          locale: null | string;
          overall_score: null | string;
          participant_key: null | string;
          region: null | string;
          result_type: null | string;
          session_id: null | string;
          test_id: null | string;
          test_slug: null | string;
          user_id: null | string;
        };
      };
      test_result_overview_stats: {
        Row: {
          distinct_regions: null | number;
          regional_distribution: Json | null;
          total_participants: null | number;
          total_results: null | number;
          total_tests: null | number;
        };
      };
    };
  };
};
export type DiscussionMembershipInsert =
  TablesMap["discussion_memberships"]["Insert"];
export type DiscussionMembershipRow =
  TablesMap["discussion_memberships"]["Row"];

export type DiscussionMembershipUpdate =
  TablesMap["discussion_memberships"]["Update"];
export type DiscussionMessageInsert =
  TablesMap["discussion_messages"]["Insert"];
export type DiscussionMessageRow = TablesMap["discussion_messages"]["Row"];

export type DiscussionMessageUpdate =
  TablesMap["discussion_messages"]["Update"];
export type DiscussionPresenceInsert =
  TablesMap["discussion_presence"]["Insert"];
export type DiscussionPresenceRow = TablesMap["discussion_presence"]["Row"];

export type DiscussionPresenceUpdate =
  TablesMap["discussion_presence"]["Update"];
export type DiscussionSpaceInsert = TablesMap["discussion_spaces"]["Insert"];
export type DiscussionSpaceRow = TablesMap["discussion_spaces"]["Row"];

export type DiscussionSpaceUpdate = TablesMap["discussion_spaces"]["Update"];
export type DiscussionTopicInsert = TablesMap["discussion_topics"]["Insert"];
export type DiscussionTopicRow = TablesMap["discussion_topics"]["Row"];

export type DiscussionTopicUpdate = TablesMap["discussion_topics"]["Update"];
export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };
export type PersonalityTest = TablesMap["personality_tests"]["Row"];

export type PersonalityTestInsert = TablesMap["personality_tests"]["Insert"];
export type PersonalityTestUpdate = TablesMap["personality_tests"]["Update"];
export type SharedResult = TablesMap["shared_results"]["Row"];

export type SharedResultEvent = TablesMap["shared_result_events"]["Row"];
export type SharedResultEventInsert =
  TablesMap["shared_result_events"]["Insert"];
export type SharedResultEventUpdate =
  TablesMap["shared_result_events"]["Update"];

export type SharedResultInsert = TablesMap["shared_results"]["Insert"];
export type SharedResultUpdate = TablesMap["shared_results"]["Update"];
export type TestCategory = TablesMap["test_categories"]["Row"];

export type TestCategoryInsert = TablesMap["test_categories"]["Insert"];
export type TestCategoryUpdate = TablesMap["test_categories"]["Update"];
export type TestResult = TablesMap["test_results"]["Row"];

export type TestResultAggregateRow = ViewsMap["test_result_aggregates"]["Row"];
export type TestResultEnrichedRow = ViewsMap["test_result_enriched"]["Row"];
export type TestResultInsert = TablesMap["test_results"]["Insert"];

export type TestResultOverviewStatsRow =
  ViewsMap["test_result_overview_stats"]["Row"];
export type TestResultUpdate = TablesMap["test_results"]["Update"];
export type UserFeedback = TablesMap["user_feedback"]["Row"];

export type UserFeedbackInsert = TablesMap["user_feedback"]["Insert"];
export type UserFeedbackUpdate = TablesMap["user_feedback"]["Update"];
export type UserPersonaProfile = TablesMap["user_persona_profiles"]["Row"];

export type UserPersonaProfileInsert =
  TablesMap["user_persona_profiles"]["Insert"];
export type UserPersonaProfileUpdate =
  TablesMap["user_persona_profiles"]["Update"];
export type UserPreferences = TablesMap["user_preferences"]["Row"];

export type UserPreferencesInsert = TablesMap["user_preferences"]["Insert"];
export type UserPreferencesUpdate = TablesMap["user_preferences"]["Update"];
// Type alias for convenience throughout the codebase
type TablesMap = Database["public"]["Tables"];

type ViewsMap = Database["public"]["Views"];

// Simplified type aliases - use TablesMap for consistency
