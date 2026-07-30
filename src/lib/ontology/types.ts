import type { UniversalProfile } from "@/lib/ontology/engine/types";
import type { Locale } from "@/types/manifest";
export interface AssessmentResult {
  completedAt: number;
  data: Record<string, unknown>;
  domain: OntologyDomain;
  id: string;
  premium: boolean;
  score?: number;
}
export type { Locale };
import type { Big5Result } from "@/lib/big5/types";
import type { SajuResult } from "@/lib/ontology/saju/types";
import type { TCIResult } from "@/lib/tci/types";

export interface ContextManagerConfig {
  cacheTimeout: number;
  enableAnalytics: boolean;
  enableInsights: boolean;
  enableRecommendations: boolean;
  recalculateOnEvents: (
    | "assessment_complete"
    | "page_view"
    | "preference_change"
  )[];
}
export interface ContextualInsightConfig {
  animationStyle: "fade" | "none" | "scale" | "slide";
  maxInsights: number;
  position: "banner" | "inline" | "modal" | "sidebar" | "toast";
  showDismissButton: boolean;
  triggerEvents: (
    | "assessment_complete"
    | "page_view"
    | "result_view"
    | "scroll"
    | "time_spent"
  )[];
}

import type { HSPResult } from "@/lib/ontology/hsp/types";
import type { PerfectionismResult } from "@/lib/ontology/perfectionism/types";

export interface CorrelationEdge {
  description: string;
  source: OntologyDomain;
  target: OntologyDomain;
  weight: number;
}

export interface CorrelationGraph {
  edges: CorrelationEdge[];
  nodes: CorrelationNode[];
}

export interface CorrelationNode {
  category: string;
  completed: boolean;
  displayName: string;
  id: OntologyDomain;
  score?: number;
}

import type { HEXACOResult } from "@/lib/ontology/hexaco/types";

export interface InsightAction {
  label: string;
  primary: boolean;
  url: string;
}

export interface InsightCard {
  actionLabel?: string;
  actionUrl?: string;
  content: string;
  dismissible: boolean;
  domain?: OntologyDomain;
  expiresAt?: number;
  id: string;
  premium: boolean;
  relevanceScore: number;
  title: string;
  type: "achievement" | "alert" | "correlation" | "suggestion" | "tip";
}

export type LocalizedText<T = string> = { [key: string]: T | undefined } & {
  [key in Locale]?: T;
};

export interface MBTIResult {
  scores?: Record<string, number>;
  type: MBTIType;
}

// ============================================================================
// NEW TYPES FOR CONTEXTUAL ONTOLOGY INTEGRATION
// ============================================================================

import type { EnneagramResult } from "@/lib/ontology/enneagram-core/engine";
import type { RiasecResult } from "@/lib/ontology/riasec/types";

export type MBTIType = string; // Placeholder

export interface OntologyBranches {
  enneagram?: EnneagramResult;
  isComplete: boolean;
  mbti?: MBTIResult;
  psychology?: PsychologicalProfile;
  riasec?: RiasecResult;
  socialStyle?: string;
}

export interface OntologyContextState {
  completedAssessments: Map<OntologyDomain, AssessmentResult>;
  currentPageContext: PageContext;
  error: null | string;
  insights: InsightCard[];
  isLoading: boolean;
  recentResults: AssessmentResult[];
  recommendations: Recommendation[];
  relevanceScores: Map<OntologyDomain, RelevanceScore>;
  userProfile: null | UserProfile;
}

export type OntologyDomain =
  | "abundance"
  | "balance"
  | "big5"
  | "cognitive-bias"
  | "color-personality"
  | "consumption"
  | "country"
  | "decision-making"
  | "egenteto"
  | "enneagram"
  | "hexaco"
  | "hsp"
  | "learning-style"
  | "mbti"
  | "numerology"
  | "perfectionism"
  | "prosperity"
  | "resilience"
  | "riasec"
  | "saju"
  | "tci"
  | "traits.animal"
  | "traits.art-style"
  | "traits.blood-type"
  | "traits.conflict-response-style"
  | "traits.food-personality"
  | "traits.friendship-style"
  | "traits.learning-style"
  | "traits.music-taste"
  | "traits.sns-personality"
  | "value-harmonizer"
  | "vitality";

export interface OntologyProfile {
  branches: OntologyBranches;
  lastUpdated: number;

  // The Tree Structure
  roots: OntologyRoots;
  // The Unified Truth
  synthesis: OntologySynthesis;

  userId?: string;
}

export interface OntologyRoots {
  isComplete: boolean;
  universal?: UniversalProfile;
}

export type OntologyStatus =
  | "blooming"
  | "complete"
  | "empty"
  | "partial_branches"
  | "partial_roots"
  | "seedling";

export interface OntologySynthesis {
  coreAura: string;
  destinyPath: string;
  paradox?: string;
  summary: string;
}

export interface PageContext {
  locale?: Locale;
  referrer: string;
  route: string;
  scrollDepth: number;
  timeOnPage: number;
  userAgent?: string;
}

export interface PsychologicalProfile {
  hexaco?: HEXACOResult;
  hsp?: HSPResult;
  loveLanguage?: string;
  ocean?: Big5Result;
  perfectionism?: PerfectionismResult;
  tci?: TCIResult;
  traits: {
    perfectionism: number;
    sensitivity: number;
  };
}

export interface Recommendation {
  actionLabel?: string;
  actionUrl?: string;
  correlationIds?: string[];
  description: string;
  domain: OntologyDomain;
  estimatedTime: number;
  icon?: string;
  id: string;
  premium: boolean;
  reasons: string[];
  relevanceScore: number;
  title: string;
}

export interface RecommendationPanelConfig {
  filterByPremium?: boolean;
  layout: "cards" | "grid" | "list";
  maxItems: number;
  showReasons: boolean;
  showRelevanceScores: boolean;
  title: string;
}

export interface RelevanceScore {
  domain: OntologyDomain;
  reasons: string[];
  score: number;
  suggestedActions: string[];
  trend: "decreasing" | "increasing" | "stable";
}

export interface SmartLinkProps {
  contextHints?: OntologyDomain[];
  displayText?: string;
  premium?: boolean;
  showRelevanceBadge?: boolean;
  targetRoute: string | { metadata?: any; path: (locale: string) => string };
  trackAsConversion?: boolean;
}

export interface SynthesisParams {
  branches: OntologyBranches;
  roots: OntologyRoots;
}

export interface UserPreferences {
  hiddenDomains: OntologyDomain[];
  hobbies?: string[];
  notificationPreferences: {
    assessmentReminders: boolean;
    dailyInsight: boolean;
    resultNotifications: boolean;
  };
  preferredDomains: OntologyDomain[];
  privacyLevel: "moderate" | "open" | "strict";
}

export interface UserProfile {
  avatar?: string;
  createdAt: number;
  email?: string;
  id: string;
  lastActiveAt: number;
  locale: Locale;
  name?: string;
  preferences: UserPreferences;
  subscriptionTier: "enterprise" | "free" | "premium";
}
