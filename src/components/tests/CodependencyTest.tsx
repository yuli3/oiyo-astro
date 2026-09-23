import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire';
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

type ResultKey = 'independent' | 'some' | 'notable' | 'strong'

interface Question { id: string; text: string }
interface ResultData {
  title: string
  subtitle: string
  description: string
  patterns: string[]
  steps: string[]
  note: string
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
  yourResult: string
  scoreLabel: string
  outOf: string
  patterns: string
  steps: string
  warning: string
  affirmation: string
  disclaimer: string
}> = {
  ko: {
    title: '공동의존 성향 테스트',
    subtitle: '나는 관계에서 나를 잃고 있나요?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 없다', '거의 없다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 공동의존 성향은',
    yourResult: '나의 결과',
    scoreLabel: '공동의존 점수',
    outOf: '/ 60점',
    patterns: '나타나는 패턴',
    steps: '회복을 위한 첫 걸음',
    warning: '참고',
    affirmation: '오늘의 메시지',
    disclaimer: '이 테스트는 자기 이해를 위한 도구이며 전문 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Codependency Test',
    subtitle: 'Are You Losing Yourself in Relationships?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My codependency score is',
    yourResult: 'Your Result',
    scoreLabel: 'Codependency Score',
    outOf: '/ 60',
    patterns: 'Patterns Present',
    steps: 'First Steps Toward Recovery',
    warning: 'Note',
    affirmation: "Today's Message",
    disclaimer: 'This test is a self-awareness tool and does not replace professional diagnosis.',
  },
  ja: {
    title: '共依存傾向テスト',
    subtitle: '関係の中で自分を失っていますか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', 'たまにある', 'よくある', 'いつもそうだ'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の共依存スコアは',
    yourResult: '結果',
    scoreLabel: '共依存スコア',
    outOf: '/ 60点',
    patterns: '現れているパターン',
    steps: '回復への第一歩',
    warning: '注意',
    affirmation: '今日のメッセージ',
    disclaimer: 'このテストは自己理解のためのツールであり、専門的診断の代替ではありません。',
  },
  zh: {
    title: '共依存倾向测验',
    subtitle: '我在关系里失去自己了吗？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['从未', '很少', '有时如此', '经常如此', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的共依存倾向是',
    yourResult: '我的结果',
    scoreLabel: '共依存分数',
    outOf: '/ 60 分',
    patterns: '出现的模式',
    steps: '走向恢复的第一步',
    warning: '参考',
    affirmation: '今天想对你说',
    disclaimer: '本测验是帮助认识自己的工具，不能替代专业诊断。',
  },
  fr: {
    title: 'Test de tendance à la codépendance',
    subtitle: 'Est-ce que je me perds dans mes relations ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Ma tendance à la codépendance',
    yourResult: 'Mon résultat',
    scoreLabel: 'Score de codépendance',
    outOf: '/ 60 points',
    patterns: 'Schémas observés',
    steps: 'Premiers pas vers le rétablissement',
    warning: 'À noter',
    affirmation: 'Le message du jour',
    disclaimer: 'Ce test est un outil pour mieux se connaître ; il ne remplace pas un diagnostic professionnel.',
  },
  es: {
    title: 'Test de tendencia a la codependencia',
    subtitle: '¿Me pierdo a mí mismo en mis relaciones?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Casi nunca', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tendencia a la codependencia',
    yourResult: 'Mi resultado',
    scoreLabel: 'Puntuación de codependencia',
    outOf: '/ 60 puntos',
    patterns: 'Patrones que aparecen',
    steps: 'Primeros pasos hacia la recuperación',
    warning: 'Nota',
    affirmation: 'Mensaje de hoy',
    disclaimer: 'Este test es una herramienta para conocerte mejor; no sustituye un diagnóstico profesional.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '상대방이 화가 났을 때, 그것이 내 잘못인지 계속 생각한다' },
    { id: 'q2', text: '상대방의 기분을 위해 내 감정이나 의견을 숨기는 편이다' },
    { id: 'q3', text: '관계에서 갈등이 생기면 주로 내가 먼저 사과한다' },
    { id: 'q4', text: '상대방이 나를 필요로 할 때 거절하기 매우 어렵다' },
    { id: 'q5', text: '상대방의 문제를 해결해 주지 않으면 불안하거나 죄책감이 든다' },
    { id: 'q6', text: '관계가 잘못될까봐 내 진짜 감정을 숨기는 경우가 많다' },
    { id: 'q7', text: '상대방의 인정이나 칭찬이 없으면 내 가치가 낮게 느껴진다' },
    { id: 'q8', text: '상대방을 변화시키거나 고치려는 노력에 많은 에너지를 쏟는다' },
    { id: 'q9', text: '내가 없으면 상대방이 잘 살아가지 못할 것 같다는 생각이 든다' },
    { id: 'q10', text: '상대방의 감정이 나의 하루를 크게 좌우한다' },
    { id: 'q11', text: '나보다 상대방의 필요가 더 중요하다고 느낀다' },
    { id: 'q12', text: '관계를 위해 나의 중요한 계획이나 목표를 포기한 적이 있다' },
    { id: 'q13', text: '상대방이 나에게 실망하지 않도록 지나치게 신경 쓴다' },
    { id: 'q14', text: '혼자 있는 것이 불편하고 항상 연결되어 있어야 한다고 느낀다' },
    { id: 'q15', text: '관계 밖에서 나 자신이 누구인지 잘 모르겠다' },
  ],
  en: [
    { id: 'q1', text: "When my partner is upset, I constantly wonder if it's my fault" },
    { id: 'q2', text: 'I tend to hide my feelings or opinions to keep the other person happy' },
    { id: 'q3', text: 'When conflict arises, I am usually the first to apologize' },
    { id: 'q4', text: 'It is very difficult for me to say no when someone needs me' },
    { id: 'q5', text: "I feel anxious or guilty if I don't solve the other person's problems" },
    { id: 'q6', text: 'I often hide my true feelings out of fear of damaging the relationship' },
    { id: 'q7', text: "Without the other person's approval or praise, I feel worthless" },
    { id: 'q8', text: 'I put a lot of energy into trying to change or fix the other person' },
    { id: 'q9', text: "I sometimes feel the other person couldn't manage well without me" },
    { id: 'q10', text: "The other person's moods significantly determine how my day goes" },
    { id: 'q11', text: "I feel the other person's needs are more important than mine" },
    { id: 'q12', text: 'I have given up important plans or goals for the sake of a relationship' },
    { id: 'q13', text: 'I worry excessively about not disappointing the other person' },
    { id: 'q14', text: 'Being alone feels uncomfortable and I feel I must always be connected' },
    { id: 'q15', text: 'Outside of relationships, I am not sure who I am' },
  ],
  ja: [
    { id: 'q1', text: '相手が怒っているとき、それが自分のせいかと絶えず考える' },
    { id: 'q2', text: '相手を喜ばせるために、自分の感情や意見を隠す傾向がある' },
    { id: 'q3', text: '衝突が起きると、たいてい自分から先に謝る' },
    { id: 'q4', text: '相手が自分を必要としているとき、断ることがとても難しい' },
    { id: 'q5', text: '相手の問題を解決しないと、不安や罪悪感を感じる' },
    { id: 'q6', text: '関係を壊すのが怖くて、本当の感情を隠すことが多い' },
    { id: 'q7', text: '相手の承認や称賛がないと、自分の価値が低く感じる' },
    { id: 'q8', text: '相手を変えたり直そうとすることに多くのエネルギーを注ぐ' },
    { id: 'q9', text: '自分がいなければ相手はうまく生きていけないと思うことがある' },
    { id: 'q10', text: '相手の気分が自分の一日を大きく左右する' },
    { id: 'q11', text: '相手のニーズの方が自分のニーズより重要だと感じる' },
    { id: 'q12', text: '関係のために重要な計画や目標を諦めたことがある' },
    { id: 'q13', text: '相手を失望させないように過度に気を遣う' },
    { id: 'q14', text: '一人でいることが不安で、常に繋がっていなければならないと感じる' },
    { id: 'q15', text: '関係の外で自分が誰なのかよくわからない' },
  ],
  zh: [
    { id: 'q1', text: '对方生气时，我会一直想是不是我的错' },
    { id: 'q2', text: '为了对方的心情，我常常藏起自己的感受或意见' },
    { id: 'q3', text: '关系里起冲突时，通常是我先道歉' },
    { id: 'q4', text: '对方需要我时，我很难拒绝' },
    { id: 'q5', text: '如果不帮对方解决问题，我会不安或内疚' },
    { id: 'q6', text: '我常常怕关系出问题而隐藏真实的感受' },
    { id: 'q7', text: '得不到对方的认可或称赞，就觉得自己没价值' },
    { id: 'q8', text: '我花很多精力想改变或“修好”对方' },
    { id: 'q9', text: '我会觉得没有我，对方就过不好' },
    { id: 'q10', text: '对方的情绪很大程度上左右我的一天' },
    { id: 'q11', text: '我觉得对方的需要比我的更重要' },
    { id: 'q12', text: '我曾经为了关系放弃自己重要的计划或目标' },
    { id: 'q13', text: '我过度在意，生怕对方对我失望' },
    { id: 'q14', text: '一个人待着很不自在，觉得必须一直和人连结' },
    { id: 'q15', text: '离开关系之后，我不太清楚自己是谁' },
  ],
  fr: [
    { id: 'q1', text: 'Quand l’autre est en colère, je me demande sans cesse si c’est ma faute' },
    { id: 'q2', text: 'Je cache souvent mes émotions ou mon avis pour ménager l’humeur de l’autre' },
    { id: 'q3', text: 'En cas de conflit, c’est surtout moi qui m’excuse en premier' },
    { id: 'q4', text: 'J’ai beaucoup de mal à refuser quand l’autre a besoin de moi' },
    { id: 'q5', text: 'Si je ne règle pas les problèmes de l’autre, je me sens anxieux ou coupable' },
    { id: 'q6', text: 'Je cache souvent mes vrais sentiments de peur que la relation tourne mal' },
    { id: 'q7', text: 'Sans la reconnaissance ou les compliments de l’autre, je me sens sans valeur' },
    { id: 'q8', text: 'Je consacre beaucoup d’énergie à essayer de changer ou de « réparer » l’autre' },
    { id: 'q9', text: 'J’ai l’impression que sans moi, l’autre ne s’en sortirait pas' },
    { id: 'q10', text: 'Les émotions de l’autre déterminent largement ma journée' },
    { id: 'q11', text: 'Je sens que les besoins de l’autre comptent plus que les miens' },
    { id: 'q12', text: 'J’ai déjà renoncé à des projets ou objectifs importants pour la relation' },
    { id: 'q13', text: 'Je fais très attention à ne jamais décevoir l’autre' },
    { id: 'q14', text: 'Être seul me met mal à l’aise ; je sens que je dois toujours être en lien' },
    { id: 'q15', text: 'En dehors de la relation, je ne sais pas bien qui je suis' },
  ],
  es: [
    { id: 'q1', text: 'Cuando el otro se enfada, no dejo de pensar si es culpa mía' },
    { id: 'q2', text: 'Suelo ocultar mis emociones u opiniones por el estado de ánimo del otro' },
    { id: 'q3', text: 'Cuando hay un conflicto, casi siempre soy yo quien se disculpa primero' },
    { id: 'q4', text: 'Me cuesta mucho decir que no cuando el otro me necesita' },
    { id: 'q5', text: 'Si no resuelvo los problemas del otro, me siento ansioso o culpable' },
    { id: 'q6', text: 'A menudo oculto lo que siento de verdad por miedo a que la relación vaya mal' },
    { id: 'q7', text: 'Sin el reconocimiento o los elogios del otro, siento que valgo poco' },
    { id: 'q8', text: 'Dedico mucha energía a intentar cambiar o «arreglar» al otro' },
    { id: 'q9', text: 'Siento que sin mí, el otro no saldría adelante' },
    { id: 'q10', text: 'Las emociones del otro determinan en gran parte mi día' },
    { id: 'q11', text: 'Siento que las necesidades del otro importan más que las mías' },
    { id: 'q12', text: 'He renunciado a planes u objetivos importantes por la relación' },
    { id: 'q13', text: 'Me preocupo en exceso por no decepcionar al otro' },
    { id: 'q14', text: 'Estar solo me incomoda; siento que siempre debo estar conectado' },
    { id: 'q15', text: 'Fuera de la relación, no sé bien quién soy' },
  ],
}

