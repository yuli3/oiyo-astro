import { describe, expect, it } from "vitest";
import catalogJson from "../../../config/type-advice-v1.json";
import { ASSESSMENT_LOCALES } from "../core/common";
import {
  ADVICE_FORBIDDEN_PATTERNS,
  CRISIS_CONSTRUCTS,
  isEligibleAdviceSignal,
  matchAdvice,
  needsCrisisRouting,
  TIER_EXPRESSION,
  validateAdvice,
  type AdviceSignal,
  type TypeAdvice,
} from "./type-advice";

const CATALOG = (catalogJson as { advices: unknown[] }).advices.map((a) =>
  validateAdvice(a, ASSESSMENT_LOCALES),
);

const AT = "2026-07-17T00:00:00.000Z";
const signal = (constructId: string, band: AdviceSignal["band"], extra: Partial<AdviceSignal> = {}): AdviceSignal => ({
  constructId,
  band,
  confidenceBand: "high",
  freshness: "current",
  measuredAt: AT,
  provenance: {
    assessmentId: constructId.startsWith("psychology.big5.") ? "big5"
      : constructId.startsWith("relationship.attachment.") ? "adult-attachment"
      : constructId.startsWith("vocation.riasec.") ? "riasec"
      : constructId.startsWith("values.work.") ? "career-values"
      : constructId.startsWith("values.chosen.perfectionism") ? "perfectionism"
      : constructId.startsWith("wellness.burnout.") ? "burnout"
      : "unknown",
    instrumentVersion: "instrument-v1",
    interpretationVersion: "interpretation-v1",
    scoringVersion: "scoring-v1",
  },
  ...extra,
});

