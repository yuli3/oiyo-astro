import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'
import ResultNextSteps from '../shared/ResultNextSteps'

// ─── Types ────────────────────────────────────────────────────────────────────
type Level = 'high' | 'medium' | 'low'
type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es' | 'zh' | 'fr' | 'es'

interface Question { id: string; text: string; reversed: boolean }
interface ResultData {
  title: string
  subtitle: string
  description: string
  traits: string[]
  growth: string[]
  affirmation: string
  reminder: string
}

const LABELS: Record<Locale, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string
  share: string
  shareMsg: string
  yourLevel: string
  traits: string
  growth: string
  affirmation: string
  reminder: string
  scoreLabel: string
  outOf: string
  note: string
}> = {
  ko: {
    title: '자존감 체크 테스트',
    subtitle: '나는 나 자신을 얼마나 사랑하나요?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 그렇지 않다', '그렇지 않다', '보통이다', '그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 자존감 레벨은',
    yourLevel: '나의 자존감 수준',
    traits: '주요 특징',
    growth: '성장 포인트',
    affirmation: '오늘의 확언',
    reminder: '기억하세요',
    scoreLabel: '자존감 점수',
    outOf: '/ 40점',
    note: '이 테스트는 자기 인식을 위한 도구입니다. 전문적인 심리 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Self-Esteem Check',
    subtitle: 'How much do you love yourself?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My self-esteem level is',
    yourLevel: 'Your Self-Esteem Level',
    traits: 'Key Traits',
    growth: 'Growth Points',
    affirmation: 'Today\'s Affirmation',
    reminder: 'Remember',
    scoreLabel: 'Self-Esteem Score',
    outOf: '/ 40',
    note: 'This test is a tool for self-awareness. It does not replace professional psychological assessment.',
  },
  ja: {
    title: '自己肯定感チェックテスト',
    subtitle: '自分のことをどれくらい好きですか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くそう思わない', 'そう思わない', '普通', 'そう思う', '非常にそう思う'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の自己肯定感レベルは',
    yourLevel: '自己肯定感レベル',
    traits: '主な特徴',
    growth: '成長ポイント',
    affirmation: '今日のアファメーション',
    reminder: '覚えておいて',
    scoreLabel: '自己肯定感スコア',
    outOf: '/ 40点',
    note: 'このテストは自己認識のためのツールです。専門的な心理診断の代替ではありません。',
  },
  zh: {
    title: '自尊感测验',
    subtitle: '我有多爱自己？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '不太是', '一般', '是的', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的自尊程度是',
    yourLevel: '我的自尊程度',
    traits: '主要特征',
    growth: '可以练习的地方',
    affirmation: '今天的一句话',
    reminder: '记得',
    scoreLabel: '自尊分数',
    outOf: '/ 40 分',
    note: '这个测验是帮你认识自己的工具，不能替代专业的心理评估。',
  },
  fr: {
    title: 'Test d’estime de soi',
    subtitle: 'À quel point est-ce que je m’aime ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Plutôt non', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon niveau d’estime de soi',
    yourLevel: 'Votre niveau d’estime de soi',
    traits: 'Traits principaux',
    growth: 'À travailler',
    affirmation: 'La phrase du jour',
    reminder: 'À garder en tête',
    scoreLabel: 'Score d’estime de soi',
    outOf: '/ 40 points',
    note: 'Ce test est un outil pour mieux se connaître. Il ne remplace pas une évaluation psychologique professionnelle.',
  },
  es: {
    title: 'Test de autoestima',
    subtitle: '¿Cuánto me quiero?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Más bien no', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi nivel de autoestima',
    yourLevel: 'Tu nivel de autoestima',
    traits: 'Rasgos principales',
    growth: 'Para trabajar',
    affirmation: 'La frase de hoy',
    reminder: 'Para recordar',
    scoreLabel: 'Puntuación de autoestima',
    outOf: '/ 40 puntos',
    note: 'Este test es una herramienta para conocerte mejor. No sustituye una evaluación psicológica profesional.',
  },
}

