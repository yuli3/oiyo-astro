import { describe, expect, it } from "vitest";

import { jyotishCoordinates, karanaOf, lahiriAyanamsa, nakshatraLord, nakshatraOf, rashiOf, siderealMoon, siderealSun, taraOf, tithiOf, yogaOf } from "./jyotish";

// Drik Panchang, 2024-08-15, 서울(KST) — 2026-09-22 조회
//   티티 Dashami(10) ~13:56 → Ekadashi(11)
//   낙샤트라 Jyeshtha(18) ~16:23 → Mula(19)
//   요가 Vaidhriti(27) ~18:29 → Vishkambha(1)
//   카라나 Garaja ~13:56 → Vanija
//   찬드라 라시 Vrishchika(8) ~16:23 → Dhanu(9), 해 Karka(4)
const kst = (hhmm: string) => new Date(`2024-08-15T${hhmm}:00+09:00`);

describe("라히리 아야남샤", () => {
  it("J2000 에서 약 23°51′", () => {
    expect(lahiriAyanamsa(new Date(Date.UTC(2000, 0, 1, 12)))).toBeCloseTo(23.853, 2);
  });
});

describe("판창 — Drik Panchang 과 대조 (서울 2024-08-15)", () => {
  const at = (hhmm: string) => {
    const d = kst(hhmm);
    const m = siderealMoon(d);
    const s = siderealSun(d);
    return { nak: nakshatraOf(m).nakshatra, rashi: rashiOf(m), sun: rashiOf(s), tithi: tithiOf(m, s), yoga: yogaOf(m, s), karana: karanaOf(m, s) };
  };

  it("정오: Dashami · Jyeshtha · Vaidhriti · Garaja · 달 Vrishchika · 해 Karka", () => {
    expect(at("12:00")).toEqual({ nak: 18, rashi: 8, sun: 4, tithi: 10, yoga: 27, karana: "garaja" });
  });

  it("경계 앞뒤가 맞는다 (각 경계 ±20분)", () => {
    expect(at("13:36").tithi).toBe(10);
    expect(at("14:16").tithi).toBe(11);
    expect(at("14:16").karana).toBe("vanija");
    expect(at("16:03").nak).toBe(18);
    expect(at("16:43").nak).toBe(19);
    expect(at("16:43").rashi).toBe(9);
    expect(at("18:09").yoga).toBe(27);
    expect(at("18:49").yoga).toBe(1);
  });
});

describe("판창 — 두 번째 기준일 (서울 1990-05-17, Drik Panchang)", () => {
  // 티티 크리슈나 삽타미(22) ~16:46 · 낙샤트라 슈라바나(22) ~11:00 → 다니슈타(23)
  // 요가 브라흐마(25) ~익일 00:30 · 카라나 바바 ~16:46 → 발라바 · 달 마카라(10) ~23:24 · 해 브리샤바(2)
  const at = (iso: string) => {
    const d = new Date(iso);
    const m = siderealMoon(d);
    const s = siderealSun(d);
    return { nak: nakshatraOf(m).nakshatra, rashi: rashiOf(m), sun: rashiOf(s), tithi: tithiOf(m, s), yoga: yogaOf(m, s), karana: karanaOf(m, s) };
  };
  it("오전 10시", () => {
    expect(at("1990-05-17T10:00:00+09:00")).toEqual({ nak: 22, rashi: 10, sun: 2, tithi: 22, yoga: 25, karana: "bava" });
  });
  it("경계 앞뒤", () => {
    expect(at("1990-05-17T11:20:00+09:00").nak).toBe(23);
    expect(at("1990-05-17T17:06:00+09:00")).toMatchObject({ tithi: 23, karana: "balava" });
    expect(at("1990-05-17T23:04:00+09:00").rashi).toBe(10);
    expect(at("1990-05-17T23:44:00+09:00").rashi).toBe(11);
    expect(at("1990-05-18T00:50:00+09:00").yoga).toBe(26);
  });
});

describe("표의 성질", () => {
  it("카라나는 한 달 60칸에서 고정 넷·움직이는 일곱(여덟 번)", () => {
    const seen: Record<string, number> = {};
    for (let k = 0; k < 60; k += 1) {
      const id = karanaOf(k * 6 + 3, 0);
      seen[id] = (seen[id] ?? 0) + 1;
    }
    expect(seen.bava).toBe(8);
    expect(seen.vishti).toBe(8);
    expect(seen.kimstughna).toBe(1);
    expect(seen.naga).toBe(1);
  });

  it("낙샤트라 주인은 케투부터 아홉이 세 번 돈다", () => {
    expect(nakshatraLord(1)).toBe("ketu"); // 아슈위니
    expect(nakshatraLord(18)).toBe("mercury"); // 지에슈타
    expect(nakshatraLord(27)).toBe("mercury"); // 레바티
  });
});

describe("출생 좌표", () => {
  it("시각과 도시가 있으면 하나로 정해지고 라그나까지 나온다", () => {
    const c = jyotishCoordinates({ civilDate: "2024-08-15", civilTime: "12:00", utcOffsetMinutes: 540, latitude: 37.5665, longitude: 126.978 });
    expect(c.nakshatra).toEqual([18]);
    expect(c.tithi).toBe(10);
    expect(c.lagna).not.toBeNull();
  });

  it("시각이 없으면 그날 걸친 낙샤트라가 모두 후보이고 티티·라그나는 없다", () => {
    const c = jyotishCoordinates({ civilDate: "2024-08-15", civilTime: null, utcOffsetMinutes: 540, latitude: null, longitude: null });
    expect(c.nakshatra).toEqual([18, 19]); // 16:23 에 바뀐다
    expect(c.tithi).toBeNull();
    expect(c.lagna).toBeNull();
    expect(c.sunRashi).toBe(4);
  });
});

describe("타라", () => {
  it("같은 낙샤트라는 잔마(1), 두 방향은 따로 센다", () => {
    expect(taraOf(18, 18)).toBe(1);
    expect(taraOf(18, 19)).toBe(2);
    expect(taraOf(19, 18)).toBe(9); // 27칸을 돌아 27번째 = 9
    expect(taraOf(1, 10)).toBe(1); // 10번째 = 두 번째 바퀴의 잔마
    expect(taraOf(27, 3)).toBe(4); // 경계를 넘어 네 번째
  });
});