describe("type-advice v1 (#66 Wave 0)", () => {
  it("catalog: 12개 상한을 지키고 전부 계약을 통과한다", () => {
    expect(CATALOG).toHaveLength(12);
    expect(new Set(CATALOG.map((a) => a.id)).size).toBe(12);
    // Wave 0은 검증된 construct만 — 사주·별자리는 아직 없음
    for (const advice of CATALOG) {
      for (const c of [...advice.match.any, ...(advice.match.none ?? [])]) {
        expect(c.constructId).toMatch(/^(psychology|relationship|vocation|values|wellness)\./);
      }
    }
  });

  it("곱집합이 아니라 조건 매칭: '게으른 완벽주의자'는 두 신호가 겹친 상태일 뿐", () => {
    const lazyPerfectionist = [
      signal("psychology.big5.C", "low"),
      signal("values.chosen.perfectionism", "high"),
    ];
    const ids = matchAdvice(lazyPerfectionist, CATALOG).map((m) => m.advice.id);
    expect(ids).toContain("start-messy");
    // 두 조건 다 맞은 조언이 하나만 맞은 것보다 앞선다(특이도 정렬)
    const startMessy = matchAdvice(lazyPerfectionist, CATALOG).find((m) => m.advice.id === "start-messy")!;
    expect(startMessy.matchedBy).toHaveLength(2);
    // 별도 유형(id)이 아니라 조건 조합으로만 표현된다
    expect(CATALOG.some((a) => /lazy|perfectionist-type/.test(a.id))).toBe(false);
  });

  it("none 조건이 걸리면 제외한다(번아웃 중엔 '더 해보라'를 내지 않는다)", () => {
    const burntOut = [
      signal("psychology.big5.C", "low"),
      signal("values.chosen.perfectionism", "high"),
      signal("wellness.burnout.total", "high"),
    ];
    const ids = matchAdvice(burntOut, CATALOG).map((m) => m.advice.id);
    expect(ids).not.toContain("start-messy");
    expect(ids).not.toContain("worry-window");
    // none이 없는 조언은 여전히 나온다
    expect(ids).toContain("tiny-first-step");
  });

  it("tie·low-flat 상태에서는 조언을 내지 않는다", () => {
    expect(matchAdvice([signal("psychology.big5.C", "low", { state: "tie" })], CATALOG)).toHaveLength(0);
    expect(matchAdvice([signal("psychology.big5.C", "low", { state: "low-flat" })], CATALOG)).toHaveLength(0);
    expect(matchAdvice([signal("psychology.big5.C", "low", { state: "clear" })], CATALOG).length).toBeGreaterThan(0);
  });

  it("정본 provenance·현재성·confidence를 통과한 신호만 조언에 사용한다", () => {
    const valid = signal("psychology.big5.C", "low");
    expect(isEligibleAdviceSignal(valid)).toBe(true);
    expect(matchAdvice([{ ...valid, freshness: "stale" }], CATALOG)).toEqual([]);
    expect(matchAdvice([{ ...valid, confidenceBand: "low" }], CATALOG)).toEqual([]);
    expect(matchAdvice([{ ...valid, measuredAt: "yesterday" }], CATALOG)).toEqual([]);
    expect(matchAdvice([{ ...valid, provenance: { ...valid.provenance, assessmentId: "riasec" } }], CATALOG)).toEqual([]);
    expect(matchAdvice([{ ...valid, provenance: { ...valid.provenance, scoringVersion: "" } }], CATALOG)).toEqual([]);

    const staleFirst = { ...valid, freshness: "stale" as const, measuredAt: "2026-07-18T00:00:00.000Z" };
    expect(matchAdvice([staleFirst, valid], CATALOG).length).toBeGreaterThan(0);
  });

  it("결정론: 같은 입력 → 같은 순서. 근거 높은 tier가 앞선다", () => {
    const signals = [signal("psychology.big5.O", "high"), signal("psychology.big5.N", "high")];
    const first = matchAdvice(signals, CATALOG).map((m) => m.advice.id);
    const second = matchAdvice(signals, CATALOG).map((m) => m.advice.id);
    expect(first).toEqual(second);
    const tiers = matchAdvice(signals, CATALOG).map((m) => m.advice.evidenceTier);
    const rank = (t: string) => ["validated-scale", "research-inspired", "reflective-framework", "symbolic-tradition", "educational", "entertainment"].indexOf(t);
    expect(tiers.map(rank)).toEqual([...tiers.map(rank)].sort((a, b) => a - b));
  });

  it("인식론 레인: 출처 필수 tier는 출처 없이 통과할 수 없다", () => {
    for (const advice of CATALOG) {
      if (TIER_EXPRESSION[advice.evidenceTier].requiresSources) expect(advice.sources?.length).toBeGreaterThan(0);
    }
    const noSources = { ...CATALOG[0], sources: undefined } as unknown;
    expect(() => validateAdvice(noSources, ASSESSMENT_LOCALES)).toThrow(/출처가 필수/);
    expect(() => validateAdvice({ ...CATALOG[0], sources: ["not-a-url"] }, ASSESSMENT_LOCALES)).toThrow(/HTTPS 원문 URL/);
    expect(() => validateAdvice({ ...CATALOG[0], action: { ...CATALOG[0].action, minutes: -1 } }, ASSESSMENT_LOCALES)).toThrow(/행동 계약/);
  });

  it("금지 표현·6로케일 폴백 금지를 강제한다", () => {
    const base = CATALOG.find((a) => a.id === "tiny-first-step")!;
    const diagnostic = {
      ...base,
      copy: { ...base.copy, ko: { title: "진단됩니다", body: base.copy.ko.body } },
    } as unknown;
    expect(() => validateAdvice(diagnostic, ASSESSMENT_LOCALES)).toThrow(/금지 표현/);

    const commanding = {
      ...base,
      copy: { ...base.copy, ko: { title: base.copy.ko.title, body: "반드시 매일 해야 합니다" } },
    } as unknown;
    expect(() => validateAdvice(commanding, ASSESSMENT_LOCALES)).toThrow(/금지 표현/);

    const missingLocale = { ...base, copy: { ...base.copy, fr: undefined } } as unknown;
    expect(() => validateAdvice(missingLocale, ASSESSMENT_LOCALES)).toThrow(/폴백 금지/);

    // 금지 패턴은 실제로 물어야 한다(빈 게이트 방지)
    expect(ADVICE_FORBIDDEN_PATTERNS.some((p) => p.test("이건 진단입니다"))).toBe(true);
    expect(ADVICE_FORBIDDEN_PATTERNS.some((p) => p.test("주식 사세요"))).toBe(true);
    expect(ADVICE_FORBIDDEN_PATTERNS.some((p) => p.test("20분만 해 보세요"))).toBe(false);
  });

  it("위기 신호는 조언 대상이 아니라 안내 분기다", () => {
    expect(needsCrisisRouting([signal("wellness.depression.severity", "high")])).toBe(true);
    expect(needsCrisisRouting([signal("psychology.big5.C", "low")])).toBe(false);
    // 카탈로그에 위기 construct 조건이 들어오면 검증에서 막힌다
    const crisisAdvice = {
      ...CATALOG[0],
      match: { any: [{ constructId: CRISIS_CONSTRUCTS[0], band: "high" }] },
    } as unknown as TypeAdvice;
    expect(() => validateAdvice(crisisAdvice, ASSESSMENT_LOCALES)).toThrow(/위기 신호/);
    for (const advice of CATALOG) {
      const ids = [...advice.match.any, ...(advice.match.none ?? [])].map((c) => c.constructId);
      expect(ids.some((id) => CRISIS_CONSTRUCTS.includes(id))).toBe(false);
    }
  });

  it("사람 검수 기록이 없으면 통과할 수 없다", () => {
    expect(() => validateAdvice({ ...CATALOG[0], reviewedBy: " " }, ASSESSMENT_LOCALES)).toThrow(/사람 검수/);
    expect(() => validateAdvice({ ...CATALOG[0], reviewedAt: "언젠가" }, ASSESSMENT_LOCALES)).toThrow(/사람 검수/);
  });

  it("신호가 없으면 아무 조언도 내지 않는다", () => {
    expect(matchAdvice([], CATALOG)).toEqual([]);
    expect(matchAdvice([signal("psychology.big5.C", "mid")], CATALOG)).toEqual([]);
  });
});
