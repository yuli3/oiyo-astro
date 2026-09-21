/**
 * 오행 부적 SVG 생성 — 순수 함수.
 *
 * 입력(오행 + 시드)이 같으면 출력 문자열이 완전히 같다. DOM 도, Math.random 도
 * 쓰지 않으므로 테스트로 고정할 수 있고 서버에서도 그릴 수 있다.
 *
 * 형식은 한국 부적의 시각 문법을 따른다 — 세로로 긴 판, 누런 한지 바탕,
 * 주사(朱砂)의 붉은 획, 위에서 아래로 흐르는 머리·몸통·꼬리 구조, 북두칠성.
 * 2026-09-21 첫 시안은 이 문법을 하나도 쓰지 않아 "부적 느낌이 아예 없다"는
 * 판정을 받았다(정사각형·옅은 선·한자 없음). 형식을 빌리되 내용은 오행에서
 * 온다 — 새기는 글자는 그 오행의 배당(오색·오방·성질)이고, 도형 수는 하도의
 * 생수·성수다.
 *
 * 특정 종파의 실제 부적을 그대로 베끼지 않는다. 이것은 상징 디자인이며
 * 주술적 효험을 주장하지 않는다.
 */
import { FiveElement } from "../ontology/saju/types";
import { ELEMENT_SYMBOLS, seededRandom } from "./symbols";

export interface TalismanInput {
  element: FiveElement;
  seed: number;
  /** 한가운데 본자를 바꾸고 싶을 때. 없으면 오행 본자를 쓴다. */
  glyph?: string;
}

const W = 200;
const H = 340;
const CX = W / 2;

/** 주사 붉은색. 부적의 획은 목적과 무관하게 붉다. */
const INK = "#a3271f";
const INK_SOFT = "#c05a48";
/** 누런 한지 */
const PAPER = "#e6d3a3";
const PAPER_DARK = "#d8bf85";

const r2 = (n: number) => Math.round(n * 100) / 100;

/** 오행별 작은 반복 문양. 여백을 메우고 오행 성질을 드러낸다. */
function motif(shape: string, cx: number, cy: number, s: number, rot: number): string {
  const t = `rotate(${r2(rot)} ${r2(cx)} ${r2(cy)})`;
  switch (shape) {
    case "trunk":
      return `<path d="M${r2(cx)} ${r2(cy + s)} L${r2(cx)} ${r2(cy - s)} M${r2(cx)} ${r2(cy - s * 0.2)} L${r2(cx + s * 0.6)} ${r2(cy - s * 0.8)} M${r2(cx)} ${r2(cy + s * 0.2)} L${r2(cx - s * 0.6)} ${r2(cy - s * 0.4)}" transform="${t}"/>`;
    case "flame":
      return `<path d="M${r2(cx)} ${r2(cy + s)} C${r2(cx - s * 0.85)} ${r2(cy + s * 0.1)} ${r2(cx - s * 0.2)} ${r2(cy - s * 0.25)} ${r2(cx)} ${r2(cy - s)} C${r2(cx + s * 0.2)} ${r2(cy - s * 0.25)} ${r2(cx + s * 0.85)} ${r2(cy + s * 0.1)} ${r2(cx)} ${r2(cy + s)} Z" transform="${t}"/>`;
    case "ring":
      return `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(s * 0.75)}" transform="${t}"/>`;
    case "blade":
      return `<path d="M${r2(cx - s * 0.65)} ${r2(cy + s * 0.55)} L${r2(cx)} ${r2(cy - s)} L${r2(cx + s * 0.65)} ${r2(cy + s * 0.55)}" transform="${t}"/>`;
    case "wave":
      return `<path d="M${r2(cx - s)} ${r2(cy)} Q${r2(cx - s * 0.5)} ${r2(cy - s * 0.65)} ${r2(cx)} ${r2(cy)} T${r2(cx + s)} ${r2(cy)}" transform="${t}"/>`;
    default:
      return "";
  }
}

/** 북두칠성 — 국자 모양 일곱 별. 부적의 오래된 구성 요소다. */
function bigDipper(x: number, y: number, s: number): string {
  const pts: [number, number][] = [
    [0, 0], [1.05, 0.28], [2.1, 0.46], [3.05, 0.9],
    [3.5, 1.95], [2.65, 2.55], [1.5, 2.35],
  ];
  const P = pts.map(([px, py]) => [x + px * s, y + py * s] as [number, number]);
  const line = P.map(([px, py], i) => `${i ? "L" : "M"}${r2(px)} ${r2(py)}`).join(" ");
  const stars = P.map(([px, py]) => `<circle cx="${r2(px)}" cy="${r2(py)}" r="${r2(s * 0.2)}" fill="${INK}" stroke="none"/>`).join("");
  return `<g opacity="0.85"><path d="${line}" fill="none" stroke="${INK_SOFT}" stroke-width="0.9"/>${stars}</g>`;
}

