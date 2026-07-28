import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V1 = resolve(ROOT, "config/ontology-platform/v1");
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [handoff, staging, concepts, cohort, localePacket, readiness, approval] = await Promise.all([
  readFile(resolve(V2, "occupation-promotion-handoff-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "candidate-staging-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V1, "concepts.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-candidate-cohort-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-locale-label-packet-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-facet-readiness-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-pilot-review-approval-v1.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation promotion handoff audit failed: ${message}`); };
const HUMAN_GATES = ["golden_ranking_fixture_review_before_canonical_import"];
const FORBIDDEN = ["promote_review_queue", "infer_equivalent_occupation_from_similarity", "add_canonical_alias_without_review", "infer_work_context_or_fit", "use_unreviewed_labels_as_fallback"];
if (handoff.schema !== "oiyo.ontology-occupation-promotion-handoff" || handoff.schemaVersion !== 1 || handoff.status !== "partial_human_review_approved_for_staging" || handoff.canonicalMutation !== false || handoff.currentCanonicalOccupationCount !== 308 || handoff.targetCanonicalOccupationCount !== 1200) fail("handoff envelope");
if (JSON.stringify(handoff.requiredHumanGates) !== JSON.stringify(HUMAN_GATES) || JSON.stringify(handoff.automaticActionsForbidden) !== JSON.stringify(FORBIDDEN) || !Array.isArray(handoff.promotionSequence) || handoff.promotionSequence.length !== 5) fail("gates or promotion sequence");
if (handoff.preparedReviewCohort?.total !== 892 || handoff.preparedReviewCohort?.userApprovedStagedPilot !== 12 || handoff.preparedReviewCohort?.remainingReviewRequired !== 880 || cohort.cohort.length !== 892 || localePacket.packets.length !== 12 || readiness.entries.length !== 12 || approval.authority !== "user" || approval.scope !== "12-item ESCO pilot only") fail("prepared cohort state");
if (concepts.concepts.filter((concept) => concept.kind === "occupation").length !== 308 || staging.candidates.length !== 12 || staging.candidates.some((candidate) => candidate.status !== "review_ready" || candidate.canonicalPromotion !== "blocked_pending_golden_fixture_review" || candidate.workContextEdges !== "none_in_this_promotion_step")) fail("canonical/staging boundary");
for (const value of Object.values(handoff.evidence ?? {})) if (typeof value !== "string" || !value.trim()) fail("evidence linkage");
if (!handoff.handoff?.includes("Twelve user-approved ESCO records are in review_ready candidate staging")) fail("handoff text");
console.log("Ontology occupation promotion handoff audit PASS: 12 user-approved review-ready staging candidates, 0 canonical promotions or work-context edges; golden review remains fail-closed.");
