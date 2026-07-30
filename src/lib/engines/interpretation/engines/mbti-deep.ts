import type { SixLangString } from "../engine.contract";
import { getGlossaryHints } from "../glossary";
import {
  COGNITIVE_FUNCTIONS,
  MBTI_DEEP_DATA,
} from "../shards/mbti-deep-shards";

// ============================================================================
// Types
// ============================================================================

export interface MBTIDeepInterpretation {
  /** Common challenges */
  challenges: SixLangString[];
  /** Type code (e.g., "INTJ") */
  code: string;
  /** Cognitive function stack with explanations */
  cognitiveStack: CognitiveStackAnalysis;
  /** Growth recommendations */
  growthPath: SixLangString;
  /** How this impacts your life and relationships */
  lifeImplications: SixLangString;
  /** Unique strengths */
  strengths: SixLangString[];
  /** Core narrative about this type */
  typeNarrative: SixLangString;
  /** How this type sees the world */
  worldview: SixLangString;
}

interface CognitiveFunction {
  /** Function code (e.g., "Ni", "Te") */
  code: string;
  name: SixLangString;
  narrative: SixLangString;
}

interface CognitiveStackAnalysis {
  /** Auxiliary function (Parent) */
  auxiliary: CognitiveFunction;
  /** Dominant function (Hero) */
  dominant: CognitiveFunction;
  /** Inferior function (Shadow) */
  inferior: CognitiveFunction;
  /** Tertiary function (Child) */
  tertiary: CognitiveFunction;
}

// ============================================================================
// Engine Function
// ============================================================================

export function interpretMBTIDeep(
  mbtiCode: string,
  cognitiveStack: string[],
  locale: string,
): MBTIDeepInterpretation {
  const data = MBTI_DEEP_DATA[mbtiCode.toUpperCase()] || MBTI_DEEP_DATA.INTJ;

  const cognitiveStackAnalysis: CognitiveStackAnalysis = {
    auxiliary: buildCognitiveFunction(cognitiveStack[1]),
    dominant: buildCognitiveFunction(cognitiveStack[0]),
    inferior: buildCognitiveFunction(cognitiveStack[3]),
    tertiary: buildCognitiveFunction(cognitiveStack[2]),
  };

  return {
    challenges: data.challenges,
    code: mbtiCode.toUpperCase(),
    cognitiveStack: cognitiveStackAnalysis,
    growthPath: data.growthPath,
    lifeImplications: data.lifeImplications,
    strengths: data.strengths,
    typeNarrative: data.typeNarrative,
    worldview: data.worldview,
  };
}

function buildCognitiveFunction(code: string): CognitiveFunction {
  const func = COGNITIVE_FUNCTIONS[code] || COGNITIVE_FUNCTIONS.Ni;
  return {
    code,
    name: func.name,
    narrative: func.narrative,
  };
}
