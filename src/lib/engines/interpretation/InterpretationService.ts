import {
  ComprehensiveSajuReading,
  generateComprehensiveSajuReading,
} from "@/lib/ontology/saju/fortune/engine";
import { OntologyProfile } from "@/lib/ontology/types";

import {
  INTERPRETATION_DEFINITIONS,
  InterpretationDefinition,
} from "./data/definitions";

export interface DeepReading {
  future: string;
  id: string;
  meaning: string;
  present: string;
  source: string;
  title: string;
  trait: string;
}

export interface InterpretationResult {
  /** Comprehensive Saju fortune readings (local engine) */
  fortune: ComprehensiveSajuReading | null;
  /** Deep readings for each identified trait */
  readings: DeepReading[];
  /** Tier used for this interpretation */
  tier: SubscriptionTier;
}

export type SubscriptionTier = "free" | "paid" | "subscriber";

export class InterpretationService {
  /**
   * Generates interpretations based on profile and subscription tier.
   * - free: Local text engine only.
   * - paid: Local + (future: Gemini Flash single-system).
   * - subscriber: Local + (future: Gemini Flash full synthesis).
   */
  static generateReadings(
    profile: null | OntologyProfile,
    locale: string,
    tier: SubscriptionTier = "free",
  ): InterpretationResult {
    if (!profile) {
      return { fortune: null, readings: [], tier };
    }

    const readings: DeepReading[] = [];

    // 1. Check Saju (Day Master)
    if (profile.roots.universal?.saju?.dayMaster) {
      const dmDef = INTERPRETATION_DEFINITIONS.find(
        (d) =>
          d.source === "saju" &&
          d.trait === profile.roots.universal?.saju?.dayMaster,
      );
      if (dmDef) {
        readings.push(this.mapToReading(dmDef));
      }
    }

    // 2. Check MBTI
    if (profile.branches.mbti?.type) {
      const mbtiDef = INTERPRETATION_DEFINITIONS.find(
        (d) => d.source === "mbti" && d.trait === profile.branches.mbti?.type,
      );
      if (mbtiDef) {
        readings.push(this.mapToReading(mbtiDef));
      }
    }

    // 3. Generate Saju Fortune (Local Engine)
    let fortune: ComprehensiveSajuReading | null = null;
    if (profile.roots.universal?.saju) {
      fortune = generateComprehensiveSajuReading(profile.roots.universal.saju);
    }

    // 4. (Future) Tier-based AI enhancement
    // if (tier === 'paid' || tier === 'subscriber') {
    //   // Call Gemini Flash API for enhanced interpretation
    // }

    return { fortune, readings, tier };
  }

  private static mapToReading(def: InterpretationDefinition): DeepReading {
    // Key format: interpretations.{source}.{id}.{type}
    // e.g. interpretations.saju.fire_dm.meaning
    return {
      future: `interpretations.${def.source}.${def.id}.future`,
      id: def.id,
      meaning: `interpretations.${def.source}.${def.id}.meaning`,
      present: `interpretations.${def.source}.${def.id}.present`,
      source: def.source,
      title: def.trait, // Ideally this should also be a key, but 'trait' is currently "BYEONG" etc.
      trait: def.trait,
    };
  }
}
