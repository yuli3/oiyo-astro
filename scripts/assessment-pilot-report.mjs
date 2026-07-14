import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { analyzePilotRows, parsePilotJsonLines } from "./lib/assessment-pilot-stats.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const input = argument("--input");
const output = argument("--output");
const batchManifestPath = argument("--batch-manifest");
const instrumentPath = argument("--instrument") ?? "config/pilot-instruments/adult-attachment.json";
if (!input || !output || !batchManifestPath) {
  console.error("usage: node scripts/assessment-pilot-report.mjs --input <deidentified-single-locale.jsonl> --batch-manifest <immutable-batch.json> --output <secure-qc-report.json> [--instrument <instrument.json>]");
  process.exit(2);
}

const root = resolve(import.meta.dirname, "..");
const instrument = JSON.parse(readFileSync(resolve(root, instrumentPath), "utf8"));
const batchManifest = JSON.parse(readFileSync(resolve(batchManifestPath), "utf8"));
const rows = parsePilotJsonLines(readFileSync(resolve(input), "utf8"));
const report = analyzePilotRows(rows, instrument, batchManifest);
const serialized = `${JSON.stringify(report, null, 2)}\n`;
const outputPath = resolve(output);
writeFileSync(outputPath, serialized, { mode: 0o600 });
chmodSync(outputPath, 0o600);
