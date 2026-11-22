import { describe, expect, it } from "vitest";
import { MAX_SKILLS, SKILLS, ending, formatRun, makeRun, parseRun, score } from "./hoebinghwan-1789";

describe("hoebinghwan-1789", () => {
  it("scores verdicts 2 / 1 / 0", () => {
    for (const s of SKILLS) expect(s.points).toBe(s.verdict === "works" ? 2 : s.verdict === "partly" ? 1 : 0);
  });

  it("time-slippers have no body and start from zero", () => {
    const run = makeRun("slip", ["english", "coding"], 30, () => 0.5);
    expect(run.body).toBeNull();
    expect(score(run)).toBe(0);
    expect(ending(score(run))).toBe("days3");
  });

  it("rebirth starts at age 1 and halves skills; possession keeps an adult age", () => {
    const reborn = makeRun("reborn", ["hangul", "japanese", "chinese"], 30, () => 0.1);
    expect(reborn.body?.age).toBe(1);
    const possess = makeRun("possess", ["hangul", "japanese", "chinese"], 8, () => 0.1);
    expect(possess.body?.age).toBe(16);
    expect(score(possess) - score(reborn)).toBe(6 - 3);
  });

  it("caps and dedupes skills", () => {
    const run = makeRun("slip", ["hangul", "hangul", "english", "coding", "swimming"], 30);
    expect(run.skills).toEqual(["hangul", "english", "coding"]);
    expect(run.skills.length).toBeLessThanOrEqual(MAX_SKILLS);
  });

  it("round-trips the share link and rejects junk", () => {
    for (const tr of ["possess", "reborn", "slip"] as const) {
      const run = makeRun(tr, ["cooking", "trading"], 33, () => 0.37);
      expect(parseRun(formatRun(run))).toEqual(run);
    }
    expect(parseRun("tr=fly")).toBeNull();
    expect(parseRun("tr=slip&sk=hangul.magic")).toBeNull();
  });

  it("endings climb with the score", () => {
    expect([0, 2, 4, 6, 9].map(ending)).toEqual(["days3", "year1", "years10", "lifetime", "legend"]);
  });
});
