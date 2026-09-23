import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ChildLevel = 'nurtured' | 'aware' | 'wounded' | 'frozen'
type Subscale = 'neglect' | 'adaptation'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
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
  yourScore: string; overallLabel: string; neglectLabel: string; adaptationLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '내면아이 테스트',
    subtitle: '내 안의 어린 나는 어떤 마음일까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 내면아이 지수는',
    yourScore: '나의 내면아이 지수',
    overallLabel: '종합 내면아이 지수',
    neglectLabel: '정서적 결핍',
    adaptationLabel: '과잉적응·순응',
    outOf: '/ 5.0',
    tipsLabel: '내면아이를 위한 팁',
    note: '내면아이(inner child) 개념에서 영감을 받은 자가성찰용 테스트입니다. 전문적 심리치료나 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Inner Child Test',
    subtitle: 'How does the little one inside you feel?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My inner child score is',
    yourScore: 'Your Inner Child Score',
    overallLabel: 'Overall Inner Child Score',
    neglectLabel: 'Emotional Unmet Needs',
    adaptationLabel: 'Over-Adaptation',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Inner Child',
    note: 'This self-reflection test is inspired by the inner child concept. It does not replace professional therapy or assessment.',
  },
  ja: {
    title: 'インナーチャイルドテスト',
    subtitle: '心の中の幼い自分はどんな気持ち？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のインナーチャイルド度は',
    yourScore: 'あなたのインナーチャイルド度',
    overallLabel: '総合インナーチャイルド度',
    neglectLabel: '情緒的欠乏',
    adaptationLabel: '過剰適応・順応',
    outOf: '/ 5.0',
    tipsLabel: 'インナーチャイルドへのヒント',
    note: 'このテストはインナーチャイルドの概念に着想を得た自己省察用です。専門的な心理療法や診断の代替ではありません。',
  },
  zh: {
    title: '内在小孩测验',
    subtitle: '我心里那个小小的我，现在是什么心情？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '偶尔如此', '经常如此', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的内在小孩指数是',
    yourScore: '我的内在小孩指数',
    overallLabel: '综合内在小孩指数',
    neglectLabel: '情感上的匮乏',
    adaptationLabel: '过度适应与顺从',
    outOf: '/ 5.0',
    tipsLabel: '给内在小孩的建议',
    note: '本测验受内在小孩（inner child）概念启发，用于自我省思，不能替代专业的心理治疗或诊断。',
  },
  fr: {
    title: 'Test de l’enfant intérieur',
    subtitle: 'Comment va l’enfant que je porte en moi ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon indice d’enfant intérieur',
    yourScore: 'Votre indice d’enfant intérieur',
    overallLabel: 'Indice global',
    neglectLabel: 'Manque affectif',
    adaptationLabel: 'Suradaptation et conformité',
    outOf: '/ 5.0',
    tipsLabel: 'Conseils pour l’enfant intérieur',
    note: 'Ce test s’inspire de la notion d’enfant intérieur, à des fins de réflexion personnelle. Il ne remplace ni une psychothérapie ni un diagnostic.',
  },
  es: {
    title: 'Test del niño interior',
    subtitle: '¿Cómo está el niño que llevo dentro?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi índice de niño interior',
    yourScore: 'Tu índice de niño interior',
    overallLabel: 'Índice global',
    neglectLabel: 'Carencia afectiva',
    adaptationLabel: 'Sobreadaptación y complacencia',
    outOf: '/ 5.0',
    tipsLabel: 'Consejos para el niño interior',
    note: 'Este test se inspira en la noción de niño interior, para la reflexión personal. No sustituye una psicoterapia ni un diagnóstico.',
  },
}

