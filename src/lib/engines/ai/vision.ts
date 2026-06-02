/* eslint-disable no-restricted-syntax */
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Note: In a real production app, you should call this via a backend API route
// to protect your API key. For this demo/prototype, we'll use the env var directly
// but warn about it.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Use Gemini 1.5 Flash for speed (The "Nano Banana" choice!)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface FaceAnalysisResult {
  description: {
    en: string;
    ko: string;
  };
  faceShape: "diamond" | "heart" | "long" | "oval" | "round" | "square";
  personalColor: "autumn_warm" | "spring_warm" | "summer_cool" | "winter_cool";
  recommendations: {
    colors: string[]; // hex codes
    glasses: { en: string; ko: string }[];
    hair: { en: string; ko: string }[];
  };
}

export const VisionService = {
  /**
   * Analyzes an image (base64) to determine face shape and personal color.
   */
  async analyzeFace(imageBase64: string): Promise<FaceAnalysisResult> {
    if (!apiKey) {
      console.warn("Gemini API Key is missing");
      // Return mock data if no key for demo purposes
      return VisionService.getMockAnalysis();
    }

    try {
      // Remove header if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageBase64.split(",")[1] || imageBase64;

      const prompt = `
        Analyze this face image for styling purposes.
        1. Determine the face shape (oval, round, square, heart, diamond, long).
        2. Determine the personal color season (spring_warm, summer_cool, autumn_warm, winter_cool).
        3. Provide a brief description of the facial features.
        4. Recommend 3 hairstyles, 2 glasses shapes, and 5 color hex codes that suit this person.
        
        Return JSON ONLY in this format:
        {
          "faceShape": "oval",
          "personalColor": "spring_warm",
          "description": { "en": "...", "ko": "..." },
          "recommendations": {
            "hair": [{"en": "...", "ko": "..."}],
            "glasses": [{"en": "...", "ko": "..."}],
            "colors": ["#...", "#..."]
          }
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg", // Assuming jpeg/png, standard base64 usually
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Clean markdown code blocks if present
      const jsonStr = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(jsonStr) as FaceAnalysisResult;
    } catch (error) {
      console.error("Vision analysis failed:", error);
      throw new Error("Failed to analyze image. Please try again.");
    }
  },

  getMockAnalysis(): FaceAnalysisResult {
    return {
      description: {
        en: "You have a balanced oval face with soft features.",
        ko: "균형 잡힌 계란형 얼굴과 부드러운 이목구비를 가지고 계십니다.",
      },
      faceShape: "oval",
      personalColor: "summer_cool",
      recommendations: {
        colors: ["#A3C1AD", "#F4C2C2", "#89CFF0", "#E6E6FA", "#FFFDD0"],
        glasses: [
          { en: "Round Frames", ko: "라운드 프레임" },
          { en: "Cat Eye", ko: "캣아이" },
        ],
        hair: [
          { en: "Long Layers", ko: "레이어드 컷" },
          { en: "Bob Cup", ko: "단발 보브컷" },
          { en: "Wavy Perm", ko: "굵은 웨이브 펌" },
        ],
      },
    };
  },
};
