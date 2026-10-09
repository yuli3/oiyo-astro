import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import ShareResultButton from '../shared/ShareResultButton'
import ResultNextSteps from '../shared/ResultNextSteps'
import ResultSymbol, { resultSymbolSrc } from '../shared/ResultSymbol'

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = 'words' | 'acts' | 'gifts' | 'time' | 'touch'
type Scores = Record<Lang, number>
type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

interface Pair { a: { text: string; lang: Lang }; b: { text: string; lang: Lang } }
interface ResultData {
  title: string
  emoji: string
  description: string
  examples: string[]
  toPartner: string
  needFrom: string
  tip: string
}

const LANG_COLORS: Record<Lang, string> = {
  words: '#3b82f6',
  acts: '#22c55e',
  gifts: '#f59e0b',
  time: '#435D31',
  touch: '#ef4444',
}

const LABELS: Record<Locale, {
  title: string
  subtitle: string
  pairOf: (c: number, t: number) => string
  chooseOne: string
  restart: string
  share: string
  shareMsg: string
  yourPrimary: string
  description: string
  examples: string
  toPartner: string
  needFrom: string
  tip: string
  allScores: string
  chartTitle: string
  types: Record<Lang, string>
}> = {
  ko: {
    title: '사랑의 언어 테스트',
    subtitle: '나는 어떻게 사랑을 주고받나요?',
    pairOf: (c, t) => `${c} / ${t}`,
    chooseOne: '더 공감되는 쪽을 선택해주세요',
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 사랑의 언어는',
    yourPrimary: '이번 답변에서 가장 많이 선택한 표현',
    description: '설명',
    examples: '구체적인 예시',
    toPartner: '상대에게 먼저 물어볼 것',
    needFrom: '내가 요청해볼 것',
    tip: '시도해볼 대화',
    allScores: '전체 점수',
    chartTitle: '표현별 선택 횟수',
    types: {
      words: '확언의 말',
      acts: '봉사 행위',
      gifts: '선물',
      time: '함께하는 시간',
      touch: '스킨십',
    },
  },
  en: {
    title: 'Love Language Test',
    subtitle: 'How do you give and receive love?',
    pairOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'Choose the one that resonates more',
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My love language is',
    yourPrimary: 'Most selected expression in these answers',
    description: 'Description',
    examples: 'Examples',
    toPartner: 'What to ask the other person',
    needFrom: 'What you could request',
    tip: 'A conversation to try',
    allScores: 'All Scores',
    chartTitle: 'Selections by expression',
    types: {
      words: 'Words of Affirmation',
      acts: 'Acts of Service',
      gifts: 'Receiving Gifts',
      time: 'Quality Time',
      touch: 'Physical Touch',
    },
  },
  ja: {
    title: '愛の言語テスト',
    subtitle: 'あなたはどのように愛を与え受け取りますか？',
    pairOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'より共感できる方を選んでください',
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の愛の言語は',
    yourPrimary: '今回の回答で最も多く選んだ表現',
    description: '説明',
    examples: '具体的な例',
    toPartner: '相手にまず尋ねること',
    needFrom: '自分から頼んでみること',
    tip: '試してみる対話',
    allScores: '全スコア',
    chartTitle: '表現ごとの選択回数',
    types: {
      words: '肯定の言葉',
      acts: 'サービス行為',
      gifts: 'プレゼント',
      time: '充実した時間',
      touch: '身体的接触',
    },
  },
  zh: {
    title: '爱的语言测验',
    subtitle: '我是怎么给予和接收爱的？',
    pairOf: (c, t) => `${c} / ${t}`,
    chooseOne: '请选择更有共鸣的一边',
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的爱的语言是',
    yourPrimary: '本次回答中选择最多的表达',
    description: '说明',
    examples: '具体例子',
    toPartner: '先问对方什么',
    needFrom: '可以提出的请求',
    tip: '可以尝试的对话',
    allScores: '全部分数',
    chartTitle: '各类表达的选择次数',
    types: {
      words: '肯定的言语',
      acts: '服务的行动',
      gifts: '礼物',
      time: '精心的时刻',
      touch: '身体的接触',
    },
  },
  fr: {
    title: 'Test des langages de l’amour',
    subtitle: 'Comment est-ce que je donne et reçois l’amour ?',
    pairOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'Choisissez la proposition qui vous parle le plus',
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon langage de l’amour',
    yourPrimary: 'Expression la plus choisie dans ces réponses',
    description: 'Description',
    examples: 'Exemples concrets',
    toPartner: 'Que demander à l’autre',
    needFrom: 'Ce que vous pourriez demander',
    tip: 'Une conversation à essayer',
    allScores: 'Scores complets',
    chartTitle: 'Choix par expression',
    types: {
      words: 'Paroles valorisantes',
      acts: 'Services rendus',
      gifts: 'Cadeaux',
      time: 'Moments de qualité',
      touch: 'Toucher physique',
    },
  },
  es: {
    title: 'Test de los lenguajes del amor',
    subtitle: '¿Cómo doy y recibo amor?',
    pairOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'Elige la opción con la que más te identifiques',
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi lenguaje del amor',
    yourPrimary: 'Expresión más elegida en estas respuestas',
    description: 'Descripción',
    examples: 'Ejemplos concretos',
    toPartner: 'Qué preguntar a la otra persona',
    needFrom: 'Qué podrías pedir',
    tip: 'Una conversación que puedes probar',
    allScores: 'Puntuaciones completas',
    chartTitle: 'Elecciones por expresión',
    types: {
      words: 'Palabras de afirmación',
      acts: 'Actos de servicio',
      gifts: 'Regalos',
      time: 'Tiempo de calidad',
      touch: 'Contacto físico',
    },
  },
}

// 2026-10-09: shared links carry a category only; do not present their zero placeholders as observed scores.
const RESULT_CONTEXT: Record<Locale, { shared: string; note: string; sharedNote: string; guide: string }> = {
  ko: {"shared":"공유된 표현","note":"현재 답변을 정리한 참고 결과예요. 관계를 예측하거나 한 가지 유형으로 진단하지 않아요. 동점이면 한 항목만 표시될 수 있으니 전체 선택 횟수도 함께 살펴봐요. 상대의 동의와 직접 표현한 의사가 결과보다 우선해요.","sharedNote":"이 링크에는 표현 이름만 담겨 있어요. 원래 답변과 선택 횟수는 전달되지 않으므로 그래프를 표시하지 않아요. 관계를 예측하는 진단이 아니며, 상대의 동의와 직접 표현한 의사가 우선해요.","guide":"표현 예시와 연구의 한계 읽기"},
  en: {"shared":"Shared expression","note":"This is a reflection on your current answers, not a diagnosis or prediction of a relationship. A tie may display only one expression, so consider all selection counts. Consent and the other person's expressed wishes take priority.","sharedNote":"This link contains only an expression name, not the original answers or selection counts. No score chart is shown. It is not a diagnosis or prediction of a relationship. Consent and the other person's expressed wishes take priority.","guide":"Read expression examples and research limits"},
  ja: {"shared":"共有された表現","note":"現在の回答を振り返る参考結果であり、関係の予測やタイプの診断ではありません。同点でも一つだけ表示される場合があるため、全体の選択回数も見てください。相手の同意と直接伝えた意思が優先されます。","sharedNote":"このリンクに含まれるのは表現名だけです。元の回答や選択回数は共有されないため、グラフは表示しません。 関係を予測する診断ではありません。相手の同意と直接伝えた意思が優先されます。","guide":"表現例と研究の限界を読む"},
  zh: {"shared":"分享的表达","note":"这是对当前回答的回顾，不是关系预测或类型诊断。同分时可能只显示一项，请同时查看全部选择次数。对方的同意和直接表达的意愿优先于结果。","sharedNote":"此链接只包含表达名称，不传递原始回答或选择次数，因此不显示分数图表。 这不是关系预测或诊断，对方的同意和直接表达的意愿优先。","guide":"阅读表达示例与研究局限"},
  fr: {"shared":"Expression partagée","note":"Ce résultat aide à réfléchir à vos réponses actuelles ; ce n’est ni un diagnostic ni une prédiction de votre relation. Une égalité peut n’afficher qu’une expression : regardez tous les nombres de choix. Le consentement et les souhaits exprimés par l’autre priment.","sharedNote":"Ce lien contient seulement le nom d’une expression, sans les réponses ni les nombres de choix d’origine. Aucun graphique de scores n’est affiché. Ce n’est ni un diagnostic ni une prédiction de la relation. Le consentement et les souhaits exprimés par l’autre priment.","guide":"Lire les exemples et les limites des recherches"},
  es: {"shared":"Expresión compartida","note":"Este resultado ayuda a reflexionar sobre tus respuestas actuales; no diagnostica un tipo ni predice una relación. Un empate puede mostrar solo una expresión: revisa todas las elecciones. El consentimiento y los deseos expresados por la otra persona tienen prioridad.","sharedNote":"Este enlace solo contiene el nombre de una expresión, no las respuestas ni las elecciones originales. No se muestra un gráfico de puntuaciones. No diagnostica ni predice una relación. El consentimiento y los deseos expresados por la otra persona tienen prioridad.","guide":"Leer ejemplos y límites de la investigación"},
}

