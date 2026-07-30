import type { Faction } from "../../../manifest/ontology/shards/lifestyle/factions";
import type { ChosunFaction } from "../chosun-faction/logic";

export interface GenericFactionAnalysis {
  behavioralFaction: Faction | null;
  divergence: number;
  faction: Faction | null; // The final selected one
  innateFaction: Faction | null;
}

export function analyzeGenericFaction(
  factions: Faction[],
  userElement: string,
  userMbti?: string,
): GenericFactionAnalysis {
  // 1. Innate Faction (Based on Element)
  const innateFaction =
    factions.find((f) => f.tags.elements.includes(userElement as any)) ||
    factions[0] ||
    null;

  // 2. Behavioral Faction (Based on MBTI)
  let behavioralFaction = factions[0] || null; // Fallback
  if (userMbti) {
    behavioralFaction =
      factions.find((f) => f.tags.mbti?.includes(userMbti)) ||
      behavioralFaction;
  }

  // 3. Final Selection & Divergence
  const finalFaction = behavioralFaction || innateFaction;
  const divergence =
    innateFaction &&
    behavioralFaction &&
    innateFaction.id !== behavioralFaction.id
      ? 45 // Fixed mock divergence for illustration, can be enhanced
      : 0;

  return {
    behavioralFaction,
    divergence,
    faction: finalFaction,
    innateFaction,
  };
}
