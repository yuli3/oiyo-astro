import { useState } from 'react';

import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { BUREOM, DAEBOREUM_LIMIT, DAEBOREUM_YEAR, makeDaeboreumCard, MOON_WISHES, type DaeboreumCard } from '@/lib/daeboreum';
import { recordTestResult } from '@/lib/user/test-results';

// 2027 정월대보름 부럼·달 소원 (ko 전용). 고른 것만 쓰고 이 브라우저 밖으로 보내지 않는다.

const chipBase = 'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold';

export default function DaeboreumMoon() {
  const [bureom, setBureom] = useState<string | null>(null);
  const [wish, setWish] = useState<string | null>(null);
  const [card, setCard] = useState<DaeboreumCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  function make() {
    setError(null);
    if (!bureom) {
      setError('깨물 부럼을 하나 골라 주세요.');
      return;
    }
    if (!wish) {
      setError('달에 빌 소원을 하나 골라 주세요.');
      return;
    }
    const c = makeDaeboreumCard(bureom, wish);
    setCard(c);
    recordTestResult({
      kind: 'other',
      testId: 'daeboreum-2027',
      title: '2027 정월대보름 부럼 카드',
      resultLabel: `${c.bureom.label} · ${c.wish.label}`,
      result: { bureom: c.bureom.id, wish: c.wish.id },
      locale: 'ko',
      sourcePath: '/ko/daeboreum-2027/',
    });
    gaEvent('daeboreum_card', { bureom: c.bureom.id, wish: c.wish.id });
    requestAnimationFrame(() => document.getElementById('daeboreum-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5" aria-label="부럼과 소원 고르기">
        <fieldset>
          <legend className="text-sm font-bold text-foreground">1. 깨물 부럼 하나</legend>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="부럼">
            {BUREOM.map((b) => {
              const on = bureom === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setBureom(b.id)}
                  className={`${chipBase} ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground'}`}
                >
                  <span aria-hidden="true">{b.emoji}</span>
                  {b.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-foreground">2. 보름달에 빌 소원 하나</legend>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="소원">
            {MOON_WISHES.map((w) => {
              const on = wish === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setWish(w.id)}
                  className={`${chipBase} ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground'}`}
                >
                  <span aria-hidden="true">{w.emoji}</span>
                  {w.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="button" onClick={make} className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
          {card ? '다시 빌기' : '부럼 깨물고 달에 빌기'}
        </button>
        {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
      </section>

      {card && (
        <section id="daeboreum-card" className="space-y-4" aria-live="polite">
          <div className="animate-fadeInUp rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center">
            <p className="text-xs font-bold tracking-widest text-primary">{DAEBOREUM_YEAR} 정월대보름 · 2월 21일</p>
            <p className="mt-4 text-5xl" aria-hidden="true">🌕</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">{card.wish.emoji} {card.wish.label}</h2>
            <p className="mt-2 text-base leading-7 text-foreground">{card.wish.line}</p>
            <p className="mt-4 rounded-xl bg-card p-3 text-left text-sm leading-6 text-foreground">
              <strong>{card.bureom.emoji} {card.bureom.label}을(를) 깨물며:</strong> {card.bureom.wish}
            </p>
            <p className="mt-3 text-sm font-bold text-primary">{card.heatLine}</p>
          </div>

          <ShareResultButton
            locale="ko"
            heading={`${DAEBOREUM_YEAR} 정월대보름 부럼 카드`}
            resultTitle={`${card.wish.emoji} ${card.wish.label}`}
            emoji="🌕"
            description={`${card.bureom.label} 부럼 · ${card.wish.line}`}
            analyticsId="daeboreum-2027"
          />

          <p className="rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground">{DAEBOREUM_LIMIT}</p>
        </section>
      )}
    </div>
  );
}
