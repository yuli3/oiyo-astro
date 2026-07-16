import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";

const configRoot = new URL("../config/", import.meta.url);
const srcRoot = new URL("../src/", import.meta.url);
const taxonomy = JSON.parse(await readFile(new URL("exploration-recommender-v1.taxonomy.json", configRoot), "utf8"));
const golden = JSON.parse(await readFile(new URL("exploration-recommender-v1.golden.json", configRoot), "utf8"));
const localizedCopy = JSON.parse(await readFile(new URL("exploration-recommender-v1.copy.json", configRoot), "utf8"));
const hobbySource = await readFile(new URL("manifest/ontology/shards/lifestyle/hobbies.ts", srcRoot), "utf8");
const careerSource = await readFile(new URL("lib/data-layer/shards/careers.ts", srcRoot), "utf8");
const riasecSource = await readFile(new URL("assessments/plugins/riasec/data.ts", srcRoot), "utf8");
const careerValueSource = await readFile(new URL("assessments/plugins/career-values/copy.ts", srcRoot), "utf8");
const scorerSource = await readFile(new URL("lib/exploration-recommender/index.ts", srcRoot), "utf8");
const prototypeSource = await readFile(new URL("components/ontology/ExplorationRecommenderPrototype.tsx", srcRoot), "utf8");
const deepRouteSource = await readFile(new URL("pages/[locale]/ontology/template/deep.astro", srcRoot), "utf8");
const astroConfigSource = await readFile(new URL("../astro.config.mjs", import.meta.url), "utf8");
const errors = [];
const locales = ["ko", "en", "ja", "zh", "fr", "es"];

function quotedValues(source, declaration) {
  const body = source.match(new RegExp(`export const ${declaration} = \\[([\\s\\S]*?)\\] as const`))?.[1] ?? "";
  return new Set([...body.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]));
}

const riasec = quotedValues(riasecSource, "RIASEC_DIMENSIONS");
const workValues = quotedValues(careerValueSource, "CAREER_VALUE_IDS");
const budgets = new Set(["free", "low", "medium", "high"]);
const spaces = new Set(["home-small", "shared-indoor", "outdoor", "specialized"]);
const socialModes = new Set(["solo", "together"]);
const risks = new Set(["low", "moderate", "high"]);
const accessibility = new Set(["seated", "low-impact", "screen-free", "quiet", "remote"]);
const sourceHobbyIds = new Set([...hobbySource.matchAll(/id:\s*"(HOBBY_[A-Z_]+)"/g)].map((match) => match[1]));
const sourceCareerIds = new Set([...careerSource.matchAll(/^\s{4}id:\s*"([a-z0-9-]+)"/gm)].map((match) => match[1]));
const sourceCareerRiasec = new Map();
const careerIdMatches = [...careerSource.matchAll(/^\s{4}id:\s*"([a-z0-9-]+)"/gm)];
for (let index = 0; index < careerIdMatches.length; index += 1) {
  const current = careerIdMatches[index];
  const block = careerSource.slice(current.index, careerIdMatches[index + 1]?.index ?? careerSource.length);
  const code = block.match(/riasecCode:\s*"([RIASEC]+)"/)?.[1];
  if (code) sourceCareerRiasec.set(current[1], code);
}
const expectedSourceContracts = [
  "src/manifest/ontology/shards/lifestyle/hobbies.ts",
  "src/lib/data-layer/shards/careers.ts",
  "src/assessments/plugins/riasec/data.ts",
  "src/assessments/plugins/career-values/copy.ts",
];
const assertionPatterns = [
  /\b(you are|you should become|best (?:career|profession)|perfect (?:job|career|profession)|right profession|must work as|ideal career|natural fit|guaranteed hire|will (?:be|get) hired|hiring is guaranteed)\b/i,
  /(당신은\s*.+(?:형|직업)|천직|완벽한\s*직업|가장\s*잘\s*맞는\s*직업|반드시\s*.+해야|채용될\s*것|취업이\s*보장)/,
  /(あなたは.+(?:型|職業)|天職|完璧な職業|最適な仕事|必ず.+べき|採用される|就職が保証)/,
  /(你是.+(?:型|职业)|天职|完美职业|最适合你的职业|必须从事|一定会被录用|保证录用)/,
  /\b(carrière idéale|métier parfait|profession parfaite|vous êtes fait(?:e)? pour|vous convient parfaitement|embauche garantie)\b/i,
  /\b(carrera ideal|trabajo perfecto|profesión perfecta|es perfecta para ti|debes trabajar como|contratación garantizada|conseguirás el empleo)\b/i,
];
const assertionSentinels = [
  "You are a natural fit for this ideal career.",
  "You will get hired for the right profession.",
  "당신은 모험가형이며 이것이 천직입니다.",
  "이 직업이 당신에게 가장 잘 맞는 직업이며 취업이 보장됩니다.",
  "あなたは冒険家型で、これは天職です。",
  "これはあなたに最適な仕事で採用されるでしょう。",
  "你是冒险家型，这是你的天职。",
  "这是最适合你的职业，一定会被录用。",
  "Vous êtes fait pour cette carrière idéale.",
  "Cette profession parfaite vous convient parfaitement.",
  "Esta es tu carrera ideal con contratación garantizada.",
  "Esta profesión es perfecta para ti y conseguirás el empleo.",
];
const safeSentinels = [
  "This reversible experiment does not determine an occupation or hiring outcome.",
  "이 실험은 직업이나 채용 결과를 단정하지 않습니다.",
  "この実験は職業や採用結果を断定しません。",
  "本实验不判断职业或招聘结果。",
  "Cette expérience ne détermine ni métier ni recrutement.",
  "Este experimento no determina una profesión ni una contratación.",
];

function allStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

function exactKeys(value, allowed) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === allowed.size && Object.keys(value).every((key) => allowed.has(key));
}

function weightedKeys(value, allowed) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0 && Object.entries(value).every(([key, weight]) => allowed.has(key) && Number.isInteger(weight) && weight >= 1 && weight <= 3);
}

if (taxonomy.schema !== "oiyo.exploration-taxonomy" || taxonomy.schemaVersion !== 1 || taxonomy.experimentMinutes !== 20) errors.push("taxonomy envelope/20-minute contract mismatch");
if (!Array.isArray(taxonomy.sourceContracts) || taxonomy.sourceContracts.length !== expectedSourceContracts.length || expectedSourceContracts.some((source) => !taxonomy.sourceContracts.includes(source))) errors.push("taxonomy source contracts incomplete or unknown");
if (riasec.size !== 6 || workValues.size !== 6 || sourceCareerIds.size < 10 || sourceHobbyIds.size < 10) errors.push("canonical source extraction failed");
if (assertionSentinels.some((text) => !assertionPatterns.some((pattern) => pattern.test(text)))) errors.push("localized occupation assertion detector lost coverage");
if (safeSentinels.some((text) => assertionPatterns.some((pattern) => pattern.test(text)))) errors.push("localized occupation assertion detector rejects safe guardrail copy");
for (const [label, source] of [["scorer", scorerSource], ["prototype", prototypeSource]]) {
  if (assertionPatterns.some((pattern) => pattern.test(source))) errors.push(`${label} contains occupation/hiring assertion`);
}
if (allStrings(localizedCopy).some((text) => assertionPatterns.some((pattern) => pattern.test(text)))) errors.push("localized copy contains occupation/hiring assertion");
if (!Array.isArray(taxonomy.candidates) || taxonomy.candidates.length < 12) errors.push("taxonomy requires at least 12 candidates");
const candidateIds = new Set();
for (const candidate of taxonomy.candidates ?? []) {
  if (!candidate.id || candidateIds.has(candidate.id)) errors.push(`duplicate/missing candidate id: ${candidate.id}`);
  candidateIds.add(candidate.id);
  if (!candidate.environmentToExplore || !candidate.experiment20Minutes) errors.push(`missing environment/experiment: ${candidate.id}`);
  if (allStrings(candidate).some((text) => assertionPatterns.some((pattern) => pattern.test(text)))) errors.push(`occupation/hiring assertion: ${candidate.id}`);
  if (!weightedKeys(candidate.riasec, riasec) || !weightedKeys(candidate.workValues, workValues)) errors.push(`invalid interest/work-value taxonomy: ${candidate.id}`);
  if (!Number.isInteger(candidate.usualSessionMinutes) || candidate.usualSessionMinutes < 20 || candidate.usualSessionMinutes > 240) errors.push(`invalid time: ${candidate.id}`);
  if (!budgets.has(candidate.budget)) errors.push(`invalid budget: ${candidate.id}`);
  if (!Array.isArray(candidate.spaces) || candidate.spaces.length === 0 || candidate.spaces.some((value) => !spaces.has(value))) errors.push(`invalid spaces: ${candidate.id}`);
  if (!Array.isArray(candidate.socialModes) || candidate.socialModes.length === 0 || candidate.socialModes.some((value) => !socialModes.has(value))) errors.push(`invalid social modes: ${candidate.id}`);
  if (!risks.has(candidate.risk) || !candidate.safetyNote) errors.push(`invalid safety contract: ${candidate.id}`);
  if (!Array.isArray(candidate.accessibility) || candidate.accessibility.length === 0 || candidate.accessibility.some((value) => !accessibility.has(value)) || !candidate.accessibilityNote) errors.push(`invalid accessibility contract: ${candidate.id}`);
  if (!candidate.costNote) errors.push(`missing cost note: ${candidate.id}`);
  if (!Array.isArray(candidate.sourceHobbyIds) || candidate.sourceHobbyIds.length === 0 || candidate.sourceHobbyIds.some((id) => !sourceHobbyIds.has(id))) errors.push(`unknown source hobby: ${candidate.id}`);
  if (!Array.isArray(candidate.sourceCareerIds) || candidate.sourceCareerIds.length === 0 || candidate.sourceCareerIds.some((id) => !sourceCareerIds.has(id))) errors.push(`unknown source career: ${candidate.id}`);
  const careerCodes = (candidate.sourceCareerIds ?? []).map((id) => sourceCareerRiasec.get(id)).filter(Boolean);
  if (careerCodes.length !== (candidate.sourceCareerIds ?? []).length || careerCodes.some((code) => [...code].some((dimension) => !riasec.has(dimension)))) errors.push(`invalid source career RIASEC dimensions: ${candidate.id}`);
  if (careerCodes.length > 0 && careerCodes.some((code) => !Object.keys(candidate.riasec ?? {}).some((dimension) => code.includes(dimension)))) errors.push(`career/taxonomy RIASEC lineage has no overlap: ${candidate.id}`);
}

