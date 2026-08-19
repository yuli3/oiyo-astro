import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type CuriosityLevel = 'settled' | 'moderate' | 'curious' | 'explorer'
type Subscale = 'stretch' | 'embrace'

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
  yourScore: string; overallLabel: string; stretchLabel: string; embraceLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '호기심 테스트',
    subtitle: '나의 탐구심은 얼마나 깊을까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 호기심 점수는',
    yourScore: '나의 호기심 점수',
    overallLabel: '종합 호기심',
    stretchLabel: '탐색·자극 추구',
    embraceLabel: '불확실성 수용',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '카쉬단(Kashdan)의 호기심·탐구 척도(CEI-II) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Curiosity Test',
    subtitle: 'How deep does your curiosity run?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My curiosity score is',
    yourScore: 'Your Curiosity Score',
    overallLabel: 'Overall Curiosity',
    stretchLabel: 'Stretching (seeking)',
    embraceLabel: 'Embracing uncertainty',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: "This self-reflection test is based on Kashdan's Curiosity and Exploration Inventory (CEI-II) concept. It does not replace professional assessment.",
  },
  ja: {
    title: '好奇心テスト',
    subtitle: 'あなたの探究心はどれほど深いか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の好奇心スコアは',
    yourScore: 'あなたの好奇心スコア',
    overallLabel: '総合好奇心',
    stretchLabel: '探索・刺激追求',
    embraceLabel: '不確実性の受容',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはKashdanの好奇心・探究尺度（CEI-II）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<CuriosityLevel, Record<SupportedLang, LevelData>> = {
  settled: {
    ko: {
      icon: '🪴',
      title: '안정 선호형',
      description: '익숙하고 안정된 것에서 편안함을 느낍니다. 깊이의 강점이 있으며, 작은 새로움을 더하면 일상이 더 풍부해집니다.',
      tips: [
        '익숙한 길에 작은 변화 하나를 더해 보세요.',
        '관심 가는 주제를 가볍게 5분 검색해 보세요.',
        '"왜 그럴까?" 질문을 하루 한 번 던져 보세요.',
      ],
    },
    en: {
      icon: '🪴',
      title: 'Settled',
      description: 'You feel comfortable with the familiar and stable. You have the strength of depth; adding small novelty enriches daily life.',
      tips: [
        'Add one small change to a familiar routine.',
        'Lightly spend 5 minutes exploring a topic that interests you.',
        'Ask "why is that?" once a day.',
      ],
    },
    ja: {
      icon: '🪴',
      title: '安定志向型',
      description: '慣れた安定したものに心地よさを感じます。深さの強みがあり、小さな新しさを加えると日常がより豊かになります。',
      tips: [
        '慣れた道に小さな変化を一つ加えてみましょう。',
        '気になる話題を軽く5分調べてみましょう。',
        '「なぜそうなのか？」と一日一回問いかけましょう。',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌱',
      title: '균형 호기심형',
      description: '안정과 탐색 사이에서 균형을 이룹니다. 흥미가 생기면 알아보고, 익숙함도 즐기는 건강한 호기심을 지녔습니다.',
      tips: [
        '관심이 깊어지는 주제 하나를 정해 꾸준히 파보세요.',
        '낯선 경험을 한 달에 한 번 의도적으로 시도하세요.',
        '호기심을 메모로 모아 탐구 목록을 만드세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Balanced Curiosity',
      description: 'You balance stability and exploration. You look into things that interest you while also enjoying the familiar—a healthy curiosity.',
      tips: [
        'Pick one topic your interest deepens in and dig steadily.',
        'Intentionally try a new experience once a month.',
        'Collect your curiosities in notes to build an exploration list.',
      ],
    },
    ja: {
      icon: '🌱',
      title: 'バランス好奇心型',
      description: '安定と探索の間でバランスを取ります。興味が湧けば調べ、慣れも楽しむ健康的な好奇心を持っています。',
      tips: [
        '関心が深まる話題を一つ決めて着実に掘りましょう。',
        '月に一度、新しい経験を意図的に試しましょう。',
        '好奇心をメモに集めて探究リストを作りましょう。',
      ],
    },
  },
  curious: {
    ko: {
      icon: '🔭',
      title: '호기심 풍부형',
      description: '새로운 것을 배우고 탐색하는 데서 강한 즐거움을 느낍니다. 풍부한 호기심이 성장과 창의성의 원천이 됩니다.',
      tips: [
        '넓은 관심을 한두 가지 깊은 탐구로 모아 보세요.',
        '배운 것을 기록·공유해 지식을 자산으로 만드세요.',
        '호기심을 새로운 사람·분야와의 연결로 확장하세요.',
      ],
    },
    en: {
      icon: '🔭',
      title: 'Highly Curious',
      description: 'You find strong joy in learning and exploring new things. Rich curiosity becomes a source of growth and creativity.',
      tips: [
        'Channel broad interests into one or two deep inquiries.',
        'Record and share what you learn to turn knowledge into an asset.',
        'Extend curiosity into connections with new people and fields.',
      ],
    },
    ja: {
      icon: '🔭',
      title: '好奇心豊富型',
      description: '新しいことを学び探索することに強い喜びを感じます。豊かな好奇心が成長と創造性の源になります。',
      tips: [
        '広い関心を一つ二つの深い探究にまとめましょう。',
        '学んだことを記録・共有して知識を資産にしましょう。',
        '好奇心を新しい人や分野とのつながりに広げましょう。',
      ],
    },
  },
  explorer: {
    ko: {
      icon: '🚀',
      title: '탐험가형',
      description: '매우 높은 호기심과 탐구심을 지녔습니다. 불확실함을 가능성으로 받아들이며 끊임없이 새로움을 추구합니다.',
      tips: [
        '에너지가 분산되지 않게 핵심 탐구 주제를 정하세요.',
        '시작한 탐구를 끝까지 완수하는 마무리 근육을 키우세요.',
        '발견과 통찰을 글·창작으로 세상과 나눠 보세요.',
      ],
    },
    en: {
      icon: '🚀',
      title: 'Explorer',
      description: 'You possess very high curiosity and a drive to inquire. You embrace uncertainty as possibility and constantly seek novelty.',
      tips: [
        'Choose a core inquiry so your energy is not scattered.',
        'Build the finishing muscle to complete the inquiries you start.',
        'Share your discoveries and insights with the world through writing or creating.',
      ],
    },
    ja: {
      icon: '🚀',
      title: '探検家型',
      description: '非常に高い好奇心と探究心を持っています。不確実さを可能性として受け入れ、絶えず新しさを追求します。',
      tips: [
        'エネルギーが分散しないよう核心の探究テーマを決めましょう。',
        '始めた探究を最後までやり遂げる仕上げの筋肉を鍛えましょう。',
        '発見や洞察を文章や創作で世界と分かち合いましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 's1', subscale: 'stretch', reverse: false, text: '새로운 것을 배우는 데서 즐거움을 느낀다' },
    { id: 's2', subscale: 'stretch', reverse: false, text: '낯선 분야나 주제를 탐색하는 것을 좋아한다' },
    { id: 's3', subscale: 'stretch', reverse: false, text: '흥미로운 질문이 생기면 끝까지 알아본다' },
    { id: 's4', subscale: 'stretch', reverse: false, text: '새로운 경험을 적극적으로 찾아 나선다' },
    { id: 's5', subscale: 'stretch', reverse: false, text: '복잡하거나 도전적인 것에 끌린다' },
    { id: 's6', subscale: 'stretch', reverse: false, text: '일상에서도 "왜?"라는 질문을 자주 한다' },
    { id: 's7', subscale: 'stretch', reverse: false, text: '모르던 것을 알아가는 과정 자체가 즐겁다' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: '예측할 수 없는 상황을 흥미롭게 받아들인다' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: '불확실함을 위협이 아닌 가능성으로 본다' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: '익숙하지 않은 상황에서도 호기심이 앞선다' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: '계획에 없던 일도 새로운 기회로 즐긴다' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: '답이 정해지지 않은 모호한 문제가 재미있다' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: '변화와 새로움이 나를 설레게 한다' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: '낯선 사람·문화·관점을 알아가고 싶다' },
  ],
  en: [
    { id: 's1', subscale: 'stretch', reverse: false, text: 'I find joy in learning new things' },
    { id: 's2', subscale: 'stretch', reverse: false, text: 'I like exploring unfamiliar fields or topics' },
    { id: 's3', subscale: 'stretch', reverse: false, text: 'When an interesting question arises, I look into it thoroughly' },
    { id: 's4', subscale: 'stretch', reverse: false, text: 'I actively seek out new experiences' },
    { id: 's5', subscale: 'stretch', reverse: false, text: 'I am drawn to complex or challenging things' },
    { id: 's6', subscale: 'stretch', reverse: false, text: 'I often ask "why?" even in everyday life' },
    { id: 's7', subscale: 'stretch', reverse: false, text: 'The process of learning what I did not know is enjoyable in itself' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: 'I find unpredictable situations interesting' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: 'I see uncertainty as possibility rather than threat' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: 'Even in unfamiliar situations, curiosity comes first' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: 'I enjoy unplanned events as new opportunities' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: 'I find ambiguous problems without set answers fun' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: 'Change and novelty excite me' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: 'I want to get to know unfamiliar people, cultures, and viewpoints' },
  ],
  ja: [
    { id: 's1', subscale: 'stretch', reverse: false, text: '新しいことを学ぶことに喜びを感じる' },
    { id: 's2', subscale: 'stretch', reverse: false, text: '不慣れな分野や話題を探索するのが好きだ' },
    { id: 's3', subscale: 'stretch', reverse: false, text: '興味深い疑問が生じると最後まで調べる' },
    { id: 's4', subscale: 'stretch', reverse: false, text: '新しい経験を積極的に探し求める' },
    { id: 's5', subscale: 'stretch', reverse: false, text: '複雑で挑戦的なことに惹かれる' },
    { id: 's6', subscale: 'stretch', reverse: false, text: '日常でも「なぜ？」とよく問う' },
    { id: 's7', subscale: 'stretch', reverse: false, text: '知らなかったことを知る過程そのものが楽しい' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: '予測できない状況を興味深く受け止める' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: '不確実さを脅威ではなく可能性と見る' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: '不慣れな状況でも好奇心が先に立つ' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: '計画になかったことも新しい機会として楽しむ' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: '答えが定まらない曖昧な問題が面白い' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: '変化と新しさが自分をわくわくさせる' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: '不慣れな人・文化・視点を知りたい' },
  ],
}

function calcLevel(score: number): CuriosityLevel {
  if (score <= 2.5) return 'settled'
  if (score <= 3.5) return 'moderate'
  if (score <= 4.3) return 'curious'
  return 'explorer'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function CuriosityTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "curiosity", title: "CuriosityTest", finished: Boolean(done) });

  function pick(val: number) {
    const next = answers.slice(0, current)
    next[current] = val
    if (current + 1 >= questions.length) {
      setAnswers(next)
      setDone(true)
    } else {
      setAnswers(next)
      setCurrent(current + 1)
    }
  }

  function previous() {
    if (current === 0) return
    setCurrent(current - 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setDone(false) }

  function calcScores(ans: number[]) {
    const adjusted = questions.map((q, i) => adjustScore(ans[i] ?? 1, q.reverse))
    const sItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'stretch')
    const eItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'embrace')
    const sScore = sItems.reduce((s, x) => s + x.adj, 0) / sItems.length
    const eScore = eItems.reduce((s, x) => s + x.adj, 0) / eItems.length
    const overall = (sScore + eScore) / 2
    return { sScore, eScore, overall }
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

  const { sScore, eScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const sPct = Math.round(((sScore - 1) / 4) * 100)
  const ePct = Math.round(((eScore - 1) / 4) * 100)

  const levelColors: Record<CuriosityLevel, string> = {
    settled: '#6ee7b7',
    moderate: '#34d399',
    curious: '#10b981',
    explorer: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.stretchLabel}</span>
            <span className="font-bold" style={{ color }}>{sScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={sPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.stretchLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.embraceLabel}</span>
            <span className="font-bold" style={{ color }}>{eScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={ePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.embraceLabel}
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
