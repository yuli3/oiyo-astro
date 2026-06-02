export type BloodType = "A" | "AB" | "B" | "O";

export interface BloodTypeCompatibilityResult {
  analysis: {
    advice: {
      forType1: string;
      forType2: string;
      general: string;
    };
    detailedAnalysis: {
      communication: string;
      growth: string;
      lifestyle: string;
      personality: string;
    };
    summary: string;
    title: string;
  };
  score: BloodTypeCompatibilityScore;
  type1: BloodType;
  type2: BloodType;
}

// ... other types
export interface BloodTypeCompatibilityScore {
  communication: number;
  emotional: number;
  lifestyle: number;
  longTerm: number;
  overall: number;
  reasons: {
    challenges: string[];
    strengths: string[];
    tips: string[];
  };
}

export interface BloodTypePersonality {
  color: string;
  compatibility: {
    best: BloodType[];
    challenging: BloodType[];
    good: BloodType[];
  };
  percentage: number;
  type: BloodType;
}

export interface BloodTypeResult {
  data: BloodTypePersonality;
  // personalizedInsights strings -> keys
  personalizedInsights: {
    careerGuidance: string;
    growthAreas: string;
    relationshipTips: string;
    strengthAnalysis: string;
  };
  type: BloodType;
}
