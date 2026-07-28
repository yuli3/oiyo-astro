import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import vm from "node:vm";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const platform = JSON.parse(await readFile(resolve(ROOT, "config/ontology-platform/v1/concepts.json"), "utf8"));
function evaluateTsArray(relativePath, exportName) {
  return readFile(resolve(ROOT, relativePath), "utf8").then((source) => {
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(output, { exports: module.exports, module });
    return module.exports[exportName];
  });
}
const careers = await evaluateTsArray("src/lib/data-layer/shards/careers.ts", "CAREERS");
const selectedCareerIds = [...new Set(careers.map(({ id }) => id))];
const selectedHobbyIds = ["HOBBY_GARDENING", "HOBBY_MEDITATION", "HOBBY_HIKING", "HOBBY_COOKING", "HOBBY_CODING", "HOBBY_PHOTOGRAPHY", "HOBBY_READING", "HOBBY_YOGA", "HOBBY_BOARD_GAMES", "HOBBY_WRITING", "HOBBY_SWIMMING", "HOBBY_ASTRONOMY", "HOBBY_PAINTING", "HOBBY_VOLUNTEERING", "HOBBY_CHESS", "HOBBY_CYCLING", "HOBBY_POTTERY", "HOBBY_DANCING", "HOBBY_PHILOSOPHY", "HOBBY_ROCK_CLIMBING", "HOBBY_MUSIC_COMPOSITION", "HOBBY_DEBATING", "HOBBY_LINGUISTICS", "HOBBY_MARCHIAL_ARTS", "HOBBY_WOODWORKING"];
const curatedHobbyDocument = JSON.parse(await readFile(resolve(ROOT, "config/ontology-platform/v1/curated-hobbies-v1.json"), "utf8"));
const existingGraph = await Promise.all([
  "src/lib/ontology/graph/nodes.ts", "src/lib/ontology/graph/edges.ts", "src/lib/engines/recommendation/graph-fallback.ts", "src/lib/ontology/bridge/recommendation-engine.ts"
].map((path) => readFile(resolve(ROOT, path), "utf8")));
const legacyIds = new Set(platform.concepts.flatMap((concept) => concept.legacyIds ?? []));
const errors = [];
for (const id of [...selectedCareerIds, ...selectedHobbyIds]) if (!legacyIds.has(id)) errors.push(`missing imported source lineage: ${id}`);
if (curatedHobbyDocument.schema !== "oiyo.ontology-curated-hobbies" || curatedHobbyDocument.hobbies.length !== 25) errors.push("curated hobby catalog contract mismatch");
for (const hobby of curatedHobbyDocument.hobbies) if (!platform.concepts.some((concept) => concept.id === `hobby.${hobby.id}`)) errors.push(`missing curated hobby: ${hobby.id}`);
const edges = JSON.parse(await readFile(resolve(ROOT, "config/ontology-platform/v1/edges.json"), "utf8")).edges;
const workContextTaxonomy = JSON.parse(await readFile(resolve(ROOT, "config/ontology-platform/v2/work-context-taxonomy-v2.json"), "utf8"));
const editorialContextIds = new Set(workContextTaxonomy.contexts.map(([id]) => `work_context.${id}`));
const workContexts = platform.concepts.filter((concept) => concept.kind === "work_context");
if (workContexts.length !== 80 || editorialContextIds.size !== 58) errors.push("work context taxonomy coverage mismatch");
for (const context of workContexts) {
  const examples = edges.filter((edge) => edge.from === context.id && edge.kind === "example_occupation");
  if (editorialContextIds.has(context.id) ? examples.length !== 0 : examples.length === 0) errors.push(`invalid occupation example boundary: ${context.id}`);
}
for (const concept of platform.concepts) for (const locale of platform.locales) if (!concept.labels?.[locale]?.trim()) errors.push(`missing direct locale label: ${concept.id}.${locale}`);
if (existingGraph.some((source) => source.includes("ontology-platform"))) errors.push("legacy consumer changed during compatibility-only migration");
if (errors.length) throw new Error(errors.join("; "));
console.log(`Ontology platform impact audit PASS: ${selectedHobbyIds.length + curatedHobbyDocument.hobbies.length} hobby + ${selectedCareerIds.length} occupation source lineages, 22 legacy occupation contexts preserved and 58 editorial contexts navigation-only, legacy consumers unchanged`);
