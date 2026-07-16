import taxonomyJson from "../../../config/exploration-recommender-v1.taxonomy.json";
import copyJson from "../../../config/exploration-recommender-v1.copy.json";
import { CAREER_VALUE_IDS, type CareerValueId } from "../../assessments/plugins/career-values/copy";
import { RIASEC_DIMENSIONS, type RiasecDimension } from "../../assessments/plugins/riasec/data";

export const EXPLORATION_RECOMMENDER_SCHEMA = "oiyo.exploration-recommendation" as const;
export const EXPLORATION_RECOMMENDER_SCHEMA_VERSION = 1 as const;
export const EXPLORATION_LOCALES = Object.freeze(["ko", "en", "ja", "zh", "fr", "es"] as const);
export const EXPLORATION_FEATURES = Object.freeze(["interest", "workEnvironment", "time", "budget", "space", "social"] as const);
export const EXPLORATION_FEATURE_WEIGHT = 1 / EXPLORATION_FEATURES.length;
export const EXPLORATION_SOURCE_CONTRACTS = Object.freeze([
  "src/manifest/ontology/shards/lifestyle/hobbies.ts",
  "src/lib/data-layer/shards/careers.ts",
  "src/assessments/plugins/riasec/data.ts",
  "src/assessments/plugins/career-values/copy.ts",
] as const);

export type ExplorationLocale = (typeof EXPLORATION_LOCALES)[number];
export type ExplorationFeature = (typeof EXPLORATION_FEATURES)[number];
export type ExplorationBudget = "free" | "low" | "medium" | "high";
export type ExplorationSpace = "home-small" | "shared-indoor" | "outdoor" | "specialized";
export type ExplorationSocialMode = "solo" | "together";
export type ExplorationRisk = "low" | "moderate" | "high";
export type ExplorationAccessibilityNeed = "seated" | "low-impact" | "screen-free" | "quiet" | "remote";

export interface ExplorationInput {
  accessibilityNeeds: ExplorationAccessibilityNeed[];
  budget: ExplorationBudget;
  interests: Record<RiasecDimension, number>;
  maxRisk: ExplorationRisk;
  socialMode: ExplorationSocialMode;
  space: ExplorationSpace;
  timeMinutes: number;
  workEnvironment: Record<CareerValueId, number>;
}

export interface ExplorationCandidate {
  accessibility: ExplorationAccessibilityNeed[];
  accessibilityNote: string;
  budget: ExplorationBudget;
  costNote: string;
  environmentToExplore: string;
  experiment20Minutes: string;
  id: string;
  riasec: Partial<Record<RiasecDimension, number>>;
  risk: ExplorationRisk;
  safetyNote: string;
  socialModes: ExplorationSocialMode[];
  sourceCareerIds: string[];
  sourceHobbyIds: string[];
  spaces: ExplorationSpace[];
  usualSessionMinutes: number;
  workValues: Partial<Record<CareerValueId, number>>;
}

export interface ExplorationReason {
  direction: "counter" | "support";
  feature: ExplorationFeature;
  score: number;
  text: string;
}

export interface ExplorationRecommendation {
  accessibilityNote: string;
  costNote: string;
  counterReasons: ExplorationReason[];
  environmentToExplore: string;
  experiment20Minutes: string;
  featureContributions: Record<ExplorationFeature, number>;
  featureScores: Record<ExplorationFeature, number>;
  featureTrace: ExplorationFeatureTrace[];
  id: string;
  safetyNote: string;
  score: number;
  sourceHobbyIds: string[];
  sourceCareerIds: string[];
  supportingReasons: ExplorationReason[];
}

export interface ExplorationFeatureTrace {
  candidateEvidence: Record<string, number | string>;
  contribution: number;
  feature: ExplorationFeature;
  inputEvidence: Record<string, number | string>;
  score: number;
}

