import { describe, expect, it } from "vitest";
import { CLASSES, TOTAL_PERMILLE, classById, drawClass, entryOf, formatDomesday, makeManor, oneIn, parseDomesday } from "./domesday-1086";

describe("domesday-1086", () => {
  it("shares add up to 1,000 with Darby's order", () => {
    expect(TOTAL_PERMILLE).toBe(1000);
    expect(CLASSES[0].id).toBe("villan");
    expect(oneIn(classById("slave")!)).toBe(10);
  });

  it("draws at the edges", () => {
    expect(drawClass(() => 0).id).toBe("villan");
    expect(drawClass(() => 0.9999).id).toBe("cottar");
  });

  it("puts you in the count for your class", () => {
    for (const c of CLASSES) {
      const m = makeManor(c, () => 0);
      const e = entryOf(m);
      expect(e.count).toBeGreaterThanOrEqual(1);
      expect(e.text).toMatch(/^In [A-Z]+ the lord holds/);
    }
    expect(entryOf(makeManor(classById("slave")!, () => 0)).text).toContain("1 slave.");
    expect(entryOf(makeManor(classById("freeman")!, () => 0)).place).toMatch(/Norfolk|Suffolk|Essex/);
  });

  it("round-trips the share link and rejects junk", () => {
    const m = makeManor(classById("sokeman")!, () => 0.42);
    expect(parseDomesday(formatDomesday(m))).toEqual(m);
    expect(parseDomesday("cls=duke")).toBeNull();
    expect(parseDomesday(formatDomesday({ ...m, m: 99 }))).toBeNull();
  });
});
