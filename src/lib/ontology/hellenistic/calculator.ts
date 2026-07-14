import { TRIPLICITY_LORDS } from "./data";
import { HellenisticCoordinates, Sect, TriplicityLords } from "./types";
import { getTrueSolarTime } from "../kernel/astronomy";

/**
 * Main Calculator
 * Requires the already calculated Western Zodiac element
 */
export function calculateHellenisticCoordinates(
  date: Date,
  zodiacElement: "Air" | "Earth" | "Fire" | "Water",
  longitude: number = 135,
): HellenisticCoordinates {
  const sect = calculateSect(getTrueSolarTime(date, longitude));
  const triplicity = getTriplicityLords(sect, zodiacElement);

  return {
    isDayChart: sect === "Day",
    resonance: {
      key: "resonance.note",
      params: {
        participating: triplicity.participatingLord,
        primary: triplicity.primaryLord,
        secondary: triplicity.secondaryLord,
        sect: `sect.${sect}`,
      },
    },
    sect,
    triplicity,
  };
}

/**
 * Determine Sect based on time (Simplified)
 */
function calculateSect(date: Date): Sect {
  // `getTrueSolarTime` carries the local solar clock in UTC fields so the
  // result never depends on the visitor/runtime timezone.
  const hour = date.getUTCHours();
  // Simple approximation for MVP: 6 AM to 6 PM is Day
  return hour >= 6 && hour < 18 ? "Day" : "Night";
}

/**
 * Dorothean Triplicity Lords from external data
 */
function getTriplicityLords(
  sect: Sect,
  element: "Air" | "Earth" | "Fire" | "Water",
): TriplicityLords {
  const data = TRIPLICITY_LORDS[element];
  const rulers = sect === "Day" ? data.Day : data.Night;

  return {
    element,
    participatingLord: data.Part,
    primaryLord: rulers[0],
    secondaryLord: rulers[1],
    sect,
  };
}
