import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ShadowLevel = 'integrated' | 'aware' | 'projecting' | 'submerged'
type Subscale = 'projection' | 'repression'

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
  yourScore: string; overallLabel: string; projectionLabel: string; repressionLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '그림자 자아 테스트',
    subtitle: '내 안의 그림자는 얼마나 깊은가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 그림자 지수는',
    yourScore: '나의 그림자 지수',
    overallLabel: '종합 그림자 지수',
    projectionLabel: '투사 (남에게 비춤)',
    repressionLabel: '억압 (안으로 누름)',
    outOf: '/ 5.0',
    tipsLabel: '통합을 위한 팁',
    note: 'C.G. 융의 그림자(shadow) 개념에서 영감을 받은 자가성찰용 테스트입니다. 전문적 심리분석이나 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Shadow Self Test',
    subtitle: 'How deep is the shadow within you?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My shadow score is',
    yourScore: 'Your Shadow Score',
    overallLabel: 'Overall Shadow Score',
    projectionLabel: 'Projection (onto others)',
    repressionLabel: 'Repression (pushed inward)',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Integration',
    note: 'This self-reflection test is inspired by C.G. Jung\'s concept of the shadow. It does not replace professional psychoanalysis or assessment.',
  },
  ja: {
    title: 'シャドウ（影の自己）テスト',
    subtitle: 'あなたの中の影はどれほど深いか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のシャドウ度は',
    yourScore: 'あなたのシャドウ度',
    overallLabel: '総合シャドウ度',
    projectionLabel: '投影（他者に映す）',
    repressionLabel: '抑圧（内に押し込む）',
    outOf: '/ 5.0',
    tipsLabel: '統合のためのヒント',
    note: 'このテストはC.G.ユングの影（シャドウ）概念に着想を得た自己省察用です。専門的な心理分析や診断の代替ではありません。',
  },
  zh: {
    title: '阴影自我测验',
    subtitle: '我心里的阴影有多深？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '偶尔如此', '经常如此', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的阴影指数是',
    yourScore: '我的阴影指数',
    overallLabel: '综合阴影指数',
    projectionLabel: '投射（照到别人身上）',
    repressionLabel: '压抑（往里压）',
    outOf: '/ 5.0',
    tipsLabel: '整合的建议',
    note: '本测验受荣格的阴影（shadow）概念启发，用于自我省思，不能替代专业的心理分析或诊断。',
  },
  fr: {
    title: 'Test de l’ombre intérieure',
    subtitle: 'À quel point mon ombre est-elle profonde ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon indice d’ombre',
    yourScore: 'Votre indice d’ombre',
    overallLabel: 'Indice global',
    projectionLabel: 'Projection (sur les autres)',
    repressionLabel: 'Refoulement (vers l’intérieur)',
    outOf: '/ 5.0',
    tipsLabel: 'Conseils pour l’intégration',
    note: 'Ce test s’inspire de la notion d’ombre chez C. G. Jung, à des fins de réflexion personnelle. Il ne remplace ni une analyse ni un diagnostic professionnels.',
  },
  es: {
    title: 'Test de la sombra interior',
    subtitle: '¿Cuán honda es mi sombra?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi índice de sombra',
    yourScore: 'Tu índice de sombra',
    overallLabel: 'Índice global',
    projectionLabel: 'Proyección (en los demás)',
    repressionLabel: 'Represión (hacia dentro)',
    outOf: '/ 5.0',
    tipsLabel: 'Consejos para integrarla',
    note: 'Este test se inspira en la noción de sombra de C. G. Jung, para la reflexión personal. No sustituye un análisis ni un diagnóstico profesionales.',
  },
}

