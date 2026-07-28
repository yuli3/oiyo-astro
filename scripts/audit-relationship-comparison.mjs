import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";

const root = new URL("../", import.meta.url);
const readJson = async (url) => JSON.parse(await readFile(url, "utf8"));
const errors = [];

const [schema, contract, fixture, a3Compatibility, engine, profileIndex] = await Promise.all([
  readJson(new URL("config/relationship-comparison-v1.schema.json", root)),
  readJson(new URL("config/relationship-comparison-v1.contract.json", root)),
  readJson(new URL("config/relationship-comparison-v1.fixture.json", root)),
  readJson(new URL("config/personal-profile-export-v2.compatibility.json", root)),
  readFile(new URL("src/assessments/profile/relationship-comparison.ts", root), "utf8"),
  readFile(new URL("src/assessments/profile/index.ts", root), "utf8"),
]);

if (schema.$defs?.resultCode?.properties?.schema?.const !== "oiyo.relationship-result-code") errors.push("result-code schema identity mismatch");
if (schema.$defs?.resultCode?.properties?.schemaVersion?.const !== 1) errors.push("result-code schema version mismatch");
if (schema.$defs?.resultCode?.properties?.signals?.maxItems !== 64) errors.push("result-code signal bound missing");
// resultCode.origin is a $ref to #/$defs/origin — check the resolved definition.
if (schema.$defs?.resultCode?.properties?.origin?.$ref !== "#/$defs/origin" || schema.$defs?.origin?.properties?.exportSchemaVersion?.const !== 2) errors.push("schema does not bind A3 export v2");
for (const definition of ["resultCode", "comparisonInput", "comparisonReport", "withdrawalReceipt"]) {
  if (!schema.$defs?.[definition]) errors.push(`missing executable schema definition: ${definition}`);
}
if (schema.$defs?.integrity?.properties?.artifact?.const !== "unsigned-self-asserted-local" || schema.$defs?.integrity?.properties?.authenticity?.const !== "not-provided") errors.push("unsigned/no-authenticity schema contract missing");
if (schema.$defs?.signal?.properties?.constructId?.enum?.includes("psychology.big5.politicalPreference")) errors.push("restricted construct leaked into exact schema allowlist");
for (const field of ["answers", "responses", "raw", "legacy", "classifications", "age", "dateOfBirth"]) {
  if (schema.$defs?.resultCode?.properties?.[field]) errors.push(`forbidden result-code field declared: ${field}`);
}

if (contract.schema !== "oiyo.relationship-comparison-contract" || contract.schemaVersion !== 1) errors.push("contract envelope mismatch");
if (!["non-public-foundation", "noindex-pilot"].includes(contract.stage)) errors.push("unknown A5 contract stage");
if (contract.stage === "non-public-foundation" && contract.publicRoutes?.length !== 0) errors.push("A5 foundation must expose no public route");
if (contract.stage === "noindex-pilot") {
  if (!contract.publicRoutes?.length || contract.indexable !== false) errors.push("A5 noindex pilot must declare at least one non-indexable route");
  for (const routePath of contract.publicRoutes ?? []) {
    const routeSource = await readFile(new URL(routePath, root), "utf8").catch(() => "");
    if (!routeSource.includes("noindex={true}")) errors.push(`A5 pilot route is not marked noindex: ${routePath}`);
    if (!routeSource.includes("RelationshipComparisonPanel")) errors.push(`A5 pilot route does not render the engine's consent-gated panel: ${routePath}`);
  }
}
if (contract.a3Compatibility?.acceptedSchema !== a3Compatibility.canonicalExportSchema || contract.a3Compatibility?.acceptedVersion !== a3Compatibility.canonicalExportVersion) errors.push("A3 compatibility drift");
if (contract.a3Compatibility?.parser !== "parsePersonalProfileExportJson") errors.push("A3 canonical parser is not named");
for (const field of ["rawResponsesIncluded", "userAuthoredIncluded", "sourceResultIdIncluded"]) {
  if (contract.a3Compatibility?.[field] !== false) errors.push(`A3 minimization must set ${field}=false`);
}
if (contract.runtime?.browserOnly !== true || contract.runtime?.stateless !== true || contract.runtime?.networkCalls !== 0 || contract.runtime?.analyticsEvents !== 0 || contract.runtime?.serverPersistence !== false || contract.runtime?.browserPersistenceByEngine !== false) errors.push("browser-only/stateless/zero-payload runtime contract mismatch");
if (contract.comparison?.signalValuePolicy !== "finite normalized numeric canonical signals from the exact allowlist only; no free text is compared") errors.push("minimal exact-allowlist numeric signal policy mismatch");
if (contract.comparison?.independencePolicy !== "codeId and canonical profile payload fingerprint must both differ") errors.push("duplicate payload independence policy missing");
if (contract.integrity?.artifact !== "unsigned-self-asserted-local" || contract.integrity?.authenticity !== "not-provided" || contract.integrity?.purpose !== "integrity-and-error-detection-only" || !contract.integrity?.claim?.includes("not a signature")) errors.push("honest unsigned integrity contract missing");