const SELECTION_COUNT: Record<Locale, (value: number) => string> = {
  ko: value => `${value}회 선택`, en: value => `${value} ${value === 1 ? "selection" : "selections"}`,
  ja: value => `${value}回選択`, zh: value => `选择${value}次`,
  fr: value => `${value} choix`, es: value => `${value} ${value === 1 ? "elección" : "elecciones"}`,
}

// 15 forced-choice pairs per locale
const PAIRS: Record<Locale, Pair[]> = {
  ko: [
    { a: { text: '연인이 "오늘 정말 멋있어 보여"라고 말해줄 때', lang: 'words' }, b: { text: '연인이 내가 힘들 때 옆에서 함께 있어줄 때', lang: 'time' } },
    { a: { text: '연인이 깜짝 선물을 준비해줄 때', lang: 'gifts' }, b: { text: '연인이 내가 하기 싫은 집안일을 먼저 해줄 때', lang: 'acts' } },
    { a: { text: '연인이 내 손을 꼭 잡아줄 때', lang: 'touch' }, b: { text: '연인이 나에 대해 친구들에게 칭찬할 때', lang: 'words' } },
    { a: { text: '연인과 핸드폰 없이 온전히 대화하는 저녁', lang: 'time' }, b: { text: '연인이 여행 중 내가 언급했던 것을 기억하고 선물로 줄 때', lang: 'gifts' } },
    { a: { text: '연인이 힘들 때 어깨를 다독여줄 때', lang: 'touch' }, b: { text: '연인이 내가 바쁠 때 식사를 준비해줄 때', lang: 'acts' } },
    { a: { text: '연인이 "네가 있어서 행복해"라고 말해줄 때', lang: 'words' }, b: { text: '연인과 함께 좋아하는 영화를 보며 포옹할 때', lang: 'touch' } },
    { a: { text: '연인이 내 취향에 맞는 선물을 고심해서 줄 때', lang: 'gifts' }, b: { text: '연인과 카페에서 둘만의 여유로운 시간을 보낼 때', lang: 'time' } },
    { a: { text: '연인이 내 프레젠테이션 준비를 도와줄 때', lang: 'acts' }, b: { text: '연인이 힘들었던 하루를 안아줄 때', lang: 'touch' } },
    { a: { text: '연인이 기념일을 잊지 않고 선물을 줄 때', lang: 'gifts' }, b: { text: '연인이 "당신은 정말 잘하고 있어"라고 격려해줄 때', lang: 'words' } },
    { a: { text: '연인이 특별한 날 요리를 직접 해줄 때', lang: 'acts' }, b: { text: '연인과 산책하며 많은 이야기를 나눌 때', lang: 'time' } },
    { a: { text: '연인이 편지나 메시지로 마음을 표현할 때', lang: 'words' }, b: { text: '연인이 아플 때 약을 사다주고 옆에 있어줄 때', lang: 'acts' } },
    { a: { text: '연인과 함께 여행을 계획하며 설레는 시간', lang: 'time' }, b: { text: '연인이 갑자기 꽃다발을 가져올 때', lang: 'gifts' } },
    { a: { text: '연인과 대화하다 자연스럽게 손을 잡을 때', lang: 'touch' }, b: { text: '연인이 나를 위해 맛있는 곳을 예약해줄 때', lang: 'acts' } },
    { a: { text: '연인이 "정말 자랑스러워"라고 말해줄 때', lang: 'words' }, b: { text: '연인이 출장에서 나를 생각하며 선물을 사다줄 때', lang: 'gifts' } },
    { a: { text: '연인과 함께 요리하며 시간을 보낼 때', lang: 'time' }, b: { text: '연인이 지친 어깨를 마사지해줄 때', lang: 'touch' } },
  ],
  en: [
    { a: { text: 'My partner says "You look amazing today"', lang: 'words' }, b: { text: 'My partner stays by my side when I\'m struggling', lang: 'time' } },
    { a: { text: 'My partner surprises me with a gift', lang: 'gifts' }, b: { text: 'My partner does chores I dislike without being asked', lang: 'acts' } },
    { a: { text: 'My partner holds my hand tightly', lang: 'touch' }, b: { text: 'My partner brags about me to friends', lang: 'words' } },
    { a: { text: 'An evening talking with my partner without phones', lang: 'time' }, b: { text: 'My partner remembers something I mentioned and gets it as a gift', lang: 'gifts' } },
    { a: { text: 'My partner pats my shoulder when I\'m down', lang: 'touch' }, b: { text: 'My partner prepares food when I\'m busy', lang: 'acts' } },
    { a: { text: 'My partner says "I\'m so happy to have you"', lang: 'words' }, b: { text: 'Watching a favorite movie together cuddled up', lang: 'touch' } },
    { a: { text: 'My partner puts thought into a gift that suits my taste', lang: 'gifts' }, b: { text: 'A relaxed afternoon at a café just the two of us', lang: 'time' } },
    { a: { text: 'My partner helps me prepare an important presentation', lang: 'acts' }, b: { text: 'My partner hugs me after a tough day', lang: 'touch' } },
    { a: { text: 'My partner remembers our anniversary and gives me a gift', lang: 'gifts' }, b: { text: 'My partner says "You\'re doing so well"', lang: 'words' } },
    { a: { text: 'My partner cooks for me on a special occasion', lang: 'acts' }, b: { text: 'Going on a walk and having a long conversation', lang: 'time' } },
    { a: { text: 'My partner expresses their heart through a letter or message', lang: 'words' }, b: { text: 'My partner gets medicine and stays with me when I\'m sick', lang: 'acts' } },
    { a: { text: 'Excitedly planning a trip together', lang: 'time' }, b: { text: 'My partner suddenly brings me flowers', lang: 'gifts' } },
    { a: { text: 'Naturally holding hands during a conversation', lang: 'touch' }, b: { text: 'My partner makes a reservation at a nice restaurant for me', lang: 'acts' } },
    { a: { text: 'My partner says "I\'m so proud of you"', lang: 'words' }, b: { text: 'My partner buys me a souvenir while traveling', lang: 'gifts' } },
    { a: { text: 'Cooking together and spending time in the kitchen', lang: 'time' }, b: { text: 'My partner massages my tired shoulders', lang: 'touch' } },
  ],
  ja: [
    { a: { text: 'パートナーが「今日本当に素敵だね」と言ってくれる', lang: 'words' }, b: { text: 'パートナーが辛い時にそばにいてくれる', lang: 'time' } },
    { a: { text: 'パートナーがサプライズでプレゼントをくれる', lang: 'gifts' }, b: { text: 'パートナーが嫌いな家事を先にやってくれる', lang: 'acts' } },
    { a: { text: 'パートナーがそっと手を握ってくれる', lang: 'touch' }, b: { text: 'パートナーが友人に私のことを褒めてくれる', lang: 'words' } },
    { a: { text: 'スマホなしで2人だけで話す夜', lang: 'time' }, b: { text: '旅行中に話したことを覚えてプレゼントをくれる', lang: 'gifts' } },
    { a: { text: '辛い時に肩をそっとたたいてくれる', lang: 'touch' }, b: { text: '忙しい時に食事を準備してくれる', lang: 'acts' } },
    { a: { text: '「一緒にいられて幸せ」と言ってくれる', lang: 'words' }, b: { text: '好きな映画を一緒に見てハグする', lang: 'touch' } },
    { a: { text: '私の好みに合わせたプレゼントを考えてくれる', lang: 'gifts' }, b: { text: 'カフェでゆっくり2人だけの時間を過ごす', lang: 'time' } },
    { a: { text: '大事なプレゼンの準備を手伝ってくれる', lang: 'acts' }, b: { text: '疲れた一日を抱きしめてくれる', lang: 'touch' } },
    { a: { text: '記念日を忘れずにプレゼントをくれる', lang: 'gifts' }, b: { text: '「あなたは本当によくやっている」と励ましてくれる', lang: 'words' } },
    { a: { text: '特別な日に料理を作ってくれる', lang: 'acts' }, b: { text: '散歩しながらたくさん話す', lang: 'time' } },
    { a: { text: '手紙やメッセージで気持ちを伝えてくれる', lang: 'words' }, b: { text: '体調不良の時に薬を買ってそばにいてくれる', lang: 'acts' } },
    { a: { text: '一緒に旅行を計画してワクワクする時間', lang: 'time' }, b: { text: '突然花束を持ってきてくれる', lang: 'gifts' } },
    { a: { text: '話しながら自然に手を繋ぐ', lang: 'touch' }, b: { text: '素敵なお店を予約してくれる', lang: 'acts' } },
    { a: { text: '「本当に誇りに思う」と言ってくれる', lang: 'words' }, b: { text: '出張中に私のことを思いプレゼントを買ってくれる', lang: 'gifts' } },
    { a: { text: '一緒に料理して時間を過ごす', lang: 'time' }, b: { text: '疲れた肩をマッサージしてくれる', lang: 'touch' } },
  ],
  zh: [
    { a: { text: '恋人对我说“你今天真好看”的时候', lang: 'words' }, b: { text: '在我难熬时，恋人陪在我身边的时候', lang: 'time' } },
    { a: { text: '恋人准备了惊喜礼物的时候', lang: 'gifts' }, b: { text: '恋人先帮我做了我不想做的家务的时候', lang: 'acts' } },
    { a: { text: '恋人紧紧握住我的手的时候', lang: 'touch' }, b: { text: '恋人在朋友面前称赞我的时候', lang: 'words' } },
    { a: { text: '和恋人不看手机、专心聊天的夜晚', lang: 'time' }, b: { text: '恋人记得我旅行时提过的东西，买来送我的时候', lang: 'gifts' } },
    { a: { text: '难过时恋人轻拍我肩膀的时候', lang: 'touch' }, b: { text: '我忙的时候恋人帮我准备饭菜', lang: 'acts' } },
    { a: { text: '恋人对我说“有你我很幸福”的时候', lang: 'words' }, b: { text: '和恋人一起看喜欢的电影、相拥的时候', lang: 'touch' } },
    { a: { text: '恋人用心挑选合我口味的礼物的时候', lang: 'gifts' }, b: { text: '和恋人在咖啡馆享受只属于两人的悠闲时光', lang: 'time' } },
    { a: { text: '恋人帮我准备报告的时候', lang: 'acts' }, b: { text: '恋人拥抱我、安慰我辛苦的一天', lang: 'touch' } },
    { a: { text: '恋人没忘记纪念日，送我礼物的时候', lang: 'gifts' }, b: { text: '恋人鼓励我说“你做得真的很好”的时候', lang: 'words' } },
    { a: { text: '特别的日子恋人亲手下厨的时候', lang: 'acts' }, b: { text: '和恋人散步、聊很多话的时候', lang: 'time' } },
    { a: { text: '恋人用信或消息表达心意的时候', lang: 'words' }, b: { text: '我生病时恋人买药来、陪在我身边', lang: 'acts' } },
    { a: { text: '和恋人一起计划旅行、满心期待的时光', lang: 'time' }, b: { text: '恋人突然捧着一束花出现的时候', lang: 'gifts' } },
    { a: { text: '和恋人聊着聊着自然地牵起手', lang: 'touch' }, b: { text: '恋人为我订了好吃的餐厅', lang: 'acts' } },
    { a: { text: '恋人对我说“真为你骄傲”的时候', lang: 'words' }, b: { text: '恋人出差时想着我，买礼物回来', lang: 'gifts' } },
    { a: { text: '和恋人一起做饭度过的时光', lang: 'time' }, b: { text: '恋人帮我按摩疲惫的肩膀', lang: 'touch' } },
  ],
  fr: [
    { a: { text: 'Quand mon partenaire me dit « Tu es superbe aujourd’hui »', lang: 'words' }, b: { text: 'Quand mon partenaire reste à mes côtés dans un moment difficile', lang: 'time' } },
    { a: { text: 'Quand mon partenaire me prépare un cadeau surprise', lang: 'gifts' }, b: { text: 'Quand mon partenaire fait avant moi une corvée que je n’aime pas', lang: 'acts' } },
    { a: { text: 'Quand mon partenaire me serre fort la main', lang: 'touch' }, b: { text: 'Quand mon partenaire fait mon éloge devant ses amis', lang: 'words' } },
    { a: { text: 'Une soirée à discuter vraiment, sans téléphone', lang: 'time' }, b: { text: 'Quand mon partenaire se souvient d’une chose dont j’ai parlé en voyage et me l’offre', lang: 'gifts' } },
    { a: { text: 'Quand mon partenaire me tapote l’épaule dans un moment dur', lang: 'touch' }, b: { text: 'Quand mon partenaire me prépare à manger quand je suis débordé', lang: 'acts' } },
    { a: { text: 'Quand mon partenaire me dit « Je suis heureux grâce à toi »', lang: 'words' }, b: { text: 'Quand on regarde un film qu’on aime, blottis l’un contre l’autre', lang: 'touch' } },
    { a: { text: 'Quand mon partenaire choisit avec soin un cadeau à mon goût', lang: 'gifts' }, b: { text: 'Un moment tranquille à deux dans un café', lang: 'time' } },
    { a: { text: 'Quand mon partenaire m’aide à préparer une présentation', lang: 'acts' }, b: { text: 'Quand mon partenaire me prend dans ses bras après une journée difficile', lang: 'touch' } },
    { a: { text: 'Quand mon partenaire n’oublie pas notre anniversaire et m’offre un cadeau', lang: 'gifts' }, b: { text: 'Quand mon partenaire m’encourage : « Tu t’en sors vraiment bien »', lang: 'words' } },
    { a: { text: 'Quand mon partenaire cuisine lui-même pour une occasion spéciale', lang: 'acts' }, b: { text: 'Quand on se promène en parlant de tout', lang: 'time' } },
    { a: { text: 'Quand mon partenaire exprime ses sentiments par une lettre ou un message', lang: 'words' }, b: { text: 'Quand je suis malade et que mon partenaire m’achète des médicaments et reste près de moi', lang: 'acts' } },
    { a: { text: 'Le plaisir de préparer un voyage ensemble', lang: 'time' }, b: { text: 'Quand mon partenaire arrive à l’improviste avec un bouquet', lang: 'gifts' } },
    { a: { text: 'Quand nos mains se prennent naturellement en discutant', lang: 'touch' }, b: { text: 'Quand mon partenaire réserve pour moi un bon restaurant', lang: 'acts' } },
    { a: { text: 'Quand mon partenaire me dit « Je suis si fier de toi »', lang: 'words' }, b: { text: 'Quand mon partenaire pense à moi en déplacement et me rapporte un cadeau', lang: 'gifts' } },
    { a: { text: 'Le temps passé à cuisiner ensemble', lang: 'time' }, b: { text: 'Quand mon partenaire masse mes épaules fatiguées', lang: 'touch' } },
  ],
  es: [
    { a: { text: 'Cuando mi pareja me dice «Hoy estás guapísimo»', lang: 'words' }, b: { text: 'Cuando mi pareja se queda a mi lado en un mal momento', lang: 'time' } },
    { a: { text: 'Cuando mi pareja me prepara un regalo sorpresa', lang: 'gifts' }, b: { text: 'Cuando mi pareja hace antes que yo una tarea de casa que no me apetece', lang: 'acts' } },
    { a: { text: 'Cuando mi pareja me aprieta fuerte la mano', lang: 'touch' }, b: { text: 'Cuando mi pareja me elogia delante de sus amigos', lang: 'words' } },
    { a: { text: 'Una noche charlando de verdad, sin móviles', lang: 'time' }, b: { text: 'Cuando mi pareja recuerda algo que mencioné en un viaje y me lo regala', lang: 'gifts' } },
    { a: { text: 'Cuando mi pareja me da unas palmaditas en el hombro en un mal momento', lang: 'touch' }, b: { text: 'Cuando mi pareja me prepara la comida mientras estoy ocupado', lang: 'acts' } },
    { a: { text: 'Cuando mi pareja me dice «Soy feliz porque estás tú»', lang: 'words' }, b: { text: 'Cuando vemos abrazados una película que nos gusta', lang: 'touch' } },
    { a: { text: 'Cuando mi pareja elige con cuidado un regalo a mi gusto', lang: 'gifts' }, b: { text: 'Un rato tranquilo a solas en una cafetería', lang: 'time' } },
    { a: { text: 'Cuando mi pareja me ayuda a preparar una presentación', lang: 'acts' }, b: { text: 'Cuando mi pareja me abraza tras un día difícil', lang: 'touch' } },
    { a: { text: 'Cuando mi pareja no olvida nuestro aniversario y me regala algo', lang: 'gifts' }, b: { text: 'Cuando mi pareja me anima: «Lo estás haciendo muy bien»', lang: 'words' } },
    { a: { text: 'Cuando mi pareja cocina para mí en un día especial', lang: 'acts' }, b: { text: 'Cuando paseamos y hablamos de mil cosas', lang: 'time' } },
    { a: { text: 'Cuando mi pareja expresa lo que siente en una carta o un mensaje', lang: 'words' }, b: { text: 'Cuando estoy enfermo y mi pareja me compra medicinas y se queda conmigo', lang: 'acts' } },
    { a: { text: 'La ilusión de planear juntos un viaje', lang: 'time' }, b: { text: 'Cuando mi pareja aparece de repente con un ramo de flores', lang: 'gifts' } },
    { a: { text: 'Cuando nos damos la mano de forma natural mientras hablamos', lang: 'touch' }, b: { text: 'Cuando mi pareja reserva para mí un buen restaurante', lang: 'acts' } },
    { a: { text: 'Cuando mi pareja me dice «Estoy muy orgulloso de ti»', lang: 'words' }, b: { text: 'Cuando mi pareja piensa en mí de viaje de trabajo y me trae un regalo', lang: 'gifts' } },
    { a: { text: 'El tiempo que pasamos cocinando juntos', lang: 'time' }, b: { text: 'Cuando mi pareja me masajea los hombros cansados', lang: 'touch' } },
  ],
}

