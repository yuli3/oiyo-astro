/**
 * 부적 SVG 생성 — 순수 함수.
 *
 * 입력이 같으면 출력 문자열이 완전히 같다. DOM 도, Math.random 도 쓰지 않으므로
 * 테스트로 고정할 수 있고 서버에서도 그릴 수 있다.
 *
 * 형식은 한국 부적의 시각 문법을 따른다 — 세로로 긴 판, 누런 한지 바탕,
 * 주사(朱砂)의 붉은 획, 위에서 아래로 흐르는 머리·몸통·꼬리 구조, 북두칠성.
 *
 * **판에 올리는 표시는 하나도 지어내지 않는다.** 2026-09-21 의 두 시안은
 * 오행마다 "나무 같은 선", "불꽃 같은 곡선"을 만들어 여백에 흩뿌렸고, 어느
 * 전통에도 없는 형태라 정체불명의 그림이 됐다. 지금은 그 도형을 전부 걷어내고,
 * 각 체계가 실제로 쓰는 문자만 놓는다 — 천간지지 한자, 팔괘 기호, 황도 12궁
 * 기호, 오검 자모, 마야의 점·막대 수 표기. 출처는 sources.ts 에 있다.
 *
 * 특정 종파의 실제 부적을 그대로 베끼지 않는다. 이것은 상징 디자인이며
 * 주술적 효험을 주장하지 않는다.
 */
import { ELEMENT_SYMBOLS, seededRandom } from "./symbols";
import { TRIGRAM, toneNumeral, type TalismanReading } from "./sources";

export interface TalismanInput extends TalismanReading {
  /** 한가운데 본자를 바꾸고 싶을 때. 없으면 오행 본자를 쓴다. */
  glyph?: string;
}

const W = 200;
const H = 340;
const CX = W / 2;

/** 주사 붉은색. 부적의 획은 목적·오행과 무관하게 붉다. */
const INK = "#a3271f";
const INK_SOFT = "#c05a48";
/** 누런 한지 */
const PAPER = "#e6d3a3";
const PAPER_DARK = "#d8bf85";

const r2 = (n: number) => Math.round(n * 100) / 100;

const text = (
  x: number,
  y: number,
  size: number,
  s: string,
  opacity = 1,
  weight = 400,
) =>
  `<text x="${r2(x)}" y="${r2(y)}" text-anchor="middle" font-size="${size}"` +
  (weight === 400 ? "" : ` font-weight="${weight}"`) +
  ` fill="${INK}" font-family="serif"` +
  (opacity === 1 ? "" : ` opacity="${opacity}"`) +
  `>${s}</text>`;

/** 북두칠성 — 국자 모양 일곱 별. 부적의 오래된 구성 요소다. */
function bigDipper(x: number, y: number, s: number, tilt: number): string {
  const pts: [number, number][] = [
    [0, 0], [1.05, 0.28], [2.1, 0.46], [3.05, 0.9],
    [3.5, 1.95], [2.65, 2.55], [1.5, 2.35],
  ];
  const P = pts.map(([px, py]) => [x + px * s, y + py * s] as [number, number]);
  const line = P.map(([px, py], i) => `${i ? "L" : "M"}${r2(px)} ${r2(py)}`).join(" ");
  const stars = P.map(([px, py]) => `<circle cx="${r2(px)}" cy="${r2(py)}" r="3.8" fill="${INK}" stroke="none"/>`).join("");
  return `<g opacity="0.85" transform="rotate(${r2(tilt)} ${CX} ${r2(y + s)})"><path d="${line}" fill="none" stroke="${INK_SOFT}" stroke-width="0.9"/>${stars}</g>`;
}

/**
 * 촐킨 음조를 마야 수 표기로 새긴다 — 막대 하나가 5, 점 하나가 1.
 * 마야는 이 표기를 아래에서 위로 쌓는다.
 */
