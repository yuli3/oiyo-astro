import { describe, it, expect } from "vitest";
import { drawTalisman } from "./draw";
import { ELEMENT_SYMBOLS, seedFrom, seededRandom } from "./symbols";
import { FiveElement } from "../ontology/saju/types";

const ALL = Object.values(FiveElement);

describe("오행 부적 — 결정론", () => {
  it("같은 오행·시드면 완전히 같은 SVG 가 나온다", () => {
    // 같은 사람이 다시 열거나 공유 링크로 열어도 같은 부적이어야 한다.
    const a = drawTalisman({ element: FiveElement.WOOD, seed: 12345 });
    const b = drawTalisman({ element: FiveElement.WOOD, seed: 12345 });
    expect(a).toBe(b);
  });

  it("시드가 다르면 다른 SVG 가 나온다", () => {
    const a = drawTalisman({ element: FiveElement.WOOD, seed: 1 });
    const b = drawTalisman({ element: FiveElement.WOOD, seed: 2 });
    expect(a).not.toBe(b);
  });

  it("오행이 달라도 획은 주사 붉은색이다", () => {
    // 부적의 획은 목적·오행과 무관하게 붉다. 오행은 색이 아니라 글자와
    // 문양으로 구분한다 — 2026-09-21 재설계에서 바뀐 규칙이다.
    for (const el of ALL) {
      expect(drawTalisman({ element: el, seed: 7 })).toContain("#a3271f");
    }
  });

  it("오행마다 본자와 보조자가 다르다", () => {
    const seen = new Set<string>();
    for (const el of ALL) {
      const s = ELEMENT_SYMBOLS[el];
      const svg = drawTalisman({ element: el, seed: 7 });
      expect(svg, `${el} 본자`).toContain(`>${s.glyph}</text>`);
      expect(svg, `${el} 좌`).toContain(`>${s.sideGlyphs[0]}</text>`);
      expect(svg, `${el} 우`).toContain(`>${s.sideGlyphs[1]}</text>`);
      seen.add(s.glyph);
    }
    expect(seen.size).toBe(ALL.length);
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

describe("오행 부적 — 출력 형태", () => {
  it("모든 오행이 유효한 SVG 루트를 만든다", () => {
    for (const el of ALL) {
      const svg = drawTalisman({ element: el, seed: 42 });
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      // NaN 이 좌표에 섞이면 브라우저가 조용히 도형을 지운다.
      expect(svg).not.toContain("NaN");
      expect(svg).not.toContain("undefined");
    }
  });

  it("glyph 를 주면 본자를 바꾸고, 주지 않으면 오행 본자를 쓴다", () => {
    const custom = drawTalisman({ element: FiveElement.FIRE, seed: 3, glyph: "福" });
    expect(custom).toContain(">福</text>");
    const base = drawTalisman({ element: FiveElement.FIRE, seed: 3 });
    expect(base).toContain(">火</text>");
  });

  it("부적의 시각 문법을 갖춘다", () => {
    // 2026-09-21 첫 시안은 정사각형·옅은 선·한자 없음이라 "부적 느낌이
    // 아예 없다"는 판정을 받았다. 형식 요소를 회귀로 잠근다.
    const svg = drawTalisman({ element: FiveElement.WATER, seed: 1 });
    expect(svg).toContain(`viewBox="0 0 200 340"`); // 세로로 긴 판
    expect(svg).toContain("#e6d3a3"); // 누런 한지
    for (const ch of ELEMENT_SYMBOLS[FiveElement.WATER].tailGlyphs) {
      expect(svg, `꼬리 ${ch}`).toContain(`>${ch}</text>`);
    }
    expect(svg.split(`r="3.8"`).length - 1).toBe(7); // 북두칠성
  });

  it("생수와 성수를 합한 만큼 도형을 그린다", () => {
    for (const el of ALL) {
      const svg = drawTalisman({ element: el, seed: 5 });
      const s = ELEMENT_SYMBOLS[el];
      const tag = s.shape === "ring" ? "<circle" : "<path";
      // ring 은 배경 원과 겹치므로 하한으로만 확인한다.
      const n = svg.split(tag).length - 1;
      expect(n, `${el}`).toBeGreaterThanOrEqual(s.count + s.outer);
    }
  });

  it("성수는 생수에 5를 더한 수다 (하도)", () => {
    for (const el of ALL) {
      const s = ELEMENT_SYMBOLS[el];
      expect(s.outer, `${el}`).toBe(s.count + 5);
    }
  });

  it("어느 오행도 도형이 셋 미만으로 비지 않는다", () => {
    // 첫 시안에서 수(水)가 생수 1 뿐이라 화면이 비어 보였다. 두 고리를 쓰는
    // 이유가 이것이므로 회귀로 잠근다.
    for (const el of ALL) {
      const s = ELEMENT_SYMBOLS[el];
      expect(s.count + s.outer, `${el}`).toBeGreaterThanOrEqual(7);
    }
  });

  it("같은 오행이라도 시드가 다르면 도형 배치가 눈에 띄게 다르다", () => {
    // 흔드는 폭이 좁으면 사람이 달라도 같은 그림으로 보인다 — 첫 시안의 문제.
    const a = drawTalisman({ element: FiveElement.WOOD, seed: 11 });
    const b = drawTalisman({ element: FiveElement.WOOD, seed: 22 });
    const coords = (s: string) => s.match(/[\d.]+/g) ?? [];
    const ca = coords(a);
    const cb = coords(b);
    const same = ca.filter((v, i) => v === cb[i]).length;
    expect(same / ca.length).toBeLessThan(0.6);
  });
});

describe("오행 부적 — 상징 사전", () => {
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
