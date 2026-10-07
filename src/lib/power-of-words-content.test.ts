import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sources = [
  "https://doi.org/10.1016/S0092-6566(02)00534-2",
  "https://dictionary.apa.org/gaslight",
  "https://www.gordontraining.com/free-workplace-articles/active-listening/",
  "https://www.cnvc.org/certification/cpp/preparation/",
  "https://www.nonviolentcommunication.com/pdf_files/4part_nvc_process.pdf",
  "https://www.jstor.org/stable/4609267",
];

const boundaries = {
  ko: ["성공 공식은 아니에요", "OIYO 작성 예시", "거절", "위협이나 강요", "설문 개발과 타당화"],
  en: ["not a formula for success", "example written by OIYO", "refusal", "threats or coercion", "questionnaire development and validation"],
  ja: ["成功の公式ではありません", "OIYOが作った会話例", "断る", "脅しや強要", "質問紙の開発と妥当性検討"],
  zh: ["不是成功公式", "OIYO编写的例子", "拒绝", "威胁或强迫", "问卷开发与验证"],
  fr: ["pas d’une formule de réussite", "écrit par OIYO", "refuser", "menaces ou de coercition", "développement et validation d’un questionnaire"],
  es: ["no una fórmula de éxito", "lo escribió OIYO", "negarse", "amenazas o coacción", "desarrollo y validación de un cuestionario"],
};

function assertEvidenceBoundaries(article: string, locale: string, phrases: string[]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: general-psychology");
  expect(article).toContain("pubDate: 2026-02-19T00:00:00.000Z");
  expect(article).toMatch(/^updatedDate: \d{4}-\d{2}-\d{2}T00:00:00\.000Z$/m);
  for (const url of sources) expect(article).toContain(url);
  for (const phrase of phrases) expect(article).toContain(phrase);
  expect(article).not.toMatch(/非暴力仏教|재기적_예언/);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-07: these checks guard editorial evidence boundaries, not native fluency
// or scientific correctness. The primary-source review lives in company-brain.
describe("power-of-words evidence and localization boundaries", () => {
  for (const [locale, phrases] of Object.entries(boundaries)) {
    const article = readFileSync(new URL(`../content/articles/${locale}/power-of-words.mdx`, import.meta.url), "utf8");

    it(`preserves sources and localized limits in ${locale}`, () => {
      assertEvidenceBoundaries(article, locale, phrases);
    });

    it(`rejects missing sources and limits in ${locale}`, () => {
      // In-memory mutation leaves all public article files intact (2026-10-07).
      for (const required of [...sources, ...phrases]) {
        const missing = article.split(required).join("");
        expect(() => assertEvidenceBoundaries(missing, locale, phrases)).toThrow();
      }
    });

    it(`keeps practical dialogue tables outside code blocks in ${locale}`, () => {
      expect(article.match(/^\| ---/gm)).toHaveLength(2);
      expect(article).not.toContain("```");
      expect(article).not.toMatch(/^### (?:Stage|단계|段階)/m);
    });
  }
});
