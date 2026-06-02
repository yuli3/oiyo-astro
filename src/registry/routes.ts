import { Locale } from "@/i18n";

export interface RouteMetadata {
  owner: RouteOwner;
  role: UXRole;
  tier: RouteTier;
}
/**
 * Route Metadata Definitions
 */
export type RouteOwner =
  | "Commerce"
  | "Core"
  | "Psychology"
  | "Saju"
  | "Social"
  | "System";
export type RouteTier = 1 | 2 | 3; // 1: Core, 2: Feature, 3: Experimental

export type UXRole =
  | "Assessment"
  | "Auth"
  | "Discovery"
  | "Results"
  | "Utility";

/**
 * ROUTES: A centralized registry for all application routes.
 *
 * FAANG-level Architecture Principle: SSOT (Single Source of Truth)
 * Each route is augmented with metadata for Governance & Observability.
 */
export const ROUTES = {
  // Account & User
  ACCOUNT: {
    ACHIEVEMENTS: {
      metadata: { owner: "Social", role: "Results", tier: 2 },
      path: (locale: Locale) => `/${locale}/achievements`,
    },
    DASHBOARD: {
      metadata: { owner: "Core", role: "Discovery", tier: 1 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
    PROFILE: {
      metadata: { owner: "Social", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/me`,
    },
    ROOT: {
      metadata: { owner: "Social", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/me`,
    },
    SETTINGS: {
      metadata: { owner: "System", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/settings`,
    },
  },

  // Admin
  ADMIN: {
    ROOT: {
      metadata: { owner: "System", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/admin`,
    },
    SUPPORT: {
      metadata: { owner: "System", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/admin/support`,
    },
  },
  CHANGELOG: {
    metadata: { owner: "Core", role: "Discovery", tier: 2 },
    path: (locale: Locale) => `/${locale}/changelog`,
  },
  CONTACT: {
    metadata: { owner: "System", role: "Utility", tier: 1 },
    path: (locale: Locale) => `/${locale}/contact`,
  },

  DECISION_MAKING: {
    ROOT: {
      metadata: { owner: "Psychology", role: "Discovery", tier: 2 },
      path: (locale: Locale) => `/${locale}/decision-making`,
    },
    TEST: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/decision-making/test`,
    },
  },

  EGENTETO: {
    ROOT: {
      metadata: { owner: "Psychology", role: "Discovery", tier: 2 },
      path: (locale: Locale) => `/${locale}/egenteto`,
    },
    TEST: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/egenteto/test`,
    },
  },

  // Base Routes
  HOME: {
    metadata: { owner: "Core", role: "Discovery", tier: 1 },
    path: (locale: Locale) => `/${locale}`,
  },

  INSIGHTS: {
    metadata: { owner: "Core", role: "Results", tier: 3 },
    path: (locale: Locale) => `/${locale}/insights`,
  },

  INTERACTIVE: {
    COMMUTE_WEATHER: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/commute-mental-weather/test`,
    },
    EMOTION_THERMOMETER: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/emotion-thermometer`,
    },
    ENNEAGRAM: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/enneagram/test`,
    },
    GRANDPARENT_CONNECTION: {
      metadata: { owner: "Social", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/grandparent-connection/test`,
    },
    TWIN_FINDER: {
      metadata: { owner: "Social", role: "Discovery", tier: 2 },
      path: (locale: Locale) => `/${locale}/twin-finder`,
    },
  },

  LEGAL: {
    PRIVACY: {
      metadata: { owner: "System", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/legal/privacy`,
    },
    REFUND_POLICY: {
      metadata: { owner: "System", role: "Utility", tier: 2 },
      path: (locale: Locale) => `/${locale}/legal/refund-policy`,
    },
    TERMS: {
      metadata: { owner: "System", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/legal/terms`,
    },
  },

  MARKETING: {
    ABOUT: {
      metadata: { owner: "Core", role: "Discovery", tier: 2 },
      path: (locale: Locale) => `/${locale}/about`,
    },
    FAQ: {
      metadata: { owner: "System", role: "Utility", tier: 2 },
      path: (locale: Locale) => `/${locale}/faq`,
    },
  },

  NOTIFICATIONS: {
    ROOT: {
      metadata: { owner: "System", role: "Utility", tier: 2 },
      path: (locale: Locale) => `/${locale}/notifications`,
    },
  },

  NUMEROLOGY: {
    TEST: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/numerology/test`,
    },
  },

  ONBOARDING: {
    metadata: { owner: "Core", role: "Assessment", tier: 1 },
    path: (locale: Locale) => `/${locale}/onboarding`,
  },

  // Core Domains
  ONTOLOGY: {
    DAILY_LUCKY: {
      metadata: { owner: "Saju", role: "Discovery", tier: 2 },
      path: (locale: Locale) => `/${locale}/daily`,
    },
    MBTI: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 1 },
      path: (locale: Locale) => `/${locale}/mbti/test`,
    },
    ROOT: {
      metadata: { owner: "Psychology", role: "Discovery", tier: 1 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
    SAJU: {
      metadata: { owner: "Saju", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
  },

  PREMIUM: {
    CHECKOUT: {
      metadata: { owner: "Commerce", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
    ROOT: {
      metadata: { owner: "Commerce", role: "Discovery", tier: 1 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
  },
  PRICING: {
    metadata: { owner: "Commerce", role: "Discovery", tier: 1 },
    path: (locale: Locale) => `/${locale}/pricing`,
  },
  PROGRESS: {
    metadata: { owner: "Core", role: "Discovery", tier: 2 },
    path: (locale: Locale) => `/${locale}/progress`,
  },
  RESONANCE: {
    COMMUNICATION: {
      metadata: { owner: "Social", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
    RESULT: {
      metadata: { owner: "Social", role: "Results", tier: 2 },
      path: (locale: Locale, _id: string) => `/${locale}/ontology`,
    },
    ROOT: {
      metadata: { owner: "Social", role: "Discovery", tier: 2 },
      path: (locale: Locale) => `/${locale}/ontology`,
    },
  },
  SETTINGS: {
    ROOT: {
      metadata: { owner: "System", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/settings`,
    },
    SUBSCRIPTION: {
      metadata: { owner: "Commerce", role: "Utility", tier: 1 },
      path: (locale: Locale) => `/${locale}/settings/subscription`,
    },
  },
  // Auth Routes
  SIGN_IN: {
    metadata: { owner: "System", role: "Auth", tier: 1 },
    path: (locale: Locale) => `/${locale}/sign-in`,
  },
  SIGN_UP: {
    metadata: { owner: "System", role: "Auth", tier: 1 },
    path: (locale: Locale) => `/${locale}/sign-up`,
  },
  // System & Support
  SUPPORT: {
    metadata: { owner: "System", role: "Utility", tier: 2 },
    path: (locale: Locale) => `/${locale}/support`,
  },

  SURVEYS: {
    EXTENDED_ZODIAC: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/extended-zodiac/analysis`,
    },
    TRIGGER_MAP: {
      metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
      path: (locale: Locale) => `/${locale}/wellness/emotion/trigger-map/test`,
    },
  },
  TCI: {
    metadata: { owner: "Psychology", role: "Assessment", tier: 2 },
    path: (locale: Locale) => `/${locale}/tci`,
  },
  TICKETS: {
    metadata: { owner: "System", role: "Utility", tier: 2 },
    path: (locale: Locale) => `/${locale}/support/my-tickets`,
  },
} as const;

/**
 * ROUTE_INDEX: Flat Index Layer (Read-only)
 *
 * Provides flat access to deeply nested routes for automation, QA, and Analytics.
 */
export const ROUTE_INDEX = {
  CHANGELOG: ROUTES.CHANGELOG,
  DAILY_LUCKY: ROUTES.ONTOLOGY.DAILY_LUCKY,
  DASHBOARD: ROUTES.ACCOUNT.DASHBOARD,
  HOME: ROUTES.HOME,
  MBTI_TEST: ROUTES.ONTOLOGY.MBTI,
  ONBOARDING: ROUTES.ONBOARDING,
  // RESONANCE_READINGS removed
  PRICING: ROUTES.PRICING,
  RESONANCE_ROOT: ROUTES.RESONANCE.ROOT,
  SAJU_MAIN: ROUTES.ONTOLOGY.SAJU,
  SETTINGS: ROUTES.SETTINGS.ROOT,
  SIGN_IN: ROUTES.SIGN_IN,
  SIGN_UP: ROUTES.SIGN_UP,
} as const;

/**
 * Type reflecting the structure of ROUTES
 */
export type AppRoutes = typeof ROUTES;

/**
 * Helper to get route with optional search params
 */
export const getRoute = (
  baseRoute: Locale,
  params?: Record<string, string>,
) => {
  if (!params) return baseRoute;
  const searchParams = new URLSearchParams(params);
  return `${baseRoute}?${searchParams.toString()}`;
};
