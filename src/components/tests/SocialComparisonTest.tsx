import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja'
type CompLevel = 'self' | 'mild' | 'sensitive' | 'intense'
type Subscale = 'ability' | 'opinion'

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
  yourScore: string; overallLabel: string; abilityLabel: string; opinionLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '사회적 비교 성향 테스트',
    subtitle: '나는 남과 얼마나 비교하는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 사회적 비교 지수는',
    yourScore: '나의 사회적 비교 지수',
    overallLabel: '종합 비교 성향',
    abilityLabel: '능력 비교',
    opinionLabel: '의견 비교',
    outOf: '/ 5.0',
    tipsLabel: '마음을 위한 팁',
    note: '기번스와 분크의 사회적 비교 지향 척도(INCOM) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Social Comparison Test',
    subtitle: 'How much do you compare yourself to others?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My social comparison score is',
    yourScore: 'Your Social Comparison Score',
    overallLabel: 'Overall Comparison Tendency',
    abilityLabel: 'Ability Comparison',
    opinionLabel: 'Opinion Comparison',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Mind',
    note: 'This self-reflection test is based on the Iowa-Netherlands Comparison Orientation Measure (INCOM) by Gibbons & Buunk. It does not replace professional assessment.',
  },
  ja: {
    title: '社会的比較傾向テスト',
    subtitle: '自分は他人とどれくらい比較するか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の社会的比較度は',
    yourScore: 'あなたの社会的比較度',
    overallLabel: '総合比較傾向',
    abilityLabel: '能力比較',
    opinionLabel: '意見比較',
    outOf: '/ 5.0',
    tipsLabel: '心のためのヒント',
    note: 'このテストはGibbons & Buunkの社会的比較志向尺度（INCOM）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
}

