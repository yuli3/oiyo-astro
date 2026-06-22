import { useState } from 'react'

type SupportedLang = 'ko' | 'en' | 'ja'
type ControlLevel = 'building' | 'moderate' | 'strong' | 'high'
type Subscale = 'restraint' | 'focus'

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
  yourScore: string; overallLabel: string; restraintLabel: string; focusLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '자기통제력 테스트',
    subtitle: '나의 절제와 끈기는 얼마나 단단할까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 자기통제력 점수는',
    yourScore: '나의 자기통제력 점수',
    overallLabel: '종합 자기통제력',
    restraintLabel: '충동 절제',
    focusLabel: '끈기·집중',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '탱그니 외(Tangney et al.)의 단축 자기통제 척도(BSCS) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Self-Control Test',
    subtitle: 'How firm is your restraint and persistence?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My self-control score is',
    yourScore: 'Your Self-Control Score',
    overallLabel: 'Overall Self-Control',
    restraintLabel: 'Impulse Restraint',
    focusLabel: 'Persistence & Focus',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: 'This self-reflection test is based on the Brief Self-Control Scale (BSCS) concept by Tangney et al. It does not replace professional assessment.',
  },
  ja: {
    title: 'セルフコントロール（自己統制）テスト',
    subtitle: 'あなたの抑制と粘り強さはどれほど強いか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の自己統制スコアは',
    yourScore: 'あなたの自己統制スコア',
    overallLabel: '総合自己統制',
    restraintLabel: '衝動の抑制',
    focusLabel: '粘り強さ・集中',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはTangneyらの短縮セルフコントロール尺度（BSCS）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<ControlLevel, Record<SupportedLang, LevelData>> = {
  building: {
    ko: {
      icon: '🌱',
      title: '형성 단계',
      description: '아직 충동을 조절하고 끈기를 발휘하는 힘이 자라는 중입니다. 자기통제는 근육처럼 작은 연습으로 단단해집니다.',
      tips: [
        '유혹을 의지로 누르기보다 환경에서 미리 치우세요.',
        '아주 작은 목표를 정해 "해냈다"를 반복 경험하세요.',
        '"5분만 더" 규칙으로 미루는 충동을 넘겨 보세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Building',
      description: 'Your power to restrain impulses and persist is still growing. Self-control, like a muscle, gets firmer with small practice.',
      tips: [
        'Remove temptations from your environment rather than fighting them with willpower.',
        'Set tiny goals and repeatedly experience "I did it."',
        'Use the "just 5 more minutes" rule to get past the urge to delay.',
      ],
    },
    ja: {
      icon: '🌱',
      title: '形成段階',
      description: '衝動を抑え粘り強さを発揮する力がまだ育っている途中です。自己統制は筋肉のように小さな練習で強くなります。',
      tips: [
        '誘惑を意志で抑えるより環境からあらかじめ取り除きましょう。',
        'ごく小さな目標を決めて「できた」を繰り返し経験しましょう。',
        '「あと5分」ルールで先延ばしの衝動を乗り越えましょう。',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌿',
      title: '안정 자기통제형',
      description: '대체로 충동을 잘 조절하고 할 일을 해냅니다. 가끔 흔들리지만 회복하는 힘이 있는 건강한 수준입니다.',
      tips: [
        '잘 무너지는 상황(시간·장소·기분)을 파악해 미리 대비하세요.',
        '습관을 의지가 아닌 루틴·신호로 자동화하세요.',
        '성공 경험을 기록해 자기통제 자신감을 키우세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Steady Self-Control',
      description: 'You generally restrain impulses and get things done. You waver sometimes but recover—a healthy level.',
      tips: [
        'Identify situations where you slip (time, place, mood) and prepare in advance.',
        'Automate habits through routines and cues rather than willpower.',
        'Log your successes to build self-control confidence.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '安定自己統制型',
      description: 'おおむね衝動をうまく抑え、やるべきことをこなします。時々揺らぎますが回復する力がある健康的なレベルです。',
      tips: [
        '崩れやすい状況（時間・場所・気分）を把握して備えましょう。',
        '習慣を意志ではなくルーティンや合図で自動化しましょう。',
        '成功体験を記録して自己統制の自信を育てましょう。',
      ],
    },
  },
  strong: {
    ko: {
      icon: '🛡️',
      title: '강한 자기통제형',
      description: '충동 절제와 끈기가 강합니다. 장기 목표를 위해 당장의 유혹을 잘 미루고 꾸준히 실천합니다.',
      tips: [
        '이 힘을 의미 있는 장기 목표에 투자하세요.',
        '통제가 경직·억압으로 가지 않게 쉼과 즐거움도 허락하세요.',
        '주변에 좋은 습관 시스템을 나눠 보세요.',
      ],
    },
    en: {
      icon: '🛡️',
      title: 'Strong Self-Control',
      description: 'Your impulse restraint and persistence are strong. You delay immediate temptation for long-term goals and follow through steadily.',
      tips: [
        'Invest this strength in meaningful long-term goals.',
        'Allow rest and joy so control does not become rigidity or suppression.',
        'Share your good habit systems with others.',
      ],
    },
    ja: {
      icon: '🛡️',
      title: '強い自己統制型',
      description: '衝動の抑制と粘り強さが強いです。長期目標のために目先の誘惑をうまく先送りし着実に実践します。',
      tips: [
        'この力を意味ある長期目標に投資しましょう。',
        '統制が硬直や抑圧にならないよう休みと楽しみも許しましょう。',
        '周囲に良い習慣の仕組みを分かち合いましょう。',
      ],
    },
  },
  high: {
    ko: {
      icon: '🏔️',
      title: '최상위 자기통제형',
      description: '매우 높은 자기통제력을 지녔습니다. 강력한 절제력이지만, 지나친 통제가 경직과 번아웃으로 가지 않도록 균형이 필요합니다.',
      tips: [
        '계획에 "여백"과 즉흥의 즐거움을 의도적으로 넣으세요.',
        '통제 욕구가 완벽주의·자기비판으로 번지지 않게 점검하세요.',
        '쉬는 것도 능력임을 받아들이고 회복을 계획하세요.',
      ],
    },
    en: {
      icon: '🏔️',
      title: 'Very High Self-Control',
      description: 'You possess very high self-control. A powerful restraint, but balance is needed so over-control does not lead to rigidity and burnout.',
      tips: [
        'Intentionally build "white space" and spontaneous joy into your plans.',
        'Check that the need for control does not spread into perfectionism or self-criticism.',
        'Accept that resting is also a skill, and plan recovery.',
      ],
    },
    ja: {
      icon: '🏔️',
      title: '最高自己統制型',
      description: '非常に高い自己統制力を持っています。強力な抑制力ですが、過度な統制が硬直やバーンアウトにつながらないようバランスが必要です。',
      tips: [
        '計画に「余白」と即興の楽しみを意図的に入れましょう。',
        '統制欲求が完璧主義や自己批判に広がらないか点検しましょう。',
        '休むことも能力だと受け入れ回復を計画しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: '유혹이 있어도 잘 참는 편이다' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: '충동적으로 행동하기보다 한 번 더 생각한다' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: '나쁜 습관을 끊거나 줄이는 데 큰 어려움이 없다' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: '화가 나도 즉흥적으로 반응하지 않는다' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: '당장 즐거워도 장기적으로 해로운 일은 피한다' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: '하지 말아야 할 것을 잘 절제한다' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: '감정에 휩쓸리지 않고 침착함을 유지한다' },
    { id: 'f1', subscale: 'focus', reverse: false, text: '해야 할 일을 미루지 않고 해내는 편이다' },
    { id: 'f2', subscale: 'focus', reverse: false, text: '목표를 위해 당장의 즐거움을 미룰 수 있다' },
    { id: 'f3', subscale: 'focus', reverse: false, text: '집중이 필요할 때 잘 집중한다' },
    { id: 'f4', subscale: 'focus', reverse: false, text: '규칙적인 습관을 잘 유지한다' },
    { id: 'f5', subscale: 'focus', reverse: false, text: '시작한 일을 끝까지 마무리하는 편이다' },
    { id: 'f6', subscale: 'focus', reverse: false, text: '산만해져도 다시 할 일로 돌아온다' },
    { id: 'f7', subscale: 'focus', reverse: false, text: '계획한 것을 꾸준히 실천한다' },
  ],
  en: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: 'I resist temptations well' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: 'I think twice rather than act impulsively' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: 'I have little trouble breaking or reducing bad habits' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: 'I do not react impulsively even when angry' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: 'I avoid things harmful in the long run even if pleasant now' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: 'I restrain myself well from things I should not do' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: 'I stay calm without being swept away by emotion' },
    { id: 'f1', subscale: 'focus', reverse: false, text: 'I get things done without putting them off' },
    { id: 'f2', subscale: 'focus', reverse: false, text: 'I can delay immediate pleasure for a goal' },
    { id: 'f3', subscale: 'focus', reverse: false, text: 'I concentrate well when focus is needed' },
    { id: 'f4', subscale: 'focus', reverse: false, text: 'I maintain regular habits well' },
    { id: 'f5', subscale: 'focus', reverse: false, text: 'I tend to finish what I start' },
    { id: 'f6', subscale: 'focus', reverse: false, text: 'Even when distracted, I return to the task' },
    { id: 'f7', subscale: 'focus', reverse: false, text: 'I steadily carry out what I planned' },
  ],
  ja: [
    { id: 'r1', subscale: 'restraint', reverse: false, text: '誘惑があってもよく我慢する方だ' },
    { id: 'r2', subscale: 'restraint', reverse: false, text: '衝動的に行動するよりもう一度考える' },
    { id: 'r3', subscale: 'restraint', reverse: false, text: '悪い習慣を断つ・減らすのに大きな苦労がない' },
    { id: 'r4', subscale: 'restraint', reverse: false, text: '怒っても衝動的に反応しない' },
    { id: 'r5', subscale: 'restraint', reverse: false, text: '今は楽しくても長期的に有害なことは避ける' },
    { id: 'r6', subscale: 'restraint', reverse: false, text: 'してはいけないことをよく自制する' },
    { id: 'r7', subscale: 'restraint', reverse: false, text: '感情に流されず冷静さを保つ' },
    { id: 'f1', subscale: 'focus', reverse: false, text: 'やるべきことを先延ばしせずこなす方だ' },
    { id: 'f2', subscale: 'focus', reverse: false, text: '目標のために目先の楽しみを後回しにできる' },
    { id: 'f3', subscale: 'focus', reverse: false, text: '集中が必要な時によく集中する' },
    { id: 'f4', subscale: 'focus', reverse: false, text: '規則的な習慣をよく維持する' },
    { id: 'f5', subscale: 'focus', reverse: false, text: '始めたことを最後までやり遂げる方だ' },
    { id: 'f6', subscale: 'focus', reverse: false, text: '気が散っても再びやるべきことに戻る' },
    { id: 'f7', subscale: 'focus', reverse: false, text: '計画したことを着実に実践する' },
  ],
}

function calcLevel(score: number): ControlLevel {
  if (score <= 2.5) return 'building'
  if (score <= 3.5) return 'moderate'
  if (score <= 4.3) return 'strong'
  return 'high'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function SelfControlTest({ locale: lp = 'ko' }: Props) {
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
    const rItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'restraint')
    const fItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'focus')
    const rScore = rItems.reduce((s, x) => s + x.adj, 0) / rItems.length
    const fScore = fItems.reduce((s, x) => s + x.adj, 0) / fItems.length
    const overall = (rScore + fScore) / 2
    return { rScore, fScore, overall }
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

  const { rScore, fScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const rPct = Math.round(((rScore - 1) / 4) * 100)
  const fPct = Math.round(((fScore - 1) / 4) * 100)

  const levelColors: Record<ControlLevel, string> = {
    building: '#6ee7b7',
    moderate: '#34d399',
    strong: '#10b981',
    high: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.restraintLabel}</span>
            <span className="font-bold" style={{ color }}>{rScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={rPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.restraintLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.focusLabel}</span>
            <span className="font-bold" style={{ color }}>{fScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={fPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.focusLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${fPct}%`, backgroundColor: color }} />
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
