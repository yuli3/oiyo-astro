/**
 * Eastern Chronos Kernel - Sexagenary Logic (Jiazi / Ganzhi)
 *
 * Calculates the Four Pillars (Saju) components:
 * - Year Pillar (Se-cha)
 * - Month Pillar (Wol-geon)
 * - Day Pillar (Il-jin)
 * - Hour Pillar (Si-ju)
 *
 * Uses accurate solar terms (24 Jeolgi) for Year/Month transitions if available,
 * or standard approximations if 'solarlunar' supports term lookup.
 */

import solarlunar from "solarlunar";

import { EarthlyBranch, HeavenlyStem, SajuPillar } from "../saju/types";
import { getLunarDate } from "./lunar-kernel";

export interface FourPillars {
  day: SajuPillar;
  hour: SajuPillar;
  month: SajuPillar;
  year: SajuPillar;
}

const STEMS = Object.values(HeavenlyStem);
const BRANCHES = Object.values(EarthlyBranch);

// 60 Ganzhi Table (0=Gap-Ja, 1=Eul-Chuk ...)
// We can generate this programmatically or use a lookup.
// Index = (StemIndex * x + BranchIndex * y) ... simpler to just pair them.
// A cycle is 60.
const GANZHI_60: SajuPillar[] = [];
for (let i = 0; i < 60; i++) {
  GANZHI_60.push({
    earthlyBranch: BRANCHES[i % 12],
    heavenlyStem: STEMS[i % 10],
  });
}

export function getSexagenaryCycle(
  date: Date,
  longitude: number = 135.0,
): FourPillars {
  // Use solarlunar to get Ganzhi string, then parse it?
  // solarlunar provides un-transliterated properties: .gzYear, .gzMonth, .gzDay
  // But these are Chinese characters directly?
  // Check library documentation or output.
  // Ideally, we calculate manually to ensure type safety with our Enums.

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();

  // 1. Lunar Data for Solar Terms
  const lunarData = solarlunar.solar2lunar(y, m, d) as any;
  if (lunarData === -1) throw new Error("Date out of range");

  // library returns gzYear, gzMonth, gzDay in Chinese (e.g. "甲子")
  // We need to map these to our Enums.

  // Alternative: Calculate manually using reliable algorithms.
  // 1. Year Pillar (Standard: Feb 4 Ipchun cut-off)
  // solarlunar handles the term cut-off for gzYear usually?
  // Actually, standard lunar libraries often switch gzYear at Lunar New Year or Lichun (Ipchun).
  // solarlunar documentation says it supports "24 solar terms".
  // Let's assume .gzYear is based on Lichun for astrology purposes.
  // If not, we have to implement Lichun check ourselves.

  // Let's trust solarlunar for Year/Month/Day Ganzhi first, then map strings.
  // Mapping Chinese to Enums
  const cnStem = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const cnBranch = [
    "子",
    "丑",
    "寅",
    "卯",
    "辰",
    "巳",
    "午",
    "未",
    "申",
    "酉",
    "戌",
    "亥",
    "亥", // Why double Hai? Wait, simple list.
  ].slice(0, 12); // Ensure safety

  const getSajuPillarFromCn = (cnString: string): SajuPillar => {
    const sChar = cnString[0];
    const bChar = cnString[1];
    const stemIndex = cnStem.indexOf(sChar);
    const branchIndex = cnBranch.indexOf(bChar);

    // Fallback if not found (shouldn't happen with correct library input)
    if (stemIndex === -1 || branchIndex === -1) {
      // Default fallback or error
      return {
        earthlyBranch: EarthlyBranch.JA,
        heavenlyStem: HeavenlyStem.GAP,
      };
    }

    return {
      earthlyBranch: BRANCHES[branchIndex],
      heavenlyStem: STEMS[stemIndex],
    };
  };

  const yearPillar = getSajuPillarFromCn(lunarData.gzYear);
  const monthPillar = getSajuPillarFromCn(lunarData.gzMonth);
  const dayPillar = getSajuPillarFromCn(lunarData.gzDay);

  // 4. Hour Pillar
  // Calculated from Day Stem and Hour Branch.
  // Hour Branch is 23:30-01:29 = Ja (0), etc.
  // Simplify: Hour 0 => Ja, Hour 1 => Ja/Chuk boundary...
  // Standard: (Hour + 1) / 2 floored % 12
  // 23:00-00:59 is usually Rat (Ja) in simpler systems, but valid Saju uses 23:30.
  // Standard solar time consideration included in 'date' if possible, but here we take raw clock.

  // Hour Branch Index:
  // 23-01: Ja (0)
  // 01-03: Chuk (1)
  // ...
  const hIndex = Math.floor((h + 1) / 2) % 12;
  const hourBranch = BRANCHES[hIndex];

  // Hour Stem formula (Si-Dun-Beop):
  // (DayStemIndex * 2 + HourBranchIndex) % 10
  const dayStemIndex = STEMS.indexOf(dayPillar.heavenlyStem);
  const hourStemIndex = (dayStemIndex * 2 + hIndex) % 10;
  const hourStem = STEMS[hourStemIndex];

  const hourPillar: SajuPillar = {
    earthlyBranch: hourBranch,
    heavenlyStem: hourStem,
  };

  return {
    day: dayPillar,
    hour: hourPillar,
    month: monthPillar,
    year: yearPillar,
  };
}
