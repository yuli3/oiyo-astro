import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type BiasDim = 'confirmation' | 'dunningKruger' | 'availability' | 'lossAversion' | 'attribution'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Question {
  id: string
  text: string
  dim: BiasDim
}

interface BiasResult {
  title: string
  description: string
  example: string
  mitigation: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string
  share: string
  shareMsg: string
  yourBiases: string
  topBiases: string
  allScores: string
  exampleLabel: string
  mitigationLabel: string
  disclaimer: string
  dimNames: Record<BiasDim, string>
}> = {
  ko: {
    title: '인지 편향 유형 테스트',
    subtitle: '나는 어떤 편향에 취약한가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '아닌 편이다', '보통이다', '그런 편이다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 인지 편향 테스트 결과',
    yourBiases: '나의 편향 유형',
    topBiases: '가장 강한 편향 Top 2',
    allScores: '5가지 편향 점수',
    exampleLabel: '일상 속 예시',
    mitigationLabel: '편향 줄이는 법',
    disclaimer: '이 테스트는 자기 인식을 위한 도구입니다. 인지 편향은 모든 인간에게 존재하며 나쁜 것이 아닙니다.',
    dimNames: {
      confirmation: '확증 편향',
      dunningKruger: '더닝-크루거 효과',
      availability: '가용성 휴리스틱',
      lossAversion: '손실 회피',
      attribution: '귀인 편향',
    },
  },
  en: {
    title: 'Cognitive Bias Test',
    subtitle: 'Which Biases Affect You Most?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My cognitive bias test result',
    yourBiases: 'Your Cognitive Biases',
    topBiases: 'Top 2 Strongest Biases',
    allScores: '5 Bias Scores',
    exampleLabel: 'Everyday Example',
    mitigationLabel: 'How to Reduce It',
    disclaimer: 'This test is a self-awareness tool. Cognitive biases exist in all humans and are not inherently bad.',
    dimNames: {
      confirmation: 'Confirmation Bias',
      dunningKruger: 'Dunning-Kruger Effect',
      availability: 'Availability Heuristic',
      lossAversion: 'Loss Aversion',
      attribution: 'Attribution Bias',
    },
  },
  ja: {
    title: '認知バイアスタイプテスト',
    subtitle: '私はどんなバイアスに弱い？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全く違う', '違う', '普通', 'そうだ', '非常にそうだ'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '認知バイアステストの結果',
    yourBiases: '私の認知バイアス',
    topBiases: '最も強いバイアス Top 2',
    allScores: '5つのバイアススコア',
    exampleLabel: '日常の例',
    mitigationLabel: 'バイアスを減らす方法',
    disclaimer: 'このテストは自己認識のためのツールです。認知バイアスはすべての人間に存在し、本質的に悪いものではありません。',
    dimNames: {
      confirmation: '確証バイアス',
      dunningKruger: 'ダニング＝クルーガー効果',
      availability: '利用可能性ヒューリスティック',
      lossAversion: '損失回避',
      attribution: '帰属バイアス',
    },
  },
  zh: {
    title: '认知偏差类型测验',
    subtitle: '我容易陷入哪种偏差？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '不太是', '一般', '比较是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的认知偏差测验结果',
    yourBiases: '我的偏差类型',
    topBiases: '最强的两种偏差',
    allScores: '五种偏差得分',
    exampleLabel: '日常中的例子',
    mitigationLabel: '减少偏差的方法',
    disclaimer: '本测验是帮助自我觉察的工具。认知偏差人人都有，并不是坏事。',
    dimNames: {
      confirmation: '确认偏差',
      dunningKruger: '达克效应',
      availability: '可得性启发',
      lossAversion: '损失厌恶',
      attribution: '归因偏差',
    },
  },
  fr: {
    title: 'Test des biais cognitifs',
    subtitle: 'À quels biais suis-je le plus sensible ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Plutôt pas', 'Moyennement', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon résultat au test des biais cognitifs',
    yourBiases: 'Mon type de biais',
    topBiases: 'Mes deux biais les plus forts',
    allScores: 'Scores des cinq biais',
    exampleLabel: 'Exemple au quotidien',
    mitigationLabel: 'Comment réduire ce biais',
    disclaimer: 'Ce test est un outil de connaissance de soi. Tout le monde a des biais cognitifs, et ce n’est pas un défaut.',
    dimNames: {
      confirmation: 'Biais de confirmation',
      dunningKruger: 'Effet Dunning-Kruger',
      availability: 'Heuristique de disponibilité',
      lossAversion: 'Aversion à la perte',
      attribution: 'Biais d’attribution',
    },
  },
  es: {
    title: 'Test de sesgos cognitivos',
    subtitle: '¿A qué sesgos soy más vulnerable?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Poco', 'A medias', 'Bastante', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi resultado del test de sesgos cognitivos',
    yourBiases: 'Mi tipo de sesgo',
    topBiases: 'Mis dos sesgos más fuertes',
    allScores: 'Puntuación de los cinco sesgos',
    exampleLabel: 'Ejemplo cotidiano',
    mitigationLabel: 'Cómo reducir el sesgo',
    disclaimer: 'Este test es una herramienta de autoconocimiento. Todas las personas tienen sesgos cognitivos, y no es algo malo.',
    dimNames: {
      confirmation: 'Sesgo de confirmación',
      dunningKruger: 'Efecto Dunning-Kruger',
      availability: 'Heurística de disponibilidad',
      lossAversion: 'Aversión a la pérdida',
      attribution: 'Sesgo de atribución',
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '내 의견과 반대되는 뉴스나 글은 신뢰하기 어렵다', dim: 'confirmation' },
    { id: 'q2', text: '내 생각을 지지하는 자료를 먼저 찾게 된다', dim: 'confirmation' },
    { id: 'q3', text: '반대 의견을 들어도 내 생각이 맞다는 확신이 강해진다', dim: 'confirmation' },
    { id: 'q4', text: '새로운 분야를 배우기 시작하면 금방 잘 이해했다는 느낌이 든다', dim: 'dunningKruger' },
    { id: 'q5', text: '나는 평균적인 사람보다 여러 면에서 더 잘한다고 생각한다', dim: 'dunningKruger' },
    { id: 'q6', text: '나의 능력이나 지식에 대해 다른 사람들이 과소평가한다고 느낀다', dim: 'dunningKruger' },
    { id: 'q7', text: '최근 뉴스에서 자주 나오는 사건이 더 흔하게 일어난다고 생각한다', dim: 'availability' },
    { id: 'q8', text: '가까운 사람에게 일어난 일이 일반적인 위험이나 확률을 판단하는 데 큰 영향을 준다', dim: 'availability' },
    { id: 'q9', text: '생생하게 기억나는 사례가 통계보다 더 설득력 있다고 느낀다', dim: 'availability' },
    { id: 'q10', text: '10만 원을 잃는 것이 10만 원을 얻는 것보다 훨씬 더 크게 느껴진다', dim: 'lossAversion' },
    { id: 'q11', text: '손해를 피하기 위해 이득 기회를 포기하는 경우가 많다', dim: 'lossAversion' },
    { id: 'q12', text: '이미 투자한 것이 있으면 손해가 명확해도 쉽게 포기하지 못한다', dim: 'lossAversion' },
    { id: 'q13', text: '일이 잘 됐을 때는 내 노력 덕분이고, 잘못됐을 때는 상황 탓인 경우가 많다', dim: 'attribution' },
    { id: 'q14', text: '다른 사람이 실수하면 그 사람의 성격 문제라고 생각하는 편이다', dim: 'attribution' },
    { id: 'q15', text: '내가 실수하면 상황이나 환경 때문이라는 이유를 먼저 찾는다', dim: 'attribution' },
  ],
  en: [
    { id: 'q1', text: 'I find it hard to trust news or articles that contradict my views', dim: 'confirmation' },
    { id: 'q2', text: 'I tend to search for information that supports my existing beliefs', dim: 'confirmation' },
    { id: 'q3', text: 'Hearing opposing opinions often makes me more confident my view is right', dim: 'confirmation' },
    { id: 'q4', text: 'When I start learning a new subject, I quickly feel like I understand it well', dim: 'dunningKruger' },
    { id: 'q5', text: 'I think I perform better than the average person in many areas', dim: 'dunningKruger' },
    { id: 'q6', text: 'I feel others underestimate my abilities or knowledge', dim: 'dunningKruger' },
    { id: 'q7', text: 'Events frequently in the news feel like they happen more often than they actually do', dim: 'availability' },
    { id: 'q8', text: 'What happened to someone close to me strongly influences how I judge general risks or probabilities', dim: 'availability' },
    { id: 'q9', text: 'A vivid example feels more persuasive to me than statistics', dim: 'availability' },
    { id: 'q10', text: 'Losing $100 feels much worse than gaining $100 feels good', dim: 'lossAversion' },
    { id: 'q11', text: 'I often pass on opportunities for gain in order to avoid possible losses', dim: 'lossAversion' },
    { id: 'q12', text: "Once I've invested in something, I struggle to quit even when the loss is clear", dim: 'lossAversion' },
    { id: 'q13', text: "When things go well, it's often due to my effort; when things go wrong, it's the situation", dim: 'attribution' },
    { id: 'q14', text: "When others make mistakes, I tend to think it's a character flaw in them", dim: 'attribution' },
    { id: 'q15', text: 'When I make a mistake, I first look for situational or environmental reasons', dim: 'attribution' },
  ],
  ja: [
    { id: 'q1', text: '自分の意見と反対するニュースや記事は信頼しにくい', dim: 'confirmation' },
    { id: 'q2', text: '自分の信念を支持する情報をまず探す傾向がある', dim: 'confirmation' },
    { id: 'q3', text: '反対意見を聞くと、むしろ自分が正しいという確信が強まる', dim: 'confirmation' },
    { id: 'q4', text: '新しい分野を学び始めると、すぐによく理解できた気がする', dim: 'dunningKruger' },
    { id: 'q5', text: '多くの面で平均的な人より上手くやっていると思う', dim: 'dunningKruger' },
    { id: 'q6', text: '自分の能力や知識を他者に過小評価されていると感じる', dim: 'dunningKruger' },
    { id: 'q7', text: '最近ニュースで頻繁に出る出来事はより多く起きていると思う', dim: 'availability' },
    { id: 'q8', text: '身近な人に起きたことが一般的なリスクや確率の判断に大きく影響する', dim: 'availability' },
    { id: 'q9', text: '鮮明に覚えている事例が統計より説得力があると感じる', dim: 'availability' },
    { id: 'q10', text: '1万円を失う方が1万円を得ることよりずっと大きく感じる', dim: 'lossAversion' },
    { id: 'q11', text: '損失を避けるために利益の機会を諦めることが多い', dim: 'lossAversion' },
    { id: 'q12', text: '既に投資したものがあると、損失が明確でも簡単に諦められない', dim: 'lossAversion' },
    { id: 'q13', text: 'うまくいくと自分の努力のおかげ、うまくいかないと状況のせいにすることが多い', dim: 'attribution' },
    { id: 'q14', text: '他者が失敗するとその人の性格の問題だと思う傾向がある', dim: 'attribution' },
    { id: 'q15', text: '自分が失敗すると状況や環境のせいをまず探す', dim: 'attribution' },
  ],
  zh: [
    { id: 'q1', text: '与我观点相反的新闻或文章，我很难相信', dim: 'confirmation' },
    { id: 'q2', text: '我会先去找支持自己想法的资料', dim: 'confirmation' },
    { id: 'q3', text: '听到反对意见后，我反而更确信自己是对的', dim: 'confirmation' },
    { id: 'q4', text: '开始学一个新领域时，很快就觉得自己懂了', dim: 'dunningKruger' },
    { id: 'q5', text: '我认为自己在很多方面都比一般人强', dim: 'dunningKruger' },
    { id: 'q6', text: '我觉得别人低估了我的能力或知识', dim: 'dunningKruger' },
    { id: 'q7', text: '最近新闻里常出现的事件，我会觉得它更常发生', dim: 'availability' },
    { id: 'q8', text: '身边人遇到的事，大大影响我对一般风险或概率的判断', dim: 'availability' },
    { id: 'q9', text: '印象鲜明的案例，比统计数据更让我信服', dim: 'availability' },
    { id: 'q10', text: '丢掉一千元的感觉，比得到一千元强烈得多', dim: 'lossAversion' },
    { id: 'q11', text: '为了避免损失，我常常放弃获利的机会', dim: 'lossAversion' },
    { id: 'q12', text: '已经投入了成本，即使明显亏损也很难放手', dim: 'lossAversion' },
    { id: 'q13', text: '事情顺利时是我努力的结果，不顺时多半是环境的问题', dim: 'attribution' },
    { id: 'q14', text: '别人犯错时，我倾向认为是那个人的性格问题', dim: 'attribution' },
    { id: 'q15', text: '自己犯错时，我会先找情境或环境上的理由', dim: 'attribution' },
  ],
  fr: [
    { id: 'q1', text: 'J’ai du mal à croire les articles ou nouvelles qui contredisent mon avis', dim: 'confirmation' },
    { id: 'q2', text: 'Je cherche d’abord des sources qui confirment ce que je pense', dim: 'confirmation' },
    { id: 'q3', text: 'Entendre un avis contraire renforce ma conviction d’avoir raison', dim: 'confirmation' },
    { id: 'q4', text: 'Quand je commence un nouveau domaine, j’ai vite l’impression d’avoir compris', dim: 'dunningKruger' },
    { id: 'q5', text: 'Je pense être meilleur que la moyenne dans bien des domaines', dim: 'dunningKruger' },
    { id: 'q6', text: 'J’ai l’impression que les autres sous-estiment mes compétences ou mes connaissances', dim: 'dunningKruger' },
    { id: 'q7', text: 'Les événements souvent évoqués dans l’actualité me semblent plus fréquents', dim: 'availability' },
    { id: 'q8', text: 'Ce qui est arrivé à mes proches influence fortement mon jugement sur les risques en général', dim: 'availability' },
    { id: 'q9', text: 'Un cas marquant me convainc davantage que des statistiques', dim: 'availability' },
    { id: 'q10', text: 'Perdre 100 € me paraît bien plus fort que gagner 100 €', dim: 'lossAversion' },
    { id: 'q11', text: 'Je renonce souvent à un gain possible pour éviter une perte', dim: 'lossAversion' },
    { id: 'q12', text: 'Quand j’ai déjà investi, j’ai du mal à lâcher prise même si la perte est évidente', dim: 'lossAversion' },
    { id: 'q13', text: 'Quand ça marche, c’est grâce à mes efforts ; quand ça rate, c’est souvent la faute des circonstances', dim: 'attribution' },
    { id: 'q14', text: 'Quand quelqu’un se trompe, j’ai tendance à y voir un problème de caractère', dim: 'attribution' },
    { id: 'q15', text: 'Quand je me trompe, je cherche d’abord des raisons dans la situation ou l’environnement', dim: 'attribution' },
  ],
  es: [
    { id: 'q1', text: 'Me cuesta creer noticias o textos que contradicen mi opinión', dim: 'confirmation' },
    { id: 'q2', text: 'Busco primero datos que respalden lo que pienso', dim: 'confirmation' },
    { id: 'q3', text: 'Oír una opinión contraria refuerza mi convicción de tener razón', dim: 'confirmation' },
    { id: 'q4', text: 'Cuando empiezo a aprender algo nuevo, enseguida siento que lo he entendido', dim: 'dunningKruger' },
    { id: 'q5', text: 'Creo que soy mejor que la media en muchos aspectos', dim: 'dunningKruger' },
    { id: 'q6', text: 'Siento que los demás subestiman mis capacidades o conocimientos', dim: 'dunningKruger' },
    { id: 'q7', text: 'Los sucesos que salen a menudo en las noticias me parecen más frecuentes', dim: 'availability' },
    { id: 'q8', text: 'Lo que le pasa a gente cercana influye mucho en cómo juzgo riesgos y probabilidades', dim: 'availability' },
    { id: 'q9', text: 'Un caso que recuerdo vívidamente me convence más que las estadísticas', dim: 'availability' },
    { id: 'q10', text: 'Perder 100 € me pesa mucho más que ganar 100 €', dim: 'lossAversion' },
    { id: 'q11', text: 'A menudo renuncio a una ganancia posible para evitar una pérdida', dim: 'lossAversion' },
    { id: 'q12', text: 'Si ya he invertido, me cuesta abandonar aunque la pérdida sea evidente', dim: 'lossAversion' },
    { id: 'q13', text: 'Cuando algo sale bien es gracias a mi esfuerzo; cuando sale mal, suele ser por las circunstancias', dim: 'attribution' },
    { id: 'q14', text: 'Cuando otra persona se equivoca, tiendo a verlo como un problema de su carácter', dim: 'attribution' },
    { id: 'q15', text: 'Cuando me equivoco yo, busco primero razones en la situación o el entorno', dim: 'attribution' },
  ],
}

