import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const EXPANSION_ROOT = resolve(ROOT, "config/ontology-platform/v2");
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
const FACETS = ["create", "repair", "protect", "record", "explore", "physical", "social", "precision", "structure", "autonomy", "care", "novelty"];
const ACTION_VOCABULARY_II_IDS = { collaborate: "contribute", mediate: "arbitrate", advocate: "champion", persuade: "frame_argument", operate: "supervise_operations", write: "draft", perform: "rehearse", explain: "interpret_for_audience", teach: "instruct", train: "drill", mentor: "advise", measure: "quantify" };
const readJson = (name) => readFile(resolve(PLATFORM_ROOT, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(message); };

async function main() {
  const [catalog, expansion, expansionII, conceptsDocument, edgesDocument] = await Promise.all([
    readJson("curated-actions-v1.json"), readFile(resolve(EXPANSION_ROOT, "action-vocabulary-i-v1.json"), "utf8").then(JSON.parse), readFile(resolve(EXPANSION_ROOT, "action-vocabulary-ii-v1.json"), "utf8").then(JSON.parse), readJson("concepts.json"), readJson("edges.json")
  ]);
  if (catalog.schema !== "oiyo.ontology-curated-actions" || catalog.schemaVersion !== 1 || !Array.isArray(catalog.actions) || catalog.actions.length !== 40) fail("curated action catalog contract mismatch");
  if (JSON.stringify(catalog.facets) !== JSON.stringify(FACETS)) fail("curated action facet order mismatch");
  if (expansion.schema !== "oiyo.ontology-action-vocabulary" || expansion.schemaVersion !== 1 || expansion.sourceId !== "editorial:ontology-actions-v1" || !Array.isArray(expansion.actions) || expansion.actions.length !== 100 || JSON.stringify(expansion.facets) !== JSON.stringify(FACETS)) fail("expansion action vocabulary contract mismatch");
  if (expansionII.schema !== "oiyo.ontology-action-vocabulary" || expansionII.schemaVersion !== 1 || expansionII.sourceId !== "editorial:ontology-actions-v1" || !Array.isArray(expansionII.actions) || expansionII.actions.length !== 100 || JSON.stringify(expansionII.facets) !== JSON.stringify(FACETS)) fail("action vocabulary II contract mismatch");
  const profiles = catalog.profiles ?? {};
  const actionIds = new Set();
  for (const action of catalog.actions) {
    if (!/^[a-z][a-z_]{1,63}$/.test(action.id) || actionIds.has(action.id)) fail(`invalid or duplicate curated action id: ${action.id}`);
    actionIds.add(action.id);
    if (!LOCALES.every((locale) => typeof action.labels?.[locale] === "string" && action.labels[locale].trim())) fail(`missing localized label: ${action.id}`);
    const vector = profiles[action.profile];
    if (!Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) fail(`invalid profile for action: ${action.id}`);
  }
  const expansionProfiles = expansion.profiles ?? {};
  for (const action of expansion.actions) {
    if (!/^[a-z][a-z_]{1,63}$/.test(action.id) || actionIds.has(action.id)) fail(`invalid or duplicate expansion action id: ${action.id}`);
    actionIds.add(action.id);
    if (!LOCALES.every((locale) => typeof action.labels?.[locale] === "string" && action.labels[locale].trim())) fail(`missing expansion localized label: ${action.id}`);
    const vector = expansionProfiles[action.profile];
    if (!Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) fail(`invalid expansion profile for action: ${action.id}`);
  }
  const expansionIIProfiles = expansionII.profiles ?? {};
  for (const action of expansionII.actions) {
    const canonicalId = ACTION_VOCABULARY_II_IDS[action.id] ?? action.id;
    if (!/^[a-z][a-z_]{1,63}$/.test(action.id) || actionIds.has(canonicalId)) fail(`invalid or duplicate action vocabulary II id: ${action.id}`);
    actionIds.add(canonicalId);
    if (!LOCALES.every((locale) => typeof action.labels?.[locale] === "string" && action.labels[locale].trim())) fail(`missing action vocabulary II localized label: ${action.id}`);
    const vector = expansionIIProfiles[action.profile];
    if (!Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) fail(`invalid action vocabulary II profile: ${action.id}`);
  }
  const concepts = new Map(conceptsDocument.concepts.map((concept) => [concept.id, concept]));
  const canonicalActions = [...concepts.values()].filter((concept) => concept.kind === "action");
  if (canonicalActions.length !== 250) fail(`expected 250 canonical actions, found ${canonicalActions.length}`);
  for (const action of [...catalog.actions, ...expansion.actions, ...expansionII.actions]) {
    const canonical = concepts.get(`action.${expansionII.actions.includes(action) ? ACTION_VOCABULARY_II_IDS[action.id] ?? action.id : action.id}`);
    if (!canonical || canonical.kind !== "action") fail(`missing canonical action: ${action.id}`);
    for (const locale of LOCALES) if (canonical.labels?.[locale] !== action.labels[locale]) fail(`canonical label mismatch: ${action.id}.${locale}`);
    const sourceProfiles = expansion.actions.includes(action) ? expansionProfiles : expansionII.actions.includes(action) ? expansionIIProfiles : profiles;
    const expected = Object.fromEntries(FACETS.map((facet, index) => [facet, sourceProfiles[action.profile][index]]));
    if (JSON.stringify(canonical.facets) !== JSON.stringify(expected)) fail(`canonical facet mismatch: ${action.id}`);
  }
  const edges = edgesDocument.edges.filter((edge) => actionIds.has(edge.from?.replace("action.", "")) && edge.kind === "used_in");
  if (edges.length !== 480) fail(`expected 480 curated-action context edges, found ${edges.length}`);
  for (const edge of edges) {
    if (!edge.to?.startsWith("work_context.") || edge.provenance !== "derived" || edge.evidenceClass !== "catalog_derived" || edge.weight > 0.54 || edge.confidence > 0.65) fail(`invalid derived action context edge: ${edge.from} -> ${edge.to}`);
  }
  console.log(`Action catalog audit PASS: 40 curated + 200 expansion + 10 existing actions, ${canonicalActions.length} canonical actions, ${edges.length} derived context edges`);
}

main().catch((error) => {
  console.error(`Action catalog audit failed: ${error.message}`);
  process.exit(1);
});
