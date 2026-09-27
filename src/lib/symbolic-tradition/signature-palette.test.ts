import { describe, expect, it } from "vitest";

import { FiveElement } from "@/lib/ontology/saju/types";
import { signaturePalette } from "./signature-palette";

describe("signaturePalette", () => {
  it("keeps other symbolic axes visible when everyone has the same day-master element", () => {
    const a = signaturePalette(FiveElement.WOOD, "air", "red");
    const b = signaturePalette(FiveElement.WOOD, "water", "blue");
    expect(a[0]).toBe(b[0]);
    expect(a[1]).not.toBe(b[1]);
    expect(a[2]).not.toBe(b[2]);
  });

  it("uses the known sun element instead of inventing a missing Maya color", () => {
    const palette = signaturePalette(FiveElement.EARTH, "fire");
    expect(palette[2]).toBe(palette[1]);
  });
});
