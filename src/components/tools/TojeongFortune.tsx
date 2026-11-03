import { useState } from 'react';
import solarlunar from 'solarlunar';

import ShareResultButton from '../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { castTojeong, TOJEONG_YEAR, type TojeongResult } from '@/lib/tojeong';
import { recordTestResult } from '@/lib/user/test-results';
import { TOJEONG_LIMIT, TOJEONG_LOWER, TOJEONG_MIDDLE, TOJEONG_UPPER } from '@/data/tojeong-readings';

// 2027 토정비결 (ko 전용). 생년월일만 받고 이 브라우저 밖으로 보내지 않는다.

const YEARS = Array.from({ length: 2020 - 1930 + 1 }, (_, i) => 2020 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const PART_LABEL: Record<string, string> = {
  age: '세는 나이',
  taese: '2027 정미년 태세수',
  monthDays: '2027년 그 달 날수',
  wolgeon: '월건수',
  day: '생일',
  iljin: '일진수',
};

const selectClass = 'min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground';

export default function TojeongFortune() {
  const [calendar, setCalendar] = useState<'lunar' | 'solar'>('lunar');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TojeongResult | null>(null);
  const [converted, setConverted] = useState<string | null>(null);

  function cast() {
    setError(null);
    let lunar = { year, month, day };
    let note: string | null = null;
    if (calendar === 'solar') {
      // solarlunar 는 중국 달력 기준이라 드물게 한국 음력과 하루 어긋난다. 화면에 알린다.
      const l = solarlunar.solar2lunar(year, month, day);
      if (l === -1 || new Date(year, month - 1, day).getDate() !== day) {
        setError('없는 날짜예요. 다시 골라 주세요.');
        return;
      }
      lunar = { year: l.lYear, month: l.lMonth, day: l.lDay };
      note = `음력 ${l.lYear}년 ${l.isLeap ? '윤' : ''}${l.lMonth}월 ${l.lDay}일로 바꿔 계산했어요.`;
    } else if (day > 30) {
      setError('음력은 30일까지 있어요.');
      return;
    }
    try {
      const r = castTojeong(lunar);
      setResult(r);
      setConverted(note);
      const upper = TOJEONG_UPPER[r.upper.value];
      recordTestResult({
        kind: 'fortune',
        testId: 'tojeong-2027',
        title: '2027 토정비결',
        resultLabel: `${r.code}괘 · ${upper.phrase}`,
        result: { code: r.code },
        locale: 'ko',
        sourcePath: '/ko/tojeong-2027/',
      });
      gaEvent('tojeong_cast', { code: r.code });
    } catch {
      setError('생년월일을 다시 확인해 주세요.');
    }
  }

  const upper = result ? TOJEONG_UPPER[result.upper.value] : null;
  const middle = result ? TOJEONG_MIDDLE[result.middle.value] : null;
  const lower = result ? TOJEONG_LOWER[result.lower.value] : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5" aria-label="생년월일 입력">
        <div className="flex gap-2" role="radiogroup" aria-label="달력">
          {(['lunar', 'solar'] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={calendar === c}
              onClick={() => setCalendar(c)}
              className={`min-h-11 flex-1 rounded-xl border px-4 text-sm font-bold ${calendar === c ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground'}`}
            >
              {c === 'lunar' ? '음력 생일' : '양력 생일'}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <label className="text-xs font-semibold text-muted-foreground">
            년
            <select className={`${selectClass} mt-1`} value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            월
            <select className={`${selectClass} mt-1`} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            일
            <select className={`${selectClass} mt-1`} value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>
        {calendar === 'lunar' && <p className="mt-2 text-xs leading-5 text-muted-foreground">윤달에 태어났다면 같은 숫자의 본달로 고르세요. 토정비결은 윤달생을 본달로 봐요.</p>}
        <button type="button" onClick={cast} className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
          {TOJEONG_YEAR} 토정비결 보기
        </button>
        {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
      </section>

      {result && upper && middle && lower && (
        <section className="space-y-4" aria-live="polite">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-xs font-bold tracking-widest text-primary">{TOJEONG_YEAR} 정미년 · {result.code}괘</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">{upper.phrase}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{upper.gloss}</p>
            <p className="mt-4 text-left text-base leading-7 text-foreground">{upper.body}</p>
            {converted && <p className="mt-3 text-left text-xs text-muted-foreground">{converted}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-bold text-foreground">사람과 일 · {middle.title}</h3>
            <p className="mt-2 text-sm leading-6 text-foreground">{middle.people}</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{middle.work}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-bold text-foreground">한 해를 맺는 법 · {lower.title}</h3>
            <p className="mt-2 text-sm leading-6 text-foreground">{lower.flow}</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{lower.advice}</p>
          </div>

          <details className="rounded-2xl border border-border bg-surface-subtle p-5">
            <summary className="cursor-pointer text-sm font-bold text-foreground">괘는 이렇게 나왔어요</summary>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {([['상괘', result.upper, 8], ['중괘', result.middle, 6], ['하괘', result.lower, 3]] as const).map(([name, part, div]) => (
                <li key={name}>
                  {name}: {part.parts.map((p) => `${PART_LABEL[p.label]} ${p.value}`).join(' + ')} = {part.sum}, {div}로 나눈 나머지 → <strong className="text-foreground">{part.value}</strong>
                </li>
              ))}
              <li>2027년 생월 월건 {result.monthGanzhi} · 생일 일진 {result.dayGanzhi}{result.dayClamped ? ' (2027년 그 달은 29일까지라 29일로 봤어요)' : ''}</li>
            </ul>
          </details>

          <ShareResultButton
            locale="ko"
            heading={`${TOJEONG_YEAR} 토정비결`}
            resultTitle={upper.phrase}
            emoji="📜"
            description={`${result.code}괘 · ${upper.gloss} · 키워드 ${upper.keyword}`}
            analyticsId="tojeong-2027"
          />
          <p className="rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground">{TOJEONG_LIMIT}</p>
        </section>
      )}
    </div>
  );
}
