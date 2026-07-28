import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
const FIELDS = ["definition", "realWorldContext", "misconception", "uncertainty"];
const readJson = (name) => readFile(resolve(PLATFORM_ROOT, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(`Concept explanation audit failed: ${message}`); };
const koreanTopicParticle = (label) => {
  const last = [...label.trim()].at(-1);
  if (!last) return "은";
  const codePoint = last.codePointAt(0);
  if (codePoint >= 0xac00 && codePoint <= 0xd7a3) return (codePoint - 0xac00) % 28 === 0 ? "는" : "은";
  return "는";
};
const renderTemplate = (template, label, locale) => locale === "ko"
  ? template.replaceAll("{label}은", `${label}${koreanTopicParticle(label)}`).replaceAll("{label}", label)
  : template.replaceAll("{label}", label);

const [templates, conceptsDocument] = await Promise.all([readJson("concept-explanation-templates-v1.json"), readJson("concepts.json")]);
if (templates.schema !== "oiyo.ontology-concept-explanation-templates" || templates.schemaVersion !== 1 || templates.source?.id !== "editorial:ontology-concept-explanations-v1" || !/^\d{4}-\d{2}-\d{2}$/.test(templates.source?.reviewedAt ?? "") || JSON.stringify(templates.fields) !== JSON.stringify(FIELDS)) fail("template envelope mismatch");
const errors = [];
const byKind = new Map();
for (const concept of conceptsDocument.concepts) {
  const explanation = concept.explanation;
  if (!explanation || JSON.stringify(explanation.sourceIds) !== JSON.stringify([templates.source.id]) || explanation.reviewedAt !== templates.source.reviewedAt) { errors.push(`invalid provenance: ${concept.id}`); continue; }
  const template = templates.templates?.[concept.kind];
  if (!template) { errors.push(`missing kind template: ${concept.id}`); continue; }
  for (const field of FIELDS) for (const locale of LOCALES) {
    const value = explanation.fields?.[field]?.[locale];
    const expected = renderTemplate(template[field]?.[locale] ?? "", concept.labels[locale], locale);
    if (typeof value !== "string" || !value.trim() || value.includes("{label}") || value !== expected) errors.push(`direct locale explanation mismatch: ${concept.id}.${field}.${locale}`);
    if (locale === "ko" && /(?:하다|되다|이다)은/.test(value ?? "")) errors.push(`invalid Korean topic particle: ${concept.id}.${field}.${locale}`);
  }
  byKind.set(concept.kind, (byKind.get(concept.kind) ?? 0) + 1);
}
if (byKind.size !== 4 || [...byKind.values()].some((value) => value === 0)) errors.push("concept kind explanation coverage mismatch");
if (errors.length) fail(errors.join("; "));
console.log(`Concept explanation audit PASS: ${conceptsDocument.concepts.length} concepts, ${FIELDS.length} fields, ${LOCALES.length} direct locales, ${byKind.size} kinds`);
