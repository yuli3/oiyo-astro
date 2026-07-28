import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildOntologyPlatform } from "./build-ontology-platform.mjs";

const output = await mkdtemp(join(tmpdir(), "ontology-platform-"));

try {
  const result = await buildOntologyPlatform({ outDir: output });
  const manifest = JSON.parse(await readFile(join(output, "manifest.json"), "utf8"));
  const errors = [];
  if (manifest.counts.concepts !== result.concepts.length || manifest.counts.edges !== result.edges.length) errors.push("manifest count mismatch");
  if (manifest.counts.concepts < 183 || manifest.counts.edges < 166) errors.push("catalog migration is unexpectedly incomplete");
  if (manifest.counts.byKind.hobby < 600 || manifest.counts.byKind.work_context !== 80 || manifest.counts.byKind.occupation < 100) errors.push("catalog migration kind coverage regressed");
  if (manifest.locales.join(",") !== "ko,en,ja,zh,fr,es") errors.push("locale contract changed");
  if (!manifest.artifacts.includes("recommendation/facet-index.json") || !manifest.artifacts.includes("search/ko.json") || !manifest.artifacts.includes("adjacency/action-000.json") || !manifest.artifacts.includes("compatibility/legacy-id-index.json") || !manifest.artifacts.includes("compatibility/legacy-graph-contract.json")) errors.push("required lazy artifact missing");
  for (const concept of result.concepts) {
    const ranges = manifest.shardRanges?.[concept.kind];
    const matches = Array.isArray(ranges) ? ranges.filter((range) => range?.firstId <= concept.id && concept.id <= range?.lastId) : [];
    if (matches.length !== 1) errors.push(`concept must resolve to exactly one lazy shard: ${concept.id}`);
    for (const range of matches) {
      if (!manifest.artifacts.includes(range.corePath) || !manifest.artifacts.includes(range.adjacencyPath)) errors.push(`shard range points outside artifact manifest: ${concept.id}`);
    }
  }

  const legacyIdIndex = JSON.parse(await readFile(join(output, "compatibility/legacy-id-index.json"), "utf8"));
  const legacyGraphContract = JSON.parse(await readFile(new URL("../config/ontology-platform/v1/legacy-graph-compatibility-v1.json", import.meta.url), "utf8"));
  if (legacyGraphContract.schema !== "oiyo.ontology-legacy-graph-compatibility" || Object.keys(legacyGraphContract.mapped).length !== 5 || Object.keys(legacyGraphContract.deferred).length !== 3) errors.push("legacy graph contract changed unexpectedly");
  for (const [legacyId, canonicalId] of Object.entries(legacyGraphContract.mapped)) if (legacyIdIndex[legacyId] !== canonicalId) errors.push(`legacy graph compatibility missing: ${legacyId}`);
  for (const legacyId of Object.keys(legacyGraphContract.deferred)) if (legacyIdIndex[legacyId]) errors.push(`deferred legacy graph id was mapped without review: ${legacyId}`);

  const adjacency = Object.groupBy(result.edges, ({ from }) => from);
  const derived = result.edges.filter((edge) => edge.provenance === "derived");
  if (derived.length < 65) errors.push("derived exploration coverage regressed");
  for (const edge of derived) {
    if (edge.weight > 0.54 || edge.confidence > 0.65) errors.push(`derived edge is too strong: ${edge.from} -> ${edge.to}`);
    if (!((edge.from.startsWith("action.") && edge.to.startsWith("work_context.") && edge.kind === "used_in") || (edge.from.startsWith("hobby.") && edge.to.startsWith("work_context.") && edge.kind === "transfers_to"))) errors.push(`invalid derived exploration edge: ${edge.from} -> ${edge.to}`);
  }
  if (result.edges.filter((edge) => edge.sourceIds.includes("editorial:ontology-v1-actions")).length < 48) errors.push("curated hobby action coverage regressed");
  if (result.edges.filter((edge) => edge.from.startsWith("action.") && edge.to.startsWith("hobby.") && edge.kind === "expressed_by" && edge.sourceIds.includes("editorial:ontology-v1-actions")).length < 49) errors.push("curated action-to-hobby navigation coverage regressed");
  for (const fixture of result.golden.cases) {
    const candidates = fixture.seedIds.flatMap((id) => adjacency[id] ?? []).sort((left, right) => right.weight - left.weight || left.to.localeCompare(right.to, "en"));
    if (candidates[0]?.to !== fixture.expectedTopId) errors.push(`golden recommendation mismatch: ${fixture.id}`);
  }
  if (errors.length) throw new Error(errors.join("; "));
  console.log(`Ontology platform audit PASS: ${manifest.counts.concepts} concepts, ${manifest.counts.edges} edges, ${manifest.artifacts.length} generated lazy artifacts, ${result.golden.cases.length} graph goldens`);
} finally {
  await rm(output, { recursive: true, force: true });
}
