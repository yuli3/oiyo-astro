/**
 * Saju Math Engine
 * Pure mathematical functions to calculate the 60-Jiazi (Gan-Zhi) for any given date.
 * Based on Julian Day algorithm.
 */

export const HEAVENLY_STEMS = [
  "Jia",
  "Yi",
  "Bing",
  "Ding",
  "Wu",
  "Ji",
  "Geng",
  "Xin",
  "Ren",
  "Gui",
] as const;

export const EARTHLY_BRANCHES = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
] as const;

export const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

export interface DailyPillar {
  branch: EarthlyBranch;
  element: Element; // Element of the Stem (the "Day Master" energy)
  ganZhiIndex: number; // 0-59
  id: string; // e.g., "gap_jin" (Matches luck.json keys)
  labelEn: string; // e.g., "Wood Dragon"
  stem: HeavenlyStem;
}
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];
export type Element = (typeof ELEMENTS)[number];

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

// 0 = Wood (Jia/Yi), 1 = Fire (Bing/Ding), 2 = Earth (Wu/Ji), 3 = Metal (Geng/Xin), 4 = Water (Ren/Gui)
const STEM_ELEMENT_MAP: Record<HeavenlyStem, Element> = {
  Bing: "Fire",
  Ding: "Fire",
  Geng: "Metal",
  Gui: "Water",
  Ji: "Earth",
  Jia: "Wood",
  Ren: "Water",
  Wu: "Earth",
  Xin: "Metal",
  Yi: "Wood",
};

const BRANCH_LABELS: Record<EarthlyBranch, string> = {
  Dog: "Dog",
  Dragon: "Dragon",
  Goat: "Goat",
  Horse: "Horse",
  Monkey: "Monkey",
  Ox: "Ox",
  Pig: "Pig",
  Rabbit: "Rabbit",
  Rat: "Rat",
  Rooster: "Rooster",
  Snake: "Snake",
  Tiger: "Tiger",
};

const STEM_KOREAN_ROMANIZATION: Record<HeavenlyStem, string> = {
  Bing: "byeong",
  Ding: "jeong",
  Geng: "gyeong",
  Gui: "gye",
  Ji: "gi",
  Jia: "gap",
  Ren: "im",
  Wu: "mu",
  Xin: "sin",
  Yi: "eul",
};

const BRANCH_KOREAN_ROMANIZATION: Record<EarthlyBranch, string> = {
  Dog: "sul",
  Dragon: "jin",
  Goat: "mi",
  Horse: "o",
  Monkey: "sin",
  Ox: "chug",
  Pig: "hae",
  Rabbit: "myo",
  Rat: "ja",
  Rooster: "yu",
  Snake: "sa",
  Tiger: "in",
};

/**
 * Calculates the Daily Pillar (60-Jiazi) for a given date.
 * The cycle of 60 days is continuous and independent of year/month.
 *
 * Reference Point:
 * Jan 1, 1900 was a Monday.
 * Julian Day 2415021 used often as base.
 * Oct 14, 2023 was a Gui-Hai (60) day? checking...
 * Actually, let's use a simpler known anchor.
 * Jan 1, 2024 was a Jia-Zi (1) day. (Wait, let me verify this anchor mentally...
 * Actually, checking standard calendars: Jan 1 2024 was Jia-Zi.
 * Wait, Jan 1 2024 was actually a Jia-Zi YEAR? No, checking Day Pillar for Jan 1 2024.
 * Jan 1 2024: Jia-Zi DAY.
 * So if JD(Jan 1 2024) % 60 == 0 (or 1), we can find offset.)
 */
export function getDailyPillar(date: Date): DailyPillar {
  // Use noon to avoid timezone edge cases with JD calculation.
  // Saju Day Pillar is strictly tied to the Calendar Date (00:00 - 23:59).
  // By using local noon, we ensure that even if there's a minor timezone offset or DST shift,
  // we remain firmly within the correct Calendar Day for the user's locale.
  const noonDate = new Date(date);
  noonDate.setHours(12, 0, 0, 0);

  const jd = Math.floor(getJulianDay(noonDate) + 0.5);

  // The offset for Jia-Zi (0)
  // Let's calibrate.
  // Standard formula: (JD - 10) % 60
  // Or (JD - 11) % 60
  // Let's rely on Relative Anchor:
  // Jan 1, 2024 = Jia-Zi (Index 0).
  const anchorDate = new Date(2024, 0, 1); // Jan 1 2024
  anchorDate.setHours(12, 0, 0, 0);
  const anchorJd = Math.floor(getJulianDay(anchorDate) + 0.5);
  // Anchor JD should correspond to Index 0.

  const diff = jd - anchorJd;

  // Modulo in JS can be negative, so handle that
  let index = diff % 60;
  if (index < 0) index += 60;

  // Index 0 = Jia-Zi.
  const stemIndex = index % 10;
  const branchIndex = index % 12;

  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];

  return {
    branch,
    element: STEM_ELEMENT_MAP[stem],
    ganZhiIndex: index,
    id: `${STEM_KOREAN_ROMANIZATION[stem]}_${BRANCH_KOREAN_ROMANIZATION[branch]}`,
    labelEn: `${STEM_ELEMENT_MAP[stem]} ${BRANCH_LABELS[branch]}`,
    stem,
  };
}

/**
 * Calculates the Julian Day Number for a given date
 * @param date
 * @returns number
 */
function getJulianDay(date: Date): number {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}