export interface ExplorationRecommendationResult {
  disclaimer: string;
  excludedByGuardrail: number;
  featurePolicy: {
    features: typeof EXPLORATION_FEATURES;
    maxSingleFeatureContribution: number;
    weighting: "equal-independent-features";
  };
  input: ExplorationInput;
  locale: ExplorationLocale;
  provenance: {
    copySchema: "oiyo.exploration-recommender-copy";
    copyVersion: 1;
    sourceContracts: typeof EXPLORATION_SOURCE_CONTRACTS;
    taxonomySchema: "oiyo.exploration-taxonomy";
    taxonomyVersion: 1;
  };
  recommendations: ExplorationRecommendation[];
  schema: typeof EXPLORATION_RECOMMENDER_SCHEMA;
  schemaVersion: typeof EXPLORATION_RECOMMENDER_SCHEMA_VERSION;
}

const BUDGETS: readonly ExplorationBudget[] = ["free", "low", "medium", "high"];
const SPACES: readonly ExplorationSpace[] = ["home-small", "shared-indoor", "outdoor", "specialized"];
const SOCIAL_MODES: readonly ExplorationSocialMode[] = ["solo", "together"];
const RISKS: readonly ExplorationRisk[] = ["low", "moderate", "high"];
const ACCESSIBILITY_NEEDS: readonly ExplorationAccessibilityNeed[] = ["seated", "low-impact", "screen-free", "quiet", "remote"];

type CandidateCopy = { environment: string; experiment: string };
type LocaleCopy = { candidates: Record<string, CandidateCopy> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested);
  }
  return value;
}

function compareId(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assertEnumArray<T extends string>(value: unknown, allowed: readonly T[], label: string, allowEmpty = false): T[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => !allowed.includes(item as T))) {
    throw new TypeError(`Invalid exploration taxonomy ${label}`);
  }
  if (new Set(value).size !== value.length) throw new TypeError(`Duplicate exploration taxonomy ${label}`);
  return value as T[];
}

function assertWeightMap<T extends string>(value: unknown, allowed: readonly T[], label: string): Partial<Record<T, number>> {
  if (!isRecord(value) || Object.keys(value).length === 0) throw new TypeError(`Invalid exploration taxonomy ${label}`);
  for (const [key, weight] of Object.entries(value)) {
    if (!allowed.includes(key as T) || typeof weight !== "number" || !Number.isInteger(weight) || weight < 1 || weight > 3) {
      throw new TypeError(`Invalid exploration taxonomy ${label}.${key}`);
    }
  }
  return value as Partial<Record<T, number>>;
}

function validateCandidate(value: unknown): ExplorationCandidate {
  if (!isRecord(value)) throw new TypeError("Invalid exploration taxonomy candidate");
  for (const field of ["id", "environmentToExplore", "experiment20Minutes", "costNote", "safetyNote", "accessibilityNote"] as const) {
    if (!isNonEmptyString(value[field])) throw new TypeError(`Invalid exploration taxonomy ${field}`);
  }
  for (const field of ["sourceHobbyIds", "sourceCareerIds"] as const) {
    if (!Array.isArray(value[field]) || value[field].length === 0 || value[field].some((item) => !isNonEmptyString(item)) || new Set(value[field]).size !== value[field].length) {
      throw new TypeError(`Invalid exploration taxonomy ${field}`);
    }
  }
  if (!BUDGETS.includes(value.budget as ExplorationBudget)) throw new TypeError("Invalid exploration taxonomy budget");
  if (!RISKS.includes(value.risk as ExplorationRisk)) throw new TypeError("Invalid exploration taxonomy risk");
  if (typeof value.usualSessionMinutes !== "number" || !Number.isInteger(value.usualSessionMinutes) || value.usualSessionMinutes < 20 || value.usualSessionMinutes > 240) {
    throw new TypeError("Invalid exploration taxonomy usualSessionMinutes");
  }
  return {
    accessibility: assertEnumArray(value.accessibility, ACCESSIBILITY_NEEDS, "accessibility"),
    accessibilityNote: value.accessibilityNote as string,
    budget: value.budget as ExplorationBudget,
    costNote: value.costNote as string,
    environmentToExplore: value.environmentToExplore as string,
    experiment20Minutes: value.experiment20Minutes as string,
    id: value.id as string,
    riasec: assertWeightMap(value.riasec, RIASEC_DIMENSIONS, "riasec"),
    risk: value.risk as ExplorationRisk,
    safetyNote: value.safetyNote as string,
    socialModes: assertEnumArray(value.socialModes, SOCIAL_MODES, "socialModes"),
    sourceCareerIds: [...value.sourceCareerIds as string[]],
    sourceHobbyIds: [...value.sourceHobbyIds as string[]],
    spaces: assertEnumArray(value.spaces, SPACES, "spaces"),
    usualSessionMinutes: value.usualSessionMinutes,
    workValues: assertWeightMap(value.workValues, CAREER_VALUE_IDS, "workValues"),
  };
}

