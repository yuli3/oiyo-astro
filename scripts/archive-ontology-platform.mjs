import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

/**
 * An archive is a manifest of git blob ids, not a copy of the files.
 *
 * It used to copy every source into the archive directory. With a 4.7MB
 * concepts.json and 21 snapshots that reached 103MB of tracked duplicates,
 * and each new snapshot added 11MB more — all of it content git already
 * stored. Recording the blob id gives the same guarantee (the exact bytes
 * are retrievable and immutable) for about 7KB per snapshot.
 *
 * The trade: a state can only be archived once it is committed, because an
 * uncommitted file has no blob a ref can reach and `git gc` would be free to
 * delete it. That is a reasonable thing to require of an "approved catalog
 * state" and the script refuses rather than archiving something losable.
 */
const execFileAsync = promisify(execFile);

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

async function mustNotExist(path) {
  try {
    await stat(path);
    throw new Error(`archive already exists: ${path}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function gitBlobId(path) {
  const { stdout } = await execFileAsync("git", ["hash-object", path], { cwd: ROOT, encoding: "utf8" });
  return stdout.trim();
}

async function reachableObjects() {
  const { stdout } = await execFileAsync("git", ["rev-list", "--objects", "--all"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  return new Set(stdout.split("\n").map((line) => line.split(" ")[0]).filter(Boolean));
}

async function copySnapshot(id) {
  const target = archivePath(id);
  await mustNotExist(target);

  const [concepts, edges] = await Promise.all([
    readFile(resolve(PLATFORM_ROOT, "concepts.json"), "utf8").then(JSON.parse),
    readFile(resolve(PLATFORM_ROOT, "edges.json"), "utf8").then(JSON.parse),
  ]);
  const reachable = await reachableObjects();
  const files = [];
  const uncommitted = [];
  for (const relativePath of SNAPSHOT_FILES) {
    const source = resolve(ROOT, relativePath);
    const contents = await readFile(source);
    const gitBlob = await gitBlobId(source);
    if (!reachable.has(gitBlob)) { uncommitted.push(relativePath); continue; }
    files.push({ path: relativePath, sha256: sha256(contents), bytes: contents.byteLength, gitBlob });
  }
  if (uncommitted.length > 0) {
    throw new Error(
      `commit these before archiving, otherwise the snapshot points at blobs git may collect:\n  ${uncommitted.join("\n  ")}`,
    );
  }
  const manifest = {
    schema: "oiyo.ontology-platform-archive",
    schemaVersion: 2,
    id,
    createdAt: new Date().toISOString(),
    immutable: true,
    sourceSchemaVersion: concepts.schemaVersion,
    counts: { concepts: concepts.concepts.length, edges: edges.edges.length },
    files,
    notes: "Immutable snapshot of canonical ontology data and source catalogs, recorded as git blob ids rather than copied files. Restore any entry with `git cat-file -p <gitBlob>`. Never edit an existing archive; create a new archive for a new approved catalog state.",
  };
  await mkdir(target, { recursive: true });
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
