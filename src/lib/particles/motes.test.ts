import { describe, expect, it } from "vitest";
import {
  FLY_SECONDS,
  LEAVE_SECONDS,
  MOTES_PER_CHIP,
  moteTargets,
  reconcileMotes,
  stepMotes,
  type Mote,
  type MoteStage,
} from "./motes";

const stage: MoteStage = {
  center: { x: 140, y: 140 },
  nodes: { interest: { x: 140, y: 48 }, goal: { x: 52, y: 110 } },
  orbitMin: 40,
  orbitMax: 60,
};

function live(motes: Mote[], cat: string) {
  return motes.filter((m) => m.cat === cat && m.mode !== "leaving").length;
}

function run(motes: Mote[], seconds: number) {
  let next = motes;
  for (let t = 0; t < seconds; t += 1 / 60) next = stepMotes(next, 1 / 60, stage);
  return next;
}

describe("mindmap motes", () => {
  it("targets are the number of chosen chips times MOTES_PER_CHIP", () => {
    expect(moteTargets({ interest: ["a", "b"], goal: [] })).toEqual({ interest: 2 * MOTES_PER_CHIP, goal: 0 });
  });

  it("new motes fly from their category node and settle into orbit", () => {
    let motes = reconcileMotes([], { interest: MOTES_PER_CHIP }, stage, () => 0.5);
    expect(motes).toHaveLength(MOTES_PER_CHIP);
    for (const m of motes) expect([m.x, m.y]).toEqual([140, 48]);
    motes = run(motes, FLY_SECONDS + 0.5);
    for (const m of motes) {
      expect(m.mode).toBe("orbit");
      const r = Math.hypot(m.x - 140, (m.y - 140) / 0.82);
      expect(r).toBeGreaterThanOrEqual(40 - 1e-6);
      expect(r).toBeLessThanOrEqual(60 + 1e-6);
    }
  });

  it("removing a chip sends that category's extra motes home and drops them", () => {
    let motes = reconcileMotes([], { interest: 10, goal: 5 }, stage, () => 0.3, true);
    motes = reconcileMotes(motes, { interest: 5, goal: 5 }, stage);
    expect(live(motes, "interest")).toBe(5);
    expect(motes.filter((m) => m.mode === "leaving")).toHaveLength(5);
    motes = run(motes, LEAVE_SECONDS + 0.2);
    expect(motes).toHaveLength(10);
    expect(live(motes, "goal")).toBe(5);
  });

  it("settled motes start in orbit without flying", () => {
    const motes = reconcileMotes([], { goal: 3 }, stage, () => 0.1, true);
    expect(motes.every((m) => m.mode === "orbit")).toBe(true);
  });
});
