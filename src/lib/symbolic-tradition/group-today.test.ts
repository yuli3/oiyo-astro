import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { synthesizeGroup, type GroupMember } from "./group-synthesis";
import { COMPATIBILITY_LENSES } from "./types";
import { compareSymbolicProfiles } from "./index";
import { comparisonFromCivil as dayProfile } from "./circle-input";
import { TODAY_RELATION_RARITY, dayElementOf, groupToday, pickHighlight, profileOfDay, seasonStrengthOf, stanceOf, type TodayEffect } from "./group-today";
import { FiveElement } from "../ontology/saju/types";
import type { GroupSynthesis } from "./group-synthesis";

function groups(size: number, count: number): GroupMember[][] {
  const start = Date.UTC(1960, 0, 1);
  const span = Math.round((Date.UTC(2010, 0, 1) - start) / 86_400_000);
  let seed = 555111;
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed;
  };
  return Array.from({ length: count }, () =>
    Array.from({ length: size }, (_, index) => ({
      id: `p${index}`,
      label: `P${index}`,
      profile: comparisonFromCivil({
        date: new Date(start + (next() % span) * 86_400_000).toISOString().slice(0, 10),
      }),
    })),
  );
}

const DAYS = Array.from({ length: 60 }, (_, index) =>
  new Date(Date.UTC(2026, 0, 1) + index * 11 * 86_400_000).toISOString().slice(0, 10),
);

