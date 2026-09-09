// 홈 랜딩의 "운세 도배" 섹션 전용. 생년월일 없이, 12지신·별자리 각각을
// reading() 엔진에 직접 색인으로 넣어 전체 케이스(기간×띠×별자리)를 만든다.
import { reading, type Period, type Locale as FortuneLocale } from './periodic';
import { animalRanking, signRanking, scores, delta, grade, lucky, type Grade } from './score';

type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

export const PERIOD_LABELS: Record<Lang, Record<Period, string>> = {
  ko: { today: '오늘', weekly: '이번 주', monthly: '이번 달', yearly: '올해' },
  en: { today: 'Today', weekly: 'This Week', monthly: 'This Month', yearly: 'This Year' },
  ja: { today: '今日', weekly: '今週', monthly: '今月', yearly: '今年' },
  zh: { today: '今日', weekly: '本周', monthly: '本月', yearly: '今年' },
  fr: { today: "Aujourd'hui", weekly: 'Cette semaine', monthly: 'Ce mois-ci', yearly: 'Cette année' },
  es: { today: 'Hoy', weekly: 'Esta semana', monthly: 'Este mes', yearly: 'Este año' },
};

export const SECTION_LABELS: Record<Lang, { animals: string; signs: string; fortuneSuffix: string }> = {
  ko: { animals: '12지신', signs: '별자리', fortuneSuffix: '운세' },
  en: { animals: 'Chinese Zodiac', signs: 'Star Signs', fortuneSuffix: 'Fortune' },
  ja: { animals: '十二支', signs: '星座', fortuneSuffix: '運勢' },
  zh: { animals: '十二生肖', signs: '星座', fortuneSuffix: '运势' },
  fr: { animals: 'Zodiaque Chinois', signs: 'Signes Astro', fortuneSuffix: '' },
  es: { animals: 'Zodiaco Chino', signs: 'Signos', fortuneSuffix: '' },
};

const ANIMAL_NAMES: Record<Lang, string[]> = {
  ko: ['쥐띠', '소띠', '호랑이띠', '토끼띠', '용띠', '뱀띠', '말띠', '양띠', '원숭이띠', '닭띠', '개띠', '돼지띠'],
  en: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
  ja: ['子（ねずみ）', '丑（うし）', '寅（とら）', '卯（うさぎ）', '辰（たつ）', '巳（へび）', '午（うま）', '未（ひつじ）', '申（さる）', '酉（とり）', '戌（いぬ）', '亥（いのしし）'],
  zh: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
  fr: ['Rat', 'Bœuf', 'Tigre', 'Lapin', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'],
  es: ['Rata', 'Buey', 'Tigre', 'Conejo', 'Dragón', 'Serpiente', 'Caballo', 'Cabra', 'Mono', 'Gallo', 'Perro', 'Cerdo'],
};
const ANIMAL_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐉', '🐍', '🐎', '🐑', '🐒', '🐓', '🐕', '🐷'];

const SIGN_NAMES: Record<Lang, string[]> = {
  ko: ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '궁수자리', '염소자리', '물병자리', '물고기자리'],
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  ja: ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'],
  zh: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'],
  fr: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'],
  es: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'],
};
const SIGN_SYMBOL = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export interface WallCard {
  name: string;
  emoji: string;
  opening: string;
  advice: string;
  /** 운세 점수 1~99. 순위와 같은 엔진에서 나온다. */
  score: number;
  grade: Grade;
  /** 1~12위. 랜딩에서 가장 강한 재방문 훅이다. */
  rank: number;
  /** 직전 주기 대비 총운 변화. 0 이면 보합. */
  delta: number;
  keyword: string;
  caution: string;
  luckyColorHex: string;
  luckyNumber: number;
}

export interface WallSection {
  period: Period;
  periodLabel: string;
  animals: WallCard[];
  signs: WallCard[];
}

