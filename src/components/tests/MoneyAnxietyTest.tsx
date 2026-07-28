import { useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type MoneyLevel = 'secure' | 'mild' | 'anxious' | 'distress'
type Subscale = 'worry' | 'avoidance'

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
  yourScore: string; overallLabel: string; worryLabel: string; avoidanceLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '돈 불안 척도 테스트',
    subtitle: '나의 금전 불안 지수는?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 금전 불안 지수는',
    yourScore: '나의 금전 불안 지수',
    overallLabel: '종합 금전 불안 지수',
    worryLabel: '재정 걱정',
    avoidanceLabel: '재정 회피',
    outOf: '/ 5.0',
    tipsLabel: '마음을 위한 팁',
    note: '재정 불안(Financial Anxiety) 및 머니 스크립트 연구 개념을 바탕으로 한 자가성찰용 테스트입니다. 재무·의학적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Money Anxiety Test',
    subtitle: 'How high is your financial anxiety?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My money anxiety score is',
    yourScore: 'Your Money Anxiety Score',
    overallLabel: 'Overall Money Anxiety Score',
    worryLabel: 'Financial Worry',
    avoidanceLabel: 'Financial Avoidance',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Mind',
    note: 'This self-reflection test is based on financial anxiety and money script research concepts. It does not replace financial or medical assessment.',
  },
  ja: {
    title: 'お金の不安尺度テスト',
    subtitle: 'あなたの金銭不安度は？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の金銭不安度は',
    yourScore: 'あなたの金銭不安度',
    overallLabel: '総合金銭不安度',
    worryLabel: '財政的心配',
    avoidanceLabel: '財政的回避',
    outOf: '/ 5.0',
    tipsLabel: '心のためのヒント',
    note: 'このテストは金銭不安（Financial Anxiety）とマネースクリプト研究の概念に基づく自己省察用です。財務・医学的診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<MoneyLevel, Record<SupportedLang, LevelData>> = {
  secure: {
    ko: {
      icon: '💚',
      title: '안정형',
      description: '돈에 대해 비교적 건강한 관계를 맺고 있습니다. 재정을 직시하고, 과도한 걱정 없이 현실적으로 다룹니다.',
      tips: [
        '지금의 안정감을 만든 습관을 글로 정리해 보세요.',
        '비상금·자동저축 등 시스템으로 안정감을 더 굳히세요.',
        '돈을 목표·가치와 연결해 의미 있게 쓰세요.',
      ],
    },
    en: {
      icon: '💚',
      title: 'Secure',
      description: 'You have a relatively healthy relationship with money. You face your finances and handle them realistically without excessive worry.',
      tips: [
        'Write down the habits that created your current stability.',
        'Reinforce that security with systems like an emergency fund and auto-saving.',
        'Connect money to your goals and values so you spend it meaningfully.',
      ],
    },
    ja: {
      icon: '💚',
      title: '安定型',
      description: 'お金と比較的健康的な関係を築いています。財政を直視し、過度な心配なく現実的に扱えます。',
      tips: [
        '今の安定感を作った習慣を文章にまとめてみましょう。',
        '緊急予備資金・自動貯蓄などの仕組みで安定感をさらに固めましょう。',
        'お金を目標や価値と結びつけて意味あるものに使いましょう。',
      ],
    },
  },
  mild: {
    ko: {
      icon: '🌱',
      title: '가벼운 긴장형',
      description: '대부분의 사람이 느끼는 일상적인 수준의 돈 걱정입니다. 가끔 신경 쓰이지만 현실을 외면하지는 않습니다.',
      tips: [
        '월 1회 "재정 점검의 날"을 정해 부담을 줄여 보세요.',
        '걱정이 떠오르면 막연함 대신 숫자로 적어 보세요.',
        '통제 가능한 것(지출 습관)과 불가능한 것을 구분하세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Mildly Tense',
      description: 'An everyday level of money worry that most people feel. It occasionally bothers you, but you do not turn away from reality.',
      tips: [
        'Set a monthly "finance check-in day" to reduce the pressure.',
        'When worry arises, write it down as numbers instead of vague dread.',
        'Separate what you can control (spending habits) from what you cannot.',
      ],
    },
    ja: {
      icon: '🌱',
      title: '軽い緊張型',
      description: '多くの人が感じる日常的なレベルのお金の心配です。時々気になりますが、現実から目を背けてはいません。',
      tips: [
        '月1回「財政点検の日」を決めて負担を減らしましょう。',
        '心配が浮かんだら漠然とせず数字で書き出しましょう。',
        'コントロールできること（支出習慣）とできないことを区別しましょう。',
      ],
    },
  },
  anxious: {
    ko: {
      icon: '⚠️',
      title: '재정 불안형',
      description: '돈에 대한 걱정 또는 회피가 뚜렷하게 나타납니다. 불안이 의사결정과 마음의 평화를 자주 방해할 수 있습니다.',
      tips: [
        '작게 시작하세요 — 통장 잔고 한 번 확인하기부터.',
        '재정 회피는 불안을 키웁니다. 직시가 곧 통제감을 줍니다.',
        '신뢰하는 사람과 돈 이야기를 나눠 고립감을 줄이세요.',
      ],
    },
    en: {
      icon: '⚠️',
      title: 'Financially Anxious',
      description: 'Clear worry or avoidance about money shows up. The anxiety may frequently disrupt your decisions and peace of mind.',
      tips: [
        'Start small — just checking your account balance once.',
        'Avoidance grows anxiety; facing the numbers restores a sense of control.',
        'Talk about money with someone you trust to reduce isolation.',
      ],
    },
    ja: {
      icon: '⚠️',
      title: '財政不安型',
      description: 'お金に対する心配または回避がはっきり表れています。不安が意思決定と心の平和をしばしば妨げる可能性があります。',
      tips: [
        '小さく始めましょう — まず口座残高を一度確認することから。',
        '回避は不安を育てます。直視こそがコントロール感を与えます。',
        '信頼できる人とお金の話をして孤立感を減らしましょう。',
      ],
    },
  },
  distress: {
    ko: {
      icon: '🆘',
      title: '높은 금전 스트레스형',
      description: '돈에 대한 불안이 매우 강합니다. 걱정과 회피가 일상·수면·관계에까지 영향을 주고 있을 가능성이 높습니다.',
      tips: [
        '아주 작은 실천 하나(자동이체 1건 등)부터 통제감을 회복하세요.',
        '불안의 정체를 객관적 숫자(수입·지출·부채)로 마주하세요.',
        '재무 상담·신용상담 등 전문적 도움을 적극 고려하세요.',
      ],
    },
    en: {
      icon: '🆘',
      title: 'High Money Stress',
      description: 'Your anxiety about money is very strong. Worry and avoidance are likely affecting your daily life, sleep, and even relationships.',
      tips: [
        'Restore a sense of control with one tiny action (e.g., one auto-transfer).',
        'Face the anxiety with objective numbers (income, spending, debt).',
        'Actively consider professional help such as financial or credit counseling.',
      ],
    },
    ja: {
      icon: '🆘',
      title: '高い金銭ストレス型',
      description: 'お金への不安が非常に強いです。心配と回避が日常・睡眠・人間関係にまで影響している可能性が高いです。',
      tips: [
        'ごく小さな実践一つ（自動振替1件など）からコントロール感を取り戻しましょう。',
        '不安の正体を客観的な数字（収入・支出・負債）で向き合いましょう。',
        '財務相談・信用相談など専門的な助けを積極的に検討しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'w1', subscale: 'worry', reverse: false, text: '돈 문제가 자주 걱정되고 머릿속에서 잘 떠나지 않는다' },
    { id: 'w2', subscale: 'worry', reverse: false, text: '예상치 못한 지출이 생길까 봐 늘 불안하다' },
    { id: 'w3', subscale: 'worry', reverse: false, text: '통장 잔고를 떠올리면 마음이 불편해진다' },
    { id: 'w4', subscale: 'worry', reverse: false, text: '미래의 경제적 상황이 두렵다' },
    { id: 'w5', subscale: 'worry', reverse: false, text: '남과 나의 경제 사정을 자주 비교하게 된다' },
    { id: 'w6', subscale: 'worry', reverse: false, text: '돈 때문에 잠을 설치거나 스트레스를 받은 적이 있다' },
    { id: 'w7', subscale: 'worry', reverse: false, text: '충분히 벌어도 늘 부족할까 봐 불안하다' },
    { id: 'a1', subscale: 'avoidance', reverse: false, text: '통장·카드 명세서 확인을 자꾸 미룬다' },
    { id: 'a2', subscale: 'avoidance', reverse: false, text: '내 재정 상태를 정확히 아는 것이 두려워 피한다' },
    { id: 'a3', subscale: 'avoidance', reverse: false, text: '돈에 관한 대화를 가급적 피하는 편이다' },
    { id: 'a4', subscale: 'avoidance', reverse: false, text: '예산이나 가계부를 세웠다가 흐지부지된 적이 많다' },
    { id: 'a5', subscale: 'avoidance', reverse: false, text: '청구서나 금융 우편물을 열어보기 싫다' },
    { id: 'a6', subscale: 'avoidance', reverse: false, text: '돈 문제는 "나중에 생각하자"며 미루는 편이다' },
    { id: 'a7', subscale: 'avoidance', reverse: false, text: '저축·투자 계획을 알아보는 것을 자꾸 미룬다' },
  ],
  en: [
    { id: 'w1', subscale: 'worry', reverse: false, text: 'I worry about money often and it does not easily leave my mind' },
    { id: 'w2', subscale: 'worry', reverse: false, text: 'I am always anxious that an unexpected expense might come up' },
    { id: 'w3', subscale: 'worry', reverse: false, text: 'Thinking about my account balance makes me uneasy' },
    { id: 'w4', subscale: 'worry', reverse: false, text: 'I am afraid of my future financial situation' },
    { id: 'w5', subscale: 'worry', reverse: false, text: 'I often compare my financial situation with others' },
    { id: 'w6', subscale: 'worry', reverse: false, text: 'I have lost sleep or felt stressed because of money' },
    { id: 'w7', subscale: 'worry', reverse: false, text: 'Even when I earn enough, I am anxious it will never be enough' },
    { id: 'a1', subscale: 'avoidance', reverse: false, text: 'I keep putting off checking my bank or card statements' },
    { id: 'a2', subscale: 'avoidance', reverse: false, text: 'I avoid knowing my exact financial situation because it scares me' },
    { id: 'a3', subscale: 'avoidance', reverse: false, text: 'I tend to avoid conversations about money' },
    { id: 'a4', subscale: 'avoidance', reverse: false, text: 'I have often started a budget and then let it fizzle out' },
    { id: 'a5', subscale: 'avoidance', reverse: false, text: 'I dislike opening bills or financial mail' },
    { id: 'a6', subscale: 'avoidance', reverse: false, text: 'I tend to put off money issues, telling myself "I will deal with it later"' },
    { id: 'a7', subscale: 'avoidance', reverse: false, text: 'I keep postponing looking into saving or investment plans' },
  ],
  ja: [
    { id: 'w1', subscale: 'worry', reverse: false, text: 'お金の問題をよく心配し、なかなか頭から離れない' },
    { id: 'w2', subscale: 'worry', reverse: false, text: '予期しない出費が生じないか常に不安だ' },
    { id: 'w3', subscale: 'worry', reverse: false, text: '口座残高を思い浮かべると気が重くなる' },
    { id: 'w4', subscale: 'worry', reverse: false, text: '将来の経済状況が怖い' },
    { id: 'w5', subscale: 'worry', reverse: false, text: '他人と自分の経済事情をよく比較してしまう' },
    { id: 'w6', subscale: 'worry', reverse: false, text: 'お金のせいで眠れなかったりストレスを感じたことがある' },
    { id: 'w7', subscale: 'worry', reverse: false, text: '十分稼いでも常に足りないのではと不安になる' },
    { id: 'a1', subscale: 'avoidance', reverse: false, text: '口座やカードの明細確認をつい後回しにする' },
    { id: 'a2', subscale: 'avoidance', reverse: false, text: '自分の財政状況を正確に知るのが怖くて避ける' },
    { id: 'a3', subscale: 'avoidance', reverse: false, text: 'お金に関する会話をなるべく避ける方だ' },
    { id: 'a4', subscale: 'avoidance', reverse: false, text: '予算や家計簿を立てても途中でやめてしまうことが多い' },
    { id: 'a5', subscale: 'avoidance', reverse: false, text: '請求書や金融関係の郵便を開けたくない' },
    { id: 'a6', subscale: 'avoidance', reverse: false, text: 'お金の問題は「後で考えよう」と先延ばしにする方だ' },
    { id: 'a7', subscale: 'avoidance', reverse: false, text: '貯蓄・投資の計画を調べるのをつい後回しにする' },
  ],
}

function calcLevel(score: number): MoneyLevel {
  if (score <= 2.3) return 'secure'
  if (score <= 3.2) return 'mild'
  if (score <= 4.0) return 'anxious'
  return 'distress'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function MoneyAnxietyTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)

  function pick(val: number) {
    const next = [...answers, val]
    if (current + 1 >= questions.length) {
      setAnswers(next)
      setDone(true)
    } else {
      setAnswers(next)
      setCurrent(current + 1)
    }
  }

  function restart() { setAnswers([]); setCurrent(0); setDone(false) }

  function calcScores(ans: number[]) {
    const adjusted = questions.map((q, i) => adjustScore(ans[i] ?? 1, q.reverse))
    const wItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'worry')
    const aItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'avoidance')
    const wScore = wItems.reduce((s, x) => s + x.adj, 0) / wItems.length
    const aScore = aItems.reduce((s, x) => s + x.adj, 0) / aItems.length
    const overall = (wScore + aScore) / 2
    return { wScore, aScore, overall }
  }

  function share() {
    const { overall } = calcScores(answers)
    const url = window.location.href
    const level = calcLevel(overall)
    const text = `${lb.shareMsg} ${overall.toFixed(1)} ${lb.outOf} — ${LEVEL_DATA[level][l].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  if (!done) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{lb.title}</h1>
          <p className="text-muted-foreground text-sm">{lb.subtitle}</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{lb.questionOf(current + 1, questions.length)}</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.questionOf(current + 1, questions.length)}
          >
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-lg font-bold">{q.text}</p>
        </div>
        <div className="grid gap-2">
          {lb.scaleLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => pick(i + 1)}
              aria-label={label}
              className="w-full rounded-xl border bg-card px-4 py-3 text-left text-sm hover:bg-accent hover:border-green-400 transition-colors flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center text-xs font-bold text-green-600 flex-none">
                {i + 1}
              </span>
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      </div>
    )
  }

  const { wScore, aScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const wPct = Math.round(((wScore - 1) / 4) * 100)
  const aPct = Math.round(((aScore - 1) / 4) * 100)

  const levelColors: Record<MoneyLevel, string> = {
    secure: '#10b981',
    mild: '#84cc16',
    anxious: '#f59e0b',
    distress: '#ef4444',
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
            <span className="font-bold text-muted-foreground">{lb.worryLabel}</span>
            <span className="font-bold" style={{ color }}>{wScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={wPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.worryLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${wPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.avoidanceLabel}</span>
            <span className="font-bold" style={{ color }}>{aScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={aPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.avoidanceLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${aPct}%`, backgroundColor: color }} />
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
