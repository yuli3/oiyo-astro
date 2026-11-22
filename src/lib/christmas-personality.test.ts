import { describe, expect, it } from "vitest";
import { XMAS_QUESTIONS, XMAS_RESULTS, XMAS_TYPES, xmasResult } from "@/data/christmas-personality";

describe("christmas personality", () => {
  it("every locale has 8 questions, each covering all 5 types once", () => {
    for (const qs of Object.values(XMAS_QUESTIONS)) {
      expect(qs).toHaveLength(8);
      for (const q of qs) expect(q.options.map(([, t]) => t).sort()).toEqual([...XMAS_TYPES].sort());
    }
  });
  it("every type has a result in 6 languages and a different match", () => {
    for (const t of XMAS_TYPES) {
      expect(Object.keys(XMAS_RESULTS[t]).sort()).toEqual(["en", "es", "fr", "ja", "ko", "zh"]);
      expect(XMAS_RESULTS[t].ko.match).not.toBe(t);
    }
  });
  it("majority wins; ties go to the most recent answer", () => {
    expect(xmasResult(["santa", "santa", "tree"])).toBe("santa");
    expect(xmasResult(["santa", "tree"])).toBe("tree");
  });
});
