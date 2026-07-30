import { calculateTrueSolarTime } from "@/lib/ontology/saju-core/advanced-logic";
import { BRANCH_ORDER } from "@/manifest/data/saju/branches";
import { STEM_ORDER } from "@/manifest/data/saju/stems";

import { getSolarLongitude, getSolarTermDate } from "../kernel/astronomy";
import { earthlyBranches, heavenlyStems, SIXTY_GANZHI } from "./data";
import { EarthlyBranch, FiveElement, HeavenlyStem, TenGod, YinYang } from "./types";
import type { ElementCompatibilityResult, SajuAnalysis, SajuPillar, SajuResult } from "./types";

export function analyzeDayMasterStrength(saju: SajuResult): {
  dominantTenGod: null | TenGod;
  isStrong: boolean;
} {
  const dmElement = heavenlyStems[saju.dayMaster].element;
  let supportCount = 0;

  // Check all pillars for elements that support the Day Master (Self or Mother element)
  const pillars = [saju.year, saju.month, saju.day, saju.hour];
  pillars.forEach((p) => {
    // Check Heavenly Stem
    const stemEl = heavenlyStems[p.heavenlyStem].element;
    if (stemEl === dmElement) supportCount += 1;
    // (Simplification: Mother element also supports, but let's keep it simple for now)

    // Check Earthly Branch
    const branchEl = earthlyBranches[p.earthlyBranch].element;
    if (branchEl === dmElement) supportCount += 1;
  });

  // Dominant Ten God detection (simplified: most frequent)
  // In a real engine, we'd use the month branch hidden stem as the most dominant.
  const dominantTenGod = saju.month.tenGod || null;

  return {
    dominantTenGod,
    isStrong: supportCount >= 3, // Basic heuristic: 3 or more supporting elements make it "strong"
  };
}

