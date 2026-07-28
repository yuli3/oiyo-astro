import type { LocalizedContent } from "./manifest";

export type LifeCategory =
  | "career"
  | "finance"
  | "fortune"
  | "lifestyle"
  | "mental"
  | "ontology"
  | "relationship";

export interface PersonalityTestEnriched {
  category?: TestCategoryEnriched;
  categoryId: null | string;
  createdAt: null | string;
  description: LocalizedContent | null;
  difficultyLevel: null | number;
  durationMinutes: null | number;
  id: string;
  isActive: boolean | null;
  isFeatured: boolean | null;
  name: LocalizedContent;
  questionCount: null | number;
  seoKeywords: LocalizedContent | null;
  shortDescription: LocalizedContent | null;
  slug: string;
  tags: null | string[];
  thumbnailUrl: null | string;
  updatedAt: null | string;
}

export interface TestCategoryEnriched {
  description: LocalizedContent | null;
  icon: null | string;
  id: string;
  name: LocalizedContent;
  slug: string;
  sortOrder: null | number;
}

export interface UserHistory {
  lastUpdated: number;
  results: UserResult[];
}

export interface UserResult {
  createdAt: number; // Timestamp
  id: string; // Unique result ID (e.g., uuid)
  isPremium?: boolean; // Whether this specific result has been unlocked
  metadata?: Record<string, unknown>; // Raw calculation data for re-hydration or details
  score?: number; // Normalized 0-100 score for "Life Score" calculations
  subtype: string; // Feature ID (e.g., 'salary-calculator', 'mbti')
  summary: LocalizedContent;
  title: LocalizedContent;
  type: LifeCategory; // Main category for grouping
}
