import type { PremiumFeatures, SubscriptionPlan } from "./types";

// Free tier features
export const FREE_FEATURES: PremiumFeatures = {
  advancedInsights: false,
  aiAnalysis: false,
  customReports: false,
  pdfExport: false,
  prioritySupport: false,
  testHistory: true, // Basic history for registered users
  unlimitedTests: true, // All basic tests remain free
};

// Premium tier features
export const PREMIUM_FEATURES: PremiumFeatures = {
  advancedInsights: true,
  aiAnalysis: true,
  customReports: true,
  pdfExport: true,
  prioritySupport: true,
  testHistory: true,
  unlimitedTests: true,
};

// Pro tier features (future expansion)
export const PRO_FEATURES: PremiumFeatures = {
  ...PREMIUM_FEATURES,
  // Additional features can be added here
};

// Korean market subscription plans (KRW)
export const KOREAN_PLANS: SubscriptionPlan[] = [
  {
    currency: "KRW",
    description: "planDetails.free.description",
    features: [
      "planDetails.free.features.unlimitedTests",
      "planDetails.free.features.resultStorage",
      "planDetails.free.features.basicSharing",
      "planDetails.free.features.communitySupport",
    ],
    id: "free-kr",
    name: "planDetails.free.name",
    price: {
      monthly: 0,
      yearly: 0,
    },
    tier: "free",
  },
  {
    currency: "KRW",
    description: "planDetails.premium.description",
    features: [
      "planDetails.premium.features.allFreeFeatures",
      "planDetails.premium.features.aiAnalysis",
      "planDetails.premium.features.pdfReports",
      "planDetails.premium.features.advancedCompatibility",
      "planDetails.premium.features.personalizedInsights",
      "planDetails.premium.features.prioritySupport",
      "planDetails.premium.features.customExport",
    ],
    id: "premium-kr",
    name: "planDetails.premium.name",
    popular: true,
    price: {
      monthly: 2000, // 2,000원/월
      yearly: 20000, // 20,000원/년
    },
    tier: "premium",
  },
];

// Japanese market subscription plans (JPY)
export const JAPANESE_PLANS: SubscriptionPlan[] = [
  {
    currency: "USD",
    description: "planDetails.free.description",
    features: [
      "planDetails.free.features.unlimitedTests",
      "planDetails.free.features.resultStorage",
      "planDetails.free.features.basicSharing",
      "planDetails.free.features.communitySupport",
    ],
    id: "free-jp",
    name: "planDetails.free.name",
    price: {
      monthly: 0,
      yearly: 0,
    },
    tier: "free",
  },
  {
    currency: "USD",
    description: "planDetails.premium.description",
    features: [
      "planDetails.premium.features.allFreeFeatures",
      "planDetails.premium.features.aiAnalysis",
      "planDetails.premium.features.pdfReports",
      "planDetails.premium.features.advancedCompatibility",
      "planDetails.premium.features.personalizedInsights",
      "planDetails.premium.features.prioritySupport",
      "planDetails.premium.features.customExport",
    ],
    id: "premium-jp",
    name: "planDetails.premium.name",
    popular: true,
    price: {
      monthly: 2, // $2/month (converted from 200 JPY approx for consistency)
      yearly: 20, // $20/year
    },
    tier: "premium",
  },
];

// International market subscription plans (USD)
export const INTERNATIONAL_PLANS: SubscriptionPlan[] = [
  {
    currency: "USD",
    description: "planDetails.free.description",
    features: [
      "planDetails.free.features.unlimitedTests",
      "planDetails.free.features.resultStorage",
      "planDetails.free.features.basicSharing",
      "planDetails.free.features.communitySupport",
    ],
    id: "free-intl",
    name: "planDetails.free.name",
    price: {
      monthly: 0,
      yearly: 0,
    },
    tier: "free",
  },
  {
    currency: "USD",
    description: "planDetails.premium.description",
    features: [
      "planDetails.premium.features.allFreeFeatures",
      "planDetails.premium.features.aiAnalysis",
      "planDetails.premium.features.pdfReports",
      "planDetails.premium.features.advancedCompatibility",
      "planDetails.premium.features.personalizedInsights",
      "planDetails.premium.features.prioritySupport",
      "planDetails.premium.features.customExport",
    ],
    id: "premium-intl",
    name: "planDetails.premium.name",
    popular: true,
    price: {
      monthly: 2, // $2/month
      yearly: 20, // $20/year
    },
    tier: "premium",
  },
];

// Helper function to get features for tier
export function getFeaturesForTier(tier: string): PremiumFeatures {
  switch (tier) {
    case "premium":
      return PREMIUM_FEATURES;
    case "pro":
      return PRO_FEATURES;
    default:
      return FREE_FEATURES;
  }
}

// Helper function to get plan by ID
export function getPlanById(
  planId: string,
  locale: string,
): SubscriptionPlan | undefined {
  const plans = getPlansForLocale(locale);
  return plans.find((plan) => plan.id === planId);
}

// Helper function to get plans based on locale
export function getPlansForLocale(locale: string): SubscriptionPlan[] {
  if (locale === "ko") return KOREAN_PLANS;
  if (locale === "ja") return JAPANESE_PLANS;
  return INTERNATIONAL_PLANS;
}

// Helper function to check if user has feature access
export function hasFeatureAccess(
  userFeatures: PremiumFeatures,
  feature: keyof PremiumFeatures,
): boolean {
  return userFeatures[feature] === true;
}
