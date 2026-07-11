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
 * ⚠️ Investigation note (2026-07-09, Hephaestus): at the time this file was
 * written, none of the big5/riasec/enneagram/mbti standalone test components
 * (`BigFivePersonalityTest.tsx`, `RiasecCareerTest.tsx`, `EnneagramTest.tsx`,
 * `MbtiPersonalityTest.tsx`) call `recordTestResult()`. They round-trip their
 * result through the URL only (`@/lib/result-url`) or (RIASEC) not at all.
 * Only `political-compass`, `holmes-rahe`, `joseon-faction` and
 * `economics-school` currently populate the store. The adapters below are
 * written against the shape each component computes internally
 * (`ScoreMap {O,C,E,A,N}` for big5, top RIASEC code + scores, a single
 * enneagram type digit, a 4-letter mbti type) wrapped the same way the four
 * already-wired tests wrap their `result` payload (`{ code }` / `{ score,
 * band }`), so signals start flowing the moment those tests are instrumented
 * — no signals.ts changes needed. Until then, `collectSignals()` simply
 * returns `{}` for these fields, which callers must treat as "not taken yet".
 */

import { calculateSaju, analyzeSaju } from "@/lib/ontology/saju/logic";
import { useUserStore } from "@/lib/user/store/user-store";
import { listStoredTestResults, type StoredTestResult } from "@/lib/user/test-results";

export interface ProfileSignals {
  mbti?: { type: string; traits: string[] };
  big5?: { O: number; C: number; E: number; A: number; N: number };
  riasec?: { code: string; scores: Record<string, number> };
  enneagram?: string;
  zodiac?: string;
  saju?: { element: string; tenGods: string[] };
}

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
  const signals: ProfileSignals = {};

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
