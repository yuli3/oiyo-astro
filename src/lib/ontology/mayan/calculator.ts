import { GALACTIC_TONES, type MayanKin, SOLAR_SEALS } from "./types";

// Base Date: July 26, 1987 (Kin 34 - White Galactic Wizard)
const BASE_DATE = new Date(1987, 6, 26); // Month is 0-indexed
const BASE_KIN = 34;

export function calculateMayanKin(date: Date): MayanKin | null {
  // Check for Leap Day (Hunab Ku)
  if (
    isLeapYear(date.getFullYear()) &&
    date.getMonth() === 1 &&
    date.getDate() === 29
  ) {
    // Return special "0.0.Hunab Ku" object or null with flag?
    // For now, let's return null or a specific Kin 0 object?
    // Requirement says "0.0.Hunab Ku".
    // Types expect kinNumber. I'll make kinNumber 0.
    return {
      affirmation: "I am the Galactic Center. I am Timeless.",
      kinName: { en: "Hunab Ku", ko: "후납쿠" },
      kinNumber: 0,
      seal: {
        color: "white" as any,
        id: 0,
        key: "hunab_ku",
        keywords: ["Galactic Center", "Timelessness", "Void"],
        mayanName: "Hunab Ku",
        name: "Hunab Ku",
      },
      sealName: { en: "Hunab Ku", ko: "후납쿠" },
      tone: {
        key: "hunab_ku",
        keywords: ["Unity"],
        name: "Hunab Ku",
        number: 0,
      },
    };
  }

  const daysElapsed = getDreamspellDays(date);

  // Calculate Kin
  // Kin = ( (daysElapsed + BASE_KIN - 1) % 260 ) + 1
  let kin = (BASE_KIN + daysElapsed) % 260;
  if (kin <= 0) kin += 260; // Handle negative modulo for dates before 1987

  // Kin to Seal/Tone
  // Tone = ((Kin - 1) % 13) + 1
  const toneNum = ((kin - 1) % 13) + 1;
  const tone = GALACTIC_TONES.find((t) => t.number === toneNum)!;

  // Seal = ((Kin - 1) % 20) + 1
  const sealNum = ((kin - 1) % 20) + 1;
  const seal = SOLAR_SEALS.find((s) => s.id === sealNum)!;

  return {
    affirmation: `I ${tone.keywords[0]} in order to ${seal.keywords[2]}. ${tone.keywords[1]} ${seal.keywords[1]}. I seal the ${seal.keywords[0]} of ${seal.keywords[1]} with the ${tone.name} tone of ${tone.keywords[2]}.`,
    kinName: {
      en: `${tone.name} ${seal.name}`,
      ko: `${tone.name} ${seal.name}`, // Simplified for now, should ideally be translated
    },
    kinNumber: kin,
    seal: { ...seal, keywords: [...seal.keywords] },
    sealName: {
      en: seal.name,
      ko: seal.name,
    },
    tone: { ...tone, keywords: [...tone.keywords] },
  };
}

function getDreamspellDays(targetDate: Date): number {
  const tYear = targetDate.getFullYear();
  const bYear = BASE_DATE.getFullYear();

  // Real Days Difference
  const diffTime = targetDate.getTime() - BASE_DATE.getTime();
  const realDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Count Feb 29s in between
  // Start from 1988 (first leap after 1987)
  let leapDays = 0;

  // Determine direction
  const startYear = Math.min(bYear, tYear);
  const endYear = Math.max(bYear, tYear);

  for (let y = startYear; y <= endYear; y++) {
    if (isLeapYear(y)) {
      const feb29 = new Date(y, 1, 29);
      // Check if this Feb 29 is within the range [min, max]
      // And strict about start/end dates
      if (
        feb29 > (realDays >= 0 ? BASE_DATE : targetDate) &&
        feb29 < (realDays >= 0 ? targetDate : BASE_DATE)
      ) {
        leapDays++;
      }
      // If target IS Feb 29, we handle it separately (Hunab Ku)
    }
  }

  return realDays >= 0 ? realDays - leapDays : realDays + leapDays;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
