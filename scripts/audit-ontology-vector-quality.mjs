import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import vm from "node:vm";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const readJson = (name) => readFile(resolve(PLATFORM_ROOT, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(`Vector quality audit failed: ${message}`); };
const count = (items) => Object.fromEntries([...items.entries()].sort(([left], [right]) => left.localeCompare(right, "en")));
const evaluateTsArray = (relativePath, exportName) => readFile(resolve(ROOT, relativePath), "utf8").then((source) => {
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module });
  return module.exports[exportName];
});
const cosine = (left, right, facets) => {
  let dot = 0, leftNorm = 0, rightNorm = 0;
  for (const facet of facets) { dot += left[facet] * right[facet]; leftNorm += left[facet] ** 2; rightNorm += right[facet] ** 2; }
  return leftNorm && rightNorm ? dot / Math.sqrt(leftNorm * rightNorm) : 0;
};

const [conceptDocument, edgeDocument, careers] = await Promise.all([readJson("concepts.json"), readJson("edges.json"), evaluateTsArray("src/lib/data-layer/shards/careers.ts", "CAREERS")]);
const { facets, concepts } = conceptDocument;
const errors = [];
const byId = new Map(concepts.map((concept) => [concept.id, concept]));
const byKind = new Map();
const facetDistribution = Object.fromEntries(facets.map((facet) => [facet, { zero: 0, nonZero: 0, sum: 0, max: 0 }]));
const fingerprints = new Map();
for (const concept of concepts) {
  const norm = Math.sqrt(facets.reduce((sum, facet) => sum + concept.facets[facet] ** 2, 0));
  if (norm === 0) errors.push(`zero-norm vector: ${concept.id}`);
  const group = byKind.get(concept.kind) ?? [];
  group.push(concept);
  byKind.set(concept.kind, group);
  const fingerprint = facets.map((facet) => concept.facets[facet]).join("");
  const key = `${concept.kind}:${fingerprint}`;
  fingerprints.set(key, (fingerprints.get(key) ?? 0) + 1);
  for (const facet of facets) {
    const bucket = facetDistribution[facet];
    bucket.sum += concept.facets[facet];
    bucket.max = Math.max(bucket.max, concept.facets[facet]);
    if (concept.facets[facet] === 0) bucket.zero += 1;
    else bucket.nonZero += 1;
  }
}
for (const [facet, bucket] of Object.entries(facetDistribution)) {
  bucket.mean = Number((bucket.sum / concepts.length).toFixed(3));
  delete bucket.sum;
  if (bucket.nonZero === 0) errors.push(`globally unused facet: ${facet}`);
}
const fingerprintConcentration = {};
for (const [kind, group] of byKind) {
  const largest = Math.max(...[...fingerprints.entries()].filter(([key]) => key.startsWith(`${kind}:`)).map(([, value]) => value));
  fingerprintConcentration[kind] = { concepts: group.length, largestSharedVector: largest, ratio: Number((largest / group.length).toFixed(3)) };
  if (group.length > 10 && largest / group.length > 0.85) errors.push(`vector diversity collapsed for ${kind}`);
}

const contextConcepts = byKind.get("work_context") ?? [];
const derivedGroups = new Map();
for (const edge of edgeDocument.edges.filter((edge) => edge.provenance === "derived")) {
  if (!((edge.from.startsWith("action.") || edge.from.startsWith("hobby.")) && edge.to.startsWith("work_context.") && ["used_in", "transfers_to"].includes(edge.kind))) errors.push(`unexpected derived vector edge: ${edge.from} -> ${edge.to}`);
  const group = derivedGroups.get(edge.from) ?? [];
  group.push(edge);
  derivedGroups.set(edge.from, group);
}
let derivedChecked = 0;
for (const [from, edges] of derivedGroups) {
  const source = byId.get(from);
  const perSource = from.startsWith("action.") ? 2 : 1;
  const expected = contextConcepts.map((target) => ({ id: target.id, score: cosine(source.facets, target.facets, facets) })).sort((left, right) => right.score - left.score || left.id.localeCompare(right.id, "en")).slice(0, perSource).map(({ id }) => id);
  const reserved = new Set(edgeDocument.edges.filter((edge) => edge.from === from && edge.kind === edges[0].kind && edge.provenance !== "derived").map((edge) => edge.to));
  const expectedDerived = expected.filter((id) => !reserved.has(id));
  const actual = edges.sort((left, right) => left.to.localeCompare(right.to, "en")).map(({ to }) => to).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...expectedDerived].sort())) errors.push(`derived top-N mismatch: ${from}`);
  if (edges.some((edge) => edge.weight > 0.54 || edge.confidence > 0.65)) errors.push(`derived confidence ceiling broken: ${from}`);
  derivedChecked += edges.length;
}
const occupationExampleEdges = edgeDocument.edges.filter((edge) => edge.kind === "example_occupation" && edge.to.startsWith("occupation.") && edge.from.startsWith("work_context."));
const occupationExampleCounts = new Map();
for (const edge of occupationExampleEdges) occupationExampleCounts.set(edge.to, (occupationExampleCounts.get(edge.to) ?? 0) + 1);
const occupations = byKind.get("occupation") ?? [];
if (occupations.some((occupation) => (occupationExampleCounts.get(occupation.id) ?? 0) < 1)) errors.push("occupation context coverage mismatch");
const contextCoverage = new Map();
for (const edge of occupationExampleEdges) contextCoverage.set(edge.from, (contextCoverage.get(edge.from) ?? 0) + 1);
if (contextConcepts.length !== 80) errors.push(`work context taxonomy contract regressed: ${contextConcepts.length}`);
if (contextCoverage.size !== 22) errors.push(`legacy occupation context coverage changed: ${contextCoverage.size}`);
const v2Source = JSON.parse(await readFile(resolve(ROOT, "config/ontology-platform/v2/work-context-taxonomy-v2.json"), "utf8"));
const v2ContextIds = new Set(v2Source.contexts.map(([id]) => `work_context.${id}`));
if (v2ContextIds.size !== 58 || [...v2ContextIds].some((id) => occupationExampleEdges.some((edge) => edge.from === id))) errors.push("editorial work contexts must remain action/hobby-derived only");
const riasecDistribution = new Map();
for (const career of [...new Map(careers.map((career) => [career.id, career])).values()]) {
  for (const code of career.riasecCode) {
    if (!"RIASEC".includes(code)) errors.push(`invalid source RIASEC code: ${career.id}.${code}`);
    riasecDistribution.set(code, (riasecDistribution.get(code) ?? 0) + 1);
  }
}
if (riasecDistribution.size !== 6) errors.push(`RIASEC diversity regressed: ${riasecDistribution.size}`);
if (errors.length) fail(errors.join("; "));

const report = {
  schema: "oiyo.ontology-vector-quality-audit",
  schemaVersion: 1,
  summary: { concepts: concepts.length, facets: facets.length, derivedEdgesChecked: derivedChecked, occupations: occupations.length, contextExampleCoverage: contextCoverage.size, riasecCodes: riasecDistribution.size },
  facetDistribution,
  fingerprintConcentration,
  contextExampleDistribution: count(contextCoverage),
  riasecDistribution: count(riasecDistribution),
};
if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else console.log(`Vector quality audit PASS: ${report.summary.concepts} concepts, ${report.summary.facets} facets, ${report.summary.derivedEdgesChecked} derived top-N edges, ${report.summary.contextExampleCoverage} work contexts, ${report.summary.riasecCodes} RIASEC codes`);
