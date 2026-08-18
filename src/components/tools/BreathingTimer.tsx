import { useState, useEffect, useCallback, useRef } from 'react';
import type { Locale } from '../../lib/i18n';

interface Props {
  locale: Locale;
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

interface BreathPattern {
  nameKey: string;
  name: Record<Locale, string>;
  desc: Record<Locale, string>;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const PATTERNS: BreathPattern[] = [
  {
    nameKey: '4-7-8',
    name: {
      ko: '4-7-8 (불면증)',
      en: '4-7-8 (Insomnia)',
      ja: '4-7-8 (不眠)',
      zh: '4-7-8 (失眠)',
      fr: '4-7-8 (Insomnie)',
      es: '4-7-8 (Insomnio)',
    },
    desc: {
      ko: '수면 유도에 효과적',
      en: 'Effective for sleep induction',
      ja: '睡眠誘導に効果的',
      zh: '有效诱导睡眠',
      fr: 'Efficace pour induire le sommeil',
      es: 'Efectivo para inducir el sueño',
    },
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
  },
  {
    nameKey: 'box',
    name: {
      ko: '박스 호흡 (집중)',
      en: 'Box Breathing (Focus)',
      ja: 'ボックス呼吸 (集中)',
      zh: '盒式呼吸 (专注)',
      fr: 'Respiration en Boîte (Concentration)',
      es: 'Respiración en Caja (Concentración)',
    },
    desc: {
      ko: '집중력과 평정심 향상',
      en: 'Improves focus and calm',
      ja: '集中力と平静心の向上',
      zh: '提高专注力和平静心',
      fr: 'Améliore la concentration et le calme',
      es: 'Mejora el enfoque y la calma',
    },
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  {
    nameKey: 'diaphragm',
    name: {
      ko: '복식 호흡 (기본)',
      en: 'Diaphragmatic (Basic)',
      ja: '腹式呼吸 (基本)',
      zh: '腹式呼吸 (基本)',
      fr: 'Respiration Abdominale (Base)',
      es: 'Respiración Diafragmática (Básica)',
    },
    desc: {
      ko: '기본 이완 호흡',
      en: 'Basic relaxation breathing',
      ja: '基本的なリラックス呼吸',
      zh: '基本放松呼吸',
      fr: 'Respiration de relaxation de base',
      es: 'Respiración de relajación básica',
    },
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
  },
  {
    nameKey: '3-3-3',
    name: {
      ko: '3-3-3 (공황)',
      en: '3-3-3 (Panic)',
      ja: '3-3-3 (パニック)',
      zh: '3-3-3 (恐慌)',
      fr: '3-3-3 (Panique)',
      es: '3-3-3 (Pánico)',
    },
    desc: {
      ko: '공황 발작 즉각 완화',
      en: 'Immediate panic relief',
      ja: 'パニック発作の即時緩和',
      zh: '立即缓解恐慌发作',
      fr: 'Soulagement immédiat de la panique',
      es: 'Alivio inmediato del pánico',
    },
    inhale: 3,
    holdIn: 3,
    exhale: 3,
    holdOut: 0,
  },
  {
    nameKey: '2-4',
    name: {
      ko: '2-4 (빠른 진정)',
      en: '2-4 (Quick Calm)',
      ja: '2-4 (クイックカーム)',
      zh: '2-4 (快速平静)',
      fr: '2-4 (Calme Rapide)',
      es: '2-4 (Calma Rápida)',
    },
    desc: {
      ko: '빠르게 안정 찾기',
      en: 'Find calm quickly',
      ja: 'すばやく安定を取り戻す',
      zh: '快速恢复平静',
      fr: 'Retrouver le calme rapidement',
      es: 'Encontrar calma rápidamente',
    },
    inhale: 2,
    holdIn: 0,
    exhale: 4,
    holdOut: 0,
  },
];

const PHASE_LABELS: Record<Phase, Record<Locale, string>> = {
  inhale: {
    ko: '들숨',
    en: 'Inhale',
    ja: '吸う',
    zh: '吸气',
    fr: 'Inspirer',
    es: 'Inhalar',
  },
  'hold-in': {
    ko: '참기',
    en: 'Hold',
    ja: '保持',
    zh: '保持',
    fr: 'Retenir',
    es: 'Sostener',
  },
  exhale: {
    ko: '날숨',
    en: 'Exhale',
    ja: '吐く',
    zh: '呼气',
    fr: 'Expirer',
    es: 'Exhalar',
  },
  'hold-out': {
    ko: '참기',
    en: 'Hold',
    ja: '保持',
    zh: '保持',
    fr: 'Retenir',
    es: 'Sostener',
  },
  idle: {
    ko: '준비',
    en: 'Ready',
    ja: '準備',
    zh: '准备',
    fr: 'Prêt',
    es: 'Listo',
  },
};

const UI_LABELS = {
  start: {
    ko: '시작',
    en: 'Start',
    ja: 'スタート',
    zh: '开始',
    fr: 'Démarrer',
    es: 'Iniciar',
  },
  pause: {
    ko: '정지',
    en: 'Pause',
    ja: '一時停止',
    zh: '暂停',
    fr: 'Pause',
    es: 'Pausar',
  },
  reset: {
    ko: '리셋',
    en: 'Reset',
    ja: 'リセット',
    zh: '重置',
    fr: 'Réinitialiser',
    es: 'Reiniciar',
  },
  cycles: {
    ko: '완료 사이클',
    en: 'Cycles',
    ja: 'サイクル',
    zh: '循环次数',
    fr: 'Cycles',
    es: 'Ciclos',
  },
  pattern: {
    ko: '호흡 패턴',
    en: 'Breathing Pattern',
    ja: '呼吸パターン',
    zh: '呼吸模式',
    fr: 'Modèle de Respiration',
    es: 'Patrón de Respiración',
  },
  title: {
    ko: '쉼 호흡 타이머',
    en: 'Breathing Timer',
    ja: '呼吸タイマー',
    zh: '呼吸计时器',
    fr: 'Minuteur de Respiration',
    es: 'Temporizador de Respiración',
  },
} as const;

function t(label: Record<Locale, string>, locale: Locale): string {
  return label[locale] ?? label['en'];
}

function getPhaseSequence(pattern: BreathPattern): { phase: Phase; duration: number }[] {
  const seq: { phase: Phase; duration: number }[] = [];
  if (pattern.inhale > 0) seq.push({ phase: 'inhale', duration: pattern.inhale });
  if (pattern.holdIn > 0) seq.push({ phase: 'hold-in', duration: pattern.holdIn });
  if (pattern.exhale > 0) seq.push({ phase: 'exhale', duration: pattern.exhale });
  if (pattern.holdOut > 0) seq.push({ phase: 'hold-out', duration: pattern.holdOut });
  return seq;
}

export default function BreathingTimer({ locale }: Props) {
  const [selectedPattern, setSelectedPattern] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [circleScale, setCircleScale] = useState(0.5);

  const phaseIndexRef = useRef(0);
  const timeLeftRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cyclesRef = useRef(0);

  const pattern = PATTERNS[selectedPattern];
  const sequence = getPhaseSequence(pattern);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setIsRunning(false);
    setPhase('idle');
    setCountdown(0);
    setCycles(0);
    cyclesRef.current = 0;
    phaseIndexRef.current = 0;
    timeLeftRef.current = 0;
    setCircleScale(0.5);
  }, [stopTimer]);

