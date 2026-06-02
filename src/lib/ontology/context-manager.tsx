import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  AssessmentResult,
  CorrelationGraph,
  InsightCard,
  OntologyContextState,
  OntologyDomain,
  PageContext,
  Recommendation,
  UserProfile,
} from "./types";

import { relevanceEngine } from "./relevance-engine";

const DEFAULT_CONFIG = {
  cacheTimeout: 5 * 60 * 1000,
  enableAnalytics: true,
  enableInsights: true,
  enableRecommendations: true,
  recalculateOnEvents: [
    "assessment_complete",
    "page_view",
    "preference_change",
  ] as const,
};

interface UseOntologyReturn extends OntologyContextState {
  addAssessmentResult: (result: AssessmentResult) => void;
  dismissInsight: (insightId: string) => void;
  getAssessmentResult: (domain: OntologyDomain) => AssessmentResult | undefined;
  getCompletedDomains: () => OntologyDomain[];
  getCorrelationGraph: () => CorrelationGraph;
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

const OntologyContextAPI = createContext<null | UseOntologyReturn>(null);

export function OntologyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OntologyContextState>(() => ({
    completedAssessments: new Map(),
    currentPageContext: {
      referrer: "",
      route: "/",
      scrollDepth: 0,
      timeOnPage: 0,
    },
    error: null,
    insights: [],
    isLoading: false,
    recentResults: [],
    recommendations: [],
    relevanceScores: new Map(),
    userProfile: null,
  }));

  const pageTimer = useRef<null | ReturnType<typeof setInterval>>(null);
  const scrollThrottle = useRef(false);
  const configRef = useRef(DEFAULT_CONFIG);

  const findCorrelations = useCallback(
    (
      domain: OntologyDomain,
    ): { description: string; domain: OntologyDomain; strength: number }[] => {
      const correlations: Record<
        string,
        { description: string; domain: OntologyDomain; strength: number }[]
      > = {
        big5: [
          {
            description: "Overlapping constructs",
            domain: "mbti",
            strength: 0.85,
          },
          { description: "Extended model", domain: "hexaco", strength: 0.8 },
        ],
        enneagram: [
          {
            description: "Complementary frameworks",
            domain: "mbti",
            strength: 0.9,
          },
        ],
        mbti: [
          {
            description: "Both explore personality",
            domain: "enneagram",
            strength: 0.9,
          },
          {
            description: "Psychological frameworks",
            domain: "big5",
            strength: 0.85,
          },
        ],
        numerology: [
          {
            description: "Numerological alignment",
            domain: "saju",
            strength: 0.85,
          },
        ],
        resilience: [
          {
            description: "Coping strategies",
            domain: "perfectionism",
            strength: 0.7,
          },
        ],
        saju: [
          {
            description: "Both based on birth information",
            domain: "numerology",
            strength: 0.85,
          },
          {
            description: "Complementary perspectives",
            domain: "egenteto",
            strength: 0.75,
          },
        ],
      };
      return correlations[domain] || [];
    },
    [],
  );

  const getDomainTitle = useCallback((domain: OntologyDomain): string => {
    const titles: Partial<Record<OntologyDomain, string>> = {
      big5: "Big Five",
      enneagram: "Enneagram",
      mbti: "MBTI",
      numerology: "Numerology",
      resilience: "Resilience",
      riasec: "RIASEC",
      saju: "Saju",
    };
    return titles[domain] || domain;
  }, []);

  const getDomainDescription = useCallback((domain: OntologyDomain): string => {
    const descriptions: Partial<Record<OntologyDomain, string>> = {
      mbti: "Understand your personality type.",
      numerology: "Unlock hidden meanings in your numbers.",
      saju: "Discover your destiny based on birth time.",
    };
    return descriptions[domain] || "Explore this assessment.";
  }, []);

  const getEstimatedTime = useCallback((domain: OntologyDomain): number => {
    const times: Partial<Record<OntologyDomain, number>> = {
      big5: 10,
      enneagram: 15,
      mbti: 10,
      numerology: 3,
      resilience: 5,
      saju: 5,
    };
    return times[domain] || 5;
  }, []);

  const isPremiumDomain = useCallback((domain: OntologyDomain): boolean => {
    const freeDomains: OntologyDomain[] = [
      "saju",
      "numerology",
      "mbti",
      "enneagram",
      "big5",
      "resilience",
    ];
    return !freeDomains.includes(domain);
  }, []);

  const recalculateAll = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const relevanceScores = relevanceEngine.calculateScores(state);
      const relevanceMap = new Map(relevanceScores.map((r) => [r.domain, r]));
      const completedDomains = Array.from(state.completedAssessments.keys());

      const recommendations: Recommendation[] = [];
      const sorted = Array.from(relevanceMap.entries())
        .filter(([d]) => !completedDomains.includes(d))
        .sort(([, a], [, b]) => b.score - a.score);

