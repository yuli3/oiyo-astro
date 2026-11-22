import { describe, expect, it } from "vitest";
import data from "../../public/data/sillok-1426-chars.json";
import { dayParts, lookup, parseName, tierOf, type CharData } from "./sillok-name-hanja";

const D = data as unknown as CharData;

describe("sillok-name-hanja", () => {
  it("has the counts noted in the season-3 plan", () => {
    expect(D.entries).toBe(1149);
    expect(D.c["民"]![0]).toBe(287);
    expect(D.c["恩"]![0]).toBe(66);
    expect(D.c["賢"]![0]).toBe(31);
    expect(D.c["秀"]![0]).toBe(8);
    expect(D.c["之"]![1]).toBe(1);
  });

  it("parses hanja, maps variants and flags hangul", () => {
    expect(parseName("민 民恩")).toEqual({ chars: ["民", "恩"], hangul: true });
    expect(lookup(parseName("為").chars, D)[0]!.ch).toBe("爲");
    expect(parseName("一二三四五").chars).toHaveLength(4);
  });

  it("grades by the rarest character", () => {
    expect(tierOf(lookup(["民", "之"], D))).toBe("regular");
    expect(tierOf(lookup(["民", "恩"], D))).toBe("guest");
    expect(tierOf(lookup(["民", "秀"], D))).toBe("rare");
    expect(tierOf(lookup(["民", "鑫"], D))).toBe("absent");
    expect(dayParts("12-30")).toEqual({ month: 12, day: 30 });
  });

  it("snippets contain their character", () => {
    for (const [ch, row] of Object.entries(D.c).slice(0, 300)) expect(row[4]).toContain(ch);
  });
});
