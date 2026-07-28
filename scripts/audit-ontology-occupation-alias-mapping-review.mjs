import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [review, cohort] = await Promise.all([
  readFile(resolve(V2, "occupation-alias-mapping-review-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-candidate-cohort-v1.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation alias-mapping review audit failed: ${message}`); };
if (review.schema !== "oiyo.ontology-occupation-alias-mapping-review" || review.schemaVersion !== 1 || review.status !== "review_material_only" || review.legacyCanonicalOccupations !== 308 || !review.matchingMethod?.includes("normalized exact") || JSON.stringify(review.prohibitedInference) !== JSON.stringify(["semantic_similarity_as_equivalence", "automatic_alias_creation", "automatic_canonical_merge", "career_fit_or_employability_inference"])) fail("review envelope/boundary");
if (review.sourceCohort?.size !== 892 || review.mappings?.length !== 892 || review.summary?.approved !== 12 || review.summary?.rejected !== 0 || review.summary?.reviewRequired !== 880) fail("review coverage");
const cohortByKey = new Map(cohort.cohort.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
for (const mapping of review.mappings) {
  const key = `${mapping.sourceId}:${mapping.externalId}`;
  const allowed = ["review_required", "approved_distinct_canonical_candidate"];
  if (!cohortByKey.has(key) || mapping.label !== cohortByKey.get(key).label || !allowed.includes(mapping.status) || mapping.disposition !== "no_normalized_exact_legacy_label_or_alias_overlap" || mapping.canonicalIds?.length !== 0) fail(`mapping entry: ${key}`);
}
console.log(`Ontology occupation alias-mapping review audit PASS: ${review.summary.approved} user-approved distinct pilot candidates, ${review.summary.reviewRequired} review-required; no automatic aliases or merges.`);
