import { useEffect, useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import CopyResultLink from '../shared/CopyResultLink';
import { readResultCode, writeResultCode, clearResultCode } from '../../lib/result-url';

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ResultKey = 'starter' | 'planner' | 'critic' | 'recovering'

interface Question {
  text: string
  scores: Record<ResultKey, number>
}

interface Result {
  title: string
  subtitle: string
  description: string
  actions: string[]
}

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  progress: (current: number, total: number) => string
  restart: string
  share: string
  result: string
  actions: string
  next: string
}> = {
  ko: {
    title: '게으른 완벽주의자 테스트',
    subtitle: '미루는 이유가 게으름인지, 실패 회피인지, 기준 과잉인지 살펴보세요.',
    progress: (current, total) => `${current} / ${total}`,
    restart: '다시 하기',
    share: '공유하기',
    result: '나의 패턴',
    actions: '오늘 바로 할 일',
    next: '선택',
  },
  en: {
    title: 'Lazy Perfectionist Test',
    subtitle: 'Find out whether your delay comes from laziness, fear of failure, or overbuilt standards.',
    progress: (current, total) => `${current} / ${total}`,
    restart: 'Retake',
    share: 'Share',
    result: 'Your pattern',
    actions: 'Do this today',
    next: 'Choose',
  },
  ja: {
    title: '怠けた完璧主義者テスト',
    subtitle: '先延ばしの理由が怠け、失敗回避、基準の高さのどれに近いか確認します。',
    progress: (current, total) => `${current} / ${total}`,
    restart: 'もう一度',
    share: '共有',
    result: 'あなたのパターン',
    actions: '今日やること',
    next: '選択',
  },
  zh: { title: '懒惰完美主义测验', subtitle: '看看拖延的原因是懒，是怕失败，还是标准定得太高。', progress: (current, total) => `${current} / ${total}`, restart: '重新测验', share: '分享', result: '我的模式', actions: '今天就能做的事', next: '选择' },
  fr: { title: 'Test du perfectionniste qui procrastine', subtitle: 'Voir si le report vient de la paresse, de la peur d’échouer ou d’exigences trop hautes.', progress: (current, total) => `${current} / ${total}`, restart: 'Recommencer', share: 'Partager', result: 'Votre schéma', actions: 'À faire dès aujourd’hui', next: 'Choix' },
  es: { title: 'Test del perfeccionista que procrastina', subtitle: 'Mira si aplazas por pereza, por miedo a fallar o por un listón demasiado alto.', progress: (current, total) => `${current} / ${total}`, restart: 'Repetir', share: 'Compartir', result: 'Tu patrón', actions: 'Para hacer hoy mismo', next: 'Elección' },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { text: '새 일을 시작할 때 가장 먼저 드는 생각은?', scores: { starter: 0, planner: 3, critic: 2, recovering: 1 } },
    { text: '완성도가 70점쯤 된 결과물을 공개해야 한다면?', scores: { starter: 0, planner: 2, critic: 3, recovering: 1 } },
    { text: '계획표를 세운 뒤 실제 행동까지 이어지는 편인가요?', scores: { starter: 0, planner: 3, critic: 1, recovering: 2 } },
    { text: '실패한 일을 떠올릴 때 가장 강한 감정은?', scores: { starter: 1, planner: 1, critic: 3, recovering: 0 } },
    { text: '작게 시작하라는 조언을 들으면?', scores: { starter: 1, planner: 2, critic: 2, recovering: 3 } },
    { text: '마감 직전의 나는 보통 어떤 모습인가요?', scores: { starter: 2, planner: 3, critic: 2, recovering: 1 } },
    { text: '남의 평가를 생각하면 행동이 어떻게 변하나요?', scores: { starter: 0, planner: 1, critic: 3, recovering: 1 } },
    { text: '오늘 10분만 해도 되는 일을 앞에 두면?', scores: { starter: 3, planner: 1, critic: 0, recovering: 2 } },
  ],
  en: [
    { text: 'When you start something new, what appears first?', scores: { starter: 0, planner: 3, critic: 2, recovering: 1 } },
    { text: 'If you had to publish a 70 percent finished version?', scores: { starter: 0, planner: 2, critic: 3, recovering: 1 } },
    { text: 'Do your plans usually turn into action?', scores: { starter: 0, planner: 3, critic: 1, recovering: 2 } },
    { text: 'When you remember a failure, what feels strongest?', scores: { starter: 1, planner: 1, critic: 3, recovering: 0 } },
    { text: 'When someone says, start small, you tend to...', scores: { starter: 1, planner: 2, critic: 2, recovering: 3 } },
    { text: 'Right before a deadline, you are usually...', scores: { starter: 2, planner: 3, critic: 2, recovering: 1 } },
    { text: 'When you imagine judgment from others, your action becomes...', scores: { starter: 0, planner: 1, critic: 3, recovering: 1 } },
    { text: 'If the task only asks for 10 minutes today?', scores: { starter: 3, planner: 1, critic: 0, recovering: 2 } },
  ],
  ja: [
    { text: '新しいことを始める時、最初に浮かぶことは？', scores: { starter: 0, planner: 3, critic: 2, recovering: 1 } },
    { text: '70点ほどの完成度で公開するとしたら？', scores: { starter: 0, planner: 2, critic: 3, recovering: 1 } },
    { text: '計画は実際の行動につながりやすいですか？', scores: { starter: 0, planner: 3, critic: 1, recovering: 2 } },
    { text: '失敗を思い出す時、最も強い感情は？', scores: { starter: 1, planner: 1, critic: 3, recovering: 0 } },
    { text: '小さく始めようと言われると？', scores: { starter: 1, planner: 2, critic: 2, recovering: 3 } },
    { text: '締切直前のあなたは？', scores: { starter: 2, planner: 3, critic: 2, recovering: 1 } },
    { text: '他人の評価を想像すると行動は？', scores: { starter: 0, planner: 1, critic: 3, recovering: 1 } },
    { text: '今日は10分だけでよい作業なら？', scores: { starter: 3, planner: 1, critic: 0, recovering: 2 } },
  ],
  zh: [{ text: '要开始一件新事时，你脑子里先冒出什么？', scores: { starter: 0, planner: 3, critic: 2, recovering: 1 } }, { text: '如果完成度只有七成就得公开，你会怎样？', scores: { starter: 0, planner: 2, critic: 3, recovering: 1 } }, { text: '订好计划之后，你通常会真的动起来吗？', scores: { starter: 0, planner: 3, critic: 1, recovering: 2 } }, { text: '想起失败过的事，最强的感受是什么？', scores: { starter: 1, planner: 1, critic: 3, recovering: 0 } }, { text: '听到「先小小地开始」这种建议时？', scores: { starter: 1, planner: 2, critic: 2, recovering: 3 } }, { text: '临近截止时的你，通常是什么样子？', scores: { starter: 2, planner: 3, critic: 2, recovering: 1 } }, { text: '一想到别人的评价，你的行动会怎么变？', scores: { starter: 0, planner: 1, critic: 3, recovering: 1 } }, { text: '面对一件今天只要做十分钟的事？', scores: { starter: 3, planner: 1, critic: 0, recovering: 2 } }],
  fr: [{ text: 'Au moment de lancer quelque chose de neuf, quelle est votre première pensée ?', scores: { starter: 0, planner: 3, critic: 2, recovering: 1 } }, { text: 'S’il faut publier un résultat achevé à 70 %, que se passe-t-il ?', scores: { starter: 0, planner: 2, critic: 3, recovering: 1 } }, { text: 'Une fois le plan posé, passez-vous vraiment à l’acte ?', scores: { starter: 0, planner: 3, critic: 1, recovering: 2 } }, { text: 'En repensant à un échec, quelle émotion domine ?', scores: { starter: 1, planner: 1, critic: 3, recovering: 0 } }, { text: 'Quand on vous conseille de commencer petit ?', scores: { starter: 1, planner: 2, critic: 2, recovering: 3 } }, { text: 'À l’approche de l’échéance, à quoi ressemblez-vous ?', scores: { starter: 2, planner: 3, critic: 2, recovering: 1 } }, { text: 'Quand vous pensez au regard des autres, qu’est-ce qui change ?', scores: { starter: 0, planner: 1, critic: 3, recovering: 1 } }, { text: 'Face à une tâche qui ne demande que dix minutes aujourd’hui ?', scores: { starter: 3, planner: 1, critic: 0, recovering: 2 } }],
  es: [{ text: 'Al arrancar algo nuevo, ¿qué es lo primero que piensas?', scores: { starter: 0, planner: 3, critic: 2, recovering: 1 } }, { text: 'Si hay que enseñar un resultado al 70 %, ¿qué ocurre?', scores: { starter: 0, planner: 2, critic: 3, recovering: 1 } }, { text: 'Después de hacer el plan, ¿pasas de verdad a la acción?', scores: { starter: 0, planner: 3, critic: 1, recovering: 2 } }, { text: 'Al recordar algo que salió mal, ¿qué emoción pesa más?', scores: { starter: 1, planner: 1, critic: 3, recovering: 0 } }, { text: 'Cuando te aconsejan empezar pequeño, ¿qué haces?', scores: { starter: 1, planner: 2, critic: 2, recovering: 3 } }, { text: 'Cerca de la fecha límite, ¿cómo sueles estar?', scores: { starter: 2, planner: 3, critic: 2, recovering: 1 } }, { text: 'Al pensar en cómo te van a juzgar, ¿qué cambia?', scores: { starter: 0, planner: 1, critic: 3, recovering: 1 } }, { text: 'Ante algo que hoy solo pide diez minutos, ¿qué haces?', scores: { starter: 3, planner: 1, critic: 0, recovering: 2 } }],
}

