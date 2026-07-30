/**
 * Earthly Branches (지지) - Single Source of Truth
 *
 * 12 Earthly Branches with zodiac animals and time associations.
 */

import type { ElementId } from "./elements";

export const BRANCH_IDS = [
  "JA",
  "CHUK",
  "IN",
  "MYO",
  "JIN",
  "SA",
  "O",
  "MI",
  "SIN",
  "YU",
  "SUL",
  "HAE",
] as const;
export type BranchId = (typeof BRANCH_IDS)[number];

export interface EarthlyBranch {
  animal: {
    zh: string;
    en: string;
    ko: string;
  };
  element: ElementId;
  id: BranchId;
  order: number;
  season: "AUTUMN" | "SPRING" | "SUMMER" | "WINTER";
  short: {
    zh: string;
    en: string;
    es: string;
    fr: string;
    ja: string;
    ko: string;
  };
  timeRange: string; // e.g., "23:30 - 01:29"
  yinYang: "YANG" | "YIN";
}

/**
 * Earthly Branches Registry - SSOT
 */
export const BRANCHES: Record<BranchId, EarthlyBranch> = {
  CHUK: {
    animal: { zh: "牛", en: "Ox", ko: "소" },
    element: "earth",
    id: "CHUK",
    order: 2,
    season: "WINTER",
    short: { zh: "丑", en: "Chuk", es: "Chuk", fr: "Chuk", ja: "丑", ko: "축" },
    timeRange: "01:30 - 03:29",
    yinYang: "YIN",
  },
  HAE: {
    animal: { zh: "猪", en: "Pig", ko: "돼지" },
    element: "water",
    id: "HAE",
    order: 12,
    season: "WINTER",
    short: { zh: "亥", en: "Hae", es: "Hae", fr: "Hae", ja: "亥", ko: "해" },
    timeRange: "21:30 - 23:29",
    yinYang: "YIN",
  },
  IN: {
    animal: { zh: "虎", en: "Tiger", ko: "호랑이" },
    element: "wood",
    id: "IN",
    order: 3,
    season: "SPRING",
    short: { zh: "寅", en: "In", es: "In", fr: "In", ja: "寅", ko: "인" },
    timeRange: "03:30 - 05:29",
    yinYang: "YANG",
  },
  JA: {
    animal: { zh: "鼠", en: "Rat", ko: "쥐" },
    element: "water",
    id: "JA",
    order: 1,
    season: "WINTER",
    short: { zh: "子", en: "Ja", es: "Ja", fr: "Ja", ja: "子", ko: "자" },
    timeRange: "23:30 - 01:29",
    yinYang: "YANG",
  },
  JIN: {
    animal: { zh: "龙", en: "Dragon", ko: "용" },
    element: "earth",
    id: "JIN",
    order: 5,
    season: "SPRING",
    short: { zh: "辰", en: "Jin", es: "Jin", fr: "Jin", ja: "辰", ko: "진" },
    timeRange: "07:30 - 09:29",
    yinYang: "YANG",
  },
  MI: {
    animal: { zh: "羊", en: "Sheep", ko: "양" },
    element: "earth",
    id: "MI",
    order: 8,
    season: "SUMMER",
    short: { zh: "未", en: "Mi", es: "Mi", fr: "Mi", ja: "未", ko: "미" },
    timeRange: "13:30 - 15:29",
    yinYang: "YIN",
  },
  MYO: {
    animal: { zh: "兔", en: "Rabbit", ko: "토끼" },
    element: "wood",
    id: "MYO",
    order: 4,
    season: "SPRING",
    short: { zh: "卯", en: "Myo", es: "Myo", fr: "Myo", ja: "卯", ko: "묘" },
    timeRange: "05:30 - 07:29",
    yinYang: "YIN",
  },
  O: {
    animal: { zh: "马", en: "Horse", ko: "말" },
    element: "fire",
    id: "O",
    order: 7,
    season: "SUMMER",
    short: { zh: "午", en: "O", es: "O", fr: "O", ja: "午", ko: "오" },
    timeRange: "11:30 - 13:29",
    yinYang: "YANG",
  },
  SA: {
    animal: { zh: "蛇", en: "Snake", ko: "뱀" },
    element: "fire",
    id: "SA",
    order: 6,
    season: "SUMMER",
    short: { zh: "巳", en: "Sa", es: "Sa", fr: "Sa", ja: "巳", ko: "사" },
    timeRange: "09:30 - 11:29",
    yinYang: "YIN",
  },
  SIN: {
    animal: { zh: "猴", en: "Monkey", ko: "원숭이" },
    element: "metal",
    id: "SIN",
    order: 9,
    season: "AUTUMN",
    short: { zh: "申", en: "Sin", es: "Sin", fr: "Sin", ja: "申", ko: "신" },
    timeRange: "15:30 - 17:29",
    yinYang: "YANG",
  },
  SUL: {
    animal: { zh: "狗", en: "Dog", ko: "개" },
    element: "earth",
    id: "SUL",
    order: 11,
    season: "AUTUMN",
    short: { zh: "戌", en: "Sul", es: "Sul", fr: "Sul", ja: "戌", ko: "술" },
    timeRange: "19:30 - 21:29",
    yinYang: "YANG",
  },
  YU: {
    animal: { zh: "鸡", en: "Rooster", ko: "닭" },
    element: "metal",
    id: "YU",
    order: 10,
    season: "AUTUMN",
    short: { zh: "酉", en: "Yu", es: "Yu", fr: "Yu", ja: "酉", ko: "유" },
    timeRange: "17:30 - 19:29",
    yinYang: "YIN",
  },
};

/**
 * Branch order array for 60 Ganzhi calculation
 */
export const BRANCH_ORDER: BranchId[] = [
  "JA",
  "CHUK",
  "IN",
  "MYO",
  "JIN",
  "SA",
  "O",
  "MI",
  "SIN",
  "YU",
  "SUL",
  "HAE",
];

/**
 * Get branch by ID
 */
export const getBranch = (id: BranchId): EarthlyBranch => {
  return BRANCHES[id];
};

/**
 * Get branch element
 */
export const getBranchElement = (id: BranchId): ElementId => {
  return BRANCHES[id].element;
};
