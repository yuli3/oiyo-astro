import { useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type JealousyLevel = 'secure' | 'mild' | 'watchful' | 'intense'
type Subscale = 'cognitive' | 'behavioral'

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
  yourScore: string; overallLabel: string; cognitiveLabel: string; behavioralLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '질투 유형 테스트',
    subtitle: '나의 질투는 어떤 모양일까? (연인·배우자가 있는 분께)',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 질투 지수는',
    yourScore: '나의 질투 지수',
    overallLabel: '종합 질투 지수',
    cognitiveLabel: '인지적 질투 (의심·상상)',
    behavioralLabel: '행동적 질투 (확인·통제)',
    outOf: '/ 5.0',
    tipsLabel: '관계를 위한 팁',
    note: '파이퍼와 웡(Pfeiffer & Wong)의 다차원 질투 척도 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Jealousy Type Test',
    subtitle: 'What shape does your jealousy take? (for those in a relationship)',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My jealousy score is',
    yourScore: 'Your Jealousy Score',
    overallLabel: 'Overall Jealousy Score',
    cognitiveLabel: 'Cognitive Jealousy (suspicion)',
    behavioralLabel: 'Behavioral Jealousy (checking)',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Relationship',
    note: 'This self-reflection test is based on the Multidimensional Jealousy Scale concept (Pfeiffer & Wong). It does not replace professional assessment.',
  },
  ja: {
    title: '嫉妬タイプテスト',
    subtitle: 'あなたの嫉妬はどんな形？（恋人・配偶者がいる方へ）',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の嫉妬度は',
    yourScore: 'あなたの嫉妬度',
    overallLabel: '総合嫉妬度',
    cognitiveLabel: '認知的嫉妬（疑い・想像）',
    behavioralLabel: '行動的嫉妬（確認・統制）',
    outOf: '/ 5.0',
    tipsLabel: '関係のためのヒント',
    note: 'このテストはPfeiffer & Wongの多次元嫉妬尺度の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<JealousyLevel, Record<SupportedLang, LevelData>> = {
  secure: {
    ko: {
      icon: '💚',
      title: '안정 신뢰형',
      description: '관계에 대한 신뢰가 안정적입니다. 질투가 거의 없거나, 있어도 관계를 흔들지 않는 건강한 수준입니다.',
      tips: [
        '지금의 신뢰 기반을 솔직한 소통으로 계속 다지세요.',
        '가끔의 질투는 자연스러운 감정으로 가볍게 받아들이세요.',
        '서로의 독립성과 신뢰를 존중하는 태도를 유지하세요.',
      ],
    },
    en: {
      icon: '💚',
      title: 'Secure & Trusting',
      description: 'Your trust in the relationship is stable. Jealousy is minimal, or healthy enough not to shake the relationship.',
      tips: [
        'Keep strengthening this trust foundation through honest communication.',
        'Accept the occasional pang of jealousy lightly, as a natural feeling.',
        'Maintain respect for each other\'s independence and trust.',
      ],
    },
    ja: {
      icon: '💚',
      title: '安定信頼型',
      description: '関係への信頼が安定しています。嫉妬はほとんどないか、あっても関係を揺るがさない健康的なレベルです。',
      tips: [
        '今の信頼基盤を正直なコミュニケーションで固め続けましょう。',
        '時々の嫉妬は自然な感情として軽く受け入れましょう。',
        'お互いの独立性と信頼を尊重する姿勢を保ちましょう。',
      ],
    },
  },
  mild: {
    ko: {
      icon: '🌤️',
      title: '가벼운 질투형',
      description: '대부분의 사람이 느끼는 일상적인 수준의 질투입니다. 가끔 신경 쓰이지만 관계를 통제하려 하지는 않습니다.',
      tips: [
        '질투가 올라올 때 사실과 상상을 구분해 보세요.',
        '불안을 비난 대신 "나" 중심의 감정으로 표현하세요.',
        '내 가치를 관계 밖에서도 키워 안정감을 더하세요.',
      ],
    },
    en: {
      icon: '🌤️',
      title: 'Mild Jealousy',
      description: 'An everyday level of jealousy that most people feel. It occasionally bothers you, but you do not try to control the relationship.',
      tips: [
        'When jealousy rises, separate fact from imagination.',
        'Express the anxiety as an "I" feeling rather than blame.',
        'Build your worth outside the relationship to add security.',
      ],
    },
    ja: {
      icon: '🌤️',
      title: '軽い嫉妬型',
      description: '多くの人が感じる日常的なレベルの嫉妬です。時々気になりますが、関係を統制しようとはしません。',
      tips: [
        '嫉妬が湧いたら事実と想像を区別しましょう。',
        '不安を非難ではなく「私」中心の感情で表現しましょう。',
        '自分の価値を関係の外でも育てて安定感を加えましょう。',
      ],
    },
  },
  watchful: {
    ko: {
      icon: '⚠️',
      title: '경계 질투형',
      description: '의심이나 확인 욕구가 뚜렷합니다. 질투가 관계의 긴장을 키우고, 확인·통제 행동으로 이어질 수 있습니다.',
      tips: [
        '확인 충동이 올라올 때 잠시 멈추고 호흡하며 거리를 두세요.',
        '의심의 근거가 사실인지, 불안의 투영인지 점검하세요.',
        '통제 대신 솔직한 대화로 안심의 기반을 만드세요.',
      ],
    },
    en: {
      icon: '⚠️',
      title: 'Watchful Jealousy',
      description: 'Suspicion and the urge to check are pronounced. Jealousy may raise tension and lead to checking or controlling behavior.',
      tips: [
        'When the urge to check rises, pause, breathe, and create distance.',
        'Examine whether your suspicion is based on fact or projected anxiety.',
        'Build reassurance through honest conversation instead of control.',
      ],
    },
    ja: {
      icon: '⚠️',
      title: '警戒嫉妬型',
      description: '疑いや確認欲求がはっきりしています。嫉妬が関係の緊張を高め、確認・統制行動につながる可能性があります。',
      tips: [
        '確認衝動が湧いたら一度止まって呼吸し距離を取りましょう。',
        '疑いの根拠が事実か、不安の投影かを点検しましょう。',
        '統制ではなく正直な対話で安心の基盤を作りましょう。',
      ],
    },
  },
  intense: {
    ko: {
      icon: '🔥',
      title: '질투 과민형',
      description: '질투가 매우 강하고 통제·확인 행동이 두드러집니다. 본인과 관계 모두에 큰 긴장을 줄 수 있어 돌봄이 필요합니다.',
      tips: [
        '질투의 뿌리(불안정 애착·낮은 자존감 등)를 들여다보세요.',
        '확인·감시 행동을 한 가지씩 의식적으로 줄여 보세요.',
        '혼자 다루기 버겁다면 상담 등 전문적 도움을 고려하세요.',
      ],
    },
    en: {
      icon: '🔥',
      title: 'Intense Jealousy',
      description: 'Jealousy is very strong with prominent controlling and checking behavior. It can strain both you and the relationship, and deserves care.',
      tips: [
        'Look into the roots of the jealousy (insecure attachment, low self-esteem).',
        'Consciously reduce checking and monitoring behaviors one at a time.',
        'If it is hard to handle alone, consider professional help such as counseling.',
      ],
    },
    ja: {
      icon: '🔥',
      title: '嫉妬過敏型',
      description: '嫉妬が非常に強く、統制・確認行動が目立ちます。本人と関係の両方に大きな緊張を与える可能性があり、ケアが必要です。',
      tips: [
        '嫉妬の根（不安定な愛着・低い自尊心など）を見つめましょう。',
        '確認・監視行動を一つずつ意識的に減らしましょう。',
        '一人で扱うのが重いならカウンセリングなど専門的な助けを検討しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'g1', subscale: 'cognitive', reverse: false, text: '연인이 다른 사람과 친하게 지내면 그 관계를 자꾸 의심하게 된다' },
    { id: 'g2', subscale: 'cognitive', reverse: false, text: '연인이 나 몰래 다른 사람에게 관심을 둘까 봐 자주 생각한다' },
    { id: 'g3', subscale: 'cognitive', reverse: false, text: '연인의 과거 연애를 떠올리며 신경 쓸 때가 있다' },
    { id: 'g4', subscale: 'cognitive', reverse: false, text: '연인이 늦거나 연락이 안 되면 안 좋은 상상을 한다' },
    { id: 'g5', subscale: 'cognitive', reverse: false, text: '연인이 이성과 함께 있는 장면을 떠올리며 괴로울 때가 있다' },
    { id: 'g6', subscale: 'cognitive', reverse: false, text: '연인의 말이나 행동의 숨은 의도를 자주 분석한다' },
    { id: 'g7', subscale: 'cognitive', reverse: false, text: '연인이 다른 사람을 칭찬하면 마음이 불편하다' },
    { id: 'b1', subscale: 'behavioral', reverse: false, text: '연인의 휴대폰이나 SNS를 확인하고 싶은 충동을 느낀다' },
    { id: 'b2', subscale: 'behavioral', reverse: false, text: '연인이 누구와 있는지 자주 확인한다' },
    { id: 'b3', subscale: 'behavioral', reverse: false, text: '연인의 일정이나 인간관계를 통제하려 한 적이 있다' },
    { id: 'b4', subscale: 'behavioral', reverse: false, text: '질투심에 연인에게 따지거나 화를 낸 적이 있다' },
    { id: 'b5', subscale: 'behavioral', reverse: false, text: '연인의 SNS 친구나 팔로워를 살펴본 적이 있다' },
    { id: 'b6', subscale: 'behavioral', reverse: false, text: '연인이 특정 사람을 못 만나게 하고 싶을 때가 있다' },
    { id: 'b7', subscale: 'behavioral', reverse: false, text: '불안할 때 연인에게 더 자주 연락해 확인한다' },
  ],
  en: [
    { id: 'g1', subscale: 'cognitive', reverse: false, text: "When my partner is close with someone, I keep suspecting that relationship" },
    { id: 'g2', subscale: 'cognitive', reverse: false, text: 'I often think my partner might secretly be interested in someone else' },
    { id: 'g3', subscale: 'cognitive', reverse: false, text: "I sometimes dwell on my partner's past relationships" },
    { id: 'g4', subscale: 'cognitive', reverse: false, text: 'When my partner is late or unreachable, I imagine the worst' },
    { id: 'g5', subscale: 'cognitive', reverse: false, text: 'I am sometimes troubled by imagining my partner with someone else' },
    { id: 'g6', subscale: 'cognitive', reverse: false, text: "I often analyze the hidden intent behind my partner's words or actions" },
    { id: 'g7', subscale: 'cognitive', reverse: false, text: 'It bothers me when my partner praises someone else' },
    { id: 'b1', subscale: 'behavioral', reverse: false, text: "I feel the urge to check my partner's phone or social media" },
    { id: 'b2', subscale: 'behavioral', reverse: false, text: 'I frequently check who my partner is with' },
    { id: 'b3', subscale: 'behavioral', reverse: false, text: "I have tried to control my partner's schedule or relationships" },
    { id: 'b4', subscale: 'behavioral', reverse: false, text: 'I have confronted or gotten angry at my partner out of jealousy' },
    { id: 'b5', subscale: 'behavioral', reverse: false, text: "I have looked through my partner's social media friends or followers" },
    { id: 'b6', subscale: 'behavioral', reverse: false, text: 'I sometimes want to stop my partner from seeing certain people' },
    { id: 'b7', subscale: 'behavioral', reverse: false, text: 'When anxious, I contact my partner more often to check on them' },
  ],
  ja: [
    { id: 'g1', subscale: 'cognitive', reverse: false, text: '恋人が他の人と親しくするとその関係をつい疑ってしまう' },
    { id: 'g2', subscale: 'cognitive', reverse: false, text: '恋人が自分に隠れて他の人に関心を持つのではとよく考える' },
    { id: 'g3', subscale: 'cognitive', reverse: false, text: '恋人の過去の恋愛を思い出して気にする時がある' },
    { id: 'g4', subscale: 'cognitive', reverse: false, text: '恋人が遅れたり連絡が取れないと悪い想像をする' },
    { id: 'g5', subscale: 'cognitive', reverse: false, text: '恋人が異性と一緒にいる場面を想像して苦しい時がある' },
    { id: 'g6', subscale: 'cognitive', reverse: false, text: '恋人の言葉や行動の隠れた意図をよく分析する' },
    { id: 'g7', subscale: 'cognitive', reverse: false, text: '恋人が他の人を褒めると気持ちが落ち着かない' },
    { id: 'b1', subscale: 'behavioral', reverse: false, text: '恋人のスマホやSNSを確認したい衝動を感じる' },
    { id: 'b2', subscale: 'behavioral', reverse: false, text: '恋人が誰といるか頻繁に確認する' },
    { id: 'b3', subscale: 'behavioral', reverse: false, text: '恋人の予定や人間関係を統制しようとしたことがある' },
    { id: 'b4', subscale: 'behavioral', reverse: false, text: '嫉妬から恋人に問い詰めたり怒ったことがある' },
    { id: 'b5', subscale: 'behavioral', reverse: false, text: '恋人のSNSの友達やフォロワーを調べたことがある' },
    { id: 'b6', subscale: 'behavioral', reverse: false, text: '恋人が特定の人に会わないようにしたい時がある' },
    { id: 'b7', subscale: 'behavioral', reverse: false, text: '不安な時に恋人にもっと頻繁に連絡して確認する' },
  ],
}

function calcLevel(score: number): JealousyLevel {
  if (score <= 2.3) return 'secure'
  if (score <= 3.2) return 'mild'
  if (score <= 4.0) return 'watchful'
  return 'intense'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function JealousyTypeTest({ locale: lp = 'ko' }: Props) {
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
    const gItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'cognitive')
    const bItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'behavioral')
    const gScore = gItems.reduce((s, x) => s + x.adj, 0) / gItems.length
    const bScore = bItems.reduce((s, x) => s + x.adj, 0) / bItems.length
    const overall = (gScore + bScore) / 2
    return { gScore, bScore, overall }
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
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
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
              className="w-full rounded-xl border bg-card px-4 py-3 text-left text-sm hover:bg-accent hover:border-emerald-400 transition-colors flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-600 flex-none">
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

  const { gScore, bScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const gPct = Math.round(((gScore - 1) / 4) * 100)
  const bPct = Math.round(((bScore - 1) / 4) * 100)

  const levelColors: Record<JealousyLevel, string> = {
    secure: '#10b981',
    mild: '#0ea5e9',
    watchful: '#f59e0b',
    intense: '#ef4444',
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
            <span className="font-bold text-muted-foreground">{lb.cognitiveLabel}</span>
            <span className="font-bold" style={{ color }}>{gScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={gPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.cognitiveLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${gPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.behavioralLabel}</span>
            <span className="font-bold" style={{ color }}>{bScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={bPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.behavioralLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bPct}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-emerald-600">{lb.tipsLabel}</h3>
        <ul className="space-y-1">
          {ld.tips.map(tip => (
            <li key={tip} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-emerald-500">→</span>{tip}
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
          className="flex-1 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {lb.share}
        </button>
      </div>
        <ShareResultButton locale={lp} heading={lb.title} resultTitle={ld.title} />
    </div>
  )
}
