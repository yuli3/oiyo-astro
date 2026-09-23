import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

type ResultKey = 'humble' | 'balanced' | 'confident' | 'high'

interface Question {
  id: string
  a: string
  b: string
  narcissistic: 'a' | 'b'
}

interface ResultData {
  title: string
  subtitle: string
  description: string
  traits: string[]
  tips: string[]
  note: string
  affirmation: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  chooseOne: string
  restart: string
  share: string
  shareMsg: string
  yourScore: string
  scoreLabel: string
  outOf: string
  traits: string
  tips: string
  warning: string
  affirmation: string
  disclaimer: string
}> = {
  ko: {
    title: '자기애 성향 테스트',
    subtitle: '나는 얼마나 자기중심적인가?',
    questionOf: (c, t) => `${c} / ${t}`,
    chooseOne: '더 가까운 설명을 선택하세요',
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '내 자기애 성향은',
    yourScore: '나의 자기애 점수',
    scoreLabel: '자기애 점수',
    outOf: '/ 16점',
    traits: '주요 특성',
    tips: '균형 잡기 팁',
    warning: '참고',
    affirmation: '오늘의 메시지',
    disclaimer: '이 테스트는 자기 이해를 위한 도구이며 임상 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Narcissism Trait Test',
    subtitle: 'How Self-Centered Are You?',
    questionOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'Choose the statement that fits you better',
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My narcissism score is',
    yourScore: 'Your Narcissism Score',
    scoreLabel: 'Narcissism Score',
    outOf: '/ 16',
    traits: 'Key Traits',
    tips: 'Balancing Tips',
    warning: 'Note',
    affirmation: "Today's Message",
    disclaimer: 'This test is a self-awareness tool and does not replace clinical diagnosis.',
  },
  ja: {
    title: '自己愛傾向テスト',
    subtitle: '私はどれだけ自己中心的？',
    questionOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'より当てはまる説明を選んでください',
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の自己愛スコアは',
    yourScore: '自己愛スコア',
    scoreLabel: '自己愛スコア',
    outOf: '/ 16点',
    traits: '主な特性',
    tips: 'バランスのヒント',
    warning: '注意',
    affirmation: '今日のメッセージ',
    disclaimer: 'このテストは自己理解のためのツールであり、臨床診断の代替ではありません。',
  },
  zh: {
    title: '自恋倾向测验',
    subtitle: '我有多以自己为中心？',
    questionOf: (c, t) => `${c} / ${t}`,
    chooseOne: '选出更接近你的那句',
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的自恋倾向是',
    yourScore: '我的自恋分数',
    scoreLabel: '自恋分数',
    outOf: '/ 16 分',
    traits: '主要特征',
    tips: '取得平衡的建议',
    warning: '备注',
    affirmation: '今天想对你说',
    disclaimer: '这个测验是帮你认识自己的工具，不能替代临床诊断。',
  },
  fr: {
    title: 'Test des tendances narcissiques',
    subtitle: 'À quel point suis-je centré sur moi ?',
    questionOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'Choisissez la phrase qui vous ressemble le plus',
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Ma tendance narcissique',
    yourScore: 'Mon score',
    scoreLabel: 'Score',
    outOf: '/ 16 points',
    traits: 'Traits principaux',
    tips: 'Conseils pour l’équilibre',
    warning: 'Remarque',
    affirmation: 'Un mot pour aujourd’hui',
    disclaimer: 'Ce test est un outil de connaissance de soi ; il ne remplace pas un diagnostic clinique.',
  },
  es: {
    title: 'Test de tendencias narcisistas',
    subtitle: '¿Cuán centrado estoy en mí mismo?',
    questionOf: (c, t) => `${c} / ${t}`,
    chooseOne: 'Elige la frase que más se te parece',
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tendencia narcisista',
    yourScore: 'Mi puntuación',
    scoreLabel: 'Puntuación',
    outOf: '/ 16 puntos',
    traits: 'Rasgos principales',
    tips: 'Consejos para el equilibrio',
    warning: 'Nota',
    affirmation: 'Algo para hoy',
    disclaimer: 'Este test es una herramienta de autoconocimiento; no sustituye un diagnóstico clínico.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', a: '나는 지도자가 되기보다 따라가는 편이 편하다', b: '나는 천생 리더 타입이다', narcissistic: 'b' },
    { id: 'q2', a: '나는 칭찬받으면 약간 어색하다', b: '나는 칭찬받는 것을 즐기고 그럴 자격이 있다', narcissistic: 'b' },
    { id: 'q3', a: '나는 내 삶에 별로 영향력이 없다', b: '나는 내 주변 사람들에게 큰 영향을 미친다', narcissistic: 'b' },
    { id: 'q4', a: '나는 모두에게 평범한 사람이다', b: '나는 특별한 사람이라고 생각한다', narcissistic: 'b' },
    { id: 'q5', a: '나는 권력을 원하지 않는다', b: '권력이 있다면 세상을 더 잘 바꿀 수 있을 것 같다', narcissistic: 'b' },
    { id: 'q6', a: '나는 남들의 시선을 크게 신경 쓰지 않는다', b: '나는 사람들이 나를 어떻게 보는지 매우 신경 쓴다', narcissistic: 'b' },
    { id: 'q7', a: '나는 내가 원하는 것을 솔직히 말하기 어렵다', b: '나는 원하는 것을 얻는 방법을 안다', narcissistic: 'b' },
    { id: 'q8', a: '내 외모에는 별다른 자신감이 없다', b: '나는 외모에 꽤 신경 쓰고 자부심을 느낀다', narcissistic: 'b' },
    { id: 'q9', a: '나는 보통 사람 중 하나일 뿐이다', b: '나는 분명히 남들보다 뛰어난 부분이 있다', narcissistic: 'b' },
    { id: 'q10', a: '나는 결정을 내릴 때 남들의 의견을 많이 따른다', b: '나는 스스로 결정을 잘 내린다', narcissistic: 'b' },
    { id: 'q11', a: '나는 특별 대우를 받으려 하지 않는다', b: '나는 내가 특별 대우를 받을 자격이 있다고 생각한다', narcissistic: 'b' },
    { id: 'q12', a: '나는 다른 사람을 잘 조종하거나 설득하지 못한다', b: '나는 원하는 것을 얻기 위해 사람들을 설득할 수 있다', narcissistic: 'b' },
    { id: 'q13', a: '나는 존경받는 사람이 되고 싶다', b: '나는 두려움의 대상이 되는 것도 나쁘지 않다', narcissistic: 'b' },
    { id: 'q14', a: '나는 전시회 같은 곳에서 눈에 띄기 싫다', b: '나는 사람들의 주목을 받는 것이 좋다', narcissistic: 'b' },
    { id: 'q15', a: '나는 타인의 감정을 내 것처럼 느낀다', b: '나는 종종 내 목표가 가장 우선이라고 느낀다', narcissistic: 'b' },
    { id: 'q16', a: '나는 평범한 삶도 충분히 만족스럽다', b: '나는 위대한 성취를 이루고 싶다', narcissistic: 'b' },
  ],
  en: [
    { id: 'q1', a: "I'm more comfortable following than leading", b: "I'm a born leader", narcissistic: 'b' },
    { id: 'q2', a: 'I feel a bit awkward when praised', b: 'I enjoy compliments and feel I deserve them', narcissistic: 'b' },
    { id: 'q3', a: 'I have little influence over those around me', b: 'I have a big impact on the people in my life', narcissistic: 'b' },
    { id: 'q4', a: "I'm just an ordinary person to most people", b: 'I think of myself as a special person', narcissistic: 'b' },
    { id: 'q5', a: "I don't care much about having power", b: 'With power, I could change the world for the better', narcissistic: 'b' },
    { id: 'q6', a: "I don't pay much attention to others' opinions of me", b: "I care deeply about how others perceive me", narcissistic: 'b' },
    { id: 'q7', a: 'I find it hard to assert what I want', b: 'I know how to get what I want', narcissistic: 'b' },
    { id: 'q8', a: "I don't feel particularly confident about my appearance", b: 'I pay close attention to my looks and feel proud of them', narcissistic: 'b' },
    { id: 'q9', a: "I'm just one of many ordinary people", b: 'I clearly excel in certain areas compared to others', narcissistic: 'b' },
    { id: 'q10', a: "I rely heavily on others' input when deciding", b: 'I make decisions well on my own', narcissistic: 'b' },
    { id: 'q11', a: "I don't seek special treatment", b: 'I believe I deserve special treatment', narcissistic: 'b' },
    { id: 'q12', a: "I'm not good at persuading or influencing others", b: 'I can persuade people to get what I want', narcissistic: 'b' },
    { id: 'q13', a: 'I want to be someone who is respected', b: "Being feared isn't so bad either", narcissistic: 'b' },
    { id: 'q14', a: 'I prefer not to stand out in social settings', b: 'I enjoy being the center of attention', narcissistic: 'b' },
    { id: 'q15', a: "I feel others' emotions as if they were my own", b: "I often feel my goals come first", narcissistic: 'b' },
    { id: 'q16', a: 'An ordinary life is satisfying enough', b: 'I want to achieve great things', narcissistic: 'b' },
  ],
  ja: [
    { id: 'q1', a: 'リードするよりフォローする方が楽だ', b: '私は生まれつきリーダータイプだ', narcissistic: 'b' },
    { id: 'q2', a: '褒められるとちょっと照れる', b: '褒められることを楽しみ、それに値すると思う', narcissistic: 'b' },
    { id: 'q3', a: '周りの人に対する影響力はほとんどない', b: '周囲の人々に大きな影響を与えている', narcissistic: 'b' },
    { id: 'q4', a: 'ほとんどの人にとって普通の人だ', b: '自分は特別な人間だと思う', narcissistic: 'b' },
    { id: 'q5', a: '権力にはあまり興味がない', b: '権力があれば世界をより良く変えられる', narcissistic: 'b' },
    { id: 'q6', a: '他人の自分への見方はあまり気にしない', b: '他人が自分をどう見るかとても気にする', narcissistic: 'b' },
    { id: 'q7', a: '自分が望むことを主張するのが苦手だ', b: '欲しいものを手に入れる方法を知っている', narcissistic: 'b' },
    { id: 'q8', a: '外見にはあまり自信がない', b: '外見に気を使い誇りを持っている', narcissistic: 'b' },
    { id: 'q9', a: '自分はただの平凡な人間の一人だ', b: '他の人より明らかに優れた部分がある', narcissistic: 'b' },
    { id: 'q10', a: '決断する際は他人の意見に大きく頼る', b: '自分で上手く決断できる', narcissistic: 'b' },
    { id: 'q11', a: '特別扱いを求めない', b: '自分は特別扱いを受ける価値があると思う', narcissistic: 'b' },
    { id: 'q12', a: '他人を説得したり影響を与えるのが苦手だ', b: '欲しいものを得るために人を説得できる', narcissistic: 'b' },
    { id: 'q13', a: '尊敬される人になりたい', b: '恐れられることも悪くはない', narcissistic: 'b' },
    { id: 'q14', a: '社交の場では目立ちたくない', b: '注目を浴びるのが好きだ', narcissistic: 'b' },
    { id: 'q15', a: '他人の感情を自分のことのように感じる', b: '自分の目標が最優先だとよく感じる', narcissistic: 'b' },
    { id: 'q16', a: '平凡な生活で十分満足できる', b: '偉大な成果を成し遂げたい', narcissistic: 'b' },
  ],
  zh: [
    { id: 'q1', a: '比起当领导，我跟着走更自在', b: '我天生就是带头的人', narcissistic: 'b' },
    { id: 'q2', a: '被称赞时我会有点不自在', b: '我享受被称赞，也觉得自己当得起', narcissistic: 'b' },
    { id: 'q3', a: '我对自己的人生没什么影响力', b: '我对身边的人影响很大', narcissistic: 'b' },
    { id: 'q4', a: '我在大家眼里就是个普通人', b: '我认为自己是特别的', narcissistic: 'b' },
    { id: 'q5', a: '我不想要权力', b: '如果有权力，我能把世界改得更好', narcissistic: 'b' },
    { id: 'q6', a: '别人的眼光我不太在意', b: '别人怎么看我，我非常在意', narcissistic: 'b' },
    { id: 'q7', a: '我很难把自己想要的直说出来', b: '我知道怎么拿到我想要的', narcissistic: 'b' },
    { id: 'q8', a: '我对自己的外表没什么自信', b: '我挺在意外表，也为此有点得意', narcissistic: 'b' },
    { id: 'q9', a: '我只是普通人中的一个', b: '我确实有比别人强的地方', narcissistic: 'b' },
    { id: 'q10', a: '做决定时，我很听别人的意见', b: '我能自己把决定做好', narcissistic: 'b' },
    { id: 'q11', a: '我不会去要特别待遇', b: '我认为自己值得被特别对待', narcissistic: 'b' },
    { id: 'q12', a: '我不太会说服或影响别人', b: '为了拿到想要的，我说得动人', narcissistic: 'b' },
    { id: 'q13', a: '我想成为被尊敬的人', b: '让人有点怕我，也不算坏事', narcissistic: 'b' },
    { id: 'q14', a: '在展览之类的场合，我不想太显眼', b: '我喜欢被大家注意', narcissistic: 'b' },
    { id: 'q15', a: '我会把别人的情绪当成自己的', b: '我常觉得自己的目标最优先', narcissistic: 'b' },
    { id: 'q16', a: '平凡的生活也足够让我满意', b: '我想做出了不起的成就', narcissistic: 'b' },
  ],
  fr: [
    { id: 'q1', a: 'Je me sens plus à l’aise en suivant qu’en dirigeant', b: 'Je suis un meneur né', narcissistic: 'b' },
    { id: 'q2', a: 'Quand on me complimente, je suis un peu gêné', b: 'J’aime les compliments et je les trouve mérités', narcissistic: 'b' },
    { id: 'q3', a: 'Je n’ai pas beaucoup d’influence sur ma vie', b: 'J’ai une grande influence sur mon entourage', narcissistic: 'b' },
    { id: 'q4', a: 'Je suis quelqu’un d’ordinaire aux yeux de tous', b: 'Je me considère comme quelqu’un de particulier', narcissistic: 'b' },
    { id: 'q5', a: 'Je ne cherche pas le pouvoir', b: 'Avec du pouvoir, je pourrais changer le monde en mieux', narcissistic: 'b' },
    { id: 'q6', a: 'Le regard des autres ne me préoccupe guère', b: 'Ce que les gens pensent de moi me préoccupe beaucoup', narcissistic: 'b' },
    { id: 'q7', a: 'J’ai du mal à dire franchement ce que je veux', b: 'Je sais comment obtenir ce que je veux', narcissistic: 'b' },
    { id: 'q8', a: 'Je n’ai pas vraiment confiance en mon apparence', b: 'Je soigne mon apparence et j’en tire une certaine fierté', narcissistic: 'b' },
    { id: 'q9', a: 'Je suis une personne parmi d’autres', b: 'J’ai clairement des domaines où je vaux mieux que les autres', narcissistic: 'b' },
    { id: 'q10', a: 'Je me range beaucoup à l’avis des autres pour décider', b: 'Je sais décider par moi-même', narcissistic: 'b' },
    { id: 'q11', a: 'Je ne cherche pas de traitement de faveur', b: 'Je pense mériter un traitement particulier', narcissistic: 'b' },
    { id: 'q12', a: 'Je ne sais pas vraiment persuader ou influencer', b: 'Je sais convaincre les gens pour obtenir ce que je veux', narcissistic: 'b' },
    { id: 'q13', a: 'Je voudrais être quelqu’un de respecté', b: 'Inspirer un peu de crainte ne me dérange pas', narcissistic: 'b' },
    { id: 'q14', a: 'Dans une exposition ou un lieu semblable, je préfère ne pas me faire remarquer', b: 'J’aime être au centre de l’attention', narcissistic: 'b' },
    { id: 'q15', a: 'Je ressens les émotions des autres comme les miennes', b: 'Je sens souvent que mes objectifs passent en premier', narcissistic: 'b' },
    { id: 'q16', a: 'Une vie ordinaire me satisfait pleinement', b: 'Je veux accomplir quelque chose de grand', narcissistic: 'b' },
  ],
  es: [
    { id: 'q1', a: 'Me siento más cómodo siguiendo que liderando', b: 'Soy un líder nato', narcissistic: 'b' },
    { id: 'q2', a: 'Cuando me elogian me incomodo un poco', b: 'Disfruto los elogios y creo que los merezco', narcissistic: 'b' },
    { id: 'q3', a: 'No tengo mucha influencia sobre mi vida', b: 'Tengo gran influencia sobre quienes me rodean', narcissistic: 'b' },
    { id: 'q4', a: 'Para todos soy una persona corriente', b: 'Me considero alguien especial', narcissistic: 'b' },
    { id: 'q5', a: 'No busco el poder', b: 'Con poder podría cambiar el mundo a mejor', narcissistic: 'b' },
    { id: 'q6', a: 'La mirada de los demás no me preocupa mucho', b: 'Me importa mucho cómo me ven los demás', narcissistic: 'b' },
    { id: 'q7', a: 'Me cuesta decir con franqueza lo que quiero', b: 'Sé cómo conseguir lo que quiero', narcissistic: 'b' },
    { id: 'q8', a: 'No tengo mucha confianza en mi aspecto', b: 'Cuido mi aspecto y me siento algo orgulloso de él', narcissistic: 'b' },
    { id: 'q9', a: 'Soy una persona más entre otras', b: 'Claramente hay cosas en las que valgo más que otros', narcissistic: 'b' },
    { id: 'q10', a: 'Para decidir me dejo llevar bastante por la opinión ajena', b: 'Sé decidir por mí mismo', narcissistic: 'b' },
    { id: 'q11', a: 'No busco trato de favor', b: 'Creo que merezco un trato especial', narcissistic: 'b' },
    { id: 'q12', a: 'No se me da bien persuadir o influir en la gente', b: 'Sé convencer a la gente para conseguir lo que quiero', narcissistic: 'b' },
    { id: 'q13', a: 'Quiero ser alguien respetado', b: 'Que me tengan algo de respeto temeroso no me molesta', narcissistic: 'b' },
    { id: 'q14', a: 'En una exposición o sitio parecido prefiero no destacar', b: 'Me gusta ser el centro de atención', narcissistic: 'b' },
    { id: 'q15', a: 'Siento las emociones de los demás como propias', b: 'A menudo siento que mis metas van primero', narcissistic: 'b' },
    { id: 'q16', a: 'Una vida corriente ya me satisface', b: 'Quiero lograr algo grande', narcissistic: 'b' },
  ],
}

