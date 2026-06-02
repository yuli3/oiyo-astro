"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { FREE_FEATURES, getFeaturesForTier } from "@/lib/user/payments/plans";
import { SubscriptionStatus } from "@/lib/user/payments/types";

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  cancelAtPeriodEnd: false,
  isActive: false,
  planId: "free-intl",
  provider: "lemonsqueezy",
  tier: "free",
};

export interface PremiumAccess {
  canAccessAdvancedInsights: boolean;
  canCreateCustomReports: boolean;
  canExportPDF: boolean;
  canUseAIAnalysis: boolean;
  hasPrioritySupport: boolean;
  hasTestHistory: boolean;
  hasUnlimitedTests: boolean;
  isUpgradeNeeded: boolean;
  subscription: null | SubscriptionStatus;
}

interface SubscriptionHook {
  error: null | string;
  hasFeature: (feature: string) => boolean;
  isUpgradeNeeded: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  subscription: null | SubscriptionStatus;
}

interface UseSubscriptionOptions {
  autoFetch?: boolean;
}

// Hook for checking specific premium features
export function usePremiumAccess(): PremiumAccess {
  const { hasFeature, isUpgradeNeeded, subscription } = useSubscription();

  return {
    canAccessAdvancedInsights: hasFeature("advancedInsights"),
    canCreateCustomReports: hasFeature("customReports"),
    canExportPDF: hasFeature("pdfExport"),
    canUseAIAnalysis: hasFeature("aiAnalysis"),
    hasPrioritySupport: hasFeature("prioritySupport"),
    hasTestHistory: hasFeature("testHistory"),
    hasUnlimitedTests: hasFeature("unlimitedTests"),
    isUpgradeNeeded,
    subscription,
  };
}

export function useSubscription(
  options?: UseSubscriptionOptions,
): SubscriptionHook {
  const { isSignedIn, user } = useUser();
  const [subscription, setSubscription] = useState<null | SubscriptionStatus>(
    null,
  );
  const shouldAutoFetch = options?.autoFetch ?? true;
  const [loading, setLoading] = useState(shouldAutoFetch);
  const [error, setError] = useState<null | string>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/subscriptions/status", {
        cache: "no-store",
        method: "GET",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        subscription?: SubscriptionStatus;
        success?: boolean;
      };

      if (!response.ok || payload.success !== true || !payload.subscription) {
        throw new Error(payload.error ?? "Failed to load subscription status");
      }

      setSubscription(payload.subscription);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch subscription";
      setError(message);
      console.error("Error fetching subscription:", err);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!shouldAutoFetch) {
      // loading is initialised to `shouldAutoFetch`, so it is already false here.
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- invoking async useCallback for data fetching is correct
    fetchSubscription();
  }, [fetchSubscription, shouldAutoFetch]);

  const hasFeature = useCallback(
    (feature: string) => {
      if (!subscription) {
        return false;
      }

      const userFeatures =
        subscription.isActive && subscription.tier !== "free"
          ? getFeaturesForTier(subscription.tier)
          : FREE_FEATURES;

      return userFeatures[feature as keyof typeof userFeatures] === true;
    },
    [subscription],
  );

  const isUpgradeNeeded =
    !subscription?.isActive || subscription?.tier === "free";

  return {
    error,
    hasFeature,
    isUpgradeNeeded,
    loading,
    refreshSubscription: fetchSubscription,
    subscription,
  };
}

// Hook for subscription actions
export function useSubscriptionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const { refreshSubscription } = useSubscription({ autoFetch: false });

  const manageSubscription = useCallback(
    async (
      action: "cancel" | "resume" | "upgrade",
      body: Record<string, unknown> = {},
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/subscriptions/manage", {
          body: JSON.stringify({ action, ...body }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          subscription?: SubscriptionStatus;
          success?: boolean;
        };

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Failed to update subscription");
        }

        await refreshSubscription();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update subscription";
        setError(message);
        console.error("Subscription action error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshSubscription],
  );

  const upgradeSubscription = useCallback(
    async (planId: string) => manageSubscription("upgrade", { planId }),
    [manageSubscription],
  );

  const cancelSubscription = useCallback(
    async () => manageSubscription("cancel"),
    [manageSubscription],
  );

  const resumeSubscription = useCallback(
    async () => manageSubscription("resume"),
    [manageSubscription],
  );

  return {
    cancelSubscription,
    error,
    loading,
    resumeSubscription,
    upgradeSubscription,
  };
}