export function analyzeSaju(result: SajuResult): SajuAnalysis {
  const elements = [
    heavenlyStems[result.year.heavenlyStem].element,
    earthlyBranches[result.year.earthlyBranch].element,
    heavenlyStems[result.month.heavenlyStem].element,
    earthlyBranches[result.month.earthlyBranch].element,
    heavenlyStems[result.day.heavenlyStem].element,
    earthlyBranches[result.day.earthlyBranch].element,
    heavenlyStems[result.hour.heavenlyStem].element,
    earthlyBranches[result.hour.earthlyBranch].element,
  ];

  const elementCounts: Record<FiveElement, number> = {
    [FiveElement.EARTH]: 0,
    [FiveElement.FIRE]: 0,
    [FiveElement.METAL]: 0,
    [FiveElement.WATER]: 0,
    [FiveElement.WOOD]: 0,
  };

  elements.forEach((el) => {
    elementCounts[el as FiveElement]++;
  });

  // Calculate Percentages (approximate based on counts, total 8)
  // Or just keep raw counts? The interface says number (could be percentage or count).
  // The UI code seemed to use percentage logic or raw counts.
  // Legacy analyzeSaju returned counts.

  let dominantElement = FiveElement.WOOD;
  let maxCount = -1;
  let weakElement = FiveElement.WOOD;
  let minCount = 99;

  const missingElements: FiveElement[] = [];

  Object.entries(elementCounts).forEach(([el, count]) => {
    const element = el as FiveElement;
    if (count > maxCount) {
      maxCount = count;
      dominantElement = element;
    }
    if (count < minCount) {
      minCount = count;
      weakElement = element;
    }
    if (count === 0) {
      missingElements.push(element);
    }
  });

  const total = 8;
  const elementalDistribution: Record<FiveElement, number> = {
    [FiveElement.EARTH]: Math.round(
      (elementCounts[FiveElement.EARTH] / total) * 100,
    ),
    [FiveElement.FIRE]: Math.round(
      (elementCounts[FiveElement.FIRE] / total) * 100,
    ),
    [FiveElement.METAL]: Math.round(
      (elementCounts[FiveElement.METAL] / total) * 100,
    ),
    [FiveElement.WATER]: Math.round(
      (elementCounts[FiveElement.WATER] / total) * 100,
    ),
    [FiveElement.WOOD]: Math.round(
      (elementCounts[FiveElement.WOOD] / total) * 100,
    ),
  };

  // Lucky Attributes based on Weak Element (Balancing Theory - Yongsin Proxy)
  // If multiple weak, pick the first found (usually Wood in this iteration if all 0)
  // Ideally should pick the one that balances the Dominant, but "Strengthen Weak" is a safe simple proxy.
  const luckyMap: Record<
    FiveElement,
    {
      color: string;
      direction: string;
      flower: string;
      gemstone: string;
      number: number;
    }
  > = {
    [FiveElement.EARTH]: {
      color: "yellow",
      direction: "center",
      flower: "sunflower",
      gemstone: "topaz",
      number: 5,
    },
    [FiveElement.FIRE]: {
      color: "red",
      direction: "south",
      flower: "rose",
      gemstone: "ruby",
      number: 2,
    },
    [FiveElement.METAL]: {
      color: "white",
      direction: "west",
      flower: "lily",
      gemstone: "diamond",
      number: 4,
    },
    [FiveElement.WATER]: {
      color: "black",
      direction: "north",
      flower: "lotus",
      gemstone: "sapphire",
      number: 1,
    },
    [FiveElement.WOOD]: {
      color: "green",
      direction: "east",
      flower: "orchid",
      gemstone: "green",
      number: 3,
    },
  };

  const luckyAttributes = {
    ...(luckyMap[weakElement] || luckyMap[FiveElement.WOOD]),
    fateStar: getStarByMonth(BRANCH_ORDER.indexOf(result.month.earthlyBranch)),
  };

  // Calculate Ten God distribution for radar charts
  const tenGodCounts: Record<TenGod, number> = {
    [TenGod.BI_GYEON]: 0,
    [TenGod.GEOP_JAE]: 0,
    [TenGod.JEONG_GWAN]: 0,
    [TenGod.JEONG_IN]: 0,
    [TenGod.JEONG_JAE]: 0,
    [TenGod.PYEON_GWAN]: 0,
    [TenGod.PYEON_IN]: 0,
    [TenGod.PYEON_JAE]: 0,
    [TenGod.SANG_GWAN]: 0,
    [TenGod.SIK_SIN]: 0,
  };

  // Count Ten Gods from all pillars (except Day Master itself)
  const pillarTenGods = [
    result.year.tenGod,
    result.month.tenGod,
    result.hour.tenGod,
  ].filter(Boolean) as TenGod[];

  pillarTenGods.forEach((tg) => {
    tenGodCounts[tg]++;
  });

  // Also count hidden stems from branches (advanced analysis)
  const branchHiddenTenGods = [
    result.year.earthlyBranch,
    result.month.earthlyBranch,
    result.day.earthlyBranch,
    result.hour.earthlyBranch,
  ].flatMap((branch) => {
    const branchData = earthlyBranches[branch];
    if (!branchData?.hiddenStems) return [];
    return branchData.hiddenStems.map((stem) =>
      calculateTenGod(result.dayMaster, stem),
    );
  });

  branchHiddenTenGods.forEach((tg) => {
    if (tg) tenGodCounts[tg]++;
  });

  return {
    dominantElement,
    elementalDistribution,
    elementCounts,
    luckyAttributes,
    mainPersonality: result.dayMaster,
    missingElements,
    result,
    tenGodCounts,
    weakElement,
  };
}

/**
 * Calculates the Saju Pillars based on birth date.
 * Supports True Solar Time (TST) correction via longitude.
 */