const RESULTS: Record<ResultKey, Record<SupportedLang, ResultData>> = {
  independent: {
    ko: {
      title: '독립적인 성향', subtitle: '관계에서도 자신을 잘 지킵니다',
      description: '당신은 관계 안에서도 자신의 정체성과 경계를 건강하게 유지합니다. 타인과의 연결을 소중히 하면서도 자기 자신을 잃지 않는 균형을 가지고 있습니다.',
      patterns: ['건강한 자기 경계', '독립적 정체성 유지', '상호 존중하는 관계 선호'],
      steps: ['현재의 건강한 경계를 의도적으로 유지', '관계에서의 성장 기회 탐색', '필요할 때 도움 요청하기'],
      note: '현재 건강한 독립성을 보이지만, 관계에서의 자기 인식을 지속적으로 점검하는 것이 좋습니다.',
      affirmation: '자신을 지키면서도 사랑하는 당신은 관계를 더 풍요롭게 만들 수 있습니다.',
    },
    en: {
      title: 'Independent', subtitle: 'You maintain yourself well in relationships',
      description: 'You maintain your identity and boundaries healthily even within relationships. You value connection with others while keeping a balance that does not lose yourself.',
      patterns: ['Healthy personal boundaries', 'Maintains independent identity', 'Prefers mutually respectful relationships'],
      steps: ['Intentionally maintain your current healthy boundaries', 'Explore growth opportunities in relationships', 'Ask for help when you need it'],
      note: 'You show healthy independence now, but continuous self-awareness in relationships is always valuable.',
      affirmation: 'By protecting yourself while loving others, you make relationships richer for everyone.',
    },
    ja: {
      title: '自立した性格', subtitle: '関係の中でも自分をうまく守れています',
      description: '関係の中でも自分のアイデンティティと境界を健全に維持しています。他者とのつながりを大切にしながら、自分を失わないバランスを持っています。',
      patterns: ['健全な自己境界', '独立したアイデンティティの維持', '相互尊重する関係を好む'],
      steps: ['現在の健全な境界を意図的に維持する', '関係における成長の機会を探る', '必要なときに助けを求める'],
      note: '現在は健全な自立性を示していますが、関係における自己認識を継続的に確認することが大切です。',
      affirmation: '自分を守りながら愛することで、あなたはより豊かな関係を築けます。',
    },
    zh: {
      title: '独立型倾向', subtitle: '在关系中也能好好守住自己',
      description: '你在关系中也能健康地保有自己的身份和界限。既珍惜与人的连结，又不会失去自己，平衡得很好。',
      patterns: ['健康的自我界限', '保持独立的身份认同', '偏好相互尊重的关系'],
      steps: ['有意识地维持现在健康的界限', '探索在关系中成长的机会', '需要时向人求助'],
      note: '现在展现出健康的独立性，但持续检视自己在关系中的觉察会更好。',
      affirmation: '守住自己又懂得爱人的你，能让关系更丰盈。',
    },
    fr: {
      title: 'Tendance indépendante', subtitle: 'Vous restez vous-même dans vos relations',
      description: 'Vous gardez une identité et des limites saines au sein de vos relations. Vous tenez au lien avec les autres sans vous perdre : un bel équilibre.',
      patterns: ['Des limites personnelles saines', 'Une identité propre préservée', 'Une préférence pour les relations de respect mutuel'],
      steps: ['Entretenir consciemment ces limites saines', 'Explorer les occasions de grandir dans la relation', 'Demander de l’aide quand il le faut'],
      note: 'Votre indépendance est saine ; il reste utile de continuer à observer comment vous êtes dans vos relations.',
      affirmation: 'En prenant soin de vous tout en aimant, vous enrichissez vos relations.',
    },
    es: {
      title: 'Tendencia independiente', subtitle: 'También en tus relaciones sigues siendo tú',
      description: 'Mantienes una identidad y unos límites sanos dentro de tus relaciones. Valoras el vínculo con los demás sin perderte: un buen equilibrio.',
      patterns: ['Límites personales sanos', 'Identidad propia preservada', 'Preferencia por relaciones de respeto mutuo'],
      steps: ['Mantener conscientemente estos límites sanos', 'Explorar oportunidades de crecer en la relación', 'Pedir ayuda cuando haga falta'],
      note: 'Muestras una independencia sana, pero conviene seguir revisando cómo te percibes en tus relaciones.',
      affirmation: 'Cuidándote y amando a la vez, enriqueces tus relaciones.',
    },
  },
  some: {
    ko: {
      title: '약간의 공동의존 경향', subtitle: '몇 가지 패턴이 나타납니다',
      description: '일부 공동의존적 패턴이 나타납니다. 타인에 대한 배려심이 강점이지만, 때로는 자신의 필요보다 타인의 필요를 과도하게 우선시하는 경향이 있습니다.',
      patterns: ['타인의 감정에 과도하게 반응', '거절하기 어려움', '관계에서의 자기 억제'],
      steps: ['자신의 감정과 필요에 이름 붙이기', '작은 "노"부터 연습하기', '혼자만의 시간 의식적으로 만들기'],
      note: '이 패턴들은 매우 일반적이며, 인식하는 것만으로도 변화의 시작이 됩니다.',
      affirmation: '당신의 필요도 관계만큼 중요합니다. 자신을 돌보는 것이 관계를 더 건강하게 만듭니다.',
    },
    en: {
      title: 'Some Codependent Tendencies', subtitle: 'A few patterns are present',
      description: 'Some codependent patterns appear. Your care for others is a strength, but you may sometimes overly prioritize others\' needs above your own.',
      patterns: ['Overreacting to others\' emotions', 'Difficulty saying no', 'Self-suppression in relationships'],
      steps: ['Name your own feelings and needs', 'Practice small "nos" first', 'Consciously create time for yourself'],
      note: 'These patterns are very common, and simply recognizing them is the beginning of change.',
      affirmation: "Your needs matter just as much as the relationship. Taking care of yourself makes relationships healthier.",
    },
    ja: {
      title: '若干の共依存傾向', subtitle: 'いくつかのパターンが現れています',
      description: '一部の共依存的パターンが見られます。他者への思いやりは強みですが、時に自分のニーズより他者のニーズを過度に優先する傾向があります。',
      patterns: ['他者の感情への過剰反応', '断ることの難しさ', '関係における自己抑制'],
      steps: ['自分の感情とニーズに名前をつける', '小さな「ノー」から練習する', '一人の時間を意識的に作る'],
      note: 'これらのパターンはとても一般的で、認識するだけでも変化の始まりになります。',
      affirmation: 'あなたのニーズも関係と同じくらい大切です。自分を大切にすることで関係はより健全になります。',
    },
    zh: {
      title: '略有共依存倾向', subtitle: '出现了几个模式',
      description: '出现了一些共依存的模式。体贴他人是你的优势，但有时会过度把别人的需要放在自己之前。',
      patterns: ['对他人的情绪反应过度', '难以拒绝', '在关系中压抑自己'],
      steps: ['为自己的感受和需要命名', '从小小的“不”开始练习', '有意识地安排独处时间'],
      note: '这些模式非常常见，光是察觉到就是改变的开始。',
      affirmation: '你的需要和关系一样重要。照顾好自己，会让关系更健康。',
    },
    fr: {
      title: 'Légère tendance à la codépendance', subtitle: 'Quelques schémas apparaissent',
      description: 'Quelques schémas de codépendance apparaissent. Votre attention aux autres est une force, mais il vous arrive de faire passer leurs besoins bien avant les vôtres.',
      patterns: ['Réaction excessive aux émotions des autres', 'Difficulté à refuser', 'Effacement de soi dans la relation'],
      steps: ['Nommer ses propres émotions et besoins', 'S’entraîner avec de petits « non »', 'Se réserver consciemment du temps seul'],
      note: 'Ces schémas sont très courants ; les repérer est déjà le début du changement.',
      affirmation: 'Vos besoins comptent autant que la relation. Prendre soin de vous la rend plus saine.',
    },
    es: {
      title: 'Ligera tendencia a la codependencia', subtitle: 'Aparecen algunos patrones',
      description: 'Aparecen algunos patrones de codependencia. Tu consideración por los demás es una fortaleza, pero a veces antepones demasiado sus necesidades a las tuyas.',
      patterns: ['Reacción excesiva a las emociones ajenas', 'Dificultad para decir que no', 'Autocontención en la relación'],
      steps: ['Poner nombre a tus emociones y necesidades', 'Practicar con pequeños «no»', 'Reservarte conscientemente tiempo a solas'],
      note: 'Estos patrones son muy comunes; reconocerlos ya es el inicio del cambio.',
      affirmation: 'Tus necesidades importan tanto como la relación. Cuidarte la hace más sana.',
    },
  },
  notable: {
    ko: {
      title: '뚜렷한 공동의존 패턴', subtitle: '관계 안에서 자신을 잃고 있을 수 있습니다',
      description: '공동의존적 패턴이 뚜렷하게 나타납니다. 관계를 유지하기 위해 자신의 감정, 필요, 목표를 반복적으로 희생하고 있을 가능성이 높습니다.',
      patterns: ['자아 정체성의 희미해짐', '타인 감정에 과도한 책임감', '거절에 대한 강한 두려움', '관계 밖 자아의 불명확성'],
      steps: ['신뢰할 수 있는 상담사와 이야기하기', '자신의 필요 목록 만들어 보기', '관계 밖 개인적 목표 재설정', '자기 존중감 강화 활동 시작'],
      note: '공동의존은 성격 결함이 아닙니다. 종종 과거 경험에서 배운 생존 전략입니다.',
      affirmation: '당신은 사랑받기 위해 자신을 지워야 할 필요가 없습니다. 당신 그 자체로 충분합니다.',
    },
    en: {
      title: 'Notable Codependency Patterns', subtitle: 'You may be losing yourself in relationships',
      description: 'Codependent patterns appear clearly. It is likely that you are repeatedly sacrificing your feelings, needs, and goals to maintain relationships.',
      patterns: ['Fading sense of self', 'Excessive responsibility for others\' emotions', 'Strong fear of rejection', 'Unclear identity outside relationships'],
      steps: ['Talk to a trustworthy counselor', 'Write a list of your own needs', 'Reset personal goals outside of relationships', 'Start activities that build self-esteem'],
      note: 'Codependency is not a character flaw. It is often a survival strategy learned from past experiences.',
      affirmation: "You don't need to erase yourself to be loved. You are enough exactly as you are.",
    },
    ja: {
      title: '顕著な共依存パターン', subtitle: '関係の中で自分を失っているかもしれません',
      description: '共依存的パターンが明確に現れています。関係を維持するために、自分の感情、ニーズ、目標を繰り返し犠牲にしている可能性が高いです。',
      patterns: ['自己アイデンティティの薄れ', '他者の感情への過度な責任感', '拒絶への強い恐怖', '関係の外での自己の不明確さ'],
      steps: ['信頼できるカウンセラーと話す', '自分のニーズリストを作る', '関係の外の個人的目標を再設定する', '自己尊重感を高める活動を始める'],
      note: '共依存は性格の欠陥ではありません。過去の経験から学んだ生存戦略であることが多いです。',
      affirmation: '愛されるために自分を消す必要はありません。あなたはそのままで十分です。',
    },
    zh: {
      title: '明显的共依存模式', subtitle: '你可能在关系中失去了自己',
      description: '共依存模式表现明显。你很可能为了维持关系，反复牺牲自己的感受、需要和目标。',
      patterns: ['自我认同变得模糊', '对他人情绪负有过度的责任感', '对拒绝的强烈恐惧', '离开关系后自我不清晰'],
      steps: ['和可信任的咨询师谈谈', '试着列出自己的需要清单', '重新设定关系之外的个人目标', '开始做增强自尊的活动'],
      note: '共依存不是性格缺陷，往往是从过去经验中学到的生存策略。',
      affirmation: '你不必为了被爱而抹去自己。你本身就已足够。',
    },
    fr: {
      title: 'Schémas de codépendance marqués', subtitle: 'Vous vous perdez peut-être dans la relation',
      description: 'Les schémas de codépendance sont nets. Il est probable que vous sacrifiiez régulièrement vos émotions, besoins et objectifs pour préserver la relation.',
      patterns: ['Une identité qui s’estompe', 'Une responsabilité excessive envers les émotions des autres', 'Une forte peur du rejet', 'Un soi flou en dehors de la relation'],
      steps: ['En parler à un thérapeute de confiance', 'Dresser la liste de ses propres besoins', 'Redéfinir des objectifs personnels hors de la relation', 'Commencer des activités qui renforcent l’estime de soi'],
      note: 'La codépendance n’est pas un défaut de caractère. C’est souvent une stratégie de survie apprise par le passé.',
      affirmation: 'Vous n’avez pas à vous effacer pour être aimé. Vous suffisez tel que vous êtes.',
    },
    es: {
      title: 'Patrones de codependencia marcados', subtitle: 'Puede que te estés perdiendo en la relación',
      description: 'Los patrones de codependencia son claros. Es probable que sacrifiques una y otra vez tus emociones, necesidades y objetivos para mantener la relación.',
      patterns: ['Una identidad que se difumina', 'Responsabilidad excesiva por las emociones ajenas', 'Fuerte miedo al rechazo', 'Un yo poco claro fuera de la relación'],
      steps: ['Hablar con un terapeuta de confianza', 'Hacer una lista de tus propias necesidades', 'Redefinir objetivos personales fuera de la relación', 'Empezar actividades que refuercen la autoestima'],
      note: 'La codependencia no es un defecto de carácter. A menudo es una estrategia de supervivencia aprendida en el pasado.',
      affirmation: 'No tienes que borrarte para que te quieran. Tal como eres, ya es suficiente.',
    },
  },
  strong: {
    ko: {
      title: '강한 공동의존 성향', subtitle: '전문적인 지원이 도움이 될 수 있습니다',
      description: '공동의존 성향이 매우 강하게 나타납니다. 관계를 통해 자신의 가치를 확인하고, 타인의 감정에 극도로 민감하게 반응하며, 자신의 필요는 거의 돌보지 못하고 있을 수 있습니다.',
      patterns: ['관계 없이는 자아가 없다고 느낌', '타인 통제 또는 구원 패턴', '극단적인 거절 두려움', '자기 자신을 돌보는 것에 대한 죄책감'],
      steps: ['전문 심리 상담 강력 권고', '자신의 감정 일기 쓰기 시작', '지지 그룹 또는 커뮤니티 참여', '자기 돌봄을 이기심이 아닌 필수로 재정의'],
      note: '이 수준의 공동의존은 어린 시절의 경험이나 트라우마와 연관되는 경우가 많습니다. 혼자 해결하려 하지 마세요.',
      affirmation: '당신은 도움을 받을 자격이 있습니다. 변화는 가능하고, 당신은 더 나은 관계를 누릴 자격이 있습니다.',
    },
    en: {
      title: 'Strong Codependency', subtitle: 'Professional support may be very helpful',
      description: 'Very strong codependency patterns are present. You may be determining your self-worth through relationships, reacting extremely sensitively to others\' emotions, and barely caring for your own needs.',
      patterns: ['Feeling no self without relationships', 'Controlling or rescuing patterns', 'Extreme fear of rejection', 'Guilt about caring for yourself'],
      steps: ['Strongly recommend professional counseling', 'Start keeping an emotions journal', 'Join a support group or community', 'Redefine self-care as essential, not selfish'],
      note: 'Codependency at this level is often linked to childhood experiences or trauma. Please do not try to resolve it alone.',
      affirmation: 'You deserve support. Change is possible, and you deserve healthier relationships.',
    },
    ja: {
      title: '強い共依存傾向', subtitle: '専門的なサポートが役立つかもしれません',
      description: '共依存傾向が非常に強く現れています。関係を通じて自分の価値を確認し、他者の感情に極度に敏感に反応し、自分のニーズはほとんど顧みられていない可能性があります。',
      patterns: ['関係なしでは自己がないと感じる', 'コントロールまたは救済パターン', '拒絶への極度の恐怖', '自分を大切にすることへの罪悪感'],
      steps: ['専門的な心理カウンセリングを強く推奨', '感情日記をつけ始める', 'サポートグループやコミュニティに参加する', 'セルフケアを利己的でなく必須として再定義する'],
      note: 'このレベルの共依存は幼少期の経験やトラウマと関連していることが多いです。一人で解決しようとしないでください。',
      affirmation: 'あなたはサポートを受ける価値があります。変化は可能で、あなたはより良い関係を享受する価値があります。',
    },
    zh: {
      title: '强烈的共依存倾向', subtitle: '专业支持可能会有帮助',
      description: '共依存倾向表现非常强烈。你可能通过关系来确认自己的价值，对他人情绪极度敏感，却几乎顾不上自己的需要。',
      patterns: ['觉得没有关系就没有自我', '控制或拯救他人的模式', '极度害怕被拒绝', '对照顾自己感到内疚'],
      steps: ['强烈建议寻求专业心理咨询', '开始写情绪日记', '加入支持小组或社群', '把自我照顾重新定义为必需，而不是自私'],
      note: '这种程度的共依存，常与童年经历或创伤有关。请不要独自解决。',
      affirmation: '你值得被帮助。改变是可能的，你值得拥有更好的关系。',
    },
    fr: {
      title: 'Forte tendance à la codépendance', subtitle: 'Un accompagnement professionnel peut aider',
      description: 'La tendance à la codépendance est très forte. Vous confirmez peut-être votre valeur à travers la relation, réagissez de façon extrême aux émotions des autres et ne prenez presque pas soin de vos propres besoins.',
      patterns: ['Le sentiment de ne pas exister sans la relation', 'Des schémas de contrôle ou de sauvetage de l’autre', 'Une peur extrême du rejet', 'De la culpabilité à prendre soin de soi'],
      steps: ['Un accompagnement psychologique professionnel est vivement conseillé', 'Commencer un journal de ses émotions', 'Rejoindre un groupe de parole ou une communauté de soutien', 'Redéfinir le soin de soi comme une nécessité, pas un égoïsme'],
      note: 'À ce niveau, la codépendance est souvent liée à l’enfance ou à un traumatisme. N’essayez pas de vous en sortir seul.',
      affirmation: 'Vous méritez d’être aidé. Le changement est possible, et vous méritez des relations meilleures.',
    },
    es: {
      title: 'Fuerte tendencia a la codependencia', subtitle: 'El apoyo profesional puede ayudar',
      description: 'La tendencia a la codependencia es muy fuerte. Puede que confirmes tu valor a través de la relación, reacciones de forma extrema a las emociones ajenas y apenas atiendas tus propias necesidades.',
      patterns: ['Sentir que sin la relación no eres nadie', 'Patrones de controlar o rescatar al otro', 'Miedo extremo al rechazo', 'Culpa por cuidar de ti'],
      steps: ['Se recomienda encarecidamente la ayuda psicológica profesional', 'Empezar un diario de emociones', 'Unirte a un grupo de apoyo o una comunidad', 'Redefinir el autocuidado como una necesidad, no como egoísmo'],
      note: 'A este nivel, la codependencia suele estar ligada a la infancia o a un trauma. No intentes resolverlo a solas.',
      affirmation: 'Mereces ayuda. El cambio es posible y mereces relaciones mejores.',
    },
  },
}

