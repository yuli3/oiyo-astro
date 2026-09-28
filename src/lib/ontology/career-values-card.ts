import type { CanonicalAssessmentResult } from "@/assessments";

const CAREER_VALUES = ["security", "achievement", "autonomy", "service", "creativity", "status"] as const;

/**
 * 2026-09-28: 나의 지도 "직업가치" 카드는 여섯 가치의 온톨로지 신호가 모두 있어야 떴다.
 * 그런데 직업가치 플러그인은 1순위 묶음만 신호로 남기므로(동점이 아니면 하나) 카드가 사실상
 * 한 번도 뜨지 않았다. 신호 계약은 그대로 두고, 막대는 저장된 결과의 여섯 점수에서 읽는다.
 */
export function latestCareerValueScores(results: readonly CanonicalAssessmentResult[]): Record<(typeof CAREER_VALUES)[number], number> | null {
  const latest = results
    .filter((result) => result.assessmentId === "career-values")
    .reduce<CanonicalAssessmentResult | null>((best, result) => (!best || result.completedAt > best.completedAt ? result : best), null);
  const normalized = latest?.scores?.normalized;
  if (!normalized || CAREER_VALUES.some((key) => typeof normalized[key] !== "number")) return null;
  return Object.fromEntries(CAREER_VALUES.map((key) => [key, Math.max(0, Math.min(100, normalized[key]))])) as Record<(typeof CAREER_VALUES)[number], number>;
}
