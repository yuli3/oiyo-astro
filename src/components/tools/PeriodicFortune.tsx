import { useMemo, useState, useEffect } from 'react';
import { reading, periodKey, animalOf, signOf, elementOf, FIVE_ELEMENTS, type Locale, type Period } from '../../lib/fortune/periodic';
import { useProfilePrefill } from '../../lib/user/useProfilePrefill';
import { BirthDateField } from '../shared/BirthDateField';

type Focus = 'trinity' | 'saju' | 'zodiac';

const L: Record<Locale, {
  birthPrompt: string; birthDate: string; see: string;
  saju: string; animal: string; sign: string; period: Record<Period, string>;
  periodTag: Record<Period, string>; elements: Record<string, string>;
  animals: string[]; signs: string[]; savedHint: string; focusIntro: Record<Focus, string>;
}> = {
  ko: { birthPrompt: '생년월일을 입력하면 사주 오행·12지신·별자리 세 관점의 운세가 나옵니다.', birthDate: '생년월일', see: '운세 보기',
    saju: '사주 오행', animal: '12지신', sign: '별자리',
    period: { today: '오늘의 운세', weekly: '이번 주 운세', monthly: '이번 달 운세', yearly: '올해의 운세' },
    periodTag: { today: '오늘', weekly: '이번 주', monthly: '이번 달', yearly: '올해' },
    elements: { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' },
    animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
    signs: ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '궁수자리', '염소자리', '물병자리', '물고기자리'], savedHint: '저장됨',
    focusIntro: { trinity: '세 관점을 함께 비교합니다.', saju: '사주 오행 흐름에 집중해 주기별 키워드를 봅니다.', zodiac: '태양 별자리 흐름에 집중해 주기별 키워드를 봅니다.' } },
  en: { birthPrompt: 'Enter your birth date to see fortune from three angles: Saju five elements, Chinese zodiac, and star sign.', birthDate: 'Birth date', see: 'See fortune',
    saju: 'Saju Five Elements', animal: 'Chinese Zodiac', sign: 'Star Sign',
    period: { today: "Today's Fortune", weekly: 'This Week', monthly: 'This Month', yearly: 'This Year' },
    periodTag: { today: 'today', weekly: 'this week', monthly: 'this month', yearly: 'this year' },
    elements: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
    animals: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
    signs: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], savedHint: 'saved',
    focusIntro: { trinity: 'Compare the three symbolic lenses together.', saju: 'Focus on the Saju five-element rhythm for this cycle.', zodiac: 'Focus on your Sun-sign rhythm for this cycle.' } },
  ja: { birthPrompt: '生年月日を入力すると四柱五行・十二支・星座の3つの視点で運勢が出ます。', birthDate: '生年月日', see: '運勢を見る',
    saju: '四柱の五行', animal: '十二支', sign: '星座',
    period: { today: '今日の運勢', weekly: '今週の運勢', monthly: '今月の運勢', yearly: '今年の運勢' },
    periodTag: { today: '今日', weekly: '今週', monthly: '今月', yearly: '今年' },
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    animals: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    signs: ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'], savedHint: '保存済み',
    focusIntro: { trinity: '三つの象徴体系を一緒に比較します。', saju: '四柱五行の周期的な流れに集中して読みます。', zodiac: '太陽星座の周期的な流れに集中して読みます。' } },
  zh: { birthPrompt: '输入出生日期，从四柱五行、生肖、星座三个角度查看运势。', birthDate: '出生日期', see: '查看运势',
    saju: '四柱五行', animal: '生肖', sign: '星座',
    period: { today: '今日运势', weekly: '本周运势', monthly: '本月运势', yearly: '今年运势' },
    periodTag: { today: '今日', weekly: '本周', monthly: '本月', yearly: '今年' },
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    animals: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    signs: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'], savedHint: '已保存',
    focusIntro: { trinity: '同时比较三个象征视角。', saju: '聚焦四柱五行在本周期的关键词。', zodiac: '聚焦太阳星座在本周期的关键词。' } },
  fr: { birthPrompt: 'Entrez votre date de naissance pour voir la fortune sous trois angles : cinq éléments Saju, zodiaque chinois et signe astral.', birthDate: 'Date de naissance', see: 'Voir',
    saju: 'Cinq éléments Saju', animal: 'Zodiaque chinois', sign: 'Signe astral',
    period: { today: "Aujourd'hui", weekly: 'Cette semaine', monthly: 'Ce mois', yearly: 'Cette année' },
    periodTag: { today: "aujourd'hui", weekly: 'cette semaine', monthly: 'ce mois', yearly: 'cette année' },
    elements: { wood: 'Bois', fire: 'Feu', earth: 'Terre', metal: 'Métal', water: 'Eau' },
    animals: ['Rat', 'Bœuf', 'Tigre', 'Lapin', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'],
    signs: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'], savedHint: 'enregistré',
    focusIntro: { trinity: 'Comparez les trois lectures symboliques ensemble.', saju: 'Concentrez-vous sur le rythme Saju des cinq éléments pour ce cycle.', zodiac: 'Concentrez-vous sur le rythme de votre signe solaire pour ce cycle.' } },
  es: { birthPrompt: 'Introduce tu fecha de nacimiento para ver la fortuna desde tres ángulos: cinco elementos Saju, zodiaco chino y signo.', birthDate: 'Fecha de nacimiento', see: 'Ver',
    saju: 'Cinco elementos Saju', animal: 'Zodiaco chino', sign: 'Signo',
    period: { today: 'Hoy', weekly: 'Esta semana', monthly: 'Este mes', yearly: 'Este año' },
    periodTag: { today: 'hoy', weekly: 'esta semana', monthly: 'este mes', yearly: 'este año' },
    elements: { wood: 'Madera', fire: 'Fuego', earth: 'Tierra', metal: 'Metal', water: 'Agua' },
    animals: ['Rata', 'Buey', 'Tigre', 'Conejo', 'Dragón', 'Serpiente', 'Caballo', 'Cabra', 'Mono', 'Gallo', 'Perro', 'Cerdo'],
    signs: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'], savedHint: 'guardado',
    focusIntro: { trinity: 'Compara las tres lecturas simbólicas juntas.', saju: 'Enfócate en el ritmo Saju de cinco elementos para este ciclo.', zodiac: 'Enfócate en el ritmo de tu signo solar para este ciclo.' } },
};

