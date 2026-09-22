import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { dayMasterLinks, generationFlow, signatureOrbit } from "./group-flow";
import { GROUP_ELEMENT_ORDER, type GroupMember } from "./group-synthesis";
import { compareSymbolicProfiles } from "./index";

const member = (date: string, id: string): GroupMember => ({ id, label: id, profile: comparisonFromCivil({ date }) });
const counts = (o: Partial<Record<string, number>>) =>
  Object.fromEntries(GROUP_ELEMENT_ORDER.map((e) => [e, o[e] ?? 0])) as never;

describe("상생 흐름 (A3)", () => {
  it("받을 기운이 비면 막히고, 오늘 그 기운이 오면 이어진다", () => {
    const c = counts({ wood: 5, fire: 8, earth: 7, metal: 0, water: 4 });
    const plain = generationFlow(c);
    expect(plain.find((e) => e.from === "earth")).toMatchObject({ to: "metal", blocked: true, mended: false });
    expect(plain.filter((e) => e.blocked)).toHaveLength(1);
    const today = generationFlow(c, "metal" as never);
    expect(today.find((e) => e.from === "earth")).toMatchObject({ blocked: false, mended: true });
  });

  it("낳을 것이 없는 고리는 막힌 게 아니라 흐를 것이 없다", () => {
    const c = counts({ wood: 3, fire: 3, earth: 3, metal: 0, water: 3 });
    const fromMetal = generationFlow(c).find((e) => e.from === "metal")!;
    expect(fromMetal).toMatchObject({ strength: 0, blocked: false, mended: false });
  });

  it("세기는 0~1 이고 가장 많은 기운이 1 이다", () => {
    const flow = generationFlow(counts({ wood: 2, fire: 8, earth: 4, metal: 1, water: 1 }));
    expect(Math.max(...flow.map((e) => e.strength))).toBe(1);
    expect(flow.every((e) => e.strength >= 0 && e.strength <= 1)).toBe(true);
  });
});

describe("별자리 선 (A2)", () => {
  it("丁壬은 오행으로는 극이지만 천간합이라 합으로 읽는다", () => {
    // 관계 해석 PRD 의 테스트 쌍: 丁巳일(2007-03-24) · 壬申일(2002-09-01)
    const people = [member("2007-03-24", "a"), member("2002-09-01", "b")];
    expect(people[0].profile.saju.day.heavenlyStem).toBe("JEONG");
    expect(people[1].profile.saju.day.heavenlyStem).toBe("IM");
    expect(dayMasterLinks(people)[0]).toMatchObject({ kind: "combining", from: null });
    const lens = compareSymbolicProfiles(people[0].profile, people[1].profile).lenses.find((l) => l.id === "day-master")!;
    expect(lens.relation).toBe("combining");
  });

  it("관계 이름이 일간 렌즈와 같다", () => {
    const people = ["1990-05-17", "1988-11-02", "1995-02-14", "2001-07-30", "1979-09-09", "1993-03-03"].map((d, i) => member(d, `p${i}`));
    for (const link of dayMasterLinks(people)) {
      const a = people.find((p) => p.id === link.a)!;
      const b = people.find((p) => p.id === link.b)!;
      const lens = compareSymbolicProfiles(a.profile, b.profile).lenses.find((l) => l.id === "day-master")!;
      expect(lens.relation).toBe(link.kind);
      expect(link.kind === "same" || link.kind === "combining" ? link.from === null : [link.a, link.b].includes(link.from!)).toBe(true);
    }
  });
});

describe("궤적 서명 (A5)", () => {
  it("같은 사람은 같은 궤도, 값은 그릴 수 있는 범위", () => {
    const p = comparisonFromCivil({ date: "1990-05-17" });
    expect(signatureOrbit(p)).toEqual(signatureOrbit(comparisonFromCivil({ date: "1990-05-17" })));
    for (let d = 0; d < 400; d += 1) {
      const o = signatureOrbit(comparisonFromCivil({ date: new Date(Date.UTC(1970, 0, 1) + d * 86_400_000 * 37).toISOString().slice(0, 10) }));
      expect(o.radius).toBeGreaterThanOrEqual(0.25);
      expect(o.radius).toBeLessThanOrEqual(0.55);
      expect(o.epicycleRadius).toBeGreaterThanOrEqual(0.12);
      expect(o.epicycleRadius).toBeLessThanOrEqual(0.38);
      // 바깥 끝이 무대(반지름 1)를 넘지 않는다.
      expect(o.radius + o.epicycleRadius).toBeLessThanOrEqual(0.93);
      expect(o.epicycleSpeed).toBeLessThan(0);
      expect(Number.isInteger(o.speed) && Number.isInteger(o.epicycleSpeed)).toBe(true);
    }
  });

  it("사람마다 궤도가 대체로 다르다", () => {
    const seen = new Set<string>();
    const n = 200;
    for (let d = 0; d < n; d += 1) {
      seen.add(JSON.stringify(signatureOrbit(comparisonFromCivil({ date: new Date(Date.UTC(1960, 0, 1) + d * 86_400_000 * 91).toISOString().slice(0, 10) }))));
    }
    expect(seen.size / n).toBeGreaterThan(0.9);
  });
});
