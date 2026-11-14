import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GutGardenSimulator } from "./GutGardenSimulator";

describe("gut habit reflection boundaries", () => {
  for (const locale of ["ko", "en", "ja", "zh", "fr", "es"]) {
    it(`keeps evidence and the localized reflection in the ${locale} article`, () => {
      const source = readFileSync(new URL(`../../../content/articles/${locale}/gut-microbiome-intuition.mdx`, import.meta.url), "utf8");
      expect(source).toContain(`locale: ${locale}`);
      expect(source).toContain(`locale="${locale}"`);
      expect(source).toContain("topic: self");
      expect(source).toContain("updatedDate: '2026-10-07'");
      for (const url of ["PMC4991899", "PMC3179073", "msystems.00031-18", "PMC9020749", "PMC11616606", "PMC11722650"]) {
        expect(source).toContain(url);
      }
      expect(source).toContain("| --- | --- | --- |");
      expect(source).not.toContain("```");
      if (locale !== "ko") expect(source).not.toMatch(/[가-힣]/);
    });
  }

  for (const locale of ["ko", "en", "ja", "zh", "fr", "es"]) {
    it(`renders localized inputs and a literal summary for ${locale}`, () => {
      const html = renderToStaticMarkup(<GutGardenSimulator locale={locale} />);
      expect(html.match(/<select/g)).toHaveLength(3);
      expect(html.match(/<dt /g)).toHaveLength(4);
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('type="range"');
      expect(html).toContain('min-h-11');
      expect(html).not.toMatch(/다양성 신호|장벽 부담 신호|Diversity signal|Gut burden signal|多様性のサイン|腸への負担サイン/);
      if (locale !== "ko") expect(html).not.toMatch(/[가-힣]/);
    });
  }

  it("uses intensity rather than frequency for stress", () => {
    const html = renderToStaticMarkup(<GutGardenSimulator locale="en" />);
    expect(html).toContain('value="1" selected="">Medium');
    expect(html).toContain("does not measure or diagnose");
    expect(html).toContain("Nothing is saved or sent");
    expect(html).toContain("Changes occurring together do not establish a cause");
  });
});
