import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import RelatedReading from '../shared/RelatedReading';

type SupportedLang = 'ko' | 'en' | 'ja'
type ResultKey = 'rest' | 'activation' | 'meaning' | 'support'

interface Question {
  text: string
  scores: Record<ResultKey, number>
}

interface Result {
  title: string
  subtitle: string
  description: string
  plan: string[]
  supportNote: string
}

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  note: string
  progress: (current: number, total: number) => string
  result: string
  plan: string
  restart: string
  share: string
}> = {
  ko: {
    title: '무기력증 테스트',
    subtitle: '에너지 저하, 회피, 의미 상실, 도움 필요 신호를 가볍게 점검합니다.',
    note: '이 도구는 진단이 아닙니다. 2주 이상 일상 기능이 크게 떨어지거나 자해 생각이 있다면 즉시 전문가 도움을 받으세요.',
    progress: (current, total) => `${current} / ${total}`,
    result: '현재 회복 포인트',
    plan: '작은 회복 계획',
    restart: '다시 하기',
    share: '공유하기',
  },
  en: {
    title: 'Lethargy Check-In',
    subtitle: 'A gentle check for low energy, avoidance, loss of meaning, and support needs.',
    note: 'This is not a diagnosis. If your daily functioning has dropped for more than two weeks or you have thoughts of self-harm, seek professional help now.',
    progress: (current, total) => `${current} / ${total}`,
    result: 'Current recovery focus',
    plan: 'Small recovery plan',
    restart: 'Retake',
    share: 'Share',
  },
  ja: {
    title: '無気力チェック',
    subtitle: 'エネルギー低下、回避、意味の喪失、支援の必要性をやさしく確認します。',
    note: 'これは診断ではありません。2週間以上生活機能が大きく落ちる、または自傷の考えがある場合はすぐ専門家に相談してください。',
    progress: (current, total) => `${current} / ${total}`,
    result: '現在の回復ポイント',
    plan: '小さな回復計画',
    restart: 'もう一度',
    share: '共有',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { text: '아침에 일어나도 몸이 충전되지 않은 느낌이 든다.', scores: { rest: 3, activation: 1, meaning: 0, support: 1 } },
    { text: '해야 할 일을 생각하면 몸이 무거워져 시작이 어렵다.', scores: { rest: 1, activation: 3, meaning: 1, support: 1 } },
    { text: '예전에는 의미 있던 일이 지금은 별 감흥이 없다.', scores: { rest: 1, activation: 1, meaning: 3, support: 1 } },
    { text: '혼자 해결하려다 더 고립되는 느낌이 든다.', scores: { rest: 0, activation: 1, meaning: 1, support: 3 } },
    { text: '수면, 식사, 햇빛, 움직임 중 무너진 것이 많다.', scores: { rest: 3, activation: 2, meaning: 0, support: 1 } },
    { text: '작은 행동 하나도 시작 전부터 포기하게 된다.', scores: { rest: 1, activation: 3, meaning: 2, support: 1 } },
    { text: '내가 뭘 원하는지 잘 모르겠고 방향감이 흐리다.', scores: { rest: 0, activation: 1, meaning: 3, support: 1 } },
    { text: '누군가와 이야기하면 조금은 버틸 수 있을 것 같다.', scores: { rest: 0, activation: 1, meaning: 1, support: 3 } },
  ],
  en: [
    { text: 'Even after waking up, your body does not feel recharged.', scores: { rest: 3, activation: 1, meaning: 0, support: 1 } },
    { text: 'Thinking about tasks makes your body heavy and hard to start.', scores: { rest: 1, activation: 3, meaning: 1, support: 1 } },
    { text: 'Things that used to matter now feel flat.', scores: { rest: 1, activation: 1, meaning: 3, support: 1 } },
    { text: 'Trying to solve it alone makes you feel more isolated.', scores: { rest: 0, activation: 1, meaning: 1, support: 3 } },
    { text: 'Sleep, meals, sunlight, or movement have fallen apart.', scores: { rest: 3, activation: 2, meaning: 0, support: 1 } },
    { text: 'Even a tiny action feels defeated before it starts.', scores: { rest: 1, activation: 3, meaning: 2, support: 1 } },
    { text: 'You are unsure what you want and direction feels blurry.', scores: { rest: 0, activation: 1, meaning: 3, support: 1 } },
    { text: 'Talking with someone would make this feel more bearable.', scores: { rest: 0, activation: 1, meaning: 1, support: 3 } },
  ],
  ja: [
    { text: '朝起きても体が充電されていない感じがする。', scores: { rest: 3, activation: 1, meaning: 0, support: 1 } },
    { text: 'やるべきことを考えると体が重く、始めにくい。', scores: { rest: 1, activation: 3, meaning: 1, support: 1 } },
    { text: '以前は意味があったことにあまり心が動かない。', scores: { rest: 1, activation: 1, meaning: 3, support: 1 } },
    { text: '一人で解決しようとして、さらに孤立する感じがある。', scores: { rest: 0, activation: 1, meaning: 1, support: 3 } },
    { text: '睡眠、食事、日光、動きの多くが崩れている。', scores: { rest: 3, activation: 2, meaning: 0, support: 1 } },
    { text: '小さな行動でも始める前から諦めてしまう。', scores: { rest: 1, activation: 3, meaning: 2, support: 1 } },
    { text: '自分が何を望んでいるのか分からず方向感が薄い。', scores: { rest: 0, activation: 1, meaning: 3, support: 1 } },
    { text: '誰かと話せば少し耐えられそうだ。', scores: { rest: 0, activation: 1, meaning: 1, support: 3 } },
  ],
}