// 10 questions (Rosenberg-inspired, balanced for positive/reversed items)
const QUESTIONS: Record<Locale, Question[]> = {
  ko: [
    { id: 'q1', text: '나는 내 자신이 가치 있는 사람이라고 생각한다', reversed: false },
    { id: 'q2', text: '나는 나 자신에 대해 좋은 감정을 가지고 있다', reversed: false },
    { id: 'q3', text: '나는 대체로 나 자신에 만족한다', reversed: false },
    { id: 'q4', text: '나는 최소한 다른 사람들만큼 잘할 수 있다고 생각한다', reversed: false },
    { id: 'q5', text: '나는 자랑스러워할 만한 점이 있다고 생각한다', reversed: false },
    { id: 'q6', text: '나는 때때로 내가 아무 쓸모없다고 느낀다', reversed: true },
    { id: 'q7', text: '나는 때때로 내가 실패자라는 생각이 든다', reversed: true },
    { id: 'q8', text: '나는 다른 사람들보다 못한 것 같아 창피할 때가 있다', reversed: true },
    { id: 'q9', text: '나는 나 자신이 별로 좋지 않다고 생각한다', reversed: true },
    { id: 'q10', text: '나는 내 자신을 더 존중할 수 있으면 좋겠다', reversed: true },
  ],
  en: [
    { id: 'q1', text: 'I feel that I am a person of worth, at least equal to others', reversed: false },
    { id: 'q2', text: 'I feel that I have good qualities', reversed: false },
    { id: 'q3', text: 'All in all, I am inclined to feel that I am a success', reversed: false },
    { id: 'q4', text: 'I am able to do things as well as most other people', reversed: false },
    { id: 'q5', text: 'I feel I have much to be proud of', reversed: false },
    { id: 'q6', text: 'I certainly feel useless at times', reversed: true },
    { id: 'q7', text: 'At times I think I am no good at all', reversed: true },
    { id: 'q8', text: 'I feel I do not have much to be proud of', reversed: true },
    { id: 'q9', text: 'I feel like I am a failure', reversed: true },
    { id: 'q10', text: 'I wish I could have more respect for myself', reversed: true },
  ],
  ja: [
    { id: 'q1', text: '私は、自分が少なくとも人並みには価値のある人間だと思う', reversed: false },
    { id: 'q2', text: '私は、自分の良いところをいくつも持っていると感じる', reversed: false },
    { id: 'q3', text: '全体的に見て、私は自分に満足している', reversed: false },
    { id: 'q4', text: '私は、たいていの人と同じくらいのことはできる', reversed: false },
    { id: 'q5', text: '私には、誇りに思えることがたくさんある', reversed: false },
    { id: 'q6', text: '私は、時々自分が全く役に立たないと感じる', reversed: true },
    { id: 'q7', text: '私は、自分が失敗者だと思うことがある', reversed: true },
    { id: 'q8', text: '私は、あまり誇りに思えることがないと感じる', reversed: true },
    { id: 'q9', text: '私は、自分のことをよく思えないことがある', reversed: true },
    { id: 'q10', text: '私は、もっと自分を尊重できたらと思う', reversed: true },
  ],
  zh: [
    { id: 'q1', text: '我觉得自己是个有价值的人', reversed: false },
    { id: 'q2', text: '我对自己的感觉不错', reversed: false },
    { id: 'q3', text: '整体上我对自己是满意的', reversed: false },
    { id: 'q4', text: '我觉得自己至少能做得跟别人一样好', reversed: false },
    { id: 'q5', text: '我身上有值得骄傲的地方', reversed: false },
    { id: 'q6', text: '我有时候觉得自己一无是处', reversed: true },
    { id: 'q7', text: '我有时候觉得自己是个失败者', reversed: true },
    { id: 'q8', text: '有时候我觉得自己不如别人，会觉得丢脸', reversed: true },
    { id: 'q9', text: '我觉得自己不怎么样', reversed: true },
    { id: 'q10', text: '我希望能更看得起自己', reversed: true },
  ],
  fr: [
    { id: 'q1', text: 'Je pense avoir de la valeur', reversed: false },
    { id: 'q2', text: 'J’ai un bon ressenti à mon sujet', reversed: false },
    { id: 'q3', text: 'Dans l’ensemble, je suis satisfait de moi', reversed: false },
    { id: 'q4', text: 'Je crois pouvoir faire aussi bien que les autres', reversed: false },
    { id: 'q5', text: 'J’ai des choses dont je peux être fier', reversed: false },
    { id: 'q6', text: 'Il m’arrive de me sentir bon à rien', reversed: true },
    { id: 'q7', text: 'Il m’arrive de me voir comme un raté', reversed: true },
    { id: 'q8', text: 'Parfois j’ai honte de me sentir inférieur aux autres', reversed: true },
    { id: 'q9', text: 'Je pense que je ne vaux pas grand-chose', reversed: true },
    { id: 'q10', text: 'J’aimerais pouvoir me respecter davantage', reversed: true },
  ],
  es: [
    { id: 'q1', text: 'Creo que soy una persona valiosa', reversed: false },
    { id: 'q2', text: 'Tengo buena sensación conmigo mismo', reversed: false },
    { id: 'q3', text: 'En general estoy satisfecho conmigo', reversed: false },
    { id: 'q4', text: 'Creo que puedo hacerlo al menos tan bien como los demás', reversed: false },
    { id: 'q5', text: 'Tengo cosas de las que estar orgulloso', reversed: false },
    { id: 'q6', text: 'A veces siento que no sirvo para nada', reversed: true },
    { id: 'q7', text: 'A veces siento que soy un fracaso', reversed: true },
    { id: 'q8', text: 'A veces me da vergüenza sentirme por debajo de los demás', reversed: true },
    { id: 'q9', text: 'Creo que no valgo gran cosa', reversed: true },
    { id: 'q10', text: 'Ojalá pudiera respetarme más', reversed: true },
  ],
}