const expectedContexts = ["couple", "family", "friend"];
if (JSON.stringify(contract.eligibility?.allowedContexts) !== JSON.stringify(expectedContexts)) errors.push("allowed relationship contexts drift");
for (const blocked of ["minor", "political-signal", "health-signal", "workplace-evaluation", "employment", "hiring"]) {
  if (!contract.eligibility?.blocked?.includes(blocked)) errors.push(`missing blocked context/signal: ${blocked}`);
}
for (const forbidden of ["aggregate-score", "compatibility-judgment", "success-rate", "ranking", "career-judgment", "job-judgment", "employment-judgment", "hiring-judgment"]) {
  if (!contract.comparison?.forbiddenOutputs?.includes(forbidden)) errors.push(`missing forbidden comparison output: ${forbidden}`);
}
if (contract.lifecycle?.defaultExpiryDays !== 7 || contract.lifecycle?.maximumExpiryDays !== 30) errors.push("expiry policy mismatch");
for (const key of ["expiry", "withdraw", "delete", "exportedCopyLimit"]) {
  if (typeof contract.lifecycle?.[key] !== "string" || !contract.lifecycle[key]) errors.push(`missing lifecycle policy: ${key}`);
}
if (!contract.lifecycle?.clock?.includes("no trusted server clock")) errors.push("device-clock limitation is not disclosed");
if (!contract.lifecycle?.withdraw?.includes("active revocation set") || !contract.lifecycle?.delete?.includes("caller-action-required")) errors.push("stateless withdrawal/delete semantics are overstated");
if (contract.validation?.library !== "ajv" || JSON.stringify(contract.validation?.artifacts) !== JSON.stringify(["resultCode", "comparisonInput", "comparisonReport", "withdrawalReceipt"])) errors.push("Ajv artifact coverage contract mismatch");

if (fixture.schema !== "oiyo.relationship-comparison-fixture" || fixture.schemaVersion !== 1) errors.push("fixture envelope mismatch");
if (fixture.a3Fixture !== "config/personal-profile-export-v2.fixture.json") errors.push("fixture is not bound to A3 export fixture");
if (fixture.expected?.sharedConstructs?.length < 1 || fixture.expected?.differentConstructs?.length < 1) errors.push("fixture must exercise both common and different items");
if (fixture.expected?.aggregateScorePresent !== false || fixture.expected?.networkCalls !== 0 || fixture.expected?.analyticsEvents !== 0) errors.push("fixture privacy/non-aggregation expectation mismatch");
if (fixture.expected?.artifactAuthenticity !== "not-provided" || JSON.stringify(fixture.expected?.schemaValidatedArtifacts) !== JSON.stringify(contract.validation?.artifacts)) errors.push("fixture integrity/schema coverage mismatch");

if (!profileIndex.includes('export * from "./relationship-comparison"')) errors.push("relationship engine is not exported from the profile barrel");
for (const required of [
  "parsePersonalProfileExportJson", "buildRelationshipResultCode", "compareRelationshipResultCodes",
  "withdrawRelationshipComparison", "adultConfirmed", "ownerSelfExported", "scoreAggregation",
  "employmentOrHiringUse", "careerOrJobJudgment", "healthOrPoliticalInference", "rawResponsesIncluded", "serverTransmission",
  "unsigned-self-asserted-local", "integrity-and-error-detection-only", "payloadFingerprint", "revokedCodeIds",
]) {
  if (!engine.includes(required)) errors.push(`engine is missing contract marker: ${required}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addFormat("date-time", (value) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
});
try {
  ajv.addSchema(schema);
  for (const definition of ["resultCode", "comparisonInput", "comparisonReport", "withdrawalReceipt"]) {
    ajv.compile({ $ref: `${schema.$id}#/$defs/${definition}` });
  }
} catch (error) {
  errors.push(`relationship JSON Schema failed Ajv compilation: ${error instanceof Error ? error.message : String(error)}`);
}
for (const forbiddenCall of [
  /\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bsendBeacon\b/, /\bgtag\s*\(/,
  /\blocalStorage\b/, /\bsessionStorage\b/, /\bindexedDB\b/,
]) {
  if (forbiddenCall.test(engine)) errors.push(`engine contains forbidden network/analytics/persistence call: ${forbiddenCall}`);
}

if (errors.length === 0) {
  const test = spawnSync("npm", ["run", "test", "--", "--run", "src/assessments/profile/relationship-comparison.test.ts"], {
    cwd: new URL(".", root),
    encoding: "utf8",
  });
  if (test.status !== 0) {
    errors.push(`targeted relationship tests failed\n${test.stdout}\n${test.stderr}`);
  }
}

if (errors.length > 0) {
  console.error(`Relationship comparison audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Relationship comparison audit PASS: unsigned A3 v2 local artifacts, payload integrity/fingerprint, bilateral self-export consent, active revocation set, exact construct allowlist, Ajv 4-artifact mutations, 0 network/analytics/storage calls");
