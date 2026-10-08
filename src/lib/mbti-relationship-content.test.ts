import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sources = [
  "https://www.myersbriggs.org/type-in-my-life/personality-type-and-relationships/",
  "https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/",
  "https://www.myersbriggs.org/unique-features-of-myers-briggs/type-dynamics-processes/",
  "https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/",
];

const boundaries = {
  ko: ["편집부 가상 사례", "독립 연구는 아니에요", "제3기능", "공식 MBTI 검사나 임상 진단", "결과를 말하거나 공유하고 싶지 않다면"],
  en: ["fictional editorial example", "not independent research", "tertiary function", "official MBTI assessment, a clinical diagnosis", "choice not to discuss or share"],
  ja: ["架空の例", "独立した研究ではありません", "第3機能", "公式MBTIのアセスメント、臨床診断", "結果を話したり共有したりしたくない"],
  zh: ["虚构例子", "独立研究", "第三功能", "官方MBTI测评、临床诊断", "不想讨论或分享结果"],
  fr: ["cas fictif", "pas une étude indépendante", "fonction tertiaire", "l’évaluation MBTI officielle, ni comme un diagnostic clinique", "choix de ne pas parler de ses résultats"],
  es: ["ejemplo ficticio", "no un estudio independiente", "función terciaria", "evaluación MBTI oficial, un diagnóstico clínico", "decisión de no hablar de los resultados"],
};

function assertBoundaries(article: string, locale: string, phrases: readonly string[]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: mbti");
  expect(article).toContain('pubDate: "2026-06-01"');
  expect(article).toMatch(/^updatedDate: "\d{4}-\d{2}-\d{2}"$/m);
  for (const source of sources) expect(article).toContain(source);
  for (const phrase of phrases) expect(article).toContain(phrase);
  expect(article).toContain(`](/${locale}/mbti/test/)`);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

function assertStaticExplanation(article: string) {
  expect(article.match(/^## /gm)).toHaveLength(8);
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article.match(/<LectureProcess\b/g)).toHaveLength(1);
  expect(article.match(/\{ label:/g)).toHaveLength(4);
  for (const pair of ["E / I", "S / N", "T / F", "J / P"]) expect(article).toContain(pair);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
}

// 2026-10-08: guard the reviewed source/locale/editorial boundaries, not scientific
// validity or native fluency. Independent review and evidence are in company-brain.
describe("MBTI relationship reading evidence boundaries", () => {
  for (const [locale, phrases] of Object.entries(boundaries)) {
    const article = readFileSync(new URL(`../content/articles/${locale}/mbti-relationship-patterns.mdx`, import.meta.url), "utf8");

    it(`keeps primary links and localized limits in ${locale}`, () => {
      assertBoundaries(article, locale, phrases);
    });

    it(`rejects missing sources or boundaries in ${locale}`, () => {
      // Mutations stay in memory so editorial originals cannot be overwritten.
      for (const required of [...sources, ...phrases]) {
        expect(() => assertBoundaries(article.split(required).join(""), locale, phrases)).toThrow();
      }
    });

    it(`keeps two tables and four explanation steps outside code blocks in ${locale}`, () => {
      assertStaticExplanation(article);
    });

    it(`rejects both fenced-code styles and hydration directives in ${locale}`, () => {
      for (const fence of ["```", "~~~"]) {
        expect(() => assertStaticExplanation(`${article}\n${fence}\nexample\n${fence}\n`)).toThrow();
      }
      for (const mode of ["load", "idle", "visible", "only", "media"]) {
        expect(() => assertStaticExplanation(`${article}\n<Example client:${mode} />\n`)).toThrow();
      }
    });
  }
});
