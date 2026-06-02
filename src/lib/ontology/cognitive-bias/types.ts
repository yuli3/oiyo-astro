export interface BiasDefinition {
  description: string;
  emoji: string;
  examples: string[];
  howToOvercome: string[];
  name: string;
  relatedBiases: BiasType[];
  subtitle: string;
}

export interface BiasScoreResult {
  awareness: string[];
  biasScores: Record<BiasType, number>;
  dominantBias: BiasType;
  recommendations: string[];
  riskLevel: "high" | "low" | "moderate";
}

export type BiasType =
  | "anchoring-bias"
  | "authority-bias"
  | "availability-heuristic"
  | "confirmation-bias"
  | "dunning-kruger"
  | "hindsight-bias" // NEW: 후견지명 편향
  | "status-quo-bias" // NEW: 현상유지 편향
  | "sunk-cost-fallacy" // NEW: 매몰비용 오류
  | "survivorship-bias";

export interface Question {
  category: "decision" | "learning" | "social" | "thinking";
  id: number;
  options: QuestionOption[];
  text: string;
}

export interface QuestionOption {
  biases: Partial<Record<BiasType, number>>; // Score contribution
  emoji: string;
  id: string; // Added for Template compatibility
  text: string;
}

export interface TestAnswer {
  biasContributions: Partial<Record<BiasType, number>>;
  questionId: number;
  selectedOption: number;
}