  const startPhase = useCallback((index: number) => {
    const { phase: p, duration } = sequence[index];
    phaseIndexRef.current = index;
    timeLeftRef.current = duration;
    setPhase(p);
    setCountdown(duration);
    if (p === 'inhale') setCircleScale(1);
    else if (p === 'exhale') setCircleScale(0.3);
    else setCircleScale(p === 'hold-in' ? 1 : 0.3);
  }, [sequence]);

  useEffect(() => {
    if (!isRunning) return;

    // start first phase
    startPhase(phaseIndexRef.current);

    intervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setCountdown(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        const nextIndex = phaseIndexRef.current + 1;
        if (nextIndex >= sequence.length) {
          // completed one cycle
          cyclesRef.current += 1;
          setCycles(cyclesRef.current);
          startPhase(0);
        } else {
          startPhase(nextIndex);
        }
      }
    }, 1000);

    return () => stopTimer();
  }, [isRunning, startPhase, sequence, stopTimer]);

  const handleStartPause = () => {
    if (isRunning) {
      stopTimer();
      setIsRunning(false);
    } else {
      if (phase === 'idle') {
        phaseIndexRef.current = 0;
      }
      setIsRunning(true);
    }
  };

  const handlePatternChange = (index: number) => {
    resetTimer();
    setSelectedPattern(index);
  };

  // Circle size: min 120px, max 220px
  const circleSize = 120 + circleScale * 100;
  const transitionDuration = phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : 0.3;

  const phaseColor: Record<Phase, string> = {
    inhale: 'from-teal-400 to-cyan-500',
    'hold-in': 'from-blue-400 to-green-500',
    exhale: 'from-sky-400 to-blue-500',
    'hold-out': 'from-slate-400 to-slate-500',
    idle: 'from-teal-300 to-cyan-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-teal-800 mb-6">
          {t(UI_LABELS.title, locale)}
        </h1>

        {/* Pattern Selector */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-3">
            {t(UI_LABELS.pattern, locale)}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {PATTERNS.map((p, i) => (
              <button
                key={p.nameKey}
                onClick={() => handlePatternChange(i)}
                className={`text-left px-4 py-2.5 rounded-xl transition-all text-sm ${
                  selectedPattern === i
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-teal-100'
                }`}
              >
                <span className="font-semibold">{t(p.name, locale)}</span>
                <span className={`ml-2 text-xs ${selectedPattern === i ? 'text-teal-100' : 'text-slate-400'}`}>
                  {t(p.desc, locale)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex flex-col items-center justify-center py-8">
          {/* Outer glow ring */}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: `${circleSize + 40}px`,
              height: `${circleSize + 40}px`,
              transition: `all ${transitionDuration}s ease-in-out`,
            }}
          >
            {/* Animated circle */}
            <div
              className={`rounded-full bg-gradient-to-br ${phaseColor[phase]} shadow-lg flex flex-col items-center justify-center`}
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                transition: `all ${transitionDuration}s ease-in-out`,
                boxShadow: phase === 'inhale' || phase === 'hold-in'
                  ? '0 0 40px rgba(20,184,166,0.4)'
                  : '0 0 20px rgba(56,189,248,0.2)',
              }}
            >
              <span className="text-white text-lg font-semibold drop-shadow">
                {phase === 'idle' ? t(PHASE_LABELS.idle, locale) : t(PHASE_LABELS[phase], locale)}
              </span>
              {countdown > 0 && (
                <span className="text-white text-3xl font-bold drop-shadow">
                  {countdown}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cycle Counter */}
        <div className="text-center mb-6">
          <span className="text-slate-500 text-sm">
            {t(UI_LABELS.cycles, locale)}: <span className="font-bold text-teal-600 text-lg">{cycles}</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-xl font-semibold text-white shadow-sm transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-teal-500 hover:bg-teal-600'
            }`}
          >
            {isRunning ? t(UI_LABELS.pause, locale) : t(UI_LABELS.start, locale)}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all"
          >
            {t(UI_LABELS.reset, locale)}
          </button>
        </div>

        {/* Pattern info */}
        <div className="mt-6 bg-white/60 backdrop-blur rounded-2xl p-4 shadow-sm">
          <div className="flex justify-center gap-6 text-sm text-slate-600">
            {sequence.map(({ phase: p, duration }) => (
              <div key={p} className="flex flex-col items-center gap-1">
                <span className="font-bold text-teal-600 text-lg">{duration}s</span>
                <span>{t(PHASE_LABELS[p], locale)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
