/**
 * 오행 부적 SVG 생성 — 순수 함수.
 *
 * 입력(오행 + 시드)이 같으면 출력 문자열이 완전히 같다. DOM 도, Math.random 도
 * 쓰지 않으므로 테스트로 고정할 수 있고 서버에서도 그릴 수 있다.
 *
 * 도형은 오행의 전통 상응에서 나온다 — 색은 오방색, 반복 수는 생성수,
 * 형상은 그 오행의 움직임(뻗음·타오름·머묾·가름·스밈)이다. 전통 부적의
 * 실제 자형을 베끼지 않는다.
 */
import { FiveElement } from "../ontology/saju/types";
import { ELEMENT_SYMBOLS, seededRandom } from "./symbols";

export interface TalismanInput {
  element: FiveElement;
  seed: number;
  /** 화면에 새길 한 글자. 없으면 생략한다. */
  glyph?: string;
}

const SIZE = 320;
const CX = SIZE / 2;

const r2 = (n: number) => Math.round(n * 100) / 100;

function motif(shape: string, cx: number, cy: number, s: number, rot: number): string {
  const t = `rotate(${r2(rot)} ${r2(cx)} ${r2(cy)})`;
  switch (shape) {
    case "trunk": // 목 — 위로 뻗는 줄기와 가지
      return `<path d="M${r2(cx)} ${r2(cy + s)} L${r2(cx)} ${r2(cy - s)} M${r2(cx)} ${r2(cy - s * 0.3)} L${r2(cx + s * 0.55)} ${r2(cy - s * 0.85)} M${r2(cx)} ${r2(cy + s * 0.1)} L${r2(cx - s * 0.55)} ${r2(cy - s * 0.45)}" transform="${t}" />`;
    case "flame": // 화 — 위로 타오르는 혀
      return `<path d="M${r2(cx)} ${r2(cy + s)} C${r2(cx - s * 0.8)} ${r2(cy + s * 0.1)} ${r2(cx - s * 0.2)} ${r2(cy - s * 0.2)} ${r2(cx)} ${r2(cy - s)} C${r2(cx + s * 0.2)} ${r2(cy - s * 0.2)} ${r2(cx + s * 0.8)} ${r2(cy + s * 0.1)} ${r2(cx)} ${r2(cy + s)} Z" transform="${t}" />`;
    case "ring": // 토 — 닫힌 고리
      return `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(s * 0.8)}" transform="${t}" />`;
    case "blade": // 금 — 가르는 각
      return `<path d="M${r2(cx - s * 0.7)} ${r2(cy + s * 0.6)} L${r2(cx)} ${r2(cy - s)} L${r2(cx + s * 0.7)} ${r2(cy + s * 0.6)}" transform="${t}" />`;
    case "wave": // 수 — 스미는 물결
      return `<path d="M${r2(cx - s)} ${r2(cy)} Q${r2(cx - s * 0.5)} ${r2(cy - s * 0.7)} ${r2(cx)} ${r2(cy)} T${r2(cx + s)} ${r2(cy)}" transform="${t}" />`;
    default:
      return "";
  }
}

export function drawTalisman({ element, seed, glyph }: TalismanInput): string {
  const sym = ELEMENT_SYMBOLS[element];
  const rnd = seededRandom(seed);

  // 하도의 생수는 안쪽, 성수는 바깥에 둔다. 생수만 쓰면 수(水)가 도형 하나로
  // 끝나 비어 보였다 — 두 고리를 겹쳐야 어느 오행이든 고르게 찬다.
  //
  // 각도·크기·반지름을 시드로 흔든다. 흔드는 폭이 좁으면 사람이 달라도 같은
  // 그림으로 보이므로(첫 시안의 문제) 간격의 절반까지 허용한다.
  const ring = (n: number, radius: number, scale: number, opacity: number): string => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const base = (360 / n) * i - 90;
      const jitter = (rnd() - 0.5) * (360 / n) * 0.5;
      const ang = ((base + jitter) * Math.PI) / 180;
      const r = radius + (rnd() - 0.5) * 14;
      out.push(
        motif(
          sym.shape,
          CX + Math.cos(ang) * r,
          CX + Math.sin(ang) * r,
          scale * (0.85 + rnd() * 0.3),
          base + 90 + jitter,
        ),
      );
    }
    return `<g stroke-opacity="${opacity}">${out.join("")}</g>`;
  };

  const parts = [
    ring(sym.outer, 116, 20, 0.52), // 성수 — 바깥, 옅게
    ring(sym.count, 68, 30, 0.95), // 생수 — 안쪽, 진하게
  ];

  const inner = 30 + Math.round(rnd() * 10);
  const glyphEl = glyph
    ? `<text x="${CX}" y="${CX + 13}" text-anchor="middle" font-size="40" font-weight="700" fill="${sym.color}" font-family="serif">${glyph}</text>`
    : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img">`,
    `<defs><radialGradient id="g" cx="50%" cy="45%" r="62%">`,
    `<stop offset="0%" stop-color="${sym.accent}" stop-opacity="0.34"/>`,
    `<stop offset="100%" stop-color="${sym.accent}" stop-opacity="0"/>`,
    `</radialGradient></defs>`,
    `<rect width="${SIZE}" height="${SIZE}" rx="22" fill="#fbf9f3"/>`,
    `<rect x="9" y="9" width="${SIZE - 18}" height="${SIZE - 18}" rx="16" fill="none" stroke="${sym.color}" stroke-width="2.5" stroke-opacity="0.75"/>`,
    `<rect x="19" y="19" width="${SIZE - 38}" height="${SIZE - 38}" rx="11" fill="none" stroke="${sym.color}" stroke-width="1" stroke-opacity="0.35"/>`,
    `<circle cx="${CX}" cy="${CX}" r="112" fill="url(#g)"/>`,
    `<g fill="none" stroke="${sym.color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.92">`,
    ...parts,
    `</g>`,
    `<circle cx="${CX}" cy="${CX}" r="${inner + 18}" fill="none" stroke="${sym.color}" stroke-width="1.2" stroke-opacity="0.45"/>`,
    glyphEl,
    `</svg>`,
  ].join("");
}
