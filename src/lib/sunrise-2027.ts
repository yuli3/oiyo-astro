/**
 * 2027년 1월 1일 첫 일출 시각 (한국·일본).
 *
 * - 표는 빌드 때 astronomy-engine으로 계산한다(클라이언트 번들에 들어가지 않음).
 *   해발 0m, 해 윗가장자리 + 대기굴절 기준이라 한국천문연구원·国立天文台 발표 방식과 같다.
 *   2026년 값으로 대조: 서울 07:47, 독도 07:26, 간절곶 07:31(천문연), 東京 06:51, 犬吠埼 06:46(国立天文台).
 * - "내 위치" 계산은 브라우저에서 돌아야 해서 NOAA 근사식(sunriseNoaa)을 따로 둔다. 테스트로
 *   astronomy-engine 값과 1분 안에서 맞는지 확인한다.
 * 2026-11-22.
 */
import * as Astronomy from 'astronomy-engine';

export type SunriseSpot = { id: string; name: string; region: string; lat: number; lon: number; note?: string };

/** 한국 해맞이 명소 + 시·도청 소재지. 좌표는 일출을 보는 해안·전망 지점 기준. */
export const KR_SPOTS: SunriseSpot[] = [
  { id: 'dokdo', name: '독도', region: '경북 울릉군', lat: 37.2426, lon: 131.8597, note: '우리나라에서 해가 가장 먼저 떠요' },
  { id: 'ulleungdo', name: '울릉도 (도동)', region: '경북 울릉군', lat: 37.4844, lon: 130.9058 },
  { id: 'ganjeolgot', name: '간절곶', region: '울산 울주군', lat: 35.3591, lon: 129.3606, note: '육지에서 가장 이른 곳' },
  { id: 'homigot', name: '호미곶', region: '경북 포항시', lat: 36.0766, lon: 129.5683 },
  { id: 'haeundae', name: '해운대', region: '부산 해운대구', lat: 35.1587, lon: 129.1604 },
  { id: 'jeongdongjin', name: '정동진', region: '강원 강릉시', lat: 37.6907, lon: 129.0342 },
  { id: 'gyeongpo', name: '경포대', region: '강원 강릉시', lat: 37.7956, lon: 128.9089 },
  { id: 'naksansa', name: '낙산사 의상대', region: '강원 양양군', lat: 38.1245, lon: 128.6338 },
  { id: 'chuam', name: '추암 촛대바위', region: '강원 동해시', lat: 37.4766, lon: 129.1626 },
  { id: 'seongsan', name: '성산일출봉', region: '제주 서귀포시', lat: 33.4581, lon: 126.9425 },
  { id: 'hyangiram', name: '향일암', region: '전남 여수시', lat: 34.5910, lon: 127.8034 },
  { id: 'ttangkkeut', name: '땅끝마을', region: '전남 해남군', lat: 34.2982, lon: 126.5276 },
  { id: 'seoul', name: '서울', region: '서울특별시청', lat: 37.5665, lon: 126.978 },
  { id: 'incheon', name: '인천', region: '인천광역시청', lat: 37.4563, lon: 126.7052 },
  { id: 'suwon', name: '수원', region: '경기도청', lat: 37.2893, lon: 127.0535 },
  { id: 'chuncheon', name: '춘천', region: '강원특별자치도청', lat: 37.8813, lon: 127.7298 },
  { id: 'cheongju', name: '청주', region: '충북도청', lat: 36.6358, lon: 127.4914 },
  { id: 'sejong', name: '세종', region: '세종특별자치시청', lat: 36.48, lon: 127.289 },
  { id: 'daejeon', name: '대전', region: '대전광역시청', lat: 36.3504, lon: 127.3845 },
  { id: 'hongseong', name: '홍성 (내포)', region: '충남도청', lat: 36.6588, lon: 126.6728 },
  { id: 'jeonju', name: '전주', region: '전북특별자치도청', lat: 35.8202, lon: 127.1089 },
  { id: 'gwangju', name: '광주', region: '광주광역시청', lat: 35.1595, lon: 126.8526 },
  { id: 'muan', name: '무안 (남악)', region: '전남도청', lat: 34.8161, lon: 126.4629 },
  { id: 'daegu', name: '대구', region: '대구광역시청', lat: 35.8714, lon: 128.6014 },
  { id: 'andong', name: '안동 (도청신도시)', region: '경북도청', lat: 36.5759, lon: 128.5056 },
  { id: 'ulsan', name: '울산', region: '울산광역시청', lat: 35.5384, lon: 129.3114 },
  { id: 'busan', name: '부산', region: '부산광역시청', lat: 35.1796, lon: 129.0756 },
  { id: 'changwon', name: '창원', region: '경남도청', lat: 35.2383, lon: 128.6924 },
  { id: 'jeju', name: '제주', region: '제주특별자치도청', lat: 33.4996, lon: 126.5312 },
];

