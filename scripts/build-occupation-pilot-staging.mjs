import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const V1 = resolve(ROOT, "config/ontology-platform/v1");
const [approval, labels, facets, cohort, concepts, staging] = await Promise.all([
  readFile(resolve(V2, "occupation-pilot-review-approval-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-locale-label-packet-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-facet-readiness-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-candidate-cohort-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V1, "concepts.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "candidate-staging-v1.json"), "utf8").then(JSON.parse),
]);
if (approval.authority !== "user" || approval.scope !== "12-item ESCO pilot only") throw new Error("missing user pilot approval");
const labelsByKey = new Map(labels.packets.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
const facetsByKey = new Map(facets.entries.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
const cohortByKey = new Map(cohort.cohort.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
const knownIds = new Set(concepts.concepts.map(({ id }) => id));
const slug = (value) => value.toLocaleLowerCase("en").normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const candidates = labels.packets.map((labelPacket) => {
  const key = `${labelPacket.sourceId}:${labelPacket.externalId}`;
  const facet = facetsByKey.get(key), source = cohortByKey.get(key);
  const id = `occupation.${slug(labelPacket.labels.en)}`;
  if (!facet || !source || knownIds.has(id)) throw new Error(`invalid or colliding pilot candidate: ${key}`);
  return { id, kind: "occupation", status: "review_ready", sourceIds: ["external:esco"], externalIds: { esco: labelPacket.externalId }, licenseReview: "approved_cc_by_4_0_attribution_and_change_notice", labels: labelPacket.labels, aliases: { en: source.aliases }, facets: facet.facets, rationale: facet.rationale, reviewedAt: approval.approvedAt, reviewAuthority: approval.authority, mappingDecision: "approved_distinct_canonical_candidate", workContextEdges: "none_in_this_promotion_step", canonicalPromotion: "blocked_pending_golden_fixture_review" };
});
staging.candidates = candidates;
await writeFile(resolve(V2, "candidate-staging-v1.json"), `${JSON.stringify(staging, null, 2)}\n`);
console.log(`Occupation pilot staging written: ${candidates.length} review-ready candidates; canonical promotion remains blocked.`);
