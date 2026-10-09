import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MBTI_DEEP_DATA } from "./engines/interpretation/shards/mbti-deep-shards";
import { MBTI_LIFE_KO } from "./engines/interpretation/shards/mbti-life-ko";

// 2026-10-09: these regressions reject observed editorial overclaims;
// passing them does not establish personality prediction or translation quality.
describe("ENFJ source reconciliation", () => {
  for (const locale of ["ko", "en"] as const) {
    const article = readFileSync(new URL(`../content/articles/${locale}/mbti-enfj.mdx`, import.meta.url), "utf8");
    it(`removes unsupported partner rankings and celebrity typing in ${locale}`, () => {
      expect(article).not.toMatch(/(?:1위:|2위:|3위:|1st:|2nd:|3rd:)/);
      expect(article).not.toMatch(/(?:Famous ENFJ Examples|유명인 예시)/);
      expect(article).not.toMatch(/(?:roughly \*\*2–3% of the population|전체 인구의 약 2~3%)/);
    });
    it(`retains provenance and supplies a reviewed update date in ${locale}`, () => {
      expect(article).toMatch(/^pubDate: ['"]?2025-05-23['"]?$/m);
      expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
      expect(article).toContain("topic: mbti");
    });
  }
});

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://myersbriggs.org/my-mbti-personality-type/my-mbti-results/home.htm",
  "https://www.myersbriggs.org/my-mbti-personality-type/the-16-mbti-personality-types/",
  "https://www.myersbriggs.org/unique-features-of-myers-briggs/type-dynamics-processes/",
  "https://www.myersbriggs.org/type-in-my-life/personality-type-and-relationships/",
  "https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/",
  "https://scholars.duke.edu/publication/1458465",
];

describe("ENFJ six-locale static reading contracts", () => {
  for (const locale of locales) {
    const readArticle = () => readFileSync(new URL(`../content/articles/${locale}/mbti-enfj.mdx`, import.meta.url), "utf8");
    it(`keeps provenance and source correspondence in ${locale}`, () => {
      const article = readArticle();
      expect(article).toContain(`locale: ${locale}`);
      expect(article).toContain("author: MBTI Research Team");
      expect(article).toContain("topic: mbti");
      expect(article).toMatch(/^pubDate: ['"]?2025-05-23['"]?$/m);
      expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
      for (const source of sources) expect(article).toContain(source);
    });
    it(`keeps readable static structure and local destinations in ${locale}`, () => {
      const article = readArticle();
      expect(article.match(/^## /gm)).toHaveLength(7);
      expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
      expect(article).toContain(`](/${locale}/mbti/enfj/)`);
      expect(article).toContain(`](/${locale}/mbti/test/)`);
      expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
      expect(article).not.toMatch(/\bclient:\w+/);
      if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
    });
    it(`retains the cited sample and distinguishes framework terms in ${locale}`, () => {
      const article = readArticle();
      for (const count of ["267", "201", "19", "93"]) expect(article).toContain(count);
      for (const term of ["Fe", "Ni", "Ti", "Se", "OIYO"]) expect(article).toContain(term);
      // 2026-10-09: preserve the reviewed concept without forcing English onto localized prose.
      const bigFive = locale === "zh" ? "大五人格" : locale === "es" ? "Cinco Grandes" : "Big Five";
      expect(article).toContain(bigFive);
    });
  }
  it("does not rank partners and localizes function theory limits", () => {
    expect(MBTI_LIFE_KO.ENFJ.relationship.matches).toEqual([]);
    for (const code of ["Fe", "Ni", "Se", "Ti"]) {
      for (const locale of locales) {
        expect(MBTI_DEEP_DATA.ENFJ.cognitiveReadings?.[code]?.[locale]?.length).toBeGreaterThan(30);
      }
    }
  });
  it("keeps reflection headings and the same limits in result and guide", () => {
    const result = readFileSync(new URL("../components/tests/MbtiPersonalityTest.tsx", import.meta.url), "utf8");
    const guide = readFileSync(new URL("../pages/[locale]/mbti/[type].astro", import.meta.url), "utf8");
    expect(result).toContain("시도할 행동 / 돌아볼 질문");
    expect(result).toContain("MBTI_DEEP_DATA.ENFJ.cognitiveReadings[fn.code]");
    expect(guide).toContain("시험해 볼 학습 방식");
    expect(guide).toContain("학습 탐색 예시");
    for (const locale of locales) {
      expect(MBTI_DEEP_DATA.ENFJ.worldview[locale]).not.toEqual(MBTI_DEEP_DATA.ENFJ.typeNarrative[locale]);
    }
  });
});
