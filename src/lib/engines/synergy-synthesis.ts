/* eslint-disable no-restricted-syntax */
import { consultOracle } from "@/lib/engines/ai-oracle/adapter";
import type { NumerologyResult } from "@/lib/ontology/numerology/types";
import type { SajuResult } from "@/lib/ontology/saju/types";
import type { ConflictResponseResult } from "@/lib/resonance/conflict-response/types";
import type { FriendshipStyleResult } from "@/lib/resonance/friendship-style/types";
import type { LocalizedContent } from "@/types/manifest";

export interface SynergyInput {
  partner: {
    conflict?: ConflictResponseResult;
    friendship?: FriendshipStyleResult;
    name?: string;
    numerology?: NumerologyResult;
    saju?: SajuResult;
  };
  self: {
    conflict?: ConflictResponseResult;
    friendship?: FriendshipStyleResult;
    name?: string;
    numerology?: NumerologyResult;
    saju?: SajuResult;
  };
}

export interface SynergySynthesisReport {
  narrative: {
    bond: LocalizedContent; // How do we trust (Friendship)
    friction: LocalizedContent; // How do we handle sparks (Conflict)
    meeting: LocalizedContent; // Why did we meet (Destiny)
    synergy: LocalizedContent; // Final outcome
  };
  resonanceLayers: {
    destiny: number; // Saju + Numerology
    psychology: number; // Conflict + Friendship
    vibration: number; // Frequency alignment
  };
  totalResonanceScore: number;
  visualState: {
    complexity: number;
    primaryColor: string;
    pulseRate: number;
  };
}

/**
 * Synergy Synthesis Engine V2: The Grand Sync
 * Merges Destiny (Ontology) with Interaction (Resonance)
 * Powered by Google Gemini AI
 */
export async function synthesizeSynergy(
  input: SynergyInput,
): Promise<SynergySynthesisReport> {
  const { partner, self } = input;

  // Base score calculation (SIMULATED for V2 Prototype)
  const baseScore = 70;

  // 1. Destiny Layer
  const destinyScore = 75 + Math.floor(Math.random() * 20); // 75-95 range

  // 2. Psychology Layer
  let psychScore = 70;
  if (self.conflict && partner.conflict) {
    if (
      self.conflict.primaryStyle === "collaborating" ||
      partner.conflict.primaryStyle === "collaborating"
    ) {
      psychScore += 15;
    }
  } else {
    psychScore += Math.floor(Math.random() * 20);
  }

  // 3. Total Weighted Score
  const total = Math.round(destinyScore * 0.6 + psychScore * 0.4);

  // 4. AI Narrative Generation
  let aiNarrative = { narrative: "", tone: "" };

  try {
    const oracleResponse = await consultOracle({
      context: {
        input,
        scores: { destinyScore, psychScore, total },
      },
      domain: "synergy",
      locale: "en",
      personaId: "observer",
    });
    aiNarrative = oracleResponse;
  } catch (e) {
    console.error("AI Oracle failed, falling back to static", e);
  }

  // If AI fails or returns empty, fallback to static
  const finalNarrative =
    aiNarrative.narrative ||
    (total > 85
      ? "Destiny has guided you across a thousand years."
      : "A meeting that began as chance transforms into fate.");
  const meetingText = finalNarrative.split(".")[0] + ".";

  // Mock-up breaking the AI text into sections if it's long, or just using it
  // For V2, we will put the full AI text in 'synergy' and snippets in others

  return {
    narrative: {
      bond: {
        en: "A deep bond that reads each other’s hearts even in silence.",
        ko: "침묵 속에서도 서로의 마음을 읽어내는 깊은 유대감.",
      },
      friction: {
        en: "Your differences become the catalyst for mutual growth.",
        ko: "서로의 차이가 오히려 성장의 기폭제가 됩니다.",
      },
      meeting: {
        en: meetingText,
        ko: "AI 분석중...", // Would need ko-specific AI call
      },
      synergy: {
        en: finalNarrative,
        ko: "분석 완료.",
      },
    },
    resonanceLayers: {
      destiny: destinyScore,
      psychology: psychScore,
      vibration: Math.round((destinyScore + psychScore) / 2),
    },
    totalResonanceScore: total,
    visualState: {
      complexity: total / 100,
      primaryColor: total > 80 ? "#064e3b" : "#d97706", // Deep Emerald or Amber
      pulseRate: total > 80 ? 0.8 : 1.2,
    },
  };
}
