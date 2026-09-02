import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type ChildLevel = 'nurtured' | 'aware' | 'wounded' | 'frozen'
type Subscale = 'neglect' | 'adaptation'

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
  yourScore: string; overallLabel: string; neglectLabel: string; adaptationLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '내면아이 테스트',
    subtitle: '내 안의 어린 나는 어떤 마음일까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 내면아이 지수는',
    yourScore: '나의 내면아이 지수',
    overallLabel: '종합 내면아이 지수',
    neglectLabel: '정서적 결핍',
    adaptationLabel: '과잉적응·순응',
    outOf: '/ 5.0',
    tipsLabel: '내면아이를 위한 팁',
    note: '내면아이(inner child) 개념에서 영감을 받은 자가성찰용 테스트입니다. 전문적 심리치료나 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Inner Child Test',
    subtitle: 'How does the little one inside you feel?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My inner child score is',
    yourScore: 'Your Inner Child Score',
    overallLabel: 'Overall Inner Child Score',
    neglectLabel: 'Emotional Unmet Needs',
    adaptationLabel: 'Over-Adaptation',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Inner Child',
    note: 'This self-reflection test is inspired by the inner child concept. It does not replace professional therapy or assessment.',
  },
  ja: {
    title: 'インナーチャイルドテスト',
    subtitle: '心の中の幼い自分はどんな気持ち？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のインナーチャイルド度は',
    yourScore: 'あなたのインナーチャイルド度',
    overallLabel: '総合インナーチャイルド度',
    neglectLabel: '情緒的欠乏',
    adaptationLabel: '過剰適応・順応',
    outOf: '/ 5.0',
    tipsLabel: 'インナーチャイルドへのヒント',
    note: 'このテストはインナーチャイルドの概念に着想を得た自己省察用です。専門的な心理療法や診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<ChildLevel, Record<SupportedLang, LevelData>> = {
  nurtured: {
    ko: {
      icon: '🌷',
      title: '보살핌받은 내면아이',
      description: '내면아이가 비교적 안정되고 충분히 보살핌받았다고 느낍니다. 자기 감정과 욕구를 건강하게 다룹니다.',
      tips: [
        '지금의 안정감을 만든 자기돌봄 습관을 이어가세요.',
        '가끔 올라오는 어린 시절의 감정도 따뜻하게 안아주세요.',
        '내면의 충만함을 창의성과 관계에 나누어 보세요.',
      ],
    },
    en: {
      icon: '🌷',
      title: 'Nurtured Inner Child',
      description: 'Your inner child feels relatively secure and well cared for. You handle your own emotions and needs in a healthy way.',
      tips: [
        'Keep up the self-care habits that created this stability.',
        'Warmly embrace the childhood feelings that occasionally arise.',
        'Share your inner fullness through creativity and relationships.',
      ],
    },
    ja: {
      icon: '🌷',
      title: '大切にされたインナーチャイルド',
      description: 'インナーチャイルドが比較的安定し、十分に大切にされたと感じています。自分の感情や欲求を健康的に扱えます。',
      tips: [
        '今の安定感を作ったセルフケア習慣を続けましょう。',
        '時々湧く子供時代の感情も温かく抱きしめましょう。',
        '内面の充足を創造性や人間関係に分かち合いましょう。',
      ],
    },
  },
  aware: {
    ko: {
      icon: '🌿',
      title: '인식하는 내면아이',
      description: '내면아이의 상처를 어느 정도 인식하고 있습니다. 가끔 옛 감정이 올라오지만, 돌볼 준비가 되어 있는 단계입니다.',
      tips: [
        '감정이 격해질 때 "지금 몇 살의 내가 반응하나" 물어보세요.',
        '어린 나에게 건네고 싶은 말을 편지로 적어 보세요.',
        '나의 욕구를 작은 것부터 솔직히 표현하는 연습을 하세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Aware Inner Child',
      description: 'You are somewhat aware of your inner child\'s wounds. Old feelings arise sometimes, but you are ready to tend to them.',
      tips: [
        'When emotions flare, ask "how old is the me that is reacting right now?"',
        'Write a letter with the words you want to give your younger self.',
        'Practice honestly expressing your needs, starting small.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '気づいているインナーチャイルド',
      description: 'インナーチャイルドの傷をある程度認識しています。時々昔の感情が湧きますが、ケアする準備ができている段階です。',
      tips: [
        '感情が高ぶる時「今、何歳の自分が反応しているか」と問いましょう。',
        '幼い自分に伝えたい言葉を手紙に書いてみましょう。',
        '自分の欲求を小さなことから正直に表現する練習をしましょう。',
      ],
    },
  },
  wounded: {
    ko: {
      icon: '🩹',
      title: '상처받은 내면아이',
      description: '정서적 결핍이나 과잉적응의 흔적이 뚜렷합니다. 사랑받기 위해 애쓰거나 자신을 뒤로 미루는 패턴이 반복될 수 있습니다.',
      tips: [
        '남을 위한 양보 뒤에 미뤄둔 내 욕구를 한 가지 챙기세요.',
        '"착해야 사랑받는다"는 믿음을 부드럽게 의심해 보세요.',
        '나를 안전하게 돌봐줄 관계나 루틴을 만들어 가세요.',
      ],
    },
    en: {
      icon: '🩹',
      title: 'Wounded Inner Child',
      description: 'Traces of emotional unmet needs or over-adaptation are clear. Patterns of striving to be loved or putting yourself last may repeat.',
      tips: [
        'Tend to one of your own needs that you set aside to accommodate others.',
        'Gently question the belief that "I am loved only if I am good."',
        'Build relationships or routines that care for you safely.',
      ],
    },
    ja: {
      icon: '🩹',
      title: '傷ついたインナーチャイルド',
      description: '情緒的欠乏や過剰適応の跡がはっきりしています。愛されるために頑張ったり自分を後回しにするパターンが繰り返される可能性があります。',
      tips: [
        '他人への譲歩の後に後回しにした自分の欲求を一つ大切にしましょう。',
        '「良い子でいれば愛される」という信念を優しく疑ってみましょう。',
        '自分を安全にケアしてくれる関係やルーティンを作りましょう。',
      ],
    },
  },
  frozen: {
    ko: {
      icon: '❄️',
      title: '얼어붙은 내면아이',
      description: '깊은 정서적 결핍이 오래 억눌려 있을 가능성이 높습니다. 공허감·외로움이 자주 올라오고, 자기 감정과 단절돼 있을 수 있습니다.',
      tips: [
        '감정을 느끼는 것 자체를 천천히 허락하는 연습부터 시작하세요.',
        '나를 비난하는 내면의 목소리와 거리를 두어 보세요.',
        '혼자 마주하기 버겁다면 상담 등 안전한 도움을 찾으세요.',
      ],
    },
    en: {
      icon: '❄️',
      title: 'Frozen Inner Child',
      description: 'Deep emotional unmet needs have likely been suppressed for a long time. Emptiness and loneliness arise often, and you may feel cut off from your feelings.',
      tips: [
        'Start by slowly allowing yourself to simply feel emotions.',
        'Create distance from the inner voice that criticizes you.',
        'If facing it alone feels too heavy, seek safe help such as counseling.',
      ],
    },
    ja: {
      icon: '❄️',
      title: '凍りついたインナーチャイルド',
      description: '深い情緒的欠乏が長く抑え込まれている可能性が高いです。空虚感・孤独がよく湧き、自分の感情と断絶しているかもしれません。',
      tips: [
        '感情を感じること自体をゆっくり許す練習から始めましょう。',
        '自分を責める内面の声と距離を取ってみましょう。',
        '一人で向き合うのが重いならカウンセリングなど安全な助けを探しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: '어린 시절 내 감정이 충분히 받아들여지지 못했다고 느낀다' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: '힘들 때 마음 놓고 기댈 곳이 없다고 느낄 때가 많다' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: '사랑받기 위해서는 무언가를 잘해야 한다고 느낀다' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: '마음 깊은 곳에 채워지지 않는 외로움이 있다' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: '칭찬이나 애정을 받아도 잘 믿기지 않는다' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: '버려지거나 거절당할까 봐 두려울 때가 있다' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: '내 감정이나 욕구를 표현하는 것이 어색하거나 불편하다' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: '다른 사람의 기분을 살피느라 내 마음을 뒤로 미룬다' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: '갈등을 피하려고 내 의견을 자주 접는다' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: '"착한 사람"이어야 한다는 압박을 느낀다' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: '남에게 폐를 끼치는 것이 지나치게 불편하다' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: '거절을 잘 못하고 무리해서 맞춰주는 편이다' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: '내가 원하는 것보다 남이 기대하는 것을 먼저 한다' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: '혼자 있을 때 공허하거나 불안할 때가 있다' },
  ],
  en: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: 'I feel my emotions were not fully accepted in childhood' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: 'I often feel I have no one to truly lean on when things are hard' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: 'I feel I have to do something well in order to be loved' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: 'There is an unfilled loneliness deep inside me' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: 'Even when I receive praise or affection, I find it hard to believe' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: 'I sometimes fear being abandoned or rejected' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: 'Expressing my feelings or needs feels awkward or uncomfortable' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: "I put my own feelings aside to read others' moods" },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: 'I often give up my opinion to avoid conflict' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: 'I feel pressure to be a "good person"' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: 'I am excessively uncomfortable being a burden to others' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: 'I struggle to say no and overextend to accommodate others' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: 'I do what others expect before what I want' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: 'I sometimes feel empty or anxious when alone' },
  ],
  ja: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: '子供時代に自分の感情が十分に受け入れられなかったと感じる' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: '辛い時に安心して頼れる場所がないと感じることが多い' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: '愛されるには何かをうまくやらなければと感じる' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: '心の奥に満たされない孤独がある' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: '称賛や愛情を受けても信じにくい' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: '見捨てられたり拒絶されるのを恐れる時がある' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: '自分の感情や欲求を表現するのが不自然で不快だ' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: '他人の気分を伺うあまり自分の気持ちを後回しにする' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: '対立を避けるために自分の意見をよく引っ込める' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: '「良い人」でいなければという圧力を感じる' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: '他人に迷惑をかけることが過度に不快だ' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: '断るのが苦手で無理して合わせる方だ' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: '自分が望むことより他人が期待することを先にする' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: '一人でいる時に空虚や不安を感じる時がある' },
  ],
}