export function calculateSaju(
  birthDate: Date,
  isLunar: boolean = false,
  gender: "female" | "male" = "male",
  longitude: number = 135.0, // Default to KST/JST standard meridian
): SajuResult {
  // 0. True Solar Time Correction
  // Adjust the birth date to the solar time at the birth longitude before
  // calculating pillars. The TST wall clock lives in the result's UTC fields
  // (see getTrueSolarTime) — reading local fields here would let the visitor's
  // browser timezone move the pillars.
  const trueBirthDate = calculateTrueSolarTime(birthDate, longitude);

  const year = trueBirthDate.getUTCFullYear();
  const month = trueBirthDate.getUTCMonth() + 1;
  const day = trueBirthDate.getUTCDate();
  const hour = trueBirthDate.getUTCHours();
  const minute = trueBirthDate.getUTCMinutes();

  // 1. Year Pillar (Lichun / Ipchun cutoff)
  // Use absolute birthDate (Mean Time) for Solar Term comparison,
  // as Solar Terms are orbital events tied to absolute time.
  const currentYearLichun = getSolarTermDate(year, 0);
  let adjustedYear = year;
  if (birthDate < currentYearLichun) {
    adjustedYear = year - 1;
  }

  const baseYear = 4;
  const yearIndex = (adjustedYear - baseYear) % 60;
  const adjustedYearIndex = yearIndex < 0 ? yearIndex + 60 : yearIndex;
  const yearGanzhi = SIXTY_GANZHI[adjustedYearIndex];

  // 2. Month Pillar
  // The month branch is fixed by the sun's ecliptic longitude, not the calendar
  // date: the twelve "seasonal nodes" (節) sit 30 deg apart, starting at Ipchun
  // (315 deg = In / Tiger month), so the longitude alone selects the branch,
  // independent of where the January solar terms land in the Gregorian year.
  //
  // The previous implementation scanned getSolarTermDate(year, 23..0). Once the
  // Ipchun seed was corrected, 소한/대한 (terms 22-23) resolve to *January of the
  // same year*, so that descending scan matched every mid-year birth against
  // 대한 and collapsed every month pillar to 축월 (Ox). Deriving from longitude
  // removes the calendar-year ambiguity entirely.
  const solarLongitude = getSolarLongitude(birthDate);
  const monthBranchIndex =
    (Math.floor((((solarLongitude - 315) % 360) + 360) % 360 / 30) + 2) % 12;

  const monthBranch = BRANCH_ORDER[monthBranchIndex];

  // Month Stem derived from Year Stem
  const yearStemIndex = STEM_ORDER.indexOf(yearGanzhi.stem);
  // Formula: (YearStemIndex * 2 + MonthBranchIndex) % 10 ??
  // No, the formula is:
  // Gap/Gi Year -> Month starts with Byeong-In
  // Eul/Gyeong Year -> Month starts with Mu-In
  // ...
  // This is traditionally looked up. Ideally should be (YearStem * 2 + offset)
  // Let's use standard Saju formula for Stem of Month (Wol-Dun-Beop)
  // Month Branch Index starts at In(2).
  // Offset relative to In-Month.
  const monthOffset = (monthBranchIndex - 2 + 12) % 12; // In=0, Myo=1...
  const monthStemIndex = ((yearStemIndex % 5) * 2 + 2 + monthOffset) % 10;

  const monthStem = STEM_ORDER[monthStemIndex];

  // 3. Day Pillar
  // Absolute day count.
  const baseDate = new Date(1900, 0, 1);
  // Need to handle Timezone offset in diff calculation to avoid off-by-one due to DST/TZ
  // Use UTC for diff
  const utcBirth = Date.UTC(adjustedYear, month - 1, day);
  const utcBase = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((utcBirth - utcBase) / (1000 * 60 * 60 * 24));

  // Base 1900-01-01 was Gap-Sul (Index 10: Gap=0, Sul=10)
  // Wait, let's verify 1900-01-01.
  // Reference: Jan 1 1900 is Gap-Sul.
  const baseDayIndex = 10;
  const dayIndex = (baseDayIndex + diffDays) % 60;
  const dayGanzhi = SIXTY_GANZHI[dayIndex];

  // 4. Hour Pillar
  // Night Ja-Si Logic (23:30 - 00:00)
  // In modern Saju (Yaja-Si):
  // Hour is Ja (Rat). Day is Current Day.
  // In traditional (Joja-Si):
  // Hour is Ja. Day is Next Day.

  // We use standard rounding for Branch.
  // 23:30 - 01:29 = Ja.
  // If hour >= 23 or hour < 1 (approx).
  // Minute logic: total minutes from 00:00.
  const totalMinutes = hour * 60 + minute;
  // Shift by 30 mins to align 23:30 to 00:00 boundary logic?
  // Let's simply implement:
  // Ja: 23:30 - 01:29
  // Chuk: 01:30 - 03:29
  // ...

  let hourBranchIndex: number;
  if (totalMinutes >= 23 * 60 + 30 || totalMinutes < 1 * 60 + 30) {
    hourBranchIndex = 0; // Ja
  } else {
    // (TotalMin - 90) / 120 approx
    hourBranchIndex = Math.floor((totalMinutes - 90) / 120) + 1;
  }

  const hourBranch = BRANCH_ORDER[hourBranchIndex % 12];

  // Hour Stem (Si-Dun-Beop)
  // Depends on Day Stem.
  const dayStemIndex = STEM_ORDER.indexOf(dayGanzhi.stem);
  const hourStemIndex = ((dayStemIndex % 5) * 2 + hourBranchIndex) % 10;
  const hourStem = STEM_ORDER[hourStemIndex];

  const yearPillar: SajuPillar = {
    earthlyBranch: yearGanzhi.branch as EarthlyBranch,
    heavenlyStem: yearGanzhi.stem as HeavenlyStem,
  };
  const monthPillar: SajuPillar = {
    earthlyBranch: monthBranch as EarthlyBranch,
    heavenlyStem: monthStem as HeavenlyStem,
  };
  const dayPillar: SajuPillar = {
    earthlyBranch: dayGanzhi.branch as EarthlyBranch,
    heavenlyStem: dayGanzhi.stem as HeavenlyStem,
  };
  const hourPillar: SajuPillar = {
    earthlyBranch: hourBranch as EarthlyBranch,
    heavenlyStem: hourStem as HeavenlyStem,
  };

  // Calculate Ten Gods relative to Day Master
  const dayMaster = dayGanzhi.stem;

  yearPillar.tenGod = calculateTenGod(dayMaster, yearPillar.heavenlyStem);
  monthPillar.tenGod = calculateTenGod(dayMaster, monthPillar.heavenlyStem);
  hourPillar.tenGod = calculateTenGod(dayMaster, hourPillar.heavenlyStem);

  return {
    birthDate,
    day: dayPillar,
    dayMaster,
    gender,
    hour: hourPillar,
    isLunar,
    month: monthPillar,
    year: yearPillar,
  };
}

