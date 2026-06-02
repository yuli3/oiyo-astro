/**
 * Premium Feature Access Control
 * Middleware to check if user has active premium subscription
 */

import { auth } from "@clerk/nextjs/server";

import type { PremiumFeature, PremiumUser } from "@/types/payment";

import { getTypedAdmin } from "@/lib/system/supabase";

export class PremiumAccessError extends Error {
  constructor(
    message: string,
    public feature?: PremiumFeature,
  ) {
    super(message);
    this.name = "PremiumAccessError";
  }
}

/**
 * Get days until premium expires
 */
export async function getDaysUntilExpiry(): Promise<null | number> {
  const premiumInfo = await getPremiumInfo();

  if (
    !premiumInfo ||
    !premiumInfo.is_premium ||
    !premiumInfo.premium_expires_at
  ) {
    return null;
  }

  const expiresAt = new Date(premiumInfo.premium_expires_at);
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Get user's premium information
 */
export async function getPremiumInfo(
  userId?: string,
): Promise<null | PremiumUser> {
  try {
    const clerkUserId = userId || (await auth()).userId;

    if (!clerkUserId) {
      return null;
    }

    const adminClient = getTypedAdmin();
    if (!adminClient) {
      return null;
    }

    const { data: user, error } = await adminClient
      .from("users")
      .select(
        "id, is_premium, premium_expires_at, premium_provider, premium_subscription_id",
      )
      .eq("clerk_id", clerkUserId)
      .maybeSingle();

    if (error || !user) {
      return null;
    }

    return user as unknown as PremiumUser;
  } catch (error) {
    console.error("[PremiumGuard] Error getting premium info:", error);
    return null;
  }
}

/**
 * Check if user has access to specific feature
 */
export async function hasFeatureAccess(
  _feature: PremiumFeature,
): Promise<boolean> {
  // For now, all premium features require premium subscription
  // In the future, you could implement feature-specific access control
  return await isPremiumUser();
}

/**
 * Check if user has active premium subscription
 */
export async function isPremiumUser(userId?: string): Promise<boolean> {
  try {
    const clerkUserId = userId || (await auth()).userId;

    if (!clerkUserId) {
      return false;
    }

    const adminClient = getTypedAdmin();
    if (!adminClient) {
      console.error("[PremiumGuard] Supabase not configured");
      return false;
    }

    // Get user from Supabase
    const { data: user, error } = await adminClient
      .from("users")
      .select("id, is_premium, premium_expires_at, premium_provider")
      .eq("clerk_id", clerkUserId)
      .maybeSingle();

    if (error || !user) {
      console.error("[PremiumGuard] User not found:", error);
      return false;
    }

    const typedUser = user as unknown as PremiumUser;

    // Check if premium is active
    if (!typedUser.is_premium) {
      return false;
    }

    // Check if premium has expired
    if (typedUser.premium_expires_at) {
      const expiresAt = new Date(typedUser.premium_expires_at);
      if (expiresAt < new Date()) {
        // Premium expired, update user status
        await adminClient
          .from("users")
          .update({ is_premium: false } as never)
          .eq("clerk_id", clerkUserId);

        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("[PremiumGuard] Error checking premium status:", error);
    return false;
  }
}

/**
 * Require premium subscription or throw error
 * Use this in API routes or server actions
 */
export async function requirePremium(feature?: PremiumFeature): Promise<void> {
  const hasPremium = await isPremiumUser();

  if (!hasPremium) {
    throw new PremiumAccessError(
      "Premium subscription required to access this feature",
      feature,
    );
  }
}

/**
 * Premium feature configuration
 */
export const PREMIUM_FEATURES: Record<
  PremiumFeature,
  { description: string; name: string }
> = {
  "advanced-analytics": {
    description: "Detailed insights and trend analysis of your test results",
    name: "Advanced Analytics",
  },
  "ai-insights": {
    description: "Personalized recommendations based on AI analysis",
    name: "AI-Powered Insights",
  },
  "custom-themes": {
    description: "Personalize your dashboard with custom color themes",
    name: "Custom Themes",
  },
  "data-export": {
    description: "Export all your data in CSV format",
    name: "Data Export",
  },
  "early-access": {
    description: "Be the first to try new features and tests",
    name: "Early Access",
  },
  "pdf-export": {
    description: "Download your test results as professionally formatted PDFs",
    name: "PDF Export",
  },
  "priority-support": {
    description: "24/7 email support with faster response times",
    name: "Priority Support",
  },
};

/**
 * Check if feature is premium-only
 */
export function isPremiumFeature(feature: PremiumFeature): boolean {
  return feature in PREMIUM_FEATURES;
}
