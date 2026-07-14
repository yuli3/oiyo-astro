import { describe, expect, it } from "vitest";

import {
  POLITICAL_REVERSED_ITEMS,
  POLITICAL_STEP_KEYS,
  scorePoliticalCompass,
} from "./political-compass";

function answers(value: "1" | "2" | "3") {
  return Object.fromEntries(POLITICAL_STEP_KEYS.flat().map((key) => [key, value]));
}

describe("political compass local scorer", () => {
  it("returns an explicit neutral code instead of the worker's parenthesized placeholder", () => {
    expect(scorePoliticalCompass(answers("2"))).toBe("????");
  });

  it("applies the documented reverse-key before choosing each axis pole", () => {
    const high = answers("2");
    for (const key of POLITICAL_STEP_KEYS.flat()) {
      high[key] = POLITICAL_REVERSED_ITEMS.has(key) ? "1" : "3";
    }
    expect(scorePoliticalCompass(high)).toBe("MPGL");

    const low = answers("2");
    for (const key of POLITICAL_STEP_KEYS.flat()) {
      low[key] = POLITICAL_REVERSED_ITEMS.has(key) ? "3" : "1";
    }
    expect(scorePoliticalCompass(low)).toBe("ETNA");
  });

  it("anchors the state-power axis to authoritarian A and libertarian L", () => {
    const authoritarian = answers("2");
    for (const key of ["s4_1", "s4_2", "s4_3", "s4_4"]) authoritarian[key] = "3";
    expect(scorePoliticalCompass(authoritarian)).toBe("???A");

    const libertarian = answers("2");
    for (const key of ["s4_8", "s4_9", "s4_10", "s4_11"]) libertarian[key] = "3";
    expect(scorePoliticalCompass(libertarian)).toBe("???L");
  });

  it("rejects missing responses", () => {
    const incomplete = answers("2");
    delete incomplete.s4_11;
    expect(() => scorePoliticalCompass(incomplete)).toThrow("s4_11");
  });
});
