import type {
  ApiResponse,
  Json,
  SharedResult,
  SharedResultEvent,
  SharedResultEventInsert,
} from "@/types/database";

// Share tracking helpers for result distribution analytics
import { handleDatabaseError, supabase } from "@/lib/system/supabase";

export interface RecordShareEventInput {
  locale?: string;
  metadata?: Record<string, unknown>;
  resultId: string;
  sessionId?: string;
  sharedResultId?: string;
  shareMethod: ShareMethod;
  sharePlatform?: string;
  userId?: string;
}

export interface ShareEventQueryOptions {
  limit?: number;
  resultId: string;
}

type ShareMethod =
  | "download"
  | "image"
  | "link"
  | "pdf"
  | "social"
  | "webshare";

export async function listShareEventsForResult(
  options: ShareEventQueryOptions,
): Promise<ApiResponse<SharedResultEvent[]>> {
  try {
    const client = requireSupabaseClient();
    const { limit, resultId } = options;

    const { data, error } = await (client as any)
      .from("shared_result_events")
      .select("*")
      .eq("result_id", resultId)
      .order("shared_at", { ascending: false })
      .limit(limit ?? 25);

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data ?? [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function recordShareEvent(
  input: RecordShareEventInput,
): Promise<ApiResponse<SharedResultEvent>> {
  try {
    const client = requireSupabaseClient();
    if (!input.userId && !input.sessionId) {
      throw new Error(
        "userId or sessionId is required to record a share event",
      );
    }

    const timestamp = new Date().toISOString();
    const metadata = input.metadata ? (input.metadata as Json) : null;
    const payload: SharedResultEventInsert = {
      locale: input.locale ?? null,
      metadata,
      result_id: input.resultId,
      session_id: input.sessionId ?? null,
      share_method: input.shareMethod,
      share_platform: input.sharePlatform ?? null,
      shared_at: timestamp,
      shared_result_id: input.sharedResultId ?? null,
      user_id: input.userId ?? null,
    };

    const { data, error } = await (client as any)
      .from("shared_result_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    if (input.sharedResultId) {
      await updateSharedResultAggregate(input.sharedResultId, {
        last_shared_at: timestamp,
        metadata,
        share_method: input.shareMethod,
        share_platform: input.sharePlatform ?? null,
      });
    }

    return { data };
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

async function updateSharedResultAggregate(
  sharedResultId: string,
  payload: Partial<
    Pick<
      SharedResult,
      "last_shared_at" | "metadata" | "share_method" | "share_platform"
    >
  >,
) {
  const client = requireSupabaseClient();
  const updatePayload = filterUndefined(payload as Record<string, unknown>);

  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  await (client as any)
    .from("shared_results")
    .update(updatePayload)
    .eq("id", sharedResultId);
}
