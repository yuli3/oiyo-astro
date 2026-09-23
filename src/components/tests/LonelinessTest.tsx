import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire';
import { scoreLoneliness, type LonelinessLevel } from './loneliness-score';
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang) ? (locale as SupportedLang) : 'en'
}

type Level = LonelinessLevel

interface Question { id: string; text: string; reversed?: boolean }
interface ResultData {
  title: string; subtitle: string; description: string
  tips: string[]; affirmation: string; connectionNote: string
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string; note: string
  questionOf: (c: number, t: number) => string
  scaleLabels: [string, string, string, string]
  restart: string; share: string; shareMsg: string
  yourLevel: string; tips: string; affirmation: string
  connectionNote: string; scoreLabel: string; outOf: string
}> = {
  ko: {
    title: '외로움 자가 점검',
    subtitle: '나는 얼마나 고립되어 있는가?',
    note: '이 검사는 UCLA 외로움 척도를 참고한 자가 점검 도구입니다. 연구 목적의 진단 도구가 아닙니다.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 없다', '거의 없다', '가끔 있다', '자주 있다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 사회적 연결 상태',
    yourLevel: '나의 연결 상태',
    tips: '연결을 위해 해볼 수 있는 것들',
    affirmation: '오늘의 메시지',
    connectionNote: '연결감',
    scoreLabel: '외로움 점수',
    outOf: '/ 40점',
  },
  en: {
    title: 'Loneliness Self-Assessment',
    subtitle: 'How Connected Are You?',
    note: 'This is a self-assessment tool based on the UCLA Loneliness Scale. It is not a clinical diagnostic instrument.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My social connection status',
    yourLevel: 'Your Connection Level',
    tips: 'Things You Can Try for Connection',
    affirmation: 'Today\'s Message',
    connectionNote: 'Connection',
    scoreLabel: 'Loneliness Score',
    outOf: '/ 40',
  },
  ja: {
    title: '孤独感セルフチェック',
    subtitle: '私はどれくらい孤立しているか？',
    note: 'これはUCLA孤独感尺度を参考にした自己チェックツールです。研究目的の診断ツールではありません。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', 'たまにある', 'よくある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の社会的つながりの状態',
    yourLevel: 'つながりのレベル',
    tips: 'つながりのために試せること',
    affirmation: '今日のメッセージ',
    connectionNote: 'つながり',
    scoreLabel: '孤独感スコア',
    outOf: '/ 40点',
  },
  zh: {
    title: '孤独感自测',
    subtitle: '我现在有多孤立？',
    note: '本测验参考 UCLA 孤独量表，属于自我观察工具，不是研究用的诊断量表。',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全没有', '很少', '偶尔', '经常'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的社会连结状态',
    yourLevel: '我的连结状态',
    tips: '可以试试的连结方式',
    affirmation: '今天想对你说',
    connectionNote: '连结感',
    scoreLabel: '孤独分数',
    outOf: '/ 40 分',
  },
  fr: {
    title: 'Auto-évaluation de la solitude',
    subtitle: 'À quel point suis-je isolé ?',
    note: 'Ce test s’inspire de l’échelle de solitude UCLA ; c’est un outil d’observation de soi, pas un instrument de diagnostic.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Rarement', 'Parfois', 'Souvent'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Votre lien social',
    yourLevel: 'Votre état de lien',
    tips: 'Ce que vous pouvez tenter pour renouer',
    affirmation: 'Un mot pour aujourd’hui',
    connectionNote: 'Sentiment de lien',
    scoreLabel: 'Score de solitude',
    outOf: '/ 40 points',
  },
  es: {
    title: 'Autotest de soledad',
    subtitle: '¿Cuán aislado estoy ahora?',
    note: 'Este test se inspira en la escala de soledad UCLA; es una herramienta de autoobservación, no un instrumento de diagnóstico.',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Rara vez', 'A veces', 'A menudo'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Tu vínculo social',
    yourLevel: 'Tu estado de vínculo',
    tips: 'Cosas que puedes intentar para reconectar',
    affirmation: 'Algo para hoy',
    connectionNote: 'Sensación de vínculo',
    scoreLabel: 'Puntuación de soledad',
    outOf: '/ 40 puntos',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '나와 공통점이 있는 사람들이 주변에 없다고 느낀다' },
    { id: 'q2', text: '나는 사람들과 잘 어울린다', reversed: true },
    { id: 'q3', text: '나를 진정으로 이해해주는 사람이 없다' },
    { id: 'q4', text: '나는 수줍지 않다', reversed: true },
    { id: 'q5', text: '나와 가까이 있어 주는 사람이 없다' },
    { id: 'q6', text: '나는 나를 둘러싼 사람들과 공통점이 많다', reversed: true },
    { id: 'q7', text: '나는 더 이상 아무에게도 가까이 다가갈 수 없다' },
    { id: 'q8', text: '나의 관심사와 생각들이 주변 사람들에게 통하지 않는다' },
    { id: 'q9', text: '나는 외향적이고 친화적이다', reversed: true },
    { id: 'q10', text: '내가 진정으로 교류할 수 있는 사람이 없다고 느낀다' },
  ],
  en: [
    { id: 'q1', text: 'I feel that the people around me have little in common with me' },
    { id: 'q2', text: 'I feel in tune with the people around me', reversed: true },
    { id: 'q3', text: 'There is no one I can turn to' },
    { id: 'q4', text: 'I do not feel alone', reversed: true },
    { id: 'q5', text: 'I feel part of a group of friends', reversed: true },
    { id: 'q6', text: 'I have a lot in common with the people around me', reversed: true },
    { id: 'q7', text: 'I no longer feel close to anyone' },
    { id: 'q8', text: 'My interests and ideas are not shared by those around me' },
    { id: 'q9', text: 'I am an outgoing person', reversed: true },
    { id: 'q10', text: 'There are people I feel close to', reversed: true },
  ],
  ja: [
    { id: 'q1', text: '周りの人々と共通点があまりないと感じる' },
    { id: 'q2', text: '周りの人々と気が合っていると感じる', reversed: true },
    { id: 'q3', text: '頼れる人が誰もいない' },
    { id: 'q4', text: '孤独を感じない', reversed: true },
    { id: 'q5', text: '友人グループの一員だと感じる', reversed: true },
    { id: 'q6', text: '周りの人々と多くの共通点がある', reversed: true },
    { id: 'q7', text: '誰とも親しくなれなくなった' },
    { id: 'q8', text: '私の関心や考えは周囲の人々と共有されていない' },
    { id: 'q9', text: '私は社交的な人間だ', reversed: true },
    { id: 'q10', text: '親しみを感じる人がいる', reversed: true },
  ],
  zh: [
    { id: 'q1', text: '我觉得身边没有跟我合得来的人' },
    { id: 'q2', text: '我跟人相处得不错', reversed: true },
    { id: 'q3', text: '没有人真正懂我' },
    { id: 'q4', text: '我并不害羞', reversed: true },
    { id: 'q5', text: '没有人待在我身边' },
    { id: 'q6', text: '我跟周围的人有不少共同点', reversed: true },
    { id: 'q7', text: '我已经没办法再靠近任何人了' },
    { id: 'q8', text: '我的兴趣和想法，身边的人接不上' },
    { id: 'q9', text: '我外向，也容易亲近', reversed: true },
    { id: 'q10', text: '我觉得没有可以真正交流的人' },
  ],
  fr: [
    { id: 'q1', text: 'J’ai l’impression que personne autour de moi ne me ressemble' },
    { id: 'q2', text: 'Je m’entends bien avec les gens', reversed: true },
    { id: 'q3', text: 'Personne ne me comprend vraiment' },
    { id: 'q4', text: 'Je ne suis pas timide', reversed: true },
    { id: 'q5', text: 'Personne ne se tient près de moi' },
    { id: 'q6', text: 'J’ai beaucoup en commun avec mon entourage', reversed: true },
    { id: 'q7', text: 'Je n’arrive plus à m’approcher de qui que ce soit' },
    { id: 'q8', text: 'Mes centres d’intérêt et mes idées ne passent pas auprès des autres' },
    { id: 'q9', text: 'Je suis extraverti et facile d’accès', reversed: true },
    { id: 'q10', text: 'J’ai le sentiment de n’avoir personne avec qui échanger vraiment' },
  ],
  es: [
    { id: 'q1', text: 'Siento que a mi alrededor no hay nadie parecido a mí' },
    { id: 'q2', text: 'Me llevo bien con la gente', reversed: true },
    { id: 'q3', text: 'Nadie me entiende de verdad' },
    { id: 'q4', text: 'No soy tímido', reversed: true },
    { id: 'q5', text: 'No hay nadie que esté a mi lado' },
    { id: 'q6', text: 'Tengo bastante en común con quienes me rodean', reversed: true },
    { id: 'q7', text: 'Ya no consigo acercarme a nadie' },
    { id: 'q8', text: 'Mis intereses y mis ideas no conectan con los de alrededor' },
    { id: 'q9', text: 'Soy extravertido y cercano', reversed: true },
    { id: 'q10', text: 'Siento que no tengo con quién intercambiar de verdad' },
  ],
}

