import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type DimKey = 'intensity' | 'frequency' | 'span' | 'density'
type Level = 'low' | 'developing' | 'appreciative' | 'deeply_grateful'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question { id: string; text: string; dim: DimKey }
interface LevelData {
  title: string; subtitle: string; description: string
  insights: string[]; practices: string[]; affirmation: string
}

const DIM_KEYS: DimKey[] = ['intensity', 'frequency', 'span', 'density']

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string, string]
  restart: string; share: string; shareMsg: string; yourLevel: string
  insights: string; practices: string; affirmation: string
  scoreLabel: string; outOf: string; dimProfile: string
  note: string; dimNames: Record<DimKey, string>
}> = {
  ko: {
    title: '감사 성향 테스트',
    subtitle: '나는 얼마나 감사하며 사는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 그렇지 않다', '별로 그렇지 않다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기', share: '결과 공유', shareMsg: '나의 감사 수준은',
    yourLevel: '나의 감사 성향', insights: '나의 감사 패턴', practices: '감사 실천법',
    affirmation: '오늘의 메시지', scoreLabel: '감사 점수', outOf: '/ 60점',
    dimProfile: '감사 차원 분석',
    note: '이 테스트는 GQ-6와 McCullough의 감사 연구를 기반으로 한 참고용 자가 진단입니다.',
    dimNames: { intensity: '강도', frequency: '빈도', span: '범위', density: '밀도' },
  },
  en: {
    title: 'Gratitude Style Test',
    subtitle: 'How Grateful Are You?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Rarely', 'Neutral', 'Mostly yes', 'Very much'],
    restart: 'Retake', share: 'Share Result', shareMsg: 'My gratitude level is',
    yourLevel: 'Your Gratitude Style', insights: 'My Gratitude Patterns', practices: 'Gratitude Practices',
    affirmation: "Today's Message", scoreLabel: 'Gratitude Score', outOf: '/ 60',
    dimProfile: 'Gratitude Dimension Profile',
    note: 'This test is based on the GQ-6 and McCullough\'s gratitude research. For reference only.',
    dimNames: { intensity: 'Intensity', frequency: 'Frequency', span: 'Span', density: 'Density' },
  },
  ja: {
    title: '感謝傾向テスト',
    subtitle: '私はどのくらい感謝して生きているか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くそうでない', 'あまりそうでない', '普通', '大体そうだ', 'とてもそうだ'],
    restart: 'もう一度', share: '結果を共有', shareMsg: '私の感謝レベルは',
    yourLevel: '私の感謝傾向', insights: '感謝パターン', practices: '感謝の実践法',
    affirmation: '今日のメッセージ', scoreLabel: '感謝スコア', outOf: '/ 60点',
    dimProfile: '感謝の次元分析',
    note: 'このテストはGQ-6とMcCulloughの感謝研究を参考にした自己診断です。',
    dimNames: { intensity: '強度', frequency: '頻度', span: '範囲', density: '密度' },
  },
  zh: {
    title: '感恩倾向测验',
    subtitle: '我活得有多少感谢？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '不太是', '一般', '大致是', '非常是'],
    restart: '重新测验', share: '分享结果', shareMsg: '我的感恩程度是',
    yourLevel: '我的感恩倾向', insights: '我的感恩模式', practices: '可以练的做法',
    affirmation: '今天想对你说', scoreLabel: '感恩分数', outOf: '/ 60 分',
    dimProfile: '感恩的四个面向',
    note: '本测验参考 GQ-6 与 McCullough 的感恩研究，属于参考性的自我观察。',
    dimNames: { intensity: '强度', frequency: '频率', span: '广度', density: '密度' },
  },
  fr: {
    title: 'Test du rapport à la gratitude',
    subtitle: 'Quelle place la gratitude tient-elle dans ma vie ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Plutôt pas', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer', share: 'Partager le résultat', shareMsg: 'Mon niveau de gratitude',
    yourLevel: 'Votre rapport à la gratitude', insights: 'Votre façon de remercier', practices: 'Pratiques possibles',
    affirmation: 'Un mot pour aujourd’hui', scoreLabel: 'Score de gratitude', outOf: '/ 60 points',
    dimProfile: 'Les quatre dimensions',
    note: 'Ce test s’inspire du GQ-6 et des travaux de McCullough sur la gratitude ; c’est une observation de soi, à titre indicatif.',
    dimNames: { intensity: 'Intensité', frequency: 'Fréquence', span: 'Étendue', density: 'Densité' },
  },
  es: {
    title: 'Test de gratitud',
    subtitle: '¿Cuánta gratitud hay en mi vida?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Más bien no', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir', share: 'Compartir resultado', shareMsg: 'Mi nivel de gratitud',
    yourLevel: 'Tu relación con la gratitud', insights: 'Tu forma de agradecer', practices: 'Prácticas posibles',
    affirmation: 'Algo para hoy', scoreLabel: 'Puntuación de gratitud', outOf: '/ 60 puntos',
    dimProfile: 'Las cuatro dimensiones',
    note: 'Este test se inspira en el GQ-6 y en los trabajos de McCullough sobre la gratitud; es una autoobservación orientativa.',
    dimNames: { intensity: 'Intensidad', frequency: 'Frecuencia', span: 'Amplitud', density: 'Densidad' },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1',  dim: 'intensity',  text: '좋은 일이 생겼을 때 깊이 감사한 감정을 느낀다' },
    { id: 'q2',  dim: 'intensity',  text: '누군가 나를 도와줬을 때 그 고마움을 강하게 느낀다' },
    { id: 'q3',  dim: 'intensity',  text: '아름다운 풍경이나 음악을 접할 때 깊은 감동을 느낀다' },
    { id: 'q4',  dim: 'frequency',  text: '하루에도 여러 번 감사한 일을 발견한다' },
    { id: 'q5',  dim: 'frequency',  text: '작은 일에도 자연스럽게 감사함을 느낀다' },
    { id: 'q6',  dim: 'frequency',  text: '아침에 눈을 뜰 때 살아있다는 것에 감사함을 느낀다' },
    { id: 'q7',  dim: 'span',       text: '나의 삶에 기여한 많은 사람들에게 감사함을 느낀다' },
    { id: 'q8',  dim: 'span',       text: '자연, 사회, 우주와 같은 큰 것들에도 감사함을 느낀다' },
    { id: 'q9',  dim: 'span',       text: '힘든 경험도 결국 나를 성장시켰다는 감사함이 있다' },
    { id: 'q10', dim: 'density',    text: '한 가지 좋은 일에 많은 사람들이 기여했음을 인식한다' },
    { id: 'q11', dim: 'density',    text: '내가 지금 가진 것들은 많은 사람의 노력 덕분임을 안다' },
    { id: 'q12', dim: 'density',    text: '내 성공의 배경에는 보이지 않는 많은 도움이 있었다고 생각한다' },
  ],
  en: [
    { id: 'q1',  dim: 'intensity',  text: 'When something good happens, I feel deeply grateful' },
    { id: 'q2',  dim: 'intensity',  text: 'When someone helps me, I feel the gratitude intensely' },
    { id: 'q3',  dim: 'intensity',  text: 'I feel deeply moved by beautiful scenery or music' },
    { id: 'q4',  dim: 'frequency',  text: 'I find things to be grateful for multiple times throughout the day' },
    { id: 'q5',  dim: 'frequency',  text: 'I naturally feel grateful even for small things' },
    { id: 'q6',  dim: 'frequency',  text: 'When I wake up, I feel grateful just to be alive' },
    { id: 'q7',  dim: 'span',       text: 'I feel grateful toward the many people who have contributed to my life' },
    { id: 'q8',  dim: 'span',       text: 'I feel gratitude toward large things like nature, society, and the universe' },
    { id: 'q9',  dim: 'span',       text: 'I am grateful even for difficult experiences, as they helped me grow' },
    { id: 'q10', dim: 'density',    text: 'I recognize that many people contributed to a single good thing in my life' },
    { id: 'q11', dim: 'density',    text: 'I know that what I have now is thanks to many people\'s efforts' },
    { id: 'q12', dim: 'density',    text: 'I believe there was much invisible help behind my achievements' },
  ],
  ja: [
    { id: 'q1',  dim: 'intensity',  text: '良いことが起きたとき、深い感謝の気持ちを感じる' },
    { id: 'q2',  dim: 'intensity',  text: '誰かが助けてくれたとき、その感謝を強く感じる' },
    { id: 'q3',  dim: 'intensity',  text: '美しい景色や音楽に触れるとき、深く感動する' },
    { id: 'q4',  dim: 'frequency',  text: '一日に何度も感謝できることを見つける' },
    { id: 'q5',  dim: 'frequency',  text: '小さなことにも自然と感謝の気持ちが湧く' },
    { id: 'q6',  dim: 'frequency',  text: '朝目覚めるとき、生きていることに感謝を感じる' },
    { id: 'q7',  dim: 'span',       text: '自分の人生に貢献してくれた多くの人に感謝を感じる' },
    { id: 'q8',  dim: 'span',       text: '自然、社会、宇宙のような大きなものにも感謝を感じる' },
    { id: 'q9',  dim: 'span',       text: '辛い経験も最終的に自分を成長させてくれたことへの感謝がある' },
    { id: 'q10', dim: 'density',    text: '一つの良いことに多くの人が貢献していると認識する' },
    { id: 'q11', dim: 'density',    text: '今自分が持っているものは多くの人の努力のおかげだとわかる' },
    { id: 'q12', dim: 'density',    text: '自分の成功の背景には見えない多くのサポートがあったと思う' },
  ],
  zh: [
    { id: 'q1',  dim: 'intensity',  text: '有好事发生时，我会真切地感到感谢' },
    { id: 'q2',  dim: 'intensity',  text: '有人帮了我，我会强烈地记着这份好' },
    { id: 'q3',  dim: 'intensity',  text: '看到好风景或听到好音乐时，我会深深被打动' },
    { id: 'q4',  dim: 'frequency',  text: '一天里我会好几次发现值得感谢的事' },
    { id: 'q5',  dim: 'frequency',  text: '小事也会自然让我生出谢意' },
    { id: 'q6',  dim: 'frequency',  text: '早上睁开眼，我会为还活着而感谢' },
    { id: 'q7',  dim: 'span',       text: '对那些让我的人生更好的人，我心里有谢意' },
    { id: 'q8',  dim: 'span',       text: '对自然、社会、天地这些大的东西，我也有感谢' },
    { id: 'q9',  dim: 'span',       text: '难走的路最后也让我长大了，为此我心存感谢' },
    { id: 'q10', dim: 'density',    text: '一件好事背后，我看得见许多人的份' },
    { id: 'q11', dim: 'density',    text: '我现在拥有的，是很多人努力的结果' },
    { id: 'q12', dim: 'density',    text: '我的成绩背后，有很多看不见的帮忙' },
  ],
  fr: [
    { id: 'q1',  dim: 'intensity',  text: 'Quand quelque chose de bon arrive, j’éprouve une gratitude profonde' },
    { id: 'q2',  dim: 'intensity',  text: 'Quand on m’aide, je ressens fortement cette bienveillance' },
    { id: 'q3',  dim: 'intensity',  text: 'Devant un beau paysage ou une belle musique, je suis profondément touché' },
    { id: 'q4',  dim: 'frequency',  text: 'Dans une journée, je repère plusieurs fois de quoi remercier' },
    { id: 'q5',  dim: 'frequency',  text: 'Même les petites choses éveillent naturellement ma gratitude' },
    { id: 'q6',  dim: 'frequency',  text: 'Au réveil, je suis reconnaissant d’être en vie' },
    { id: 'q7',  dim: 'span',       text: 'J’éprouve de la gratitude pour tous ceux qui ont contribué à ma vie' },
    { id: 'q8',  dim: 'span',       text: 'J’éprouve aussi de la gratitude envers la nature, la société, le monde' },
    { id: 'q9',  dim: 'span',       text: 'Même les épreuves m’ont fait grandir, et j’en suis reconnaissant' },
    { id: 'q10', dim: 'density',    text: 'Derrière une seule bonne chose, je vois la part de beaucoup de gens' },
    { id: 'q11', dim: 'density',    text: 'Ce que j’ai aujourd’hui vient du travail de beaucoup de personnes' },
    { id: 'q12', dim: 'density',    text: 'Derrière mes réussites, il y a eu beaucoup d’aides invisibles' },
  ],
  es: [
    { id: 'q1',  dim: 'intensity',  text: 'Cuando pasa algo bueno, siento una gratitud honda' },
    { id: 'q2',  dim: 'intensity',  text: 'Cuando alguien me ayuda, siento con fuerza ese gesto' },
    { id: 'q3',  dim: 'intensity',  text: 'Ante un paisaje o una música bella me emociono de verdad' },
    { id: 'q4',  dim: 'frequency',  text: 'A lo largo del día encuentro varias veces algo que agradecer' },
    { id: 'q5',  dim: 'frequency',  text: 'Hasta las cosas pequeñas me despiertan gratitud' },
    { id: 'q6',  dim: 'frequency',  text: 'Al despertar, agradezco estar vivo' },
    { id: 'q7',  dim: 'span',       text: 'Siento gratitud por todos los que han aportado a mi vida' },
    { id: 'q8',  dim: 'span',       text: 'También agradezco a la naturaleza, la sociedad, el mundo' },
    { id: 'q9',  dim: 'span',       text: 'Incluso lo difícil acabó haciéndome crecer, y lo agradezco' },
    { id: 'q10', dim: 'density',    text: 'Detrás de una sola cosa buena veo la parte de mucha gente' },
    { id: 'q11', dim: 'density',    text: 'Lo que tengo hoy viene del trabajo de muchas personas' },
    { id: 'q12', dim: 'density',    text: 'Detrás de mis logros hubo muchas ayudas invisibles' },
  ],
}

