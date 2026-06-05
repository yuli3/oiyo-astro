import { useEffect, useMemo, useState } from 'react'

type SupportedLang = 'ko' | 'en' | 'ja'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  habitLabel: string
  placeholder: string
  completed: string
  reset: string
  week: string
  tip: string
}> = {
  ko: {
    title: '30일 습관형성 도우미',
    subtitle: '게으른 완벽주의와 무기력 회복을 위한 작은 행동 체크인입니다.',
    habitLabel: '내가 만들 습관',
    placeholder: '예: 매일 10분 산책, 침대 정리, 글 3줄 쓰기',
    completed: '완료',
    reset: '초기화',
    week: '주차',
    tip: '하루를 놓쳐도 실패가 아닙니다. 다음 체크인을 유지하는 것이 습관의 핵심입니다.',
  },
  en: {
    title: '30-Day Habit Formation Helper',
    subtitle: 'A small-action check-in for lazy perfectionism and low-energy recovery.',
    habitLabel: 'Habit to build',
    placeholder: 'Example: walk 10 minutes, make the bed, write 3 lines',
    completed: 'done',
    reset: 'Reset',
    week: 'week',
    tip: 'Missing a day is not failure. Returning to the next check-in is the habit.',
  },
  ja: {
    title: '30日習慣形成ヘルパー',
    subtitle: '怠けた完璧主義と無気力回復のための小さな行動チェックインです。',
    habitLabel: '作りたい習慣',
    placeholder: '例: 10分散歩、ベッドを整える、3行書く',
    completed: '完了',
    reset: 'リセット',
    week: '週',
    tip: '1日抜けても失敗ではありません。次のチェックインに戻ることが習慣です。',
  },
}

const DAYS: Record<SupportedLang, string[]> = {
  ko: [
    '2분만 해보기', '시작 시간을 고정하기', '완료 기준을 낮추기', '방해 요소 하나 치우기', '성공 후 바로 기록하기',
    '실패해도 재개 문장 쓰기', '첫 주 회고하기', '습관을 기존 루틴 뒤에 붙이기', '준비물을 전날 보이게 두기', '10분 버전 실행하기',
    '완벽 대신 반복 횟수 세기', '나를 방해한 생각 적기', '도움 되는 환경 하나 만들기', '2주차 회고하기', '보상 하나 정하기',
    '하기 싫은 감정을 허용하기', '가장 쉬운 버전으로 낮추기', '타인에게 진행 상황 말하기', '실행 전 심호흡 3회', '놓친 날 복구하기',
    '3주차 회고하기', '80점 완료 연습하기', '습관의 이유 다시 쓰기', '방해 시간대 피하기', '작은 확장 1개 더하기',
    '결과보다 출석률 보기', '나에게 맞는 시간 확정하기', '30일 이후 규칙 만들기', '가장 큰 방해요인 정리하기', '다음 30일 선택하기',
  ],
  en: [
    'Try only 2 minutes', 'Fix the start time', 'Lower the done standard', 'Remove one blocker', 'Record immediately after finishing',
    'Write a restart sentence after missing', 'Review week one', 'Attach the habit after an existing routine', 'Place supplies in sight the night before', 'Run the 10-minute version',
    'Count repetitions, not perfection', 'Name the thought that blocked you', 'Build one helpful environment cue', 'Review week two', 'Choose one reward',
    'Allow the feeling of not wanting to', 'Shrink to the easiest version', 'Tell someone your progress', 'Take three breaths before starting', 'Recover a missed day',
    'Review week three', 'Practice an 80 percent finish', 'Rewrite your reason for the habit', 'Avoid your blocker time window', 'Add one tiny expansion',
    'Look at attendance, not outcome', 'Confirm your best time of day', 'Make the after-30-days rule', 'Name your biggest blocker', 'Choose the next 30 days',
  ],
  ja: [
    '2分だけ試す', '開始時間を固定する', '完了基準を下げる', '邪魔を1つ片づける', '終わったらすぐ記録する',
    '抜けた日の再開文を書く', '1週目を振り返る', '既存ルーティンの後につける', '前日に道具を見える場所へ置く', '10分版を実行する',
    '完璧より回数を数える', '邪魔した考えを書く', '助けになる環境を1つ作る', '2週目を振り返る', 'ごほうびを1つ決める',
    'やりたくない感情を許す', '一番簡単な形に下げる', '進捗を誰かに伝える', '開始前に深呼吸3回', '抜けた日を回復する',
    '3週目を振り返る', '80点完了を練習する', '習慣の理由を書き直す', '妨害される時間帯を避ける', '小さな拡張を1つ足す',
    '結果より出席率を見る', '自分に合う時間を確定する', '30日後のルールを作る', '最大の妨げを整理する', '次の30日を選ぶ',
  ],
}

interface Props { locale?: string }

export default function HabitFormationAssistant({ locale: rawLocale = 'ko' }: Props) {
  const locale = lang(rawLocale)
  const labels = LABELS[locale]
  const storageKey = `oiyo-habit-helper-${locale}`
  const [habit, setHabit] = useState('')
  const [checked, setChecked] = useState<boolean[]>(Array.from({ length: 30 }, () => false))

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as { habit?: string; checked?: boolean[] }
      setHabit(parsed.habit ?? '')
      setChecked(Array.from({ length: 30 }, (_, i) => Boolean(parsed.checked?.[i])))
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ habit, checked }))
  }, [habit, checked, storageKey])

  const count = checked.filter(Boolean).length
  const percent = Math.round((count / 30) * 100)
  const days = DAYS[locale]
  const weeks = useMemo(() => [0, 1, 2, 3, 4].map((week) => days.slice(week * 6, week * 6 + 6)), [days])

  function toggle(index: number) {
    setChecked((current) => current.map((value, i) => i === index ? !value : value))
  }

  function reset() {
    setHabit('')
    setChecked(Array.from({ length: 30 }, () => false))
    window.localStorage.removeItem(storageKey)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-green-950">{labels.title}</h1>
        <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-bold text-green-900">{labels.habitLabel}</span>
        <input
          value={habit}
          onChange={(event) => setHabit(event.target.value)}
          placeholder={labels.placeholder}
          className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-green-950">{count}/30 {labels.completed}</span>
          <span className="text-green-700 font-bold">{percent}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="space-y-4">
        {weeks.map((weekDays, weekIndex) => (
          <section key={weekIndex} className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-green-600">{weekIndex + 1} {labels.week}</h2>
            <div className="grid gap-2">
              {weekDays.map((task, dayOffset) => {
                const dayIndex = weekIndex * 6 + dayOffset
                return (
                  <button
                    key={task}
                    onClick={() => toggle(dayIndex)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${checked[dayIndex] ? 'border-green-200 bg-green-50 text-green-900' : 'bg-white hover:bg-accent'}`}
                  >
                    <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-bold ${checked[dayIndex] ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                      {dayIndex + 1}
                    </span>
                    <span>{task}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="rounded-xl border border-green-100 bg-green-50 p-4 text-xs leading-relaxed text-green-800">{labels.tip}</p>
      <button onClick={reset} className="w-full rounded-xl border bg-card px-4 py-3 text-sm font-bold hover:bg-accent">{labels.reset}</button>
    </div>
  )
}
