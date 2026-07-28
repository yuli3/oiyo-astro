import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const V2 = resolve(ROOT, "config/ontology-platform/v2");
const readJson = (name) => readFile(resolve(V2, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(`Ontology expansion v2 foundation audit failed: ${message}`); };
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
const KINDS = ["action", "hobby", "work_context", "occupation"];

const [contract, registry, staging, signals] = await Promise.all([
  readJson("expansion-contract-v1.json"), readJson("source-registry-v1.json"), readJson("candidate-staging-v1.json"), readJson("life-signals-contract-v1.json")
]);
if (contract.schema !== "oiyo.ontology-expansion-contract" || contract.schemaVersion !== 1 || contract.status !== "foundation") fail("expansion contract envelope");
if (JSON.stringify(contract.canonicalKinds) !== JSON.stringify(KINDS) || JSON.stringify(contract.locales) !== JSON.stringify(LOCALES)) fail("canonical kinds or locale contract");
if (contract.targets?.action !== 250 || contract.targets?.hobby !== 600 || contract.targets?.work_context !== 80 || contract.targets?.occupation !== 1200 || contract.targets?.sparseEdgesMin !== 8000 || contract.targets?.sparseEdgesMax !== 15000) fail("target contract");
if (!Array.isArray(contract.batchPlan) || contract.batchPlan.length !== 10 || contract.batchPlan.map(({ batch }) => batch).join(",") !== "1,2,3,4,5,6,7,8,9,10") fail("batch sequence");
for (const requirement of ["source_approved", "license_allowed", "canonical_id_and_alias_deduped", "six_locale_direct_copy", "facet_complete", "provenance_complete", "golden_or_quality_fixture", "archive_after_canonical_change"]) if (!contract.promotionRequirements?.includes(requirement)) fail(`promotion requirement: ${requirement}`);
for (const gate of ["occupation-secondary-10B-editorial-review", "high-specificity-15B-source-review", "public-activation-human-gate"]) if (!contract.existingGates?.includes(gate)) fail(`existing gate: ${gate}`);

if (registry.schema !== "oiyo.ontology-source-registry" || registry.schemaVersion !== 1 || !Array.isArray(registry.sources)) fail("source registry envelope");
const sourceIds = new Set();
for (const source of registry.sources) {
  if (!/^[-a-z0-9:]+$/.test(source.id ?? "") || sourceIds.has(source.id) || !Array.isArray(source.kindScopes) || source.kindScopes.some((kind) => !KINDS.includes(kind) && kind !== "skill") || !["approved", "pending_license_and_mapping_review"].includes(source.status) || !Array.isArray(source.allowedClaims) || typeof source.licenseStatus !== "string" || typeof source.refresh !== "string") fail(`invalid registry source: ${source.id}`);
  sourceIds.add(source.id);
  if (source.status !== "approved" && source.allowedClaims.length) fail(`unapproved source has allowed claim: ${source.id}`);
}
if (!["catalog:legacy-hobbies-v1", "catalog:legacy-careers-v1", "editorial:ontology-actions-v1", "editorial:ontology-hobbies-v1", "editorial:ontology-work-contexts-v2"].every((id) => sourceIds.has(id))) fail("approved baseline source coverage");

if (staging.schema !== "oiyo.ontology-candidate-staging" || staging.schemaVersion !== 1 || !Array.isArray(staging.candidates) || !Array.isArray(staging.allowedStatuses)) fail("candidate staging envelope");
for (const candidate of staging.candidates) {
  if (!staging.allowedStatuses.includes(candidate.status) || !KINDS.includes(candidate.kind) || !Array.isArray(candidate.sourceIds) || candidate.sourceIds.some((id) => !sourceIds.has(id))) fail(`invalid staged candidate: ${candidate.id}`);
  if (candidate.status === "promoted") fail(`promoted candidate must leave staging: ${candidate.id}`);
}

const REQUIRED_SIGNAL_VALUES = {
  goal: ["explore", "learn", "create", "connect", "recover", "contribute", "transition", "earn_supplemental_income"], time: ["under_20_minutes", "weekly_1_to_2_hours", "weekly_3_to_5_hours", "weekly_6_plus_hours"], budget: ["none", "low", "medium", "high"], energy: ["very_low", "low", "moderate", "high", "variable"], access_space: ["small_home", "shared_indoor", "outdoor", "specialized_space", "digital_only", "limited_access"], social_preference: ["solo", "pair", "small_group", "large_group", "flexible"], mobility: ["home_based", "nearby", "local_transit_ok", "travel_ok", "variable"], continuity: ["one_off", "short_trial", "seasonal", "ongoing", "flexible"], transition_stage: ["stable_routine", "starting_something_new", "changing_role_or_schedule", "returning_after_pause", "caregiving_or_shared_responsibility", "uncertain_or_in_between"]
};
if (signals.schema !== "oiyo.ontology-life-signals-contract" || signals.schemaVersion !== 1 || signals.status !== "design_only" || signals.profileModel !== "optional_ephemeral_exploration_inputs" || signals.storage !== "no_user_storage_or_transmission_in_foundation") fail("life signal envelope or storage boundary");
if (!Array.isArray(signals.signalFamilies) || signals.signalFamilies.length !== Object.keys(REQUIRED_SIGNAL_VALUES).length) fail("life signal family count");
const observedFamilies = new Set();
for (const family of signals.signalFamilies) {
  if (!Object.hasOwn(REQUIRED_SIGNAL_VALUES, family?.id) || observedFamilies.has(family.id) || typeof family.meaning !== "string" || !family.meaning.trim() || JSON.stringify(family.values) !== JSON.stringify(REQUIRED_SIGNAL_VALUES[family.id])) fail(`invalid life signal family: ${family?.id}`);
  observedFamilies.add(family.id);
}
for (const [key, value] of Object.entries({ cardinality: "zero_or_one_per_family", valueSource: "self_selected_only", temporalScope: "current_exploration_context_only" })) if (signals.selectionRules?.[key] !== value) fail(`life signal selection rule: ${key}`);
for (const key of ["omission", "conflictHandling"]) if (typeof signals.selectionRules?.[key] !== "string" || !signals.selectionRules[key].trim()) fail(`life signal selection text: ${key}`);
const requiredAllowed = ["filter_exploration_options", "describe_practical_tradeoffs", "suggest_reversible_small_experiments", "ask_for_optional_clarification"];
const requiredProhibited = ["infer_missing_signals", "rank_people", "create_personality_labels", "diagnose_health_or_mental_state", "issue_career_fit_or_employability_verdicts", "make_hiring_or_admissions_recommendations", "predict_income_or_outcomes", "determine_eligibility_or_access", "treat_any_combination_as_evidence_about_identity"];
if (!requiredAllowed.every((item) => signals.combinationBoundary?.allowedUse?.includes(item)) || !requiredProhibited.every((item) => signals.combinationBoundary?.prohibitedUse?.includes(item))) fail("life signal combination boundary");
for (const key of ["outputRequirement", "combinationLimit"]) if (typeof signals.combinationBoundary?.[key] !== "string" || !signals.combinationBoundary[key].trim()) fail(`life signal combination text: ${key}`);
for (const item of ["diagnosis", "personality_label", "career_fit_verdict", "hiring_recommendation", "admissions_recommendation", "income_prediction", "health_clearance", "financial_capacity_assessment", "disability_assessment", "readiness_verdict"]) if (!signals.notSignals?.includes(item)) fail(`life signal safety exclusion: ${item}`);
for (const locale of LOCALES) for (const key of ["uncertainty", "nonDiagnostic"]) if (typeof signals.safetyCopy?.[locale]?.[key] !== "string" || !signals.safetyCopy[locale][key].trim()) fail(`life signal ${locale} safety copy: ${key}`);
console.log(`Ontology expansion v2 foundation audit PASS: ${registry.sources.length} sources, ${staging.candidates.length} staged candidates, ${contract.batchPlan.length} batches, ${observedFamilies.size} fail-closed life-signal families`);