const TAXONOMY: ExplorationCandidate[] = (() => {
  if (!isRecord(taxonomyJson) || taxonomyJson.schema !== "oiyo.exploration-taxonomy" || taxonomyJson.schemaVersion !== 1 || taxonomyJson.experimentMinutes !== 20 || !Array.isArray(taxonomyJson.candidates) || !Array.isArray(taxonomyJson.sourceContracts) || taxonomyJson.sourceContracts.length !== EXPLORATION_SOURCE_CONTRACTS.length || EXPLORATION_SOURCE_CONTRACTS.some((source) => !taxonomyJson.sourceContracts.includes(source))) {
    throw new TypeError("Invalid exploration taxonomy envelope");
  }
  const candidates = taxonomyJson.candidates.map(validateCandidate);
  if (new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length) throw new TypeError("Duplicate exploration taxonomy candidate id");
  return deepFreeze(candidates.sort((left, right) => compareId(left.id, right.id)));
})();

const LOCALIZED_COPY: Readonly<Record<ExplorationLocale, LocaleCopy>> = (() => {
  if (!isRecord(copyJson) || copyJson.schema !== "oiyo.exploration-recommender-copy" || copyJson.schemaVersion !== 1 || !isRecord(copyJson.locales)) {
    throw new TypeError("Invalid exploration recommender copy envelope");
  }
  const candidateIds = new Set(TAXONOMY.map((candidate) => candidate.id));
  const localized = {} as Record<ExplorationLocale, LocaleCopy>;
  for (const locale of EXPLORATION_LOCALES) {
    const localeValue = copyJson.locales[locale];
    if (!isRecord(localeValue) || !isRecord(localeValue.candidates) || Object.keys(localeValue.candidates).length !== candidateIds.size) {
      throw new TypeError(`Incomplete exploration recommender copy: ${locale}`);
    }
    const candidates: Record<string, CandidateCopy> = {};
    for (const id of candidateIds) {
      const value = localeValue.candidates[id];
      if (!isRecord(value) || !isNonEmptyString(value.environment) || !isNonEmptyString(value.experiment)) {
        throw new TypeError(`Invalid exploration recommender copy: ${locale}.${id}`);
      }
      candidates[id] = { environment: value.environment, experiment: value.experiment };
    }
    if (Object.keys(localeValue.candidates).some((id) => !candidateIds.has(id))) throw new TypeError(`Unknown exploration recommender copy: ${locale}`);
    localized[locale] = { candidates };
  }
  return deepFreeze(localized);
})();

export function explorationTaxonomy(): readonly ExplorationCandidate[] {
  return structuredClone(TAXONOMY);
}

function validateScoreRecord<T extends string>(value: unknown, keys: readonly T[], label: string): Record<T, number> {
  if (!isRecord(value) || Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key as T))) {
    throw new TypeError(`${label} must contain exactly ${keys.join(", ")}`);
  }
  for (const key of keys) {
    const score = value[key];
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) throw new TypeError(`${label}.${key} must be 0..100`);
  }
  return value as Record<T, number>;
}

