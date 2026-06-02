import { calculateSaju } from "./logic";
import { SajuPillar, SajuResult } from "./types";

/**
 * Calculates the Saju pillars for the current moment.
 * Used for "Prophecy" logic (Time vs Person).
 */
export function getCurrentTimePillars(date: Date = new Date()): SajuResult {
  // Re-use the robust calculateSaju logic
  // We assume standard meridian (135) for simplicity or system server time context
  // In a real app, we might want user's timezone, but for "Universal Time" prophecy, standard KST/JST is often used in Saju apps.
  return calculateSaju(date, false, "male", 135.0);
}

/**
 * Checks for a "Clash" (Choong) between two Earthly Branches.
 * Simpler lookup for prophecy engine.
 * Rat(Ja) <-> Horse(O)
 * Ox(Chuk) <-> Goat(Mi)
 * Tiger(In) <-> Monkey(Sin)
 * Rabbit(Myo) <-> Rooster(Yu)
 * Dragon(Jin) <-> Dog(Sul)
 * Snake(Sa) <-> Pig(Hae)
 */
export function isBranchClash(branch1: string, branch2: string): boolean {
  const pairs = [
    ["JA", "O"],
    ["CHUK", "MI"],
    ["IN", "SIN"],
    ["MYO", "YU"],
    ["JIN", "SUL"],
    ["SA", "HAE"],
  ];

  return pairs.some(
    (p) =>
      (p[0] === branch1 && p[1] === branch2) ||
      (p[0] === branch2 && p[1] === branch1),
  );
}

/**
 * Checks for a "Harmony" (Hap) - Three Harmony (Sam-Hap)
 */
export function isBranchHarmony(branch1: string, branch2: string): boolean {
  const triplets = [
    ["IN", "O", "SUL"], // Fire
    ["SA", "YU", "CHUK"], // Metal
    ["SIN", "JA", "JIN"], // Water
    ["HAE", "MYO", "MI"], // Wood
  ];
  return triplets.some((t) => t.includes(branch1) && t.includes(branch2));
}
