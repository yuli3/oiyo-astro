import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import vm from "node:vm";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SOURCE = (path) => resolve(ROOT, path);
const DEFAULT_CONTEXT_BY_RIASEC = { R: "construction_delivery", I: "research_discovery", A: "creative_production", S: "people_development", E: "market_communication", C: "operations_coordination" };

function fail(message) { throw new Error(`Occupation quality audit failed: ${message}`); }
function evaluateTsArray(relativePath, exportName) {
  return readFile(SOURCE(relativePath), "utf8").then((source) => {
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(output, { exports: module.exports, module });
    return module.exports[exportName];
  });
}
function readOverrides(importerSource) {
  const match = importerSource.match(/const OCCUPATIONS = \[(.*?)\];\n\n\/\/ Every source career/s);
  if (!match) fail("cannot locate reviewed OCCUPATIONS override list");
  const sandbox = {};
  vm.runInNewContext(`result = [${match[1]}]`, sandbox);
  if (!Array.isArray(sandbox.result)) fail("invalid reviewed OCCUPATIONS override list");
  return new Map(sandbox.result.map(([legacyId, context, existingId]) => [legacyId, { context, existingId }]));
}
function catalogEdgesFor(edges, occupationId, legacyId) {
  const sourceId = `catalog:careers.${legacyId}`;
  return edges.filter((edge) => edge.kind === "example_occupation" && edge.to === occupationId && edge.sourceIds?.includes(sourceId));
}
function counts(values) { return Object.fromEntries([...values.entries()].sort(([left], [right]) => left.localeCompare(right, "en"))); }

const [conceptDocument, edgeDocument, careers, importerSource] = await Promise.all([
  readFile(SOURCE("config/ontology-platform/v1/concepts.json"), "utf8").then(JSON.parse),
  readFile(SOURCE("config/ontology-platform/v1/edges.json"), "utf8").then(JSON.parse),
  evaluateTsArray("src/lib/data-layer/shards/careers.ts", "CAREERS"),
  readFile(SOURCE("scripts/import-ontology-platform-catalog.mjs"), "utf8"),
]);

const overrides = readOverrides(importerSource);
const uniqueCareers = [...new Map(careers.map((career) => [career.id, career])).values()];
const occupations = conceptDocument.concepts.filter(({ kind }) => kind === "occupation");
const occupationByLegacyId = new Map();
for (const occupation of occupations) {
  for (const legacyId of occupation.legacyIds ?? []) {
    if (occupationByLegacyId.has(legacyId)) fail(`duplicate occupation legacy ID: ${legacyId}`);
    occupationByLegacyId.set(legacyId, occupation);
  }
}

