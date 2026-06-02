import { differenceInDays } from "date-fns";

export interface BiorhythmState {
  average: number;
  emotional: number;
  intellectual: number;
  physical: number; // -100 to 100
}

export function calculateBiorhythm(
  birthDate: Date,
  targetDate: Date = new Date(),
): BiorhythmState {
  // Use start of day for accurate day difference
  const start = new Date(birthDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate);
  end.setHours(0, 0, 0, 0);

  const diff = differenceInDays(end, start);

  const physical = Math.sin((2 * Math.PI * diff) / 23) * 100;
  const emotional = Math.sin((2 * Math.PI * diff) / 28) * 100;
  const intellectual = Math.sin((2 * Math.PI * diff) / 33) * 100;

  return {
    average: Math.round((physical + emotional + intellectual) / 3),
    emotional: Math.round(emotional),
    intellectual: Math.round(intellectual),
    physical: Math.round(physical),
  };
}

export function getBiorhythmInterpretation(value: number): {
  description: string;
  state: "critical" | "high" | "low";
} {
  if (value > 20) return { description: "Active & Resilient", state: "high" };
  if (value < -20) return { description: "Recharge Needed", state: "low" };
  return { description: "Transition Phase - Be Careful", state: "critical" };
}
