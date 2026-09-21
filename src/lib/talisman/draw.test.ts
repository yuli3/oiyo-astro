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

  it("오행이 다르면 색이 달라진다", () => {
    const seen = new Set<string>();
    for (const el of ALL) {
      const svg = drawTalisman({ element: el, seed: 7 });
      expect(svg).toContain(ELEMENT_SYMBOLS[el].color);
      seen.add(ELEMENT_SYMBOLS[el].color);
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

  it("glyph 를 주면 새기고, 주지 않으면 text 를 만들지 않는다", () => {
    const withGlyph = drawTalisman({ element: FiveElement.FIRE, seed: 3, glyph: "火" });
    expect(withGlyph).toContain("火");
    expect(withGlyph).toContain("<text");
    const without = drawTalisman({ element: FiveElement.FIRE, seed: 3 });
    expect(without).not.toContain("<text");
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
