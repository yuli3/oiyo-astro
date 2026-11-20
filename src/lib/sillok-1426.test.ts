import { describe, expect, it } from "vitest";
import data from "../../public/data/sillok-1426.json";
import {
  dayGanzhi, formatSillok, fromJdn, ganzhi, ganzhiIndex, jdn, lunarToJdn, monthStarts, nearestRecorded, parseSillok, solarToLunar,
} from "./sillok-1426";

const starts = monthStarts(data.shuo);
const days = data.days as Record<string, { gz: string }>;

describe("calendar", () => {
  it("knows the sexagenary cycle", () => {
    expect(ganzhi(0)).toBe("甲子");
    expect(ganzhi(59)).toBe("癸亥");
    expect(ganzhiIndex("丙申")).toBe(32);
    expect(dayGanzhi(jdn(2000, 1, 1))).toBe("戊午");
  });

  it("round-trips JDN", () => {
    expect(fromJdn(jdn(1426, 2, 7))).toEqual({ y: 1426, m: 2, d: 7 });
    expect(fromJdn(jdn(1990, 5, 5))).toEqual({ y: 1990, m: 5, d: 5 });
  });

  it("every recorded day's ganzhi matches the reconstructed calendar", () => {
    for (const [k, v] of Object.entries(days)) {
      const [m, d] = k.split("-").map(Number);
      expect(dayGanzhi(lunarToJdn(m, d, starts)), k).toBe(v.gz);
    }
  });

  it("starts the year in late Jan to Feb 1426 and months are 29-30 days", () => {
    const ny = fromJdn(starts[0]);
    expect(ny.y).toBe(1426);
    expect([1, 2]).toContain(ny.m);
    for (let k = 1; k < starts.length; k += 1) expect([29, 30]).toContain(starts[k] - starts[k - 1]);
  });

  it("maps every solar date of a year into 世宗 8", () => {
    for (let m = 1; m <= 12; m += 1) {
      for (let d = 1; d <= new Date(Date.UTC(2001, m, 0)).getUTCDate(); d += 1) {
        const l = solarToLunar(m, d, starts);
        expect(l.month).toBeGreaterThanOrEqual(1);
        expect(l.month).toBeLessThanOrEqual(12);
        expect(l.day).toBeGreaterThanOrEqual(1);
        expect(l.day).toBeLessThanOrEqual(30);
      }
    }
  });

  it("finds the nearest recorded day", () => {
    const has = (k: string) => k in days;
    expect(nearestRecorded(1, 1, starts, has)).toEqual({ month: 1, day: 1, offset: 0 });
    const r = nearestRecorded(1, 8, starts, has); // 1/8 has no entry
    expect(r && Math.abs(r.offset)).toBe(1);
  });
});

describe("query", () => {
  it("round-trips", () => {
    expect(parseSillok(`?${formatSillok({ kind: "lunar", month: 3, day: 15 })}`)).toEqual({ kind: "lunar", month: 3, day: 15 });
    expect(parseSillok("?m=13&d=1")).toBeNull();
  });
});