if (localizedCopy.schema !== "oiyo.exploration-recommender-copy" || localizedCopy.schemaVersion !== 1 || Object.keys(localizedCopy.locales ?? {}).sort().join(",") !== [...locales].sort().join(",")) errors.push("localized copy envelope must contain exactly 6 locales");
for (const locale of locales) {
  const copy = localizedCopy.locales?.[locale]?.candidates;
  if (!copy || Object.keys(copy).length !== candidateIds.size || [...candidateIds].some((id) => !copy[id]?.environment || !copy[id]?.experiment)) errors.push(`localized candidate copy incomplete: ${locale}`);
  if (locale !== "en" && copy && [...candidateIds].some((id) => copy[id]?.environment === localizedCopy.locales.en.candidates[id]?.environment || copy[id]?.experiment === localizedCopy.locales.en.candidates[id]?.experiment)) errors.push(`localized candidate copy falls back to English: ${locale}`);
}

if (golden.schema !== "oiyo.exploration-recommender-golden" || golden.schemaVersion !== 1) errors.push("golden envelope mismatch");
if (!Array.isArray(golden.cases) || golden.cases.length < 50) errors.push("at least 50 golden cases required");
const fixtureIds = new Set();
for (const fixture of golden.cases ?? []) {
  const fixtureId = `${fixture.profile}/${fixture.context}`;
  if (fixtureIds.has(fixtureId)) errors.push(`duplicate golden case: ${fixtureId}`);
  fixtureIds.add(fixtureId);
  if (!golden.profiles?.[fixture.profile] || !golden.contexts?.[fixture.context]) errors.push(`unknown golden reference: ${fixtureId}`);
  if (!candidateIds.has(fixture.topId) || !Number.isInteger(fixture.topScore) || fixture.topScore < 0 || fixture.topScore > 100) errors.push(`invalid golden expectation: ${fixtureId}`);
  if (!Array.isArray(fixture.top3Ids) || fixture.top3Ids.length !== 3 || new Set(fixture.top3Ids).size !== 3 || fixture.top3Ids.some((id) => !candidateIds.has(id))) errors.push(`invalid golden top3: ${fixtureId}`);
  if (!Number.isInteger(fixture.excludedByGuardrail) || fixture.excludedByGuardrail < 0) errors.push(`invalid golden guardrail count: ${fixtureId}`);
  if (!Array.isArray(fixture.topSupportingFeatures) || fixture.topSupportingFeatures.length > 3 || fixture.topSupportingFeatures.some((feature) => !new Set(["interest", "workEnvironment", "time", "budget", "space", "social"]).has(feature))) errors.push(`invalid golden supporting reasons: ${fixtureId}`);
  if (!Array.isArray(fixture.topCounterFeatures) || fixture.topCounterFeatures.length !== 2 || fixture.topCounterFeatures.some((feature) => !new Set(["interest", "workEnvironment", "time", "budget", "space", "social"]).has(feature))) errors.push(`invalid golden counter reasons: ${fixtureId}`);
}
for (const [profileId, profile] of Object.entries(golden.profiles ?? {})) {
  if (!exactKeys(profile.interests, riasec) || !exactKeys(profile.workEnvironment, workValues)) errors.push(`invalid golden profile: ${profileId}`);
}
for (const [contextId, context] of Object.entries(golden.contexts ?? {})) {
  if (!budgets.has(context.budget) || !spaces.has(context.space) || !socialModes.has(context.socialMode) || !risks.has(context.maxRisk) || !Number.isInteger(context.timeMinutes)) errors.push(`invalid golden context: ${contextId}`);
}

