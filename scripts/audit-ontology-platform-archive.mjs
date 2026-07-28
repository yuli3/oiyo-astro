import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARCHIVE_ROOT = resolve(ROOT, "config/ontology-platform/archive");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = (path) => readFile(path, "utf8").then(JSON.parse);

async function main() {
  const current = await readJson(resolve(ARCHIVE_ROOT, "current.json"));
  if (current.schema !== "oiyo.ontology-platform-current-archive" || current.schemaVersion !== 1 || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(current.id)) throw new TypeError("invalid current ontology archive pointer");
  const archiveRoot = resolve(ARCHIVE_ROOT, current.id);
  const manifest = await readJson(resolve(archiveRoot, "manifest.json"));
  if (manifest.schema !== "oiyo.ontology-platform-archive" || manifest.schemaVersion !== 1 || manifest.id !== current.id || manifest.immutable !== true || !Array.isArray(manifest.files) || manifest.files.length === 0) throw new TypeError("invalid ontology archive manifest");

  for (const entry of manifest.files) {
    if (!entry || typeof entry.path !== "string" || !/^[A-Za-z0-9_./-]+$/.test(entry.path) || entry.path.split("/").includes("..") || !/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isInteger(entry.bytes) || entry.bytes < 0) throw new TypeError("invalid archive file record");
    const archived = await readFile(resolve(archiveRoot, "sources", entry.path));
    if (archived.byteLength !== entry.bytes || sha256(archived) !== entry.sha256) throw new TypeError(`archive integrity mismatch: ${entry.path}`);
    const currentFile = await readFile(resolve(ROOT, entry.path));
    if (currentFile.byteLength !== entry.bytes || sha256(currentFile) !== entry.sha256) throw new TypeError(`current source diverged from archived baseline: ${entry.path}; create a new archive after review`);
  }

  const concepts = await readJson(resolve(archiveRoot, "sources/config/ontology-platform/v1/concepts.json"));
  const edges = await readJson(resolve(archiveRoot, "sources/config/ontology-platform/v1/edges.json"));
  if (concepts.concepts?.length !== manifest.counts?.concepts || edges.edges?.length !== manifest.counts?.edges) throw new TypeError("archive count mismatch");
  console.log(`Ontology archive audit PASS: ${current.id}, ${manifest.files.length} source files, ${manifest.counts.concepts} concepts, ${manifest.counts.edges} edges`);
}

main().catch((error) => {
  console.error(`Ontology archive audit failed: ${error.message}`);
  process.exit(1);
});
