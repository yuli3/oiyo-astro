// oiyo.type-advice v1 (#66 Wave 0) — 유형별 조언 매칭 엔진.
//
// 설계 정본: company-brain/AI-Sessions/wiki/design/type-advice-dataset-2026-07-17.md
//
// 세 가지 구조적 결정:
// 1) 조언은 콘텐츠가 아니라 **데이터**다. 신규 URL을 만들지 않고 기존 결과 화면에서만
//    소비한다(MBTI16×별자리12×사주10=1,920 페이지의 유혹을 구조로 차단 — 2026-07-14
//    크롤 예산 반전의 재발 방지).
// 2) 유형 곱집합이 아니라 **construct 조건 매칭**이다. "게으른 완벽주의자"는 새 분류가
//    아니라 big5.C=low + perfectionism=high가 동시에 잡힌 상태일 뿐이다.
// 3) **인식론 레인**: evidenceTier가 표현 강도를 결정한다. 같은 문장도 근거 수준이
//    낮으면 실행 지시가 될 수 없다.
import type { EvidenceTier } from "../core/common";
import type { AssessmentLocale } from "../core/common";

export const TYPE_ADVICE_SCHEMA = "oiyo.type-advice" as const;
export const TYPE_ADVICE_SCHEMA_VERSION = 1 as const;

export type AdviceBand = "low" | "mid" | "high";

// tier별 허용 표현 강도. 낮은 tier일수록 "지시"에서 멀어진다.
export const TIER_EXPRESSION: Record<EvidenceTier, { maxStrength: "suggest" | "reflect" | "inform"; requiresSources: boolean }> = {
  "validated-scale": { maxStrength: "suggest", requiresSources: true },
  "research-inspired": { maxStrength: "suggest", requiresSources: true },
  "reflective-framework": { maxStrength: "reflect", requiresSources: false },
  "symbolic-tradition": { maxStrength: "inform", requiresSources: false },
  educational: { maxStrength: "inform", requiresSources: false },
  entertainment: { maxStrength: "inform", requiresSources: false },
};

// 어떤 tier에서도 금지. 데이터가 사람에게 직접 말을 거는 유일한 표면이라 방어가 필요하다.
export const ADVICE_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /진단(?:서|명|받|됩니다|입니다)/,
  /처방|투약|복용|치료(?:하세요|해야)/,
  /반드시\s|무조건|절대적으로/,
  /장애(?:입니다|가 있습니다)/,
  /(?:주식|코인|투자).{0,6}(?:하세요|사세요|파세요)/,
  /(?:이혼|고소|고발|손절).{0,6}(?:하세요|해야)/,
];

// 위기 신호는 조언의 대상이 아니다. 공식 도움 창구 안내로 분기한다(별도 사람 게이트).
export const CRISIS_CONSTRUCTS: readonly string[] = [
  "wellness.depression.severity",
  "wellness.suicidality.risk",
  "wellness.selfharm.risk",
];

export interface AdviceCondition {
  band: AdviceBand;
  constructId: string;
}

export interface AdviceAction {
  cost: "none" | "low";
  minutes: number;
  repeat: "once" | "daily" | "weekly";
}

export interface AdviceCopy {
  body: string;
  title: string;
}

export interface TypeAdvice {
  action: AdviceAction;
  copy: Record<AssessmentLocale, AdviceCopy>;
  evidenceTier: EvidenceTier;
  id: string;
  match: { any: AdviceCondition[]; none?: AdviceCondition[] };
  reviewedAt: string;
  reviewedBy: string;
  schema: typeof TYPE_ADVICE_SCHEMA;
  schemaVersion: typeof TYPE_ADVICE_SCHEMA_VERSION;
  sources?: string[];
}

// 매칭 입력: 사용자의 construct 상태. 점수가 아니라 구간(band)만 받는다 —
// 원점수를 조언 엔진에 흘리지 않기 위해서다.
export interface AdviceSignal {
  band: AdviceBand;
  constructId: string;
  measuredAt: string;
  // tie/low-flat 상태에서는 조언을 내지 않는다(A4 역할 비주얼과 동일 규칙).
  state?: "clear" | "tie" | "low-flat";
}

export interface AdviceMatch {
  advice: TypeAdvice;
  matchedBy: AdviceCondition[];
}

