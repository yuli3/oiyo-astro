const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Materializes a calendar date for legacy date-only calculators that read
 * local getters. This value is deliberately not an absolute birth instant.
 */
export function civilDateToLocalNoon(civilDate: string): Date {
  const match = CIVIL_DATE_PATTERN.exec(civilDate);
  if (!match) throw new RangeError("Civil date must use YYYY-MM-DD");

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (year < 100) date.setFullYear(year);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    throw new RangeError("Civil date is not a valid calendar date");
  }
  return date;
}

/** Calendar-day distance using only local Y/M/D fields, immune to DST length. */
export function differenceInCivilDays(later: Date, earlier: Date): number {
  const ordinal = (date: Date) => Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return Math.round((ordinal(later) - ordinal(earlier)) / 86_400_000);
}
