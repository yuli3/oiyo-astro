import { describe, expect, it } from "vitest";
import { eclipticAngle, placeSkyBodies } from "./sky-layout";

describe("natal sky layout", () => {
  it("puts the ascendant on the left and runs counterclockwise", () => {
    expect(Math.cos(eclipticAngle(100, 100))).toBeCloseTo(-1);
    // 90° 뒤는 아래(6시) — x=0, z=-sin(270°)=+1 이 화면 앞쪽이다.
    expect(Math.cos(eclipticAngle(190, 100))).toBeCloseTo(0);
    expect(-Math.sin(eclipticAngle(190, 100))).toBeCloseTo(1);
  });

  it("uses Aries 0° as the left anchor without a birth time", () => {
    expect(Math.cos(eclipticAngle(0))).toBeCloseTo(-1);
  });

  it("stacks close bodies and keeps far ones on the ring", () => {
    const placed = placeSkyBodies([
      { key: "sun", longitude: 10 },
      { key: "mercury", longitude: 14 },
      { key: "venus", longitude: 358 },
      { key: "mars", longitude: 120 },
    ]);
    const byKey = Object.fromEntries(placed.map((p) => [p.key, p.stack]));
    expect(byKey.mars).toBe(0);
    expect(new Set([byKey.sun, byKey.mercury]).size).toBe(2);
    expect(placed.map((p) => p.key)).toEqual(["sun", "mercury", "venus", "mars"]);
  });
});
