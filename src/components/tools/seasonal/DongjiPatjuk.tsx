import { useState } from 'react';

import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import {
  BRING_IN,
  DONGJI_KIND_LABEL,
  DONGJI_LIMIT,
  DONGJI_THIS_YEAR,
  makeDongjiCard,
  SEND_AWAY,
  type DongjiCard,
} from '@/lib/dongji';
import { recordTestResult } from '@/lib/user/test-results';

// 2026 동지 팥죽 한 해 정리 (ko 전용). 태어난 해와 고른 것만 쓰고 이 브라우저 밖으로 보내지 않는다.

const YEARS = Array.from({ length: 2026 - 1930 + 1 }, (_, i) => 2026 - i);
const selectClass = 'min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground';
const chipBase = 'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold';

export default function DongjiPatjuk() {
  const [year, setYear] = useState(1990);
  const [send, setSend] = useState<string[]>([]);
  const [bring, setBring] = useState<string | null>(null);
  const [card, setCard] = useState<DongjiCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSend(id: string) {
    setSend((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // 최대 두 개. 세 번째를 누르면 가장 먼저 고른 것을 내려놓는다.
      return [...prev, id].slice(-2);
    });
  }

  function make() {
    setError(null);
    if (send.length === 0) {
      setError('보낼 것을 하나 이상 골라 주세요.');
      return;
    }
    if (!bring) {
      setError('2027년에 들일 것을 하나 골라 주세요.');
      return;
    }
    const c = makeDongjiCard(year, send, bring);
    setCard(c);
    recordTestResult({
      kind: 'other',
      testId: 'dongji-2026',
      title: '2026 동지 팥죽 카드',
      resultLabel: `${c.bring.label} 들이기 · 새알심 ${c.count}알`,
      result: { send: c.send.map((s) => s.id).join(','), bring: c.bring.id },
      locale: 'ko',
      sourcePath: '/ko/dongji-2026/',
    });
    gaEvent('dongji_card', { bring: c.bring.id, send_count: String(c.send.length) });
    requestAnimationFrame(() => document.getElementById('dongji-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  const kind = card ? DONGJI_KIND_LABEL[card.kind] : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5" aria-label="팥죽 쑤기">
        <label className="block text-sm font-bold text-foreground">
          1. 태어난 해
          <select className={`${selectClass} mt-2`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
        </label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">새알심을 새해 나이만큼 빚어 넣어요.</p>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-foreground">2. 붉은 팥에 실어 보낼 올해의 것 (두 개까지)</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SEND_AWAY.map((c) => {
              const on = send.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSend(c.id)}
                  className={`${chipBase} ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground'}`}
                >
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-foreground">3. 2027년에 들일 것 (하나)</legend>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="2027년에 들일 것">
            {BRING_IN.map((c) => {
              const on = bring === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setBring(c.id)}
                  className={`${chipBase} ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground'}`}
                >
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="button" onClick={make} className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
          {card ? '팥죽 다시 쑤기' : '동지 팥죽 한 그릇 쑤기'}
        </button>
        {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
      </section>

      {card && kind && (
        <section id="dongji-card" className="space-y-4" aria-live="polite">
          <div className="animate-fadeInUp rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center">
            <p className="text-xs font-bold tracking-widest text-primary">{DONGJI_THIS_YEAR} 동지 · {kind.name}</p>
            <p className="mt-4 text-5xl" aria-hidden="true">🥣</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">{card.bring.emoji} 2027년엔 {card.bring.label}</h2>
            <p className="mt-2 text-base leading-7 text-foreground">{card.bring.line}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">팥에 실어 보낸 것</dt>
                <dd className="mt-1 text-sm font-bold text-foreground">{card.send.map((s) => `${s.emoji} ${s.label}`).join(', ')}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">새알심</dt>
                <dd className="mt-1 text-sm font-bold text-foreground">{card.count}알 (2027년 세는 나이)</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-card p-3 text-left text-sm leading-6 text-foreground">
              <strong>동지부터 설까지 해 볼 일:</strong> {card.bring.action}
            </p>
          </div>

          <ShareResultButton
            locale="ko"
            heading={`${DONGJI_THIS_YEAR} 동지 팥죽 카드`}
            resultTitle={`2027년엔 ${card.bring.label}`}
            emoji="🥣"
            description={`보낸 것: ${card.send.map((s) => s.label).join(', ')} · 새알심 ${card.count}알`}
            analyticsId="dongji-2026"
          />

          <p className="rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground">{DONGJI_LIMIT}</p>
        </section>
      )}
    </div>
  );
}
