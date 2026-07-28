import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const CANDIDATE_KINDS = ["similar_to", "contrasts_with", "requires", "develops", "drains", "transitions_to", "performed_in", "often_combined_with"];
const KINDS = new Set(["action", "hobby", "work_context", "occupation"]);
const EVIDENCE = new Set(["standard", "research", "expert_curated", "catalog_derived", "editorial", "symbolic", "curated"]);
const STATUSES = new Set(["approved_for_curated_data", "deferred_human_review"]);
const readJson = (name) => readFile(resolve(PLATFORM_ROOT, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(message); };

async function main() {
  const [vocabulary, edgesDocument] = await Promise.all([readJson("relation-vocabulary-v1.json"), readJson("edges.json")]);
  if (vocabulary.schema !== "oiyo.ontology-relation-vocabulary" || vocabulary.schemaVersion !== 1 || !vocabulary.source?.id || !Array.isArray(vocabulary.relations) || vocabulary.relations.length !== CANDIDATE_KINDS.length) fail("relation vocabulary envelope mismatch");
  const byKind = new Map();
  for (const relation of vocabulary.relations) {
    if (!CANDIDATE_KINDS.includes(relation.kind) || byKind.has(relation.kind)) fail(`invalid or duplicate relation kind: ${relation.kind}`);
    if (!STATUSES.has(relation.status) || !["symmetric", "directed"].includes(relation.direction) || relation.derivedAllowed !== false || !Array.isArray(relation.allowedPairs) || relation.allowedPairs.length === 0 || !Array.isArray(relation.minimumEvidence) || relation.minimumEvidence.length === 0 || typeof relation.publicStatement !== "string" || !relation.publicStatement.trim()) fail(`invalid relation contract: ${relation.kind}`);
    for (const pair of relation.allowedPairs) if (!Array.isArray(pair) || pair.length !== 2 || pair.some((kind) => !KINDS.has(kind))) fail(`invalid allowed pair: ${relation.kind}`);
    if (relation.direction === "symmetric" && relation.allowedPairs.some(([from, to]) => from !== to)) fail(`symmetric relation must use same-kind pairs: ${relation.kind}`);
    if (relation.minimumEvidence.some((evidence) => !EVIDENCE.has(evidence) || evidence === "catalog_derived")) fail(`invalid relation evidence: ${relation.kind}`);
    byKind.set(relation.kind, relation);
  }
  if (CANDIDATE_KINDS.some((kind) => !byKind.has(kind))) fail("candidate relation coverage mismatch");
  for (const edge of edgesDocument.edges.filter((edge) => byKind.has(edge.kind))) {
    const relation = byKind.get(edge.kind);
    const pair = [edge.from.split(".")[0], edge.to.split(".")[0]];
    if (relation.status !== "approved_for_curated_data" || !relation.allowedPairs.some(([from, to]) => from === pair[0] && to === pair[1]) || !relation.minimumEvidence.includes(edge.evidenceClass) || edge.provenance === "derived") fail(`edge violates relation vocabulary: ${edge.from} -> ${edge.to}`);
  }
  const activeEdges = edgesDocument.edges.filter((edge) => byKind.has(edge.kind));
  if (activeEdges.length !== 0) fail("batch 13 must not add semantic relation edges before separate editorial review");
  console.log(`Relation vocabulary audit PASS: ${byKind.size} candidate kinds, ${[...byKind.values()].filter(({ status }) => status === "approved_for_curated_data").length} curated-ready, 1 deferred, 0 semantic edges activated`);
}

main().catch((error) => {
  console.error(`Relation vocabulary audit failed: ${error.message}`);
  process.exit(1);
});
