// 출생지 검색 — GeoNames 오프라인 번들.
//
// 왜 필요한가: 큐레이션된 CITIES 는 23개뿐이다. 출생지가 목록에 없으면 방문자는
// 가까운 도시를 고르고, 그 경도 오차가 그대로 **진태양시 오차**가 된다. 경도 1도는
// 시간으로 4분이므로, 두 시간 경계 근처에 태어난 사람은 시주(時柱)가 바뀐다.
// 이 경로는 실제로 계산까지 이어진다:
//   출생지 → city.lon → BirthRecord.longitude → resolveBirthInstant
//   → calculateSaju(..., longitude) / computeNatalChart({ longitude })
//
// 왜 오프라인 번들인가: Nominatim 같은 지오코딩 API 는 **출생지를 제3자에 보낸다**.
// 출생일시와 출생지는 결합하면 식별 가능하고, 이 사이트는 "결과를 서버에 보내지
// 않는다"를 신뢰의 근거로 삼아 왔다. 정확도 이득이 그 성질을 바꿀 만큼 크지 않다.
//
// 데이터: GeoNames cities15000 (인구 1.5만 이상), CC BY 4.0. 34,128개 도시 · 244개국.
// 번들은 **지연 로드**한다 — 검색을 열기 전에는 한 바이트도 받지 않는다.
// 크기: raw 2.4MB · gzip 964KB · **brotli 660KB**(Cloudflare 가 실제로 보내는 값).
// 1회 요청이고 캐시된다. 임계를 인구 5만으로 올리면 3분의 1로 줄지만 국가
// 커버리지가 244 → 188 로 떨어진다. 출생지가 아예 없는 실패가 좌표 정밀도보다
// 치명적이라 전량을 싣는다. 한국 기준으로는 1.5만/5만 임계의 경도 범위가 같다.
//
// 별칭을 함께 싣는 이유: GeoNames 의 primary name 은 로마자이고 한국 도시는 옛
// 표기를 쓴다(김해 = "Kimhae", 원주 = "Wŏnju"). 한글 없이는 주 사용자층이 자기
// 출생지를 찾지 못한다. 실측으로 확인하고 v2 에서 추가했다.
//
// 남은 한계: 한국 도시 147개 중 **122개(82%)만** GeoNames 에 한글 별칭이 있다.
// 빠진 25개(서귀포·동해시·김제 등)는 한글로 검색되지 않는다. 손으로 채우지
// 않았다 — 목록에 Kyosai·Eisen·Nangen 처럼 일제강점기 로마자와 동 단위가 섞여
// 있어 한글을 지어 넣으면 그것이 정본처럼 보인다. 좌표 영향은 미미하다(서귀포
// 126.56 vs 제주 126.53 = 0.03도 = 7초). 라틴 표기로는 찾히므로, 결과가 0건일
// 때 라틴 표기를 권하는 안내를 UI 에서 보여 준다.
import type { City, NatalLocale } from './signs';

const BUNDLE_URL = '/data/geonames-cities.json';
const LOCALES: NatalLocale[] = ['ko', 'en', 'ja', 'zh', 'fr', 'es'];

/** [name, asciiName(빈 문자열이면 name 과 동일), countryCode, lat, lon, ianaTimeZone, nativeNames] */
type Row = [string, string, string, number, number, string, string];

export interface CitySearchHit {
  city: City;
  countryCode: string;
  /** 이 이름은 번역본이 아니다. GeoNames 의 단일 표기다. */
  untranslated: true;
}

let cache: null | Row[] = null;
let inflight: null | Promise<Row[]> = null;

/** 번들을 한 번만 받는다. 동시에 여러 번 불러도 요청은 하나다. */
export async function loadCityBundle(fetcher: typeof fetch = fetch): Promise<Row[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await fetcher(BUNDLE_URL);
    if (!res.ok) throw new Error(`city bundle ${res.status}`);
    const json = await res.json() as { schema?: string; schemaVersion?: number; cities?: Row[] };
    if (json.schema !== 'oiyo.geonames-cities' || json.schemaVersion !== 2 || !Array.isArray(json.cities)) {
      throw new TypeError('city bundle schema mismatch');
    }
    cache = json.cities;
    return cache;
  })();
  try { return await inflight; } finally { inflight = null; }
}

/**
 * 검색 정규화 — 대소문자와 라틴 발음 구별 부호를 지운다. Bogotá 를 bogota 로 찾게.
 *
 * NFD 로 분해해 결합 문자를 지운 뒤 **NFC 로 다시 합친다.** 재조합이 없으면
 * 한글이 자모로 분해된 채 남아(김 → ㄱㅣㅁ) 조합형으로 저장된 별칭과 영원히
 * 어긋난다. 실제로 그 상태로 한글 검색이 0건이었다.
 */
export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').toLowerCase().trim();
}

/**
 * 합성 id. 좌표를 담아 두면 기존 CITIES id 와 충돌하지 않고, 저장된 프로필을
 * 다시 열 때 번들 없이도 좌표를 되살릴 수 있다.
 */
export function synthesizeId(row: Row): string {
  return `gn:${row[3]},${row[4]}`;
}

export function parseSynthesizedId(id: string): null | { lat: number; lon: number } {
  const m = /^gn:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(id);
  if (!m) return null;
  const lat = Number(m[1]);
  const lon = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function toCity(row: Row): City {
  const [name, ascii, , lat, lon, zoneId] = row;
  // 6 로케일 라벨을 같은 값으로 채운다. **번역을 지어내지 않는다** — GeoNames 는
  // 표기 하나만 주고, 없는 번역을 만들어 넣으면 그것이 정본처럼 보인다.
  const label = Object.fromEntries(LOCALES.map((l) => [l, name || ascii])) as Record<NatalLocale, string>;
  return {
    id: synthesizeId(row),
    label,
    lat,
    lon,
    // tz(숫자 오프셋)는 현재 어떤 소비처도 읽지 않는다. DST 때문에 고정값이
    // 틀리므로 0 으로 두고, 시간대 계산은 zoneId 로만 한다(resolveZonedCivilTime).
    tz: 0,
    zoneId,
  };
}

/** 이름·라틴 표기 앞부분 일치를 우선하고, 그다음 포함 일치. 번들은 인구 내림차순이다. */
export function searchRows(rows: Row[], query: string, limit = 20): Row[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const starts: Row[] = [];
  const contains: Row[] = [];
  for (const row of rows) {
    const name = normalize(row[0]);
    const ascii = row[1] ? normalize(row[1]) : name;
    // 한글·가나·한자 별칭. 정규화는 대소문자·발음부호만 건드리므로 그대로 쓴다.
    const native = row[6] ? normalize(row[6]) : '';
    if (name.startsWith(q) || ascii.startsWith(q) || (native && native.split('|').some((n) => n.startsWith(q)))) starts.push(row);
    else if (name.includes(q) || ascii.includes(q) || native.includes(q)) contains.push(row);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

export async function searchCities(query: string, limit = 20, fetcher?: typeof fetch): Promise<CitySearchHit[]> {
  const rows = await loadCityBundle(fetcher);
  return searchRows(rows, query, limit).map((row) => ({
    city: toCity(row),
    countryCode: row[2],
    untranslated: true as const,
  }));
}

/** 테스트 격리용. 프로덕션 경로에서는 부르지 않는다. */
export function __resetCityBundleCache(): void {
  cache = null;
  inflight = null;
}