export const GRADE_LABELS: Record<Lang, Record<Grade, string>> = {
  ko: { great: '대길', good: '길', normal: '평', careful: '주의' },
  en: { great: 'Excellent', good: 'Good', normal: 'Fair', careful: 'Take care' },
  ja: { great: '大吉', good: '吉', normal: '平', careful: '注意' },
  zh: { great: '大吉', good: '吉', normal: '平', careful: '注意' },
  fr: { great: 'Excellent', good: 'Bon', normal: 'Moyen', careful: 'Prudence' },
  es: { great: 'Excelente', good: 'Bueno', normal: 'Regular', careful: 'Precaución' },
};

export const GRADE_COLORS: Record<Grade, string> = {
  great: '#d97706', good: '#16a34a', normal: '#0891b2', careful: '#7c3aed',
};

const PERIODS: Period[] = ['today', 'weekly', 'monthly', 'yearly'];

/**
 * 카드는 늘 같은 자리(쥐→돼지 / 양자리→물고기자리)에 둔다. 순위대로 재배열하면
 * 자기 띠를 매번 다른 곳에서 찾아야 해서, 순위를 확인하러 온 사람에게도
 * 자기 띠를 보러 온 사람에게도 불편하다. 순위는 배지로만 표기한다.
 */
function rankedCards(
  rows: { idx: number; rank: number; score: number }[],
  period: Period,
  at: Date,
  prefix: 'animal' | 'sign',
  names: string[],
  emoji: string[],
  fortuneLocale: FortuneLocale,
  elementOfIndex: (i: number) => number,
  used: { opening: Set<string>; advice: Set<string> },
): WallCard[] {
  const byIndex = [...rows].sort((a, b) => a.idx - b.idx);
  return byIndex.map((row) => {
    const base = `${prefix}-${row.idx}`;
    const g = grade(row.score);
    // 한 화면에 24장이 함께 놓이므로, 같은 문장이 두 카드에 동시에 뜨면
    // 코퍼스가 얕아 보인다. 겹치면 소금을 쳐서 다시 뽑는다.
    let r = reading(elementOfIndex(row.idx), period, base, fortuneLocale, at, g);
    for (let salt = 1; salt < 12 && (used.opening.has(r.opening) || used.advice.has(r.advice)); salt++) {
      r = reading(elementOfIndex(row.idx), period, `${base}~${salt}`, fortuneLocale, at, g);
    }
    used.opening.add(r.opening);
    used.advice.add(r.advice);
    return {
      name: names[row.idx],
      emoji: emoji[row.idx],
      opening: r.opening,
      advice: r.advice,
      caution: r.caution,
      keyword: r.keyword,
      score: row.score,
      grade: g,
      rank: row.rank,
      delta: delta(base, period, at),
      luckyColorHex: lucky(base, period, fortuneLocale, at).colorHex,
      luckyNumber: lucky(base, period, fortuneLocale, at).number,
    };
  });
}

export function buildFortuneWall(locale: string, at = new Date()): WallSection[] {
  const lang = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(locale) ? locale : 'en') as Lang;
  const fortuneLocale = lang as FortuneLocale;
  // 같은 주기 섹션 안에서만 중복을 피한다. 주기가 다르면 겹쳐도 함께 보이지 않는다.
  const seen: Record<Period, { opening: Set<string>; advice: Set<string> }> =
    Object.fromEntries(PERIODS.map((k) => [k, { opening: new Set<string>(), advice: new Set<string>() }])) as never;
  return PERIODS.map((key) => ({
    period: key,
    periodLabel: PERIOD_LABELS[lang][key],
    // 순위가 높은 순으로 낸다. 12개를 무순으로 늘어놓는 것보다 "오늘 1위는
    // 누구인가"가 훨씬 강한 훅이고, 매일 순위가 바뀌므로 재방문 이유가 된다.
    animals: rankedCards(animalRanking(key, at), key, at, 'animal', ANIMAL_NAMES[lang], ANIMAL_EMOJI, fortuneLocale, (i) => (i * 2 + 1) % 5, seen[key]),
    signs: rankedCards(signRanking(key, at), key, at, 'sign', SIGN_NAMES[lang], SIGN_SYMBOL, fortuneLocale, (i) => (i + 2) % 5, seen[key]),
  }));
}
