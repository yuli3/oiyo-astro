import { describe, expect, it } from "vitest";

import { getSexagenaryCycle } from "../calendar-systems/sexagenary";
import { calculateZiWeiCoordinates } from "./calculator";

describe("간지 순환 순서", () => {
  it("2024년 입춘 뒤는 甲辰, 입춘 전은 癸卯 — 있을 수 없는 조합(辛子)이 나오지 않는다", () => {
    expect(getSexagenaryCycle(new Date(Date.UTC(2024, 1, 6, 3))).year).toEqual({ heavenlyStem: "GAP", earthlyBranch: "JIN" });
    expect(getSexagenaryCycle(new Date(Date.UTC(2024, 1, 3, 3))).year).toEqual({ heavenlyStem: "GYE", earthlyBranch: "MYO" });
  });
});

describe("자미두수 명반 — 공개 예시와 대조", () => {
  // 163.com 「紫微斗数是如何排盘的」: 辛酉년 음력 2월 午시 → 命宮 酉, 命宮 干支 丁酉(山下火) → 火六局
  // 1981-03-20 12:00 서울(03:00 UTC) — 음력 1981(辛酉) 2월, 진태양시 약 11:20 = 午시
  const chart = calculateZiWeiCoordinates(new Date(Date.UTC(1981, 2, 20, 3, 0)), 126.978);

  it("음력 해·달이 예시와 같다", () => {
    expect(chart.lunarDate.year).toBe(1981);
    expect(chart.lunarDate.month).toBe(2);
  });

  it("命宮은 酉, 五行局은 火六局", () => {
    expect(chart.lifePalace.earthlyBranch).toBe("You");
    expect(chart.bureau).toMatchObject({ element: "Fire", number: 6 });
  });

  it("紫微·天府는 寅申 축에 대칭이고 열네 주성이 모두 한 번씩 놓인다", () => {
    const at = (id: string) => Object.values(chart.palaces).find((p) => p.stars.some((s) => s.id === id))!.index;
    expect((at("zi_wei") + at("tian_fu")) % 12).toBe(4);
    const main = ["zi_wei", "tian_ji", "tai_yang", "wu_qu", "tian_tong", "lian_zhen", "tian_fu", "tai_yin", "tan_lang", "ju_men", "tian_xiang", "tian_liang", "qi_sha", "po_jun"];
    for (const id of main) expect(Object.values(chart.palaces).filter((p) => p.stars.some((s) => s.id === id)), id).toHaveLength(1);
  });

  it("辛년 사화: 巨門祿 太陽權 文曲科 文昌忌", () => {
    const trans = Object.values(chart.palaces).flatMap((p) => p.stars).filter((s) => (s as { transformation?: string }).transformation);
    const map = Object.fromEntries(trans.map((s) => [s.id, (s as { transformation?: string }).transformation]));
    expect(map).toMatchObject({ ju_men: "Lu", tai_yang: "Quan", wen_qu: "Ke", wen_chang: "Ji" });
  });

  it("午시 문창은 辰, 문곡은 戌 (문곡은 辰에서 순행)", () => {
    const at = (id: string) => Object.values(chart.palaces).find((p) => p.stars.some((s) => s.id === id))?.earthlyBranch;
    expect(at("wen_chang")).toBe("Chen"); // 戌(10) − 午(6) = 辰(4)
    expect(at("wen_qu")).toBe("Xu"); // 辰(4) + 午(6) = 戌(10)
  });
});

describe("자미두수 — 晚子時와 윤달", () => {
  const at = (chart: ReturnType<typeof calculateZiWeiCoordinates>, id: string) =>
    Object.values(chart.palaces).find((p) => p.stars.some((s) => s.id === id))?.earthlyBranch;

  // 경도 0°, 6월 중순(균시차 ≈ 0)이라 진태양시 ≈ UTC 로 둔다.
  it("진태양시 23시 이후는 다음 날 子時로 본다 — 00시 30분과 같은 날, 22시 30분과는 다른 날", () => {
    const late = calculateZiWeiCoordinates(new Date(Date.UTC(2024, 5, 13, 23, 30)), 0);
    const nextEarly = calculateZiWeiCoordinates(new Date(Date.UTC(2024, 5, 14, 0, 30)), 0);
    const sameDayHai = calculateZiWeiCoordinates(new Date(Date.UTC(2024, 5, 13, 22, 30)), 0);
    expect(late.lunarDate).toEqual(nextEarly.lunarDate);
    expect(late.lunarDate.day).toBe(sameDayHai.lunarDate.day + 1);
    expect(at(late, "zi_wei")).toBe(at(nextEarly, "zi_wei"));
  });

  // 2023년 윤2월: 양력 3월 22일이 윤2월 1일.
  it("윤달 보름까지는 그 달, 16일부터는 다음 달로 좌보·우필과 명궁을 놓는다", () => {
    const leapEarly = calculateZiWeiCoordinates(new Date(Date.UTC(2023, 2, 26, 12)), 0); // 윤2월 5일
    const leapLate = calculateZiWeiCoordinates(new Date(Date.UTC(2023, 3, 10, 12)), 0); // 윤2월 20일
    expect(leapEarly.lunarDate).toMatchObject({ month: 2, isLeap: true, day: 5 });
    expect(leapLate.lunarDate).toMatchObject({ month: 2, isLeap: true, day: 20 });
    expect(at(leapEarly, "zuo_fu")).toBe("Si"); // 2월: 辰 + 1
    expect(at(leapLate, "zuo_fu")).toBe("Wu"); // 3월로 본다: 辰 + 2
    expect(at(leapLate, "you_bi")).toBe("Shen"); // 戌 − 2
    // 같은 시각의 명궁은 달이 하나 밀린 만큼 한 칸 나아간다
    const idx = (c: ReturnType<typeof calculateZiWeiCoordinates>) => c.lifePalace.index;
    expect((idx(leapLate) - idx(leapEarly) + 12) % 12).toBe(1);
  });
});
