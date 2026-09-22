import { getLunarDate } from "@/lib/ontology/calendar-systems/lunar-kernel";

/**
 * 출생 괘 — 매화역수(梅花易數)의 연월일시 기괘법.
 *
 * 2026-09-22 까지 이 자리에는 이름의 글자 코드와 **지금 시각**으로 괘를 뽑는
 * 데모(sacred-resonance/iching-logic)가 있었다. 같은 사람이 한 시간마다 다른
 * 괘를 받았고, 64괘 중 3괘만 데이터가 있었다. 전통 방식으로 다시 만든다.
 *
 * 기괘법(소강절):
 *   상괘 = (연지 수 + 음력 월 + 음력 일) ÷ 8 의 나머지 (0 이면 8)
 *   하괘 = (연지 수 + 음력 월 + 음력 일 + 시지 수) ÷ 8 의 나머지
 *   동효 = (위의 합 + 시지 수) ÷ 6 의 나머지 (0 이면 6)
 * 연지·시지 수는 子=1 … 亥=12, 괘 수는 선천 팔괘 乾1 兌2 離3 震4 巽5 坎6 艮7 坤8.
 *
 * **시각이 없으면 괘를 세우지 않는다.** 하괘와 동효가 시지에서 나오기 때문이다.
 * 음력은 solarlunar(중국 표준시 기준 역법)로 바꾼다 — 한국 음력과 드물게
 * 하루 어긋나는 날이 있다(초하루가 자정 부근일 때).
 */

export type TrigramId = "qian" | "dui" | "li" | "zhen" | "xun" | "kan" | "gen" | "kun";

/** 선천 순서(1~8). 효는 아래에서 위로, 1 = 양 */
export const TRIGRAMS: ReadonlyArray<{ id: TrigramId; han: string; lines: readonly [0 | 1, 0 | 1, 0 | 1] }> = [
  { id: "qian", han: "☰", lines: [1, 1, 1] },
  { id: "dui", han: "☱", lines: [1, 1, 0] },
  { id: "li", han: "☲", lines: [1, 0, 1] },
  { id: "zhen", han: "☳", lines: [1, 0, 0] },
  { id: "xun", han: "☴", lines: [0, 1, 1] },
  { id: "kan", han: "☵", lines: [0, 1, 0] },
  { id: "gen", han: "☶", lines: [0, 0, 1] },
  { id: "kun", han: "☷", lines: [0, 0, 0] },
];

/**
 * 문왕 괘 번호 — 행은 상괘, 열은 하괘(둘 다 선천 순서 乾兌離震巽坎艮坤).
 * 표의 64칸이 1~64 를 한 번씩 갖는지 iching.test 가 확인한다.
 */
const KING_WEN: number[][] = [
  [1, 10, 13, 25, 44, 6, 33, 12],
  [43, 58, 49, 17, 28, 47, 31, 45],
  [14, 38, 30, 21, 50, 64, 56, 35],
  [34, 54, 55, 51, 32, 40, 62, 16],
  [9, 61, 37, 42, 57, 59, 53, 20],
  [5, 60, 63, 3, 48, 29, 39, 8],
  [26, 41, 22, 27, 18, 4, 52, 23],
  [11, 19, 36, 24, 46, 7, 15, 2],
];

export function hexagramOf(upper: number, lower: number): number {
  return KING_WEN[upper - 1][lower - 1];
}

function trigramOfLines(lines: ReadonlyArray<number>): number {
  const i = TRIGRAMS.findIndex((t) => t.lines.every((v, k) => v === lines[k]));
  return i + 1;
}

/** 여섯 효(아래→위). 하괘 셋 + 상괘 셋 */
export function linesOf(upper: number, lower: number): number[] {
  return [...TRIGRAMS[lower - 1].lines, ...TRIGRAMS[upper - 1].lines];
}

export interface BirthHexagram {
  /** 본괘 문왕 번호 1~64 */
  number: number;
  upper: number;
  lower: number;
  /** 동효 1~6 (아래에서부터) */
  moving: number;
  /** 동효를 바꾼 변괘 번호 */
  changed: number;
}

const mod = (n: number, m: number) => {
  const r = n % m;
  return r === 0 ? m : r;
};

export function plumBlossom(input: { yearBranch: number; lunarMonth: number; lunarDay: number; hourBranch: number }): BirthHexagram {
  const base = input.yearBranch + input.lunarMonth + input.lunarDay;
  const upper = mod(base, 8);
  const lower = mod(base + input.hourBranch, 8);
  const moving = mod(base + input.hourBranch, 6);
  const lines = linesOf(upper, lower);
  lines[moving - 1] = lines[moving - 1] ? 0 : 1;
  const changed = hexagramOf(trigramOfLines(lines.slice(3)), trigramOfLines(lines.slice(0, 3)));
  return { number: hexagramOf(upper, lower), upper, lower, moving, changed };
}

const BRANCH_ORDER = ["JA", "CHUK", "IN", "MYO", "JIN", "SA", "O", "MI", "SIN", "YU", "SUL", "HAE"];

/**
 * 달력 날짜와 시지(시주의 지지)로 출생 괘를 세운다. 시지가 없으면 null.
 * 연지는 **음력 해**의 지지다(입춘이 아니라 설 기준 — 매화역수의 관례).
 */
export function birthHexagram(civilDate: string, hourBranch: string | null): BirthHexagram | null {
  if (!hourBranch) return null;
  const h = BRANCH_ORDER.indexOf(hourBranch);
  if (h < 0) return null;
  const [y, m, d] = civilDate.split("-").map(Number);
  let lunar;
  try {
    lunar = getLunarDate(new Date(Date.UTC(y, m - 1, d)));
  } catch {
    return null; // 1900~2100 밖
  }
  const yearBranch = (((lunar.lunarYear - 4) % 12) + 12) % 12 + 1; // 1984 = 甲子 → 子 = 1
  return plumBlossom({ yearBranch, lunarMonth: lunar.lunarMonth, lunarDay: lunar.lunarDay, hourBranch: h + 1 });
}

export function isBirthHexagram(value: unknown): value is BirthHexagram {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<BirthHexagram>;
  const inRange = (n: unknown, lo: number, hi: number) => Number.isInteger(n) && (n as number) >= lo && (n as number) <= hi;
  return inRange(v.number, 1, 64) && inRange(v.upper, 1, 8) && inRange(v.lower, 1, 8) && inRange(v.moving, 1, 6) && inRange(v.changed, 1, 64)
    && hexagramOf(v.upper!, v.lower!) === v.number;
}