const RESULTS: Record<ResultKey, Record<SupportedLang, ResultData>> = {
  humble: {
    ko: {
      title: '겸손한 성향', subtitle: '자기보다 타인을 먼저 생각합니다',
      description: '당신은 자기 자신보다 타인의 필요와 감정을 우선시하는 경향이 강합니다. 겸손하고 공감 능력이 뛰어나지만, 때로는 자신의 필요를 충분히 표현하지 못할 수 있습니다.',
      traits: ['강한 공감 능력', '타인 중심적 사고', '권력에 대한 낮은 욕구', '지나친 자기 비하 가능성'],
      tips: ['자신의 필요와 경계를 표현하는 연습', '자기 칭찬을 두려워하지 않기', '건강한 자기 확신 키우기'],
      note: '지나친 겸손은 자기 존중감 저하로 이어질 수 있습니다.',
      affirmation: '당신의 필요도 소중합니다. 자신을 먼저 돌보는 것은 이기적인 것이 아닙니다.',
    },
    en: {
      title: 'Humble Personality', subtitle: 'You put others before yourself',
      description: 'You tend to prioritize others\' needs and feelings over your own. You have strong empathy and humility, but you may sometimes struggle to express your own needs adequately.',
      traits: ['Strong empathy', 'Other-focused thinking', 'Low desire for power', 'Risk of excessive self-deprecation'],
      tips: ['Practice expressing your needs and boundaries', "Don't be afraid to praise yourself", 'Build healthy self-confidence'],
      note: 'Excessive humility can lead to reduced self-esteem over time.',
      affirmation: 'Your needs matter too. Taking care of yourself first is not selfish.',
    },
    ja: {
      title: '謙虚な性格', subtitle: '自分より他人を優先します',
      description: '自分よりも他者のニーズや感情を優先する傾向が強いです。共感力が高く謙虚ですが、自分のニーズを十分に表現できないことがあります。',
      traits: ['強い共感力', '他者中心の思考', '権力への欲求が低い', '過度な自己卑下のリスク'],
      tips: ['自分のニーズと境界を表現する練習', '自己称賛を恐れない', '健全な自己確信を育てる'],
      note: '過度な謙虚さは自尊心の低下につながる可能性があります。',
      affirmation: 'あなたのニーズも大切です。自分を最初に大切にすることは利己的ではありません。',
    },
    zh: {
      title: '谦和倾向', subtitle: '你会把别人放在自己前面',
      description: '你倾向把别人的需要和感受放在自己之前。你谦和，共情力也强，但有时候会把自己的需要说不出口。',
      traits: ['共情力强', '以他人为中心的思考', '对权力的欲望低', '可能过度贬低自己'],
      tips: ['练习把自己的需要和界线说出来', '别怕肯定自己', '养出健康的自我笃定'],
      note: '过度的谦让，可能会把自尊一起压下去。',
      affirmation: '你的需要同样重要。先照顾自己，并不是自私。',
    },
    fr: {
      title: 'Tendance humble', subtitle: 'Vous pensez aux autres avant vous',
      description: 'Vous faites souvent passer les besoins et les émotions des autres avant les vôtres. Vous êtes modeste et très empathique, mais vous exprimez parfois trop peu ce dont vous avez besoin.',
      traits: ['Forte empathie', 'Une pensée centrée sur autrui', 'Peu de désir de pouvoir', 'Risque de se dévaloriser'],
      tips: ['S’entraîner à dire ses besoins et ses limites', 'Ne pas craindre de se reconnaître du mérite', 'Développer une assurance saine'],
      note: 'Une modestie excessive peut entamer l’estime de soi.',
      affirmation: 'Vos besoins comptent aussi. Prendre soin de vous d’abord n’est pas de l’égoïsme.',
    },
    es: {
      title: 'Tendencia humilde', subtitle: 'Piensas en los demás antes que en ti',
      description: 'Sueles poner las necesidades y los sentimientos ajenos por delante de los tuyos. Eres modesto y muy empático, pero a veces expresas poco lo que necesitas.',
      traits: ['Empatía fuerte', 'Pensamiento centrado en los demás', 'Poco deseo de poder', 'Riesgo de menospreciarte'],
      tips: ['Practicar decir tus necesidades y tus límites', 'No temer reconocerte el mérito', 'Desarrollar una seguridad sana'],
      note: 'Una modestia excesiva puede erosionar la autoestima.',
      affirmation: 'Tus necesidades también cuentan. Cuidarte primero no es egoísmo.',
    },
  },
  balanced: {
    ko: {
      title: '균형 잡힌 자기애', subtitle: '건강한 자존감을 가지고 있습니다',
      description: '자기 자신을 충분히 존중하면서도 타인의 감정과 필요에 공감할 줄 압니다. 이 균형이 건강한 인간관계와 심리적 안정의 기반이 됩니다.',
      traits: ['건강한 자존감', '자기와 타인 모두에 대한 공감', '적절한 자기 표현', '유연한 대인 관계'],
      tips: ['현재의 균형을 의도적으로 유지하기', '스트레스 상황에서의 자기 인식 강화', '타인과의 건강한 경계 유지'],
      note: '균형 잡힌 자기애는 심리적 건강의 핵심 요소입니다.',
      affirmation: '당신은 자신을 사랑하면서도 타인을 배려할 줄 알고 있습니다. 그것이 진정한 강함입니다.',
    },
    en: {
      title: 'Balanced Self-Love', subtitle: 'You have a healthy sense of self-worth',
      description: 'You respect yourself while also empathizing with others\' feelings and needs. This balance is the foundation of healthy relationships and psychological stability.',
      traits: ['Healthy self-esteem', 'Empathy for self and others', 'Appropriate self-expression', 'Flexible interpersonal style'],
      tips: ['Intentionally maintain your current balance', 'Strengthen self-awareness under stress', 'Keep healthy boundaries with others'],
      note: 'Balanced self-love is a core element of psychological health.',
      affirmation: 'You know how to love yourself while still caring for others. That is true strength.',
    },
    ja: {
      title: 'バランスの取れた自己愛', subtitle: '健全な自己肯定感を持っています',
      description: '自分自身を十分に尊重しながら、他者の感情やニーズにも共感できます。このバランスが健全な人間関係と心理的安定の基盤となります。',
      traits: ['健全な自尊心', '自己と他者への共感', '適切な自己表現', '柔軟な対人関係'],
      tips: ['現在のバランスを意図的に維持する', 'ストレス下での自己認識を強化する', '他者との健全な境界を維持する'],
      note: 'バランスの取れた自己愛は心理的健康の核心要素です。',
      affirmation: '自分を愛しながら他者も思いやることができます。それが本当の強さです。',
    },
    zh: {
      title: '均衡的自我关注', subtitle: '你有健康的自尊',
      description: '你既够尊重自己，也共情得了别人的感受和需要。这份平衡是健康关系和心理稳定的基础。',
      traits: ['健康的自尊', '对自己和别人都有共情', '适度的自我表达', '有弹性的人际关系'],
      tips: ['有意识地守住现在的平衡', '在压力情境里，加强对自己的觉察', '和别人之间维持健康的界线'],
      note: '均衡的自我关注，是心理健康的核心之一。',
      affirmation: '你既爱自己，也顾得上别人。那才是真正的强。',
    },
    fr: {
      title: 'Équilibre', subtitle: 'Vous avez une estime de vous saine',
      description: 'Vous vous respectez suffisamment tout en comprenant les émotions et les besoins des autres. Cet équilibre soutient des relations saines et une stabilité intérieure.',
      traits: ['Une estime de soi saine', 'De l’empathie pour soi et pour autrui', 'Une expression de soi mesurée', 'Des relations souples'],
      tips: ['Préserver consciemment cet équilibre', 'Renforcer la conscience de soi en situation de stress', 'Maintenir des limites saines avec les autres'],
      note: 'Un rapport équilibré à soi est au cœur de la santé psychique.',
      affirmation: 'Vous vous aimez et vous tenez compte des autres. C’est là qu’est la vraie force.',
    },
    es: {
      title: 'Equilibrio', subtitle: 'Tienes una autoestima sana',
      description: 'Te respetas lo suficiente y a la vez comprendes lo que sienten y necesitan los demás. Ese equilibrio sostiene vínculos sanos y estabilidad interior.',
      traits: ['Autoestima sana', 'Empatía hacia ti y hacia los demás', 'Una expresión de ti mesurada', 'Relaciones flexibles'],
      tips: ['Preservar conscientemente ese equilibrio', 'Reforzar la conciencia de ti bajo estrés', 'Mantener límites sanos con los demás'],
      note: 'Una relación equilibrada contigo mismo es el núcleo de la salud psíquica.',
      affirmation: 'Te quieres y a la vez cuidas de los demás. Ahí está la fuerza de verdad.',
    },
  },
  confident: {
    ko: {
      title: '자신감 있는 성향', subtitle: '강한 자기 확신과 리더십을 가집니다',
      description: '자신에 대한 강한 확신과 리더십을 발휘하는 편입니다. 목표 지향적이고 자기 표현이 뛰어나지만, 타인의 감정을 간과할 위험이 있습니다.',
      traits: ['강한 자기 확신', '뛰어난 리더십', '목표 지향적 사고', '타인 감정 간과 가능성'],
      tips: ['타인의 관점을 의식적으로 경청하는 습관', '칭찬과 공감을 더 많이 표현하기', '팀의 성공을 나의 성공으로 보는 시각'],
      note: '높은 자신감은 장점이지만, 공감 능력과 균형을 맞추는 것이 중요합니다.',
      affirmation: '당신의 자신감은 귀한 자산입니다. 그것을 타인을 위해 사용할 때 진정한 리더가 됩니다.',
    },
    en: {
      title: 'Self-Confident', subtitle: 'You have strong conviction and leadership',
      description: 'You tend to show strong self-belief and leadership. You are goal-oriented with excellent self-expression, but there is a risk of overlooking others\' emotions.',
      traits: ['Strong self-belief', 'Excellent leadership', 'Goal-oriented thinking', 'Risk of overlooking others\' feelings'],
      tips: ['Make a habit of consciously listening to others\' perspectives', 'Express more praise and empathy', "See the team's success as your own"],
      note: "High confidence is a strength, but balancing it with empathy is important.",
      affirmation: 'Your confidence is a precious asset. You become a true leader when you use it for others.',
    },
    ja: {
      title: '自信のある性格', subtitle: '強い自己確信とリーダーシップを持ちます',
      description: '自分への強い確信とリーダーシップを発揮する傾向があります。目標志向で自己表現が優れていますが、他者の感情を見落とすリスクがあります。',
      traits: ['強い自己確信', '優れたリーダーシップ', '目標志向の思考', '他者の感情を見落とすリスク'],
      tips: ['他者の視点を意識的に傾聴する習慣', '称賛と共感をより多く表現する', 'チームの成功を自分の成功と見る視点'],
      note: '高い自信は長所ですが、共感力とバランスを取ることが大切です。',
      affirmation: 'あなたの自信は貴重な資産です。他者のために使うとき、本当のリーダーになれます。',
    },
    zh: {
      title: '自信的倾向', subtitle: '你有强的自我笃定和领导力',
      description: '你对自己有很强的把握，也带得动人。你目标感强、表达得好，但有时候容易忽略别人的感受。',
      traits: ['强的自我笃定', '出色的领导力', '目标导向的思考', '可能忽略别人的情绪'],
      tips: ['有意识地去听别人的角度', '多表达一些称赞和共情', '把团队的成功看成自己的成功'],
      note: '高自信是优势，但要和共情配得上。',
      affirmation: '你的自信是珍贵的资产。当它被用在别人身上时，你才真正成为领导者。',
    },
    fr: {
      title: 'Assurance', subtitle: 'Vous avez une forte confiance en vous et du leadership',
      description: 'Vous croyez fermement en vous et vous savez entraîner. Orienté résultats et à l’aise pour vous exprimer, vous risquez parfois de passer à côté des émotions des autres.',
      traits: ['Une forte assurance', 'Un leadership marqué', 'Une pensée orientée vers l’objectif', 'Risque de négliger les émotions d’autrui'],
      tips: ['Écouter volontairement le point de vue des autres', 'Exprimer davantage de reconnaissance et d’empathie', 'Voir la réussite de l’équipe comme la sienne'],
      note: 'Une grande confiance est un atout, à condition de l’équilibrer par l’empathie.',
      affirmation: 'Votre assurance est précieuse. C’est en la mettant au service des autres que l’on devient vraiment un leader.',
    },
    es: {
      title: 'Seguridad', subtitle: 'Tienes mucha confianza en ti y liderazgo',
      description: 'Crees firmemente en ti y sabes arrastrar. Orientado a resultados y con soltura para expresarte, a veces corres el riesgo de pasar por alto lo que sienten los demás.',
      traits: ['Mucha confianza en ti', 'Liderazgo marcado', 'Pensamiento orientado a la meta', 'Riesgo de descuidar las emociones ajenas'],
      tips: ['Escuchar a propósito el punto de vista del otro', 'Expresar más reconocimiento y empatía', 'Ver el éxito del equipo como propio'],
      note: 'Mucha confianza es una ventaja, siempre que se equilibre con empatía.',
      affirmation: 'Tu seguridad es valiosa. Es al ponerla al servicio de otros cuando te vuelves de verdad un líder.',
    },
  },
  high: {
    ko: {
      title: '높은 자기애 성향', subtitle: '자기중심적 패턴이 강하게 나타납니다',
      description: '자기중심적 사고 패턴이 강하게 나타납니다. 이는 강한 동기부여와 목표 달성력의 원천이 될 수 있지만, 인간관계에서 갈등을 유발하거나 공감 능력이 낮게 평가될 수 있습니다.',
      traits: ['강한 자기중심적 사고', '특권 의식', '타인 조종 경향', '낮은 공감 반응'],
      tips: ['타인의 시각에서 상황을 이해하는 연습', '감정적 공감 능력 개발', '자기 비판을 위협이 아닌 성장 기회로 보기', '전문 심리 상담 고려'],
      note: '이 결과는 성격의 일부를 반영할 뿐이며, 변화는 언제나 가능합니다.',
      affirmation: '자신을 사랑하는 것과 타인을 배려하는 것은 서로 충돌하지 않습니다. 둘 다 가능합니다.',
    },
    en: {
      title: 'High Narcissism Tendency', subtitle: 'Self-centered patterns are prominent',
      description: 'You show strong self-centered thinking patterns. This can fuel powerful motivation and goal achievement, but it may also cause relationship conflicts or lead others to see you as low in empathy.',
      traits: ['Strong self-centered thinking', 'Sense of entitlement', 'Tendency to manipulate others', 'Low empathic response'],
      tips: ['Practice understanding situations from others\' perspectives', 'Develop emotional empathy skills', 'See self-criticism as growth, not a threat', 'Consider professional counseling'],
      note: 'This result reflects only part of your personality, and change is always possible.',
      affirmation: 'Loving yourself and caring for others are not in conflict. Both are possible.',
    },
    ja: {
      title: '高い自己愛傾向', subtitle: '自己中心的なパターンが強く現れます',
      description: '自己中心的な思考パターンが強く現れます。強い動機付けや目標達成力の源になり得ますが、人間関係での衝突や共感力の低さとして評価されることがあります。',
      traits: ['強い自己中心的思考', '特権意識', '他者を操作する傾向', '低い共感反応'],
      tips: ['他者の視点から状況を理解する練習', '感情的共感力を開発する', '自己批判を成長の機会として捉える', '専門的なカウンセリングを検討する'],
      note: 'この結果は性格の一部を反映するだけであり、変化はいつでも可能です。',
      affirmation: '自分を愛することと他者を思いやることは矛盾しません。どちらも可能です。',
    },
    zh: {
      title: '自我中心倾向偏高', subtitle: '以自己为中心的模式很明显',
      description: '以自己为中心的思考模式表现得很强。这可以是很强的动机和达成力的来源，但在关系里可能引起冲突，也可能让人觉得你共情不足。',
      traits: ['强烈的自我中心思考', '特权感', '倾向于操控他人', '共情反应偏低'],
      tips: ['练习从别人的角度理解情况', '培养情绪上的共情', '把对自己的批评看成成长的机会，而不是威胁', '考虑寻求专业的心理咨询'],
      note: '这个结果只映出性格的一部分，改变随时都可能发生。',
      affirmation: '爱自己和顾及别人，并不冲突。两件事可以同时做到。',
    },
    fr: {
      title: 'Tendance élevée à se centrer sur soi', subtitle: 'Un schéma égocentré marqué',
      description: 'Le schéma de pensée centré sur soi est nettement présent. Il peut être une source de motivation et de réussite, mais il crée parfois des conflits relationnels et donne une impression de faible empathie.',
      traits: ['Une pensée fortement centrée sur soi', 'Un sentiment de privilège', 'Une tendance à manœuvrer autrui', 'Des réponses empathiques faibles'],
      tips: ['S’exercer à comprendre la situation du point de vue de l’autre', 'Développer l’empathie émotionnelle', 'Voir la critique de soi comme une occasion de grandir, non comme une menace', 'Envisager un accompagnement psychologique'],
      note: 'Ce résultat ne reflète qu’une partie de la personnalité, et le changement reste toujours possible.',
      affirmation: 'S’aimer soi-même et tenir compte des autres ne s’opposent pas. Les deux sont possibles.',
    },
    es: {
      title: 'Tendencia alta a centrarte en ti', subtitle: 'Un patrón egocéntrico marcado',
      description: 'El patrón de pensamiento centrado en ti aparece con fuerza. Puede ser fuente de motivación y de logros, pero a veces genera conflictos en los vínculos y da impresión de poca empatía.',
      traits: ['Pensamiento muy centrado en ti', 'Sensación de privilegio', 'Tendencia a manejar a los demás', 'Respuestas empáticas bajas'],
      tips: ['Practicar entender la situación desde el otro lado', 'Desarrollar la empatía emocional', 'Ver la crítica hacia ti como ocasión de crecer, no como amenaza', 'Valorar acompañamiento psicológico'],
      note: 'Este resultado refleja solo una parte del carácter, y el cambio siempre es posible.',
      affirmation: 'Quererte y cuidar de los demás no se contradicen. Se pueden las dos cosas.',
    },
  },
}

