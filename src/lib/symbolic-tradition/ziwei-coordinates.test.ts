import { describe, expect, it } from "vitest";

import { calculateZiWeiCoordinates } from "@/lib/ontology/ziwei/calculator";
import { isZiweiCoordinates, palaceInChart, ziweiCoordinates, ZIWEI_BRANCHES } from "./ziwei-coordinates";

describe("참가자 자미두수 좌표", () => {
  // calculator.test 와 같은 공개 예시: 1981-03-20 12:00 서울 → 命宮 酉
  const seoul = { civilDate: "1981-03-20", civilTime: "12:00", utcOffsetMinutes: 540, longitude: 126.978 };

  it("명궁 지지와 주성만 싣는다", () => {
    const z = ziweiCoordinates(seoul)!;
    expect(z.lifePalace).toBe("YU");
    expect(isZiweiCoordinates(z)).toBe(true);
    const full = calculateZiWeiCoordinates(new Date(Date.UTC(1981, 2, 20, 3)), 126.978);
    const major = full.lifePalace.stars.map((s) => s.id).filter((id) => !id.startsWith("wen_") && !["zuo_fu", "you_bi"].includes(id));
    expect(z.stars).toEqual(major);
  });

  it("시각이나 도시가 없으면 세우지 않는다", () => {
    expect(ziweiCoordinates({ ...seoul, civilTime: null })).toBeNull();
    expect(ziweiCoordinates({ ...seoul, longitude: null, utcOffsetMinutes: null })).toBeNull();
  });

  it("손님의 명궁이 앉는 궁은 주인 명반 전체와 맞는다", () => {
    const full = calculateZiWeiCoordinates(new Date(Date.UTC(1981, 2, 20, 3)), 126.978);
    const host = ziweiCoordinates(seoul)!;
    for (const [key, palace] of Object.entries(full.palaces)) {
      expect(palaceInChart(host, ZIWEI_BRANCHES[palace.index])).toBe(key);
    }
  });

  it("모양이 틀린 저장값은 거른다", () => {
    expect(isZiweiCoordinates({ lifePalace: "You", stars: [] })).toBe(false);
    expect(isZiweiCoordinates({ lifePalace: "YU", stars: ["wen_chang"] })).toBe(false);
  });
});
