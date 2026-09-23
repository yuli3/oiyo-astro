import { describe, expect, it } from "vitest";

import { CAREERS } from "./careers";

/**
 * 직업 자료는 **아직 화면에 닿지 않는 자산**이다. 2026-09-23 죽은 코드 783개를
 * 걷을 때 이 파일만 남겼다 — 308개 직업의 설명·자격·장벽·전망을 여섯 언어로
 * 사람이 쓴 자료이고, 라이브에 이를 대신하는 것이 없기 때문이다(RIASEC 검사는
 * 유형만 내고 직업을 잇지 못한다).
 *
 * 쓰이지 않는 자료는 조용히 썩는다. 이 테스트가 형태와 언어 완비를 잠가서,
 * 나중에 RIASEC 결과에 직업을 이을 때 그대로 믿고 쓸 수 있게 한다.
 */

const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"] as const;
const RIASEC = /^[RIASEC]{1,3}$/;

describe("직업 자료", () => {
  it("308개가 있고 id 가 겹치지 않는다", () => {
    expect(CAREERS.length).toBe(308);
    expect(new Set(CAREERS.map((c) => c.id)).size).toBe(CAREERS.length);
  });

  it("제목과 설명이 여섯 언어에 모두 있다", () => {
    const missing = CAREERS.flatMap((c) =>
      LOCALES.flatMap((locale) => [
        c.title[locale]?.trim() ? [] : [`${c.id}.title.${locale}`],
        c.description[locale]?.trim() ? [] : [`${c.id}.description.${locale}`],
      ].flat()),
    );
    expect(missing).toEqual([]);
  });

  it("RIASEC 코드로 이어 붙일 수 있다 — 여섯 유형이 모두 쓰인다", () => {
    const bad = CAREERS.filter((c) => !RIASEC.test(c.riasecCode)).map((c) => `${c.id}:${c.riasecCode}`);
    expect(bad).toEqual([]);
    const firstLetters = new Set(CAREERS.map((c) => c.riasecCode[0]));
    expect([...firstLetters].sort().join("")).toBe("ACEIRS");
  });

  it("한 언어의 문장을 다른 언어에 복사해 둔 오염이 없다", () => {
    // 2026-09-22 감사에서 형제 항목이 언어마다 같은 문장으로 채워진 오염을
    // 여러 묶음에서 찾았다. 같은 검사를 이 자료에도 건다.
    for (const locale of LOCALES) {
      const titles = CAREERS.map((c) => c.title[locale]);
      expect(new Set(titles).size / titles.length, locale).toBeGreaterThan(0.9);
    }
  });
});