const OPTIONS: Record<SupportedLang, string[]> = {
  ko: ['바로 작게 해본다', '계획부터 더 다듬는다', '완벽하지 않을까 봐 멈춘다', '불완전해도 연습으로 본다'],
  en: ['Try a tiny version', 'Refine the plan more', 'Stop because it may not be perfect', 'Treat imperfection as practice'],
  ja: ['小さく試す', '計画をさらに整える', '完璧でないのが怖くて止まる', '不完全でも練習と考える'],
  zh: ['马上做个小的', '先把计划再磨一磨', '怕不够好就停住', '不完美也当作练习'],
  fr: ['Faire une toute petite version', 'Peaufiner encore le plan', 'S’arrêter de peur que ce ne soit pas assez bon', 'Le prendre comme un entraînement, même imparfait'],
  es: ['Hacer una versión pequeña ya', 'Pulir el plan un poco más', 'Pararme por miedo a que no sea bastante bueno', 'Tomarlo como práctica aunque salga imperfecto'],
}

const RESULTS: Record<ResultKey, Record<SupportedLang, Result>> = {
  starter: {
    ko: { title: '작게 시작하는 회복형', subtitle: '이미 완벽주의를 행동으로 녹이는 중입니다', description: '당신은 기준을 낮추는 것이 아니라 시작 저항을 낮추는 법을 배우고 있습니다.', actions: ['오늘 할 일을 10분 단위로 자르기', '완성 대신 제출 기준을 정하기', '작은 완료를 기록하기'] },
    en: { title: 'Tiny Starter', subtitle: 'You are turning perfectionism into motion', description: 'You are not lowering your standards. You are lowering the friction of starting.', actions: ['Cut today into a 10-minute task', 'Define done before perfect', 'Record one small finish'] },
    ja: { title: '小さく始める回復型', subtitle: '完璧主義を行動に変えています', description: '基準を下げるのではなく、始める抵抗を下げる力があります。', actions: ['今日の作業を10分に分ける', '完璧より完了条件を決める', '小さな完了を記録する'] },
    zh: { title: '小步启动的恢复型', subtitle: '你已经在把完美主义化成行动', description: '你学的不是把标准降下来，而是把「开始」的阻力降下来。', actions: ['把今天的事切成十分钟一块', '把「完成」换成「交出去」的标准', '把小小的完成记下来'] },
    fr: { title: 'Celui qui démarre petit', subtitle: 'Vous transformez déjà le perfectionnisme en gestes', description: 'Vous n’apprenez pas à baisser vos exigences, mais à baisser la résistance au démarrage.', actions: ['Découper la journée en blocs de dix minutes', 'Remplacer « finir » par « rendre »', 'Noter les petites choses terminées'] },
    es: { title: 'Quien empieza pequeño', subtitle: 'Ya estás convirtiendo el perfeccionismo en acción', description: 'No estás aprendiendo a bajar el listón, sino a bajar la resistencia a empezar.', actions: ['Partir el día en bloques de diez minutos', 'Cambiar «terminar» por «entregar»', 'Anotar lo pequeño que sí completas'] },
  },
  planner: {
    ko: { title: '계획 과잉형', subtitle: '준비가 행동을 대신하고 있습니다', description: '계획은 강점이지만, 지금은 시작을 늦추는 안전장치가 되었을 수 있습니다.', actions: ['계획 시간을 15분으로 제한하기', '초안 하나를 먼저 만들기', '검토는 실행 후로 미루기'] },
    en: { title: 'Over-Planner', subtitle: 'Preparation is replacing action', description: 'Planning is a strength, but it may have become a safety behavior that delays the start.', actions: ['Limit planning to 15 minutes', 'Make one rough draft first', 'Review only after action'] },
    ja: { title: '計画過多型', subtitle: '準備が行動の代わりになっています', description: '計画力は強みですが、今は開始を遅らせる安全行動かもしれません。', actions: ['計画は15分まで', 'まず粗い下書きを作る', '見直しは実行後にする'] },
    zh: { title: '计划过量型', subtitle: '准备在替你做事', description: '会计划是长处，但现在它成了延后开始的安全垫。', actions: ['把做计划的时间限制在十五分钟', '先做出一个草稿', '复查留到执行之后'] },
    fr: { title: 'Trop de préparation', subtitle: 'La préparation remplace l’action', description: 'Planifier est une force, mais c’est devenu un coussin qui retarde le départ.', actions: ['Limiter le temps de plan à quinze minutes', 'Produire d’abord un brouillon', 'Repousser la relecture après l’exécution'] },
    es: { title: 'Exceso de plan', subtitle: 'Preparar está sustituyendo a actuar', description: 'Planificar es una fortaleza, pero ahora es el colchón que retrasa el arranque.', actions: ['Limitar el plan a quince minutos', 'Sacar primero un borrador', 'Dejar la revisión para después de ejecutar'] },
  },
  critic: {
    ko: { title: '내면 비평가형', subtitle: '실패보다 자기비난을 피하고 있습니다', description: '문제는 게으름이 아니라 실패 뒤에 따라오는 가혹한 해석입니다.', actions: ['결과와 나의 가치를 분리해서 쓰기', '80점 버전을 일부러 내보기', '비판 문장을 코치 문장으로 바꾸기'] },
    en: { title: 'Inner Critic', subtitle: 'You are avoiding self-attack more than failure', description: 'The issue is not laziness. It is the harsh meaning you attach to imperfect outcomes.', actions: ['Separate results from self-worth', 'Publish an 80 percent version on purpose', 'Turn criticism into coaching language'] },
    ja: { title: '内なる批評家型', subtitle: '失敗より自己批判を避けています', description: '問題は怠けではなく、不完全な結果への厳しい解釈です。', actions: ['結果と自分の価値を分けて書く', '80点版をあえて出す', '批判文をコーチ文に変える'] },
    zh: { title: '内在批评者型', subtitle: '你躲的不是失败，是失败后的自责', description: '问题不在懒，而在失败之后那套严苛的解读。', actions: ['把结果和自我价值分开写下来', '故意交出一个八十分的版本', '把批评句改写成教练句'] },
    fr: { title: 'Le critique intérieur', subtitle: 'Ce que vous fuyez, c’est l’auto-reproche plus que l’échec', description: 'Le problème n’est pas la paresse, mais la lecture dure qui suit l’échec.', actions: ['Écrire séparément le résultat et votre valeur', 'Rendre exprès une version à 80 %', 'Réécrire la phrase qui juge en phrase qui entraîne'] },
    es: { title: 'El crítico interior', subtitle: 'Lo que evitas es el reproche más que el fallo', description: 'El problema no es la pereza, sino la lectura dura que llega después del fallo.', actions: ['Escribir por separado el resultado y tu valor', 'Entregar a propósito una versión al 80 %', 'Reescribir la frase que juzga como frase que entrena'] },
  },
  recovering: {
    ko: { title: '회복 훈련형', subtitle: '불완전한 실행을 연습 중입니다', description: '당신은 이미 패턴을 알아차리고 있습니다. 이제 반복 가능한 루틴이 필요합니다.', actions: ['매일 같은 시간 10분 실행', '실패한 날도 체크인을 유지하기', '30일 습관 도우미로 이어가기'] },
    en: { title: 'Recovering Practitioner', subtitle: 'You are practicing imperfect action', description: 'You already notice the pattern. Now you need a repeatable routine.', actions: ['Act for 10 minutes at the same time daily', 'Keep check-ins even on missed days', 'Continue with the 30-day habit helper'] },
    ja: { title: '回復トレーニング型', subtitle: '不完全な実行を練習中です', description: 'すでにパターンに気づいています。次は繰り返せるルーティンです。', actions: ['毎日同じ時間に10分実行', '失敗した日も確認を続ける', '30日習慣ヘルパーにつなげる'] },
    zh: { title: '恢复练习型', subtitle: '你正在练习「不完美地做」', description: '你已经看见自己的模式了。接下来需要的是能重复的节奏。', actions: ['每天同一时间做十分钟', '失败的那天也照样签到', '用三十天的习惯表接住它'] },
    fr: { title: 'En cours de rééducation', subtitle: 'Vous vous entraînez à agir imparfaitement', description: 'Vous repérez déjà votre schéma. Il vous faut maintenant une routine répétable.', actions: ['Dix minutes chaque jour à la même heure', 'Pointer même les jours ratés', 'Prolonger avec un suivi d’habitude sur trente jours'] },
    es: { title: 'En entrenamiento', subtitle: 'Estás practicando hacerlo aun imperfecto', description: 'Ya reconoces tu patrón. Ahora hace falta una rutina que se pueda repetir.', actions: ['Diez minutos cada día a la misma hora', 'Registrarlo también los días que fallas', 'Sostenerlo con un seguimiento de treinta días'] },
  },
}

