/**
 * Real matchScore engine (Phase 1 / Track A, step 3).
 *
 * Replaces the hardcoded `matchScore: 85` stand-ins that used to live in the
 * six recommendation engines (`engines/*.ts`) with a weighted match against
 * every signal category a `RecommendationDefinition.scoring` block declares.
 *
 * big5/riasec/zodiac come from `ctx.signals` (`collectSignals()`,
 * `@/lib/ontology/signals`) because the interpretation layer
 * (`ctx.interpretation`) doesn't carry them. mbti/saju/tci prefer the
 * (richer) interpretation output and fall back to `ctx.signals` when
 * interpretation didn't compute a given field.
 *
 * Each declared scoring category contributes `weight * matchedFraction`
 * (0..1) to the total; the final score is
 * `round(matchedWeight / totalDeclaredWeight * 100)`, so it's always 0-100
 * regardless of how many/which categories a definition declares, and a
 * definition with no scoring criteria, or a profile with no signals at all,
 * safely resolves to 0 (never throws, never divides by zero).
 */

import { ProfileSignals } from "@/lib/ontology/signals";

import { RecommendationContext } from "./contracts";
import { RecommendationDefinition } from "./data/definitions";

type ScoringRules = RecommendationDefinition["scoring"];

interface ResolvedProfile {
  big5?: ProfileSignals["big5"];
  mbtiTraits: string[];
  mbtiType?: string;
  riasecCode?: string;
  sajuDominantTenGod?: string;
  sajuElement?: string;
  tciHigh: string[];
  zodiac?: string;
}

const BIG5_HIGH_THRESHOLD = 60;
const BIG5_LOW_THRESHOLD = 40;

/** Relative weight of each declared scoring category. Tuned so no single category dominates a match score. */
const CATEGORY_WEIGHT = {
  big5: 25,
  mbtiTraits: 30,
  mbtiType: 30,
  riasec: 20,
  sajuDominantTenGod: 30,
  sajuElementDeficient: 20,
  sajuElementExcess: 20,
  tciHighRequest: 25,
  zodiac: 20,
};

/** Only surface recommendations with a meaningful signal match, not every definition at a near-zero score. */
export const MIN_DISPLAY_SCORE = 20;

function resolveProfile(ctx: RecommendationContext): ResolvedProfile {
  const { interpretation, signals } = ctx;

  const mbtiType = interpretation.mbti?.code?.toUpperCase() ?? signals?.mbti?.type;

  return {
    big5: signals?.big5,
    mbtiTraits: mbtiType ? mbtiType.split("") : (signals?.mbti?.traits ?? []),
    mbtiType,
    riasecCode: signals?.riasec?.code,
    sajuDominantTenGod: interpretation.saju?.tenGodProfile?.dominant ?? signals?.saju?.tenGods?.[0],
    sajuElement: interpretation.saju?.element ?? signals?.saju?.element,
    tciHigh: (interpretation.tci?.temperamentDimensions ?? [])
      .filter((dimension) => dimension.level === "high")
      .map((dimension) => dimension.name.en),
    zodiac: signals?.zodiac,
  };
}

/** A single (weight, matchedFraction 0..1) contribution to the weighted average. */
type Contribution = readonly [weight: number, fraction: number];

function scoreMbti(rules: ScoringRules["mbti"], profile: ResolvedProfile): Contribution[] {
  if (!rules) return [];
  const contributions: Contribution[] = [];
  if (rules.type?.length) {
    contributions.push([CATEGORY_WEIGHT.mbtiType, profile.mbtiType && rules.type.includes(profile.mbtiType) ? 1 : 0]);
  }
  if (rules.traits?.length) {
    const matched = rules.traits.filter((trait) => profile.mbtiTraits.includes(trait)).length;
    contributions.push([CATEGORY_WEIGHT.mbtiTraits, matched / rules.traits.length]);
  }
  return contributions;
}

