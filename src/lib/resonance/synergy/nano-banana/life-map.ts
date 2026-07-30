import type { Locale } from "@/i18n";
import { GoogleGenAIService } from "@/lib/engines/ai/google-genai";

// Input interface for generating a Life Map
export interface LifeMapInput {
  birthDate: Date;
  gender?: "female" | "male" | "other";
  jobInterest?: string; // Optional user preference
  locale?: Locale;
  mbti?: string; // e.g., "INFJ"
  name: string;
  sajuElement?: string; // e.g., "Yang Wood (甲)"
  sajuStrongWeak?: string; // e.g., "Weak"
  zodiacSign?: string; // e.g., "Aries"
}

// Structured output for the Life Map
export interface LifeMapResult {
  career: {
    advice: string;
    archetype: string; // e.g. "The Visionary Leader"
    growthPath: string;
    strengths: string[];
    suitableRoles: string[];
  };
  communication: {
    persuasionTip: string;
    socialStance: string;
    speechStyle: string; // e.g. "Direct and Logical"
  };
  hobby: {
    leisureStyle: string;
    recommendations: Array<{
      activity: string;
      benefit: string; // "Mental clarity", "Physical vitality"
    }>;
  };
  // Advanced Metric
  potential: {
    statusInsight: string;
    statusScore: number; // 0-100
    wealthInsight: string;
    wealthScore: number; // 0-100
  };
  styling: {
    accessoryTip: string;
    colorPalette: string[]; // Hex codes or names
    concept: string; // e.g. "Minimalist Chic"
    fashionKeywords: string[];
  };
}

export class LifeMapService {
  static async generateLifeMap(
    input: LifeMapInput,
  ): Promise<LifeMapResult | null> {
    const locale = input.locale || "en";
    const prompt = this.getPrompt(input, locale);

    return GoogleGenAIService.generateJson<LifeMapResult>(prompt);
  }

  private static getPrompt(input: LifeMapInput, locale: Locale): string {
    const langName = {
      zh: "Simplified Chinese",
      en: "English",
      es: "Spanish",
      fr: "French",
      ja: "Japanese",
      ko: "Korean",
    }[locale || "en"];

    return `
    Act as an expert life consultant combining modern psychology (MBTI) and eastern wisdom (Saju, Zodiac).
    Analyze the following user profile and generate a comprehensive "Life Map".

    User Profile:
    - Name: ${input.name}
    - Birth Date: ${input.birthDate.toISOString().split("T")[0]}
    - Gender: ${input.gender || "Not specified"}
    - MBTI: ${input.mbti || "Unknown"}
    - Zodiac Sign: ${input.zodiacSign || "Unknown"}
    - Eastern Element (Saju): ${input.sajuElement || "Unknown"}
    ${input.sajuStrongWeak ? `- Energy Strength: ${input.sajuStrongWeak}` : ""}
    ${input.jobInterest ? `- Career Interest: ${input.jobInterest}` : ""}

    Task:
    Generate a JSON response in the structure defined below. 
    The content MUST be written in ${langName}.
    
    Guidelines:
    1. Career: Suggest roles that fit both their psychological type (MBTI) and destiny (Saju/Zodiac).
    2. Styling: Suggest a look that enhances their "Lucky Element" or complements their vibe.
    3. Potential: Estimate wealth/status potential (0-100) based on the synergy of their traits (this is for entertainment, make it encouraging but realistic based on traits like "conscientiousness" or "ambition").
    
    Required JSON Structure:
    {
      "career": {
        "archetype": "string",
        "suitableRoles": ["string", "string", "string"],
        "strengths": ["string", "string"],
        "growthPath": "string",
        "advice": "string"
      },
      "hobby": {
        "recommendations": [{"activity": "string", "benefit": "string"}],
        "leisureStyle": "string"
      },
      "styling": {
        "concept": "string",
        "fashionKeywords": ["string", "string"],
        "colorPalette": ["string", "string", "string"],
        "accessoryTip": "string"
      },
      "communication": {
        "speechStyle": "string",
        "persuasionTip": "string",
        "socialStance": "string"
      },
      "potential": {
        "wealthScore": number,
        "statusScore": number,
        "wealthInsight": "string",
        "statusInsight": "string"
      }
    }
    `;
  }
}
