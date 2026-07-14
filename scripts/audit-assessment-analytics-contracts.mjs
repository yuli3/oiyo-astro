import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { CAREER_VALUES_ANALYTICS_CONTRACT } from "../config/assessment-analytics-contracts.js";

const root = resolve(import.meta.dirname, "..");
const component = readFileSync(resolve(root, "src/components/tests/CareerValuesTest.tsx"), "utf8");
const instrument = readFileSync(resolve(root, "src/assessments/plugins/career-values/data.ts"), "utf8");
const errors = [];
const expectedEvents = Object.keys(CAREER_VALUES_ANALYTICS_CONTRACT.events);

const analyticsParamsMatch = component.match(/const ANALYTICS_PARAMS = \{\s*test_id:\s*"([^"]+)",\s*instrument_version:\s*CAREER_VALUES_INSTRUMENT\.version\s*\}/);
if (!analyticsParamsMatch) {
  errors.push("CareerValuesTest must define the stable ANALYTICS_PARAMS contract object");
} else if (analyticsParamsMatch[1] !== CAREER_VALUES_ANALYTICS_CONTRACT.assessmentId) {
  errors.push(`contract assessmentId ${CAREER_VALUES_ANALYTICS_CONTRACT.assessmentId} does not match runtime test_id ${analyticsParamsMatch[1]}`);
}

const instrumentVersionMatch = instrument.match(/version:\s*"([^"]+)"/);
if (!instrumentVersionMatch) {
  errors.push("career-values instrument version could not be read");
} else if (instrumentVersionMatch[1] !== CAREER_VALUES_ANALYTICS_CONTRACT.instrumentVersion) {
  errors.push(`contract instrumentVersion ${CAREER_VALUES_ANALYTICS_CONTRACT.instrumentVersion} does not match runtime ${instrumentVersionMatch[1]}`);
}

const runtimeCalls = [...component.matchAll(/gaEvent\("([^"]+)",\s*([^\)]+)\)/g)].map((match) => ({ event: match[1], payload: match[2].trim() }));
for (const event of expectedEvents) {
  const calls = runtimeCalls.filter((call) => call.event === event);
  if (calls.length !== 1) errors.push(`CareerValuesTest must contain exactly one ${event} call; found ${calls.length}`);
  if (calls.some((call) => call.payload !== "ANALYTICS_PARAMS")) errors.push(`${event} must use ANALYTICS_PARAMS without extra payload keys`);
}
for (const call of runtimeCalls) if (!expectedEvents.includes(call.event)) errors.push(`CareerValuesTest has an event outside the contract: ${call.event}`);
for (const forbidden of CAREER_VALUES_ANALYTICS_CONTRACT.forbiddenPayloadClasses) {
  const variants = [forbidden, forbidden.replaceAll("_", ""), forbidden.replaceAll("_", "-")];
  if (variants.some((variant) => new RegExp(`gaEvent\\([^)]*${variant}`, "i").test(component))) errors.push(`GA event appears to include forbidden payload class: ${forbidden}`);
}
for (const [event, keys] of Object.entries(CAREER_VALUES_ANALYTICS_CONTRACT.events)) {
  if (keys.some((key) => !["test_id", "instrument_version"].includes(key))) errors.push(`${event} has an unapproved payload key`);
  if (keys.length !== 2 || !keys.includes("test_id") || !keys.includes("instrument_version")) errors.push(`${event} must require exactly the two stable identifier keys`);
  if (!CAREER_VALUES_ANALYTICS_CONTRACT.semantics[event]) errors.push(`${event} is missing a metric semantics definition`);
}
const { status: deploymentStatus, instrumentedAt } = CAREER_VALUES_ANALYTICS_CONTRACT.deployment;
if (deploymentStatus === "not-deployed" && instrumentedAt !== null) errors.push("not-deployed contract must not start an observation clock");
if (deploymentStatus !== "not-deployed") {
  if (typeof instrumentedAt !== "string" || Number.isNaN(Date.parse(instrumentedAt))) errors.push("deployed contract must have a valid instrumentedAt timestamp");
  if (!deploymentStatus.includes("draft-noindex")) errors.push("Career Values must remain draft-noindex until human review is recorded");
}
if (CAREER_VALUES_ANALYTICS_CONTRACT.deployment.minimumFullObservationDays < 7) errors.push("observation window must be at least seven full days");
if (CAREER_VALUES_ANALYTICS_CONTRACT.indexableDuringWarmup) errors.push("draft assessment must remain non-indexable during analytics warmup");

if (errors.length) {
  console.error(`assessment analytics contract audit: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const observationState = deploymentStatus === "not-deployed"
  ? "observation clock not started"
  : `observation clock started ${instrumentedAt}`;
console.log(`assessment analytics contract audit: ${expectedEvents.length} events / stable identifiers only / ${observationState}`);
