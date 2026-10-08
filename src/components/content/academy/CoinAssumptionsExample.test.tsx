import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assumedNextHeadsProbability, CoinAssumptionsExample } from "./CoinAssumptionsExample";

// 2026-10-08: protect the placement corrections from the independent review.
// Link presence is a regression guard, not proof that a claim is scientifically true.
function reviewedSectionsHaveSources(source: string): boolean {
  return [2, 3, 10, 13, 14, 19].every((number) => {
    const section = source.match(new RegExp(`^### ${number}\\. [^\\n]+\\n([\\s\\S]*?)(?=^### |^## |$(?![\\s\\S]))`, "m"));
    return !!section && /\[[^\]]+\]\(https:\/\/[^)]+\)/.test(section[1]);
  });
}

describe("six-locale source placement regression", () => {
  for (const locale of ["ko", "en", "ja", "zh", "fr", "es"] as const) {
    const source = readFileSync(new URL(`../../../content/articles/${locale}/cognitive-bias-complete-guide.mdx`, import.meta.url), "utf8");
    it(`keeps the reviewed concepts and nearby sources in ${locale}`, () => {
      expect(source.match(/^### \d+\./gm)).toHaveLength(20);
      expect(reviewedSectionsHaveSources(source)).toBe(true);
      expect(source).toContain(`/${locale}/cognitive-bias-test/`);
      expect(source).toContain(`locale="${locale}" client:visible`);
    });
    it(`rejects a missing source in the reviewed section in ${locale}`, () => {
      const sectionStart = source.indexOf("### 19.");
      const sectionEnd = source.indexOf("### 20.", sectionStart);
      const mutated = source.slice(0, sectionStart)
        + source.slice(sectionStart, sectionEnd).replace(/\[[^\]]+\]\(https:\/\/[^)]+\)/g, "")
        + source.slice(sectionEnd);
      expect(reviewedSectionsHaveSources(mutated)).toBe(false);
    });
  }
});

describe("coin example assumption boundaries", () => {
  // 2026-10-08: multiple explanations may share a page; each accessible
  // description must still resolve to its own instance, not another example.
  it("keeps accessible references unique when two examples share a page", () => {
    const html = renderToStaticMarkup(<><CoinAssumptionsExample /><CoinAssumptionsExample /></>);
    const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
    for (const match of html.matchAll(/aria-(?:labelledby|describedby)="([^"]+)"/g)) {
      for (const reference of match[1].split(" ")) expect(ids).toContain(reference);
    }
  });

  it("requires both fairness and independence, without inventing a replacement probability", () => {
    expect(assumedNextHeadsProbability(true, true)).toBe(0.5);
    expect(assumedNextHeadsProbability(false, true)).toBeNull();
    expect(assumedNextHeadsProbability(true, false)).toBeNull();
    expect(assumedNextHeadsProbability(false, false)).toBeNull();
  });

  for (const locale of ["ko", "en", "ja", "zh", "fr", "es"] as const) {
    it(`renders labeled assumptions and the static default explanation in ${locale}`, () => {
      const html = renderToStaticMarkup(<CoinAssumptionsExample locale={locale} />);
      expect(html.match(/type="checkbox"/g)).toHaveLength(2);
      expect(html.match(/checked=""/g)).toHaveLength(2);
      expect(html.match(/<label /g)).toHaveLength(2);
      expect(html).toContain("50%");
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('aria-atomic="true"');
      expect(html).toContain("aria-describedby=");
      expect(html).toContain("min-h-11");
      expect(html).not.toMatch(/<canvas|<svg|<style|style="/);
      if (locale !== "ko") expect(html).not.toMatch(/[가-힣]/);
    });
  }
});
