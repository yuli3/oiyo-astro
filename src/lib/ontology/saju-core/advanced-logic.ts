import {
  EarthlyBranch,
  HeavenlyStem,
  SajuResult,
} from "@/lib/ontology/saju/types";

// Simplified types for the logic engine
export type Element = "Earth" | "Fire" | "Metal" | "Water" | "Wood";

export interface GreatFortuneCycle {
  age: number;
  branch: EarthlyBranch;
  stems: HeavenlyStem;
  year: number;
}

export interface InteractionResult {
  affected: [string, string];
  intensity: number; // 1-10
  resultElement?: Element;
  type: "banghap" | "chung" | "hae" | "hap" | "hyung" | "pa" | "samhap";
}

/**
 * Analyzes Interactions (Hap, Chung, etc.)
 */
export function analyzeInteractions(pillars: SajuResult): InteractionResult[] {
  const results: InteractionResult[] = [];

  // 1. Heavenly Stem Hap (Ten Combinations)
  // Gap + Gi = Earth
  // Eul + Gyeong = Metal
  // Byeong + Sin = Water
  // Jeong + Im = Wood
  // Mu + Gye = Fire
  const stemHapMap: Record<string, { partner: HeavenlyStem; result: Element }> =
    {
      [HeavenlyStem.BYEONG]: { partner: HeavenlyStem.SIN, result: "Water" },
      [HeavenlyStem.EUL]: { partner: HeavenlyStem.GYEONG, result: "Metal" },
      [HeavenlyStem.GAP]: { partner: HeavenlyStem.GI, result: "Earth" },
      [HeavenlyStem.JEONG]: { partner: HeavenlyStem.IM, result: "Wood" },
      [HeavenlyStem.MU]: { partner: HeavenlyStem.GYE, result: "Fire" },
    };

  // 2. Heavenly Stem Chung (Four Clashes)
  // Gap vs Gyeong
  // Eul vs Sin
  // Byeong vs Im
  // Jeong vs Gye
  const stemChungMap: Record<string, HeavenlyStem> = {
    [HeavenlyStem.BYEONG]: HeavenlyStem.IM,
    [HeavenlyStem.EUL]: HeavenlyStem.SIN,
    [HeavenlyStem.GAP]: HeavenlyStem.GYEONG,
    [HeavenlyStem.JEONG]: HeavenlyStem.GYE,
  };

  const pillarKeys = ["year", "month", "day", "hour"] as const;

  for (let i = 0; i < pillarKeys.length; i++) {
    for (let j = i + 1; j < pillarKeys.length; j++) {
      const p1 = (pillars as any)[pillarKeys[i]];
      const p2 = (pillars as any)[pillarKeys[j]];

      // Stem Hap
      if (
        stemHapMap[p1.heavenlyStem]?.partner === p2.heavenlyStem ||
        stemHapMap[p2.heavenlyStem]?.partner === p1.heavenlyStem
      ) {
        results.push({
          affected: [pillarKeys[i], pillarKeys[j]],
          intensity: 7,
          resultElement:
            stemHapMap[p1.heavenlyStem]?.result ||
            stemHapMap[p2.heavenlyStem]?.result,
          type: "hap",
        });
      }

      // Stem Chung
      if (
        stemChungMap[p1.heavenlyStem] === p2.heavenlyStem ||
        stemChungMap[p2.heavenlyStem] === p1.heavenlyStem
      ) {
        results.push({
          affected: [pillarKeys[i], pillarKeys[j]],
          intensity: 8,
          type: "chung",
        });
      }
    }
  }

  return results;
}

/**
 * Calculates Great Fortune (Daewun) cycles
 */
export function calculateGreatFortune(
  monthPillar: { branch: EarthlyBranch; stem: HeavenlyStem },
  yearStemPolarity: "Yang" | "Yin",
  gender: "Female" | "Male",
): GreatFortuneCycle[] {
  const cycles: GreatFortuneCycle[] = [];

  // Direction calculation:
  // Male + Yang Year = Forward
  // Male + Yin Year = Backward
  // Female + Yang Year = Backward
  // Female + Yin Year = Forward
  const isForward =
    (gender === "Male" && yearStemPolarity === "Yang") ||
    (gender === "Female" && yearStemPolarity === "Yin");

  const stems: HeavenlyStem[] = [
    HeavenlyStem.GAP,
    HeavenlyStem.EUL,
    HeavenlyStem.BYEONG,
    HeavenlyStem.JEONG,
    HeavenlyStem.MU,
    HeavenlyStem.GI,
    HeavenlyStem.GYEONG,
    HeavenlyStem.SIN,
    HeavenlyStem.IM,
    HeavenlyStem.GYE,
  ];
  const branches: EarthlyBranch[] = [
    EarthlyBranch.JA,
    EarthlyBranch.CHUK,
    EarthlyBranch.IN,
    EarthlyBranch.MYO,
    EarthlyBranch.JIN,
    EarthlyBranch.SA,
    EarthlyBranch.O,
    EarthlyBranch.MI,
    EarthlyBranch.SIN,
    EarthlyBranch.YU,
    EarthlyBranch.SUL,
    EarthlyBranch.HAE,
  ];

  let currentStemIdx = stems.indexOf(monthPillar.stem);
  let currentBranchIdx = branches.indexOf(monthPillar.branch);

  // Mock start age for now (Real logic needs precise birthday vs solar term calculation)
  const startAge = 5;

  for (let i = 0; i < 8; i++) {
    if (isForward) {
      currentStemIdx = (currentStemIdx + 1) % 10;
      currentBranchIdx = (currentBranchIdx + 1) % 12;
    } else {
      currentStemIdx = (currentStemIdx - 1 + 10) % 10;
      currentBranchIdx = (currentBranchIdx - 1 + 12) % 12;
    }

    cycles.push({
      age: startAge + i * 10,
      branch: branches[currentBranchIdx],
      stems: stems[currentStemIdx],
      year: new Date().getFullYear() + i * 10, // Approximate
    });
  }

  return cycles;
}

/**
 * Global Saju: Adjusts birth time based on Longitude (True Solar Time)
 * longitude: decimal degrees
 * birthTime: Date object in local time
 */
import { getTrueSolarTime } from "../kernel/astronomy";

export function calculateTrueSolarTime(
  birthTime: Date,
  longitude: number,
): Date {
  return getTrueSolarTime(birthTime, longitude);
}