for (const token of ["equal-independent-features", "EXPLORATION_FEATURE_WEIGHT = 1 / EXPLORATION_FEATURES.length", "locale: ExplorationLocale", "copySchema", "not occupation", "counterReasons", "safetyNote", "accessibilityNote", "costNote"]) {
  if (!scorerSource.includes(token)) errors.push(`scorer contract missing: ${token}`);
}

for (const token of [
  "import { ExplorationRecommenderPrototype }",
  "<Layout",
  "noindex>",
  "<ExplorationRecommenderPrototype locale={locale}",
  "client:visible",
]) {
  if (!deepRouteSource.includes(token)) errors.push(`deep route consumer contract missing: ${token}`);
}
if (!deepRouteSource.includes("LOCALES.map((locale)")) errors.push("deep route does not statically emit all canonical locales");
if (!astroConfigSource.includes("if (/\\/ontology\\/template\\//.test(path)) return false")) errors.push("deep template sitemap exclusion missing");
for (const token of ["const c = COPY[locale];", "}, 3, locale)", "c.budgets[index]", "reason.text"]) {
  if (!prototypeSource.includes(token)) errors.push(`localized consumer contract missing: ${token}`);
}

try {
  const sitemapFiles = (await readdir(new URL("../dist/", import.meta.url))).filter((name) => /^sitemap.*\.xml$/.test(name));
  const sitemapText = (await Promise.all(sitemapFiles.map((name) => readFile(new URL(`../dist/${name}`, import.meta.url), "utf8")))).join("\n");
  for (const locale of locales) {
    const route = `/${locale}/ontology/template/deep/`;
    const html = await readFile(new URL(`../dist${route}index.html`, import.meta.url), "utf8");
    if (!/<meta name="robots" content="noindex, follow"\s*\/?\s*>/i.test(html)) errors.push(`built deep route lacks noindex: ${locale}`);
    if (sitemapText.includes(route)) errors.push(`built deep route leaked into sitemap: ${locale}`);
    const candidateCopy = Object.values(localizedCopy.locales[locale].candidates);
    if (!candidateCopy.some((copy) => html.includes(copy.environment) && html.includes(copy.experiment))) errors.push(`built deep route lacks localized core recommendation: ${locale}`);
    if (locale !== "en" && Object.values(localizedCopy.locales.en.candidates).some((copy) => html.includes(copy.environment) || html.includes(copy.experiment))) errors.push(`built deep route contains English candidate fallback: ${locale}`);
  }
} catch (error) {
  errors.push(`built deep route audit unavailable: ${error.message}`);
}

if (errors.length) {
  console.error(`Exploration recommender audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const regression = spawnSync("npm", ["run", "test", "--", "--run", "src/lib/exploration-recommender/index.test.ts"], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
  stdio: "pipe",
});
if (regression.status !== 0) {
  console.error("Exploration recommender executable golden regression failed");
  console.error(regression.stdout);
  console.error(regression.stderr);
  process.exit(regression.status ?? 1);
}

console.log(`Exploration recommender audit PASS: ${candidateIds.size} environment experiments, ${golden.cases.length} executable golden fixtures, 6 canonical equal features`);
