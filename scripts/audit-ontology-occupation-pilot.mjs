import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFile(resolve(ROOT, path), "utf8");
const [route, loader, component] = await Promise.all([
  read("src/pages/[locale]/ontology/template/deep.astro"),
  read("src/lib/ontology/platform/read-only-pilot.ts"),
  read("src/components/ontology/OntologyPlatformReadOnlyPilot.tsx"),
]);
const errors = [];
if (!route.includes("noindex") || !route.includes("OntologyPlatformReadOnlyPilot")) errors.push("pilot route must remain noindex and mount the pilot");
if (!loader.includes('edge.kind !== "example_occupation" || !edge.from.startsWith("work_context.") || !edge.to.startsWith("occupation.")')) errors.push("occupation traversal must be restricted to work_context example edges");
if (!loader.includes("slice(0, 2)")) errors.push("occupation examples need a bounded display");
if (!component.includes("sourceIds.join") || !component.includes("does not make a career-fit") || !component.includes("적합성·채용·소득")) errors.push("pilot must expose source IDs and non-deterministic occupation boundary");
for (const forbidden of ["localStorage", "sessionStorage", "analytics", "RecommendationCards"]) if (component.includes(forbidden)) errors.push(`forbidden pilot capability: ${forbidden}`);
if (errors.length) throw new Error(`Ontology occupation pilot audit failed: ${errors.join("; ")}`);
console.log("Ontology occupation pilot audit PASS: noindex route, context-only bounded examples, source IDs, six-locale non-deterministic boundary, no storage/recommender");
