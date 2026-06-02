import { CELTIC_TREES, CelticTreeSign } from "./types";

// Helper to check if date is within range
// Ranges are Month/Day. 0-indexed Month.
const RANGES = [
  { end: { d: 20, m: 0 }, id: "birch", start: { d: 24, m: 11 } }, // Dec 24 - Jan 20
  { end: { d: 17, m: 1 }, id: "rowan", start: { d: 21, m: 0 } }, // Jan 21 - Feb 17
  { end: { d: 17, m: 2 }, id: "ash", start: { d: 18, m: 1 } }, // Feb 18 - Mar 17
  { end: { d: 14, m: 3 }, id: "alder", start: { d: 18, m: 2 } }, // Mar 18 - Apr 14
  { end: { d: 12, m: 4 }, id: "willow", start: { d: 15, m: 3 } }, // Apr 15 - May 12
  { end: { d: 9, m: 5 }, id: "hawthorn", start: { d: 13, m: 4 } }, // May 13 - Jun 9
  { end: { d: 7, m: 6 }, id: "oak", start: { d: 10, m: 5 } }, // Jun 10 - Jul 7
  { end: { d: 4, m: 7 }, id: "holly", start: { d: 8, m: 6 } }, // Jul 8 - Aug 4
  { end: { d: 1, m: 8 }, id: "hazel", start: { d: 5, m: 7 } }, // Aug 5 - Sep 1
  { end: { d: 29, m: 8 }, id: "vine", start: { d: 2, m: 8 } }, // Sep 2 - Sep 29
  { end: { d: 27, m: 9 }, id: "ivy", start: { d: 30, m: 8 } }, // Sep 30 - Oct 27
  { end: { d: 24, m: 10 }, id: "reed", start: { d: 28, m: 9 } }, // Oct 28 - Nov 24
  { end: { d: 22, m: 11 }, id: "elder", start: { d: 25, m: 10 } }, // Nov 25 - Dec 22
  { end: { d: 23, m: 11 }, id: "nameless", start: { d: 23, m: 11 } }, // Dec 23
];

export function calculateCelticTree(date: Date): CelticTreeSign {
  // Check special Nameless Day first (Dec 23) just in case
  if (date.getMonth() === 11 && date.getDate() === 23) {
    return CELTIC_TREES.find((t) => t.id === "nameless")!;
  }

  for (const range of RANGES) {
    if (isDateInRange(date, range.start, range.end)) {
      return CELTIC_TREES.find((t) => t.id === range.id)!;
    }
  }

  // Fallback (Should technically cover all dates, but leap year Feb 29 might fall in Ash)
  // Feb 29 is in Ash (Feb 18 - Mar 17). The logic handles it fine.
  // Default to Birch if something fails
  return CELTIC_TREES.find((t) => t.id === "birch")!;
}

function isDateInRange(
  date: Date,
  start: { d: number; m: number },
  end: { d: number; m: number },
): boolean {
  const m = date.getMonth();
  const d = date.getDate();

  // Handle year wrap (e.g. Dec to Jan)
  if (start.m > end.m) {
    // Either (Month > StartMonth) or (Month == StartMonth and Day >= StartDay)
    // OR (Month < EndMonth) or (Month == EndMonth and Day <= EndDay)
    const afterStart = m > start.m || (m === start.m && d >= start.d);
    const beforeEnd = m < end.m || (m === end.m && d <= end.d);
    return afterStart || beforeEnd;
  } else {
    // Standard range within year
    const afterStart = m > start.m || (m === start.m && d >= start.d);
    const beforeEnd = m < end.m || (m === end.m && d <= end.d);
    return afterStart && beforeEnd;
  }
}
