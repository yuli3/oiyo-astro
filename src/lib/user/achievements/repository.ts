import type { SupabaseClient as SupabaseJsClient } from "@supabase/supabase-js";

import type {
  AchievementBadgeInsert,
  AchievementBadgeRow,
  AchievementDefinition,
  AchievementProgressInsert,
  AchievementProgressRow,
  AchievementProgressUpdate,
  AchievementXpLedgerInsert,
  AchievementXpLedgerRow,
  Database,
} from "@/types/database";

import { supabase, supabaseAdmin } from "@/lib/system/supabase";

import { ACHIEVEMENTS } from "./data";
import { AchievementType, BadgeTier } from "./types";

export interface AchievementIdentity {
  sessionId?: string;
  userId?: string;
}

type ServiceClient = SupabaseJsClient<Database>;

export async function ensureBadge(
  ontology: AchievementIdentity,
  badgeSlug: string,
  achievementId: null | string,
): Promise<void> {
  const client = getServiceClient();
  if (!client) {
    return;
  }

  let query = client
    .from("achievement_badges")
    .select("id")
    .eq("badge_slug", badgeSlug)
    .limit(1);

  if (ontology.userId) {
    query = query.eq("user_id", ontology.userId);
  } else if (ontology.sessionId) {
    query = query.eq("session_id", ontology.sessionId);
  } else {
    return;
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error(
      "[AchievementRepository] Failed to check badge ownership:",
      error,
    );
    return;
  }

  if (data) {
    return;
  }

  const insertPayload: AchievementBadgeInsert = {
    badge_slug: badgeSlug,
    earned_via_achievement: achievementId ?? null,
    is_equipped: false,
    metadata: null,
    session_id: ontology.sessionId ?? null,
    user_id: ontology.userId ?? null,
  };

  const { error: insertError } = await (
    client.from("achievement_badges") as unknown as {
      insert: (record: AchievementBadgeInsert) => Promise<{ error: unknown }>;
    }
  ).insert(insertPayload as AchievementBadgeInsert);

  if (insertError) {
    console.error(
      "[AchievementRepository] Failed to insert badge:",
      insertError,
    );
  }
}

export async function fetchAchievementBadges(
  ontology: AchievementIdentity,
): Promise<AchievementBadgeRow[]> {
  const client = getServiceClient();
  if (!client) {
    return [];
  }

  let query = client.from("achievement_badges").select("*");

  if (ontology.userId) {
    query = query.eq("user_id", ontology.userId);
  } else if (ontology.sessionId) {
    query = query.eq("session_id", ontology.sessionId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AchievementRepository] Failed to load badges:", error);
    return [];
  }

  return (data ?? []) as AchievementBadgeRow[];
}

export async function fetchAchievementDefinitions(): Promise<
  AchievementDefinition[]
> {
  const client = getServiceClient();
  if (!client) {
    return mapStaticAchievementToDefinition();
  }

  const { data, error } = await client
    .from("achievement_definitions")
    .select("*")
    .order("base_points", { ascending: true });

  if (error || !data) {
    console.error(
      "[AchievementRepository] Failed to load definitions, falling back to static data.",
      error,
    );
    return mapStaticAchievementToDefinition();
  }

  return data as AchievementDefinition[];
}

export async function fetchAchievementProgress(
  ontology: AchievementIdentity,
): Promise<AchievementProgressRow[]> {
  const client = getServiceClient();
  if (!client) {
    return [];
  }

  let query = client
    .from("achievement_progress")
    .select("*")
    .order("updated_at", { ascending: false });

  if (ontology.userId) {
    query = query.eq("user_id", ontology.userId);
  } else if (ontology.sessionId) {
    query = query.eq("session_id", ontology.sessionId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AchievementRepository] Failed to load progress:", error);
    return [];
  }

  return (data ?? []) as AchievementProgressRow[];
}

