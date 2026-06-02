import { FiveElement } from "@/lib/ontology/saju/types";

export interface SajuConcept {
  category:
    | "advanced"
    | "biorhythm"
    | "critique"
    | "global"
    | "history"
    | "mechanism";
  id: string;
}

export interface SajuDeity {
  category: "LUCKY" | "NEUTRAL" | "UNLUCKY";
  elementMapping?: FiveElement;
  id: string;
  impactScore: number; // 1-10
}

export const SAJU_CONCEPTS: SajuConcept[] = [
  { category: "history", id: "history_origin" },
  { category: "mechanism", id: "mechanism_pillars" },
  { category: "advanced", id: "advanced_interaction" },
  { category: "global", id: "global_logic" },
  { category: "critique", id: "critique_modern" },
  { category: "biorhythm", id: "biorhythm_pulse" },
];

/**
 * Metadata for Saju Deities (Shinsal)
 * Logic-heavy properties are moved here, UI strings remain in i18n JSON.
 */
export const SAJU_DEITIES: Record<string, SajuDeity> = {
  BAEKHO_SAL: {
    category: "UNLUCKY",
    elementMapping: FiveElement.METAL,
    id: "BAEKHO_SAL",
    impactScore: 8,
  },
  CHEONGOI_GWIIN: { category: "LUCKY", id: "CHEONGOI_GWIIN", impactScore: 9 },
  DOHWA_SAL: { category: "NEUTRAL", id: "DOHWA_SAL", impactScore: 7 },
  GONGMANG: { category: "NEUTRAL", id: "GONGMANG", impactScore: 5 },
  GWEMUN_GWAN_SAL: {
    category: "UNLUCKY",
    id: "GWEMUN_GWAN_SAL",
    impactScore: 7,
  },
  HONGYEOM_SAL: { category: "LUCKY", id: "HONGYEOM_SAL", impactScore: 7 },
  HWAYEOM_SAL: { category: "NEUTRAL", id: "HWAYEOM_SAL", impactScore: 6 },
  YEOKMA_SAL: { category: "NEUTRAL", id: "YEOKMA_SAL", impactScore: 6 },
  // Placeholder for the full 50+ list. Logic properties are centralized here.
};

export interface ElementTraitMetadata {
  color: string;
  compatibleElements: FiveElement[];
  id: FiveElement;
  rank: number;
}

export const ELEMENT_TRAITS_METADATA: Record<
  FiveElement,
  ElementTraitMetadata
> = {
  [FiveElement.EARTH]: {
    color: "#eab308",
    compatibleElements: [FiveElement.METAL, FiveElement.FIRE],
    id: FiveElement.EARTH,
    rank: 3,
  },
  [FiveElement.FIRE]: {
    color: "#ef4444",
    compatibleElements: [FiveElement.EARTH, FiveElement.WOOD],
    id: FiveElement.FIRE,
    rank: 2,
  },
  [FiveElement.METAL]: {
    color: "#94a3b8",
    compatibleElements: [FiveElement.WATER, FiveElement.EARTH],
    id: FiveElement.METAL,
    rank: 4,
  },
  [FiveElement.WATER]: {
    color: "#3b82f6",
    compatibleElements: [FiveElement.WOOD, FiveElement.METAL],
    id: FiveElement.WATER,
    rank: 5,
  },
  [FiveElement.WOOD]: {
    color: "#22c55e",
    compatibleElements: [FiveElement.FIRE, FiveElement.WATER],
    id: FiveElement.WOOD,
    rank: 1,
  },
};

/**
 * Metadata for Ten Gods (Sim-Sin)
 */
export enum TenGodCategory {
  EGO = "EGO",
  EXPRESSION = "EXPRESSION",
  INTELLECT = "INTELLECT",
  POWER = "POWER",
  WEALTH = "WEALTH",
}

export interface TenGodMetadata {
  category: TenGodCategory;
  id: string;
  polarity: "NEUTRAL" | "YANG" | "YIN";
}

export const TEN_GODS_METADATA: Record<string, TenGodMetadata> = {
  BI_GYEON: { category: TenGodCategory.EGO, id: "BI_GYEON", polarity: "YANG" },
  GEOP_JAE: { category: TenGodCategory.EGO, id: "GEOP_JAE", polarity: "YIN" },
  JEONG_GWAN: {
    category: TenGodCategory.POWER,
    id: "JEONG_GWAN",
    polarity: "YIN",
  },
  JEONG_IN: {
    category: TenGodCategory.INTELLECT,
    id: "JEONG_IN",
    polarity: "YIN",
  },
  JEONG_JAE: {
    category: TenGodCategory.WEALTH,
    id: "JEONG_JAE",
    polarity: "YIN",
  },
  PYEON_GWAN: {
    category: TenGodCategory.POWER,
    id: "PYEON_GWAN",
    polarity: "YANG",
  },
  PYEON_IN: {
    category: TenGodCategory.INTELLECT,
    id: "PYEON_IN",
    polarity: "YANG",
  },
  PYEON_JAE: {
    category: TenGodCategory.WEALTH,
    id: "PYEON_JAE",
    polarity: "YANG",
  },
  SANG_GWAN: {
    category: TenGodCategory.EXPRESSION,
    id: "SANG_GWAN",
    polarity: "YIN",
  },
  SIK_SIN: {
    category: TenGodCategory.EXPRESSION,
    id: "SIK_SIN",
    polarity: "YANG",
  },
};
