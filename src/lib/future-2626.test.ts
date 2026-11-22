import { describe, expect, it } from "vitest";
import { ITEMS, formatDig, makeDig, parseDig } from "./future-2626";

describe("future-2626", () => {
  it("has two guesses in six languages for every item", () => {
    for (const it of ITEMS) {
      expect(it.guesses).toHaveLength(2);
      for (const g of it.guesses) for (const v of Object.values(g)) expect(v.length).toBeGreaterThan(10);
    }
  });

  it("draws three different items", () => {
    for (let k = 0; k < 100; k += 1) expect(new Set(makeDig().items).size).toBe(3);
  });

  it("round-trips the share link and rejects junk", () => {
    const d = makeDig(() => 0.3);
    expect(parseDig(formatDig(d))).toEqual(d);
    expect(parseDig("i=1.1.2&g=000&s=0&c=0&n=1234")).toBeNull();
    expect(parseDig(formatDig({ ...d, no: 12 }))).toBeNull();
  });
});