const LEVEL_DATA: Record<ChildLevel, Record<SupportedLang, LevelData>> = {
  nurtured: {
    ko: {
      icon: '🌷',
      title: '보살핌받은 내면아이',
      description: '내면아이가 비교적 안정되고 충분히 보살핌받았다고 느낍니다. 자기 감정과 욕구를 건강하게 다룹니다.',
      tips: [
        '지금의 안정감을 만든 자기돌봄 습관을 이어가세요.',
        '가끔 올라오는 어린 시절의 감정도 따뜻하게 안아주세요.',
        '내면의 충만함을 창의성과 관계에 나누어 보세요.',
      ],
    },
    en: {
      icon: '🌷',
      title: 'Nurtured Inner Child',
      description: 'Your inner child feels relatively secure and well cared for. You handle your own emotions and needs in a healthy way.',
      tips: [
        'Keep up the self-care habits that created this stability.',
        'Warmly embrace the childhood feelings that occasionally arise.',
        'Share your inner fullness through creativity and relationships.',
      ],
    },
    ja: {
      icon: '🌷',
      title: '大切にされたインナーチャイルド',
      description: 'インナーチャイルドが比較的安定し、十分に大切にされたと感じています。自分の感情や欲求を健康的に扱えます。',
      tips: [
        '今の安定感を作ったセルフケア習慣を続けましょう。',
        '時々湧く子供時代の感情も温かく抱きしめましょう。',
        '内面の充足を創造性や人間関係に分かち合いましょう。',
      ],
    },
    zh: {
      icon: '🌷',
      title: '被好好照顾的内在小孩',
      description: '你的内在小孩比较安稳，也感觉被照顾得够。你对自己的情绪和需要，处理得健康。',
      tips: [
        '把带来这份安稳的自我照顾习惯继续做下去。',
        '偶尔冒出来的童年情绪，也温柔地抱一抱。',
        '把心里的丰盛，分到创作和关系里。',
      ],
    },
    fr: {
      icon: '🌷',
      title: 'Un enfant intérieur bien entouré',
      description: 'Votre enfant intérieur est plutôt apaisé et se sent suffisamment entouré. Vous traitez vos émotions et vos besoins de façon saine.',
      tips: [
        'Poursuivez les gestes de soin qui ont construit cette assise.',
        'Quand une émotion d’enfance remonte, accueillez-la avec douceur.',
        'Partagez cette plénitude dans la création et dans vos liens.',
      ],
    },
    es: {
      icon: '🌷',
      title: 'Un niño interior bien cuidado',
      description: 'Tu niño interior está bastante tranquilo y se siente suficientemente cuidado. Manejas tus emociones y tus necesidades de forma sana.',
      tips: [
        'Sigue con los cuidados que construyeron esa base.',
        'Cuando suba una emoción de la infancia, acógela con suavidad.',
        'Reparte esa plenitud en la creación y en tus vínculos.',
      ],
    },
  },
  aware: {
    ko: {
      icon: '🌿',
      title: '인식하는 내면아이',
      description: '내면아이의 상처를 어느 정도 인식하고 있습니다. 가끔 옛 감정이 올라오지만, 돌볼 준비가 되어 있는 단계입니다.',
      tips: [
        '감정이 격해질 때 "지금 몇 살의 내가 반응하나" 물어보세요.',
        '어린 나에게 건네고 싶은 말을 편지로 적어 보세요.',
        '나의 욕구를 작은 것부터 솔직히 표현하는 연습을 하세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Aware Inner Child',
      description: 'You are somewhat aware of your inner child\'s wounds. Old feelings arise sometimes, but you are ready to tend to them.',
      tips: [
        'When emotions flare, ask "how old is the me that is reacting right now?"',
        'Write a letter with the words you want to give your younger self.',
        'Practice honestly expressing your needs, starting small.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '気づいているインナーチャイルド',
      description: 'インナーチャイルドの傷をある程度認識しています。時々昔の感情が湧きますが、ケアする準備ができている段階です。',
      tips: [
        '感情が高ぶる時「今、何歳の自分が反応しているか」と問いましょう。',
        '幼い自分に伝えたい言葉を手紙に書いてみましょう。',
        '自分の欲求を小さなことから正直に表現する練習をしましょう。',
      ],
    },
    zh: {
      icon: '🌿',
      title: '开始看见的内在小孩',
      description: '你对内在小孩的伤，已经有一定的觉察。旧的情绪偶尔会冒上来，但你已经准备好去照顾它了。',
      tips: [
        '情绪很激动时，问一句「现在反应的，是几岁的我」。',
        '把想对小时候的自己说的话，写成一封信。',
        '从小的地方开始，练习把自己的需要老实说出来。',
      ],
    },
    fr: {
      icon: '🌿',
      title: 'Un enfant intérieur reconnu',
      description: 'Vous percevez en partie les blessures de votre enfant intérieur. D’anciennes émotions remontent parfois, et vous êtes prêt à en prendre soin.',
      tips: [
        'Quand l’émotion s’emballe, demandez-vous : « quel âge a celui qui réagit ? »',
        'Écrivez une lettre à l’enfant que vous étiez.',
        'Entraînez-vous à dire vos besoins, en commençant par de petites choses.',
      ],
    },
    es: {
      icon: '🌿',
      title: 'Un niño interior reconocido',
      description: 'Percibes en parte las heridas de tu niño interior. A veces suben emociones antiguas, y estás listo para cuidarlas.',
      tips: [
        'Cuando la emoción se dispare, pregúntate: «¿qué edad tiene quien reacciona?».',
        'Escríbele una carta al niño que fuiste.',
        'Practica decir lo que necesitas, empezando por cosas pequeñas.',
      ],
    },
  },
  wounded: {
    ko: {
      icon: '🩹',
      title: '상처받은 내면아이',
      description: '정서적 결핍이나 과잉적응의 흔적이 뚜렷합니다. 사랑받기 위해 애쓰거나 자신을 뒤로 미루는 패턴이 반복될 수 있습니다.',
      tips: [
        '남을 위한 양보 뒤에 미뤄둔 내 욕구를 한 가지 챙기세요.',
        '"착해야 사랑받는다"는 믿음을 부드럽게 의심해 보세요.',
        '나를 안전하게 돌봐줄 관계나 루틴을 만들어 가세요.',
      ],
    },
    en: {
      icon: '🩹',
      title: 'Wounded Inner Child',
      description: 'Traces of emotional unmet needs or over-adaptation are clear. Patterns of striving to be loved or putting yourself last may repeat.',
      tips: [
        'Tend to one of your own needs that you set aside to accommodate others.',
        'Gently question the belief that "I am loved only if I am good."',
        'Build relationships or routines that care for you safely.',
      ],
    },
    ja: {
      icon: '🩹',
      title: '傷ついたインナーチャイルド',
      description: '情緒的欠乏や過剰適応の跡がはっきりしています。愛されるために頑張ったり自分を後回しにするパターンが繰り返される可能性があります。',
      tips: [
        '他人への譲歩の後に後回しにした自分の欲求を一つ大切にしましょう。',
        '「良い子でいれば愛される」という信念を優しく疑ってみましょう。',
        '自分を安全にケアしてくれる関係やルーティンを作りましょう。',
      ],
    },
    zh: {
      icon: '🩹',
      title: '受了伤的内在小孩',
      description: '情感上的匮乏，或是过度迁就的痕迹很明显。为了被爱而拼命，或把自己往后放的模式，可能一再重复。',
      tips: [
        '在让给别人之后，挑一件自己被搁下的需要，去照顾它。',
        '轻轻地怀疑一下「乖才会被爱」这个信念。',
        '慢慢建起能安全照顾你的关系或日常的节奏。',
      ],
    },
    fr: {
      icon: '🩹',
      title: 'Un enfant intérieur blessé',
      description: 'Les traces d’un manque affectif ou d’une suradaptation sont nettes. Le schéma de se démener pour être aimé, ou de se mettre en dernier, peut se répéter.',
      tips: [
        'Après avoir cédé aux autres, choisissez un besoin à vous et prenez-en soin.',
        'Mettez doucement en doute la croyance « il faut être sage pour être aimé ».',
        'Construisez peu à peu des relations et des routines qui vous entourent en sécurité.',
      ],
    },
    es: {
      icon: '🩹',
      title: 'Un niño interior herido',
      description: 'Las huellas de una carencia afectiva o de una sobreadaptación son claras. El patrón de esforzarte para que te quieran, o de ponerte el último, puede repetirse.',
      tips: [
        'Después de ceder a otros, elige una necesidad tuya y atiéndela.',
        'Pon suavemente en duda la creencia «hay que ser bueno para que te quieran».',
        'Construye poco a poco vínculos y rutinas que te cuiden con seguridad.',
      ],
    },
  },
  frozen: {
    ko: {
      icon: '❄️',
      title: '얼어붙은 내면아이',
      description: '깊은 정서적 결핍이 오래 억눌려 있을 가능성이 높습니다. 공허감·외로움이 자주 올라오고, 자기 감정과 단절돼 있을 수 있습니다.',
      tips: [
        '감정을 느끼는 것 자체를 천천히 허락하는 연습부터 시작하세요.',
        '나를 비난하는 내면의 목소리와 거리를 두어 보세요.',
        '혼자 마주하기 버겁다면 상담 등 안전한 도움을 찾으세요.',
      ],
    },
    en: {
      icon: '❄️',
      title: 'Frozen Inner Child',
      description: 'Deep emotional unmet needs have likely been suppressed for a long time. Emptiness and loneliness arise often, and you may feel cut off from your feelings.',
      tips: [
        'Start by slowly allowing yourself to simply feel emotions.',
        'Create distance from the inner voice that criticizes you.',
        'If facing it alone feels too heavy, seek safe help such as counseling.',
      ],
    },
    ja: {
      icon: '❄️',
      title: '凍りついたインナーチャイルド',
      description: '深い情緒的欠乏が長く抑え込まれている可能性が高いです。空虚感・孤独がよく湧き、自分の感情と断絶しているかもしれません。',
      tips: [
        '感情を感じること自体をゆっくり許す練習から始めましょう。',
        '自分を責める内面の声と距離を取ってみましょう。',
        '一人で向き合うのが重いならカウンセリングなど安全な助けを探しましょう。',
      ],
    },
    zh: {
      icon: '❄️',
      title: '冻住的内在小孩',
      description: '很可能有很深的情感匮乏被压了很久。空落落和孤单常常冒上来，你也可能和自己的情绪断了线。',
      tips: [
        '先从「允许自己去感觉」开始，慢慢练。',
        '和那个在心里责备你的声音，拉开一点距离。',
        '一个人面对太吃力时，找咨询这样安全的帮助。',
      ],
    },
    fr: {
      icon: '❄️',
      title: 'Un enfant intérieur figé',
      description: 'Un manque affectif profond est probablement refoulé depuis longtemps. Le vide et la solitude remontent souvent, et vous pouvez être coupé de vos propres émotions.',
      tips: [
        'Commencez par vous autoriser lentement à ressentir.',
        'Prenez de la distance avec la voix intérieure qui vous accuse.',
        'Si c’est trop lourd à porter seul, cherchez une aide sûre, un accompagnement par exemple.',
      ],
    },
    es: {
      icon: '❄️',
      title: 'Un niño interior congelado',
      description: 'Probablemente hay una carencia afectiva honda reprimida desde hace mucho. El vacío y la soledad suben a menudo, y puedes estar desconectado de lo que sientes.',
      tips: [
        'Empieza por permitirte sentir, despacio.',
        'Toma distancia de la voz interior que te acusa.',
        'Si pesa demasiado a solas, busca ayuda segura, como un acompañamiento.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: '어린 시절 내 감정이 충분히 받아들여지지 못했다고 느낀다' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: '힘들 때 마음 놓고 기댈 곳이 없다고 느낄 때가 많다' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: '사랑받기 위해서는 무언가를 잘해야 한다고 느낀다' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: '마음 깊은 곳에 채워지지 않는 외로움이 있다' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: '칭찬이나 애정을 받아도 잘 믿기지 않는다' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: '버려지거나 거절당할까 봐 두려울 때가 있다' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: '내 감정이나 욕구를 표현하는 것이 어색하거나 불편하다' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: '다른 사람의 기분을 살피느라 내 마음을 뒤로 미룬다' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: '갈등을 피하려고 내 의견을 자주 접는다' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: '"착한 사람"이어야 한다는 압박을 느낀다' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: '남에게 폐를 끼치는 것이 지나치게 불편하다' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: '거절을 잘 못하고 무리해서 맞춰주는 편이다' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: '내가 원하는 것보다 남이 기대하는 것을 먼저 한다' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: '혼자 있을 때 공허하거나 불안할 때가 있다' },
  ],
  en: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: 'I feel my emotions were not fully accepted in childhood' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: 'I often feel I have no one to truly lean on when things are hard' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: 'I feel I have to do something well in order to be loved' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: 'There is an unfilled loneliness deep inside me' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: 'Even when I receive praise or affection, I find it hard to believe' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: 'I sometimes fear being abandoned or rejected' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: 'Expressing my feelings or needs feels awkward or uncomfortable' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: "I put my own feelings aside to read others' moods" },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: 'I often give up my opinion to avoid conflict' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: 'I feel pressure to be a "good person"' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: 'I am excessively uncomfortable being a burden to others' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: 'I struggle to say no and overextend to accommodate others' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: 'I do what others expect before what I want' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: 'I sometimes feel empty or anxious when alone' },
  ],
  ja: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: '子供時代に自分の感情が十分に受け入れられなかったと感じる' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: '辛い時に安心して頼れる場所がないと感じることが多い' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: '愛されるには何かをうまくやらなければと感じる' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: '心の奥に満たされない孤独がある' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: '称賛や愛情を受けても信じにくい' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: '見捨てられたり拒絶されるのを恐れる時がある' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: '自分の感情や欲求を表現するのが不自然で不快だ' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: '他人の気分を伺うあまり自分の気持ちを後回しにする' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: '対立を避けるために自分の意見をよく引っ込める' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: '「良い人」でいなければという圧力を感じる' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: '他人に迷惑をかけることが過度に不快だ' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: '断るのが苦手で無理して合わせる方だ' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: '自分が望むことより他人が期待することを先にする' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: '一人でいる時に空虚や不安を感じる時がある' },
  ],
  zh: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: '我觉得小时候我的情绪没有被好好接住' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: '难受的时候，我常觉得没有能安心靠着的地方' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: '我觉得要做得好，才会被爱' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: '心底有一块填不满的孤单' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: '就算被称赞或被疼，我也不太敢相信' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: '我有时候会怕被丢下或被拒绝' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: '说出自己的情绪或需要，我会别扭、不自在' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: '我忙着看别人的脸色，把自己的心往后放' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: '为了避开冲突，我常把自己的意见收回去' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: '我觉得有压力，好像必须一直当「好人」' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: '给别人添麻烦这件事，让我特别不舒服' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: '我不太会拒绝，常勉强自己去迁就' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: '我会先做别人期待的，而不是自己想要的' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: '一个人的时候，我有时会空落落的，或不安' },
  ],
  fr: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: 'J’ai le sentiment que mes émotions d’enfant n’ont pas été suffisamment accueillies' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: 'Dans les moments difficiles, je sens souvent n’avoir personne sur qui m’appuyer' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: 'J’ai le sentiment qu’il faut bien faire pour être aimé' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: 'Il y a au fond de moi une solitude qui ne se comble pas' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: 'Même quand on me complimente ou m’entoure, j’ai du mal à y croire' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: 'Il m’arrive de craindre d’être abandonné ou rejeté' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: 'Exprimer mes émotions ou mes besoins me met mal à l’aise' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: 'À force de guetter l’humeur des autres, je remets mes sentiments à plus tard' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: 'Pour éviter le conflit, je renonce souvent à mon avis' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: 'Je ressens la pression de devoir être « quelqu’un de gentil »' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: 'Déranger les autres me met exagérément mal à l’aise' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: 'J’ai du mal à refuser et je m’adapte au-delà de mes forces' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: 'Je fais d’abord ce que les autres attendent, avant ce que je veux' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: 'Quand je suis seul, il m’arrive de me sentir vide ou inquiet' },
  ],
  es: [
    { id: 'n1', subscale: 'neglect', reverse: false, text: 'Siento que de niño mis emociones no se acogieron lo suficiente' },
    { id: 'n2', subscale: 'neglect', reverse: false, text: 'En los momentos duros, siento a menudo que no tengo dónde apoyarme' },
    { id: 'n3', subscale: 'neglect', reverse: false, text: 'Siento que hay que hacerlo bien para ser querido' },
    { id: 'n4', subscale: 'neglect', reverse: false, text: 'Hay en el fondo una soledad que no se llena' },
    { id: 'n5', subscale: 'neglect', reverse: false, text: 'Aunque me elogien o me cuiden, me cuesta creerlo' },
    { id: 'n6', subscale: 'neglect', reverse: false, text: 'A veces temo que me abandonen o me rechacen' },
    { id: 'n7', subscale: 'neglect', reverse: false, text: 'Expresar lo que siento o necesito me incomoda' },
    { id: 'a1', subscale: 'adaptation', reverse: false, text: 'De tanto mirar el ánimo ajeno, dejo lo mío para después' },
    { id: 'a2', subscale: 'adaptation', reverse: false, text: 'Para evitar el conflicto, a menudo me callo mi opinión' },
    { id: 'a3', subscale: 'adaptation', reverse: false, text: 'Siento la presión de tener que ser «buena persona»' },
    { id: 'a4', subscale: 'adaptation', reverse: false, text: 'Molestar a los demás me incomoda muchísimo' },
    { id: 'a5', subscale: 'adaptation', reverse: false, text: 'Me cuesta negarme y me adapto más allá de mis fuerzas' },
    { id: 'a6', subscale: 'adaptation', reverse: false, text: 'Hago antes lo que esperan de mí que lo que quiero' },
    { id: 'a7', subscale: 'adaptation', reverse: false, text: 'Cuando estoy solo, a veces me siento vacío o inquieto' },
  ],
}

