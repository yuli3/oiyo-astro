import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
  "https://www.nimh.nih.gov/health/publications/generalized-anxiety-disorder-gad",
  "https://dbm.neuro.uni-jena.de/pdf-files/Draganski-Nature.pdf",
  "https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674",
];

// Preserve treatment boundaries and prevent turning fitted habit estimates into deadlines.
const reviewedLimits = {
  ko: ["전체 96명의 평균도", "생활습관은 전문적인 치료를 대신하지 않아요", "비학습 대조 집단"],
  en: ["neither the mean for all 96", "Lifestyle measures do not replace professional treatment", "nonlearning control group"],
  ja: ["96人全員の平均でも", "生活習慣は専門的治療の代わりになりません", "非学習対照群"],
  zh: ["不是全部96人的平均值", "生活习惯不能替代专业治疗", "不学习对照组"],
  fr: ["ni la moyenne des 96", "Les habitudes de vie ne remplacent pas le traitement professionnel", "témoin sans apprentissage"],
  es: ["No es la media de los 96", "El estilo de vida no sustituye el tratamiento profesional", "control sin aprendizaje"],
};

function assertReading(article: string, locale: typeof locales[number]) {
  for (const limit of reviewedLimits[locale]) expect(article).toContain(limit);
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: self");
  expect(article).toMatch(/^pubDate: ['"]?2025-06-03['"]?$/m);
  expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
  for (const source of sources) expect(article).toContain(source);
  expect(article).toContain("NIMH");
  expect(article).toContain("Lally");
  // French uses the standard localized abbreviation IRM, not English MRI.
  expect(article).toContain(locale === "fr" ? "IRM" : "MRI");
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article.match(/^## /gm)?.length).toBeGreaterThanOrEqual(4);
  expect(article).toContain(`](/${locale}/neuroplasticity-habits/)`);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  expect(article).not.toContain("elle peut êtr...");
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-09: prevent losing the scope/clinical source context during translation.
// This test does not diagnose anxiety or validate an intervention or treatment.
describe("Neuroplasticity anxiety reading boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/neuroplasticity-habit-formation.mdx`, import.meta.url), "utf8");
    it(`keeps static explanations and sources in ${locale}`, () => assertReading(article, locale));
    it(`rejects missing sources and code fences in ${locale}`, () => {
      for (const source of sources) expect(() => assertReading(article.split(source).join(""), locale)).toThrow();
      for (const limit of reviewedLimits[locale]) expect(() => assertReading(article.split(limit).join(""), locale)).toThrow();
      expect(() => assertReading(`${article}\n~~~\nexample\n~~~`, locale)).toThrow();
    });
  }
});
