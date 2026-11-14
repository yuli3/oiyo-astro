import { describe, expect, it } from "vitest";
import {
  REELS,
  simulate,
  theoreticalReturnRate,
  varianceBands,
} from "./slot-anatomy";

describe("slot-anatomy math and simulation", () => {
  it("computes theoreticalReturnRate below 100% (negative EV)", () => {
    expect(REELS).toHaveLength(3);
    const rtp = theoreticalReturnRate();
    expect(rtp).toBeGreaterThan(80);
    expect(rtp).toBeLessThan(100);
  });

  it("runs a deterministic simulation with a seeded RNG", () => {
    const result = simulate(1000, 42);
    expect(result.spins).toBe(1000);
    expect(result.staked).toBe(1000);
    expect(result.houseEdge).toBeCloseTo(100 - result.returnRate, 5);
  });

  it("computes varianceBands converging toward negative return", () => {
    const bands = varianceBands(3);
    expect(bands.length).toBeGreaterThan(0);
    expect(bands[bands.length - 1]?.losingIsCertain).toBe(true);
  });
});
