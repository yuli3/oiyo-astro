import { useState, useMemo, useEffect, useRef } from 'react';
import { useProfilePrefill } from '../../lib/user/useProfilePrefill';
import type { Locale } from '../../lib/i18n';

interface Props {
  locale: Locale;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PHYSICAL_PERIOD = 23;
const EMOTIONAL_PERIOD = 28;
const INTELLECTUAL_PERIOD = 33;

const COLOR_PHYSICAL = '#00d4ff';
const COLOR_EMOTIONAL = '#ff006e';
const COLOR_INTELLECTUAL = '#00ff88';

// ─── UI strings ──────────────────────────────────────────────────────────────

const UI = {
  title: {
    ko: '바이오리듬 계산기',
    en: 'Biorhythm Calculator',
    ja: 'バイオリズム計算機',
    zh: '生物节律计算器',
    fr: 'Calculateur de Biorythmes',
    es: 'Calculadora de Biorritmos',
  },
  subtitle: {
    ko: '생명의 리듬 — DNA에 새겨진 세 가지 파동',
    en: 'Rhythms of Life — Three Waves Encoded in Your DNA',
    ja: '命のリズム — DNAに刻まれた三つの波',
    zh: '生命的节律 — 刻入DNA的三种波动',
    fr: 'Les Rythmes de Vie — Trois Ondes Gravées dans votre ADN',
    es: 'Ritmos de Vida — Tres Ondas Grabadas en tu ADN',
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
    ko: '오늘의 생체 에너지',
    en: "Today's Bio Energy",
    ja: '今日の生体エネルギー',
    zh: '今日生物能量',
    fr: "Énergie Bio d'Aujourd'hui",
    es: 'Energía Bio de Hoy',
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
    fr: "Aujourd'hui",
    es: 'Hoy',
  },
  helixLegend: {
    ko: '앞가닥 = 신체  •  뒷가닥 = 감성  •  가로대 = 지성',
    en: 'Front strand = Physical  •  Back strand = Emotional  •  Rungs = Intellectual',
    ja: '前鎖 = 身体  •  後鎖 = 感情  •  横棒 = 知性',
    zh: '前链 = 身体  •  后链 = 情感  •  横条 = 智力',
    fr: 'Brin avant = Physique  •  Brin arrière = Émotionnel  •  Barreaux = Intellectuel',
    es: 'Hebra delantera = Físico  •  Hebra trasera = Emocional  •  Peldaños = Intelectual',
  },
  analysisTitle: {
    ko: '오늘의 분석',
    en: "Today's Analysis",
    ja: '今日の分析',
    zh: '今日分析',
    fr: "Analyse d'Aujourd'hui",
    es: 'Análisis de Hoy',
  },
} as const;

type UIKey = keyof typeof UI;
type LocaleKey = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

function t(key: UIKey, locale: Locale): string {
  const map = UI[key] as Record<LocaleKey, string>;
  return (map as Record<string, string>)[locale] ?? map['en'];
}

// ─── Interpretation texts ─────────────────────────────────────────────────────

function getInterpretation(
  physical: number,
  emotional: number,
  intellectual: number,
  locale: Locale
): string {
  const high = 0.5;
  const low = -0.5;

  const physHigh = physical >= high;
  const emotHigh = emotional >= high;
  const intHigh = intellectual >= high;
  const physLow = physical <= low;
  const emotLow = emotional <= low;
  const intLow = intellectual <= low;

  const interps: Record<LocaleKey, string[]> = {
    ko: [
      physHigh
        ? '신체 에너지가 높은 날입니다. 운동이나 활동적인 일을 하기 좋습니다.'
        : physLow
          ? '신체 에너지가 낮습니다. 충분한 휴식을 취하세요.'
          : '신체 상태가 안정적입니다.',
      emotHigh
        ? '감성이 풍부한 날입니다. 창작 활동이나 소통에 좋습니다.'
        : emotLow
          ? '감성이 예민할 수 있습니다. 마음의 여유를 가져보세요.'
          : '감성 상태가 균형잡혀 있습니다.',
      intHigh
        ? '지적 능력이 최고조입니다. 학습이나 문제 해결에 최적의 날입니다.'
        : intLow
          ? '집중력이 다소 떨어질 수 있습니다. 중요한 결정은 미루세요.'
          : '지적 상태가 안정적입니다.',
    ],
    en: [
      physHigh
        ? 'Physical energy is high today. Great for exercise and active tasks.'
        : physLow
          ? 'Physical energy is low. Make sure to rest well.'
          : 'Physical condition is stable.',
      emotHigh
        ? 'Emotionally rich day. Great for creative work and communication.'
        : emotLow
          ? 'Emotions may be sensitive. Take time to relax.'
          : 'Emotional state is balanced.',
      intHigh
        ? 'Intellectual capacity is at its peak. Ideal for learning and problem-solving.'
        : intLow
          ? 'Concentration may be reduced. Postpone important decisions.'
          : 'Intellectual state is stable.',
    ],
    ja: [
      physHigh
        ? '体のエネルギーが高い日です。運動や活動的な仕事に最適です。'
        : physLow
          ? '体のエネルギーが低いです。十分な休息を取りましょう。'
          : '身体状態は安定しています。',
      emotHigh
        ? '感情豊かな日です。創作活動やコミュニケーションに向いています。'
        : emotLow
          ? '感情が敏感になることがあります。心にゆとりを持ちましょう。'
          : '感情状態はバランスが取れています。',
      intHigh
        ? '知的能力が最高潮です。学習や問題解決に最適の日です。'
        : intLow
          ? '集中力がやや落ちることがあります。重要な決断は先送りしましょう。'
          : '知的状態は安定しています。',
    ],
    zh: [
      physHigh
        ? '今天身体能量很高，适合运动和活跃的工作。'
        : physLow
          ? '身体能量较低，请注意充分休息。'
          : '身体状态稳定。',
      emotHigh
        ? '今天情感丰富，适合创作活动和交流。'
        : emotLow
          ? '情绪可能较为敏感，放松心情。'
          : '情感状态平衡。',
      intHigh
        ? '智力能力达到峰值，是学习和解决问题的最佳时机。'
        : intLow
          ? '注意力可能有所下降，重要决定可以推迟。'
          : '智力状态稳定。',
    ],
    fr: [
      physHigh
        ? "L'énergie physique est élevée aujourd'hui. Idéal pour l'exercice."
        : physLow
          ? "L'énergie physique est faible. Reposez-vous bien."
          : 'La condition physique est stable.',
      emotHigh
        ? 'Journée émotionnellement riche. Parfait pour la créativité.'
        : emotLow
          ? 'Les émotions peuvent être sensibles. Prenez du temps pour vous détendre.'
          : "L'état émotionnel est équilibré.",
      intHigh
        ? "La capacité intellectuelle est à son apogée. Idéal pour apprendre."
        : intLow
          ? 'La concentration peut être réduite. Reportez les décisions importantes.'
          : "L'état intellectuel est stable.",
    ],
    es: [
      physHigh
        ? 'La energía física es alta hoy. Ideal para el ejercicio.'
        : physLow
          ? 'La energía física es baja. Descanse bien.'
          : 'La condición física es estable.',
      emotHigh
        ? 'Día emocionalmente rico. Perfecto para la creatividad.'
        : emotLow
          ? 'Las emociones pueden ser sensibles. Tómese tiempo para relajarse.'
          : 'El estado emocional está equilibrado.',
      intHigh
        ? 'La capacidad intelectual está en su apogeo. Ideal para aprender.'
        : intLow
          ? 'La concentración puede reducirse. Posponga decisiones importantes.'
          : 'El estado intelectual es estable.',
    ],
  };

  const lines = (interps as Record<string, string[]>)[locale] ?? interps['en'];
  return lines.join(' ');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcBiorhythm(daysSinceBirth: number): {
  physical: number;
  emotional: number;
  intellectual: number;
} {
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

function toPercent(val: number): number {
  return Math.round(((val + 1) / 2) * 100);
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target, reducedMotion }: { target: number; reducedMotion: boolean }) {
  const [display, setDisplay] = useState(reducedMotion ? target : 0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(target);
      return;
    }
    const duration = 900;
    const startVal = 0;

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    startRef.current = null;
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, reducedMotion]);

