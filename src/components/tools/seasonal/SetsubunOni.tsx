import { useState } from 'react';

import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { makeSetsubunCard, ONI, SETSUBUN_LIMIT, SETSUBUN_YEAR, type SetsubunCard } from '@/lib/setsubun';
import { recordTestResult } from '@/lib/user/test-results';

// 2027 節分 (ja 専用)。生年月日と選んだ鬼だけを使い、このブラウザの外に送らない。

const YEARS = Array.from({ length: 2026 - 1930 + 1 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const selectClass = 'min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground';
const chipBase = 'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold';

export default function SetsubunOni() {
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [oni, setOni] = useState<string | null>(null);
  const [card, setCard] = useState<SetsubunCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  function make() {
    setError(null);
    if (!oni) {
      setError('追い出したい鬼を1匹選んでください。');
      return;
    }
    if (new Date(year, month - 1, day).getDate() !== day) {
      setError('存在しない日付です。選び直してください。');
      return;
    }
    const c = makeSetsubunCard(oni, year, month, day);
    setCard(c);
    recordTestResult({
      kind: 'other',
      testId: 'setsubun-2027',
      title: '2027 節分カード',
      resultLabel: `${c.oni.label}は外 · 豆${c.beans}粒`,
      result: { oni: c.oni.id },
      locale: 'ja',
      sourcePath: '/ja/setsubun-2027/',
    });
    gaEvent('setsubun_card', { oni: c.oni.id });
    requestAnimationFrame(() => document.getElementById('setsubun-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5" aria-label="節分カードを作る">
        <p className="text-sm font-bold text-foreground">1. 生年月日(豆の数を数えます)</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="text-xs font-semibold text-muted-foreground">
            年
            <select className={`${selectClass} mt-1`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            月
            <select className={`${selectClass} mt-1`} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            日
            <select className={`${selectClass} mt-1`} value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-foreground">2. 今年追い出したい鬼</legend>
          <div className="mt-2 grid gap-2" role="radiogroup" aria-label="追い出したい鬼">
            {ONI.map((o) => {
              const on = oni === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setOni(o.id)}
                  className={`${chipBase} ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground'}`}
                >
                  <span aria-hidden="true">{o.emoji}</span>
                  <span>{o.label}</span>
                  <span className="text-xs font-normal">{o.meaning}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="button" onClick={make} className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
          {card ? 'もう一度まく' : '鬼は外!豆をまく'}
        </button>
        {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
      </section>

      {card && (
        <section id="setsubun-card" className="space-y-4" aria-live="polite">
          <div className="animate-fadeInUp rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center">
            <p className="text-xs font-bold tracking-widest text-primary">{SETSUBUN_YEAR}年 節分 · 2月3日</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">{card.oni.emoji} {card.oni.label}は外、福は内</h2>
            <p className="mt-2 text-base leading-7 text-foreground">追い出すもの: {card.oni.meaning}</p>
            <p className="mt-1 text-base leading-7 text-foreground">招く福: {card.oni.fuku}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">食べる豆</dt>
                <dd className="mt-1 text-lg font-black text-foreground">{card.beans}粒</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">恵方巻の向き</dt>
                <dd className="mt-1 text-lg font-black text-foreground">{card.ehou.name}</dd>
              </div>
            </dl>
          </div>

          <ShareResultButton
            locale="ja"
            heading={`${SETSUBUN_YEAR} 節分カード`}
            resultTitle={`${card.oni.label}は外、福は内`}
            emoji="👹"
            description={`招く福: ${card.oni.fuku} · 恵方 ${card.ehou.name}`}
            analyticsId="setsubun-2027"
          />

          <p className="rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground">{SETSUBUN_LIMIT}</p>
        </section>
      )}
    </div>
  );
}