const RESULTS: Record<Level, Record<Locale, ResultData>> = {
  high: {
    ko: {
      title: '높은 자존감',
      subtitle: '자신을 사랑하고 신뢰하는 당신',
      description: '당신은 자신의 가치를 잘 알고, 실수를 성장의 기회로 봅니다. 건강한 자기 존중감은 더 만족스러운 관계, 더 높은 목표 달성, 더 나은 정신 건강으로 이어집니다. 지금의 자기 사랑을 유지하고 주변 사람들에게도 나눠주세요.',
      traits: ['자신의 가치를 인식', '실수를 용납하고 배움', '건강한 경계 설정', '내적 안정감'],
      growth: ['자기 사랑을 지속적으로 유지', '주변에 긍정적 영향 나누기', '새로운 도전에 적극적으로 임하기'],
      affirmation: '나는 지금 이대로 충분하다. 나의 가치는 성취나 타인의 평가에 달려 있지 않다.',
      reminder: '높은 자존감은 오만함이 아닙니다. 자신을 사랑하면서도 타인을 배려할 때 진정한 자존감이 빛납니다.',
    },
    en: {
      title: 'High Self-Esteem',
      subtitle: 'You love and trust yourself',
      description: 'You know your worth and see mistakes as growth opportunities. Healthy self-esteem leads to more satisfying relationships, higher goal achievement, and better mental health. Maintain this self-love and share it with those around you.',
      traits: ['Recognizes your own value', 'Accepts mistakes and learns', 'Sets healthy boundaries', 'Inner stability'],
      growth: ['Continuously maintain self-love', 'Spread positive influence to others', 'Actively embrace new challenges'],
      affirmation: 'I am enough just as I am. My worth does not depend on achievement or others\' opinions.',
      reminder: 'High self-esteem is not arrogance. True self-esteem shines when you love yourself while also caring for others.',
    },
    ja: {
      title: '高い自己肯定感',
      subtitle: '自分を愛し信頼するあなた',
      description: '自分の価値をよく知り、失敗を成長の機会と捉えています。健全な自己肯定感は、より満足のいく関係、より高い目標達成、より良いメンタルヘルスにつながります。今の自己愛を維持し、周りの人々にも分かち合ってください。',
      traits: ['自分の価値を認識', '失敗を許容して学ぶ', '健全な境界設定', '内なる安定感'],
      growth: ['自己愛を継続的に維持', '周りにポジティブな影響を与える', '新しい挑戦に積極的に取り組む'],
      affirmation: '私は今のままで十分です。私の価値は達成や他者の評価に依存しません。',
      reminder: '高い自己肯定感は傲慢さではありません。自分を愛しながら他者を思いやる時、真の自己肯定感が輝きます。',
    },
    zh: {
      title: '自尊感高',
      subtitle: '懂得爱自己、也信得过自己',
      description: '你清楚自己的价值，把失误看成成长的机会。健康的自我尊重会带来更舒服的关系、更能达成的目标和更好的心理状态。守住现在这份自爱，也分一点给身边的人。',
      traits: ['认得清自己的价值', '容得下失误，并从中学到东西', '把界线划得健康', '内在有稳的感觉'],
      growth: ['让自爱持续下去', '把正向的影响分给周围', '积极去接新的挑战'],
      affirmation: '我现在这样就够了。我的价值不取决于成就或别人的评价。',
      reminder: '高自尊不是自大。既爱自己又顾得上别人时，自尊才真的发光。',
    },
    fr: {
      title: 'Estime de soi élevée',
      subtitle: 'Vous vous aimez et vous vous faites confiance',
      description: 'Vous connaissez votre valeur et voyez l’erreur comme une occasion de grandir. Une estime saine ouvre sur des relations plus satisfaisantes, des objectifs mieux atteints et une meilleure santé mentale. Gardez cet amour de soi et partagez-en autour de vous.',
      traits: ['Reconnaître sa propre valeur', 'Accueillir l’erreur et en apprendre', 'Poser des limites saines', 'Une assise intérieure stable'],
      growth: ['Entretenir cet amour de soi', 'Diffuser une influence positive autour de soi', 'Aller vers de nouveaux défis'],
      affirmation: 'Je suis suffisant tel que je suis. Ma valeur ne dépend ni de mes résultats ni du regard des autres.',
      reminder: 'Une haute estime n’est pas de l’arrogance. Elle brille vraiment quand on s’aime tout en tenant compte des autres.',
    },
    es: {
      title: 'Autoestima alta',
      subtitle: 'Te quieres y confías en ti',
      description: 'Conoces tu valor y ves el error como ocasión de crecer. Una autoestima sana trae relaciones más satisfactorias, metas mejor alcanzadas y mejor salud mental. Conserva ese cariño por ti y repártelo alrededor.',
      traits: ['Reconocer tu propio valor', 'Aceptar el error y aprender de él', 'Poner límites sanos', 'Una base interior estable'],
      growth: ['Mantener ese cariño por ti', 'Repartir influencia positiva alrededor', 'Ir a por nuevos retos'],
      affirmation: 'Estoy bien tal como soy. Mi valor no depende de mis logros ni de lo que opinen de mí.',
      reminder: 'La autoestima alta no es arrogancia. Brilla de verdad cuando te quieres y a la vez cuidas de los demás.',
    },
  },
  medium: {
    ko: {
      title: '보통의 자존감',
      subtitle: '좋은 날도 있고 힘든 날도 있는 당신',
      description: '당신은 자신에 대해 대체로 긍정적이지만, 상황에 따라 자기 의심이 생기기도 합니다. 이는 매우 일반적인 상태입니다. 자존감은 연습을 통해 강화할 수 있으며, 지금보다 더 나은 자기 수용으로 나아갈 수 있습니다.',
      traits: ['상황에 따라 자존감 변동', '타인의 의견에 영향받음', '자신에 대한 모호한 감정', '성장 잠재력 높음'],
      growth: ['자기 비판적 생각 인식하기', '매일 한 가지 자신의 강점 찾기', '실수를 경험으로 재정의하기'],
      affirmation: '나는 완벽하지 않아도 된다. 지금 이 순간 나는 최선을 다하고 있다.',
      reminder: '자존감은 하루아침에 바뀌지 않습니다. 매일 작은 자기 돌봄의 실천이 쌓여 큰 변화를 만듭니다.',
    },
    en: {
      title: 'Moderate Self-Esteem',
      subtitle: 'You have good days and tough days',
      description: 'You\'re generally positive about yourself but self-doubt appears depending on the situation. This is very common. Self-esteem can be strengthened through practice, and you can move toward better self-acceptance.',
      traits: ['Self-esteem fluctuates by situation', 'Influenced by others\' opinions', 'Mixed feelings about yourself', 'High growth potential'],
      growth: ['Notice self-critical thoughts', 'Find one strength in yourself each day', 'Redefine mistakes as experiences'],
      affirmation: 'I don\'t need to be perfect. In this moment, I am doing my best.',
      reminder: 'Self-esteem doesn\'t change overnight. Small daily acts of self-care accumulate to create big change.',
    },
    ja: {
      title: '普通の自己肯定感',
      subtitle: '良い日も辛い日もあるあなた',
      description: '自分についておおむねポジティブですが、状況によって自己不信が生じることがあります。これは非常によくある状態です。自己肯定感は練習を通じて強化でき、より良い自己受容へと進むことができます。',
      traits: ['状況によって自己肯定感が変動', '他者の意見に影響される', '自分に対する複雑な感情', '成長ポテンシャルが高い'],
      growth: ['自己批判的な思考に気づく', '毎日自分の強みを一つ見つける', '失敗を経験として再定義する'],
      affirmation: '完璧でなくていい。今この瞬間、私は最善を尽くしている。',
      reminder: '自己肯定感は一夜にして変わりません。毎日小さな自己ケアの実践が積み重なって大きな変化を生み出します。',
    },
    zh: {
      title: '自尊感中等',
      subtitle: '有好的日子，也有难的日子',
      description: '你对自己整体是正面的，但遇到某些状况会冒出自我怀疑。这很普通。自尊是可以练的，你可以走到比现在更能接纳自己的地方。',
      traits: ['自尊会随状况上下', '容易被别人的看法影响', '对自己的感觉有点模糊', '成长空间不小'],
      growth: ['先察觉自我批评的念头', '每天找出自己的一个长处', '把失误重新定义成经验'],
      affirmation: '我不必完美。此刻的我，已经尽了力。',
      reminder: '自尊不会一夜之间改变。每天一点点的自我照顾，累起来就是大变化。',
    },
    fr: {
      title: 'Estime de soi moyenne',
      subtitle: 'Des bons jours et des jours plus durs',
      description: 'Vous êtes globalement positif envers vous-même, mais le doute revient selon les situations. C’est très courant. L’estime de soi se travaille, et vous pouvez aller vers une acceptation plus large.',
      traits: ['L’estime varie selon les situations', 'Sensible au regard des autres', 'Un ressenti flou sur soi', 'Un vrai potentiel de progression'],
      growth: ['Repérer d’abord les pensées autocritiques', 'Trouver chaque jour une de ses forces', 'Redéfinir l’erreur comme une expérience'],
      affirmation: 'Je n’ai pas à être parfait. En cet instant, je fais de mon mieux.',
      reminder: 'L’estime de soi ne change pas du jour au lendemain. De petits soins quotidiens finissent par faire un grand changement.',
    },
    es: {
      title: 'Autoestima media',
      subtitle: 'Hay días buenos y días más duros',
      description: 'En general te ves bien, pero según la situación vuelve la duda. Es muy común. La autoestima se entrena, y puedes llegar a aceptarte más que ahora.',
      traits: ['La autoestima sube y baja según el momento', 'Te afecta lo que opinan los demás', 'Un sentir difuso sobre ti mismo', 'Buen margen de crecimiento'],
      growth: ['Darte cuenta primero de los pensamientos autocríticos', 'Encontrar cada día una fortaleza tuya', 'Redefinir el error como experiencia'],
      affirmation: 'No necesito ser perfecto. En este momento lo estoy haciendo lo mejor que puedo.',
      reminder: 'La autoestima no cambia de un día para otro. Los cuidados pequeños diarios acaban siendo un cambio grande.',
    },
  },
  low: {
    ko: {
      title: '낮은 자존감',
      subtitle: '지금은 힘들지만, 당신은 충분히 소중합니다',
      description: '현재 자신에 대한 부정적인 감정이 강하게 느껴지고 있습니다. 이것은 당신이 나쁜 사람이라서가 아니라, 과거의 경험이나 환경이 영향을 미친 것입니다. 자존감은 변화할 수 있으며, 지금 이 테스트를 한다는 것 자체가 성장의 시작입니다.',
      traits: ['자기 비판이 강함', '타인의 승인 의존', '자신의 가치를 낮게 평가', '도움을 구하기 어려움'],
      growth: ['자기 비판을 자기 연민으로 바꾸기', '소중한 사람에게 마음 나누기', '작은 성취도 인정하기', '필요하다면 전문 상담 고려'],
      affirmation: '나는 사랑받을 자격이 있다. 나의 존재 자체가 충분히 가치 있다.',
      reminder: '낮은 자존감은 영구적이지 않습니다. 많은 사람들이 비슷한 어려움을 겪고 회복했습니다. 작은 한 걸음부터 시작해 보세요.',
    },
    en: {
      title: 'Low Self-Esteem',
      subtitle: 'It\'s hard right now, but you are deeply valuable',
      description: 'You\'re currently experiencing strong negative feelings about yourself. This isn\'t because you\'re a bad person — past experiences or environments have had their impact. Self-esteem can change, and taking this test is itself the beginning of growth.',
      traits: ['Strong self-criticism', 'Dependence on others\' approval', 'Undervaluing yourself', 'Difficulty asking for help'],
      growth: ['Transform self-criticism into self-compassion', 'Share your feelings with someone you trust', 'Acknowledge even small achievements', 'Consider professional counseling if needed'],
      affirmation: 'I deserve to be loved. My very existence is valuable.',
      reminder: 'Low self-esteem is not permanent. Many people have faced similar struggles and recovered. Start with one small step.',
    },
    ja: {
      title: '低い自己肯定感',
      subtitle: '今は辛くても、あなたはとても大切な存在です',
      description: '現在、自分に対してネガティブな感情が強く感じられています。これはあなたが悪い人だからではなく、過去の経験や環境が影響したのです。自己肯定感は変化でき、このテストをしていること自体が成長の始まりです。',
      traits: ['自己批判が強い', '他者の承認への依存', '自分の価値を低く評価', '助けを求めることが難しい'],
      growth: ['自己批判を自己への思いやりに変える', '信頼できる人に気持ちを打ち明ける', '小さな成就も認める', '必要なら専門カウンセリングを検討'],
      affirmation: '私は愛される資格がある。私の存在それ自体が十分価値がある。',
      reminder: '低い自己肯定感は永続しません。多くの人が同様の困難を経験し回復しました。小さな一歩から始めましょう。',
    },
    zh: {
      title: '自尊感偏低',
      subtitle: '现在很辛苦，但你确实是珍贵的',
      description: '你对自己的负面感受正强。这不是因为你是坏人，而是过去的经历和环境留下的影响。自尊是会变的，你来做这个测验，本身就是成长的开始。',
      traits: ['自我批评很强', '依赖别人的认可', '把自己的价值看得很低', '难以开口求助'],
      growth: ['把自我批评换成自我体谅', '把心事说给重要的人听', '连小小的完成也认下来', '需要的话，考虑找专业咨询'],
      affirmation: '我值得被爱。我的存在本身就够有价值。',
      reminder: '低自尊不是永久的。很多人走过类似的难处，也走了出来。就从很小的一步开始。',
    },
    fr: {
      title: 'Estime de soi basse',
      subtitle: 'C’est dur en ce moment, et pourtant vous comptez',
      description: 'Les sentiments négatifs envers vous-même sont forts en ce moment. Ce n’est pas que vous êtes quelqu’un de mauvais : des expériences passées et un environnement ont laissé leur marque. L’estime de soi peut changer, et faire ce test est déjà un début.',
      traits: ['Une autocritique forte', 'Une dépendance à l’approbation des autres', 'Une valeur personnelle jugée trop basse', 'Difficulté à demander de l’aide'],
      growth: ['Remplacer l’autocritique par de la bienveillance envers soi', 'Confier ce qu’on porte à une personne proche', 'Reconnaître même les petites réussites', 'Envisager un accompagnement professionnel si besoin'],
      affirmation: 'Je mérite d’être aimé. Mon existence a de la valeur en elle-même.',
      reminder: 'Une estime basse n’est pas définitive. Beaucoup ont traversé des difficultés semblables et s’en sont relevés. Commencez par un tout petit pas.',
    },
    es: {
      title: 'Autoestima baja',
      subtitle: 'Ahora pesa, y aun así vales mucho',
      description: 'Los sentimientos negativos hacia ti están fuertes. No es que seas mala persona: experiencias pasadas y el entorno han dejado huella. La autoestima puede cambiar, y hacer este test ya es un comienzo.',
      traits: ['Autocrítica fuerte', 'Dependencia de la aprobación ajena', 'Te valoras por debajo de lo que vales', 'Te cuesta pedir ayuda'],
      growth: ['Cambiar la autocrítica por trato amable contigo', 'Contarle lo que llevas a alguien cercano', 'Reconocer también los logros pequeños', 'Valorar acompañamiento profesional si hace falta'],
      affirmation: 'Merezco que me quieran. Mi existencia ya tiene valor.',
      reminder: 'La autoestima baja no es para siempre. Mucha gente ha pasado por algo parecido y ha salido. Empieza por un paso muy pequeño.',
    },
  },
}

