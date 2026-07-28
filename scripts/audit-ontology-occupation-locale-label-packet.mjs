import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [packet, cohort, review] = await Promise.all([
  readFile(resolve(V2, "occupation-locale-label-packet-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-candidate-cohort-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-alias-mapping-review-v1.json"), "utf8").then(JSON.parse),
]);
const fail = (message) => { throw new Error(`Ontology occupation locale-label packet audit failed: ${message}`); };
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
if (packet.schema !== "oiyo.ontology-occupation-locale-label-packet" || packet.schemaVersion !== 1 || packet.status !== "editorial_reviewed_by_user" || packet.promotionEligible !== true || packet.sourceLocale !== "en" || JSON.stringify(packet.requiredLocales) !== JSON.stringify(LOCALES) || !packet.boundary?.includes("User-approved language review")) fail("packet envelope/boundary");
if (!Array.isArray(packet.packets) || packet.packets.length !== 12 || new Set(packet.packets.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`)).size !== 12) fail("packet size/uniqueness");
const cohortByKey = new Map(cohort.cohort.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
const mappingByKey = new Map(review.mappings.map((entry) => [`${entry.sourceId}:${entry.externalId}`, entry]));
for (const entry of packet.packets) {
  const key = `${entry.sourceId}:${entry.externalId}`;
  if (!cohortByKey.has(key) || mappingByKey.get(key)?.status !== "approved_distinct_canonical_candidate") fail(`packet source/mapping: ${key}`);
  for (const locale of LOCALES) if (typeof entry.labels?.[locale] !== "string" || !entry.labels[locale].trim()) fail(`direct label missing: ${key}.${locale}`);
  if (entry.labels.en !== cohortByKey.get(key).label.replace(/\b\w/g, (character) => character.toUpperCase())) fail(`English source label drift: ${key}`);
}
console.log(`Ontology occupation locale-label packet audit PASS: ${packet.packets.length} six-locale user-reviewed pilot packets; canonical promotion still requires goldens.`);
