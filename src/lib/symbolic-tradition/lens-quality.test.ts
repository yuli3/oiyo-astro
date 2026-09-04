import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { compareSymbolicProfiles, HARMONY_INDEX_TABLE } from "./index";
import { COMPATIBILITY_LENSES, type CompatibilityLensId } from "./types";

/**
 * 렌즈 품질 계약 — 새 관점을 받아들일 기준을 기계가 잰다.
 *
 * 왜 있나: "이 관점을 넣을까요"를 취향으로 정하면 근거가 남지 않는다.
 * 2026-09-04 에 기존 넷을 실측해 통과선을 숫자로 잡았고(설계서:
 * company-brain compatibility-lens-extension-2026-09-04), 그 선을 여기에 건다.
 *
 * 재는 것 넷:
 *   ① 독립성   기존 렌즈와 harmonyIndex 상관이 낮은가 — 같은 말을 두 번 하지 않는다
 *   ② 분해능   최빈 관계가 대부분을 먹지 않는가 — 대부분 한 값이면 볼 이유가 없다
 *   ③ 관계 수  실제로 3종 이상 나오는가 — 2종은 예/아니오지 관점이 아니다
 *   ④ 도달성   정의한 관계가 전부 실제로 나오는가
 *
 * ④는 실측하다 찾은 결함에서 나왔다. 음양의 `near-balance` 는 정의·지수·해설
 * 6로케일이 다 있는데 구조적으로 도달 불가였다(60갑자가 양간-양지만 조합해
 * 쌍 거리가 0·4·8·12 만 나오는데 판정은 ≤2 를 봤다). 죽은 관계는 완전성
 * 계약이 해설 24문장을 계속 요구하게 만든다.
 */

const MAX_CORRELATION = 0.2;
const MAX_TOP_SHARE = 0.7;
const MIN_RELATIONS = 3;

/** 1960~2010, 47일 간격. 날짜만 쓰므로 시각 결측과 무관하다. */
function sample() {
  const people = [];
  const start = Date.UTC(1960, 0, 1);
  for (let d = 0; d < 388; d += 1) {
    const t = new Date(start + d * 47 * 86_400_000);
    people.push(comparisonFromCivil({ date: t.toISOString().slice(0, 10) }));
  }
  const relations = {} as Record<CompatibilityLensId, Record<string, number>>;
  const indices = {} as Record<CompatibilityLensId, number[]>;
  for (const l of COMPATIBILITY_LENSES) { relations[l] = {}; indices[l] = []; }
  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      for (const l of compareSymbolicProfiles(people[i], people[j]).lenses) {
        relations[l.id][l.relation] = (relations[l.id][l.relation] ?? 0) + 1;
        indices[l.id].push(l.harmonyIndex);
      }
    }
  }
  const pairs = (people.length * (people.length - 1)) / 2;
  return { indices, pairs, relations };
}

function correlation(a: number[], b: number[]): number {
  const mean = (xs: number[]) => xs.reduce((x, y) => x + y, 0) / xs.length;
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i += 1) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

describe("lens quality contract", () => {
  const { indices, pairs, relations } = sample();

  it("① keeps lenses independent of each other", () => {
    const tooSimilar: string[] = [];
    for (let i = 0; i < COMPATIBILITY_LENSES.length; i += 1) {
      for (let j = i + 1; j < COMPATIBILITY_LENSES.length; j += 1) {
        const a = COMPATIBILITY_LENSES[i], b = COMPATIBILITY_LENSES[j];
        const r = correlation(indices[a], indices[b]);
        if (Math.abs(r) >= MAX_CORRELATION) tooSimilar.push(`${a} ↔ ${b} r=${r.toFixed(3)}`);
      }
    }
    expect(tooSimilar).toEqual([]);
  });

  it("② does not let one relation dominate a lens", () => {
    const lopsided: string[] = [];
    for (const lens of COMPATIBILITY_LENSES) {
      const counts = Object.values(relations[lens]);
      const share = Math.max(...counts) / pairs;
      if (share > MAX_TOP_SHARE) lopsided.push(`${lens} ${(share * 100).toFixed(1)}%`);
    }
    expect(lopsided).toEqual([]);
  });

  it("③ gives every lens at least three relations that actually occur", () => {
    const thin: string[] = [];
    for (const lens of COMPATIBILITY_LENSES) {
      const n = Object.keys(relations[lens]).length;
      if (n < MIN_RELATIONS) thin.push(`${lens} ${n}종`);
    }
    expect(thin).toEqual([]);
  });

  it("④ leaves no relation defined but unreachable", () => {
    const dead: string[] = [];
    for (const lens of COMPATIBILITY_LENSES) {
      for (const relation of Object.keys(HARMONY_INDEX_TABLE[lens])) {
        if (!relations[lens][relation]) dead.push(`${lens}:${relation}`);
      }
    }
    expect(dead).toEqual([]);
  });
});
