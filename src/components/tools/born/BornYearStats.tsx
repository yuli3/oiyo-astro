import { useMemo, useState } from 'react';

import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { BIRTH_YEARS, BORN_FIRST, BORN_LAST, formatBirths, makeBornYearCard, type BornYearCard } from '@/lib/born-year';
import { recordTestResult } from '@/lib/user/test-results';

// 내가 태어난 해 출생아 통계 (ko 전용). 고른 해만 쓰고 이 브라우저 밖으로 보내지 않는다.

const YEARS = Array.from({ length: BORN_LAST - BORN_FIRST + 1 }, (_, i) => BORN_LAST - i);
const MAX = Math.max(...BIRTH_YEARS.map((b) => b.births));
const W = 600;
const H = 180;
const BAR = W / BIRTH_YEARS.length;

export default function BornYearStats() {
  const [year, setYear] = useState(1990);
  const [card, setCard] = useState<BornYearCard | null>(null);
  const preview = useMemo(() => makeBornYearCard(year), [year]);

  function make() {
    const c = makeBornYearCard(year);
    setCard(c);
    recordTestResult({
      kind: 'other',
      testId: 'born-year-kr',
      title: '내가 태어난 해 출생아 통계',
      resultLabel: `${c.data.year}년생 ${formatBirths(c.data)} · ${c.rank}위`,
      result: { year: String(c.data.year) },
      locale: 'ko',
      sourcePath: '/ko/born-year/',
    });
    gaEvent('born_year_card', { decade: String(c.decade.from) });
    requestAnimationFrame(() => document.getElementById('born-year-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  const shown = card ?? preview;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5" aria-label="태어난 해 고르기">
        <label className="block text-sm font-bold text-foreground">
          태어난 해
          <select
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
        </label>

        <figure className="mt-5">
          <svg viewBox={`0 0 ${W} ${H + 22}`} className="h-auto w-full" role="img" aria-label={`1950~2024년 출생아 수 막대그래프, ${year}년 강조`}>
            {BIRTH_YEARS.map((b, i) => {
              const h = (b.births / MAX) * H;
              const on = b.year === year;
              return (
                <rect
                  key={b.year}
                  x={i * BAR + 0.5}
                  y={H - h}
                  width={BAR - 1}
                  height={h}
                  className={on ? 'fill-primary' : 'fill-muted-foreground/30'}
                  onClick={() => setYear(b.year)}
                >
                  <title>{`${b.year}년 ${formatBirths(b)}`}</title>
                </rect>
              );
            })}
            {[1950, 1970, 1990, 2010, 2024].map((y, i, arr) => (
              <text
                key={y}
                x={i === 0 ? 0 : i === arr.length - 1 ? W : (y - BORN_FIRST) * BAR + BAR / 2}
                y={H + 16}
                textAnchor={i === 0 ? 'start' : i === arr.length - 1 ? 'end' : 'middle'}
                className="fill-muted-foreground text-sm"
              >
                {y}
              </text>
            ))}
          </svg>
          <figcaption className="mt-1 text-xs text-muted-foreground">
            {year}년 출생아 <strong className="text-foreground">{formatBirths(preview.data)}</strong> · 75해 중 {preview.rank}위
          </figcaption>
        </figure>

        <button type="button" onClick={make} className="mt-5 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
          {card ? '이 해로 다시 만들기' : '내 출생 연도 카드 만들기'}
        </button>
      </section>

      {card && (
        <section id="born-year-card" className="space-y-4" aria-live="polite">
          <div className="animate-fadeInUp rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center">
            <p className="text-xs font-bold tracking-widest text-primary">{shown.data.year}년생 · {shown.animal.emoji} {shown.animal.name}띠</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">그해 {formatBirths(shown.data)}이 태어났어요</h2>
            <p className="mt-2 text-base leading-7 text-foreground">
              1950~2024년 75해 가운데 <strong>{shown.rank}번째</strong>로 많이 태어난 해, 2024년의 <strong>{shown.vsLatest}배</strong>예요.
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">합계출산율</dt>
                <dd className="mt-1 text-lg font-black text-foreground">{shown.data.tfr != null ? `${shown.data.tfr}명` : '자료 없음'}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">{shown.decade.from}년대 한 해 평균</dt>
                <dd className="mt-1 text-lg font-black text-foreground">{Math.round(shown.decade.avg / 10000)}만 명</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">가장 많이 태어난 해</dt>
                <dd className="mt-1 text-sm font-bold text-foreground">{shown.peak.year}년 · {formatBirths(shown.peak)}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">가장 적게 태어난 해</dt>
                <dd className="mt-1 text-sm font-bold text-foreground">{shown.low.year}년 · {formatBirths(shown.low)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">띠는 양력 해 기준이에요. 설(음력 1월 1일) 전에 태어났다면 앞 해 띠예요.</p>
          </div>

          <ShareResultButton
            locale="ko"
            heading="내가 태어난 해 출생아 통계"
            resultTitle={`${shown.data.year}년생 동갑 ${formatBirths(shown.data)}`}
            emoji={shown.animal.emoji}
            description={`75해 중 ${shown.rank}위 · 2024년의 ${shown.vsLatest}배`}
            analyticsId="born-year-kr"
          />
        </section>
      )}
    </div>
  );
}
