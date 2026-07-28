import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [readiness, labels, mapping] = await Promise.all([
  readFile(resolve(V2, "occupation-facet-readiness-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-locale-label-packet-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-alias-mapping-review-v1.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation facet-readiness audit failed: ${message}`); };
const FACETS = ["create","repair","protect","record","explore","physical","social","precision","structure","autonomy","care","novelty"];
if (readiness.schema !== "oiyo.ontology-occupation-facet-readiness" || readiness.schemaVersion !== 1 || readiness.status !== "editorial_reviewed_by_user" || readiness.promotionEligible !== true || JSON.stringify(readiness.facets) !== JSON.stringify(FACETS) || !readiness.boundary?.includes("not state a person's ability") || !readiness.sharedCounterexample?.trim() || !readiness.sharedUncertainty?.includes("not a job analysis")) fail("readiness envelope/boundary");
if (!Array.isArray(readiness.entries) || readiness.entries.length !== 12 || new Set(readiness.entries.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`)).size !== 12) fail("readiness size/uniqueness");
const labelKeys = new Set(labels.packets.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`));
const mappingByKey = new Map(mapping.mappings.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
const goldenIds = new Set();
for (const entry of readiness.entries) {
  const key = `${entry.sourceId}:${entry.externalId}`;
  if (!labelKeys.has(key) || mappingByKey.get(key)?.status !== "approved_distinct_canonical_candidate" || !entry.rationale?.includes("not a job requirement or fit claim") || !entry.goldenReadiness?.id || goldenIds.has(entry.goldenReadiness.id) || entry.goldenReadiness.required !== "source+six-locale-label+complete-facets+rationale+counterexample+uncertainty" || entry.goldenReadiness.canonicalRankingFixture !== false) fail(`entry readiness: ${key}`);
  goldenIds.add(entry.goldenReadiness.id);
  if (Object.keys(entry.facets ?? {}).length !== FACETS.length || FACETS.some((facet) => !Number.isInteger(entry.facets[facet]) || entry.facets[facet] < 0 || entry.facets[facet] > 3)) fail(`facet vector: ${key}`);
}
console.log(`Ontology occupation facet-readiness audit PASS: ${readiness.entries.length} provisional complete vectors with provenance/rationale/counterexample/uncertainty; no canonical ranking fixture or promotion.`);
