import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_ROOT = new URL("../config/ontology-platform/v1/", import.meta.url);
const LEGACY_SOURCE_PATHS = [
  "src/manifest/ontology/shards/lifestyle/hobbies.ts",
  "src/lib/data-layer/shards/hobbies.ts",
  "src/lib/data-layer/shards/careers.ts",
  "src/lib/ontology/lifestyle/data.ts"
];
const KINDS = new Set(["action", "hobby", "work_context", "occupation"]);
const EDGE_KINDS = new Set(["expressed_by", "used_in", "related_to", "supports", "transfers_to", "example_occupation", "similar_to", "contrasts_with", "requires", "develops", "drains", "transitions_to", "performed_in", "often_combined_with"]);
const EVIDENCE_CLASSES = new Set(["standard", "research", "expert_curated", "catalog_derived", "editorial", "symbolic", "curated"]);
const PROVENANCE = new Set(["curated", "derived", "imported"]);
const SHARD_SIZE = 200;

function object(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
  return value;
}

function numberInRange(value, label, min = 0, max = 1) {
  if (!Number.isFinite(value) || value < min || value > max) throw new TypeError(`${label} must be a number in [${min}, ${max}]`);
}

function slug(value) {
  return String(value).toLocaleLowerCase("en").normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

async function load(name) {
  return JSON.parse(await readFile(new URL(name, SOURCE_ROOT), "utf8"));
}

function sorted(values, compare = (left, right) => String(left).localeCompare(String(right), "en")) {
  return [...values].sort(compare);
}

function shard(values) {
  const result = [];
  for (let index = 0; index < values.length; index += SHARD_SIZE) result.push(values.slice(index, index + SHARD_SIZE));
  return result;
}

function validate(conceptsDocument, edgesDocument, goldenDocument, knownLegacyIds) {
  if (conceptsDocument.schema !== "oiyo.ontology-concepts" || conceptsDocument.schemaVersion !== 1) throw new TypeError("concept envelope mismatch");
  if (edgesDocument.schema !== "oiyo.ontology-edges" || edgesDocument.schemaVersion !== 1) throw new TypeError("edge envelope mismatch");
  if (goldenDocument.schema !== "oiyo.ontology-golden" || goldenDocument.schemaVersion !== 1) throw new TypeError("golden envelope mismatch");

  const locales = conceptsDocument.locales;
  const facets = conceptsDocument.facets;
  if (!Array.isArray(locales) || locales.length !== 6 || new Set(locales).size !== locales.length) throw new TypeError("exactly six unique locales required");
  if (!Array.isArray(facets) || facets.length < 8 || new Set(facets).size !== facets.length) throw new TypeError("unique facet registry required");
  if (!Array.isArray(conceptsDocument.concepts) || conceptsDocument.concepts.length === 0) throw new TypeError("at least one concept required");
  if (!Array.isArray(edgesDocument.edges)) throw new TypeError("edge list required");
  if (!Array.isArray(goldenDocument.cases) || goldenDocument.cases.length === 0) throw new TypeError("golden cases required");

  const ids = new Set();
  const legacyIds = new Set();
  for (const concept of conceptsDocument.concepts) {
    object(concept, "concept");
    if (typeof concept.id !== "string" || !/^(action|hobby|work_context|occupation)\.[a-z0-9_]+$/.test(concept.id)) throw new TypeError(`invalid concept id: ${concept.id}`);
    if (!KINDS.has(concept.kind) || !concept.id.startsWith(`${concept.kind}.`)) throw new TypeError(`invalid concept kind: ${concept.id}`);
    if (ids.has(concept.id)) throw new TypeError(`duplicate concept id: ${concept.id}`);
    ids.add(concept.id);
    const labels = object(concept.labels, `${concept.id}.labels`);
    for (const locale of locales) if (typeof labels[locale] !== "string" || !labels[locale].trim()) throw new TypeError(`missing ${locale} label: ${concept.id}`);
    const vector = object(concept.facets, `${concept.id}.facets`);
    if (Object.keys(vector).length !== facets.length || facets.some((facet) => !Object.hasOwn(vector, facet))) throw new TypeError(`incomplete facet vector: ${concept.id}`);
    for (const facet of facets) numberInRange(vector[facet], `${concept.id}.${facet}`, 0, 3);
    if (concept.aliases !== undefined) {
      const aliases = object(concept.aliases, `${concept.id}.aliases`);
      for (const [locale, values] of Object.entries(aliases)) {
        if (!locales.includes(locale) || !Array.isArray(values) || values.some((value) => typeof value !== "string" || !value.trim())) throw new TypeError(`invalid aliases: ${concept.id}.${locale}`);
      }
    }
    for (const legacyId of concept.legacyIds ?? []) {
      if (typeof legacyId !== "string" || !legacyId) throw new TypeError(`invalid legacy id: ${concept.id}`);
      if (legacyIds.has(legacyId)) throw new TypeError(`legacy id collision: ${legacyId}`);
      if (!knownLegacyIds.has(legacyId)) throw new TypeError(`legacy id is not present in an approved source catalog: ${legacyId}`);
      legacyIds.add(legacyId);
    }
  }

  const edgeKeys = new Set();
  for (const edge of edgesDocument.edges) {
    object(edge, "edge");
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) throw new TypeError(`dangling/self edge: ${edge.from} -> ${edge.to}`);
    if (!EDGE_KINDS.has(edge.kind)) throw new TypeError(`unknown edge kind: ${edge.kind}`);
    if (!EVIDENCE_CLASSES.has(edge.evidenceClass) || !PROVENANCE.has(edge.provenance)) throw new TypeError(`invalid evidence/provenance: ${edge.from} -> ${edge.to}`);
    numberInRange(edge.weight, `edge weight ${edge.from} -> ${edge.to}`);
    numberInRange(edge.confidence, `edge confidence ${edge.from} -> ${edge.to}`);
    if (typeof edge.rationaleKey !== "string" || !edge.rationaleKey || !Array.isArray(edge.sourceIds) || edge.sourceIds.length === 0 || edge.sourceIds.some((source) => typeof source !== "string" || !source)) throw new TypeError(`missing explanation/provenance: ${edge.from} -> ${edge.to}`);
    const key = `${edge.from}|${edge.kind}|${edge.to}`;
    if (edgeKeys.has(key)) throw new TypeError(`duplicate edge: ${key}`);
    edgeKeys.add(key);
    if (edge.kind === "example_occupation" && (!edge.to.startsWith("occupation.") || !edge.from.startsWith("work_context."))) throw new TypeError(`occupation examples must flow from work context: ${key}`);
  }

  const goldenIds = new Set();
  for (const fixture of goldenDocument.cases) {
    if (!fixture || typeof fixture.id !== "string" || goldenIds.has(fixture.id)) throw new TypeError(`invalid/duplicate golden id: ${fixture?.id}`);
    goldenIds.add(fixture.id);
    if (!Array.isArray(fixture.seedIds) || fixture.seedIds.length === 0 || fixture.seedIds.some((id) => !ids.has(id)) || !ids.has(fixture.expectedTopId)) throw new TypeError(`invalid golden case: ${fixture.id}`);
  }
  return { ids, locales, facets };
}

