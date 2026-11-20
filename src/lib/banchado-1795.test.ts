import { describe, expect, it } from "vitest";
import { DAYS, DRAWN, SLOTS, TOTAL_SLOTS, drawSlot, formatBanchado, oneIn, parseBanchado } from "./banchado-1795";

describe("banchado-1795", () => {
  it("drawn slots add up to the 1,779 people in the picture, plus the undrawn king", () => {
    expect(SLOTS.filter((s) => s.id !== "king").reduce((a, s) => a + s.n, 0)).toBe(DRAWN);
    expect(TOTAL_SLOTS).toBe(DRAWN + 1);
    expect(DAYS).toHaveLength(8);
  });

  it("draws every slot across the range", () => {
    const seen = new Set<string>();
    for (let i = 0; i < TOTAL_SLOTS; i++) seen.add(drawSlot(() => (i + 0.5) / TOTAL_SLOTS).id);
    expect(seen.size).toBe(SLOTS.length);
    expect(drawSlot(() => 0.999999).id).toBe("king");
    expect(oneIn(SLOTS.find((s) => s.id === "king")!)).toBe(1780);
  });

  it("round-trips the share link", () => {
    expect(parseBanchado("?" + formatBanchado("nain"))?.id).toBe("nain");
    expect(parseBanchado("?s=x")).toBeNull();
  });
});
