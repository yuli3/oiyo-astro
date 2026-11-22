import { describe, expect, it } from "vitest";
import { DISHES, ING, SOURCES, byId, formatLunch, judge, parseLunch } from "./lunch-1426";

describe("lunch-1426", () => {
  it("has unique dish ids and valid ingredients", () => {
    const ids = new Set(DISHES.map((d) => d.id));
    expect(ids.size).toBe(DISHES.length);
    for (const d of DISHES) {
      expect(d.ing.length).toBeGreaterThan(3);
      for (const i of d.ing) expect(ING[i]).toBeDefined();
      for (const k of ["ko", "en", "ja", "zh", "fr", "es"] as const) expect(d.name[k]).toBeTruthy();
    }
  });

  it("every cited source exists", () => {
    for (const v of Object.values(ING)) if ("src" in v && v.src) expect(SOURCES[v.src]).toBeDefined();
  });

  it("New World crops are never available in 1426", () => {
    for (const k of ["chili", "potato", "sweetpotato", "corn", "tomato", "squash", "peanut", "pepper", "cacao"] as const)
      expect(ING[k].status).toBe("none");
  });

  it("scores dishes", () => {
    const s = judge(byId("samgyetang")!);
    expect(s.none).toEqual([]);
    expect(s.score).toBe(1);
    const p = judge(byId("pizza")!);
    expect(p.score).toBeCloseTo(1.5 / 6);
    expect(p.none).toContain("tomato");
    const n = judge(byId("naengmyeon")!);
    expect(n.rare).toEqual(["beef", "sugar"]);
    expect(n.score).toBeCloseTo(7 / 8);
  });

  it("round-trips the share link", () => {
    expect(parseLunch("?" + formatLunch("bibimbap"))).toBe("bibimbap");
    expect(parseLunch("?d=nope")).toBeNull();
    expect(parseLunch("")).toBeNull();
  });
});
