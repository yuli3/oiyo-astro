import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V1 = resolve(ROOT, "config/ontology-platform/v1");
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const ARCHIVE = resolve(ROOT, "config/ontology-platform/archive");
const readJson = (root, name) => readFile(resolve(root, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(`Ontology life-coordinator integration audit failed: ${message}`); };
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];

const [conceptsDoc, edgesDoc, contract, sourceReview, currentArchive] = await Promise.all([
  readJson(V1, "concepts.json"), readJson(V1, "edges.json"), readJson(V2, "life-coordinator-integration-v1.json"), readJson(V2, "occupation-source-mapping-review-v1.json"), readJson(ARCHIVE, "current.json"),
]);
if (contract.schema !== "oiyo.ontology-life-coordinator-integration" || contract.schemaVersion !== 1 || contract.status !== "verification_only") fail("contract envelope");
if (JSON.stringify(contract.pathPolicy?.sequence) !== JSON.stringify(["action", "hobby", "work_context", "occupation"])) fail("path sequence");
if (!contract.pathPolicy?.counterexample?.trim() || !contract.pathPolicy?.uncertainty?.trim() || !contract.pathPolicy?.sourcePolicy?.trim()) fail("explanation boundaries");
if (contract.nextTwentyMinuteExperiment?.durationMaxMinutes !== 20 || contract.nextTwentyMinuteExperiment?.reversible !== true || !contract.nextTwentyMinuteExperiment?.noOutcomeClaim?.trim()) fail("next experiment boundary");
for (const locale of LOCALES) if (!contract.nextTwentyMinuteExperiment.copy?.[locale]?.trim()) fail(`next experiment locale: ${locale}`);
const concepts = new Map(conceptsDoc.concepts.map((concept) => [concept.id, concept]));
for (const [kind, expected] of Object.entries(contract.requiredKinds)) if (conceptsDoc.concepts.filter((concept) => concept.kind === kind).length !== expected) fail(`kind count: ${kind}`);
const occupations = conceptsDoc.concepts.filter((concept) => concept.kind === "occupation");
if (contract.occupationTarget?.expected !== 1200 || contract.occupationTarget?.allowedCurrentCount !== 308 || contract.occupationTarget?.actualState !== "source_ready_canonical_expansion_blocked" || occupations.length !== 308) fail("honest occupation expansion state");
if (sourceReview.canonicalPromotionState !== "blocked_pending_official_snapshot_and_six_locale_review_packets") fail("source readiness linkage");
const edgeIndex = new Map(edgesDoc.edges.map((edge) => [`${edge.from}|${edge.to}`, edge]));
for (const fixture of contract.fixtures ?? []) {
  if (!fixture.id || !Array.isArray(fixture.path) || fixture.path.length !== 4) fail(`fixture shape: ${fixture?.id}`);
  const [action, hobby, context, occupation] = fixture.path;
  for (const [id, kind] of [[action, "action"], [hobby, "hobby"], [context, "work_context"], [occupation, "occupation"]]) if (concepts.get(id)?.kind !== kind) fail(`fixture concept: ${fixture.id}.${id}`);
  const actionHobby = edgeIndex.get(`${action}|${hobby}`) ?? edgeIndex.get(`${hobby}|${action}`);
  const hobbyContext = edgeIndex.get(`${hobby}|${context}`);
  const contextOccupation = edgeIndex.get(`${context}|${occupation}`);
  if (!actionHobby || !hobbyContext || !contextOccupation || contextOccupation.kind !== "example_occupation") fail(`fixture path: ${fixture.id}`);
  for (const edge of [actionHobby, hobbyContext, contextOccupation]) if (!edge.sourceIds?.length || !edge.rationaleKey || !edge.evidenceClass || !edge.provenance || !Number.isFinite(edge.confidence)) fail(`fixture evidence: ${fixture.id}`);
}
if (contract.fixtures?.length !== 6) fail("fixture coverage");
if (contract.performanceBudget?.maxConceptShardSize !== 200 || contract.performanceBudget?.expectedLazyArtifacts !== 73 || contract.performanceBudget?.publicBuildRequired !== true || contract.archiveRequired !== true) fail("performance/archive contract");
const manifest = await readJson(ARCHIVE, `${currentArchive.id}/manifest.json`);
if (!manifest.files?.some((file) => file.path === "config/ontology-platform/v2/life-coordinator-integration-v1.json")) fail("current archive integration source");
console.log(`Ontology life-coordinator integration audit PASS: ${contract.fixtures.length} action→hobby→context→occupation paths, 20-minute reversible experiment, explanation/source/counterexample/uncertainty, honest occupation block, archive and performance contracts.`);
