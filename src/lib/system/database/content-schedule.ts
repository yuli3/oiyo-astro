import type { ApiResponse, ContentSchedule } from "@/types/database";

// Content schedule access helpers for time-based experiences
import { handleDatabaseError, supabase } from "@/lib/system/supabase";

export interface ContentScheduleFilter {
  channel?: DeliveryChannel;
  contentType?: string;
  includeInactive?: boolean;
  limit?: number;
  locale?: string;
}

type DeliveryChannel = "app" | "email" | "push" | "webhook";

export async function getContentScheduleBySlug(
  slug: string,
): Promise<ApiResponse<ContentSchedule | null>> {
  try {
    const client = requireSupabaseClient();

    const { data, error } = await (client as any)
      .from("content_schedule")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data ?? null };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getNextContentSlot(
  contentType: string,
  options: { channel?: DeliveryChannel; locale?: string } = {},
): Promise<ApiResponse<ContentSchedule | null>> {
  try {
    const client = requireSupabaseClient();
    const now = new Date().toISOString();

    let query = (client as any)
      .from("content_schedule")
      .select("*")
      .eq("content_type", contentType)
      .eq("is_active", true);

    if (options.locale) {
      query = query.eq("locale", options.locale);
    }
    if (options.channel) {
      query = query.eq("delivery_channel", options.channel);
    }

    query = query
      .or(
        [
          `and(starts_at.is.null,ends_at.is.null)`,
          `and(starts_at.is.null,ends_at.gt.${now})`,
          `and(starts_at.lte.${now},ends_at.is.null)`,
          `and(starts_at.lte.${now},ends_at.gt.${now})`,
        ].join(","),
      )
      .order("send_time", { ascending: true, nullsFirst: true })
      .order("starts_at", { ascending: true, nullsFirst: true })
      .limit(1);

    const { data, error } = await query.maybeSingle();
    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data ?? null };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function listContentSchedule(
  filters: ContentScheduleFilter = {},
): Promise<ApiResponse<ContentSchedule[]>> {
  try {
    const client = requireSupabaseClient();
    const { channel, contentType, includeInactive, limit, locale } =
      sanitizeFilters(filters);

    let query = (client as any).from("content_schedule").select("*");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }
    if (contentType) {
      query = query.eq("content_type", contentType);
    }
    if (channel) {
      query = query.eq("delivery_channel", channel);
    }
    if (locale) {
      query = query.eq("locale", locale);
    }

    query = query
      .order("starts_at", { ascending: true, nullsFirst: false })
      .order("send_time", { ascending: true, nullsFirst: true })
      .limit(limit ?? 50);

    const { data, error } = await query;
    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data ?? [] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

function sanitizeFilters(
  filters: ContentScheduleFilter,
): ContentScheduleFilter {
  const copy: ContentScheduleFilter = {};
  if (filters.contentType) {
    copy.contentType = filters.contentType;
  }
  if (filters.locale) {
    copy.locale = filters.locale;
  }
  if (filters.channel) {
    copy.channel = filters.channel;
  }
  if (typeof filters.includeInactive === "boolean") {
    copy.includeInactive = filters.includeInactive;
  }
  if (typeof filters.limit === "number") {
    copy.limit = filters.limit;
  }
  return copy;
}
