/**
 * Map saju five-element counts (enum lowercase or display PascalCase)
 * onto the keys FiveElementsOrbit already understands.
 *
 * Do not invent a third vocabulary. The orbit scene is the SSOT for
 * display keys: Wood / Fire / Earth / Metal / Water.
 */

export const ORBIT_ELEMENT_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
export type OrbitElementKey = (typeof ORBIT_ELEMENT_ORDER)[number];

const TO_ORBIT: Record<string, OrbitElementKey> = {
  wood: "Wood",
  fire: "Fire",
  earth: "Earth",
  metal: "Metal",
  water: "Water",
  Wood: "Wood",
  Fire: "Fire",
  Earth: "Earth",
  Metal: "Metal",
  Water: "Water",
};

export interface OrbitFromCounts {
  elementCount: Record<OrbitElementKey, number>;
  dominantElement: OrbitElementKey;
  missingElements: OrbitElementKey[];
}

export function fiveElementCountsToOrbit(
  counts: Record<string, number> | undefined | null,
): OrbitFromCounts | null {
  if (!counts) return null;

  const elementCount = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  } satisfies Record<OrbitElementKey, number>;

  for (const [rawKey, rawValue] of Object.entries(counts)) {
    const key = TO_ORBIT[rawKey];
    if (!key) continue;
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0) continue;
    elementCount[key] += value;
  }

  let dominantElement: OrbitElementKey = "Wood";
  let max = -1;
  for (const key of ORBIT_ELEMENT_ORDER) {
    if (elementCount[key] > max) {
      max = elementCount[key];
      dominantElement = key;
    }
  }

  return {
    elementCount,
    dominantElement,
    missingElements: ORBIT_ELEMENT_ORDER.filter((key) => elementCount[key] === 0),
  };
}

export function compatibilityPairPeople(
  label1: string,
  label2: string,
  score: number,
): Array<{ id: string; label: string; score: number }> {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return [
    { id: "person-1", label: label1, score: clamped },
    { id: "person-2", label: label2, score: clamped },
  ];
}
