import { UniversalCorrelationEngine } from "@/lib/ontology/chronos/chronos-engine";

import { consultOracle } from "./adapter";
import { CombinatorialEngine } from "./combinatorial-engine";
import type { OracleInput, OracleResponse, PersonaId } from "./types";

/**
 * Narrative Gateway
 * Routes requests to either Combinatorial Synthesis (Free) or Dynamic AI (Paid).
 */
export class NarrativeGateway {
  public static async getInsight(
    input: OracleInput,
    isPremiumUser: boolean = false,
  ): Promise<OracleResponse> {
    const { context, domain, locale, personaId } = input;

    const isPremiumPersona = this.checkPremiumPersona(personaId);
    const tags = UniversalCorrelationEngine.generateSemanticTags(
      context as any,
    );

    if (!isPremiumUser || (!isPremiumUser && isPremiumPersona)) {
      // Use Combinatorial Engine for Detailed Shard Assembly
      let narrativeText = CombinatorialEngine.synthesize(
        personaId,
        tags,
        locale,
      );

      const mustTruncate = isPremiumPersona && !isPremiumUser;
      if (mustTruncate) {
        const sentences = narrativeText.split(/[.!?]/);
        if (sentences.length > 1) {
          narrativeText = sentences[0].trim() + " ...";
        }
      }

      return {
        isPreview: mustTruncate,
        keywords: mustTruncate ? ["Preview"] : ["Combinatorial", "Detailed"],
        narrative: narrativeText,
        tone: mustTruncate ? "Intriguing" : "Balanced",
      };
    }

    // Call AI Oracle for Premium Users
    try {
      return await consultOracle(input);
    } catch (error) {
      console.error(
        "[NarrativeGateway] AI Oracle failed, falling back to combinatorial",
        error,
      );
      return {
        keywords: ["Fallback"],
        narrative: CombinatorialEngine.synthesize(personaId, tags, locale),
        tone: "Steady",
      };
    }
  }

  private static checkPremiumPersona(id: PersonaId): boolean {
    const premiumPersonas: PersonaId[] = ["seeker", "prophet", "observer"];
    return premiumPersonas.includes(id);
  }
}