export async function fetchXpLedger(
  ontology: AchievementIdentity,
): Promise<AchievementXpLedgerRow[]> {
  const client = getServiceClient();
  if (!client) {
    return [];
  }

  let query = client
    .from("achievement_xp_ledger")
    .select("*")
    .order("created_at", { ascending: false });

  if (ontology.userId) {
    query = query.eq("user_id", ontology.userId);
  } else if (ontology.sessionId) {
    query = query.eq("session_id", ontology.sessionId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AchievementRepository] Failed to load XP ledger:", error);
    return [];
  }

  return (data ?? []) as AchievementXpLedgerRow[];
}

export async function insertXpTransaction(
  ontology: AchievementIdentity,
  payload: Omit<AchievementXpLedgerRow, "created_at" | "id">,
): Promise<void> {
  const client = getServiceClient();
  if (!client) {
    return;
  }

  const record: AchievementXpLedgerInsert = {
    achievement_id: payload.achievement_id ?? null,
    multiplier_breakdown: payload.multiplier_breakdown ?? null,
    points: payload.points,
    session_id: ontology.sessionId ?? null,
    source: payload.source,
    source_id: payload.source_id ?? null,
    user_id: ontology.userId ?? null,
  };

  const { error } = await (
    client.from("achievement_xp_ledger") as unknown as {
      insert: (
        record: AchievementXpLedgerInsert,
      ) => Promise<{ error: unknown }>;
    }
  ).insert(record as AchievementXpLedgerInsert);
  if (error) {
    console.error(
      "[AchievementRepository] Failed to insert XP transaction:",
      error,
    );
  }
}

export function isAchievementStorageEnabled(): boolean {
  return Boolean(getServiceClient());
}

export async function markNotificationsAsSent(
  ontology: AchievementIdentity,
  achievementIds: string[],
): Promise<void> {
  const client = getServiceClient();
  if (!client || achievementIds.length === 0) {
    return;
  }

  const baseQuery = client.from("achievement_progress") as unknown as {
    update: (data: { notification_sent: boolean }) => {
      eq: (
        column: string,
        value: boolean | string,
      ) => {
        in: (
          column: string,
          values: string[],
        ) => {
          eq: (column: string, value: string) => Promise<{ error: unknown }>;
        };
      };
    };
  };

  const queryBuilder = baseQuery
    .update({ notification_sent: true })
    .eq("notification_sent", false)
    .in("achievement_id", achievementIds);

  let finalQuery;
  if (ontology.userId) {
    finalQuery = queryBuilder.eq("user_id", ontology.userId);
  } else if (ontology.sessionId) {
    finalQuery = queryBuilder.eq("session_id", ontology.sessionId);
  } else {
    return;
  }

  const { error } = await finalQuery;
  if (error) {
    console.error(
      "[AchievementRepository] Failed to mark notifications as sent:",
      error,
    );
  }
}

export function toBadgeTier(
  rarity: AchievementDefinition["rarity"],
): BadgeTier {
  switch (rarity) {
    case "bronze":
      return BadgeTier.BRONZE;
    case "gold":
      return BadgeTier.GOLD;
    case "silver":
      return BadgeTier.SILVER;
    case "legendary":
    case "platinum":
    default:
      return BadgeTier.PLATINUM;
  }
}

export async function upsertAchievementProgress(
  ontology: AchievementIdentity,
  payload: Partial<AchievementProgressRow> &
    Pick<AchievementProgressInsert, "achievement_id">,
): Promise<AchievementProgressRow | null> {
  const client = getServiceClient();
  if (!client) {
    return null;
  }

  const record: AchievementProgressInsert = {
    achievement_id: payload.achievement_id,
    notification_sent: payload.notification_sent ?? false,
    progress_metadata: payload.progress_metadata ?? null,
    progress_value: payload.progress_value ?? 0,
    session_id: ontology.sessionId ?? null,
    unlocked: payload.unlocked ?? false,
    unlocked_at: payload.unlocked_at ?? null,
    user_id: ontology.userId ?? null,
  };

  if (!payload.achievement_id) {
    throw new Error(
      "[AchievementRepository] achievement_id is required for upsert",
    );
  }

  const existing = await fetchSingleProgress(ontology, payload.achievement_id);
  const table = client.from("achievement_progress");

  if (existing) {
    const { data, error } = await (
      table as unknown as {
        update: (record: AchievementProgressUpdate) => {
          eq: (
            column: string,
            value: unknown,
          ) => {
            select: () => {
              single: () => Promise<{
                data: AchievementProgressRow | null;
                error: unknown;
              }>;
            };
          };
        };
      }
    )
      .update(record as AchievementProgressUpdate)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error(
        "[AchievementRepository] Failed to update achievement progress:",
        error,
      );
      return null;
    }

    return data as AchievementProgressRow;
  }

  const { data, error } = await (
    table as unknown as {
      insert: (record: AchievementProgressInsert) => {
        select: () => {
          single: () => Promise<{
            data: AchievementProgressRow | null;
            error: unknown;
          }>;
        };
      };
    }
  )
    .insert(record as AchievementProgressInsert)
    .select()
    .single();

  if (error) {
    console.error(
      "[AchievementRepository] Failed to insert achievement progress:",
      error,
    );
    return null;
  }

  return data as AchievementProgressRow;
}

