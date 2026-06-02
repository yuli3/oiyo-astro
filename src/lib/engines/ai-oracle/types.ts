// Mock Types representing the data we expect from other modules
// In a real scenario, these would be imported from their respective domains
export interface OntologyContext {
  numerology?: {
    destiny: number;
    lifePath: number;
  };
  saju?: {
    dayMaster: string; // e.g. "Gap-Mok"
    element: string; // e.g. "Wood"
    strength: string; // e.g. "Weak"
  };
  tci?: {
    character: string; // e.g. "Self-Directedness"
    temperament: string; // e.g. "Novelty Seeking"
  };
}

export interface OracleInput {
  context: Record<string, any>; // The raw data (saju, tci, etc)
  domain: "ontology" | "resonance" | "synergy";
  locale: "cn" | "en" | "es" | "fr" | "ja" | "ko";
  personaId: PersonaId;
}

export interface OracleResponse {
  isPreview?: boolean; // Whether this is a partial preview
  keywords: string[]; // Key themes extracted
  narrative: string; // The generated poetic text
  tone: string; // The emotional tone of the response
}

export interface PersonaDefinition {
  focus: string[]; // Domains this persona cares most about
  id: PersonaId;
  isPremium: boolean;
  name: Record<string, string>;
  role: Record<string, string>;
  tone: Record<string, string>;
}

export type PersonaId =
  | "coordinator"
  | "counselor"
  | "eastern"
  | "observer"
  | "prophet"
  | "seeker"
  | "western";

export interface SynergyContext {
  relationType: "business" | "friendship" | "romantic";
  userA: {
    mbti?: string;
    name: string;
    sajuElement: string;
  };
  userB: {
    mbti?: string;
    name: string;
    sajuElement: string;
  };
}
