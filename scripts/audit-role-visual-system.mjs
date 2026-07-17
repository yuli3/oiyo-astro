import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";

const root = new URL("../", import.meta.url);
const config = new URL("config/", root);
const src = new URL("src/", root);
const schema = JSON.parse(await readFile(new URL("role-visual-system-v1.schema.json", config), "utf8"));
const fixtures = JSON.parse(await readFile(new URL("role-visual-system-v1.fixtures.json", config), "utf8"));
const copy = JSON.parse(await readFile(new URL("role-visual-system-v1.copy.json", config), "utf8"));
const logic = await readFile(new URL("lib/role-visual-system/index.ts", src), "utf8");
const component = await readFile(new URL("components/ontology/RoleVisualSystemPrototype.tsx", src), "utf8");
const route = await readFile(new URL("pages/[locale]/ontology/template/deep.astro", src), "utf8");
const astroConfig = await readFile(new URL("astro.config.mjs", root), "utf8");
const errors = [];
const locales = ["ko", "en", "ja", "zh", "fr", "es"];
const statuses = ["clear", "mixed", "tie", "low-flat", "uncertain"];

function keyShape(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, keyShape(value[key])]));
}

function sameShape(a, b) {
  return JSON.stringify(keyShape(a)) === JSON.stringify(keyShape(b));
}

function stringLeaves(value, path = [], leaves = new Map()) {
  if (typeof value === "string") {
    leaves.set(path.join("."), value);
    return leaves;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) stringLeaves(child, [...path, key], leaves);
  }
  return leaves;
}

function linear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const rgb = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16));
  return 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
}

