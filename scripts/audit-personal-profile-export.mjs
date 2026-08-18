import { readFile } from "node:fs/promises";

const root = new URL("../config/", import.meta.url);
const consumer = await readFile(new URL("../src/components/profile/PersonalProfileExportV2Panel.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/pages/[locale]/profile/export.astro", import.meta.url), "utf8");
const matrix = JSON.parse(await readFile(new URL("personal-profile-export-v2.compatibility.json", root), "utf8"));
const fixture = JSON.parse(await readFile(new URL("personal-profile-export-v2.fixture.json", root), "utf8"));
const errors = [];
// soul was removed from the product export formats (2026-08-14); the matrix
// now carries three.
const expectedFormats = new Set(["json", "markdown", "obsidian"]);
const expectedFormatCount = expectedFormats.size;
const forbidden = new Set(["answers", "classifications", "legacy", "raw", "responses"]);

function walk(value, path = "$") {
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) errors.push(`forbidden raw field ${path}.${key}`);
    walk(child, `${path}.${key}`);
  }
}

if (matrix.canonicalExportSchema !== "oiyo.personal-profile-export" || matrix.canonicalExportVersion !== 2) errors.push("matrix canonical schema/version mismatch");
if (!Array.isArray(matrix.existingSurfaces) || matrix.existingSurfaces.length !== 2 || matrix.existingSurfaces.some((item) => !item.id || !item.currentContract || !item.decision)) errors.push("existing export surface decisions incomplete");
if (!Array.isArray(matrix.formats) || matrix.formats.length !== expectedFormatCount) errors.push(`matrix must contain ${expectedFormatCount} formats`);
for (const format of matrix.formats ?? []) {
  if (!expectedFormats.delete(format.format)) errors.push(`duplicate/unknown format: ${format.format}`);
  if (format.rawResponsesIncluded !== false) errors.push(`raw response policy mismatch: ${format.format}`);
  if (!format.filename || !format.mime || !format.roundTrip || !format.provenance || !format.mobileFallback) errors.push(`incomplete compatibility row: ${format.format}`);
  if (!String(format.mobileFallback).startsWith("deliverPersonalProfileExport:")) errors.push(`unimplemented mobile fallback claim: ${format.format}`);
}
for (const missing of expectedFormats) errors.push(`missing format: ${missing}`);

if (fixture.schema !== "oiyo.personal-profile-export" || fixture.schemaVersion !== 2) errors.push("fixture export schema/version mismatch");
if (fixture.sections?.assessmentDerived?.schema !== "oiyo.personal-profile-snapshot" || fixture.sections?.assessmentDerived?.schemaVersion !== 1) errors.push("fixture source snapshot mismatch");
if (fixture.privacy?.rawResponsesIncluded !== false || fixture.privacy?.serverTransmission !== "none") errors.push("fixture privacy contract mismatch");
if (!Array.isArray(fixture.provenance) || fixture.provenance.some((item) => !item.resultId || !item.instrumentVersion || !item.scoringVersion || !item.interpretationVersion || !item.measuredAt)) errors.push("fixture provenance incomplete");
walk(fixture);
for (const token of ["buildPersonalProfileExportV2", "projectPersonalProfileSnapshot", "listAssessmentResults", "deliverPersonalProfileExport", "saveObsidianFiles"]) {
  if (!consumer.includes(token)) errors.push(`public v2 consumer missing ${token}`);
}
for (const locale of ["ko", "en", "ja", "zh", "fr", "es"]) {
  if (!consumer.includes(`${locale}:`)) errors.push(`public v2 consumer missing locale ${locale}`);
}
if (!route.includes("<PersonalProfileExportV2Panel client:load")) errors.push("public profile export route does not mount v2 consumer");

if (errors.length) {
  console.error(`Personal profile export audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Personal profile export audit PASS: ${expectedFormatCount} formats, public v2 consumer, 6 locales, provenance complete, raw responses absent`);
