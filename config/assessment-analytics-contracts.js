import { CAREER_VALUES_RELEASE_GATE } from "./assessment-release-gates.js";

export const CAREER_VALUES_ANALYTICS_CONTRACT = Object.freeze({
  assessmentId: "career-values",
  instrumentVersion: "career-values-oiyo-18-v1",
  deployment: Object.freeze({
    status: "not-deployed",
    instrumentedAt: null,
    minimumFullObservationDays: 7,
    note: "Start the observation clock from the first production deployment containing this contract, not from implementation or QA time.",
  }),
  events: Object.freeze({
    test_started: Object.freeze(["test_id", "instrument_version"]),
    test_completed: Object.freeze(["test_id", "instrument_version"]),
    share_click: Object.freeze(["test_id", "instrument_version"]),
  }),
  semantics: Object.freeze({
    test_started: "first answered item",
    test_completed: "all required items scored and result stored",
    share_click: "share attempt initiated; not a successful-share confirmation",
  }),
  forbiddenPayloadClasses: Object.freeze(["answers", "dimension_scores", "result_labels", "free_text", "user_identifiers"]),
  indexableDuringWarmup: CAREER_VALUES_RELEASE_GATE.indexable,
});