const RESULTS: Record<Lang, Record<Locale, ResultData>> = {
  words: {
    ko: {
      title: '확언의 말',
      emoji: '💬',
      description: "이번 답변에서는 인정과 감사의 말에 더 마음이 갔을 수 있어요. 고정된 성격 유형은 아니며, 다른 표현도 함께 원할 수 있어요.",
      examples: ["대화 예: 고마웠던 행동을 구체적으로 말하기","대화 예: 격려를 듣고 싶은지 먼저 묻기","대화 예: 원하는 방식으로 감사 전하기","대화 예: 메시지나 편지를 원할 때 보내기"],
      toPartner: "고마웠던 행동을 구체적으로 말해볼 수 있어요. 공개 칭찬과 둘만의 칭찬 중 무엇이 편한지 먼저 물어봐요.",
      needFrom: "어떤 말이 도움이 되는지 상황과 함께 설명해보세요. 침묵이나 다른 표현만으로 애정이 부족하다고 판단하지 않아요.",
      tip: "‘그때 도와줘서 고마웠어요’처럼 말해보고 반응을 들어보세요. 표현 방식과 빈도는 서로 편한 수준으로 합의해요.",
    },
    en: {
      title: 'Words of Affirmation',
      emoji: '💬',
      description: "In these answers, words of appreciation and affirmation may have appealed to you more. This is not a fixed personality type; you may want other expressions too.",
      examples: ["Conversation example: name a specific action you appreciated","Conversation example: ask whether encouragement is wanted","Conversation example: express thanks in a welcome way","Conversation example: send a message or letter when wanted"],
      toPartner: "You could name an action you appreciated. First ask whether public or private praise feels more comfortable.",
      needFrom: "Explain which words help and in what situations. Silence or another form of expression alone does not establish a lack of affection.",
      tip: "Try saying, “Thank you for helping me then,” and listen to the response. Agree on forms and frequency that feel comfortable to both of you.",
    },
    ja: {
      title: '肯定の言葉',
      emoji: '💬',
      description: "今回の回答では、感謝や肯定の言葉により心が向いたかもしれません。固定された性格タイプではなく、ほかの表現も一緒に望むことがあります。",
      examples: ["会話の例：ありがたかった行動を具体的に伝える","会話の例：励ましを聞きたいか先に尋ねる","会話の例：相手が望む方法で感謝を伝える","会話の例：望まれたときにメッセージや手紙を送る"],
      toPartner: "ありがたかった行動を具体的に伝えてみましょう。人前と二人だけの場でのほめ言葉では、どちらが心地よいか先に尋ねます。",
      needFrom: "どんな言葉が役立つか、状況とともに説明してみましょう。沈黙や別の表現だけで、愛情が足りないとは判断しません。",
      tip: "「あのとき手伝ってくれてありがとう」と伝え、反応を聞いてみましょう。方法や頻度は、互いに無理のない範囲で話し合います。",
    },
    zh: {
      title: '肯定的言语',
      emoji: '💬',
      description: "在这次回答中，肯定与感谢的话语可能更吸引你。这不是固定的性格类型，你也可能同时需要其他表达。",
      examples: ["对话示例：具体说出让你感激的行为","对话示例：先问是否想听到鼓励","对话示例：用对方愿意接受的方式表达感谢","对话示例：在对方愿意时发送消息或信件"],
      toPartner: "可以具体说出让你感激的行为。先问公开赞美还是私下赞美会让对方更自在。",
      needFrom: "结合情境说明哪些话对你有帮助。不要仅凭沉默或其他表达方式，就判断对方缺少爱意。",
      tip: "试着说“谢谢你那时帮了我”，再听听反馈。双方共同商定舒服的表达方式与频率。",
    },
    fr: {
      title: 'Paroles valorisantes',
      emoji: '💬',
      description: "Dans ces réponses, les paroles de reconnaissance ont peut-être davantage retenu votre attention. Ce n’est pas un type de personnalité fixe ; vous pouvez aussi souhaiter d’autres expressions.",
      examples: ["Exemple de dialogue : citer un geste apprécié","Exemple de dialogue : demander si des encouragements sont souhaités","Exemple de dialogue : remercier d’une manière bien accueillie","Exemple de dialogue : envoyer un message ou une lettre si cela est souhaité"],
      toPartner: "Vous pouvez citer un geste que vous avez apprécié. Demandez d’abord si les compliments en public ou en privé sont plus agréables.",
      needFrom: "Précisez quelles paroles vous aident et dans quelles situations. Le silence ou une autre expression ne prouvent pas, à eux seuls, un manque d’affection.",
      tip: "Essayez de dire « Merci de m’avoir aidé à ce moment-là » et écoutez la réponse. Convenez d’une manière et d’une fréquence qui vous conviennent à tous les deux.",
    },
    es: {
      title: 'Palabras de afirmación',
      emoji: '💬',
      description: "En estas respuestas, las palabras de reconocimiento y agradecimiento quizá te hayan atraído más. No es un tipo de personalidad fijo; también puedes desear otras expresiones.",
      examples: ["Ejemplo de diálogo: mencionar una acción que agradeces","Ejemplo de diálogo: preguntar si desea palabras de ánimo","Ejemplo de diálogo: dar las gracias de una forma bien recibida","Ejemplo de diálogo: enviar un mensaje o una carta si lo desea"],
      toPartner: "Puedes mencionar una acción concreta que agradeces. Pregunta primero si los elogios en público o en privado le resultan más cómodos.",
      needFrom: "Explica qué palabras te ayudan y en qué situaciones. El silencio u otra forma de expresión no demuestran, por sí solos, falta de afecto.",
      tip: "Prueba a decir «Gracias por ayudarme en aquel momento» y escucha la respuesta. Acordad una forma y una frecuencia cómodas para ambos.",
    },
  },
  acts: {
    ko: {
      title: '봉사 행위',
      emoji: '🤝',
      description: "이번 답변에서는 실질적인 도움에 더 마음이 갔을 수 있어요. 고정된 성격 유형은 아니며, 말이나 함께하는 시간 등 다른 표현도 원할 수 있어요.",
      examples: ["대화 예: 합의한 집안일 나누기","대화 예: 필요한 도움 먼저 묻기","대화 예: 허락받은 심부름 맡기","대화 예: 요청한 준비를 가능한 범위에서 돕기"],
      toPartner: "어떤 도움이 필요한지 물어보고 맡을 범위와 시간을 합의해요. 상대의 일을 허락 없이 대신 결정하지 않아요.",
      needFrom: "도움이 필요한 일을 구체적으로 말하고, 상대가 할 수 있는 범위도 들어보세요. 거절을 애정 부족으로 단정하지 않아요.",
      tip: "‘지금 어떤 도움이 필요할까요?’라고 물어보세요. 제안이 실제로 도움이 됐는지 확인하고 역할을 조정해요.",
    },
    en: {
      title: 'Acts of Service',
      emoji: '🤝',
      description: "In these answers, practical help may have appealed to you more. This is not a fixed personality type; you may also want words, shared time or other expressions.",
      examples: ["Conversation example: share agreed household tasks","Conversation example: ask what help is needed","Conversation example: run an errand with permission","Conversation example: help with requested preparations within your capacity"],
      toPartner: "Ask what help is needed and agree on its scope and timing. Do not make decisions about someone's work without permission.",
      needFrom: "Be specific about the help you would like, and hear what the other person can manage. Refusal does not establish a lack of affection.",
      tip: "Ask, “What help would be useful now?” Check whether your offer actually helped and adjust responsibilities together.",
    },
    ja: {
      title: 'サービス行為',
      emoji: '🤝',
      description: "今回の回答では、実際的な手助けにより心が向いたかもしれません。固定された性格タイプではなく、言葉や一緒に過ごす時間なども望むことがあります。",
      examples: ["会話の例：合意した家事を分担する","会話の例：必要な手助けを先に尋ねる","会話の例：許可を得た用事を引き受ける","会話の例：頼まれた準備を可能な範囲で手伝う"],
      toPartner: "どんな手助けが必要か尋ね、範囲と時間を話し合います。無断で相手の仕事を代わりに決めないようにします。",
      needFrom: "手伝ってほしいことを具体的に伝え、相手ができる範囲も聞いてみましょう。断られても愛情不足とは断定しません。",
      tip: "「今、どんな手助けがあるとよいですか？」と尋ねてみましょう。提案が実際に役立ったか確かめ、役割を調整します。",
    },
    zh: {
      title: '服务的行动',
      emoji: '🤝',
      description: "在这次回答中，实际帮助可能更吸引你。这不是固定的性格类型，你也可能需要言语、相处时光等其他表达。",
      examples: ["对话示例：分担双方商定的家务","对话示例：先问需要什么帮助","对话示例：经同意后帮忙跑腿","对话示例：在能力范围内协助对方请求的准备工作"],
      toPartner: "先问需要什么帮助，再商定范围与时间。不要未经许可就替对方决定工作上的事。",
      needFrom: "具体说明想要的帮助，也听听对方能承担多少。不要把拒绝断定为缺少爱意。",
      tip: "可以问“现在什么帮助对你有用？”确认提议是否真的有帮助，再一起调整分工。",
    },
    fr: {
      title: 'Services rendus',
      emoji: '🤝',
      description: "Dans ces réponses, l’aide concrète a peut-être davantage retenu votre attention. Ce n’est pas un type de personnalité fixe ; vous pouvez aussi souhaiter des paroles, du temps ensemble ou d’autres expressions.",
      examples: ["Exemple de dialogue : partager les tâches convenues","Exemple de dialogue : demander quelle aide serait utile","Exemple de dialogue : faire une course avec l’accord de l’autre","Exemple de dialogue : aider aux préparatifs demandés selon ses possibilités"],
      toPartner: "Demandez quelle aide est souhaitée et convenez de son étendue et du moment. Ne décidez pas du travail de l’autre sans permission.",
      needFrom: "Précisez l’aide souhaitée et écoutez ce que l’autre peut prendre en charge. Un refus ne prouve pas un manque d’affection.",
      tip: "Demandez « Quelle aide serait utile maintenant ? » Vérifiez si la proposition a vraiment aidé et ajustez ensemble la répartition.",
    },
    es: {
      title: 'Actos de servicio',
      emoji: '🤝',
      description: "En estas respuestas, la ayuda práctica quizá te haya atraído más. No es un tipo de personalidad fijo; también puedes desear palabras, tiempo juntos u otras expresiones.",
      examples: ["Ejemplo de diálogo: compartir las tareas acordadas","Ejemplo de diálogo: preguntar qué ayuda necesita","Ejemplo de diálogo: hacer un recado con permiso","Ejemplo de diálogo: ayudar con los preparativos solicitados según tus posibilidades"],
      toPartner: "Pregunta qué ayuda necesita y acordad el alcance y el momento. No decidas sobre su trabajo sin permiso.",
      needFrom: "Concreta la ayuda que te gustaría recibir y escucha qué puede asumir la otra persona. Un rechazo no demuestra falta de afecto.",
      tip: "Pregunta «¿Qué ayuda te vendría bien ahora?». Comprueba si la propuesta ha sido útil y ajustad el reparto de responsabilidades.",
    },
  },
  gifts: {
    ko: {
      title: '선물',
      emoji: '🎁',
      description: "이번 답변에서는 선물로 전하는 마음에 더 마음이 갔을 수 있어요. 고정된 성격 유형은 아니며, 선물 외의 표현도 함께 원할 수 있어요.",
      examples: ["대화 예: 원하는 작은 물건 확인하기","대화 예: 편지를 원하는지 묻기","대화 예: 합의한 예산 안에서 선물 고르기","대화 예: 선물 대신 시간을 보낼지 묻기"],
      toPartner: "선물을 원하는지와 취향을 먼저 물어봐요. 비용과 준비 부담을 확인하고 보답을 요구하지 않아요.",
      needFrom: "좋아하는 것과 부담스러운 것을 함께 말해보세요. 선물을 받지 못했다고 애정이 없다고 판단하지 않아요.",
      tip: "‘선물이나 편지, 함께하는 시간 중 무엇이 좋을까요?’라고 물어보세요. 서로 감당할 수 있는 예산과 기대를 합의해요.",
    },
    en: {
      title: 'Receiving Gifts',
      emoji: '🎁',
      description: "In these answers, the thought conveyed by gifts may have appealed to you more. This is not a fixed personality type; you may also want other expressions.",
      examples: ["Conversation example: check whether a small item is wanted","Conversation example: ask whether a letter would be welcome","Conversation example: choose a gift within an agreed budget","Conversation example: ask about spending time together instead"],
      toPartner: "First ask whether a gift is wanted and what the person likes. Consider cost and preparation, without demanding anything in return.",
      needFrom: "Explain both what you enjoy and what feels burdensome. Not receiving a gift does not establish a lack of affection.",
      tip: "Ask, “Would you prefer a gift, a letter or time together?” Agree on a manageable budget and expectations.",
    },
    ja: {
      title: 'プレゼント',
      emoji: '🎁',
      description: "今回の回答では、贈り物で伝わる気持ちにより心が向いたかもしれません。固定された性格タイプではなく、ほかの表現も一緒に望むことがあります。",
      examples: ["会話の例：小さな品物が欲しいか確かめる","会話の例：手紙がうれしいか尋ねる","会話の例：合意した予算内で選ぶ","会話の例：代わりに一緒に過ごしたいか尋ねる"],
      toPartner: "贈り物を望んでいるか、何が好きかを先に尋ねます。費用や準備の負担を確かめ、お返しを求めません。",
      needFrom: "うれしいものと負担になるものの両方を伝えてみましょう。贈り物がないだけで愛情がないとは判断しません。",
      tip: "「贈り物、手紙、一緒に過ごす時間なら、どれがよいですか？」と尋ねてみましょう。無理のない予算と期待を話し合います。",
    },
    zh: {
      title: '礼物',
      emoji: '🎁',
      description: "在这次回答中，礼物传达的心意可能更吸引你。这不是固定的性格类型，你也可能同时需要其他表达。",
      examples: ["对话示例：确认是否想要某件小物品","对话示例：问一封信是否合心意","对话示例：在商定的预算内挑选礼物","对话示例：问是否愿意改为一起相处"],
      toPartner: "先问是否想要礼物以及有什么喜好。确认费用与准备负担，不要求回报。",
      needFrom: "同时说出喜欢什么、什么让你感到负担。不要因为没收到礼物就判断对方没有爱意。",
      tip: "可以问“礼物、信或一起相处的时间，你更喜欢哪个？”共同商定能承担的预算与期待。",
    },
    fr: {
      title: 'Cadeaux',
      emoji: '🎁',
      description: "Dans ces réponses, l’attention transmise par les cadeaux a peut-être davantage retenu votre intérêt. Ce n’est pas un type de personnalité fixe ; vous pouvez aussi souhaiter d’autres expressions.",
      examples: ["Exemple de dialogue : vérifier si un petit objet fait envie","Exemple de dialogue : demander si une lettre serait appréciée","Exemple de dialogue : choisir dans un budget convenu","Exemple de dialogue : proposer du temps ensemble à la place"],
      toPartner: "Demandez d’abord si un cadeau est souhaité et ce qui plaît. Tenez compte du coût et de la préparation, sans exiger de contrepartie.",
      needFrom: "Exprimez à la fois ce qui vous plaît et ce qui vous pèse. L’absence de cadeau ne prouve pas un manque d’affection.",
      tip: "Demandez « Préféreriez-vous un cadeau, une lettre ou du temps ensemble ? » Convenez d’un budget et d’attentes réalistes pour vous deux.",
    },
    es: {
      title: 'Regalos',
      emoji: '🎁',
      description: "En estas respuestas, la atención que transmite un regalo quizá te haya atraído más. No es un tipo de personalidad fijo; también puedes desear otras expresiones.",
      examples: ["Ejemplo de diálogo: comprobar si desea un pequeño objeto","Ejemplo de diálogo: preguntar si le gustaría una carta","Ejemplo de diálogo: elegir dentro del presupuesto acordado","Ejemplo de diálogo: proponer tiempo juntos en su lugar"],
      toPartner: "Pregunta primero si desea un regalo y qué le gusta. Considera el coste y la preparación, sin exigir nada a cambio.",
      needFrom: "Explica qué te gusta y qué te supone una carga. No recibir un regalo no demuestra falta de afecto.",
      tip: "Pregunta «¿Preferirías un regalo, una carta o tiempo juntos?». Acordad un presupuesto y unas expectativas que ambos podáis asumir.",
    },
  },
  time: {
    ko: {
      title: '함께하는 시간',
      emoji: '⏰',
      description: "이번 답변에서는 서로에게 집중하는 시간에 더 마음이 갔을 수 있어요. 고정된 성격 유형은 아니며, 다른 표현이나 혼자 쉬는 시간도 원할 수 있어요.",
      examples: ["대화 예: 합의한 시간에 집중해서 듣기","대화 예: 원할 때 함께 산책하기","대화 예: 조용히 함께 있어도 좋은지 묻기","대화 예: 둘 다 원하는 활동 고르기"],
      toPartner: "지금 함께할 여유가 있는지 물어보고 활동과 시간을 합의해요. 대화를 원하지 않을 때 억지로 말하게 하지 않아요.",
      needFrom: "대화, 산책, 조용한 동행 중 무엇을 원하는지 말해보세요. 지금 어렵다면 다시 함께할 때를 정할 수 있어요.",
      tip: "‘지금 잠깐 집중해서 이야기할 수 있을까요?’라고 물어보세요. 휴대전화 사용과 시간은 서로 가능한 범위에서 합의해요.",
    },
    en: {
      title: 'Quality Time',
      emoji: '⏰',
      description: "In these answers, time focused on each other may have appealed to you more. This is not a fixed personality type; you may also want other expressions or time to rest alone.",
      examples: ["Conversation example: listen attentively at an agreed time","Conversation example: walk together when wanted","Conversation example: ask about quiet company","Conversation example: choose an activity both people want"],
      toPartner: "Ask whether there is time and energy to be together now, and agree on the activity and timing. Do not force conversation when it is unwanted.",
      needFrom: "Say whether you would like conversation, a walk or quiet company. If now is difficult, you can agree on another time.",
      tip: "Ask, “Could we focus on a conversation for a moment?” Agree on phone use and timing within what both of you can manage.",
    },
    ja: {
      title: '充実した時間',
      emoji: '⏰',
      description: "今回の回答では、互いに集中する時間により心が向いたかもしれません。固定された性格タイプではなく、ほかの表現や一人で休む時間も望むことがあります。",
      examples: ["会話の例：合意した時間に集中して聞く","会話の例：望まれたときに一緒に散歩する","会話の例：静かに一緒にいてもよいか尋ねる","会話の例：二人とも望む活動を選ぶ"],
      toPartner: "今、一緒に過ごす余裕があるか尋ね、活動と時間を話し合います。会話を望まないときは無理に話させません。",
      needFrom: "会話、散歩、静かな同伴のどれを望むか伝えてみましょう。今は難しければ、別の時間を決められます。",
      tip: "「今、少し集中して話せそうですか？」と尋ねてみましょう。スマートフォンの使い方や時間は、互いに可能な範囲で話し合います。",
    },
    zh: {
      title: '精心的时刻',
      emoji: '⏰',
      description: "在这次回答中，专注于彼此的时间可能更吸引你。这不是固定的性格类型，你也可能需要其他表达或独处休息。",
      examples: ["对话示例：在商定的时间专心倾听","对话示例：愿意时一起散步","对话示例：问是否想安静地待在一起","对话示例：选择双方都想做的活动"],
      toPartner: "先问现在是否有时间和精力相处，再商定活动与时间。对方不想聊天时，不强迫开口。",
      needFrom: "说明想聊天、散步，还是安静陪伴。如果现在不方便，可以另约时间。",
      tip: "可以问“现在能专心聊一会儿吗？”在双方可行的范围内商定手机使用与相处时间。",
    },
    fr: {
      title: 'Moments de qualité',
      emoji: '⏰',
      description: "Dans ces réponses, les moments d’attention mutuelle ont peut-être davantage retenu votre intérêt. Ce n’est pas un type de personnalité fixe ; vous pouvez aussi souhaiter d’autres expressions ou du repos en solitaire.",
      examples: ["Exemple de dialogue : écouter à un moment convenu","Exemple de dialogue : marcher ensemble si cela est souhaité","Exemple de dialogue : proposer une présence silencieuse","Exemple de dialogue : choisir une activité souhaitée par les deux"],
      toPartner: "Demandez si l’autre a le temps et l’énergie maintenant, puis convenez de l’activité et du moment. N’imposez pas une conversation non souhaitée.",
      needFrom: "Dites si vous préférez discuter, marcher ou rester ensemble en silence. Si ce n’est pas possible maintenant, convenez d’un autre moment.",
      tip: "Demandez « Pourrions-nous discuter avec attention un instant ? » Convenez de l’usage du téléphone et du temps disponible pour chacun.",
    },
    es: {
      title: 'Tiempo de calidad',
      emoji: '⏰',
      description: "En estas respuestas, el tiempo de atención mutua quizá te haya atraído más. No es un tipo de personalidad fijo; también puedes desear otras expresiones o descansar a solas.",
      examples: ["Ejemplo de diálogo: escuchar en un momento acordado","Ejemplo de diálogo: pasear juntos si apetece","Ejemplo de diálogo: proponer compañía silenciosa","Ejemplo de diálogo: elegir una actividad que ambos deseen"],
      toPartner: "Pregunta si ahora hay tiempo y energía para estar juntos y acordad la actividad y el momento. No fuerces una conversación que no desea.",
      needFrom: "Explica si prefieres conversar, pasear o estar juntos en silencio. Si ahora resulta difícil, podéis acordar otro momento.",
      tip: "Pregunta «¿Podemos conversar con atención un momento?». Acordad el uso del móvil y el tiempo según las posibilidades de ambos.",
    },
  },
  touch: {
    ko: {
      title: '스킨십',
      emoji: '🤗',
      description: "이번 답변에서는 원하는 접촉에 더 마음이 갔을 수 있어요. 고정된 성격 유형은 아니며, 다른 표현도 원할 수 있어요. 접촉 선호가 언제든 만져도 된다는 허락은 아니에요.",
      examples: ["대화 예: 손잡아도 되는지 먼저 묻기","대화 예: 둘 다 원할 때 포옹하기","대화 예: 불편하면 바로 멈추기","대화 예: 접촉 대신 편한 표현 찾기"],
      toPartner: "지금 접촉을 원하는지 먼저 물어보고 거절이나 망설임을 존중해요. 성적 접촉의 동의는 자발적이어야 하며 언제든 철회할 수 있어요.",
      needFrom: "원하는 접촉과 원하지 않는 접촉, 편한 거리를 말할 수 있어요. 상대도 거절할 수 있고, 거절을 애정 부족으로 해석하지 않아요.",
      tip: "‘지금 안아도 괜찮을까요?’라고 물어보세요. 원하지 않으면 멈추고 대화나 다른 표현이 편한지 확인해요.",
    },
    en: {
      title: 'Physical Touch',
      emoji: '🤗',
      description: "In these answers, wanted physical contact may have appealed to you more. This is not a fixed personality type; you may want other expressions too. A preference for touch is not permission to touch at any time.",
      examples: ["Conversation example: ask before holding hands","Conversation example: hug when both people want to","Conversation example: stop immediately if it feels uncomfortable","Conversation example: find a welcome alternative to touch"],
      toPartner: "Ask whether contact is wanted now and respect refusal or hesitation. Consent to sexual contact must be freely given and can be withdrawn at any time.",
      needFrom: "You can name the contact you want or do not want and the distance that feels comfortable. The other person can decline too; refusal is not a lack of affection.",
      tip: "Ask, “Would a hug be okay now?” If it is unwanted, stop and ask whether conversation or another expression would feel comfortable.",
    },
    ja: {
      title: '身体的接触',
      emoji: '🤗',
      description: "今回の回答では、望んでいる触れ合いにより心が向いたかもしれません。固定された性格タイプではなく、ほかの表現も望むことがあります。触れ合いが好きでも、いつ触ってもよいという許可ではありません。",
      examples: ["会話の例：手をつなぐ前に尋ねる","会話の例：二人とも望むときに抱きしめる","会話の例：不快ならすぐにやめる","会話の例：触れ合い以外の心地よい表現を探す"],
      toPartner: "今触れてほしいか先に尋ね、拒否やためらいを尊重します。性的接触への同意は自発的である必要があり、いつでも撤回できます。",
      needFrom: "望む接触、望まない接触、心地よい距離を伝えられます。相手も断ることができ、拒否を愛情不足と解釈しません。",
      tip: "「今、抱きしめてもよいですか？」と尋ねてみましょう。望まれなければやめ、会話や別の表現が心地よいか確かめます。",
    },
    zh: {
      title: '身体的接触',
      emoji: '🤗',
      description: "在这次回答中，自己愿意接受的身体接触可能更吸引你。这不是固定的性格类型，你也可能需要其他表达。喜欢接触不等于允许随时被触碰。",
      examples: ["对话示例：牵手前先询问","对话示例：双方都愿意时拥抱","对话示例：不舒服时立即停止","对话示例：寻找接触之外的舒服表达"],
      toPartner: "先问此刻是否想要接触，尊重拒绝或犹豫。性接触的同意必须出于自愿，并可随时撤回。",
      needFrom: "可以说明想要和不想要的接触，以及舒服的距离。对方也可以拒绝，不要把拒绝理解为缺少爱意。",
      tip: "可以问“现在可以抱你吗？”如果不愿意就停止，再问聊天或其他表达是否更舒服。",
    },
    fr: {
      title: 'Toucher physique',
      emoji: '🤗',
      description: "Dans ces réponses, un contact physique souhaité a peut-être davantage retenu votre intérêt. Ce n’est pas un type de personnalité fixe ; vous pouvez aussi vouloir d’autres expressions. Aimer le toucher n’autorise pas à être touché à tout moment.",
      examples: ["Exemple de dialogue : demander avant de prendre la main","Exemple de dialogue : se prendre dans les bras si les deux le souhaitent","Exemple de dialogue : arrêter immédiatement en cas d’inconfort","Exemple de dialogue : chercher une alternative au contact"],
      toPartner: "Demandez si le contact est souhaité maintenant et respectez le refus ou l’hésitation. Le consentement à un contact sexuel doit être libre et peut être retiré à tout moment.",
      needFrom: "Vous pouvez préciser les contacts souhaités ou non et la distance qui vous convient. L’autre peut aussi refuser ; un refus n’est pas un manque d’affection.",
      tip: "Demandez « Puis-je te prendre dans mes bras maintenant ? » Si ce n’est pas souhaité, arrêtez et proposez une conversation ou une autre expression.",
    },
    es: {
      title: 'Contacto físico',
      emoji: '🤗',
      description: "En estas respuestas, el contacto físico deseado quizá te haya atraído más. No es un tipo de personalidad fijo; también puedes desear otras expresiones. Que te guste el contacto no da permiso para tocarte en cualquier momento.",
      examples: ["Ejemplo de diálogo: preguntar antes de tomar la mano","Ejemplo de diálogo: abrazarse si ambos lo desean","Ejemplo de diálogo: parar de inmediato si hay incomodidad","Ejemplo de diálogo: buscar una alternativa cómoda al contacto"],
      toPartner: "Pregunta si desea contacto ahora y respeta el rechazo o la duda. El consentimiento para el contacto sexual debe ser voluntario y puede retirarse en cualquier momento.",
      needFrom: "Puedes indicar qué contacto quieres, cuál no y qué distancia te resulta cómoda. La otra persona también puede negarse; un rechazo no significa falta de afecto.",
      tip: "Pregunta «¿Te parece bien un abrazo ahora?». Si no lo desea, para y pregunta si prefiere conversar u otra expresión.",
    },
  },
}

