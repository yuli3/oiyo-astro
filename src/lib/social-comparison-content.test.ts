import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://www2.psych.ubc.ca/~schaller/528Readings/Festinger1954.pdf",
  "https://pure.rug.nl/ws/files/257117700/Individual_differences_in_social_comparison_The_development.pdf",
  "https://taylorlab.psych.ucla.edu/wp-content/uploads/sites/5/2014/10/1990_The-Affective-Consequences-of-Social-Comparison.pdf",
  "https://pubmed.ncbi.nlm.nih.gov/7551772/",
  "https://ppw.kuleuven.be/okp/_pdf/Verduyn2015PFUUA.pdf",
];

function assertReading(article: string, locale: typeof locales[number]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: social");
  expect(article).toContain("pubDate: '2026-06-23'");
  expect(article).toMatch(/^updatedDate: '\d{4}-\d{2}-\d{2}'$/m);
  for (const source of sources) expect(article).toContain(source);
  for (const value of ["INCOM", "11", "14", "55", "632", "84", "67", "89"]) expect(article).toContain(value);
  expect(article).toContain(`](/${locale}/social-comparison-test/)`);
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-08: source guards preserve the reviewed evidence and locale boundaries;
// they do not establish scale validity, native fluency, or mobile usability.
describe("social comparison evidence boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/magazine-social-comparison-psychology.mdx`, import.meta.url), "utf8");
    it(`retains sources and static explanations in ${locale}`, () => assertReading(article, locale));
    it(`rejects missing sources and code fences in ${locale}`, () => {
      for (const source of sources) {
        expect(() => assertReading(article.split(source).join(""), locale)).toThrow();
      }
      expect(() => assertReading(`${article}\n~~~\nexample\n~~~`, locale)).toThrow();
    });
  }
  it("preserves question sets and editorial scoring boundaries", () => {
    const tool = readFileSync(new URL("../components/tests/SocialComparisonTest.tsx", import.meta.url), "utf8");
    const questions = tool.slice(tool.indexOf("const QUESTIONS:"), tool.indexOf("function calcLevel("));
    expect(questions.match(/id: '[ao][1-7]'/g)).toHaveLength(84);
    expect(questions.match(/subscale: 'ability'/g)).toHaveLength(42);
    expect(questions.match(/subscale: 'opinion'/g)).toHaveLength(42);
    expect(questions.match(/reverse: false/g)).toHaveLength(84);
    for (const cutoff of ["score <= 2.3", "score <= 3.2", "score <= 4.0"]) expect(tool).toContain(cutoff);
    expect(tool).toContain("const overall = (aScore + oScore) / 2");
    const notes = [...tool.matchAll(/note: '([^'\n]+)'/g)];
    expect(notes).toHaveLength(6);
    for (const note of notes) {
      for (const marker of ["11", "14", "INCOM"]) expect(note[1]).toContain(marker);
    }
  });
});