export function drawTalisman({ element, seed, glyph }: TalismanInput): string {
  const sym = ELEMENT_SYMBOLS[element];
  const rnd = seededRandom(seed);
  const main = glyph ?? sym.glyph;

  // 머리(頭) — 부적은 위에서 기운을 불러 아래로 흘린다. 세 갈래 획과
  // 그 아래 가로줄이 전형적인 머리 구성이다.
  const headTop = 40;
  const head = [
    `<path d="M${CX} ${headTop - 12} L${CX} ${headTop + 26}" stroke-width="3.4"/>`,
    `<path d="M${CX - 22} ${headTop - 4} L${CX} ${headTop - 14} L${CX + 22} ${headTop - 4}" stroke-width="2.6"/>`,
    `<path d="M${CX - 30} ${headTop + 12} L${CX + 30} ${headTop + 12}" stroke-width="2.2"/>`,
    `<path d="M${CX - 20} ${headTop + 22} L${CX + 20} ${headTop + 22}" stroke-width="1.6"/>`,
  ].join("");

  // 몸통 좌우의 반복 문양. 생수는 안쪽(진하게), 성수는 바깥(옅게).
  const column = (n: number, x: number, y0: number, y1: number, s: number, op: number) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const y = y0 + (y1 - y0) * t;
      const jx = (rnd() - 0.5) * 9;
      out.push(motif(sym.shape, x + jx, y, s * (0.8 + rnd() * 0.45), (rnd() - 0.5) * 34));
    }
    return `<g stroke-opacity="${op}">${out.join("")}</g>`;
  };
  const half = Math.ceil(sym.outer / 2);
  const body = [
    column(half, 30, 108, 250, 9, 0.5),
    column(sym.outer - half, W - 30, 108, 250, 9, 0.5),
    column(sym.count, CX, 232, 252, 7, 0.75),
  ].join("");

  // 꼬리(尾) — 네 자를 세로로 내려 맺는다.
  const tail = sym.tailGlyphs
    .split("")
    .map((ch, i) => `<text x="${CX}" y="${274 + i * 15}" text-anchor="middle" font-size="13" fill="${INK}" font-family="serif" opacity="0.9">${ch}</text>`)
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`,
    `<defs>`,
    `<linearGradient id="p" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="${PAPER}"/><stop offset="100%" stop-color="${PAPER_DARK}"/>`,
    `</linearGradient>`,
    `</defs>`,
    // 한지 바탕과 결
    `<rect width="${W}" height="${H}" fill="url(#p)"/>`,
    `<g stroke="#c9ab6d" stroke-width="0.5" opacity="0.45">`,
    ...Array.from({ length: 11 }, (_, i) => `<path d="M0 ${r2(14 + i * 30)} L${W} ${r2(14 + i * 30)}"/>`),
    `</g>`,
    // 이중 테두리
    `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" fill="none" stroke="${INK}" stroke-width="2.6"/>`,
    `<rect x="13" y="13" width="${W - 26}" height="${H - 26}" fill="none" stroke="${INK}" stroke-width="0.9" opacity="0.7"/>`,
    // 획
    `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">${head}</g>`,
    `<g fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</g>`,
    bigDipper(CX - 34, 84, 19),
    // 본자 — 가운데 크게
    `<text x="${CX}" y="196" text-anchor="middle" font-size="86" font-weight="700" fill="${INK}" font-family="serif">${main}</text>`,
    // 좌우 보조자
    `<text x="46" y="150" text-anchor="middle" font-size="26" fill="${INK}" font-family="serif" opacity="0.92">${sym.sideGlyphs[0]}</text>`,
    `<text x="${W - 46}" y="150" text-anchor="middle" font-size="26" fill="${INK}" font-family="serif" opacity="0.92">${sym.sideGlyphs[1]}</text>`,
    `<path d="M40 214 L${W - 40} 214" stroke="${INK}" stroke-width="1.4" opacity="0.65"/>`,
    tail,
    `</svg>`,
  ].join("");
}
