import { useEffect, useState } from 'react';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

export interface CourseStep {
  id: string;
  href: string;
  label: string;
}

interface Props {
  locale: string;
  /** journey key — also the localStorage namespace */
  journey: string;
  steps: CourseStep[];
}

const T: Record<Locale, { heading: string; progress: (d: number, t: number) => string; done: string; reset: string; complete: string }> = {
  ko: { heading: '이 여정의 코스', progress: (d, t) => `${d}/${t} 단계 완료`, done: '완료', reset: '처음부터', complete: '🎉 여정 완주! 다음 탐구로 이동해 보세요.' },
  en: { heading: 'Your course on this journey', progress: (d, t) => `${d}/${t} steps done`, done: 'Done', reset: 'Reset', complete: '🎉 Journey complete! Move on to the next exploration.' },
  ja: { heading: 'この旅のコース', progress: (d, t) => `${d}/${t} ステップ完了`, done: '完了', reset: 'リセット', complete: '🎉 旅を完走!次の探求へ進みましょう。' },
  zh: { heading: '本次旅程的课程', progress: (d, t) => `已完成 ${d}/${t} 步`, done: '完成', reset: '重新开始', complete: '🎉 旅程完成!前往下一站探索吧。' },
  fr: { heading: 'Votre parcours sur ce voyage', progress: (d, t) => `${d}/${t} étapes faites`, done: 'Fait', reset: 'Réinitialiser', complete: '🎉 Voyage accompli ! Passez à la prochaine exploration.' },
  es: { heading: 'Tu recorrido en este viaje', progress: (d, t) => `${d}/${t} pasos hechos`, done: 'Hecho', reset: 'Reiniciar', complete: '🎉 ¡Viaje completado! Pasa a la siguiente exploración.' },
};

/**
 * Self-checked course tracker for a journey landing (#33).
 * Progress lives only in localStorage — nothing is sent anywhere.
 */
export default function JourneyCourse({ locale, journey, steps }: Props) {
  const t = T[(locale as Locale)] ?? T.en;
  const storageKey = `oiyo-journey-${journey}`;
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw));
    } catch { /* private mode etc. */ }
    setLoaded(true);
  }, [storageKey]);

  const persist = (next: string[]) => {
    setDone(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggle = (id: string) =>
    persist(done.includes(id) ? done.filter((d) => d !== id) : [...done, id]);

  const count = steps.filter((s) => done.includes(s.id)).length;
  const pct = steps.length ? Math.round((count / steps.length) * 100) : 0;

  return (
    <div className="mt-6 rounded-2xl border border-green-200 bg-green-50/50 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-widest text-green-700">{t.heading}</p>
        <span className="text-xs font-bold text-green-500">{t.progress(count, steps.length)}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-green-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((s, i) => {
          const checked = done.includes(s.id);
          return (
            <li key={s.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={checked}
                aria-label={`${s.label} — ${t.done}`}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  checked ? 'border-green-500 bg-green-500 text-white' : 'border-green-300 bg-white text-green-300 hover:border-green-500'
                }`}
              >
                {checked ? '✓' : i + 1}
              </button>
              <a
                href={s.href}
                className={`text-sm font-medium transition-colors ${checked ? 'text-green-400 line-through' : 'text-green-900 hover:text-green-600'}`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
      {loaded && count === steps.length && steps.length > 0 && (
        <p className="mt-4 text-sm font-bold text-green-700">{t.complete}</p>
      )}
      {count > 0 && (
        <button
          type="button"
          onClick={() => persist([])}
          className="mt-3 text-xs text-green-400 underline underline-offset-2 hover:text-green-600"
        >
          {t.reset}
        </button>
      )}
    </div>
  );
}
