import type {
  AssessmentResult,
  OntologyContextState,
  OntologyDomain,
  RelevanceScore,
  UserProfile,
} from "./types";

interface ScoringWeights {
  completionBonus: number;
  correlationBoost: number;
  popularityBonus: number;
  profileMatch: number;
  recencyBoost: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  completionBonus: 0.2,
  correlationBoost: 0.25,
  popularityBonus: 0.15,
  profileMatch: 0.25,
  recencyBoost: 0.15,
};

const DOMAIN_POPULARITY: Record<OntologyDomain, number> = {
  abundance: 0.35,
  balance: 0.45,
  big5: 0.75,
  "cognitive-bias": 0.65,
  "color-personality": 0.55,
  consumption: 0.3,
  country: 0.35,
  "decision-making": 0.4,
  egenteto: 0.5,
  enneagram: 0.8,
  hexaco: 0.5,
  hsp: 0.45,
  "learning-style": 0.5,
  mbti: 0.95,
  numerology: 0.85,
  perfectionism: 0.5,
  prosperity: 0.35,
  resilience: 0.55,
  riasec: 0.7,
  saju: 0.9,
  tci: 0.6,
  "traits.animal": 0.4,
  "traits.art-style": 0.35,
  "traits.blood-type": 0.3,
  "traits.conflict-response-style": 0.25,
  "traits.food-personality": 0.3,
  "traits.friendship-style": 0.35,
  "traits.learning-style": 0.5,

  "traits.music-taste": 0.3,
  "traits.sns-personality": 0.35,
  "value-harmonizer": 0.3,
  vitality: 0.4,
};

const DOMAIN_CATEGORIES: Record<OntologyDomain, string> = {
  abundance: "mindset",
  balance: "wellness",
  big5: "personality",
  "cognitive-bias": "psychology",
  "color-personality": "personality",
  consumption: "lifestyle",
  country: "preference",
  "decision-making": "productivity",
  egenteto: "personality",
  enneagram: "personality",
  hexaco: "personality",
  hsp: "sensitivity",
  "learning-style": "education",
  mbti: "personality",
  numerology: "divination",
  perfectionism: "psychology",
  prosperity: "mindset",
  resilience: "wellness",
  riasec: "career",
  saju: "divination",
  tci: "personality",
  "traits.animal": "personality",
  "traits.art-style": "personality",
  "traits.blood-type": "personality",
  "traits.conflict-response-style": "behavior",
  "traits.food-personality": "lifestyle",
  "traits.friendship-style": "social",
  "traits.learning-style": "education",

  "traits.music-taste": "lifestyle",
  "traits.sns-personality": "social",
  "value-harmonizer": "values",
  vitality: "wellness",
};

const ALL_DOMAINS: OntologyDomain[] = [
  "saju",
  "numerology",
  "mbti",
  "enneagram",
  "big5",
  "hexaco",
  "riasec",
  "tci",
  "cognitive-bias",
  "resilience",
  "perfectionism",
  "balance",
  "vitality",
  "prosperity",
  "abundance",
  "consumption",
  "decision-making",
  "value-harmonizer",
  "egenteto",
  "hsp",
  "country",
  "learning-style",
  "color-personality",
  "traits.animal",
  "traits.art-style",
  "traits.blood-type",
  "traits.conflict-response-style",
  "traits.food-personality",
  "traits.friendship-style",
  "traits.learning-style",

  "traits.music-taste",
  "traits.sns-personality",
];

class RelevanceEngine {
  private weights: ScoringWeights;