const LEVEL_DATA: Record<CompLevel, Record<SupportedLang, LevelData>> = {
  self: {
    ko: {
      icon: '🧭',
      title: '자기 기준형',
      description: '남보다 자신의 기준으로 판단하는 편입니다. 타인의 성취나 의견에 크게 흔들리지 않고 중심을 잡습니다.',
      tips: [
        '지금의 단단한 자기 기준을 의식적으로 지켜 나가세요.',
        '가끔의 비교는 배움의 기회로 가볍게 활용하세요.',
        '나만의 가치와 진척을 정기적으로 점검하세요.',
      ],
    },
    en: {
      icon: '🧭',
      title: 'Self-Referenced',
      description: 'You tend to judge by your own standards rather than others. You stay centered without being swayed much by others\' achievements or opinions.',
      tips: [
        'Consciously protect the solid inner compass you already have.',
        'Use the occasional comparison lightly, as a chance to learn.',
        'Regularly review your own values and progress.',
      ],
    },
    ja: {
      icon: '🧭',
      title: '自己基準型',
      description: '他人より自分の基準で判断する方です。他者の成果や意見に大きく揺れず、中心を保てます。',
      tips: [
        '今ある確かな自己基準を意識して守りましょう。',
        '時々の比較は学びの機会として軽く活用しましょう。',
        '自分の価値と進捗を定期的に点検しましょう。',
      ],
    },
  },
  mild: {
    ko: {
      icon: '🙂',
      title: '가벼운 비교형',
      description: '대부분의 사람이 하는 일상적인 수준의 비교입니다. 가끔 남과 견주지만 자기 페이스를 유지합니다.',
      tips: [
        '비교가 시작되면 "내 기준은 무엇인가" 자문하세요.',
        '상향 비교는 자극제로, 하향 비교는 감사로 활용하세요.',
        'SNS 피드는 편집된 하이라이트임을 떠올리세요.',
      ],
    },
    en: {
      icon: '🙂',
      title: 'Mild Comparer',
      description: 'An everyday level of comparison that most people do. You measure against others sometimes but keep your own pace.',
      tips: [
        'When comparison starts, ask "what is my own standard?"',
        'Use upward comparison as fuel and downward comparison as gratitude.',
        'Remember that feeds are edited highlight reels.',
      ],
    },
    ja: {
      icon: '🙂',
      title: '軽い比較型',
      description: '多くの人がする日常的なレベルの比較です。時々他人と比べますが、自分のペースを保てます。',
      tips: [
        '比較が始まったら「自分の基準は何か」と自問しましょう。',
        '上方比較は刺激に、下方比較は感謝に活用しましょう。',
        'SNSのフィードは編集されたハイライトだと思い出しましょう。',
      ],
    },
  },
  sensitive: {
    ko: {
      icon: '⚖️',
      title: '비교 민감형',
      description: '남과의 비교가 뚜렷하게 나타납니다. 타인의 성취나 평가가 자존감과 기분에 자주 영향을 줄 수 있습니다.',
      tips: [
        '비교가 잦은 계정·환경을 정리하거나 음소거하세요.',
        '"어제의 나"와 비교하는 자기 기준 비교로 전환하세요.',
        '비교 직후 떠오르는 감정에 이름을 붙여 거리를 두세요.',
      ],
    },
    en: {
      icon: '⚖️',
      title: 'Comparison-Sensitive',
      description: 'Comparison with others shows up clearly. Others\' achievements or judgments may frequently affect your self-esteem and mood.',
      tips: [
        'Clean up or mute accounts and environments that trigger comparison.',
        'Shift to self-referenced comparison with "yesterday\'s you."',
        'Name the feelings that arise right after comparing to create distance.',
      ],
    },
    ja: {
      icon: '⚖️',
      title: '比較敏感型',
      description: '他人との比較がはっきり表れています。他者の成果や評価が自尊心や気分にしばしば影響する可能性があります。',
      tips: [
        '比較を誘発するアカウントや環境を整理・ミュートしましょう。',
        '「昨日の自分」と比べる自己基準比較に切り替えましょう。',
        '比較直後に湧く感情に名前をつけて距離を取りましょう。',
      ],
    },
  },
  intense: {
    ko: {
      icon: '🔁',
      title: '비교 과민형',
      description: '사회적 비교 성향이 매우 강합니다. 끊임없는 비교가 자존감을 갉아먹고 마음의 에너지를 크게 소모할 수 있습니다.',
      tips: [
        '하루 일정 시간 SNS·비교 자극을 차단해 보세요.',
        '나의 가치를 성취가 아닌 존재 자체에서 찾는 연습을 하세요.',
        '비교가 고통이 될 정도라면 상담 등 도움을 고려하세요.',
      ],
    },
    en: {
      icon: '🔁',
      title: 'Comparison-Overwhelmed',
      description: 'Your social comparison tendency is very strong. Constant comparison can erode self-esteem and drain a lot of mental energy.',
      tips: [
        'Block social media and comparison triggers for set hours each day.',
        'Practice finding your worth in your being, not in achievements.',
        'If comparison becomes painful, consider help such as counseling.',
      ],
    },
    ja: {
      icon: '🔁',
      title: '比較過敏型',
      description: '社会的比較傾向が非常に強いです。絶え間ない比較が自尊心を蝕み、心のエネルギーを大きく消耗させる可能性があります。',
      tips: [
        '一日の一定時間、SNSや比較刺激を遮断してみましょう。',
        '自分の価値を成果ではなく存在そのものに見出す練習をしましょう。',
        '比較が苦痛になるほどならカウンセリングなど助けを検討しましょう。',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'a1', subscale: 'ability', reverse: false, text: '내가 일을 얼마나 잘하는지 남과 비교해 판단한다' },
    { id: 'a2', subscale: 'ability', reverse: false, text: '다른 사람의 성취를 보면 내 수준을 가늠하게 된다' },
    { id: 'a3', subscale: 'ability', reverse: false, text: 'SNS에서 남의 삶을 보며 내 처지와 비교한다' },
    { id: 'a4', subscale: 'ability', reverse: false, text: '나와 비슷한 사람이 나보다 잘되면 신경이 쓰인다' },
    { id: 'a5', subscale: 'ability', reverse: false, text: '내 외모나 능력을 자주 남과 견주어 본다' },
    { id: 'a6', subscale: 'ability', reverse: false, text: '주변 사람들의 성공이 나를 초조하게 만들 때가 있다' },
    { id: 'a7', subscale: 'ability', reverse: false, text: '남들이 나를 어떻게 평가하는지 자주 궁금하다' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: '무엇을 생각해야 할지 남들의 의견을 살펴 정한다' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: '결정을 내리기 전에 다른 사람은 어떻게 하는지 본다' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: '내 생각이 맞는지 남과 비교해 확인하려 한다' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: '유행이나 다수의 선택을 따르는 편이다' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: '내 감정이나 반응이 "정상"인지 남과 견주어 본다' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: '중요한 일은 주변 사람의 반응을 보고 판단한다' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: '다른 사람의 평가에 따라 내 생각이 자주 바뀐다' },
  ],
  en: [
    { id: 'a1', subscale: 'ability', reverse: false, text: 'I judge how well I am doing by comparing with others' },
    { id: 'a2', subscale: 'ability', reverse: false, text: "Seeing others' achievements makes me gauge my own level" },
    { id: 'a3', subscale: 'ability', reverse: false, text: "I compare my situation with others' lives on social media" },
    { id: 'a4', subscale: 'ability', reverse: false, text: 'It bothers me when someone similar to me does better than I do' },
    { id: 'a5', subscale: 'ability', reverse: false, text: 'I often compare my looks or abilities with others' },
    { id: 'a6', subscale: 'ability', reverse: false, text: "Other people's successes sometimes make me anxious" },
    { id: 'a7', subscale: 'ability', reverse: false, text: 'I often wonder how others evaluate me' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: "I decide what to think by looking at other people's opinions" },
    { id: 'o2', subscale: 'opinion', reverse: false, text: 'Before making a decision, I look at how others do it' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: 'I try to confirm whether my thinking is right by comparing with others' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: 'I tend to follow trends or the choices of the majority' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: 'I measure against others whether my feelings or reactions are "normal"' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: "I judge important matters by watching the reactions of people around me" },
    { id: 'o7', subscale: 'opinion', reverse: false, text: "My thinking often changes based on others' evaluations" },
  ],
  ja: [
    { id: 'a1', subscale: 'ability', reverse: false, text: '自分がどれだけうまくやれているかを他人と比較して判断する' },
    { id: 'a2', subscale: 'ability', reverse: false, text: '他人の成果を見ると自分のレベルを測ってしまう' },
    { id: 'a3', subscale: 'ability', reverse: false, text: 'SNSで他人の生活を見て自分の状況と比較する' },
    { id: 'a4', subscale: 'ability', reverse: false, text: '自分に似た人が自分より成功すると気になる' },
    { id: 'a5', subscale: 'ability', reverse: false, text: '自分の外見や能力をよく他人と比べてみる' },
    { id: 'a6', subscale: 'ability', reverse: false, text: '周りの人の成功が自分を焦らせることがある' },
    { id: 'a7', subscale: 'ability', reverse: false, text: '他人が自分をどう評価するかよく気になる' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: '何を考えるべきか他人の意見を見て決める' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: '決断を下す前に他の人はどうするか見る' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: '自分の考えが正しいか他人と比較して確認しようとする' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: '流行や多数の選択に従う方だ' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: '自分の感情や反応が「普通」か他人と比べてみる' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: '重要なことは周りの人の反応を見て判断する' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: '他人の評価によって自分の考えがよく変わる' },
  ],
}

function calcLevel(score: number): CompLevel {
  if (score <= 2.3) return 'self'
  if (score <= 3.2) return 'mild'
  if (score <= 4.0) return 'sensitive'
  return 'intense'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function SocialComparisonTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "social-comparison", title: "SocialComparisonTest", finished: Boolean(done) });

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
    const aItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'ability')
    const oItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'opinion')
    const aScore = aItems.reduce((s, x) => s + x.adj, 0) / aItems.length
    const oScore = oItems.reduce((s, x) => s + x.adj, 0) / oItems.length
    const overall = (aScore + oScore) / 2
    return { aScore, oScore, overall }
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

  const { aScore, oScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const aPct = Math.round(((aScore - 1) / 4) * 100)
  const oPct = Math.round(((oScore - 1) / 4) * 100)

  const levelColors: Record<CompLevel, string> = {
    self: '#10b981',
    mild: '#0ea5e9',
    sensitive: '#f59e0b',
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
            <span className="font-bold text-muted-foreground">{lb.abilityLabel}</span>
            <span className="font-bold" style={{ color }}>{aScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={aPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.abilityLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${aPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.opinionLabel}</span>
            <span className="font-bold" style={{ color }}>{oScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={oPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.opinionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${oPct}%`, backgroundColor: color }} />
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
