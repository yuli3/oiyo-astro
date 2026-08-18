import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

/**
 * Write an archived snapshot back to disk.
 *
 * Archives hold git blob ids rather than copies (see
 * scripts/archive-ontology-platform.mjs), so restoring is `git cat-file` plus
 * a checksum. This exists so that recovering a snapshot is one command anyone
 * can run, rather than something you have to know how to reconstruct.
 *
 * Usage:
 *   node scripts/restore-ontology-archive.mjs --id <archive-id> --out <dir>
 *   node scripts/restore-ontology-archive.mjs --id <archive-id> --list
 *
 * --out is required for writing and must not be the repo root: restoring is
 * for inspecting or diffing an old state, not for silently reverting live
 * config underneath whoever is working in the tree.
 */
const execFileAsync = promisify(execFile);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARCHIVE_ROOT = resolve(ROOT, "config/ontology-platform/archive");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function flag(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const id = flag("--id");
  if (!id || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(id)) throw new TypeError("Usage: --id <archive-id> [--out <dir> | --list]");

  const manifest = JSON.parse(await readFile(resolve(ARCHIVE_ROOT, id, "manifest.json"), "utf8"));
  if (manifest.schemaVersion !== 2) throw new TypeError(`archive ${id} is schemaVersion ${manifest.schemaVersion}; this tool reads version 2`);

  if (process.argv.includes("--list")) {
    for (const entry of manifest.files) console.log(`${entry.gitBlob}  ${String(entry.bytes).padStart(9)}  ${entry.path}`);
    console.log(`\n${manifest.files.length} files, archived ${manifest.createdAt}`);
    return;
  }

  const out = flag("--out");
  if (!out) throw new TypeError("--out <dir> is required (or pass --list)");
  const target = resolve(process.cwd(), out);
  if (target === ROOT) throw new TypeError("refusing to restore over the repo root; restore to a scratch directory and diff");

  for (const entry of manifest.files) {
    const { stdout } = await execFileAsync("git", ["cat-file", "blob", entry.gitBlob], { cwd: ROOT, encoding: "buffer", maxBuffer: 1 << 28 });
    if (stdout.byteLength !== entry.bytes || sha256(stdout) !== entry.sha256) throw new TypeError(`blob does not match the manifest: ${entry.path}`);
    const destination = resolve(target, entry.path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, stdout);
  }
  console.log(`Restored ${manifest.files.length} files from ${id} into ${target}`);
}

main().catch((error) => {
  console.error(`Ontology archive restore failed: ${error.message}`);
  process.exit(1);
});