/** 日本の初日の出スポット + 主要都市。山頂・離島は標高・地形で前後するので海抜0mの値。 */
export const JP_SPOTS: SunriseSpot[] = [
  { id: 'minamitorishima', name: '南鳥島', region: '東京都小笠原村', lat: 24.2867, lon: 153.9807, note: '日本でいちばん早い（一般の人は上陸不可）' },
  { id: 'nosappu', name: '納沙布岬', region: '北海道根室市', lat: 43.3853, lon: 145.8167, note: '本土の平地で最も早い候補のひとつ' },
  { id: 'inubozaki', name: '犬吠埼', region: '千葉県銚子市', lat: 35.7075, lon: 140.8686, note: '離島・山頂を除く平地で最も早い' },
  { id: 'chichijima', name: '父島', region: '東京都小笠原村', lat: 27.0942, lon: 142.1917 },
  { id: 'sapporo', name: '札幌', region: '北海道', lat: 43.0618, lon: 141.3545 },
  { id: 'sendai', name: '仙台', region: '宮城県', lat: 38.2682, lon: 140.8694 },
  { id: 'tokyo', name: '東京', region: '東京都庁', lat: 35.6895, lon: 139.6917 },
  { id: 'yokohama', name: '横浜', region: '神奈川県', lat: 35.4437, lon: 139.638 },
  { id: 'enoshima', name: '江の島', region: '神奈川県藤沢市', lat: 35.2994, lon: 139.4803 },
  { id: 'niigata', name: '新潟', region: '新潟県', lat: 37.9026, lon: 139.0236 },
  { id: 'nagoya', name: '名古屋', region: '愛知県', lat: 35.1815, lon: 136.9066 },
  { id: 'futamiokitamaiwa', name: '二見興玉神社（夫婦岩）', region: '三重県伊勢市', lat: 34.5085, lon: 136.7883 },
  { id: 'kyoto', name: '京都', region: '京都府', lat: 35.0116, lon: 135.7681 },
  { id: 'osaka', name: '大阪', region: '大阪府', lat: 34.6937, lon: 135.5023 },
  { id: 'hiroshima', name: '広島', region: '広島県', lat: 34.3853, lon: 132.4553 },
  { id: 'muroto', name: '室戸岬', region: '高知県室戸市', lat: 33.2482, lon: 134.1767 },
  { id: 'fukuoka', name: '福岡', region: '福岡県', lat: 33.5904, lon: 130.4017 },
  { id: 'kagoshima', name: '鹿児島', region: '鹿児島県', lat: 31.5966, lon: 130.5571 },
  { id: 'naha', name: '那覇', region: '沖縄県', lat: 26.2124, lon: 127.6809 },
];

/** 한국·일본 모두 UTC+9 */
const TZ_OFFSET_MIN = 9 * 60;

function hhmm(date: Date, offsetMin = TZ_OFFSET_MIN): string {
  // 분 단위 반올림(천문연·国立天文台 발표 방식)
  const local = new Date(Math.round((date.getTime() + offsetMin * 60_000) / 60_000) * 60_000);
  return `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`;
}

export type SunriseRow = SunriseSpot & { sunrise: string; dawn: string; sunriseMs: number };

/** year년 1월 1일 0시(UTC+9) 이후 첫 일출과 시민박명 시작(해 고도 -6°) */
export function firstSunrise(spot: Pick<SunriseSpot, 'lat' | 'lon'>, year = 2027): { sunrise: Date; dawn: Date } {
  const start = new Date(Date.UTC(year - 1, 11, 31, 15));
  const observer = new Astronomy.Observer(spot.lat, spot.lon, 0);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, start, 1);
  const dawn = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, start, 1, -6);
  if (!rise || !dawn) throw new Error(`no sunrise for ${spot.lat},${spot.lon}`);
  return { sunrise: rise.date, dawn: dawn.date };
}

export function sunriseTable(spots: SunriseSpot[], year = 2027): SunriseRow[] {
  return spots.map((s) => {
    const { sunrise, dawn } = firstSunrise(s, year);
    return { ...s, sunrise: hhmm(sunrise), dawn: hhmm(dawn), sunriseMs: sunrise.getTime() };
  });
}

export { sunriseNoaa } from './sunrise-noaa';

export const SUNRISE_LIMIT_KO = '해발 0m, 해의 윗부분이 수평선에 닿는 순간 기준이에요. 산 위나 높은 건물에서는 1~2분 빨라지고, 앞에 산이나 섬이 가리면 늦어져요.';
export const SUNRISE_LIMIT_JA = '海抜0m、太陽の上端が水平線に接する瞬間の時刻です。山頂や高い建物では1〜2分早く、前方に山や島があると遅くなります。';
