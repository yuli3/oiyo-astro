import type { PersonaId } from "./types";

export interface AtomicBlock {
  content: Record<string, string>; // Localized text
  id: string;
  tags: string[]; // e.g. ["fire", "ns_high", "wood_element"]
}

/**
 * Atomic Narrative Block Types
 * Defines the fragments used for Combinatorial Synthesis.
 */
export type NarrativeSlot = "catalyst" | "destiny" | "identity" | "state";

export interface PersonaVocabulary {
  personaId: PersonaId;
  slots: Record<NarrativeSlot, AtomicBlock[]>;
}

export interface SynergyRule {
  conditions: string[]; // Required tags (AND logic)
  priority: number;
  resultShard: Record<string, string>; // The "Third Meaning" text
}
