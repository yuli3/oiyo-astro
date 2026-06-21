import { describe, expect, it } from "vitest";

import { analyzeLifeCategories } from "./categories";
import { calculateSaju } from "./logic";
import { CATEGORIES_C, YONGSIN_C } from "./yongsin-content";
import {
  computeDayMasterStrength,
  computeYongsin,
  elementRoles,
  YONGSIN_ATTRS,
  __verifyYongsin,
} from "./yongsin";

// A spread of real charts across the year/decades to exercise strong/weak/balanced.
const SAMPLE_DATES: [number, number, number, number][] = [
  [1990, 5, 15, 10],
  [1985, 11, 3, 14],
  [2000, 1, 20, 6],
  [1978, 7, 7, 23],
  [1995, 3, 30, 4],
  [1969, 9, 12, 18],
  [2002, 12, 25, 12],
  [1988, 2, 14, 8],
  [1973, 6, 1, 0],
  [1992, 10, 9, 16],
];

function chart(y: number, m: number, d: number, h: number) {
  return calculateSaju(new Date(y, m - 1, d, h, 0), false, "male");
}

describe("yongsin engine (부억용신)", () => {
  it("elementRoles forms the correct 5-element ring for a Wood day master", () => {
    // Wood: 비겁=wood, 인성=water(생목), 식상=fire(목생화), 재성=earth(목극토), 관성=metal(금극목)
    const dmWood = calculateSaju(new Date(2000, 0, 1), false, "male");
    void dmWood;
    const roles = elementRoles("wood" as any);
    expect(roles.bigyeop).toBe("wood");
    expect(roles.insung).toBe("water");
    expect(roles.siksang).toBe("fire");
    expect(roles.jaesung).toBe("earth");
    expect(roles.gwansung).toBe("metal");
  });

  it("strength ratio is within (0,1) and category is consistent", () => {
    for (const [y, m, d, h] of SAMPLE_DATES) {
      const st = computeDayMasterStrength(chart(y, m, d, h));
      expect(st.ratio).toBeGreaterThan(0);
      expect(st.ratio).toBeLessThan(1);
      if (st.category === "strong") expect(st.ratio).toBeGreaterThanOrEqual(0.55);
      if (st.category === "weak") expect(st.ratio).toBeLessThanOrEqual(0.42);
    }
  });

  it("부억 direction holds: strong→drain role, weak→support role", () => {
    for (const [y, m, d, h] of SAMPLE_DATES) {
      const saju = chart(y, m, d, h);
      expect(__verifyYongsin(saju)).toBe(true);
    }
  });

  it("yongsin, huisin, gisin, gusin are all valid distinct-ish elements", () => {
    for (const [y, m, d, h] of SAMPLE_DATES) {
      const r = computeYongsin(chart(y, m, d, h));
      const ELS = ["wood", "fire", "earth", "metal", "water"];
      for (const e of [r.yongsin, r.huisin, r.gisin, r.gusin]) {
        expect(ELS).toContain(e);
      }
      // 희신 generates 용신
      expect(r.huisin).not.toBe(r.yongsin);
      // 용신 should not equal 기신
      expect(r.yongsin).not.toBe(r.gisin);
    }
  });

  it("life categories produce coherent codes for every sample", () => {
    for (const [y, m, d, h] of SAMPLE_DATES) {
      const c = analyzeLifeCategories(chart(y, m, d, h));
      for (const cat of [c.wealth, c.career, c.love]) {
        expect(["strong", "moderate", "weak", "absent"]).toContain(cat.level);
        expect(["favorable", "unfavorable", "neutral"]).toContain(cat.stance);
        expect(cat.toneKey).toBeTruthy();
      }
      expect(["excess", "deficient", "missing", "balanced"]).toContain(
        c.health.imbalance,
      );
      expect(c.health.organKey).toBeTruthy();
      // element counts over 8 chars sum to 8
      const sum = Object.values(c.elementCounts).reduce((a, b) => a + b, 0);
      expect(sum).toBe(8);
    }
  });

  it("every content key referenced by the UI exists (no undefined render)", () => {
    const has = (m: any, k: string) => m[k] && (m[k].en !== undefined || typeof m[k] === "object");
    for (const [y, m, d, h] of SAMPLE_DATES) {
      for (const gender of ["male", "female"] as const) {
        const a = analyzeLifeCategories({
          ...calculateSaju(new Date(y, m - 1, d, h), false, gender),
        });
        // Yongsin section keys
        expect(has(YONGSIN_C.strengthLabel, a.strength.category)).toBeTruthy();
        expect(has(YONGSIN_C.strengthDesc, a.strength.category)).toBeTruthy();
        expect(has(YONGSIN_C.reason, a.yongsin.reason)).toBeTruthy();
        expect(has(YONGSIN_C.elementFavorable, a.yongsin.yongsin)).toBeTruthy();
        expect(has(YONGSIN_C.elementUnfavorable, a.yongsin.gisin)).toBeTruthy();
        const at = YONGSIN_ATTRS[a.yongsin.yongsin];
        expect(at).toBeTruthy();
        expect(has(YONGSIN_C.colorName, at.colorKey)).toBeTruthy();
        expect(has(YONGSIN_C.directionName, at.directionKey)).toBeTruthy();
        expect(has(YONGSIN_C.seasonName, at.seasonKey)).toBeTruthy();
        expect(has(YONGSIN_C.foodName, at.foodKey)).toBeTruthy();
        at.careerKeys.forEach((k) => expect(has(YONGSIN_C.careerName, k)).toBeTruthy());
        // Categories section keys
        expect(has(CATEGORIES_C.roleName, a.wealth.role)).toBeTruthy();
        expect(has(CATEGORIES_C.wealth.guide, a.wealth.stance)).toBeTruthy();
        expect(has(CATEGORIES_C.career.mode, a.career.mode)).toBeTruthy();
        expect(has(CATEGORIES_C.love.guide, a.love.stance)).toBeTruthy();
        expect(has(CATEGORIES_C.health.imbalance, a.health.imbalance)).toBeTruthy();
        expect(has(CATEGORIES_C.health.organ, a.health.organKey)).toBeTruthy();
      }
    }
  });
});
