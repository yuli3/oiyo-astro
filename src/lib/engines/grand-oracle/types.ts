import type { BirthSymbol } from "../../data-layer/shards/fate-symbols";
import type { CelticTreeSign } from "../../ontology/celtic/types";
import type { EgyptianCoordinates } from "../../ontology/egyptian/types";
import type { SajuResult } from "../../ontology/saju/types";
import type { CelestialCoordinates } from "../../ontology/western/calculator";
import type { TCIResult } from "../../tci/types";
import type { VisualResonanceState } from "../visual-resonance/types";

export interface GrandOracleInput {
  biorhythm?: null | {
    emotional: number;
    intellectual: number;
    physical: number;
  };
  cosmic: CelestialCoordinates | null;
  enneagram?: null | {
    primaryType: number;
    title?: string;
    wing?: number;
  };
  locale: string;
  mbti?: null | {
    type: string;
  };
  mythos: {
    celtic: CelticTreeSign | null;
    egyptian: EgyptianCoordinates | null;
    symbols: BirthSymbol | null;
  };
  riasec?: null | {
    code: string;
    topCareer?: string;
  };
  saju: null | SajuResult;
  tci: null | TCIResult;
}

export interface OracleContext {
  input: GrandOracleInput;
  locale: string;
}

export interface OracleModule {
  id: string;
  run: (context: OracleContext) => Promise<Partial<UnifiedFateReport>>;
}

export interface SectionNarrative {
  badge?: string;
  content: string;
  title: string;
}

export interface SynthesisResult {
  alignmentScore: number;
  paradoxKey: string;
  paradoxResolution: string;
}

export interface UnifiedFateReport {
  sections: {
    cosmicEntry: SectionNarrative;
    elementalBlueprint: SectionNarrative;
    mythicalArchetype: SectionNarrative;
    prophecy?: SectionNarrative; // New Phase 16
    psychologicalMask: SectionNarrative;
    socialResonance?: SectionNarrative; // New
    vocationPath?: SectionNarrative; // New
  };
  summary: string;
  synthesis: SynthesisResult;
  visualResonance: VisualResonanceState;
}
