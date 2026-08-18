import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { buildOntologyPlatform } from "./build-ontology-platform.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const ARCHIVE_ROOT = resolve(ROOT, "config/ontology-platform/archive");
const readJson = (name) => readFile(resolve(PLATFORM_ROOT, name), "utf8").then(JSON.parse);
const topCandidate = (adjacency, seedIds) => seedIds.flatMap((id) => adjacency[id] ?? []).sort((left, right) => right.weight - left.weight || left.to.localeCompare(right.to, "en"))[0]?.to;
const fail = (message) => { throw new Error(`Ontology golden matrix audit failed: ${message}`); };
// Archives record git blob ids instead of copied files (schemaVersion 2), so
// the archived bytes come out of the object database rather than off disk.
const execFileAsync = promisify(execFile);
const readArchived = async (gitBlob) => {
  const { stdout } = await execFileAsync("git", ["cat-file", "blob", gitBlob], { cwd: ROOT, encoding: "buffer", maxBuffer: 1 << 28 });
  return stdout;
};

const [matrix, conceptsDocument, legacyContract, currentArchive] = await Promise.all([
  readJson("golden-regression-matrix-v1.json"),
  readJson("concepts.json"),
  readJson("legacy-graph-compatibility-v1.json"),
  readFile(resolve(ARCHIVE_ROOT, "current.json"), "utf8").then(JSON.parse),
]);
if (matrix.schema !== "oiyo.ontology-golden-regression-matrix" || matrix.schemaVersion !== 1) fail("matrix envelope mismatch");

const output = await mkdtemp(join(tmpdir(), "ontology-golden-matrix-"));
try {
  const result = await buildOntologyPlatform({ outDir: output });
  const ids = new Set(result.concepts.map(({ id }) => id));
  const adjacency = Object.groupBy(result.edges, ({ from }) => from);
  const cases = result.golden.cases;
  const errors = [];
  const { minimumCases, maximumCases, minimumBySeedKind } = matrix.rankingContract ?? {};
  if (!Number.isInteger(minimumCases) || !Number.isInteger(maximumCases) || cases.length < minimumCases || cases.length > maximumCases) errors.push(`ranking case count outside contract: ${cases.length}`);
  if (new Set(cases.map(({ id }) => id)).size !== cases.length) errors.push("ranking case ids must be unique");
  const seedCounts = Object.fromEntries(Object.keys(minimumBySeedKind ?? {}).map((kind) => [kind, 0]));
  for (const fixture of cases) {
    const kinds = new Set(fixture.seedIds.map((id) => id.split(".")[0]));
    for (const kind of kinds) if (kind in seedCounts) seedCounts[kind] += 1;
    if (topCandidate(adjacency, fixture.seedIds) !== fixture.expectedTopId) errors.push(`ranking mismatch: ${fixture.id}`);
  }
  for (const [kind, minimum] of Object.entries(minimumBySeedKind ?? {})) if (seedCounts[kind] < minimum) errors.push(`insufficient ${kind} ranking coverage: ${seedCounts[kind]}/${minimum}`);

  for (const contract of matrix.inputContracts ?? []) {
    if (contract.expected === "reject") {
      const valid = Array.isArray(contract.seedIds) && contract.seedIds.length > 0 && contract.seedIds.every((id) => ids.has(id));
      if (valid) errors.push(`invalid input accepted: ${contract.id}`);
    } else if (topCandidate(adjacency, contract.seedIds) !== contract.expectedTopId) errors.push(`input contract mismatch: ${contract.id}`);
  }
  const tie = [...(matrix.tieBreakContract?.candidates ?? [])].sort((left, right) => right.weight - left.weight || left.to.localeCompare(right.to, "en"));
  if (tie[0]?.to !== matrix.tieBreakContract?.expectedTopId) errors.push("tie-break contract mismatch");

  const safety = matrix.safetyContracts ?? {};
  for (const edge of result.edges.filter(({ provenance }) => provenance === "derived")) {
    if (edge.weight > safety.derivedWeightMaximum || edge.confidence > safety.derivedConfidenceMaximum) errors.push(`derived certainty ceiling exceeded: ${edge.from} -> ${edge.to}`);
  }
  if (safety.occupationOutgoingEdges === "forbidden" && result.edges.some(({ from }) => from.startsWith("occupation."))) errors.push("occupation has outgoing recommendation edge");
  for (const concept of conceptsDocument.concepts) for (const field of safety.requiredExplanationFields ?? []) for (const locale of safety.requiredExplanationLocales ?? []) {
    if (typeof concept.explanation?.fields?.[field]?.[locale] !== "string" || !concept.explanation.fields[field][locale].trim()) errors.push(`missing direct explanation: ${concept.id}.${field}.${locale}`);
  }
  const archiveManifest = JSON.parse(await readFile(resolve(ARCHIVE_ROOT, currentArchive.id, "manifest.json"), "utf8"));
  for (const relativePath of matrix.archiveBuildContract?.requiredCurrentArchiveSources ?? []) {
    const entry = archiveManifest.files.find(({ path }) => path === relativePath);
    if (!entry) { errors.push(`archive/build source drift: ${relativePath}`); continue; }
    const archived = await readArchived(entry.gitBlob);
    const current = await readFile(resolve(ROOT, relativePath));
    if (!archived.equals(current)) errors.push(`archive/build source drift: ${relativePath}`);
  }
  const legacy = matrix.legacyIsolationContract ?? {};
  if (Object.keys(legacyContract.mapped ?? {}).length !== legacy.mappedCount || Object.keys(legacyContract.deferred ?? {}).length !== legacy.deferredCount) errors.push("legacy compatibility contract count mismatch");
  if (legacy.forbidLegacyIdsInCanonical && Object.keys({ ...(legacyContract.mapped ?? {}), ...(legacyContract.deferred ?? {}) }).some((id) => ids.has(id))) errors.push("legacy id leaked into canonical concept IDs");
  if (errors.length) fail(errors.join("; "));
  console.log(`Ontology golden matrix audit PASS: ${cases.length} ranking cases, ${JSON.stringify(seedCounts)}, ${matrix.inputContracts.length} input contracts, 1 tie contract, safety/archive/legacy contracts verified`);
} finally {
  await rm(output, { recursive: true, force: true });
}
