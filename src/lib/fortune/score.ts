// 운세 점수·흐름·순위·행운 아이템 엔진.
// periodic.ts 의 문장 코퍼스가 "무엇을 말하는가"를 담당한다면, 이 파일은
// "얼마나·어떤 방향으로 움직이는가"를 담당한다. 전부 결정론적(시드 = 대상+주기키)
// 이라 같은 날 같은 사람은 항상 같은 값을 보고, 날이 바뀌면 갱신된다.
import { periodKey, seedHash, stepIndex, type Locale, type Period } from './periodic';

const hash = seedHash;
/** 0~1 실수 */
function unit(s: string): number { return hash(s) / 4294967295; }

// ── 부드러운 흐름을 위한 1D 밸류 노이즈 ──
// 순수 해시는 매일 톱니처럼 튀어 "흐름"으로 읽히지 않는다. 격자점 사이를
// smoothstep 보간해, 며칠에 걸쳐 오르내리는 곡선을 만든다.
function smooth(t: number): number { return t * t * (3 - 2 * t); }
function noise(seed: string, x: number): number {
  const i = Math.floor(x), f = x - i;
  const a = unit(`${seed}#${i}`), b = unit(`${seed}#${i + 1}`);
  return a + (b - a) * smooth(f);
}

export { stepIndex };

export const AXES = ['overall', 'love', 'money', 'work', 'health'] as const;
export type Axis = typeof AXES[number];
export type Scores = Record<Axis, number>;

/** 주기별 격자 간격. 흐름으로 읽힐 만큼은 이어지되, 이웃 지점이 눈에 띄게
 *  달라야 하므로 1.5~2 사이로 둔다. 3 이상이면 며칠간 같은 점수로 붙어버린다. */
const SPAN: Record<Period, number> = { today: 2.6, weekly: 2.2, monthly: 2.2, yearly: 1.4 };

/** 0~1 을 0~1 로 되돌리는 S자 게인 곡선. 밸류 노이즈(특히 여러 축의 평균)는
 *  중앙에 몰린 분포라 그대로 쓰면 대부분 40~60 의 밋밋한 '보통'이 되고,
 *  이웃한 날들이 같은 점수로 붙어 흐름 그래프가 평평해진다. 곱해서 벌리면
 *  양끝이 잘리므로, 붐비는 가운데를 펴고 한산한 양끝을 완만히 조이는
 *  전단사 곡선을 쓴다. p > 1 일수록 가운데가 더 크게 벌어진다. */
function spread(u: number, p = 1.8): number {
  const c = Math.min(1, Math.max(0, u));
  return c < 0.5 ? 0.5 * Math.pow(c * 2, p) : 1 - 0.5 * Math.pow((1 - c) * 2, p);
}
/** 운세는 관례적으로 약간 후하게 나온다. 감마 < 1 로 전체를 위로 민다. */
function lift(u: number): number { return Math.pow(u, 0.86); }


/** 특정 축의 점수(1~99). 주기 순번 t 를 직접 받아 과거·미래도 계산할 수 있다. */
export function axisScoreAt(base: string, period: Period, axis: Axis, t: number): number {
  const span = SPAN[period];
  const n = noise(`${base}|${period}|${axis}`, t / span);
  // 축마다 위상을 달리한 보조 파동을 더해 5개 축이 나란히 움직이지 않게 한다.
  const wob = noise(`${base}|${period}|${axis}|w`, t / (span * 3)) - 0.5;
  const v = Math.round(lift(spread(n * 0.78 + (wob + 0.5) * 0.22)) * 94) + 5;
  return Math.min(99, Math.max(5, v));
}

export function scores(base: string, period: Period, d = new Date()): Scores {
  const t = stepIndex(period, d);
  const s = {} as Scores;
  for (const a of AXES) s[a] = axisScoreAt(base, period, a, t);
  // 총운은 독립 난수가 아니라 나머지 네 축의 가중 평균 + 자체 편차로 만든다.
  // 그래야 "총운은 좋은데 전부 나쁨" 같은 모순이 나오지 않는다.
  // 네 축 평균만 쓰면 서로 상쇄돼 전부 50 근처가 된다. 평균으로 정합성을
  // 유지하되 다시 벌려, 총운도 1~99 를 실제로 오가게 한다.
  const mean = (s.love + s.money + s.work + s.health) / 4;
  const blended = (mean * 0.6 + s.overall * 0.4 - 5) / 94;
  s.overall = Math.min(99, Math.max(5, Math.round(spread(blended, 2.4) * 94) + 5));
  return s;
}

