import { readFile } from "node:fs/promises";

const path = new URL("../config/personal-profile-snapshot-v1.fixtures.json", import.meta.url);
const fixture = JSON.parse(await readFile(path, "utf8"));
const consumer = await readFile(new URL("../src/components/ontology/AssessmentSignalSummary.tsx", import.meta.url), "utf8");
const projection = await readFile(new URL("../src/assessments/profile/projection.ts", import.meta.url), "utf8");
const ontologyRoute = await readFile(new URL("../src/pages/[locale]/ontology/index.astro", import.meta.url), "utf8");
const expectedLanes = ["trait", "preference", "interest", "chosen-value", "reflective-signal"];
const errors = [];

for (const token of ["collectAssessmentSignals", "confidence", "observedAt", "evidenceTier"]) {
  if (!consumer.includes(token)) errors.push(`ontology signal consumer missing ${token}`);
}
for (const token of ["projectPersonalProfileSnapshot", "PERSONAL_PROFILE_LANES", "freshness"]) {
  if (!projection.includes(token)) errors.push(`profile projection implementation missing ${token}`);
}
if (!ontologyRoute.includes("<AssessmentSignalSummary locale={locale} client:load")) errors.push("ontology route does not mount the current assessment signal consumer");

if (fixture.schema !== "oiyo.personal-profile-snapshot-fixtures" || fixture.schemaVersion !== 1) {
  errors.push("fixture schema/version mismatch");
}
if (!Array.isArray(fixture.instruments) || fixture.instruments.length !== 5) {
  errors.push("exactly five instrument fixtures are required");
}

const ids = new Set();
const lanes = new Set();
for (const instrument of fixture.instruments ?? []) {
  if (!instrument.assessmentId || ids.has(instrument.assessmentId)) errors.push(`duplicate/missing assessmentId: ${instrument.assessmentId}`);
  ids.add(instrument.assessmentId);
  if (!expectedLanes.includes(instrument.lane)) errors.push(`unknown lane: ${instrument.lane}`);
  lanes.add(instrument.lane);
  if (!Number.isFinite(Date.parse(instrument.measuredAt))) errors.push(`invalid measuredAt: ${instrument.assessmentId}`);
  if (!Array.isArray(instrument.expectedConstructs) || instrument.expectedConstructs.length === 0) errors.push(`empty constructs: ${instrument.assessmentId}`);
  if ("responses" in instrument || "answers" in instrument || "legacy" in instrument) errors.push(`raw response field forbidden: ${instrument.assessmentId}`);
}
for (const lane of expectedLanes) if (!lanes.has(lane)) errors.push(`missing lane fixture: ${lane}`);

if (errors.length) {
  console.error(`PersonalProfileSnapshot audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`PersonalProfileSnapshot audit PASS: ${ids.size} instruments, ${lanes.size} independent lanes, raw responses absent`);
