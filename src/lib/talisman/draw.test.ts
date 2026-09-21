import { describe, it, expect } from "vitest";
import { drawTalisman } from "./draw";
import { ELEMENT_SYMBOLS, seedFrom, seededRandom } from "./symbols";
import {
  BRANCH_HANJA,
  OGHAM_BY_TREE,
  STEM_HANJA,
  TRIGRAM,
  readingFromBirth,
  toneNumeral,
  zodiacSign,
} from "./sources";
import { FiveElement } from "../ontology/saju/types";

const ALL = Object.values(FiveElement);

/** 2002-09-01 09시생. 테스트 전반에서 같은 사람을 쓴다. */
const READING = readingFromBirth({
  date: new Date(2002, 8, 1),
  hour: 9,
  element: FiveElement.WATER,
});

const readingFor = (element: FiveElement) => ({ ...READING, element });

describe("부적 — 결정론", () => {
  it("같은 사주면 완전히 같은 SVG 가 나온다", () => {
    // 같은 사람이 다시 열거나 공유 링크로 열어도 같은 부적이어야 한다.
    expect(drawTalisman(READING)).toBe(drawTalisman(READING));
  });

  it("생년월일시가 다르면 다른 부적이 나온다", () => {
    const a = readingFromBirth({ date: new Date(2002, 8, 1), hour: 9, element: FiveElement.WATER });
    const b = readingFromBirth({ date: new Date(2007, 2, 24), hour: 14, element: FiveElement.WATER });
    expect(drawTalisman(a)).not.toBe(drawTalisman(b));
  });

  it("오행이 달라도 획은 주사 붉은색이다", () => {
    // 부적의 획은 목적·오행과 무관하게 붉다. 오행은 색이 아니라 글자로 구분한다.
    for (const el of ALL) {
      expect(drawTalisman(readingFor(el))).toContain("#a3271f");
    }
  });

  it("seedFrom 은 같은 입력에 같은 값을, 다른 입력에 다른 값을 준다", () => {
    expect(seedFrom(["2002-09-01", 9, "washington"])).toBe(
      seedFrom(["2002-09-01", 9, "washington"]),
    );
    expect(seedFrom(["2002-09-01", 9, "washington"])).not.toBe(
      seedFrom(["2002-09-01", 10, "washington"]),
    );
  });

  it("seededRandom 은 [0,1) 안에 머문다", () => {
    const rnd = seededRandom(99);
    for (let i = 0; i < 200; i++) {
      const v = rnd();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("부적 — 판에 올리는 표시는 전부 실재하는 표기다", () => {
  // 2026-09-21 의 두 시안은 오행마다 도형을 지어내 흩뿌렸고 "나뭇가지도 아니고
  // 새 발자국도 아닌" 것이 됐다. 이 묶음이 그 재발을 막는다 — 판 위의 표시는
  // 모두 출처 있는 문자여야 한다.

  it("만세력 네 기둥의 여덟 자를 그대로 새긴다", () => {
    const svg = drawTalisman(READING);
    for (const gz of READING.pillars) {
      for (const ch of gz) {
        expect(svg, `간지 ${ch}`).toContain(`>${ch}</text>`);
        expect(
          [...STEM_HANJA, ...BRANCH_HANJA] as readonly string[],
          `${ch} 는 천간지지 표에 있어야 한다`,
        ).toContain(ch);
      }
    }
  });

  it("오행마다 후천팔괘의 해당 괘를 새긴다", () => {
    const seen = new Set<string>();
    for (const el of ALL) {
      const svg = drawTalisman(readingFor(el));
      expect(svg, `${el} 괘`).toContain(`>${TRIGRAM[el]}</text>`);
      seen.add(TRIGRAM[el]);
    }
    expect(seen.size, "오행마다 다른 괘여야 한다").toBe(ALL.length);
  });

  it("황도 12궁 기호와 오검 자모를 새긴다", () => {
    const svg = drawTalisman(READING);
    // 이모지 치환을 막는 변이 선택자까지 함께 나가야 한다.
    expect(svg).toContain(`>${READING.zodiac}\uFE0E</text>`);
    expect("♈♉♊♋♌♍♎♏♐♑♒♓").toContain(READING.zodiac);
    expect(svg).toContain(`>${READING.ogham}</text>`);
    expect(Object.values(OGHAM_BY_TREE)).toContain(READING.ogham);
  });

  it("오행마다 본자가 다르다", () => {
    const seen = new Set<string>();
    for (const el of ALL) {
      const s = ELEMENT_SYMBOLS[el];
      expect(drawTalisman(readingFor(el)), `${el} 본자`).toContain(`>${s.glyph}</text>`);
      seen.add(s.glyph);
    }
    expect(seen.size).toBe(ALL.length);
  });
});

describe("부적 — 출력 형태", () => {
  it("모든 오행이 유효한 SVG 루트를 만든다", () => {
    for (const el of ALL) {
      const svg = drawTalisman(readingFor(el));
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      // NaN 이 좌표에 섞이면 브라우저가 조용히 도형을 지운다.
      expect(svg).not.toContain("NaN");
      expect(svg).not.toContain("undefined");
    }
  });

  it("glyph 를 주면 본자를 바꾸고, 주지 않으면 오행 본자를 쓴다", () => {
    const r = readingFor(FiveElement.FIRE);
    expect(drawTalisman({ ...r, glyph: "福" })).toContain(">福</text>");
    expect(drawTalisman(r)).toContain(">火</text>");
  });

  it("부적의 시각 문법을 갖춘다", () => {
    // 첫 시안은 정사각형·옅은 선·한자 없음이라 "부적 느낌이 아예 없다"는
    // 판정을 받았다. 형식 요소를 회귀로 잠근다.
    const svg = drawTalisman(READING);
    expect(svg).toContain(`viewBox="0 0 200 340"`); // 세로로 긴 판
    expect(svg).toContain("#e6d3a3"); // 누런 한지
    for (const ch of ELEMENT_SYMBOLS[FiveElement.WATER].tailGlyphs) {
      expect(svg, `꼬리 ${ch}`).toContain(`>${ch}</text>`);
    }
    expect(svg.split(`r="3.8"`).length - 1).toBe(7); // 북두칠성
  });
});

describe("부적 — 출처 표", () => {
  it("촐킨 음조를 막대 5·점 1 의 마야 표기로 바꾼다", () => {
    expect(toneNumeral(1)).toEqual({ bars: 0, dots: 1 });
    expect(toneNumeral(5)).toEqual({ bars: 1, dots: 0 });
    expect(toneNumeral(13)).toEqual({ bars: 2, dots: 3 });
    // 1–13 밖의 값이 들어와도 표기가 깨지지 않는다.
    expect(toneNumeral(0)).toEqual({ bars: 0, dots: 1 });
    expect(toneNumeral(99)).toEqual({ bars: 2, dots: 3 });
  });

  it("음조 수만큼 막대와 점을 그린다", () => {
    const svg = drawTalisman({ ...READING, tone: 13 });
    expect(svg.split(`stroke-width="3.2"`).length - 1).toBe(2); // 막대 둘
    expect(svg.split(`r="2.6"`).length - 1).toBe(3); // 점 셋
  });

  it("황도 12궁 경계를 양쪽에서 짚는다", () => {
    expect(zodiacSign(new Date(2000, 2, 20))).toBe("♓"); // 3/20 물고기
    expect(zodiacSign(new Date(2000, 2, 21))).toBe("♈"); // 3/21 양
    expect(zodiacSign(new Date(2000, 0, 5))).toBe("♑"); // 연초는 염소
    expect(zodiacSign(new Date(2000, 11, 25))).toBe("♑"); // 연말도 염소
  });

  it("오검 표가 켈트 수목 사인 열넷을 모두 덮는다", () => {
    expect(Object.keys(OGHAM_BY_TREE)).toHaveLength(14);
    // 자모가 겹치면 두 사람이 같은 표시를 받는다.
    expect(new Set(Object.values(OGHAM_BY_TREE)).size).toBe(14);
  });
});

describe("부적 — 상징 사전", () => {
  it("다섯 오행 전부가 6개 언어를 갖춘다", () => {
    const locales = ["ko", "en", "ja", "zh", "fr", "es"];
    for (const el of ALL) {
      const s = ELEMENT_SYMBOLS[el];
      for (const l of locales) {
        expect(s.name[l], `${el}.name.${l}`).toBeTruthy();
        expect(s.direction[l], `${el}.direction.${l}`).toBeTruthy();
        expect(s.season[l], `${el}.season.${l}`).toBeTruthy();
        expect(s.meaning[l], `${el}.meaning.${l}`).toBeTruthy();
      }
    }
  });
});