function camelize(input: string): string {
  return input.replace(/[-_](\w)/g, (_, char: string) => char.toUpperCase());
}

async function fetchSingleProgress(
  ontology: AchievementIdentity,
  achievementId: string,
): Promise<AchievementProgressRow | null> {
  const client = getServiceClient();
  if (!client) {
    return null;
  }

  let query = client
    .from("achievement_progress")
    .select("*")
    .eq("achievement_id", achievementId)
    .limit(1);

  if (ontology.userId) {
    query = query.eq("user_id", ontology.userId);
  } else if (ontology.sessionId) {
    query = query.eq("session_id", ontology.sessionId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error(
      "[AchievementRepository] Failed to fetch single progress:",
      error,
    );
    return null;
  }

  return (data ?? null) as AchievementProgressRow | null;
}

function getServiceClient(): null | ServiceClient {
  if (supabaseAdmin) {
    return supabaseAdmin as unknown as ServiceClient;
  }

  if (supabase) {
    return supabase as unknown as ServiceClient;
  }

  return null;
}

function mapAchievementRequirementToType(
  requirementType: string,
): AchievementDefinition["type"] {
  switch (requirementType) {
    case "category_completion":
    case "count":
    case "specific_test":
      return "threshold";
    case "streak":
      return "streak";
    default:
      return "event_count";
  }
}

function mapAchievementTypeToCategory(
  type: AchievementType,
): AchievementDefinition["category"] {
  switch (type) {
    case AchievementType.SOCIAL:
      return "social_connection";
    case AchievementType.SPECIAL:
      return "insight_discovery";
    case AchievementType.STREAK:
      return "streak_achievement";
    case AchievementType.TEST_COMPLETION:
      return "test_completion";
    case AchievementType.EXPLORATION:
    default:
      return "community_engagement";
  }
}

function mapStaticAchievementToDefinition(): AchievementDefinition[] {
  return ACHIEVEMENTS.map((definition) => ({
    base_points: definition.reward.points ?? 50,
    category: mapAchievementTypeToCategory(definition.type),
    created_at: new Date(0).toISOString(),
    cta_key: `achievements.${camelize(definition.id)}.cta`,
    description_key: `achievements.${camelize(definition.id)}.description`,
    icon: definition.icon,
    id: definition.id,
    is_repeatable:
      definition.type === AchievementType.STREAK ||
      definition.type === AchievementType.SOCIAL,
    rarity: rarityFromTier(definition.tier),
    requirements: {
      condition: definition.requirement.condition,
      target: definition.requirement.target,
      type: definition.requirement.type,
    },
    slug: definition.id,
    title_key: `achievements.${camelize(definition.id)}.title`,
    type: mapAchievementRequirementToType(definition.requirement.type),
    updated_at: new Date(0).toISOString(),
  }));
}

function rarityFromTier(tier: BadgeTier): AchievementDefinition["rarity"] {
  switch (tier) {
    case BadgeTier.BRONZE:
      return "bronze";
    case BadgeTier.GOLD:
      return "gold";
    case BadgeTier.SILVER:
      return "silver";
    case BadgeTier.PLATINUM:
    default:
      return "platinum";
  }
}
