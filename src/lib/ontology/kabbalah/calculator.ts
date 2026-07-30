/**
 * Kabbalah Calculator
 * The Grand Archive - Esoteric Mapping
 *
 * Maps Numerology Life Path Number to the Tree of Life Sephirot.
 */

import kabbalahData from "@/lib/ontology/kabbalah/data/paths.json";

import { calculateLifePathNumber } from "../numerology/logic";
import type { KabbalahCoordinates, Sephira } from "./types";

type SephiraKey = keyof typeof kabbalahData.shards.paths;

export function calculateKabbalahCoordinates(date: Date): KabbalahCoordinates {
  const lifePath = calculateLifePathNumber(date);

  // Map Life Path directly to Sephira ID (1-9)
  // Master numbers (11, 22, 33) reduce to 2, 4, 6 or map to special?
  // For simplicity MVP, we reduce Master Numbers to single digit for Sephira mapping
  // 11 -> Keter (1) or Chokmah (2)? Usually 11 is Da'at but it's hidden.
  // 11 -> 2 (1+1) -> Chokmah
  // 22 -> 4 -> Chesed
  // 33 -> 6 -> Tiferet
  // OR map 11 -> 1 (Keter - spiritual)

  // Let's use simple reduction for the shard lookup
  let sephiraKey = lifePath;
  if (sephiraKey > 10) {
    const str = sephiraKey.toString();
    sephiraKey = parseInt(str[0]) + parseInt(str[1]);
  }

  // Special case: if result is still > 10 (not possible with max 33=6 or 44=8)

  // Lookup
  const keyStr = String(sephiraKey) as SephiraKey;
  const shard =
    kabbalahData.shards.paths[keyStr] || kabbalahData.shards.paths["10"]; // Default to Malkuth

  const sephira: Sephira = {
    color: shard.color,
    id: shard.id,
    meaning: shard.meaning,
    name: shard.name,
    tarot: shard.tarot,
  };

  return {
    lifePathNumber: lifePath,
    pathDescription: `Your Life Path ${lifePath} resonates with the Sephira ${sephira.name}. This is the sphere of ${sephira.meaning}, radiating the color ${sephira.color}.`,
    sephira,
  };
}
