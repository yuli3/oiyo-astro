/**
 * 사이트 공용 파티클 연출이 **언제** 켜지는지의 정책. 그리는 코드는 `engine.ts`.
 *
 * 결과 공개 연출은 "축하"로 읽힌다. 우울·불안·ADHD 같은 선별검사 결과에 축하가
 * 터지면 비진단 안내를 한 줄 위에 두고도 결과를 가볍게 만든다 — 그래서 선별검사는
 * 연출에서 뺀다. 목록은 `scripts/audit-questionnaire-cohorts.mjs` 의 SCREENING 과
 * 같은 검사들이고, `policy.test.ts` 가 두 목록이 갈라지지 않게 잠근다.
 */

export const SCREENING_TEST_IDS = new Set([
  "adhd-screening",
  "anxiety-screening",
  "burnout",
  "codependency",
  "depression-screening",
  "dopamine-dependency",
  "emotional-eating",
  "loneliness",
  "social-anxiety",
  "toxic-relationship",
]);

export type RevealPreset = "bloom" | "stardust";

export interface RevealInput {
  testId?: unknown;
  kind?: unknown;
}

/** 결과 공개 연출 종류. 연출하지 않아야 하면 null. */
export function revealPresetFor(input: RevealInput | null | undefined): RevealPreset | null {
  if (!input || typeof input.testId !== "string" || !input.testId) return null;
  if (SCREENING_TEST_IDS.has(input.testId)) return null;
  // 운세·상징 해석은 별가루, 성향·척도 검사는 피어나는 빛.
  return input.kind === "mystic" || input.kind === "fortune" ? "stardust" : "bloom";
}

/** 짧은 간격에 결과가 여러 번 저장돼도 연출은 한 번만. */
export const REVEAL_COOLDOWN_MS = 4000;
