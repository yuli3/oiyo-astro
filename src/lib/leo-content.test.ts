import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locales = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const sources = [
  "https://www.astro.com/astrowiki/en/Leo",
  "https://science.nasa.gov/sun/facts/",
  "https://science.nasa.gov/earth/facts/",
  "https://nightsky.jpl.nasa.gov/documents/850/SolSysStarMaps2.pdf",
  "https://www.astro.com/astrowiki/en/Houses",
  "https://www.nature.com/articles/318419a0",
  "https://muller.lbl.gov/papers/Astrology-Carlson.pdf",
  "https://helmuthnyborg.dk/wp-content/uploads/2016/07/Publ_2006_Date-of-birth.pdf",
];
const reviewedLimits = {
  ko: ["모든 연애·직업·미래 사건을 직접 시험한 연구로 확대하지 않아요", "방법 전체 검토나 재분석은 하지 않았어요", "상대를 계속 칭찬해야 하는 것도 아니에요"],
  en: ["It did not directly test every romantic, occupational or future event prediction", "without reviewing all methods or reanalysing the data", "a person does not have to keep offering praise"],
  ja: ["恋愛・職業・未来のあらゆる出来事を直接試した研究とは読まないでください", "方法全体の検討や再分析は行っていません", "相手を褒め続ける必要もありません"],
  zh: ["不要把它扩大为直接检验所有恋爱、职业或未来事件预测的研究", "没有审阅完整方法或重新分析数据", "不必持续赞美对方"],
  fr: ["Elle ne testait pas directement toutes les prédictions amoureuses, professionnelles ou d’événements futurs", "sans examen de l’ensemble des méthodes ni réanalyse", "personne ne doit complimenter sans cesse"],
  es: ["No probó directamente todas las predicciones románticas, profesionales o de acontecimientos futuros", "sin revisar todos los métodos ni realizar un nuevo análisis", "nadie tiene que elogiar constantemente"],
};

function assertReading(article: string, locale: typeof locales[number]) {
  expect(article).toContain(`locale: ${locale}`);
  expect(article).toContain("topic: astrology");
  expect(article).toMatch(/^pubDate: ['"]?2026-03-31['"]?$/m);
  expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
  for (const source of sources) expect(article).toContain(source);
  for (const limit of reviewedLimits[locale]) expect(article).toContain(limit);
  expect(article).toContain("Carlson");
  expect(article).toContain("Hartmann");
  expect(article).toContain("CPI");
  expect(article).toContain("30°");
  expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
  expect(article.match(/^## /gm)?.length).toBeGreaterThanOrEqual(6);
  expect(article).toContain(`](/${locale}/zodiac/compatibility/)`);
  expect(article).toContain(`](/${locale}/zodiac-compatibility-complete-guide/)`);
  expect(article).not.toMatch(/^ {0,3}(?:`{3,}|~{3,})/m);
  expect(article).not.toMatch(/\bclient:\w+/);
  expect(article).not.toMatch(/Barack Obama|Coco Chanel|Kobe Bryant|아이유|코비 브라이언트|コービー/);
  if (locale !== "ko") expect(article).not.toMatch(/[가-힣]/);
}

// 2026-10-09: freeze reviewed sources, static explanations and own-locale links.
// Passing these guards is not evidence of astrology's validity or native fluency.
describe("Leo reading source boundaries", () => {
  for (const locale of locales) {
    const article = readFileSync(new URL(`../content/articles/${locale}/zodiac-leo-complete-guide.mdx`, import.meta.url), "utf8");
    it(`retains reviewed sources and explanations in ${locale}`, () => assertReading(article, locale));
    it(`rejects lost sources and fenced substitutes in ${locale}`, () => {
      for (const source of [...sources, ...reviewedLimits[locale]]) {
        expect(() => assertReading(article.split(source).join(""), locale)).toThrow();
      }
      expect(() => assertReading(`${article}\n~~~\nexample\n~~~`, locale)).toThrow();
    });
  }
});
