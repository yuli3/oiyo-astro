import type { City, NatalLocale } from "@/lib/ontology/natal/signs";

export const FRIEND_BIRTH_SHARE_TOOL_ID = "circle-friend-birth-v1";

export interface FriendBirthShare {
  alias: string;
  city: City;
  date: string;
  schemaVersion: 1;
  time: string | null;
}

const LOCALES: NatalLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day));
  return instant.getUTCFullYear() === year && instant.getUTCMonth() === month - 1 && instant.getUTCDate() === day;
}

function validCity(value: unknown): value is City {
  if (!value || typeof value !== "object") return false;
  const city = value as Partial<City>;
  return typeof city.id === "string" && city.id.length > 0 && city.id.length <= 100
    && typeof city.zoneId === "string" && city.zoneId.length > 0 && city.zoneId.length <= 100
    && typeof city.lat === "number" && Number.isFinite(city.lat) && city.lat >= -90 && city.lat <= 90
    && typeof city.lon === "number" && Number.isFinite(city.lon) && city.lon >= -180 && city.lon <= 180
    && typeof city.tz === "number" && Number.isFinite(city.tz) && city.tz >= -14 && city.tz <= 14
    && !!city.label && LOCALES.every((locale) => typeof city.label?.[locale] === "string" && city.label[locale].length <= 100);
}

export function parseFriendBirthShare(value: unknown): FriendBirthShare | null {
  if (!value || typeof value !== "object") return null;
  const share = value as Partial<FriendBirthShare>;
  if (
    share.schemaVersion !== 1
    || typeof share.alias !== "string"
    || share.alias.trim().length < 1
    || share.alias.trim().length > 24
    || typeof share.date !== "string"
    || !validDate(share.date)
    || !(share.time === null || (typeof share.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(share.time)))
    || !validCity(share.city)
  ) return null;
  return {
    alias: share.alias.trim(),
    city: share.city,
    date: share.date,
    schemaVersion: 1,
    time: share.time,
  };
}
