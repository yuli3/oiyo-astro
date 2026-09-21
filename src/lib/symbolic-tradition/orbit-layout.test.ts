import { describe, expect, it } from "vitest";
import { approachValue } from "./orbit-layout";

describe("궤도 전이", () => {
  it("움직임 줄이기에서는 즉시 목표값이다", () => {
    expect(approachValue(0, 10, 0.016, false)).toBe(10);
  });

  it("한 프레임에 목표를 지나치지 않는다", () => {
    // 지나치면 행성이 궤도를 넘었다 되돌아와 튕기는 것처럼 보인다.
    for (const delta of [0.016, 0.05, 0.5, 5]) {
      const next = approachValue(0, 10, delta, true);
      expect(next, `delta=${delta}`).toBeGreaterThan(0);
      expect(next, `delta=${delta}`).toBeLessThanOrEqual(10);
    }
    for (const delta of [0.016, 0.05, 0.5, 5]) {
      const next = approachValue(10, 0, delta, true);
      expect(next, `delta=${delta}`).toBeGreaterThanOrEqual(0);
      expect(next, `delta=${delta}`).toBeLessThan(10);
    }
  });

  it("프레임률이 달라도 같은 시간에 같은 자리에 닿는다", () => {
    // 60fps 로 1초와 30fps 로 1초가 어긋나면 기기마다 속도가 달라진다.
    let fast = 0;
    for (let i = 0; i < 60; i += 1) fast = approachValue(fast, 10, 1 / 60, true);
    let slow = 0;
    for (let i = 0; i < 30; i += 1) slow = approachValue(slow, 10, 1 / 30, true);
    expect(Math.abs(fast - slow)).toBeLessThan(0.05);
  });

  it("한 걸음에 끝나지 않는다 — 전이가 보여야 한다", () => {
    // 순간이동하면 관점이 바뀐 것이 보이지 않는다. 그게 이 함수의 존재 이유다.
    expect(approachValue(0, 10, 1 / 60, true)).toBeLessThan(1);
  });

  it("이미 목표에 있으면 움직이지 않는다", () => {
    expect(approachValue(7, 7, 0.016, true)).toBe(7);
  });
});
