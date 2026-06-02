"use client";

import React, { useContext, useMemo } from "react";

import type {
  AssessmentResult,
  InsightCard,
  OntologyContextState,
  OntologyDomain,
  PageContext,
  Recommendation,
  RelevanceScore,
  UserProfile,
} from "@/lib/ontology/types";

interface UseOntologyReturn extends OntologyContextState {
  addAssessmentResult: (result: AssessmentResult) => void;
  dismissInsight: (insightId: string) => void;
  getAssessmentResult: (domain: OntologyDomain) => AssessmentResult | undefined;
  getCompletedDomains: () => OntologyDomain[];
  getCorrelationGraph: () => {
    edges: unknown[];
    nodes: {
      category: string;
      completed: boolean;
      displayName: string;
      id: OntologyDomain;
    }[];
  };
  getCorrelationsForDomain: (
    domain: OntologyDomain,
  ) => { description: string; domain: OntologyDomain; strength: number }[];
  getRelevanceScore: (domain: OntologyDomain) => number;
  getTopInsights: (limit?: number) => InsightCard[];
  getTopRecommendations: (limit?: number) => Recommendation[];
  handleScroll: (scrollDepth: number) => void;
  isDomainCompleted: (domain: OntologyDomain) => boolean;
  startPageTracking: () => void;
  stopPageTracking: () => void;
  updatePageContext: (context: Partial<PageContext>) => void;
  updateUserProfile: (profile: null | UserProfile) => void;
}

const emptyContext: UseOntologyReturn = {
  addAssessmentResult: () => {},
  completedAssessments: new Map(),
  currentPageContext: {
    referrer: "",
    route: "/",
    scrollDepth: 0,
    timeOnPage: 0,
  },
  dismissInsight: () => {},
  error: null,
  getAssessmentResult: () => undefined,
  getCompletedDomains: () => [],
  getCorrelationGraph: () => ({ edges: [], nodes: [] }),
  getCorrelationsForDomain: () => [],
  getRelevanceScore: () => 0,
  getTopInsights: () => [],
  getTopRecommendations: () => [],
  handleScroll: () => {},
  insights: [],
  isDomainCompleted: () => false,
  isLoading: false,
  recentResults: [],
  recommendations: [],
  relevanceScores: new Map(),
  startPageTracking: () => {},
  stopPageTracking: () => {},
  updatePageContext: () => {},
  updateUserProfile: () => {},
  userProfile: null,
};

const OntologyContext = React.createContext<null | UseOntologyReturn>(null);

export { OntologyContext };

export function useAssessmentResult(
  domain: OntologyDomain,
): AssessmentResult | undefined {
  return useOntologyContext().getAssessmentResult(domain);
}

export function useCompletedDomains(): OntologyDomain[] {
  return useOntologyContext().getCompletedDomains();
}

export function useCorrelationGraph() {
  return useOntologyContext().getCorrelationGraph();
}

export function useCorrelationsForDomain(domain: OntologyDomain) {
  return useOntologyContext().getCorrelationsForDomain(domain);
}

export function useDismissInsight() {
  return useOntologyContext().dismissInsight;
}

export function useIsDomainCompleted(domain: OntologyDomain): boolean {
  return useOntologyContext().isDomainCompleted(domain);
}

export function useOntologyContext(): UseOntologyReturn {
  const context = useContext(OntologyContext);
  if (!context) {
    return emptyContext;
  }
  return context;
}

export function usePageTracking() {
  const ctx = useOntologyContext();
  return {
    handleScroll: ctx.handleScroll,
    scrollDepth: ctx.currentPageContext.scrollDepth,
    startPageTracking: ctx.startPageTracking,
    stopPageTracking: ctx.stopPageTracking,
    updatePageContext: ctx.updatePageContext,
  };
}

export function useRelevanceScore(domain: OntologyDomain): number {
  return useOntologyContext().getRelevanceScore(domain);
}

export function useTopInsights(limit = 3): InsightCard[] {
  return useOntologyContext().getTopInsights(limit);
}

export function useTopRecommendations(limit = 5): Recommendation[] {
  return useOntologyContext().getTopRecommendations(limit);
}

export type { UseOntologyReturn };