const RESULTS: Record<Level, Record<SupportedLang, ResultData>> = {
  connected: {
    ko: {
      title: '잘 연결된 상태',
      subtitle: '현재 사회적 연결감이 건강합니다',
      description: '지금 당신은 의미 있는 관계들과 연결되어 있습니다. 이 연결을 소중히 여기고 지속적으로 키워가는 것이 중요합니다. 연결감은 자동으로 유지되지 않으며, 의도적인 노력이 필요합니다.',
      tips: ['지금의 의미 있는 관계들을 더 깊이 가꾸기', '새로운 사람을 만날 기회 적극적으로 찾기', '커뮤니티 활동이나 동호회 참여 고려', '소중한 사람들에게 먼저 연락하는 습관'],
      affirmation: '지금 이 연결감은 소중한 자산입니다. 주변의 좋은 사람들에게 감사하며 하루를 보내세요.',
      connectionNote: '당신은 현재 사회적으로 잘 연결된 상태입니다.',
    },
    en: {
      title: 'Well Connected',
      subtitle: 'Your social connection is healthy right now',
      description: 'You are currently connected with meaningful relationships. It\'s important to cherish and continue nurturing this connection. Connection doesn\'t maintain itself — it takes intentional effort.',
      tips: ['Deepen the meaningful relationships you have', 'Actively seek opportunities to meet new people', 'Consider joining community activities or groups', 'Make a habit of reaching out first to people you care about'],
      affirmation: 'This sense of connection is a precious asset. Take a moment to appreciate the good people around you.',
      connectionNote: 'You are currently socially well-connected.',
    },
    ja: {
      title: 'よくつながっている',
      subtitle: '現在、社会的なつながりは健全です',
      description: '今あなたは意味のある関係とつながっています。このつながりを大切にし、育て続けることが重要です。つながりは自動的に維持されるものではなく、意図的な努力が必要です。',
      tips: ['今持っている意味のある関係をより深く育てる', '新しい人に会う機会を積極的に探す', 'コミュニティ活動やサークルへの参加を検討する', '大切な人に自分から連絡する習慣をつける'],
      affirmation: 'このつながりの感覚は貴重な資産です。周りの良い人々に感謝しながら一日を過ごしてください。',
      connectionNote: '現在、社会的によくつながっています。',
    },
    zh: {
      title: '连结良好',
      subtitle: '目前的社会连结是健康的',
      description: '你现在和有意义的关系连着线。珍惜它，并持续养护。连结不会自动维持，需要有意去做。',
      tips: ['把现在有意义的关系养得更深', '主动去找认识新朋友的机会', '考虑参加社群活动或兴趣小组', '养成先联络重要的人的习惯'],
      affirmation: '此刻的这份连结是珍贵的资产。带着对身边好人的感谢过完今天。',
      connectionNote: '你目前的社会连结状态良好。',
    },
    fr: {
      title: 'Bien relié',
      subtitle: 'Votre lien social est en bonne santé',
      description: 'Vous êtes relié à des relations qui comptent. Prenez-en soin et continuez à les nourrir : le lien ne se maintient pas tout seul, il demande de l’intention.',
      tips: ['Approfondir les relations qui comptent aujourd’hui', 'Chercher activement des occasions de rencontrer du monde', 'Envisager une activité associative ou un club', 'Prendre l’habitude d’écrire le premier aux gens importants'],
      affirmation: 'Ce lien est un bien précieux. Traversez la journée avec de la gratitude pour les personnes qui vous entourent.',
      connectionNote: 'Votre lien social est actuellement solide.',
    },
    es: {
      title: 'Bien conectado',
      subtitle: 'Tu vínculo social está sano',
      description: 'Estás conectado con relaciones que importan. Cuídalas y síguelas alimentando: el vínculo no se mantiene solo, pide intención.',
      tips: ['Profundizar en las relaciones que hoy importan', 'Buscar activamente ocasiones de conocer gente', 'Plantearte una actividad comunitaria o un club', 'Acostumbrarte a escribir tú primero a quien te importa'],
      affirmation: 'Este vínculo es un bien valioso. Pasa el día con gratitud hacia quienes te rodean.',
      connectionNote: 'Tu vínculo social está ahora en buen estado.',
    },
  },
  moderate: {
    ko: {
      title: '중간 수준의 외로움',
      subtitle: '연결감이 부족할 때가 있습니다',
      description: '때로 외로움을 느끼는 것은 매우 자연스러운 경험입니다. 지금 이 감정을 인식하는 것 자체가 변화의 시작입니다. 작은 연결의 시도들이 큰 차이를 만들 수 있습니다.',
      tips: ['오래된 친구에게 먼저 연락 취하기', '취미 모임이나 클래스에 등록하기', '매일 짧게라도 자연 속 산책하기', '자원봉사나 지역 커뮤니티 활동 참여', '혼자지만 혼자가 아닌 공간(도서관, 카페) 이용하기'],
      affirmation: '외로움을 느끼는 것은 연결을 원한다는 신호입니다. 그 마음은 당신이 관계를 소중히 여긴다는 증거입니다.',
      connectionNote: '지금 더 많은 연결이 필요할 수 있습니다.',
    },
    en: {
      title: 'Moderate Loneliness',
      subtitle: 'You sometimes feel a lack of connection',
      description: 'Feeling lonely at times is a very natural experience. The fact that you\'re recognizing this feeling is itself the beginning of change. Small attempts at connection can make a big difference.',
      tips: ['Reach out first to an old friend', 'Sign up for a hobby group or class', 'Take short daily walks in nature', 'Volunteer or participate in local community activities', 'Use shared spaces (library, café) where you\'re alone but not isolated'],
      affirmation: 'Feeling lonely is a signal that you want connection. That feeling is proof that you value relationships.',
      connectionNote: 'You may need more connection right now.',
    },
    ja: {
      title: '中程度の孤独感',
      subtitle: 'つながりを感じられないことがあります',
      description: '時々孤独を感じることは非常に自然な経験です。この感情に気づくこと自体が変化の始まりです。小さなつながりの試みが大きな違いを生むことがあります。',
      tips: ['昔の友人に自分から連絡を取る', '趣味のグループやクラスに登録する', '毎日少しでも自然の中を散歩する', 'ボランティアや地域コミュニティ活動に参加する', '図書館やカフェなど、一人でも孤立しない空間を利用する'],
      affirmation: '孤独を感じることは、つながりを求めているサインです。その気持ちはあなたが関係を大切にしている証拠です。',
      connectionNote: '今、もっとつながりが必要かもしれません。',
    },
    zh: {
      title: '中等程度的孤独',
      subtitle: '有时候会觉得连结不够',
      description: '偶尔觉得孤独，是很自然的经验。能察觉到这份感受，本身就是改变的开始。小小的连结尝试，能带来不小的差别。',
      tips: ['先联络一位老朋友', '报名一个兴趣小组或课程', '每天哪怕短短地到自然里走走', '参加志愿服务或社区活动', '去那种「一个人但不孤单」的地方（图书馆、咖啡馆）'],
      affirmation: '觉得孤独，是你想要连结的信号。那份心情正说明你看重关系。',
      connectionNote: '你现在可能需要更多的连结。',
    },
    fr: {
      title: 'Solitude modérée',
      subtitle: 'Il vous arrive de manquer de lien',
      description: 'Se sentir seul par moments est une expérience très ordinaire. Reconnaître ce ressenti est déjà un début de changement, et de petites tentatives de lien font une vraie différence.',
      tips: ['Écrire le premier à un ami de longue date', 'S’inscrire à un atelier ou à un cours', 'Marcher dehors chaque jour, même brièvement', 'Participer à du bénévolat ou à une activité de quartier', 'Fréquenter des lieux où l’on est seul sans l’être (bibliothèque, café)'],
      affirmation: 'Se sentir seul est le signe qu’on veut du lien. Ce sentiment dit que les relations comptent pour vous.',
      connectionNote: 'Vous avez sans doute besoin de plus de lien en ce moment.',
    },
    es: {
      title: 'Soledad moderada',
      subtitle: 'A veces te falta vínculo',
      description: 'Sentirse solo a ratos es una experiencia muy normal. Reconocer ese sentir ya es el comienzo del cambio, y los intentos pequeños de conectar marcan diferencia.',
      tips: ['Escribir tú primero a un amigo de siempre', 'Apuntarte a un taller o a una clase', 'Caminar al aire libre cada día, aunque sea poco', 'Participar en voluntariado o en algo del barrio', 'Ir a sitios donde se está solo sin estarlo (biblioteca, cafetería)'],
      affirmation: 'Sentirte solo es la señal de que quieres vínculo. Ese sentir dice que las relaciones te importan.',
      connectionNote: 'Puede que ahora necesites más vínculo.',
    },
  },
  high: {
    ko: {
      title: '높은 외로움',
      subtitle: '지금 많이 고립되어 있는 것 같습니다',
      description: '지금 상당한 외로움을 경험하고 있습니다. 이 감정은 무언가 중요한 것이 부족하다는 신호입니다. 외로움은 해결 가능한 상태입니다. 전문가의 도움을 포함한 여러 지원이 있습니다.',
      tips: ['전문 상담사 또는 심리치료사와의 상담 고려', '하루에 하나의 작은 사회적 행동 시도하기', '정신건강 지원 그룹 참여 고려', '온라인 커뮤니티를 통한 연결도 유효한 시작', '신체 활동으로 신경계 안정화 시도'],
      affirmation: '외로움은 당신의 잘못이 아닙니다. 도움을 구하는 것은 용기 있는 행동이며, 당신은 연결될 자격이 있습니다.',
      connectionNote: '지금 전문적인 지원을 받는 것을 고려해 보세요.',
    },
    en: {
      title: 'High Loneliness',
      subtitle: 'It seems you are quite isolated right now',
      description: 'You are experiencing significant loneliness right now. This feeling is a signal that something important is lacking. Loneliness is a solvable state. Support — including professional help — is available.',
      tips: ['Consider speaking with a counselor or psychotherapist', 'Try one small social action per day', 'Consider joining a mental health support group', 'Online communities can also be a valid starting point', 'Physical activity can help stabilize the nervous system'],
      affirmation: 'Loneliness is not your fault. Seeking help is a courageous act, and you deserve to be connected.',
      connectionNote: 'Consider seeking professional support right now.',
    },
    ja: {
      title: '高い孤独感',
      subtitle: '今かなり孤立しているようです',
      description: '今、かなりの孤独感を経験しています。この感情は、何か重要なものが不足しているサインです。孤独感は解決できる状態です。専門家のサポートを含む様々な支援があります。',
      tips: ['カウンセラーや心理療法士への相談を検討する', '一日一つの小さな社会的行動を試みる', 'メンタルヘルスサポートグループへの参加を検討する', 'オンラインコミュニティも有効なスタート地点', '身体活動で神経系を安定させる'],
      affirmation: '孤独はあなたのせいではありません。助けを求めることは勇気ある行動であり、あなたはつながる資格があります。',
      connectionNote: '今、専門的なサポートを受けることを検討してください。',
    },
    zh: {
      title: '孤独感偏高',
      subtitle: '现在似乎相当孤立',
      description: '你正经历着不小的孤独。这份感受是在提醒你：有重要的东西不够了。孤独是可以改善的，也有包括专业协助在内的许多支援。',
      tips: ['考虑找咨询师或心理治疗师谈谈', '每天试着做一件小小的社交举动', '考虑参加心理健康的支持团体', '从线上社群开始连结，也是有效的起点', '用身体活动让神经系统稳下来'],
      affirmation: '孤独不是你的错。开口求助是勇敢的举动，你值得被连结。',
      connectionNote: '建议现在考虑寻求专业支援。',
    },
    fr: {
      title: 'Solitude élevée',
      subtitle: 'Vous semblez très isolé en ce moment',
      description: 'Vous traversez une solitude importante. Ce sentiment signale qu’il manque quelque chose d’essentiel. La solitude peut se travailler, et des soutiens existent, y compris professionnels.',
      tips: ['Envisager un entretien avec un psychologue ou un thérapeute', 'Tenter chaque jour un petit geste social', 'Envisager un groupe de soutien en santé mentale', 'Commencer par une communauté en ligne reste un vrai départ', 'Apaiser le système nerveux par une activité physique'],
      affirmation: 'La solitude n’est pas votre faute. Demander de l’aide est courageux, et vous méritez d’être relié.',
      connectionNote: 'Il serait bon d’envisager un soutien professionnel dès maintenant.',
    },
    es: {
      title: 'Soledad alta',
      subtitle: 'Ahora mismo pareces muy aislado',
      description: 'Estás atravesando una soledad considerable. Ese sentir avisa de que falta algo importante. La soledad se puede trabajar, y hay apoyos, también profesionales.',
      tips: ['Valorar hablar con un psicólogo o terapeuta', 'Intentar cada día un gesto social pequeño', 'Plantearte un grupo de apoyo en salud mental', 'Empezar por una comunidad en línea también es un comienzo válido', 'Calmar el sistema nervioso con actividad física'],
      affirmation: 'La soledad no es culpa tuya. Pedir ayuda es valiente, y mereces estar conectado.',
      connectionNote: 'Sería bueno que valoraras apoyo profesional ahora.',
    },
  },
}