function mayanNumeral(cx: number, cy: number, tone: number): string {
  const { bars, dots } = toneNumeral(tone);
  const out: string[] = [];
  const barW = 26;
  for (let i = 0; i < bars; i++) {
    const y = cy + i * 6;
    out.push(`<path d="M${r2(cx - barW / 2)} ${r2(y)} L${r2(cx + barW / 2)} ${r2(y)}" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`);
  }
  const dy = cy + bars * 6 - 8;
  const step = 8;
  const x0 = cx - ((dots - 1) * step) / 2;
  for (let i = 0; i < dots; i++) {
    out.push(`<circle cx="${r2(x0 + i * step)}" cy="${r2(dy)}" r="2.6" fill="${INK}"/>`);
  }
  return out.join("");
}

export function drawTalisman(input: TalismanInput): string {
  const { element, pillars, zodiac, ogham, tone, seed, glyph } = input;
  const sym = ELEMENT_SYMBOLS[element];
  const rnd = seededRandom(seed);
  const main = glyph ?? sym.glyph;

  // 머리(頭) — 부적은 위에서 기운을 불러 아래로 흘린다. 세 점과 그 아래
  // 가로줄이 전형적인 머리 구성이다.
  const head = [
    ...[-14, 0, 14].map((dx) => `<circle cx="${r2(CX + dx)}" cy="26" r="3" fill="${INK}" stroke="none"/>`),
    `<path d="M${CX} 30 L${CX} 56" stroke-width="3.4"/>`,
    `<path d="M${CX - 30} 46 L${CX + 30} 46" stroke-width="2.2"/>`,
    `<path d="M${CX - 20} 54 L${CX + 20} 54" stroke-width="1.6"/>`,
  ].join("");

  // 만세력 네 기둥 — 年·月 을 왼쪽, 日·時 를 오른쪽에 세로로 내린다.
  // 간지 두 자를 위아래로 쌓는 것이 사주 표기의 기본 형태다.
  const pillarColumn = (x: number, pair: string[], y0: number) =>
    pair
      .flatMap((gz, ci) => gz.split("").map((ch, ri) => text(x, y0 + ci * 46 + ri * 21, 17, ch, 0.9)))
      .join("");
  const columns =
    pillarColumn(30, [pillars[0], pillars[1]], 112) +
    pillarColumn(W - 30, [pillars[2], pillars[3]], 112);

  // 꼬리(尾) — 네 자를 세로로 내려 맺는다.
  const tail = sym.tailGlyphs
    .split("")
    .map((ch, i) => text(CX, 281 + i * 13, 12, ch, 0.9))
    .join("");

  // 한지 결. 사람마다 종이가 조금씩 다르도록 시드로 흔든다.
  const fibers = Array.from({ length: 11 }, (_, i) =>
    `<path d="M0 ${r2(14 + i * 30 + (rnd() - 0.5) * 7)} L${W} ${r2(14 + i * 30 + (rnd() - 0.5) * 7)}"/>`,
  ).join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`,
    `<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="${PAPER}"/><stop offset="100%" stop-color="${PAPER_DARK}"/>`,
    `</linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#p)"/>`,
    `<g stroke="#c9ab6d" stroke-width="0.5" opacity="0.45">${fibers}</g>`,
    // 이중 테두리
    `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" fill="none" stroke="${INK}" stroke-width="2.6"/>`,
    `<rect x="13" y="13" width="${W - 26}" height="${H - 26}" fill="none" stroke="${INK}" stroke-width="0.9" opacity="0.7"/>`,
    `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">${head}</g>`,
    bigDipper(CX - 34, 66, 19, (rnd() - 0.5) * 10),
    columns,
    // 본자 — 가운데 크게
    text(CX, 196, 86, main, 1, 700),
    `<path d="M40 214 L${W - 40} 214" stroke="${INK}" stroke-width="1.4" opacity="0.65"/>`,
    // 세 체계의 기호를 한 줄로: 팔괘 · 황도 12궁 · 오검
    text(CX - 42, 240, 22, TRIGRAM[element], 0.92),
    // 황도 기호는 이모지 표현이 기본인 글꼴이 많다. 변이 선택자 U+FE0E 로
    // 글자 표현을 강제하지 않으면 부적 한가운데 보라색 이모지가 박힌다.
    text(CX, 240, 22, `${zodiac}︎`, 0.92),
    text(CX + 42, 240, 22, ogham, 0.92),
    // 촐킨 음조
    mayanNumeral(CX, 258, tone),
    tail,
    `</svg>`,
  ].join("");
}