/** 앞뒤 흐름. before/after 개수만큼 과거·미래 점수를 함께 돌려준다. */
export interface FlowPoint { offset: number; score: number; label: string; }
export function flow(
  base: string, period: Period, axis: Axis = 'overall',
  before = 3, after = 3, d = new Date(), locale: Locale = 'en',
): FlowPoint[] {
  const out: FlowPoint[] = [];
  for (let o = -before; o <= after; o++) {
    const at = shift(period, d, o);
    // 총운은 scores() 에서 네 축 평균으로 보정되므로 흐름도 같은 보정을 거쳐야
    // 카드에 뜬 숫자와 그래프의 오늘 지점이 어긋나지 않는다.
    out.push({ offset: o, score: pointScore(base, period, axis, at), label: flowLabel(period, at, locale) });
  }
  return out;
}
function pointScore(base: string, period: Period, axis: Axis, at: Date): number {
  return axis === 'overall' ? scores(base, period, at).overall : axisScoreAt(base, period, axis, stepIndex(period, at));
}

/** 주기 단위로 n 만큼 이동한 날짜 */
export function shift(period: Period, d: Date, n: number): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (period === 'today') x.setUTCDate(x.getUTCDate() + n);
  else if (period === 'weekly') x.setUTCDate(x.getUTCDate() + n * 7);
  else if (period === 'monthly') x.setUTCMonth(x.getUTCMonth() + n);
  else x.setUTCFullYear(x.getUTCFullYear() + n);
  return x;
}

function flowLabel(period: Period, d: Date, locale: Locale): string {
  if (period === 'today') return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  if (period === 'weekly') return periodKey('weekly', d).split('-')[1];
  if (period === 'monthly') {
    // 월 이름은 로케일별로 낸다. 예전에는 `${n}월`을 고정으로 붙여 일본어·중국어
    // 페이지 축에 한국어가 새어 나왔다. (2026-09-09)
    try {
      return new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(d);
    } catch {
      return `${d.getUTCMonth() + 1}`;
    }
  }
  return `${d.getUTCFullYear()}`;
}

/** 어제(또는 지난주·지난달) 대비 총운 변화량 */
export function delta(base: string, period: Period, d = new Date()): number {
  const prev = shift(period, d, -1);
  return scores(base, period, d).overall - scores(base, period, prev).overall;
}

