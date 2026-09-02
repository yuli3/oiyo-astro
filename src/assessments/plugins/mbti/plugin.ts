import type {
  AssessmentPlugin,
  AssessmentResponses,
  CanonicalAssessmentResult,
  InterpretationFragment,
} from "../../core";
import { buildAssessmentResult, type BuildAssessmentResultInput } from "../../core";
import {
  MBTI_AXES,
  MBTI_INSTRUMENT,
  MBTI_ITEM_PROVENANCE,
  mbtiLocaleBundle,
} from "./data";
import { mbtiClassification, mbtiScorer, mbtiType } from "./scoring";

function compose(result: CanonicalAssessmentResult): InterpretationFragment[] {
  const type = mbtiType(result);
  return [{
    bodyKey: `mbti.types.${type}.body`,
    caveatKey: "mbti.caveat.reflective-not-official",
    evidenceTier: "reflective-framework",
    id: `mbti-${type}`,
    priority: 100,
    scope: "configuration",
    sourceRefs: ["myers-briggs-preference-pairs"],
    titleKey: `mbti.types.${type}.title`,
  }];
}

export const mbtiPlugin: AssessmentPlugin = {
  exportPolicy: {
    allowedFormats: ["json", "csv", "markdown", "png", "permalink"],
    includeResponsesByDefault: false,
    permalinkConstructs: MBTI_AXES.map((axis) => `personality.mbti.preference.${axis}`),
    sensitiveConstructs: [],
  },
  id: "mbti",
  instrument: MBTI_INSTRUMENT,
  interpreter: { compose, version: "mbti-preference-interpretation-v1" },
  locale: mbtiLocaleBundle(),
  manifest: {
    analyticsId: "mbti",
    category: "personality",
    clinical: false,
    evidenceTier: "reflective-framework",
    estimatedMinutes: 3,
    id: "mbti",
    indexable: true,
    kind: "preference",
    routes: {
      execution: "/{locale}/mbti/test",
      wiki: "https://oiyo.net/{locale}/mbti/about/",
    },
    status: "review",
    tags: ["mbti", "preference", "reflection", "oiyo-original-items"],
  },
  migrations: [],
  ontology: {
    edges: [],
    nodes: MBTI_AXES.map((axis) => ({
      id: `personality.mbti.preference.${axis}`,
      kind: "personality-preference",
      labelKey: `mbti.axis.${axis}`,
    })),
    toSignals: (result) => MBTI_AXES.flatMap((axis) => {
      const value = result.scores.normalized[axis];
      if (typeof value !== "number" || !Number.isFinite(value)) return [];
      return [{
      confidence: 0.25 + (Math.abs(value - 50) / 50) * 0.25,
      constructId: `personality.mbti.preference.${axis}`,
      evidenceTier: "reflective-framework",
      id: `${result.resultId}:${axis}`,
      observedAt: result.completedAt,
      provenance: {
        instrumentVersion: result.versions.instrument,
        resultId: result.resultId,
        scoringVersion: result.versions.scoring,
      },
      scale: { max: 100, min: 0 },
      sourceAssessmentId: "mbti",
      value,
    }];
    }),
  },
  schemaVersion: 2,
  scorer: mbtiScorer,
  sources: {
    itemRefs: [],
    license: { note: MBTI_ITEM_PROVENANCE, status: "original" },
    normRefs: [],
    records: [{
      accessedAt: "2026-07-13",
      citation: "Myers & Briggs Foundation. The MBTI Preference Pairs. Framework reference only; OIYO authored the assessment items.",
      id: "myers-briggs-preference-pairs",
      kind: "official-framework",
      reviewedAt: "2026-07-13",
      url: "https://www.myersbriggs.org/my-mbti-personality-type/the-mbti-preferences/",
    }],
    scoringRefs: [],
    theoryRefs: ["myers-briggs-preference-pairs"],
  },
};

export function buildMbtiResult(
  responses: AssessmentResponses,
  input: BuildAssessmentResultInput = {},
): CanonicalAssessmentResult {
  const result = buildAssessmentResult(mbtiPlugin, responses, input);
  return {
    ...result,
    classifications: mbtiClassification(result.scores.normalized),
    quality: {
      ...result.quality,
      responseWarnings: [
        ...result.quality.responseWarnings,
        "Axis uncertainty and signal confidence are descriptive four-item vote-distance heuristics, not statistical confidence estimates.",
      ],
      uncertainty: Object.fromEntries(
        MBTI_AXES.map((axis) => [
          axis,
          1 - Math.abs((result.scores.normalized[axis] ?? 50) - 50) / 50,
        ]),
      ),
    },
  };
}

export { mbtiType };
