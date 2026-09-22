import { describe, expect, it } from "vitest";

import { birthdayNumberOf, lifePathOf, personalYearOf, reduceNumber } from "./numerology";

describe("수비학 — 생년월일 수", () => {
  it("생명수: 1990-05-17 → 5+8+1 = 14 → 5", () => {
    expect(lifePathOf("1990-05-17")).toBe(5);
  });

  it("마스터 수를 남긴다: 1992-11-29 → 11 + 11 + 21→3 … ", () => {
    // 월 11(마스터), 일 29→11(마스터), 연 1992→21→3 → 11+11+3 = 25 → 7
    expect(lifePathOf("1992-11-29")).toBe(7);
    expect(reduceNumber(29)).toBe(11);
    expect(reduceNumber(38)).toBe(11);
    expect(reduceNumber(38, false)).toBe(2);
  });

  it("시간대와 무관하다 — 달력 문자열에서 바로 셈한다", () => {
    const prev = process.env.TZ;
    for (const tz of ["America/New_York", "Pacific/Honolulu", "Asia/Seoul", "Pacific/Kiritimati"]) {
      process.env.TZ = tz;
      expect(lifePathOf("1990-05-17"), tz).toBe(5);
    }
    process.env.TZ = prev;
  });

  it("생일수와 개인년", () => {
    expect(birthdayNumberOf("1990-05-17")).toBe(8);
    expect(birthdayNumberOf("1990-05-22")).toBe(22);
    // 개인년 2026: 5 + 8 + (2026→10→1) = 14 → 5
    expect(personalYearOf("1990-05-17", "2026-09-22")).toBe(5);
  });
});