interface Props { locale?: string }

export default function LazyPerfectionistTest({ locale: rawLocale = 'ko' }: Props) {
  const locale = lang(rawLocale)
  const labels = LABELS[locale]
  const questions = QUESTIONS[locale]
  // Restore a shared result directly from the URL (?type=critic).
  const initResult = (): ResultKey | null => {
    const c = readResultCode('type')
    return c && (['starter', 'planner', 'critic', 'recovering'] as string[]).includes(c) ? (c as ResultKey) : null
  }
  const restored = initResult()
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<ResultKey, number>>({ starter: 0, planner: 0, critic: 0, recovering: 0 })
  const [result, setResult] = useState<ResultKey | null>(restored)
  useRecordFinishedTest({ testId: "lazy-perfectionist", title: "LazyPerfectionistTest", finished: Boolean(result) });

  // Keep the URL in sync with the result so it is shareable/revisitable.
  useEffect(() => {
    if (result) writeResultCode('type', result)
  }, [result])

  function pick(index: number) {
    const question = questions[current]
    const order: ResultKey[] = ['starter', 'planner', 'critic', 'recovering']
    const selected = order[index]
    const nextScores = { ...scores }
    for (const key of order) nextScores[key] += question.scores[key]
    nextScores[selected] += 3
    if (current + 1 >= questions.length) {
      const top = order.reduce((best, key) => nextScores[key] > nextScores[best] ? key : best, order[0])
      setResult(top)
    }
    setScores(nextScores)
    setCurrent(current + 1)
  }

  function restart() {
    setCurrent(0)
    setResult(null)
    setScores({ starter: 0, planner: 0, critic: 0, recovering: 0 })
    clearResultCode('type')
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
          <h1 className="text-3xl font-black text-foreground">{data.title}</h1>
          <p className="font-medium text-green-700">{data.subtitle}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-surface-subtle p-5">
          <h2 className="text-sm font-bold text-green-800 mb-3">{labels.actions}</h2>
          <ul className="space-y-2">
            {data.actions.map((action) => <li className="text-sm text-green-900" key={action}>- {action}</li>)}
          </ul>
        </div>
        <ShareResultButton
          locale={locale}
          heading={labels.title}
          resultTitle={data.title}
          emoji={result === 'starter' ? '🌱' : result === 'planner' ? '🗒️' : result === 'critic' ? '🔍' : '✨'}
          description={data.description}
        />
        <CopyResultLink locale={locale} />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/habit-builder/guide/`, label: (({ ko: '✅ 습관 만들기 가이드', en: '✅ Habit builder guide', ja: '✅ 習慣づくりガイド', zh: '✅ 养成习惯指南', fr: '✅ Guide pour créer des habitudes', es: '✅ Guía para crear hábitos' } as Record<string, string>)[locale] ?? '✅ Habit builder guide') },
            { href: `/${locale}/routine/builder/`, label: (({ ko: '🗓️ 루틴 빌더', en: '🗓️ Routine builder', ja: '🗓️ ルーティンビルダー', zh: '🗓️ 日常规划工具', fr: '🗓️ Créateur de routine', es: '🗓️ Creador de rutinas' } as Record<string, string>)[locale] ?? '🗓️ Routine builder') },
            { href: `/${locale}/inner-strength/test/`, label: (({ ko: '🧠 내면 강점 테스트', en: '🧠 Inner strength test', ja: '🧠 内面の強さテスト', zh: '🧠 内在力量测验', fr: '🧠 Test de force intérieure', es: '🧠 Test de fuerza interior' } as Record<string, string>)[locale] ?? '🧠 Inner strength test') },
          ]}
        />
        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border bg-card px-4 py-3 text-sm font-bold hover:bg-accent">{labels.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">{labels.share}</button>
        </div>
      </div>
    )
  }

  const question = questions[current]
  const progress = Math.round((current / questions.length) * 100)

  return (
    <Questionnaire
      title={labels.title}
      subtitle={labels.subtitle}
      question={question.text}
      questionLabel={labels.progress(current + 1, questions.length)}
      progress={progress}
      options={OPTIONS[locale].map((label, index) => ({ label, value: index + 1 }))}
      onSelect={(value) => pick(value - 1)}
    />
  )
}
