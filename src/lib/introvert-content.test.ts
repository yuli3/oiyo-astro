import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

// 2026-10-09: reject observed deterministic editorial claims; this is not evidence for a brain mechanism.
describe("introversion reading source boundaries", () => {
  it("does not promise inferred abilities or careers in the connected result screen", () => {
    const component = readFileSync(new URL("../components/tests/IntroExtroTest.tsx", import.meta.url), "utf8");
    expect(component).not.toContain("깊은 사고와 분석 능력");
    expect(component).not.toContain("영업, 마케팅, 교육, 이벤트 기획");
    expect(component).not.toContain("Most people actually fall somewhere in the middle");
    expect(component).not.toContain("칼 융(Carl Jung)의 성격 이론에 기반");
  });
  it("preserves existing questions, scoring bands and answer calculation during editorial correction", () => {
    const component = readFileSync(new URL("../components/tests/IntroExtroTest.tsx", import.meta.url), "utf8");
    // 2026-10-09: freeze the pre-edit source while correcting prose; this does not validate the instrument.
    const digest = (start: string, end: string) => createHash("sha256")
      .update(component.slice(component.indexOf(start), component.indexOf(end))).digest("hex");
    expect(digest("const questions:", "const scaleLabels:")).toBe("beee2da3426306b7daf324ef10f53a883f89d5b3756adcb67f80c414abc651f0");
    expect(digest("  function pick(", "  function previous(")).toBe("e7206f50460ec10cd70f9f899a1a2bd5085858ac300118a1e7f0c14f397d7bfb");
  });
  it("does not attribute a shared result to the visitor's completed answers", () => {
    const component = readFileSync(new URL("../components/tests/IntroExtroTest.tsx", import.meta.url), "utf8");
    expect(component).toContain("finished: Boolean(result) && answers.length === questions.length");
    expect(component).toContain("shared ? c.sharedTitle : t.resultTitle");
    expect(component).toContain("shared ? c.sharedNote : band.description");
    expect(component).toContain("progress={Math.round((answers.length / questions.length) * 100)}");
  });
  for (const locale of ["ko", "en", "ja", "zh", "fr", "es"] as const) {
    const readArticle = () => readFileSync(new URL(`../content/articles/${locale}/introvert-extrovert-science.mdx`, import.meta.url), "utf8");
    it(`removes unsupported neural-cost and burnout explanations in ${locale}`, () => {
      const article = readArticle();
      expect(article).not.toContain("익숙하지 않은 신경 경로를 강제로 사용하는 것은 더 많은 에너지를 소모");
      expect(article).not.toContain("forcing unfamiliar neural pathways costs significantly more mental energy");
      expect(article).not.toContain("chronic self-suppression leads to psychological exhaustion");
    });
    it(`keeps provenance and a reviewed update in ${locale}`, () => {
      const article = readArticle();
      expect(article).toMatch(/^pubDate: ['"]?2025-04-15['"]?$/m);
      expect(article).toMatch(/^updatedDate: ['"]?2026-10-09['"]?$/m);
      expect(article).toContain(locale === "ko" ? "author: OIYO 편집부" : "author: OIYO Editorial");
      expect(article).toContain("topic: self");
    });
    it(`links directly to evidence and avoids fixed brain wiring promises in ${locale}`, () => {
      const article = readArticle();
      expect(article).toMatch(/\]\(https:\/\//);
      expect(article).not.toContain("The two types of brains simply operate differently");
      expect(article).not.toContain("stop fighting your own biology");
    });
    it(`preserves evidence roles and localized learning links in ${locale}`, () => {
      const article = readArticle();
      for (const url of [
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC3827581/",
        "https://pubmed.ncbi.nlm.nih.gov/9989562/",
        "https://jessiesun.me/publication/jacques-hamilton-2019/jacques-hamilton-2019.pdf",
        "https://sonjalyubomirsky.com/wp-content/uploads/2024/03/Margolis-Lyubomirsky-2020.pdf",
        "https://faculty.wharton.upenn.edu/wp-content/uploads/2012/05/GrantGinoHofmann_Reversing.pdf",
      ]) expect(article).toContain(url);
      expect(article).toContain(`](/${locale}/introvert-extrovert-test/)`);
      expect(article.match(/<LectureTable\b/g)).toHaveLength(2);
      expect(article.match(/^## /gm)).toHaveLength(7);
      for (const count of ["18", "147", "76", "131", "57", "374", "163", "56"]) {
        expect(article).toMatch(new RegExp(`(?<![0-9])${count}(?![0-9])`));
      }
      expect(article).not.toContain("```");
    });
  }
});
