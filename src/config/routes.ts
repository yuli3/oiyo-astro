import { FEATURE_REGISTRY } from "@/registry";
import { FeatureManifest } from "@/types/manifest";

/**
 * Helper to safely find a feature path or return root if not found.
 * This ensures strict adherence to the Registry.
 */
const getPath = (id: string, fallback: string = "/"): string => {
  const feature = FEATURE_REGISTRY.find((f) => f.id === id);
  return feature?.path || fallback;
};

export const APP_ROUTES = {
  // Core System Routes
  ACCOUNT: {
    DASHBOARD: "/account",
    PROFILE: "/account/profile",
    SETTINGS: "/account/settings",
  },
  ADMIN: {
    ROOT: "/admin",
    SUPPORT: "/admin/support",
  },
  // Helpers for dynamic routes
  DYNAMIC: {
    result: (base: string, id: string) => `${base}/result/${id}`,
    test: (base: string) => `${base}/test`,
  },
  HOME: "/",
  LEGAL: {
    PRIVACY: "/privacy",
    TERMS: "/terms",
  },
  MARKETING: {
    ABOUT: "/about",
    CONTACT: "/contact",
    FAQ: "/faq",
  },
  ONTOLOGY: {
    DAILY_LUCKY: getPath("daily-lucky", "/today"),
    MBTI: getPath("mbti", "/ontology/mbti"),
    ORIGIN: getPath("saju", "/ontology/saju"), // Saju is the Primal Origin
    ROOT: getPath("ontology", "/ontology"),
    SELF_SAJU: getPath("saju", "/ontology/saju"),
  },
  PREMIUM: {
    CHECKOUT: "/premium/checkout",
  },
  RESONANCE: {
    ROOT: getPath("resonance", "/resonance"),
    SACRED: getPath("sacred-resonance", "/resonance"),
  },
} as const;

export const ROUTES = {
  ...APP_ROUTES,
  // Semantic Aliases for Clarity in UI Components
  DAILY_LUCKY: APP_ROUTES.ONTOLOGY.DAILY_LUCKY,
  ORIGIN: APP_ROUTES.ONTOLOGY.ORIGIN,
  SACRED_RESONANCE: APP_ROUTES.RESONANCE.SACRED,
  SELF_SAJU: APP_ROUTES.ONTOLOGY.SELF_SAJU,
} as const;

export type AppRoute = typeof APP_ROUTES;