const ELEM_COLOR: Record<string, string> = { wood: '#16a34a', fire: '#dc2626', earth: '#ca8a04', metal: '#64748b', water: '#2563eb' };

export default function PeriodicFortune({ locale = 'ko', period = 'today', focus = 'trinity' }: { locale?: Locale; period?: Period; focus?: Focus }) {
  const t = L[locale] ?? L.en;
  const [birth, setBirth] = useState<{ y: number; m: number; d: number } | null>(null);
  const [dateInput, setDateInput] = useState('');

  // 온톨로지 프로필(생년월일)에서 자동 채움 — 재입력 제거.
  const { parsed, saveBirth } = useProfilePrefill();
  useEffect(() => {
    if (parsed) setBirth({ y: parsed.year, m: parsed.month, d: parsed.day });
  }, [parsed]);

  // 2026-08-25 impeccable critique P1: "See fortune" gave zero feedback when
  // clicked with no/invalid birth date — silent no-op. Disable the button
  // instead so the failure state is visible rather than discoverable only
  // by clicking and nothing happening.
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateInput);

  const submit = () => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput);
    if (!match) return;
    const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      setBirth({ y, m, d });
      saveBirth({ year: y, month: m, day: d }); // 다른 도구로 전파
    }
  };

  const result = useMemo(() => {
    if (!birth) return null;
    const elemIdx = elementOf(birth.y);
    const aIdx = animalOf(birth.y);
    const sIdx = signOf(birth.m, birth.d);
    const pk = periodKey(period);
    return {
      pk,
      saju: { el: FIVE_ELEMENTS[elemIdx], r: reading(elemIdx, period, `saju-${birth.y}`, locale) },
      // 12지신·별자리도 오행에 매핑해 어조를 달리(축을 바꿔 다른 문장이 나오게 base 다르게)
      animal: { idx: aIdx, r: reading((aIdx * 2 + 1) % 5, period, `animal-${aIdx}`, locale) },
      sign: { idx: sIdx, r: reading((sIdx + 2) % 5, period, `sign-${sIdx}`, locale) },
    };
  }, [birth, period, locale]);

  const Card = ({ title, color, r }: { title: string; color?: string; r: { opening: string; focus: string; advice: string } }) => (
    <div className="rounded-2xl border bg-card p-4" style={color ? { borderColor: color + '55' } : undefined}>
      <h3 className="text-sm font-black" style={color ? { color } : undefined}>{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed">{r.opening}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.focus}</p>
      <p className="mt-2 text-xs font-semibold text-primary">{r.advice}</p>
    </div>
  );

  if (!result) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{focus === 'trinity' ? t.birthPrompt : t.focusIntro[focus]}</p>
        <div className="space-y-3">
          <BirthDateField
            id="periodic-birth-date"
          locale={locale}
            label={t.birthDate}
            value={dateInput}
            onChange={setDateInput}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full"
          />
          <button
            onClick={submit}
            disabled={!isValidDate}
            className="h-12 w-full rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >{t.see}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">{t.period[period]}</h2>
        <span className="text-xs font-bold text-muted-foreground">{result.pk}</span>
      </div>
      {(focus === 'trinity' || focus === 'saju') && <Card title={`${t.saju} · ${t.elements[result.saju.el]}`} color={ELEM_COLOR[result.saju.el]} r={result.saju.r} />}
      {focus === 'trinity' && <Card title={`${t.animal} · ${t.animals[result.animal.idx]}`} r={result.animal.r} />}
      {(focus === 'trinity' || focus === 'zodiac') && <Card title={`${t.sign} · ${t.signs[result.sign.idx]}`} r={result.sign.r} />}
      <button onClick={() => setBirth(null)} className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-bold hover:bg-accent">↺</button>
    </div>
  );
}
