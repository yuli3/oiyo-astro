// 24절기 SSOT.
//
// 절기는 날짜가 아니라 **태양 황경(黃經)** 으로 정의된다. 입춘이 315°이고 거기서
// 15°씩 나아간다. 그래서 절기 날짜가 해마다 하루씩 흔들린다 — 지구 공전이
// 365일 정수로 떨어지지 않기 때문이지 역법이 부정확해서가 아니다.
//
// 절(節)과 중기(中氣)가 번갈아 온다. 사주 월주(月柱)의 경계는 **절**이 정하고
// (lib/ontology/saju/calculator-solar.ts 가 입춘 315°를 기준으로 월지를 잡는다),
// 중기는 그 달 기운의 한가운데를 표시한다.
import type { Locale } from '../i18n';

export interface SolarTerm {
  /** 라우트 세그먼트 */
  id: string;
  /** 태양 황경(도). 입춘 315 에서 15°씩. */
  longitude: number;
  hanja: string;
  /** 절(節)은 월주 경계, 중기(中氣)는 달의 한가운데. */
  kind: 'jeol' | 'jung';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  name: Record<Locale, string>;
}

export const SOLAR_TERMS: SolarTerm[] = [
  { id: 'ipchun',   longitude: 315, hanja: '立春', kind: 'jeol', season: 'spring', name: { ko: '입춘', en: 'Start of Spring',   ja: '立春（りっしゅん）', zh: '立春', fr: 'Début du printemps',  es: 'Comienzo de la primavera' } },
  { id: 'usu',      longitude: 330, hanja: '雨水', kind: 'jung', season: 'spring', name: { ko: '우수', en: 'Rain Water',        ja: '雨水（うすい）',     zh: '雨水', fr: 'Eau de pluie',        es: 'Agua de lluvia' } },
  { id: 'gyeongchip',longitude: 345,hanja: '驚蟄', kind: 'jeol', season: 'spring', name: { ko: '경칩', en: 'Awakening of Insects', ja: '啓蟄（けいちつ）', zh: '惊蛰', fr: 'Réveil des insectes', es: 'Despertar de los insectos' } },
  { id: 'chunbun',  longitude: 0,   hanja: '春分', kind: 'jung', season: 'spring', name: { ko: '춘분', en: 'Spring Equinox',    ja: '春分（しゅんぶん）', zh: '春分', fr: 'Équinoxe de printemps', es: 'Equinoccio de primavera' } },
  { id: 'cheongmyeong', longitude: 15, hanja: '淸明', kind: 'jeol', season: 'spring', name: { ko: '청명', en: 'Pure Brightness', ja: '清明（せいめい）', zh: '清明', fr: 'Clarté pure',        es: 'Claridad pura' } },
  { id: 'gogu',     longitude: 30,  hanja: '穀雨', kind: 'jung', season: 'spring', name: { ko: '곡우', en: 'Grain Rain',        ja: '穀雨（こくう）',     zh: '谷雨', fr: 'Pluie des grains',    es: 'Lluvia de grano' } },
  { id: 'ipha',     longitude: 45,  hanja: '立夏', kind: 'jeol', season: 'summer', name: { ko: '입하', en: 'Start of Summer',   ja: '立夏（りっか）',     zh: '立夏', fr: "Début de l'été",      es: 'Comienzo del verano' } },
  { id: 'soman',    longitude: 60,  hanja: '小滿', kind: 'jung', season: 'summer', name: { ko: '소만', en: 'Grain Full',        ja: '小満（しょうまん）', zh: '小满', fr: 'Petite plénitude',    es: 'Grano lleno' } },
  { id: 'mangjong', longitude: 75,  hanja: '芒種', kind: 'jeol', season: 'summer', name: { ko: '망종', en: 'Grain in Ear',      ja: '芒種（ぼうしゅ）',   zh: '芒种', fr: 'Épiaison',            es: 'Grano en espiga' } },
  { id: 'haji',     longitude: 90,  hanja: '夏至', kind: 'jung', season: 'summer', name: { ko: '하지', en: 'Summer Solstice',   ja: '夏至（げし）',       zh: '夏至', fr: "Solstice d'été",      es: 'Solsticio de verano' } },
  { id: 'soseo',    longitude: 105, hanja: '小暑', kind: 'jeol', season: 'summer', name: { ko: '소서', en: 'Minor Heat',        ja: '小暑（しょうしょ）', zh: '小暑', fr: 'Petite chaleur',      es: 'Calor menor' } },
  { id: 'daeseo',   longitude: 120, hanja: '大暑', kind: 'jung', season: 'summer', name: { ko: '대서', en: 'Major Heat',        ja: '大暑（たいしょ）',   zh: '大暑', fr: 'Grande chaleur',      es: 'Calor mayor' } },
  { id: 'ipchu',    longitude: 135, hanja: '立秋', kind: 'jeol', season: 'autumn', name: { ko: '입추', en: 'Start of Autumn',   ja: '立秋（りっしゅう）', zh: '立秋', fr: "Début de l'automne",  es: 'Comienzo del otoño' } },
  { id: 'cheoseo',  longitude: 150, hanja: '處暑', kind: 'jung', season: 'autumn', name: { ko: '처서', en: 'End of Heat',       ja: '処暑（しょしょ）',   zh: '处暑', fr: 'Fin de la chaleur',   es: 'Fin del calor' } },
  { id: 'baengno',  longitude: 165, hanja: '白露', kind: 'jeol', season: 'autumn', name: { ko: '백로', en: 'White Dew',         ja: '白露（はくろ）',     zh: '白露', fr: 'Rosée blanche',       es: 'Rocío blanco' } },
  { id: 'chubun',   longitude: 180, hanja: '秋分', kind: 'jung', season: 'autumn', name: { ko: '추분', en: 'Autumn Equinox',    ja: '秋分（しゅうぶん）', zh: '秋分', fr: "Équinoxe d'automne",  es: 'Equinoccio de otoño' } },
  { id: 'hallo',    longitude: 195, hanja: '寒露', kind: 'jeol', season: 'autumn', name: { ko: '한로', en: 'Cold Dew',          ja: '寒露（かんろ）',     zh: '寒露', fr: 'Rosée froide',        es: 'Rocío frío' } },
  { id: 'sanggang', longitude: 210, hanja: '霜降', kind: 'jung', season: 'autumn', name: { ko: '상강', en: 'Frost Descent',     ja: '霜降（そうこう）',   zh: '霜降', fr: 'Descente du givre',   es: 'Descenso de la escarcha' } },
  { id: 'ipdong',   longitude: 225, hanja: '立冬', kind: 'jeol', season: 'winter', name: { ko: '입동', en: 'Start of Winter',   ja: '立冬（りっとう）',   zh: '立冬', fr: "Début de l'hiver",    es: 'Comienzo del invierno' } },
  { id: 'soseol',   longitude: 240, hanja: '小雪', kind: 'jung', season: 'winter', name: { ko: '소설', en: 'Minor Snow',        ja: '小雪（しょうせつ）', zh: '小雪', fr: 'Petite neige',        es: 'Nieve menor' } },
  { id: 'daeseol',  longitude: 255, hanja: '大雪', kind: 'jeol', season: 'winter', name: { ko: '대설', en: 'Major Snow',        ja: '大雪（たいせつ）',   zh: '大雪', fr: 'Grande neige',        es: 'Nieve mayor' } },
  { id: 'dongji',   longitude: 270, hanja: '冬至', kind: 'jung', season: 'winter', name: { ko: '동지', en: 'Winter Solstice',   ja: '冬至（とうじ）',     zh: '冬至', fr: "Solstice d'hiver",    es: 'Solsticio de invierno' } },
  { id: 'sohan',    longitude: 285, hanja: '小寒', kind: 'jeol', season: 'winter', name: { ko: '소한', en: 'Minor Cold',        ja: '小寒（しょうかん）', zh: '小寒', fr: 'Petit froid',         es: 'Frío menor' } },
  { id: 'daehan',   longitude: 300, hanja: '大寒', kind: 'jung', season: 'winter', name: { ko: '대한', en: 'Major Cold',        ja: '大寒（だいかん）',   zh: '大寒', fr: 'Grand froid',         es: 'Frío mayor' } },
];

/** KASI 데이터의 한글 절기명 → id. 실측 절입 시각을 붙일 때 쓴다. */
export const TERM_BY_KO: Record<string, SolarTerm> = Object.fromEntries(
  SOLAR_TERMS.map((t) => [t.name.ko, t]),
);