export function validateExplorationInput(value: unknown): ExplorationInput {
  if (!isRecord(value)) throw new TypeError("Invalid exploration recommendation input");
  if (!BUDGETS.includes(value.budget as ExplorationBudget)) throw new TypeError("Invalid exploration budget");
  if (!SPACES.includes(value.space as ExplorationSpace)) throw new TypeError("Invalid exploration space");
  if (!SOCIAL_MODES.includes(value.socialMode as ExplorationSocialMode)) throw new TypeError("Invalid exploration social mode");
  if (!RISKS.includes(value.maxRisk as ExplorationRisk)) throw new TypeError("Invalid exploration max risk");
  if (typeof value.timeMinutes !== "number" || !Number.isInteger(value.timeMinutes) || value.timeMinutes < 20 || value.timeMinutes > 480) {
    throw new TypeError("Exploration timeMinutes must be an integer from 20 to 480");
  }
  return {
    accessibilityNeeds: [...assertEnumArray(value.accessibilityNeeds, ACCESSIBILITY_NEEDS, "input accessibilityNeeds", true)],
    budget: value.budget as ExplorationBudget,
    interests: { ...validateScoreRecord(value.interests, RIASEC_DIMENSIONS, "interests") },
    maxRisk: value.maxRisk as ExplorationRisk,
    socialMode: value.socialMode as ExplorationSocialMode,
    space: value.space as ExplorationSpace,
    timeMinutes: value.timeMinutes,
    workEnvironment: { ...validateScoreRecord(value.workEnvironment, CAREER_VALUE_IDS, "workEnvironment") },
  };
}

function weightedScore<T extends string>(scores: Record<T, number>, weights: Partial<Record<T, number>>): number {
  let numerator = 0;
  let denominator = 0;
  for (const [key, weight] of Object.entries(weights) as [T, number][]) {
    numerator += scores[key] * weight;
    denominator += weight;
  }
  return Math.round(numerator / denominator);
}

function featureScores(candidate: ExplorationCandidate, input: ExplorationInput): Record<ExplorationFeature, number> {
  const budgetDelta = BUDGETS.indexOf(input.budget) - BUDGETS.indexOf(candidate.budget);
  return {
    interest: weightedScore(input.interests, candidate.riasec),
    workEnvironment: weightedScore(input.workEnvironment, candidate.workValues),
    time: input.timeMinutes >= candidate.usualSessionMinutes ? 100 : Math.round((input.timeMinutes / candidate.usualSessionMinutes) * 100),
    budget: budgetDelta >= 0 ? 100 : budgetDelta === -1 ? 40 : 10,
    space: candidate.spaces.includes(input.space) ? 100 : 20,
    social: candidate.socialModes.includes(input.socialMode) ? 100 : 20,
  };
}