const OPTIONS: Record<SupportedLang, string[]> = {
  ko: ['거의 아니다', '가끔 그렇다', '자주 그렇다', '매우 그렇다'],
  en: ['Rarely', 'Sometimes', 'Often', 'Very often'],
  ja: ['ほとんどない', '時々ある', 'よくある', 'とてもよくある'],
}

const RESULTS: Record<ResultKey, Record<SupportedLang, Result>> = {
  rest: {
    ko: { title: '회복 에너지 부족형', subtitle: '의지보다 생체 리듬 회복이 먼저입니다', description: '지금은 더 밀어붙이기보다 수면, 식사, 햇빛, 몸의 긴장을 낮추는 것이 우선입니다.', plan: ['기상 시간을 먼저 고정하기', '아침 햇빛 5분 받기', '단백질이 있는 첫 식사 챙기기'], supportNote: '신체 피로가 길게 이어지면 건강검진과 상담을 함께 고려하세요.' },
    en: { title: 'Low Recovery Energy', subtitle: 'Rhythm comes before willpower', description: 'Instead of pushing harder, rebuild sleep, meals, sunlight, and body calm first.', plan: ['Fix wake-up time first', 'Get 5 minutes of morning light', 'Eat a first meal with protein'], supportNote: 'If body fatigue lasts, consider both a health check and counseling.' },
    ja: { title: '回復エネルギー不足型', subtitle: '意志より生体リズムの回復が先です', description: '今は無理に押すより、睡眠、食事、日光、体の緊張を整えることが先です。', plan: ['起床時間を固定する', '朝の日光を5分浴びる', 'たんぱく質のある食事を取る'], supportNote: '身体の疲労が長く続く場合は健康チェックと相談を検討してください。' },
  },
  activation: {
    ko: { title: '행동 시동 저하형', subtitle: '동기보다 2분 행동이 먼저입니다', description: '생각으로 에너지를 만들기보다, 아주 작은 행동으로 뇌에 시작 신호를 주는 것이 효과적입니다.', plan: ['2분만 정리하기', '해야 할 일을 한 문장으로 줄이기', '완료 후 바로 체크 표시하기'], supportNote: '움직임이 시작되면 감정은 뒤늦게 따라오는 경우가 많습니다.' },
    en: { title: 'Low Activation', subtitle: 'Two minutes comes before motivation', description: 'Rather than thinking your way into energy, give the brain a start signal through tiny action.', plan: ['Clean for only 2 minutes', 'Shrink the task into one sentence', 'Check it off immediately after finishing'], supportNote: 'Emotion often follows action later.' },
    ja: { title: '行動開始低下型', subtitle: '動機より2分行動が先です', description: '考えてエネルギーを作るより、小さな行動で開始信号を出しましょう。', plan: ['2分だけ片づける', '作業を一文に縮める', '終わったらすぐチェックする'], supportNote: '感情は行動の後からついてくることがあります。' },
  },
  meaning: {
    ko: { title: '의미 감각 저하형', subtitle: '목표보다 작은 이유를 회복해야 합니다', description: '큰 인생 목적을 찾기 전에 오늘을 버티게 하는 작은 이유를 다시 연결하는 단계입니다.', plan: ['오늘 의미 있었던 장면 1개 쓰기', '고마웠던 사람 1명 떠올리기', '나를 살리는 활동 10분 하기'], supportNote: '의미 상실이 깊고 오래가면 혼자 결론 내리지 말고 대화가 필요합니다.' },
    en: { title: 'Low Meaning Signal', subtitle: 'Recover a small why before a big goal', description: 'Before searching for a grand purpose, reconnect with one small reason that carries today.', plan: ['Write one meaningful moment today', 'Name one person you are grateful for', 'Do one life-giving activity for 10 minutes'], supportNote: 'If meaninglessness feels deep and persistent, do not decide alone. Talk to someone.' },
    ja: { title: '意味感覚低下型', subtitle: '大きな目標より小さな理由を回復します', description: '大きな目的を探す前に、今日を支える小さな理由とつながり直します。', plan: ['今日意味があった場面を1つ書く', '感謝できる人を1人思い出す', '自分を生かす活動を10分する'], supportNote: '意味の喪失が深く長い時は、一人で結論を出さず話してください。' },
  },
  support: {
    ko: { title: '연결 지원 필요형', subtitle: '혼자 버티는 전략이 한계에 왔을 수 있습니다', description: '지금 필요한 것은 더 강한 의지가 아니라 안전한 연결과 도움 요청일 수 있습니다.', plan: ['오늘 연락할 사람 1명 정하기', '상태를 한 문장으로 보내기', '필요하면 상담/진료 예약하기'], supportNote: '자해 생각이 있거나 위험하다고 느껴지면 즉시 1393, 1577-0199, 119를 이용하세요.' },
    en: { title: 'Support Needed', subtitle: 'Going alone may have reached its limit', description: 'What you need may not be stronger willpower, but safer connection and help.', plan: ['Choose one person to contact today', 'Send one honest sentence about your state', 'Book counseling or medical care if needed'], supportNote: 'If you feel at risk or have self-harm thoughts, contact emergency or crisis support immediately.' },
    ja: { title: 'つながり支援必要型', subtitle: '一人で耐える戦略が限界かもしれません', description: '必要なのは強い意志ではなく、安全なつながりと助けを求めることかもしれません。', plan: ['今日連絡する人を1人決める', '状態を一文で送る', '必要なら相談や受診を予約する'], supportNote: '危険を感じる、自傷の考えがある場合はすぐ緊急窓口に連絡してください。' },
  },
}

