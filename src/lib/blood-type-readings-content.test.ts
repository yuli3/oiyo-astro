import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readings = ["blood-type-personality-complete", "fortune-blood-type-psychology"];
const locales = ["ko", "en", "ja", "zh", "fr", "es"];
// Only phrases read in saved drafts belong here; add other locales after review.
const reviewedScope = {
  ko: ["작은 유의 차이", "개인", "횡단면", "검색 반환"],
  en: ["small significant difference", "individual", "cross-sectional", "search returns"],
  ja: ["小さな有意差", "個人", "横断", "検索結果"],
  zh: ["小幅显著差异", "个人", "横断", "搜索返回"],
  fr: ["différence", "individu", "transversal", "résultats de recherche"],
  es: ["diferencia", "individual", "transversal", "resultados de búsqueda"],
};

// Normalize only integer grouping, so localized spacing cannot hide a wrong count.
function readArticle(locale: string, slug: string) {
  return readFileSync(new URL(`../content/articles/${locale}/${slug}.mdx`, import.meta.url), "utf8")
    .replace(/(\d)[\u00a0\u202f ](?=\d{3}(?:\D|$))/g, "$1,");
}
const sources = [
  "https://www.jstage.jst.go.jp/article/jjpsy/85/2/85_85.13016/_article",
  "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0126983",
  "https://www.jstage.jst.go.jp/article/jjpsy/85/2/85_85.13016/_pdf/-char/en",
  "https://www.sciencedirect.com/science/article/pii/S0191886902001010",
  "https://www.ncbi.nlm.nih.gov/sites/books/NBK2267/?report=printable",
  "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0084749",
];

// 2026-10-09: preserve contradictory study results rather than a blanket null claim.
// These source guards do not validate personality prediction or clinical advice.
function assertEvidence(article: string, locale: string) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toMatch(/^topic: blood-type$/m);
  expect(article).toMatch(/^updatedDate: 2026-10-09$/m);
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  for (const source of sources) expect(article).toContain(source);
  expect(article).toContain("1,427");
  expect(article).toContain("Persistence");
  // Papers use both .006 and 0.006 notation for the same effect-size value.
  expect(article).toMatch(/(?:0)?\.006/);
  expect(article).toMatch(/(?:0)?\.010/);
  expect(article).not.toContain("ABO 혈액형과의 관련은 나타나지 않았습니다");
  expect(article).not.toContain("O형이 리드, A형이 따름");
  expect(article).not.toContain("고단백 식이, 과격한 운동 주의");
  expect(article).not.toContain("혈액형과 성격의 상관관계를 발견합니다");
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

describe("Blood type readings respect the studies they cite", () => {
  for (const slug of readings) {
    for (const locale of locales) {
    const readCurrentArticle = () => readArticle(locale, slug);
    it(`keeps evidence boundaries for ${locale}/${slug}`, () => {
      const article = readCurrentArticle();
      assertEvidence(article, locale);
      const other = readings.find((reading) => reading !== slug);
      expect(article).toContain(`](/${locale}/${other}/)`);
      expect(article).toContain(slug === "blood-type-personality-complete" ? "2026-06-01" : "2025-05-23");
    });
    it(`rejects removed original source links for ${locale}/${slug}`, () => {
      const article = readCurrentArticle();
      for (const source of sources) expect(() => assertEvidence(article.split(source).join(""), locale)).toThrow();
    });
    it(`rejects losing the non-null result and analysis denominator for ${locale}/${slug}`, () => {
      const article = readCurrentArticle();
      for (const boundary of ["1,427", "Persistence", ".006", ".010"]) {
        expect(() => assertEvidence(article.split(boundary).join(""), locale)).toThrow();
      }
    });
    }
  }
});

describe("Reviewed translations retain result and access boundaries", () => {
  for (const [locale, phrases] of Object.entries(reviewedScope)) {
    for (const slug of readings) {
      const readCurrentArticle = () => readArticle(locale, slug);
      const assertScope = (article: string) => {
        for (const phrase of phrases) expect(article).toContain(phrase);
      };
      it(`keeps reviewed scope in ${locale}/${slug}`, () => assertScope(readCurrentArticle()));
      it(`detects removed scope in ${locale}/${slug}`, () => {
        const article = readCurrentArticle();
        for (const phrase of phrases) {
          expect(() => assertScope(article.split(phrase).join(""))).toThrow();
        }
      });
    }
  }
});
