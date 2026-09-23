import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire';
import ShareResultButton from '../shared/ShareResultButton'

type EatingLevel = 'low' | 'moderate' | 'high' | 'very_high'
type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

interface Question { id: string; text: string }
interface ResultData {
  icon: string
  title: string
  subtitle: string
  description: string
  strategies: string[]
  affirmation: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string
  share: string
  shareMsg: string
  yourLevel: string
  scoreLabel: string
  outOf: string
  strategies: string
  affirmation: string
  note: string
}> = {
  ko: {
    title: '감정적 식사 테스트',
    subtitle: '나는 감정 때문에 먹나?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 없다', '거의 없다', '가끔 있다', '자주 있다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 감정적 식사 경향은',
    yourLevel: '나의 감정적 식사 경향',
    scoreLabel: '점수',
    outOf: '/ 75점',
    strategies: '실천 전략',
    affirmation: '나에게 건네는 말',
    note: '이 결과는 자기 이해를 위한 참고 자료입니다. 이것은 의지력의 문제가 아닙니다. 자신을 판단하지 마세요.',
  },
  en: {
    title: 'Emotional Eating Test',
    subtitle: 'Do You Eat Your Feelings?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My emotional eating tendency is',
    yourLevel: 'Your Emotional Eating Profile',
    scoreLabel: 'Score',
    outOf: '/ 75',
    strategies: 'Practical Strategies',
    affirmation: 'A Note for You',
    note: 'This result is for self-awareness, not self-judgment. Emotional eating is not a willpower problem.',
  },
  ja: {
    title: '感情的食事テスト',
    subtitle: '感情で食べていますか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', 'たまにある', 'よくある', 'いつもそうだ'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の感情的食事傾向は',
    yourLevel: '感情的食事の傾向',
    scoreLabel: 'スコア',
    outOf: '/ 75点',
    strategies: '実践戦略',
    affirmation: 'あなたへのメッセージ',
    note: 'この結果は自己理解のための参考情報です。感情的食事は意志力の問題ではありません。',
  },
  zh: {
    title: '情绪化进食测验',
    subtitle: '我是因为情绪而吃吗？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['从未', '很少', '有时', '经常', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的情绪化进食倾向是',
    yourLevel: '我的情绪化进食倾向',
    scoreLabel: '分数',
    outOf: '/ 75 分',
    strategies: '实践策略',
    affirmation: '对自己说的话',
    note: '本结果是帮助认识自己的参考。这不是意志力的问题，请不要评判自己。',
  },
  fr: {
    title: 'Test de l’alimentation émotionnelle',
    subtitle: 'Est-ce que je mange à cause de mes émotions ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Ma tendance à l’alimentation émotionnelle',
    yourLevel: 'Ma tendance à l’alimentation émotionnelle',
    scoreLabel: 'Score',
    outOf: '/ 75 points',
    strategies: 'Stratégies concrètes',
    affirmation: 'Un mot pour moi',
    note: 'Ce résultat est un repère pour mieux vous connaître. Ce n’est pas une question de volonté : ne vous jugez pas.',
  },
  es: {
    title: 'Test de alimentación emocional',
    subtitle: '¿Como por mis emociones?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Casi nunca', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tendencia a la alimentación emocional',
    yourLevel: 'Mi tendencia a la alimentación emocional',
    scoreLabel: 'Puntuación',
    outOf: '/ 75 puntos',
    strategies: 'Estrategias prácticas',
    affirmation: 'Unas palabras para mí',
    note: 'Este resultado es una referencia para conocerte mejor. No es una cuestión de fuerza de voluntad: no te juzgues.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '기분이 우울하거나 슬플 때 음식을 먹고 싶어진다' },
    { id: 'q2', text: '스트레스를 받으면 평소보다 더 많이 먹는다' },
    { id: 'q3', text: '지루하거나 할 일이 없을 때 무언가를 먹는다' },
    { id: 'q4', text: '화가 났을 때 음식으로 감정을 달랜다' },
    { id: 'q5', text: '먹고 나면 기분이 좋아지다가 곧 죄책감을 느낀다' },
    { id: 'q6', text: '배고프지 않아도 눈앞에 음식이 있으면 먹게 된다' },
    { id: 'q7', text: '혼자 있을 때 더 많이 먹는 경향이 있다' },
    { id: 'q8', text: '걱정이나 불안이 있을 때 과식을 한다' },
    { id: 'q9', text: '특정 감정이 느껴질 때 특정 음식이 당긴다 (예: 달콤한 것, 짠 것)' },
    { id: 'q10', text: '먹는 것이 감정적 위안이 된다고 느낀다' },
    { id: 'q11', text: '피곤할 때 단것이나 자극적인 음식을 먹고 싶어진다' },
    { id: 'q12', text: '기분 좋을 때도 특별히 더 먹게 된다' },
    { id: 'q13', text: '다이어트를 시작했다가 감정적 이유로 포기한 경험이 있다' },
    { id: 'q14', text: '먹고 싶다는 생각이 실제 배고픔과 관련 없는 경우가 많다' },
    { id: 'q15', text: '감정적 식사 후 식사량이나 음식 선택에 죄책감을 느낀다' },
  ],
  en: [
    { id: 'q1', text: 'When I feel sad or down, I want to eat' },
    { id: 'q2', text: 'When stressed, I eat more than usual' },
    { id: 'q3', text: 'When bored or idle, I reach for food' },
    { id: 'q4', text: 'When angry, I soothe my feelings with food' },
    { id: 'q5', text: 'After eating, I feel better briefly then experience guilt' },
    { id: 'q6', text: 'If food is in front of me, I eat it even when not hungry' },
    { id: 'q7', text: 'I tend to eat more when I\'m alone' },
    { id: 'q8', text: 'I overeat when I feel worried or anxious' },
    { id: 'q9', text: 'Certain emotions make me crave specific foods (sweets, salty snacks, etc.)' },
    { id: 'q10', text: 'I feel that eating provides emotional comfort' },
    { id: 'q11', text: 'When tired, I want to eat something sweet or stimulating' },
    { id: 'q12', text: 'Even when in a good mood, I end up eating more' },
    { id: 'q13', text: 'I have quit a diet due to emotional reasons' },
    { id: 'q14', text: 'The urge to eat often has nothing to do with actual hunger' },
    { id: 'q15', text: 'After emotional eating, I feel guilty about what or how much I ate' },
  ],
  ja: [
    { id: 'q1', text: '気分が落ち込んだり悲しいとき食べたくなる' },
    { id: 'q2', text: 'ストレスを感じると普段より多く食べる' },
    { id: 'q3', text: '暇なときや何もすることがないとき何かを食べる' },
    { id: 'q4', text: '怒ったとき食べ物で気持ちを落ち着かせる' },
    { id: 'q5', text: '食べた後一時的に気分が良くなるがすぐに罪悪感を覚える' },
    { id: 'q6', text: 'お腹が空いていなくても目の前に食べ物があると食べてしまう' },
    { id: 'q7', text: '一人でいるとき食べ過ぎる傾向がある' },
    { id: 'q8', text: '心配や不安があるとき過食してしまう' },
    { id: 'q9', text: '特定の感情になると特定の食べ物（甘いもの、塩辛いものなど）が食べたくなる' },
    { id: 'q10', text: '食べることが感情的な慰めになると感じる' },
    { id: 'q11', text: '疲れているとき甘いものや刺激的な食べ物を食べたくなる' },
    { id: 'q12', text: '気分が良いときでも特別に食べ過ぎてしまう' },
    { id: 'q13', text: '感情的な理由でダイエットをやめた経験がある' },
    { id: 'q14', text: '食べたいという気持ちが実際の空腹と関係ないことが多い' },
    { id: 'q15', text: '感情的な食事の後、食べた量や食べ物の選択に罪悪感を感じる' },
  ],
  zh: [
    { id: 'q1', text: '心情低落或难过时，就想吃东西' },
    { id: 'q2', text: '有压力时，会比平常吃得多' },
    { id: 'q3', text: '无聊或没事做的时候，会吃点什么' },
    { id: 'q4', text: '生气时，会用食物安抚情绪' },
    { id: 'q5', text: '吃完心情会变好，但很快就感到内疚' },
    { id: 'q6', text: '就算不饿，只要食物在眼前就会吃' },
    { id: 'q7', text: '一个人的时候，往往吃得更多' },
    { id: 'q8', text: '担心或焦虑时会吃过量' },
    { id: 'q9', text: '出现某种情绪时，会特别想吃某种食物（例如甜的、咸的）' },
    { id: 'q10', text: '觉得吃东西能带来情绪上的安慰' },
    { id: 'q11', text: '累的时候，会想吃甜食或重口味的东西' },
    { id: 'q12', text: '心情好的时候，也会特别多吃' },
    { id: 'q13', text: '曾经开始节食，又因为情绪的原因放弃' },
    { id: 'q14', text: '想吃的念头，常常和真正的饥饿无关' },
    { id: 'q15', text: '情绪化进食后，会对吃的量或选择感到内疚' },
  ],
  fr: [
    { id: 'q1', text: 'Quand je me sens déprimé ou triste, j’ai envie de manger' },
    { id: 'q2', text: 'Quand je suis stressé, je mange plus que d’habitude' },
    { id: 'q3', text: 'Quand je m’ennuie ou n’ai rien à faire, je grignote' },
    { id: 'q4', text: 'Quand je suis en colère, je me calme avec la nourriture' },
    { id: 'q5', text: 'Après avoir mangé, je me sens mieux, puis vite coupable' },
    { id: 'q6', text: 'Même sans faim, je mange si la nourriture est devant moi' },
    { id: 'q7', text: 'J’ai tendance à manger davantage quand je suis seul' },
    { id: 'q8', text: 'Quand je suis inquiet ou anxieux, je mange trop' },
    { id: 'q9', text: 'Certaines émotions me donnent envie d’aliments précis (sucré, salé…)' },
    { id: 'q10', text: 'Je sens que manger me réconforte émotionnellement' },
    { id: 'q11', text: 'Quand je suis fatigué, j’ai envie de sucré ou de plats relevés' },
    { id: 'q12', text: 'Même de bonne humeur, je mange particulièrement plus' },
    { id: 'q13', text: 'J’ai déjà abandonné un régime pour des raisons émotionnelles' },
    { id: 'q14', text: 'Mon envie de manger n’a souvent rien à voir avec une vraie faim' },
    { id: 'q15', text: 'Après avoir mangé sous le coup de l’émotion, je culpabilise pour la quantité ou le choix des aliments' },
  ],
  es: [
    { id: 'q1', text: 'Cuando me siento bajo de ánimo o triste, me entran ganas de comer' },
    { id: 'q2', text: 'Cuando estoy estresado, como más de lo habitual' },
    { id: 'q3', text: 'Cuando me aburro o no tengo nada que hacer, pico algo' },
    { id: 'q4', text: 'Cuando me enfado, me calmo con la comida' },
    { id: 'q5', text: 'Después de comer me siento mejor, pero pronto me siento culpable' },
    { id: 'q6', text: 'Aunque no tenga hambre, si hay comida delante, como' },
    { id: 'q7', text: 'Tiendo a comer más cuando estoy solo' },
    { id: 'q8', text: 'Cuando estoy preocupado o ansioso, como en exceso' },
    { id: 'q9', text: 'Ciertas emociones me hacen desear alimentos concretos (dulce, salado…)' },
    { id: 'q10', text: 'Siento que comer me reconforta emocionalmente' },
    { id: 'q11', text: 'Cuando estoy cansado, me apetece dulce o comida fuerte' },
    { id: 'q12', text: 'Incluso de buen humor, como bastante más' },
    { id: 'q13', text: 'He dejado una dieta por motivos emocionales' },
    { id: 'q14', text: 'Mis ganas de comer a menudo no tienen que ver con hambre real' },
    { id: 'q15', text: 'Tras comer por emociones, me siento culpable por la cantidad o lo que elegí' },
  ],
}

