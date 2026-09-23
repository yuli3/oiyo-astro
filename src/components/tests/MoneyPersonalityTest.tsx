import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type MoneyType = 'saver' | 'spender' | 'investor' | 'minimalist'
type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question {
  id: string
  text: string
  type: MoneyType
}

interface ResultData {
  emoji: string
  title: string
  tagline: string
  description: string
  strengths: string[]
  tip: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string
  share: string
  shareMsg: string
  yourType: string
  strengths: string
  tip: string
  scoreLabel: string
  note: string
  copied: string
}> = {
  ko: {
    title: '머니 성격 테스트',
    subtitle: '나의 돈 관리 유형은?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 없다', '거의 없다', '가끔 있다', '자주 있다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 머니 성격 유형은',
    yourType: '나의 재정 유형',
    strengths: '강점',
    tip: '팁',
    scoreLabel: '유형별 점수',
    note: '이 테스트는 재정 습관에 대한 자기 이해를 돕기 위한 것입니다.',
    copied: '링크가 복사되었습니다!',
  },
  en: {
    title: 'Money Personality Test',
    subtitle: "What's your financial type?",
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My money personality type is',
    yourType: 'Your Financial Type',
    strengths: 'Strengths',
    tip: 'Tip',
    scoreLabel: 'Score by Type',
    note: 'This test is designed to help you better understand your financial habits.',
    copied: 'Link copied!',
  },
  ja: {
    title: 'マネー性格テスト',
    subtitle: '私のお金の管理タイプは？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', 'たまにある', 'よくある', 'いつもそうだ'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のマネー性格タイプは',
    yourType: '私の財政タイプ',
    strengths: '強み',
    tip: 'アドバイス',
    scoreLabel: 'タイプ別スコア',
    note: 'このテストはあなたの金融習慣の自己理解を助けるためのものです。',
    copied: 'リンクがコピーされました！',
  },
  zh: {
    title: '金钱性格测验',
    subtitle: '我是怎么管钱的？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全没有', '很少', '偶尔', '经常', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的金钱性格是',
    yourType: '我的理财类型',
    strengths: '长处',
    tip: '小建议',
    scoreLabel: '各类型得分',
    note: '这个测验帮你看清自己的用钱习惯，不是理财建议。',
    copied: '链接已复制！',
  },
  fr: {
    title: 'Test du rapport à l’argent',
    subtitle: 'Comment gérez-vous votre argent ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon rapport à l’argent est',
    yourType: 'Votre profil financier',
    strengths: 'Forces',
    tip: 'Conseil',
    scoreLabel: 'Score par profil',
    note: 'Ce test aide à voir ses habitudes d’argent ; ce n’est pas un conseil financier.',
    copied: 'Lien copié !',
  },
  es: {
    title: 'Test de tu relación con el dinero',
    subtitle: '¿Cómo manejas tu dinero?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi relación con el dinero es',
    yourType: 'Tu perfil financiero',
    strengths: 'Fortalezas',
    tip: 'Consejo',
    scoreLabel: 'Puntuación por perfil',
    note: 'Este test ayuda a ver tus hábitos con el dinero; no es asesoramiento financiero.',
    copied: '¡Enlace copiado!',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '다른 지출을 하기 전에 항상 일정 금액을 먼저 저축한다', type: 'saver' },
    { id: 'q2', text: '저축 계좌 잔고가 낮아지면 불안함을 느낀다', type: 'saver' },
    { id: 'q3', text: '마음에 드는 물건을 발견하면 즉흥적으로 구매한다', type: 'spender' },
    { id: 'q4', text: '미래보다 현재의 경험과 즐거움을 우선시한다', type: 'spender' },
    { id: 'q5', text: '주식, 부동산 등 자산에 대해 적극적으로 조사하고 투자한다', type: 'investor' },
    { id: 'q6', text: '돈을 장기적인 부를 쌓기 위한 도구로 본다', type: 'investor' },
    { id: 'q7', text: '잠재적 수익을 위해 계산된 금융 위험을 감수하는 것이 편안하다', type: 'investor' },
    { id: 'q8', text: '저렴한 물건을 많이 갖기보다 고품질 물건 소수를 선호한다', type: 'minimalist' },
    { id: 'q9', text: '정기적으로 물건을 정리하고 불필요한 소유물 축적을 피한다', type: 'minimalist' },
    { id: 'q10', text: '적게 소유하고 지출을 최소화하는 삶에서 자유를 느낀다', type: 'minimalist' },
  ],
  en: [
    { id: 'q1', text: 'I always save a set amount before making other purchases', type: 'saver' },
    { id: 'q2', text: 'I feel anxious when my savings account balance gets low', type: 'saver' },
    { id: 'q3', text: "I make impulse purchases when I find something I like", type: 'spender' },
    { id: 'q4', text: 'I prioritize present experiences and enjoyment over the future', type: 'spender' },
    { id: 'q5', text: 'I actively research and invest in assets like stocks or real estate', type: 'investor' },
    { id: 'q6', text: 'I see money as a tool for building long-term wealth', type: 'investor' },
    { id: 'q7', text: "I'm comfortable taking calculated financial risks for potential returns", type: 'investor' },
    { id: 'q8', text: 'I prefer a few high-quality items over many cheaper ones', type: 'minimalist' },
    { id: 'q9', text: 'I regularly declutter and avoid accumulating unnecessary possessions', type: 'minimalist' },
    { id: 'q10', text: 'I feel free owning less and minimizing my spending', type: 'minimalist' },
  ],
  ja: [
    { id: 'q1', text: '他の支出をする前に、常に一定の金額を先に貯蓄する', type: 'saver' },
    { id: 'q2', text: '貯蓄口座の残高が低くなると不安を感じる', type: 'saver' },
    { id: 'q3', text: '気に入ったものを見つけると衝動的に購入する', type: 'spender' },
    { id: 'q4', text: '将来よりも現在の経験や楽しみを優先する', type: 'spender' },
    { id: 'q5', text: '株式や不動産などの資産を積極的に調査して投資する', type: 'investor' },
    { id: 'q6', text: 'お金を長期的な富を築くためのツールとして見ている', type: 'investor' },
    { id: 'q7', text: '潜在的なリターンのために計算されたリスクを取ることが快適だ', type: 'investor' },
    { id: 'q8', text: '安いものをたくさん持つより、高品質なものを少数持ちたい', type: 'minimalist' },
    { id: 'q9', text: '定期的に物を整理し、不必要な所有物の蓄積を避ける', type: 'minimalist' },
    { id: 'q10', text: '少ない所有物と最小限の支出の生活に自由を感じる', type: 'minimalist' },
  ],
  zh: [
    { id: 'q1', text: '在花别的钱之前，我总会先存下一笔', type: 'saver' },
    { id: 'q2', text: '存款余额一变少，我就会不安', type: 'saver' },
    { id: 'q3', text: '看到喜欢的东西会当场买下', type: 'spender' },
    { id: 'q4', text: '比起将来，我更看重当下的体验和快乐', type: 'spender' },
    { id: 'q5', text: '我会主动研究股票、房产这类资产并投入', type: 'investor' },
    { id: 'q6', text: '我把钱看成累积长期财富的工具', type: 'investor' },
    { id: 'q7', text: '为了可能的收益，我愿意承担算得清的金融风险', type: 'investor' },
    { id: 'q8', text: '比起便宜东西买很多，我宁可少买几件好的', type: 'minimalist' },
    { id: 'q9', text: '我会定期整理，不让用不上的东西堆着', type: 'minimalist' },
    { id: 'q10', text: '东西少、开销小的生活让我觉得自由', type: 'minimalist' },
  ],
  fr: [
    { id: 'q1', text: 'Avant toute autre dépense, je mets d’abord une somme de côté', type: 'saver' },
    { id: 'q2', text: 'Quand mon épargne baisse, je me sens mal à l’aise', type: 'saver' },
    { id: 'q3', text: 'Quand un objet me plaît, je l’achète sur le coup', type: 'spender' },
    { id: 'q4', text: 'Je privilégie l’expérience et le plaisir présents plutôt que l’avenir', type: 'spender' },
    { id: 'q5', text: 'Je me renseigne activement et j’investis (actions, immobilier…)', type: 'investor' },
    { id: 'q6', text: 'Je vois l’argent comme un outil pour bâtir un patrimoine durable', type: 'investor' },
    { id: 'q7', text: 'Je suis à l’aise avec un risque financier calculé pour un gain possible', type: 'investor' },
    { id: 'q8', text: 'Je préfère quelques objets de qualité à beaucoup d’objets bon marché', type: 'minimalist' },
    { id: 'q9', text: 'Je trie régulièrement et j’évite d’accumuler l’inutile', type: 'minimalist' },
    { id: 'q10', text: 'Posséder peu et dépenser peu me donne un sentiment de liberté', type: 'minimalist' },
  ],
  es: [
    { id: 'q1', text: 'Antes de cualquier otro gasto, aparto primero una cantidad', type: 'saver' },
    { id: 'q2', text: 'Cuando baja el saldo del ahorro, me pongo inquieto', type: 'saver' },
    { id: 'q3', text: 'Si algo me gusta, lo compro en el momento', type: 'spender' },
    { id: 'q4', text: 'Priorizo la experiencia y el disfrute de ahora antes que el futuro', type: 'spender' },
    { id: 'q5', text: 'Investigo por mi cuenta e invierto (bolsa, vivienda…)', type: 'investor' },
    { id: 'q6', text: 'Veo el dinero como herramienta para construir patrimonio a largo plazo', type: 'investor' },
    { id: 'q7', text: 'Me manejo bien con un riesgo financiero calculado a cambio de una ganancia posible', type: 'investor' },
    { id: 'q8', text: 'Prefiero pocas cosas buenas a muchas baratas', type: 'minimalist' },
    { id: 'q9', text: 'Ordeno con regularidad y evito acumular lo que no uso', type: 'minimalist' },
    { id: 'q10', text: 'Tener poco y gastar poco me da sensación de libertad', type: 'minimalist' },
  ],
}

