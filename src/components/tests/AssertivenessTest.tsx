import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type AssertLevel = 'passive' | 'developing' | 'assertive' | 'strong'
type Subscale = 'express' | 'boundary'

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
  yourScore: string; overallLabel: string; expressLabel: string; boundaryLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '자기주장성 테스트',
    subtitle: '나는 내 생각과 경계를 얼마나 표현하는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 자기주장성 점수는',
    yourScore: '나의 자기주장성 점수',
    overallLabel: '종합 자기주장성',
    expressLabel: '의사 표현',
    boundaryLabel: '경계 설정',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: 'Rathus 자기주장성 척도(RAS) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Assertiveness Test',
    subtitle: 'How well do you express your thoughts and boundaries?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My assertiveness score is',
    yourScore: 'Your Assertiveness Score',
    overallLabel: 'Overall Assertiveness',
    expressLabel: 'Self-Expression',
    boundaryLabel: 'Boundary-Setting',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: 'This self-reflection test is based on the Rathus Assertiveness Schedule (RAS) concept. It does not replace professional assessment.',
  },
  ja: {
    title: 'アサーティブネス（自己主張）テスト',
    subtitle: '自分の考えと境界をどれくらい表現できる？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のアサーティブネス度は',
    yourScore: 'あなたのアサーティブネス度',
    overallLabel: '総合アサーティブネス',
    expressLabel: '意思表現',
    boundaryLabel: '境界設定',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはRathusアサーション尺度（RAS）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
  zh: {
    title: '自我主张测验',
    subtitle: '我能在多大程度上表达自己的想法和界限？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '一般', '大体是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的自我主张分数是',
    yourScore: '我的自我主张分数',
    overallLabel: '综合自我主张',
    expressLabel: '意见表达',
    boundaryLabel: '界限设定',
    outOf: '/ 5.0',
    tipsLabel: '成长建议',
    note: '本测验参考 Rathus 自我主张量表（RAS）的概念，用于自我省思，不能替代专业诊断。',
  },
  fr: {
    title: 'Test d’affirmation de soi',
    subtitle: 'Dans quelle mesure est-ce que j’exprime mes idées et mes limites ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Moyennement', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon score d’affirmation de soi',
    yourScore: 'Mon score d’affirmation de soi',
    overallLabel: 'Affirmation de soi globale',
    expressLabel: 'Expression de ses opinions',
    boundaryLabel: 'Poser ses limites',
    outOf: '/ 5.0',
    tipsLabel: 'Pistes pour progresser',
    note: 'Test de réflexion personnelle inspiré de l’échelle d’affirmation de soi de Rathus (RAS). Il ne remplace pas un diagnostic professionnel.',
  },
  es: {
    title: 'Test de asertividad',
    subtitle: '¿Cuánto expreso mis ideas y mis límites?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'A medias', 'Bastante', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi puntuación de asertividad',
    yourScore: 'Mi puntuación de asertividad',
    overallLabel: 'Asertividad global',
    expressLabel: 'Expresar opiniones',
    boundaryLabel: 'Poner límites',
    outOf: '/ 5.0',
    tipsLabel: 'Consejos para crecer',
    note: 'Test de reflexión personal basado en la escala de asertividad de Rathus (RAS). No sustituye un diagnóstico profesional.',
  },
}

