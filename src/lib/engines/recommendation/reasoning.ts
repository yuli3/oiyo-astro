/**
 * "Why was this recommended?" explainer (Phase 1 / Track A, step 4).
 *
 * `computeMatchScore()` (`./scoring.ts`) already computes, per declared
 * scoring category, `weight * matchedFraction` contributions — it just
 * throws away *which* signal drove each contribution once it folds them into
 * a single 0-100 number. `explainMatch()` recomputes the same categories via
 * the same `resolveProfile()` the score itself uses (no drift risk) but keeps
 * the concrete value that matched (e.g. the actual MBTI type, the actual
 * Saju element) instead of collapsing it, so the result card can render a
 * real sentence ("MBTI ENTJ + 사주 火 기운이 이 추천을 이끌었어요") instead of
 * the static `reasoning.primarySource`/`secondarySource` category tags.
 *
 * `nodeId`, when present, is a real `@/lib/ontology/graph` node id (element,
 * zodiac, big5-trait, or riasec-trait — the only `NodeKind`s the graph has a
 * matching signal for; mbti type/traits, saju dominant ten-god, and tci
 * dimension have no graph node) so the "다음 탐색" button can deep-link
 * `OntologyRelationOrbit` straight to the signal that drove the match.
 */

import type { RecommendationContext } from "./contracts";
import {
  CAREER_DEFINITIONS,
  HOBBY_DEFINITIONS,
  MYTHOLOGY_DEFINITIONS,
  PSYCHOLOGY_DEFINITIONS,
  type RecommendationDefinition,
  SCIENCE_DEFINITIONS,
  SPIRITUALITY_DEFINITIONS,
} from "./data/definitions";
import { RIASEC_LETTER_TO_NODE_ID } from "./graph-fallback";
import { BIG5_HIGH_THRESHOLD, BIG5_LOW_THRESHOLD, CATEGORY_WEIGHT, resolveProfile, type ResolvedProfile } from "./scoring";

type ScoringRules = RecommendationDefinition["scoring"];

export type MatchSignalSource = "big5" | "mbti" | "riasec" | "saju" | "tci" | "zodiac";

export interface MatchSignal {
  /** Which signal category this contribution came from. */
  source: MatchSignalSource;
  /** The concrete value that matched (e.g. "ENTJ", "Fire", "Leo", "O") — for building a reasoning sentence. */
  value: string;
  /** A real `@/lib/ontology/graph` node id this value maps to, when one exists — lets the UI deep-link "다음 탐색" into `OntologyRelationOrbit`. */
  nodeId?: string;
  /** `weight * matchedFraction`, same units as `computeMatchScore`'s internal contributions — used to rank signals by how much they actually pushed the score. */
  weight: number;
}

const BIG5_DIMENSION_NODE_ID: Record<string, string> = {
  A: "agreeableness",
  C: "conscientiousness",
  E: "extraversion",
  N: "neuroticism",
  O: "openness",
};

function explainMbti(rules: ScoringRules["mbti"], profile: ResolvedProfile): MatchSignal[] {
  if (!rules) return [];
  const signals: MatchSignal[] = [];
  if (rules.type?.length && profile.mbtiType && rules.type.includes(profile.mbtiType)) {
    signals.push({ source: "mbti", value: profile.mbtiType, weight: CATEGORY_WEIGHT.mbtiType });
  }
  if (rules.traits?.length) {
    const matched = rules.traits.filter((trait) => profile.mbtiTraits.includes(trait));
    if (matched.length > 0) {
      signals.push({
        source: "mbti",
        value: profile.mbtiType ?? matched.join(""),
        weight: CATEGORY_WEIGHT.mbtiTraits * (matched.length / rules.traits.length),
      });
    }
  }
  return signals;
}

function explainSaju(rules: ScoringRules["saju"], profile: ResolvedProfile): MatchSignal[] {
  if (!rules) return [];
  const signals: MatchSignal[] = [];
  if (rules.dominantTenGod?.length && profile.sajuDominantTenGod && rules.dominantTenGod.includes(profile.sajuDominantTenGod)) {
    signals.push({ source: "saju", value: profile.sajuDominantTenGod, weight: CATEGORY_WEIGHT.sajuDominantTenGod });
  }
  if (rules.elementBalance?.excess?.length && profile.sajuElement && rules.elementBalance.excess.includes(profile.sajuElement)) {
    signals.push({
      source: "saju",
      value: profile.sajuElement,
      nodeId: profile.sajuElement.toLowerCase(),
      weight: CATEGORY_WEIGHT.sajuElementExcess,
    });
  }
  // Mirrors scoring.ts's caveat: absence from the deficient list is weak
  // positive evidence (no full five-element breakdown available), so this
  // still surfaces `sajuElement` as "the element that explains it" even
  // though it's technically the dominant element, not the deficient one.
  if (rules.elementBalance?.deficient?.length && profile.sajuElement && !rules.elementBalance.deficient.includes(profile.sajuElement)) {
    signals.push({
      source: "saju",
      value: profile.sajuElement,
      nodeId: profile.sajuElement.toLowerCase(),
      weight: CATEGORY_WEIGHT.sajuElementDeficient,
    });
  }
  return signals;
}