function calcLevel(score: number): ChildLevel {
  if (score <= 2.3) return 'nurtured'
  if (score <= 3.2) return 'aware'
  if (score <= 4.0) return 'wounded'
  return 'frozen'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function InnerChildTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "inner-child", title: "InnerChildTest", finished: Boolean(done) });

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
    const nItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'neglect')
    const aItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'adaptation')
    const nScore = nItems.reduce((s, x) => s + x.adj, 0) / nItems.length
    const aScore = aItems.reduce((s, x) => s + x.adj, 0) / aItems.length
    const overall = (nScore + aScore) / 2
    return { nScore, aScore, overall }
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
        previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[l] ?? 'Previous question')}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  const { nScore, aScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const nPct = Math.round(((nScore - 1) / 4) * 100)
  const aPct = Math.round(((aScore - 1) / 4) * 100)

  const levelColors: Record<ChildLevel, string> = {
    nurtured: '#10b981',
    aware: '#14b8a6',
    wounded: '#f59e0b',
    frozen: '#435D31',
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
            <span className="font-bold text-muted-foreground">{lb.neglectLabel}</span>
            <span className="font-bold" style={{ color }}>{nScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={nPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.neglectLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${nPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.adaptationLabel}</span>
            <span className="font-bold" style={{ color }}>{aScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={aPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.adaptationLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${aPct}%`, backgroundColor: color }} />
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
