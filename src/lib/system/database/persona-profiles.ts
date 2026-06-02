import type {
  ApiResponse,
  UserPersonaProfile,
  UserPersonaProfileInsert,
} from "@/types/database";

// Persona Profile storage helpers for personalized experiences
import {
  handleDatabaseError,
  supabase,
  supabaseAdmin,
} from "@/lib/system/supabase";

type PersonaProfilePayload = Omit<
  UserPersonaProfileInsert,
  "created_at" | "id" | "updated_at"
> & {
  session_id?: null | string;
  user_id?: null | string;
};

const PERSONA_FIELDS: Array<
  Exclude<
    keyof UserPersonaProfile,
    "created_at" | "id" | "session_id" | "updated_at" | "user_id"
  >
> = [
  "birth_city",
  "birth_time",
  "birthdate",
  "blood_type",
  "budget_focus",
  "career_interest_slugs",
  "chinese_zodiac",
  "dominant_love_language",
  "dream_roles",
  "enneagram_type",
  "financial_goals",
  "interests",
  "investment_profile",
  "mbti_type",
  "metadata",
  "romance_focus",
  "spending_style",
  "wellness_focus",
  "zodiac_sign",
];

export async function getPersonaProfileBySessionId(
  sessionId: string,
): Promise<ApiResponse<null | UserPersonaProfile>> {
  return fetchProfileByColumn("session_id", sessionId);
}

export async function getPersonaProfileByUserId(
  userId: string,
): Promise<ApiResponse<null | UserPersonaProfile>> {
  return fetchProfileByColumn("user_id", userId);
}

export async function mergePersonaProfileSession(
  sessionId: string,
  userId: string,
): Promise<ApiResponse<null | UserPersonaProfile>> {
  try {
    const client = requireSupabaseClient();
    const sessionProfileResponse =
      await getPersonaProfileBySessionId(sessionId);
    if (sessionProfileResponse.error) {
      return { error: sessionProfileResponse.error };
    }

    const sessionProfileNullable: null | UserPersonaProfile =
      sessionProfileResponse.data ?? null;
    if (!sessionProfileNullable) {
      return { data: null };
    }

    const userProfileResponse = await getPersonaProfileByUserId(userId);
    if (userProfileResponse.error) {
      return { error: userProfileResponse.error };
    }

    const existingUserProfile = userProfileResponse.data;
    const sessionProfile = sessionProfileNullable as UserPersonaProfile;

    const mergedEntries = PERSONA_FIELDS.reduce<Record<string, unknown>>(
      (acc, field) => {
        const existingValue = existingUserProfile?.[field];
        const incomingValue = sessionProfile[field];

        if (existingValue !== undefined && existingValue !== null) {
          acc[field] = existingValue;
        } else if (incomingValue !== undefined) {
          acc[field] = incomingValue;
        }

        return acc;
      },
      {},
    );

    const payload = filterUndefined({
      ...mergedEntries,
      session_id: null,
      updated_at: new Date().toISOString(),
      user_id: userId,
    });

    if (existingUserProfile) {
      // Update existing user profile with merged data

      const { data: updated, error: updateError } = await (client as any)
        .from("user_persona_profiles")
        .update(payload)
        .eq("id", existingUserProfile.id)
        .select()
        .single();

      if (updateError) {
        return { error: handleDatabaseError(updateError) };
      }

      // Clean up session profile now that data is merged
      const deleteClient = supabaseAdmin ?? client;

      await (deleteClient as any)
        .from("user_persona_profiles")
        .delete()
        .eq("id", sessionProfile.id);

      return { data: updated };
    }

    // Otherwise, repurpose the session row so the user keeps their answers

    const { data: reassigned, error: reassignError } = await (client as any)
      .from("user_persona_profiles")
      .update(payload)
      .eq("id", sessionProfile.id)
      .select()
      .single();

    if (reassignError) {
      return { error: handleDatabaseError(reassignError) };
    }

    return { data: reassigned };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function upsertPersonaProfile(
  payload: PersonaProfilePayload,
): Promise<ApiResponse<UserPersonaProfile>> {
  try {
    const client = requireSupabaseClient();

    const { session_id: sessionId, user_id: userId, ...rest } = payload;
    if (!userId && !sessionId) {
      throw new Error(
        "user_id or session_id is required to upsert a persona profile",
      );
    }

    const timestamp = new Date().toISOString();
    const values = filterUndefined({
      ...rest,
      session_id: sessionId ?? null,
      updated_at: timestamp,
      user_id: userId ?? null,
    });

    let existing: null | UserPersonaProfile = null;
    if (userId) {
      const existingResponse = await getPersonaProfileByUserId(userId);
      if (existingResponse.error) {
        return { error: existingResponse.error };
      }
      existing = existingResponse.data ?? null;
    } else if (sessionId) {
      const existingResponse = await getPersonaProfileBySessionId(sessionId);
      if (existingResponse.error) {
        return { error: existingResponse.error };
      }
      existing = existingResponse.data ?? null;
    }

    const supabaseClient = client as any;

    const operation = existing
      ? supabaseClient
          .from("user_persona_profiles")
          .update(values)
          .eq("id", existing.id)
          .select()
          .single()
      : supabaseClient
          .from("user_persona_profiles")
          .insert({
            ...values,
            created_at: timestamp,
          })
          .select()
          .single();

    const { data, error } = await operation;
    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

async function fetchProfileByColumn(
  column: "session_id" | "user_id",
  value: string,
): Promise<ApiResponse<null | UserPersonaProfile>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("user_persona_profiles")
      .select("*")
      .eq(column, value)
      .maybeSingle();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data ?? null };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

function filterUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}
