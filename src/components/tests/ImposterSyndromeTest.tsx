import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es' | 'zh' | 'fr' | 'es'
function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

type Level = 'low' | 'medium' | 'high' | 'veryHigh'

interface Question {
  id: string
  text: string
}

interface LevelResult {
  badge: string
  title: string
  description: string
  coping: string
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
  copingLabel: string
  affirmationLabel: string
  note: string
}> = {
  ko: {
    title: '가면 증후군 테스트',
    subtitle: '나는 얼마나 사기꾼처럼 느끼나?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '아닌 편이다', '보통이다', '그런 편이다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 가면 증후군 수준',
    yourLevel: '나의 가면 증후군 수준',
    scoreLabel: '가면 증후군 점수',
    outOf: '/ 75점',
    copingLabel: '대처 전략',
    affirmationLabel: '오늘의 메시지',
    note: '이 테스트는 Clance 가면 증후군 척도 개념을 기반으로 하며, 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Imposter Syndrome Test',
    subtitle: 'How much do you feel like a fraud?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My Imposter Syndrome level',
    yourLevel: 'Your Imposter Syndrome Level',
    scoreLabel: 'Imposter Syndrome Score',
    outOf: '/ 75',
    copingLabel: 'Coping Strategies',
    affirmationLabel: 'Today\'s Message',
    note: 'This test is based on the Clance Imposter Phenomenon Scale concept and does not replace professional diagnosis.',
  },
  ja: {
    title: 'インポスター症候群テスト',
    subtitle: '詐欺師のように感じますか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', 'たまにある', 'よくある', '非常にそうだ'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のインポスター症候群レベル',
    yourLevel: 'インポスター症候群レベル',
    scoreLabel: 'インポスター症候群スコア',
    outOf: '/ 75点',
    copingLabel: '対処戦略',
    affirmationLabel: '今日のメッセージ',
    note: 'このテストはClanceインポスター現象尺度の概念に基づいており、専門的診断の代替ではありません。',
  },
  zh: {
    title: '冒名顶替感测验',
    subtitle: '我有多常觉得自己像个骗子？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '不太是', '一般', '有点是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的冒名顶替感程度',
    yourLevel: '我的冒名顶替感程度',
    scoreLabel: '冒名顶替感分数',
    outOf: '/ 75 分',
    copingLabel: '应对做法',
    affirmationLabel: '今天想对你说',
    note: '本测验参考 Clance 冒名顶替现象量表的概念，不能替代专业评估。',
  },
  fr: {
    title: 'Test du syndrome de l’imposteur',
    subtitle: 'À quel point est-ce que je me sens imposteur ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Plutôt non', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Votre niveau',
    yourLevel: 'Votre niveau',
    scoreLabel: 'Score du syndrome de l’imposteur',
    outOf: '/ 75 points',
    copingLabel: 'Ce que vous pouvez faire',
    affirmationLabel: 'Un mot pour aujourd’hui',
    note: 'Ce test reprend les notions de l’échelle de Clance et ne remplace pas une évaluation professionnelle.',
  },
  es: {
    title: 'Test del síndrome del impostor',
    subtitle: '¿Con qué frecuencia me siento un impostor?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Más bien no', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Tu nivel',
    yourLevel: 'Tu nivel',
    scoreLabel: 'Puntuación del síndrome del impostor',
    outOf: '/ 75 puntos',
    copingLabel: 'Qué puedes hacer',
    affirmationLabel: 'Algo para hoy',
    note: 'Este test recoge las ideas de la escala de Clance y no sustituye una evaluación profesional.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '내 성공이 실력보다 운이나 타이밍 덕분이라고 생각한다' },
    { id: 'q2', text: '나보다 훨씬 능력 있는 사람들이 곧 내 무능함을 알아차릴 것이다' },
    { id: 'q3', text: '칭찬을 받으면 상대가 착각하고 있다는 생각이 든다' },
    { id: 'q4', text: '새로운 프로젝트나 역할을 맡으면 내가 감당할 수 없을 것 같아 두렵다' },
    { id: 'q5', text: '다른 사람들은 나보다 훨씬 유능하다는 느낌이 든다' },
    { id: 'q6', text: '성공해도 그 성공을 온전히 내 것으로 받아들이기 어렵다' },
    { id: 'q7', text: '실수를 하면 역시 나는 부족하다는 증거로 느껴진다' },
    { id: 'q8', text: '내가 잘 해낼 때는 이번엔 운이 좋았을 뿐이라고 생각한다' },
    { id: 'q9', text: '중요한 자리에 있을 때 내가 여기 있어도 되는 사람인가 의심이 든다' },
    { id: 'q10', text: '주변 사람들의 기대를 충족시키지 못할까 봐 항상 불안하다' },
    { id: 'q11', text: '나의 지식이나 능력에 대해 과장해서 인정받는 것 같은 느낌이 든다' },
    { id: 'q12', text: '같은 자리에 있는 다른 사람들보다 내가 덜 준비된 것 같다' },
    { id: 'q13', text: '나의 성취가 운보다는 실력에서 온다고 자신 있게 믿기 어렵다' },
    { id: 'q14', text: '칭찬이나 승진 같은 좋은 일이 생기면 곧 들킬 것 같아 긴장된다' },
    { id: 'q15', text: '나는 사기꾼처럼 느껴질 때가 있다' },
  ],
  en: [
    { id: 'q1', text: 'I think my success is more due to luck or timing than my actual ability' },
    { id: 'q2', text: 'People far more capable than me will soon discover my incompetence' },
    { id: 'q3', text: 'When I receive praise, I think the person is simply mistaken' },
    { id: 'q4', text: 'I fear I won\'t be able to handle new projects or roles when they\'re given to me' },
    { id: 'q5', text: 'I feel like others are far more capable than I am' },
    { id: 'q6', text: 'Even when I succeed, I find it hard to fully own that success' },
    { id: 'q7', text: 'When I make a mistake, it feels like proof that I\'m not good enough' },
    { id: 'q8', text: 'When I do well, I think it\'s just because I got lucky this time' },
    { id: 'q9', text: 'When I\'m in an important position, I wonder if I really belong there' },
    { id: 'q10', text: 'I constantly worry about failing to meet the expectations of those around me' },
    { id: 'q11', text: 'I feel like I\'m being recognized for more than my actual knowledge or ability' },
    { id: 'q12', text: 'I feel less prepared than others who are at the same level as me' },
    { id: 'q13', text: 'It\'s hard for me to confidently believe my achievements come from skill rather than luck' },
    { id: 'q14', text: 'When good things happen like praise or promotion, I feel tense, as if I\'ll soon be found out' },
    { id: 'q15', text: 'There are times when I feel like a fraud' },
  ],
  ja: [
    { id: 'q1', text: '自分の成功は実力よりも運やタイミングのおかげだと思う' },
    { id: 'q2', text: '自分より能力のある人たちがすぐに私の無能さに気づくだろう' },
    { id: 'q3', text: '褒められると、相手が勘違いしていると思う' },
    { id: 'q4', text: '新しいプロジェクトや役割を任されると、こなせないのではと怖い' },
    { id: 'q5', text: '他の人たちは自分よりずっと有能だという感じがする' },
    { id: 'q6', text: '成功しても、その成功を完全に自分のものとして受け入れることが難しい' },
    { id: 'q7', text: 'ミスをすると、やはり自分は不十分だという証拠のように感じる' },
    { id: 'q8', text: 'うまくできたときは、今回はたまたま運が良かっただけだと思う' },
    { id: 'q9', text: '重要な立場にいるとき、自分がここにいていい人間なのか疑問に思う' },
    { id: 'q10', text: '周りの人の期待に応えられないのではないかといつも不安だ' },
    { id: 'q11', text: '自分の知識や能力を過大評価されて認められているような気がする' },
    { id: 'q12', text: '同じ立場にいる他の人たちより自分の方が準備不足だと感じる' },
    { id: 'q13', text: '自分の成果が運ではなく実力から来ていると自信を持って信じることが難しい' },
    { id: 'q14', text: '褒められたり昇進などいいことがあると、すぐにバレてしまいそうで緊張する' },
    { id: 'q15', text: '詐欺師のように感じる瞬間がある' },
  ],
  zh: [
    { id: 'q1', text: '我觉得自己的成功靠的是运气或时机，不是实力' },
    { id: 'q2', text: '比我强得多的人很快就会发现我其实不行' },
    { id: 'q3', text: '被称赞时，我会觉得对方是误会了' },
    { id: 'q4', text: '接下新项目或新角色时，我怕自己扛不住' },
    { id: 'q5', text: '我觉得别人比我能干得多' },
    { id: 'q6', text: '就算成功了，也很难把它当成自己的' },
    { id: 'q7', text: '一犯错，我就觉得这正是我不够格的证据' },
    { id: 'q8', text: '做得好的时候，我会想这次只是运气好' },
    { id: 'q9', text: '站在重要场合时，我会怀疑自己是否该在这里' },
    { id: 'q10', text: '我一直担心达不到身边人的期待' },
    { id: 'q11', text: '我觉得别人把我的知识或能力看得太高了' },
    { id: 'q12', text: '跟同场的人比，我好像准备得更少' },
    { id: 'q13', text: '我很难自信地相信成绩来自实力而不是运气' },
    { id: 'q14', text: '有好事发生（称赞、升职）时，我紧张自己快被识破' },
    { id: 'q15', text: '我有时候觉得自己像个骗子' },
  ],
  fr: [
    { id: 'q1', text: 'Je crois devoir mes réussites à la chance ou au bon moment plutôt qu’à mes compétences' },
    { id: 'q2', text: 'Des gens bien plus capables vont vite s’apercevoir de mon incompétence' },
    { id: 'q3', text: 'Quand on me complimente, je me dis que la personne se trompe' },
    { id: 'q4', text: 'Quand on me confie un projet ou un rôle nouveau, j’ai peur de ne pas tenir' },
    { id: 'q5', text: 'J’ai le sentiment que les autres sont bien plus compétents que moi' },
    { id: 'q6', text: 'Même en cas de succès, j’ai du mal à le considérer vraiment comme le mien' },
    { id: 'q7', text: 'Quand je fais une erreur, j’y vois la preuve que je ne suis pas à la hauteur' },
    { id: 'q8', text: 'Quand je réussis, je me dis que j’ai simplement eu de la chance' },
    { id: 'q9', text: 'Dans les moments importants, je doute d’avoir ma place ici' },
    { id: 'q10', text: 'Je crains en permanence de ne pas être à la hauteur des attentes' },
    { id: 'q11', text: 'J’ai l’impression qu’on surestime mes connaissances ou mes capacités' },
    { id: 'q12', text: 'Par rapport aux autres présents, je me sens moins préparé' },
    { id: 'q13', text: 'J’ai du mal à croire avec assurance que mes réussites viennent de moi' },
    { id: 'q14', text: 'Quand une bonne nouvelle arrive (compliment, promotion), je me tends, comme si j’allais être démasqué' },
    { id: 'q15', text: 'Il m’arrive de me sentir comme un imposteur' },
  ],
  es: [
    { id: 'q1', text: 'Creo que mis éxitos vienen de la suerte o del momento, no de mi capacidad' },
    { id: 'q2', text: 'Gente mucho más capaz se dará cuenta enseguida de que no doy la talla' },
    { id: 'q3', text: 'Cuando me felicitan, pienso que se están equivocando' },
    { id: 'q4', text: 'Cuando me dan un proyecto o un papel nuevo, temo no poder con ello' },
    { id: 'q5', text: 'Siento que los demás son mucho más competentes que yo' },
    { id: 'q6', text: 'Aunque salga bien, me cuesta considerarlo realmente mío' },
    { id: 'q7', text: 'Si cometo un error, lo veo como prueba de que no valgo' },
    { id: 'q8', text: 'Cuando lo hago bien, pienso que esta vez tuve suerte' },
    { id: 'q9', text: 'En los momentos importantes dudo de si merezco estar ahí' },
    { id: 'q10', text: 'Vivo con miedo de no cumplir lo que esperan de mí' },
    { id: 'q11', text: 'Siento que sobrevaloran mis conocimientos o mi capacidad' },
    { id: 'q12', text: 'Comparado con los demás presentes, me siento menos preparado' },
    { id: 'q13', text: 'Me cuesta creer con seguridad que mis logros vienen de mi capacidad' },
    { id: 'q14', text: 'Cuando llega algo bueno (un elogio, un ascenso), me tenso como si fueran a descubrirme' },
    { id: 'q15', text: 'A veces me siento un impostor' },
  ],
}

