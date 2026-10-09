import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC3102236/",
  "https://dbm.neuro.uni-jena.de/pdf-files/Draganski-Nature.pdf",
  "https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674",
  "https://repositorio.ispa.pt/bitstream/10400.12/3364/1/IJSP_998-1009.pdf",
];

// These reviewed caveats distinguish model estimates from observed clinical outcomes.
const reviewedLimits = {
  ko: ["전체 96명의 평균이나", "비학습 대조 집단", "치료를 대체하지"],
  en: ["not the mean for all 96", "nonlearning control groups", "do not replace treatment"],
  ja: ["96人全員の平均でも", "非学習の対照群", "治療の代わりにはならない"],
  zh: ["不是全部96人的平均值", "不学习的对照组", "生活习惯不能替代"],
  fr: ["ni la moyenne des 96", "témoin sans apprentissage", "ne remplacent pas un traitement"],
  es: ["No es la media de los 96", "control sin aprendizaje", "no sustituye el tratamiento"],
};

function assertReading(article: string, locale: typeof locales[number]) {
  for (const limit of reviewedLimits[locale]) expect(article).toContain(limit);
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: self");
  expect(article).toMatch(/^pubDate: ['"]?2025-01-16['"]?$/m);
  expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
  for (const source of sources) expect(article).toContain(source);
  expect(article).toContain("Draganski");
  expect(article).toContain("Lally");
  // French uses the standard localized abbreviation IRM, not English MRI.
  expect(article).toContain(locale === "fr" ? "IRM" : "MRI");
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article.match(/^## /gm)?.length).toBeGreaterThanOrEqual(4);
  expect(article).toContain(`](/${locale}/neuroplasticity-habit-formation/)`);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-09: retain reviewed methods/sources rather than propagate old claims.
// Source guards cannot establish clinical efficacy or native translation quality.
describe("Neuroplasticity learning reading boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/neuroplasticity-habits.mdx`, import.meta.url), "utf8");
    it(`keeps static explanations and sources in ${locale}`, () => assertReading(article, locale));
    it(`rejects missing sources and code fences in ${locale}`, () => {
      for (const source of sources) expect(() => assertReading(article.split(source).join(""), locale)).toThrow();
      for (const limit of reviewedLimits[locale]) expect(() => assertReading(article.split(limit).join(""), locale)).toThrow();
      expect(() => assertReading(`${article}\n~~~\nexample\n~~~`, locale)).toThrow();
    });
  }
});
