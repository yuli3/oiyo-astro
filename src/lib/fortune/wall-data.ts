// 홈 랜딩의 "운세 도배" 섹션 전용. 생년월일 없이, 12지신·별자리 각각을
// reading() 엔진에 직접 색인으로 넣어 전체 케이스(기간×띠×별자리)를 만든다.
import { reading, type Period, type Locale as FortuneLocale } from './periodic';

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
}

export interface WallSection {
  period: Period;
  periodLabel: string;
  animals: WallCard[];
  signs: WallCard[];
}

const PERIODS: Period[] = ['today', 'weekly', 'monthly', 'yearly'];

export function buildFortuneWall(locale: string): WallSection[] {
  const lang = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(locale) ? locale : 'en') as Lang;
  const fortuneLocale = lang as FortuneLocale;
  return PERIODS.map((key) => ({
    period: key,
    periodLabel: PERIOD_LABELS[lang][key],
    animals: ANIMAL_NAMES[lang].map((name, i) => {
      const r = reading((i * 2 + 1) % 5, key, `animal-${i}`, fortuneLocale);
      return { name, emoji: ANIMAL_EMOJI[i], opening: r.opening, advice: r.advice };
    }),
    signs: SIGN_NAMES[lang].map((name, i) => {
      const r = reading((i + 2) % 5, key, `sign-${i}`, fortuneLocale);
      return { name, emoji: SIGN_SYMBOL[i], opening: r.opening, advice: r.advice };
    }),
  }));
}