const LEVEL_RESULTS: Record<Level, Record<SupportedLang, LevelResult>> = {
  low: {
    ko: {
      badge: '💚 낮음',
      title: '가면 증후군 낮음',
      description: '자신감이 건강한 수준입니다. 약간의 불확실성은 누구에게나 자연스러운 것이며, 당신은 자신의 성취를 비교적 현실적으로 바라보고 있습니다.',
      coping: '지금처럼 현실적인 자기 평가를 유지하세요. 실패도 성장의 일부로 수용하고, 자신의 강점 목록을 주기적으로 업데이트해 보세요.',
      affirmation: '당신의 성공은 운이 아닌 당신의 능력과 노력의 결실입니다.',
    },
    en: {
      badge: '💚 Low',
      title: 'Low Imposter Syndrome',
      description: 'Your confidence is at a healthy level. Some uncertainty is natural for everyone, and you see your achievements in a relatively realistic light.',
      coping: 'Maintain your realistic self-assessment. Accept failure as part of growth, and periodically update your list of strengths.',
      affirmation: 'Your success is the result of your ability and effort, not luck.',
    },
    ja: {
      badge: '💚 低い',
      title: 'インポスター症候群 低い',
      description: '自信は健全なレベルです。ある程度の不確実性は誰にでも自然なことで、あなたは自分の成果を比較的現実的に見ています。',
      coping: '今のように現実的な自己評価を維持しましょう。失敗も成長の一部として受け入れ、自分の強みリストを定期的に更新してみてください。',
      affirmation: 'あなたの成功は運ではなく、あなたの能力と努力の成果です。',
    },
    zh: {
      badge: '💚 低',
      title: '冒名顶替感低',
      description: '你的自信处在健康的程度。一点点不确定谁都会有，而你对自己的成绩看得比较实在。',
      coping: '保持现在这种实在的自我评估。把失败也当成成长的一部分，并定期更新自己的强项清单。',
      affirmation: '你的成功不是运气，是能力和努力结出的果。',
    },
    fr: {
      badge: '💚 Faible',
      title: 'Syndrome de l’imposteur faible',
      description: 'Votre confiance est à un niveau sain. Un peu d’incertitude est normale chez tout le monde, et vous regardez vos réussites avec assez de réalisme.',
      coping: 'Gardez cette évaluation réaliste de vous-même. Accueillez l’échec comme une part de la croissance et mettez à jour régulièrement la liste de vos forces.',
      affirmation: 'Vos réussites ne sont pas de la chance : elles sont le fruit de vos capacités et de votre travail.',
    },
    es: {
      badge: '💚 Bajo',
      title: 'Síndrome del impostor bajo',
      description: 'Tu confianza está en un nivel sano. Un poco de incertidumbre la tiene cualquiera, y miras tus logros con bastante realismo.',
      coping: 'Conserva esa mirada realista sobre ti. Acepta el fallo como parte del crecimiento y actualiza de vez en cuando la lista de tus fortalezas.',
      affirmation: 'Tu éxito no es suerte: es fruto de tu capacidad y tu trabajo.',
    },
  },
  medium: {
    ko: {
      badge: '💛 보통',
      title: '중간 수준의 가면 증후군',
      description: '특정 상황이나 도전적인 환경에서 사기꾼 같은 느낌이 나타납니다. 이는 매우 흔한 경험으로, 많은 성공한 사람들도 비슷하게 느낍니다.',
      coping: '성공 일지 쓰기: 매주 잘 해낸 일 3가지를 기록하세요. 신뢰하는 사람에게 느낌을 솔직히 말해보세요. 운이 아닌 준비의 결과임을 상기하세요.',
      affirmation: '성공한 사람 중 70% 이상이 가면 증후군을 경험합니다. 당신만의 감정이 아닙니다.',
    },
    en: {
      badge: '💛 Medium',
      title: 'Moderate Imposter Syndrome',
      description: 'Feelings of being a fraud arise in specific situations or challenging environments. This is a very common experience, and many successful people feel similarly.',
      coping: 'Keep a success journal: write 3 things you did well each week. Talk honestly with someone you trust about your feelings. Remind yourself that results come from preparation, not luck.',
      affirmation: 'More than 70% of successful people experience imposter syndrome. You are not alone in these feelings.',
    },
    ja: {
      badge: '💛 普通',
      title: '中程度のインポスター症候群',
      description: '特定の状況や挑戦的な環境で詐欺師のような感覚が現れます。これは非常に一般的な経験で、多くの成功した人も同様に感じます。',
      coping: '成功日誌を書く：毎週うまくできたこと3つを記録しましょう。信頼できる人に正直に気持ちを打ち明けましょう。運ではなく準備の結果であることを思い出しましょう。',
      affirmation: '成功者の70%以上がインポスター症候群を経験しています。あなただけの感情ではありません。',
    },
    zh: {
      badge: '💛 中等',
      title: '中等程度的冒名顶替感',
      description: '在某些场合或有挑战的环境里，会冒出「像个骗子」的感觉。这非常常见，很多做得不错的人也一样。',
      coping: '写成功日记：每周记下三件做得好的事。把感受坦白讲给信得过的人。提醒自己，这是准备的结果，不是运气。',
      affirmation: '超过七成做出成绩的人都经历过冒名顶替感。这不是只有你才有的感觉。',
    },
    fr: {
      badge: '💛 Modéré',
      title: 'Syndrome de l’imposteur modéré',
      description: 'Dans certaines situations ou dans un environnement exigeant, la sensation d’être un imposteur apparaît. C’est très répandu : beaucoup de gens qui réussissent le ressentent aussi.',
      coping: 'Tenez un journal des réussites : trois choses réussies chaque semaine. Dites honnêtement ce que vous ressentez à une personne de confiance. Rappelez-vous que c’est le fruit de votre préparation, pas du hasard.',
      affirmation: 'Plus de 70 % des personnes qui réussissent connaissent ce sentiment. Vous n’êtes pas seul.',
    },
    es: {
      badge: '💛 Medio',
      title: 'Síndrome del impostor medio',
      description: 'En ciertas situaciones o en entornos exigentes aparece la sensación de ser un impostor. Es muy habitual: mucha gente con éxito lo siente igual.',
      coping: 'Lleva un diario de logros: tres cosas que salieron bien cada semana. Cuéntale con franqueza cómo te sientes a alguien de confianza. Recuérdate que es fruto de tu preparación, no del azar.',
      affirmation: 'Más del 70 % de las personas con éxito pasan por esto. No es solo cosa tuya.',
    },
  },
  high: {
    ko: {
      badge: '🧡 높음',
      title: '높은 가면 증후군',
      description: '성취를 충분히 인정받지 못하고 있으며, 강한 가면 증후군이 당신의 잠재력 발휘를 방해하고 있을 수 있습니다. 지금 행동이 필요합니다.',
      coping: '자신의 가면 증후군 패턴을 인식하는 것만으로도 큰 변화가 시작됩니다. 멘토나 코치의 도움을 받아보세요. 완벽하지 않아도 충분하다는 것을 연습하세요.',
      affirmation: '당신이 이 자리에 있는 것은 이유가 있습니다. 당신의 관점과 기여는 고유하고 가치 있습니다.',
    },
    en: {
      badge: '🧡 High',
      title: 'High Imposter Syndrome',
      description: 'You may not be fully recognizing your achievements, and strong imposter syndrome may be limiting your potential. Action is needed now.',
      coping: 'Simply recognizing your imposter syndrome patterns already begins a major change. Seek the help of a mentor or coach. Practice the idea that being imperfect is enough.',
      affirmation: 'There is a reason you are in this position. Your perspective and contributions are unique and valuable.',
    },
    ja: {
      badge: '🧡 高い',
      title: 'インポスター症候群 高い',
      description: '十分に成果を認められておらず、強いインポスター症候群があなたの潜在能力の発揮を妨げている可能性があります。今行動が必要です。',
      coping: 'インポスター症候群のパターンを認識するだけで大きな変化が始まります。メンターやコーチの助けを借りましょう。完璧でなくても十分だということを練習しましょう。',
      affirmation: 'あなたがここにいることには理由があります。あなたの視点と貢献はユニークで価値があります。',
    },
    zh: {
      badge: '🧡 高',
      title: '冒名顶替感高',
      description: '你没有充分把成绩认到自己头上，强烈的冒名顶替感可能正在挡住你的发挥。现在需要动一动。',
      coping: '光是认出自己的这套模式，改变就开始了。找个前辈或教练搭把手。练习「不完美也够了」这件事。',
      affirmation: '你在这个位置上是有理由的。你的视角和贡献是独有的，也是有价值的。',
    },
    fr: {
      badge: '🧡 Élevé',
      title: 'Syndrome de l’imposteur élevé',
      description: 'Vous ne vous attribuez pas suffisamment vos réussites, et cette sensation peut freiner ce que vous pourriez déployer. Il est temps d’agir.',
      coping: 'Reconnaître ce schéma, c’est déjà amorcer le changement. Faites-vous accompagner par un mentor ou un coach. Entraînez-vous à considérer que « pas parfait » suffit.',
      affirmation: 'Si vous êtes là, il y a une raison. Votre regard et votre contribution sont singuliers et précieux.',
    },
    es: {
      badge: '🧡 Alto',
      title: 'Síndrome del impostor alto',
      description: 'No te estás atribuyendo lo que logras, y esa sensación puede estar frenando lo que podrías desplegar. Toca moverse.',
      coping: 'Reconocer este patrón ya inicia el cambio. Busca el apoyo de un mentor o un coach. Practica que «no perfecto» ya es suficiente.',
      affirmation: 'Si estás ahí, es por algo. Tu mirada y tu aporte son propios y valiosos.',
    },
  },
  veryHigh: {
    ko: {
      badge: '❤️ 매우 높음',
      title: '매우 높은 가면 증후군',
      description: '매우 심한 가면 증후군이 일상적인 기능과 자기 인식에 영향을 미치고 있습니다. 혼자 감당하지 마세요 — 전문적 도움이 의미 있는 변화를 가져올 수 있습니다.',
      coping: '혼자 감당하지 마세요. 상담사나 심리치료사와 함께 작업하면 근본적인 변화가 가능합니다. 당신의 성취는 진짜입니다.',
      affirmation: '도움을 구하는 것은 강함의 표시입니다. 당신은 더 나은 자기 인식을 받을 자격이 있습니다.',
    },
    en: {
      badge: '❤️ Very High',
      title: 'Very High Imposter Syndrome',
      description: 'Very high imposter syndrome is affecting your everyday functioning and self-perception. Don\'t carry this alone — professional support can bring meaningful change.',
      coping: 'Don\'t carry this alone. Working with a counselor or therapist can bring fundamental change. Your achievements are real.',
      affirmation: 'Seeking help is a sign of strength. You deserve a more accurate perception of yourself.',
    },
    ja: {
      badge: '❤️ 非常に高い',
      title: 'インポスター症候群 非常に高い',
      description: '非常に高いインポスター症候群が日常的な機能と自己認識に影響しています。一人で抱え込まないでください — 専門的なサポートが意味のある変化をもたらします。',
      coping: '一人で抱え込まないでください。カウンセラーや心理療法士と一緒に取り組めば根本的な変化が可能です。あなたの成果は本物です。',
      affirmation: '助けを求めることは強さの表れです。あなたはより正確な自己認識を受け取る価値があります。',
    },
    zh: {
      badge: '❤️ 非常高',
      title: '非常高的冒名顶替感',
      description: '很强的冒名顶替感正在影响你日常的运作和对自己的认识。别一个人扛——专业协助能带来实在的改变。',
      coping: '别一个人扛。跟咨询师或心理治疗师一起工作，能带来根本的改变。你的成绩是真的。',
      affirmation: '开口求助是强的表现。你值得对自己有更准确的认识。',
    },
    fr: {
      badge: '❤️ Très élevé',
      title: 'Syndrome de l’imposteur très élevé',
      description: 'Ce sentiment très fort pèse sur votre fonctionnement quotidien et sur la façon dont vous vous voyez. Ne portez pas cela seul : un accompagnement professionnel peut changer les choses.',
      coping: 'Ne portez pas cela seul. Travailler avec un psychologue ou un thérapeute permet un changement de fond. Vos réussites sont réelles.',
      affirmation: 'Demander de l’aide est une force. Vous méritez un regard plus juste sur vous-même.',
    },
    es: {
      badge: '❤️ Muy alto',
      title: 'Síndrome del impostor muy alto',
      description: 'Este sentimiento, muy intenso, afecta a tu día a día y a cómo te ves. No cargues con ello solo: el acompañamiento profesional puede cambiar las cosas.',
      coping: 'No lo cargues solo. Trabajar con un psicólogo o terapeuta permite un cambio de fondo. Tus logros son reales.',
      affirmation: 'Pedir ayuda es una muestra de fuerza. Mereces una mirada más justa sobre ti.',
    },
  },
}

