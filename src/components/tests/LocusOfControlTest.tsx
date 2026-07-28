import { useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type LocusLevel = 'external' | 'mixed' | 'internal' | 'strong'
type Subscale = 'control' | 'effort'

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
  yourScore: string; overallLabel: string; controlLabel: string; effortLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '통제 위치 테스트',
    subtitle: '내 삶의 운전대는 누가 쥐고 있을까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 내적 통제 지수는',
    yourScore: '나의 내적 통제 지수',
    overallLabel: '종합 내적 통제',
    controlLabel: '결과 통제감',
    effortLabel: '노력-보상 신념',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '로터(Rotter)의 통제 소재(Locus of Control) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Locus of Control Test',
    subtitle: "Who holds the wheel of your life?",
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My internal locus score is',
    yourScore: 'Your Internal Locus Score',
    overallLabel: 'Overall Internal Locus',
    controlLabel: 'Sense of Control',
    effortLabel: 'Effort-Reward Belief',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: "This self-reflection test is based on Rotter's Locus of Control concept. It does not replace professional assessment.",
  },
  ja: {
    title: '統制の所在テスト',
    subtitle: '人生のハンドルを握っているのは誰？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の内的統制度は',
    yourScore: 'あなたの内的統制度',
    overallLabel: '総合内的統制',
    controlLabel: '結果の統制感',
    effortLabel: '努力-報酬の信念',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはRotterの統制の所在（Locus of Control）概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<LocusLevel, Record<SupportedLang, LevelData>> = {
  external: {
    ko: {
      icon: '🎲',
      title: '외부 통제형',
      description: '삶의 결과가 운·환경·타인에 달려 있다고 느끼는 편입니다. 안정감을 줄 때도 있지만, 무력감으로 이어지지 않게 작은 통제감을 키우면 좋습니다.',
      tips: [
        '내가 바꿀 수 있는 작은 것 하나를 골라 행동해 보세요.',
        '성공 경험을 "내 노력 덕분"으로 해석하는 연습을 하세요.',
        '통제 가능한 것과 불가능한 것을 적어 구분해 보세요.',
      ],
    },
    en: {
      icon: '🎲',
      title: 'External Locus',
      description: 'You tend to feel life outcomes depend on luck, circumstances, or others. It can bring calm, but building a small sense of control helps avoid helplessness.',
      tips: [
        'Pick one small thing you can change and act on it.',
        'Practice attributing successes to "my effort."',
        'List what you can and cannot control to tell them apart.',
      ],
    },
    ja: {
      icon: '🎲',
      title: '外的統制型',
      description: '人生の結果が運・環境・他人に左右されると感じる方です。安心感を与えることもありますが、無力感につながらないよう小さな統制感を育てると良いです。',
      tips: [
        '自分が変えられる小さなこと一つを選んで行動しましょう。',
        '成功を「自分の努力のおかげ」と解釈する練習をしましょう。',
        '統制できることとできないことを書き出して区別しましょう。',
      ],
    },
  },
  mixed: {
    ko: {
      icon: '⚖️',
      title: '균형 통제형',
      description: '내 노력의 힘과 외부 환경의 영향을 모두 인정합니다. 현실적이면서도 유연한 균형 잡힌 태도입니다.',
      tips: [
        '통제할 수 있는 영역에 에너지를 더 집중해 보세요.',
        '결과가 안 좋아도 내가 한 부분을 객관적으로 평가하세요.',
        '외부 요인 탓과 내 책임을 균형 있게 보는 습관을 유지하세요.',
      ],
    },
    en: {
      icon: '⚖️',
      title: 'Balanced Locus',
      description: 'You acknowledge both the power of your effort and the influence of circumstances. A realistic yet flexible, balanced stance.',
      tips: [
        'Focus more energy on the areas you can control.',
        'Even with bad outcomes, evaluate your part objectively.',
        'Keep balancing external factors and personal responsibility.',
      ],
    },
    ja: {
      icon: '⚖️',
      title: 'バランス統制型',
      description: '自分の努力の力と外部環境の影響の両方を認めます。現実的でありながら柔軟でバランスの取れた姿勢です。',
      tips: [
        '統制できる領域にもっとエネルギーを集中しましょう。',
        '結果が悪くても自分の部分を客観的に評価しましょう。',
        '外部要因のせいと自分の責任をバランスよく見る習慣を保ちましょう。',
      ],
    },
  },
  internal: {
    ko: {
      icon: '🧭',
      title: '내부 통제형',
      description: '내 선택과 노력이 결과를 만든다는 믿음이 강합니다. 주체적으로 삶을 이끌고 어려움 속에서도 영향력을 찾습니다.',
      tips: [
        '이 주체감을 목표 설정과 실행에 적극 활용하세요.',
        '통제할 수 없는 일까지 자책하지 않도록 경계를 두세요.',
        '노력만큼 운·타인의 도움도 인정하면 더 단단해집니다.',
      ],
    },
    en: {
      icon: '🧭',
      title: 'Internal Locus',
      description: 'You strongly believe your choices and effort shape outcomes. You lead your life proactively and find influence even in difficulty.',
      tips: [
        'Use this agency actively in goal-setting and execution.',
        'Set a boundary so you do not blame yourself for what you cannot control.',
        'Acknowledging luck and others\' help alongside effort makes you sturdier.',
      ],
    },
    ja: {
      icon: '🧭',
      title: '内的統制型',
      description: '自分の選択と努力が結果を作るという信念が強いです。主体的に人生を導き、困難の中でも影響力を見出します。',
      tips: [
        'この主体感を目標設定と実行に積極的に活かしましょう。',
        '統制できないことまで自分を責めないよう境界を持ちましょう。',
        '努力と同じく運や他人の助けも認めるとより強くなります。',
      ],
    },
  },
  strong: {
    ko: {
      icon: '🚀',
      title: '강한 내부 통제형',
      description: '매우 높은 주체감을 가지고 있습니다. 강력한 추진력이지만, 통제 불가능한 영역까지 과도하게 책임지지 않도록 균형이 필요합니다.',
      tips: [
        '내 영향 밖의 일은 "수용"하는 연습도 함께 하세요.',
        '완벽한 통제 욕구가 번아웃으로 이어지지 않게 점검하세요.',
        '강한 주체감을 타인 역량 강화에도 나눠 보세요.',
      ],
    },
    en: {
      icon: '🚀',
      title: 'Strong Internal Locus',
      description: 'You have a very high sense of agency. A powerful drive, but balance is needed so you do not over-own areas beyond your control.',
      tips: [
        'Also practice "accepting" what is outside your influence.',
        'Check that a need for total control does not lead to burnout.',
        'Share your strong agency by empowering others too.',
      ],
    },
    ja: {
      icon: '🚀',
      title: '強い内的統制型',
      description: '非常に高い主体感を持っています。強力な推進力ですが、統制不能な領域まで過度に責任を負わないようバランスが必要です。',
      tips: [
        '自分の影響の外のことは「受け入れる」練習も併せてしましょう。',
        '完全な統制欲求がバーンアウトにつながらないか点検しましょう。',
        '強い主体感を他人の能力強化にも分かち合いましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'c1', subscale: 'control', reverse: false, text: '내 삶에서 일어나는 일은 대부분 내 선택의 결과다' },
    { id: 'c2', subscale: 'control', reverse: false, text: '원하는 것을 얻는 것은 주로 나의 노력에 달려 있다' },
    { id: 'c3', subscale: 'control', reverse: false, text: '문제가 생기면 내가 바꿀 수 있는 부분에 집중한다' },
    { id: 'c4', subscale: 'control', reverse: false, text: '내 미래는 운보다 내 행동이 더 크게 결정한다' },
    { id: 'c5', subscale: 'control', reverse: false, text: '상황이 나빠도 내가 영향을 줄 여지가 있다고 본다' },
    { id: 'c6', subscale: 'control', reverse: false, text: '실패했을 때 내가 통제할 수 있었던 요인을 먼저 살핀다' },
    { id: 'c7', subscale: 'control', reverse: true, text: '내 인생은 대부분 운이나 외부 상황에 좌우된다' },
    { id: 'e1', subscale: 'effort', reverse: false, text: '노력하면 결국 결과가 따라온다고 믿는다' },
    { id: 'e2', subscale: 'effort', reverse: false, text: '성공은 운보다 준비와 노력의 문제다' },
    { id: 'e3', subscale: 'effort', reverse: false, text: '꾸준히 하면 능력은 나아질 수 있다고 생각한다' },
    { id: 'e4', subscale: 'effort', reverse: false, text: '내가 시간을 어떻게 쓰는지가 결과를 만든다' },
    { id: 'e5', subscale: 'effort', reverse: false, text: '기회는 준비된 사람에게 온다고 생각한다' },
    { id: 'e6', subscale: 'effort', reverse: true, text: '아무리 노력해도 바뀌지 않는 일이 너무 많다' },
    { id: 'e7', subscale: 'effort', reverse: true, text: '중요한 결정은 내 힘 밖의 일들에 좌우된다' },
  ],
  en: [
    { id: 'c1', subscale: 'control', reverse: false, text: 'What happens in my life is mostly the result of my own choices' },
    { id: 'c2', subscale: 'control', reverse: false, text: 'Getting what I want depends mainly on my own effort' },
    { id: 'c3', subscale: 'control', reverse: false, text: 'When a problem arises, I focus on the part I can change' },
    { id: 'c4', subscale: 'control', reverse: false, text: 'My future is determined more by my actions than by luck' },
    { id: 'c5', subscale: 'control', reverse: false, text: 'Even when things go badly, I see room to make an impact' },
    { id: 'c6', subscale: 'control', reverse: false, text: 'After failing, I first look at the factors I could have controlled' },
    { id: 'c7', subscale: 'control', reverse: true, text: 'My life is mostly governed by luck or outside circumstances' },
    { id: 'e1', subscale: 'effort', reverse: false, text: 'I believe results eventually follow effort' },
    { id: 'e2', subscale: 'effort', reverse: false, text: 'Success is a matter of preparation and effort more than luck' },
    { id: 'e3', subscale: 'effort', reverse: false, text: 'I believe ability can improve with consistent practice' },
    { id: 'e4', subscale: 'effort', reverse: false, text: 'How I use my time shapes my results' },
    { id: 'e5', subscale: 'effort', reverse: false, text: 'I think opportunity comes to those who are prepared' },
    { id: 'e6', subscale: 'effort', reverse: true, text: 'No matter how hard I try, too many things never change' },
    { id: 'e7', subscale: 'effort', reverse: true, text: 'Important decisions are governed by things beyond my control' },
  ],
  ja: [
    { id: 'c1', subscale: 'control', reverse: false, text: '人生で起きることはほとんど自分の選択の結果だ' },
    { id: 'c2', subscale: 'control', reverse: false, text: '望むものを得るのは主に自分の努力次第だ' },
    { id: 'c3', subscale: 'control', reverse: false, text: '問題が生じたら自分が変えられる部分に集中する' },
    { id: 'c4', subscale: 'control', reverse: false, text: '自分の未来は運より自分の行動が大きく決める' },
    { id: 'c5', subscale: 'control', reverse: false, text: '状況が悪くても自分が影響を与える余地があると見る' },
    { id: 'c6', subscale: 'control', reverse: false, text: '失敗した時、自分が統制できた要因をまず見る' },
    { id: 'c7', subscale: 'control', reverse: true, text: '自分の人生はほとんど運や外部状況に左右される' },
    { id: 'e1', subscale: 'effort', reverse: false, text: '努力すれば結局結果がついてくると信じる' },
    { id: 'e2', subscale: 'effort', reverse: false, text: '成功は運より準備と努力の問題だ' },
    { id: 'e3', subscale: 'effort', reverse: false, text: '続ければ能力は良くなると思う' },
    { id: 'e4', subscale: 'effort', reverse: false, text: '自分が時間をどう使うかが結果を作る' },
    { id: 'e5', subscale: 'effort', reverse: false, text: 'チャンスは準備した人に来ると思う' },
    { id: 'e6', subscale: 'effort', reverse: true, text: 'どれだけ努力しても変わらないことが多すぎる' },
    { id: 'e7', subscale: 'effort', reverse: true, text: '重要な決定は自分の力の外のことに左右される' },
  ],
}

function calcLevel(score: number): LocusLevel {
  if (score <= 2.5) return 'external'
  if (score <= 3.5) return 'mixed'
  if (score <= 4.3) return 'internal'
  return 'strong'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function LocusOfControlTest({ locale: lp = 'ko' }: Props) {
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
    const cItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'control')
    const eItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'effort')
    const cScore = cItems.reduce((s, x) => s + x.adj, 0) / cItems.length
    const eScore = eItems.reduce((s, x) => s + x.adj, 0) / eItems.length
    const overall = (cScore + eScore) / 2
    return { cScore, eScore, overall }
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

  const { cScore, eScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const cPct = Math.round(((cScore - 1) / 4) * 100)
  const ePct = Math.round(((eScore - 1) / 4) * 100)

  const levelColors: Record<LocusLevel, string> = {
    external: '#6ee7b7',
    mixed: '#34d399',
    internal: '#10b981',
    strong: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.controlLabel}</span>
            <span className="font-bold" style={{ color }}>{cScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={cPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.controlLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.effortLabel}</span>
            <span className="font-bold" style={{ color }}>{eScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={ePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.effortLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ePct}%`, backgroundColor: color }} />
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
