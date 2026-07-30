import atomicShards from "@/lib/engines/ai-oracle/data/atomic-shards.json";

import type { AtomicBlock, NarrativeSlot, SynergyRule } from "./narrative-schema";
import type { PersonaId } from "./types";

/**
 * Combinatorial Narrative Engine
 * Orchestrates the "Atomic Block" synthesis to create high-density insights.
 */
export class CombinatorialEngine {
  private static SYNERGY_RULES: SynergyRule[] = [
    {
      conditions: ["wood", "ns_high"],
      priority: 10,
      resultShard: {
        en: "Your explosive curiosity is like a giant tree rising through a dense forest.",
        ko: "당신의 폭발적인 호기심은 마치 빽빽한 숲을 뚫고 솟아오르는 거대한 나무와 같습니다.",
      },
    },
  ];

  /**
   * Synthesizes a multi-layered narrative based on user tags.
   */
  public static synthesize(
    personaId: PersonaId,
    userTags: string[], // e.g. ["wood", "ns_high", "stress"]
    locale: string = "ko",
  ): string {
    const vocabulary =
      (atomicShards as any)[personaId] || (atomicShards as any)["counselor"];

    // 1. Check Synergy Rules First (Priority Overrides)
    const activeRule = this.SYNERGY_RULES.filter((rule) =>
      rule.conditions.every((c) => userTags.includes(c)),
    ).sort((a, b) => b.priority - a.priority)[0];

    // 2. Assemble 4-Layer Narrative
    const layers: NarrativeSlot[] = [
      "identity",
      "state",
      "catalyst",
      "destiny",
    ];
    const fragments: string[] = [];

    if (activeRule) {
      fragments.push(
        activeRule.resultShard[locale] || activeRule.resultShard["en"],
      );
    }

    layers.forEach((slot) => {
      const options: AtomicBlock[] = vocabulary[slot] || [];
      // Find best match by tags
      const bestMatch = options.find((block) =>
        block.tags.some((t) => userTags.includes(t) || t === "generic"),
      );

      if (bestMatch) {
        fragments.push(bestMatch.content[locale] || bestMatch.content["en"]);
      }
    });

    return (
      fragments.join(" ") ||
      "The constellation of your data is still forming..."
    );
  }
}
