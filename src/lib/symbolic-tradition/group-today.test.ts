import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { synthesizeGroup, type GroupMember } from "./group-synthesis";
import { dayElementOf, groupToday, type TodayEffect, type TodayStance } from "./group-today";

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

  it("사람마다 오늘과의 관계가 하나씩 붙는다", () => {
    const people = groups(5, 1)[0];
    const today = groupToday(synthesizeGroup(people), people, "2026-09-21");
    expect(today.members.map((item) => item.id)).toEqual(people.map((item) => item.id));
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

  it("다섯 관계가 고르게 나온다", () => {
    const tally = new Map<TodayStance, number>();
    let total = 0;
    for (const people of groups(5, 200)) {
      const synthesis = synthesizeGroup(people);
      for (const day of DAYS) {
        for (const member of groupToday(synthesis, people, day).members) {
          tally.set(member.stance, (tally.get(member.stance) ?? 0) + 1);
          total += 1;
        }
      }
    }
    expect(tally.size).toBe(5);
    for (const [stance, count] of tally) {
      expect(count / total, stance).toBeGreaterThan(0.1);
    }
  });
});
