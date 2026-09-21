import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { CATEGORY_BASE_RATE, GROUP_ELEMENT_ORDER, synthesizeGroup, type GroupMember } from "./group-synthesis";
import { CELTIC_SEASON, TRINE_GROUPS } from "./index";

/** 1960~2010 에 흩뿌린 모임을 만든다. 격자를 쓰지 않는 이유는 lens-quality 와 같다. */
function groups(size: number, count: number): GroupMember[][] {
  const start = Date.UTC(1960, 0, 1);
  const span = Math.round((Date.UTC(2010, 0, 1) - start) / 86_400_000);
  let seed = 424242;
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

const member = (date: string, id: string): GroupMember => ({
  id,
  label: id,
  profile: comparisonFromCivil({ date }),
});

describe("모임 종합 — 셈이 맞는가", () => {
  it("같은 모임이면 같은 결과다", () => {
    const people = [member("2002-09-01", "a"), member("1988-07-15", "b")];
    expect(synthesizeGroup(people)).toEqual(synthesizeGroup(people));
  });

  it("모임의 오행은 구성원 것을 그대로 합한 값이다", () => {
    const people = [member("2002-09-01", "a"), member("1988-07-15", "b"), member("2007-03-24", "c")];
    const result = synthesizeGroup(people);
    for (const element of GROUP_ELEMENT_ORDER) {
      const summed = people.reduce((n, p) => n + p.profile.fiveElements.counts[element], 0);
      expect(result.elements.counts[element], element).toBe(summed);
    }
    expect(result.memberCount).toBe(3);
  });

  it("없는 기운은 정말 아무도 갖지 않은 것이다", () => {
    for (const people of groups(3, 80)) {
      const result = synthesizeGroup(people);
      for (const element of result.elements.missing) {
        for (const person of people) {
          expect(person.profile.fiveElements.counts[element], element).toBe(0);
        }
      }
      // 없는 것과 얇은 것은 겹치지 않는다 — 채울 사람이 있느냐가 다르다.
      expect(result.elements.scarce.filter((e) => result.elements.missing.includes(e))).toEqual([]);
    }
  });

  it("혼자 가진 기운은 정말 그 사람만 갖고 있다", () => {
    for (const people of groups(4, 80)) {
      const result = synthesizeGroup(people);
      for (const contribution of result.contributions) {
        for (const element of contribution.sole) {
          const holders = people.filter((p) => p.profile.fiveElements.counts[element] > 0);
          expect(holders.map((p) => p.id), element).toEqual([contribution.id]);
        }
      }
    }
  });

  it("채우는 기운은 모임이 얇거나 비어 있는 자리뿐이다", () => {
    for (const people of groups(5, 60)) {
      const result = synthesizeGroup(people);
      const thin = new Set([...result.elements.scarce, ...result.elements.missing]);
      for (const contribution of result.contributions) {
        for (const element of contribution.supplies) {
          expect(thin.has(element), element).toBe(true);
          const mine = people.find((p) => p.id === contribution.id)!;
          expect(mine.profile.fiveElements.counts[element]).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("모임 종합 — 판정이 흔해지지 않는가", () => {
  // 처음에는 몫의 고정 비율(20%의 1.4배·0.6배)로 갈랐다. 그러자 2인 모임의
  // 83%가 "쏠렸다", 84%가 "이 기운이 몰렸다"가 됐다. 거의 모두에게 같은 말을
  // 하는 판정은 관찰이 아니다. 우연이 만들어 낼 흔들림을 기준으로 바꿨고,
  // 그 효과를 여기서 잠근다.

  it("어떤 인원에서도 쏠림 판정 한 칸이 대부분을 먹지 않는다", () => {
    for (const size of [2, 3, 5, 8]) {
      const tally: Record<string, number> = { even: 0, leaning: 0, skewed: 0 };
      const all = groups(size, 400);
      for (const people of all) tally[synthesizeGroup(people).spread] += 1;
      const top = Math.max(...Object.values(tally)) / all.length;
      expect(top, `n=${size} ${JSON.stringify(tally)}`).toBeLessThan(0.7);
      // 셋 다 실제로 나와야 한다. 안 나오는 칸은 죽은 판정이다.
      for (const [key, n] of Object.entries(tally)) {
        expect(n, `n=${size} ${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("사람이 늘수록 빈 기운은 드물어진다", () => {
    // 좌표가 많아지면 다섯 기운이 다 채워지는 것이 자연스럽다. 이 추세가
    // 뒤집히면 셈이 잘못된 것이다.
    const rate = (size: number) => {
      const all = groups(size, 400);
      return all.filter((people) => synthesizeGroup(people).elements.missing.length > 0).length / all.length;
    };
    const two = rate(2);
    const five = rate(5);
    expect(two).toBeGreaterThan(five);
    expect(five).toBeLessThan(0.1);
  });

  it("2인 모임을 늘 쏠렸다고 말하지 않는다", () => {
    const all = groups(2, 400);
    const skewed = all.filter((people) => synthesizeGroup(people).spread === "skewed").length;
    expect(skewed / all.length).toBeLessThan(0.3);
  });
});

describe("모임 종합 — 오행 밖의 체계", () => {
  it("체계별 기저 비율 표가 실제와 맞다", () => {
    const start = Date.UTC(1950, 0, 1);
    const tally = { mayanColor: {} as Record<string, number>, zodiacTrine: {} as Record<string, number>, celticSeason: {} as Record<string, number> };
    const days = 4383; // 12년 — 삼합이 네 무리를 고르게 돈다
    for (let d = 0; d < days; d += 1) {
      const p = comparisonFromCivil({ date: new Date(start + d * 86_400_000).toISOString().slice(0, 10) });
      const trine = String(TRINE_GROUPS.findIndex((g) => g.includes(p.chineseZodiac.branch)));
      const season = String(CELTIC_SEASON[p.celticTree.id] ?? 0);
      tally.mayanColor[p.mayanKin.color] = (tally.mayanColor[p.mayanKin.color] ?? 0) + 1;
      tally.zodiacTrine[trine] = (tally.zodiacTrine[trine] ?? 0) + 1;
      tally.celticSeason[season] = (tally.celticSeason[season] ?? 0) + 1;
    }
    for (const [system, rates] of Object.entries(CATEGORY_BASE_RATE)) {
      for (const [category, expected] of Object.entries(rates)) {
        const actual = (tally[system as keyof typeof tally][category] ?? 0) / days;
        expect(Math.abs(actual - expected), `${system}:${category} 표 ${expected} 실측 ${actual.toFixed(3)}`).toBeLessThan(0.02);
      }
    }
  });

  it("2인에게는 태그를 세우지 않고 따로 말한다", () => {
    for (const people of groups(2, 200)) {
      const result = synthesizeGroup(people);
      expect(result.tags).toEqual([]);
      expect(result.pair).not.toBeNull();
    }
    for (const people of groups(3, 20)) expect(synthesizeGroup(people).pair).toBeNull();
  });

  it("2인 보기는 다섯 기운을 겹치지 않게 나눈다", () => {
    for (const people of groups(2, 100)) {
      const pair = synthesizeGroup(people).pair!;
      const all = [...pair.shared, ...pair.neither, ...Object.values(pair.only).flat()];
      expect(all.sort()).toEqual([...GROUP_ELEMENT_ORDER].sort());
      // 둘 다 없는 기운은 모임의 없는 기운과 같다.
      expect(pair.neither.sort()).toEqual(synthesizeGroup(people).elements.missing.sort());
    }
  });

  it("태그는 어느 인원에서도 드물다", () => {
    // 처음 문턱(몫 60%·셋 이상)에서는 5인 모임의 80% 에 태그가 붙었다.
    for (const size of [3, 4, 5, 6, 8, 10]) {
      const all = groups(size, 300);
      const tagged = all.filter((people) => synthesizeGroup(people).tags.length > 0).length;
      expect(tagged / all.length, `n=${size}`).toBeLessThan(0.45);
    }
  });

  it("혼자 다른 사람은 모두가 몰린 체계에서 한 명만 바깥일 때다", () => {
    for (const size of [4, 5, 6]) {
      for (const people of groups(size, 200)) {
        const result = synthesizeGroup(people);
        for (const contribution of result.contributions) {
          for (const d of contribution.distinctions) {
            const tag = result.tags.find((t) => t.system === d.system);
            expect(tag, `${d.system} 태그가 있어야 한다`).toBeDefined();
            expect(tag!.count).toBe(size - 1);
            expect(tag!.category).not.toBe(d.category);
          }
        }
      }
    }
  });

  it("음양이 뚜렷하다는 말은 드물다", () => {
    for (const size of [2, 3, 5, 8]) {
      const all = groups(size, 300);
      const n = all.filter((people) => synthesizeGroup(people).polarity.pronounced).length;
      expect(n / all.length, `n=${size}`).toBeLessThan(0.3);
    }
  });
});

