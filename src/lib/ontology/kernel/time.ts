/**
 * Ontology Kernel - Time & Epochs
 * High-precision Julian Day and Calendar utility functions.
 */

export const MS_PER_DAY = 86400000;
export const J2000_EPOCH = 2451545.0;

/**
 * Standard-time offset of the birthplace, in minutes east of UTC.
 *
 * Birth input is a wall clock reading at the birthplace ("I was born at 14:30"),
 * so it can only be turned into an instant against the birthplace's standard
 * time — never against the visitor's browser timezone. Default is KST (+9h),
 * which pairs with the default birth longitude of 135E used across the engines.
 */
export const DEFAULT_BIRTH_UTC_OFFSET_MINUTES = 540;

export interface CivilDateTime {
  day: number;
  hour: number;
  minute: number;
  month: number; // 1-12
  year: number;
}

/**
 * Birthplace wall clock -> absolute instant.
 */
export function birthCivilToInstant(
  civil: CivilDateTime,
  utcOffsetMinutes: number = DEFAULT_BIRTH_UTC_OFFSET_MINUTES,
): Date {
  const utcMs = Date.UTC(
    civil.year,
    civil.month - 1,
    civil.day,
    civil.hour,
    civil.minute,
  );
  return new Date(utcMs - utcOffsetMinutes * 60 * 1000);
}

/**
 * Absolute instant -> birthplace wall clock. Inverse of birthCivilToInstant.
 */
export function instantToBirthCivil(
  date: Date,
  utcOffsetMinutes: number = DEFAULT_BIRTH_UTC_OFFSET_MINUTES,
): CivilDateTime {
  const shifted = new Date(date.getTime() + utcOffsetMinutes * 60 * 1000);
  return {
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear(),
  };
}

/**
 * Calculates the day of the year (1-366).
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / MS_PER_DAY);
}

/**
 * Calculates Julian Centuries since J2000.0.
 * Standard time scale for astronomical calculations.
 */
export function getJulianCenturies(date: Date): number {
  const jd = getJulianDay(date);
  return (jd - J2000_EPOCH) / 36525.0;
}

/**
 * Calculates Julian Day from a Date object.
 * Based on the authoritative algorithm in "Astronomical Algorithms" by Jean Meeus.
 */
export function getJulianDay(date: Date): number {
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  const day =
    date.getUTCDate() +
    (date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600) /
      24;

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

/**
 * Returns whether a year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
