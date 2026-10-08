import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://svs.gsfc.nasa.gov/5326",
  "https://www.astro.com/astrowiki/en/Synastry",
  "https://www.astro.com/astrowiki/en/Aspects",
  "https://www.astro.com/astrowiki/en/Orb",
  "https://www.astro.com/faq/fq_de_time_e.htm",
  "https://www.nature.com/articles/318419a0",
  "https://www.nhs.uk/live-well/getting-help-for-domestic-violence/",
];
const limits = {
  ko: ["3차원 하늘의 각거리", "관계를 지속할 의무도", "논문 전문 추출에 실패"],
  en: ["three-dimensional angular separation", "obligation to continue the relationship", "Full-text extraction failed"],
  ja: ["空の三次元の角距離", "関係を続ける義務", "論文全文の抽出には失敗"],
  zh: ["天空中的三维角距离", "继续关系的义务", "未能成功提取论文全文"],
  fr: ["séparation angulaire tridimensionnelle", "obligation de poursuivre la relation", "L’extraction du texte intégral a échoué"],
  es: ["separación angular tridimensional", "obligación de continuar la relación", "falló la extracción del texto completo"],
};

function assertReading(article: string, locale: typeof locales[number]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: astrology");
  expect(article).toContain("pubDate: '2024-10-24'");
  expect(article).toMatch(/^updatedDate: '\d{4}-\d{2}-\d{2}'$/m);
  for (const source of sources) expect(article).toContain(source);
  for (const limit of limits[locale]) expect(article).toContain(limit);
  for (const example of ["min(|a−b|, 360−|a−b|)", "a=350°", "b=10°", "20°"]) expect(article).toContain(example);
  expect(article).toContain(`](/${locale}/circle/pair/)`);
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  expect(article).not.toContain("Scientific Mysticism");
  expect(article).not.toContain("30+ years");
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-08: these guards retain reviewed evidence and consent boundaries.
// They do not test an astrology engine, predictive validity, or mobile controls.
describe("synastry reading evidence boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/synastry-soul-contracts.mdx`, import.meta.url), "utf8");
    it(`retains direct sources and limits in ${locale}`, () => assertReading(article, locale));
    it(`rejects missing sources, limits and code fences in ${locale}`, () => {
      for (const required of [...sources, ...limits[locale]]) {
        expect(() => assertReading(article.split(required).join(""), locale)).toThrow();
      }
      expect(() => assertReading(`${article}\n~~~\nexample\n~~~`, locale)).toThrow();
    });
  }
});