describe("오늘의 우리", () => {
  it("같은 날 같은 모임이면 누가 열어도 같다", () => {
    const people = groups(4, 1)[0];
    const synthesis = synthesizeGroup(people);
    expect(groupToday(synthesis, people, "2026-09-21")).toEqual(
      groupToday(synthesis, people, "2026-09-21"),
    );
  });

  it("날이 바뀌면 일간의 기운도 돈다", () => {
    // 하루씩 가면 열흘 안에 다섯 기운이 모두 나온다(천간은 열 개 주기다).
    const seen = new Set(
      Array.from({ length: 10 }, (_, index) =>
        dayElementOf(new Date(Date.UTC(2026, 8, 1) + index * 86_400_000).toISOString().slice(0, 10)),
      ),
    );
    expect(seen.size).toBe(5);
  });

  it("시간대가 달라도 같은 날짜는 같은 기운이다", () => {
    const original = process.env.TZ;
    try {
      const zones = ["UTC", "America/New_York", "Asia/Seoul", "Pacific/Kiritimati"];
      const seen = zones.map((tz) => {
        process.env.TZ = tz;
        return dayElementOf("2026-09-21");
      });
      expect(new Set(seen).size, seen.join(" ")).toBe(1);
    } finally {
      process.env.TZ = original;
    }
  });

  it("오늘도 참가자다 — 사람마다 아홉 관점이 다 나온다", () => {
    // 전용 코드로 오행 하나만 견주던 것을 렌즈 위로 옮긴 결과다. 지지 합·충도
    // 마야·켈트도 따로 짤 필요 없이 따라온다.
    const people = groups(5, 1)[0];
    const today = groupToday(synthesizeGroup(people), people, "2026-09-21");
    expect(today.members.map((item) => item.id)).toEqual(people.map((item) => item.id));
    for (const member of today.members) {
      expect(member.lenses.map((lens) => lens.id).sort(), member.id).toEqual([...COMPATIBILITY_LENSES].sort());
      expect(member.lenses).toContainEqual(member.highlight);
    }
  });

  it("오늘의 좌표는 사람의 좌표와 같은 형식이다", () => {
    const day = profileOfDay("2026-09-21");
    const person = groups(2, 1)[0][0].profile;
    expect(Object.keys(day).sort()).toEqual(Object.keys(person).sort());
  });

  it("두드러진 관점은 가장 드문 관계다", () => {
    // 값의 크기나 폭으로 고르면 안 된다. 폭으로 정규화해 골랐더니 오행 렌즈가
    // 하이라이트의 77.9% 를 먹었다 — 관계가 셋뿐이고 둘이 양 극단이라서다.
    const common = { harmonyIndex: 85, id: "five-elements" as const, relation: "generating-cycle" };
    const rare = { harmonyIndex: 32, id: "branch-harmony" as const, relation: "clash-rich" };
    expect(pickHighlight([common, rare]).id).toBe("branch-harmony");
  });

  it("희귀도 표가 실제 분포와 맞다", () => {
    // 표는 40,000쌍 실측이다. 엔진이 바뀌면 여기서 어긋난다.
    const bStart = Date.UTC(1960, 0, 1);
    const bSpan = Math.round((Date.UTC(2010, 0, 1) - bStart) / 86_400_000);
    const dStart = Date.UTC(2024, 0, 1);
    let seed = 271828;
    const next = () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed;
    };
    const tally: Record<string, Record<string, number>> = {};
    const runs = 12000;
    for (let index = 0; index < runs; index += 1) {
      const person = dayProfile({ date: new Date(bStart + (next() % bSpan) * 86_400_000).toISOString().slice(0, 10) });
      const day = dayProfile({ date: new Date(dStart + (next() % 1200) * 86_400_000).toISOString().slice(0, 10) });
      for (const lens of compareSymbolicProfiles(person, day).lenses) {
        (tally[lens.id] ??= {})[lens.relation] = ((tally[lens.id] ??= {})[lens.relation] ?? 0) + 1;
      }
    }
    for (const [id, relations] of Object.entries(TODAY_RELATION_RARITY)) {
      for (const [relation, expected] of Object.entries(relations)) {
        const actual = (tally[id]?.[relation] ?? 0) / runs;
        expect(Math.abs(actual - expected), `${id}:${relation} 표 ${expected} 실측 ${actual.toFixed(4)}`).toBeLessThan(0.03);
      }
      // 표에 없는 관계가 생기면 하이라이트 선택이 그것만 뽑게 된다.
      for (const relation of Object.keys(tally[id] ?? {})) {
        expect(relations[relation], `${id}:${relation} 가 표에 없다`).toBeDefined();
      }
    }
  });

  it("다섯 작용이 전부 나오고 한 칸이 대부분을 먹지 않는다", () => {
    // 처음에는 "몰렸다·얇다"로 판정된 원소만 봤다가 73.9% 가 neutral 이 됐다.
    // 대부분의 날에 "별 작용 없음"이라고 말하는 카드는 볼 이유가 없다.
    const tally = new Map<TodayEffect, number>();
    let total = 0;
    for (const size of [2, 3, 5, 8]) {
      for (const people of groups(size, 120)) {
        const synthesis = synthesizeGroup(people);
        for (const day of DAYS) {
          const effect = groupToday(synthesis, people, day).effect;
          tally.set(effect, (tally.get(effect) ?? 0) + 1);
          total += 1;
        }
      }
    }
    expect(tally.size, [...tally.keys()].join(" ")).toBe(5);
    const top = Math.max(...tally.values()) / total;
    expect(top, [...tally].map(([k, v]) => `${k} ${(v / total * 100).toFixed(1)}`).join(" · ")).toBeLessThan(0.45);
  });

  it("두드러진 관점이 한 렌즈에 쏠리지 않는다", () => {
    // 늘 같은 렌즈만 뽑히면 아홉을 계산할 이유가 없다.
    const tally = new Map<string, number>();
    let total = 0;
    for (const people of groups(5, 150)) {
      const synthesis = synthesizeGroup(people);
      for (const day of DAYS) {
        for (const member of groupToday(synthesis, people, day).members) {
          tally.set(member.highlight.id, (tally.get(member.highlight.id) ?? 0) + 1);
          total += 1;
        }
      }
    }
    const top = Math.max(...tally.values()) / total;
    expect(top, [...tally].map(([k, v]) => `${k} ${(v / total * 100).toFixed(1)}`).join(" · ")).toBeLessThan(0.5);
    expect(tally.size).toBeGreaterThanOrEqual(5);
  });


  it("동점인 두 원소는 둘 다 센 쪽이다 — 배열 순서가 정하지 않는다", () => {
    // 1·2위가 사실상 동점인 모임이 2인 31%, 5인 20% 였다. 예전에는 원소 배열
    // 순서가 그중 하나를 "가장 센 기운"으로 골랐다.
    const people = groups(3, 1)[0];
    const base = synthesizeGroup(people);
    const tied = {
      ...base,
      elements: {
        ...base.elements,
        deviation: { wood: 2, fire: 2.1, earth: -1, metal: -0.2, water: 0 } as Record<FiveElement, number>,
      },
    } as GroupSynthesis;
    // 목·화가 동점 1위다. 목 날이든 화 날이든 "센 쪽에 얹힌다"여야 한다.
    const days = Array.from({ length: 20 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));
    for (const day of days) {
      const today = groupToday(tied, people, day);
      if (today.element === FiveElement.WOOD || today.element === FiveElement.FIRE) {
        expect(today.effect, `${day} ${today.element}`).toBe("doubles-down");
      }
    }
  });

  it("셋 이상이 엉켜 있으면 센 쪽이라 부르지 않는다", () => {
    const people = groups(3, 1)[0];
    const base = synthesizeGroup(people);
    const flat = {
      ...base,
      elements: { ...base.elements, deviation: { wood: 0.1, fire: 0.05, earth: 0, metal: 0.12, water: -2 } as Record<FiveElement, number> },
    } as GroupSynthesis;
    const days = Array.from({ length: 20 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));
    for (const day of days) {
      const today = groupToday(flat, people, day);
      expect(["doubles-down", "eases-peak", "feeds-peak"], `${day}`).not.toContain(today.effect);
    }
  });

  it("십성 다섯 무리를 일간 대 일간으로 가른다", () => {
    expect(stanceOf(FiveElement.WOOD, FiveElement.WOOD)).toBe("peer");
    expect(stanceOf(FiveElement.WATER, FiveElement.WOOD)).toBe("support"); // 수생목
    expect(stanceOf(FiveElement.FIRE, FiveElement.WOOD)).toBe("output"); // 목생화
    expect(stanceOf(FiveElement.METAL, FiveElement.WOOD)).toBe("pressure"); // 금극목
    expect(stanceOf(FiveElement.EARTH, FiveElement.WOOD)).toBe("wealth"); // 목극토
  });

  it("사람의 관계는 그 사람의 일간에서 나온다", () => {
    const people = groups(4, 1)[0];
    const today = groupToday(synthesizeGroup(people), people, "2026-09-22");
    for (const member of today.members) {
      expect(member.stance).toBe(stanceOf(today.element, member.dayMaster));
    }
  });

  it("왕상휴수사를 계절 오행으로 가른다", () => {
    // 봄(목)에 목은 旺, 화는 相, 수는 休, 금은 囚, 토는 死.
    expect(seasonStrengthOf(FiveElement.WOOD, FiveElement.WOOD)).toBe("prosperous");
    expect(seasonStrengthOf(FiveElement.FIRE, FiveElement.WOOD)).toBe("rising");
    expect(seasonStrengthOf(FiveElement.WATER, FiveElement.WOOD)).toBe("resting");
    expect(seasonStrengthOf(FiveElement.METAL, FiveElement.WOOD)).toBe("confined");
    expect(seasonStrengthOf(FiveElement.EARTH, FiveElement.WOOD)).toBe("dead");
  });

  it("계절은 절기로 바뀐다 — 입춘 앞뒤로 월지가 넘어간다", () => {
    // 2026 입춘은 2월 4일 무렵. 1월 말은 丑월(토), 2월 중순은 寅월(목)이다.
    const winter = groupToday(synthesizeGroup(groups(2, 1)[0]), groups(2, 1)[0], "2026-01-25").season.element;
    const spring = groupToday(synthesizeGroup(groups(2, 1)[0]), groups(2, 1)[0], "2026-02-15").season.element;
    expect(winter).toBe(FiveElement.EARTH);
    expect(spring).toBe(FiveElement.WOOD);
  });
});
