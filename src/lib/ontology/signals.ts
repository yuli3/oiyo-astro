/**
 * Ontology signal collector (Phase 1 / Track A, step 1).
 *
 * `collectSignals()` is the single, dependency-free entry point that the
 * relationship graph (step 2) and scoring engine (step 3) build on top of.
 * It merges two very different sources into one light-weight signal bag:
 *
 *  1. Quiz-based signals recorded via `recordTestResult()` into the
 *     `oiyo:test-results:v1` store (`@/lib/user/test-results`). Each testId
 *     needs its own adapter because `StoredTestResult.result` is `unknown` —
 *     see `signalAdapters` below.
 *  2. Birth-derived signals from the canonical profile store
 *     (`oiyo_user_state`, `@/lib/user/store/user-store`) — used for zodiac
 *     and saju (both require a birth date) and as an mbti fallback.
 *
 * Historical note: this collector began as the Phase 1 v1 compatibility
 * layer. Big Five, RIASEC, and MBTI now dual-write versioned V2 assessment
 * results while continuing to write the legacy shapes consumed here. Keep
 * these adapters until the `/ontology` UI finishes its V2 signal migration.
 */

import { calculateSaju, analyzeSaju } from "@/lib/ontology/saju/logic";
import { useUserStore } from "@/lib/user/store/user-store";
import { listStoredTestResults, type StoredTestResult } from "@/lib/user/test-results";
import { collectAssessmentSignals, type OntologySignal } from "@/assessments";

export interface ProfileSignals {
  mbti?: { type: string; traits: string[] };
  big5?: { O: number; C: number; E: number; A: number; N: number };
  riasec?: { code: string; scores: Record<string, number>; scoreScale?: "normalized-0-100" };
  enneagram?: string;
  zodiac?: string;
  saju?: { element: string; tenGods: string[] };
}

const RIASEC_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;
const MBTI_AXIS_POLES = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
} as const;

const MBTI_TYPE_PATTERN = /^[EI][SN][TF][JP]$/;
const ENNEAGRAM_TYPE_PATTERN = /^[1-9]$/;
const BIG5_DIMENSIONS = ["O", "C", "E", "A", "N"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function adaptMbti(result: StoredTestResult): Partial<ProfileSignals> | null {
  const data = result.result;
  const rawType = isRecord(data) && typeof data.type === "string" ? data.type.toUpperCase() : null;
  if (!rawType || !MBTI_TYPE_PATTERN.test(rawType)) return null;
  return { mbti: { type: rawType, traits: rawType.split("") } };
}

function adaptBig5(result: StoredTestResult): Partial<ProfileSignals> | null {
  const data = result.result;
  if (!isRecord(data)) return null;
  // Accept either `{ scores: ScoreMap }` (the {code}/{score,band} convention
  // used by political-compass/holmes-rahe) or a flat ScoreMap.
  const scores = isRecord(data.scores) ? data.scores : data;
  const values = {} as { O: number; C: number; E: number; A: number; N: number };
  for (const dim of BIG5_DIMENSIONS) {
    const value = scores[dim];
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    values[dim] = value;
  }
  return { big5: values };
}

function adaptRiasec(result: StoredTestResult): Partial<ProfileSignals> | null {
  const data = result.result;
  if (!isRecord(data) || typeof data.code !== "string" || !data.code) return null;
  const rawScores = isRecord(data.scores) ? data.scores : {};
  const scores: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawScores)) {
    if (typeof value === "number") scores[key] = value;
  }
  return { riasec: { code: data.code, scores } };
}

function adaptEnneagram(result: StoredTestResult): Partial<ProfileSignals> | null {
  const data = result.result;
  const type = isRecord(data) && typeof data.type === "string" ? data.type : null;
  if (!type || !ENNEAGRAM_TYPE_PATTERN.test(type)) return null;
  return { enneagram: type };
}

/** testId → adapter. testId values match the convention of the four tests already wired to `recordTestResult()`. */
export const signalAdapters: Record<string, (result: StoredTestResult) => Partial<ProfileSignals> | null> = {
  mbti: adaptMbti,
  big5: adaptBig5,
  riasec: adaptRiasec,
  // RiasecQuickTest.tsx (/riasec-quick, 18Q) records under 'riasec-quick' so
  // it never overwrites the 24-question test's history — same result shape
  // ({ code, scores }), so it reuses adaptRiasec.
  'riasec-quick': adaptRiasec,
  enneagram: adaptEnneagram,
};

/**
 * Overlay canonical V2 assessment signals on the legacy profile shape.
 * V2 wins only when a complete construct family is present; unrelated and
 * birth-derived fields stay untouched. This keeps legacy consumers working
 * while preventing two competing current values for the same assessment.
 */