  constructor(weights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  public calculateScores(context: OntologyContextState): RelevanceScore[] {
    const scores: RelevanceScore[] = [];
    const completedDomains = Array.from(context.completedAssessments.keys());

    for (const domain of ALL_DOMAINS) {
      if (completedDomains.includes(domain)) {
        continue; // Skip already completed domains
      }

      const score = this.calculateDomainScore(domain, context);
      const reasons = this.generateReasons(domain, context);
      const suggestedActions = this.generateActions(domain, context);

      scores.push({
        domain,
        reasons,
        score,
        suggestedActions,
        trend: this.calculateTrend(domain, context),
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private calculateAge(createdAt: number): number {
    const now = Date.now();
    const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000;
    return (now - createdAt) / millisecondsPerYear;
  }

  private calculateCompletionBonus(
    domain: OntologyDomain,
    completedAssessments: Map<OntologyDomain, AssessmentResult>,
  ): number {
    const completed = Array.from(completedAssessments.keys());
    const relatedDomains = this.getRelatedDomains(domain);

    let matchCount = 0;
    for (const related of relatedDomains) {
      if (completed.includes(related)) {
        matchCount++;
      }
    }

    if (relatedDomains.length === 0) {
      return 50;
    }

    return Math.min(100, (matchCount / relatedDomains.length) * 100);
  }

  private calculateCorrelationBoost(
    domain: OntologyDomain,
    completedAssessments: Map<OntologyDomain, AssessmentResult>,
  ): number {
    const completed = Array.from(completedAssessments.keys());
    const correlations = this.getStrongCorrelations(domain);

    let totalCorrelation = 0;
    let count = 0;

    for (const correlation of correlations) {
      if (completed.includes(correlation.domain)) {
        totalCorrelation += correlation.strength;
        count++;
      }
    }

    if (count === 0) {
      return 50;
    }

    return Math.min(100, (totalCorrelation / count) * 100);
  }

  private calculateDomainScore(
    domain: OntologyDomain,
    context: OntologyContextState,
  ): number {
    let score = 0;

    // Profile match score (0-100)
    const profileScore = this.calculateProfileMatch(
      domain,
      context.userProfile,
    );
    score += profileScore * this.weights.profileMatch;

    // Completion bonus based on related assessments
    const completionScore = this.calculateCompletionBonus(
      domain,
      context.completedAssessments,
    );
    score += completionScore * this.weights.completionBonus;

    // Recency boost
    const recencyScore = this.calculateRecencyBoost(
      domain,
      context.recentResults,
    );
    score += recencyScore * this.weights.recencyBoost;

    // Correlation boost
    const correlationScore = this.calculateCorrelationBoost(
      domain,
      context.completedAssessments,
    );
    score += correlationScore * this.weights.correlationBoost;

    // Popularity bonus
    const popularityScore = (DOMAIN_POPULARITY[domain] || 0.5) * 100;
    score += popularityScore * this.weights.popularityBonus;

    return Math.min(100, Math.max(0, score));
  }

  private calculateProfileMatch(
    domain: OntologyDomain,
    profile: null | UserProfile,
  ): number {
    if (!profile) {
      return 50; // Default neutral score
    }

    const preferredDomains = profile.preferences?.preferredDomains || [];
    const hiddenDomains = profile.preferences?.hiddenDomains || [];

    if (hiddenDomains.includes(domain)) {
      return 0;
    }

    if (preferredDomains.includes(domain)) {
      return 100;
    }

    // Check category preferences
    const domainCategory = DOMAIN_CATEGORIES[domain];
    const preferredCategories = this.getPreferredCategories(profile);

    if (preferredCategories.includes(domainCategory)) {
      return 75;
    }

    // Age-based relevance (example heuristic)
    const age = profile.createdAt ? this.calculateAge(profile.createdAt) : null;
    if (age !== null) {
      const ageRelevance = this.getAgeRelevance(domain, age);
      if (ageRelevance > 0) {
        return 50 + ageRelevance * 30;
      }
    }

    return 50;
  }

  private calculateRecencyBoost(
    domain: OntologyDomain,
    recentResults: AssessmentResult[],
  ): number {
    if (recentResults.length === 0) {
      return 50;
    }

    // Check if any recent results are in related domains
    const recentDomains = recentResults.map((r) => r.domain);
    const relatedDomains = this.getRelatedDomains(domain);

    const hasRecentRelated = recentDomains.some((d) =>
      recentDomains.includes(d),
    );
    if (hasRecentRelated) {
      return 80;
    }

    // Check if user is in "exploration mode" (completed multiple assessments recently)
    if (recentResults.length >= 3) {
      return 70;
    }

    return 50;
  }

  private calculateTrend(
    domain: OntologyDomain,
    context: OntologyContextState,
  ): "decreasing" | "increasing" | "stable" {
    // This would typically analyze historical data
    // For now, we'll use a simple heuristic based on recent activity
    const recentResults = context.recentResults;

    if (recentResults.length < 2) {
      return "stable";
    }

    // If user recently completed related assessments, relevance is increasing
    const relatedCompleted = this.getRelatedDomains(domain).filter((d) =>
      recentResults.some((r) => r.domain === d),
    );

    if (relatedCompleted.length > 0) {
      return "increasing";
    }

    // If it's been a while since any related activity, relevance may be decreasing
    const oldestRecentResult = recentResults[recentResults.length - 1];
    const daysSince =
      (Date.now() - oldestRecentResult.completedAt) / (1000 * 60 * 60 * 24);

    if (daysSince > 7) {
      return "decreasing";
    }

    return "stable";
  }

  private generateActions(
    domain: OntologyDomain,
    context: OntologyContextState,
  ): string[] {
    const actions: string[] = [];

    actions.push(`Take the ${this.getDomainTitle(domain)} assessment`);
    actions.push(`Learn more about your ${DOMAIN_CATEGORIES[domain]} profile`);

    if (this.isPremiumDomain(domain)) {
      actions.push("Unlock with premium subscription");
    }

    return actions;
  }

  private generateReasons(
    domain: OntologyDomain,
    context: OntologyContextState,
  ): string[] {
    const reasons: string[] = [];
    const completed = Array.from(context.completedAssessments.keys());

    // Check for related completed assessments
    const relatedCompleted = this.getRelatedDomains(domain).filter((d) =>
      completed.includes(d),
    );
    if (relatedCompleted.length > 0) {
      reasons.push(`Based on your ${relatedCompleted[0]} results`);
    }

    // Check for strong correlations
    const correlations = this.getStrongCorrelations(domain).filter((c) =>
      completed.includes(c.domain),
    );
    if (correlations.length > 0) {
      reasons.push(
        `Strongly connected to your ${correlations[0].domain} profile`,
      );
    }

    // Check user preferences
    if (context.userProfile?.preferences?.preferredDomains.includes(domain)) {
      reasons.push("Matches your stated preferences");
    }

    // Popularity reason
    if (DOMAIN_POPULARITY[domain] > 0.8) {
      reasons.push("Popular among users like you");
    }

    // Category relevance
    const userCategories = this.getPreferredCategories(context.userProfile);
    const domainCategory = DOMAIN_CATEGORIES[domain];
    if (userCategories.includes(domainCategory)) {
      reasons.push(`Matches your interest in ${domainCategory}`);
    }

    return reasons;
  }

  private getAgeRelevance(domain: OntologyDomain, age: number): number {
    // Age-based relevance heuristics
    const domainAgeGroups: Partial<
      Record<OntologyDomain, { max: number; min: number; relevance: number }[]>
    > = {
      "decision-making": [
        { max: 35, min: 18, relevance: 0.6 },
        { max: 55, min: 35, relevance: 0.8 },
        { max: 100, min: 55, relevance: 0.7 },
      ],
      riasec: [
        { max: 25, min: 16, relevance: 0.9 },
        { max: 35, min: 25, relevance: 0.7 },
        { max: 100, min: 35, relevance: 0.4 },
      ],
      saju: [
        { max: 35, min: 18, relevance: 0.7 },
        { max: 55, min: 35, relevance: 0.9 },
        { max: 100, min: 55, relevance: 0.8 },
      ],
      // Default for other domains - return 0
    };

    const ageGroups = domainAgeGroups[domain];
    if (!ageGroups) {
      return 0;
    }

    for (const group of ageGroups) {
      if (age >= group.min && age < group.max) {
        return group.relevance;
      }
    }

    return 0;
  }

  private getDomainTitle(domain: OntologyDomain): string {
    const titles: Record<OntologyDomain, string> = {
      abundance: "Abundance",
      balance: "Life Balance",
      big5: "Big Five",
      "cognitive-bias": "Cognitive Bias",
      "color-personality": "Color Personality",
      consumption: "Consumption Habits",
      country: "Country Preference",
      "decision-making": "Decision Making",
      egenteto: "Egenteto",
      enneagram: "Enneagram",
      hexaco: "HEXACO",
      hsp: "Highly Sensitive Person",
      "learning-style": "Learning Style",
      mbti: "MBTI",
      numerology: "Numerology",
      perfectionism: "Perfectionism",
      prosperity: "Prosperity",
      resilience: "Resilience",
      riasec: "RIASEC",
      saju: "Saju",
      tci: "TCI",
      "traits.animal": "Animal Personality",
      "traits.art-style": "Art Style",
      "traits.blood-type": "Blood Type",
      "traits.conflict-response-style": "Conflict Response",
      "traits.food-personality": "Food Personality",
      "traits.friendship-style": "Friendship Style",
      "traits.learning-style": "Learning Style",

      "traits.music-taste": "Music Taste",
      "traits.sns-personality": "SNS Personality",
      "value-harmonizer": "Values Harmonization",
      vitality: "Vitality",
    };
    return titles[domain] || domain;
  }

  private getPreferredCategories(profile: null | UserProfile): string[] {
    if (!profile) {
      return [];
    }

    const preferredDomains = profile.preferences?.preferredDomains || [];
    const categories = new Set<string>();

    for (const domain of preferredDomains) {
      const category = DOMAIN_CATEGORIES[domain];
      if (category) {
        categories.add(category);
      }
    }

    return Array.from(categories);
  }

  private getRelatedDomains(domain: OntologyDomain): OntologyDomain[] {
    const relatedMap: Record<OntologyDomain, OntologyDomain[]> = {
      abundance: ["prosperity", "value-harmonizer"],
      balance: ["vitality", "consumption"],
      big5: ["mbti", "hexaco", "riasec"],
      "cognitive-bias": ["decision-making", "resilience"],
      "color-personality": ["numerology", "traits.art-style"],
      consumption: ["balance", "decision-making"],
      country: ["learning-style", "consumption"],
      "decision-making": ["riasec", "cognitive-bias"],
      egenteto: ["saju", "mbti"],
      enneagram: ["mbti", "resilience"],
      hexaco: ["big5", "tci"],
      hsp: ["perfectionism", "resilience"],
      "learning-style": ["riasec", "decision-making"],
      mbti: ["enneagram", "big5", "tci"],
      numerology: ["saju", "color-personality"],
      perfectionism: ["resilience", "balance"],
      prosperity: ["abundance", "value-harmonizer"],
      resilience: ["perfectionism", "balance", "vitality"],
      riasec: ["big5", "decision-making", "learning-style"],
      saju: ["numerology", "egenteto"],
      tci: ["mbti", "big5", "hexaco"],
      "traits.animal": ["traits.music-taste", "saju"],
      "traits.art-style": ["color-personality", "traits.music-taste"],
      "traits.blood-type": ["vitality", "consumption"],
      "traits.conflict-response-style": ["decision-making", "resilience"],
      "traits.food-personality": ["consumption", "vitality"],
      "traits.friendship-style": ["hsp", "resilience"],
      "traits.learning-style": ["riasec", "learning-style"],

      "traits.music-taste": ["traits.art-style", "traits.friendship-style"],
      "traits.sns-personality": ["traits.friendship-style", "cognitive-bias"],
      "value-harmonizer": ["decision-making", "balance"],
      vitality: ["balance", "resilience"],
    };

    return relatedMap[domain] || [];
  }

  private getStrongCorrelations(
    domain: OntologyDomain,
  ): { domain: OntologyDomain; strength: number }[] {
    const strongCorrelations: Record<
      OntologyDomain,
      { domain: OntologyDomain; strength: number }[]
    > = {
      abundance: [
        { domain: "prosperity", strength: 0.85 },
        { domain: "value-harmonizer", strength: 0.6 },
      ],
      balance: [
        { domain: "vitality", strength: 0.7 },
        { domain: "consumption", strength: 0.6 },
      ],
      big5: [
        { domain: "mbti", strength: 0.85 },
        { domain: "hexaco", strength: 0.8 },
        { domain: "riasec", strength: 0.6 },
      ],
      "cognitive-bias": [
        { domain: "decision-making", strength: 0.75 },
        { domain: "resilience", strength: 0.6 },
      ],
      "color-personality": [
        { domain: "numerology", strength: 0.65 },
        { domain: "traits.art-style", strength: 0.6 },
      ],
      consumption: [
        { domain: "balance", strength: 0.6 },
        { domain: "decision-making", strength: 0.55 },
      ],
      country: [
        { domain: "learning-style", strength: 0.5 },
        { domain: "consumption", strength: 0.5 },
      ],
      "decision-making": [
        { domain: "cognitive-bias", strength: 0.75 },
        { domain: "riasec", strength: 0.55 },
      ],
      egenteto: [
        { domain: "saju", strength: 0.75 },
        { domain: "mbti", strength: 0.6 },
      ],
      enneagram: [
        { domain: "mbti", strength: 0.9 },
        { domain: "resilience", strength: 0.65 },
      ],
      hexaco: [
        { domain: "big5", strength: 0.8 },
        { domain: "tci", strength: 0.7 },
      ],
      hsp: [
        { domain: "perfectionism", strength: 0.6 },
        { domain: "resilience", strength: 0.55 },
      ],
      "learning-style": [
        { domain: "riasec", strength: 0.6 },
        { domain: "decision-making", strength: 0.5 },
      ],
      mbti: [
        { domain: "enneagram", strength: 0.9 },
        { domain: "big5", strength: 0.85 },
        { domain: "tci", strength: 0.7 },
      ],
      numerology: [
        { domain: "saju", strength: 0.85 },
        { domain: "color-personality", strength: 0.65 },
      ],
      perfectionism: [
        { domain: "resilience", strength: 0.7 },
        { domain: "balance", strength: 0.55 },
      ],
      prosperity: [
        { domain: "abundance", strength: 0.85 },
        { domain: "value-harmonizer", strength: 0.6 },
      ],
      resilience: [
        { domain: "perfectionism", strength: 0.7 },
        { domain: "balance", strength: 0.65 },
      ],
      riasec: [
        { domain: "big5", strength: 0.6 },
        { domain: "decision-making", strength: 0.55 },
      ],
      saju: [
        { domain: "numerology", strength: 0.85 },
        { domain: "egenteto", strength: 0.75 },
      ],
      tci: [
        { domain: "mbti", strength: 0.7 },
        { domain: "big5", strength: 0.65 },
      ],
      "traits.animal": [
        { domain: "traits.music-taste", strength: 0.6 },
        { domain: "saju", strength: 0.5 },
      ],
      "traits.art-style": [
        { domain: "color-personality", strength: 0.6 },
        { domain: "traits.music-taste", strength: 0.5 },
      ],
      "traits.blood-type": [
        { domain: "vitality", strength: 0.5 },
        { domain: "consumption", strength: 0.4 },
      ],
      "traits.conflict-response-style": [
        { domain: "decision-making", strength: 0.55 },
        { domain: "resilience", strength: 0.5 },
      ],
      "traits.food-personality": [
        { domain: "consumption", strength: 0.6 },
        { domain: "vitality", strength: 0.5 },
      ],
      "traits.friendship-style": [
        { domain: "hsp", strength: 0.55 },
        { domain: "resilience", strength: 0.5 },
      ],
      "traits.learning-style": [
        { domain: "riasec", strength: 0.6 },
        { domain: "learning-style", strength: 0.5 },
      ],

      "traits.music-taste": [
        { domain: "traits.art-style", strength: 0.55 },
        { domain: "traits.friendship-style", strength: 0.5 },
      ],
      "traits.sns-personality": [
        { domain: "traits.friendship-style", strength: 0.6 },
        { domain: "cognitive-bias", strength: 0.5 },
      ],
      "value-harmonizer": [
        { domain: "decision-making", strength: 0.6 },
        { domain: "balance", strength: 0.5 },
      ],
      vitality: [
        { domain: "balance", strength: 0.7 },
        { domain: "resilience", strength: 0.6 },
      ],
    };

    return strongCorrelations[domain] || [];
  }

  private isPremiumDomain(domain: OntologyDomain): boolean {
    const freeDomains: OntologyDomain[] = [
      "saju",
      "numerology",
      "mbti",
      "enneagram",
      "big5",
      "cognitive-bias",
      "resilience",
    ];
    return !freeDomains.includes(domain);
  }
}

export const relevanceEngine = new RelevanceEngine();
export default relevanceEngine;
