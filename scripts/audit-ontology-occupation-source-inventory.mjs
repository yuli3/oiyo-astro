import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RAW = resolve(ROOT, ".local-data/ontology-sources");
const OUTPUT = resolve(ROOT, "config/ontology-platform/v2/occupation-source-inventory-v1.json");
const fail = (message) => { throw new Error(`Ontology occupation source-inventory audit failed: ${message}`); };
const document = JSON.parse(await readFile(OUTPUT, "utf8"));
if (document.schema !== "oiyo.ontology-occupation-source-inventory" || document.schemaVersion !== 1 || !Array.isArray(document.files) || document.files.length !== 4) fail("inventory envelope");
for (const file of document.files) {
  if (!file.id || !["external:esco", "external:onet"].includes(file.sourceId) || !file.version || !file.path || !Array.isArray(file.headers) || !file.headers.length || !Number.isInteger(file.records) || file.records < 1 || !/^[a-f0-9]{64}$/.test(file.sha256 ?? "")) fail(`file contract: ${file.id}`);
  const contents = await readFile(resolve(RAW, file.path), "utf8");
  if (Buffer.byteLength(contents) !== file.bytes || createHash("sha256").update(contents).digest("hex") !== file.sha256) fail(`raw snapshot drift: ${file.id}`);
}
if (!document.storage?.includes("git-ignored") || !document.purpose?.includes("not candidate staging") || !document.nextBatch?.includes("do not promote")) fail("scope boundary");
console.log(`Ontology occupation source-inventory audit PASS: ${document.files.length} source files, ${document.files.reduce((total, file) => total + file.records, 0)} source records, raw snapshot integrity verified.`);
