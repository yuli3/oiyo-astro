export interface Database {
  public: {
    Enums: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Tables: {
      analytics_events: {
        Insert: {
          created_at?: null | string;
          event_data?: Json;
          event_type: string;
          id?: string;
          session_id?: null | string;
          user_id?: null | string;
        };
        Row: {
          created_at: null | string;
          event_data: Json;
          event_type: string;
          id: string;
          session_id: null | string;
          user_id: null | string;
        };
        Update: {
          created_at?: null | string;
          event_data?: Json;
          event_type?: string;
          id?: string;
          session_id?: null | string;
          user_id?: null | string;
        };
      };
      profiles: {
        Insert: {
          avatar_url?: null | string;
          full_name?: null | string;
          id: string;
          updated_at?: null | string;
          username?: null | string;
          website?: null | string;
        };
        Row: {
          avatar_url: null | string;
          full_name: null | string;
          id: string;
          updated_at: null | string;
          username: null | string;
          website: null | string;
        };
        Update: {
          avatar_url?: null | string;
          full_name?: null | string;
          id?: string;
          updated_at?: null | string;
          username?: null | string;
          website?: null | string;
        };
      };
      user_feedback: {
        Insert: {
          comment?: null | string;
          created_at?: null | string;
          id?: string;
          rating?: null | number;
          user_id?: null | string;
        };
        Row: {
          comment: null | string;
          created_at: null | string;
          id: string;
          rating: null | number;
          user_id: null | string;
        };
        Update: {
          comment?: null | string;
          created_at?: null | string;
          id?: string;
          rating?: null | number;
          user_id?: null | string;
        };
      };
      user_persona_profiles: {
        Insert: {
          enneagram_type?: null | string;
          id?: string;
          mbti_type?: null | string;
          metadata?: Json;
          spending_style?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
          zodiac_sign?: null | string;
        };
        Row: {
          enneagram_type: null | string;
          id: string;
          mbti_type: null | string;
          metadata: Json;
          spending_style: null | string;
          updated_at: null | string;
          user_id: null | string;
          zodiac_sign: null | string;
        };
        Update: {
          enneagram_type?: null | string;
          id?: string;
          mbti_type?: null | string;
          metadata?: Json;
          spending_style?: null | string;
          updated_at?: null | string;
          user_id?: null | string;
          zodiac_sign?: null | string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
  };
}

export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };
