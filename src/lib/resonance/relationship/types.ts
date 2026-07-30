import type { AnimalResult, AnimalType } from "../../ontology/traits/animal/types";

export interface RelationshipAnalysis {
  activities: string[];
  advice: string[];
  challenges: string[];
  compatibilityScore: number;
  person1: AnimalResult;
  person2: AnimalResult;
  relationshipType: RelationshipType;
  strengths: string[];
}

export interface RelationshipSession {
  createdAt: string;
  id: string;
  person1?: {
    animal: AnimalType;
    completedAt: string;
    name?: string;
  };
  person2?: {
    animal: AnimalType;
    completedAt: string;
    name?: string;
  };
  relationshipType: RelationshipType;
}

export type RelationshipType = "family" | "friendship" | "romantic" | "work";