function getResultKey(score: number): ResultKey {
  if (score <= 20) return 'independent'
  if (score <= 35) return 'some'
  if (score <= 45) return 'notable'
  return 'strong'
}

interface Props { locale?: string }

export default function CodependencyTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ key: ResultKey; score: number } | null>(null)
  useRecordFinishedTest({ testId: "codependency", title: "CodependencyTest", finished: Boolean(result) });

  function pick(val: number) {
    const newAns = [...answers, val]
    if (current + 1 >= questions.length) {
      const score = newAns.reduce((s, v) => s + v, 0)
      setResult({ key: getResultKey(score), score })
    }
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result.key][l].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= questions.length

  if (!finished) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <ScreeningQuestionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={lb.scaleLabels.map((label, index) => ({ label, value: index + 1 }))}
        screeningNote={lb.disclaimer}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.key][l]
  const pct = Math.round((result.score / 60) * 100)
  const levelColor = result.key === 'strong' ? '#ef4444' : result.key === 'notable' ? '#f59e0b' : result.key === 'some' ? '#435D31' : '#22c55e'

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourResult}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: levelColor }}>{r.title}</div>
        <p className="font-medium text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color: levelColor }}>{result.score} {lb.outOf}</span>
        </div>
        <div
          className="h-3 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={lb.scoreLabel}
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: levelColor }} />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">{lb.patterns}</h3>
        <ul className="space-y-1">{r.patterns.map(p => <li key={p} className="text-sm text-muted-foreground flex gap-2"><span>•</span>{p}</li>)}</ul>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm text-green-600">{lb.steps}</h3>
        <ul className="space-y-1">{r.steps.map(s => <li key={s} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500">→</span>{s}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-amber-700">{lb.warning}</h3>
        <p className="text-sm text-amber-700">{r.note}</p>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.affirmation}</h3>
        <p className="text-sm">"{r.affirmation}"</p>
      </div>
      <p className="text-center text-xs text-muted-foreground">{lb.disclaimer}</p>
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
      <ShareResultButton locale={lp ?? 'ko'} heading={lb.title} resultTitle={r.title} description={r.description} />
    </div>
  )
}