const errors = [];
const contextCounts = { explicit: new Map(), fallback: new Map(), total: new Map() };
const secondaryContextCounts = new Map();
const riasecCounts = new Map();
const reviewQueue = [];
let seedReusedPrimaryMappings = 0;
let secondaryContextExamples = 0;
let derivedSecondaryContextRelations = 0;
for (const career of uniqueCareers) {
  const occupation = occupationByLegacyId.get(career.id);
  if (!occupation) {
    errors.push(`missing occupation for source career: ${career.id}`);
    continue;
  }
  const override = overrides.get(career.id);
  const riasecCodes = [...career.riasecCode];
  if (riasecCodes.some((code) => !Object.hasOwn(DEFAULT_CONTEXT_BY_RIASEC, code))) errors.push(`unsupported RIASEC code for ${career.id}: ${career.riasecCode}`);
  const primaryRiasec = riasecCodes.find((code) => DEFAULT_CONTEXT_BY_RIASEC[code]);
  const expectedContext = override?.context ?? DEFAULT_CONTEXT_BY_RIASEC[primaryRiasec];
  const matchingEdges = catalogEdgesFor(edgeDocument.edges, occupation.id, career.id);
  const importedPrimary = matchingEdges.filter((edge) => edge.weight === 0.82 && edge.confidence === 0.85);
  const secondary = matchingEdges.filter((edge) => edge.weight === 0.68 && edge.confidence === 0.85);
  const derivedSecondary = matchingEdges.filter((edge) => edge.weight === 0.54 && edge.confidence === 0.65 && edge.rationaleKey?.startsWith(`relations.derived_secondary_riasec.${career.id.replace(/-/g, "_")}.`));
  if (importedPrimary.length > 1) {
    errors.push(`multiple primary catalog context edges for ${career.id}`);
    continue;
  }
  let context;
  if (importedPrimary.length === 1) {
    const edge = importedPrimary[0];
    context = edge.from.replace("work_context.", "");
    if (!edge.from.startsWith("work_context.") || edge.provenance !== "imported" || edge.evidenceClass !== "catalog_derived") errors.push(`invalid imported edge contract: ${career.id}`);
  } else {
    const seedPrimary = edgeDocument.edges.filter((edge) => edge.kind === "example_occupation" && edge.to === occupation.id && edge.from === `work_context.${expectedContext}` && edge.provenance === "curated");
    if (seedPrimary.length !== 1) {
      errors.push(`missing primary context edge for ${career.id}`);
      continue;
    }
    context = expectedContext;
    seedReusedPrimaryMappings += 1;
  }
  if (!expectedContext || context !== expectedContext) errors.push(`context mismatch for ${career.id}: expected ${expectedContext}, received ${context}`);
  secondaryContextExamples += secondary.length;
  const expectedSecondaryContexts = override ? [] : [...new Set(riasecCodes.map((code) => DEFAULT_CONTEXT_BY_RIASEC[code]).filter(Boolean))].slice(1, 3);
  const actualSecondaryContexts = derivedSecondary.map((edge) => edge.from.replace("work_context.", "")).sort();
  if (actualSecondaryContexts.length !== expectedSecondaryContexts.length || actualSecondaryContexts.some((entry, index) => entry !== [...expectedSecondaryContexts].sort()[index])) errors.push(`secondary context mismatch for ${career.id}`);
  if (derivedSecondary.some((edge) => edge.provenance !== "imported" || edge.evidenceClass !== "catalog_derived" || !edge.from.startsWith("work_context."))) errors.push(`invalid derived secondary edge contract: ${career.id}`);
  derivedSecondaryContextRelations += derivedSecondary.length;
  for (const secondaryContext of actualSecondaryContexts) secondaryContextCounts.set(secondaryContext, (secondaryContextCounts.get(secondaryContext) ?? 0) + 1);
  const mode = override ? "explicit" : "fallback";
  const increment = (bucket, key) => bucket.set(key, (bucket.get(key) ?? 0) + 1);
  increment(contextCounts[mode], context);
  increment(contextCounts.total, context);
  for (const code of riasecCodes) increment(riasecCounts, code);
  if (!override) reviewQueue.push({
    id: career.id,
    label: occupation.labels.en,
    riasec: riasecCodes,
    currentContext: context,
    priority: riasecCodes.length > 1 ? "high" : "standard",
    reason: riasecCodes.length > 1 ? "fallback uses only the first of multiple RIASEC codes" : "fallback uses one primary RIASEC context",
  });
}

if (uniqueCareers.length !== 308) errors.push(`unexpected unique career source count: ${uniqueCareers.length}`);
if (occupations.length !== 308) errors.push(`unexpected occupation concept count: ${occupations.length}`);
if (overrides.size !== 100) errors.push(`unexpected reviewed override count: ${overrides.size}`);
if (reviewQueue.length !== 208) errors.push(`unexpected fallback queue count: ${reviewQueue.length}`);
if (errors.length) fail(errors.join("; "));

reviewQueue.sort((left, right) => (left.priority === right.priority ? left.id.localeCompare(right.id, "en") : left.priority === "high" ? -1 : 1));
const report = {
  schema: "oiyo.ontology-occupation-quality-audit",
  schemaVersion: 1,
  summary: {
    sourceCareerRows: careers.length,
    uniqueOccupations: uniqueCareers.length,
    explicitMappings: overrides.size,
    fallbackMappings: reviewQueue.length,
    highPriorityFallbacks: reviewQueue.filter(({ priority }) => priority === "high").length,
    seedReusedPrimaryMappings,
    secondaryContextExamples,
    derivedSecondaryContextRelations,
  },
  contextDistribution: {
    explicit: counts(contextCounts.explicit),
    fallback: counts(contextCounts.fallback),
    total: counts(contextCounts.total),
  },
  secondaryContextDistribution: counts(secondaryContextCounts),
  riasecDistribution: counts(riasecCounts),
  reviewQueue,
};

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else console.log(`Occupation quality audit PASS: ${report.summary.uniqueOccupations} occupations; ${report.summary.explicitMappings} explicit, ${report.summary.fallbackMappings} fallback (${report.summary.highPriorityFallbacks} high-priority multi-RIASEC); contexts ${Object.keys(report.contextDistribution.total).length}`);
