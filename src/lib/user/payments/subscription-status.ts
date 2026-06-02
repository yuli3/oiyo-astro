import type { SubscriptionStatus } from "./types";

export interface SubscriptionRow {
  is_premium: boolean | null;
  preferred_locale: null | string;
  premium_expires_at: null | string;
}

export function buildSubscriptionStatus(
  row: null | SubscriptionRow,
): SubscriptionStatus {
  if (!row) {
    return {
      cancelAtPeriodEnd: false,
      isActive: false,
      planId: "free-intl",
      provider: "lemonsqueezy",
      tier: "free",
    };
  }

  const locale = resolveLocale(row.preferred_locale);
  const { freePlanId, premiumPlanId, provider } = resolvePlanIds(locale);
  const expiresAt = row.premium_expires_at
    ? new Date(row.premium_expires_at)
    : null;
  const now = new Date();

  const isActive =
    Boolean(row.is_premium) &&
    (!expiresAt || expiresAt.getTime() > now.getTime());

  return {
    cancelAtPeriodEnd: false,
    currentPeriodEnd: expiresAt ? expiresAt.toISOString() : undefined,
    isActive,
    planId: isActive ? premiumPlanId : freePlanId,
    provider,
    tier: isActive ? "premium" : "free",
  };
}

export function getDefaultSubscriptionStatus(): SubscriptionStatus {
  return buildSubscriptionStatus(null);
}

function resolveLocale(input: null | string | undefined): "en" | "ko" {
  return input === "ko" ? "ko" : "en";
}

function resolvePlanIds(locale: string) {
  const freePlanId = locale === "ko" ? "free-kr" : "free-intl";
  const premiumPlanId = locale === "ko" ? "premium-kr" : "premium-intl";
  const provider = locale === "ko" ? "toss" : "lemonsqueezy";

  return { freePlanId, premiumPlanId, provider } as const;
}