const LEVEL_COLORS: Record<Level, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  veryHigh: '#ef4444',
}

function calcLevel(score: number): Level {
  if (score <= 30) return 'low'
  if (score <= 45) return 'medium'
  if (score <= 60) return 'high'
  return 'veryHigh'
}

interface Props { locale?: string }

export default function ImposterSyndromeTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp)
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null)
  useRecordFinishedTest({ testId: "imposter-syndrome", title: "ImposterSyndromeTest", finished: Boolean(result) });

  function pick(val: number) {
    const newAns = answers.slice(0, current)
    newAns[current] = val
    if (current + 1 >= questions.length) {
      const score = newAns.reduce((s, v) => s + v, 0)
      setResult({ level: calcLevel(score), score })
    }
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function previous() {
    if (current === 0) return
    setCurrent(current - 1)
  }

  function restart() {
    setAnswers([])
    setCurrent(0)
    setResult(null)
  }

  function share() {
    if (!result) return
    const url = window.location.href
    const levelData = LEVEL_RESULTS[result.level][locale]
    const text = `${lb.shareMsg} — ${levelData.title}`
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
        selectedValue={answers[current]}
        note={lb.note}
        previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question')}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  if (!result) return null

  const levelData = LEVEL_RESULTS[result.level][locale]
  const pct = Math.round((result.score / 75) * 100)
  const color = LEVEL_COLORS[result.level]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourLevel}</p>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {levelData.badge}
        </div>
        <p className="font-medium text-muted-foreground">{levelData.title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{levelData.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{lb.scoreLabel}</span>
          <span className="text-lg font-bold" style={{ color }}>{result.score} {lb.outOf}</span>
        </div>
        <div
          className="h-3 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${result.score} ${lb.outOf}`}
        >
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm text-green-600">{lb.copingLabel}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{levelData.coping}</p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.affirmationLabel}</h3>
        <p className="text-sm">"{levelData.affirmation}"</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>

      <ShareResultButton
        locale={lp}
        heading={lb.yourLevel}
        emoji="🎭"
        resultTitle={`${levelData.badge} — ${levelData.title}`}
        description={`${lb.scoreLabel} ${result.score} ${lb.outOf}`}
      />

      <div className="flex gap-3">
        <button
          onClick={restart}
          className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          aria-label={lb.restart}
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          aria-label={lb.share}
        >
          {lb.share}
        </button>
      </div>
    </div>
  )
}
