import { describe, expect, it } from "vitest";
import { formatPick, hhmm, joseonTime, parsePick, siName, solarToKst } from "./joseon-time";

describe("joseon-time", () => {
  it("names noon as 오시 and midnight as 자시 정 (solar time)", () => {
    const sp = joseonTime(12 * 60 + 32, 3, 20);
    expect(sp.si).toBe(6);
    const mid = joseonTime(0, 6, 1);
    expect(siName(mid)).toMatch(/^자시 초/);
    expect(siName(joseonTime(60, 6, 1))).toMatch(/^자시 정/);
  });

  it("splits a 시 into 8 각 of 15 minutes and 8⅓ 각 of 14.4", () => {
    for (let m = 0; m < 1440; m += 7) {
      const t = joseonTime(m, 1, 1);
      expect(t.kak96).toBeGreaterThanOrEqual(0);
      expect(t.kak96).toBeLessThanOrEqual(3);
      expect(t.kak100).toBeLessThanOrEqual(8);
    }
  });

  it("puts 파루 near 4 a.m. and 인정 in the evening at the equinox", () => {
    const t = joseonTime(0, 3, 21);
    const paru = solarToKst(t.paru, 0);
    expect(Math.abs(paru - 4 * 60 - 15)).toBeLessThan(40);
    const injeong = solarToKst(t.injeong, 0);
    expect(injeong).toBeGreaterThan(19 * 60);
    expect(injeong).toBeLessThan(22 * 60);
  });

  it("is curfew at 1 a.m. and not at noon; night watches run 1..5", () => {
    expect(joseonTime(60, 11, 22).curfew).toBe(true);
    expect(joseonTime(720, 11, 22).curfew).toBe(false);
    const n = joseonTime(60, 11, 22).night!;
    expect(n.gyeong).toBeGreaterThanOrEqual(1);
    expect(n.gyeong).toBeLessThanOrEqual(5);
    expect(joseonTime(60, 11, 22).last.kind).not.toBe("bell");
  });

  it("round-trips the share link", () => {
    const p = { kst: 75, month: 2, day: 29 };
    expect(parsePick(formatPick(p))).toEqual(p);
    expect(parsePick("t=2460&d=0101")).toBeNull();
    expect(parsePick("t=0130&d=0101")).toEqual({ kst: 90, month: 1, day: 1 });
    expect(parsePick("t=0100&d=0230")).toBeNull();
    expect(hhmm(1439.6)).toBe("00:00");
  });
});