interface Props { locale?: string }

export default function SelfEsteemTest({ locale: lp = 'ko' }: Props) {
  const locale: Locale = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(lp) ? lp : 'en') as Locale
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const initResult = (): { level: Level; score: number } | null => {
    if (typeof window === 'undefined') return null
    const p = new URLSearchParams(window.location.search)
    const lv = p.get('level') as Level | null
    if (lv && RESULTS[lv]) return { level: lv, score: 0 }
    return null
  }

  const [current, setCurrent] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('level')) return questions.length
    }
    return 0
  })
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(initResult)
  useRecordFinishedTest({ testId: "self-esteem", title: "SelfEsteemTest", finished: Boolean(result) });

  function calcResult(ans: number[]): { level: Level; score: number } {
    let score = 0
    for (let i = 0; i < questions.length; i++) {
      const raw = ans[i] // 0-4
      score += questions[i].reversed ? (4 - raw) : raw
    }
    // score range: 0-40 (each question 0-4)
    const level: Level = score >= 28 ? 'high' : score >= 16 ? 'medium' : 'low'
    return { level, score }
  }

  function pick(val: number) {
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const newAns = answers.slice(0, current)
    newAns[current] = val
    if (current + 1 >= questions.length) {
      setResult(calcResult(newAns))
    }
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() {
    setAnswers([]); setCurrent(0); setResult(null)
    if (typeof window !== 'undefined') window.history.replaceState({}, '', window.location.pathname)
  }

  function share() {
    if (!result) return
    const url = `${window.location.origin}${window.location.pathname}?level=${result.level}`
    const text = `${lb.shareMsg} ${RESULTS[result.level][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
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
        selectedValue={answers[current] === undefined ? undefined : answers[current] + 1}
        note={lb.note}
        previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
        onSelect={(value) => pick(value - 1)}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.level][locale]
  const pct = Math.round((result.score / 40) * 100)
  const levelColor = result.level === 'high' ? '#22c55e' : result.level === 'medium' ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourLevel}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: levelColor }}>{r.title}</div>
        <p className="text-muted-foreground font-medium">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>

      {result.score > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{lb.scoreLabel}</span>
            <span className="text-lg font-bold" style={{ color: levelColor }}>{result.score} {lb.outOf}</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: levelColor }} />
          </div>
          <p className="text-xs text-muted-foreground text-right">{pct}%</p>
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">{lb.traits}</h3>
        <ul className="space-y-1">
          {r.traits.map(t => <li key={t} className="text-sm text-muted-foreground flex gap-2"><span>•</span>{t}</li>)}
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm text-green-600">{lb.growth}</h3>
        <ul className="space-y-1">
          {r.growth.map(g => <li key={g} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500">→</span>{g}</li>)}
        </ul>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.affirmation}</h3>
        <p className="text-sm italic">"{r.affirmation}"</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-1">
        <h3 className="font-semibold text-sm text-muted-foreground">{lb.reminder}</h3>
        <p className="text-sm text-muted-foreground">{r.reminder}</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={r.title}
        emoji={result.level === 'high' ? '🌟' : result.level === 'medium' ? '🌱' : '🌧️'}
        description={r.subtitle}
      />
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/inner-strength/test/`, label: locale === 'ko' ? '💪 내면 강점 테스트' : locale === 'ja' ? '💪 内面の強みテスト' : '💪 Inner strength test' },
          { href: `/${locale}/burnout/test/`, label: locale === 'ko' ? '😰 번아웃 테스트' : locale === 'ja' ? '😰 バーンアウトテスト' : '😰 Burnout test' },
          { href: `/${locale}/today/`, label: locale === 'ko' ? '🌌 오늘의 우주' : locale === 'ja' ? '🌌 今日の宇宙' : "🌌 Today's Universe" },
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