export function calculateTenGod(
  dayMaster: HeavenlyStem,
  target: EarthlyBranch | HeavenlyStem,
): TenGod {
  if (!target || !dayMaster) return TenGod.BI_GYEON;

  const dmElement = heavenlyStems[dayMaster]?.element;
  const dmYinYang = heavenlyStems[dayMaster]?.yinYang;

  if (!dmElement || !dmYinYang) return TenGod.BI_GYEON;

  let targetElement: FiveElement;
  let targetYinYang: YinYang;

  if (target in earthlyBranches) {
    const branch = earthlyBranches[target as EarthlyBranch];
    if (!branch) return TenGod.BI_GYEON;
    // Use the main hidden stem (last one) for Ten God calculation
    // Use the main hidden stem (last one) for Ten God calculation
    if (!branch.hiddenStems || branch.hiddenStems.length === 0)
      return TenGod.BI_GYEON;

    const mainHiddenStem = branch.hiddenStems[branch.hiddenStems.length - 1];

    // Guard against invalid stem reference
    if (!heavenlyStems[mainHiddenStem]) return TenGod.BI_GYEON;

    targetElement = heavenlyStems[mainHiddenStem].element;
    targetYinYang = heavenlyStems[mainHiddenStem].yinYang;
  } else if (target in heavenlyStems) {
    // Guard against invalid stem reference
    if (!heavenlyStems[target as HeavenlyStem]) return TenGod.BI_GYEON;
    targetElement = heavenlyStems[target as HeavenlyStem].element;
    targetYinYang = heavenlyStems[target as HeavenlyStem].yinYang;
  } else {
    return TenGod.BI_GYEON;
  }

  const relation = getElementRelation(dmElement, targetElement);
  const isSameYinYang = dmYinYang === targetYinYang;

  if (relation === "same") {
    return isSameYinYang ? TenGod.BI_GYEON : TenGod.GEOP_JAE;
  } else if (relation === "generates") {
    return isSameYinYang ? TenGod.SIK_SIN : TenGod.SANG_GWAN;
  } else if (relation === "generated_by") {
    return isSameYinYang ? TenGod.PYEON_IN : TenGod.JEONG_IN;
  } else if (relation === "controls") {
    return isSameYinYang ? TenGod.PYEON_JAE : TenGod.JEONG_JAE;
  } else if (relation === "controlled_by") {
    return isSameYinYang ? TenGod.PYEON_GWAN : TenGod.JEONG_GWAN;
  }

  return TenGod.BI_GYEON; // Fallback
}

/**
 * Legacy support for compatibility engine
 */
