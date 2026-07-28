import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARCHIVE_ROOT = resolve(ROOT, "config/ontology-platform/archive");
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");

const SNAPSHOT_FILES = [
  "config/ontology-platform/v1/concepts.json",
  "config/ontology-platform/v1/edges.json",
  "config/ontology-platform/v1/golden.json",
  "config/ontology-platform/v1/golden-regression-matrix-v1.json",
  "config/ontology-platform/v1/legacy-graph-compatibility-v1.json",
  "config/ontology-platform/v1/curated-hobbies-v1.json",
  "config/ontology-platform/v1/curated-actions-v1.json",
  "config/ontology-platform/v1/curated-hobby-activity-facets-v1.json",
  "config/ontology-platform/v1/relation-vocabulary-v1.json",
  "config/ontology-platform/v1/concept-explanation-templates-v1.json",
  "config/ontology-platform/v2/action-vocabulary-i-v1.json",
  "config/ontology-platform/v2/action-vocabulary-ii-v1.json",
  "config/ontology-platform/v2/hobby-catalog-i-v1.json",
  "config/ontology-platform/v2/hobby-catalog-ii-v1.json",
  "config/ontology-platform/v2/hobby-catalog-iii-v1.json",
  "config/ontology-platform/v2/work-context-taxonomy-v2.json",
  "config/ontology-platform/v2/life-signals-contract-v1.json",
  "config/ontology-platform/v2/occupation-source-mapping-review-v1.json",
  "config/ontology-platform/v2/life-coordinator-integration-v1.json",
  "config/ontology-platform/v2/occupation-source-inventory-v1.json",
  "config/ontology-platform/v2/occupation-source-index-v1.json",
  "config/ontology-platform/v2/occupation-candidate-cohort-v1.json",
  "config/ontology-platform/v2/occupation-alias-mapping-review-v1.json",
  "config/ontology-platform/v2/occupation-locale-label-packet-v1.json",
  "config/ontology-platform/v2/occupation-facet-readiness-v1.json",
  "config/ontology-platform/v2/occupation-pilot-review-approval-v1.json",
  "config/ontology-platform/v2/candidate-staging-v1.json",
  "config/ontology-platform/v2/occupation-promotion-handoff-v1.json",
  "src/manifest/ontology/shards/lifestyle/hobbies.ts",
  "src/lib/data-layer/shards/hobbies.ts",
  "src/lib/data-layer/shards/careers.ts",
  "src/lib/ontology/lifestyle/data.ts",
];

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function parseFlag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
function archivePath(id) {
  if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(id)) throw new TypeError("archive id must be a lowercase slug");
  return resolve(ARCHIVE_ROOT, id);
}
function snapshotPath(relativePath) { return `sources/${relativePath}`; }

async function mustNotExist(path) {
  try {
    await stat(path);
    throw new Error(`archive already exists: ${path}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function copySnapshot(id) {
  const target = archivePath(id);
  await mustNotExist(target);

  const [concepts, edges] = await Promise.all([
    readFile(resolve(PLATFORM_ROOT, "concepts.json"), "utf8").then(JSON.parse),
    readFile(resolve(PLATFORM_ROOT, "edges.json"), "utf8").then(JSON.parse),
  ]);
  const files = [];
  for (const relativePath of SNAPSHOT_FILES) {
    const source = resolve(ROOT, relativePath);
    const destination = resolve(target, snapshotPath(relativePath));
    const contents = await readFile(source);
    await mkdir(resolve(destination, ".."), { recursive: true });
    await cp(source, destination, { errorOnExist: true });
    files.push({ path: relativePath, sha256: sha256(contents), bytes: contents.byteLength });
  }
  const manifest = {
    schema: "oiyo.ontology-platform-archive",
    schemaVersion: 1,
    id,
    createdAt: new Date().toISOString(),
    immutable: true,
    sourceSchemaVersion: concepts.schemaVersion,
    counts: { concepts: concepts.concepts.length, edges: edges.edges.length },
    files,
    notes: "Local immutable snapshot of canonical ontology data and source catalogs. Never edit an existing archive; create a new archive for a new approved catalog state.",
  };
  await writeFile(resolve(target, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(resolve(ARCHIVE_ROOT, "current.json"), `${JSON.stringify({ schema: "oiyo.ontology-platform-current-archive", schemaVersion: 1, id }, null, 2)}\n`);
  console.log(`Ontology archive created: ${id} (${files.length} source files, ${manifest.counts.concepts} concepts, ${manifest.counts.edges} edges)`);
}

const id = parseFlag("--id");
if (!id) throw new TypeError("Usage: node scripts/archive-ontology-platform.mjs --id <lowercase-slug>");
copySnapshot(id).catch((error) => {
  console.error(`Ontology archive failed: ${error.message}`);
  process.exit(1);
});
