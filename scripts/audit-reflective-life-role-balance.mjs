// B3 Wave 0 gate: life-role-balance must stay a user-authored reflective
// activity — no trait aggregation, no note-text inference, no crisis framing,
// no storage or network inside the module.
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const contract = JSON.parse(await readFile(new URL("config/reflective-life-role-balance-v1.contract.json", root), "utf8"));
const source = await readFile(new URL("src/assessments/reflective/life-role-balance.ts", root), "utf8");
const errors = [];

if (contract.schema !== "oiyo.reflective-activity-contract" || contract.schemaVersion !== 1) errors.push("contract schema/version mismatch");
if (contract.notAnAssessment !== true || contract.kind !== "reflective-activity") errors.push("activity must be declared not-an-assessment");
if (contract.authorship?.provenance !== "user-authored-reflection" || contract.authorship?.userEditable !== true) errors.push("user-authored provenance contract mismatch");
if (contract.boundaries?.traitAggregation !== "none" || contract.boundaries?.noteTextInference !== "none" || contract.boundaries?.crisisOrDepressionScreening !== "forbidden" || contract.boundaries?.scoring !== "none") errors.push("boundary contract mismatch");
if (contract.privacy?.storage !== "caller-owned" || contract.privacy?.serverTransmission !== "none") errors.push("privacy contract mismatch");
if (!Array.isArray(contract.humanGates) || !contract.humanGates.some((gate) => /public consumer/.test(gate)) || !contract.humanGates.some((gate) => /persistence/.test(gate))) errors.push("human gates missing");

for (const token of [
  "LIFE_ROLE_BALANCE_FORBIDDEN_FRAMING",
  "user-authored-reflection",
  'aggregation: "none"',
  'inference: "none"',
  "userEditable: true",
]) {
  if (!source.includes(token)) errors.push(`implementation token missing: ${token}`);
}
// The module must not read personality lanes, store, or transmit anything.
if (/from\s+["']\.\.\/profile|from\s+["']\.\.\/core|PersonalProfile/.test(source)) errors.push("reflective activity must not read assessment/profile projections");
if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage/.test(source)) errors.push("module must not use network or browser storage");
// No keyword screening of user note text: notes may only be length-checked.
if (/note[^\n]*\.(match|search|test|includes)\(/.test(source)) errors.push("module must not inspect note content");

// Behavioral gate: the named vitest suite must actually pass in this process.
const vitest = fileURLToPath(new URL("node_modules/vitest/vitest.mjs", root));
const run = spawnSync(process.execPath, [vitest, "run", "src/assessments/reflective/life-role-balance.test.ts"], {
  cwd: fileURLToPath(root),
  encoding: "utf8",
});
if (run.status !== 0) errors.push(`vitest suite failed:\n${(run.stdout || "") + (run.stderr || "")}`);

if (errors.length) {
  console.error("life-role-balance audit: FAIL");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log("life-role-balance audit: PASS (contract + boundaries + vitest)");
