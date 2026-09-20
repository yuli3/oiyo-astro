import { BRANCH_ORDER } from "@/manifest/data/saju/branches";
import { STEM_ORDER } from "@/manifest/data/saju/stems";
import type { BirthRecordV2 } from "@/lib/user/birth-record";

import { birthCivilToInstant } from "../kernel/time";
import { getSolarLongitude, getSolarTermDate } from "../kernel/astronomy";
import { getDayBranch, getDayStem, getHourBranch, getHourStem } from "./calculator-civil";
import { calculateTenGod } from "./logic";
import type { SajuPillar } from "./types";
import { EarthlyBranch, HeavenlyStem } from "./types";

export interface CanonicalSajuPillars {
  day: SajuPillar;
  hour: SajuPillar | null;
  month: SajuPillar;
  year: SajuPillar;
}

export type BirthSajuResolution =
  | { status: "needs-offset"; reason: "time-known-offset-missing" }
  | {
      status: "resolved";
      instant: Date;
      standard: CanonicalSajuPillars;
      trueSolar: CanonicalSajuPillars | null;
      basis: {
        longitude: number | null;
        solarTermClock: "absolute-instant";
        standardClock: "birthplace-wall-clock";
        trueSolar: "not-requested";
        utcOffsetMinutesAtBirth: number | null;
        zoneId: string | null;
      };
    };

function pillar(stemIndex: number, branchIndex: number): SajuPillar {
  return {
    heavenlyStem: STEM_ORDER[stemIndex] as HeavenlyStem,
    earthlyBranch: BRANCH_ORDER[branchIndex] as EarthlyBranch,
  };
}

/**
 * Canonical default Saju calculation.
 *
 * Civil day/hour stay on the birthplace wall clock. The absolute instant is
 * used only for solar-term boundaries; longitude/EoT belong to an optional
 * true-solar comparison and never replace the default pillars.
 */
export function calculateBirthSaju(record: BirthRecordV2): BirthSajuResolution {
  if (record.timeKnown && record.utcOffsetMinutesAtBirth === null) {
    return { status: "needs-offset", reason: "time-known-offset-missing" };
  }

  const [year, month, day] = record.civilDate.split("-").map(Number);
  const [hour, minute] = record.civilTime
    ? record.civilTime.split(":").map(Number)
    : [12, 0];
  const instant = birthCivilToInstant(
    { day, hour, minute, month, year },
    record.utcOffsetMinutesAtBirth ?? 0,
  );

  const ipchun = getSolarTermDate(year, 0);
  const pillarYear = instant < ipchun ? year - 1 : year;
  const yearIndex = ((pillarYear - 4) % 60 + 60) % 60;
  const yearPillar = pillar(yearIndex % 10, yearIndex % 12);

  const solarLongitude = getSolarLongitude(instant);
  const monthBranchIndex =
    (Math.floor(((((solarLongitude - 315) % 360) + 360) % 360) / 30) + 2) % 12;
  const monthOffset = (monthBranchIndex - 2 + 12) % 12;
  const monthStemIndex = ((yearIndex % 10) % 5 * 2 + 2 + monthOffset) % 10;
  const monthPillar = pillar(monthStemIndex, monthBranchIndex);

  const dayStemIndex = getDayStem(year, month, day);
  const dayPillar = pillar(dayStemIndex, getDayBranch(year, month, day));
  const hourPillar = record.civilTime === null
    ? null
    : (() => {
        const branchIndex = getHourBranch(hour);
        return pillar(getHourStem(dayStemIndex, branchIndex), branchIndex);
      })();

  const dayMaster = dayPillar.heavenlyStem;
  yearPillar.tenGod = calculateTenGod(dayMaster, yearPillar.heavenlyStem);
  monthPillar.tenGod = calculateTenGod(dayMaster, monthPillar.heavenlyStem);
  if (hourPillar) hourPillar.tenGod = calculateTenGod(dayMaster, hourPillar.heavenlyStem);

  return {
    status: "resolved",
    instant,
    standard: { day: dayPillar, hour: hourPillar, month: monthPillar, year: yearPillar },
    trueSolar: null,
    basis: {
      longitude: record.longitude,
      solarTermClock: "absolute-instant",
      standardClock: "birthplace-wall-clock",
      trueSolar: "not-requested",
      utcOffsetMinutesAtBirth: record.utcOffsetMinutesAtBirth,
      zoneId: record.zoneId,
    },
  };
}
