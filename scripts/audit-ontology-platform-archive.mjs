import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

/**
 * Archives record git blob ids instead of copied files (schemaVersion 2).
 * The copies cost 103MB across 21 snapshots — one 4.7MB concepts.json
 * duplicated per snapshot — and every byte was already in git history, so
 * they were removed on 2026-08-18. This audit therefore checks two things:
 * that the current source still matches the archived baseline, and that the
 * baseline is still retrievable, which is what the copies used to guarantee.
 */
const execFileAsync = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARCHIVE_ROOT = resolve(ROOT, "config/ontology-platform/archive");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const readJson = (path) => readFile(path, "utf8").then(JSON.parse);

async function readBlob(blob) {
  const { stdout } = await execFileAsync("git", ["cat-file", "blob", blob], {
    cwd: ROOT,
    encoding: "buffer",
    maxBuffer: 1 << 28,
  });
  return stdout;
}

async function reachableObjects() {
  const { stdout } = await execFileAsync("git", ["rev-list", "--objects", "--all"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  return new Set(stdout.split("\n").map((line) => line.split(" ")[0]).filter(Boolean));
}

async function main() {
  const current = await readJson(resolve(ARCHIVE_ROOT, "current.json"));
  if (current.schema !== "oiyo.ontology-platform-current-archive" || current.schemaVersion !== 1 || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(current.id)) throw new TypeError("invalid current ontology archive pointer");
  const manifest = await readJson(resolve(ARCHIVE_ROOT, current.id, "manifest.json"));
  if (manifest.schema !== "oiyo.ontology-platform-archive" || manifest.schemaVersion !== 2 || manifest.id !== current.id || manifest.immutable !== true || !Array.isArray(manifest.files) || manifest.files.length === 0) throw new TypeError("invalid ontology archive manifest");

  const reachable = await reachableObjects();
  const blobs = new Map();

  for (const entry of manifest.files) {
    if (!entry || typeof entry.path !== "string" || !/^[A-Za-z0-9_./-]+$/.test(entry.path) || entry.path.split("/").includes("..") || !/^[a-f0-9]{64}$/.test(entry.sha256) || !/^[a-f0-9]{40}$/.test(entry.gitBlob) || !Number.isInteger(entry.bytes) || entry.bytes < 0) throw new TypeError("invalid archive file record");

    // A blob that no ref reaches is a blob `git gc` may delete, which would
    // make this archive unrecoverable — the one thing the copies protected.
    if (!reachable.has(entry.gitBlob)) throw new TypeError(`archived blob unreachable, snapshot no longer recoverable: ${entry.path} (${entry.gitBlob})`);

    const archived = await readBlob(entry.gitBlob);
    if (archived.byteLength !== entry.bytes || sha256(archived) !== entry.sha256) throw new TypeError(`archive integrity mismatch: ${entry.path}`);
    blobs.set(entry.path, archived);

    const currentFile = await readFile(resolve(ROOT, entry.path));
    if (currentFile.byteLength !== entry.bytes || sha256(currentFile) !== entry.sha256) throw new TypeError(`current source diverged from archived baseline: ${entry.path}; create a new archive after review`);
  }

  const concepts = JSON.parse(blobs.get("config/ontology-platform/v1/concepts.json"));
  const edges = JSON.parse(blobs.get("config/ontology-platform/v1/edges.json"));
  if (concepts.concepts?.length !== manifest.counts?.concepts || edges.edges?.length !== manifest.counts?.edges) throw new TypeError("archive count mismatch");
  console.log(`Ontology archive audit PASS: ${current.id}, ${manifest.files.length} source files, ${manifest.counts.concepts} concepts, ${manifest.counts.edges} edges`);
}

main().catch((error) => {
  console.error(`Ontology archive audit failed: ${error.message}`);
  process.exit(1);
});
