export interface Category {
  id: CategoryId;
  translationKey: string;
}

export type CategoryId =
  | "all"
  | "career"
  | "finance"
  | "finance.tax"
  | "fortune"
  | "insights"
  | "labor"
  | "living"
  | "love"
  | "mental"
  | "ontology"
  | "relationship"
  | "resonance"
  | "social"
  | "user"
  | "wellness";

export const CATEGORIES: Category[] = [
  { id: "all", translationKey: "all" },
  { id: "ontology", translationKey: "ontology" },
  { id: "relationship", translationKey: "relationship" },

  { id: "finance", translationKey: "finance" },
  { id: "career", translationKey: "career" },
  { id: "mental", translationKey: "mental" },
  { id: "love", translationKey: "love" },
  { id: "labor", translationKey: "labor" },
  { id: "finance.tax", translationKey: "finance_tax" },
  { id: "living", translationKey: "living" },
  { id: "fortune", translationKey: "fortune" },
];