export function getElementCompatibility(
  element1: string,
  element2: string,
): ElementCompatibilityResult {
  // Convert string to FiveElement (assuming lowercase string match)
  const e1 =
    Object.values(FiveElement).find((e) => e === element1) || FiveElement.WOOD;
  const e2 =
    Object.values(FiveElement).find((e) => e === element2) || FiveElement.WOOD;

  const relation = getElementRelation(e1, e2);

  if (relation === "same") {
    return { compatible: true, reasonKey: "same" };
  } else if (relation === "generates") {
    return { compatible: true, reasonKey: "generates" };
  } else if (relation === "generated_by") {
    return { compatible: true, reasonKey: "generated_by" };
  } else if (relation === "controls") {
    return { compatible: true, reasonKey: "controls" };
  } else if (relation === "controlled_by") {
    return { compatible: true, reasonKey: "controlled_by" };
  }

  return { compatible: true, reasonKey: "neutral" };
}

export function getElementRelation(
  source: FiveElement,
  target: FiveElement,
): "controlled_by" | "controls" | "generated_by" | "generates" | "same" {
  if (source === target) return "same";

  const generationMap: Record<FiveElement, FiveElement> = {
    [FiveElement.EARTH]: FiveElement.METAL,
    [FiveElement.FIRE]: FiveElement.EARTH,
    [FiveElement.METAL]: FiveElement.WATER,
    [FiveElement.WATER]: FiveElement.WOOD,
    [FiveElement.WOOD]: FiveElement.FIRE,
  };

  const controlMap: Record<FiveElement, FiveElement> = {
    [FiveElement.EARTH]: FiveElement.WATER,
    [FiveElement.FIRE]: FiveElement.METAL,
    [FiveElement.METAL]: FiveElement.WOOD,
    [FiveElement.WATER]: FiveElement.FIRE,
    [FiveElement.WOOD]: FiveElement.EARTH,
  };

  if (generationMap[source] === target) return "generates";
  if (generationMap[target] === source) return "generated_by";
  if (controlMap[source] === target) return "controls";
  if (controlMap[target] === source) return "controlled_by";

  return "same";
}

export function validateSajuInput(input: {
  birthDate: Date;
  birthTime: { hour: number; minute: number };
}): { errors: string[]; valid: boolean } {
  const errors: string[] = [];
  const { birthDate, birthTime } = input;

  if (isNaN(birthDate.getTime())) {
    errors.push("Invalid birth date");
  }

  if (birthTime.hour < 0 || birthTime.hour > 23) {
    errors.push("Invalid hour (0-23)");
  }

  if (birthTime.minute < 0 || birthTime.minute > 59) {
    errors.push("Invalid minute (0-59)");
  }

  return {
    errors,
    valid: errors.length === 0,
  };
}

const FATE_STARS_DATA: Record<string, { id: string; key: string }> = {
  cheonaek: { id: "cheonaek", key: "saju.fateStars.cheonaek" },
  cheonbok: { id: "cheonbok", key: "saju.fateStars.cheonbok" },
  cheongan: { id: "cheongan", key: "saju.fateStars.cheongan" },
  cheongo: { id: "cheongo", key: "saju.fateStars.cheongo" },
  cheongwi: { id: "cheongwi", key: "saju.fateStars.cheongwi" },
  cheongwon: { id: "cheongwon", key: "saju.fateStars.cheongwon" },
  cheonin: { id: "cheonin", key: "saju.fateStars.cheonin" },
  cheonmun: { id: "cheonmun", key: "saju.fateStars.cheonmun" },
  cheonpa: { id: "cheonpa", key: "saju.fateStars.cheonpa" },
  cheonsu: { id: "cheonsu", key: "saju.fateStars.cheonsu" },
  cheonye: { id: "cheonye", key: "saju.fateStars.cheonye" },
  cheonyeok: { id: "cheonyeok", key: "saju.fateStars.cheonyeok" },
};

function getStarByMonth(monthBranchIndex: number) {
  const starsByBranch = [
    "cheongwi",
    "cheonaek",
    "cheongwon",
    "cheonpa",
    "cheongan",
    "cheonmun",
    "cheonbok",
    "cheonyeok",
    "cheongo",
    "cheonin",
    "cheonye",
    "cheonsu",
  ];
  return FATE_STARS_DATA[starsByBranch[monthBranchIndex % 12]];
}
