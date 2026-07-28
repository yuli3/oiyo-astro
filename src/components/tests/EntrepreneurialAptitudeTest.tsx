import { useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type EntreLevel = 'steady' | 'balanced' | 'venturesome' | 'bold'
type Subscale = 'risk' | 'proactive'

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
  yourScore: string; overallLabel: string; riskLabel: string; proactiveLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '창업가 기질 테스트',
    subtitle: '내 안의 기업가적 기질은 얼마나 될까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 창업가 기질 점수는',
    yourScore: '나의 창업가 기질 점수',
    overallLabel: '종합 창업가 기질',
    riskLabel: '위험 감수·혁신',
    proactiveLabel: '주도성',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '기업가적 지향성(Entrepreneurial Orientation: 위험감수·혁신성·주도성) 연구 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단이나 성공을 보장하지 않습니다.',
  },
  en: {
    title: 'Entrepreneurial Aptitude Test',
    subtitle: 'How strong is the entrepreneur within you?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My entrepreneurial aptitude score is',
    yourScore: 'Your Entrepreneurial Aptitude Score',
    overallLabel: 'Overall Entrepreneurial Aptitude',
    riskLabel: 'Risk-Taking & Innovation',
    proactiveLabel: 'Proactiveness',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: 'This self-reflection test is based on Entrepreneurial Orientation research (risk-taking, innovativeness, proactiveness). It does not replace professional assessment or guarantee success.',
  },
  ja: {
    title: '起業家気質テスト',
    subtitle: 'あなたの中の起業家気質はどれくらい？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の起業家気質スコアは',
    yourScore: 'あなたの起業家気質スコア',
    overallLabel: '総合起業家気質',
    riskLabel: 'リスク許容・革新性',
    proactiveLabel: '主導性',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストは起業家的志向性（リスク許容・革新性・主導性）研究の概念に基づく自己省察用です。専門的な診断や成功を保証するものではありません。',
  },
}

