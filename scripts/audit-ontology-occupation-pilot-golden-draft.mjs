import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const [draft, staging] = await Promise.all([
  readFile(resolve(V2, "occupation-pilot-golden-fixture-draft-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(V2, "candidate-staging-v1.json"), "utf8").then(JSON.parse),
]);
const errors = [];
if (draft.status !== "draft_requires_human_review" || draft.fixtures?.length !== 12) errors.push("draft status or fixture count");
const candidateByEsco = new Map(staging.candidates.map((candidate) => [candidate.externalIds?.esco, candidate.id]));
if (new Set(draft.fixtures.map(({ id }) => id)).size !== 12) errors.push("fixture IDs must be unique");
for (const fixture of draft.fixtures ?? []) if (candidateByEsco.get(fixture.externalId) !== fixture.expectedCandidateId) errors.push(`staging mismatch: ${fixture.id}`);
if (!draft.boundary?.includes("No candidate is promoted") || !draft.reviewRequirement?.includes("before any canonical import")) errors.push("promotion boundary missing");
if (errors.length) throw new Error(`Occupation pilot golden-draft audit failed: ${errors.join("; ")}`);
console.log("Occupation pilot golden-draft audit PASS: 12 staged candidates are covered; human confirmation remains required before canonical import.");