const RESULTS: Record<Level, Record<SupportedLang, LevelData>> = {
  low: {
    ko: {
      title: '감사 낮음', subtitle: '감사함을 느끼기 어려운 시기일 수 있습니다',
      description: '현재 감사함을 자주 경험하지 못하고 있습니다. 이것은 삶이 힘들거나 감사를 표현하는 습관이 아직 형성되지 않았기 때문일 수 있습니다. 감사는 훈련을 통해 키울 수 있는 능력입니다.',
      insights: ['현재 상황에 집중하기 어려울 수 있음', '부정적인 것에 주의가 더 쏠리는 경향', '감사 표현 습관이 아직 발달 중'],
      practices: ['매일 밤 3가지 감사한 일 적기', '누군가에게 감사 메시지 보내기', '현재 가진 것에 집중하는 5분 명상', '작은 즐거움 알아차리기 연습'],
      affirmation: '감사는 완벽한 삶에서 오는 것이 아닙니다. 지금 이 순간, 아주 작은 것에서부터 시작할 수 있습니다.',
    },
    en: {
      title: 'Low Gratitude', subtitle: 'This may be a time when gratitude feels difficult',
      description: 'You are not frequently experiencing gratitude at the moment. This may be because life is challenging or because the habit of expressing gratitude has not yet formed. Gratitude is an ability that can be developed through practice.',
      insights: ['May find it difficult to focus on the present', 'Tendency for attention to gravitate toward the negative', 'Gratitude habits still developing'],
      practices: ['Write down 3 things you are grateful for each night', 'Send a thank-you message to someone', '5-minute meditation focusing on what you have now', 'Practice noticing small pleasures'],
      affirmation: 'Gratitude does not come from a perfect life. It can start from the smallest things, right now in this moment.',
    },
    ja: {
      title: '感謝低め', subtitle: '今、感謝を感じにくい時期かもしれません',
      description: '現在、感謝をあまり経験していません。生活が辛かったり、感謝を表現する習慣がまだ形成されていないのかもしれません。感謝は練習によって育てられる能力です。',
      insights: ['現在に集中しにくい可能性がある', 'ネガティブなことに注意が向きやすい傾向', '感謝の習慣がまだ発達途中'],
      practices: ['毎晩3つの感謝することを書く', '誰かに感謝のメッセージを送る', '今持っているものに集中する5分間の瞑想', '小さな喜びに気づく練習'],
      affirmation: '感謝は完璧な人生から来るものではありません。今この瞬間、とても小さなことから始められます。',
    },
    zh: {
      title: '感恩偏低', subtitle: '现在可能是不容易生出谢意的时期',
      description: '眼下你不太常感受到感谢。可能是日子本来就难，也可能是表达感谢的习惯还没长出来。感恩是可以练出来的能力。',
      insights: ['现在可能很难把注意力放回当下', '注意力更容易被负面的事吸走', '表达感谢的习惯还在形成中'],
      practices: ['每天晚上写下三件值得谢的事', '给某个人发一句感谢的话', '用五分钟静一静，只想现在已有的东西', '练习留意小小的快乐'],
      affirmation: '感恩不是从完美的生活里来的。此刻，从很小的地方就能开始。',
    },
    fr: {
      title: 'Gratitude basse', subtitle: 'C’est peut-être une période où la gratitude vient difficilement',
      description: 'En ce moment, vous éprouvez rarement de la gratitude. La vie est peut-être dure, ou l’habitude de remercier n’est pas encore installée. La gratitude est une capacité qui se travaille.',
      insights: ['Difficile de ramener l’attention au présent', 'L’attention se porte plus facilement sur le négatif', 'L’habitude d’exprimer sa gratitude est encore à construire'],
      practices: ['Noter chaque soir trois choses à remercier', 'Envoyer un mot de remerciement à quelqu’un', 'Cinq minutes au calme, sur ce qui est déjà là', 'S’exercer à remarquer les petits plaisirs'],
      affirmation: 'La gratitude ne vient pas d’une vie parfaite. On peut commencer dès maintenant, par de toutes petites choses.',
    },
    es: {
      title: 'Gratitud baja', subtitle: 'Puede ser una época en la que cuesta agradecer',
      description: 'Ahora mismo rara vez sientes gratitud. Puede que la vida esté dura o que el hábito de agradecer aún no esté formado. La gratitud es una capacidad que se entrena.',
      insights: ['Cuesta traer la atención al presente', 'La atención se va con más facilidad a lo negativo', 'El hábito de expresar gratitud aún se está formando'],
      practices: ['Anotar cada noche tres cosas que agradecer', 'Mandarle unas palabras de agradecimiento a alguien', 'Cinco minutos en calma sobre lo que ya tienes', 'Practicar fijarte en los gustos pequeños'],
      affirmation: 'La gratitud no viene de una vida perfecta. Se puede empezar ahora mismo, por algo muy pequeño.',
    },
  },
  developing: {
    ko: {
      title: '성장 중', subtitle: '감사의 씨앗이 자라고 있습니다',
      description: '감사함을 느끼기 시작했지만, 아직 일관성이 부족할 수 있습니다. 가끔 감사함을 경험하지만 습관화되지 않은 상태입니다. 조금씩 실천하면 빠르게 성장할 수 있습니다.',
      insights: ['간헐적으로 감사함을 느낌', '의식적으로 노력할 때 감사 경험이 늘어남', '감사 실천의 효과를 경험하기 시작'],
      practices: ['감사 일지 꾸준히 쓰기', '식사 전 감사 순간 갖기', '나를 도운 사람들을 떠올리기', '자연 속에서 아름다움 발견하기'],
      affirmation: '변화는 이미 시작되었습니다. 작은 감사들이 쌓여 삶을 바꿉니다.',
    },
    en: {
      title: 'Developing', subtitle: 'Seeds of gratitude are growing',
      description: 'You have begun to experience gratitude, but consistency may still be lacking. You sometimes feel grateful but it has not yet become a habit. With small, consistent practice you can grow quickly.',
      insights: ['Gratitude felt intermittently', 'Gratitude increases with conscious effort', 'Beginning to experience the effects of gratitude practice'],
      practices: ['Keep a gratitude journal consistently', 'Have a moment of gratitude before meals', 'Recall people who have helped you', 'Find beauty in nature'],
      affirmation: 'Change has already begun. Small gratitudes accumulate and transform your life.',
    },
    ja: {
      title: '成長中', subtitle: '感謝の種が育っています',
      description: '感謝を感じ始めましたが、まだ一貫性が足りないかもしれません。時々感謝を経験しますが、習慣になっていない状態です。少しずつ実践すれば早く成長できます。',
      insights: ['断続的に感謝を感じる', '意識的に努力すると感謝体験が増える', '感謝実践の効果を経験し始めた'],
      practices: ['感謝日記を継続的につける', '食事前に感謝の時間を持つ', '助けてくれた人たちを思い浮かべる', '自然の中に美しさを見つける'],
      affirmation: '変化はすでに始まっています。小さな感謝が積み重なって人生を変えます。',
    },
    zh: {
      title: '成长中', subtitle: '感恩的种子在长',
      description: '你已经开始感受到谢意，但还不太稳。偶尔会有，却还没成为习惯。一点一点做下去，会长得很快。',
      insights: ['会断断续续地感到感谢', '刻意去做时，感谢的经验就变多', '开始体会到感恩带来的好处'],
      practices: ['坚持写感恩日记', '吃饭前留一小会儿谢意', '想起那些帮过你的人', '在自然里找到美的地方'],
      affirmation: '变化已经开始了。小小的感谢攒起来，会把生活换个样子。',
    },
    fr: {
      title: 'En développement', subtitle: 'La graine de la gratitude pousse',
      description: 'Vous commencez à éprouver de la gratitude, mais de façon encore irrégulière. Elle apparaît parfois, sans être devenue une habitude. En pratiquant un peu, cela peut grandir vite.',
      insights: ['Une gratitude qui va et vient', 'Quand vous y mettez de l’intention, elle se fait plus fréquente', 'Vous commencez à en sentir les effets'],
      practices: ['Tenir un journal de gratitude avec régularité', 'Prendre un instant de gratitude avant le repas', 'Penser à ceux qui vous ont aidé', 'Trouver de la beauté dans la nature'],
      affirmation: 'Le changement a déjà commencé. De petites gratitudes, accumulées, changent une vie.',
    },
    es: {
      title: 'En desarrollo', subtitle: 'La semilla de la gratitud crece',
      description: 'Ya empiezas a sentir gratitud, pero todavía de forma irregular. Aparece a veces, sin llegar a ser hábito. Con un poco de práctica puede crecer rápido.',
      insights: ['Una gratitud que va y viene', 'Cuando pones intención, aparece más a menudo', 'Empiezas a notar sus efectos'],
      practices: ['Llevar un diario de gratitud con constancia', 'Tomar un momento de gratitud antes de comer', 'Pensar en quienes te han ayudado', 'Encontrar belleza en la naturaleza'],
      affirmation: 'El cambio ya empezó. Las gratitudes pequeñas, acumuladas, cambian una vida.',
    },
  },
  appreciative: {
    ko: {
      title: '감사형', subtitle: '삶에서 감사함을 잘 발견합니다',
      description: '일상에서 감사함을 자연스럽게 경험하는 능력이 잘 발달되어 있습니다. 다양한 대상과 순간에서 감사함을 느끼고, 이 감사가 삶의 만족도와 관계의 질에 긍정적인 영향을 미치고 있습니다.',
      insights: ['감사 경험이 풍부하고 다양함', '긍정적인 감정 조절 능력이 높음', '관계에서 감사 표현이 자연스러움'],
      practices: ['감사를 더 구체적이고 깊게 표현하기', '감사를 다른 사람과 나누기', '어려운 상황에서도 감사 찾기 연습', '감사 명상 심화'],
      affirmation: '당신의 감사하는 마음은 당신과 주변을 동시에 풍요롭게 합니다. 이 능력을 소중히 여기세요.',
    },
    en: {
      title: 'Appreciative', subtitle: 'You notice gratitude well in life',
      description: 'Your ability to experience gratitude naturally in daily life is well developed. You feel grateful in a wide range of situations and toward many people, and this gratitude positively influences your life satisfaction and relationship quality.',
      insights: ['Rich and varied gratitude experiences', 'High positive emotion regulation ability', 'Expressing gratitude in relationships feels natural'],
      practices: ['Express gratitude more specifically and deeply', 'Share gratitude with others', 'Practice finding gratitude even in difficult situations', 'Deepen gratitude meditation'],
      affirmation: 'Your grateful heart enriches both you and those around you. Cherish this ability.',
    },
    ja: {
      title: '感謝型', subtitle: '人生の中で感謝をよく見出します',
      description: '日常で感謝を自然に経験する能力がよく発達しています。様々な対象や瞬間に感謝を感じ、この感謝が人生の満足度と関係の質に良い影響を与えています。',
      insights: ['感謝体験が豊かで多様', '肯定的な感情調整能力が高い', '関係の中で感謝表現が自然'],
      practices: ['感謝をより具体的に深く表現する', '感謝を他の人と分かち合う', '困難な状況でも感謝を見つける練習', '感謝の瞑想を深める'],
      affirmation: 'あなたの感謝する心はあなたと周囲を同時に豊かにします。この能力を大切にしてください。',
    },
    zh: {
      title: '感恩型', subtitle: '你很会在生活里看见值得谢的事',
      description: '在日常里自然感受到谢意的能力发展得不错。你会在各种对象和时刻里生出感谢，这份感谢正在提升你的生活满意度和关系品质。',
      insights: ['感谢的体验丰富又多样', '调节正向情绪的能力较强', '在关系里表达谢意很自然'],
      practices: ['把感谢表达得更具体、更深', '把感谢说给别人听', '练习在难的处境里也找到可谢之处', '把感恩的静心做得更深'],
      affirmation: '你的感谢之心同时滋养你和周围。好好珍惜这份能力。',
    },
    fr: {
      title: 'Reconnaissant', subtitle: 'Vous savez voir ce qu’il y a à remercier',
      description: 'Votre capacité à éprouver de la gratitude au quotidien est bien développée. Elle se porte sur des objets et des moments variés, et elle nourrit votre satisfaction de vie et la qualité de vos relations.',
      insights: ['Une gratitude riche et variée', 'Une bonne capacité à réguler les émotions positives', 'L’expression de la gratitude vient naturellement dans la relation'],
      practices: ['Exprimer la gratitude de façon plus concrète et plus profonde', 'Partager sa gratitude avec les autres', 'S’exercer à trouver de quoi remercier même dans les moments durs', 'Approfondir une méditation de gratitude'],
      affirmation: 'Votre gratitude nourrit à la fois vous et votre entourage. Prenez-en soin.',
    },
    es: {
      title: 'Agradecido', subtitle: 'Sabes ver lo que hay que agradecer',
      description: 'Tu capacidad de sentir gratitud en el día a día está bien desarrollada. Se dirige a objetos y momentos variados, y alimenta tu satisfacción con la vida y la calidad de tus vínculos.',
      insights: ['Una gratitud rica y variada', 'Buena capacidad de regular las emociones positivas', 'Expresar gratitud te sale natural en la relación'],
      practices: ['Expresar la gratitud de forma más concreta y honda', 'Compartir tu gratitud con otros', 'Practicar encontrar qué agradecer también en lo difícil', 'Profundizar en una meditación de gratitud'],
      affirmation: 'Tu gratitud alimenta a la vez a ti y a los tuyos. Cuídala.',
    },
  },
  deeply_grateful: {
    ko: {
      title: '깊은 감사형', subtitle: '감사함이 삶의 방식이 되었습니다',
      description: '감사는 단순한 감정이 아니라 삶을 보는 방식이 되었습니다. 큰 일과 작은 일, 보이는 것과 보이지 않는 것 모두에서 깊은 감사를 경험합니다. 이 감사는 당신의 회복탄력성과 관계에 큰 자산입니다.',
      insights: ['감사가 삶의 기본 태도로 자리잡음', '어려운 상황에서도 의미를 찾는 능력', '깊은 연결감과 풍요로움 경험', '감사가 자연스러운 습관화'],
      practices: ['감사를 더 넓게 나누고 표현하기', '어려운 이들에게 감사의 문화 전하기', '감사 실천을 더 깊은 영적 수련으로 확장', '감사 표현을 글이나 예술로 승화'],
      affirmation: '당신의 감사는 세상을 더 밝게 만듭니다. 이 선물을 소중히 가꾸고 나누어 주세요.',
    },
    en: {
      title: 'Deeply Grateful', subtitle: 'Gratitude has become your way of life',
      description: 'Gratitude has become not just an emotion but a way of seeing life. You experience deep thankfulness in both large and small things, visible and invisible. This gratitude is a tremendous asset for your resilience and relationships.',
      insights: ['Gratitude is an established baseline attitude', 'Ability to find meaning even in difficult situations', 'Deep sense of connection and abundance', 'Gratitude is a natural habit'],
      practices: ['Share and express gratitude more broadly', 'Bring a culture of gratitude to those in need', 'Extend gratitude practice into deeper spiritual work', 'Express gratitude through writing or art'],
      affirmation: 'Your gratitude makes the world brighter. Cherish this gift and share it generously.',
    },
    ja: {
      title: '深い感謝型', subtitle: '感謝が生き方になっています',
      description: '感謝は単なる感情ではなく、人生を見る方法になっています。大きなことも小さなことも、見えるものも見えないものも、すべてに深い感謝を経験します。この感謝はあなたの回復力と関係における大きな財産です。',
      insights: ['感謝が人生の基本的な姿勢として定着', '困難な状況でも意味を見出す能力', '深い繋がりと豊かさの経験', '感謝が自然な習慣'],
      practices: ['感謝をより広く分かち合い表現する', '困っている人に感謝の文化を伝える', '感謝の実践をより深い精神的な修練に拡張', '感謝を文章やアートで表現する'],
      affirmation: 'あなたの感謝は世界をより明るくします。この贈り物を大切にし、惜しみなく分かち合ってください。',
    },
    zh: {
      title: '深度感恩型', subtitle: '感恩已经成了你看世界的方式',
      description: '感恩对你不只是一种情绪，而是看待生活的方式。大事小事、看得见的和看不见的，你都能生出深的谢意。这份感恩是你的复原力和关系的一大资产。',
      insights: ['感恩成了基本的生活姿态', '在难处里也找得到意义', '有深的连结感和丰盛感', '感恩已经自然成了习惯'],
      practices: ['把感谢分享得更广、表达得更清楚', '把感恩的风气传给身处困难的人', '把感恩的练习延伸成更深的修习', '用文字或创作把感谢表达出来'],
      affirmation: '你的感恩让世界亮一点。好好把这份礼物养着，也分出去。',
    },
    fr: {
      title: 'Profondément reconnaissant', subtitle: 'La gratitude est devenue une façon de vivre',
      description: 'La gratitude n’est plus seulement une émotion : c’est votre manière de regarder la vie. Grandes choses et petites, visibles et invisibles, vous y trouvez une gratitude profonde. C’est un atout pour votre capacité à rebondir et pour vos relations.',
      insights: ['La gratitude comme posture de base', 'La capacité à trouver du sens même dans la difficulté', 'Un sentiment profond de lien et d’abondance', 'Une gratitude devenue habitude naturelle'],
      practices: ['Partager et exprimer plus largement', 'Transmettre cette culture à ceux qui traversent des épreuves', 'Prolonger la pratique en quelque chose de plus profond', 'Exprimer la gratitude par l’écriture ou la création'],
      affirmation: 'Votre gratitude éclaire le monde. Prenez-en soin, et partagez-la.',
    },
    es: {
      title: 'Profundamente agradecido', subtitle: 'La gratitud se ha vuelto tu forma de vivir',
      description: 'La gratitud ya no es solo una emoción: es tu manera de mirar la vida. En lo grande y lo pequeño, lo visible y lo invisible, encuentras gratitud honda. Es un activo para tu capacidad de recuperarte y para tus vínculos.',
      insights: ['La gratitud como actitud de base', 'Capacidad de encontrar sentido también en lo difícil', 'Un sentimiento hondo de vínculo y abundancia', 'Una gratitud ya vuelta hábito natural'],
      practices: ['Compartirla y expresarla más ampliamente', 'Transmitir esa cultura a quienes lo pasan mal', 'Prolongar la práctica hacia algo más hondo', 'Expresar la gratitud por escrito o creando'],
      affirmation: 'Tu gratitud ilumina el mundo. Cuídala y repártela.',
    },
  },
}