const LEVEL_DATA: Record<EntreLevel, Record<SupportedLang, LevelData>> = {
  steady: {
    ko: {
      icon: '🧱',
      title: '안정 선호형',
      description: '검증된 길에서 꾸준함과 안정감을 발휘합니다. 창업가 기질 점수는 낮지만, 이는 신뢰성·실행력이라는 다른 강점을 뜻하기도 합니다.',
      tips: [
        '안정 지향은 약점이 아닌 강점 — 신뢰가 필요한 역할에서 빛납니다.',
        '도전이 필요하면 작은 사이드 실험부터 안전하게 시작하세요.',
        '리스크를 감수하는 파트너와 팀을 이루면 시너지가 큽니다.',
      ],
    },
    en: {
      icon: '🧱',
      title: 'Stability-Oriented',
      description: 'You bring consistency and stability on proven paths. Your entrepreneurial score is low, but that also means other strengths like reliability and execution.',
      tips: [
        'A preference for stability is a strength, not a flaw—it shines in roles that need trust.',
        'If you want a challenge, start safely with a small side experiment.',
        'Teaming up with a risk-taking partner can create strong synergy.',
      ],
    },
    ja: {
      icon: '🧱',
      title: '安定志向型',
      description: '検証された道で着実さと安定感を発揮します。起業家気質スコアは低めですが、それは信頼性・実行力という別の強みでもあります。',
      tips: [
        '安定志向は弱点ではなく強み — 信頼が必要な役割で輝きます。',
        '挑戦したいなら小さなサイド実験から安全に始めましょう。',
        'リスクを取るパートナーと組むと大きな相乗効果が生まれます。',
      ],
    },
  },
  balanced: {
    ko: {
      icon: '⚖️',
      title: '균형 실행형',
      description: '안정과 도전 사이에서 균형을 잡습니다. 기회가 보이면 움직이되 무모하지 않게 판단하는 현실적 실행가입니다.',
      tips: [
        '계산된 위험(잃어도 감당 가능한 범위)을 정해 도전하세요.',
        '아이디어를 작게 테스트해 데이터로 확신을 키우세요.',
        '균형 감각을 살려 팀의 의사결정을 안정화하세요.',
      ],
    },
    en: {
      icon: '⚖️',
      title: 'Balanced Executor',
      description: 'You strike a balance between stability and challenge. You move when you see opportunity, but judge it without recklessness—a realistic doer.',
      tips: [
        'Take calculated risks within an "affordable loss" you can bear.',
        'Test ideas small to build conviction with data.',
        'Use your sense of balance to stabilize team decisions.',
      ],
    },
    ja: {
      icon: '⚖️',
      title: 'バランス実行型',
      description: '安定と挑戦の間でバランスを取ります。機会が見えれば動きますが、無謀にならず判断する現実的な実行者です。',
      tips: [
        '計算されたリスク（失っても耐えられる範囲）を定めて挑戦しましょう。',
        'アイデアを小さくテストしてデータで確信を育てましょう。',
        'バランス感覚を活かしてチームの意思決定を安定させましょう。',
      ],
    },
  },
  venturesome: {
    ko: {
      icon: '🚀',
      title: '모험 추진형',
      description: '기회 포착과 주도성이 높습니다. 새로운 시도를 즐기고 먼저 움직이는 추진력으로 변화를 만들어냅니다.',
      tips: [
        '강한 추진력에 실행 시스템(검증·피드백 루프)을 더하세요.',
        '아이디어를 끝까지 완수하는 마무리 근육을 키우세요.',
        '신중한 동료의 견제를 곁에 두어 위험을 보정하세요.',
      ],
    },
    en: {
      icon: '🚀',
      title: 'Venturesome',
      description: 'Your opportunity-spotting and initiative are high. You enjoy new attempts and create change with the drive to move first.',
      tips: [
        'Add execution systems (validation, feedback loops) to your strong drive.',
        'Build the "finishing muscle" to see ideas through to completion.',
        'Keep a cautious colleague nearby to balance your risks.',
      ],
    },
    ja: {
      icon: '🚀',
      title: '冒険推進型',
      description: '機会の捕捉と主導性が高いです。新しい試みを楽しみ、先に動く推進力で変化を生み出します。',
      tips: [
        '強い推進力に実行システム（検証・フィードバックループ）を加えましょう。',
        'アイデアを最後までやり遂げる「仕上げの筋肉」を鍛えましょう。',
        '慎重な同僚の抑制を傍に置いてリスクを補正しましょう。',
      ],
    },
  },
  bold: {
    ko: {
      icon: '🔥',
      title: '개척자형',
      description: '강한 위험 감수, 혁신성, 주도성을 모두 갖춘 전형적인 개척자 기질입니다. 불확실성 속에서 새로운 길을 만들어 나갑니다.',
      tips: [
        '비전을 구체적 마일스톤·현금흐름과 연결해 현실에 닻을 내리세요.',
        '에너지가 분산되지 않게 한두 기회에 집중하세요.',
        '실행·운영을 보완할 신뢰할 팀을 일찍 구축하세요.',
      ],
    },
    en: {
      icon: '🔥',
      title: 'Trailblazer',
      description: 'You combine strong risk-taking, innovativeness, and initiative—the classic trailblazer. You forge new paths amid uncertainty.',
      tips: [
        'Anchor your vision in reality with concrete milestones and cash flow.',
        'Focus on one or two opportunities so your energy is not scattered.',
        'Build a trusted team early to complement execution and operations.',
      ],
    },
    ja: {
      icon: '🔥',
      title: '開拓者型',
      description: '強いリスク許容・革新性・主導性をすべて備えた典型的な開拓者気質です。不確実性の中で新しい道を切り拓きます。',
      tips: [
        'ビジョンを具体的なマイルストーン・キャッシュフローと結びつけ現実に錨を下ろしましょう。',
        'エネルギーが分散しないよう一つ二つの機会に集中しましょう。',
        '実行・運営を補完する信頼できるチームを早く築きましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'r1', subscale: 'risk', reverse: false, text: '불확실하더라도 가능성이 보이면 도전하는 편이다' },
    { id: 'r2', subscale: 'risk', reverse: false, text: '안정적인 길보다 새로운 시도에 더 끌린다' },
    { id: 'r3', subscale: 'risk', reverse: false, text: '실패의 위험이 있어도 기회라면 잡는다' },
    { id: 'r4', subscale: 'risk', reverse: false, text: '기존 방식보다 더 나은 방법을 자꾸 떠올린다' },
    { id: 'r5', subscale: 'risk', reverse: false, text: '남들이 시도하지 않는 아이디어에 흥미를 느낀다' },
    { id: 'r6', subscale: 'risk', reverse: false, text: '손해를 감수하더라도 배움이 크다면 해본다' },
    { id: 'r7', subscale: 'risk', reverse: false, text: '변화와 불확실성이 나를 위축시키기보다 자극한다' },
    { id: 'p1', subscale: 'proactive', reverse: false, text: '누가 시키기 전에 먼저 움직이는 편이다' },
    { id: 'p2', subscale: 'proactive', reverse: false, text: '문제를 발견하면 직접 해결에 나선다' },
    { id: 'p3', subscale: 'proactive', reverse: false, text: '기회가 보이면 빠르게 행동으로 옮긴다' },
    { id: 'p4', subscale: 'proactive', reverse: false, text: '일이 굴러가도록 내가 주도하는 것을 즐긴다' },
    { id: 'p5', subscale: 'proactive', reverse: false, text: '목표가 생기면 스스로 계획을 세워 추진한다' },
    { id: 'p6', subscale: 'proactive', reverse: false, text: '주변 환경을 더 낫게 바꾸려고 적극적으로 시도한다' },
    { id: 'p7', subscale: 'proactive', reverse: false, text: '"언젠가"보다 "지금" 시작하는 편이다' },
  ],
  en: [
    { id: 'r1', subscale: 'risk', reverse: false, text: 'I tend to take on a challenge if I see potential, even when it is uncertain' },
    { id: 'r2', subscale: 'risk', reverse: false, text: 'I am more drawn to new attempts than to the safe path' },
    { id: 'r3', subscale: 'risk', reverse: false, text: 'I seize an opportunity even when there is a risk of failure' },
    { id: 'r4', subscale: 'risk', reverse: false, text: 'I keep thinking of better ways than the existing methods' },
    { id: 'r5', subscale: 'risk', reverse: false, text: 'I am intrigued by ideas that others are not trying' },
    { id: 'r6', subscale: 'risk', reverse: false, text: 'I will try something even at a loss if the learning is great' },
    { id: 'r7', subscale: 'risk', reverse: false, text: 'Change and uncertainty stimulate me rather than shrink me' },
    { id: 'p1', subscale: 'proactive', reverse: false, text: 'I tend to act before being told to' },
    { id: 'p2', subscale: 'proactive', reverse: false, text: 'When I spot a problem, I step in to solve it myself' },
    { id: 'p3', subscale: 'proactive', reverse: false, text: 'When I see an opportunity, I quickly turn it into action' },
    { id: 'p4', subscale: 'proactive', reverse: false, text: 'I enjoy taking the lead to keep things moving' },
    { id: 'p5', subscale: 'proactive', reverse: false, text: 'When I have a goal, I make my own plan and drive it forward' },
    { id: 'p6', subscale: 'proactive', reverse: false, text: 'I actively try to change my surroundings for the better' },
    { id: 'p7', subscale: 'proactive', reverse: false, text: 'I tend to start "now" rather than "someday"' },
  ],
  ja: [
    { id: 'r1', subscale: 'risk', reverse: false, text: '不確実でも可能性が見えれば挑戦する方だ' },
    { id: 'r2', subscale: 'risk', reverse: false, text: '安定した道より新しい試みに惹かれる' },
    { id: 'r3', subscale: 'risk', reverse: false, text: '失敗のリスクがあっても機会なら掴む' },
    { id: 'r4', subscale: 'risk', reverse: false, text: '既存のやり方よりもっと良い方法をよく思いつく' },
    { id: 'r5', subscale: 'risk', reverse: false, text: '他人が試さないアイデアに興味を感じる' },
    { id: 'r6', subscale: 'risk', reverse: false, text: '損を覚悟しても学びが大きければやってみる' },
    { id: 'r7', subscale: 'risk', reverse: false, text: '変化と不確実性は自分を萎縮させるより刺激する' },
    { id: 'p1', subscale: 'proactive', reverse: false, text: '誰かに言われる前に先に動く方だ' },
    { id: 'p2', subscale: 'proactive', reverse: false, text: '問題を見つけたら自ら解決に乗り出す' },
    { id: 'p3', subscale: 'proactive', reverse: false, text: '機会が見えれば素早く行動に移す' },
    { id: 'p4', subscale: 'proactive', reverse: false, text: '物事が進むよう自分が主導するのを楽しむ' },
    { id: 'p5', subscale: 'proactive', reverse: false, text: '目標ができると自分で計画を立てて推進する' },
    { id: 'p6', subscale: 'proactive', reverse: false, text: '周りの環境をより良く変えようと積極的に試みる' },
    { id: 'p7', subscale: 'proactive', reverse: false, text: '「いつか」より「今」始める方だ' },
  ],
}

function calcLevel(score: number): EntreLevel {
  if (score <= 2.5) return 'steady'
  if (score <= 3.3) return 'balanced'
  if (score <= 4.1) return 'venturesome'
  return 'bold'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function EntrepreneurialAptitudeTest({ locale: lp = 'ko' }: Props) {
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
    const rItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'risk')
    const pItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'proactive')
    const rScore = rItems.reduce((s, x) => s + x.adj, 0) / rItems.length
    const pScore = pItems.reduce((s, x) => s + x.adj, 0) / pItems.length
    const overall = (rScore + pScore) / 2
    return { rScore, pScore, overall }
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

  const { rScore, pScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const rPct = Math.round(((rScore - 1) / 4) * 100)
  const pPct = Math.round(((pScore - 1) / 4) * 100)

  const levelColors: Record<EntreLevel, string> = {
    steady: '#0ea5e9',
    balanced: '#10b981',
    venturesome: '#f59e0b',
    bold: '#f97316',
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
            <span className="font-bold text-muted-foreground">{lb.riskLabel}</span>
            <span className="font-bold" style={{ color }}>{rScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={rPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.riskLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.proactiveLabel}</span>
            <span className="font-bold" style={{ color }}>{pScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={pPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.proactiveLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pPct}%`, backgroundColor: color }} />
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
