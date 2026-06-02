// Personal Color Palette v2 Types

export interface ColorPalette {
  accent: string;
  hex: {
    accent: string;
    primary: string;
    secondary: string;
  };
  primary: string;
  secondary: string;
}

export interface FontRecommendation {
  accent: string; // 강조용 폰트
  body: string; // 본문용 폰트
  description: string;
  display: string; // 제목용 폰트
}

export interface ImageMood {
  atmosphere: string; // 분위기 설명
  keywords: string[]; // 추천 키워드
  style: string; // 이미지 스타일 (e.g., "minimalist", "vintage")
}

export interface PersonalColorResult {
  avoidColors: string[];
  bestColors: string[];
  characteristics: string[];
  colorPalette: ColorPalette;
  fashionTips: string[];
  fontRecommendation: FontRecommendation;
  imageMood: ImageMood;
  makeupTips: string[];
  season: SeasonType;
  styleGuide: string[];
  tone: ToneType;
}

export interface Question {
  category: string;
  id: number;
  options: QuestionOption[];
  text: string;
}

export interface QuestionOption {
  emoji: string;
  points: number;
  season: SeasonType;
  text: string;
}

export type SeasonType = "autumn" | "spring" | "summer" | "winter";

export interface TestAnswer {
  points: number;
  questionId: number;
  season: SeasonType;
  selectedOption: number;
}

export type ToneType =
  | "bright-spring"
  | "bright-winter"
  | "cool-summer"
  | "cool-winter"
  | "light-summer"
  | "soft-autumn"
  | "warm-autumn"
  | "warm-spring";