const LEVEL_DATA: Record<ShadowLevel, Record<SupportedLang, LevelData>> = {
  integrated: {
    ko: {
      icon: '🌗',
      title: '그림자 통합형',
      description: '자신의 어두운 면과 약점을 비교적 잘 인식하고 받아들입니다. 그림자를 적으로 보지 않고 자기 일부로 다룹니다.',
      tips: [
        '계속해서 감정의 그늘을 호기심으로 관찰하세요.',
        '강하게 거슬리는 사람에게서 나의 거울을 찾아보세요.',
        '통합된 에너지를 창의성과 진정성으로 표현하세요.',
      ],
    },
    en: {
      icon: '🌗',
      title: 'Integrated',
      description: 'You recognize and accept your darker sides and weaknesses fairly well. You treat the shadow as part of yourself rather than an enemy.',
      tips: [
        'Keep observing your emotional shadows with curiosity.',
        'Look for your own mirror in the people who irritate you most.',
        'Channel that integrated energy into creativity and authenticity.',
      ],
    },
    ja: {
      icon: '🌗',
      title: '統合型',
      description: '自分の暗い面や弱さを比較的よく認識し受け入れています。影を敵ではなく自分の一部として扱えます。',
      tips: [
        '感情の陰を好奇心を持って観察し続けましょう。',
        '強く苛立つ相手の中に自分の鏡を探してみましょう。',
        '統合されたエネルギーを創造性と誠実さで表現しましょう。',
      ],
    },
    zh: {
      icon: '🌗',
      title: '阴影整合型',
      description: '你对自己的阴暗面和弱点，认得比较清楚，也接得住。你不把阴影当敌人，而是当成自己的一部分来对待。',
      tips: [
        '继续带着好奇去观察情绪的阴影处。',
        '在特别刺眼的人身上，找找自己的镜子。',
        '把整合过的能量，用创作和真诚表达出来。',
      ],
    },
    fr: {
      icon: '🌗',
      title: 'Ombre intégrée',
      description: 'Vous reconnaissez et accueillez plutôt bien vos parts sombres et vos faiblesses. Vous ne traitez pas l’ombre en ennemie, mais comme une part de vous.',
      tips: [
        'Continuez d’observer avec curiosité les zones d’ombre de vos émotions.',
        'Cherchez votre miroir chez celui qui vous heurte le plus.',
        'Exprimez cette énergie intégrée par la création et l’authenticité.',
      ],
    },
    es: {
      icon: '🌗',
      title: 'Sombra integrada',
      description: 'Reconoces y acoges bastante bien tus partes oscuras y tus debilidades. No tratas la sombra como enemiga, sino como parte de ti.',
      tips: [
        'Sigue observando con curiosidad las zonas de sombra de tus emociones.',
        'Busca tu espejo en quien más te choca.',
        'Expresa esa energía integrada con creación y autenticidad.',
      ],
    },
  },
  aware: {
    ko: {
      icon: '🌓',
      title: '인식 성장형',
      description: '자신의 그림자를 어느 정도 인식하고 있지만, 받아들이기 힘든 면은 아직 외면하기도 합니다. 통합의 여지가 있습니다.',
      tips: [
        '"나는 절대 저렇지 않다"고 느낄 때 잠시 멈춰 보세요.',
        '불편한 감정을 일기로 적어 패턴을 찾아보세요.',
        '약점도 나의 일부로 이름 붙여 받아들이는 연습을 하세요.',
      ],
    },
    en: {
      icon: '🌓',
      title: 'Growing Awareness',
      description: 'You are somewhat aware of your shadow, but you still look away from the parts that are hard to accept. There is room to integrate.',
      tips: [
        'Pause when you feel "I am never like that."',
        'Journal uncomfortable feelings to find their patterns.',
        'Practice naming and accepting your weaknesses as part of you.',
      ],
    },
    ja: {
      icon: '🌓',
      title: '認識成長型',
      description: '自分の影をある程度認識していますが、受け入れがたい面はまだ目を背けることもあります。統合の余地があります。',
      tips: [
        '「自分は絶対あんなふうではない」と感じたら一度立ち止まりましょう。',
        '不快な感情を日記に書いてパターンを探しましょう。',
        '弱さも自分の一部として名づけ受け入れる練習をしましょう。',
      ],
    },
    zh: {
      icon: '🌓',
      title: '觉察成长型',
      description: '你对自己的阴影有一定的觉察，但难以接受的部分还会别过头去。整合还有空间。',
      tips: [
        '当你觉得「我绝对不是那样」时，先停一下。',
        '把不舒服的情绪写进日记，找出它的规律。',
        '练习给弱点取个名字，把它当成自己的一部分接住。',
      ],
    },
    fr: {
      icon: '🌓',
      title: 'Conscience en croissance',
      description: 'Vous percevez en partie votre ombre, mais vous détournez encore le regard de ce qui est difficile à accepter. Il reste de la marge pour intégrer.',
      tips: [
        'Quand vous pensez « je ne suis absolument pas comme ça », marquez une pause.',
        'Notez les émotions inconfortables dans un journal pour repérer le schéma.',
        'Entraînez-vous à nommer vos faiblesses et à les accueillir comme vôtres.',
      ],
    },
    es: {
      icon: '🌓',
      title: 'Conciencia en crecimiento',
      description: 'Percibes en parte tu sombra, pero aún apartas la mirada de lo que cuesta aceptar. Queda margen para integrarla.',
      tips: [
        'Cuando pienses «yo desde luego no soy así», párate un momento.',
        'Anota las emociones incómodas en un diario para ver el patrón.',
        'Practica ponerle nombre a tus debilidades y acogerlas como tuyas.',
      ],
    },
  },
  projecting: {
    ko: {
      icon: '🌒',
      title: '투사 경향형',
      description: '받아들이기 힘든 자신의 면을 남에게서 발견하고 비판하는 경향이 있습니다. 강한 거슬림은 종종 나의 거울입니다.',
      tips: [
        '누군가 유독 거슬릴 때 "그 특성이 내게도 있나?" 물어보세요.',
        '비판의 충동이 올라올 때 그 감정의 출처를 살펴보세요.',
        '갈등에서 내 몫의 책임을 한 가지라도 찾아보세요.',
      ],
    },
    en: {
      icon: '🌒',
      title: 'Projecting',
      description: 'You tend to find and criticize, in others, the parts of yourself that are hard to accept. Strong irritation is often a mirror.',
      tips: [
        'When someone irritates you intensely, ask "do I have that trait too?"',
        'When the urge to criticize rises, examine where the feeling comes from.',
        'Find at least one piece of your own responsibility in a conflict.',
      ],
    },
    ja: {
      icon: '🌒',
      title: '投影傾向型',
      description: '受け入れがたい自分の面を他人の中に見つけて批判する傾向があります。強い苛立ちはしばしば自分の鏡です。',
      tips: [
        '誰かが特に苛立つ時「その特性は自分にもあるか？」と問いましょう。',
        '批判の衝動が湧いたら、その感情の出どころを観察しましょう。',
        '対立の中で自分の責任を一つでも見つけてみましょう。',
      ],
    },
    zh: {
      icon: '🌒',
      title: '投射倾向型',
      description: '你倾向在别人身上看见自己难以接受的那一面，并去批评它。特别刺眼的地方，常常是自己的镜子。',
      tips: [
        '有人特别刺眼时，问一句「这个特质我身上有吗」。',
        '批评的冲动冒上来时，看看这情绪是从哪里来的。',
        '在冲突里，至少找出一件属于自己的责任。',
      ],
    },
    fr: {
      icon: '🌒',
      title: 'Tendance à projeter',
      description: 'Vous avez tendance à repérer chez les autres la part de vous difficile à accepter, puis à la critiquer. Ce qui heurte le plus est souvent un miroir.',
      tips: [
        'Quand quelqu’un vous heurte particulièrement, demandez-vous : « ce trait, l’ai-je aussi ? »',
        'Quand l’envie de critiquer monte, regardez d’où vient cette émotion.',
        'Dans un conflit, trouvez au moins une part de responsabilité qui vous revient.',
      ],
    },
    es: {
      icon: '🌒',
      title: 'Tendencia a proyectar',
      description: 'Sueles ver en los demás la parte de ti que cuesta aceptar, y criticarla. Lo que más choca suele ser un espejo.',
      tips: [
        'Cuando alguien te choque especialmente, pregúntate: «¿ese rasgo lo tengo yo también?».',
        'Cuando suba el impulso de criticar, mira de dónde viene esa emoción.',
        'En un conflicto, busca al menos una parte de responsabilidad tuya.',
      ],
    },
  },
  submerged: {
    ko: {
      icon: '🌑',
      title: '그림자 잠복형',
      description: '받아들이기 힘든 감정·욕구를 깊이 억압하고 있을 가능성이 높습니다. 억눌린 그림자는 무의식에서 강하게 작동합니다.',
      tips: [
        '"좋은 사람이어야 한다"는 압박을 잠시 내려놓아 보세요.',
        '분노·질투·욕망 같은 감정도 정보임을 받아들이세요.',
        '혼자 마주하기 버겁다면 상담 등 안전한 공간을 찾으세요.',
      ],
    },
    en: {
      icon: '🌑',
      title: 'Submerged Shadow',
      description: 'You likely repress hard-to-accept emotions and desires deeply. A suppressed shadow operates powerfully from the unconscious.',
      tips: [
        'Set down the pressure to "always be a good person" for a moment.',
        'Accept that anger, jealousy, and desire are also information.',
        'If facing it alone feels too heavy, seek a safe space such as counseling.',
      ],
    },
    ja: {
      icon: '🌑',
      title: 'シャドウ潜伏型',
      description: '受け入れがたい感情・欲求を深く抑圧している可能性が高いです。抑え込まれた影は無意識から強く作動します。',
      tips: [
        '「良い人でなければ」という圧力を少し手放してみましょう。',
        '怒り・嫉妬・欲望といった感情も情報だと受け入れましょう。',
        '一人で向き合うのが重いなら、カウンセリングなど安全な場を探しましょう。',
      ],
    },
    zh: {
      icon: '🌑',
      title: '阴影潜伏型',
      description: '你很可能把难以接受的情绪和欲望压得很深。被压下去的阴影，会在看不见的地方使劲。',
      tips: [
        '把「必须当好人」的压力先放下一会儿。',
        '接受愤怒、嫉妒、欲望这些情绪也是信息。',
        '一个人面对太吃力时，找咨询这类安全的地方。',
      ],
    },
    fr: {
      icon: '🌑',
      title: 'Ombre immergée',
      description: 'Vous refoulez probablement en profondeur des émotions et des désirs difficiles à accepter. Une ombre refoulée agit avec force depuis l’inconscient.',
      tips: [
        'Posez un moment la pression de « devoir être quelqu’un de bien ».',
        'Acceptez que la colère, la jalousie ou le désir soient aussi des informations.',
        'Si l’affronter seul est trop lourd, cherchez un cadre sûr, un accompagnement par exemple.',
      ],
    },
    es: {
      icon: '🌑',
      title: 'Sombra sumergida',
      description: 'Probablemente reprimes a fondo emociones y deseos difíciles de aceptar. Una sombra reprimida actúa con fuerza desde lo inconsciente.',
      tips: [
        'Suelta un rato la presión de «tener que ser buena persona».',
        'Acepta que la rabia, la envidia o el deseo también son información.',
        'Si afrontarlo a solas pesa demasiado, busca un espacio seguro, como un acompañamiento.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'p1', subscale: 'projection', reverse: false, text: '어떤 사람의 특정 행동이 유독 참기 힘들 만큼 거슬린다' },
    { id: 'p2', subscale: 'projection', reverse: false, text: '남의 결점은 잘 보이지만 나의 비슷한 면은 잘 인정하지 않는다' },
    { id: 'p3', subscale: 'projection', reverse: false, text: '화가 났을 때 대체로 상대 탓이라고 확신한다' },
    { id: 'p4', subscale: 'projection', reverse: false, text: '"너도 그런 면이 있어"라는 말을 들으면 강하게 반발한다' },
    { id: 'p5', subscale: 'projection', reverse: false, text: '내가 경멸하는 특성을 가진 사람을 보면 감정이 크게 요동친다' },
    { id: 'p6', subscale: 'projection', reverse: false, text: '칭찬보다 비판이 먼저 입에 붙는다' },
    { id: 'p7', subscale: 'projection', reverse: false, text: '갈등의 원인은 대개 상대에게 있다고 느낀다' },
    { id: 'r1', subscale: 'repression', reverse: false, text: '분노·질투·이기심 같은 감정은 나와 거리가 멀다고 생각한다' },
    { id: 'r2', subscale: 'repression', reverse: false, text: '부정적인 감정이 들면 빨리 눌러서 없애려 한다' },
    { id: 'r3', subscale: 'repression', reverse: false, text: '나는 거의 항상 "좋은 사람"이어야 한다고 느낀다' },
    { id: 'r4', subscale: 'repression', reverse: false, text: '내 안의 어둡거나 약한 면을 떠올리는 것이 불편하다' },
    { id: 'r5', subscale: 'repression', reverse: false, text: '내 욕망이나 충동을 솔직히 들여다본 적이 거의 없다' },
    { id: 'r6', subscale: 'repression', reverse: false, text: '꿈이나 무의식이 나에 대해 무언가 말해준다고 생각하지 않는다' },
    { id: 'r7', subscale: 'repression', reverse: false, text: '감정을 깊이 들여다보기보다 바쁘게 지내며 잊는 편이다' },
  ],
  en: [
    { id: 'p1', subscale: 'projection', reverse: false, text: "A certain behavior in some people irritates me almost unbearably" },
    { id: 'p2', subscale: 'projection', reverse: false, text: "I notice others' flaws easily but rarely admit similar ones in myself" },
    { id: 'p3', subscale: 'projection', reverse: false, text: 'When I am angry, I am usually sure it is the other person\'s fault' },
    { id: 'p4', subscale: 'projection', reverse: false, text: 'I strongly resist hearing "you have that side too"' },
    { id: 'p5', subscale: 'projection', reverse: false, text: 'Seeing someone with a trait I despise stirs strong emotions in me' },
    { id: 'p6', subscale: 'projection', reverse: false, text: 'Criticism comes to my lips more readily than praise' },
    { id: 'p7', subscale: 'projection', reverse: false, text: 'I feel the cause of conflict usually lies with the other person' },
    { id: 'r1', subscale: 'repression', reverse: false, text: 'I think feelings like anger, jealousy, or selfishness are far from me' },
    { id: 'r2', subscale: 'repression', reverse: false, text: 'When negative feelings arise, I try to suppress them quickly' },
    { id: 'r3', subscale: 'repression', reverse: false, text: 'I feel I must almost always be a "good person"' },
    { id: 'r4', subscale: 'repression', reverse: false, text: 'It is uncomfortable to think about my dark or weak sides' },
    { id: 'r5', subscale: 'repression', reverse: false, text: 'I have rarely looked honestly at my own desires or impulses' },
    { id: 'r6', subscale: 'repression', reverse: false, text: 'I do not think dreams or the unconscious tell me anything about myself' },
    { id: 'r7', subscale: 'repression', reverse: false, text: 'Rather than examining feelings deeply, I stay busy and forget them' },
  ],
  ja: [
    { id: 'p1', subscale: 'projection', reverse: false, text: 'ある人の特定の行動が我慢できないほど苛立たしい' },
    { id: 'p2', subscale: 'projection', reverse: false, text: '他人の欠点はよく見えるが、自分の似た面は認めにくい' },
    { id: 'p3', subscale: 'projection', reverse: false, text: '怒っている時、だいたい相手のせいだと確信する' },
    { id: 'p4', subscale: 'projection', reverse: false, text: '「あなたにもそういう面がある」と言われると強く反発する' },
    { id: 'p5', subscale: 'projection', reverse: false, text: '軽蔑する特性を持つ人を見ると感情が大きく揺れる' },
    { id: 'p6', subscale: 'projection', reverse: false, text: '称賛より批判が先に口をつく' },
    { id: 'p7', subscale: 'projection', reverse: false, text: '対立の原因はたいてい相手にあると感じる' },
    { id: 'r1', subscale: 'repression', reverse: false, text: '怒り・嫉妬・利己心といった感情は自分とは縁遠いと思う' },
    { id: 'r2', subscale: 'repression', reverse: false, text: '否定的な感情が湧くと素早く抑えて消そうとする' },
    { id: 'r3', subscale: 'repression', reverse: false, text: '自分はほとんどいつも「良い人」でなければと感じる' },
    { id: 'r4', subscale: 'repression', reverse: false, text: '自分の暗い面や弱い面を思い浮かべるのが不快だ' },
    { id: 'r5', subscale: 'repression', reverse: false, text: '自分の欲望や衝動を正直に見つめたことがほとんどない' },
    { id: 'r6', subscale: 'repression', reverse: false, text: '夢や無意識が自分について何か教えてくれるとは思わない' },
    { id: 'r7', subscale: 'repression', reverse: false, text: '感情を深く見つめるより、忙しくして忘れる方だ' },
  ],
  zh: [
    { id: 'p1', subscale: 'projection', reverse: false, text: '某个人的某种举动，会让我难以忍受地刺眼' },
    { id: 'p2', subscale: 'projection', reverse: false, text: '别人的缺点我看得很清楚，自己身上类似的地方却不太认' },
    { id: 'p3', subscale: 'projection', reverse: false, text: '生气的时候，我多半确信是对方的错' },
    { id: 'p4', subscale: 'projection', reverse: false, text: '听到「你也有那一面」时，我会强烈反弹' },
    { id: 'p5', subscale: 'projection', reverse: false, text: '看到有我瞧不上的那种特质的人，我的情绪会很大' },
    { id: 'p6', subscale: 'projection', reverse: false, text: '比起称赞，批评更容易先从我嘴里冒出来' },
    { id: 'p7', subscale: 'projection', reverse: false, text: '冲突的原因，我多半觉得在对方身上' },
    { id: 'r1', subscale: 'repression', reverse: false, text: '愤怒、嫉妒、自私这类情绪，我觉得离我很远' },
    { id: 'r2', subscale: 'repression', reverse: false, text: '负面情绪一冒头，我就想赶紧压下去' },
    { id: 'r3', subscale: 'repression', reverse: false, text: '我常觉得自己几乎必须一直当「好人」' },
    { id: 'r4', subscale: 'repression', reverse: false, text: '想到自己身上阴暗或软弱的部分，我会不舒服' },
    { id: 'r5', subscale: 'repression', reverse: false, text: '我几乎没有诚实地看过自己的欲望或冲动' },
    { id: 'r6', subscale: 'repression', reverse: false, text: '我不认为梦或潜意识会告诉我什么' },
    { id: 'r7', subscale: 'repression', reverse: false, text: '比起深看情绪，我更倾向让自己忙起来把它忘掉' },
  ],
  fr: [
    { id: 'p1', subscale: 'projection', reverse: false, text: 'Un certain comportement chez quelqu’un me heurte de façon presque insupportable' },
    { id: 'p2', subscale: 'projection', reverse: false, text: 'Je vois bien les défauts des autres, mais j’admets mal les mêmes chez moi' },
    { id: 'p3', subscale: 'projection', reverse: false, text: 'Quand je suis en colère, je suis à peu près sûr que c’est la faute de l’autre' },
    { id: 'p4', subscale: 'projection', reverse: false, text: 'Quand on me dit « tu as aussi cette part-là », je réagis vivement' },
    { id: 'p5', subscale: 'projection', reverse: false, text: 'Face à quelqu’un qui a un trait que je méprise, mes émotions s’emballent' },
    { id: 'p6', subscale: 'projection', reverse: false, text: 'La critique me vient aux lèvres avant le compliment' },
    { id: 'p7', subscale: 'projection', reverse: false, text: 'J’ai le sentiment que la cause du conflit vient surtout de l’autre' },
    { id: 'r1', subscale: 'repression', reverse: false, text: 'La colère, la jalousie, l’égoïsme me semblent étrangers' },
    { id: 'r2', subscale: 'repression', reverse: false, text: 'Dès qu’une émotion négative monte, je cherche à l’étouffer vite' },
    { id: 'r3', subscale: 'repression', reverse: false, text: 'J’ai le sentiment de devoir être « quelqu’un de bien » presque tout le temps' },
    { id: 'r4', subscale: 'repression', reverse: false, text: 'Penser à ma part sombre ou fragile me met mal à l’aise' },
    { id: 'r5', subscale: 'repression', reverse: false, text: 'Je n’ai presque jamais regardé honnêtement mes désirs ou mes pulsions' },
    { id: 'r6', subscale: 'repression', reverse: false, text: 'Je ne crois pas que les rêves ou l’inconscient m’apprennent quelque chose' },
    { id: 'r7', subscale: 'repression', reverse: false, text: 'Plutôt que de regarder mes émotions de près, je m’occupe pour les oublier' },
  ],
  es: [
    { id: 'p1', subscale: 'projection', reverse: false, text: 'Cierta conducta de alguien me resulta casi insoportable' },
    { id: 'p2', subscale: 'projection', reverse: false, text: 'Veo bien los defectos ajenos, pero admito mal los míos parecidos' },
    { id: 'p3', subscale: 'projection', reverse: false, text: 'Cuando me enfado, estoy casi seguro de que la culpa es del otro' },
    { id: 'p4', subscale: 'projection', reverse: false, text: 'Si me dicen «tú también tienes esa parte», reacciono con fuerza' },
    { id: 'p5', subscale: 'projection', reverse: false, text: 'Ante alguien con un rasgo que desprecio, mis emociones se disparan' },
    { id: 'p6', subscale: 'projection', reverse: false, text: 'La crítica me sale antes que el elogio' },
    { id: 'p7', subscale: 'projection', reverse: false, text: 'Siento que la causa del conflicto está sobre todo en el otro' },
    { id: 'r1', subscale: 'repression', reverse: false, text: 'La rabia, la envidia o el egoísmo me parecen ajenos' },
    { id: 'r2', subscale: 'repression', reverse: false, text: 'En cuanto sube una emoción negativa, intento apagarla rápido' },
    { id: 'r3', subscale: 'repression', reverse: false, text: 'Siento que casi siempre debo ser «buena persona»' },
    { id: 'r4', subscale: 'repression', reverse: false, text: 'Pensar en mi parte oscura o frágil me incomoda' },
    { id: 'r5', subscale: 'repression', reverse: false, text: 'Casi nunca he mirado con honestidad mis deseos o impulsos' },
    { id: 'r6', subscale: 'repression', reverse: false, text: 'No creo que los sueños o el inconsciente me digan algo' },
    { id: 'r7', subscale: 'repression', reverse: false, text: 'Antes que mirar de cerca mis emociones, me ocupo para olvidarlas' },
  ],
}

function calcLevel(score: number): ShadowLevel {
  if (score <= 2.3) return 'integrated'
  if (score <= 3.2) return 'aware'
  if (score <= 4.0) return 'projecting'
  return 'submerged'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function ShadowSelfTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "shadow-self", title: "ShadowSelfTest", finished: Boolean(done) });

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
    const pItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'projection')
    const rItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'repression')
    const pScore = pItems.reduce((s, x) => s + x.adj, 0) / pItems.length
    const rScore = rItems.reduce((s, x) => s + x.adj, 0) / rItems.length
    const overall = (pScore + rScore) / 2
    return { pScore, rScore, overall }
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

  const { pScore, rScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const pPct = Math.round(((pScore - 1) / 4) * 100)
  const rPct = Math.round(((rScore - 1) / 4) * 100)

  const levelColors: Record<ShadowLevel, string> = {
    integrated: '#10b981',
    aware: '#14b8a6',
    projecting: '#B66854',
    submerged: '#435D31',
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
            <span className="font-bold text-muted-foreground">{lb.projectionLabel}</span>
            <span className="font-bold" style={{ color }}>{pScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={pPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.projectionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.repressionLabel}</span>
            <span className="font-bold" style={{ color }}>{rScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={rPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.repressionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rPct}%`, backgroundColor: color }} />
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
