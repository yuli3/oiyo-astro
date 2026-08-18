import type {
  AssessmentPlugin,
  CanonicalAssessmentResult,
  InterpretationFragment,
  OntologySignal,
} from "../../core";
import { buildAssessmentResult, type BuildAssessmentResultInput } from "../../core";
import type { AssessmentResponses } from "../../core";
import {
  RIASEC_DIMENSION_NAMES,
  RIASEC_DIMENSIONS,
  RIASEC_FULL_INSTRUMENT,
  RIASEC_ITEM_PROVENANCE,
  RIASEC_QUICK_INSTRUMENT,
  riasecLocaleBundle,
} from "./data";
import { riasecClassifications, riasecScorer, topRiasecDimensions } from "./scoring";

const SOURCE_ID = "holland-riasec-theory";
const INTERPRETATION_VERSION = "riasec-top3-interpretation-v1";

function compose(result: CanonicalAssessmentResult): InterpretationFragment[] {
  return topRiasecDimensions(result.scores.normalized).map((dimension, index) => ({
    bodyKey: `riasec.interpretation.${dimension}.body`,
    caveatKey: "riasec.caveat.oiyo-original-items",
    evidenceTier: "research-inspired",
    id: `riasec-rank-${index + 1}-${dimension}`,
    priority: 100 - index,
    scope: index === 0 ? "dimension" : "configuration",
    sourceRefs: [SOURCE_ID],
    titleKey: `riasec.dimension.${dimension}`,
  }));
}

function ontologySignals(
  assessmentId: string,
  confidence: number,
  result: CanonicalAssessmentResult,
): OntologySignal[] {
  return RIASEC_DIMENSIONS.map((dimension) => ({
    confidence,
    constructId: `vocation.riasec.${dimension}`,
    evidenceTier: "research-inspired",
    id: `${result.resultId}:${dimension}`,
    observedAt: result.completedAt,
    provenance: {
      instrumentVersion: result.versions.instrument,
      resultId: result.resultId,
      scoringVersion: result.versions.scoring,
    },
    scale: { max: 100, min: 0 },
    sourceAssessmentId: assessmentId,
    value: result.scores.normalized[dimension] ?? 0,
  }));
}

function createPlugin(
  id: "riasec" | "riasec-quick",
  quick: boolean,
): AssessmentPlugin {
  const instrument = quick ? RIASEC_QUICK_INSTRUMENT : RIASEC_FULL_INSTRUMENT;
  const confidence = quick ? 0.5 : 0.65;
  return {
    exportPolicy: {
      allowedFormats: ["json", "csv", "markdown", "png", "permalink"],
      includeResponsesByDefault: false,
      permalinkConstructs: RIASEC_DIMENSIONS.map((dimension) => `vocation.riasec.${dimension}`),
      sensitiveConstructs: [],
    },
    id,
    instrument,
    interpreter: { compose, version: INTERPRETATION_VERSION },
    locale: riasecLocaleBundle(quick),
    manifest: {
      analyticsId: id,
      category: "career",
      clinical: false,
      evidenceTier: "research-inspired",
      estimatedMinutes: quick ? 2 : 4,
      id,
      indexable: true,
      kind: "psychometric",
      routes: {
        blog: "https://blog.oiyo.net/{locale}/riasec-career-guide/",
        execution: quick ? "/{locale}/riasec-quick" : "/{locale}/riasec-career-test",
        wiki: "https://wiki.oiyo.net/{locale}/meaning-of-riasec/",
      },
      status: "review",
      tags: ["career", "holland-code", "oiyo-original-items", quick ? "quick" : "full"],
    },
    migrations: [],
    ontology: {
      edges: [],
      nodes: RIASEC_DIMENSIONS.map((dimension) => ({
        id: `vocation.riasec.${dimension}`,
        kind: "vocational-interest",
        labelKey: `riasec.dimension.${dimension}`,
      })),
      toSignals: (result) => ontologySignals(id, confidence, result),
    },
    schemaVersion: 2,
    scorer: riasecScorer,
    sources: {
      itemRefs: [],
      license: { note: RIASEC_ITEM_PROVENANCE.note, status: "original" },
      normRefs: [],
      records: [{
        accessedAt: "2026-07-13",
        citation: "Holland, J. L. (1959). A Theory of Vocational Choice. Journal of Counseling Psychology, 6(1), 35–45. Theory reference only; OIYO authored the assessment items.",
        doi: "10.1037/h0040767",
        id: SOURCE_ID,
        kind: "original-theory",
        reviewedAt: "2026-07-13",
        url: "https://doi.org/10.1037/h0040767",
      }],
      scoringRefs: [],
      theoryRefs: [SOURCE_ID],
    },
  };
}

export const riasecFullPlugin = createPlugin("riasec", false);
export const riasecQuickPlugin = createPlugin("riasec-quick", true);

export function buildRiasecResult(
  plugin: typeof riasecFullPlugin | typeof riasecQuickPlugin,
  responses: AssessmentResponses,
  input: BuildAssessmentResultInput = {},
): CanonicalAssessmentResult {
  const result = buildAssessmentResult(plugin, responses, input);
  return {
    ...result,
    classifications: riasecClassifications(result.scores.normalized),
  };
}

export function riasecCode(result: CanonicalAssessmentResult): string {
  return topRiasecDimensions(result.scores.normalized).join("");
}

export { RIASEC_DIMENSION_NAMES };