interface Props { locale?: string }

export default function LethargyRecoveryTest({ locale: rawLocale = 'ko' }: Props) {
  const locale = lang(rawLocale)
  const labels = LABELS[locale]
  const questions = QUESTIONS[locale]
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<ResultKey, number>>({ rest: 0, activation: 0, meaning: 0, support: 0 })
  const [result, setResult] = useState<ResultKey | null>(null)
  useRecordFinishedTest({ testId: "lethargy-recovery", title: "LethargyRecoveryTest", finished: Boolean(result) });

  function pick(value: number) {
    const next = { ...scores }
    for (const key of Object.keys(next) as ResultKey[]) {
      next[key] += questions[current].scores[key] * value
    }
    if (current + 1 >= questions.length) {
      const order: ResultKey[] = ['rest', 'activation', 'meaning', 'support']
      setResult(order.reduce((best, key) => next[key] > next[best] ? key : best, order[0]))
    }
    setScores(next)
    setCurrent(current + 1)
  }

  function restart() {
    setCurrent(0)
    setResult(null)
    setScores({ rest: 0, activation: 0, meaning: 0, support: 0 })
  }

  function share() {
    if (!result) return
    const text = `${labels.title}: ${RESULTS[result][locale].title}`
    if (navigator.share) navigator.share({ title: labels.title, text, url: window.location.href })
    else navigator.clipboard.writeText(`${text} ${window.location.href}`)
  }

  if (result) {
    const data = RESULTS[result][locale]
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">{labels.result}</p>
          <h1 className="text-3xl font-black text-green-950">{data.title}</h1>
          <p className="font-medium text-green-700">{data.subtitle}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-5">
          <h2 className="text-sm font-bold text-green-800 mb-3">{labels.plan}</h2>
          <ul className="space-y-2">
            {data.plan.map((item) => <li className="text-sm text-green-900" key={item}>- {item}</li>)}
          </ul>
        </div>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">{data.supportNote}</p>
        <ShareResultButton
          locale={locale}
          heading={labels.title}
          resultTitle={data.title}
          emoji={result === 'rest' ? '🛌' : result === 'activation' ? '🚶' : result === 'meaning' ? '🧭' : '🤝'}
          description={data.description}
        />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/breathing/timer`, label: locale === 'ko' ? '🫁 호흡 타이머' : locale === 'ja' ? '🫁 呼吸タイマー' : '🫁 Breathing timer' },
            { href: `/${locale}/habit-builder/30-days`, label: locale === 'ko' ? '✅ 30일 습관 만들기' : locale === 'ja' ? '✅ 30日習慣づくり' : '✅ 30-day habit builder' },
            { href: `/${locale}/sleep-type/test`, label: locale === 'ko' ? '💤 수면 유형 테스트' : locale === 'ja' ? '💤 睡眠タイプテスト' : '💤 Sleep type test' },
          ]}
        />
        <RelatedReading locale={locale} topic="lethargy" />
        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border bg-card px-4 py-3 text-sm font-bold hover:bg-accent">{labels.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">{labels.share}</button>
        </div>
      </div>
    )
  }

  const progress = Math.round((current / questions.length) * 100)
  return (
    <Questionnaire
      title={labels.title}
      subtitle={labels.subtitle}
      question={questions[current].text}
      questionLabel={labels.progress(current + 1, questions.length)}
      progress={progress}
      options={OPTIONS[locale].map((label, index) => ({ label, value: index + 1 }))}
      note={labels.note}
      onSelect={(value) => pick(value - 1)}
    />
  )
}
