import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type BoredomLevel = 'vibrant' | 'stable' | 'slump' | 'deep'
type Subscale = 'distance' | 'routine'

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
  yourScore: string; overallLabel: string; distanceLabel: string; routineLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '연애 권태기 테스트',
    subtitle: '우리 관계, 지금 어디쯤일까? (연인·배우자가 있는 분께)',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 관계 권태 지수는',
    yourScore: '나의 관계 권태 지수',
    overallLabel: '종합 권태 지수',
    distanceLabel: '정서적 거리감',
    routineLabel: '설렘·일상 권태',
    outOf: '/ 5.0',
    tipsLabel: '관계를 위한 팁',
    note: '관계 만족도·권태 연구 개념을 바탕으로 한 자가성찰용 테스트입니다. 관계 상담이나 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Relationship Boredom Test',
    subtitle: 'Where is your relationship right now? (for those in a relationship)',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My relationship boredom score is',
    yourScore: 'Your Relationship Boredom Score',
    overallLabel: 'Overall Boredom Score',
    distanceLabel: 'Emotional Distance',
    routineLabel: 'Lost Spark & Routine',
    outOf: '/ 5.0',
    tipsLabel: 'Tips for Your Relationship',
    note: 'This self-reflection test is based on relationship satisfaction and boredom research. It does not replace couples counseling or professional assessment.',
  },
  ja: {
    title: '恋愛倦怠期テスト',
    subtitle: '今、二人の関係はどのあたり？（恋人・配偶者がいる方へ）',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の関係倦怠度は',
    yourScore: 'あなたの関係倦怠度',
    overallLabel: '総合倦怠度',
    distanceLabel: '情緒的距離',
    routineLabel: 'ときめき喪失・マンネリ',
    outOf: '/ 5.0',
    tipsLabel: '関係のためのヒント',
    note: 'このテストは関係満足度・倦怠の研究概念に基づく自己省察用です。カップルカウンセリングや専門的診断の代替ではありません。',
  },
  zh: {
    title: '感情倦怠期测验',
    subtitle: '我们现在走到哪一段了？（适合有伴侣的人）',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '偶尔如此', '经常如此', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的关系倦怠指数是',
    yourScore: '我的关系倦怠指数',
    overallLabel: '综合倦怠指数',
    distanceLabel: '情感上的距离',
    routineLabel: '心动与日常倦怠',
    outOf: '/ 5.0',
    tipsLabel: '给关系的建议',
    note: '本测验参考关系满意度与倦怠的研究概念，用于自我省思，不能替代伴侣咨询或专业评估。',
  },
  fr: {
    title: 'Test de la lassitude amoureuse',
    subtitle: 'Où en est notre relation ? (pour qui est en couple)',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon indice de lassitude',
    yourScore: 'Votre indice de lassitude',
    overallLabel: 'Indice global',
    distanceLabel: 'Distance affective',
    routineLabel: 'Émoi et routine',
    outOf: '/ 5.0',
    tipsLabel: 'Conseils pour la relation',
    note: 'Ce test reprend les notions issues des recherches sur la satisfaction et la lassitude dans le couple, à des fins de réflexion personnelle. Il ne remplace ni une thérapie de couple ni une évaluation professionnelle.',
  },
  es: {
    title: 'Test del desgaste en la pareja',
    subtitle: '¿En qué punto está nuestra relación? (para quien tiene pareja)',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi índice de desgaste',
    yourScore: 'Tu índice de desgaste',
    overallLabel: 'Índice global',
    distanceLabel: 'Distancia afectiva',
    routineLabel: 'Ilusión y rutina',
    outOf: '/ 5.0',
    tipsLabel: 'Consejos para la relación',
    note: 'Este test recoge las ideas de la investigación sobre satisfacción y desgaste en la pareja, para la reflexión personal. No sustituye una terapia de pareja ni una evaluación profesional.',
  },
}