  return <>{display}</>;
}

// ─── Circular Progress Card ──────────────────────────────────────────────────

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface RingCardProps {
  label: string;
  value: number; // -1 to 1
  color: string;
  reducedMotion: boolean;
}

function RingCard({ label, value, color, reducedMotion }: RingCardProps) {
  const pct = toPercent(value);
  const offset = RING_CIRCUMFERENCE * (1 - pct / 100);

  return (
    <div
      className="flex flex-col items-center gap-2 p-3 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}33`,
        boxShadow: `0 0 18px ${color}22`,
      }}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg
          width="80"
          height="80"
          viewBox="0 0 88 88"
          aria-hidden="true"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Track */}
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={reducedMotion ? offset : offset}
            transform="rotate(-90 44 44)"
            style={{
              transition: reducedMotion ? 'none' : 'stroke-dashoffset 0.9s cubic-bezier(0.33,1,0.68,1)',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color, textShadow: `0 0 10px ${color}` }}
          aria-label={`${label}: ${pct}%`}
        >
          <AnimatedCounter target={pct} reducedMotion={reducedMotion} />%
        </span>
      </div>
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: `${color}cc` }}>
        {label}
      </span>
    </div>
  );
}

// ─── DNA Helix SVG ───────────────────────────────────────────────────────────