const RESULTS: Record<EatingLevel, Record<SupportedLang, ResultData>> = {
  low: {
    ko: {
      icon: '💚',
      title: '낮음',
      subtitle: '음식과 감정이 비교적 분리되어 있습니다',
      description: '감정과 식욕을 잘 구별하고 있습니다. 대부분의 식사가 신체적 배고픔에 의해 이루어지고 있어, 음식과 건강한 관계를 유지하고 있습니다.',
      strategies: [
        '현재의 인식을 유지하는 연습 계속하기',
        '배고픔과 감정 신호를 구별하는 습관 강화',
        '스트레스 상황에서도 먹기 전 잠깐 멈추는 습관',
      ],
      affirmation: '음식과 감정을 잘 구별하는 것은 중요한 자기 인식입니다. 지금의 균형을 소중히 여기세요.',
    },
    en: {
      icon: '💚',
      title: 'Low',
      subtitle: 'Food and emotions are mostly separate for you',
      description: 'You distinguish well between hunger and emotion. Most of your eating is driven by physical need, reflecting a healthy relationship with food.',
      strategies: [
        'Keep up the habit of pausing before you eat',
        'Continue noticing the difference between hunger and emotion',
        'Practice this awareness especially in stressful moments',
      ],
      affirmation: 'Knowing the difference between hunger and feelings is a real skill. Keep nurturing that awareness.',
    },
    ja: {
      icon: '💚',
      title: '低い',
      subtitle: '食べ物と感情が比較的分離しています',
      description: '感情と食欲をうまく区別できています。ほとんどの食事が身体的な空腹によって行われており、食べ物と健全な関係を保っています。',
      strategies: [
        '現在の意識を維持する練習を続ける',
        '空腹と感情サインを区別する習慣を強化',
        'ストレス時でも食べる前に少し立ち止まる習慣を',
      ],
      affirmation: '食べ物と感情を区別することは重要な自己認識です。今のバランスを大切にしてください。',
    },
    zh: {
      icon: '💚',
      title: '低',
      subtitle: '食物和情绪相对分得开',
      description: '你能很好地区分情绪与食欲。大多数进食是由身体的饥饿驱动的，与食物保持着健康的关系。',
      strategies: [
        '继续练习保持现在的觉察',
        '强化区分饥饿与情绪信号的习惯',
        '在有压力时，也养成吃之前先停一下的习惯',
      ],
      affirmation: '能分清食物和情绪，是重要的自我觉察。好好珍惜现在的平衡。',
    },
    fr: {
      icon: '💚',
      title: 'Faible',
      subtitle: 'Nourriture et émotions restent assez séparées',
      description: 'Vous distinguez bien émotions et appétit. La plupart de vos repas répondent à une faim physique : votre relation à la nourriture est saine.',
      strategies: [
        'Continuer à entretenir cette conscience',
        'Renforcer l’habitude de distinguer faim et signaux émotionnels',
        'Garder, même sous stress, l’habitude de marquer une pause avant de manger',
      ],
      affirmation: 'Bien distinguer nourriture et émotions est une vraie connaissance de soi. Prenez soin de cet équilibre.',
    },
    es: {
      icon: '💚',
      title: 'Bajo',
      subtitle: 'La comida y las emociones van bastante por separado',
      description: 'Distingues bien las emociones del apetito. La mayoría de tus comidas responden al hambre física: tienes una relación sana con la comida.',
      strategies: [
        'Seguir practicando esta conciencia',
        'Reforzar el hábito de distinguir el hambre de las señales emocionales',
        'Mantener, incluso con estrés, el hábito de parar un momento antes de comer',
      ],
      affirmation: 'Distinguir bien comida y emociones es un gran autoconocimiento. Cuida este equilibrio.',
    },
  },
  moderate: {
    ko: {
      icon: '💛',
      title: '보통',
      subtitle: '가끔 감정적 식사가 있지만 관리 가능한 수준',
      description: '특정 감정 상태에서 식사가 영향을 받는 경우가 있지만, 전반적으로 조절이 가능한 수준입니다. 조금 더 인식을 높이면 음식과 더 건강한 관계를 만들 수 있습니다.',
      strategies: [
        '먹기 전 "배고픈가, 아니면 감정이 배고픈가?" 잠깐 물어보기',
        '감정 일지 쓰기로 패턴 파악하기',
        '간단한 대안 활동 목록 만들기 (5분 산책, 물 한 잔 등)',
      ],
      affirmation: '가끔 감정으로 먹는 것은 누구에게나 있습니다. 인식하는 것 자체가 첫 번째 변화입니다.',
    },
    en: {
      icon: '💛',
      title: 'Moderate',
      subtitle: 'Occasional emotional eating, manageable',
      description: 'Emotions sometimes influence your eating, but overall you manage it well. A bit more awareness can help you build an even healthier relationship with food.',
      strategies: [
        'Ask yourself before eating: "Am I physically hungry, or emotionally hungry?"',
        'Keep a brief emotion journal to spot patterns',
        'Build a short list of quick alternatives (5-min walk, a glass of water)',
      ],
      affirmation: 'Occasionally eating for comfort is universal. Noticing it is already the first step toward change.',
    },
    ja: {
      icon: '💛',
      title: '普通',
      subtitle: '時々感情的な食事があるが管理可能なレベル',
      description: '特定の感情状態で食事が影響を受けることがありますが、全体的に管理可能なレベルです。少し意識を高めると、食べ物とより健康的な関係を築けます。',
      strategies: [
        '食べる前に「本当にお腹が空いているのか、感情がお腹が空いているのか」問いかける',
        '感情日記で食べたくなるパターンを把握する',
        '短い代替行動リストを作る（5分散歩、水を一杯など）',
      ],
      affirmation: '感情で食べることは誰にでもあります。気づくこと自体が最初の変化です。',
    },
    zh: {
      icon: '💛',
      title: '中等',
      subtitle: '偶尔情绪化进食，但在可控范围',
      description: '在某些情绪状态下，进食会受到影响，但整体上还能调节。再多一点觉察，就能和食物建立更健康的关系。',
      strategies: [
        '吃之前停一下问自己：“是肚子饿，还是情绪饿？”',
        '写情绪日记，找出自己的模式',
        '列一张简单的替代活动清单（散步 5 分钟、喝一杯水等）',
      ],
      affirmation: '偶尔因为情绪而吃，谁都会有。能察觉到，就是第一个改变。',
    },
    fr: {
      icon: '💛',
      title: 'Modéré',
      subtitle: 'Alimentation émotionnelle occasionnelle, mais gérable',
      description: 'Certains états émotionnels influencent vos repas, mais dans l’ensemble vous gardez le contrôle. Avec un peu plus de conscience, votre relation à la nourriture peut devenir encore plus saine.',
      strategies: [
        'Avant de manger, se demander un instant : « Ai-je faim, ou est-ce mon émotion qui a faim ? »',
        'Tenir un journal des émotions pour repérer ses schémas',
        'Préparer une liste d’alternatives simples (5 minutes de marche, un verre d’eau…)',
      ],
      affirmation: 'Tout le monde mange parfois sous le coup de l’émotion. S’en rendre compte, c’est déjà le premier changement.',
    },
    es: {
      icon: '💛',
      title: 'Moderado',
      subtitle: 'A veces comes por emociones, pero es manejable',
      description: 'En ciertos estados emocionales tu forma de comer cambia, pero en general la controlas. Con un poco más de conciencia puedes construir una relación aún más sana con la comida.',
      strategies: [
        'Antes de comer, pregúntate un momento: «¿Tengo hambre o es la emoción la que tiene hambre?»',
        'Llevar un diario de emociones para detectar patrones',
        'Hacer una lista de alternativas sencillas (caminar 5 minutos, un vaso de agua…)',
      ],
      affirmation: 'A todo el mundo le pasa comer por emociones de vez en cuando. Darse cuenta ya es el primer cambio.',
    },
  },
  high: {
    ko: {
      icon: '🧡',
      title: '높음',
      subtitle: '감정이 식사 선택에 상당한 영향을 미칩니다',
      description: '감정 상태가 식사 행동에 자주 영향을 줍니다. 음식이 주요한 감정 조절 도구가 되어 있을 수 있습니다. 이것은 의지력의 문제가 아니라, 다른 감정 해소 루틴을 만들 기회입니다.',
      strategies: [
        '음식 외의 감정 해소 루틴 만들기 (산책, 음악, 친구 통화)',
        '배고픔과 감정 신호를 구별하는 연습: 식사 전 10분 기다려보기',
        '집에 자극적인 음식 줄이기 — 없으면 먹기 어렵습니다',
      ],
      affirmation: '감정을 음식으로 위로하는 것은 스스로를 돌보려는 시도입니다. 더 나은 방법을 찾아가는 과정 중에 있습니다.',
    },
    en: {
      icon: '🧡',
      title: 'High',
      subtitle: 'Emotions significantly influence your eating choices',
      description: 'Your emotional state frequently shapes what and how much you eat. Food may be serving as a primary emotion regulation tool. This is not a willpower failure — it\'s an invitation to build other soothing routines.',
      strategies: [
        'Create non-food emotional outlets: a walk, music, calling a friend',
        'Practice distinguishing hunger from emotion: try waiting 10 minutes before eating',
        'Reduce high-trigger foods at home — what isn\'t there can\'t be reached for',
      ],
      affirmation: 'Comforting yourself with food is an attempt at self-care. You are in the process of finding better ways.',
    },
    ja: {
      icon: '🧡',
      title: '高い',
      subtitle: '感情が食事の選択にかなりの影響を与えています',
      description: '感情状態が食事行動に頻繁に影響しています。食べ物が主要な感情調整ツールになっている可能性があります。これは意志力の問題ではなく、他の感情解消ルーティンを作るチャンスです。',
      strategies: [
        '食べ物以外の感情解消ルーティンを作る（散歩、音楽、友人への電話）',
        '空腹と感情サインを区別する練習：食事前に10分待ってみる',
        '自宅の食欲を刺激する食べ物を減らす — なければ手が届かない',
      ],
      affirmation: '感情を食べ物で癒すのは自分を大切にしようとする試みです。より良い方法を見つける過程にいます。',
    },
    zh: {
      icon: '🧡',
      title: '高',
      subtitle: '情绪对进食选择影响相当大',
      description: '情绪状态经常影响你的进食行为。食物可能已经成了主要的情绪调节工具。这不是意志力的问题，而是建立其他情绪纾解习惯的机会。',
      strategies: [
        '建立食物以外的情绪纾解习惯（散步、音乐、给朋友打电话）',
        '练习分辨饥饿与情绪信号：吃之前先等 10 分钟',
        '家里少放重口味的零食——没有就不容易吃',
      ],
      affirmation: '用食物安慰情绪，是想照顾自己的一种尝试。你正在寻找更好方法的路上。',
    },
    fr: {
      icon: '🧡',
      title: 'Élevé',
      subtitle: 'Les émotions influencent nettement vos choix alimentaires',
      description: 'Vos émotions influencent souvent votre façon de manger. La nourriture est peut-être devenue votre principal outil pour réguler vos émotions. Ce n’est pas une question de volonté, mais l’occasion de créer d’autres routines d’apaisement.',
      strategies: [
        'Créer des routines d’apaisement hors nourriture (marche, musique, appel à un ami)',
        'S’entraîner à distinguer faim et émotion : attendre 10 minutes avant de manger',
        'Avoir moins d’aliments tentants à la maison : sans eux, on en mange moins',
      ],
      affirmation: 'Se consoler par la nourriture, c’est une tentative de prendre soin de soi. Vous êtes en chemin vers de meilleures façons de le faire.',
    },
    es: {
      icon: '🧡',
      title: 'Alto',
      subtitle: 'Las emociones influyen bastante en lo que eliges comer',
      description: 'Tu estado emocional influye a menudo en cómo comes. Puede que la comida se haya convertido en tu principal herramienta para regular emociones. No es cuestión de fuerza de voluntad, sino una oportunidad para crear otras rutinas de alivio.',
      strategies: [
        'Crear rutinas de alivio que no sean comida (pasear, música, llamar a un amigo)',
        'Practicar a distinguir hambre y emoción: esperar 10 minutos antes de comer',
        'Tener menos comida tentadora en casa: si no está, cuesta más comerla',
      ],
      affirmation: 'Consolarse con la comida es un intento de cuidarse. Estás en el camino de encontrar mejores formas.',
    },
  },
  very_high: {
    ko: {
      icon: '❤️',
      title: '매우 높음',
      subtitle: '감정적 식사가 일상에 큰 영향을 미치고 있습니다',
      description: '감정적 식사가 일상적인 패턴이 되어 있습니다. 이 패턴은 혼자 바꾸기 어려울 수 있습니다. 전문가의 도움을 받는 것이 효과적이며, 자신을 탓하지 않는 것이 중요합니다. 당신은 잘못된 것이 아닙니다.',
      strategies: [
        '영양사나 심리상담사와 함께 작업하는 것을 고려하세요',
        '하루 한 끼, 먹기 전 배고픔 수준을 1–10으로 확인해보기',
        '자신을 판단하는 내면의 목소리를 알아차리고 부드럽게 바꿔보기',
      ],
      affirmation: '이것은 의지력의 문제가 아닙니다. 음식으로 자신을 달래는 것은 고통에 대한 자연스러운 반응입니다. 당신은 더 많은 도움을 받을 자격이 있습니다.',
    },
    en: {
      icon: '❤️',
      title: 'Very High',
      subtitle: 'Emotional eating is significantly affecting your daily life',
      description: 'Emotional eating has become a daily pattern for you. This can be hard to change alone. Working with a professional — a dietitian or therapist — is effective, and not blaming yourself is essential. There is nothing wrong with you.',
      strategies: [
        'Consider working with a dietitian or therapist who specializes in this area',
        'Once a day, check your hunger level (1–10) before eating',
        'Notice the self-critical inner voice and gently soften it',
      ],
      affirmation: 'This is not a willpower problem. Soothing yourself with food is a natural response to pain. You deserve more support.',
    },
    ja: {
      icon: '❤️',
      title: '非常に高い',
      subtitle: '感情的な食事が日常に大きな影響を与えています',
      description: '感情的な食事が日常的なパターンになっています。このパターンは一人で変えるのが難しい場合があります。専門家のサポートを受けることが効果的で、自分を責めないことが重要です。あなたは間違っていません。',
      strategies: [
        '栄養士や心理カウンセラーとのセッションを検討してください',
        '1日1食、食べる前に空腹レベルを1–10で確認する',
        '自分を批判する内なる声に気づき、穏やかに変えてみる',
      ],
      affirmation: 'これは意志力の問題ではありません。食べ物で自分を慰めることは痛みへの自然な反応です。あなたはより多くのサポートを受ける価値があります。',
    },
    zh: {
      icon: '❤️',
      title: '非常高',
      subtitle: '情绪化进食对日常生活影响很大',
      description: '情绪化进食已经成了日常模式。这种模式可能很难独自改变。寻求专业人士的帮助会很有效，而且重要的是不要责怪自己。你没有做错什么。',
      strategies: [
        '考虑和营养师或心理咨询师一起努力',
        '每天选一餐，吃之前用 1–10 分确认饥饿程度',
        '察觉内心评判自己的声音，并温柔地换个说法',
      ],
      affirmation: '这不是意志力的问题。用食物安抚自己，是对痛苦的自然反应。你值得得到更多帮助。',
    },
    fr: {
      icon: '❤️',
      title: 'Très élevé',
      subtitle: 'L’alimentation émotionnelle pèse fortement sur votre quotidien',
      description: 'Manger sous le coup de l’émotion est devenu un schéma habituel. Il peut être difficile de le changer seul. L’aide d’un professionnel est efficace, et il est important de ne pas vous blâmer. Il n’y a rien de « mauvais » en vous.',
      strategies: [
        'Envisager de travailler avec un diététicien ou un psychologue',
        'Une fois par jour, avant un repas, évaluer sa faim de 1 à 10',
        'Repérer la voix intérieure qui vous juge et la reformuler avec douceur',
      ],
      affirmation: 'Ce n’est pas une question de volonté. Se réconforter par la nourriture est une réaction naturelle à la souffrance. Vous méritez davantage de soutien.',
    },
    es: {
      icon: '❤️',
      title: 'Muy alto',
      subtitle: 'La alimentación emocional pesa mucho en tu día a día',
      description: 'Comer por emociones se ha vuelto un patrón habitual. Puede ser difícil cambiarlo a solas. La ayuda profesional es eficaz, y es importante no culparte. No hay nada malo en ti.',
      strategies: [
        'Plantéate trabajar con un dietista-nutricionista o un psicólogo',
        'Una comida al día, antes de comer, valora tu hambre del 1 al 10',
        'Detecta la voz interior que te juzga y cámbiala con suavidad',
      ],
      affirmation: 'No es una cuestión de fuerza de voluntad. Consolarse con la comida es una reacción natural al sufrimiento. Mereces más apoyo.',
    },
  },
}

