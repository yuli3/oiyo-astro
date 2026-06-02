import {
  BiorhythmData,
  calculateBiorhythm as engineCalculate,
} from "@/lib/engines/biorhythm-engine";
import { FiveElement } from "@/lib/ontology/saju/types";

export interface BiorhythmSynthesis {
  advice: string;
  alchemicalLink: FiveElement[];
  score: number;
  status: "critical" | "high" | "low" | "neutral" | "peak";
}

export type BiorhythmValue = {
  date: string;
  emotional: number;
  intellectual: number;
  physical: number;
};

/**
 * Calculates Biorhythm cycles for a given birth date and target date
 * Wrapper around engine for Saju compatibility (returns string date)
 */
export function calculateBiorhythm(
  birthDate: Date,
  targetDate: Date = new Date(),
): BiorhythmValue {
  const result = engineCalculate(birthDate, targetDate);
  return {
    ...result,
    date: result.date.toISOString().split("T")[0],
  };
}

/**
 * Generates data for a 10-day range for visualization
 */
export function getBiorhythmRange(
  birthDate: Date,
  centerDate: Date = new Date(),
): BiorhythmValue[] {
  const range: BiorhythmValue[] = [];
  for (let i = -3; i <= 7; i++) {
    const target = new Date(centerDate);
    target.setDate(target.getDate() + i);
    range.push(calculateBiorhythm(birthDate, target));
  }
  return range;
}

/**
 * Synthesis: Links Biorhythm to Saju Five Elements (Phase 34)
 */
export function synthesizeBiorhythms(
  bio: BiorhythmData | BiorhythmValue,
): Record<string, BiorhythmSynthesis> {
  const getStatus = (val: number): BiorhythmSynthesis["status"] => {
    if (Math.abs(val) < 10) return "critical";
    if (val < -50) return "low";
    if (val > 50) return "high";
    if (val > 90) return "peak";
    return "neutral";
  };

  return {
    emotional: {
      advice: "",
      alchemicalLink: [FiveElement.FIRE, FiveElement.WATER], // Fire (Heart/Passion), Water (Kidney/Calm)
      score: bio.emotional,
      status: getStatus(bio.emotional),
    },
    intellectual: {
      advice: "",
      alchemicalLink: [FiveElement.EARTH], // Earth (Mediation/Thought)
      score: bio.intellectual,
      status: getStatus(bio.intellectual),
    },
    physical: {
      advice: "", // To be populated by localized strings
      alchemicalLink: [FiveElement.WOOD, FiveElement.METAL], // Wood (Liver/Muscle), Metal (Bone/Lung)
      score: bio.physical,
      status: getStatus(bio.physical),
    },
  };
}
