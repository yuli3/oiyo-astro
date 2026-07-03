/**
 * Five Elements (오행) - Single Source of Truth
 *
 * This file contains the canonical definitions for the Five Elements.
 * Translation strings should reference these IDs via i18n.
 */

export const ELEMENT_IDS = ["wood", "fire", "earth", "metal", "water"] as const;
export interface Element {
  color: string;
  destroysElement?: ElementId; // 극 (destructive cycle)
  generatesElement?: ElementId; // 생 (productive cycle)
  id: ElementId;
  order: number;
  season?: string;
  short: {
    zh: string;
    en: string;
    ko: string;
  };
  yinYang: YinYang;
}

export type ElementId = (typeof ELEMENT_IDS)[number];

export type YinYang = "YANG" | "YIN";

/**
 * Five Elements Registry - SSOT
 * All saju calculations should reference this data.
 */
export const ELEMENTS: Record<ElementId, Element> = {
  earth: {
    color: "#f59e0b", // amber-500
    destroysElement: "water",
    generatesElement: "metal",
    id: "earth",
    order: 3,
    season: "TRANSITION",
    short: { zh: "土", en: "Earth", ko: "토" },
    yinYang: "YIN",
  },
  fire: {
    color: "#ef4444", // red-500
    destroysElement: "metal",
    generatesElement: "earth",
    id: "fire",
    order: 2,
    season: "SUMMER",
    short: { zh: "火", en: "Fire", ko: "화" },
    yinYang: "YANG",
  },
  metal: {
    color: "#d4d4d8", // zinc-300
    destroysElement: "wood",
    generatesElement: "water",
    id: "metal",
    order: 4,
    season: "AUTUMN",
    short: { zh: "金", en: "Metal", ko: "금" },
    yinYang: "YIN",
  },
  water: {
    color: "#3b82f6", // blue-500
    destroysElement: "fire",
    generatesElement: "wood",
    id: "water",
    order: 5,
    season: "WINTER",
    short: { zh: "水", en: "Water", ko: "수" },
    yinYang: "YIN",
  },
  wood: {
    color: "#10b981", // green-500
    destroysElement: "earth",
    generatesElement: "fire",
    id: "wood",
    order: 1,
    season: "SPRING",
    short: { zh: "木", en: "Wood", ko: "목" },
    yinYang: "YANG",
  },
};

/**
 * Get element by ID
 */
export const getElement = (id: ElementId): Element => {
  return ELEMENTS[id];
};

/**
 * Get element that this element generates (productive cycle)
 */
export const getGeneratedElement = (id: ElementId): Element | undefined => {
  const generates = ELEMENTS[id].generatesElement;
  return generates ? ELEMENTS[generates] : undefined;
};

/**
 * Get element that this element destroys (destructive cycle)
 */
export const getDestroyedElement = (id: ElementId): Element | undefined => {
  const destroys = ELEMENTS[id].destroysElement;
  return destroys ? ELEMENTS[destroys] : undefined;
};

/**
 * Elemental cycle helpers
 */
export const ELEMENT_CYCLES = {
  destructive: {
    earth: "water",
    fire: "metal",
    metal: "wood",
    water: "fire",
    wood: "earth",
  } as Record<ElementId, ElementId>,
  productive: {
    earth: "metal",
    fire: "earth",
    metal: "water",
    water: "wood",
    wood: "fire",
  } as Record<ElementId, ElementId>,
};
