import type { SubscriptionStatus } from "@/lib/user/payments/types";

import { getSupabaseAdminClientTyped } from "@/lib/system/supabase";
import { buildSubscriptionStatus } from "@/lib/user/payments/subscription-status";

export async function getUserSubscription(
  userId: string,
): Promise<SubscriptionStatus> {
  const supabase = getSupabaseAdminClientTyped();

  if (!userId || !supabase) {
    return buildSubscriptionStatus(null);
  }

  const { data, error } = await (supabase.from("users") as any)
    .select("is_premium, preferred_locale, premium_expires_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    if (error) console.error("Error fetching user subscription:", error);
    return buildSubscriptionStatus(null);
  }

  const typedData = data as {
    is_premium: boolean | null;
    preferred_locale: null | string;
    premium_expires_at: null | string;
  };

  return buildSubscriptionStatus({
    is_premium: typedData.is_premium,
    preferred_locale: typedData.preferred_locale,
    premium_expires_at: typedData.premium_expires_at,
  });
}
