import type {
  AssessmentPlugin,
  AssessmentResponses,
  CanonicalAssessmentResult,
  InterpretationFragment,
} from "../../core";
import { buildAssessmentResult, type BuildAssessmentResultInput } from "../../core";
import { LIFE_VALUES_CARD_SORT_RELEASE_GATE } from "../../../../config/assessment-release-gates.js";
import {
  LIFE_VALUE_IDS,
  LIFE_VALUES_INSTRUMENT,
  LIFE_VALUES_ITEM_PROVENANCE,
  lifeValuesLocaleBundle,
} from "./data";
import { lifeValuesClassifications, lifeValuesScorer, topLifeValues } from "./scoring";

const SCHWARTZ_SOURCE_ID = "schwartz-1992-values-theory";
const WILSON_MURRELL_SOURCE_ID = "wilson-murrell-2004-values-work";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function compose(result: CanonicalAssessmentResult): InterpretationFragment[] {
  return topLifeValues(result.scores.normalized).map((id, index) => ({
    bodyKey: `lifeValues.interpretation.${id}.body`,
    caveatKey: "lifeValues.caveat.reflective-not-validated",
    evidenceTier: "reflective-framework",
    id: `life-values-${id}`,
    priority: 100 - index,
    scope: index === 0 ? "dimension" : "configuration",
    sourceRefs: [],
    titleKey: `cards.${id}.title`,
  }));
}

export const lifeValuesPlugin: AssessmentPlugin = {
  exportPolicy: {
    allowedFormats: ["json", "csv", "markdown"],
    includeResponsesByDefault: false,
    permalinkConstructs: [],
    sensitiveConstructs: [],
  },
  id: "life-values-card-sort",
  instrument: LIFE_VALUES_INSTRUMENT,
  interpreter: { compose, version: "life-values-top-five-interpretation-v1" },
  locale: lifeValuesLocaleBundle(),
  manifest: {
    analyticsId: "life_values_card_sort",
    category: "self-understanding",
    clinical: false,
    evidenceTier: "reflective-framework",
    estimatedMinutes: 5,
    id: "life-values-card-sort",
    indexable: LIFE_VALUES_CARD_SORT_RELEASE_GATE.indexable,
    kind: "preference",
    routes: { execution: LIFE_VALUES_CARD_SORT_RELEASE_GATE.executionRoutePattern },
    status: LIFE_VALUES_CARD_SORT_RELEASE_GATE.assessmentStatus,
    tags: ["values", "life-values", "work-values", "card-sort", "oiyo-original-prompts"],
  },
  migrations: [],
  ontology: {
    edges: [],
    nodes: LIFE_VALUE_IDS.map((id) => ({
      id: `values.chosen.${id}`,
      kind: "chosen-value",
      labelKey: `cards.${id}.title`,
    })),
    toSignals: (result) => topLifeValues(result.scores.normalized).map((id) => ({
      confidence: 0.35,
      constructId: `values.chosen.${id}`,
      evidenceTier: "reflective-framework",
      expiresAt: new Date(new Date(result.completedAt).getTime() + ONE_YEAR_MS).toISOString(),
      id: `${result.resultId}:${id}`,
      observedAt: result.completedAt,
      provenance: {
        instrumentVersion: result.versions.instrument,
        resultId: result.resultId,
        scoringVersion: result.versions.scoring,
      },
      scale: { min: 0, max: 100 },
      sourceAssessmentId: "life-values-card-sort",
      value: result.scores.normalized[id] ?? 0,
    })),
  },
  schemaVersion: 2,
  scorer: lifeValuesScorer,
  sources: {
    itemRefs: [],
    license: { note: LIFE_VALUES_ITEM_PROVENANCE, status: "original" },
    normRefs: [],
    records: [
      {
        accessedAt: "2026-07-14",
        citation: "Schwartz, S. H. (1992). Universals in the content and structure of values: Theoretical advances and empirical tests in 20 countries. Advances in Experimental Social Psychology, 25, 1–65. Theory reference only; it does not validate or supply OIYO cards.",
        doi: "10.1016/S0065-2601(08)60281-6",
        id: SCHWARTZ_SOURCE_ID,
        kind: "original-theory",
        reviewedAt: "2026-07-14",
        url: "https://doi.org/10.1016/S0065-2601(08)60281-6",
      },
      {
        accessedAt: "2026-07-14",
        citation: "Wilson, K. G., & Murrell, A. R. (2004). Values work in acceptance and commitment therapy: Setting a course for behavioral treatment. In Mindfulness and Acceptance: Expanding the Cognitive-Behavioral Tradition. Theory and practice reference only; it does not validate or supply OIYO cards.",
        id: WILSON_MURRELL_SOURCE_ID,
        kind: "original-theory",
        reviewedAt: "2026-07-14",
      },
    ],
    scoringRefs: [],
    theoryRefs: [SCHWARTZ_SOURCE_ID, WILSON_MURRELL_SOURCE_ID],
  },
};

export function buildLifeValuesResult(
  responses: AssessmentResponses,
  input: BuildAssessmentResultInput = {},
): CanonicalAssessmentResult {
  const result = buildAssessmentResult(lifeValuesPlugin, responses, input);
  const { responses: _rawResponses, ...safeResult } = result;
  return {
    ...safeResult,
    classifications: lifeValuesClassifications(result.scores.normalized, input.locale ?? "en"),
    quality: {
      ...result.quality,
      responseWarnings: [
        ...result.quality.responseWarnings,
        "Priorities are relative to this card set and this moment; they are not percentiles, norms, stable traits, or validated measurements.",
      ],
    },
  };
}
