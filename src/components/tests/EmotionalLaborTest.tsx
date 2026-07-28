import { useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type LaborLevel = 'light' | 'moderate' | 'heavy' | 'severe'
type Subscale = 'surface' | 'dissonance'

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
  yourScore: string; overallLabel: string; surfaceLabel: string; dissonanceLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '감정노동 테스트',
    subtitle: '나는 얼마나 감정을 연기하며 일하는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 감정노동 지수는',
    yourScore: '나의 감정노동 지수',
    overallLabel: '종합 감정노동 지수',
    surfaceLabel: '표면 연기',
    dissonanceLabel: '감정 부조화·소진',
    outOf: '/ 5.0',
    tipsLabel: '회복을 위한 팁',
    note: '혹실드(Hochschild)의 감정노동(emotional labor) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Emotional Labor Test',
    subtitle: 'How much do you act out emotions at work?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My emotional labor score is',
    yourScore: 'Your Emotional Labor Score',
    overallLabel: 'Overall Emotional Labor Score',
    surfaceLabel: 'Surface Acting',
    dissonanceLabel: 'Emotional Dissonance',
    outOf: '/ 5.0',
    tipsLabel: 'Recovery Tips',
    note: "This self-reflection test is based on Hochschild's emotional labor concept. It does not replace professional assessment.",
  },
  ja: {
    title: '感情労働テスト',
    subtitle: 'あなたはどれくらい感情を演じて働いているか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の感情労働度は',
    yourScore: 'あなたの感情労働度',
    overallLabel: '総合感情労働度',
    surfaceLabel: '表面演技',
    dissonanceLabel: '感情の不協和・消耗',
    outOf: '/ 5.0',
    tipsLabel: '回復のためのヒント',
    note: 'このテストはHochschildの感情労働（emotional labor）概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<LaborLevel, Record<SupportedLang, LevelData>> = {
  light: {
    ko: {
      icon: '🌿',
      title: '가벼운 감정노동형',
      description: '진짜 감정과 표현하는 감정의 차이가 크지 않습니다. 감정 연기로 인한 소모가 적은 편입니다.',
      tips: [
        '지금처럼 진심과 표현이 가까운 환경을 소중히 하세요.',
        '가끔의 감정 연기 후에는 짧게라도 회복 시간을 가지세요.',
        '진짜 감정을 안전하게 나눌 관계를 유지하세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Light Emotional Labor',
      description: 'The gap between your true and expressed emotions is small. You experience little drain from acting out emotions.',
      tips: [
        'Cherish an environment where your sincerity and expression stay close.',
        'After occasional emotional acting, take even a short recovery break.',
        'Keep relationships where you can safely share real feelings.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '軽い感情労働型',
      description: '本当の感情と表現する感情の差が大きくありません。感情を演じることによる消耗が少ない方です。',
      tips: [
        '今のように本心と表現が近い環境を大切にしましょう。',
        '時々の感情演技の後は短くても回復時間を取りましょう。',
        '本当の感情を安全に分かち合える関係を保ちましょう。',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌤️',
      title: '보통 감정노동형',
      description: '일상적으로 어느 정도 감정을 조절하고 연기합니다. 대부분의 직장인이 겪는 수준이지만, 회복 루틴이 중요해지는 구간입니다.',
      tips: [
        '근무 후 감정을 "전환"하는 나만의 의식을 만드세요.',
        '표면 연기보다 상황을 다르게 해석하는 내면 조절을 시도하세요.',
        '감정을 털어놓을 안전한 대화 상대를 정해 두세요.',
      ],
    },
    en: {
      icon: '🌤️',
      title: 'Moderate Emotional Labor',
      description: 'You regulate and act out emotions to some degree daily. A level most workers experience, but recovery routines start to matter.',
      tips: [
        'Create a personal ritual to "switch off" emotions after work.',
        'Try reinterpreting situations (deep acting) rather than surface acting.',
        'Designate a safe person to vent your feelings to.',
      ],
    },
    ja: {
      icon: '🌤️',
      title: '普通の感情労働型',
      description: '日常的にある程度感情を調整し演じます。多くの働く人が経験するレベルですが、回復ルーティンが重要になる区間です。',
      tips: [
        '勤務後に感情を「切り替える」自分なりの儀式を作りましょう。',
        '表面演技より状況を捉え直す内面調整を試しましょう。',
        '感情を打ち明けられる安全な相手を決めておきましょう。',
      ],
    },
  },
  heavy: {
    ko: {
      icon: '⚠️',
      title: '높은 감정노동형',
      description: '진짜 감정을 억누르고 정해진 감정을 연기하는 부담이 큽니다. 감정 부조화가 소진으로 이어질 수 있어 돌봄이 필요합니다.',
      tips: [
        '하루 중 "감정을 연기하지 않아도 되는" 시간을 확보하세요.',
        '억눌린 감정을 글이나 대화로 흘려보내세요.',
        '업무 경계를 설정하고 회복을 우선순위에 두세요.',
      ],
    },
    en: {
      icon: '⚠️',
      title: 'Heavy Emotional Labor',
      description: 'The burden of suppressing real feelings and performing prescribed ones is high. Emotional dissonance may lead to burnout, and deserves care.',
      tips: [
        'Secure time each day where you do not have to act out emotions.',
        'Release suppressed feelings through writing or conversation.',
        'Set work boundaries and make recovery a priority.',
      ],
    },
    ja: {
      icon: '⚠️',
      title: '高い感情労働型',
      description: '本当の感情を抑え、決められた感情を演じる負担が大きいです。感情の不協和が消耗につながる可能性があり、ケアが必要です。',
      tips: [
        '一日の中で「感情を演じなくていい」時間を確保しましょう。',
        '抑えた感情を文章や会話で流しましょう。',
        '仕事の境界を設定し回復を優先しましょう。',
      ],
    },
  },
  severe: {
    ko: {
      icon: '🔥',
      title: '과부하 감정노동형',
      description: '감정노동의 강도가 매우 높습니다. 진짜 감정과 단절되거나 소진감이 일상에 영향을 줄 수 있어 적극적인 돌봄이 필요합니다.',
      tips: [
        '소진 신호(무감각·냉소·피로)를 점검하고 휴식을 확보하세요.',
        '감정노동이 과한 환경이라면 역할·업무 조정을 모색하세요.',
        '회복이 어렵다면 상담 등 전문적 도움을 고려하세요.',
      ],
    },
    en: {
      icon: '🔥',
      title: 'Overloaded Emotional Labor',
      description: 'Your emotional labor intensity is very high. You may feel cut off from real feelings or have exhaustion affecting daily life—active care is needed.',
      tips: [
        'Check burnout signs (numbness, cynicism, fatigue) and secure rest.',
        'If the environment demands too much, explore adjusting your role or tasks.',
        'If recovery is hard, consider professional help such as counseling.',
      ],
    },
    ja: {
      icon: '🔥',
      title: '過負荷感情労働型',
      description: '感情労働の強度が非常に高いです。本当の感情と断絶したり消耗感が日常に影響する可能性があり、積極的なケアが必要です。',
      tips: [
        '消耗のサイン（無感覚・冷笑・疲労）を点検し休息を確保しましょう。',
        '環境が過度なら役割・業務の調整を模索しましょう。',
        '回復が難しいならカウンセリングなど専門的な助けを検討しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 's1', subscale: 'surface', reverse: false, text: '실제 감정과 다른 표정을 일·관계에서 자주 짓는다' },
    { id: 's2', subscale: 'surface', reverse: false, text: '속으로는 힘들어도 괜찮은 척 웃어야 할 때가 많다' },
    { id: 's3', subscale: 'surface', reverse: false, text: '화가 나도 친절한 태도를 유지해야 한다' },
    { id: 's4', subscale: 'surface', reverse: false, text: '진짜 기분을 숨기고 정해진 감정을 연기한다' },
    { id: 's5', subscale: 'surface', reverse: false, text: '상대에게 보이는 나와 진짜 내 감정이 자주 다르다' },
    { id: 's6', subscale: 'surface', reverse: false, text: '감정을 억누르고 역할에 맞는 표정을 만들어낸다' },
    { id: 's7', subscale: 'surface', reverse: false, text: '불편한 사람 앞에서도 좋은 표정을 지어야 한다' },
    { id: 'd1', subscale: 'dissonance', reverse: false, text: '표현해야 하는 감정과 실제 감정의 차이로 지친다' },
    { id: 'd2', subscale: 'dissonance', reverse: false, text: '감정을 꾸미는 일이 나를 소진시킨다' },
    { id: 'd3', subscale: 'dissonance', reverse: false, text: '하루 끝에 감정적으로 텅 빈 느낌이 든다' },
    { id: 'd4', subscale: 'dissonance', reverse: false, text: '내 진짜 감정이 무엇인지 헷갈릴 때가 있다' },
    { id: 'd5', subscale: 'dissonance', reverse: false, text: '친절을 유지하느라 스트레스가 쌓인다' },
    { id: 'd6', subscale: 'dissonance', reverse: false, text: '감정을 통제하는 데 많은 에너지를 쓴다' },
    { id: 'd7', subscale: 'dissonance', reverse: false, text: '감정노동 때문에 쉬어도 잘 회복되지 않는다' },
  ],
  en: [
    { id: 's1', subscale: 'surface', reverse: false, text: 'I often wear an expression different from my real feelings at work or with others' },
    { id: 's2', subscale: 'surface', reverse: false, text: 'I often have to smile and act fine even when I am struggling inside' },
    { id: 's3', subscale: 'surface', reverse: false, text: 'I have to keep a kind attitude even when I am angry' },
    { id: 's4', subscale: 'surface', reverse: false, text: 'I hide my true mood and perform the expected emotion' },
    { id: 's5', subscale: 'surface', reverse: false, text: 'The me others see often differs from my true feelings' },
    { id: 's6', subscale: 'surface', reverse: false, text: 'I suppress emotions and manufacture an expression that fits my role' },
    { id: 's7', subscale: 'surface', reverse: false, text: 'I must look pleasant even in front of people I find uncomfortable' },
    { id: 'd1', subscale: 'dissonance', reverse: false, text: 'The gap between required and real emotions wears me out' },
    { id: 'd2', subscale: 'dissonance', reverse: false, text: 'Faking emotions drains me' },
    { id: 'd3', subscale: 'dissonance', reverse: false, text: 'I feel emotionally empty at the end of the day' },
    { id: 'd4', subscale: 'dissonance', reverse: false, text: 'I sometimes get confused about what my real feelings are' },
    { id: 'd5', subscale: 'dissonance', reverse: false, text: 'Maintaining kindness builds up stress for me' },
    { id: 'd6', subscale: 'dissonance', reverse: false, text: 'I spend a lot of energy controlling my emotions' },
    { id: 'd7', subscale: 'dissonance', reverse: false, text: 'Because of emotional labor, I do not recover well even when I rest' },
  ],
  ja: [
    { id: 's1', subscale: 'surface', reverse: false, text: '実際の感情と違う表情を仕事や関係でよく作る' },
    { id: 's2', subscale: 'surface', reverse: false, text: '内心は辛くても平気なふりで笑わなければならない時が多い' },
    { id: 's3', subscale: 'surface', reverse: false, text: '怒っていても親切な態度を保たなければならない' },
    { id: 's4', subscale: 'surface', reverse: false, text: '本当の気分を隠し決められた感情を演じる' },
    { id: 's5', subscale: 'surface', reverse: false, text: '相手に見せる自分と本当の感情がよく違う' },
    { id: 's6', subscale: 'surface', reverse: false, text: '感情を抑えて役割に合う表情を作り出す' },
    { id: 's7', subscale: 'surface', reverse: false, text: '苦手な人の前でも良い表情をしなければならない' },
    { id: 'd1', subscale: 'dissonance', reverse: false, text: '表現すべき感情と実際の感情の差で疲れる' },
    { id: 'd2', subscale: 'dissonance', reverse: false, text: '感情を取り繕うことが自分を消耗させる' },
    { id: 'd3', subscale: 'dissonance', reverse: false, text: '一日の終わりに感情的に空っぽな感じがする' },
    { id: 'd4', subscale: 'dissonance', reverse: false, text: '自分の本当の感情が何か分からなくなる時がある' },
    { id: 'd5', subscale: 'dissonance', reverse: false, text: '親切を保つためにストレスが溜まる' },
    { id: 'd6', subscale: 'dissonance', reverse: false, text: '感情を統制するのに多くのエネルギーを使う' },
    { id: 'd7', subscale: 'dissonance', reverse: false, text: '感情労働のせいで休んでもよく回復しない' },
  ],
}

function calcLevel(score: number): LaborLevel {
  if (score <= 2.3) return 'light'
  if (score <= 3.2) return 'moderate'
  if (score <= 4.0) return 'heavy'
  return 'severe'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function EmotionalLaborTest({ locale: lp = 'ko' }: Props) {
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
    const sItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'surface')
    const dItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'dissonance')
    const sScore = sItems.reduce((s, x) => s + x.adj, 0) / sItems.length
    const dScore = dItems.reduce((s, x) => s + x.adj, 0) / dItems.length
    const overall = (sScore + dScore) / 2
    return { sScore, dScore, overall }
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

  const { sScore, dScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const sPct = Math.round(((sScore - 1) / 4) * 100)
  const dPct = Math.round(((dScore - 1) / 4) * 100)

  const levelColors: Record<LaborLevel, string> = {
    light: '#10b981',
    moderate: '#f59e0b',
    heavy: '#f97316',
    severe: '#ef4444',
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
            <span className="font-bold text-muted-foreground">{lb.surfaceLabel}</span>
            <span className="font-bold" style={{ color }}>{sScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={sPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.surfaceLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.dissonanceLabel}</span>
            <span className="font-bold" style={{ color }}>{dScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={dPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.dissonanceLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dPct}%`, backgroundColor: color }} />
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
