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
    yourPrimary: '나의 주요 사랑의 언어',
    description: '설명',
    examples: '구체적인 예시',
    toPartner: '파트너에게 표현하는 방법',
    needFrom: '파트너에게 필요한 것',
    tip: '관계 팁',
    allScores: '전체 점수',
    chartTitle: '사랑의 언어 분석',
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
    yourPrimary: 'Your Primary Love Language',
    description: 'Description',
    examples: 'Examples',
    toPartner: 'How I express love',
    needFrom: 'What I need from a partner',
    tip: 'Relationship Tip',
    allScores: 'All Scores',
    chartTitle: 'Love Language Breakdown',
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
    yourPrimary: '主な愛の言語',
    description: '説明',
    examples: '具体的な例',
    toPartner: '愛の表現方法',
    needFrom: 'パートナーに必要なこと',
    tip: '関係のヒント',
    allScores: '全スコア',
    chartTitle: '愛の言語分析',
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
    yourPrimary: '我的主要爱的语言',
    description: '说明',
    examples: '具体例子',
    toPartner: '对伴侣表达的方式',
    needFrom: '伴侣需要的是',
    tip: '关系小贴士',
    allScores: '全部分数',
    chartTitle: '爱的语言分析',
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
    yourPrimary: 'Mon langage de l’amour principal',
    description: 'Description',
    examples: 'Exemples concrets',
    toPartner: 'Comment je l’exprime à mon partenaire',
    needFrom: 'Ce dont mon partenaire a besoin',
    tip: 'Conseil pour la relation',
    allScores: 'Scores complets',
    chartTitle: 'Analyse des langages de l’amour',
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
    yourPrimary: 'Mi lenguaje del amor principal',
    description: 'Descripción',
    examples: 'Ejemplos concretos',
    toPartner: 'Cómo lo expreso a mi pareja',
    needFrom: 'Lo que necesita mi pareja',
    tip: 'Consejo para la relación',
    allScores: 'Puntuaciones completas',
    chartTitle: 'Análisis de los lenguajes del amor',
    types: {
      words: 'Palabras de afirmación',
      acts: 'Actos de servicio',
      gifts: 'Regalos',
      time: 'Tiempo de calidad',
      touch: 'Contacto físico',
    },
  },
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
    { a: { text: '恋人用信或讯息表达心意的时候', lang: 'words' }, b: { text: '我生病时恋人买药来、陪在我身边', lang: 'acts' } },
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
      description: '당신은 언어를 통해 사랑을 느끼고 표현합니다. 칭찬, 격려, 감사의 말이 마음에 깊이 와닿습니다. "사랑해", "자랑스러워", "당신이 있어서 행복해" 같은 말이 큰 힘이 됩니다.',
      examples: ['진심 어린 칭찬', '격려와 지지의 말', '감사 표현', '사랑을 담은 문자/편지'],
      toPartner: '말로 감사함과 사랑을 자주 표현합니다. 칭찬을 아끼지 않고, 파트너의 노력을 말로 인정합니다.',
      needFrom: '진심 어린 말과 인정. 비판적인 말이나 침묵은 큰 상처가 됩니다.',
      tip: '파트너에게 "오늘 정말 잘했어", "함께여서 행복해" 같은 말을 하루에 한 번 이상 해보세요. 작은 말 한마디가 큰 사랑이 됩니다.',
    },
    en: {
      title: 'Words of Affirmation',
      emoji: '💬',
      description: 'You feel and express love through words. Compliments, encouragement, and words of gratitude touch you deeply. Phrases like "I love you," "I\'m proud of you," and "I\'m happy you\'re in my life" mean the world to you.',
      examples: ['Sincere compliments', 'Words of encouragement and support', 'Expressions of gratitude', 'Loving messages/letters'],
      toPartner: 'You frequently express appreciation and love verbally. You don\'t hold back praise and verbally acknowledge your partner\'s efforts.',
      needFrom: 'Sincere words and affirmation. Critical words or silence can deeply wound you.',
      tip: 'Tell your partner "You did great today" or "I\'m so happy with you" at least once a day. A small word can be a big act of love.',
    },
    ja: {
      title: '肯定の言葉',
      emoji: '💬',
      description: '言葉を通じて愛を感じ、表現します。褒め言葉、励まし、感謝の言葉が深く心に響きます。「愛してる」「誇りに思う」「一緒にいられて幸せ」という言葉が大きな力になります。',
      examples: ['心からの褒め言葉', '励ましとサポートの言葉', '感謝の表現', '愛情のこもったメッセージ/手紙'],
      toPartner: '言葉で感謝と愛情を頻繁に表現します。褒め言葉を惜しまず、パートナーの努力を言葉で認めます。',
      needFrom: '心からの言葉と認定。批判的な言葉や沈黙は大きな傷になります。',
      tip: 'パートナーに「今日は本当によくやったね」や「一緒にいられて幸せ」と1日1回以上言ってみましょう。小さな言葉が大きな愛になります。',
    },
    zh: {
      title: '肯定的言语',
      emoji: '💬',
      description: '你通过语言感受和表达爱。称赞、鼓励、感谢的话会深深打动你。“我爱你”“我为你骄傲”“有你我很幸福”这样的话会给你很大的力量。',
      examples: ['真心的称赞', '鼓励与支持的话', '表达感谢', '充满爱意的讯息或信'],
      toPartner: '常用言语表达感谢和爱，不吝啬称赞，用话语肯定伴侣的努力。',
      needFrom: '真心的话语与认可。批评或沉默会造成很大的伤害。',
      tip: '每天至少对伴侣说一次“今天做得真好”“和你在一起很幸福”这样的话。一句小小的话，就是很大的爱。',
    },
    fr: {
      title: 'Paroles valorisantes',
      emoji: '💬',
      description: 'Vous ressentez et exprimez l’amour par les mots. Compliments, encouragements et remerciements vous touchent profondément. Des phrases comme « Je t’aime », « Je suis fier de toi », « Je suis heureux grâce à toi » vous donnent beaucoup de force.',
      examples: ['Des compliments sincères', 'Des mots d’encouragement et de soutien', 'Des remerciements', 'Des messages ou lettres pleins d’amour'],
      toPartner: 'Vous exprimez souvent gratitude et amour par la parole. Vous ne ménagez pas vos compliments et reconnaissez par des mots les efforts de votre partenaire.',
      needFrom: 'Des paroles sincères et de la reconnaissance. Les critiques ou le silence blessent profondément.',
      tip: 'Dites au moins une fois par jour à votre partenaire des mots comme « Tu as été super aujourd’hui » ou « Je suis heureux d’être avec toi ». Une petite phrase devient un grand amour.',
    },
    es: {
      title: 'Palabras de afirmación',
      emoji: '💬',
      description: 'Sientes y expresas el amor a través de las palabras. Los elogios, el ánimo y el agradecimiento te llegan hondo. Frases como «Te quiero», «Estoy orgulloso de ti» o «Soy feliz porque estás tú» te dan mucha fuerza.',
      examples: ['Elogios sinceros', 'Palabras de ánimo y apoyo', 'Expresar agradecimiento', 'Mensajes o cartas llenos de cariño'],
      toPartner: 'Expresas a menudo gratitud y amor con palabras. No escatimas elogios y reconoces verbalmente el esfuerzo de tu pareja.',
      needFrom: 'Palabras sinceras y reconocimiento. Las críticas o el silencio hieren mucho.',
      tip: 'Dile a tu pareja al menos una vez al día cosas como «Hoy lo has hecho genial» o «Soy feliz contigo». Una frase pequeña se convierte en mucho amor.',
    },
  },
  acts: {
    ko: {
      title: '봉사 행위',
      emoji: '🤝',
      description: '당신은 행동으로 사랑을 느끼고 표현합니다. 파트너가 나를 위해 무언가를 해줄 때 깊은 사랑을 느낍니다. 대신 해주는 일, 도움의 손길, 배려 가득한 행동이 사랑의 언어입니다.',
      examples: ['집안일 나눠하기', '바쁠 때 도와주기', '심부름 대신해주기', '파트너를 위해 뭔가 준비하기'],
      toPartner: '파트너를 위해 실질적인 도움을 제공합니다. 말보다 행동으로 사랑을 표현하는 것을 선호합니다.',
      needFrom: '실질적인 도움과 배려. 말뿐인 약속보다 작은 행동이 훨씬 큰 의미입니다.',
      tip: '파트너의 부담을 줄여줄 수 있는 작은 행동 하나를 오늘 해보세요. 물 한 잔을 가져다주는 것도 충분한 사랑의 표현입니다.',
    },
    en: {
      title: 'Acts of Service',
      emoji: '🤝',
      description: 'You feel and express love through actions. You feel deeply loved when your partner does something for you. Doing things on your behalf, lending a hand, and thoughtful actions are your love language.',
      examples: ['Sharing household chores', 'Helping when you\'re busy', 'Running errands', 'Preparing something for your partner'],
      toPartner: 'You provide practical help for your partner. You prefer expressing love through actions rather than words.',
      needFrom: 'Practical help and consideration. Small actions mean far more than empty promises.',
      tip: 'Do one small thing today that eases your partner\'s burden. Even bringing them a glass of water is a meaningful expression of love.',
    },
    ja: {
      title: 'サービス行為',
      emoji: '🤝',
      description: '行動を通じて愛を感じ、表現します。パートナーが何かをしてくれる時に深い愛を感じます。代わりにやってくれること、助けの手、思いやりある行動が愛の言語です。',
      examples: ['家事を分け合う', '忙しい時に助けてくれる', '代わりに用事を済ませる', 'パートナーのために何かを準備する'],
      toPartner: 'パートナーのために実際的な助けを提供します。言葉より行動で愛情を表現することを好みます。',
      needFrom: '実際的な助けと思いやり。空約束より小さな行動がはるかに大きな意味を持ちます。',
      tip: 'パートナーの負担を減らせる小さな行動を今日やってみましょう。水を一杯持ってきてあげるだけでも十分な愛の表現です。',
    },
    zh: {
      title: '服务的行动',
      emoji: '🤝',
      description: '你通过行动感受和表达爱。当伴侣为你做些什么时，你会感到深深的爱。代劳的事、伸出的援手、体贴的举动，就是你的爱的语言。',
      examples: ['分担家务', '忙的时候帮忙', '代跑腿', '为伴侣准备些什么'],
      toPartner: '为伴侣提供实际的帮助。比起言语，你更喜欢用行动表达爱。',
      needFrom: '实际的帮助与体贴。比起只停在嘴上的承诺，小小的行动意义大得多。',
      tip: '今天做一件能减轻伴侣负担的小事吧。递上一杯水，也足以表达爱。',
    },
    fr: {
      title: 'Services rendus',
      emoji: '🤝',
      description: 'Vous ressentez et exprimez l’amour par les actes. Quand votre partenaire fait quelque chose pour vous, vous vous sentez profondément aimé. Rendre service, tendre la main, les gestes attentionnés : voilà votre langage de l’amour.',
      examples: ['Partager les tâches ménagères', 'Aider quand l’autre est débordé', 'Faire une course à sa place', 'Préparer quelque chose pour l’autre'],
      toPartner: 'Vous apportez une aide concrète à votre partenaire. Vous préférez montrer votre amour par des actes plutôt que par des mots.',
      needFrom: 'Une aide concrète et de l’attention. Un petit geste compte bien plus qu’une promesse en l’air.',
      tip: 'Faites aujourd’hui un petit geste qui allège la charge de votre partenaire. Apporter un verre d’eau suffit à exprimer l’amour.',
    },
    es: {
      title: 'Actos de servicio',
      emoji: '🤝',
      description: 'Sientes y expresas el amor con hechos. Cuando tu pareja hace algo por ti, te sientes muy querido. Hacer cosas por el otro, echar una mano y los gestos atentos son tu lenguaje del amor.',
      examples: ['Repartir las tareas de casa', 'Ayudar cuando el otro está ocupado', 'Hacer un recado en su lugar', 'Preparar algo para tu pareja'],
      toPartner: 'Ofreces ayuda práctica a tu pareja. Prefieres mostrar el amor con hechos más que con palabras.',
      needFrom: 'Ayuda práctica y atención. Un pequeño gesto significa mucho más que una promesa que se queda en palabras.',
      tip: 'Haz hoy un pequeño gesto que alivie la carga de tu pareja. Llevarle un vaso de agua ya es una muestra de amor.',
    },
  },
  gifts: {
    ko: {
      title: '선물',
      emoji: '🎁',
      description: '당신은 선물을 통해 사랑을 느끼고 표현합니다. 선물의 크기보다 "나를 생각했구나"라는 마음이 중요합니다. 기념일을 기억하거나 여행 중 작은 것을 사다주는 행동이 깊은 사랑으로 느껴집니다.',
      examples: ['기념일 선물', '여행 중 소품 사다주기', '좋아하는 것 기억해서 선물', '작은 간식이나 꽃'],
      toPartner: '파트너를 생각하며 선물을 고릅니다. 생일이나 기념일을 정성스럽게 준비합니다.',
      needFrom: '나를 생각한다는 증거가 되는 선물. 선물을 잊거나 무시하는 것이 큰 상처가 될 수 있습니다.',
      tip: '비싼 선물이 아니어도 괜찮습니다. "이걸 보니 네 생각이 났어"라는 말과 함께 작은 것을 선물해보세요.',
    },
    en: {
      title: 'Receiving Gifts',
      emoji: '🎁',
      description: 'You feel and express love through gifts. It\'s not about the size of the gift but the message "I was thinking of you." Remembering anniversaries or bringing back something small from a trip feels like deep love.',
      examples: ['Anniversary gifts', 'Souvenirs from trips', 'Gifts based on remembered preferences', 'Small treats or flowers'],
      toPartner: 'You choose gifts thoughtfully, thinking of your partner. You prepare carefully for birthdays and anniversaries.',
      needFrom: 'Gifts that show you\'re being thought of. Forgetting or dismissing gifts can be deeply hurtful.',
      tip: 'It doesn\'t need to be expensive. Try giving something small with the words "I saw this and thought of you."',
    },
    ja: {
      title: 'プレゼント',
      emoji: '🎁',
      description: 'プレゼントを通じて愛を感じ、表現します。プレゼントの大きさより「私のことを考えてくれた」という気持ちが大切です。記念日を覚えていたり、旅行中に小さなものを買ってきてくれると深い愛を感じます。',
      examples: ['記念日のプレゼント', '旅行中のお土産', '好みを覚えてのプレゼント', '小さなお菓子や花'],
      toPartner: 'パートナーのことを考えながらプレゼントを選びます。誕生日や記念日を丁寧に準備します。',
      needFrom: '自分のことを考えてくれている証拠となるプレゼント。プレゼントを忘れたり軽視すると大きな傷になります。',
      tip: '高価でなくて大丈夫です。「これを見たらあなたのことを思い出した」という言葉と一緒に小さなものを贈ってみましょう。',
    },
    zh: {
      title: '礼物',
      emoji: '🎁',
      description: '你通过礼物感受和表达爱。比起礼物的大小，“原来你想着我”的心意更重要。记得纪念日、旅行时带回的小东西，都会让你感到深深的爱。',
      examples: ['纪念日礼物', '旅行时带回的小物', '记得对方喜欢的东西并送上', '小零食或花'],
      toPartner: '想着伴侣挑选礼物，用心准备生日和纪念日。',
      needFrom: '证明“你想着我”的礼物。忘记或忽视礼物可能造成很大的伤害。',
      tip: '不必是贵重的礼物。附上一句“看到这个就想到你”，送一样小东西吧。',
    },
    fr: {
      title: 'Cadeaux',
      emoji: '🎁',
      description: 'Vous ressentez et exprimez l’amour à travers les cadeaux. Plus que leur valeur, c’est le sentiment « il a pensé à moi » qui compte. Se souvenir d’un anniversaire ou rapporter une petite chose de voyage vous touche profondément.',
      examples: ['Cadeaux d’anniversaire', 'Petits souvenirs rapportés de voyage', 'Offrir ce que l’autre aime, en s’en souvenant', 'Une petite douceur ou des fleurs'],
      toPartner: 'Vous choisissez vos cadeaux en pensant à votre partenaire et préparez avec soin anniversaires et fêtes.',
      needFrom: 'Des cadeaux qui prouvent qu’on pense à vous. Oublier ou négliger un cadeau peut beaucoup blesser.',
      tip: 'Pas besoin d’un cadeau coûteux. Offrez une petite chose en disant « Ça m’a fait penser à toi ».',
    },
    es: {
      title: 'Regalos',
      emoji: '🎁',
      description: 'Sientes y expresas el amor a través de los regalos. Más que su tamaño, importa el «se acordó de mí». Recordar un aniversario o traer algo pequeño de un viaje te llega como un gran gesto de amor.',
      examples: ['Regalos de aniversario', 'Detalles traídos de un viaje', 'Regalar lo que al otro le gusta, recordándolo', 'Un pequeño dulce o flores'],
      toPartner: 'Eliges regalos pensando en tu pareja y preparas con esmero cumpleaños y aniversarios.',
      needFrom: 'Regalos que demuestren que piensan en ti. Olvidar o despreciar un regalo puede herir mucho.',
      tip: 'No hace falta un regalo caro. Regala algo pequeño diciendo «Esto me hizo pensar en ti».',
    },
  },
  time: {
    ko: {
      title: '함께하는 시간',
      emoji: '⏰',
      description: '당신은 온전히 함께하는 시간을 통해 사랑을 느끼고 표현합니다. 핸드폰 없이, 다른 것에 신경 쓰지 않고 오로지 나에게 집중해주는 시간이 사랑입니다. 함께 있지만 각자 스마트폰만 보는 것은 상처가 됩니다.',
      examples: ['핸드폰 없이 대화하기', '함께 요리하기', '산책이나 드라이브', '취미를 함께 즐기기'],
      toPartner: '파트너와 함께하는 시간을 최우선으로 합니다. 온전한 주의와 집중을 나눕니다.',
      needFrom: '집중된 관심과 함께하는 시간. 함께 있으면서 딴짓하는 것이 큰 상처가 됩니다.',
      tip: '하루 30분이라도 핸드폰을 내려놓고 파트너에게만 집중하는 시간을 만들어보세요.',
    },
    en: {
      title: 'Quality Time',
      emoji: '⏰',
      description: 'You feel and express love through being fully present together. Love means time with no phones, no distractions — just focused attention on you. Being together but each staring at your phone feels hurtful.',
      examples: ['Talking without phones', 'Cooking together', 'Walking or driving together', 'Sharing a hobby'],
      toPartner: 'You prioritize time spent with your partner above all else. You share full attention and focus.',
      needFrom: 'Focused attention and shared time. Being together while distracted feels deeply hurtful.',
      tip: 'Even 30 minutes a day — put down your phone and give your partner your complete attention.',
    },
    ja: {
      title: '充実した時間',
      emoji: '⏰',
      description: '完全に一緒にいる時間を通じて愛を感じ、表現します。スマホなし、他のことを気にせず、ただ自分に集中してくれる時間が愛です。一緒にいながらそれぞれスマホを見ているのは傷つきます。',
      examples: ['スマホなしで話す', '一緒に料理する', '散歩やドライブ', '趣味を一緒に楽しむ'],
      toPartner: 'パートナーとの時間を最優先にします。完全な注意と集中を分かち合います。',
      needFrom: '集中した関心と共に過ごす時間。一緒にいながら他のことをすることが大きな傷になります。',
      tip: '1日30分でもスマホを置いて、パートナーだけに集中する時間を作りましょう。',
    },
    zh: {
      title: '精心的时刻',
      emoji: '⏰',
      description: '你通过全心全意的相处感受和表达爱。不看手机、心无旁骛，只专注于你的时间，就是爱。在一起却各自滑手机，会让你受伤。',
      examples: ['不看手机地聊天', '一起做饭', '散步或兜风', '一起享受兴趣爱好'],
      toPartner: '把和伴侣相处的时间放在第一位，分享完整的注意力与专注。',
      needFrom: '专注的关心与相处的时间。在一起时心不在焉，会造成很大的伤害。',
      tip: '哪怕每天 30 分钟，也放下手机，营造只专注于伴侣的时间吧。',
    },
    fr: {
      title: 'Moments de qualité',
      emoji: '⏰',
      description: 'Vous ressentez et exprimez l’amour par des moments passés vraiment ensemble. Un temps sans téléphone, où l’autre n’est concentré que sur vous : voilà l’amour. Être ensemble mais chacun sur son smartphone vous blesse.',
      examples: ['Discuter sans téléphone', 'Cuisiner ensemble', 'Se promener ou partir en voiture', 'Partager un loisir'],
      toPartner: 'Vous faites du temps à deux une priorité et offrez une attention pleine et entière.',
      needFrom: 'Une attention concentrée et du temps partagé. Être là sans être présent blesse profondément.',
      tip: 'Même 30 minutes par jour, posez le téléphone et consacrez-vous uniquement à votre partenaire.',
    },
    es: {
      title: 'Tiempo de calidad',
      emoji: '⏰',
      description: 'Sientes y expresas el amor pasando tiempo de verdad juntos. Un rato sin móvil, en el que el otro se centra solo en ti: eso es amor. Estar juntos pero cada uno con su móvil te hiere.',
      examples: ['Hablar sin móviles', 'Cocinar juntos', 'Pasear o salir en coche', 'Compartir una afición'],
      toPartner: 'Pones el tiempo en pareja en primer lugar y ofreces atención plena.',
      needFrom: 'Atención concentrada y tiempo compartido. Estar juntos pero distraído hiere mucho.',
      tip: 'Aunque sean 30 minutos al día, deja el móvil y dedícate solo a tu pareja.',
    },
  },
  touch: {
    ko: {
      title: '스킨십',
      emoji: '🤗',
      description: '당신은 신체적 접촉을 통해 사랑을 느끼고 표현합니다. 포옹, 손 잡기, 가벼운 터치가 안정감과 사랑을 줍니다. 신체적 거리감은 감정적 거리감으로 느껴질 수 있습니다.',
      examples: ['포옹과 입맞춤', '손 잡기', '어깨 두드리기', '함께 누워 이야기하기'],
      toPartner: '자연스럽게 신체적 애정을 표현합니다. 파트너를 안아주거나 손을 잡는 것으로 사랑을 전합니다.',
      needFrom: '신체적 따뜻함과 스킨십. 무관심이나 신체적 거리감이 감정적 상처가 됩니다.',
      tip: '하루에 한 번 이상 파트너를 안아주세요. 말보다 포옹이 더 많은 것을 전달할 때가 있습니다.',
    },
    en: {
      title: 'Physical Touch',
      emoji: '🤗',
      description: 'You feel and express love through physical contact. Hugs, holding hands, and gentle touches give you security and love. Physical distance can feel like emotional distance.',
      examples: ['Hugs and kisses', 'Holding hands', 'A pat on the shoulder', 'Lying together while talking'],
      toPartner: 'You naturally express physical affection. You convey love through hugging or holding hands.',
      needFrom: 'Physical warmth and touch. Indifference or physical distance causes emotional pain.',
      tip: 'Hug your partner at least once a day. Sometimes a hug conveys more than words ever could.',
    },
    ja: {
      title: '身体的接触',
      emoji: '🤗',
      description: '身体的な接触を通じて愛を感じ、表現します。ハグ、手を繋ぐこと、軽いタッチが安心感と愛を与えます。身体的な距離感は感情的な距離感として感じられることがあります。',
      examples: ['ハグとキス', '手を繋ぐ', '肩をたたく', '一緒に寝転んで話す'],
      toPartner: '自然に身体的な愛情を表現します。ハグや手を繋ぐことで愛情を伝えます。',
      needFrom: '身体的な温もりとスキンシップ。無関心や身体的距離感が感情的な傷になります。',
      tip: '1日1回以上パートナーをハグしましょう。時には言葉よりハグが多くを伝えることがあります。',
    },
    zh: {
      title: '身体的接触',
      emoji: '🤗',
      description: '你通过身体接触感受和表达爱。拥抱、牵手、轻轻的触碰给你安心感和爱。身体上的距离，可能让你感觉像情感上的距离。',
      examples: ['拥抱与亲吻', '牵手', '轻拍肩膀', '一起躺着聊天'],
      toPartner: '自然地表达身体上的亲密，用拥抱或牵手传达爱意。',
      needFrom: '身体的温暖与亲密接触。冷淡或身体上的距离会带来情感上的伤害。',
      tip: '每天至少拥抱伴侣一次。有时候，一个拥抱比言语传达得更多。',
    },
    fr: {
      title: 'Toucher physique',
      emoji: '🤗',
      description: 'Vous ressentez et exprimez l’amour par le contact physique. Câlins, mains qui se tiennent, gestes légers vous apportent sécurité et amour. Une distance physique peut être vécue comme une distance affective.',
      examples: ['Câlins et baisers', 'Se tenir la main', 'Une tape sur l’épaule', 'Parler allongés l’un près de l’autre'],
      toPartner: 'Vous exprimez naturellement votre affection physique : un câlin ou une main tenue transmettent votre amour.',
      needFrom: 'Chaleur physique et contact. L’indifférence ou la distance physique blessent affectivement.',
      tip: 'Prenez votre partenaire dans vos bras au moins une fois par jour. Parfois, un câlin en dit plus que des mots.',
    },
    es: {
      title: 'Contacto físico',
      emoji: '🤗',
      description: 'Sientes y expresas el amor a través del contacto físico. Los abrazos, ir de la mano o una caricia ligera te dan seguridad y cariño. La distancia física puede sentirse como distancia emocional.',
      examples: ['Abrazos y besos', 'Ir de la mano', 'Una palmadita en el hombro', 'Tumbarse juntos a charlar'],
      toPartner: 'Expresas con naturalidad el cariño físico: un abrazo o darle la mano transmiten tu amor.',
      needFrom: 'Calidez física y contacto. La indiferencia o la distancia física hieren emocionalmente.',
      tip: 'Abraza a tu pareja al menos una vez al día. A veces un abrazo dice más que las palabras.',
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
  const chartData = (Object.keys(result.scores) as Lang[]).map(k => ({
    name: lb.types[k],
    value: result.scores[k],
    fill: LANG_COLORS[k],
  })).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourPrimary}</p>
        <ResultSymbol id="love-language" variant={result.primary} fallback={r.emoji} className="mx-auto h-28 w-28" />
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: LANG_COLORS[result.primary] }}>{r.title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground text-center mb-3">{lb.chartTitle}</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" domain={[0, pairs.length]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <Tooltip formatter={((v: number) => `${v}점`) as any} />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
