import { describe, expect, it } from "vitest";
import data from "../../public/data/sillok-1426.json";
import { monthStarts } from "./sillok-1426";
import { eclipticOf, elongation, horizontal, jdAtSolar, phaseKey, skyAt, termIndex } from "./night-sky-1426";

const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe("night-sky-1426", () => {
  it("matches known modern events", () => {
    // Jupiter–Saturn great conjunction, 2020-12-21 18:00 UT
    const j = 2459205.25;
    expect(diff(eclipticOf("jupiter", j).lon, eclipticOf("saturn", j).lon)).toBeLessThan(0.6);
    // March equinox 2024-03-20 03:06 UT
    expect(diff(eclipticOf("sun", 2460389.629).lon, 0)).toBeLessThan(0.2);
    // Full moon 2024-09-18 02:34 UT, new moon 2024-10-02 18:49 UT
    expect(diff(elongation(eclipticOf("moon", 2460571.607).lon, eclipticOf("sun", 2460571.607).lon), 180)).toBeLessThan(3);
    expect(diff(elongation(eclipticOf("moon", 2460586.284).lon, eclipticOf("sun", 2460586.284).lon), 0)).toBeLessThan(3);
    // Venus greatest eastern elongation 2023-06-04: 45.4°
    const v = 2460099.5;
    expect(Math.abs(diff(eclipticOf("venus", v).lon, eclipticOf("sun", v).lon) - 45.4)).toBeLessThan(1);
  });

  it("puts the noon sun due south and high in summer", () => {
    const jd = jdAtSolar(2024, 6, 21, 720, 173);
    const s = eclipticOf("sun", jd);
    const h = horizontal(s.lon, s.lat, jd);
    expect(Math.abs(h.az - 180)).toBeLessThan(2);
    expect(Math.abs(h.alt - (90 - 37.57 + 23.44))).toBeLessThan(1);
  });

  it("agrees with the Sillok calendar: new moon on each first day of 1426", () => {
    const starts = monthStarts(data.shuo);
    for (const j of starts) {
      const jd = j; // local noon ≈ JD integer + 3.5h; good enough for ±15°
      const e = elongation(eclipticOf("moon", jd).lon, eclipticOf("sun", jd).lon);
      expect(Math.min(e, 360 - e)).toBeLessThan(16);
    }
    const mid = starts[3]! + 14;
    expect(phaseKey(elongation(eclipticOf("moon", mid).lon, eclipticOf("sun", mid).lon))).toMatch(/full|Gibbous/);
  });

  it("gives a 절기 index and a dark sky at night", () => {
    expect(termIndex(0)).toBe(0);
    expect(termIndex(359)).toBe(23);
    const night = skyAt(jdAtSolar(1426, 1, 1, 0, 1));
    expect(night.sunAlt).toBeLessThan(-18);
    expect(night.objects).toHaveLength(6);
  });
});

describe("night-sky-1426 share", async () => {
  const { SHUO_1426, formatNight, parseNight } = await import("./night-sky-1426-share");
  it("keeps the 朔 list in sync with the Sillok data and round-trips links", () => {
    expect([...SHUO_1426]).toEqual(data.shuo);
    expect(parseNight(formatNight({ month: 2, day: 28 }))).toEqual({ month: 2, day: 28 });
    expect(parseNight("m=2&d=29")).toBeNull();
    expect(parseNight("m=13&d=1")).toBeNull();
  });
});
