import { useState } from 'react'
import { useRecordFinishedTest } from '@/lib/user/use-record-finished-test'
import ShareResultButton from '../shared/ShareResultButton'

/**
 * 다섯 결 검사 엔진 — 열두 장면에서 다섯 선택지를 고르고, 한 유형으로 자르지
 * 않고 으뜸·버금과 다섯의 비율을 보여 준다.
 *
 * 우정 스타일 검사(FriendshipStyleTest)와 같은 모양이다. 2026-09-23 에 여행지
 * 끌림·음악 취향을 더하면서 화면을 한 벌로 모았다. 페이지는 **그 언어의 자료만**
 * 넘긴다 — 여섯 언어를 모두 섬(island) 속성으로 싣지 않는다.
 */

export interface FiveStyleResult {
  emoji: string
  title: string
  tagline: string
  description: string
  strengths: string[]
  watch: string[]
  /** 결과마다 덧붙이는 한 줄 — 여행지 예시, 넓혀 볼 음악 등 */
  extra: string
}

export interface FiveStyleCopy {
  title: string
  subtitle: string
  restart: string
  back: string
  primary: string
  secondary: string
  mix: string
  strengths: string
  watch: string
  extra: string
  note: string
  styleNames: string[]
  questions: { text: string; options: string[] }[]
  results: FiveStyleResult[]
}

export interface FiveStyleSpec {
  testId: string
  title: string
  /** 스타일 id — 선택지·결과·색과 같은 순서 */
  styles: string[]
  colors: string[]
  /** 기록 종류 — 성향 검사는 psychometric, 취향은 preference */
  kind?: 'psychometric' | 'preference'
}

interface Props {
  locale: string
  spec: FiveStyleSpec
  copy: FiveStyleCopy
  /** 기록에 남기는 영어 유형 이름 — 언어가 바뀌어도 같은 값으로 모인다 */
  englishNames: string[]
}

export default function FiveStyleTest({ locale, spec, copy, englishNames }: Props) {
  const [answers, setAnswers] = useState<number[]>([])
  const total = copy.questions.length
  const done = answers.length === total

  const scores = spec.styles.map((_, i) => answers.filter((a) => a === i).length)
  const ranked = spec.styles.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b)
  const primary = ranked[0]
  const secondary = ranked[1]

  useRecordFinishedTest({
    testId: spec.testId,
    title: spec.title,
    kind: spec.kind,
    finished: done,
    resultLabel: done ? copy.results[primary].title : undefined,
    result: done
      ? {
          primary: spec.styles[primary],
          secondary: spec.styles[secondary],
          primaryName: englishNames[primary],
          scores: Object.fromEntries(spec.styles.map((s, i) => [s, scores[i]])),
        }
      : undefined,
    locale,
  })

  if (!done) {
    const index = answers.length
    const q = copy.questions[index]
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{index + 1} / {total}</span>
            <span>{Math.round((index / total) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(index / total) * 100}%` }} />
          </div>
          <p className="text-base font-semibold text-foreground [word-break:keep-all]">{q.text}</p>
          <ul className="space-y-2">
            {q.options.map((label, i) => (
              <li key={label}>
                <button
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 text-foreground transition-colors hover:bg-accent [word-break:keep-all]"
                  onClick={() => setAnswers((prev) => [...prev, i])}
                  type="button"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          {index > 0 && (
            <button className="text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => setAnswers((prev) => prev.slice(0, -1))} type="button">
              ← {copy.back}
            </button>
          )}
        </div>
        <p className="text-center text-xs leading-6 text-muted-foreground [word-break:keep-all]">{copy.note}</p>
      </div>
    )
  }

  const r = copy.results[primary]
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{copy.primary}</p>
        <p className="mt-2 text-5xl">{r.emoji}</p>
        <h2 className="mt-2 text-2xl font-black text-foreground">{r.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
        <p className="mt-4 text-sm leading-7 text-foreground [word-break:keep-all]">{r.description}</p>
        {/* 버금은 점수가 실제로 있을 때만 적는다 — 0 점을 버금이라 부르면 없는 근거를 만든다. */}
        {scores[secondary] > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {copy.secondary} · <span className="font-bold text-foreground">{copy.styleNames[secondary]}</span>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground">{copy.mix}</h3>
        <ul className="mt-3 space-y-2">
          {ranked.map((i) => (
            <li key={spec.styles[i]} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground">{copy.styleNames[i]}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full" style={{ background: spec.colors[i], width: `${(scores[i] / total) * 100}%` }} />
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">{scores[i]}/{total}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-emerald-700">{copy.strengths}</h3>
          <ul className="mt-2 space-y-1.5">
            {r.strengths.map((s) => <li key={s} className="text-sm leading-6 text-muted-foreground [word-break:keep-all]">+ {s}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-amber-700">{copy.watch}</h3>
          <ul className="mt-2 space-y-1.5">
            {r.watch.map((s) => <li key={s} className="text-sm leading-6 text-muted-foreground [word-break:keep-all]">△ {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="text-sm font-bold text-primary">{copy.extra}</h3>
        <p className="mt-1 text-sm leading-6 text-foreground [word-break:keep-all]">{r.extra}</p>
      </div>

      <p className="text-center text-xs leading-6 text-muted-foreground [word-break:keep-all]">{copy.note}</p>

      <div className="flex gap-3">
        <button className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent" onClick={() => setAnswers([])} type="button">
          {copy.restart}
        </button>
      </div>
      <ShareResultButton locale={locale} heading={copy.title} resultTitle={`${r.emoji} ${r.title}`} description={r.description} />
    </div>
  )
}