const LEVEL_COLORS: Record<EatingLevel, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  very_high: '#ef4444',
}

function scoreToLevel(score: number): EatingLevel {
  if (score <= 30) return 'low'
  if (score <= 45) return 'moderate'
  if (score <= 60) return 'high'
  return 'very_high'
}

interface Props { locale?: string }

export default function EmotionalEatingTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: EatingLevel; score: number } | null>(null)
  useRecordFinishedTest({ testId: "emotional-eating", title: "EmotionalEatingTest", finished: Boolean(result) });

  function calcResult(ans: number[]): { level: EatingLevel; score: number } {
    const score = ans.reduce((s, v) => s + (v + 1), 0)
    return { level: scoreToLevel(score), score }
  }

  function pick(val: number) {
    const newAns = [...answers, val]
    if (current + 1 >= questions.length) setResult(calcResult(newAns))
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result.level][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= questions.length
  const progress = Math.round((current / questions.length) * 100)

  if (!finished) {
    const q = questions[current]
    return (
      <ScreeningQuestionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, value) => ({ label, value, indicator: value + 1 }))}
        screeningNote={lb.note}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.level][locale]
  const color = LEVEL_COLORS[result.level]
  const maxScore = 75
  const pct = Math.round((result.score / maxScore) * 100)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourLevel}</p>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {r.icon} {r.title}
        </div>
        <p className="font-bold text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color }}>{result.score} {lb.outOf}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={lb.scoreLabel}
          className="h-3 rounded-full bg-muted overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>15</span>
          <span>30</span>
          <span>45</span>
          <span>60</span>
          <span>75</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-600">{lb.strategies}</h3>
        <ul className="space-y-2">
          {r.strategies.map(s => (
            <li key={s} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
              <span className="text-green-500 mt-0.5 flex-none">→</span>{s}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{ borderColor: color + '40', backgroundColor: color + '0d' }}
      >
        <h3 className="font-bold text-sm" style={{ color }}>{lb.affirmation}</h3>
        <p className="text-sm leading-relaxed" style={{ color }}>{r.affirmation}</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <div className="flex gap-3">
        <button
          onClick={restart}
          className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors"
          aria-label={lb.restart}
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
          aria-label={lb.share}
        >
          {lb.share}
        </button>
      </div>
      <ShareResultButton locale={locale} heading={lb.title} resultTitle={r.title} emoji={r.icon} />
    </div>
  )
}
