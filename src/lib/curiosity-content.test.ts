import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://mason.gmu.edu/~tkashdan/publications/curiosity_CEI_II_jrp.pdf",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC2770180/",
  "https://www.sciencedirect.com/science/article/pii/S0092656617301149",
  "https://www.sciencedirect.com/science/article/pii/S019188692030026X",
];
const limits = {
  ko: ["임상 기준이나 인구 규준", "번역이 제공된다는 사실", "효과를 보장하는 처방"],
  en: ["neither clinical thresholds nor population norms", "Having a translation available", "not prescriptions with guaranteed effects"],
  ja: ["臨床的基準でも人口の規準", "翻訳があること", "効果を保証する処方"],
  zh: ["不是临床标准或人群常模", "提供译文也不等于", "不是保证有效的处方"],
  fr: ["ni des critères cliniques ni des normes de population", "La disponibilité d’une traduction", "pas des prescriptions aux effets garantis"],
  es: ["umbrales clínicos ni baremos de población", "Que exista una traducción", "no prescripciones con efectos garantizados"],
};

function assertReading(article: string, locale: typeof locales[number]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: learning");
  expect(article).toContain("pubDate: '2026-06-23'");
  expect(article).toMatch(/^updatedDate: '\d{4}-\d{2}-\d{2}'$/m);
  for (const source of sources) expect(article).toContain(source);
  for (const phrase of limits[locale]) expect(article).toContain(phrase);
  for (const value of ["311", "150", "119", "r=.32", "r=.49", "10", "14"]) expect(article).toContain(value);
  expect(article).toContain(`](/${locale}/curiosity-test/)`);
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  if (locale !== "ko") {
    expect(article).not.toMatch(/[가-힣]/);
    expect(article).not.toContain("/ko/curiosity-test/");
  }
}

// 2026-10-08: these guards preserve reviewed evidence/locale boundaries. They
// cannot establish scale validity, native fluency, or actual mobile usability.
describe("curiosity reading and activity boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/magazine-curiosity-psychology.mdx`, import.meta.url), "utf8");
    it(`retains sources, limits and static explanation in ${locale}`, () => assertReading(article, locale));
    it(`rejects missing evidence/limits and code fences in ${locale}`, () => {
      for (const required of [...sources, ...limits[locale]]) {
        expect(() => assertReading(article.split(required).join(""), locale)).toThrow();
      }
      for (const fence of ["~~~", "```"]) {
        expect(() => assertReading(`${article}\n${fence}\nexample\n${fence}`, locale)).toThrow();
      }
    });
  }

  it("retains six 14-question sets and the existing editorial cutoffs", () => {
    const tool = readFileSync(new URL("../components/tests/CuriosityTest.tsx", import.meta.url), "utf8");
    const questions = tool.slice(tool.indexOf("const QUESTIONS:"), tool.indexOf("function calcLevel("));
    expect(questions.match(/id: '[se][1-7]'/g)).toHaveLength(84);
    expect(questions.match(/subscale: 'stretch'/g)).toHaveLength(42);
    expect(questions.match(/subscale: 'embrace'/g)).toHaveLength(42);
    expect(questions.match(/reverse: false/g)).toHaveLength(84);
    for (const cutoff of ["score <= 2.5", "score <= 3.5", "score <= 4.3"]) expect(tool).toContain(cutoff);
    expect(tool).toContain("const overall = (sScore + eScore) / 2");
    expect(tool).not.toContain("a healthy curiosity");
    expect(tool).not.toContain("성장과 창의성의 원천");
    expect(tool).not.toContain("Tolérance à l’incertitude");
    expect(tool).not.toContain("Tolerancia a la incertidumbre");
    const notes = [...tool.matchAll(/note: '([^'\n]+)'/g)];
    expect(notes).toHaveLength(6);
    for (const note of notes) {
      expect(note[1]).toContain("14");
      expect(note[1]).toContain("10");
      expect(note[1]).toContain("CEI-II");
    }
  });
});