function calcLevel(score: number): ChildLevel {
  if (score <= 2.3) return 'nurtured'
  if (score <= 3.2) return 'aware'
  if (score <= 4.0) return 'wounded'
  return 'frozen'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function InnerChildTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "inner-child", title: "InnerChildTest", finished: Boolean(done) });

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
    const nItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'neglect')
    const aItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'adaptation')
    const nScore = nItems.reduce((s, x) => s + x.adj, 0) / nItems.length
    const aScore = aItems.reduce((s, x) => s + x.adj, 0) / aItems.length
    const overall = (nScore + aScore) / 2
    return { nScore, aScore, overall }
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

  const { nScore, aScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const nPct = Math.round(((nScore - 1) / 4) * 100)
  const aPct = Math.round(((aScore - 1) / 4) * 100)

  const levelColors: Record<ChildLevel, string> = {
    nurtured: '#10b981',
    aware: '#14b8a6',
    wounded: '#f59e0b',
    frozen: '#435D31',
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
            <span className="font-bold text-muted-foreground">{lb.neglectLabel}</span>
            <span className="font-bold" style={{ color }}>{nScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={nPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.neglectLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${nPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.adaptationLabel}</span>
            <span className="font-bold" style={{ color }}>{aScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={aPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.adaptationLabel}
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
          className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {lb.share}
        </button>
      </div>
        <ShareResultButton locale={lp} heading={lb.title} resultTitle={ld.title} />
    </div>
  )
}
