/**
 * Heavenly Stems (천간) - Single Source of Truth
 *
 * 10 Heavenly Stems with their elemental associations.
 */

import { ElementId } from "./elements";

export const STEM_IDS = [
  "GAP",
  "EUL",
  "BYEONG",
  "JEONG",
  "MU",
  "GI",
  "GYEONG",
  "SIN",
  "IM",
  "GYE",
] as const;
export interface HeavenlyStem {
  element: ElementId;
  id: StemId;
  order: number;
  short: {
    zh: string;
    en: string;
    es: string;
    fr: string;
    ja: string;
    ko: string;
  };
  yinYang: "YANG" | "YIN";
}

export type StemId = (typeof STEM_IDS)[number];

/**
 * Heavenly Stems Registry - SSOT
 */
export const STEMS: Record<StemId, HeavenlyStem> = {
  BYEONG: {
    element: "fire",
    id: "BYEONG",
    order: 3,
    short: {
      zh: "丙",
      en: "Byeong",
      es: "Byeong",
      fr: "Byeong",
      ja: "丙",
      ko: "병",
    },
    yinYang: "YANG",
  },
  EUL: {
    element: "wood",
    id: "EUL",
    order: 2,
    short: { zh: "乙", en: "Eul", es: "Eul", fr: "Eul", ja: "乙", ko: "을" },
    yinYang: "YIN",
  },
  GAP: {
    element: "wood",
    id: "GAP",
    order: 1,
    short: { zh: "甲", en: "Gap", es: "Gap", fr: "Gap", ja: "甲", ko: "갑" },
    yinYang: "YANG",
  },
  GI: {
    element: "earth",
    id: "GI",
    order: 6,
    short: { zh: "己", en: "Gi", es: "Gi", fr: "Gi", ja: "己", ko: "기" },
    yinYang: "YIN",
  },
  GYE: {
    element: "water",
    id: "GYE",
    order: 10,
    short: { zh: "癸", en: "Gye", es: "Gye", fr: "Gye", ja: "癸", ko: "계" },
    yinYang: "YIN",
  },
  GYEONG: {
    element: "metal",
    id: "GYEONG",
    order: 7,
    short: {
      zh: "庚",
      en: "Gyeong",
      es: "Gyeong",
      fr: "Gyeong",
      ja: "庚",
      ko: "경",
    },
    yinYang: "YANG",
  },
  IM: {
    element: "water",
    id: "IM",
    order: 9,
    short: { zh: "壬", en: "Im", es: "Im", fr: "Im", ja: "壬", ko: "임" },
    yinYang: "YANG",
  },
  JEONG: {
    element: "fire",
    id: "JEONG",
    order: 4,
    short: {
      zh: "丁",
      en: "Jeong",
      es: "Jeong",
      fr: "Jeong",
      ja: "丁",
      ko: "정",
    },
    yinYang: "YIN",
  },
  MU: {
    element: "earth",
    id: "MU",
    order: 5,
    short: { zh: "戊", en: "Mu", es: "Mu", fr: "Mu", ja: "戊", ko: "무" },
    yinYang: "YANG",
  },
  SIN: {
    element: "metal",
    id: "SIN",
    order: 8,
    short: { zh: "辛", en: "Sin", es: "Sin", fr: "Sin", ja: "辛", ko: "신" },
    yinYang: "YIN",
  },
};

/**
 * Stem order array for 60 Ganzhi calculation
 */
export const STEM_ORDER: StemId[] = [
  "GAP",
  "EUL",
  "BYEONG",
  "JEONG",
  "MU",
  "GI",
  "GYEONG",
  "SIN",
  "IM",
  "GYE",
];

/**
 * Get stem by ID
 */
export const getStem = (id: StemId): HeavenlyStem => {
  return STEMS[id];
};

/**
 * Get stem element
 */
export const getStemElement = (id: StemId): ElementId => {
  return STEMS[id].element;
};
