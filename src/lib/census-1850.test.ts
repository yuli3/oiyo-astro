import { describe, expect, it } from "vitest";
import { GROUPS, TOTAL_K, drawGroup, formatCensus, groupById, lineOf, makeEntry, oneIn, parseCensus } from "./census-1850";

describe("census-1850", () => {
  it("weights add up to the 1850 total (thousands)", () => {
    expect(GROUPS.reduce((s, g) => s + g.k, 0)).toBe(TOTAL_K);
    expect(groupById("enslaved")!.k).toBe(3204);
    expect(oneIn(groupById("enslaved")!)).toBe(7);
  });

  it("draws every group at the edges", () => {
    expect(drawGroup(() => 0).id).toBe(GROUPS[0].id);
    expect(drawGroup(() => 0.999999).id).toBe(GROUPS[GROUPS.length - 1].id);
  });

  it("never names an enslaved person and gives no trade or property", () => {
    const e = makeEntry(groupById("enslaved")!, "f", 30, () => 0.4);
    const line = lineOf(e);
    expect(line.name).toBeNull();
    expect(line.trade).toBe("");
    expect(line.value).toBe("");
  });

  it("asks trade only of males over 15", () => {
    const g = groupById("native")!;
    expect(lineOf(makeEntry(g, "f", 40, () => 0.1)).trade).toBe("");
    expect(lineOf(makeEntry(g, "m", 12, () => 0.1)).trade).toBe("");
    expect(lineOf(makeEntry(g, "m", 40, () => 0.1)).trade).toBe("Farmer");
    expect(lineOf(makeEntry(groupById("ireland")!, "f", 20, () => 0)).name).toBe("Bridget Murphy");
  });

  it("round-trips through the share link and rejects junk", () => {
    const e = makeEntry(groupById("germany")!, "m", 33, () => 0.7);
    expect(parseCensus(formatCensus(e))).toEqual(e);
    expect(parseCensus("g=nope&x=m")).toBeNull();
    expect(parseCensus("g=native&x=m&a=999&n=0&s=0&b=0&t=0&v=0")).toBeNull();
  });
});