const RESULTS: Record<MoneyType, Record<SupportedLang, ResultData>> = {
  saver: {
    ko: {
      emoji: '🏦',
      title: '절약형',
      tagline: '안정 추구자',
      description: '미래를 위해 계획하고 저축을 통해 안정감을 찾습니다. 당신에게 재정적 안전망은 마음의 평화입니다.',
      strengths: ['재정적 안정', '비상금 확보', '목표 저축'],
      tip: '너무 엄격한 절약보다 즐거운 소비도 삶의 일부임을 기억하세요.',
    },
    en: {
      emoji: '🏦',
      title: 'Saver',
      tagline: 'The Stability Seeker',
      description: 'You plan ahead and find security through saving. A financial safety net is your peace of mind.',
      strengths: ['Financial stability', 'Emergency fund readiness', 'Goal-based saving'],
      tip: 'Remember that occasional enjoyable spending is also part of a well-lived life.',
    },
    ja: {
      emoji: '🏦',
      title: '節約型',
      tagline: '安定追求者',
      description: '将来のために計画を立て、貯蓄を通じて安心感を得ます。財政的なセーフティネットはあなたの心の平和です。',
      strengths: ['財政的な安定', '緊急資金の確保', '目標貯蓄'],
      tip: '厳しすぎる節約よりも、楽しい消費も人生の一部であることを忘れずに。',
    },
    zh: {
      emoji: '🏦',
      title: '储蓄型',
      tagline: '求稳的人',
      description: '你会为将来打算，靠存下来的钱换取安心。有一张财务安全网，心里才踏实。',
      strengths: ['财务稳', '备得住应急金', '有目标地存'],
      tip: '别把自己绷得太紧，偶尔花在开心上也是生活的一部分。',
    },
    fr: {
      emoji: '🏦',
      title: 'Épargnant',
      tagline: 'Celui qui cherche la stabilité',
      description: 'Vous pensez à l’avenir et trouvez la tranquillité dans l’épargne. Un filet de sécurité, c’est votre paix d’esprit.',
      strengths: ['Stabilité financière', 'Réserve d’urgence prête', 'Épargne orientée vers un but'],
      tip: 'Une dépense plaisir de temps en temps fait aussi partie d’une vie bien vécue.',
    },
    es: {
      emoji: '🏦',
      title: 'Ahorrador',
      tagline: 'Quien busca estabilidad',
      description: 'Piensas en el futuro y encuentras calma en el ahorro. Tener un colchón es tu tranquilidad.',
      strengths: ['Estabilidad financiera', 'Fondo de emergencia listo', 'Ahorro con objetivo'],
      tip: 'Gastar de vez en cuando en algo que te gusta también es parte de vivir bien.',
    },
  },
  spender: {
    ko: {
      emoji: '🛍️',
      title: '소비형',
      tagline: '현재 즐기는 자',
      description: '지금 이 순간을 즐기며 경험에 투자합니다. 당신은 삶의 질을 높이는 소비에서 기쁨을 찾습니다.',
      strengths: ['풍부한 경험', '현재 집중', '삶의 질 중시'],
      tip: '지출 전 24시간 대기 법칙으로 충동 구매를 줄여보세요.',
    },
    en: {
      emoji: '🛍️',
      title: 'Spender',
      tagline: 'The Present Enjoyer',
      description: 'You invest in experiences and enjoy the moment. You find joy in spending that improves your quality of life.',
      strengths: ['Rich experiences', 'Living in the present', 'Prioritizes quality of life'],
      tip: 'Try the 24-hour waiting rule before purchases to reduce impulse spending.',
    },
    ja: {
      emoji: '🛍️',
      title: '消費型',
      tagline: '現在を楽しむ者',
      description: '今この瞬間を楽しみ、経験に投資します。生活の質を高める消費に喜びを見出します。',
      strengths: ['豊かな経験', '現在への集中', '生活の質を重視'],
      tip: '衝動買いを減らすために、購入前に24時間待つルールを試してみてください。',
    },
    zh: {
      emoji: '🎉',
      title: '消费型',
      tagline: '享受当下的人',
      description: '你活在此刻，愿意把钱花在体验上。能提升生活品质的花费会让你高兴。',
      strengths: ['经历丰富', '专注当下', '看重生活品质'],
      tip: '想买的时候先等24小时，冲动买的次数会明显变少。',
    },
    fr: {
      emoji: '🎉',
      title: 'Dépensier',
      tagline: 'Celui qui profite du présent',
      description: 'Vous vivez l’instant et investissez dans l’expérience. La dépense qui améliore la vie vous réjouit.',
      strengths: ['Expériences riches', 'Ancré dans le présent', 'Attaché à la qualité de vie'],
      tip: 'Essayez la règle des 24 heures avant d’acheter : les achats impulsifs diminuent nettement.',
    },
    es: {
      emoji: '🎉',
      title: 'Gastador',
      tagline: 'Quien disfruta el presente',
      description: 'Vives el momento e inviertes en experiencias. Te alegra el gasto que mejora la vida.',
      strengths: ['Experiencias ricas', 'Presente bien vivido', 'Cuidas la calidad de vida'],
      tip: 'Prueba la regla de las 24 horas antes de comprar: las compras impulsivas bajan bastante.',
    },
  },
  investor: {
    ko: {
      emoji: '📈',
      title: '투자형',
      tagline: '자산 성장자',
      description: '돈을 도구로 보고 미래 가치를 위해 투자합니다. 당신은 장기적 시각으로 재정적 자유를 추구합니다.',
      strengths: ['장기 시각', '위험 관리', '자산 성장'],
      tip: '분산 투자와 비상금 유지는 잊지 마세요.',
    },
    en: {
      emoji: '📈',
      title: 'Investor',
      tagline: 'The Asset Builder',
      description: 'You see money as a tool and invest for future value. You pursue financial freedom with a long-term perspective.',
      strengths: ['Long-term vision', 'Risk management', 'Asset growth'],
      tip: "Don't forget diversification and keeping an emergency fund.",
    },
    ja: {
      emoji: '📈',
      title: '投資型',
      tagline: '資産成長者',
      description: 'お金をツールとして捉え、将来の価値のために投資します。長期的な視点で財政的自由を追求します。',
      strengths: ['長期的な視点', 'リスク管理', '資産成長'],
      tip: '分散投資と緊急資金の維持を忘れずに。',
    },
    zh: {
      emoji: '📈',
      title: '投资型',
      tagline: '让资产长大的人',
      description: '你把钱当工具，为将来的价值而投入。你用长线的眼光追求财务自由。',
      strengths: ['看得长远', '会管风险', '让资产增值'],
      tip: '别忘了分散投资，也别动到应急金。',
    },
    fr: {
      emoji: '📈',
      title: 'Investisseur',
      tagline: 'Celui qui fait croître son patrimoine',
      description: 'Vous voyez l’argent comme un outil et investissez pour la valeur future. Vous visez la liberté financière sur le long terme.',
      strengths: ['Vision de long terme', 'Gestion du risque', 'Croissance du patrimoine'],
      tip: 'N’oubliez pas la diversification, et gardez intacte votre réserve d’urgence.',
    },
    es: {
      emoji: '📈',
      title: 'Inversor',
      tagline: 'Quien hace crecer su patrimonio',
      description: 'Ves el dinero como herramienta e inviertes por el valor futuro. Buscas libertad financiera con mirada larga.',
      strengths: ['Visión a largo plazo', 'Gestión del riesgo', 'Patrimonio que crece'],
      tip: 'No olvides diversificar, y deja intacto el fondo de emergencia.',
    },
  },
  minimalist: {
    ko: {
      emoji: '🌿',
      title: '미니멀리스트',
      tagline: '자유로운 간소주의자',
      description: '소유를 줄이고 본질에 집중합니다. 당신은 덜 가짐으로써 더 많은 자유를 얻습니다.',
      strengths: ['재정적 자유', '정돈된 생활', '지속 가능한 소비'],
      tip: '경험 소비는 미니멀리즘과 충분히 양립할 수 있습니다.',
    },
    en: {
      emoji: '🌿',
      title: 'Minimalist',
      tagline: 'The Free Simplifier',
      description: 'You reduce possessions and focus on what matters. You gain more freedom by owning less.',
      strengths: ['Financial freedom', 'Uncluttered life', 'Sustainable consumption'],
      tip: 'Spending on experiences is fully compatible with minimalism.',
    },
    ja: {
      emoji: '🌿',
      title: 'ミニマリスト',
      tagline: '自由な簡素主義者',
      description: '所有を減らし、本質に集中します。少ない所有によってより多くの自由を得ます。',
      strengths: ['財政的自由', 'すっきりした生活', '持続可能な消費'],
      tip: '経験への消費はミニマリズムと十分に両立できます。',
    },
    zh: {
      emoji: '🍃',
      title: '极简型',
      tagline: '轻装上路的人',
      description: '你把拥有的东西减到必要，专心在真正重要的事上。少拿一点，反而更自由。',
      strengths: ['需要的很清楚', '少而精', '开销可控'],
      tip: '精简是好事，但别把该有的快乐也一起省掉。',
    },
    fr: {
      emoji: '🍃',
      title: 'Minimaliste',
      tagline: 'Celui qui voyage léger',
      description: 'Vous réduisez ce que vous possédez pour vous concentrer sur l’essentiel. Avoir moins vous rend plus libre.',
      strengths: ['Besoins clairs', 'Peu de choses, mais bien choisies', 'Dépenses maîtrisées'],
      tip: 'Simplifier est précieux ; veillez seulement à ne pas rogner aussi sur les plaisirs qui comptent.',
    },
    es: {
      emoji: '🍃',
      title: 'Minimalista',
      tagline: 'Quien viaja ligero',
      description: 'Reduces lo que tienes para centrarte en lo esencial. Tener menos te hace más libre.',
      strengths: ['Tienes claro lo que necesitas', 'Pocas cosas, bien elegidas', 'Gasto bajo control'],
      tip: 'Simplificar está bien; solo cuida de no recortar también los gustos que te importan.',
    },
  },
}

