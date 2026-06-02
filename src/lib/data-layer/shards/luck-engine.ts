export type ElementType = "Earth" | "Fire" | "Metal" | "Water" | "Wood";

export interface LuckMapping {
  colorKey: string;
  directionKey: string;
  itemKeys: string[];
}

export const LUCK_RELATIONAL_MAP: Record<ElementType, LuckMapping> = {
  Earth: {
    colorKey: "ontology.luck.colors.yellow_brown",
    directionKey: "ontology.luck.directions.center",
    itemKeys: [
      "ontology.luck.items.pottery",
      "ontology.luck.items.stones",
      "ontology.luck.items.square_objects",
    ],
  },
  Fire: {
    colorKey: "ontology.luck.colors.red_purple",
    directionKey: "ontology.luck.directions.south",
    itemKeys: [
      "ontology.luck.items.electronics",
      "ontology.luck.items.candles",
      "ontology.luck.items.glasses",
    ],
  },
  Metal: {
    colorKey: "ontology.luck.colors.white_gold",
    directionKey: "ontology.luck.directions.west",
    itemKeys: [
      "ontology.luck.items.metal_jewelry",
      "ontology.luck.items.mirrors",
      "ontology.luck.items.fountain_pens",
    ],
  },
  Water: {
    colorKey: "ontology.luck.colors.black_navy",
    directionKey: "ontology.luck.directions.north",
    itemKeys: [
      "ontology.luck.items.fountains",
      "ontology.luck.items.glassware",
      "ontology.luck.items.paintings",
    ],
  },
  Wood: {
    colorKey: "ontology.luck.colors.green_blue",
    directionKey: "ontology.luck.directions.east",
    itemKeys: [
      "ontology.luck.items.plants",
      "ontology.luck.items.wooden_accessories",
      "ontology.luck.items.books",
    ],
  },
};

/**
 * Procedurally determines the "Great Luck" (Gil) and "Clash" (Hyung)
 * for Stem/Branch combinations between the User and the Current Day.
 */
export function getDailyLuckStatus(
  userStem: string,
  dayStem: string,
): { score: number; status: "Gil" | "Hyung" | "Neutral" } {
  // Harmony rules (Generation Cycle)
  const generatingMap: Record<string, string> = {
    Earth: "Metal",
    Fire: "Earth",
    Metal: "Water",
    Water: "Wood",
    Wood: "Fire",
  };

  // Conflict rules (Overcoming Cycle)
  const overcomingMap: Record<string, string> = {
    Earth: "Water",
    Fire: "Metal",
    Metal: "Wood",
    Water: "Fire",
    Wood: "Earth",
  };

  if (
    generatingMap[dayStem] === userStem ||
    generatingMap[userStem] === dayStem
  ) {
    return { score: 90, status: "Gil" };
  }

  if (overcomingMap[dayStem] === userStem) {
    return { score: 30, status: "Hyung" };
  }

  if (overcomingMap[userStem] === dayStem) {
    return { score: 50, status: "Neutral" }; // user overcomes day, somewhat effortful
  }

  return { score: 60, status: "Neutral" };
}

/**
 * Get Lucky attributes based on Favorable Element
 */
export function getLuckAttributes(favorableElement: ElementType): LuckMapping {
  return LUCK_RELATIONAL_MAP[favorableElement];
}
