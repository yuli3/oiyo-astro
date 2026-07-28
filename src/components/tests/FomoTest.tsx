import { useState } from 'react'
import ShareResultButton from '../shared/ShareResultButton'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type FomoLevel = 'free' | 'mild' | 'high' | 'intense'
type Subscale = 'exclusion' | 'connection'

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
  yourScore: string; overallLabel: string; exclusionLabel: string; connectionLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: 'FOMO 척도 테스트',
    subtitle: '나의 소외 불안(FOMO) 지수는?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 FOMO 지수는',
    yourScore: '나의 FOMO 지수',
    overallLabel: '종합 FOMO 지수',
    exclusionLabel: '소외 불안',
    connectionLabel: '연결 강박',
    outOf: '/ 5.0',
    tipsLabel: '마음을 위한 팁',
    note: '프시빌스키 외(Przybylski et al., 2013)의 FoMO 척도 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'FOMO Scale Test',
    subtitle: 'How high is your Fear of Missing Out?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My FOMO score is',
    yourScore: 'Your FOMO Score',
    overallLabel: 'Overall FOMO Score',
    exclusionLabel: 'Fear of Exclusion',
    connectionLabel: 'Compulsion to Connect',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Mind',
    note: 'This self-reflection test is based on the FoMO Scale concept by Przybylski et al. (2013). It does not replace professional assessment.',
  },
  ja: {
    title: 'FOMO尺度テスト',
    subtitle: 'あなたの取り残される不安（FOMO）度は？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のFOMO度は',
    yourScore: 'あなたのFOMO度',
    overallLabel: '総合FOMO度',
    exclusionLabel: '疎外不安',
    connectionLabel: '接続強迫',
    outOf: '/ 5.0',
    tipsLabel: '心のためのヒント',
    note: 'このテストはPrzybylskiらのFoMO尺度（2013）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<FomoLevel, Record<SupportedLang, LevelData>> = {
  free: {
    ko: {
      icon: '🍃',
      title: '자유로운 마음형',
      description: 'FOMO가 낮은 편입니다. 남과 비교하기보다 자신의 현재에 집중하며, 연결되지 않은 시간도 편안하게 즐깁니다.',
      tips: [
        '지금의 건강한 거리감을 의식적으로 지켜 나가세요.',
        '가끔 느끼는 소외감은 자연스러운 감정으로 받아들이세요.',
        '오프라인의 깊은 관계와 경험에 계속 투자하세요.',
      ],
    },
    en: {
      icon: '🍃',
      title: 'Free Mind',
      description: 'Your FOMO is low. Rather than comparing yourself to others, you focus on your own present and comfortably enjoy time spent disconnected.',
      tips: [
        'Consciously maintain the healthy distance you already have.',
        'Accept the occasional pang of missing out as a natural feeling.',
        'Keep investing in deep offline relationships and experiences.',
      ],
    },
    ja: {
      icon: '🍃',
      title: '自由な心型',
      description: 'FOMOは低めです。他人と比べるより自分の現在に集中し、つながっていない時間も心地よく楽しめます。',
      tips: [
        '今ある健康的な距離感を意識して守りましょう。',
        '時々感じる疎外感は自然な感情として受け入れましょう。',
        'オフラインの深い関係や経験に投資し続けましょう。',
      ],
    },
  },
  mild: {
    ko: {
      icon: '🌤️',
      title: '가벼운 FOMO형',
      description: '대부분의 사람이 경험하는 일상적인 수준의 소외 불안입니다. 가끔 비교나 확인 욕구가 올라오지만 잘 조절하고 있습니다.',
      tips: [
        '비교가 시작될 때 "내 기준은 무엇인가" 자문해 보세요.',
        '알림을 묶어서 정해진 시간에만 확인해 보세요.',
        'SNS 피드와 실제 삶의 차이를 의식적으로 떠올리세요.',
      ],
    },
    en: {
      icon: '🌤️',
      title: 'Mild FOMO',
      description: 'An everyday level of fear of missing out that most people experience. Comparison and checking urges arise sometimes, but you manage them well.',
      tips: [
        'When comparison starts, ask yourself "what is my own standard?"',
        'Batch notifications and check them only at set times.',
        'Consciously remind yourself of the gap between feeds and real life.',
      ],
    },
    ja: {
      icon: '🌤️',
      title: '軽いFOMO型',
      description: '多くの人が経験する日常的なレベルの疎外不安です。時々比較や確認の欲求が出ますが、うまく調整できています。',
      tips: [
        '比較が始まったら「自分の基準は何か」と自問しましょう。',
        '通知をまとめて決まった時間だけ確認しましょう。',
        'SNSのフィードと実生活の差を意識的に思い出しましょう。',
      ],
    },
  },
  high: {
    ko: {
      icon: '📲',
      title: '높은 FOMO형',
      description: '소외 불안과 확인 욕구가 뚜렷합니다. 남들과의 비교나 "놓칠까 봐"라는 마음이 일상과 휴식을 자주 방해할 수 있습니다.',
      tips: [
        '하루 중 알림을 완전히 끄는 시간을 정해 보세요.',
        '"놓쳐도 괜찮다(JOMO)"를 의도적으로 연습하세요.',
        '비교를 부추기는 계정을 정리하거나 음소거하세요.',
      ],
    },
    en: {
      icon: '📲',
      title: 'High FOMO',
      description: 'Fear of exclusion and the urge to check are pronounced. Comparison and the feeling of "what if I miss out" may frequently disrupt your daily life and rest.',
      tips: [
        'Set a window each day where notifications are fully off.',
        'Deliberately practice the "joy of missing out" (JOMO).',
        'Unfollow or mute accounts that fuel comparison.',
      ],
    },
    ja: {
      icon: '📲',
      title: '高いFOMO型',
      description: '疎外不安と確認欲求がはっきりしています。比較や「逃すかも」という気持ちが日常や休息をしばしば妨げる可能性があります。',
      tips: [
        '一日の中で通知を完全に切る時間を決めましょう。',
        '「逃しても大丈夫（JOMO）」を意図的に練習しましょう。',
        '比較をあおるアカウントを整理またはミュートしましょう。',
      ],
    },
  },
  intense: {
    ko: {
      icon: '🌀',
      title: 'FOMO 과민형',
      description: '소외 불안이 매우 강합니다. 끊임없는 확인과 비교가 마음의 에너지를 크게 소모하고 있을 가능성이 높습니다.',
      tips: [
        '하루 한 시간이라도 완전한 디지털 디톡스로 시작해 보세요.',
        '불안의 뿌리(인정 욕구·외로움 등)를 들여다보세요.',
        '혼자 조절이 힘들다면 상담 등 전문적 도움을 고려하세요.',
      ],
    },
    en: {
      icon: '🌀',
      title: 'Intense FOMO',
      description: 'Your fear of missing out is very strong. Constant checking and comparison are likely draining a large amount of your mental energy.',
      tips: [
        'Start with even one hour a day of full digital detox.',
        'Look into the roots of the anxiety (need for approval, loneliness, etc.).',
        'If self-regulation is hard, consider professional help such as counseling.',
      ],
    },
    ja: {
      icon: '🌀',
      title: 'FOMO過敏型',
      description: '疎外不安が非常に強いです。絶え間ない確認と比較が心のエネルギーを大きく消耗している可能性が高いです。',
      tips: [
        '一日1時間でも完全なデジタルデトックスから始めましょう。',
        '不安の根（承認欲求・孤独など）を見つめましょう。',
        '一人で調整が難しい場合はカウンセリングなど専門的な助けを検討しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: '친구들이 나 없이 즐거운 시간을 보낼까 봐 신경 쓰인다' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: '남들이 나보다 더 풍요로운 경험을 한다고 느낀다' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: '내가 모르는 사이 중요한 일이 일어날까 봐 불안하다' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: '다른 사람의 일상(여행·모임)을 보면 나만 뒤처진 기분이 든다' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: '초대받지 못한 모임이 있으면 마음이 많이 쓰인다' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: '트렌드나 유행을 놓치는 것이 두렵다' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: '남들이 다 아는 것을 나만 모를까 봐 걱정된다' },
    { id: 'c1', subscale: 'connection', reverse: false, text: '자리를 비웠을 때 무슨 일이 있었는지 계속 확인하고 싶다' },
    { id: 'c2', subscale: 'connection', reverse: false, text: '식사나 모임 중에도 SNS·메시지를 확인하게 된다' },
    { id: 'c3', subscale: 'connection', reverse: false, text: '알림이 오면 바로 확인하지 않으면 불안하다' },
    { id: 'c4', subscale: 'connection', reverse: false, text: '휴가나 휴식 중에도 온라인 소식을 계속 확인한다' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'SNS를 한동안 못 보면 답답하거나 초조하다' },
    { id: 'c6', subscale: 'connection', reverse: false, text: '자기 전이나 일어나자마자 가장 먼저 피드를 확인한다' },
    { id: 'c7', subscale: 'connection', reverse: false, text: '좋아요·댓글·반응을 자주 확인하게 된다' },
  ],
  en: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: 'I worry that my friends are having fun without me' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: 'I feel others are having more rewarding experiences than me' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: 'I get anxious that something important might happen without me knowing' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: "Seeing others' lives (trips, gatherings) makes me feel left behind" },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: 'It bothers me a lot when there is a gathering I was not invited to' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: 'I am afraid of missing out on trends' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: 'I worry that I am the only one who does not know what everyone else knows' },
    { id: 'c1', subscale: 'connection', reverse: false, text: 'When I have been away, I keep wanting to check what happened' },
    { id: 'c2', subscale: 'connection', reverse: false, text: 'I end up checking social media or messages even during meals or gatherings' },
    { id: 'c3', subscale: 'connection', reverse: false, text: 'I feel anxious if I do not check a notification right away' },
    { id: 'c4', subscale: 'connection', reverse: false, text: 'I keep checking online updates even during vacations or rest' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'I feel restless when I cannot check social media for a while' },
    { id: 'c6', subscale: 'connection', reverse: false, text: 'I check my feed first thing before sleeping or right after waking up' },
    { id: 'c7', subscale: 'connection', reverse: false, text: 'I frequently check likes, comments, and reactions' },
  ],
  ja: [
    { id: 'e1', subscale: 'exclusion', reverse: false, text: '友人が自分抜きで楽しい時間を過ごしていないか気になる' },
    { id: 'e2', subscale: 'exclusion', reverse: false, text: '他人が自分より充実した経験をしていると感じる' },
    { id: 'e3', subscale: 'exclusion', reverse: false, text: '知らないうちに重要なことが起きるのではと不安になる' },
    { id: 'e4', subscale: 'exclusion', reverse: false, text: '他人の日常（旅行・集まり）を見ると自分だけ遅れている気がする' },
    { id: 'e5', subscale: 'exclusion', reverse: false, text: '招待されなかった集まりがあると気になって仕方ない' },
    { id: 'e6', subscale: 'exclusion', reverse: false, text: 'トレンドや流行を逃すことが怖い' },
    { id: 'e7', subscale: 'exclusion', reverse: false, text: 'みんなが知っていることを自分だけ知らないのではと心配になる' },
    { id: 'c1', subscale: 'connection', reverse: false, text: '席を外していた時に何があったか確認し続けたくなる' },
    { id: 'c2', subscale: 'connection', reverse: false, text: '食事や集まりの最中でもSNSやメッセージを確認してしまう' },
    { id: 'c3', subscale: 'connection', reverse: false, text: '通知が来るとすぐ確認しないと不安になる' },
    { id: 'c4', subscale: 'connection', reverse: false, text: '休暇や休息中でもオンラインの情報を確認し続ける' },
    { id: 'c5', subscale: 'connection', reverse: false, text: 'SNSをしばらく見られないと落ち着かない' },
    { id: 'c6', subscale: 'connection', reverse: false, text: '寝る前や起きてすぐにまずフィードを確認する' },
    { id: 'c7', subscale: 'connection', reverse: false, text: 'いいね・コメント・反応を頻繁に確認してしまう' },
  ],
}

function calcLevel(score: number): FomoLevel {
  if (score <= 2.3) return 'free'
  if (score <= 3.2) return 'mild'
  if (score <= 4.0) return 'high'
  return 'intense'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function FomoTest({ locale: lp = 'ko' }: Props) {
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
    const eItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'exclusion')
    const cItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'connection')
    const eScore = eItems.reduce((s, x) => s + x.adj, 0) / eItems.length
    const cScore = cItems.reduce((s, x) => s + x.adj, 0) / cItems.length
    const overall = (eScore + cScore) / 2
    return { eScore, cScore, overall }
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

  const { eScore, cScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const ePct = Math.round(((eScore - 1) / 4) * 100)
  const cPct = Math.round(((cScore - 1) / 4) * 100)

  const levelColors: Record<FomoLevel, string> = {
    free: '#10b981',
    mild: '#0ea5e9',
    high: '#f59e0b',
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
            <span className="font-bold text-muted-foreground">{lb.exclusionLabel}</span>
            <span className="font-bold" style={{ color }}>{eScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={ePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.exclusionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ePct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.connectionLabel}</span>
            <span className="font-bold" style={{ color }}>{cScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={cPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.connectionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cPct}%`, backgroundColor: color }} />
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
