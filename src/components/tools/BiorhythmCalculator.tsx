import { useState, useMemo } from 'react';
import type { Locale } from '../../lib/i18n';

interface Props {
  locale: Locale;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PHYSICAL_PERIOD = 23;
const EMOTIONAL_PERIOD = 28;
const INTELLECTUAL_PERIOD = 33;

const UI = {
  title: {
    ko: '바이오리듬 계산기',
    en: 'Biorhythm Calculator',
    ja: 'バイオリズム計算機',
    zh: '生物节律计算器',
    fr: 'Calculateur de Biorythmes',
    es: 'Calculadora de Biorritmos',
  },
  birthDateLabel: {
    ko: '생년월일 입력',
    en: 'Enter Birth Date',
    ja: '生年月日を入力',
    zh: '输入出生日期',
    fr: 'Entrez votre date de naissance',
    es: 'Ingrese su fecha de nacimiento',
  },
  todayLabel: {
    ko: '오늘의 바이오리듬',
    en: "Today's Biorhythm",
    ja: '今日のバイオリズム',
    zh: '今日生物节律',
    fr: 'Biorythmes d\'Aujourd\'hui',
    es: 'Biorritmos de Hoy',
  },
  physical: {
    ko: '신체',
    en: 'Physical',
    ja: '身体',
    zh: '身体',
    fr: 'Physique',
    es: 'Físico',
  },
  emotional: {
    ko: '감성',
    en: 'Emotional',
    ja: '感情',
    zh: '情感',
    fr: 'Émotionnel',
    es: 'Emocional',
  },
  intellectual: {
    ko: '지성',
    en: 'Intellectual',
    ja: '知性',
    zh: '智力',
    fr: 'Intellectuel',
    es: 'Intelectual',
  },
  today: {
    ko: '오늘',
    en: 'Today',
    ja: '今日',
    zh: '今天',
    fr: 'Aujourd\'hui',
    es: 'Hoy',
  },
  placeholder: {
    ko: '생년월일을 선택하세요',
    en: 'Select your birth date',
    ja: '生年月日を選択してください',
    zh: '请选择您的出生日期',
    fr: 'Sélectionnez votre date de naissance',
    es: 'Seleccione su fecha de nacimiento',
  },
} as const;

type UIKey = keyof typeof UI;

function t(key: UIKey, locale: Locale): string {
  const map = UI[key] as Record<Locale, string>;
  return map[locale] ?? map['en'];
}

// ─── Interpretation texts ─────────────────────────────────────────────────────

function getInterpretation(physical: number, emotional: number, intellectual: number, locale: Locale): string {
  const high = 0.5;
  const low = -0.5;

  const physHigh = physical >= high;
  const emotHigh = emotional >= high;
  const intHigh = intellectual >= high;
  const physLow = physical <= low;
  const emotLow = emotional <= low;
  const intLow = intellectual <= low;

  const interps: Record<Locale, string[]> = {
    ko: [
      physHigh ? '신체 에너지가 높은 날입니다. 운동이나 활동적인 일을 하기 좋습니다.' : physLow ? '신체 에너지가 낮습니다. 충분한 휴식을 취하세요.' : '신체 상태가 안정적입니다.',
      emotHigh ? '감성이 풍부한 날입니다. 창작 활동이나 소통에 좋습니다.' : emotLow ? '감성이 예민할 수 있습니다. 마음의 여유를 가져보세요.' : '감성 상태가 균형잡혀 있습니다.',
      intHigh ? '지적 능력이 최고조입니다. 학습이나 문제 해결에 최적의 날입니다.' : intLow ? '집중력이 다소 떨어질 수 있습니다. 중요한 결정은 미루세요.' : '지적 상태가 안정적입니다.',
    ],
    en: [
      physHigh ? 'Physical energy is high today. Great for exercise and active tasks.' : physLow ? 'Physical energy is low. Make sure to rest well.' : 'Physical condition is stable.',
      emotHigh ? 'Emotionally rich day. Great for creative work and communication.' : emotLow ? 'Emotions may be sensitive. Take time to relax.' : 'Emotional state is balanced.',
      intHigh ? 'Intellectual capacity is at its peak. Ideal for learning and problem-solving.' : intLow ? 'Concentration may be reduced. Postpone important decisions.' : 'Intellectual state is stable.',
    ],
    ja: [
      physHigh ? '体のエネルギーが高い日です。運動や活動的な仕事に最適です。' : physLow ? '体のエネルギーが低いです。十分な休息を取りましょう。' : '身体状態は安定しています。',
      emotHigh ? '感情豊かな日です。創作活動やコミュニケーションに向いています。' : emotLow ? '感情が敏感になることがあります。心にゆとりを持ちましょう。' : '感情状態はバランスが取れています。',
      intHigh ? '知的能力が最高潮です。学習や問題解決に最適の日です。' : intLow ? '集中力がやや落ちることがあります。重要な決断は先送りしましょう。' : '知的状態は安定しています。',
    ],
    zh: [
      physHigh ? '今天身体能量很高，适合运动和活跃的工作。' : physLow ? '身体能量较低，请注意充分休息。' : '身体状态稳定。',
      emotHigh ? '今天情感丰富，适合创作活动和交流。' : emotLow ? '情绪可能较为敏感，放松心情。' : '情感状态平衡。',
      intHigh ? '智力能力达到峰值，是学习和解决问题的最佳时机。' : intLow ? '注意力可能有所下降，重要决定可以推迟。' : '智力状态稳定。',
    ],
    fr: [
      physHigh ? 'L\'énergie physique est élevée aujourd\'hui. Idéal pour l\'exercice.' : physLow ? 'L\'énergie physique est faible. Reposez-vous bien.' : 'La condition physique est stable.',
      emotHigh ? 'Journée émotionnellement riche. Parfait pour la créativité.' : emotLow ? 'Les émotions peuvent être sensibles. Prenez du temps pour vous détendre.' : 'L\'état émotionnel est équilibré.',
      intHigh ? 'La capacité intellectuelle est à son apogée. Idéal pour apprendre.' : intLow ? 'La concentration peut être réduite. Reportez les décisions importantes.' : 'L\'état intellectuel est stable.',
    ],
    es: [
      physHigh ? 'La energía física es alta hoy. Ideal para el ejercicio.' : physLow ? 'La energía física es baja. Descanse bien.' : 'La condición física es estable.',
      emotHigh ? 'Día emocionalmente rico. Perfecto para la creatividad.' : emotLow ? 'Las emociones pueden ser sensibles. Tómese tiempo para relajarse.' : 'El estado emocional está equilibrado.',
      intHigh ? 'La capacidad intelectual está en su apogeo. Ideal para aprender.' : intLow ? 'La concentración puede reducirse. Posponga decisiones importantes.' : 'El estado intelectual es estable.',
    ],
  };

  const lines = interps[locale] ?? interps['en'];
  return lines.join(' ');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcBiorhythm(daysSinceBirth: number): { physical: number; emotional: number; intellectual: number } {
  const TWO_PI = 2 * Math.PI;
  return {
    physical: Math.sin((TWO_PI / PHYSICAL_PERIOD) * daysSinceBirth),
    emotional: Math.sin((TWO_PI / EMOTIONAL_PERIOD) * daysSinceBirth),
    intellectual: Math.sin((TWO_PI / INTELLECTUAL_PERIOD) * daysSinceBirth),
  };
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

function formatDateShort(date: Date, locale: Locale): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (locale === 'ko') return `${month}/${day}`;
  if (locale === 'ja') return `${month}月${day}日`;
  if (locale === 'zh') return `${month}/${day}`;
  return `${month}/${day}`;
}

function toPercent(val: number): number {
  return Math.round(((val + 1) / 2) * 100);
}

// ─── SVG Chart ───────────────────────────────────────────────────────────────

const CHART_W = 300;
const CHART_H = 100;
const PAD_LEFT = 0;
const PAD_RIGHT = 0;
const PAD_TOP = 8;
const PAD_BOTTOM = 8;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;
const DAYS = 15; // -7 to +7

function valueToY(val: number): number {
  // val: -1 to 1 → y: PAD_TOP to PAD_TOP + PLOT_H
  return PAD_TOP + PLOT_H / 2 - (val * PLOT_H) / 2;
}

function dayToX(dayOffset: number): number {
  // dayOffset: -7 to +7 (index 0 to 14)
  const index = dayOffset + 7;
  return PAD_LEFT + (index / (DAYS - 1)) * PLOT_W;
}

interface ChartData {
  physical: number[];
  emotional: number[];
  intellectual: number[];
  birthDate: Date;
  today: Date;
}

function BiorhythmChart({ data, locale }: { data: ChartData; locale: Locale }) {
  const { physical, emotional, intellectual, today } = data;

  function buildPath(values: number[]): string {
    return values
      .map((v, i) => {
        const x = dayToX(i - 7);
        const y = valueToY(v);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  const physPath = buildPath(physical);
  const emotPath = buildPath(emotional);
  const intPath = buildPath(intellectual);
  const todayX = dayToX(0);
  const midY = valueToY(0);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full"
      style={{ display: 'block' }}
      aria-label="Biorhythm chart"
    >
      {/* Background */}
      <rect x={0} y={0} width={CHART_W} height={CHART_H} fill="#f8fafc" rx={6} />

      {/* Zero line */}
      <line
        x1={0}
        y1={midY}
        x2={CHART_W}
        y2={midY}
        stroke="#cbd5e1"
        strokeWidth={0.8}
        strokeDasharray="4 3"
      />

      {/* Today vertical line */}
      <line
        x1={todayX}
        y1={PAD_TOP}
        x2={todayX}
        y2={PAD_TOP + PLOT_H}
        stroke="#94a3b8"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* Today label */}
      <text x={todayX} y={PAD_TOP - 1} textAnchor="middle" fontSize={7} fill="#64748b">
        {t('today', locale)}
      </text>

      {/* Lines */}
      <path d={physPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={emotPath} fill="none" stroke="#ef4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={intPath} fill="none" stroke="#22c55e" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BiorhythmCalculator({ locale }: Props) {
  const [birthDate, setBirthDate] = useState<string>('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = today.toISOString().split('T')[0];
  const maxDate = todayStr;
  const minDate = '1900-01-01';

  const chartData = useMemo((): ChartData | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;

    const physical: number[] = [];
    const emotional: number[] = [];
    const intellectual: number[] = [];

    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const days = daysBetween(birth, date);
      if (days < 0) {
        physical.push(0);
        emotional.push(0);
        intellectual.push(0);
      } else {
        const bio = calcBiorhythm(days);
        physical.push(bio.physical);
        emotional.push(bio.emotional);
        intellectual.push(bio.intellectual);
      }
    }

    return { physical, emotional, intellectual, birthDate: birth, today };
  }, [birthDate, today]);

  const todayValues = useMemo(() => {
    if (!chartData) return null;
    const midIdx = 7; // index for offset=0
    return {
      physical: chartData.physical[midIdx],
      emotional: chartData.emotional[midIdx],
      intellectual: chartData.intellectual[midIdx],
    };
  }, [chartData]);

  const dateLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = -7; i <= 7; i += 7) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      labels.push(formatDateShort(d, locale));
    }
    return labels; // [-7, 0, +7]
  }, [today, locale]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen py-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-indigo-800 mb-6">
          {t('title', locale)}
        </h1>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            {t('birthDateLabel', locale)}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
          />
        </div>

        {todayValues && chartData && (
          <>
            {/* Today's values */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
              <h2 className="text-base font-semibold text-slate-700 mb-4">
                {t('todayLabel', locale)}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {/* Physical */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">{toPercent(todayValues.physical)}%</span>
                  </div>
                  <span className="text-xs text-slate-500">{t('physical', locale)}</span>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${toPercent(todayValues.physical)}%` }}
                    />
                  </div>
                </div>

                {/* Emotional */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">{toPercent(todayValues.emotional)}%</span>
                  </div>
                  <span className="text-xs text-slate-500">{t('emotional', locale)}</span>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${toPercent(todayValues.emotional)}%` }}
                    />
                  </div>
                </div>

                {/* Intellectual */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">{toPercent(todayValues.intellectual)}%</span>
                  </div>
                  <span className="text-xs text-slate-500">{t('intellectual', locale)}</span>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${toPercent(todayValues.intellectual)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
              <BiorhythmChart data={chartData} locale={locale} />
              {/* X axis labels */}
              <div className="flex justify-between mt-1 px-0">
                {dateLabels.map((label, i) => (
                  <span key={i} className="text-xs text-slate-400">{label}</span>
                ))}
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-blue-500 rounded" />
                  {t('physical', locale)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-red-500 rounded" />
                  {t('emotional', locale)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-green-500 rounded" />
                  {t('intellectual', locale)}
                </span>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-800 leading-relaxed">
              {getInterpretation(todayValues.physical, todayValues.emotional, todayValues.intellectual, locale)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