const REASON_COPY: Record<ExplorationLocale, { labels: Record<ExplorationFeature, string>; support: (label: string) => string; weak: (label: string) => string; uncertainty: (label: string) => string }> = {
  ko: { labels: { interest: "관심", workEnvironment: "업무환경 가치", time: "시간", budget: "예산", space: "공간", social: "참여 방식" }, support: (label) => `${label} 조건이 이 20분 실험을 뒷받침합니다.`, weak: (label) => `${label} 조건의 일치가 낮아 직접 확인이 필요합니다.`, uncertainty: (label) => `${label} 조건이 맞아도 즐거움·지속 가능성은 보장되지 않으므로 실험에서 확인하세요.` },
  en: { labels: { interest: "Interest", workEnvironment: "Work-environment values", time: "Time", budget: "Budget", space: "Space", social: "Participation mode" }, support: (label) => `${label} supports this 20-minute experiment.`, weak: (label) => `${label} fits less well and needs direct checking.`, uncertainty: (label) => `Even when ${label.toLowerCase()} fits, enjoyment and repeatability are not proven; verify them in the experiment.` },
  ja: { labels: { interest: "興味", workEnvironment: "仕事環境の価値", time: "時間", budget: "予算", space: "空間", social: "参加方法" }, support: (label) => `${label}の条件がこの20分実験を支えています。`, weak: (label) => `${label}の一致が弱いため、直接確認が必要です。`, uncertainty: (label) => `${label}が合っても楽しさや継続性は保証されないため、実験で確認してください。` },
  zh: { labels: { interest: "兴趣", workEnvironment: "工作环境价值", time: "时间", budget: "预算", space: "空间", social: "参与方式" }, support: (label) => `${label}条件支持这项20分钟尝试。`, weak: (label) => `${label}匹配较弱，需要直接核查。`, uncertainty: (label) => `即使${label}匹配，也不能证明乐趣或可持续性，请在尝试中验证。` },
  fr: { labels: { interest: "Intérêt", workEnvironment: "Valeurs de travail", time: "Temps", budget: "Budget", space: "Espace", social: "Mode de participation" }, support: (label) => `${label} soutient cette expérience de 20 minutes.`, weak: (label) => `${label} correspond moins bien et doit être vérifié directement.`, uncertainty: (label) => `Même si ${label.toLowerCase()} convient, plaisir et répétabilité ne sont pas prouvés : vérifiez-les par l’expérience.` },
  es: { labels: { interest: "Interés", workEnvironment: "Valores laborales", time: "Tiempo", budget: "Presupuesto", space: "Espacio", social: "Modo de participación" }, support: (label) => `${label} respalda este experimento de 20 minutos.`, weak: (label) => `${label} encaja menos y requiere comprobación directa.`, uncertainty: (label) => `Aunque ${label.toLowerCase()} encaje, no demuestra disfrute ni continuidad; compruébalo en el experimento.` },
};

function reasonText(feature: ExplorationFeature, score: number, locale: ExplorationLocale): string {
  const copy = REASON_COPY[locale];
  return score >= 60 ? copy.support(copy.labels[feature]) : copy.weak(copy.labels[feature]);
}

function counterReasonText(feature: ExplorationFeature, score: number, locale: ExplorationLocale): string {
  if (score < 60) return reasonText(feature, score, locale);
  const copy = REASON_COPY[locale];
  return copy.uncertainty(copy.labels[feature]);
}

function eligible(candidate: ExplorationCandidate, input: ExplorationInput): boolean {
  return RISKS.indexOf(candidate.risk) <= RISKS.indexOf(input.maxRisk) &&
    input.accessibilityNeeds.every((need) => candidate.accessibility.includes(need));
}

function featureTrace(candidate: ExplorationCandidate, input: ExplorationInput, scores: Record<ExplorationFeature, number>, contributions: Record<ExplorationFeature, number>): ExplorationFeatureTrace[] {
  return EXPLORATION_FEATURES.map((feature) => {
    let inputEvidence: Record<string, number | string> = {};
    let candidateEvidence: Record<string, number | string> = {};
    switch (feature) {
      case "interest":
        inputEvidence = Object.fromEntries(Object.keys(candidate.riasec).map((key) => [key, input.interests[key as RiasecDimension]]));
        candidateEvidence = { ...candidate.riasec } as Record<string, number>;
        break;
      case "workEnvironment":
        inputEvidence = Object.fromEntries(Object.keys(candidate.workValues).map((key) => [key, input.workEnvironment[key as CareerValueId]]));
        candidateEvidence = { ...candidate.workValues } as Record<string, number>;
        break;
      case "time": inputEvidence = { timeMinutes: input.timeMinutes }; candidateEvidence = { usualSessionMinutes: candidate.usualSessionMinutes }; break;
      case "budget": inputEvidence = { budget: input.budget }; candidateEvidence = { budget: candidate.budget }; break;
      case "space": inputEvidence = { space: input.space }; candidateEvidence = { spaces: candidate.spaces.join("|") }; break;
      case "social": inputEvidence = { socialMode: input.socialMode }; candidateEvidence = { socialModes: candidate.socialModes.join("|") }; break;
    }
    return { candidateEvidence, contribution: contributions[feature], feature, inputEvidence, score: scores[feature] };
  });
}

