import { describe, expect, it } from "vitest";
import { EPISODES } from "./past-life-1426";
import { EPISODE_YEAR, cleanLives, span, timeline } from "./timeslip-lives";

const life = (title: string) => ({ title, kicker: "k", query: "?a=1", accent: "#123456", at: 1 });

describe("parallel-lives timeline", () => {
  it("has a year for every episode", () => {
    for (const e of EPISODES) expect(EPISODE_YEAR[e]).toBeGreaterThan(0);
  });

  it("drops junk and unknown episodes", () => {
    const lives = cleanLives({ "domesday-1086": life("Villan"), nope: life("x"), "census-1850": { title: "" }, "silla-golpum": { ...life("Head"), accent: "red", query: "javascript:1" } });
    expect(Object.keys(lives).sort()).toEqual(["domesday-1086", "silla-golpum"]);
    expect(lives["silla-golpum"]!.accent).toBe("#2b1708");
    expect(lives["silla-golpum"]!.query).toBe("");
    expect(cleanLives("x")).toEqual({});
  });

  it("orders by era and measures the span", () => {
    const list = timeline(cleanLives({ "us-birth-state": life("Texas"), "silla-golpum": life("Head"), "joseon-1789": life("Farmer"), "domesday-1086": life("Villan") }));
    expect(list.map((x) => x.ep)).toEqual(["silla-golpum", "domesday-1086", "joseon-1789", "us-birth-state"]);
    expect(span(list)).toBe(1300);
    expect(span(list.slice(0, 1))).toBe(0);
  });
});
