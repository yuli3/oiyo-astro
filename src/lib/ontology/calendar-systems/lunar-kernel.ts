/**
 * Eastern Chronos Kernel - Lunar Logic
 *
 * Provides robust conversion between Gregorian and Lunar dates,
 * including handling of Leap Months (Yoon-dal).
 *
 * Wraps 'solarlunar' library for the heavy lifting of astronomical data.
 */

import solarlunar from "solarlunar";

export interface LunarDate {
  isLeap: boolean;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  solarDate: Date;
}

/**
 * Converts a Gregorian Date to a Lunar Date.
 * `date` must carry its civil fields in UTC — the True Solar Time frame produced
 * by getTrueSolarTime. Reading local fields would make the result depend on the
 * timezone of the machine running this code.
 */
export function getLunarDate(date: Date): LunarDate {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // solarlunar inputs: year, month, day
  // returns: { lYear, lMonth, lDay, isLeap, ... }
  const lunarData = solarlunar.solar2lunar(year, month, day) as any;

  // Check if conversion failed (returns -1 if out of range 1900-2100)
  if (lunarData === -1) {
    // Fallback or Error?
    // Ideally we should support wider range, but for MVP 1900-2100 is acceptable.
    // If out of range, throw specific error.
    throw new Error(
      `Date out of supported range (1900-2100) for Lunar Conversion: ${date.toISOString()}`,
    );
  }

  return {
    isLeap: lunarData.isLeap,
    lunarDay: lunarData.lDay,
    lunarMonth: lunarData.lMonth,
    lunarYear: lunarData.lYear,
    solarDate: date,
  };
}

/**
 * Converts a Lunar Date back to Gregorian.
 * specificLeapMonth: boolean - if true, strictly treats input month as leap month if valid.
 */
export function getSolarDateFromLunar(
  year: number,
  month: number,
  day: number,
  isLeap: boolean,
): Date {
  const solarData = solarlunar.lunar2solar(year, month, day, isLeap) as any;

  if (solarData === -1) {
    throw new Error(
      `Invalid Lunar Date: ${year}-${month}-${day} (Leap: ${isLeap})`,
    );
  }

  return new Date(solarData.cYear, solarData.cMonth - 1, solarData.cDay);
}
