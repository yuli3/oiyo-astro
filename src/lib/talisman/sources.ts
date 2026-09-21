/**
 * 부적에 올릴 표기를 각 분석 체계에서 가져온다.
 *
 * 2026-09-21 재설계의 전제: **부적에 들어가는 표시를 지어내지 않는다.**
 * 앞선 두 시안은 오행마다 "나무 같은 선", "불꽃 같은 곡선"을 만들어 흩뿌렸는데,
 * 어느 전통에도 없는 형태라 "나뭇가지도 아니고 새 발자국도 아닌" 것이 됐다.
 *
 * 그래서 여기 있는 것은 전부 실재하는 문자·기호다. 유니코드에 코드포인트가
 * 있고, 해당 전통이 실제로 그 표기를 쓴다.
 *
 *  - 만세력 → 천간지지 한자 (甲乙丙丁… / 子丑寅卯…)
 *  - 음양오행 → 팔괘 기호 (☰☱☲☳☴☵☶☷, 후천팔괘의 오행 배당)
 *  - 서양 점성 → 황도 12궁 기호 (♈…♓)
 *  - 켈트 → 오검(Ogham) 문자 (ᚁᚂᚃ…, 수목 사인의 실제 자모)
 *  - 마야 → 촐킨 음조의 점·막대 수 표기 (점 1, 막대 5)
 *
 * 계산은 전부 기존 엔진을 그대로 쓴다. 이 파일은 계산하지 않고 잇기만 한다.
 */
import { calculateCelticTree } from "../ontology/celtic/calculator";
import { calculateMayanKin } from "../ontology/mayan/calculator";
import {
  getDayBranch,
  getDayStem,
  getHourBranch,
  getHourStem,
  getMonthBranch,
  getMonthStem,
  getYearBranch,
  getYearStem,
} from "../ontology/saju/calculator-civil";
import { FiveElement } from "../ontology/saju/types";

/** 천간 — 만세력의 열 글자. */
export const STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

/** 지지 — 만세력의 열두 글자. */
export const BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

/**
 * 오행의 팔괘. 후천팔괘의 표준 배당이다 —
 * 震巽 목, 離 화, 坤艮 토, 乾兌 금, 坎 수. 오행마다 대표 하나를 세운다.
 */
export const TRIGRAM: Record<FiveElement, string> = {
  [FiveElement.WOOD]: "☳", // 震
  [FiveElement.FIRE]: "☲", // 離
  [FiveElement.EARTH]: "☷", // 坤
  [FiveElement.METAL]: "☰", // 乾
  [FiveElement.WATER]: "☵", // 坎
};

/** 황도 12궁 기호. 태양 궁의 통상 구간(회귀황도)으로 고른다. */
const ZODIAC: { sign: string; from: [number, number] }[] = [
  { sign: "♑", from: [12, 22] },
  { sign: "♒", from: [1, 20] },
  { sign: "♓", from: [2, 19] },
  { sign: "♈", from: [3, 21] },
  { sign: "♉", from: [4, 20] },
  { sign: "♊", from: [5, 21] },
  { sign: "♋", from: [6, 22] },
  { sign: "♌", from: [7, 23] },
  { sign: "♍", from: [8, 23] },
  { sign: "♎", from: [9, 23] },
  { sign: "♏", from: [10, 23] },
  { sign: "♐", from: [11, 22] },
];

export function zodiacSign(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // 시작일이 늦은 것부터 훑어 처음 걸리는 궁을 쓴다. 어디에도 안 걸리면
  // 1월 1–19일이므로 염소자리다.
  const hit = [...ZODIAC]
    .sort((a, b) => b.from[0] * 100 + b.from[1] - (a.from[0] * 100 + a.from[1]))
    .find(({ from }) => m * 100 + d >= from[0] * 100 + from[1]);
  return hit?.sign ?? "♑";
}

/**
 * 켈트 수목 사인의 오검 문자.
 *
 * 엔진이 들고 있는 celticName(Beith, Luis…)은 이름일 뿐이고, 오검은 그
 * 이름에 대응하는 자모가 따로 있다. 유니코드 Ogham 블록(U+1680–169F)에서
 * 가져온다. "이름 없는 날"(12/23, 겨우살이)만은 대응 자모가 없어 오검
 * 문장의 시작 표시(᚛)를 쓴다 — 자모인 척하지 않는다.
 */
export const OGHAM_BY_TREE: Record<string, string> = {
  birch: "ᚁ", // Beith
  rowan: "ᚂ", // Luis
  alder: "ᚃ", // Fearn
  willow: "ᚄ", // Sail
  ash: "ᚅ", // Nion
  hawthorn: "ᚆ", // Uath
  oak: "ᚇ", // Dair
  holly: "ᚈ", // Tinne
  hazel: "ᚉ", // Coll
  vine: "ᚋ", // Muin
  ivy: "ᚌ", // Gort
  reed: "ᚍ", // nGéadal
  elder: "ᚏ", // Ruis
  nameless: "᚛", // 자모 없음 — 문장 시작 표시
};

/** 부적이 읽어 올리는 값. 계산 결과만 담고 그리기는 모른다. */
export interface TalismanReading {
  /** 보완할 오행 — 사주에서 온다 */
  element: FiveElement;
  /** 만세력 네 기둥. 각 항목이 간지 두 자다 (예: "甲子") */
  pillars: [string, string, string, string];
  /** 황도 12궁 기호 */
  zodiac: string;
  /** 켈트 오검 자모 */
  ogham: string;
  /** 촐킨 음조 1–13. 점·막대로 새긴다 */
  tone: number;
  /** 종이 결과 별자리 기울기를 정하는 시드 */
  seed: number;
}

export interface BirthInput {
  /** 생년월일 (현지 시각 기준) */
  date: Date;
  /** 태어난 시(0–23). 모르면 비운다 — 시주를 자시로 둔다 */
  hour?: number;
  element: FiveElement;
}

/** 촐킨 음조를 마야 수 표기로 — 막대는 5, 점은 1. */
export function toneNumeral(tone: number): { bars: number; dots: number } {
  const n = Math.max(1, Math.min(13, Math.round(tone)));
  return { bars: Math.floor(n / 5), dots: n % 5 };
}

export function readingFromBirth({ date, hour = 0, element }: BirthInput): TalismanReading {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const yearStem = getYearStem(y);
  const dayStem = getDayStem(y, m, d);
  const hourBranch = getHourBranch(hour);
  const pair = (s: number, b: number) => `${STEM_HANJA[s]}${BRANCH_HANJA[b]}`;

  const pillars: [string, string, string, string] = [
    pair(yearStem, getYearBranch(y)),
    pair(getMonthStem(yearStem, m), getMonthBranch(m)),
    pair(dayStem, getDayBranch(y, m, d)),
    pair(getHourStem(dayStem, hourBranch), hourBranch),
  ];

  const tree = calculateCelticTree(date);
  const kin = calculateMayanKin(date);

  return {
    element,
    pillars,
    zodiac: zodiacSign(date),
    ogham: OGHAM_BY_TREE[tree.id] ?? "᚛",
    // 윤일(2/29)은 후납쿠라 음조가 없다. 그때는 1로 맺는다.
    tone: kin && kin.tone.number > 0 ? kin.tone.number : 1,
    seed: seedFromBirth(y, m, d, hour),
  };
}

function seedFromBirth(y: number, m: number, d: number, hour: number): number {
  let h = 2166136261;
  for (const n of [y, m, d, hour]) {
    h ^= n;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