const LEVEL_DATA: Record<AssertLevel, Record<SupportedLang, LevelData>> = {
  passive: {
    ko: {
      icon: '🌱',
      title: '수용·배려형',
      description: '타인을 배려하고 갈등을 피하는 힘이 큽니다. 다만 내 생각과 필요를 표현하는 연습이 더해지면 관계가 더 건강해집니다.',
      tips: [
        '작은 선호부터 표현해 보세요 ("나는 이게 더 좋아").',
        '"아니오"를 한 문장으로 연습해 거절 근육을 키우세요.',
        '내 감정을 비난 없이 "나" 중심으로 말해 보세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Accommodating',
      description: 'You have a strong capacity to consider others and avoid conflict. Adding practice in voicing your thoughts and needs will make relationships healthier.',
      tips: [
        'Start by expressing small preferences ("I\'d prefer this").',
        'Practice "no" in a single sentence to build your refusal muscle.',
        'State your feelings as "I" statements, without blame.',
      ],
    },
    ja: {
      icon: '🌱',
      title: '受容・配慮型',
      description: '他人を配慮し対立を避ける力が大きいです。ただ自分の考えや必要を表現する練習が加わると関係がより健康になります。',
      tips: [
        '小さな好みから表現してみましょう（「私はこっちがいい」）。',
        '「いいえ」を一文で練習して断る筋肉を鍛えましょう。',
        '自分の感情を非難せず「私」中心で言ってみましょう。',
      ],
    },
    zh: {
      icon: '🌱',
      title: '包容体贴型',
      description: '你很会体贴别人、避开冲突。再多练习表达自己的想法和需要，关系会更健康。',
      tips: [
        '从小小的偏好开始表达吧（“我比较喜欢这个”）。',
        '用一句话练习说“不”，锻炼拒绝的肌肉。',
        '不带指责，用“我”开头说出自己的感受。',
      ],
    },
    fr: {
      icon: '🌱',
      title: 'Profil accueillant et attentionné',
      description: 'Vous savez prendre soin des autres et éviter les conflits. En vous entraînant à exprimer vos idées et vos besoins, vos relations deviendront plus saines.',
      tips: [
        'Commencez par exprimer de petites préférences (« Je préfère celui-ci »).',
        'Entraînez-vous à dire « non » en une phrase pour muscler votre refus.',
        'Dites ce que vous ressentez à la première personne, sans reproche.',
      ],
    },
    es: {
      icon: '🌱',
      title: 'Perfil receptivo y considerado',
      description: 'Tienes mucha capacidad para cuidar de los demás y evitar conflictos. Si practicas expresar tus ideas y necesidades, tus relaciones serán más sanas.',
      tips: [
        'Empieza expresando pequeñas preferencias («Prefiero este»).',
        'Practica decir «no» en una frase para fortalecer el músculo de rechazar.',
        'Di lo que sientes en primera persona, sin reproches.',
      ],
    },
  },
  developing: {
    ko: {
      icon: '🌿',
      title: '균형 성장형',
      description: '상황에 따라 표현하기도 하고 참기도 합니다. 배려와 주장 사이에서 균형을 찾아가는 건강한 발전 단계입니다.',
      tips: [
        '참았던 순간을 돌아보며 표현해도 좋았을 지점을 찾으세요.',
        '중요한 부탁·거절을 미리 한 문장으로 준비해 두세요.',
        '주장 후의 죄책감을 "건강한 표현"으로 재해석하세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Developing Balance',
      description: 'You express yourself in some situations and hold back in others. This is a healthy stage of finding the balance between consideration and assertion.',
      tips: [
        'Review moments you held back and spot where speaking up would have helped.',
        'Prepare important requests or refusals in advance as a single sentence.',
        'Reframe post-assertion guilt as "healthy expression."',
      ],
    },
    ja: {
      icon: '🌿',
      title: 'バランス成長型',
      description: '状況によって表現したり我慢したりします。配慮と主張の間でバランスを見つけていく健康的な発展段階です。',
      tips: [
        '我慢した瞬間を振り返り、表現してよかった点を探しましょう。',
        '重要な依頼・断りを前もって一文で準備しておきましょう。',
        '主張後の罪悪感を「健康的な表現」として捉え直しましょう。',
      ],
    },
    zh: {
      icon: '🌿',
      title: '平衡成长型',
      description: '你会视情况表达，也会忍住。这是在体贴与主张之间找平衡的健康成长阶段。',
      tips: [
        '回顾那些忍下来的时刻，找找其实可以说出口的地方。',
        '重要的请求或拒绝，事先准备成一句话。',
        '把主张之后的内疚，重新理解为“健康的表达”。',
      ],
    },
    fr: {
      icon: '🌿',
      title: 'Profil en équilibre, en progression',
      description: 'Selon les situations, vous vous exprimez ou vous vous retenez. C’est une étape saine où vous cherchez l’équilibre entre attention aux autres et affirmation.',
      tips: [
        'Repensez aux moments où vous vous êtes retenu et repérez où vous auriez pu parler.',
        'Préparez à l’avance en une phrase les demandes ou refus importants.',
        'Relisez la culpabilité qui suit une affirmation comme de « l’expression saine ».',
      ],
    },
    es: {
      icon: '🌿',
      title: 'Perfil en equilibrio, en crecimiento',
      description: 'Según la situación, te expresas o te contienes. Es una etapa sana en la que buscas el equilibrio entre considerar a otros y afirmarte.',
      tips: [
        'Repasa los momentos en que te contuviste y busca dónde podrías haber hablado.',
        'Prepara de antemano en una frase las peticiones o negativas importantes.',
        'Reinterpreta la culpa tras afirmarte como «expresión sana».',
      ],
    },
  },
  assertive: {
    ko: {
      icon: '🧭',
      title: '건강한 주장형',
      description: '자신의 생각과 경계를 존중하면서도 타인을 배려하며 표현합니다. 솔직함과 배려의 균형이 잘 잡혀 있습니다.',
      tips: [
        '이 균형을 관계·일에서 일관되게 유지하세요.',
        '표현 후 상대의 반응도 경청하는 양방향성을 살리세요.',
        '주변에 건강한 자기주장을 모델링해 보세요.',
      ],
    },
    en: {
      icon: '🧭',
      title: 'Healthy Assertive',
      description: 'You express your thoughts and boundaries while respecting and considering others. You hold a good balance of honesty and care.',
      tips: [
        'Maintain this balance consistently in relationships and work.',
        'Keep it two-way by also listening to others\' reactions after you speak.',
        'Model healthy assertiveness for those around you.',
      ],
    },
    ja: {
      icon: '🧭',
      title: '健康的主張型',
      description: '自分の考えや境界を尊重しつつ他人を配慮して表現します。正直さと配慮のバランスがよく取れています。',
      tips: [
        'このバランスを関係や仕事で一貫して保ちましょう。',
        '表現後に相手の反応も傾聴する双方向性を活かしましょう。',
        '周囲に健康的な自己主張をモデリングしましょう。',
      ],
    },
    zh: {
      icon: '🧭',
      title: '健康主张型',
      description: '你既尊重自己的想法和界限，也顾及他人地表达。坦率与体贴平衡得很好。',
      tips: [
        '在关系和工作中，一贯地维持这份平衡。',
        '表达之后也倾听对方的反应，保持双向。',
        '在身边示范健康的自我主张。',
      ],
    },
    fr: {
      icon: '🧭',
      title: 'Affirmation saine',
      description: 'Vous vous exprimez en respectant vos idées et vos limites tout en tenant compte des autres. Franchise et attention sont bien équilibrées.',
      tips: [
        'Maintenez cet équilibre avec constance, dans vos relations comme au travail.',
        'Après vous être exprimé, écoutez aussi la réaction de l’autre : gardez l’échange à double sens.',
        'Montrez autour de vous ce qu’est une affirmation de soi saine.',
      ],
    },
    es: {
      icon: '🧭',
      title: 'Asertividad sana',
      description: 'Te expresas respetando tus ideas y límites sin dejar de tener en cuenta a los demás. Franqueza y consideración están bien equilibradas.',
      tips: [
        'Mantén este equilibrio de forma constante en tus relaciones y en el trabajo.',
        'Tras expresarte, escucha también la reacción del otro: que sea en ambas direcciones.',
        'Sé ejemplo de asertividad sana para quienes te rodean.',
      ],
    },
  },
  strong: {
    ko: {
      icon: '🔥',
      title: '강한 주장형',
      description: '자기 표현과 경계 설정이 매우 분명합니다. 강점이지만, 때로는 경청과 배려의 균형을 점검하면 관계가 더 부드러워집니다.',
      tips: [
        '주장 전에 상대의 입장을 한 번 확인하는 여유를 두세요.',
        '강한 표현이 상대를 압도하지 않는지 가끔 점검하세요.',
        '경청과 질문으로 주장과 공감의 균형을 맞추세요.',
      ],
    },
    en: {
      icon: '🔥',
      title: 'Strongly Assertive',
      description: 'Your self-expression and boundary-setting are very clear. This is a strength, but occasionally checking the balance of listening and care softens relationships.',
      tips: [
        'Leave room to check the other person\'s view before asserting.',
        'Occasionally check that strong expression is not overwhelming others.',
        'Balance assertion and empathy through listening and questions.',
      ],
    },
    ja: {
      icon: '🔥',
      title: '強い主張型',
      description: '自己表現と境界設定が非常に明確です。強みですが、時に傾聴と配慮のバランスを点検すると関係がより柔らかくなります。',
      tips: [
        '主張の前に相手の立場を一度確認する余裕を持ちましょう。',
        '強い表現が相手を圧倒していないか時々点検しましょう。',
        '傾聴と質問で主張と共感のバランスを取りましょう。',
      ],
    },
    zh: {
      icon: '🔥',
      title: '强势主张型',
      description: '你的自我表达和界限设定非常明确。这是优势，但偶尔检视一下倾听与体贴的平衡，关系会更柔和。',
      tips: [
        '主张之前，留点余裕先确认对方的立场。',
        '偶尔检查强烈的表达是否压倒了对方。',
        '用倾听和提问，平衡主张与共情。',
      ],
    },
    fr: {
      icon: '🔥',
      title: 'Affirmation forte',
      description: 'Votre expression et vos limites sont très nettes. C’est une force ; vérifier de temps en temps l’équilibre avec l’écoute et l’attention adoucira vos relations.',
      tips: [
        'Avant de vous affirmer, prenez le temps de vérifier la position de l’autre.',
        'Vérifiez parfois que votre franchise n’écrase pas l’autre.',
        'Équilibrez affirmation et empathie par l’écoute et les questions.',
      ],
    },
    es: {
      icon: '🔥',
      title: 'Asertividad fuerte',
      description: 'Tu forma de expresarte y de poner límites es muy clara. Es una fortaleza; revisar de vez en cuando el equilibrio con la escucha y la consideración suavizará tus relaciones.',
      tips: [
        'Antes de afirmarte, tómate un momento para comprobar la postura del otro.',
        'Revisa a veces que tu franqueza no abrume al otro.',
        'Equilibra afirmación y empatía con escucha y preguntas.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'e1', subscale: 'express', reverse: false, text: '내 의견을 솔직하게 말하는 편이다' },
    { id: 'e2', subscale: 'express', reverse: false, text: '칭찬이나 감사를 자연스럽게 표현한다' },
    { id: 'e3', subscale: 'express', reverse: false, text: '회의나 모임에서 내 생각을 잘 말한다' },
    { id: 'e4', subscale: 'express', reverse: false, text: '부당한 대우를 받으면 분명히 표현한다' },
    { id: 'e5', subscale: 'express', reverse: false, text: '내가 원하는 것을 직접적으로 요청할 수 있다' },
    { id: 'e6', subscale: 'express', reverse: false, text: '다른 의견이 있어도 위축되지 않고 말한다' },
    { id: 'e7', subscale: 'express', reverse: false, text: '불만이 있을 때 쌓아두기보다 적절히 표현한다' },
    { id: 'b1', subscale: 'boundary', reverse: false, text: '부탁을 거절해야 할 때 분명히 거절할 수 있다' },
    { id: 'b2', subscale: 'boundary', reverse: false, text: '무리한 요구에 "아니오"라고 말할 수 있다' },
    { id: 'b3', subscale: 'boundary', reverse: false, text: '내 시간과 에너지의 경계를 지키는 편이다' },
    { id: 'b4', subscale: 'boundary', reverse: false, text: '남의 기대 때문에 억지로 맞추지 않는다' },
    { id: 'b5', subscale: 'boundary', reverse: false, text: '누군가 선을 넘으면 분명히 알린다' },
    { id: 'b6', subscale: 'boundary', reverse: false, text: '죄책감 없이 내 필요를 우선할 수 있다' },
    { id: 'b7', subscale: 'boundary', reverse: false, text: '갈등이 생겨도 필요한 말은 하는 편이다' },
  ],
  en: [
    { id: 'e1', subscale: 'express', reverse: false, text: 'I tend to state my opinions honestly' },
    { id: 'e2', subscale: 'express', reverse: false, text: 'I express praise and gratitude naturally' },
    { id: 'e3', subscale: 'express', reverse: false, text: 'I speak up with my thoughts in meetings or gatherings' },
    { id: 'e4', subscale: 'express', reverse: false, text: 'I clearly speak up when I am treated unfairly' },
    { id: 'e5', subscale: 'express', reverse: false, text: 'I can directly ask for what I want' },
    { id: 'e6', subscale: 'express', reverse: false, text: 'I speak up without shrinking even when I disagree' },
    { id: 'e7', subscale: 'express', reverse: false, text: 'When I have a complaint, I express it appropriately rather than bottling it up' },
    { id: 'b1', subscale: 'boundary', reverse: false, text: 'I can clearly decline when I need to refuse a request' },
    { id: 'b2', subscale: 'boundary', reverse: false, text: 'I can say "no" to unreasonable demands' },
    { id: 'b3', subscale: 'boundary', reverse: false, text: 'I tend to protect the boundaries of my time and energy' },
    { id: 'b4', subscale: 'boundary', reverse: false, text: "I do not force myself to comply because of others' expectations" },
    { id: 'b5', subscale: 'boundary', reverse: false, text: 'I clearly let someone know when they cross a line' },
    { id: 'b6', subscale: 'boundary', reverse: false, text: 'I can prioritize my needs without guilt' },
    { id: 'b7', subscale: 'boundary', reverse: false, text: 'I tend to say what needs to be said even if conflict arises' },
  ],
  ja: [
    { id: 'e1', subscale: 'express', reverse: false, text: '自分の意見を正直に言う方だ' },
    { id: 'e2', subscale: 'express', reverse: false, text: '称賛や感謝を自然に表現する' },
    { id: 'e3', subscale: 'express', reverse: false, text: '会議や集まりで自分の考えをよく言う' },
    { id: 'e4', subscale: 'express', reverse: false, text: '不当な扱いを受けたら明確に表現する' },
    { id: 'e5', subscale: 'express', reverse: false, text: '自分が望むことを直接的に求められる' },
    { id: 'e6', subscale: 'express', reverse: false, text: '異なる意見があっても萎縮せず言う' },
    { id: 'e7', subscale: 'express', reverse: false, text: '不満がある時、溜め込まず適切に表現する' },
    { id: 'b1', subscale: 'boundary', reverse: false, text: '断るべき時にはっきり断ることができる' },
    { id: 'b2', subscale: 'boundary', reverse: false, text: '無理な要求に「いいえ」と言える' },
    { id: 'b3', subscale: 'boundary', reverse: false, text: '自分の時間とエネルギーの境界を守る方だ' },
    { id: 'b4', subscale: 'boundary', reverse: false, text: '他人の期待のために無理に合わせない' },
    { id: 'b5', subscale: 'boundary', reverse: false, text: '誰かが一線を越えたら明確に伝える' },
    { id: 'b6', subscale: 'boundary', reverse: false, text: '罪悪感なく自分の必要を優先できる' },
    { id: 'b7', subscale: 'boundary', reverse: false, text: '対立が生じても必要なことは言う方だ' },
  ],
  zh: [
    { id: 'e1', subscale: 'express', reverse: false, text: '我倾向坦率地说出自己的意见' },
    { id: 'e2', subscale: 'express', reverse: false, text: '我能自然地表达称赞或感谢' },
    { id: 'e3', subscale: 'express', reverse: false, text: '在会议或聚会上，我能好好说出自己的想法' },
    { id: 'e4', subscale: 'express', reverse: false, text: '受到不公平的对待时，我会明确表达' },
    { id: 'e5', subscale: 'express', reverse: false, text: '我能直接提出自己想要的' },
    { id: 'e6', subscale: 'express', reverse: false, text: '即使意见不同，我也不会退缩，照样说出来' },
    { id: 'e7', subscale: 'express', reverse: false, text: '有不满时，我会适当表达，而不是憋着' },
    { id: 'b1', subscale: 'boundary', reverse: false, text: '需要拒绝请求时，我能明确拒绝' },
    { id: 'b2', subscale: 'boundary', reverse: false, text: '面对无理的要求，我能说“不”' },
    { id: 'b3', subscale: 'boundary', reverse: false, text: '我倾向守住自己时间和精力的界限' },
    { id: 'b4', subscale: 'boundary', reverse: false, text: '我不会因为别人的期待而勉强迎合' },
    { id: 'b5', subscale: 'boundary', reverse: false, text: '有人越界时，我会明确告诉对方' },
    { id: 'b6', subscale: 'boundary', reverse: false, text: '我能不带内疚地把自己的需要放在前面' },
    { id: 'b7', subscale: 'boundary', reverse: false, text: '即使发生冲突，该说的话我还是会说' },
  ],
  fr: [
    { id: 'e1', subscale: 'express', reverse: false, text: 'J’ai tendance à dire franchement mon avis' },
    { id: 'e2', subscale: 'express', reverse: false, text: 'J’exprime naturellement compliments et remerciements' },
    { id: 'e3', subscale: 'express', reverse: false, text: 'En réunion ou en groupe, je partage bien mes idées' },
    { id: 'e4', subscale: 'express', reverse: false, text: 'Quand on me traite injustement, je le dis clairement' },
    { id: 'e5', subscale: 'express', reverse: false, text: 'Je peux demander directement ce que je veux' },
    { id: 'e6', subscale: 'express', reverse: false, text: 'Même en désaccord, je parle sans me laisser intimider' },
    { id: 'e7', subscale: 'express', reverse: false, text: 'Quand quelque chose me déplaît, je l’exprime au lieu de l’accumuler' },
    { id: 'b1', subscale: 'boundary', reverse: false, text: 'Quand je dois refuser une demande, je sais refuser clairement' },
    { id: 'b2', subscale: 'boundary', reverse: false, text: 'Je peux dire « non » à une demande déraisonnable' },
    { id: 'b3', subscale: 'boundary', reverse: false, text: 'J’ai tendance à protéger les limites de mon temps et de mon énergie' },
    { id: 'b4', subscale: 'boundary', reverse: false, text: 'Je ne me force pas à répondre aux attentes des autres' },
    { id: 'b5', subscale: 'boundary', reverse: false, text: 'Quand quelqu’un dépasse les bornes, je le lui signale clairement' },
    { id: 'b6', subscale: 'boundary', reverse: false, text: 'Je peux faire passer mes besoins en premier sans culpabiliser' },
    { id: 'b7', subscale: 'boundary', reverse: false, text: 'Même en cas de conflit, je dis ce qui doit être dit' },
  ],
  es: [
    { id: 'e1', subscale: 'express', reverse: false, text: 'Suelo decir mi opinión con franqueza' },
    { id: 'e2', subscale: 'express', reverse: false, text: 'Expreso elogios y agradecimiento con naturalidad' },
    { id: 'e3', subscale: 'express', reverse: false, text: 'En reuniones o en grupo, digo bien lo que pienso' },
    { id: 'e4', subscale: 'express', reverse: false, text: 'Si me tratan injustamente, lo digo con claridad' },
    { id: 'e5', subscale: 'express', reverse: false, text: 'Puedo pedir directamente lo que quiero' },
    { id: 'e6', subscale: 'express', reverse: false, text: 'Aunque no esté de acuerdo, hablo sin achicarme' },
    { id: 'e7', subscale: 'express', reverse: false, text: 'Cuando algo me molesta, lo expreso en vez de acumularlo' },
    { id: 'b1', subscale: 'boundary', reverse: false, text: 'Cuando tengo que rechazar una petición, sé decir que no con claridad' },
    { id: 'b2', subscale: 'boundary', reverse: false, text: 'Puedo decir «no» a una exigencia excesiva' },
    { id: 'b3', subscale: 'boundary', reverse: false, text: 'Suelo proteger los límites de mi tiempo y mi energía' },
    { id: 'b4', subscale: 'boundary', reverse: false, text: 'No me fuerzo a encajar en las expectativas de los demás' },
    { id: 'b5', subscale: 'boundary', reverse: false, text: 'Cuando alguien se pasa de la raya, se lo digo claramente' },
    { id: 'b6', subscale: 'boundary', reverse: false, text: 'Puedo priorizar mis necesidades sin sentir culpa' },
    { id: 'b7', subscale: 'boundary', reverse: false, text: 'Aunque haya conflicto, digo lo que hay que decir' },
  ],
}

function calcLevel(score: number): AssertLevel {
  if (score <= 2.5) return 'passive'
  if (score <= 3.5) return 'developing'
  if (score <= 4.3) return 'assertive'
  return 'strong'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function AssertivenessTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "assertiveness", title: "AssertivenessTest", finished: Boolean(done) });

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
    const eItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'express')
    const bItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'boundary')
    const eScore = eItems.reduce((s, x) => s + x.adj, 0) / eItems.length
    const bScore = bItems.reduce((s, x) => s + x.adj, 0) / bItems.length
    const overall = (eScore + bScore) / 2
    return { eScore, bScore, overall }
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

  const { eScore, bScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const ePct = Math.round(((eScore - 1) / 4) * 100)
  const bPct = Math.round(((bScore - 1) / 4) * 100)

  const levelColors: Record<AssertLevel, string> = {
    passive: '#6ee7b7',
    developing: '#34d399',
    assertive: '#10b981',
    strong: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.expressLabel}</span>
            <span className="font-bold" style={{ color }}>{eScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={ePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.expressLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ePct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.boundaryLabel}</span>
            <span className="font-bold" style={{ color }}>{bScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={bPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.boundaryLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bPct}%`, backgroundColor: color }} />
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
