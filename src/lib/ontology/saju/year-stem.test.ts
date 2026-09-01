// 연간 해석 계약. 입춘 경계가 적용되는 경로와 안 되는 경로를 구분한다.
import { describe, expect, it } from "vitest";
import { resolveYearStem, yearStemFromCalendarYear } from "./year-stem";
import { getSolarYearPillar } from "./calculator-solar";

describe("연간 해석", () => {
  it("연도만 알면 역법 기준이다 — 입춘 경계가 적용되지 않는다", () => {
    const r = resolveYearStem(2000, null);
    expect(r.solarAccurate).toBe(false);
    expect(r.stemIdx).toBe(yearStemFromCalendarYear(2000));
  });

  it("생년월일이 있으면 절기 기준으로 정확해진다", () => {
    // 2000 입춘은 2/4 21:40 KST(KASI 골든). 1/15 출생은 아직 1999년 간지다.
    const before = resolveYearStem(2000, { year: 2000, month: 1, day: 15, hour: 12 });
    expect(before.solarAccurate).toBe(true);
    expect(before.stemIdx).toBe(getSolarYearPillar(2000, 1, 15, 12).stem);
    // 역법 기준과 실제로 달라야 이 분기가 의미가 있다.
    expect(before.stemIdx).not.toBe(yearStemFromCalendarYear(2000));
  });

  it("입춘 이후 출생은 역법 기준과 같다", () => {
    const after = resolveYearStem(2000, { year: 2000, month: 6, day: 15, hour: 12 });
    expect(after.solarAccurate).toBe(true);
    expect(after.stemIdx).toBe(yearStemFromCalendarYear(2000));
  });

  it("select 로 고른 해와 프로필 연도가 다르면 select 를 존중한다", () => {
    // 화면에서 1990 을 골랐는데 프로필이 2000 이면, 1990 을 써야 한다.
    const r = resolveYearStem(1990, { year: 2000, month: 1, day: 15, hour: 12 });
    expect(r.solarAccurate).toBe(false);
    expect(r.stemIdx).toBe(yearStemFromCalendarYear(1990));
  });

  it("시각을 몰라도 동작한다", () => {
    const r = resolveYearStem(2000, { year: 2000, month: 3, day: 1, hour: null });
    expect(r.solarAccurate).toBe(true);
  });
});
