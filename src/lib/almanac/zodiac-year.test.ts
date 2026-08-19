import { describe, expect, it } from "vitest";
import {
  lichunOf,
  lunarNewYearOf,
  sexagenaryOf,
  zodiacYearOf,
} from "./zodiac-year";

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const ymd = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

describe("간지", () => {
  // 널리 알려진 해로 고정한다. 하나라도 어긋나면 주기 기준점이 틀린 것이다.
  it.each([
    [2020, "경자", "쥐"],
    [2024, "갑진", "용"],
    [1988, "무진", "용"],
    [1990, "경오", "말"],
    [2000, "경진", "용"],
    [1969, "기유", "닭"],
  ])("%i년은 %s년 %s띠", (year, sexagenary, animal) => {
    const r = sexagenaryOf(year);
    expect(r.sexagenary).toBe(sexagenary);
    expect(r.animal).toBe(animal);
  });

  it("60년 주기가 닫힌다", () => {
    for (const y of [1900, 1955, 2003]) {
      expect(sexagenaryOf(y).sexagenary).toBe(sexagenaryOf(y + 60).sexagenary);
    }
  });
});

describe("입춘", () => {
  // 공표된 입춘은 늘 2월 3일 또는 4일이다.
  it.each([1990, 2000, 2020, 2024, 2025, 2026])("%i년 입춘은 2월 3~5일", (y) => {
    const d = lichunOf(y);
    expect(d.getUTCMonth()).toBe(1);
    expect(d.getUTCDate()).toBeGreaterThanOrEqual(3);
    expect(d.getUTCDate()).toBeLessThanOrEqual(5);
  });

  it("2024년 입춘은 2월 4일", () => {
    expect(ymd(lichunOf(2024))).toBe("2024-02-04");
  });
});

describe("음력 설날", () => {
  // 공표값. 하나라도 어긋나면 삭 계산이나 창 선택 규칙이 틀린 것이다.
  it.each([
    [1990, "1990-01-27"],
    [2020, "2020-01-25"],
    [2024, "2024-02-10"],
    [2025, "2025-01-29"],
    [2026, "2026-02-17"],
  ])("%i년 설날은 %s", (year, expected) => {
    expect(ymd(lunarNewYearOf(year))).toBe(expected);
  });

  it("언제나 1월 21일과 2월 20일 사이", () => {
    for (let y = 1950; y <= 2050; y += 1) {
      const d = lunarNewYearOf(y);
      const m = d.getUTCMonth() + 1;
      const day = d.getUTCDate();
      expect(m === 1 ? day >= 21 : m === 2 && day <= 20).toBe(true);
    }
  });
});

describe("세 관례", () => {
  it("2월 21일 이후 출생이면 셋이 일치한다", () => {
    for (const [y, m, d] of [[1990, 3, 1], [2000, 7, 15], [2024, 12, 31]] as const) {
      expect(zodiacYearOf(utc(y, m, d)).agree).toBe(true);
    }
  });

  it("설날과 입춘 사이에 태어나면 갈린다", () => {
    // 2024년: 입춘 2/4, 설날 2/10. 그 사이인 2/7 은 입춘 기준으로는 이미 갑진년,
    // 설날 기준으로는 아직 계묘년이다.
    const r = zodiacYearOf(utc(2024, 2, 7));
    expect(r.agree).toBe(false);
    expect(r.byConvention.solar.sexagenary).toBe("갑진");
    expect(r.byConvention.lichun.sexagenary).toBe("갑진");
    expect(r.byConvention.lunarNewYear.sexagenary).toBe("계묘");
  });

  it("입춘 전 1월생은 양력만 다르다", () => {
    // 2024년 1월 15일: 양력으로는 2024(갑진)지만 입춘·설날 모두 아직 2023(계묘)이다.
    const r = zodiacYearOf(utc(2024, 1, 15));
    expect(r.byConvention.solar.sexagenary).toBe("갑진");
    expect(r.byConvention.lichun.sexagenary).toBe("계묘");
    expect(r.byConvention.lunarNewYear.sexagenary).toBe("계묘");
    expect(r.agree).toBe(false);
  });

  it("설날이 입춘보다 이른 해도 처리한다", () => {
    // 2020년: 설날 1/25 가 입춘 2/4 보다 앞선다. 1/28 은 설날은 지났고 입춘은 안 지났다.
    const r = zodiacYearOf(utc(2020, 1, 28));
    expect(r.byConvention.lunarNewYear.sexagenary).toBe("경자");
    expect(r.byConvention.lichun.sexagenary).toBe("기해");
  });
});