// ── 순위 ──
export interface RankRow { idx: number; score: number; rank: number; }
function rankBy(prefix: string, count: number, period: Period, d: Date): RankRow[] {
  return Array.from({ length: count }, (_, idx) => ({ idx, score: scores(`${prefix}-${idx}`, period, d).overall, rank: 0 }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
/** 12지신 순위 1~12위 */
export function animalRanking(period: Period, d = new Date()): RankRow[] { return rankBy('animal', 12, period, d); }
/** 별자리 순위 1~12위 */
export function signRanking(period: Period, d = new Date()): RankRow[] { return rankBy('sign', 12, period, d); }

// ── 행운 아이템 ──
const LUCKY_COLORS: { hex: string; name: Record<Locale, string> }[] = [
  { hex: '#dc2626', name: { ko: '빨강', en: 'Red', ja: '赤', zh: '红色', fr: 'Rouge', es: 'Rojo' } },
  { hex: '#ea580c', name: { ko: '주황', en: 'Orange', ja: 'オレンジ', zh: '橙色', fr: 'Orange', es: 'Naranja' } },
  { hex: '#ca8a04', name: { ko: '노랑', en: 'Yellow', ja: '黄', zh: '黄色', fr: 'Jaune', es: 'Amarillo' } },
  { hex: '#16a34a', name: { ko: '초록', en: 'Green', ja: '緑', zh: '绿色', fr: 'Vert', es: 'Verde' } },
  { hex: '#0891b2', name: { ko: '청록', en: 'Teal', ja: '青緑', zh: '青色', fr: 'Turquoise', es: 'Turquesa' } },
  { hex: '#2563eb', name: { ko: '파랑', en: 'Blue', ja: '青', zh: '蓝色', fr: 'Bleu', es: 'Azul' } },
  { hex: '#7c3aed', name: { ko: '보라', en: 'Purple', ja: '紫', zh: '紫色', fr: 'Violet', es: 'Morado' } },
  { hex: '#db2777', name: { ko: '분홍', en: 'Pink', ja: 'ピンク', zh: '粉色', fr: 'Rose', es: 'Rosa' } },
  { hex: '#78716c', name: { ko: '갈색', en: 'Brown', ja: '茶', zh: '棕色', fr: 'Brun', es: 'Marrón' } },
  { hex: '#0f172a', name: { ko: '검정', en: 'Black', ja: '黒', zh: '黑色', fr: 'Noir', es: 'Negro' } },
  { hex: '#e2e8f0', name: { ko: '흰색', en: 'White', ja: '白', zh: '白色', fr: 'Blanc', es: 'Blanco' } },
  { hex: '#64748b', name: { ko: '은색', en: 'Silver', ja: '銀', zh: '银色', fr: 'Argent', es: 'Plata' } },
];

const DIRECTIONS: Record<Locale, string[]> = {
  ko: ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '서남쪽', '동북쪽', '서북쪽'],
  en: ['East', 'West', 'South', 'North', 'Southeast', 'Southwest', 'Northeast', 'Northwest'],
  ja: ['東', '西', '南', '北', '東南', '西南', '東北', '西北'],
  zh: ['东方', '西方', '南方', '北方', '东南', '西南', '东北', '西北'],
  fr: ['Est', 'Ouest', 'Sud', 'Nord', 'Sud-est', 'Sud-ouest', 'Nord-est', 'Nord-ouest'],
  es: ['Este', 'Oeste', 'Sur', 'Norte', 'Sureste', 'Suroeste', 'Noreste', 'Noroeste'],
};

const TIME_SLOTS: Record<Locale, string[]> = {
  ko: ['이른 아침', '오전', '점심 무렵', '이른 오후', '늦은 오후', '해질 무렵', '저녁', '밤늦게'],
  en: ['Early morning', 'Late morning', 'Around noon', 'Early afternoon', 'Late afternoon', 'Sunset', 'Evening', 'Late night'],
  ja: ['早朝', '午前', '昼ごろ', '昼下がり', '夕方前', '日暮れ', '夜', '深夜'],
  zh: ['清晨', '上午', '午间', '午后', '傍晚前', '日落时分', '夜晚', '深夜'],
  fr: ['Tôt le matin', 'Fin de matinée', 'Vers midi', "Début d'après-midi", "Fin d'après-midi", 'Coucher du soleil', 'Soirée', 'Tard le soir'],
  es: ['Temprano', 'Media mañana', 'Mediodía', 'Primera tarde', 'Tarde', 'Atardecer', 'Noche', 'Madrugada'],
};

const LUCKY_ITEMS: Record<Locale, string[]> = {
  ko: ['따뜻한 차', '손목시계', '작은 노트', '이어폰', '식물 화분', '거울', '향초', '가죽 지갑', '스카프', '펜', '열쇠고리', '반지'],
  en: ['A warm tea', 'A wristwatch', 'A small notebook', 'Earphones', 'A potted plant', 'A mirror', 'A scented candle', 'A leather wallet', 'A scarf', 'A pen', 'A keyring', 'A ring'],
  ja: ['温かいお茶', '腕時計', '小さなノート', 'イヤホン', '観葉植物', '鏡', 'アロマキャンドル', '革の財布', 'スカーフ', 'ペン', 'キーホルダー', '指輪'],
  zh: ['一杯热茶', '手表', '小笔记本', '耳机', '盆栽', '镜子', '香薰蜡烛', '皮夹', '围巾', '钢笔', '钥匙扣', '戒指'],
  fr: ['Un thé chaud', 'Une montre', 'Un carnet', 'Des écouteurs', 'Une plante', 'Un miroir', 'Une bougie', 'Un portefeuille', 'Une écharpe', 'Un stylo', 'Un porte-clés', 'Une bague'],
  es: ['Un té caliente', 'Un reloj', 'Una libreta', 'Auriculares', 'Una planta', 'Un espejo', 'Una vela', 'Una cartera', 'Una bufanda', 'Un bolígrafo', 'Un llavero', 'Un anillo'],
};

export interface Lucky { colorHex: string; colorName: string; number: number; direction: string; time: string; item: string; }
export function lucky(base: string, period: Period, locale: Locale, d = new Date()): Lucky {
  const pk = periodKey(period, d);
  const at = <T,>(arr: T[], axis: string): T => arr[hash(`${base}|${pk}|${axis}`) % arr.length];
  const c = at(LUCKY_COLORS, 'color');
  return {
    colorHex: c.hex,
    colorName: c.name[locale] ?? c.name.en,
    number: (hash(`${base}|${pk}|num`) % 45) + 1,
    direction: at(DIRECTIONS[locale] ?? DIRECTIONS.en, 'dir'),
    time: at(TIME_SLOTS[locale] ?? TIME_SLOTS.en, 'time'),
    item: at(LUCKY_ITEMS[locale] ?? LUCKY_ITEMS.en, 'item'),
  };
}

/** 점수 → 등급(대길/길/평/주의) */
export type Grade = 'great' | 'good' | 'normal' | 'careful';
export function grade(score: number): Grade {
  if (score >= 82) return 'great';
  if (score >= 58) return 'good';
  if (score >= 32) return 'normal';
  return 'careful';
}
