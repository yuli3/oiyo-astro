import { describe, expect, it } from "vitest";
import { computeBirthSky, computeBirthSkyAt, formatBirthSkyQuery, parseBirthSkyQuery, rotateY, separationDeg, surfaceLocal } from "./birth-sky";

const SEOUL = { id: "seoul", lat: 37.5665, lon: 126.978, zoneId: "Asia/Seoul" };

describe("birth-sky", () => {
  it("puts Sun and Moon together at the 2024-04-08 total eclipse (Dallas, 18:42 UTC)", () => {
    const sky = computeBirthSkyAt(new Date(Date.UTC(2024, 3, 8, 18, 42)), { lat: 32.78, lon: -96.8 });
    // geocentric separation is up to ~1° (parallax); topocentric alt/az nearly match
    expect(separationDeg(sky.sun.dir, sky.moon.dir)).toBeLessThan(1.2);
    expect(Math.abs(sky.sun.alt - sky.moon.alt)).toBeLessThan(0.3);
    expect(sky.moon.phase).toBe("new");
    expect(sky.daylight).toBe("day");
  });

  it("finds the full moon of 2025-10-07 opposite the Sun", () => {
    const sky = computeBirthSkyAt(new Date(Date.UTC(2025, 9, 7, 3, 48)), SEOUL);
    expect(sky.moon.phase).toBe("full");
    expect(sky.moon.illumination).toBeGreaterThan(0.98);
    expect(separationDeg(sky.sun.dir, sky.moon.dir)).toBeGreaterThan(175);
  });

  it("matches solar terms: 2026 입춘 (Feb 4) and 동지 (Dec 22)", () => {
    const ipchun = computeBirthSky({ civilDate: "2026-02-04", civilTime: "18:00", place: SEOUL });
    const dongji = computeBirthSky({ civilDate: "2026-12-22", civilTime: "12:00", place: SEOUL });
    if (ipchun.status !== "ok" || dongji.status !== "ok") throw new Error("expected ok");
    expect(ipchun.sky.termIndex).toBe(21);
    expect(dongji.sky.termIndex).toBe(18);
    expect(dongji.sky.signIndex).toBe(9); // solstice is ~05:50 KST, so noon is already Capricorn
  });

  it("orients the Earth so local noon faces the Sun", () => {
    // Seoul solar noon is near 12:30 KST (126.98°E vs 135°E meridian).
    const r = computeBirthSky({ civilDate: "2026-06-21", civilTime: "12:30", place: SEOUL });
    if (r.status !== "ok") throw new Error("expected ok");
    const local = surfaceLocal(SEOUL.lat, SEOUL.lon);
    const up = rotateY(local, r.sky.gastDeg);
    // angle between local zenith and the Sun = 90° − altitude
    expect(Math.abs(separationDeg(up, r.sky.sun.dir) - (90 - r.sky.sun.alt))).toBeLessThan(0.5);
    expect(r.sky.sun.alt).toBeGreaterThan(70);
    expect(r.sky.sun.az).toBeGreaterThan(150);
    expect(r.sky.sun.az).toBeLessThan(210);
  });

  it("uses the historical Korean DST offset (1988-07-01 was UTC+10)", () => {
    const r = computeBirthSky({ civilDate: "1988-07-01", civilTime: "09:00", place: SEOUL });
    if (r.status !== "ok") throw new Error("expected ok");
    expect(r.sky.offsetMinutes).toBe(600);
    expect(r.sky.instant.toISOString()).toBe("1988-06-30T23:00:00.000Z");
  });

  it("rejects out-of-range years and round-trips the share query", () => {
    expect(computeBirthSky({ civilDate: "1700-01-01", civilTime: null, place: SEOUL }).status).toBe("invalid");
    const q = { date: "1990-05-17", time: "14:30", place: "seoul" };
    expect(parseBirthSkyQuery(formatBirthSkyQuery(q))).toEqual(q);
    expect(parseBirthSkyQuery("?d=1990-05-17&p=seoul&t=25:00")).toEqual({ date: "1990-05-17", time: null, place: "seoul" });
    expect(parseBirthSkyQuery("?d=bad&p=seoul")).toBeNull();
  });
});
