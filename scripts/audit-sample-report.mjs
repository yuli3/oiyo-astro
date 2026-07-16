// C4 Wave 0 gate: the free sample-report specimen must stay derived-only,
// script-free, non-diagnostic, and pinned to the canonical export v2 input.
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const contract = JSON.parse(await readFile(new URL("config/sample-report-v1.contract.json", root), "utf8"));
const source = await readFile(new URL("src/assessments/profile/sample-report.ts", root), "utf8");
const errors = [];

if (contract.schema !== "oiyo.sample-report-contract" || contract.schemaVersion !== 1) errors.push("contract schema/version mismatch");
if (contract.lifecycle?.derived !== true || contract.lifecycle?.storage !== "none" || contract.lifecycle?.regeneration !== "recompute-from-export" || contract.lifecycle?.deletion !== "discard-file-only") errors.push("lifecycle contract mismatch");
if (contract.privacy?.serverTransmission !== "none" || contract.privacy?.rawResponsesIncluded !== false) errors.push("privacy contract mismatch");
if (!contract.comparison?.requiresSameAssessmentId || !contract.comparison?.requiresSameInstrumentVersion || !contract.comparison?.requiresSameScoringVersion) errors.push("comparison compatibility gate incomplete");
if (!String(contract.comparison?.interpretation).includes("never proof")) errors.push("comparison interpretation guardrail missing");
if (contract.document?.scripts !== false || contract.document?.externalRequests !== false || contract.document?.selfContained !== true) errors.push("document containment contract mismatch");
if (!Array.isArray(contract.humanGates) || !contract.humanGates.some((gate) => /public consumer/.test(gate)) || !contract.humanGates.some((gate) => /pricing|paywall/.test(gate))) errors.push("human gates for public/pricing missing");

for (const token of [
  "SAMPLE_REPORT_FORBIDDEN_CLAIM_PATTERNS",
  "assertCanonicalExport",
  "containsForbiddenKey",
  "recompute-from-export",
  "discard-file-only",
  "escapeHtml",
  "user-authored",
]) {
  if (!source.includes(token)) errors.push(`implementation token missing: ${token}`);
}
if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage/.test(source)) errors.push("sample-report module must not use network or browser storage");
if (/<script/i.test(source)) errors.push("rendered document must not carry scripts");

// Behavioral gate: the named vitest suite must actually pass in this process.
const vitest = fileURLToPath(new URL("node_modules/vitest/vitest.mjs", root));
const run = spawnSync(process.execPath, [vitest, "run", "src/assessments/profile/sample-report.test.ts"], {
  cwd: fileURLToPath(root),
  encoding: "utf8",
});
if (run.status !== 0) errors.push(`vitest suite failed:\n${(run.stdout || "") + (run.stderr || "")}`);

if (errors.length) {
  console.error("sample-report audit: FAIL");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log("sample-report audit: PASS (contract + containment + vitest)");
