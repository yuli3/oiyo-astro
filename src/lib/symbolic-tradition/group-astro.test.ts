import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import {
  astroAgreement,
  groupAstro,
  SUN_ASPECT_CHANCE,
  SUN_ELEMENT_BASE_RATE,
  SUN_MODALITY_BASE_RATE,
  sunAspectOf,
  type SunAspectKind,
} from "./group-astro";
import { synthesizeGroup, type GroupMember } from "./group-synthesis";
import { compareSymbolicProfiles } from "./index";

/** 흩뿌린 모임. 격자를 쓰지 않는 이유는 lens-quality 와 같다. */
function groups(size: number, count: number, seed0 = 90210): GroupMember[][] {
  const start = Date.UTC(1960, 0, 1);
  const span = Math.round((Date.UTC(2010, 0, 1) - start) / 86_400_000);
  let seed = seed0;
  const next = () => (seed = (seed * 1103515245 + 12345) >>> 0);
  return Array.from({ length: count }, () =>
    Array.from({ length: size }, (_, i) => ({
      id: `p${i}`,
      label: `P${i}`,
      profile: comparisonFromCivil({ date: new Date(start + (next() % span) * 86_400_000).toISOString().slice(0, 10) }, { astro: true }),
    })));
}

const at = (date: string, id: string): GroupMember => ({ id, label: id, profile: comparisonFromCivil({ date }, { astro: true }) });

describe("별자리 층 — 기저 비율", () => {
  it("원소·양태 기저 비율 표가 실제와 맞다", () => {
    const el: Record<string, number> = {};
    const mod: Record<string, number> = {};
    const days = 21915; // 1950~2010
    for (let d = 0; d < days; d += 1) {
      const p = comparisonFromCivil({ date: new Date(Date.UTC(1950, 0, 1) + d * 86_400_000).toISOString().slice(0, 10) });
      el[p.sunSign.element] = (el[p.sunSign.element] ?? 0) + 1;
      mod[p.sunSign.modality] = (mod[p.sunSign.modality] ?? 0) + 1;
    }
    for (const [k, v] of Object.entries(SUN_ELEMENT_BASE_RATE)) expect(Math.abs(el[k] / days - v), k).toBeLessThan(0.02);
    for (const [k, v] of Object.entries(SUN_MODALITY_BASE_RATE)) expect(Math.abs(mod[k] / days - v), k).toBeLessThan(0.02);
  });

  it("태양끼리 각이 설 확률 표가 실제와 맞다", () => {
    const tally: Record<string, number> = {};
    let pairs = 0;
    for (const people of groups(2, 6000, 4242)) {
      pairs += 1;
      const hit = sunAspectOf(people[0].profile.astro!.sun, people[1].profile.astro!.sun);
      if (hit) tally[hit.kind] = (tally[hit.kind] ?? 0) + 1;
    }
    for (const [kind, p] of Object.entries(SUN_ASPECT_CHANCE)) {
      expect(Math.abs((tally[kind] ?? 0) / pairs - p), `${kind}`).toBeLessThan(0.015);
    }
  });
});

describe("별자리 층 — 판정이 흔해지지 않는가", () => {
  it("원소가 몰렸다는 말은 어느 인원에서도 드물다", () => {
    for (const size of [3, 4, 5, 6, 8, 10]) {
      const all = groups(size, 300);
      const n = all.filter((people) => groupAstro(people).concentratedElement).length;
      // 네 원소 중 가장 많은 하나를 보므로 칸 하나의 5%보다 커진다(실측 6~14%).
      // 오행 밖 태그(15~36%)보다 낮게 유지한다.
      expect(n / all.length, `n=${size}`).toBeLessThan(0.2);
    }
  });

  it("각이 조화·긴장으로 기울었다는 말도 드물다", () => {
    for (const size of [3, 5, 8]) {
      const all = groups(size, 300);
      const n = all.filter((people) => groupAstro(people).aspectLean).length;
      expect(n / all.length, `n=${size}`).toBeLessThan(0.15);
    }
  });

  it("다섯 중 셋이 같은 원소일 우연 확률을 정직하게 센다 (≈10.4%)", () => {
    const people = [at("1990-04-05", "a"), at("1990-08-05", "b"), at("1990-12-05", "c"), at("1990-05-05", "d"), at("1990-07-05", "e")];
    const astro = groupAstro(people);
    expect(astro.topElement).toMatchObject({ element: "fire", count: 3 });
    expect(astro.topElement.chance).toBeCloseTo(0.1035, 3);
    expect(astro.concentratedElement).toBeNull();
  });
});

