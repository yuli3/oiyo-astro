import { useState } from 'react';
import solarlunar from 'solarlunar';

import ShareResultButton from '../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { castTojeong, TOJEONG_YEAR, type TojeongResult } from '@/lib/tojeong';
import { recordTestResult } from '@/lib/user/test-results';
import {
  TOJEONG_FAMILY_LABELS,
  TOJEONG_LIMIT,
  TOJEONG_LOWER,
  TOJEONG_LUCKY_COLOR,
  TOJEONG_LUCKY_ITEM,
  TOJEONG_MIDDLE,
  TOJEONG_UPPER,
  tojeongLuckyMonth,
} from '@/data/tojeong-readings';

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

interface FamilyEntry {
  label: string;
  code: string;
  phrase: string;
  keyword: string;
  month: string;
}

const STEPS = ['상괘', '중괘', '하괘'] as const;
// 2026-11-11: 상괘 1~8 장면 그림(Grok Build).
const UPPER_SCENES = ['thaw', 'lamp', 'sail', 'well', 'mountain', 'ox', 'house', 'view'] as const;

const selectClass = 'min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground';

export default function TojeongFortune() {
  const [calendar, setCalendar] = useState<'lunar' | 'solar'>('lunar');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TojeongResult | null>(null);
  const [converted, setConverted] = useState<string | null>(null);
  // 괘를 한 장씩 펼친다: 1 상괘, 2 중괘, 3 하괘(전부).
  const [revealed, setRevealed] = useState(0);
  const [family, setFamily] = useState<FamilyEntry[]>([]);
  const [familyLabel, setFamilyLabel] = useState<string>(TOJEONG_FAMILY_LABELS[0]);
  const [addedCode, setAddedCode] = useState<string | null>(null);

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
      setRevealed(1);
      setAddedCode(null);
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

  function reveal(step: number) {
    setRevealed(step);
    gaEvent('tojeong_reveal', { step: String(step) });
  }

  function addToFamily() {
    if (!result || !upper) return;
    const entry: FamilyEntry = {
      label: familyLabel,
      code: result.code,
      phrase: upper.phrase,
      keyword: upper.keyword,
      month: tojeongLuckyMonth(result.upper.value, result.middle.value, result.lower.value),
    };
    setFamily((prev) => [...prev, entry].slice(-9));
    setAddedCode(result.code);
    gaEvent('tojeong_family_add', { size: String(family.length + 1) });
  }

  function castAnother() {
    setResult(null);
    setRevealed(0);
    setConverted(null);
    const next = TOJEONG_FAMILY_LABELS.find((l) => l !== familyLabel && !family.some((f) => f.label === l));
    if (next) setFamilyLabel(next);
    document.getElementById('tojeong-form')?.scrollIntoView({ block: 'start' });
  }

  const upper = result ? TOJEONG_UPPER[result.upper.value] : null;
  const middle = result ? TOJEONG_MIDDLE[result.middle.value] : null;
  const lower = result ? TOJEONG_LOWER[result.lower.value] : null;

  return (
    <div className="space-y-6">
      <section id="tojeong-form" className="rounded-2xl border border-border bg-card p-5" aria-label="생년월일 입력">
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
          {result ? '다시 뽑기' : `${TOJEONG_YEAR} 토정비결 괘 뽑기`}
        </button>
        {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
      </section>

      {result && upper && middle && lower && (
        <section className="space-y-4" aria-live="polite">
          <ol className="flex justify-center gap-2" aria-label="펼친 괘">
            {STEPS.map((name, i) => (
              <li
                key={name}
                className={`rounded-full border px-3 py-1 text-xs font-bold ${revealed > i ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
              >
                {name} {revealed > i ? [result.upper.value, result.middle.value, result.lower.value][i] : '?'}
              </li>
            ))}
          </ol>

          <div className="animate-fadeInUp rounded-2xl border border-border bg-card p-6 text-center">
            <img src={`/images/grok-20261106/oiyo-illustration-tojeong-2027-upper-${result.upper.value}-${UPPER_SCENES[result.upper.value - 1]}.webp`} alt="" width="1200" height="800" loading="lazy" decoding="async" className="mb-4 w-full rounded-xl object-cover" />
            <p className="text-xs font-bold tracking-widest text-primary">{TOJEONG_YEAR} 정미년 · 상괘 {result.upper.value}</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">{upper.phrase}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{upper.gloss}</p>
            <p className="mt-4 text-left text-base leading-7 text-foreground">{upper.body}</p>
            {converted && <p className="mt-3 text-left text-xs text-muted-foreground">{converted}</p>}
          </div>

          {revealed === 1 && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => reveal(2)} className="min-h-12 flex-1 rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
                중괘 펼치기 · 올해의 사람과 일
              </button>
              <button type="button" onClick={() => reveal(3)} className="min-h-12 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground">
                한 번에 보기
              </button>
            </div>
          )}

          {revealed >= 2 && (
            <div className="animate-fadeInUp rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-bold text-foreground">중괘 {result.middle.value} · 사람과 일 · {middle.title}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground">{middle.people}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{middle.work}</p>
            </div>
          )}

          {revealed === 2 && (
            <button type="button" onClick={() => reveal(3)} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
              하괘 펼치기 · 한 해를 맺는 법
            </button>
          )}

          {revealed >= 3 && (
            <>
              <div className="animate-fadeInUp rounded-2xl border border-border bg-card p-5">
                <h3 className="text-lg font-bold text-foreground">하괘 {result.lower.value} · 한 해를 맺는 법 · {lower.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground">{lower.flow}</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{lower.advice}</p>
              </div>

              <div className="animate-fadeInUp rounded-2xl border border-primary/40 bg-primary/5 p-5">
                <p className="text-xs font-bold tracking-widest text-primary">재미로 뽑은 2027 행운 카드 · {result.code}괘</p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <dt className="text-xs text-muted-foreground">행운의 달</dt>
                    <dd className="mt-1 text-lg font-black text-foreground">{tojeongLuckyMonth(result.upper.value, result.middle.value, result.lower.value)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">행운의 색</dt>
                    <dd className="mt-1 text-lg font-black text-foreground">{TOJEONG_LUCKY_COLOR[result.upper.value].name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">행운의 물건</dt>
                    <dd className="mt-1 text-lg font-black text-foreground">{TOJEONG_LUCKY_ITEM[result.middle.value].name}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  {TOJEONG_LUCKY_COLOR[result.upper.value].why}이 올해의 색이에요. {TOJEONG_LUCKY_ITEM[result.middle.value].tip}
                </p>
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

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-lg font-bold text-foreground">가족 토정비결판</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  설에 둘러앉아 한 사람씩 뽑아 보세요. 이름표만 남기고 생년월일은 남기지 않아요.
                </p>
                <div className="mt-3 flex gap-2">
                  <label className="sr-only" htmlFor="tojeong-family-label">이 결과의 주인</label>
                  <select id="tojeong-family-label" className={selectClass} value={familyLabel} onChange={(e) => setFamilyLabel(e.target.value)}>
                    {TOJEONG_FAMILY_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={addToFamily}
                    disabled={addedCode === result.code}
                    className="min-h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
                  >
                    {addedCode === result.code ? '올렸어요' : '판에 올리기'}
                  </button>
                </div>
                {family.length > 0 && (
                  <>
                    <ul className="mt-4 divide-y divide-border">
                      {family.map((f, i) => (
                        <li key={`${f.label}-${i}`} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                          <span className="font-bold text-foreground">{f.label}</span>
                          <span className="flex-1 text-foreground">{f.phrase}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{f.keyword} · {f.month}</span>
                        </li>
                      ))}
                    </ul>
                    {family.length >= 2 && (
                      <p className="mt-3 rounded-xl bg-surface-subtle p-3 text-sm leading-6 text-foreground">
                        우리 집 2027 키워드: <strong>{[...new Set(family.map((f) => f.keyword))].join(' · ')}</strong>
                      </p>
                    )}
                  </>
                )}
                <button type="button" onClick={castAnother} className="mt-3 min-h-11 w-full rounded-xl border border-border px-4 text-sm font-semibold text-foreground">
                  다른 사람 것 뽑기
                </button>
              </div>

              <p className="rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground">{TOJEONG_LIMIT}</p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
