import { CITIES } from "@/lib/ontology/natal/signs";
import { resolveZonedCivilTime } from "@/lib/user/birth-record";
import { deriveSymbolicProfile, type SymbolicComparisonProfile } from "@/lib/symbolic-tradition";

export function comparisonFromCivil(input: {
  cityId?: string;
  date: string;
  time?: string;
}): SymbolicComparisonProfile {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new RangeError("Need a civil date");
  const city = CITIES.find((item) => item.id === input.cityId);
  const civilTime = input.time || null;
  const resolution = city
    ? resolveZonedCivilTime({ civilDate: input.date, civilTime: civilTime ?? "12:00", zoneId: city.zoneId })
    : { status: "resolved" as const, offsetMinutes: 540 };
  if (resolution.status !== "resolved") throw new RangeError("Ambiguous birth moment");
  const profile = deriveSymbolicProfile({
    civilDate: input.date,
    civilTime,
    longitude: city?.lon ?? null,
    utcOffsetMinutes: city ? resolution.offsetMinutes : null,
  });
  return {
    chineseZodiac: profile.chineseZodiac,
    fiveElements: {
      dominant: profile.fiveElements.dominant,
      observedCoordinates: profile.fiveElements.observedCoordinates,
    },
    sunSign: profile.sunSign,
    yinYang: profile.yinYang,
  };
}
