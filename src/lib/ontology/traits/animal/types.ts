import { Locale } from "@/i18n";

export interface AnimalQuestion {
  id: number;
  options: {
    animal: AnimalType;
    emoji: string;
    text: Record<Locale, string>;
  }[];
  question: Record<Locale, string>;
}

export interface AnimalResult {
  animal: AnimalType;
  careerPaths: Record<Locale, string[]>;
  color: string;
  compatibility: {
    best: AnimalType[];
    challenging: AnimalType[];
    good: AnimalType[];
  };
  description: Record<Locale, string>;
  emoji: string;
  idealDate: Record<Locale, string>;
  loveStyle: Record<Locale, string>;
  name: Record<Locale, string>;
  personality: Record<Locale, string[]>;
  strengths: Record<Locale, string[]>;
  weaknesses: Record<Locale, string[]>;
  workStyle: Record<Locale, string>;
}

export interface AnimalTestResult {
  primaryAnimal: AnimalType;
  scores: Record<AnimalType, number>;
  secondaryAnimal?: AnimalType;
}

export type AnimalType =
  | "bear"
  | "cat"
  | "dog"
  | "dolphin"
  | "eagle"
  | "fox"
  | "lion"
  | "owl"
  | "panda"
  | "rabbit"
  | "tiger"
  | "wolf";
