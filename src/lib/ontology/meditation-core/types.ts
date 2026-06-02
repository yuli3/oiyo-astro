export interface AssessmentOption {
  text: string;
  value: string;
  weight: MeditationTraits;
}

export interface AssessmentQuestion {
  id: AssessmentQuestionId;
  options: AssessmentOption[];
  text: string;
}

export type AssessmentQuestionId =
  | "attentionStyle"
  | "environmentPreference"
  | "guidancePreference"
  | "mental.stressResponse"
  | "motivationSource"
  | "obstaclesWorry"
  | "ontology.learningStyle"
  | "timePreference";

export interface MeditationStyle {
  description: string;
  focus: string[]; // e.g. ["Breath", "Movement"]
  id: string;
  name: string;
  suitableFor: string[]; // e.g. ["High Anxiety", "Active Mind"]
}

export interface MeditationTraits {
  active: number;
  analytical: number;
  contemplative: number;
  creative: number;
  intuitive: number;
  practical: number;
}
