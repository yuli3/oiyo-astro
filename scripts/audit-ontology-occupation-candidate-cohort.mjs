import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [cohort, index] = await Promise.all([
  readFile(resolve(V2, "occupation-candidate-cohort-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-source-index-v1.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation candidate-cohort audit failed: ${message}`); };
if (cohort.schema !== "oiyo.ontology-occupation-candidate-cohort" || cohort.schemaVersion !== 1 || cohort.status !== "review_queue_only" || cohort.targetAdditionalOccupations !== 892 || !cohort.selectionPolicy?.includes("Cycle through sorted ISCO groups") || !Array.isArray(cohort.boundaries) || !cohort.boundaries.includes("not_candidate_staging") || !cohort.boundaries.includes("no_automatic_translation")) fail("cohort envelope/boundaries");
if (!Array.isArray(cohort.cohort) || cohort.cohort.length !== 892 || new Set(cohort.cohort.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`)).size !== 892) fail("cohort size or uniqueness");
const exactKeys = new Set(index.exactMatches.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`));
const indexEntries = new Map(index.entries.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
for (const entry of cohort.cohort) {
  const key = `${entry.sourceId}:${entry.externalId}`;
  const indexed = indexEntries.get(key);
  if (entry.sourceId !== "external:esco" || exactKeys.has(key) || !indexed || entry.label !== indexed.label || JSON.stringify(entry.aliases) !== JSON.stringify(indexed.aliases) || JSON.stringify(entry.classification) !== JSON.stringify(indexed.classification) || !Number.isInteger(entry.queuePass) || entry.queuePass < 1 || !entry.selectionReason?.includes("requires mapping")) fail(`cohort entry: ${key}`);
}
const groups = new Set(cohort.cohort.map(({ classification }) => classification.iscoGroup));
if (groups.size !== 415 || !cohort.nextBatch?.includes("source-scoped alias/mapping")) fail("coverage/next batch");
console.log(`Ontology occupation candidate-cohort audit PASS: ${cohort.cohort.length} review-only ESCO entries across ${groups.size} ISCO groups; no staging or canonical promotion.`);
