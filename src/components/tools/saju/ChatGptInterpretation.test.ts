import { describe, expect, it } from "vitest";

import { splitParagraphs } from "./ChatGptInterpretation";

describe("ChatGPT interpretation paragraphs", () => {
  it("separates the basis values from each paragraph", () => {
    expect(splitParagraphs("[일간 甲, 목 3] 곧게 뻗는 기질.\n\n근거 없는 문단.")).toEqual([
      { basis: "일간 甲, 목 3", text: "곧게 뻗는 기질." },
      { basis: null, text: "근거 없는 문단." },
    ]);
  });
});
