import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

// 2026-10-09: guard observed editorial contradictions, not relationship outcomes.
// Source review and full-language reading remain separate release requirements.
describe("love-language editorial reconciliation", () => {
  for (const locale of ["ko", "en"] as const) {
    const readArticle = () => readFileSync(new URL(`../content/articles/${locale}/love-languages-complete-guide.mdx`, import.meta.url), "utf8");
    it(`removes unsupported personality-to-language mappings in ${locale}`, () => {
      const article = readArticle();
      expect(article).not.toMatch(/주요 사랑의 언어 경향|Common love-language tendency/);
    });
    it(`preserves provenance and records the reviewed update in ${locale}`, () => {
      const article = readArticle();
      expect(article).toContain('pubDate: "2026-06-02"');
      expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
      expect(article).toContain("author: OIYO Editorial");
      expect(article).toContain("topic: relationship");
    });
    it(`states consent and provides directly inspectable sources in ${locale}`, () => {
      const article = readArticle();
      expect(article).toMatch(locale === "ko" ? /동의/ : /consent/i);
      expect(article).toMatch(/\]\(https:\/\//);
    });
  }
});

describe("love-language six-locale reading contracts", () => {
  for (const locale of ["ko", "en", "ja", "zh", "fr", "es"] as const) {
    it(`keeps source roles, static tables and local destinations in ${locale}`, () => {
      const article = readFileSync(new URL(`../content/articles/${locale}/love-languages-complete-guide.mdx`, import.meta.url), "utf8");
      expect(article).toContain(`locale: ${locale}`);
      expect(article).toContain("topic: relationship");
      expect(article).toMatch(/^pubDate: ['"]?2026-06-02['"]?$/m);
      expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
      expect(article.match(/^## /gm)).toHaveLength(7);
      expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
      for (const source of [
        "https://5lovelanguages.com/learn",
        "https://journals.sagepub.com/doi/10.1177/09637214231217663",
        "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0269429",
        "https://rainn.org/share-the-facts/consent-101-respect-boundaries-and-building-trust",
      ]) expect(article).toContain(source);
      expect(article).toContain("100");
      expect(article).toContain("OIYO");
      expect(article).toContain(`](/${locale}/love-language/test/)`);
      expect(article).toContain(`](/${locale}/love-profile-test/)`);
      expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
      expect(article).not.toMatch(/\bclient:\w+/);
      if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
    });
  }
});

describe("love-language result interpretation boundaries", () => {
  const component = () => readFileSync(new URL("../components/tests/LoveLanguageTest.tsx", import.meta.url), "utf8");
  it("preserves the existing questions, scoring, navigation, recording and share payload", () => {
    const source = component();
    const digest = (start: string, end: string) => createHash("sha256").update(source.slice(source.indexOf(start), source.indexOf(end))).digest("hex");
    // 2026-10-09: freeze the reviewed pre-edit interaction contract, not the editorial result copy.
    expect(digest("const PAIRS:", "const RESULTS:")).toBe("2fc3d63c0c3f97bdbb248255225e5d85efc38866cf142bdfca2bf529dc7cb5cf");
    expect(digest("  const initResult =", "  const finished =")).toBe("81a2399883169b62daf576b094f5c2467948efe451e4367b322383c0a21c9069");
  });
  it("does not present category-only shared links as measured zero scores", () => {
    const source = component();
    expect(source).toContain("const hasAnswerScores = answers.length === pairs.length");
    expect(source).toContain("{hasAnswerScores && <div");
    expect(source).toContain("!hasAnswerScores &&");
    expect(source).toContain("resultContext.sharedNote");
    expect(source).toContain('{hasAnswerScores && <p className="text-sm text-muted-foreground leading-relaxed">{resultContext.note}</p>}');
    expect(source).toContain('{hasAnswerScores && <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>}');
  });
  it("localizes counts and supplies readable count text beside the chart", () => {
    const source = component();
    expect(source).not.toContain("`${v}점`");
    expect(source).toContain("SELECTION_COUNT[locale](value)");
    expect(source).toContain("SELECTION_COUNT[locale](item.value)");
    expect(source).toContain("/${locale}/love-languages-complete-guide/");
  });
});
