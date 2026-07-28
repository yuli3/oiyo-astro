import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [staging, labels, facets] = await Promise.all([
  readFile(resolve(V2, "candidate-staging-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-locale-label-packet-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-facet-readiness-v1.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation pilot staging audit failed: ${message}`); };
if (staging.candidates.length !== 12 || new Set(staging.candidates.map(({ id }) => id)).size !== 12) fail("staging size/uniqueness");
const labelByKey = new Map(labels.packets.map((entry) => [`external:esco:${entry.externalId}`, entry]));
const facetsByKey = new Map(facets.entries.map((entry) => [`external:esco:${entry.externalId}`, entry]));
for (const candidate of staging.candidates) {
  const key = `external:esco:${candidate.externalIds?.esco}`;
  if (candidate.kind !== "occupation" || candidate.status !== "review_ready" || candidate.sourceIds?.join() !== "external:esco" || candidate.licenseReview !== "approved_cc_by_4_0_attribution_and_change_notice" || candidate.reviewAuthority !== "user" || candidate.mappingDecision !== "approved_distinct_canonical_candidate" || candidate.workContextEdges !== "none_in_this_promotion_step" || candidate.canonicalPromotion !== "blocked_pending_golden_fixture_review" || JSON.stringify(candidate.labels) !== JSON.stringify(labelByKey.get(key)?.labels) || JSON.stringify(candidate.facets) !== JSON.stringify(facetsByKey.get(key)?.facets) || !candidate.rationale?.trim() || !candidate.reviewedAt) fail(`candidate contract: ${candidate.id}`);
}
console.log("Ontology occupation pilot staging audit PASS: 12 user-approved review-ready candidates, no work-context edges, no canonical promotion pending golden review.");