const LEVEL_DATA: Record<BoredomLevel, Record<SupportedLang, LevelData>> = {
  vibrant: {
    ko: {
      icon: '💞',
      title: '생기 가득형',
      description: '관계가 신선하고 연결감이 높습니다. 서로에 대한 호기심과 설렘이 잘 유지되고 있습니다.',
      tips: [
        '지금의 연결감을 만든 습관(대화·스킨십)을 계속하세요.',
        '함께 새로운 경험을 더하며 설렘을 갱신하세요.',
        '감사와 칭찬을 자주 표현해 긍정 정서를 쌓으세요.',
      ],
    },
    en: {
      icon: '💞',
      title: 'Vibrant',
      description: 'Your relationship feels fresh and connected. Curiosity and spark for each other are well maintained.',
      tips: [
        'Keep the habits (talking, affection) that created this closeness.',
        'Add new shared experiences to keep the spark renewed.',
        'Express gratitude and praise often to build positive emotion.',
      ],
    },
    ja: {
      icon: '💞',
      title: '生き生き型',
      description: '関係が新鮮でつながりが強いです。お互いへの好奇心とときめきがよく保たれています。',
      tips: [
        '今のつながりを作った習慣（会話・スキンシップ）を続けましょう。',
        '新しい共有体験を加えてときめきを更新しましょう。',
        '感謝と称賛をよく表現して肯定的な感情を積みましょう。',
      ],
    },
    zh: {
      icon: '💞',
      title: '生气勃勃型',
      description: '关系新鲜，连结感也高。你们对彼此的好奇和心动，维持得不错。',
      tips: [
        '把带来这份连结的习惯（好好说话、肢体接触）继续做下去。',
        '一起加点新的体验，把心动更新一下。',
        '多表达感谢和称赞，把正向的情绪攒起来。',
      ],
    },
    fr: {
      icon: '💞',
      title: 'Relation vivante',
      description: 'La relation est fraîche et le lien est fort. La curiosité et l’émoi que vous avez l’un pour l’autre se maintiennent bien.',
      tips: [
        'Poursuivez ce qui a construit ce lien : les conversations, les gestes tendres.',
        'Ajoutez des expériences nouvelles à deux pour renouveler l’émoi.',
        'Exprimez souvent gratitude et compliments : les émotions positives s’accumulent.',
      ],
    },
    es: {
      icon: '💞',
      title: 'Relación viva',
      description: 'La relación está fresca y el vínculo es fuerte. La curiosidad y la ilusión mutuas se mantienen bien.',
      tips: [
        'Sigue con lo que construyó ese vínculo: hablar y el contacto afectuoso.',
        'Añadid experiencias nuevas juntos para renovar la ilusión.',
        'Expresad a menudo gratitud y elogios: las emociones positivas se acumulan.',
      ],
    },
  },
  stable: {
    ko: {
      icon: '🌿',
      title: '안정 정착형',
      description: '편안한 안정기에 있습니다. 권태는 낮지만, 익숙함이 무관심으로 굳지 않도록 작은 노력이 도움이 됩니다.',
      tips: [
        '안정감을 당연시하지 말고 가끔 의식적으로 표현하세요.',
        '루틴 사이에 작은 깜짝 이벤트를 끼워 넣어 보세요.',
        '서로의 변화·근황을 정기적으로 업데이트하세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Comfortably Settled',
      description: 'You are in a comfortable stable phase. Boredom is low, but small efforts help keep familiarity from hardening into indifference.',
      tips: [
        'Do not take the stability for granted—express it consciously sometimes.',
        'Slip small surprises into the routine.',
        'Regularly update each other on changes and what is new.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '安定定着型',
      description: '心地よい安定期にあります。倦怠は低いですが、慣れが無関心に固まらないよう小さな努力が役立ちます。',
      tips: [
        '安定を当然とせず、時々意識的に表現しましょう。',
        'ルーティンの間に小さなサプライズを挟みましょう。',
        'お互いの変化や近況を定期的に共有しましょう。',
      ],
    },
    zh: {
      icon: '🌿',
      title: '安定定居型',
      description: '你们处在舒服的稳定期。倦怠不高，但别让熟悉硬化成漠不关心，一点小小的用心会很有用。',
      tips: [
        '别把安稳当成理所当然，偶尔刻意说出口。',
        '在固定的节奏里，塞一点小小的惊喜。',
        '定期互相更新彼此的变化和近况。',
      ],
    },
    fr: {
      icon: '🌿',
      title: 'Stabilité installée',
      description: 'Vous êtes dans une période stable et confortable. La lassitude est faible ; veillez simplement à ce que l’habitude ne se fige pas en indifférence.',
      tips: [
        'Ne tenez pas la stabilité pour acquise : dites-le parfois à voix haute.',
        'Glissez une petite surprise entre deux routines.',
        'Prenez régulièrement des nouvelles des changements de l’autre.',
      ],
    },
    es: {
      icon: '🌿',
      title: 'Estabilidad asentada',
      description: 'Estáis en una etapa estable y cómoda. El desgaste es bajo; solo cuidad que lo conocido no se endurezca en indiferencia.',
      tips: [
        'No des la estabilidad por hecha: dilo en voz alta de vez en cuando.',
        'Mete una pequeña sorpresa entre rutinas.',
        'Poneos al día con regularidad sobre lo que va cambiando en cada uno.',
      ],
    },
  },
  slump: {
    ko: {
      icon: '🍂',
      title: '권태 초입형',
      description: '설렘이 줄고 거리감이 느껴지기 시작했습니다. 흔히 찾아오는 권태기일 수 있으며, 지금이 관계를 재점검할 좋은 시점입니다.',
      tips: [
        '쌓인 서운함을 비난 없이 "나" 중심으로 솔직히 나누세요.',
        '둘만의 새로운 활동·여행으로 공유 경험을 리셋하세요.',
        '상대의 좋은 점을 다시 의식적으로 찾아 표현하세요.',
      ],
    },
    en: {
      icon: '🍂',
      title: 'Early Slump',
      description: 'The spark has dimmed and some distance is creeping in. This may be a common boredom phase—a good moment to re-examine the relationship.',
      tips: [
        'Share built-up grievances honestly using "I" statements, without blame.',
        'Reset shared experiences with new activities or a trip together.',
        'Consciously rediscover and voice your partner\'s good qualities.',
      ],
    },
    ja: {
      icon: '🍂',
      title: '倦怠初期型',
      description: 'ときめきが減り、距離を感じ始めています。よくある倦怠期かもしれず、今が関係を見直す良いタイミングです。',
      tips: [
        '溜まった不満を非難せず「私」を主語に正直に共有しましょう。',
        '新しい活動や旅行で二人の共有体験をリセットしましょう。',
        '相手の良い点を意識的に見つけ直して表現しましょう。',
      ],
    },
    zh: {
      icon: '🍂',
      title: '倦怠初期',
      description: '心动少了，距离感开始出现。这可能是常见的倦怠期，而现在正是重新检视关系的好时机。',
      tips: [
        '把积着的委屈，用「我」的说法坦白讲出来，不带指责。',
        '用两个人的新活动或旅行，把共同的经验重置一下。',
        '有意识地重新去找对方的好，并把它说出口。',
      ],
    },
    fr: {
      icon: '🍂',
      title: 'Début de lassitude',
      description: 'L’émoi a baissé et la distance commence à se sentir. C’est souvent une phase ordinaire, et c’est le bon moment pour réexaminer la relation.',
      tips: [
        'Dites franchement les rancœurs accumulées, à la première personne, sans reproche.',
        'Remettez à zéro vos expériences communes par une activité ou un voyage à deux.',
        'Recherchez volontairement ce qui est bien chez l’autre, et dites-le.',
      ],
    },
    es: {
      icon: '🍂',
      title: 'Inicio del desgaste',
      description: 'La ilusión ha bajado y empieza a notarse la distancia. Suele ser una fase corriente, y es buen momento para revisar la relación.',
      tips: [
        'Di con franqueza lo que se ha acumulado, en primera persona y sin reproches.',
        'Reiniciad las experiencias compartidas con una actividad o un viaje a dos.',
        'Busca a propósito lo bueno del otro y dilo en voz alta.',
      ],
    },
  },
  deep: {
    ko: {
      icon: '🌫️',
      title: '깊은 권태형',
      description: '정서적 거리와 무력감이 뚜렷합니다. 관계의 방향을 진지하게 점검하고, 함께 대화하거나 도움을 구할 시점일 수 있습니다.',
      tips: [
        '회피·침묵 대신 안전한 대화의 자리를 먼저 만들어 보세요.',
        '권태가 관계 자체 때문인지, 나의 상태 때문인지 구분해 보세요.',
        '둘의 힘만으로 어렵다면 커플 상담을 고려하세요.',
      ],
    },
    en: {
      icon: '🌫️',
      title: 'Deep Boredom',
      description: 'Emotional distance and a sense of helplessness are pronounced. It may be time to seriously examine the relationship\'s direction, talk together, or seek help.',
      tips: [
        'Instead of avoidance and silence, create a safe space to talk first.',
        'Distinguish whether the boredom is about the relationship or your own state.',
        'If the two of you cannot manage alone, consider couples counseling.',
      ],
    },
    ja: {
      icon: '🌫️',
      title: '深い倦怠型',
      description: '情緒的距離と無力感がはっきりしています。関係の方向を真剣に見直し、一緒に話すか助けを求める時期かもしれません。',
      tips: [
        '回避や沈黙ではなく、まず安全な対話の場を作りましょう。',
        '倦怠が関係自体のためか、自分の状態のためかを区別しましょう。',
        '二人だけで難しければカップルカウンセリングを検討しましょう。',
      ],
    },
    zh: {
      icon: '🌫️',
      title: '深度倦怠型',
      description: '情感上的距离和无力感很明显。可能到了认真检视关系方向的时候，也可以一起谈谈，或去寻求协助。',
      tips: [
        '与其回避和沉默，不如先做出一个能安心说话的场合。',
        '分清楚：倦怠是来自关系本身，还是来自你自己的状态。',
        '靠两个人的力气不够时，考虑伴侣咨询。',
      ],
    },
    fr: {
      icon: '🌫️',
      title: 'Lassitude profonde',
      description: 'La distance affective et le découragement sont nets. Il est peut-être temps d’examiner sérieusement la direction de la relation, d’en parler ensemble ou de chercher de l’aide.',
      tips: [
        'Plutôt que d’éviter ou de vous taire, créez d’abord un cadre où l’on peut parler en sécurité.',
        'Distinguez si la lassitude vient de la relation elle-même ou de votre propre état.',
        'Si vous n’y arrivez pas à deux, envisagez une thérapie de couple.',
      ],
    },
    es: {
      icon: '🌫️',
      title: 'Desgaste profundo',
      description: 'La distancia afectiva y el desánimo son claros. Quizá sea momento de revisar en serio hacia dónde va la relación, hablarlo juntos o buscar ayuda.',
      tips: [
        'Antes que evitar o callar, crea primero un espacio donde se pueda hablar con seguridad.',
        'Distingue si el desgaste viene de la relación o de tu propio estado.',
        'Si entre los dos no alcanza, valorad terapia de pareja.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'd1', subscale: 'distance', reverse: false, text: '요즘 상대와 마음 깊은 대화를 나누는 일이 줄었다' },
    { id: 'd2', subscale: 'distance', reverse: false, text: '함께 있어도 각자 휴대폰만 볼 때가 많다' },
    { id: 'd3', subscale: 'distance', reverse: false, text: '상대의 하루가 어땠는지 별로 궁금하지 않을 때가 있다' },
    { id: 'd4', subscale: 'distance', reverse: false, text: '예전보다 스킨십이나 애정 표현이 줄었다' },
    { id: 'd5', subscale: 'distance', reverse: false, text: '갈등이 생기면 풀기보다 그냥 피하거나 침묵하게 된다' },
    { id: 'd6', subscale: 'distance', reverse: false, text: '서운한 점을 말하지 않고 그냥 넘기는 일이 많다' },
    { id: 'd7', subscale: 'distance', reverse: false, text: '혼자 있는 시간이 둘이 있는 시간보다 편할 때가 있다' },
    { id: 'r1', subscale: 'routine', reverse: false, text: '데이트나 만남이 늘 비슷해서 설렘이 줄었다' },
    { id: 'r2', subscale: 'routine', reverse: false, text: '관계가 그냥 익숙한 습관처럼 느껴진다' },
    { id: 'r3', subscale: 'routine', reverse: false, text: '함께 새로운 것을 시도하는 일이 거의 없다' },
    { id: 'r4', subscale: 'routine', reverse: false, text: '"이 관계가 이대로 괜찮은가" 생각할 때가 있다' },
    { id: 'r5', subscale: 'routine', reverse: false, text: '다른 사람이나 다른 삶이 가끔 궁금해진다' },
    { id: 'r6', subscale: 'routine', reverse: false, text: '상대와의 미래를 그려봐도 예전만큼 두근거리지 않는다' },
    { id: 'r7', subscale: 'routine', reverse: false, text: '관계에 대한 기대나 열정이 식은 것 같다' },
  ],
  en: [
    { id: 'd1', subscale: 'distance', reverse: false, text: 'We have fewer deep, heartfelt conversations these days' },
    { id: 'd2', subscale: 'distance', reverse: false, text: 'Even together, we often just look at our own phones' },
    { id: 'd3', subscale: 'distance', reverse: false, text: 'Sometimes I am not very curious about how my partner\'s day went' },
    { id: 'd4', subscale: 'distance', reverse: false, text: 'Physical affection has decreased compared to before' },
    { id: 'd5', subscale: 'distance', reverse: false, text: 'When conflict arises, I tend to avoid it or go silent rather than resolve it' },
    { id: 'd6', subscale: 'distance', reverse: false, text: 'I often let grievances slide without saying them' },
    { id: 'd7', subscale: 'distance', reverse: false, text: 'Sometimes being alone feels more comfortable than being together' },
    { id: 'r1', subscale: 'routine', reverse: false, text: 'Our dates and time together are always similar, so the spark has faded' },
    { id: 'r2', subscale: 'routine', reverse: false, text: 'The relationship feels like a familiar habit' },
    { id: 'r3', subscale: 'routine', reverse: false, text: 'We rarely try new things together' },
    { id: 'r4', subscale: 'routine', reverse: false, text: 'I sometimes wonder, "is this relationship okay as it is?"' },
    { id: 'r5', subscale: 'routine', reverse: false, text: 'I occasionally find myself curious about other people or another life' },
    { id: 'r6', subscale: 'routine', reverse: false, text: 'Picturing a future with my partner no longer excites me as it used to' },
    { id: 'r7', subscale: 'routine', reverse: false, text: 'My expectations or passion for the relationship seem to have cooled' },
  ],
  ja: [
    { id: 'd1', subscale: 'distance', reverse: false, text: '最近、相手と心の深い会話をすることが減った' },
    { id: 'd2', subscale: 'distance', reverse: false, text: '一緒にいてもそれぞれスマホばかり見ていることが多い' },
    { id: 'd3', subscale: 'distance', reverse: false, text: '相手の一日がどうだったかあまり気にならない時がある' },
    { id: 'd4', subscale: 'distance', reverse: false, text: '以前よりスキンシップや愛情表現が減った' },
    { id: 'd5', subscale: 'distance', reverse: false, text: '対立が起きると解決より避けたり沈黙したりする' },
    { id: 'd6', subscale: 'distance', reverse: false, text: '不満を言わずにそのまま流すことが多い' },
    { id: 'd7', subscale: 'distance', reverse: false, text: '一人の時間の方が二人の時間より楽な時がある' },
    { id: 'r1', subscale: 'routine', reverse: false, text: 'デートや会い方がいつも似ていてときめきが減った' },
    { id: 'r2', subscale: 'routine', reverse: false, text: '関係がただ慣れた習慣のように感じる' },
    { id: 'r3', subscale: 'routine', reverse: false, text: '一緒に新しいことを試すことがほとんどない' },
    { id: 'r4', subscale: 'routine', reverse: false, text: '「この関係はこのままでいいのか」と考える時がある' },
    { id: 'r5', subscale: 'routine', reverse: false, text: '他の人や別の人生が時々気になる' },
    { id: 'r6', subscale: 'routine', reverse: false, text: '相手との未来を描いても以前ほどときめかない' },
    { id: 'r7', subscale: 'routine', reverse: false, text: '関係への期待や情熱が冷めた気がする' },
  ],
  zh: [
    { id: 'd1', subscale: 'distance', reverse: false, text: '最近和对方交心的对话变少了' },
    { id: 'd2', subscale: 'distance', reverse: false, text: '就算待在一起，也常常各看各的手机' },
    { id: 'd3', subscale: 'distance', reverse: false, text: '有时候对他今天过得怎样，我提不起兴趣' },
    { id: 'd4', subscale: 'distance', reverse: false, text: '比起以前，肢体接触或表达爱意都少了' },
    { id: 'd5', subscale: 'distance', reverse: false, text: '起了冲突，比起解开，我更常回避或沉默' },
    { id: 'd6', subscale: 'distance', reverse: false, text: '心里委屈的地方，我常常不说，就这样过去' },
    { id: 'd7', subscale: 'distance', reverse: false, text: '有时候一个人待着，比两个人待着更自在' },
    { id: 'r1', subscale: 'routine', reverse: false, text: '约会或见面总是差不多，心动的感觉少了' },
    { id: 'r2', subscale: 'routine', reverse: false, text: '这段关系，有时候感觉只是熟悉的习惯' },
    { id: 'r3', subscale: 'routine', reverse: false, text: '我们几乎不再一起尝试新的东西' },
    { id: 'r4', subscale: 'routine', reverse: false, text: '我有时候会想「这样下去真的好吗」' },
    { id: 'r5', subscale: 'routine', reverse: false, text: '偶尔会好奇别人，或另一种生活' },
    { id: 'r6', subscale: 'routine', reverse: false, text: '想到和对方的未来，也不像从前那样心跳了' },
    { id: 'r7', subscale: 'routine', reverse: false, text: '我对这段关系的期待或热情，好像凉了' },
  ],
  fr: [
    { id: 'd1', subscale: 'distance', reverse: false, text: 'Ces temps-ci, les conversations profondes avec l’autre se sont raréfiées' },
    { id: 'd2', subscale: 'distance', reverse: false, text: 'Même ensemble, nous regardons souvent chacun notre téléphone' },
    { id: 'd3', subscale: 'distance', reverse: false, text: 'Il m’arrive de ne pas avoir envie de savoir comment s’est passée sa journée' },
    { id: 'd4', subscale: 'distance', reverse: false, text: 'Les gestes tendres et les marques d’affection ont diminué' },
    { id: 'd5', subscale: 'distance', reverse: false, text: 'En cas de conflit, j’évite ou je me tais plutôt que de régler les choses' },
    { id: 'd6', subscale: 'distance', reverse: false, text: 'Je garde souvent pour moi ce qui m’a blessé' },
    { id: 'd7', subscale: 'distance', reverse: false, text: 'Il m’arrive d’être plus à l’aise seul qu’à deux' },
    { id: 'r1', subscale: 'routine', reverse: false, text: 'Nos sorties se ressemblent toutes et l’émoi s’est émoussé' },
    { id: 'r2', subscale: 'routine', reverse: false, text: 'La relation ressemble parfois à une habitude familière' },
    { id: 'r3', subscale: 'routine', reverse: false, text: 'Nous n’essayons presque plus rien de nouveau ensemble' },
    { id: 'r4', subscale: 'routine', reverse: false, text: 'Il m’arrive de me demander si cela peut continuer ainsi' },
    { id: 'r5', subscale: 'routine', reverse: false, text: 'Je me demande parfois à quoi ressemblerait une autre vie, ou quelqu’un d’autre' },
    { id: 'r6', subscale: 'routine', reverse: false, text: 'Imaginer l’avenir avec l’autre ne me fait plus le même effet' },
    { id: 'r7', subscale: 'routine', reverse: false, text: 'Mes attentes et mon enthousiasme pour cette relation semblent refroidis' },
  ],
  es: [
    { id: 'd1', subscale: 'distance', reverse: false, text: 'Últimamente hemos hablado menos de cosas hondas' },
    { id: 'd2', subscale: 'distance', reverse: false, text: 'Aunque estemos juntos, a menudo cada uno mira su móvil' },
    { id: 'd3', subscale: 'distance', reverse: false, text: 'A veces no me apetece saber cómo le ha ido el día' },
    { id: 'd4', subscale: 'distance', reverse: false, text: 'Los gestos de cariño y el contacto han disminuido' },
    { id: 'd5', subscale: 'distance', reverse: false, text: 'Ante un conflicto, evito o me callo en vez de resolverlo' },
    { id: 'd6', subscale: 'distance', reverse: false, text: 'A menudo me guardo lo que me ha dolido' },
    { id: 'd7', subscale: 'distance', reverse: false, text: 'A veces estoy más a gusto solo que en pareja' },
    { id: 'r1', subscale: 'routine', reverse: false, text: 'Las citas se parecen todas y la ilusión ha bajado' },
    { id: 'r2', subscale: 'routine', reverse: false, text: 'La relación a veces parece solo una costumbre conocida' },
    { id: 'r3', subscale: 'routine', reverse: false, text: 'Casi no probamos nada nuevo juntos' },
    { id: 'r4', subscale: 'routine', reverse: false, text: 'A veces me pregunto si esto puede seguir así' },
    { id: 'r5', subscale: 'routine', reverse: false, text: 'A veces me pregunto cómo sería otra vida, u otra persona' },
    { id: 'r6', subscale: 'routine', reverse: false, text: 'Imaginar el futuro con mi pareja ya no me hace el mismo efecto' },
    { id: 'r7', subscale: 'routine', reverse: false, text: 'Mis expectativas y mi entusiasmo por la relación parecen enfriados' },
  ],
}

function calcLevel(score: number): BoredomLevel {
  if (score <= 2.3) return 'vibrant'
  if (score <= 3.2) return 'stable'
  if (score <= 4.0) return 'slump'
  return 'deep'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function RelationshipBoredomTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "relationship-boredom", title: "RelationshipBoredomTest", finished: Boolean(done) });

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
    const dItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'distance')
    const rItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'routine')
    const dScore = dItems.reduce((s, x) => s + x.adj, 0) / dItems.length
    const rScore = rItems.reduce((s, x) => s + x.adj, 0) / rItems.length
    const overall = (dScore + rScore) / 2
    return { dScore, rScore, overall }
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

  const { dScore, rScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const dPct = Math.round(((dScore - 1) / 4) * 100)
  const rPct = Math.round(((rScore - 1) / 4) * 100)

  const levelColors: Record<BoredomLevel, string> = {
    vibrant: '#ec4899',
    stable: '#10b981',
    slump: '#f59e0b',
    deep: '#6b7280',
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
            <span className="font-bold text-muted-foreground">{lb.distanceLabel}</span>
            <span className="font-bold" style={{ color }}>{dScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={dPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.distanceLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.routineLabel}</span>
            <span className="font-bold" style={{ color }}>{rScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={rPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.routineLabel}
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
