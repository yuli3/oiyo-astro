import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  TarotCardFace,
  romanMajor,
  tarotMajorImageSrc,
} from "../../components/tools/TarotCardFace";

describe("romanMajor", () => {
  it("labels the fool and the world", () => {
    expect(romanMajor(0)).toBe("0");
    expect(romanMajor(21)).toBe("XXI");
  });
});

describe("tarot major artwork", () => {
  it("maps all 22 Major Arcana cards to committed WebP assets", () => {
    for (let id = 0; id <= 21; id += 1) {
      const src = tarotMajorImageSrc(id);
      expect(src).toBe(`/images/tarot-webp/tarot-${String(id).padStart(2, "0")}.webp`);
      expect(existsSync(resolve("public", src.slice(1)))).toBe(true);
    }
  });

  it("renders artwork instead of the fallback emoji glyph", () => {
    const html = renderToStaticMarkup(
      createElement(TarotCardFace, {
        name: "The Fool",
        imageSrc: tarotMajorImageSrc(0),
        symbol: "🌀",
        roman: "0",
      }),
    );

    expect(html).toContain('src="/images/tarot-webp/tarot-00.webp"');
    expect(html).not.toContain("🌀");
  });
});