function getResultKey(score: number): ResultKey {
  if (score <= 5) return 'humble'
  if (score <= 10) return 'balanced'
  if (score <= 13) return 'confident'
  return 'high'
}

interface Props { locale?: string }

export default function NarcissismTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const locale = l
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "narcissism", title: "NarcissismTest", finished: Boolean(done) || score != null });

  function pick(choice: 'a' | 'b') {
    const q = questions[current]
    const gained = q.narcissistic === choice ? 1 : 0
    const newScore = score + gained
    if (current + 1 >= questions.length) {
      setScore(newScore)
      setDone(true)
    } else {
      setScore(newScore)
      setCurrent(current + 1)
    }
  }

  function restart() { setCurrent(0); setScore(0); setDone(false) }

  function share() {
    const url = window.location.href
    const key = getResultKey(score)
    const text = `${lb.shareMsg} — ${RESULTS[key][l].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  if (!done) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <Questionnaire<'a' | 'b'>
        title={lb.title}
        subtitle={lb.subtitle}
        question={lb.chooseOne}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={(['a', 'b'] as const).map((choice) => ({
          label: choice === 'a' ? q.a : q.b,
          value: choice,
        }))}
        note={lb.disclaimer}
        onSelect={pick}
      />
    )
  }

  const key = getResultKey(score)
  const r = RESULTS[key][l]
  const pct = Math.round((score / 16) * 100)
  const levelColor = key === 'high' ? '#ef4444' : key === 'confident' ? '#f59e0b' : key === 'balanced' ? '#22c55e' : '#435D31'

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourScore}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: levelColor }}>{r.title}</div>
        <p className="font-medium text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color: levelColor }}>{score} {lb.outOf}</span>
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
        <h3 className="font-semibold text-sm">{lb.traits}</h3>
        <ul className="space-y-1">{r.traits.map(t => <li key={t} className="text-sm text-muted-foreground flex gap-2"><span>•</span>{t}</li>)}</ul>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm text-green-600">{lb.tips}</h3>
        <ul className="space-y-1">{r.tips.map(t => <li key={t} className="text-sm text-muted-foreground flex gap-2"><span className="text-green-500">→</span>{t}</li>)}</ul>
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
      <ShareResultButton
        locale={locale}
        heading={lb.title}
        resultTitle={r.title}
        emoji={key === 'high' ? '🪞' : key === 'confident' ? '✨' : key === 'balanced' ? '⚖️' : '🌿'}
        description={r.description}
      />
      <ResultNextSteps
        locale={locale}
        links={[
          { href: `/${locale}/self-esteem/test/`, label: locale === 'ko' ? '🌿 자존감 테스트' : locale === 'ja' ? '🌿 自尊感情テスト' : '🌿 Self-esteem test' },
          { href: `/${locale}/inner-strength/test/`, label: locale === 'ko' ? '🧠 내면 강점 테스트' : locale === 'ja' ? '🧠 内面の強さテスト' : '🧠 Inner strength test' },
          { href: `/${locale}/habit-builder/guide/`, label: locale === 'ko' ? '✅ 습관 만들기 가이드' : locale === 'ja' ? '✅ 習慣づくりガイド' : '✅ Habit builder guide' },
        ]}
      />
      <div className="flex gap-3">
        <button onClick={restart} aria-label={lb.restart} className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} aria-label={lb.share} className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
    </div>
  )
}