interface Props { locale?: string }

export default function LonelinessTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'en')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null)
  useRecordFinishedTest({ testId: "loneliness", title: "LonelinessTest", finished: Boolean(result) });

  function pick(val: number) {
    const newAns = [...answers, val]
    if (current + 1 >= questions.length) {
      setResult(scoreLoneliness(newAns, questions.map((question) => Boolean(question.reversed))))
    }
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result.level][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url }).catch(() => {})
    else navigator.clipboard.writeText(url).catch(() => {})
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
        options={lb.scaleLabels.map((label, value) => ({ label, value, indicator: value + 1 }))}
        screeningNote={lb.note}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.level][locale]
  const pct = Math.round((result.score / 40) * 100)
  const levelColor: Record<Level, string> = {
    connected: '#22c55e',
    moderate: '#f59e0b',
    high: '#ef4444',
  }
  const color = levelColor[result.level]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourLevel}</p>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
          role="status"
          aria-live="polite"
        >
          {r.title}
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
          className="h-3 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={result.score}
          aria-valuemin={10}
          aria-valuemax={40}
          aria-label={lb.scoreLabel}
        >
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <p className="text-xs text-muted-foreground text-center">{r.connectionNote}</p>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <h3 className="font-bold text-sm text-green-700">{lb.tips}</h3>
        <ul className="space-y-1">
          {r.tips.map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-green-500 flex-none">→</span>{tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-green-200 bg-surface-subtle p-4 space-y-1">
        <h3 className="font-bold text-sm text-green-800">{lb.affirmation}</h3>
        <p className="text-sm text-green-900 leading-relaxed">"{r.affirmation}"</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-xl border bg-card px-4 py-2 text-sm font-bold hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:bg-primary-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          {lb.share}
        </button>
      </div>
      <ShareResultButton locale={lp} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