function scoreSaju(rules: ScoringRules["saju"], profile: ResolvedProfile): Contribution[] {
  if (!rules) return [];
  const contributions: Contribution[] = [];
  if (rules.dominantTenGod?.length) {
    contributions.push([
      CATEGORY_WEIGHT.sajuDominantTenGod,
      profile.sajuDominantTenGod && rules.dominantTenGod.includes(profile.sajuDominantTenGod) ? 1 : 0,
    ]);
  }
  if (rules.elementBalance?.excess?.length) {
    contributions.push([
      CATEGORY_WEIGHT.sajuElementExcess,
      profile.sajuElement && rules.elementBalance.excess.includes(profile.sajuElement) ? 1 : 0,
    ]);
  }
  if (rules.elementBalance?.deficient?.length) {
    // `signals.saju`/`interpretation.saju` only expose the *dominant* element,
    // not a full five-element count breakdown, so this can only check a
    // necessary condition: an element can't be both deficient and dominant at
    // once. Absence from the deficient list is weak positive evidence, not
    // proof of an actual deficiency.
    // TODO(Phase1 step2 통합 후): signals.ts에 elementCounts가 노출되면 실제 결핍 여부로 교체.
    contributions.push([
      CATEGORY_WEIGHT.sajuElementDeficient,
      profile.sajuElement && !rules.elementBalance.deficient.includes(profile.sajuElement) ? 1 : 0,
    ]);
  }
  return contributions;
}

function scoreTci(rules: ScoringRules["tci"], profile: ResolvedProfile): Contribution[] {
  if (!rules?.highRequest?.length) return [];
  const matched = rules.highRequest.filter((dimension) => profile.tciHigh.includes(dimension)).length;
  return [[CATEGORY_WEIGHT.tciHighRequest, matched / rules.highRequest.length]];
}

function scoreBig5(rules: ScoringRules["big5"], profile: ResolvedProfile): Contribution[] {
  const dims = [
    ...(rules?.high ?? []).map((dim) => [dim, "high"] as const),
    ...(rules?.low ?? []).map((dim) => [dim, "low"] as const),
  ];
  if (dims.length === 0) return [];
  if (!profile.big5) return [[CATEGORY_WEIGHT.big5, 0]];
  const matched = dims.filter(([dim, level]) => {
    const value = profile.big5![dim];
    return level === "high" ? value >= BIG5_HIGH_THRESHOLD : value <= BIG5_LOW_THRESHOLD;
  }).length;
  return [[CATEGORY_WEIGHT.big5, matched / dims.length]];
}

function scoreRiasec(rules: ScoringRules["riasec"], profile: ResolvedProfile): Contribution[] {
  if (!rules?.codes?.length) return [];
  if (!profile.riasecCode) return [[CATEGORY_WEIGHT.riasec, 0]];
  const matched = rules.codes.filter((code) => profile.riasecCode!.includes(code)).length;
  return [[CATEGORY_WEIGHT.riasec, matched / rules.codes.length]];
}

function scoreZodiac(rules: ScoringRules["zodiac"], profile: ResolvedProfile): Contribution[] {
  if (!rules?.signs?.length) return [];
  const matched = profile.zodiac
    ? rules.signs.some((sign) => sign.toLowerCase() === profile.zodiac!.toLowerCase())
    : false;
  return [[CATEGORY_WEIGHT.zodiac, matched ? 1 : 0]];
}

/**
 * Weighted-average match score for one `RecommendationDefinition` against a
 * `RecommendationContext`, normalized to 0-100. Never throws: definitions
 * with no scoring criteria, or profiles with no signals at all, resolve to 0.
 */
export function computeMatchScore(def: RecommendationDefinition, ctx: RecommendationContext): number {
  const profile = resolveProfile(ctx);
  const contributions: Contribution[] = [
    ...scoreMbti(def.scoring.mbti, profile),
    ...scoreSaju(def.scoring.saju, profile),
    ...scoreTci(def.scoring.tci, profile),
    ...scoreBig5(def.scoring.big5, profile),
    ...scoreRiasec(def.scoring.riasec, profile),
    ...scoreZodiac(def.scoring.zodiac, profile),
  ];

  const totalWeight = contributions.reduce((sum, [weight]) => sum + weight, 0);
  if (totalWeight === 0) return 0;

  const matchedWeight = contributions.reduce((sum, [weight, fraction]) => sum + weight * fraction, 0);
  return Math.round((matchedWeight / totalWeight) * 100);
}

// TODO(Phase1 step2 통합 후): matchScore가 전 정의에 걸쳐 0(신호 없음)일 때
// graph/traverse.ts의 neighbors()로 관계 기반 추천을 채우는 그래프 인접 fallback을 추가한다.
// 2단계(관계 그래프, src/lib/ontology/graph/)가 아직 없어 이번 작업 범위에서는 보류.