export function mergeAssessmentSignals(
  base: ProfileSignals,
  assessmentSignals: readonly OntologySignal[],
): ProfileSignals {
  const next: ProfileSignals = { ...base };
  const byConstruct = new Map(assessmentSignals.map((signal) => [signal.constructId, signal]));

  const big5 = Object.fromEntries(BIG5_DIMENSIONS.map((dimension) => [
    dimension,
    byConstruct.get(`psychology.big5.${dimension}`)?.value,
  ])) as Record<(typeof BIG5_DIMENSIONS)[number], unknown>;
  if (BIG5_DIMENSIONS.every((dimension) => typeof big5[dimension] === "number")) {
    next.big5 = big5 as ProfileSignals["big5"];
  }

  const riasecScores = Object.fromEntries(RIASEC_DIMENSIONS.map((dimension) => [
    dimension,
    byConstruct.get(`vocation.riasec.${dimension}`)?.value,
  ])) as Record<string, unknown>;
  if (RIASEC_DIMENSIONS.every((dimension) => typeof riasecScores[dimension] === "number")) {
    const scores = riasecScores as Record<string, number>;
    const code = [...RIASEC_DIMENSIONS]
      .sort((left, right) => scores[right] - scores[left] || RIASEC_DIMENSIONS.indexOf(left) - RIASEC_DIMENSIONS.indexOf(right))
      .slice(0, 3)
      .join("");
    next.riasec = { code, scores, scoreScale: "normalized-0-100" };
  }

  const mbtiAxisScores = Object.fromEntries(Object.keys(MBTI_AXIS_POLES).map((axis) => [
    axis,
    byConstruct.get(`personality.mbti.preference.${axis}`)?.value,
  ])) as Record<keyof typeof MBTI_AXIS_POLES, unknown>;
  if (Object.keys(MBTI_AXIS_POLES).every((axis) => typeof mbtiAxisScores[axis as keyof typeof MBTI_AXIS_POLES] === "number")) {
    const type = Object.entries(MBTI_AXIS_POLES).map(([axis, poles]) =>
      (mbtiAxisScores[axis as keyof typeof MBTI_AXIS_POLES] as number) >= 50 ? poles[0] : poles[1]
    ).join("");
    next.mbti = { type, traits: type.split("") };
  }

  return next;
}

/** `calculateSaju` + `analyzeSaju` (`@/lib/ontology/saju/logic`) → the light `{element, tenGods}` signal shape. */
function computeSajuSignal(birthDate: string, gender: "female" | "male" | null | undefined): ProfileSignals["saju"] | null {
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const saju = calculateSaju(date, false, gender === "female" ? "female" : "male");
    const analysis = analyzeSaju(saju);
    const tenGods = Object.entries(analysis.tenGodCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([tenGod]) => tenGod);
    return { element: analysis.dominantElement, tenGods };
  } catch {
    return null;
  }
}

/**
 * Collects every signal we currently have about the user, local-first.
 * Never throws; returns `{}` when nothing has been recorded/entered yet.
 */
export function collectSignals(): ProfileSignals {
  let signals: ProfileSignals = {};

  // 1) Quiz-based signals from oiyo:test-results:v1. Newest-first, so the
  //    first adapter match per field is the most recent result.
  for (const result of listStoredTestResults()) {
    const adapter = signalAdapters[result.testId];
    if (!adapter) continue;
    const extracted = adapter(result);
    if (!extracted) continue;
    for (const key of Object.keys(extracted) as (keyof ProfileSignals)[]) {
      if (signals[key] === undefined) {
        (signals as Record<string, unknown>)[key] = extracted[key];
      }
    }
  }

  // Canonical V2 results override the equivalent legacy assessment fields.
  // collectAssessmentSignals already chooses one best signal per construct.
  signals = mergeAssessmentSignals(signals, collectAssessmentSignals());

  // 2) Birth-derived signals from the canonical profile store
  //    (oiyo_user_state). Fallback for mbti, only source for zodiac/saju.
  const profile = useUserStore.getState().profile;
  if (signals.mbti === undefined && profile.mbtiType) {
    const type = profile.mbtiType.toUpperCase();
    if (MBTI_TYPE_PATTERN.test(type)) signals.mbti = { type, traits: type.split("") };
  }
  if (profile.zodiacSign) {
    signals.zodiac = profile.zodiacSign;
  }
  if (profile.birthDate) {
    const saju = computeSajuSignal(profile.birthDate, profile.gender);
    if (saju) signals.saju = saju;
  }

  return signals;
}
