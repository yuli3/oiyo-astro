import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MBTI_DEEP_DATA } from "./engines/interpretation/shards/mbti-deep-shards";
import { MBTI_LIFE_KO } from "./engines/interpretation/shards/mbti-life-ko";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://www.myersbriggs.org/my-mbti-personality-type/the-mbti-preferences/",
  "https://www.myersbriggs.org/unique-features-of-myers-briggs/type-dynamics-processes/",
  "https://www.myersbriggs.org/type-in-my-life/personality-type-and-careers/",
  "https://www.myersbriggs.org/type-in-my-life/personality-type-and-relationships/",
  "https://www.themyersbriggs.com/en-us/support/mbti-facts",
];

// 2026-10-09: guard reviewed links and static structure, not predictive validity.
// Native fluency and interpretation limits still need independent prose review.
describe("ISFJ reviewed reading boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/mbti-isfj.mdx`, import.meta.url), "utf8");
    it(`keeps official sources and accessible static explanation in ${locale}`, () => {
      expect(article).toContain(`locale: ${locale}`);
      expect(article).toContain("topic: mbti");
      expect(article).toMatch(/^pubDate: ['"]?2025-05-23['"]?$/m);
      expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
      for (const source of sources) expect(article).toContain(source);
      expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
      expect(article.match(/^## /gm)?.length).toBeGreaterThanOrEqual(6);
      expect(article).toContain(`](/${locale}/mbti/isfj/)`);
      expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
      expect(article).not.toMatch(/\bclient:\w+/);
      if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
    });
  }
  it("does not recommend partners by type and localizes cognitive limits", () => {
    expect(MBTI_LIFE_KO.ISFJ.relationship.matches).toEqual([]);
    for (const code of ["Si", "Fe", "Ti", "Ne"]) {
      for (const locale of locales) {
        expect(MBTI_DEEP_DATA.ISFJ.cognitiveReadings?.[code]?.[locale]?.length).toBeGreaterThan(30);
      }
    }
  });
});
