import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_ROOT = resolve(ROOT, ".local-data/ontology-sources");
const OUTPUT = resolve(ROOT, "config/ontology-platform/v2/occupation-source-inventory-v1.json");
const FILES = [
  { id: "esco-occupations-en", sourceId: "external:esco", version: "1.2.1", path: "esco-v1.2.1/occupations_en.csv", headers: ["conceptType", "conceptUri", "iscoGroup", "preferredLabel", "altLabels", "hiddenLabels", "status", "modifiedDate", "regulatedProfessionNote", "scopeNote", "definition", "inScheme", "description", "code", "naceCode"] },
  { id: "esco-isco-groups-en", sourceId: "external:esco", version: "1.2.1", path: "esco-v1.2.1/ISCOGroups_en.csv", headers: ["conceptType", "conceptUri", "code", "preferredLabel", "status", "altLabels", "inScheme", "description"] },
  { id: "esco-broader-occupation-relations-en", sourceId: "external:esco", version: "1.2.1", path: "esco-v1.2.1/broaderRelationsOccPillar_en.csv", headers: ["conceptType", "conceptUri", "conceptLabel", "broaderType", "broaderUri", "broaderLabel"] },
  { id: "onet-occupation-data", sourceId: "external:onet", version: "30.3", path: "onet-30.3/raw/occupation_data.csv", headers: ["O*NET-SOC Code", "Title", "Description"] },
];

function csvRecordCount(value) {
  let quoted = false;
  let records = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '"') {
      if (quoted && value[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (value[index] === "\n" && !quoted) records += 1;
  }
  return records;
}

function firstRecord(value) {
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '"') {
      if (quoted && value[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (value[index] === "\n" && !quoted) return value.slice(0, index).replace(/\r$/, "");
  }
  throw new Error("CSV header record missing");
}

function parseHeader(record) {
  const columns = [];
  let quoted = false;
  let column = "";
  for (let index = 0; index < record.length; index += 1) {
    const character = record[index];
    if (character === '"') {
      if (quoted && record[index + 1] === '"') { column += character; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { columns.push(column); column = ""; }
    else column += character;
  }
  columns.push(column);
  return columns;
}

const inventory = [];
for (const spec of FILES) {
  const contents = await readFile(resolve(SOURCE_ROOT, spec.path), "utf8");
  const headers = parseHeader(firstRecord(contents));
  if (JSON.stringify(headers) !== JSON.stringify(spec.headers)) throw new Error(`Unexpected schema: ${spec.id}`);
  const records = csvRecordCount(contents);
  if (records < 2) throw new Error(`No data records: ${spec.id}`);
  inventory.push({ ...spec, bytes: Buffer.byteLength(contents), sha256: createHash("sha256").update(contents).digest("hex"), records: records - 1 });
}
const document = {
  schema: "oiyo.ontology-occupation-source-inventory",
  schemaVersion: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  storage: ".local-data/ is raw-only, git-ignored, and excluded from ontology archives.",
  purpose: "Version-pinned, schema-checked input inventory for the minimal occupation index. This is not candidate staging or canonical occupation data.",
  files: inventory,
  deferredFiles: ["ESCO occupationSkillRelations_en.csv", "O*NET job_titles.csv", "O*NET task_*.csv", "O*NET work_context.csv", "O*NET abilities.csv", "O*NET knowledge.csv"],
  nextBatch: "Build a small source-scoped occupation index and a dedupe report against the existing 308 canonical occupations; do not promote candidates.",
};
if (!process.argv.includes("--write")) console.log(JSON.stringify(document, null, 2));
else {
  await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`);
  console.log(`Occupation source inventory written: ${document.files.length} files, ${document.files.reduce((total, file) => total + file.records, 0)} records`);
}