const TIER_ORDER: EvidenceTier[] = [
  "validated-scale", "research-inspired", "reflective-framework",
  "symbolic-tradition", "educational", "entertainment",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateAdvice(value: unknown, locales: readonly AssessmentLocale[]): TypeAdvice {
  if (!isRecord(value)) throw new TypeError("advice 레코드가 아닙니다");
  const advice = value as unknown as TypeAdvice;
  if (advice.schema !== TYPE_ADVICE_SCHEMA || advice.schemaVersion !== TYPE_ADVICE_SCHEMA_VERSION) {
    throw new TypeError(`schema/version 불일치: ${advice.id}`);
  }
  if (!advice.id?.trim()) throw new TypeError("advice.id가 비었습니다");
  if (!TIER_ORDER.includes(advice.evidenceTier)) throw new TypeError(`${advice.id}: 알 수 없는 evidenceTier`);
  if (!advice.match?.any?.length) throw new TypeError(`${advice.id}: match.any 조건이 필요합니다`);

  const conditions = [...advice.match.any, ...(advice.match.none ?? [])];
  for (const condition of conditions) {
    if (!condition.constructId?.trim()) throw new TypeError(`${advice.id}: constructId가 비었습니다`);
    if (!["low", "mid", "high"].includes(condition.band)) throw new TypeError(`${advice.id}: band는 low|mid|high`);
    if (CRISIS_CONSTRUCTS.includes(condition.constructId)) {
      throw new TypeError(`${advice.id}: 위기 신호(${condition.constructId})는 조언 대상이 아닙니다 — 공식 창구 안내로 분기해야 합니다`);
    }
  }

  const rule = TIER_EXPRESSION[advice.evidenceTier];
  if (rule.requiresSources && !advice.sources?.length) {
    throw new TypeError(`${advice.id}: ${advice.evidenceTier}는 출처가 필수입니다`);
  }
  // 6로케일 직접 작성 강제 — 폴백을 허용하면 한국어가 전 로케일에 노출된다.
  for (const locale of locales) {
    const copy = advice.copy?.[locale];
    if (!copy?.title?.trim() || !copy?.body?.trim()) throw new TypeError(`${advice.id}: ${locale} 카피 누락(폴백 금지)`);
  }
  for (const [locale, copy] of Object.entries(advice.copy ?? {})) {
    for (const pattern of ADVICE_FORBIDDEN_PATTERNS) {
      if (pattern.test(`${copy.title} ${copy.body}`)) {
        throw new TypeError(`${advice.id}[${locale}]: 금지 표현 ${pattern}`);
      }
    }
  }
  if (!advice.reviewedBy?.trim() || Number.isNaN(Date.parse(advice.reviewedAt))) {
    throw new TypeError(`${advice.id}: 사람 검수 기록(reviewedBy/reviewedAt) 필요`);
  }
  return advice;
}

function signalOf(signals: readonly AdviceSignal[], constructId: string): AdviceSignal | undefined {
  return signals.find((s) => s.constructId === constructId);
}

function conditionMet(signals: readonly AdviceSignal[], condition: AdviceCondition): boolean {
  const signal = signalOf(signals, condition.constructId);
  if (!signal) return false;
  // 동률·저평탄 상태는 신호로 치지 않는다 — 구분되지 않는 결과에 조언을 붙이면 과대해석이다.
  if (signal.state && signal.state !== "clear") return false;
  return signal.band === condition.band;
}

/**
 * 결정론 매처. 같은 입력 → 같은 출력, 같은 순서.
 * 정렬: evidenceTier(높은 근거 먼저) → 조건 특이도(많이 맞을수록) → 최근 측정 → id.
 */
export function matchAdvice(signals: readonly AdviceSignal[], catalog: readonly TypeAdvice[]): AdviceMatch[] {
  const matches: AdviceMatch[] = [];
  for (const advice of catalog) {
    if ((advice.match.none ?? []).some((c) => conditionMet(signals, c))) continue;
    const matchedBy = advice.match.any.filter((c) => conditionMet(signals, c));
    if (matchedBy.length) matches.push({ advice, matchedBy });
  }
  return matches.sort((a, b) => {
    const tier = TIER_ORDER.indexOf(a.advice.evidenceTier) - TIER_ORDER.indexOf(b.advice.evidenceTier);
    if (tier !== 0) return tier;
    if (a.matchedBy.length !== b.matchedBy.length) return b.matchedBy.length - a.matchedBy.length;
    const recency = (m: AdviceMatch) => Math.max(...m.matchedBy.map((c) => Date.parse(signalOf(signals, c.constructId)!.measuredAt)));
    const byRecency = recency(b) - recency(a);
    if (byRecency !== 0) return byRecency;
    return a.advice.id.localeCompare(b.advice.id);
  });
}

/** 위기 construct가 신호에 있으면 조언이 아니라 안내로 분기해야 함을 알린다. */
export function needsCrisisRouting(signals: readonly AdviceSignal[]): boolean {
  return signals.some((s) => CRISIS_CONSTRUCTS.includes(s.constructId));
}