function contrast(a, b) {
  const [bright, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (bright + 0.05) / (dark + 0.05);
}

if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema" || schema.properties?.schemaVersion?.const !== "oiyo.role-visual.v1") errors.push("JSON Schema envelope mismatch");
try {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  const validateFixture = ajv.compile(schema);
  if (!validateFixture(fixtures)) errors.push(`fixture fails JSON Schema: ${ajv.errorsText(validateFixture.errors)}`);

  const invalidMutations = [
    ["unknown root property", (value) => { value.unexpected = true; }],
    ["missing required field", (value) => { delete value.interactionStates; }],
    ["wrong score type", (value) => { value.scenarios[0].input.dimensions[0].score = "84"; }],
    ["unknown dimension", (value) => { value.scenarios[0].input.dimensions[0].id = "unknown"; }],
    ["duplicate dimension", (value) => { value.scenarios[0].input.dimensions[1].id = value.scenarios[0].input.dimensions[0].id; }],
    ["duplicate scenario", (value) => { value.scenarios[1].id = value.scenarios[0].id; }],
    ["invalid role aid", (value) => { value.scenarios[0].expected.roleAid = "adventurer"; }],
    ["duplicate interaction state", (value) => { value.interactionStates[2] = value.interactionStates[1]; }],
  ];
  for (const [label, mutate] of invalidMutations) {
    const mutant = structuredClone(fixtures);
    mutate(mutant);
    if (validateFixture(mutant)) errors.push(`JSON Schema mutation survived: ${label}`);
  }
} catch (error) {
  errors.push(`JSON Schema failed to compile: ${error.message}`);
}
if (fixtures.schemaVersion !== "oiyo.role-visual.v1") errors.push("fixture schema version mismatch");
if (!Array.isArray(fixtures.scenarios) || fixtures.scenarios.length !== 5) errors.push("exactly five result-state scenarios required");
if (new Set(fixtures.scenarios?.map(({ id }) => id)).size !== 5 || statuses.some((id) => !fixtures.scenarios?.some((fixture) => fixture.id === id))) errors.push("clear/mixed/tie/low-flat/uncertain fixture coverage incomplete");
if (JSON.stringify(fixtures.interactionStates) !== JSON.stringify(["idle", "saved", "shared"])) errors.push("saved/share interaction fixture states incomplete");
for (const fixture of fixtures.scenarios ?? []) {
  if (fixture.input?.dimensions?.length !== 3) errors.push(`scenario requires three continuous dimensions: ${fixture.id}`);
  if (fixture.input?.dimensions?.some(({ score, confidence }) => !Number.isFinite(score) || score < 0 || score > 100 || !Number.isFinite(confidence) || confidence < 0 || confidence > 1)) errors.push(`invalid continuous score/confidence: ${fixture.id}`);
  if (!statuses.includes(fixture.expected?.status)) errors.push(`invalid expected status: ${fixture.id}`);
  if (fixture.id !== "clear" && fixture.expected?.roleAid !== null) errors.push(`role aid must not obscure ${fixture.id}`);
}

if (Object.keys(copy).sort().join(",") !== [...locales].sort().join(",")) errors.push("copy must contain exactly six canonical locales");
for (const locale of locales) {
  if (!copy[locale] || !sameShape(copy.en, copy[locale])) errors.push(`copy shape incomplete: ${locale}`);
  if (statuses.some((status) => !copy[locale]?.statuses?.[status]?.label || !copy[locale]?.statuses?.[status]?.body)) errors.push(`status copy incomplete: ${locale}`);
  if (locale !== "en") {
    const englishLeaves = stringLeaves(copy.en);
    const localeLeaves = stringLeaves(copy[locale]);
    for (const [path, english] of englishLeaves) {
      const localized = localeLeaves.get(path);
      if (typeof localized !== "string" || localized.trim() === "") errors.push(`missing localized copy leaf: ${locale}.${path}`);
      if (localized === english) errors.push(`English fallback in ${locale}.${path}`);
    }
  }
}

for (const [foreground, background, minimum, label] of [
  ["#1d4ed8", "#ffffff", 4.5, "primary on white"],
  ["#1d4ed8", "#dbeafe", 4.5, "primary on soft"],
  ["#0f172a", "#ffffff", 4.5, "neutral text"],
  ["#475569", "#ffffff", 4.5, "neutral muted"],
]) {
  if (contrast(foreground, background) < minimum) errors.push(`WCAG contrast below ${minimum}: ${label}`);
}

for (const token of [
  'status = "uncertain"', 'status = "low-flat"', 'status = "tie"', 'status = "mixed"',
  'status === "clear" ?', 'explanationPriority: ["scores", "status", "uncertainty", "role-aid"]',
]) if (!logic.includes(token)) errors.push(`logic priority contract missing: ${token}`);

for (const token of [
  "Compass", "aria-hidden=\"true\"", "role=\"progressbar\"", "aria-valuenow", "aria-valuetext",
  "aria-live=\"polite\"", "min-h-11", "focus-visible:outline", "prefers-reduced-motion: reduce",
  "strengthTitle", "cautionTitle", "actionTitle", "aria-pressed", "ROLE_VISUAL_TOKENS",
]) if (!component.includes(token)) errors.push(`accessible visual consumer contract missing: ${token}`);
for (const forbidden of ["localStorage", "sessionStorage", "navigator.share", "fetch(", "XMLHttpRequest"]) {
  if (component.includes(forbidden)) errors.push(`no-storage/no-network specimen violated: ${forbidden}`);
}
if (/(#[0-9a-f]{3,8})/i.test(component)) errors.push("component contains ad-hoc color outside the one-primary-plus-neutral token contract");

for (const token of ["import { RoleVisualSystemPrototype }", "<RoleVisualSystemPrototype locale={locale}", "noindex>", "LOCALES.map((locale)"]) {
  if (!route.includes(token)) errors.push(`noindex specimen route contract missing: ${token}`);
}
if (!astroConfig.includes("if (/\\/ontology\\/template\\//.test(path)) return false")) errors.push("deep specimen sitemap exclusion missing");

try {
  const sitemapFiles = (await readdir(new URL("dist/", root))).filter((name) => /^sitemap.*\.xml$/.test(name));
  const sitemap = (await Promise.all(sitemapFiles.map((name) => readFile(new URL(`dist/${name}`, root), "utf8")))).join("\n");
  for (const locale of locales) {
    const pathname = `/${locale}/ontology/template/deep/`;
    const html = await readFile(new URL(`dist${pathname}index.html`, root), "utf8");
    if (!/<meta name="robots" content="noindex, follow"\s*\/?\s*>/i.test(html)) errors.push(`built specimen lacks noindex: ${locale}`);
    if (sitemap.includes(pathname)) errors.push(`built specimen leaked into sitemap: ${locale}`);
    if (!html.includes(copy[locale].title) || !html.includes(copy[locale].statuses.clear.label)) errors.push(`built specimen lacks direct localized copy: ${locale}`);
    if (locale !== "en" && (html.includes(copy.en.title) || html.includes(copy.en.statuses.clear.body))) errors.push(`built specimen contains English role-visual fallback: ${locale}`);
  }
} catch (error) {
  errors.push(`built role visual specimen unavailable: ${error.message}`);
}

if (errors.length) {
  console.error(`Role visual system audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const regression = spawnSync("npm", ["run", "test", "--", "--run", "src/lib/role-visual-system/index.test.ts", "src/components/ontology/RoleVisualSystemPrototype.test.tsx"], {
  cwd: root,
  encoding: "utf8",
  stdio: "pipe",
});
if (regression.status !== 0) {
  console.error("Role visual executable fixture regression failed");
  console.error(regression.stdout);
  console.error(regression.stderr);
  process.exit(regression.status ?? 1);
}

console.log(`Role visual system audit PASS: executable JSON Schema mutations, ${fixtures.scenarios.length} result states, 3 reducer interaction states plus static SSR, 6 recursive direct locales, WCAG contrast contracts`);
