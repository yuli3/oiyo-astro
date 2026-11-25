// 태어난 순간의 해·달 출생지 목록: 공용 출생 도시(CITIES) + 한국 주요 도시.
// 사주 계산기가 ?p= 링크로 같은 도시를 받으므로 lib에 둔다(2026-11-25).
import { CITIES, type City } from "./ontology/natal/signs";

// Korean cities beyond the shared natal list (most visitors are Korean).
const KR_EXTRA: City[] = [
  { id: "incheon", label: { ko: "인천", en: "Incheon", ja: "仁川", zh: "仁川", fr: "Incheon", es: "Incheon" }, lat: 37.4563, lon: 126.7052, tz: 9, zoneId: "Asia/Seoul" },
  { id: "suwon", label: { ko: "수원", en: "Suwon", ja: "水原", zh: "水原", fr: "Suwon", es: "Suwon" }, lat: 37.2636, lon: 127.0286, tz: 9, zoneId: "Asia/Seoul" },
  { id: "daegu", label: { ko: "대구", en: "Daegu", ja: "大邱", zh: "大邱", fr: "Daegu", es: "Daegu" }, lat: 35.8714, lon: 128.6014, tz: 9, zoneId: "Asia/Seoul" },
  { id: "daejeon", label: { ko: "대전", en: "Daejeon", ja: "大田", zh: "大田", fr: "Daejeon", es: "Daejeon" }, lat: 36.3504, lon: 127.3845, tz: 9, zoneId: "Asia/Seoul" },
  { id: "gwangju", label: { ko: "광주", en: "Gwangju", ja: "光州", zh: "光州", fr: "Gwangju", es: "Gwangju" }, lat: 35.1595, lon: 126.8526, tz: 9, zoneId: "Asia/Seoul" },
  { id: "ulsan", label: { ko: "울산", en: "Ulsan", ja: "蔚山", zh: "蔚山", fr: "Ulsan", es: "Ulsan" }, lat: 35.5384, lon: 129.3114, tz: 9, zoneId: "Asia/Seoul" },
  { id: "cheongju", label: { ko: "청주", en: "Cheongju", ja: "清州", zh: "清州", fr: "Cheongju", es: "Cheongju" }, lat: 36.6424, lon: 127.489, tz: 9, zoneId: "Asia/Seoul" },
  { id: "jeonju", label: { ko: "전주", en: "Jeonju", ja: "全州", zh: "全州", fr: "Jeonju", es: "Jeonju" }, lat: 35.8242, lon: 127.148, tz: 9, zoneId: "Asia/Seoul" },
  { id: "chuncheon", label: { ko: "춘천", en: "Chuncheon", ja: "春川", zh: "春川", fr: "Chuncheon", es: "Chuncheon" }, lat: 37.8813, lon: 127.7298, tz: 9, zoneId: "Asia/Seoul" },
  { id: "gangneung", label: { ko: "강릉", en: "Gangneung", ja: "江陵", zh: "江陵", fr: "Gangneung", es: "Gangneung" }, lat: 37.7519, lon: 128.8761, tz: 9, zoneId: "Asia/Seoul" },
  { id: "changwon", label: { ko: "창원", en: "Changwon", ja: "昌原", zh: "昌原", fr: "Changwon", es: "Changwon" }, lat: 35.2281, lon: 128.6811, tz: 9, zoneId: "Asia/Seoul" },
  { id: "pohang", label: { ko: "포항", en: "Pohang", ja: "浦項", zh: "浦项", fr: "Pohang", es: "Pohang" }, lat: 36.019, lon: 129.3435, tz: 9, zoneId: "Asia/Seoul" },
  { id: "jeju", label: { ko: "제주", en: "Jeju", ja: "済州", zh: "济州", fr: "Jeju", es: "Jeju" }, lat: 33.4996, lon: 126.5312, tz: 9, zoneId: "Asia/Seoul" },
];

const byId = new Map<string, City>();
for (const c of [...CITIES.slice(0, 2), ...KR_EXTRA, ...CITIES.slice(2)]) if (!byId.has(c.id)) byId.set(c.id, c);
export const PLACES: City[] = [...byId.values()];
export const placeById = (id: string) => byId.get(id);

// ---- share query ----

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface BirthSkyQuery {
  date: string;
  time: string | null;
  place: string;
}

export function parseBirthSkyQuery(search: string): BirthSkyQuery | null {
  const p = new URLSearchParams(search);
  const date = p.get("d");
  const time = p.get("t");
  const place = p.get("p");
  if (!date || !DATE_RE.test(date) || !place || !/^[a-z]{2,20}$/.test(place)) return null;
  return { date, time: time && TIME_RE.test(time) ? time : null, place };
}

export function formatBirthSkyQuery(q: BirthSkyQuery): string {
  const p = new URLSearchParams({ d: q.date, p: q.place });
  if (q.time) p.set("t", q.time);
  return `?${p.toString()}`;
}
