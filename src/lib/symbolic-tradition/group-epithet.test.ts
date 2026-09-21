import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { GROUP_EPITHET, groupEpithet, groupEpithetKey, type GroupEpithetKey } from "./group-epithet";
import { synthesizeGroup, type GroupMember } from "./group-synthesis";

const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"] as const;

function groups(size: number, count: number): GroupMember[][] {
  const start = Date.UTC(1960, 0, 1);
  const span = Math.round((Date.UTC(2010, 0, 1) - start) / 86_400_000);
  let seed = 987654;
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

describe("모임 별명", () => {
  it("여섯 언어가 같은 열한 칸을 모두 갖춘다", () => {
    const keys = Object.keys(GROUP_EPITHET.ko).sort();
    expect(keys).toHaveLength(11);
    for (const locale of LOCALES) {
      expect(Object.keys(GROUP_EPITHET[locale]).sort(), locale).toEqual(keys);
      for (const key of keys) {
        const entry = GROUP_EPITHET[locale][key as GroupEpithetKey];
        expect(entry.title.trim(), `${locale}/${key} title`).toBeTruthy();
        expect(entry.line.trim(), `${locale}/${key} line`).toBeTruthy();
      }
    }
  });

  it("한 언어 안에서 별명이 겹치지 않는다", () => {
    for (const locale of LOCALES) {
      const titles = Object.values(GROUP_EPITHET[locale]).map((entry) => entry.title);
      expect(new Set(titles).size, locale).toBe(titles.length);
    }
  });

  it("열한 칸이 전부 실제로 나온다", () => {
    // 나오지 않는 칸은 죽은 문구다. 여섯 언어 66개 문장을 계속 요구하게 된다.
    const seen = new Set<GroupEpithetKey>();
    for (const size of [2, 3, 4, 5, 6, 8]) {
      for (const people of groups(size, 500)) seen.add(groupEpithetKey(synthesizeGroup(people)));
    }
    expect([...seen].sort()).toEqual(Object.keys(GROUP_EPITHET.ko).sort());
  });

  it("한 별명이 모임의 대부분을 먹지 않는다", () => {
    // 모두에게 같은 이름을 붙이면 이름이 아니다.
    const tally = new Map<GroupEpithetKey, number>();
    let total = 0;
    for (const size of [2, 3, 4, 5, 6, 8]) {
      for (const people of groups(size, 500)) {
        const key = groupEpithetKey(synthesizeGroup(people));
        tally.set(key, (tally.get(key) ?? 0) + 1);
        total += 1;
      }
    }
    const top = Math.max(...tally.values()) / total;
    expect(top, [...tally].map(([k, v]) => `${k} ${(v / total * 100).toFixed(1)}`).join(" · ")).toBeLessThan(0.3);
  });

  it("같은 모임은 언제나 같은 별명이다", () => {
    const people = groups(4, 1)[0];
    const synthesis = synthesizeGroup(people);
    expect(groupEpithet(synthesis, "ko")).toEqual(groupEpithet(synthesis, "ko"));
  });

  it("모르는 로케일은 영어로 떨어진다", () => {
    const synthesis = synthesizeGroup(groups(3, 1)[0]);
    expect(groupEpithet(synthesis, "de")).toEqual(groupEpithet(synthesis, "en"));
  });
});
