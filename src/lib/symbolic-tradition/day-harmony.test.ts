import { describe, expect, it } from "vitest";

import { grade, scores } from "@/lib/fortune/score";
import { comparisonFromCivil } from "./circle-input";
import { dayAnchors, makeFortuneAnchor, type FortuneAxis } from "./day-harmony";

const AXES: FortuneAxis[] = ["overall", "love", "money", "work", "health"];

function people(count: number) {
  const start = Date.UTC(1960, 0, 1);
  const span = Math.round((Date.UTC(2010, 0, 1) - start) / 86_400_000);
  let seed = 8080;
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed;
  };
  return Array.from({ length: count }, () => {
    const date = new Date(start + (next() % span) * 86_400_000).toISOString().slice(0, 10);
    const [y, m, d] = date.split("-").map(Number);
    return { base: `saju-${y}-${m}-${d}`, date, profile: comparisonFromCivil({ date }) };
  });
}

const DAYS = Array.from({ length: 24 }, (_, index) => new Date(Date.UTC(2026, 0, 1 + index * 23)));

function correlation(a: number[], b: number[]): number {
  const mean = (xs: number[]) => xs.reduce((x, y) => x + y, 0) / xs.length;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let index = 0; index < a.length; index += 1) {
    num += (a[index] - ma) * (b[index] - mb);
    da += (a[index] - ma) ** 2;
    db += (b[index] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

describe("운세 점수의 뼈대 — 관계", () => {
  it("앵커는 0~1 이고 같은 입력이면 같다", () => {
    const [person] = people(1);
    const day = comparisonFromCivil({ date: "2026-09-22" });
    const a = dayAnchors(person.profile, day);
    expect(a).toEqual(dayAnchors(person.profile, day));
    for (const axis of AXES) {
      expect(a[axis], axis).toBeGreaterThanOrEqual(0);
      expect(a[axis], axis).toBeLessThanOrEqual(1);
    }
  });

  it("앵커를 넘기지 않으면 점수는 예전과 한 글자도 다르지 않다", () => {
    // 랜딩의 띠·별자리 벽은 생년월일이 없어 앵커 없이 부른다.
    for (const person of people(20)) {
      for (const day of DAYS.slice(0, 4)) {
        expect(scores(person.base, "today", day, undefined)).toEqual(scores(person.base, "today", day));
      }
    }
  });

  it("뼈대가 실제로 점수를 움직인다", () => {
    // 옛 점수는 관계와 상관이 -0.015 였다 — 사주를 반영하지 않았다는 뜻이다.
    // 새 점수가 관계를 따라가지 않으면 이름만 바꾼 것이다.
    const anchorValues: number[] = [];
    const scored: number[] = [];
    for (const person of people(80)) {
      const anchor = makeFortuneAnchor(person.profile);
      for (const day of DAYS) {
        anchorValues.push(anchor("today", day).overall);
        scored.push(scores(person.base, "today", day, anchor).overall);
      }
    }
    expect(correlation(anchorValues, scored)).toBeGreaterThan(0.6);
  });

  it("뼈대를 세워도 네 등급이 모두 나온다", () => {
    const seen = new Set<string>();
    for (const person of people(80)) {
      const anchor = makeFortuneAnchor(person.profile);
      for (const day of DAYS) seen.add(grade(scores(person.base, "today", day, anchor).overall));
    }
    expect([...seen].sort()).toEqual(["careful", "good", "great", "normal"]);
  });

  it("다섯 축이 나란히 움직이지 않는다", () => {
    // 축마다 다른 렌즈를 쓰는 이유다. 같은 렌즈를 쓰면 다섯 막대가 늘 같이
    // 오르내린다.
    const love: number[] = [];
    const money: number[] = [];
    for (const person of people(60)) {
      const anchor = makeFortuneAnchor(person.profile);
      for (const day of DAYS) {
        const a = anchor("today", day);
        love.push(a.love);
        money.push(a.money);
      }
    }
    expect(Math.abs(correlation(love, money))).toBeLessThan(0.8);
  });

  it("주간·월간·연간도 0~1 앵커를 낸다", () => {
    const [person] = people(1);
    const anchor = makeFortuneAnchor(person.profile);
    for (const period of ["weekly", "monthly", "yearly"] as const) {
      const a = anchor(period, new Date(Date.UTC(2026, 8, 22)));
      for (const axis of AXES) {
        expect(a[axis], `${period}/${axis}`).toBeGreaterThanOrEqual(0);
        expect(a[axis], `${period}/${axis}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