async function writeJson(path, value) {
  await mkdir(new URL(".", `file://${path}`), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeArtifact(root, relativePath, value) {
  const target = resolve(root, relativePath);
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
}

/** Builds locale-independent core, locale copy/search, sparse adjacency, and inverted facet shards. */
export async function buildOntologyPlatform({ outDir }) {
  const output = resolve(outDir);
  if (!basename(output).startsWith("ontology-")) throw new TypeError("outDir basename must start with 'ontology-' to prevent an unsafe clean");
  const [conceptsDocument, edgesDocument, goldenDocument, legacyGraphContract, ...legacySources] = await Promise.all([
    load("concepts.json"),
    load("edges.json"),
    load("golden.json"),
    load("legacy-graph-compatibility-v1.json"),
    ...LEGACY_SOURCE_PATHS.map((relativePath) => readFile(resolve(ROOT, relativePath), "utf8"))
  ]);
  const knownLegacyIds = new Set(legacySources.flatMap((source) => [
    ...source.matchAll(/\bid:\s*"([A-Za-z0-9_-]+)"/g),
    ...source.matchAll(/\bid:\s*'([A-Za-z0-9_-]+)'/g)
  ].map((match) => match[1])));
  const { locales, facets } = validate(conceptsDocument, edgesDocument, goldenDocument, knownLegacyIds);
  if (legacyGraphContract.schema !== "oiyo.ontology-legacy-graph-compatibility" || legacyGraphContract.schemaVersion !== 1 || !legacyGraphContract.mapped || !legacyGraphContract.deferred) throw new TypeError("legacy graph compatibility contract mismatch");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  const concepts = sorted(conceptsDocument.concepts, (left, right) => left.id.localeCompare(right.id, "en"));
  const edges = sorted(edgesDocument.edges, (left, right) => `${left.from}|${left.kind}|${left.to}`.localeCompare(`${right.from}|${right.kind}|${right.to}`, "en"));
  const byKind = Object.groupBy(concepts, ({ kind }) => kind);
  const artifactPaths = [];
  const shardRanges = {};

  for (const kind of sorted(KINDS)) {
    const group = byKind[kind] ?? [];
    for (const [index, entries] of shard(group).entries()) {
      const suffix = String(index).padStart(3, "0");
      const corePath = `core/${kind}-${suffix}.json`;
      await writeArtifact(output, corePath, entries.map(({ labels, aliases, ...core }) => core));
      artifactPaths.push(corePath);
      for (const locale of locales) {
        const copyPath = `copy/${locale}/${kind}-${suffix}.json`;
        await writeArtifact(output, copyPath, entries.map((concept) => ({ id: concept.id, label: concept.labels[locale], aliases: concept.aliases?.[locale] ?? [] })));
        artifactPaths.push(copyPath);
      }
      shardRanges[kind] ??= [];
      shardRanges[kind].push({
        firstId: entries[0].id,
        lastId: entries.at(-1).id,
        corePath,
        adjacencyPath: `adjacency/${kind}-${suffix}.json`
      });
    }
  }

  const adjacency = Object.fromEntries(concepts.map((concept) => [concept.id, []]));
  for (const edge of edges) adjacency[edge.from].push(edge);
  for (const [kind, entries] of Object.entries(byKind)) {
    for (const [index, group] of shard(entries).entries()) {
      const suffix = String(index).padStart(3, "0");
      const path = `adjacency/${kind}-${suffix}.json`;
      await writeArtifact(output, path, Object.fromEntries(group.map(({ id }) => [id, adjacency[id]])));
      artifactPaths.push(path);
    }
  }

  for (const locale of locales) {
    const index = {};
    for (const concept of concepts) {
      for (const term of [concept.labels[locale], ...(concept.aliases?.[locale] ?? [])]) {
        const key = slug(term);
        if (!key) continue;
        index[key] ??= [];
        if (!index[key].includes(concept.id)) index[key].push(concept.id);
      }
    }
    const path = `search/${locale}.json`;
    await writeArtifact(output, path, Object.fromEntries(sorted(Object.entries(index), ([left], [right]) => left.localeCompare(right, "en"))));
    artifactPaths.push(path);
  }

  const legacyIdIndex = {};
  for (const concept of concepts) {
    for (const legacyId of concept.legacyIds ?? []) legacyIdIndex[legacyId] = concept.id;
  }
  await writeArtifact(output, "compatibility/legacy-id-index.json", Object.fromEntries(sorted(Object.entries(legacyIdIndex), ([left], [right]) => left.localeCompare(right, "en"))));
  artifactPaths.push("compatibility/legacy-id-index.json");
  await writeArtifact(output, "compatibility/legacy-graph-contract.json", legacyGraphContract);
  artifactPaths.push("compatibility/legacy-graph-contract.json");

  const invertedFacets = Object.fromEntries(facets.map((facet) => [facet, concepts.filter((concept) => concept.facets[facet] > 0).map(({ id, facets: vector }) => [id, vector[facet]])]));
  await writeArtifact(output, "recommendation/facet-index.json", invertedFacets);
  artifactPaths.push("recommendation/facet-index.json");

  const manifest = {
    schema: "oiyo.ontology-platform-artifacts",
    schemaVersion: 1,
    sourceSchemaVersion: conceptsDocument.schemaVersion,
    locales,
    facets,
    counts: {
      concepts: concepts.length,
      edges: edges.length,
      byKind: Object.fromEntries(sorted(KINDS).map((kind) => [kind, (byKind[kind] ?? []).length]))
    },
    shardSize: SHARD_SIZE,
    shardRanges,
    artifacts: sorted(artifactPaths)
  };
  await writeArtifact(output, "manifest.json", manifest);
  return { manifest, concepts, edges, golden: goldenDocument };
}

async function main() {
  const outIndex = process.argv.indexOf("--out");
  const outDir = outIndex >= 0 ? process.argv[outIndex + 1] : undefined;
  if (!outDir) throw new TypeError("Usage: node scripts/build-ontology-platform.mjs --out <ontology-output-directory>");
  const result = await buildOntologyPlatform({ outDir: resolve(ROOT, outDir) });
  console.log(`Ontology platform build PASS: ${result.manifest.counts.concepts} concepts, ${result.manifest.counts.edges} sparse edges, ${result.manifest.artifacts.length} lazy artifacts`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Ontology platform build failed: ${error.message}`);
    process.exit(1);
  });
}
