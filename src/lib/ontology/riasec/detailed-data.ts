import { RIASEC_QUESTIONS } from "./data";
import type { RiasecQuestion } from "./types";

// Generate 48 questions by duplicating and slightly modifying IDs
// In a real app, these would be unique, distinct questions.
export const RIASEC_DETAILED_QUESTIONS: RiasecQuestion[] = [
  ...RIASEC_QUESTIONS,
  ...RIASEC_QUESTIONS.map((q) => ({ ...q, id: q.id + "_d1" })),
  ...RIASEC_QUESTIONS.map((q) => ({ ...q, id: q.id + "_d2" })),
  ...RIASEC_QUESTIONS.map((q) => ({ ...q, id: q.id + "_d3" })),
];
