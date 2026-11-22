import { describe, expect, it } from "vitest";
import { AGENCIES, SEAT_TOTAL, TOTAL_GYEONG, TRADES, TRADE_TOTAL, drawSeat, formatSeat, parseSeat, shiftsOf } from "./gyeonggongjang";

describe("gyeonggongjang", () => {
  it("keeps the verified seats under the 2,795 total, with 군기시 at 644 at most", () => {
    expect(SEAT_TOTAL).toBeLessThan(TOTAL_GYEONG);
    const gungi = TRADES.flatMap((t) => t.posts).filter(([a]) => a === 2).reduce((s, [, n]) => s + n, 0);
    expect(gungi).toBeLessThanOrEqual(644);
    expect(TRADE_TOTAL(TRADES[0]!)).toBe(386);
  });

  it("draws in proportion and stays in range", () => {
    let pottery = 0;
    for (let k = 0; k < 3000; k += 1) {
      const s = drawSeat();
      expect(TRADES[s.ti]!.posts[s.pi]).toBeDefined();
      if (s.ti === 0) pottery += 1;
    }
    expect(pottery / 3000).toBeGreaterThan(0.18);
    expect(drawSeat(() => 0)).toEqual({ ti: 0, pi: 0 });
    expect(drawSeat(() => 0.999999)).toBeDefined();
  });

  it("gives paper makers three shifts and has six-language names", () => {
    const paper = TRADES.findIndex((t) => t.hanja === "紙匠");
    expect(shiftsOf({ ti: paper, pi: 0 })).toBe(3);
    expect(shiftsOf({ ti: 0, pi: 0 })).toBe(2);
    for (const t of TRADES) for (const v of [...Object.values(t.name), ...Object.values(t.made)]) expect(v.length).toBeGreaterThan(0);
    expect(AGENCIES).toHaveLength(8);
  });

  it("round-trips the share link", () => {
    const s = { ti: 10, pi: 3 };
    expect(parseSeat(formatSeat(s))).toEqual(s);
    expect(parseSeat("j=99.0")).toBeNull();
    expect(parseSeat("j=0.5")).toBeNull();
  });
});