interface Props { locale?: string }

export default function LoveLanguageTest({ locale: lp = 'ko' }: Props) {
  const locale: Locale = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(lp) ? lp : 'en') as Locale
  const lb = LABELS[locale]
  const pairs = PAIRS[locale]

  const initResult = (): { primary: Lang; scores: Scores } | null => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const t = p.get('lang') as Lang | null
    if (t && RESULTS[t]) return { primary: t, scores: { words: 0, acts: 0, gifts: 0, time: 0, touch: 0 } }
    return null
  }

  const [current, setCurrent] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('lang')) return pairs.length
    }
    return 0
  })
  const [selected, setSelected] = useState<'a' | 'b' | null>(null)
  const [answers, setAnswers] = useState<Lang[]>([])
  const [result, setResult] = useState<{ primary: Lang; scores: Scores } | null>(initResult)
  useRecordFinishedTest({ testId: "love-language", title: "LoveLanguageTest", finished: Boolean(result) });

  function calcResult(ans: Lang[]): { primary: Lang; scores: Scores } {
    const scores: Scores = { words: 0, acts: 0, gifts: 0, time: 0, touch: 0 }
    for (const a of ans) scores[a]++
    const primary = (Object.keys(scores) as Lang[]).reduce((a, b) => scores[a] >= scores[b] ? a : b)
    return { primary, scores }
  }

  function pick(side: 'a' | 'b') {
    if (selected !== null) return
    setSelected(side)
    const chosen = side === 'a' ? pairs[current].a.lang : pairs[current].b.lang
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const newAns = answers.slice(0, current)
    newAns[current] = chosen
    setTimeout(() => {
      if (current + 1 >= pairs.length) setResult(calcResult(newAns))
      setAnswers(newAns)
      setCurrent(current + 1)
      setSelected(null)
    }, 280)
  }

  function restart() {
    setAnswers([]); setCurrent(0); setSelected(null); setResult(null)
    if (typeof window !== 'undefined') window.history.replaceState({}, '', window.location.pathname)
  }

  function share() {
    if (!result) return
    const url = `${window.location.origin}${window.location.pathname}?lang=${result.primary}`
    const text = `${lb.shareMsg} ${lb.types[result.primary]}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= pairs.length

  if (!finished) {
    const pair = pairs[current]
    const progress = Math.round((current / pairs.length) * 100)
    return (
      <Questionnaire<'a' | 'b'>
        title={lb.title}
        subtitle={lb.subtitle}
        question={lb.chooseOne}
        questionLabel={lb.pairOf(current + 1, pairs.length)}
        progress={progress}
        options={(['a', 'b'] as const).map((side) => ({ label: pair[side].text, value: side }))}
        selectedValue={
          selected !== null
            ? selected
            : answers[current] === pair.a.lang
              ? 'a'
              : answers[current] === pair.b.lang
                ? 'b'
                : undefined
        }
        previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question')}
        onPrevious={current > 0 && selected === null ? () => setCurrent(current - 1) : undefined}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.primary][locale]
  const resultContext = RESULT_CONTEXT[locale]
  const hasAnswerScores = answers.length === pairs.length
  const chartData = (Object.keys(result.scores) as Lang[]).map(k => ({
    name: lb.types[k],
    value: result.scores[k],
    fill: LANG_COLORS[k],
  })).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{hasAnswerScores ? lb.yourPrimary : resultContext.shared}</p>
        <ResultSymbol id="love-language" variant={result.primary} fallback={r.emoji} className="mx-auto h-28 w-28" />
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: LANG_COLORS[result.primary] }}>{r.title}</div>
        {hasAnswerScores && <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>}
        {hasAnswerScores && <p className="text-sm text-muted-foreground leading-relaxed">{resultContext.note}</p>}
        {!hasAnswerScores && <p className="text-sm text-muted-foreground leading-relaxed">{resultContext.sharedNote}</p>}
        <a className="text-sm text-primary underline underline-offset-4" href={`/${locale}/love-languages-complete-guide/`}>{resultContext.guide}</a>
      </div>

      {hasAnswerScores && <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground text-center mb-3">{lb.chartTitle}</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" domain={[0, pairs.length]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <Tooltip formatter={((value: number) => SELECTION_COUNT[locale](value)) as any} />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ResponsiveContainer>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {chartData.map(item => <li key={item.name}>{item.name}: {SELECTION_COUNT[locale](item.value)}</li>)}
        </ul>
      </div>}

      <div className="grid gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm">{lb.examples}</h3>
          <ul className="space-y-1">
            {r.examples.map(e => <li key={e} className="text-sm text-muted-foreground flex gap-2"><span style={{ color: LANG_COLORS[result.primary] }}>•</span>{e}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <h3 className="font-semibold text-sm">{lb.toPartner}</h3>
          <p className="text-sm text-muted-foreground">{r.toPartner}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <h3 className="font-semibold text-sm">{lb.needFrom}</h3>
          <p className="text-sm text-muted-foreground">{r.needFrom}</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.tip}</h3>
        <p className="text-sm">{r.tip}</p>
      </div>

      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={r.title}
        emoji={r.emoji}
        description={r.description}
        symbolSrc={resultSymbolSrc('love-language', result.primary)}
        analyticsId="love-language"
      />
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/attachment-style/test/`, label: (({ ko: '💚 애착유형 테스트', en: '💚 Attachment style test', ja: '💚 愛着スタイルテスト', zh: '💚 依恋类型测验', fr: '💚 Test du style d’attachement', es: '💚 Test de estilo de apego' } as Record<string, string>)[locale] ?? '💚 Attachment style test') },
          { href: `/${locale}/enneagram/test/`, label: (({ ko: '🔮 에니어그램 테스트', en: '🔮 Enneagram test', ja: '🔮 エニアグラムテスト', zh: '🔮 九型人格测验', fr: '🔮 Test de l’ennéagramme', es: '🔮 Test del eneagrama' } as Record<string, string>)[locale] ?? '🔮 Enneagram test') },
        ]}
      />

      <div className="flex gap-3">
        <button onClick={restart}
          className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          {lb.restart}
        </button>
        <button onClick={share}
          className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
          {lb.share}
        </button>
      </div>
    </div>
  )
}