describe("별자리 층 — 각과 도형", () => {
  it("대삼각은 세 쌍이 모두 삼각일 때만", () => {
    for (const people of groups(5, 300)) {
      const astro = groupAstro(people);
      for (const pattern of astro.patterns.filter((p) => p.kind === "grand-trine")) {
        const [x, y, z] = pattern.ids;
        for (const [a, b] of [[x, y], [y, z], [x, z]]) {
          expect(astro.aspects.find((s) => (s.a === a && s.b === b) || (s.a === b && s.b === a))?.kind).toBe("trine");
        }
      }
    }
  });

  it("별자리 좌표가 없는 옛 참가자는 각에서만 빠진다", () => {
    const people = groups(4, 1)[0];
    const old = { ...people[0], profile: { ...people[0].profile, astro: undefined } };
    const astro = groupAstro([old, ...people.slice(1)]);
    expect(astro.aspectPairs).toBe(3);
    expect(astro.aspects.every((s) => s.a !== old.id && s.b !== old.id)).toBe(true);
    expect(astro.triads[0]).toMatchObject({ sunLongitude: null, moon: [], ascendant: null });
    expect(astro.grid.flatMap((c) => c.ids)).toContain(old.id);
  });

  it("각은 태양궁 렌즈와 많이 겹친다 — 그래서 열 번째 관점이 아니라 그림으로만 쓴다", () => {
    // 2026-09-22 실측: 삼각의 95%가 같은 원소, 사각의 75%가 같은 양태, 합의
    // 77%가 같은 궁이었다. 관점으로 더하면 같은 말을 두 번 하게 된다.
    // 이 겹침이 줄어드는 날(예: 태양 말고 다른 천체를 쓰게 되면) 다시 재자.
    const same: Record<SunAspectKind, [number, number]> = { conjunction: [0, 0], sextile: [0, 0], square: [0, 0], trine: [0, 0], opposition: [0, 0] };
    for (const [a, b] of groups(2, 6000, 777)) {
      const hit = sunAspectOf(a.profile.astro!.sun, b.profile.astro!.sun);
      if (!hit) continue;
      const rel = compareSymbolicProfiles(a.profile, b.profile).lenses.find((l) => l.id === "sun-sign")!.relation;
      const expected = { conjunction: "same-sign", trine: "same-element", square: "same-modality", opposition: "same-modality", sextile: "distinct" }[hit.kind];
      same[hit.kind][0] += rel === expected ? 1 : 0;
      same[hit.kind][1] += 1;
    }
    expect(same.trine[0] / same.trine[1]).toBeGreaterThan(0.85);
  });
});

describe("별자리 층 — 두 체계가 같은 말을 할 때 (B4)", () => {
  it("일치는 불·흙·물에서, 두 체계가 모두 몰렸다고 할 때만 선다", () => {
    let seen = 0;
    for (const people of groups(6, 800, 31337)) {
      const astro = groupAstro(people);
      const synth = synthesizeGroup(people);
      const agree = astroAgreement(synth, astro);
      if (!agree) continue;
      seen += 1;
      expect(["fire", "earth", "water"]).toContain(agree);
      expect(astro.concentratedElement).toBe(agree);
      expect(synth.elements.abundant).toContain(agree);
    }
    // 드물어야 한다 — 두 번 드문 일이 겹친 경우다.
    expect(seen / 800).toBeLessThan(0.05);
  });
});
