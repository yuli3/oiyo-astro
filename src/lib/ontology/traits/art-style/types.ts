export type ArtStyle =
  | "abstract-expressionist"
  | "classical-realist"
  | "modern-minimalist"
  | "nature-impressionist"
  | "pop-culture-vibrant"
  | "surreal-dreamer";

export interface ArtStyleProfile {
  artRecommendations: string[];
  colorPalette: string[];
  creativeExpressions: string[];
  description: string;
  emoji: string;
  famousArtists: string[];
  museumSuggestions: string[];
  name: string;
  traits: string[];
}

export interface ArtStyleQuestion {
  id: string;
  options: {
    id: string;
    style: ArtStyle;
    text: string;
    weight: number;
  }[];
  scenario: string;
}

// TODO : 6개의 언어 지원 확실하게.
export interface ArtStyleResult {
  artRecommendations: string[];
  colorPalette: string[];
  creativeExpressions: string[];
  description: string;
  famousArtists: string[];
  museumSuggestions: string[];
  percentages: Record<ArtStyle, number>;
  primary: ArtStyle;
  scores: Record<ArtStyle, number>;
  secondary: ArtStyle;
  traits: string[];
}
