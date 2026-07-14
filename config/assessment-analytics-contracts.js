import { CAREER_VALUES_RELEASE_GATE } from "./assessment-release-gates.js";

export const CAREER_VALUES_ANALYTICS_CONTRACT = Object.freeze({
  assessmentId: "career-values",
  instrumentVersion: "career-values-oiyo-18-v1",
  deployment: Object.freeze({
    status: "deployed-draft-noindex",
    instrumentedAt: "2026-07-14T20:01:37+09:00",
    minimumFullObservationDays: 7,
    note: "Observation started when production CI confirmed the first deployment containing this event contract. Draft/noindex status is independent from analytics deployment.",
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