interface Props { locale?: string }

export default function MoneyPersonalityTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp)
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<MoneyType | null>(null)
  useRecordFinishedTest({ testId: "money-personality", title: "MoneyPersonalityTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false)

  const moneyTypes: MoneyType[] = ['saver', 'spender', 'investor', 'minimalist']

  function calcResult(ans: number[]): MoneyType {
    const totals: Record<MoneyType, number> = { saver: 0, spender: 0, investor: 0, minimalist: 0 }
    const counts: Record<MoneyType, number> = { saver: 0, spender: 0, investor: 0, minimalist: 0 }

    questions.forEach((q, i) => {
      totals[q.type] += ans[i] ?? 0
      counts[q.type]++
    })

    const averages = moneyTypes.map(t => ({
      type: t,
      avg: counts[t] > 0 ? totals[t] / counts[t] : 0,
    }))

    return averages.reduce((a, b) => (b.avg > a.avg ? b : a)).type
  }

  function pick(val: number) {
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const newAns = answers.slice(0, current)
    newAns[current] = val
    if (current + 1 >= questions.length) setResult(calcResult(newAns))
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setResult(null); setCopied(false) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][l].title} ${RESULTS[result][l].emoji}`
    if (navigator.share) {
      navigator.share({ title: lb.title, text, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
    }
  }

  const finished = current >= questions.length

  if (!finished) {
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
        onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result][l]

  const typeColors: Record<MoneyType, string> = {
    saver: '#2563eb',
    spender: '#db2777',
    investor: '#16a34a',
    minimalist: '#059669',
  }

  const totals: Record<MoneyType, number> = { saver: 0, spender: 0, investor: 0, minimalist: 0 }
  const counts: Record<MoneyType, number> = { saver: 0, spender: 0, investor: 0, minimalist: 0 }
  questions.forEach((q, i) => {
    totals[q.type] += answers[i] ?? 0
    counts[q.type]++
  })
  const averages: Record<MoneyType, number> = {
    saver: counts.saver > 0 ? totals.saver / counts.saver : 0,
    spender: counts.spender > 0 ? totals.spender / counts.spender : 0,
    investor: counts.investor > 0 ? totals.investor / counts.investor : 0,
    minimalist: counts.minimalist > 0 ? totals.minimalist / counts.minimalist : 0,
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourType}</p>
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: typeColors[result] }}
        >
          <span>{r.emoji}</span>
          <span>{r.title}</span>
        </div>
        <p className="font-bold text-muted-foreground">{r.tagline}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-600">{lb.strengths}</h3>
        <ul className="space-y-1">
          {r.strengths.map(s => (
            <li key={s} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-green-500">→</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
        <h3 className="font-bold text-sm text-amber-700">{lb.tip}</h3>
        <p className="text-sm text-amber-700">{r.tip}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="font-bold text-sm">{lb.scoreLabel}</h3>
        {moneyTypes.map(type => {
          const avg = averages[type]
          const pct = Math.round((avg / 5) * 100)
          const typeResult = RESULTS[type][l]
          return (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold" style={{ color: typeColors[type] }}>
                  {typeResult.emoji} {typeResult.title}
                </span>
                <span className="text-muted-foreground">{avg.toFixed(1)} / 5</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: typeColors[type] }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <ShareResultButton
        locale={lp}
        heading={lb.yourType}
        emoji={r.emoji}
        resultTitle={r.title}
        description={moneyTypes.map(type => `${RESULTS[type][l].emoji} ${averages[type].toFixed(1)}`).join(' · ')}
      />

      <div className="flex gap-3">
        <button
          onClick={restart}
          className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors"
          aria-label={lb.restart}
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
          aria-label={lb.share}
        >
          {copied ? lb.copied : lb.share}
        </button>
      </div>
    </div>
  )
}