const BIAS_RESULTS: Record<BiasDim, Record<SupportedLang, BiasResult>> = {
  confirmation: {
    ko: {
      title: '확증 편향',
      description: '자신의 기존 믿음이나 가설을 확인하는 정보를 선호하고, 반증 정보를 무시하거나 덜 중요하게 여기는 경향입니다.',
      example: '주식 투자 후 그 기업의 긍정적 뉴스만 찾아보고, 부정적인 신호는 무시하는 것',
      mitigation: '의도적으로 반대 의견을 찾아보고, 자신의 믿음을 반박하는 시나리오를 생각해보세요',
    },
    en: {
      title: 'Confirmation Bias',
      description: 'The tendency to favor information that confirms existing beliefs and to ignore or minimize evidence that contradicts them.',
      example: 'After investing in a stock, only reading positive news about the company and ignoring warning signs',
      mitigation: 'Intentionally seek out opposing views and consider scenarios that disprove your beliefs',
    },
    ja: {
      title: '確証バイアス',
      description: '既存の信念や仮説を確認する情報を好み、反証情報を無視したり軽視する傾向です。',
      example: '株式投資後にその企業のポジティブなニュースだけを探し、ネガティブなシグナルを無視すること',
      mitigation: '意図的に反対意見を探し、自分の信念を反証するシナリオを考えてみましょう',
    },
    zh: {
      title: '确认偏差',
      description: '倾向偏好能证实自己既有信念或假设的信息，而忽视或轻视反面证据。',
      example: '买了股票后只看那家公司的利好新闻，忽略负面信号',
      mitigation: '刻意去找反对意见，想想能反驳自己信念的情境',
    },
    fr: {
      title: 'Biais de confirmation',
      description: 'Tendance à privilégier les informations qui confirment nos croyances ou hypothèses, et à ignorer ou minimiser celles qui les contredisent.',
      example: 'Après avoir acheté une action, ne lire que les bonnes nouvelles sur l’entreprise et ignorer les signaux négatifs',
      mitigation: 'Cherchez délibérément des avis contraires et imaginez des scénarios qui réfutent vos croyances',
    },
    es: {
      title: 'Sesgo de confirmación',
      description: 'Tendencia a preferir la información que confirma nuestras creencias o hipótesis y a ignorar o restar importancia a la que las contradice.',
      example: 'Tras comprar acciones, leer solo las buenas noticias de la empresa e ignorar las señales negativas',
      mitigation: 'Busca a propósito opiniones contrarias y piensa en escenarios que refuten tus creencias',
    },
  },
  dunningKruger: {
    ko: {
      title: '더닝-크루거 효과',
      description: '능력이 부족한 사람이 자신의 능력을 과대평가하는 현상입니다. 반대로, 능력이 높을수록 자신을 과소평가하는 경향도 있습니다.',
      example: '프로그래밍을 배운 지 2주 된 사람이 복잡한 시스템을 쉽게 만들 수 있다고 과신하는 것',
      mitigation: '전문가에게 피드백을 받고, 자신이 모르는 것이 무엇인지 꾸준히 점검하세요',
    },
    en: {
      title: 'Dunning-Kruger Effect',
      description: 'A cognitive bias where people with limited knowledge overestimate their own competence. Conversely, highly skilled people often underestimate themselves.',
      example: 'Someone who has programmed for 2 weeks overconfidently believing they can build complex systems easily',
      mitigation: 'Seek feedback from experts and consistently examine what you do not yet know',
    },
    ja: {
      title: 'ダニング＝クルーガー効果',
      description: '能力が不足している人が自分の能力を過大評価する現象です。逆に、能力が高いほど自分を過小評価する傾向もあります。',
      example: 'プログラミングを2週間習った人が複雑なシステムを簡単に作れると過信すること',
      mitigation: '専門家からフィードバックをもらい、自分が知らないことを継続的に確認しましょう',
    },
    zh: {
      title: '达克效应',
      description: '能力不足的人高估自己能力的现象。反过来，能力越高的人也可能越低估自己。',
      example: '学编程两周的人，自信能轻松做出复杂系统',
      mitigation: '向专家寻求反馈，持续检视自己不知道的是什么',
    },
    fr: {
      title: 'Effet Dunning-Kruger',
      description: 'Phénomène par lequel les personnes peu compétentes surestiment leurs capacités. À l’inverse, plus on est compétent, plus on a tendance à se sous-estimer.',
      example: 'Après deux semaines de programmation, se croire capable de construire facilement un système complexe',
      mitigation: 'Demandez l’avis d’experts et vérifiez régulièrement ce que vous ne savez pas',
    },
    es: {
      title: 'Efecto Dunning-Kruger',
      description: 'Fenómeno por el que las personas poco competentes sobreestiman su capacidad. A la inversa, cuanta más competencia, más tendencia a subestimarse.',
      example: 'Tras dos semanas aprendiendo a programar, creerse capaz de construir fácilmente un sistema complejo',
      mitigation: 'Pide opinión a expertos y revisa con constancia qué es lo que no sabes',
    },
  },
  availability: {
    ko: {
      title: '가용성 휴리스틱',
      description: '쉽게 떠오르는 정보나 사례에 의존해 확률이나 빈도를 판단하는 인지 지름길입니다.',
      example: '비행기 사고 뉴스를 본 직후 자동차보다 비행기가 훨씬 더 위험하다고 느끼는 것',
      mitigation: '직관적 판단을 내리기 전에 실제 통계나 기본 확률을 확인하는 습관을 만드세요',
    },
    en: {
      title: 'Availability Heuristic',
      description: 'A mental shortcut that relies on immediate examples that come to mind when evaluating a topic, frequency, or probability.',
      example: 'After seeing airplane crash news, feeling that flying is far more dangerous than driving — even though statistics show the opposite',
      mitigation: 'Before making intuitive judgments, develop a habit of checking actual statistics or base rates',
    },
    ja: {
      title: '利用可能性ヒューリスティック',
      description: '確率や頻度を判断する際に、すぐに思い浮かぶ情報や事例に頼る認知のショートカットです。',
      example: '飛行機事故のニュースを見た直後、自動車より飛行機がずっと危険だと感じること',
      mitigation: '直感的な判断をする前に、実際の統計や基本確率を確認する習慣をつけましょう',
    },
    zh: {
      title: '可得性启发',
      description: '依赖容易想到的信息或案例来判断概率或频率的思维捷径。',
      example: '刚看完空难新闻，就觉得坐飞机比开车危险得多',
      mitigation: '在凭直觉判断之前，养成先查实际统计或基础概率的习惯',
    },
    fr: {
      title: 'Heuristique de disponibilité',
      description: 'Raccourci mental qui consiste à juger une probabilité ou une fréquence d’après les informations ou exemples qui viennent facilement à l’esprit.',
      example: 'Juste après un reportage sur un accident d’avion, trouver l’avion bien plus dangereux que la voiture',
      mitigation: 'Avant de juger à l’intuition, prenez l’habitude de vérifier les statistiques réelles ou les probabilités de base',
    },
    es: {
      title: 'Heurística de disponibilidad',
      description: 'Atajo mental que consiste en juzgar la probabilidad o la frecuencia según la información o los ejemplos que vienen fácilmente a la mente.',
      example: 'Justo después de ver una noticia de un accidente aéreo, sentir que el avión es mucho más peligroso que el coche',
      mitigation: 'Antes de juzgar por intuición, acostúmbrate a consultar las estadísticas reales o las probabilidades de base',
    },
  },
  lossAversion: {
    ko: {
      title: '손실 회피',
      description: '같은 크기의 이익보다 손실을 더 크게 느끼는 경향입니다. 이는 합리적 의사결정을 방해할 수 있습니다.',
      example: '팔면 손실이 "확정"되는 게 싫어서, 논리적으로는 손절해야 할 하락 주식을 계속 들고 있는 것',
      mitigation: '의사결정 시 기대값(예상 이익 × 확률)을 계산하고, 손실 가능성보다 이익 가능성을 균형 있게 고려하세요',
    },
    en: {
      title: 'Loss Aversion',
      description: 'The tendency to feel losses more intensely than equivalent gains. This can interfere with rational decision-making.',
      example: 'Holding onto a losing stock because selling it would make the loss "real," even when logic says to cut your losses',
      mitigation: 'When deciding, calculate expected value (potential gain × probability) and balance loss and gain possibilities equally',
    },
    ja: {
      title: '損失回避',
      description: '同じ大きさの利益より損失をより大きく感じる傾向です。これは合理的な意思決定を妨げることがあります。',
      example: '損失を「確定」させることへの恐怖から、下落株を保有し続けること',
      mitigation: '意思決定時に期待値（予想利益×確率）を計算し、損失可能性と利益可能性をバランス良く考慮しましょう',
    },
    zh: {
      title: '损失厌恶',
      description: '同样大小的得失，损失给人的感受更强烈。这可能妨碍理性决策。',
      example: '因为不想让亏损“落定”，明知该止损却一直抱着下跌的股票',
      mitigation: '做决定时计算期望值（预期收益 × 概率），平衡地考虑获利与亏损的可能',
    },
    fr: {
      title: 'Aversion à la perte',
      description: 'Tendance à ressentir une perte plus fortement qu’un gain de même montant. Elle peut entraver une décision rationnelle.',
      example: 'Garder une action en baisse pour ne pas « acter » la perte, alors que la logique voudrait couper les pertes',
      mitigation: 'Lors d’une décision, calculez l’espérance (gain attendu × probabilité) et pesez gains et pertes possibles de façon équilibrée',
    },
    es: {
      title: 'Aversión a la pérdida',
      description: 'Tendencia a sentir una pérdida con más fuerza que una ganancia del mismo tamaño. Puede entorpecer una decisión racional.',
      example: 'Mantener una acción que cae para no «hacer real» la pérdida, aunque la lógica diga que conviene cortarla',
      mitigation: 'Al decidir, calcula el valor esperado (ganancia esperada × probabilidad) y sopesa por igual ganancias y pérdidas posibles',
    },
  },
  attribution: {
    ko: {
      title: '귀인 편향',
      description: '자신의 행동은 상황 탓으로, 타인의 행동은 성격 탓으로 돌리는 자기봉사적 귀인 패턴입니다.',
      example: '내가 지각하면 "교통이 막혔다", 동료가 지각하면 "게으른 사람이다"라고 판단하는 것',
      mitigation: '타인의 행동을 판단하기 전에 그들이 처한 상황을 먼저 고려해보세요',
    },
    en: {
      title: 'Attribution Bias',
      description: 'The self-serving pattern of attributing your own actions to external situations, while attributing others\' actions to their character.',
      example: "When you're late: \"traffic was bad.\" When a colleague is late: \"they're irresponsible.\"",
      mitigation: "Before judging others' behavior, first consider the situation they were in",
    },
    ja: {
      title: '帰属バイアス',
      description: '自分の行動は状況のせいに、他者の行動は性格のせいにする自己奉仕的な帰属パターンです。',
      example: '自分が遅刻すると「交通が渋滞していた」、同僚が遅刻すると「怠け者だ」と判断すること',
      mitigation: '他者の行動を判断する前に、その人が置かれた状況をまず考慮しましょう',
    },
    zh: {
      title: '归因偏差',
      description: '把自己的行为归于情境，把别人的行为归于性格的自利归因模式。',
      example: '自己迟到是“路上堵车”，同事迟到就是“这人懒”',
      mitigation: '在评判别人的行为之前，先考虑对方所处的情境',
    },
    fr: {
      title: 'Biais d’attribution',
      description: 'Schéma d’attribution qui rapporte nos propres actes aux circonstances, et ceux des autres à leur caractère.',
      example: 'Si je suis en retard, « il y avait des bouchons » ; si un collègue l’est, « il est paresseux »',
      mitigation: 'Avant de juger le comportement d’autrui, tenez d’abord compte de sa situation',
    },
    es: {
      title: 'Sesgo de atribución',
      description: 'Patrón de atribución que achaca nuestros actos a las circunstancias y los de los demás a su carácter.',
      example: 'Si llego tarde, «había atasco»; si llega tarde un compañero, «es un vago»',
      mitigation: 'Antes de juzgar lo que hace otra persona, ten en cuenta primero su situación',
    },
  },
}

