import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const OUTPUT = resolve(V2, "occupation-alias-mapping-review-v1.json");
const [cohort, index, approval, labels] = await Promise.all([
  readFile(resolve(V2, "occupation-candidate-cohort-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-source-index-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-pilot-review-approval-v1.json"), "utf8").then(JSON.parse), readFile(resolve(V2, "occupation-locale-label-packet-v1.json"), "utf8").then(JSON.parse),
]);
const approvedKeys = new Set(labels.packets.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`));
const exactKeys = new Set(index.exactMatches.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`));
const mappings = cohort.cohort.map((entry) => {
  const key = `${entry.sourceId}:${entry.externalId}`;
  if (exactKeys.has(key)) throw new Error(`cohort unexpectedly contains exact overlap: ${key}`);
  const approved = approval.authority === "user" && approvedKeys.has(key);
  return { sourceId: entry.sourceId, externalId: entry.externalId, label: entry.label, status: approved ? "approved_distinct_canonical_candidate" : "review_required", disposition: "no_normalized_exact_legacy_label_or_alias_overlap", canonicalIds: [], reason: approved ? "User approved this bounded pilot as a distinct canonical candidate after confirming the no-exact-overlap review; no alias or merge is created." : "Source label and aliases have no normalized exact overlap with the existing 308 canonical occupations. Semantic similarity is not sufficient to create an alias or mapping." };
});
const document = {
  schema: "oiyo.ontology-occupation-alias-mapping-review",
  schemaVersion: 1,
  status: "review_material_only",
  sourceCohort: { schema: cohort.schema, schemaVersion: cohort.schemaVersion, size: cohort.cohort.length },
  legacyCanonicalOccupations: 308,
  matchingMethod: "Unicode NFKD, English lowercase, punctuation-to-space, whitespace collapse; this batch accepts normalized exact label/alias overlap only.",
  prohibitedInference: ["semantic_similarity_as_equivalence", "automatic_alias_creation", "automatic_canonical_merge", "career_fit_or_employability_inference"],
  summary: { approved: mappings.filter(({ status }) => status === "approved_distinct_canonical_candidate").length, rejected: 0, reviewRequired: mappings.filter(({ status }) => status === "review_required").length },
  mappings,
  nextBatch: "The 12 user-approved pilot entries may move to review_ready staging without aliases or work-context edges. The remaining entries require review and must not be promoted."
};
if (!process.argv.includes("--write")) console.log(JSON.stringify(document.summary, null, 2));
else { await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`); console.log(`Occupation alias mapping review written: ${document.summary.approved} approved, ${document.summary.reviewRequired} review-required, 0 automatic aliases or merges`); }
