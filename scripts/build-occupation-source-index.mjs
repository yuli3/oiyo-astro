import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import vm from "node:vm";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RAW = resolve(ROOT, ".local-data/ontology-sources");
const V1 = resolve(ROOT, "config/ontology-platform/v1");
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const OUTPUT = resolve(V2, "occupation-source-index-v1.json");
const INVENTORY = JSON.parse(await readFile(resolve(V2, "occupation-source-inventory-v1.json"), "utf8"));
const csv = (value) => {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '"') {
      if (quoted && value[index + 1] === '"') { field += character; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { row.push(field); field = ""; }
    else if (character === "\n" && !quoted) { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
};
const records = (value) => {
  const [headers, ...rows] = csv(value);
  return rows.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
};
const normalize = (value) => value.toLocaleLowerCase("en").normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
const splitAliases = (value) => [...new Set(value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean))];
const evaluateTsArray = async (relativePath, exportName) => {
  const source = await readFile(resolve(ROOT, relativePath), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module });
  return module.exports[exportName];
};
const inventoryById = new Map(INVENTORY.files.map((file) => [file.id, file]));
const readInventoryFile = async (id) => records(await readFile(resolve(RAW, inventoryById.get(id).path), "utf8"));
const [escoRows, onetRows, concepts] = await Promise.all([
  readInventoryFile("esco-occupations-en"), readInventoryFile("onet-occupation-data"), readFile(resolve(V1, "concepts.json"), "utf8").then(JSON.parse),
]);
const escoSourceRows = escoRows.filter((row) => row.conceptType === "Occupation" && row.status === "released");
const escoByUri = new Map();
for (const row of escoSourceRows) {
  const existing = escoByUri.get(row.conceptUri);
  if (existing && ["preferredLabel", "altLabels", "code", "iscoGroup"].some((key) => existing[key] !== row[key])) throw new Error(`conflicting duplicate ESCO URI: ${row.conceptUri}`);
  if (!existing || existing.modifiedDate < row.modifiedDate) escoByUri.set(row.conceptUri, row);
}
const entries = [
  ...[...escoByUri.values()].map((row) => ({ sourceId: "external:esco", externalId: row.conceptUri, label: row.preferredLabel.trim(), aliases: splitAliases(row.altLabels), classification: { escoCode: row.code, iscoGroup: row.iscoGroup } })),
  ...onetRows.map((row) => ({ sourceId: "external:onet", externalId: row["O*NET-SOC Code"], label: row.Title.trim(), aliases: [], classification: { onetSocCode: row["O*NET-SOC Code"] } })),
].filter((entry) => entry.label && entry.externalId).sort((left, right) => `${left.sourceId}:${left.externalId}`.localeCompare(`${right.sourceId}:${right.externalId}`, "en"));
if (new Set(entries.map((entry) => `${entry.sourceId}:${entry.externalId}`)).size !== entries.length) throw new Error("duplicate source-scoped external identifier");
const canonicalTerms = new Map();
for (const concept of concepts.concepts.filter((concept) => concept.kind === "occupation")) {
  for (const term of [concept.labels.en, ...(concept.aliases?.en ?? [])]) {
    const key = normalize(term);
    if (key) canonicalTerms.set(key, [...(canonicalTerms.get(key) ?? []), concept.id]);
  }
}
const exactMatches = [];
let exact = 0;
for (const entry of entries) {
  const terms = [entry.label, ...entry.aliases];
  const canonicalIds = [...new Set(terms.flatMap((term) => canonicalTerms.get(normalize(term)) ?? []))].sort();
  if (canonicalIds.length) { exact += 1; exactMatches.push({ sourceId: entry.sourceId, externalId: entry.externalId, label: entry.label, canonicalIds, matchType: "normalized_exact_label_or_alias" }); }
}
const document = {
  schema: "oiyo.ontology-occupation-source-index",
  schemaVersion: 1,
  status: "review_material_only",
  localeCoverage: ["en"],
  sourceInventory: INVENTORY.files.map(({ id, sourceId, version, sha256 }) => ({ id, sourceId, version, sha256 })),
  safety: "The index is not canonical data, candidate staging, a multilingual label packet, an occupation equivalence decision, or a personal/career-fit/hiring/income conclusion.",
  normalization: "Unicode NFKD, English lowercase, punctuation-to-space, and whitespace collapse. Exact results are string overlap only.",
  summary: { canonicalOccupationsCompared: concepts.concepts.filter((concept) => concept.kind === "occupation").length, sourceRows: { escoReleased: escoSourceRows.length, escoDuplicateRowsDeduped: escoSourceRows.length - escoByUri.size, onet: onetRows.length }, indexed: entries.length, bySource: Object.groupBy(entries, ({ sourceId }) => sourceId), exactMatches: exact, reviewRequired: entries.length - exact },
  entries,
  exactMatches,
  nextStep: "Review exact matches and select a bounded candidate cohort. Do not promote any entry until source-scoped alias mapping, six reviewed locale labels, rationale, facets, and golden fixtures exist."
};
document.summary.bySource = Object.fromEntries(Object.entries(document.summary.bySource).map(([sourceId, values]) => [sourceId, values.length]));
if (!process.argv.includes("--write")) console.log(JSON.stringify(document.summary, null, 2));
else { await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`); console.log(`Occupation source index written: ${entries.length} entries, ${exactMatches.length} exact overlaps, ${entries.length - exactMatches.length} review-required`); }
