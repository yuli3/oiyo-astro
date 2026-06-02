import { LocalizedText } from "@/types/manifest";

export type LearningStyle = "auditory" | "kinesthetic" | "reading" | "visual";

export interface LearningStyleQuestion {
  id: string;
  options: {
    id: string;
    style: LearningStyle;
    text: LocalizedText;
    weight: number;
  }[];
  scenario: LocalizedText;
}

export interface LearningStyleResult {
  description: LocalizedText;
  idealEnvironment: LocalizedText;
  percentages: Record<LearningStyle, number>;
  primary: LearningStyle;
  scores: Record<LearningStyle, number>;
  secondary: LearningStyle;
  studyTips: { en: string[]; ko: string[] };
}
