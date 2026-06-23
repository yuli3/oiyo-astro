import { useState } from 'react'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type PlayLevel = 'serious' | 'balanced' | 'playful' | 'spirited'
type Subscale = 'light' | 'social'

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
  yourScore: string; overallLabel: string; lightLabel: string; socialLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '놀이성 테스트',
    subtitle: '내 안의 장난기와 유쾌함은 얼마나 될까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 놀이성 점수는',
    yourScore: '나의 놀이성 점수',
    overallLabel: '종합 놀이성',
    lightLabel: '유쾌·즉흥',
    socialLabel: '관계적 놀이성',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '프로이어(Proyer)의 성인 놀이성(playfulness) 연구 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Playfulness Test',
    subtitle: 'How much playfulness and lightness is in you?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My playfulness score is',
    yourScore: 'Your Playfulness Score',
    overallLabel: 'Overall Playfulness',
    lightLabel: 'Lightheartedness',
    socialLabel: 'Social Playfulness',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: "This self-reflection test is based on Proyer's adult playfulness research. It does not replace professional assessment.",
  },
  ja: {
    title: '遊び心テスト',
    subtitle: 'あなたの中の遊び心と陽気さはどれくらい？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の遊び心スコアは',
    yourScore: 'あなたの遊び心スコア',
    overallLabel: '総合遊び心',
    lightLabel: '陽気・即興',
    socialLabel: '関係的遊び心',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはProyerの成人の遊び心（playfulness）研究の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<PlayLevel, Record<SupportedLang, LevelData>> = {
  serious: {
    ko: {
      icon: '🍵',
      title: '진중·차분형',
      description: '진지하고 차분하게 삶을 대합니다. 깊이와 신중함이 강점이며, 작은 장난기를 더하면 일상이 더 가벼워집니다.',
      tips: [
        '하루에 한 번 의도적으로 "재미" 한 조각을 끼워 넣으세요.',
        '실수나 어색함을 가볍게 웃어넘기는 연습을 해보세요.',
        '놀이성이 강한 사람과 어울리며 그 에너지를 빌려보세요.',
      ],
    },
    en: {
      icon: '🍵',
      title: 'Serious & Calm',
      description: 'You approach life seriously and calmly. Depth and prudence are your strengths; adding a little playfulness lightens daily life.',
      tips: [
        'Intentionally slip one piece of "fun" into each day.',
        'Practice laughing off mistakes and awkward moments.',
        'Spend time with playful people and borrow their energy.',
      ],
    },
    ja: {
      icon: '🍵',
      title: '真摯・落ち着き型',
      description: '真剣で落ち着いて人生に向き合います。深さと慎重さが強みで、少しの遊び心を加えると日常が軽くなります。',
      tips: [
        '一日一回、意図的に「楽しさ」を一つ挟みましょう。',
        '失敗や気まずさを軽く笑い飛ばす練習をしましょう。',
        '遊び心の強い人と過ごしそのエネルギーを借りましょう。',
      ],
    },
  },
  balanced: {
    ko: {
      icon: '🙂',
      title: '균형 놀이형',
      description: '진지함과 유쾌함의 균형이 좋습니다. 상황에 맞게 즐거움을 더하고, 필요할 때 집중하는 유연함이 있습니다.',
      tips: [
        '잘 통하는 사람과 장난을 주고받으며 놀이성을 키우세요.',
        '일상의 루틴에 작은 즐거움을 디자인해 넣으세요.',
        '스트레스 상황에서 유머를 완충 장치로 활용해 보세요.',
      ],
    },
    en: {
      icon: '🙂',
      title: 'Balanced Play',
      description: 'You balance seriousness and lightness well. You add fun when fitting and focus when needed—a flexible mix.',
      tips: [
        'Trade jokes with people you click with to grow your playfulness.',
        'Design small joys into your daily routines.',
        'Use humor as a buffer in stressful situations.',
      ],
    },
    ja: {
      icon: '🙂',
      title: 'バランス遊び型',
      description: '真剣さと陽気さのバランスが良いです。状況に応じて楽しさを加え、必要な時に集中する柔軟さがあります。',
      tips: [
        '気の合う人と冗談を交わして遊び心を育てましょう。',
        '日常のルーティンに小さな楽しみを設計して入れましょう。',
        'ストレス状況でユーモアを緩衝装置として活用しましょう。',
      ],
    },
  },
  playful: {
    ko: {
      icon: '🎈',
      title: '유쾌 놀이형',
      description: '장난기와 유쾌함이 풍부합니다. 일상에서 재미를 잘 찾고, 주변 분위기를 밝게 만드는 힘이 있습니다.',
      tips: [
        '놀이성을 창의성·문제해결에도 적극 활용해 보세요.',
        '진지함이 필요한 순간을 분별하는 감각도 함께 키우세요.',
        '당신의 유쾌함을 지친 사람들과 나눠 보세요.',
      ],
    },
    en: {
      icon: '🎈',
      title: 'Playful',
      description: 'Your playfulness and lightness are rich. You find fun in daily life and brighten the mood around you.',
      tips: [
        'Channel playfulness into creativity and problem-solving too.',
        'Also cultivate a sense for when seriousness is needed.',
        'Share your lightness with people who are worn out.',
      ],
    },
    ja: {
      icon: '🎈',
      title: '陽気遊び型',
      description: '遊び心と陽気さが豊かです。日常で楽しさをよく見つけ、周りの雰囲気を明るくする力があります。',
      tips: [
        '遊び心を創造性や問題解決にも積極的に活かしましょう。',
        '真剣さが必要な瞬間を見分ける感覚も育てましょう。',
        'あなたの陽気さを疲れた人と分かち合いましょう。',
      ],
    },
  },
  spirited: {
    ko: {
      icon: '🎉',
      title: '놀이 가득형',
      description: '매우 높은 놀이성을 지녔습니다. 어디서든 즐거움을 만들어내는 활력이 강점이며, 깊이·진지함과 함께라면 더 빛납니다.',
      tips: [
        '놀이의 에너지를 의미 있는 목표·창작으로 연결해 보세요.',
        '진지한 자리에서의 강약 조절 감각을 함께 키우세요.',
        '당신의 활력으로 공동체에 즐거움과 연결을 선물하세요.',
      ],
    },
    en: {
      icon: '🎉',
      title: 'Spirited',
      description: 'You possess very high playfulness. Your vitality to create fun anywhere is a strength, and it shines even more paired with depth and seriousness.',
      tips: [
        'Connect playful energy to meaningful goals and creation.',
        'Cultivate a sense of when to dial it up or down in serious settings.',
        'Gift your vitality as joy and connection to your community.',
      ],
    },
    ja: {
      icon: '🎉',
      title: '遊び満載型',
      description: '非常に高い遊び心を持っています。どこでも楽しさを生み出す活力が強みで、深さ・真剣さと共にあればさらに輝きます。',
      tips: [
        '遊びのエネルギーを意味ある目標や創作につなげましょう。',
        '真剣な場での強弱の調整感覚も育てましょう。',
        'あなたの活力で共同体に楽しさとつながりを贈りましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'l1', subscale: 'light', reverse: false, text: '사소한 일상에서도 재미를 잘 찾는다' },
    { id: 'l2', subscale: 'light', reverse: false, text: '즉흥적으로 장난치거나 웃긴 상상을 한다' },
    { id: 'l3', subscale: 'light', reverse: false, text: '지루한 상황도 놀이처럼 바꾸곤 한다' },
    { id: 'l4', subscale: 'light', reverse: false, text: '엉뚱하고 기발한 생각을 즐긴다' },
    { id: 'l5', subscale: 'light', reverse: false, text: '새로운 놀이나 활동을 시도하는 것을 좋아한다' },
    { id: 'l6', subscale: 'light', reverse: false, text: '실수해도 가볍게 웃어넘기는 편이다' },
    { id: 'l7', subscale: 'light', reverse: false, text: '호기심과 장난기로 일상을 대한다' },
    { id: 's1', subscale: 'social', reverse: false, text: '사람들과 농담을 주고받는 것을 즐긴다' },
    { id: 's2', subscale: 'social', reverse: false, text: '분위기를 즐겁게 만드는 역할을 잘 한다' },
    { id: 's3', subscale: 'social', reverse: false, text: '친구들과 장난치며 노는 것이 즐겁다' },
    { id: 's4', subscale: 'social', reverse: false, text: '유머로 긴장을 풀어주곤 한다' },
    { id: 's5', subscale: 'social', reverse: false, text: '함께 웃을 거리를 잘 만든다' },
    { id: 's6', subscale: 'social', reverse: false, text: '놀이를 통해 사람들과 가까워진다' },
    { id: 's7', subscale: 'social', reverse: false, text: '진지한 자리에서도 유쾌함을 잃지 않는다' },
  ],
  en: [
    { id: 'l1', subscale: 'light', reverse: false, text: 'I find fun even in small everyday things' },
    { id: 'l2', subscale: 'light', reverse: false, text: 'I spontaneously joke around or imagine funny things' },
    { id: 'l3', subscale: 'light', reverse: false, text: 'I tend to turn even boring situations into play' },
    { id: 'l4', subscale: 'light', reverse: false, text: 'I enjoy quirky, whimsical ideas' },
    { id: 'l5', subscale: 'light', reverse: false, text: 'I like trying new games or activities' },
    { id: 'l6', subscale: 'light', reverse: false, text: 'I tend to laugh off my mistakes lightly' },
    { id: 'l7', subscale: 'light', reverse: false, text: 'I approach daily life with curiosity and mischief' },
    { id: 's1', subscale: 'social', reverse: false, text: 'I enjoy trading jokes with people' },
    { id: 's2', subscale: 'social', reverse: false, text: 'I am good at lightening up the mood' },
    { id: 's3', subscale: 'social', reverse: false, text: 'I enjoy goofing around with friends' },
    { id: 's4', subscale: 'social', reverse: false, text: 'I use humor to ease tension' },
    { id: 's5', subscale: 'social', reverse: false, text: 'I am good at creating things to laugh about together' },
    { id: 's6', subscale: 'social', reverse: false, text: 'I grow closer to people through play' },
    { id: 's7', subscale: 'social', reverse: false, text: 'I keep a sense of fun even in serious settings' },
  ],
  ja: [
    { id: 'l1', subscale: 'light', reverse: false, text: '些細な日常でも楽しさをよく見つける' },
    { id: 'l2', subscale: 'light', reverse: false, text: '即興でふざけたり面白い想像をする' },
    { id: 'l3', subscale: 'light', reverse: false, text: '退屈な状況も遊びのように変えることがある' },
    { id: 'l4', subscale: 'light', reverse: false, text: '突飛で奇抜な発想を楽しむ' },
    { id: 'l5', subscale: 'light', reverse: false, text: '新しい遊びや活動を試すのが好きだ' },
    { id: 'l6', subscale: 'light', reverse: false, text: '失敗しても軽く笑い飛ばす方だ' },
    { id: 'l7', subscale: 'light', reverse: false, text: '好奇心と遊び心で日常に向き合う' },
    { id: 's1', subscale: 'social', reverse: false, text: '人と冗談を交わすのを楽しむ' },
    { id: 's2', subscale: 'social', reverse: false, text: '雰囲気を楽しくする役割が得意だ' },
    { id: 's3', subscale: 'social', reverse: false, text: '友達とふざけて遊ぶのが楽しい' },
    { id: 's4', subscale: 'social', reverse: false, text: 'ユーモアで緊張をほぐすことがある' },
    { id: 's5', subscale: 'social', reverse: false, text: '一緒に笑えるネタを作るのが得意だ' },
    { id: 's6', subscale: 'social', reverse: false, text: '遊びを通じて人と近づく' },
    { id: 's7', subscale: 'social', reverse: false, text: '真剣な場でも陽気さを失わない' },
  ],
}

function calcLevel(score: number): PlayLevel {
  if (score <= 2.5) return 'serious'
  if (score <= 3.5) return 'balanced'
  if (score <= 4.3) return 'playful'
  return 'spirited'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function PlayfulnessTest({ locale: lp = 'ko' }: Props) {
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
    const lItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'light')
    const sItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'social')
    const lScore = lItems.reduce((s, x) => s + x.adj, 0) / lItems.length
    const sScore = sItems.reduce((s, x) => s + x.adj, 0) / sItems.length
    const overall = (lScore + sScore) / 2
    return { lScore, sScore, overall }
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

  const { lScore, sScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const lPct = Math.round(((lScore - 1) / 4) * 100)
  const sPct = Math.round(((sScore - 1) / 4) * 100)

  const levelColors: Record<PlayLevel, string> = {
    serious: '#64748b',
    balanced: '#10b981',
    playful: '#f59e0b',
    spirited: '#ec4899',
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
            <span className="font-bold text-muted-foreground">{lb.lightLabel}</span>
            <span className="font-bold" style={{ color }}>{lScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={lPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.lightLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${lPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.socialLabel}</span>
            <span className="font-bold" style={{ color }}>{sScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={sPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.socialLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sPct}%`, backgroundColor: color }} />
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
    </div>
  )
}