      for (const [domain, relevance] of sorted.slice(0, 10)) {
        const corrs = findCorrelations(domain);
        const relatedCompleted = corrs.filter((c) =>
          completedDomains.includes(c.domain),
        );
        const reason =
          relatedCompleted.length > 0
            ? `People who completed ${relatedCompleted[0].domain} also explored ${domain}`
            : "Popular assessment";

        recommendations.push({
          correlationIds: relatedCompleted.map((c) => c.domain),
          description: getDomainDescription(domain),
          domain,
          estimatedTime: getEstimatedTime(domain),
          id: `rec-${domain}-${Date.now()}`,
          premium: isPremiumDomain(domain),
          reasons: [reason],
          relevanceScore: relevance.score,
          title: getDomainTitle(domain),
        });
      }

      const insights: InsightCard[] = [];
      for (const domain of completedDomains) {
        const corrs = findCorrelations(domain);
        for (const corr of corrs.filter(
          (c) => !completedDomains.includes(c.domain) && c.strength > 0.5,
        )) {
          insights.push({
            actionLabel: "Explore",
            actionUrl: `/ontology/${corr.domain}`,
            content: `People who completed ${domain} often find ${corr.domain} insightful.`,
            dismissible: true,
            domain: corr.domain,
            id: `insight-${domain}-${corr.domain}`,
            premium: isPremiumDomain(corr.domain),
            relevanceScore: corr.strength * 100,
            title: `Discover ${corr.domain}`,
            type: "correlation",
          });
        }
      }

      if (!insights.some((i) => i.type === "tip")) {
        insights.push({
          actionLabel: "View",
          actionUrl: "/ontology/daily",
          content: "Reflect on your personality traits today.",
          dismissible: true,
          id: "daily-tip",
          premium: false,
          relevanceScore: 50,
          title: "Daily Insight",
          type: "tip",
        });
      }

      setState((prev) => ({
        ...prev,
        insights: insights
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 10),
        isLoading: false,
        recommendations: recommendations.sort(
          (a, b) => b.relevanceScore - a.relevanceScore,
        ),
        relevanceScores: relevanceMap,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: String(error), isLoading: false }));
    }
  }, [
    state,
    findCorrelations,
    getDomainTitle,
    getDomainDescription,
    getEstimatedTime,
    isPremiumDomain,
  ]);

  useEffect(() => {
    return () => {
      if (pageTimer.current) clearInterval(pageTimer.current);
    };
  }, []);

  const value: UseOntologyReturn = {
    ...state,
    addAssessmentResult: (result) => {
      setState((prev) => {
        const newMap = new Map(prev.completedAssessments);
        newMap.set(result.domain, result);
        return {
          ...prev,
          completedAssessments: newMap,
          recentResults: [result, ...prev.recentResults].slice(0, 10),
        };
      });
      recalculateAll();
    },
    dismissInsight: (id) => {
      setState((prev) => ({
        ...prev,
        insights: prev.insights.filter((i) => i.id !== id),
      }));
    },
    getAssessmentResult: (domain) => state.completedAssessments.get(domain),
    getCompletedDomains: () => Array.from(state.completedAssessments.keys()),
    getCorrelationGraph: () => {
      const domains = Array.from(state.completedAssessments.keys());
      return {
        edges: [],
        nodes: domains.map((d) => ({
          category: d.split(".")[0] || "general",
          completed: true,
          displayName: getDomainTitle(d),
          id: d,
        })),
      };
    },
    getCorrelationsForDomain: findCorrelations,
    getRelevanceScore: (domain) =>
      state.relevanceScores.get(domain)?.score ?? 0,
    getTopInsights: (limit = 3) => state.insights.slice(0, limit),
    getTopRecommendations: (limit = 5) => state.recommendations.slice(0, limit),
    handleScroll: (depth) => {
      if (scrollThrottle.current) return;
      scrollThrottle.current = true;
      setTimeout(() => {
        scrollThrottle.current = false;
      }, 1000);
      setState((prev) => ({
        ...prev,
        currentPageContext: { ...prev.currentPageContext, scrollDepth: depth },
      }));
    },
    isDomainCompleted: (domain) => state.completedAssessments.has(domain),
    startPageTracking: () => {
      if (pageTimer.current) clearInterval(pageTimer.current);
      pageTimer.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          currentPageContext: {
            ...prev.currentPageContext,
            timeOnPage: prev.currentPageContext.timeOnPage + 1,
          },
        }));
      }, 1000);
    },
    stopPageTracking: () => {
      if (pageTimer.current) {
        clearInterval(pageTimer.current);
        pageTimer.current = null;
      }
    },
    updatePageContext: (context) => {
      setState((prev) => ({
        ...prev,
        currentPageContext: { ...prev.currentPageContext, ...context },
      }));
      recalculateAll();
    },
    updateUserProfile: (profile) => {
      setState((prev) => ({ ...prev, userProfile: profile }));
      recalculateAll();
    },
  };

  return (
    <OntologyContextAPI.Provider value={value}>
      {children}
    </OntologyContextAPI.Provider>
  );
}

export function useOntologyContext(): UseOntologyReturn {
  const context = useContext(OntologyContextAPI);
  if (!context) {
    return {
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
  }
  return context;
}
