import { describe, expect, it } from "vitest";

import golden from "../../../config/exploration-recommender-v1.golden.json";
import taxonomy from "../../../config/exploration-recommender-v1.taxonomy.json";
import {
  EXPLORATION_FEATURES,
  EXPLORATION_FEATURE_WEIGHT,
  EXPLORATION_LOCALES,
  EXPLORATION_SOURCE_CONTRACTS,
  explorationTaxonomy,
  recommendExploration,
  type ExplorationFeature,
  type ExplorationInput,
} from "./index";

type GoldenProfile = { interests: ExplorationInput["interests"]; workEnvironment: ExplorationInput["workEnvironment"] };
type GoldenContext = Omit<ExplorationInput, "interests" | "workEnvironment">;

function goldenInput(profile: string, context: string): ExplorationInput {
  const profiles = golden.profiles as unknown as Record<string, GoldenProfile>;
  const contexts = golden.contexts as unknown as Record<string, GoldenContext>;
  return { ...contexts[context], ...profiles[profile] };
}

const BASE = goldenInput("balanced", "homeLowTogether30");

describe("exploration recommender v1", () => {
  it("locks at least 50 deterministic golden outcomes", () => {
    expect(golden.cases).toHaveLength(60);
    for (const fixture of golden.cases) {
      const result = recommendExploration(goldenInput(fixture.profile, fixture.context), 3, "en");
      expect(result.recommendations[0], `${fixture.profile}/${fixture.context}`).toMatchObject({
        id: fixture.topId,
        score: fixture.topScore,
      });
      expect(result.recommendations.map((item) => item.id), `${fixture.profile}/${fixture.context} top3`).toEqual(fixture.top3Ids);
      expect(result.excludedByGuardrail, `${fixture.profile}/${fixture.context} guardrails`).toBe(fixture.excludedByGuardrail);
      expect(result.recommendations[0].supportingReasons.map((reason) => reason.feature), `${fixture.profile}/${fixture.context} support`).toEqual(fixture.topSupportingFeatures);
      expect(result.recommendations[0].counterReasons.map((reason) => reason.feature), `${fixture.profile}/${fixture.context} counter`).toEqual(fixture.topCounterFeatures);
    }
  });

  it("is deterministic, does not mutate input, and uses a stable id tie-break", () => {
    const input = structuredClone(BASE);
    const before = structuredClone(input);
    const first = recommendExploration(input, explorationTaxonomy().length, "en");
    const second = recommendExploration(structuredClone(input), explorationTaxonomy().length, "en");

    expect(first).toEqual(second);
    expect(input).toEqual(before);
    const tied = first.recommendations.filter((item) => item.score === first.recommendations[0].score).map((item) => item.id);
    expect(tied).toEqual([...tied].sort());
  });

  it("keeps all six features independent and equally weighted", () => {
    const baseline = recommendExploration(BASE, explorationTaxonomy().length, "en");
    expect(baseline.featurePolicy).toEqual({
      features: EXPLORATION_FEATURES,
      maxSingleFeatureContribution: 16.6667,
      weighting: "equal-independent-features",
    });
    expect(baseline.provenance.sourceContracts).toEqual(EXPLORATION_SOURCE_CONTRACTS);
    expect(EXPLORATION_FEATURE_WEIGHT).toBeCloseTo(1 / 6);

    const mutations: Record<ExplorationFeature, ExplorationInput> = {
      interest: { ...BASE, interests: { R: 100, I: 0, A: 0, S: 0, E: 0, C: 0 } },
      workEnvironment: { ...BASE, workEnvironment: { security: 100, achievement: 0, autonomy: 0, service: 0, creativity: 0, status: 0 } },
      time: { ...BASE, timeMinutes: 240 },
      budget: { ...BASE, budget: "high" },
      space: { ...BASE, space: "outdoor" },
      social: { ...BASE, socialMode: "solo" },
    };

    for (const feature of EXPLORATION_FEATURES) {
      const changed = recommendExploration(mutations[feature], explorationTaxonomy().length, "en");
      for (const original of baseline.recommendations) {
        const candidate = changed.recommendations.find((item) => item.id === original.id)!;
        for (const other of EXPLORATION_FEATURES.filter((item) => item !== feature)) {
          expect(candidate.featureScores[other], `${feature} changed ${other} for ${original.id}`).toBe(original.featureScores[other]);
        }
      }
    }
  });

  it("caps the effect of any single scored input feature", () => {
    const extremes: Record<ExplorationFeature, [ExplorationInput, ExplorationInput]> = {
      interest: [
        { ...BASE, interests: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } },
        { ...BASE, interests: { R: 100, I: 100, A: 100, S: 100, E: 100, C: 100 } },
      ],
      workEnvironment: [
        { ...BASE, workEnvironment: { security: 0, achievement: 0, autonomy: 0, service: 0, creativity: 0, status: 0 } },
        { ...BASE, workEnvironment: { security: 100, achievement: 100, autonomy: 100, service: 100, creativity: 100, status: 100 } },
      ],
      time: [{ ...BASE, timeMinutes: 20 }, { ...BASE, timeMinutes: 480 }],
      budget: [{ ...BASE, budget: "free" }, { ...BASE, budget: "high" }],
      space: [{ ...BASE, space: "home-small" }, { ...BASE, space: "specialized" }],
      social: [{ ...BASE, socialMode: "solo" }, { ...BASE, socialMode: "together" }],
    };
    for (const feature of EXPLORATION_FEATURES) {
      const [lowInput, highInput] = extremes[feature];
      const lowResult = recommendExploration(lowInput, explorationTaxonomy().length, "en");
      const highResult = recommendExploration(highInput, explorationTaxonomy().length, "en");
      for (const low of lowResult.recommendations) {
        const high = highResult.recommendations.find((item) => item.id === low.id)!;
        expect(Math.abs(high.score - low.score), `${feature} dominated ${low.id}`).toBeLessThanOrEqual(17);
        expect(Math.max(...Object.values(high.featureContributions)), `${feature} contribution ${low.id}`).toBeLessThanOrEqual(16.6667);
      }
    }
  });

  it("returns detached taxonomy and input snapshots", () => {
    const first = explorationTaxonomy() as unknown as Array<{ id: string; riasec: Record<string, number> }>;
    const originalId = first[0].id;
    first[0].id = "mutated";
    first[0].riasec.A = 99;
    expect(explorationTaxonomy()[0].id).toBe(originalId);
    expect(explorationTaxonomy()[0].riasec.A).not.toBe(99);

    const input = structuredClone(BASE);
    const result = recommendExploration(input, 5, "en");
    input.interests.R = 0;
    input.accessibilityNeeds.push("remote");
    expect(result.input.interests.R).toBe(BASE.interests.R);
    expect(result.input.accessibilityNeeds).toEqual(BASE.accessibilityNeeds);

    const features = result.featurePolicy.features as unknown as string[];
    const sources = result.provenance.sourceContracts as unknown as string[];
    expect(() => features.pop()).toThrow();
    expect(() => sources.pop()).toThrow();
    expect(recommendExploration(BASE, 5, "en").featurePolicy.features).toEqual(EXPLORATION_FEATURES);
    expect(recommendExploration(BASE, 5, "en").provenance.sourceContracts).toEqual(EXPLORATION_SOURCE_CONTRACTS);
  });

  it("requires an exact locale and emits localized core copy without fallback", () => {
    const environments = new Set<string>();
    const experiments = new Set<string>();
    const reasons = new Set<string>();
    for (const locale of EXPLORATION_LOCALES) {
      const result = recommendExploration(BASE, 3, locale);
      expect(result.locale).toBe(locale);
      environments.add(result.recommendations[0].environmentToExplore);
      experiments.add(result.recommendations[0].experiment20Minutes);
      reasons.add(result.recommendations[0].supportingReasons[0].text);
    }
    expect(environments.size).toBe(6);
    expect(experiments.size).toBe(6);
    expect(reasons.size).toBe(6);
    expect(() => recommendExploration(BASE, 3, "de" as never)).toThrow("Unsupported exploration locale");
    expect(() => recommendExploration(BASE, 3, undefined as never)).toThrow("Unsupported exploration locale");
  });

  it("returns work environments, 20-minute experiments, and both recommendation and counter evidence", () => {
    const result = recommendExploration(goldenInput("social", "homeLowTogether30"), 5, "en");
    expect(result.disclaimer).toContain("not occupation");
    for (const recommendation of result.recommendations) {
      expect(recommendation.environmentToExplore.length).toBeGreaterThan(30);
      expect(recommendation.experiment20Minutes.length).toBeGreaterThan(30);
      expect(recommendation.supportingReasons).toHaveLength(3);
      expect(recommendation.counterReasons).toHaveLength(2);
      expect(recommendation.supportingReasons.every((reason) => reason.direction === "support")).toBe(true);
      expect(recommendation.counterReasons.every((reason) => reason.direction === "counter")).toBe(true);
      expect(Object.keys(recommendation.featureScores)).toEqual(EXPLORATION_FEATURES);
      expect(recommendation.featureTrace.map((trace) => trace.feature)).toEqual(EXPLORATION_FEATURES);
      expect(recommendation.featureTrace.every((trace) => trace.score === recommendation.featureScores[trace.feature] && trace.contribution === recommendation.featureContributions[trace.feature])).toBe(true);
      expect(recommendation.sourceCareerIds.length).toBeGreaterThan(0);
      expect(recommendation.sourceHobbyIds.length).toBeGreaterThan(0);
      expect(recommendation.safetyNote).toBeTruthy();
      expect(recommendation.costNote).toBeTruthy();
      expect(recommendation.accessibilityNote).toBeTruthy();
    }
    expect(taxonomy.experimentMinutes).toBe(20);
  });

  it("enforces safety and accessibility as explicit guardrails", () => {
    const lowRisk = recommendExploration({ ...BASE, maxRisk: "low" }, explorationTaxonomy().length, "en");
    expect(lowRisk.recommendations.some((item) => item.id === "recipe-prototype")).toBe(false);
    expect(lowRisk.excludedByGuardrail).toBeGreaterThan(0);

    const accessible = recommendExploration(goldenInput("balanced", "accessibleRemoteQuiet30"), explorationTaxonomy().length, "en");
    const candidates = new Map(explorationTaxonomy().map((candidate) => [candidate.id, candidate]));
    for (const recommendation of accessible.recommendations) {
      expect(candidates.get(recommendation.id)?.accessibility).toEqual(expect.arrayContaining(["seated", "low-impact", "quiet", "remote"]));
    }
  });

  it("shows an honest counter reason when cost, space, or social mode does not fit", () => {
    const result = recommendExploration({ ...BASE, budget: "free", space: "home-small", socialMode: "solo", maxRisk: "moderate" }, explorationTaxonomy().length, "en");
    const recipe = result.recommendations.find((item) => item.id === "recipe-prototype")!;
    expect(recipe.featureScores.budget).toBe(40);
    expect(recipe.featureScores.space).toBe(20);
    expect(recipe.counterReasons.map((reason) => reason.feature)).toEqual(expect.arrayContaining(["space"]));
    expect(recipe.costNote).toContain("fixed ingredient cap");

    const peer = result.recommendations.find((item) => item.id === "peer-explanation")!;
    expect(peer.featureScores.social).toBe(20);
    expect(peer.counterReasons.map((reason) => reason.feature)).toContain("social");
  });

  it("strictly rejects incomplete, unknown, and out-of-range inputs", () => {
    expect(() => recommendExploration({ ...BASE, interests: { R: 50 } }, 5, "en")).toThrow("interests must contain exactly");
    expect(() => recommendExploration({ ...BASE, interests: { ...BASE.interests, R: 101 } }, 5, "en")).toThrow("interests.R must be 0..100");
    expect(() => recommendExploration({ ...BASE, timeMinutes: 19 }, 5, "en")).toThrow("timeMinutes");
    expect(() => recommendExploration({ ...BASE, accessibilityNeeds: ["unknown"] }, 5, "en")).toThrow("accessibilityNeeds");
    expect(() => recommendExploration(BASE, 0, "en")).toThrow("limit");
  });
});
