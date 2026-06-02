import { supabase as supabaseClient } from "@/lib/system/supabase/client";
const supabase = supabaseClient as any;

export interface UserProfile {
  age?: number;
  colorTone?: string;
  enneagram?: string;
  isPremium?: boolean;
  lifeStage?: "20s" | "30s" | "40s+";
  mbti?: string;
  moneyType?: string;
  subscriptionStatus?: "active" | "expired" | "none";
  zodiac?: string;
}

export class UserPersistenceService {
  /**
   * Fetches the user profile from Supabase.
   */
  static async fetchProfile(userId: string): Promise<null | UserProfile> {
    if (!supabase) return null;

    const [{ data, error }, { data: userData }] = await Promise.all([
      supabase
        .from("user_persona_profiles")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase.from("users").select("is_premium").eq("id", userId).single(),
    ]);

    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        // PGRST116 is "No rows found"
        console.error("Error fetching profile from Supabase:", error);
      }
      return null;
    }

    return {
      age: (data.metadata as any)?.age,
      colorTone: (data.metadata as any)?.colorTone,
      enneagram: data.enneagram_type || undefined,
      isPremium: (userData as any)?.is_premium || false,
      lifeStage: (data.metadata as any)?.lifeStage,
      mbti: data.mbti_type || undefined,
      moneyType: data.spending_style || undefined,
      subscriptionStatus: (userData as any)?.is_premium ? "active" : "none",
      zodiac: data.zodiac_sign || undefined,
    };
  }

  /**
   * Syncs the user profile to Supabase.
   * Maps Zustand fields to the user_persona_profiles table.
   */
  static async syncProfile(userId: string, profile: UserProfile) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("user_persona_profiles")
      .upsert(
        {
          enneagram_type: profile.enneagram,
          mbti_type: profile.mbti,
          metadata: {
            age: profile.age,
            colorTone: profile.colorTone,
            lifeStage: profile.lifeStage,
          },
          spending_style: profile.moneyType, // Mapping moneyType to spending_style
          updated_at: new Date().toISOString(),
          user_id: userId,
          zodiac_sign: profile.zodiac,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Error syncing profile to Supabase:", error);
      return null;
    }

    return data;
  }
}