interface Props { locale?: string }

export default function CognitiveBiasTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp)
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<BiasDim, number>>({
    confirmation: 0, dunningKruger: 0, availability: 0, lossAversion: 0, attribution: 0,
  })
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "cognitive-bias", title: "CognitiveBiasTest", finished: Boolean(done) });

  function pick(val: number) {
    const q = questions[current]
    const newScores = { ...scores, [q.dim]: scores[q.dim] + val }
    const nextIdx = current + 1
    if (nextIdx >= questions.length) {
      setScores(newScores)
      setDone(true)
    } else {
      setScores(newScores)
      setCurrent(nextIdx)
    }
  }

  function restart() {
    setScores({ confirmation: 0, dunningKruger: 0, availability: 0, lossAversion: 0, attribution: 0 })
    setCurrent(0)
    setDone(false)
  }

  function topTwoDims(): [BiasDim, BiasDim] {
    const dims: BiasDim[] = ['confirmation', 'dunningKruger', 'availability', 'lossAversion', 'attribution']
    const sorted = [...dims].sort((a, b) => scores[b] - scores[a])
    return [sorted[0], sorted[1]]
  }

  function share() {
    const url = window.location.href
    const [top1] = topTwoDims()
    const text = `${lb.shareMsg} — ${lb.dimNames[top1]}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const dimColors: Record<BiasDim, string> = {
    confirmation: '#435D31',
    dunningKruger: '#f59e0b',
    availability: '#22c55e',
    lossAversion: '#ef4444',
    attribution: '#3b82f6',
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
        note={lb.disclaimer}
        onSelect={pick}
      />
    )
  }

  const dims: BiasDim[] = ['confirmation', 'dunningKruger', 'availability', 'lossAversion', 'attribution']
  const maxScore = 15
  const [top1, top2] = topTwoDims()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.topBiases}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[top1, top2].map(dim => (
            <div
              key={dim}
              className="rounded-full px-4 py-2 text-base font-bold text-white"
              style={{ backgroundColor: dimColors[dim] }}
            >
              {lb.dimNames[dim]}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="font-semibold text-sm">{lb.allScores}</h3>
        {dims.map(d => {
          const pct = Math.round((scores[d] / maxScore) * 100)
          return (
            <div key={d} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{lb.dimNames[d]}</span>
                <span className="text-muted-foreground">{scores[d]} / 15</span>
              </div>
              <div
                className="h-3 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={lb.dimNames[d]}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: dimColors[d] }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {[top1, top2].map((dim, idx) => {
        const r = BIAS_RESULTS[dim][l]
        return (
          <div key={dim} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: dimColors[dim] }}
              >
                {idx + 1}
              </div>
              <h3 className="font-semibold">{r.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{r.description}</p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{lb.exampleLabel}</p>
              <p className="text-sm">{r.example}</p>
            </div>
            <div className="rounded-lg bg-surface-subtle border border-green-200 p-3 space-y-1">
              <p className="text-xs font-medium text-green-700">{lb.mitigationLabel}</p>
              <p className="text-sm text-green-700">{r.mitigation}</p>
            </div>
          </div>
        )
      })}
      <p className="text-center text-xs text-muted-foreground">{lb.disclaimer}</p>
      <ShareResultButton
        locale={lp}
        heading={lb.yourBiases}
        emoji="🧠"
        resultTitle={BIAS_RESULTS[top1][l].title}
        description={`${BIAS_RESULTS[top2][l].title}`}
      />
      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {lb.share}
        </button>
      </div>
    </div>
  )
}
