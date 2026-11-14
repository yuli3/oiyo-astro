import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://www.astro.com/astrowiki/en/aquarius",
  "https://nightsky.jpl.nasa.gov/documents/850/SolSysStarMaps2.pdf",
  "https://www.nature.com/articles/318419a0",
  "https://helmuthnyborg.dk/wp-content/uploads/2016/07/Publ_2006_Date-of-birth.pdf",
];
const reviewedLimits = {
  ko: ["모든 연애·직업·미래 사건을 직접 시험한 연구는 아니에요", "방법과 결과 전문은 검토하지 않았어요", "직접 본문은 열리지 않았어요", "상대의 동의나 실제 행동"],
  en: ["It did not directly test every romantic, occupational or future event prediction", "the full methods and results were not reviewed", "direct body access failed", "cannot replace consent"],
  ja: ["すべての恋愛・仕事・未来の出来事を直接調べた研究ではありません", "方法と結果の全文は検討していません", "直接の本文にはアクセスできませんでした", "相手の同意や実際の行動"],
  zh: ["不是直接检验了所有恋爱、职业或未来事件预测", "没有审阅完整的方法和结果", "直接正文访问失败", "不能代替对方的同意"],
  fr: ["Elle ne testait pas directement toutes les prédictions amoureuses, professionnelles ou d’événements futurs", "sans examiner l’intégralité des méthodes et résultats", "l’accès direct au corps du texte a échoué", "sans remplacer le consentement"],
  es: ["No probó directamente todas las predicciones románticas, profesionales o de acontecimientos futuros", "no revisamos los métodos y resultados completos", "el acceso directo al cuerpo del texto falló", "no sustituyen el consentimiento"],
};

function assertReading(article: string, locale: typeof locales[number]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: astrology");
  expect(article).toMatch(/^pubDate: ['"]?2026-03-31['"]?$/m);
  expect(article).toMatch(/^updatedDate: ['"]?2026-10-08['"]?$/m);
  for (const source of sources) expect(article).toContain(source);
  for (const limit of reviewedLimits[locale]) expect(article).toContain(limit);
  expect(article).toContain("Carlson");
  expect(article).toContain("Hartmann");
  expect(article).toContain("CPI");
  expect(article).toContain("30°");
  expect(article.match(/^## /gm)?.length).toBeGreaterThanOrEqual(6);
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article).toContain(`](/${locale}/zodiac/compatibility/)`);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  expect(article).not.toMatch(/Elon Musk|Eddie Murphy|일론 머스크|에디 머피/);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-08: protect the reviewed source links and static explanation structure.
// These source guards do not establish astrology's validity or native fluency;
// research-scope and consent meanings require an independent prose review.
describe("Aquarius reading source boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/zodiac-aquarius-complete-guide.mdx`, import.meta.url), "utf8");
    it(`retains reviewed sources and static explanations in ${locale}`, () => assertReading(article, locale));
    it(`rejects lost sources and code fences in ${locale}`, () => {
      for (const required of [...sources, ...reviewedLimits[locale]]) {
        expect(() => assertReading(article.split(required).join(""), locale)).toThrow();
      }
      expect(() => assertReading(`${article}\n~~~\nexample\n~~~`, locale)).toThrow();
    });
  }
});
