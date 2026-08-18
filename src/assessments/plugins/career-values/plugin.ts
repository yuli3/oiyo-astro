import type { AssessmentPlugin, AssessmentResponses, CanonicalAssessmentResult, InterpretationFragment } from "../../core";
import { buildAssessmentResult, type BuildAssessmentResultInput } from "../../core";
import { CAREER_VALUES_RELEASE_GATE } from "../../../../config/assessment-release-gates.js";
import { CAREER_VALUE_IDS } from "./copy";
import { CAREER_VALUES_INSTRUMENT, CAREER_VALUES_ITEM_PROVENANCE, careerValuesLocaleBundle } from "./data";
import { careerValuesClassifications, careerValuesScorer, topCareerValueGroup } from "./scoring";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
function compose(result: CanonicalAssessmentResult): InterpretationFragment[] { return topCareerValueGroup(result.scores.normalized).map((id, index) => ({ id: `career-values-${id}`, titleKey: `dimensions.${id}.name`, bodyKey: `dimensions.${id}.description`, caveatKey: "careerValues.caveat.original-reflection", evidenceTier: "reflective-framework", priority: 100 - index, scope: "dimension", sourceRefs: [] })); }

export const careerValuesPlugin: AssessmentPlugin = {
  id: "career-values", schemaVersion: 2, instrument: CAREER_VALUES_INSTRUMENT, scorer: careerValuesScorer,
  interpreter: { compose, version: "career-values-top-tie-group-v1" }, locale: careerValuesLocaleBundle(), migrations: [],
  manifest: { id: "career-values", analyticsId: "career_values", category: "self-understanding", clinical: false, evidenceTier: "reflective-framework", estimatedMinutes: 4, indexable: CAREER_VALUES_RELEASE_GATE.indexable, kind: "preference", routes: { execution: CAREER_VALUES_RELEASE_GATE.executionRoutePattern }, status: CAREER_VALUES_RELEASE_GATE.assessmentStatus, tags: ["work-values", "career-reflection", "oiyo-original-items"] },
  exportPolicy: { allowedFormats: ["json", "csv", "markdown"], includeResponsesByDefault: false, permalinkConstructs: [], sensitiveConstructs: [] },
  ontology: {
    edges: [], nodes: CAREER_VALUE_IDS.map((id) => ({ id: `values.work.${id}`, kind: "work-value", labelKey: `dimensions.${id}.name` })),
    toSignals: (result) => topCareerValueGroup(result.scores.normalized).map((id) => ({ id: `${result.resultId}:${id}`, sourceAssessmentId: "career-values", constructId: `values.work.${id}`, value: result.scores.normalized[id] ?? 0, scale: { min: 0, max: 100 }, confidence: 0.35, evidenceTier: "reflective-framework", observedAt: result.completedAt, expiresAt: new Date(new Date(result.completedAt).getTime() + ONE_YEAR_MS).toISOString(), provenance: { resultId: result.resultId, instrumentVersion: result.versions.instrument, scoringVersion: result.versions.scoring } })),
  },
  sources: { itemRefs: [], normRefs: [], scoringRefs: [], theoryRefs: ["onet-work-values-26.1", "careeronestop-work-values-matcher"], license: { status: "original", note: CAREER_VALUES_ITEM_PROVENANCE }, records: [
    { id: "onet-work-values-26.1", kind: "official-framework", accessedAt: "2026-07-14", reviewedAt: "2026-07-14", url: "https://www.onetcenter.org/dictionary/26.1/text/work_values.html", citation: "O*NET Work Values, Database 26.1. Concept reference only; its six official values differ from OIYO's original dimensions and do not validate this instrument." },
    { id: "careeronestop-work-values-matcher", kind: "official-framework", accessedAt: "2026-07-14", reviewedAt: "2026-07-14", url: "https://www.careeronestop.org/Toolkit/Careers/work-values-matcher.aspx", citation: "CareerOneStop Work Values Matcher. Concept reference only; OIYO does not reproduce its 20-card activity and is not validated by it." },
  ] },
};

export function buildCareerValuesResult(responses: AssessmentResponses, input: BuildAssessmentResultInput = {}): CanonicalAssessmentResult {
  const result = buildAssessmentResult(careerValuesPlugin, responses, input);
  const { responses: _responses, ...safe } = result;
  return { ...safe, classifications: careerValuesClassifications(result.scores.normalized, input.locale ?? "en"), quality: { ...result.quality, responseWarnings: [...result.quality.responseWarnings, "Scores summarize responses to original OIYO prompts; they are not norms, percentiles, stable traits, or evidence of career fit."] } };
}
