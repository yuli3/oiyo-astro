import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const OUTPUT = resolve(V2, "occupation-candidate-cohort-v1.json");
const index = JSON.parse(await readFile(resolve(V2, "occupation-source-index-v1.json"), "utf8"));
const exactKeys = new Set(index.exactMatches.map(({ sourceId, externalId }) => `${sourceId}:${externalId}`));
const eligible = index.entries.filter((entry) => entry.sourceId === "external:esco" && !exactKeys.has(`${entry.sourceId}:${entry.externalId}`));
const groups = Object.groupBy(eligible, ({ classification }) => classification.iscoGroup);
const orderedGroups = Object.entries(groups).map(([iscoGroup, entries]) => [iscoGroup, [...entries].sort((left, right) => left.externalId.localeCompare(right.externalId, "en"))]).sort(([left], [right]) => left.localeCompare(right, "en"));
const selected = [];
for (let pass = 0; selected.length < 892; pass += 1) {
  let progress = false;
  for (const [iscoGroup, entries] of orderedGroups) {
    const entry = entries[pass];
    if (!entry) continue;
    selected.push({ sourceId: entry.sourceId, externalId: entry.externalId, label: entry.label, aliases: entry.aliases, classification: entry.classification, queuePass: pass + 1, selectionReason: "ESCO non-exact source entry selected by deterministic ISCO-group round-robin; requires mapping and locale review." });
    progress = true;
    if (selected.length === 892) break;
  }
  if (!progress) throw new Error("insufficient eligible ESCO entries for 892-candidate cohort");
}
const document = {
  schema: "oiyo.ontology-occupation-candidate-cohort",
  schemaVersion: 1,
  status: "review_queue_only",
  targetAdditionalOccupations: 892,
  sourceIndex: { schema: index.schema, schemaVersion: index.schemaVersion, sourceInventory: index.sourceInventory },
  selectionPolicy: "Select only ESCO English entries without a normalized exact overlap against the existing 308 canonical occupations. Cycle through sorted ISCO groups before taking a second entry from any group. This is coverage-oriented queueing, not semantic deduplication or a quality/ranking judgment.",
  excluded: { exactStringOverlaps: index.exactMatches.filter(({ sourceId }) => sourceId === "external:esco").length, onetEntries: index.summary.bySource["external:onet"] },
  boundaries: ["not_candidate_staging", "not_canonical_occupation_data", "english_source_label_only", "no_automatic_translation", "no_work_context_inference", "no_career_fit_hiring_income_or_identity_claim"],
  cohort: selected,
  nextBatch: "Review this cohort against the existing 308 occupations and record only source-scoped alias/mapping outcomes; unresolved items remain in the queue."
};
if (!process.argv.includes("--write")) console.log(JSON.stringify({ selected: selected.length, iscoGroups: new Set(selected.map(({ classification }) => classification.iscoGroup)).size, maxQueuePass: Math.max(...selected.map(({ queuePass }) => queuePass)) }, null, 2));
else { await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`); console.log(`Occupation candidate cohort written: ${selected.length} selected across ${new Set(selected.map(({ classification }) => classification.iscoGroup)).size} ISCO groups`); }