const HELIX_W = 320;
const HELIX_H = 380;
const HELIX_CX = HELIX_W / 2;
const HELIX_AMPLITUDE = 72;
const HELIX_STEPS = 60;
const RUNG_INTERVAL = 6;

interface HelixPoint {
  x: number;
  y: number;
}

function buildHelixPoints(
  totalHeight: number,
  amplitude: number,
  steps: number,
  phaseOffset: number
): HelixPoint[] {
  const pts: HelixPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = t * totalHeight;
    const angle = t * 4 * Math.PI + phaseOffset;
    const x = HELIX_CX + amplitude * Math.sin(angle);
    pts.push({ x, y });
  }
  return pts;
}

function pointsToPath(pts: HelixPoint[]): string {
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');
}

interface DNAHelixProps {
  physicalToday: number;   // -1 to 1
  emotionalToday: number;  // -1 to 1
  intellectualToday: number; // -1 to 1
  scrollOffset: number;    // 0..1 animation progress
  locale: Locale;
  reducedMotion: boolean;
}

function DNAHelix({
  physicalToday,
  emotionalToday,
  intellectualToday,
  scrollOffset,
  locale,
  reducedMotion,
}: DNAHelixProps) {
  // Phase shift from scroll animation
  const phase = reducedMotion ? 0 : scrollOffset * 2 * Math.PI;

  const frontPts = buildHelixPoints(HELIX_H, HELIX_AMPLITUDE, HELIX_STEPS, phase);
  const backPts = buildHelixPoints(HELIX_H, HELIX_AMPLITUDE, HELIX_STEPS, phase + Math.PI);

  const frontPath = pointsToPath(frontPts);
  const backPath = pointsToPath(backPts);

  // Today marker: place at vertical center (50%)
  const todayY = HELIX_H * 0.5;
  const todayPhase = 0.5 * 4 * Math.PI + phase;
  const todayFrontX = HELIX_CX + HELIX_AMPLITUDE * Math.sin(todayPhase);
  const todayBackX = HELIX_CX + HELIX_AMPLITUDE * Math.sin(todayPhase + Math.PI);

  // Rungs
  const rungs: Array<{ x1: number; y1: number; x2: number; y2: number; intVal: number }> = [];
  for (let i = 0; i <= HELIX_STEPS; i += RUNG_INTERVAL) {
    const t = i / HELIX_STEPS;
    const y = t * HELIX_H;
    const angle = t * 4 * Math.PI + phase;
    const x1 = HELIX_CX + HELIX_AMPLITUDE * Math.sin(angle);
    const x2 = HELIX_CX + HELIX_AMPLITUDE * Math.sin(angle + Math.PI);

    // Map intellectual value to opacity for visual richness
    const intNorm = (intellectualToday + 1) / 2; // 0..1
    rungs.push({ x1, y1: y, x2, y2: y, intVal: intNorm });
  }

  const todayLabel = t('today', locale);

  return (
    <svg
      viewBox={`0 0 ${HELIX_W} ${HELIX_H}`}
      width="100%"
      style={{ display: 'block', maxWidth: HELIX_W, margin: '0 auto' }}
      aria-label="DNA double helix biorhythm visualization"
      role="img"
    >
      <defs>
        {/* Glow filters */}
        <filter id="glow-phys" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-emot" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-today" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Vertical fade mask */}
        <linearGradient id="fade-mask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="12%" stopColor="white" stopOpacity="1" />
          <stop offset="88%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="helix-fade">
          <rect x="0" y="0" width={HELIX_W} height={HELIX_H} fill="url(#fade-mask)" />
        </mask>
        {/* Grid dot pattern */}
        <pattern id="grid-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.7" fill="rgba(255,255,255,0.08)" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x="0" y="0" width={HELIX_W} height={HELIX_H} fill="url(#grid-dots)" />

      {/* Zero center axis */}
      <line
        x1={HELIX_CX}
        y1="0"
        x2={HELIX_CX}
        y2={HELIX_H}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      <g mask="url(#helix-fade)">
        {/* Back strand (emotional) — rendered first so front overlaps */}
        <path
          d={backPath}
          fill="none"
          stroke={COLOR_EMOTIONAL}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
          filter="url(#glow-emot)"
        />

        {/* Rungs (intellectual) */}
        {rungs.map((r, i) => {
          // Determine if this rung is "near" today marker
          const rungY = r.y1;
          const nearToday = Math.abs(rungY - todayY) < HELIX_H * 0.08;
          const rungColor = nearToday ? COLOR_INTELLECTUAL : `${COLOR_INTELLECTUAL}88`;
          return (
            <line
              key={i}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              stroke={rungColor}
              strokeWidth={nearToday ? 2.5 : 1.5}
              strokeLinecap="round"
              opacity={0.5 + r.intVal * 0.5}
            />
          );
        })}

        {/* Front strand (physical) — on top */}
        <path
          d={frontPath}
          fill="none"
          stroke={COLOR_PHYSICAL}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow-phys)"
        />

        {/* Today marker — back strand dot */}
        <circle
          cx={todayBackX}
          cy={todayY}
          r="5"
          fill={COLOR_EMOTIONAL}
          opacity="0.6"
        />

        {/* Today marker — front strand dot with pulse */}
        <circle
          cx={todayFrontX}
          cy={todayY}
          r="9"
          fill="none"
          stroke={COLOR_PHYSICAL}
          strokeWidth="2"
          opacity="0.4"
          style={
            reducedMotion
              ? {}
              : {
                  animation: 'helix-pulse 2s ease-in-out infinite',
                }
          }
        />
        <circle
          cx={todayFrontX}
          cy={todayY}
          r="5"
          fill={COLOR_PHYSICAL}
          filter="url(#glow-today)"
        />

        {/* Today label */}
        <text
          x={todayFrontX + 13}
          y={todayY + 5}
          fontSize="11"
          fontWeight="700"
          fill={COLOR_PHYSICAL}
          style={{ textShadow: `0 0 8px ${COLOR_PHYSICAL}` }}
        >
          {todayLabel}
        </text>

        {/* Physical value indicator bar on right */}
        {(() => {
          const barX = HELIX_W - 14;
          const barFullH = HELIX_H * 0.6;
          const barY = (HELIX_H - barFullH) / 2;
          const physNorm = (physicalToday + 1) / 2;
          const filledH = barFullH * physNorm;
          return (
            <>
              <rect
                x={barX}
                y={barY}
                width="5"
                height={barFullH}
                rx="2.5"
                fill="rgba(255,255,255,0.07)"
              />
              <rect
                x={barX}
                y={barY + barFullH - filledH}
                width="5"
                height={filledH}
                rx="2.5"
                fill={COLOR_PHYSICAL}
                opacity="0.8"
              />
            </>
          );
        })()}

        {/* Emotional value indicator bar on left */}
        {(() => {
          const barX = 9;
          const barFullH = HELIX_H * 0.6;
          const barY = (HELIX_H - barFullH) / 2;
          const emotNorm = (emotionalToday + 1) / 2;
          const filledH = barFullH * emotNorm;
          return (
            <>
              <rect
                x={barX}
                y={barY}
                width="5"
                height={barFullH}
                rx="2.5"
                fill="rgba(255,255,255,0.07)"
              />
              <rect
                x={barX}
                y={barY + barFullH - filledH}
                width="5"
                height={filledH}
                rx="2.5"
                fill={COLOR_EMOTIONAL}
                opacity="0.8"
              />
            </>
          );
        })()}
      </g>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BiorhythmCalculator({ locale }: Props) {
  const [birthDate, setBirthDate] = useState<string>('');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 온톨로지 프로필 생년월일 재사용 — 재입력 제거.
  const { parsed, saveBirth } = useProfilePrefill();
  useEffect(() => {
    if (parsed) setBirthDate((d) => d || `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`);
  }, [parsed]);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Detect reduced motion preference (client-only to avoid SSR mismatch)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = today.toISOString().split('T')[0];
  const maxDate = todayStr;
  const minDate = '1900-01-01';

  // Continuous helix scroll animation
  useEffect(() => {
    if (reducedMotion) return;

    function animate(ts: number) {
      if (startTimeRef.current === null) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) / 1000; // seconds
      // Full cycle every 8 seconds
      setScrollOffset((elapsed % 8) / 8);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [reducedMotion]);

  const chartData = useMemo(() => {
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
    const midIdx = 7;
    return {
      physical: chartData.physical[midIdx],
      emotional: chartData.emotional[midIdx],
      intellectual: chartData.intellectual[midIdx],
    };
  }, [chartData]);

  const keyframes = `
    @keyframes helix-pulse {
      0%, 100% { opacity: 0.4; r: 9; }
      50% { opacity: 0.15; r: 14; }
    }
    @keyframes card-appear {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          background: 'linear-gradient(160deg, #020818 0%, #050d2a 40%, #091022 70%, #030c1a 100%)',
          minHeight: '100vh',
          paddingTop: '2rem',
          paddingBottom: '3rem',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 1rem' }}>

          {/* Title */}
          <div className="text-center mb-6">
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: '#e0f7ff', letterSpacing: '0.02em' }}
            >
              {t('title', locale)}
            </h1>
            <p className="text-xs font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {t('subtitle', locale)}
            </p>
          </div>

          {/* Input Card */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,212,255,0.15)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 32px rgba(0,212,255,0.06)',
            }}
          >
            <label
              htmlFor="bio-birth-date"
              className="block text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: `${COLOR_PHYSICAL}aa` }}
            >
              {t('birthDateLabel', locale)}
            </label>
            <input
              id="bio-birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => {
                const v = e.target.value;
                setBirthDate(v);
                if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                  const [yy, mm, dd] = v.split('-').map(Number);
                  saveBirth({ year: yy, month: mm, day: dd });
                }
              }}
              min={minDate}
              max={maxDate}
              aria-label={t('birthDateLabel', locale)}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
              style={{
                background: 'rgba(0,212,255,0.07)',
                border: `1px solid ${COLOR_PHYSICAL}33`,
                color: '#e0f7ff',
                caretColor: COLOR_PHYSICAL,
                boxShadow: 'none',
              }}
            />
          </div>

          {todayValues && chartData && (
            <div
              style={{
                animation: reducedMotion ? 'none' : 'card-appear 0.5s ease both',
              }}
            >
              {/* Today's Energy Cards */}
              <div
                className="rounded-2xl p-5 mb-5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h2
                  className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {t('todayLabel', locale)}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <RingCard
                    label={t('physical', locale)}
                    value={todayValues.physical}
                    color={COLOR_PHYSICAL}
                    reducedMotion={reducedMotion}
                  />
                  <RingCard
                    label={t('emotional', locale)}
                    value={todayValues.emotional}
                    color={COLOR_EMOTIONAL}
                    reducedMotion={reducedMotion}
                  />
                  <RingCard
                    label={t('intellectual', locale)}
                    value={todayValues.intellectual}
                    color={COLOR_INTELLECTUAL}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>

              {/* DNA Helix Visualization */}
              <div
                className="rounded-2xl p-4 mb-5 overflow-hidden"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(0,212,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  boxShadow:
                    '0 0 40px rgba(0,212,255,0.05), inset 0 0 40px rgba(0,0,0,0.3)',
                }}
              >
                <DNAHelix
                  physicalToday={todayValues.physical}
                  emotionalToday={todayValues.emotional}
                  intellectualToday={todayValues.intellectual}
                  scrollOffset={scrollOffset}
                  locale={locale}
                  reducedMotion={reducedMotion}
                />
                {/* Legend */}
                <p
                  className="text-center text-xs font-bold mt-3"
                  style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }}
                >
                  {t('helixLegend', locale)}
                </p>
              </div>

              {/* Interpretation */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,255,136,0.12)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 24px rgba(0,255,136,0.05)',
                }}
              >
                <h3
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: `${COLOR_INTELLECTUAL}88` }}
                >
                  {t('analysisTitle', locale)}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(224,247,255,0.75)' }}
                >
                  {getInterpretation(
                    todayValues.physical,
                    todayValues.emotional,
                    todayValues.intellectual,
                    locale
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
