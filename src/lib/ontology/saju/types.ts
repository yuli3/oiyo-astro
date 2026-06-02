import { LocalizedStringArray, LocalizedText } from "@/types/manifest";
export type { LocalizedStringArray, LocalizedText };

export enum EarthlyBranch {
  CHUK = "CHUK",
  HAE = "HAE",
  IN = "IN",
  JA = "JA",
  JIN = "JIN",
  MI = "MI",
  MYO = "MYO",
  O = "O",
  SA = "SA",
  SIN = "SIN",
  SUL = "SUL",
  YU = "YU",
}

export enum FiveElement {
  EARTH = "earth",
  FIRE = "fire",
  METAL = "metal",
  WATER = "water",
  WOOD = "wood",
}

export enum HeavenlyStem {
  BYEONG = "BYEONG",
  EUL = "EUL",
  GAP = "GAP",
  GI = "GI",
  GYE = "GYE",
  GYEONG = "GYEONG",
  IM = "IM",
  JEONG = "JEONG",
  MU = "MU",
  SIN = "SIN",
}

export enum TenGod {
  BI_GYEON = "BI_GYEON",
  GEOP_JAE = "GEOP_JAE",
  JEONG_GWAN = "JEONG_GWAN",
  JEONG_IN = "JEONG_IN",
  JEONG_JAE = "JEONG_JAE",
  PYEON_GWAN = "PYEON_GWAN",
  PYEON_IN = "PYEON_IN",
  PYEON_JAE = "PYEON_JAE",
  SANG_GWAN = "SANG_GWAN",
  SIK_SIN = "SIK_SIN",
}

export enum YinYang {
  YANG = "YANG",
  YIN = "YIN",
}

export interface BirthData {
  birthDate: Date;
  birthTime?: {
    hour: number;
    minute: number;
  };
  gender?: "female" | "male";
}

export interface EarthlyBranchRegistryEntry {
  element: FiveElement;
  hiddenStems: HeavenlyStem[];
  id: EarthlyBranch;
  key: string; // saju.branches.zi
  seasonKey: string; // saju.season.winter
  yinYang: YinYang;
}

export type EasternElement = FiveElement; // Alias for compatibility

export interface ElementalDistribution {
  [FiveElement.EARTH]: number;
  [FiveElement.FIRE]: number;
  [FiveElement.METAL]: number;
  [FiveElement.WATER]: number;
  [FiveElement.WOOD]: number;
}

export interface ElementCompatibilityResult {
  compatible: boolean;
  reason?: LocalizedText;
  reasonKey?: string;
}

export interface GreatLuckCycle {
  age: number;
  fortune: "average" | "challenging" | "difficult" | "excellent" | "good";
  period: string;
  pillar: SajuPillar;
}

export interface HeavenlyStemRegistryEntry {
  element: FiveElement;
  id: HeavenlyStem;
  key: string; // saju.stems.gap
  yinYang: YinYang;
}

export interface LuckyAttributes {
  color: string;
  direction: string;
  fateStar?: {
    id: string;
    key: string;
  };
  flower: string;
  gemstone: string;
  number: number;
}

// Alias for compatibility with previous simplified type
export type Pillar = SajuPillar;

export interface SajuAnalysis {
  dominantElement: FiveElement;
  elementalDistribution: ElementalDistribution;
  elementCounts: Record<FiveElement, number>;
  greatLuckCycles?: GreatLuckCycle[];
  luckyAttributes: LuckyAttributes;
  mainPersonality: HeavenlyStem;
  missingElements: FiveElement[];
  result: SajuResult;
  /** Ten God distribution for radar charts */
  tenGodCounts: Record<TenGod, number>;
  weakElement: FiveElement;
}

// Alias
export type SajuData = SajuResult;

export interface SajuPillar {
  earthlyBranch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  tenGod?: TenGod;
}

export interface SajuResult {
  birthDate: Date;
  day: SajuPillar;
  dayMaster: HeavenlyStem;
  gender: "female" | "male";
  hour: SajuPillar;
  isLunar: boolean;
  month: SajuPillar;
  year: SajuPillar;
}