function buildRecommendation(candidate: ExplorationCandidate, input: ExplorationInput, locale: ExplorationLocale): ExplorationRecommendation {
  const scores = featureScores(candidate, input);
  const reasons = EXPLORATION_FEATURES.map((feature) => ({
    direction: "support" as const,
    feature,
    score: scores[feature],
    text: reasonText(feature, scores[feature], locale),
  }));
  const featureContributions = Object.fromEntries(EXPLORATION_FEATURES.map((feature) => [
    feature,
    Number((scores[feature] * EXPLORATION_FEATURE_WEIGHT).toFixed(4)),
  ])) as Record<ExplorationFeature, number>;
  return {
    accessibilityNote: candidate.accessibilityNote,
    costNote: candidate.costNote,
    counterReasons: [...reasons]
      .sort((left, right) => left.score - right.score || EXPLORATION_FEATURES.indexOf(left.feature) - EXPLORATION_FEATURES.indexOf(right.feature))
      .slice(0, 2)
      .map((reason) => ({ ...reason, direction: "counter" as const, text: counterReasonText(reason.feature, reason.score, locale) })),
    environmentToExplore: LOCALIZED_COPY[locale].candidates[candidate.id].environment,
    experiment20Minutes: LOCALIZED_COPY[locale].candidates[candidate.id].experiment,
    featureContributions,
    featureScores: scores,
    featureTrace: featureTrace(candidate, input, scores, featureContributions),
    id: candidate.id,
    safetyNote: candidate.safetyNote,
    score: Math.round(EXPLORATION_FEATURES.reduce((total, feature) => total + scores[feature], 0) / EXPLORATION_FEATURES.length),
    sourceHobbyIds: [...candidate.sourceHobbyIds],
    sourceCareerIds: [...candidate.sourceCareerIds],
    supportingReasons: [...reasons]
      .filter((reason) => reason.score >= 60)
      .sort((left, right) => right.score - left.score || EXPLORATION_FEATURES.indexOf(left.feature) - EXPLORATION_FEATURES.indexOf(right.feature))
      .slice(0, 3),
  };
}

export function recommendExploration(value: unknown, limit: number, locale: ExplorationLocale): ExplorationRecommendationResult {
  const input = validateExplorationInput(value);
  if (!EXPLORATION_LOCALES.includes(locale)) throw new TypeError(`Unsupported exploration locale: ${locale}`);
  if (!Number.isInteger(limit) || limit < 1 || limit > TAXONOMY.length) throw new TypeError(`Exploration limit must be 1..${TAXONOMY.length}`);
  const allowed = TAXONOMY.filter((candidate) => eligible(candidate, input));
  if (allowed.length === 0) throw new RangeError("No exploration candidate satisfies the requested safety and accessibility guardrails");
  const recommendations = allowed
    .map((candidate) => buildRecommendation(candidate, input, locale))
    .sort((left, right) => right.score - left.score || compareId(left.id, right.id))
    .slice(0, limit);
  return {
    disclaimer: "These are reversible environment experiments, not occupation, hiring, aptitude, medical, or financial determinations.",
    excludedByGuardrail: TAXONOMY.length - allowed.length,
    featurePolicy: {
      features: Object.freeze([...EXPLORATION_FEATURES]) as unknown as typeof EXPLORATION_FEATURES,
      maxSingleFeatureContribution: Number((100 * EXPLORATION_FEATURE_WEIGHT).toFixed(4)),
      weighting: "equal-independent-features",
    },
    input,
    locale,
    provenance: {
      copySchema: "oiyo.exploration-recommender-copy",
      copyVersion: 1,
      sourceContracts: Object.freeze([...EXPLORATION_SOURCE_CONTRACTS]) as unknown as typeof EXPLORATION_SOURCE_CONTRACTS,
      taxonomySchema: "oiyo.exploration-taxonomy",
      taxonomyVersion: 1,
    },
    recommendations,
    schema: EXPLORATION_RECOMMENDER_SCHEMA,
    schemaVersion: EXPLORATION_RECOMMENDER_SCHEMA_VERSION,
  };
}
