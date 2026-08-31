import { useEffect, useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'
import { decodeResult, writeResultHash } from '../../lib/result-permalink'
import { gaEvent } from '../../lib/analytics/ga-event'
import { Questionnaire } from '@/components/ui/questionnaire'

// T6/#32 permalink tool id — must stay stable, it is embedded in shared URLs.
const PERMALINK_TOOL_ID = 'workaholic-test'
interface PermalinkState { answers: number[] }

type SupportedLang = 'ko' | 'en' | 'ja'
type WorkLevel = 'balanced' | 'engaged' | 'driven' | 'workaholic'
type Subscale = 'compulsion' | 'intrusion'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question {
  id: string
  subscale: Subscale
  reverse: boolean
  text: string
}

interface LevelData {
  icon: string; title: string; description: string; tips: string[]
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string; share: string; shareMsg: string
  yourScore: string; overallLabel: string; compulsionLabel: string; intrusionLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '워커홀릭(일중독) 자가진단',
    subtitle: '나의 일중독 지수는 몇 점일까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 일중독 지수는',
    yourScore: '나의 일중독 지수',
    overallLabel: '종합 일중독 지수',
    compulsionLabel: '강박적 몰입',
    intrusionLabel: '일-삶 침범',
    outOf: '/ 5.0',
    tipsLabel: '회복을 위한 팁',
    note: '버겐 일중독 척도(BWAS, Andreassen 외, 2012)의 7가지 중독 요소를 바탕으로 한 자가성찰용 테스트입니다. 의학적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Workaholism Self-Test',
    subtitle: 'How high is your work addiction score?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My workaholism score is',
    yourScore: 'Your Workaholism Score',
    overallLabel: 'Overall Workaholism Score',
    compulsionLabel: 'Inner Compulsion',
    intrusionLabel: 'Work-Life Intrusion',
    outOf: '/ 5.0',
    tipsLabel: 'Recovery Tips',
    note: 'This self-reflection test is based on the seven addiction components of the Bergen Work Addiction Scale (BWAS, Andreassen et al., 2012). It does not replace professional or medical assessment.',
  },
  ja: {
    title: 'ワーカホリック（仕事依存）自己診断',
    subtitle: '私の仕事依存度は何点？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の仕事依存度は',
    yourScore: 'あなたの仕事依存度',
    overallLabel: '総合仕事依存度',
    compulsionLabel: '強迫的な没頭',
    intrusionLabel: '仕事の生活侵食',
    outOf: '/ 5.0',
    tipsLabel: '回復のためのヒント',
    note: 'このテストはバーゲン仕事依存尺度（BWAS, Andreassen他, 2012）の7つの依存要素に基づく自己省察用です。医学的診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<WorkLevel, Record<SupportedLang, LevelData>> = {
  balanced: {
    ko: {
      icon: '🌿',
      title: '균형형',
      description: '일과 삶의 경계가 건강하게 유지되고 있습니다. 일에 몰입하면서도 쉴 때는 충분히 쉴 수 있습니다.',
      tips: [
        '지금의 건강한 경계를 의식적으로 지켜 나가세요.',
        '바쁜 시즌이 와도 휴식 루틴을 먼저 캘린더에 고정하세요.',
        '주변에 일-삶 균형을 모델링해 좋은 영향을 주세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Balanced',
      description: 'You maintain a healthy boundary between work and life. You can engage deeply at work yet fully rest when it is time to.',
      tips: [
        'Consciously protect the healthy boundaries you already have.',
        'When busy seasons come, schedule rest into your calendar first.',
        'Model work-life balance for the people around you.',
      ],
    },
    ja: {
      icon: '🌿',
      title: 'バランス型',
      description: '仕事と生活の境界が健康的に保たれています。仕事に没頭しつつ、休む時はしっかり休めます。',
      tips: [
        '今ある健康的な境界を意識して守りましょう。',
        '忙しい時期が来ても、まず休息をカレンダーに固定しましょう。',
        '周囲にワークライフバランスを示して良い影響を与えましょう。',
      ],
    },
  },
  engaged: {
    ko: {
      icon: '🔥',
      title: '열정 몰입형',
      description: '일에 대한 열정이 높고 몰입도가 강합니다. 아직 건강한 범위에 있지만, 회복 시간이 줄어들지 않는지 살펴볼 시점입니다.',
      tips: [
        '하루 중 "일 생각 금지" 구간을 한 개라도 정해 보세요.',
        '열정과 강박을 구분하세요 — 안 하면 불안한지, 즐거운지.',
        '주 1회는 완전히 로그아웃하는 날을 만들어 보세요.',
      ],
    },
    en: {
      icon: '🔥',
      title: 'Engaged',
      description: 'You are highly passionate and deeply engaged in work. You are still in a healthy range, but it is worth checking that your recovery time is not shrinking.',
      tips: [
        'Set at least one daily window where thinking about work is off-limits.',
        'Distinguish passion from compulsion — does stopping feel anxious or relaxing?',
        'Create one fully logged-off day each week.',
      ],
    },
    ja: {
      icon: '🔥',
      title: '情熱没頭型',
      description: '仕事への情熱が高く没頭度が強いです。まだ健康的な範囲ですが、回復時間が減っていないか確認する時期です。',
      tips: [
        '一日の中で「仕事のことを考えない」時間帯を一つ決めましょう。',
        '情熱と強迫を区別しましょう — 止めると不安か、楽しいか。',
        '週1回は完全にログオフする日を作りましょう。',
      ],
    },
  },
  driven: {
    ko: {
      icon: '⚠️',
      title: '과몰입 경계형',
      description: '일중독 경향이 뚜렷하게 나타납니다. 일이 다른 영역을 침범하기 시작했을 수 있어, 의식적인 회복 루틴이 필요합니다.',
      tips: [
        '업무 종료 시각을 정하고 알람으로 강제 종료하세요.',
        '취미·운동·관계 등 "일이 아닌 정체성"을 한 가지 회복하세요.',
        '죄책감이나 불안을 일로 덮고 있지 않은지 점검하세요.',
      ],
    },
    en: {
      icon: '⚠️',
      title: 'Over-Engaged',
      description: 'Clear workaholic tendencies show up. Work may be starting to intrude on other areas of life, so you need deliberate recovery routines.',
      tips: [
        'Set a hard stop time for work and let an alarm enforce it.',
        'Recover one "non-work identity" — a hobby, exercise, or relationship.',
        'Check whether you are covering guilt or anxiety with work.',
      ],
    },
    ja: {
      icon: '⚠️',
      title: '過没頭警戒型',
      description: '仕事依存の傾向がはっきり表れています。仕事が他の領域を侵食し始めている可能性があり、意識的な回復ルーティンが必要です。',
      tips: [
        '仕事の終了時刻を決め、アラームで強制終了しましょう。',
        '趣味・運動・人間関係など「仕事以外の自分」を一つ取り戻しましょう。',
        '罪悪感や不安を仕事で覆っていないか点検しましょう。',
      ],
    },
  },
  workaholic: {
    ko: {
      icon: '🚨',
      title: '일중독 위험형',
      description: 'BWAS 기준에서 위험 수준에 해당합니다. 일을 줄이려 해도 잘 안 되고, 건강·관계·휴식이 희생되고 있을 가능성이 높습니다.',
      tips: [
        '혼자 조절이 어렵다면 전문가(상담·산업보건)의 도움을 받으세요.',
        '"일을 안 할 때 느끼는 불안"의 정체를 들여다보세요.',
        '신뢰하는 사람에게 나의 근무 시간을 솔직히 공유하고 점검받으세요.',
      ],
    },
    en: {
      icon: '🚨',
      title: 'At-Risk Workaholic',
      description: 'You fall in the at-risk range on the BWAS criteria. Cutting back is hard, and your health, relationships, or rest are likely being sacrificed.',
      tips: [
        'If self-regulation is hard, seek professional help (counseling, occupational health).',
        'Look into what the anxiety you feel when not working is really about.',
        'Honestly share your working hours with someone you trust for accountability.',
      ],
    },
    ja: {
      icon: '🚨',
      title: '仕事依存リスク型',
      description: 'BWASの基準でリスク水準に該当します。仕事を減らそうとしても難しく、健康・人間関係・休息が犠牲になっている可能性が高いです。',
      tips: [
        '一人で調整が難しい場合は専門家（カウンセリング・産業保健）の助けを求めましょう。',
        '「仕事をしない時に感じる不安」の正体を見つめましょう。',
        '信頼できる人に勤務時間を正直に共有し、点検してもらいましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'a1', subscale: 'compulsion', reverse: false, text: '다른 일을 하고 있어도 머릿속은 일 생각으로 가득하다' },
    { id: 'a2', subscale: 'compulsion', reverse: false, text: '아침에 눈을 뜨면 가장 먼저 일/업무 생각을 한다' },
    { id: 'a3', subscale: 'compulsion', reverse: false, text: '스트레스·죄책감·불안을 잊기 위해 일에 몰두한다' },
    { id: 'a4', subscale: 'compulsion', reverse: false, text: '일에 빠져 있을 때 가장 살아있다고 느낀다' },
    { id: 'a5', subscale: 'compulsion', reverse: false, text: '예전보다 점점 더 많은 시간을 일해야 만족스럽다' },
    { id: 'a6', subscale: 'compulsion', reverse: false, text: '일을 못 하게 되면 안절부절못하거나 초조해진다' },
    { id: 'a7', subscale: 'compulsion', reverse: false, text: '휴가나 주말에 일을 안 하면 오히려 불안하다' },
    { id: 'b1', subscale: 'intrusion', reverse: false, text: '취미·여가·운동을 일 때문에 포기한 적이 많다' },
    { id: 'b2', subscale: 'intrusion', reverse: false, text: '가족·친구·연인이 내가 일을 너무 많이 한다고 말한다' },
    { id: 'b3', subscale: 'intrusion', reverse: false, text: '일 때문에 수면이나 건강이 나빠진 적이 있다' },
    { id: 'b4', subscale: 'intrusion', reverse: false, text: '일하는 시간을 줄이려고 했지만 잘 되지 않았다' },
    { id: 'b5', subscale: 'intrusion', reverse: false, text: '일과 무관한 약속을 일 때문에 자주 미루거나 취소한다' },
    { id: 'b6', subscale: 'intrusion', reverse: false, text: '쉬고 있어도 일 생각 때문에 제대로 쉬지 못한다' },
    { id: 'b7', subscale: 'intrusion', reverse: false, text: '"오늘은 일찍 끝내자"고 다짐해도 결국 늦게까지 일한다' },
  ],
  en: [
    { id: 'a1', subscale: 'compulsion', reverse: false, text: 'Even while doing something else, my mind is full of thoughts about work' },
    { id: 'a2', subscale: 'compulsion', reverse: false, text: 'The first thing I think about when I wake up is work' },
    { id: 'a3', subscale: 'compulsion', reverse: false, text: 'I throw myself into work to forget stress, guilt, or anxiety' },
    { id: 'a4', subscale: 'compulsion', reverse: false, text: 'I feel most alive when I am immersed in work' },
    { id: 'a5', subscale: 'compulsion', reverse: false, text: 'I need to work more and more to feel satisfied than I used to' },
    { id: 'a6', subscale: 'compulsion', reverse: false, text: 'I become restless or agitated when I am prevented from working' },
    { id: 'a7', subscale: 'compulsion', reverse: false, text: 'I feel anxious when I am not working on vacations or weekends' },
    { id: 'b1', subscale: 'intrusion', reverse: false, text: 'I have often given up hobbies, leisure, or exercise because of work' },
    { id: 'b2', subscale: 'intrusion', reverse: false, text: 'Family, friends, or my partner say I work too much' },
    { id: 'b3', subscale: 'intrusion', reverse: false, text: 'My sleep or health has suffered because of work' },
    { id: 'b4', subscale: 'intrusion', reverse: false, text: 'I have tried to cut down my working hours without success' },
    { id: 'b5', subscale: 'intrusion', reverse: false, text: 'I often postpone or cancel non-work plans because of work' },
    { id: 'b6', subscale: 'intrusion', reverse: false, text: 'Even when resting, I cannot truly relax because of thoughts about work' },
    { id: 'b7', subscale: 'intrusion', reverse: false, text: 'Even when I resolve to "finish early today," I end up working late' },
  ],
  ja: [
    { id: 'a1', subscale: 'compulsion', reverse: false, text: '他のことをしていても頭の中は仕事のことでいっぱいだ' },
    { id: 'a2', subscale: 'compulsion', reverse: false, text: '朝起きてまず最初に仕事のことを考える' },
    { id: 'a3', subscale: 'compulsion', reverse: false, text: 'ストレス・罪悪感・不安を忘れるために仕事に没頭する' },
    { id: 'a4', subscale: 'compulsion', reverse: false, text: '仕事に没頭している時に最も生きていると感じる' },
    { id: 'a5', subscale: 'compulsion', reverse: false, text: '以前よりますます多くの時間を働かないと満足できない' },
    { id: 'a6', subscale: 'compulsion', reverse: false, text: '仕事ができなくなると落ち着かず焦りを感じる' },
    { id: 'a7', subscale: 'compulsion', reverse: false, text: '休暇や週末に仕事をしないとかえって不安になる' },
    { id: 'b1', subscale: 'intrusion', reverse: false, text: '趣味・余暇・運動を仕事のために諦めたことが多い' },
    { id: 'b2', subscale: 'intrusion', reverse: false, text: '家族・友人・恋人から働きすぎだと言われる' },
    { id: 'b3', subscale: 'intrusion', reverse: false, text: '仕事のせいで睡眠や健康が悪化したことがある' },
    { id: 'b4', subscale: 'intrusion', reverse: false, text: '働く時間を減らそうとしたがうまくいかなかった' },
    { id: 'b5', subscale: 'intrusion', reverse: false, text: '仕事と関係ない約束を仕事のためによく延期・キャンセルする' },
    { id: 'b6', subscale: 'intrusion', reverse: false, text: '休んでいても仕事のことが気になってしっかり休めない' },
    { id: 'b7', subscale: 'intrusion', reverse: false, text: '「今日は早く終わろう」と決めても結局遅くまで働いてしまう' },
  ],
}

function calcLevel(score: number): WorkLevel {
  if (score <= 2.3) return 'balanced'
  if (score <= 3.2) return 'engaged'
  if (score <= 4.0) return 'driven'
  return 'workaholic'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function WorkaholicTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "workaholic", title: "WorkaholicTest", finished: Boolean(done) });

  // T6/#32: entering via a shared #r= permalink restores the result view
  // directly, skipping the question flow. Safe no-op if there is no hash,
  // the hash is for a different tool, or decoding fails.
  useEffect(() => {
    const decoded = decodeResult<PermalinkState>(window.location.hash)
    if (decoded?.toolId === PERMALINK_TOOL_ID && Array.isArray(decoded.state?.answers)) {
      setAnswers(decoded.state.answers)
      setDone(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pick(val: number) {
    if (answers.length === 0) gaEvent('test_started', { test_id: 'workaholic' })
    const next = answers.slice(0, current)
    next[current] = val
    if (current + 1 >= questions.length) {
      setAnswers(next)
      setDone(true)
      gaEvent('test_completed', { test_id: 'workaholic' })
    } else {
      setAnswers(next)
      setCurrent(current + 1)
    }
  }

  function previous() {
    if (current === 0) return
    setCurrent(current - 1)
  }

  function restart() {
    setAnswers([]); setCurrent(0); setDone(false)
    // Clear a stale #r= permalink from a previous shared result, if any.
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  function calcScores(ans: number[]) {
    const adjusted = questions.map((q, i) => adjustScore(ans[i] ?? 1, q.reverse))
    const aItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'compulsion')
    const bItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'intrusion')
    const aScore = aItems.reduce((s, x) => s + x.adj, 0) / aItems.length
    const bScore = bItems.reduce((s, x) => s + x.adj, 0) / bItems.length
    const overall = (aScore + bScore) / 2
    return { aScore, bScore, overall }
  }

  function share() {
    gaEvent('share_click', { test_id: 'workaholic' })
    const { overall } = calcScores(answers)
    // T6/#32: prefer a permalink that reproduces this exact result; fall back
    // to the plain page URL (prior behavior) if encoding fails or is too large.
    const url = writeResultHash<PermalinkState>(PERMALINK_TOOL_ID, { answers }) ?? window.location.href
    const level = calcLevel(overall)
    const text = `${lb.shareMsg} ${overall.toFixed(1)} ${lb.outOf} — ${LEVEL_DATA[level][l].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  if (!done) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <Questionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, i) => ({ label, value: i + 1 }))}
        selectedValue={answers[current]}
        note={lb.note}
        previousLabel={l === 'ko' ? '이전 질문' : l === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  const { aScore, bScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const aPct = Math.round(((aScore - 1) / 4) * 100)
  const bPct = Math.round(((bScore - 1) / 4) * 100)

  const levelColors: Record<WorkLevel, string> = {
    balanced: '#10b981',
    engaged: '#f59e0b',
    driven: '#f97316',
    workaholic: '#ef4444',
  }
  const color = levelColors[level]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourScore}</p>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          <span>{ld.icon}</span>
          <span>{ld.title}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{ld.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">{lb.overallLabel}</span>
            <span className="text-lg font-bold" style={{ color }}>{overall.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-3 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.overallLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.compulsionLabel}</span>
            <span className="font-bold" style={{ color }}>{aScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={aPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.compulsionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${aPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.intrusionLabel}</span>
            <span className="font-bold" style={{ color }}>{bScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={bPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.intrusionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bPct}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-600">{lb.tipsLabel}</h3>
        <ul className="space-y-1">
          {ld.tips.map(tip => (
            <li key={tip} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-green-500">→</span>{tip}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <ResultShareImage title={lb.title} level={ld.title} score={overall} color={color} icon={ld.icon} locale={l} />
      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors"
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {lb.share}
        </button>
      </div>
        <ShareResultButton locale={lp} heading={lb.title} resultTitle={ld.title} />
    </div>
  )
}
