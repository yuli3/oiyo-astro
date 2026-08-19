import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type ExprLevel = 'reserved' | 'moderate' | 'expressive' | 'open'
type Subscale = 'positive' | 'negative'

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
  yourScore: string; overallLabel: string; positiveLabel: string; negativeLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '정서표현성 테스트',
    subtitle: '나는 내 감정을 얼마나 드러내는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 정서표현성 점수는',
    yourScore: '나의 정서표현성 점수',
    overallLabel: '종합 정서표현성',
    positiveLabel: '긍정 정서 표현',
    negativeLabel: '부정·취약 정서 표현',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '그로스와 존(Gross & John)의 정서표현성 연구(Berkeley Expressivity) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Emotional Expressiveness Test',
    subtitle: 'How much do you show your emotions?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My expressiveness score is',
    yourScore: 'Your Expressiveness Score',
    overallLabel: 'Overall Expressiveness',
    positiveLabel: 'Positive Expressivity',
    negativeLabel: 'Negative/Vulnerable Expressivity',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: "This self-reflection test is based on Gross & John's emotional expressivity research (Berkeley Expressivity). It does not replace professional assessment.",
  },
  ja: {
    title: '感情表現性テスト',
    subtitle: '自分の感情をどれくらい表に出すか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の感情表現性スコアは',
    yourScore: 'あなたの感情表現性スコア',
    overallLabel: '総合感情表現性',
    positiveLabel: '肯定的感情の表現',
    negativeLabel: '否定的・脆弱な感情の表現',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはGross & Johnの感情表現性研究（Berkeley Expressivity）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<ExprLevel, Record<SupportedLang, LevelData>> = {
  reserved: {
    ko: {
      icon: '🌙',
      title: '차분·절제형',
      description: '감정을 안으로 간직하는 편입니다. 차분함과 신중함이 강점이며, 가까운 관계에서 조금 더 표현하면 친밀감이 깊어집니다.',
      tips: [
        '신뢰하는 한 사람에게 작은 감정부터 말로 표현해 보세요.',
        '"나는 ~을 느낀다"는 문장으로 감정에 이름을 붙이세요.',
        '긍정 감정(고마움·기쁨)부터 표현 연습을 시작하세요.',
      ],
    },
    en: {
      icon: '🌙',
      title: 'Reserved',
      description: 'You tend to keep emotions inside. Calmness and prudence are your strengths; expressing a bit more in close relationships deepens intimacy.',
      tips: [
        'Try voicing small feelings to one person you trust.',
        'Name emotions with "I feel ___" statements.',
        'Start practice with positive emotions (gratitude, joy).',
      ],
    },
    ja: {
      icon: '🌙',
      title: '落ち着き・抑制型',
      description: '感情を内に秘める方です。落ち着きと慎重さが強みで、近い関係でもう少し表現すると親密さが深まります。',
      tips: [
        '信頼する一人に小さな感情から言葉で表現してみましょう。',
        '「私は〜を感じる」という文で感情に名前をつけましょう。',
        '肯定的な感情（感謝・喜び）から表現練習を始めましょう。',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌤️',
      title: '균형 표현형',
      description: '상황과 상대에 맞게 감정을 적절히 표현합니다. 솔직함과 절제 사이에서 유연한 균형을 지니고 있습니다.',
      tips: [
        '표현을 미뤘던 순간을 돌아보며 패턴을 찾아보세요.',
        '부정 감정도 비난 없이 표현하는 연습을 더해 보세요.',
        '표현 후 상대의 반응을 경청하며 소통을 깊게 하세요.',
      ],
    },
    en: {
      icon: '🌤️',
      title: 'Balanced Expressivity',
      description: 'You express emotions appropriately for the situation and person. You hold a flexible balance between honesty and restraint.',
      tips: [
        'Review moments you held back to find patterns.',
        'Add practice expressing negative emotions without blame.',
        'Listen to reactions after expressing to deepen communication.',
      ],
    },
    ja: {
      icon: '🌤️',
      title: 'バランス表現型',
      description: '状況や相手に合わせて感情を適切に表現します。正直さと抑制の間で柔軟なバランスを持っています。',
      tips: [
        '表現を控えた瞬間を振り返ってパターンを探しましょう。',
        '否定的な感情も非難せず表現する練習を加えましょう。',
        '表現後に相手の反応を傾聴して対話を深めましょう。',
      ],
    },
  },
  expressive: {
    ko: {
      icon: '☀️',
      title: '풍부 표현형',
      description: '감정을 풍부하고 솔직하게 드러냅니다. 진솔한 표현이 관계를 따뜻하게 하고 사람들과의 연결을 깊게 만듭니다.',
      tips: [
        '표현의 강도가 상대·상황에 잘 맞는지 가끔 점검하세요.',
        '표현만큼 상대의 감정을 듣는 균형도 유지하세요.',
        '풍부한 표현력을 공감과 위로의 도구로 활용하세요.',
      ],
    },
    en: {
      icon: '☀️',
      title: 'Expressive',
      description: 'You show emotions richly and honestly. Genuine expression warms relationships and deepens your connections with others.',
      tips: [
        'Occasionally check that your intensity fits the person and situation.',
        'Balance expressing with listening to others\' emotions.',
        'Use your rich expressiveness as a tool for empathy and comfort.',
      ],
    },
    ja: {
      icon: '☀️',
      title: '豊か表現型',
      description: '感情を豊かに正直に表します。素直な表現が関係を温かくし、人とのつながりを深めます。',
      tips: [
        '表現の強さが相手や状況に合っているか時々点検しましょう。',
        '表現と同じく相手の感情を聞くバランスも保ちましょう。',
        '豊かな表現力を共感と慰めの道具として活かしましょう。',
      ],
    },
  },
  open: {
    ko: {
      icon: '🌈',
      title: '활짝 표현형',
      description: '감정을 매우 활짝 드러냅니다. 진솔함과 생기가 강점이며, 때로는 표현의 완급과 상대의 속도를 함께 살피면 더 깊어집니다.',
      tips: [
        '감정의 파도가 클 때는 잠시 멈춰 표현을 고르는 여유를 두세요.',
        '표현이 상대를 압도하지 않는지 가끔 점검하세요.',
        '솔직함을 경청·공감과 함께 발휘하면 신뢰가 깊어집니다.',
      ],
    },
    en: {
      icon: '🌈',
      title: 'Wide Open',
      description: 'You show emotions very openly. Authenticity and vitality are strengths; attending to pacing and others\' tempo deepens it further.',
      tips: [
        'When emotional waves are big, pause to choose how to express.',
        'Occasionally check that your expression does not overwhelm others.',
        'Pairing honesty with listening and empathy deepens trust.',
      ],
    },
    ja: {
      icon: '🌈',
      title: '全開表現型',
      description: '感情を非常にオープンに表します。素直さと生き生きとした活力が強みで、時に表現の緩急や相手のペースを見ると一層深まります。',
      tips: [
        '感情の波が大きい時は一度止まって表現を選ぶ余裕を持ちましょう。',
        '表現が相手を圧倒していないか時々点検しましょう。',
        '素直さを傾聴・共感と共に発揮すると信頼が深まります。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'p1', subscale: 'positive', reverse: false, text: '기쁘거나 즐거우면 자연스럽게 드러낸다' },
    { id: 'p2', subscale: 'positive', reverse: false, text: '좋아하는 마음을 잘 표현한다' },
    { id: 'p3', subscale: 'positive', reverse: false, text: '고마움을 말이나 행동으로 표현한다' },
    { id: 'p4', subscale: 'positive', reverse: false, text: '감동하면 그 감정을 숨기지 않는다' },
    { id: 'p5', subscale: 'positive', reverse: false, text: '웃음이나 환호가 자연스럽게 나온다' },
    { id: 'p6', subscale: 'positive', reverse: false, text: '애정을 표현하는 것이 편하다' },
    { id: 'p7', subscale: 'positive', reverse: false, text: '사람들 앞에서도 즐거움을 잘 드러낸다' },
    { id: 'n1', subscale: 'negative', reverse: false, text: '슬프거나 힘들 때 그 감정을 표현한다' },
    { id: 'n2', subscale: 'negative', reverse: false, text: '화가 나면 적절히 드러내는 편이다' },
    { id: 'n3', subscale: 'negative', reverse: false, text: '두렵거나 불안한 마음을 솔직히 말한다' },
    { id: 'n4', subscale: 'negative', reverse: false, text: '속상할 때 참기보다 표현하는 편이다' },
    { id: 'n5', subscale: 'negative', reverse: false, text: '약한 모습을 보이는 것을 두려워하지 않는다' },
    { id: 'n6', subscale: 'negative', reverse: false, text: '도움이 필요할 때 솔직히 요청한다' },
    { id: 'n7', subscale: 'negative', reverse: false, text: '내 감정을 얼굴이나 말로 잘 드러내는 편이다' },
  ],
  en: [
    { id: 'p1', subscale: 'positive', reverse: false, text: 'When happy or joyful, I show it naturally' },
    { id: 'p2', subscale: 'positive', reverse: false, text: 'I express my fondness well' },
    { id: 'p3', subscale: 'positive', reverse: false, text: 'I express gratitude in words or actions' },
    { id: 'p4', subscale: 'positive', reverse: false, text: 'When moved, I do not hide the feeling' },
    { id: 'p5', subscale: 'positive', reverse: false, text: 'Laughter or cheers come out of me naturally' },
    { id: 'p6', subscale: 'positive', reverse: false, text: 'I am comfortable expressing affection' },
    { id: 'p7', subscale: 'positive', reverse: false, text: 'I readily show joy even in front of others' },
    { id: 'n1', subscale: 'negative', reverse: false, text: 'When sad or hurting, I express the feeling' },
    { id: 'n2', subscale: 'negative', reverse: false, text: 'When angry, I tend to show it appropriately' },
    { id: 'n3', subscale: 'negative', reverse: false, text: 'I honestly voice fear or anxiety' },
    { id: 'n4', subscale: 'negative', reverse: false, text: 'When upset, I tend to express rather than hold it in' },
    { id: 'n5', subscale: 'negative', reverse: false, text: 'I am not afraid to show vulnerability' },
    { id: 'n6', subscale: 'negative', reverse: false, text: 'I honestly ask for help when I need it' },
    { id: 'n7', subscale: 'negative', reverse: false, text: 'I tend to show my emotions through my face or words' },
  ],
  ja: [
    { id: 'p1', subscale: 'positive', reverse: false, text: '嬉しかったり楽しいと自然に表す' },
    { id: 'p2', subscale: 'positive', reverse: false, text: '好きな気持ちをよく表現する' },
    { id: 'p3', subscale: 'positive', reverse: false, text: '感謝を言葉や行動で表現する' },
    { id: 'p4', subscale: 'positive', reverse: false, text: '感動するとその感情を隠さない' },
    { id: 'p5', subscale: 'positive', reverse: false, text: '笑いや歓声が自然に出る' },
    { id: 'p6', subscale: 'positive', reverse: false, text: '愛情を表現するのが楽だ' },
    { id: 'p7', subscale: 'positive', reverse: false, text: '人前でも楽しさをよく表す' },
    { id: 'n1', subscale: 'negative', reverse: false, text: '悲しい・辛い時その感情を表現する' },
    { id: 'n2', subscale: 'negative', reverse: false, text: '怒ったら適切に表す方だ' },
    { id: 'n3', subscale: 'negative', reverse: false, text: '怖さや不安を正直に言う' },
    { id: 'n4', subscale: 'negative', reverse: false, text: '腹が立つ時、我慢より表現する方だ' },
    { id: 'n5', subscale: 'negative', reverse: false, text: '弱い姿を見せることを恐れない' },
    { id: 'n6', subscale: 'negative', reverse: false, text: '助けが必要な時、正直に頼む' },
    { id: 'n7', subscale: 'negative', reverse: false, text: '自分の感情を顔や言葉でよく表す方だ' },
  ],
}

function calcLevel(score: number): ExprLevel {
  if (score <= 2.5) return 'reserved'
  if (score <= 3.5) return 'moderate'
  if (score <= 4.3) return 'expressive'
  return 'open'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function EmotionalExpressivenessTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "emotional-expressiveness", title: "EmotionalExpressivenessTest", finished: Boolean(done) });

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
    const pItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'positive')
    const nItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'negative')
    const pScore = pItems.reduce((s, x) => s + x.adj, 0) / pItems.length
    const nScore = nItems.reduce((s, x) => s + x.adj, 0) / nItems.length
    const overall = (pScore + nScore) / 2
    return { pScore, nScore, overall }
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

  const { pScore, nScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const pPct = Math.round(((pScore - 1) / 4) * 100)
  const nPct = Math.round(((nScore - 1) / 4) * 100)

  const levelColors: Record<ExprLevel, string> = {
    reserved: '#6ee7b7',
    moderate: '#34d399',
    expressive: '#10b981',
    open: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.positiveLabel}</span>
            <span className="font-bold" style={{ color }}>{pScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={pPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.positiveLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.negativeLabel}</span>
            <span className="font-bold" style={{ color }}>{nScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={nPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.negativeLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${nPct}%`, backgroundColor: color }} />
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
