import { describe, expect, it } from "vitest";
import { mulberry32 } from "../reincarnation-particles";
import { shuffleDeck } from "./shuffle";

describe("shuffleDeck", () => {
  it("keeps every card exactly once", () => {
    const deck = Array.from({ length: 22 }, (_, i) => i);
    const out = shuffleDeck(deck, mulberry32(1));
    expect([...out].sort((a, b) => a - b)).toEqual(deck);
    expect(deck).toEqual(Array.from({ length: 22 }, (_, i) => i));
  });

  it("draws each card first with equal probability", () => {
    const deck = Array.from({ length: 22 }, (_, i) => i);
    const rand = mulberry32(7);
    const counts = new Array(22).fill(0);
    const trials = 66000;
    for (let n = 0; n < trials; n += 1) counts[shuffleDeck(deck, rand)[0]] += 1;
    // 기대 3000, 표준편차 ≈ 53. 6σ 안쪽이면 고르다.
    for (const count of counts) expect(Math.abs(count - trials / 22)).toBeLessThan(320);
  });
});
