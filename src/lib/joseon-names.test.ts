import { describe, expect, it } from "vitest";
import { CHILD_NAMES, ELEMENTS, formatNames, genFirst, makeNames, namesOf, nextElement, parseNames } from "./joseon-names";

describe("joseon-names", () => {
  it("follows the 오행상생 order and wraps", () => {
    expect(ELEMENTS.map((e) => e.hanja).join("")).toBe("木火土金水");
    expect(nextElement(4)).toBe(0);
  });

  it("puts the generation character in the formal name", () => {
    for (let k = 0; k < 200; k += 1) {
      const n = makeNames(k % 2 ? "m" : "f");
      const r = namesOf(n);
      expect(CHILD_NAMES).toContain(r.child);
      expect(r.formal.hanja).toHaveLength(3);
      expect(r.formal.hangul).toHaveLength(3);
      expect(r.formal.hanja.indexOf(r.gen.hanja)).toBe(genFirst(n) ? 1 : 2);
      expect(r.ja.hanja).toHaveLength(2);
      expect(r.ho.hanja).toHaveLength(2);
      expect(r.lady).toMatch(/^.씨 부인$/);
    }
  });

  it("round-trips the share link and rejects junk", () => {
    const n = makeNames("m", () => 0.55);
    expect(parseNames(formatNames(n))).toEqual(n);
    expect(parseNames("x=q&v=1")).toBeNull();
    expect(parseNames(formatNames({ ...n, el: 9 }))).toBeNull();
  });
});
