import { describe, expect, it } from "vitest";
import { romanMajor } from "../../components/tools/TarotCardFace";

describe("romanMajor", () => {
  it("labels the fool and the world", () => {
    expect(romanMajor(0)).toBe("0");
    expect(romanMajor(21)).toBe("XXI");
  });
});
