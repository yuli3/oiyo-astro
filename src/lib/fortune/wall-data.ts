// 홈 랜딩의 "운세 도배" 섹션 전용. 생년월일 없이, 12지신·별자리 각각을
// reading() 엔진에 직접 색인으로 넣어 전체 케이스(기간×띠×별자리)를 만든다.
import { ANIMAL_EMOJI, ANIMAL_IMAGE, ANIMAL_NAMES, SIGN_IMAGE, SIGN_NAMES, SIGN_SYMBOL } from './zodiac-names';
import { animalOf, civilDay, elementOf, reading, type Period, type Locale as FortuneLocale } from './periodic';
import { animalRanking, signRanking, scores, delta, grade, lucky, type Grade } from './score';

/** 띠 카드 안의 출생 연도별 한 줄 (2026-10-08 세운: "호랑이띠라도 74·86·98년생으로 나누면 좋겠다"). */
export interface WallBirthYear {
  year: number;
  /** "74년생" / "1974" — 로케일별 표기. */
  label: string;
  /** 그 해 천간의 오행으로 뽑은 한 줄. 같은 띠라도 해마다 천간이 달라 문장이 갈린다. */
  line: string;
  score: number;
  grade: Grade;
}

// 지면 신문의 띠별 운세가 다루는 폭과 비슷하게, 만 14~78세가 되는 출생 연도만 낸다.
// 12년 주기라 띠마다 5~6개다. 연도는 양력 기준이고 설·입춘 전 출생은 앞 해의 띠다.
const YOUNGEST_AGE = 14;
const OLDEST_AGE = 78;

export function birthYearsOf(animalIdx: number, at: Date): number[] {
  const thisYear = at.getUTCFullYear();
  const years: number[] = [];
  for (let year = thisYear - OLDEST_AGE; year <= thisYear - YOUNGEST_AGE; year += 1) {
    if (animalOf(year) === animalIdx) years.push(year);
  }
  return years;
}

function birthYearLabel(year: number, lang: string): string {
  if (lang === 'ko') return `${String(year % 100).padStart(2, '0')}년생`;
  if (lang === 'ja') return `${year}年生まれ`;
  if (lang === 'zh') return `${year}年生`;
  return String(year);
}


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

// 띠·별자리 이름과 그림은 zodiac-names.ts 한곳에 둔다(2026-11-11, 신년운세 모음과 같이 쓴다).

export interface WallCard {
  name: string;
  emoji: string;
  /** 결과 심볼 이미지 경로. 이모지는 alt 대체용으로만 남는다. */
  image: string;
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
  /** 띠 카드에만 있다. 별자리는 출생 연도로 갈리지 않는다. */
  years?: WallBirthYear[];
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
  images: string[],
  fortuneLocale: FortuneLocale,
  elementOfIndex: (i: number) => number,
  used: { opening: Set<string>; advice: Set<string> },
  lang: string,
): WallCard[] {
  const byIndex = [...rows].sort((a, b) => a.idx - b.idx);
  return byIndex.map((row) => {
    const base = `${prefix}-${row.idx}`;
    const g = grade(row.score);
    // 한 화면에 24장이 함께 놓이므로, 같은 문장이 두 카드에 동시에 뜨면
    // 코퍼스가 얕아 보인다. 겹치면 소금을 쳐서 다시 뽑는다.
    let r = reading(elementOfIndex(row.idx), period, base, fortuneLocale, at, g);
    // 출생 연도 줄까지 한 섹션에 조언이 89개 놓이고 풀은 96개라, 넉넉히 다시 뽑아야 겹치지 않는다.
    for (let salt = 1; salt < 64 && (used.opening.has(r.opening) || used.advice.has(r.advice)); salt++) {
      r = reading(elementOfIndex(row.idx), period, `${base}~${salt}`, fortuneLocale, at, g);
    }
    used.opening.add(r.opening);
    used.advice.add(r.advice);
    return {
      name: names[row.idx],
      emoji: emoji[row.idx],
      image: images[row.idx],
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
      ...(prefix === 'animal' ? { years: birthYearLines(row.idx, period, at, fortuneLocale, used, lang) } : {}),
    };
  });
}

function birthYearLines(
  animalIdx: number,
  period: Period,
  at: Date,
  fortuneLocale: FortuneLocale,
  used: { opening: Set<string>; advice: Set<string> },
  lang: string,
): WallBirthYear[] {
  return birthYearsOf(animalIdx, at).map((year) => {
    const base = `animal-${animalIdx}-y${year}`;
    const score = scores(base, period, at).overall;
    const g = grade(score);
    // 띠 카드의 조언과도, 다른 해의 줄과도 겹치지 않게 뽑는다.
    let r = reading(elementOf(year), period, base, fortuneLocale, at, g);
    for (let salt = 1; salt < 64 && used.advice.has(r.advice); salt++) {
      r = reading(elementOf(year), period, `${base}~${salt}`, fortuneLocale, at, g);
    }
    used.advice.add(r.advice);
    // 코퍼스의 조언은 "조언: …" 꼴이다. 연도 옆에서는 머리말이 군더더기라 떼어 낸다.
    const bare = r.advice.replace(/^[^:：]{1,14}[:：]\s*/, '');
    // 머리말을 떼면 영어·프랑스어·스페인어는 소문자로 시작하므로 첫 글자를 올린다.
    const line = bare.charAt(0).toLocaleUpperCase(lang) + bare.slice(1);
    return { year, label: birthYearLabel(year, lang), line, score, grade: g };
  });
}

export function buildFortuneWall(locale: string, at = civilDay()): WallSection[] {
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
    animals: rankedCards(animalRanking(key, at), key, at, 'animal', ANIMAL_NAMES[lang], ANIMAL_EMOJI, ANIMAL_IMAGE, fortuneLocale, (i) => (i * 2 + 1) % 5, seen[key], lang),
    signs: rankedCards(signRanking(key, at), key, at, 'sign', SIGN_NAMES[lang], SIGN_SYMBOL, SIGN_IMAGE, fortuneLocale, (i) => (i + 2) % 5, seen[key], lang),
  }));
}
