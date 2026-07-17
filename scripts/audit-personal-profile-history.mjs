import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const contract = JSON.parse(await readFile(new URL("config/personal-profile-history-v1.contract.json", root), "utf8"));
const fixture = JSON.parse(await readFile(new URL("config/personal-profile-history-v1.fixture.json", root), "utf8"));
const source = await readFile(new URL("src/assessments/profile/history.ts", root), "utf8");
const consumer = await readFile(new URL("src/components/ontology/PersonalProfileHistoryPreview.tsx", root), "utf8");
const previewRoute = await readFile(new URL("src/pages/[locale]/ontology/template/deep.astro", root), "utf8");
const errors = [];
const expectedStates = ["ready", "empty", "storage-disabled", "read-failed", "corrupt", "write-failed", "delete-failed", "export-failed"];
const forbiddenClaims = [/personality (?:definitely|proved|truly) changed/i, /fixed personality type/i];

if (contract.schema !== "oiyo.personal-profile-history-contract" || contract.schemaVersion !== 1) errors.push("contract schema/version mismatch");
if (contract.storageKey !== "oiyo:personal-profile-history:v1") errors.push("storage key mismatch");
if (contract.privacy?.storage !== "browser-local-only" || contract.privacy?.serverTransmission !== "none" || contract.privacy?.rawResponsesIncluded !== false) errors.push("privacy contract mismatch");
if (contract.recording?.mode !== "explicit-opt-in" || contract.recording?.automaticRecreationAfterDelete !== false) errors.push("explicit recording/delete contract mismatch");
if (contract.retention?.maxPerInstrumentVersion !== 12 || contract.retention?.maxTotal !== 100 || contract.retention?.freshDays !== 365) errors.push("retention contract mismatch");
if (JSON.stringify(contract.uxStates) !== JSON.stringify(expectedStates)) errors.push("UX states incomplete or reordered");
if (!contract.comparison?.requiresSameAssessmentId || !contract.comparison?.requiresSameInstrumentVersion || !contract.comparison?.requiresSameScoringVersion) errors.push("comparison compatibility gate incomplete");
if (!String(contract.comparison?.interpretation).includes("never proof")) errors.push("comparison interpretation guardrail missing");
if (fixture.schema !== "oiyo.personal-profile-history" || fixture.schemaVersion !== 1 || fixture.entries?.length !== 2) errors.push("two-point synthetic fixture mismatch");
if (fixture.privacy?.serverTransmission !== "none" || fixture.privacy?.rawResponsesIncluded !== false || fixture.privacy?.storage !== "browser-local-only") errors.push("fixture privacy contract mismatch");
if (fixture.entries?.some((entry) => entry.assessmentId !== "big5" || entry.instrumentVersion !== "big5-ocean-20-v1")) errors.push("fixture must compare one instrument/version");
for (const token of ["PERSONAL_PROFILE_HISTORY_SERVER_TRANSMISSION", "browser-local-only", "containsForbiddenKey", "comparePersonalProfileHistory", "deletePersonalProfileHistoryPoint", "clearPersonalProfileHistory"]) {
  if (!source.includes(token)) errors.push(`implementation token missing: ${token}`);
}
if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(consumer)) errors.push("preview consumer must not contain a network transport");
if (!consumer.includes("PersonalProfileHistoryPreview") || !previewRoute.includes("PersonalProfileHistoryPreview") || !previewRoute.includes("noindex")) errors.push("existing noindex preview consumer wiring missing");
if (consumer.includes("OIYO_ASSESSMENT_RESULTS_UPDATED_EVENT") || !consumer.includes("setResult(loadPersonalProfileHistory())") || !consumer.includes("onClick={capture}")) errors.push("consumer must load passively and record only by explicit opt-in");
if ((consumer.match(/status:\s*\{/g) ?? []).length !== 6 || (consumer.match(/scoringMismatch:/g) ?? []).length !== 7) errors.push("six-locale direct UX/compatibility copy incomplete");
if (!consumer.includes('locale }: { locale: Lang }') || consumer.includes('? locale : "en"')) errors.push("consumer locale fallback is not allowed");
if (!consumer.includes("export-failed") || !consumer.includes("revokeObjectUrl(url)")) errors.push("export failure/revocation behavior missing");
for (const pattern of forbiddenClaims) if (pattern.test(source) || pattern.test(consumer)) errors.push(`forbidden fixed-change claim: ${pattern}`);

// Execute the named behavioral contract. A comment or source token cannot
// satisfy this gate: every required ID must belong to an assertion that Vitest
// actually reports as passed in this audit process.
const vitest = fileURLToPath(new URL("node_modules/vitest/vitest.mjs", root));
const executed = spawnSync(process.execPath, [vitest, "--run", "src/assessments/profile/history.test.ts", "--reporter=json"], {
  cwd: fileURLToPath(root),
  encoding: "utf8",
  env: { ...process.env, NO_COLOR: "1" },
});
if (executed.status !== 0) {
  errors.push(`executable Vitest contract failed: ${executed.stderr || executed.stdout || `exit ${executed.status}`}`);
} else {
  try {
    const report = JSON.parse(executed.stdout);
    const passedTitles = (report.testResults ?? []).flatMap((suite) => suite.assertionResults ?? [])
      .filter((assertion) => assertion.status === "passed")
      .map((assertion) => assertion.fullName ?? assertion.title ?? "");
    for (const regression of contract.requiredRegressionCases ?? []) {
      if (!passedTitles.some((title) => title.includes(`[${regression}]`))) {
        errors.push(`required executable regression did not pass: ${regression}`);
      }
    }
  } catch (error) {
    errors.push(`could not parse executable Vitest report: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (errors.length) {
  console.error(`Personal profile history audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Personal profile history audit PASS: ${expectedStates.length} UX states, ${contract.requiredRegressionCases.length} regressions, 365d freshness, server transmission none`);
