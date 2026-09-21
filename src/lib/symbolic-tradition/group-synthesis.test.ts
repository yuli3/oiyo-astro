import { describe, expect, it } from "vitest";

import { comparisonFromCivil } from "./circle-input";
import { GROUP_ELEMENT_ORDER, synthesizeGroup, type GroupMember } from "./group-synthesis";

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
