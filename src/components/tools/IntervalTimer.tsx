import { useState, useEffect, useRef, useCallback } from 'react';
import type { Locale } from '../../i18n';

/**
 * Interval Timer — custom HIIT/Tabata-style timer: prep → (work → rest) × rounds.
 * Single atomic state for the timer to keep transitions robust. ko-first.
 */

type Phase = 'idle' | 'prep' | 'work' | 'rest' | 'done';
interface TimerState { phase: Phase; remaining: number; round: number; }

interface UiLabels {
  title: string; subtitle: string;
  prep: string; work: string; rest: string; rounds: string; sec: string;
  start: string; pause: string; resume: string; reset: string;
  round: string; done: string; ready: string;
  presetTabata: string; presetCustom: string;
}

const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '인터벌 운동 타이머', subtitle: '운동·휴식·세트를 직접 정해 따라 하세요. 타바타·HIIT·홈트에.',
    prep: '준비', work: '운동', rest: '휴식', rounds: '세트', sec: '초',
    start: '시작', pause: '일시정지', resume: '계속', reset: '초기화',
    round: '세트', done: '완료! 수고했어요 💪', ready: '설정하고 시작을 누르세요',
    presetTabata: '타바타(20/10×8)', presetCustom: '기본(40/20×5)',
  },
  en: {
    title: 'Interval Timer', subtitle: 'Set your own work/rest/rounds and follow along. For Tabata, HIIT, home workouts.',
    prep: 'Prep', work: 'Work', rest: 'Rest', rounds: 'Rounds', sec: 'sec',
    start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset',
    round: 'Round', done: 'Done! Great job 💪', ready: 'Set it and press Start',
    presetTabata: 'Tabata (20/10×8)', presetCustom: 'Default (40/20×5)',
  },
};

const PHASE_COLOR: Record<Phase, string> = {
  idle: 'bg-green-50 text-green-800',
  prep: 'bg-amber-100 text-amber-900',
  work: 'bg-green-600 text-white',
  rest: 'bg-green-100 text-green-900',
  done: 'bg-green-100 text-green-900',
};

interface Props { locale: Locale; }

export default function IntervalTimer({ locale }: Props) {
  const t = L[locale] ?? L.en!;

  const [prep, setPrep] = useState(10);
  const [work, setWork] = useState(40);
  const [rest, setRest] = useState(20);
  const [rounds, setRounds] = useState(5);

  const [st, setSt] = useState<TimerState>({ phase: 'idle', remaining: 0, round: 0 });
  const [running, setRunning] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const beep = useCallback((freq: number) => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioRef.current ?? new Ctx();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch { /* ignore */ }
  }, []);

  // single atomic tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSt((s) => {
        if (s.remaining > 1) {
          if (s.remaining <= 4) beep(660);
          return { ...s, remaining: s.remaining - 1 };
        }
        // remaining hits 0 → transition
        if (s.phase === 'prep') { beep(880); return { phase: 'work', remaining: work, round: 1 }; }
        if (s.phase === 'work') {
          if (s.round >= rounds) { beep(440); setRunning(false); return { phase: 'done', remaining: 0, round: s.round }; }
          beep(523); return { phase: 'rest', remaining: rest, round: s.round };
        }
        if (s.phase === 'rest') { beep(880); return { phase: 'work', remaining: work, round: s.round + 1 }; }
        return s;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, work, rest, rounds, beep]);

  const start = () => { setSt({ phase: 'prep', remaining: prep > 0 ? prep : 1, round: 0 }); setRunning(true); };
  const reset = () => { setRunning(false); setSt({ phase: 'idle', remaining: 0, round: 0 }); };

  const phaseLabel: Record<Phase, string> = { idle: t.ready, prep: t.prep, work: t.work, rest: t.rest, done: t.done };

  const numField = (label: string, val: number, set: (n: number) => void, min = 1) => (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-green-800">{label}</span>
      <input type="number" min={min} value={val} disabled={st.phase !== 'idle'}
        onChange={(e) => set(Math.max(min, parseInt(e.target.value, 10) || min))}
        className="mt-1 w-full rounded-md border border-green-200 bg-card px-3 py-2 text-green-900 disabled:opacity-50 focus:outline-2 focus:outline-green-500" />
    </label>
  );

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      <div className={`mt-5 rounded-2xl p-8 text-center transition-colors ${PHASE_COLOR[st.phase]}`}>
        <div className="text-sm font-bold uppercase tracking-widest opacity-80">
          {phaseLabel[st.phase]}{(st.phase === 'work' || st.phase === 'rest') ? ` · ${t.round} ${st.round}/${rounds}` : ''}
        </div>
        <div className="mt-2 font-mono text-6xl font-extrabold tabular-nums">
          {st.phase === 'idle' ? '—' : st.phase === 'done' ? '✓' : st.remaining}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {st.phase === 'idle' || st.phase === 'done' ? (
          <button type="button" onClick={start} className="flex-1 rounded-full bg-green-700 px-5 py-3 font-bold text-white hover:opacity-90">{t.start}</button>
        ) : (
          <button type="button" onClick={() => setRunning((v) => !v)} className="flex-1 rounded-full bg-green-700 px-5 py-3 font-bold text-white hover:opacity-90">{running ? t.pause : t.resume}</button>
        )}
        <button type="button" onClick={reset} className="rounded-full border border-green-200 bg-card px-5 py-3 font-semibold text-green-800 hover:border-green-400">{t.reset}</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={st.phase !== 'idle'} onClick={() => { setPrep(10); setWork(20); setRest(10); setRounds(8); }}
          className="rounded-full border border-green-200 bg-card px-3 py-1.5 text-xs font-semibold text-green-800 hover:border-green-400 disabled:opacity-50">{t.presetTabata}</button>
        <button type="button" disabled={st.phase !== 'idle'} onClick={() => { setPrep(10); setWork(40); setRest(20); setRounds(5); }}
          className="rounded-full border border-green-200 bg-card px-3 py-1.5 text-xs font-semibold text-green-800 hover:border-green-400 disabled:opacity-50">{t.presetCustom}</button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {numField(`${t.prep}(${t.sec})`, prep, setPrep, 0)}
        {numField(`${t.work}(${t.sec})`, work, setWork)}
        {numField(`${t.rest}(${t.sec})`, rest, setRest, 0)}
        {numField(t.rounds, rounds, setRounds)}
      </div>
    </div>
  );
}
