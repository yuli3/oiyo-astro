import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V1 = resolve(ROOT, "config/ontology-platform/v1");
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [index, inventory, concepts] = await Promise.all([
  readFile(resolve(V2, "occupation-source-index-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-source-inventory-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V1, "concepts.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation source-index audit failed: ${message}`); };
if (index.schema !== "oiyo.ontology-occupation-source-index" || index.schemaVersion !== 1 || index.status !== "review_material_only" || JSON.stringify(index.localeCoverage) !== JSON.stringify(["en"]) || !index.safety?.includes("not canonical")) fail("index envelope/boundary");
if (index.summary?.canonicalOccupationsCompared !== 308 || index.summary?.indexed !== 4055 || index.summary?.bySource?.["external:esco"] !== 3039 || index.summary?.bySource?.["external:onet"] !== 1016 || index.summary?.sourceRows?.escoReleased !== 3043 || index.summary?.sourceRows?.escoDuplicateRowsDeduped !== 4 || index.summary?.sourceRows?.onet !== 1016) fail("index coverage");
const inventoryHashes = new Map(inventory.files.map((file) => [file.id, file.sha256]));
if (index.sourceInventory.some((file) => inventoryHashes.get(file.id) !== file.sha256)) fail("inventory provenance drift");
const ids = new Set();
for (const entry of index.entries) {
  const key = `${entry.sourceId}:${entry.externalId}`;
  if (!ids.add(key) || !["external:esco", "external:onet"].includes(entry.sourceId) || !entry.label?.trim() || !Array.isArray(entry.aliases) || !entry.classification || Object.hasOwn(entry, "description")) fail(`entry contract: ${key}`);
}
const canonicalIds = new Set(concepts.concepts.filter((concept) => concept.kind === "occupation").map(({ id }) => id));
for (const match of index.exactMatches) if (match.matchType !== "normalized_exact_label_or_alias" || !match.label || !match.canonicalIds?.length || match.canonicalIds.some((id) => !canonicalIds.has(id))) fail(`exact match contract: ${match.externalId}`);
if (index.summary.exactMatches !== index.exactMatches.length || index.summary.reviewRequired !== index.entries.length - index.exactMatches.length || !index.nextStep?.includes("Do not promote")) fail("review queue contract");
console.log(`Ontology occupation source-index audit PASS: ${index.entries.length} English source entries, ${index.exactMatches.length} exact string overlaps, ${index.summary.reviewRequired} review-required; no canonical promotion.`);