function getLevel(score: number): Level {
  if (score <= 20) return 'low'
  if (score <= 36) return 'developing'
  if (score <= 50) return 'appreciative'
  return 'deeply_grateful'
}

interface Props { locale?: string }

export default function GratitudeStyleTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp)
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [dimScores, setDimScores] = useState<Record<DimKey, number>>(
    () => ({ intensity: 0, frequency: 0, span: 0, density: 0 })
  )
  const [result, setResult] = useState<{ level: Level; total: number } | null>(null)
  useRecordFinishedTest({ testId: "gratitude-style", title: "GratitudeStyleTest", finished: Boolean(result) });

  function pick(val: number) {
    const q = questions[current]
    const scoreVal = val + 1
    const next = { ...dimScores, [q.dim]: dimScores[q.dim] + scoreVal }
    if (current + 1 >= questions.length) {
      const total = Object.values(next).reduce((s, v) => s + v, 0)
      setDimScores(next)
      setResult({ level: getLevel(total), total })
    } else {
      setDimScores(next)
      setCurrent(current + 1)
    }
  }

  function restart() {
    setDimScores({ intensity: 0, frequency: 0, span: 0, density: 0 })
    setCurrent(0)
    setResult(null)
  }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result.level][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = result !== null

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
        note={lb.note}
        onSelect={(value) => pick(value - 1)}
      />
    )
  }

  const r = RESULTS[result.level][locale]
  const pct = Math.round((result.total / 60) * 100)
  const levelColors: Record<Level, string> = {
    low: '#94a3b8', developing: '#f59e0b', appreciative: '#22c55e', deeply_grateful: '#16a34a',
  }
  const color = levelColors[result.level]
  const maxPerDim = 15 // 3 questions * 5 max
  const dimColors: Record<DimKey, string> = {
    intensity: '#435D31', frequency: '#3b82f6', span: '#22c55e', density: '#f59e0b',
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{lb.yourLevel}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: color }}>
          {r.title}
        </div>
        <p className="font-bold" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{r.subtitle}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{r.description}</p>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color }}>{result.total} {lb.outOf}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={lb.scoreLabel}
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--muted, #e5e7eb)' }}
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm">{lb.dimProfile}</h3>
        {DIM_KEYS.map(key => {
          const dp = Math.round((dimScores[key] / maxPerDim) * 100)
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{lb.dimNames[key]}</span>
                <span>{dimScores[key]}</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={dp}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={lb.dimNames[key]}
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--muted, #e5e7eb)' }}
              >
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dp}%`, backgroundColor: dimColors[key] }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm">{lb.insights}</h3>
        <ul className="space-y-1">
          {r.insights.map(s => (
            <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span>•</span>{s}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.practices}</h3>
        <ul className="space-y-1">
          {r.practices.map(p => (
            <li key={p} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span style={{ color: '#22c55e' }}>→</span>{p}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-1" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.affirmation}</h3>
        <p className="text-sm" style={{ color: '#15803d' }}>"{r.affirmation}"</p>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{lb.note}</p>

      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-lg border px-4 py-2 text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--card, #fff)' }}
        >{lb.restart}</button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#16a34a' }}
        >{lb.share}</button>
      </div>
      <ShareResultButton locale={lp} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
