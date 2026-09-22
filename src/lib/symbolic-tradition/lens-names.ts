import type { CompatibilityLensId } from "./types";

/** 관점(렌즈) 이름. 우리의 지도와 두 사람 보기가 같은 이름을 쓴다. */
export const LENS_NAME: Record<"ko" | "en" | "ja" | "zh" | "fr" | "es", Record<CompatibilityLensId, string>> = {
  ko: { "five-elements": "오행", "yin-yang": "음양", "chinese-zodiac": "띠", "sun-sign": "태양궁", "element-complement": "채움", "day-master": "일간", "branch-harmony": "지지 합·충", "mayan-kin": "마야", "celtic-tree": "켈트" },
  en: { "five-elements": "Five elements", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiac", "sun-sign": "Sun sign", "element-complement": "Filling in", "day-master": "Day master", "branch-harmony": "Branch harmony", "mayan-kin": "Mayan", "celtic-tree": "Celtic" },
  ja: { "five-elements": "五行", "yin-yang": "陰陽", "chinese-zodiac": "干支", "sun-sign": "太陽星座", "element-complement": "補い", "day-master": "日干", "branch-harmony": "地支の合冲", "mayan-kin": "マヤ", "celtic-tree": "ケルト" },
  zh: { "five-elements": "五行", "yin-yang": "阴阳", "chinese-zodiac": "生肖", "sun-sign": "太阳星座", "element-complement": "互补", "day-master": "日干", "branch-harmony": "地支合冲", "mayan-kin": "玛雅", "celtic-tree": "凯尔特" },
  fr: { "five-elements": "Cinq éléments", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaque", "sun-sign": "Signe", "element-complement": "Complément", "day-master": "Maître du jour", "branch-harmony": "Branches", "mayan-kin": "Maya", "celtic-tree": "Celte" },
  es: { "five-elements": "Cinco elementos", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaco", "sun-sign": "Signo", "element-complement": "Complemento", "day-master": "Tronco del día", "branch-harmony": "Ramas", "mayan-kin": "Maya", "celtic-tree": "Celta" },
};
