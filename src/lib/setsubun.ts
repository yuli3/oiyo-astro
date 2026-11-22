// 2027 節分 (ja 전용, 나라별 명절 판 3번안 — company-brain think-tank/2026-11-03-oiyo-other-series-brainstorm.md 3번).
// 번역판이 아니라 일본 명절 그대로: 恵方·豆の数·追い出す鬼.
// 2027 立春 = 2月4日(solarlunar 절기, 2026-11-21 확인) → 節分 2月3日(水).

export const SETSUBUN_YEAR = 2027;
export const SETSUBUN_DATE = { month: 2, day: 3, weekday: '水' } as const;

export interface Ehou {
  name: string;
  /** 真北から時計回りの角度 */
  degree: number;
}

const EHOU_BY_STEM: Ehou[] = [
  { name: '東北東', degree: 75 }, // 甲
  { name: '西南西', degree: 255 }, // 乙
  { name: '南南東', degree: 165 }, // 丙
  { name: '北北西', degree: 345 }, // 丁
  { name: '南南東', degree: 165 }, // 戊
  { name: '東北東', degree: 75 }, // 己
  { name: '西南西', degree: 255 }, // 庚
  { name: '南南東', degree: 165 }, // 辛
  { name: '北北西', degree: 345 }, // 壬
  { name: '南南東', degree: 165 }, // 癸
];
const STEMS = '甲乙丙丁戊己庚辛壬癸';

/** その年の十干で恵方が決まる(甲己・乙庚・丙辛戊癸・丁壬の4方位)。 */
export function ehouFor(year: number): Ehou & { stem: string } {
  if (!Number.isInteger(year)) throw new RangeError('year');
  const i = (((year - 4) % 10) + 10) % 10;
  return { ...EHOU_BY_STEM[i], stem: STEMS[i] };
}

/** 豆は「年の数」または「年の数+1」食べるとされる。ここでは満年齢+1で数える(節分時点)。 */
export function beanCount(birthYear: number, birthMonth: number, birthDay: number, year = SETSUBUN_YEAR): number {
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > year) throw new RangeError('birth');
  const hadBirthday = birthMonth < SETSUBUN_DATE.month || (birthMonth === SETSUBUN_DATE.month && birthDay <= SETSUBUN_DATE.day);
  const age = year - birthYear - (hadBirthday ? 0 : 1);
  return Math.max(age, 0) + 1;
}

export interface Oni {
  id: string;
  label: string;
  color: string;
  emoji: string;
  /** 追い出したいもの */
  meaning: string;
  /** 代わりに招く福(OIYO 作成) */
  fuku: string;
}

// 五色の鬼は仏教の「五蓋」に当てる説明が広く使われている。
export const ONI: readonly Oni[] = [
  { id: 'red', label: '赤鬼', color: '赤', emoji: '👹', meaning: '欲ばり・ないものねだり', fuku: '足りているものに気づく一年' },
  { id: 'blue', label: '青鬼', color: '青', emoji: '😤', meaning: '怒り・イライラ', fuku: '深呼吸ひとつ置ける一年' },
  { id: 'yellow', label: '黄鬼', color: '黄', emoji: '😰', meaning: '後悔・そわそわ', fuku: '今日のことに集中できる一年' },
  { id: 'green', label: '緑鬼', color: '緑', emoji: '😪', meaning: '怠け・不摂生', fuku: '体をいたわる習慣が続く一年' },
  { id: 'black', label: '黒鬼', color: '黒', emoji: '😒', meaning: '疑い・ぐち', fuku: '人を信じて頼れる一年' },
];

export const SETSUBUN_LIMIT = '節分カードは行事を楽しむための遊びです。運勢を占うものではなく、入力した内容はこのブラウザの外に送りません。';

export interface SetsubunCard {
  oni: Oni;
  beans: number;
  ehou: Ehou & { stem: string };
}

export function makeSetsubunCard(oniId: string, birthYear: number, birthMonth: number, birthDay: number): SetsubunCard {
  const oni = ONI.find((o) => o.id === oniId);
  if (!oni) throw new RangeError('oni');
  return { oni, beans: beanCount(birthYear, birthMonth, birthDay), ehou: ehouFor(SETSUBUN_YEAR) };
}
