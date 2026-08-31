import { describe, expect, it } from "vitest";
import { getDayStem, getDayBranch } from "./calculator-civil";
import { calculateSaju } from "./logic";
import { STEM_ORDER, BRANCH_ORDER } from "./data";
import { getDailyPillar } from "../../almanac/saju-math";

// Independent day-pillar observations from KASI monthly solar/lunar tables,
// retrieved 2026-08-31. For each YYYY-MM below the reproducible source is:
// https://astro.kasi.re.kr/life/pageView/5?search_year=YYYY&search_month=MM&search_dp=1&search_check=G
// Only the 日/day field is used. Lunar month labels are NOT solar-term month
// pillar reference values. Noon avoids civil/TST midnight convention differences.
const KASI_DAYS = [
  ["1900-01-01", "甲戌"], // 갑술
  ["1900-01-31", "甲辰"], // 갑진
  ["1999-12-30", "丙辰"], // 병진
  ["1999-12-31", "丁巳"], // 정사
  ["2000-01-01", "戊午"], // 무오
  ["2000-01-02", "己未"], // 기미
  ["2023-12-30", "壬戌"], // 임술
  ["2023-12-31", "癸亥"], // 계해
  ["2024-01-01", "甲子"], // 갑자
  ["2024-01-06", "己巳"], // 기사
  ["2024-01-10", "癸酉"], // 계유
  ["2024-01-31", "甲午"], // 갑오
  ["2024-02-01", "乙未"], // 을미
  ["2024-02-03", "丁酉"], // 정유
  ["2024-02-04", "戊戌"], // 무술
  ["2024-02-05", "己亥"], // 기해
  ["2024-02-28", "壬戌"], // 임술
  ["2024-02-29", "癸亥"], // 계해
  ["2024-03-01", "甲子"], // 갑자
  ["2024-03-02", "乙丑"], // 을축
 ] as const;
const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";

describe.each(KASI_DAYS)("KASI day reference %s", (date, expected) => {
  const [year, month, day] = date.split("-").map(Number);

  it("matches the functions used by the public calculator", () => {
    expect(STEMS[getDayStem(year, month, day)] + BRANCHES[getDayBranch(year, month, day)])
      .toBe(expected);
  });

  it("matches the shared solar-time engine at noon KST, 135E", () => {
    const result = calculateSaju(new Date(`${date}T12:00:00+09:00`), false, "male", 135);
    expect(STEMS[STEM_ORDER.indexOf(result.day.heavenlyStem)] +
      BRANCHES[BRANCH_ORDER.indexOf(result.day.earthlyBranch)]).toBe(expected);
  });

  it("matches the local-civil-date almanac at noon", () => {
    const result = getDailyPillar(new Date(year, month - 1, day, 12));
    expect(STEMS[result.ganZhiIndex % 10] + BRANCHES[result.ganZhiIndex % 12])
      .toBe(expected);
  });
});