function explainTci(rules: ScoringRules["tci"], profile: ResolvedProfile): MatchSignal[] {
  if (!rules?.highRequest?.length) return [];
  const matched = rules.highRequest.filter((dimension) => profile.tciHigh.includes(dimension));
  if (matched.length === 0) return [];
  return [
    {
      source: "tci",
      value: matched.join(", "),
      weight: CATEGORY_WEIGHT.tciHighRequest * (matched.length / rules.highRequest.length),
    },
  ];
}

function explainBig5(rules: ScoringRules["big5"], profile: ResolvedProfile): MatchSignal[] {
  if (!profile.big5) return [];
  const dims = [
    ...(rules?.high ?? []).map((dim) => [dim, "high"] as const),
    ...(rules?.low ?? []).map((dim) => [dim, "low"] as const),
  ];
  const matched = dims.filter(([dim, level]) => {
    const value = profile.big5![dim];
    return level === "high" ? value >= BIG5_HIGH_THRESHOLD : value <= BIG5_LOW_THRESHOLD;
  });
  if (matched.length === 0) return [];
  // Mirrors scoring.ts's `CATEGORY_WEIGHT.big5 * (matched/dims.length)`
  // contribution, split evenly across the dimensions that actually matched.
  return matched.map(([dim]) => ({
    source: "big5" as const,
    value: dim,
    nodeId: BIG5_DIMENSION_NODE_ID[dim],
    weight: CATEGORY_WEIGHT.big5 / dims.length,
  }));
}

function explainRiasec(rules: ScoringRules["riasec"], profile: ResolvedProfile): MatchSignal[] {
  if (!rules?.codes?.length || !profile.riasecCode) return [];
  const matched = rules.codes.filter((code) => profile.riasecCode!.includes(code));
  if (matched.length === 0) return [];
  return matched.map((code) => ({
    source: "riasec" as const,
    value: code,
    nodeId: RIASEC_LETTER_TO_NODE_ID[code.toUpperCase()],
    weight: (CATEGORY_WEIGHT.riasec / rules.codes!.length),
  }));
}

function explainZodiac(rules: ScoringRules["zodiac"], profile: ResolvedProfile): MatchSignal[] {
  if (!rules?.signs?.length || !profile.zodiac) return [];
  const matched = rules.signs.find((sign) => sign.toLowerCase() === profile.zodiac!.toLowerCase());
  if (!matched) return [];
  return [{ source: "zodiac", value: matched, nodeId: matched.toLowerCase(), weight: CATEGORY_WEIGHT.zodiac }];
}

/**
 * The `limit` (default 2) signals that contributed the most to `def`'s match
 * score against `ctx`, ranked by contribution weight descending. Never
 * throws: a definition with no scoring criteria, or a profile with no
 * matching signals, resolves to `[]` — callers should fall back to a generic
 * "no specific signal yet" message rather than fabricate one.
 */
export function explainMatch(def: RecommendationDefinition, ctx: RecommendationContext, limit = 2): MatchSignal[] {
  const profile = resolveProfile(ctx);
  const signals: MatchSignal[] = [
    ...explainMbti(def.scoring.mbti, profile),
    ...explainSaju(def.scoring.saju, profile),
    ...explainTci(def.scoring.tci, profile),
    ...explainBig5(def.scoring.big5, profile),
    ...explainRiasec(def.scoring.riasec, profile),
    ...explainZodiac(def.scoring.zodiac, profile),
  ];
  return signals.sort((a, b) => b.weight - a.weight).slice(0, limit);
}

const ALL_DEFINITIONS = [
  ...CAREER_DEFINITIONS,
  ...HOBBY_DEFINITIONS,
  ...MYTHOLOGY_DEFINITIONS,
  ...PSYCHOLOGY_DEFINITIONS,
  ...SCIENCE_DEFINITIONS,
  ...SPIRITUALITY_DEFINITIONS,
];
const DEFINITION_BY_RECOMMENDATION_ID = new Map(
  ALL_DEFINITIONS.map((def) => [`${def.category}-${def.id}`, def]),
);

/**
 * Looks up the `RecommendationDefinition` behind a `Recommendation.id`
 * (`${category}-${def.id}`, see `./engines/*.ts`) so the UI can call
 * `explainMatch()` on it. Graph-fallback recommendations
 * (`${category}-graph-${nodeId}`, see `./graph-fallback.ts`) have no
 * definition — they resolve to `undefined`, and the UI should fall back to a
 * graph-relationship framing instead of a signal-based one.
 */
export function findDefinition(recommendationId: string): RecommendationDefinition | undefined {
  return DEFINITION_BY_RECOMMENDATION_ID.get(recommendationId);
}
