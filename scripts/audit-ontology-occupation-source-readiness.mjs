import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const readJson = (name) => readFile(resolve(V2, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(`Ontology occupation source-readiness audit failed: ${message}`); };
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];

const [registry, review] = await Promise.all([
  readJson("source-registry-v1.json"),
  readJson("occupation-source-mapping-review-v1.json"),
]);
if (review.schema !== "oiyo.ontology-occupation-source-mapping-review" || review.schemaVersion !== 1 || review.canonicalPromotionState !== "blocked_pending_official_snapshot_and_six_locale_review_packets") fail("review envelope or promotion state");
if (!Array.isArray(review.sources) || review.sources.length !== 3) fail("review source coverage");
const sources = new Map(review.sources.map((source) => [source.sourceId, source]));
for (const id of ["external:onet", "external:esco", "external:isco-08"]) if (!sources.has(id)) fail(`review source missing: ${id}`);
const registryById = new Map(registry.sources.map((source) => [source.id, source]));
for (const id of ["external:onet", "external:esco"]) {
  const source = registryById.get(id);
  if (source?.status !== "approved" || !source.licenseStatus.includes("cc_by_4_0") || !source.allowedClaims?.includes("occupation_label")) fail(`approved source registry contract: ${id}`);
  const reviewSource = sources.get(id);
  if (reviewSource.status !== "approved_for_limited_reference" || !reviewSource.license?.includes("CC BY 4.0") || !reviewSource.attribution?.trim() || !reviewSource.promotionBlocker?.trim()) fail(`review contract: ${id}`);
}
const isco = registryById.get("external:isco-08");
if (isco?.status !== "pending_license_and_mapping_review" || sources.get("external:isco-08").status !== "not_approved") fail("ISCO must remain unavailable for promotion");
if (JSON.stringify(review.mappingPolicy?.locale?.match(/\([^)]*\)/)?.[0]?.slice(1, -1).split(/,\s*/) ?? []) !== JSON.stringify(LOCALES)) fail("six-locale direct-label policy");
for (const key of ["canonicalId", "dedupe", "workContext", "locale", "provenance", "safety"]) if (typeof review.mappingPolicy?.[key] !== "string" || !review.mappingPolicy[key].trim()) fail(`mapping policy: ${key}`);
if (!Array.isArray(review.nextRequiredInputs) || review.nextRequiredInputs.length !== 4) fail("required input gate");
console.log("Ontology occupation source-readiness audit PASS: O*NET and ESCO limited-reference licences recorded; ISCO remains blocked; canonical occupation promotion requires a pinned snapshot and six reviewed locale labels.");
