import type { AssessmentPlugin, AssessmentResponses, CanonicalAssessmentResult, InterpretationFragment } from "../../core";
import { ADULT_ATTACHMENT_RELEASE_GATE } from "../../../../config/assessment-release-gates.js";
import { buildAssessmentResult, type BuildAssessmentResultInput } from "../../core";
import { ATTACHMENT_DIMENSIONS, ATTACHMENT_INSTRUMENT, ATTACHMENT_ITEM_PROVENANCE, attachmentLocaleBundle } from "./data";
import { attachmentScorer } from "./scoring";

const SOURCE_ID = "ecr-rs-method-reference-only";

function compose(result: CanonicalAssessmentResult): InterpretationFragment[] {
  return ATTACHMENT_DIMENSIONS.map((dimension) => ({
    bodyKey: `attachment.interpretation.${dimension}.continuous.body`,
    caveatKey: "attachment.caveat.contextual-not-diagnostic",
    evidenceTier: "educational",
    id: `attachment-${dimension}`,
    priority: 50,
    scope: "dimension",
    sourceRefs: [],
    titleKey: `attachment.dimension.${dimension}`,
  }));
}

export const attachmentPlugin: AssessmentPlugin = {
  exportPolicy: {
    allowedFormats: ["json", "csv", "markdown"],
    includeResponsesByDefault: false,
    permalinkConstructs: [],
    sensitiveConstructs: ATTACHMENT_DIMENSIONS.map((dimension) => `relationship.attachment.${dimension}`),
  },
  id: "adult-attachment",
  instrument: ATTACHMENT_INSTRUMENT,
  interpreter: { compose, version: "attachment-anxiety-avoidance-interpretation-v1" },
  locale: attachmentLocaleBundle(),
  manifest: {
    analyticsId: "adult_attachment",
    category: "relationships",
    clinical: false,
    evidenceTier: "educational",
    estimatedMinutes: 3,
    id: "adult-attachment",
    indexable: ADULT_ATTACHMENT_RELEASE_GATE.indexable,
    kind: "psychometric",
    routes: {
      blog: "https://blog.oiyo.net/{locale}/psychology-attachment-style-test/",
      execution: "/{locale}/attachment-style/test",
      wiki: "https://wiki.oiyo.net/{locale}/meaning-of-attachment-theory/",
    },
    status: ADULT_ATTACHMENT_RELEASE_GATE.assessmentStatus,
    tags: ["adult-attachment", "relationships", "anxiety", "avoidance", "oiyo-original-items"],
  },
  migrations: [],
  ontology: {
    edges: [],
    nodes: ATTACHMENT_DIMENSIONS.map((dimension) => ({
      id: `relationship.attachment.${dimension}`,
      kind: "relationship-tendency",
      labelKey: `attachment.dimension.${dimension}`,
    })),
    toSignals: (result) => ATTACHMENT_DIMENSIONS.map((dimension) => ({
      confidence: 0.25,
      constructId: `relationship.attachment.${dimension}`,
      evidenceTier: "educational",
      expiresAt: new Date(new Date(result.completedAt).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      id: `${result.resultId}:${dimension}`,
      observedAt: result.completedAt,
      provenance: { instrumentVersion: result.versions.instrument, resultId: result.resultId, scoringVersion: result.versions.scoring },
      scale: { min: 0, max: 100 },
      sourceAssessmentId: "adult-attachment",
      value: result.scores.normalized[dimension] ?? 0,
    })),
  },
  schemaVersion: 2,
  scorer: attachmentScorer,
  sources: {
    itemRefs: [],
    license: { note: ATTACHMENT_ITEM_PROVENANCE, status: "original" },
    normRefs: [],
    records: [{
      accessedAt: "2026-07-14",
      citation: "Fraley, Heffernan, Vicary, & Brumbaugh (2011). The Experiences in Close Relationships—Relationship Structures Questionnaire. Reviewed only as a method and exclusion reference; it is not the OIYO instrument or evidence validating OIYO items.",
      doi: "10.1037/a0022898",
      id: SOURCE_ID,
      kind: "validation-study",
      reviewedAt: "2026-07-14",
      url: "https://doi.org/10.1037/a0022898",
    }],
    scoringRefs: [],
    theoryRefs: [],
  },
};

export function buildAttachmentResult(
  responses: AssessmentResponses,
  input: BuildAssessmentResultInput = {},
): CanonicalAssessmentResult {
  const result = buildAssessmentResult(attachmentPlugin, responses, input);
  return {
    ...result,
    classifications: [],
    quality: {
      ...result.quality,
      responseWarnings: [
        ...result.quality.responseWarnings,
        "Scores are descriptive positions on draft OIYO-authored items, not norms, percentiles, diagnoses, validated measurements, or category cutoffs.",
        "Attachment tendencies can vary by relationship context and time.",
      ],
    },
  };
}
