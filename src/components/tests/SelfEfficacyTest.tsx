import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type EfficacyLevel = 'building' | 'moderate' | 'strong' | 'high'
type Subscale = 'coping' | 'goal'

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
  yourScore: string; overallLabel: string; copingLabel: string; goalLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '자기효능감 테스트',
    subtitle: '나는 나를 얼마나 믿는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 자기효능감 점수는',
    yourScore: '나의 자기효능감 점수',
    overallLabel: '종합 자기효능감',
    copingLabel: '도전 대처 효능감',
    goalLabel: '목표 달성 효능감',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '샤르처와 예루살렘의 일반적 자기효능감 척도(GSE) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Self-Efficacy Test',
    subtitle: 'How much do you believe in yourself?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all true', 'Hardly true', 'Moderately true', 'Mostly true', 'Exactly true'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My self-efficacy score is',
    yourScore: 'Your Self-Efficacy Score',
    overallLabel: 'Overall Self-Efficacy',
    copingLabel: 'Coping Efficacy',
    goalLabel: 'Goal-Attainment Efficacy',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: 'This self-reflection test is based on the General Self-Efficacy Scale (GSE) concept by Schwarzer & Jerusalem. It does not replace professional assessment.',
  },
  ja: {
    title: '自己効力感テスト',
    subtitle: '自分をどれくらい信じているか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くそう思わない', 'あまりそう思わない', '普通', 'だいたいそう思う', 'とてもそう思う'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の自己効力感スコアは',
    yourScore: 'あなたの自己効力感スコア',
    overallLabel: '総合自己効力感',
    copingLabel: '対処効力感',
    goalLabel: '目標達成効力感',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはSchwarzer & Jerusalemの一般性セルフ・エフィカシー尺度（GSE）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
  zh: {
    title: '自我效能测验',
    subtitle: '我有多相信自己做得到？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '一般', '大致是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的自我效能分数是',
    yourScore: '我的自我效能分数',
    overallLabel: '综合自我效能',
    copingLabel: '应对挑战的把握',
    goalLabel: '达成目标的把握',
    outOf: '/ 5.0',
    tipsLabel: '成长建议',
    note: '本测验参考 Schwarzer 与 Jerusalem 的一般自我效能量表（GSE）概念，用于自我省思，不能替代专业评估。',
  },
  fr: {
    title: 'Test du sentiment d’efficacité personnelle',
    subtitle: 'À quel point est-ce que je me fais confiance ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon score d’efficacité personnelle',
    yourScore: 'Votre score d’efficacité personnelle',
    overallLabel: 'Efficacité personnelle globale',
    copingLabel: 'Face aux difficultés',
    goalLabel: 'Pour atteindre ses objectifs',
    outOf: '/ 5.0',
    tipsLabel: 'Piste de progrès',
    note: 'Ce test reprend les notions de l’échelle d’auto-efficacité générale (GSE) de Schwarzer et Jerusalem, à des fins de réflexion personnelle. Il ne remplace pas une évaluation professionnelle.',
  },
  es: {
    title: 'Test de autoeficacia',
    subtitle: '¿Cuánto confío en que puedo?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi puntuación de autoeficacia',
    yourScore: 'Tu puntuación de autoeficacia',
    overallLabel: 'Autoeficacia global',
    copingLabel: 'Ante las dificultades',
    goalLabel: 'Para alcanzar metas',
    outOf: '/ 5.0',
    tipsLabel: 'Para crecer',
    note: 'Este test recoge las ideas de la escala de autoeficacia general (GSE) de Schwarzer y Jerusalem, para la reflexión personal. No sustituye una evaluación profesional.',
  },
}

const LEVEL_DATA: Record<EfficacyLevel, Record<SupportedLang, LevelData>> = {
  building: {
    ko: {
      icon: '🌱',
      title: '효능감 형성 단계',
      description: '아직 자신의 능력에 대한 믿음이 자라는 중입니다. 작은 성공 경험을 쌓을수록 효능감은 단단해집니다.',
      tips: [
        '아주 작은 목표를 정해 "해냈다"는 경험을 모으세요.',
        '잘한 일을 매일 한 가지씩 기록해 증거를 만드세요.',
        '나와 비슷한 사람의 성공 사례를 보며 "나도 가능"을 키우세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Building',
      description: 'Your belief in your own abilities is still growing. The more small successes you collect, the more solid your efficacy becomes.',
      tips: [
        'Set very small goals to gather "I did it" experiences.',
        'Record one thing you did well each day to build evidence.',
        'Watch success stories of people like you to grow "I can too."',
      ],
    },
    ja: {
      icon: '🌱',
      title: '効力感形成段階',
      description: 'まだ自分の能力への信頼が育っている途中です。小さな成功体験を積むほど効力感は強くなります。',
      tips: [
        'ごく小さな目標を決めて「できた」という経験を集めましょう。',
        '毎日うまくできたことを一つ記録して証拠を作りましょう。',
        '自分に似た人の成功事例を見て「自分にも可能」を育てましょう。',
      ],
    },
    zh: {
      icon: '🌱',
      title: '效能感形成中',
      description: '对自己能力的信任还在长。把小小的成功经验攒起来，效能感就会结实。',
      tips: [
        '把目标定得很小，多攒几次「我做到了」的经验。',
        '每天记下一件做得好的事，给自己留证据。',
        '看看跟你处境相近的人怎么做成的，把「我也行」养起来。',
      ],
    },
    fr: {
      icon: '🌱',
      title: 'Confiance en construction',
      description: 'La croyance en vos capacités est encore en train de pousser. Elle se solidifie à mesure que s’accumulent de petites réussites.',
      tips: [
        'Fixez de tout petits objectifs et accumulez l’expérience du « j’y suis arrivé ».',
        'Notez chaque jour une chose réussie : cela fait des preuves.',
        'Regardez comment des personnes proches de votre situation ont réussi, pour nourrir le « moi aussi je peux ».',
      ],
    },
    es: {
      icon: '🌱',
      title: 'Confianza en construcción',
      description: 'La creencia en tus capacidades aún está creciendo. Se afianza según se acumulan pequeños logros.',
      tips: [
        'Ponte metas muy pequeñas y acumula la experiencia de «lo he conseguido».',
        'Anota cada día algo que salió bien: eso genera pruebas.',
        'Mira cómo lo han conseguido personas en una situación parecida, para alimentar el «yo también puedo».',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌿',
      title: '안정 효능감형',
      description: '대체로 자신의 능력을 신뢰하지만, 어려운 상황에서는 흔들릴 때도 있습니다. 효능감을 더 단단히 할 여지가 있습니다.',
      tips: [
        '성공의 원인을 "운"이 아닌 "내 노력"으로 해석하세요.',
        '도전 난이도를 조금씩 높여 효능감의 폭을 넓히세요.',
        '실패를 능력 부족이 아닌 전략 문제로 다시 보세요.',
      ],
    },
    en: {
      icon: '🌿',
      title: 'Moderate',
      description: 'You generally trust your abilities, but you can waver in difficult situations. There is room to make your efficacy more solid.',
      tips: [
        'Attribute success to "my effort" rather than "luck."',
        'Gradually raise the difficulty of challenges to widen your efficacy.',
        'Reframe failure as a strategy problem, not a lack of ability.',
      ],
    },
    ja: {
      icon: '🌿',
      title: '安定効力感型',
      description: 'おおむね自分の能力を信頼していますが、困難な状況では揺らぐこともあります。効力感をさらに固める余地があります。',
      tips: [
        '成功の原因を「運」ではなく「自分の努力」と解釈しましょう。',
        '挑戦の難易度を少しずつ上げて効力感の幅を広げましょう。',
        '失敗を能力不足ではなく戦略の問題として捉え直しましょう。',
      ],
    },
    zh: {
      icon: '🌿',
      title: '稳定效能型',
      description: '你大体上信任自己的能力，但遇到难处时也会晃。把效能感再做实一点，还有空间。',
      tips: [
        '把成功的原因解释成「我的努力」，而不是「运气」。',
        '把挑战的难度一点点往上加，把效能感的范围撑开。',
        '把失败重新看成策略问题，而不是能力不足。',
      ],
    },
    fr: {
      icon: '🌿',
      title: 'Confiance stable',
      description: 'Vous faites globalement confiance à vos capacités, mais la difficulté vous fait parfois vaciller. Il reste de la marge pour consolider.',
      tips: [
        'Attribuez vos réussites à votre travail plutôt qu’à la chance.',
        'Augmentez peu à peu le niveau de difficulté pour élargir votre confiance.',
        'Relisez l’échec comme un problème de stratégie, non comme un manque de capacité.',
      ],
    },
    es: {
      icon: '🌿',
      title: 'Confianza estable',
      description: 'En general confías en tus capacidades, pero la dificultad a veces te hace dudar. Queda margen para consolidarla.',
      tips: [
        'Atribuye tus logros a tu esfuerzo antes que a la suerte.',
        'Sube poco a poco el nivel de dificultad para ensanchar la confianza.',
        'Relee el fallo como un problema de estrategia, no como falta de capacidad.',
      ],
    },
  },
  strong: {
    ko: {
      icon: '🌳',
      title: '강한 효능감형',
      description: '자신의 능력에 대한 믿음이 강합니다. 어려움 앞에서도 "방법을 찾을 수 있다"는 태도로 도전을 잘 헤쳐 나갑니다.',
      tips: [
        '이 효능감으로 더 의미 있는 도전을 설정해 보세요.',
        '효능감이 자만으로 번지지 않게 피드백에 열려 있으세요.',
        '주변 사람의 효능감을 키워주는 멘토 역할을 해보세요.',
      ],
    },
    en: {
      icon: '🌳',
      title: 'Strong',
      description: 'Your belief in your abilities is strong. Even facing difficulty, you navigate challenges with an "I can find a way" attitude.',
      tips: [
        'Use this efficacy to set more meaningful challenges.',
        'Stay open to feedback so efficacy does not slide into overconfidence.',
        'Take a mentor role and build efficacy in those around you.',
      ],
    },
    ja: {
      icon: '🌳',
      title: '強い効力感型',
      description: '自分の能力への信頼が強いです。困難の前でも「方法を見つけられる」という姿勢で挑戦を乗り越えます。',
      tips: [
        'この効力感でより意味ある挑戦を設定してみましょう。',
        '効力感が過信に傾かないようフィードバックに開かれていましょう。',
        '周囲の効力感を育てるメンター役を担ってみましょう。',
      ],
    },
    zh: {
      icon: '🌳',
      title: '强效能型',
      description: '你对自己的能力很有信心。遇到难处也能抱着「总找得到办法」的态度闯过去。',
      tips: [
        '用这份效能感去设更有意义的挑战。',
        '别让效能感滑成自满，保持对回馈的开放。',
        '当那个帮别人长出效能感的人。',
      ],
    },
    fr: {
      icon: '🌳',
      title: 'Confiance forte',
      description: 'Vous croyez fortement en vos capacités. Devant l’obstacle, votre posture est « je trouverai un moyen », et vous traversez bien les difficultés.',
      tips: [
        'Mettez cette confiance au service de défis qui ont du sens.',
        'Veillez à ce qu’elle ne glisse pas vers la suffisance : restez ouvert aux retours.',
        'Jouez le rôle de mentor qui fait grandir la confiance des autres.',
      ],
    },
    es: {
      icon: '🌳',
      title: 'Confianza fuerte',
      description: 'Crees firmemente en tus capacidades. Ante el obstáculo tu postura es «ya encontraré la forma», y atraviesas bien las dificultades.',
      tips: [
        'Pon esa confianza al servicio de retos con sentido.',
        'Cuida que no derive en suficiencia: mantente abierto a que te digan las cosas.',
        'Haz de mentor que hace crecer la confianza de otros.',
      ],
    },
  },
  high: {
    ko: {
      icon: '🏔️',
      title: '최상위 효능감형',
      description: '매우 높은 자기효능감을 지니고 있습니다. 불확실함과 압박 속에서도 자신의 능력을 신뢰하고 발휘합니다.',
      tips: [
        '큰 목표·장기 비전에 이 강점을 투자하세요.',
        '높은 효능감이 위험 과소평가로 이어지지 않게 점검하세요.',
        '경험을 글·멘토링으로 나눠 영향력을 확장하세요.',
      ],
    },
    en: {
      icon: '🏔️',
      title: 'Very High',
      description: 'You possess very high self-efficacy. You trust and apply your abilities even amid uncertainty and pressure.',
      tips: [
        'Invest this strength into big goals and long-term visions.',
        'Check that high efficacy does not lead to underestimating risk.',
        'Share your experience through writing or mentoring to widen your impact.',
      ],
    },
    ja: {
      icon: '🏔️',
      title: '最高効力感型',
      description: '非常に高い自己効力感を持っています。不確実さや圧力の中でも自分の能力を信頼し発揮します。',
      tips: [
        '大きな目標・長期ビジョンにこの強みを投資しましょう。',
        '高い効力感がリスクの過小評価につながらないか点検しましょう。',
        '経験を文章やメンタリングで分かち合い影響力を広げましょう。',
      ],
    },
    zh: {
      icon: '🏔️',
      title: '顶级效能型',
      description: '你的自我效能非常高。在不确定和压力之下，也信得过自己并把能力使出来。',
      tips: [
        '把这份强项投到大目标和长期愿景上。',
        '检查一下，高效能有没有让你低估了风险。',
        '把经验写下来或带人，把影响力扩出去。',
      ],
    },
    fr: {
      icon: '🏔️',
      title: 'Confiance très élevée',
      description: 'Votre sentiment d’efficacité est très fort. Dans l’incertitude et sous pression, vous vous faites confiance et vous déployez vos capacités.',
      tips: [
        'Investissez cette force dans de grands objectifs et une vision de long terme.',
        'Vérifiez qu’une confiance élevée ne vous fait pas sous-estimer les risques.',
        'Partagez votre expérience par l’écrit ou le mentorat pour élargir votre influence.',
      ],
    },
    es: {
      icon: '🏔️',
      title: 'Confianza muy alta',
      description: 'Tu sentido de eficacia es muy fuerte. En la incertidumbre y bajo presión confías en ti y despliegas lo que tienes.',
      tips: [
        'Invierte esa fuerza en metas grandes y una visión de largo plazo.',
        'Revisa que la confianza alta no te haga subestimar los riesgos.',
        'Comparte tu experiencia por escrito o como mentor para ampliar tu influencia.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'c1', subscale: 'coping', reverse: false, text: '노력하면 어려운 문제도 해결할 수 있다고 믿는다' },
    { id: 'c2', subscale: 'coping', reverse: false, text: '예상치 못한 상황이 와도 잘 대처할 수 있다' },
    { id: 'c3', subscale: 'coping', reverse: false, text: '문제가 생기면 여러 해결책을 찾아낼 수 있다' },
    { id: 'c4', subscale: 'coping', reverse: false, text: '어려움이 닥쳐도 침착함을 유지할 수 있다' },
    { id: 'c5', subscale: 'coping', reverse: false, text: '새로운 일도 배워서 잘 해낼 수 있다고 생각한다' },
    { id: 'c6', subscale: 'coping', reverse: false, text: '장애물이 있어도 방법을 찾아낼 자신이 있다' },
    { id: 'c7', subscale: 'coping', reverse: false, text: '압박이 심한 상황에서도 내 능력을 발휘할 수 있다' },
    { id: 'g1', subscale: 'goal', reverse: false, text: '한번 목표를 세우면 대체로 달성하는 편이다' },
    { id: 'g2', subscale: 'goal', reverse: false, text: '계획한 일을 끝까지 해내는 편이다' },
    { id: 'g3', subscale: 'goal', reverse: false, text: '내가 노력한 만큼 결과가 따라온다고 믿는다' },
    { id: 'g4', subscale: 'goal', reverse: false, text: '실패해도 다시 시도할 자신이 있다' },
    { id: 'g5', subscale: 'goal', reverse: false, text: '내 삶의 중요한 일들을 스스로 통제할 수 있다고 느낀다' },
    { id: 'g6', subscale: 'goal', reverse: false, text: '도전적인 목표일수록 오히려 동기가 생긴다' },
    { id: 'g7', subscale: 'goal', reverse: false, text: '하고자 마음먹으면 대부분 해낼 수 있다' },
  ],
  en: [
    { id: 'c1', subscale: 'coping', reverse: false, text: 'I believe I can solve difficult problems if I try hard enough' },
    { id: 'c2', subscale: 'coping', reverse: false, text: 'I can handle unexpected situations well' },
    { id: 'c3', subscale: 'coping', reverse: false, text: 'When a problem arises, I can find several solutions' },
    { id: 'c4', subscale: 'coping', reverse: false, text: 'I can stay calm when facing difficulties' },
    { id: 'c5', subscale: 'coping', reverse: false, text: 'I think I can learn and do new things well' },
    { id: 'c6', subscale: 'coping', reverse: false, text: 'I am confident I can find a way even when there are obstacles' },
    { id: 'c7', subscale: 'coping', reverse: false, text: 'I can apply my abilities even under heavy pressure' },
    { id: 'g1', subscale: 'goal', reverse: false, text: 'Once I set a goal, I generally achieve it' },
    { id: 'g2', subscale: 'goal', reverse: false, text: 'I tend to follow through on what I plan' },
    { id: 'g3', subscale: 'goal', reverse: false, text: 'I believe results follow in proportion to my effort' },
    { id: 'g4', subscale: 'goal', reverse: false, text: 'I am confident I can try again even after failing' },
    { id: 'g5', subscale: 'goal', reverse: false, text: 'I feel I can control the important things in my life' },
    { id: 'g6', subscale: 'goal', reverse: false, text: 'The more challenging the goal, the more motivated I become' },
    { id: 'g7', subscale: 'goal', reverse: false, text: 'When I set my mind to something, I can usually accomplish it' },
  ],
  ja: [
    { id: 'c1', subscale: 'coping', reverse: false, text: '努力すれば難しい問題も解決できると信じている' },
    { id: 'c2', subscale: 'coping', reverse: false, text: '予期しない状況が来てもうまく対処できる' },
    { id: 'c3', subscale: 'coping', reverse: false, text: '問題が生じたら複数の解決策を見つけられる' },
    { id: 'c4', subscale: 'coping', reverse: false, text: '困難が訪れても冷静さを保てる' },
    { id: 'c5', subscale: 'coping', reverse: false, text: '新しいことも学んでうまくやれると思う' },
    { id: 'c6', subscale: 'coping', reverse: false, text: '障害があっても方法を見つける自信がある' },
    { id: 'c7', subscale: 'coping', reverse: false, text: '強い圧力の中でも自分の能力を発揮できる' },
    { id: 'g1', subscale: 'goal', reverse: false, text: '一度目標を立てるとだいたい達成する方だ' },
    { id: 'g2', subscale: 'goal', reverse: false, text: '計画したことを最後までやり遂げる方だ' },
    { id: 'g3', subscale: 'goal', reverse: false, text: '努力した分だけ結果がついてくると信じている' },
    { id: 'g4', subscale: 'goal', reverse: false, text: '失敗してもまた挑戦する自信がある' },
    { id: 'g5', subscale: 'goal', reverse: false, text: '人生の重要なことを自分でコントロールできると感じる' },
    { id: 'g6', subscale: 'goal', reverse: false, text: '挑戦的な目標ほどむしろ動機が湧く' },
    { id: 'g7', subscale: 'goal', reverse: false, text: 'やろうと決めればたいてい成し遂げられる' },
  ],
  zh: [
    { id: 'c1', subscale: 'coping', reverse: false, text: '我相信只要肯下功夫，难的问题也能解开' },
    { id: 'c2', subscale: 'coping', reverse: false, text: '就算冒出没想到的状况，我也应付得来' },
    { id: 'c3', subscale: 'coping', reverse: false, text: '出问题时，我能想出好几种解法' },
    { id: 'c4', subscale: 'coping', reverse: false, text: '难处来了，我也能保持冷静' },
    { id: 'c5', subscale: 'coping', reverse: false, text: '没做过的事，我也能学会并做好' },
    { id: 'c6', subscale: 'coping', reverse: false, text: '就算有阻碍，我有把握找到办法' },
    { id: 'c7', subscale: 'coping', reverse: false, text: '压力很大的场合，我也能把能力使出来' },
    { id: 'g1', subscale: 'goal', reverse: false, text: '定下目标后，我大体上都能达成' },
    { id: 'g2', subscale: 'goal', reverse: false, text: '计划好的事，我会做到最后' },
    { id: 'g3', subscale: 'goal', reverse: false, text: '我相信付出多少，结果就会跟上' },
    { id: 'g4', subscale: 'goal', reverse: false, text: '失败了，我也有再试一次的底气' },
    { id: 'g5', subscale: 'goal', reverse: false, text: '我觉得自己能掌控生活里重要的事' },
    { id: 'g6', subscale: 'goal', reverse: false, text: '越有挑战的目标，反而越能激起我的劲' },
    { id: 'g7', subscale: 'goal', reverse: false, text: '只要下定决心，大多数事我都做得到' },
  ],
  fr: [
    { id: 'c1', subscale: 'coping', reverse: false, text: 'Je crois qu’avec des efforts, même un problème difficile se résout' },
    { id: 'c2', subscale: 'coping', reverse: false, text: 'Même si l’imprévu arrive, je sais y faire face' },
    { id: 'c3', subscale: 'coping', reverse: false, text: 'Quand un problème surgit, je trouve plusieurs solutions' },
    { id: 'c4', subscale: 'coping', reverse: false, text: 'Même dans la difficulté, je garde mon calme' },
    { id: 'c5', subscale: 'coping', reverse: false, text: 'Même ce que je n’ai jamais fait, je peux l’apprendre et le réussir' },
    { id: 'c6', subscale: 'coping', reverse: false, text: 'Même avec des obstacles, je suis sûr de trouver un moyen' },
    { id: 'c7', subscale: 'coping', reverse: false, text: 'Sous forte pression, je sais déployer mes capacités' },
    { id: 'g1', subscale: 'goal', reverse: false, text: 'Quand je me fixe un objectif, je l’atteins en général' },
    { id: 'g2', subscale: 'goal', reverse: false, text: 'Ce que j’ai planifié, je le mène jusqu’au bout' },
    { id: 'g3', subscale: 'goal', reverse: false, text: 'Je crois que le résultat suit l’effort fourni' },
    { id: 'g4', subscale: 'goal', reverse: false, text: 'Même après un échec, j’ai de quoi réessayer' },
    { id: 'g5', subscale: 'goal', reverse: false, text: 'J’ai le sentiment de maîtriser ce qui compte dans ma vie' },
    { id: 'g6', subscale: 'goal', reverse: false, text: 'Plus l’objectif est exigeant, plus cela me motive' },
    { id: 'g7', subscale: 'goal', reverse: false, text: 'Quand je décide vraiment, je peux faire la plupart des choses' },
  ],
  es: [
    { id: 'c1', subscale: 'coping', reverse: false, text: 'Creo que con esfuerzo hasta un problema difícil se resuelve' },
    { id: 'c2', subscale: 'coping', reverse: false, text: 'Aunque llegue lo imprevisto, sé manejarlo' },
    { id: 'c3', subscale: 'coping', reverse: false, text: 'Cuando surge un problema, doy con varias salidas' },
    { id: 'c4', subscale: 'coping', reverse: false, text: 'Aun en la dificultad, mantengo la calma' },
    { id: 'c5', subscale: 'coping', reverse: false, text: 'Aunque no lo haya hecho nunca, puedo aprenderlo y hacerlo bien' },
    { id: 'c6', subscale: 'coping', reverse: false, text: 'Aunque haya obstáculos, confío en encontrar el modo' },
    { id: 'c7', subscale: 'coping', reverse: false, text: 'Bajo mucha presión, sé sacar lo que tengo' },
    { id: 'g1', subscale: 'goal', reverse: false, text: 'Cuando me pongo una meta, suelo alcanzarla' },
    { id: 'g2', subscale: 'goal', reverse: false, text: 'Lo que planeo, lo llevo hasta el final' },
    { id: 'g3', subscale: 'goal', reverse: false, text: 'Creo que el resultado acompaña al esfuerzo' },
    { id: 'g4', subscale: 'goal', reverse: false, text: 'Aunque falle, tengo con qué volver a intentarlo' },
    { id: 'g5', subscale: 'goal', reverse: false, text: 'Siento que manejo lo importante de mi vida' },
    { id: 'g6', subscale: 'goal', reverse: false, text: 'Cuanto más exigente es la meta, más me motiva' },
    { id: 'g7', subscale: 'goal', reverse: false, text: 'Cuando me decido de verdad, puedo con casi todo' },
  ],
}

function calcLevel(score: number): EfficacyLevel {
  if (score <= 2.5) return 'building'
  if (score <= 3.5) return 'moderate'
  if (score <= 4.3) return 'strong'
  return 'high'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function SelfEfficacyTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "self-efficacy", title: "SelfEfficacyTest", finished: Boolean(done) });

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
    const cItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'coping')
    const gItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'goal')
    const cScore = cItems.reduce((s, x) => s + x.adj, 0) / cItems.length
    const gScore = gItems.reduce((s, x) => s + x.adj, 0) / gItems.length
    const overall = (cScore + gScore) / 2
    return { cScore, gScore, overall }
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

  const { cScore, gScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const cPct = Math.round(((cScore - 1) / 4) * 100)
  const gPct = Math.round(((gScore - 1) / 4) * 100)

  const levelColors: Record<EfficacyLevel, string> = {
    building: '#6ee7b7',
    moderate: '#34d399',
    strong: '#10b981',
    high: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.copingLabel}</span>
            <span className="font-bold" style={{ color }}>{cScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={cPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.copingLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.goalLabel}</span>
            <span className="font-bold" style={{ color }}>{gScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={gPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.goalLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${gPct}%`, backgroundColor: color }} />
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
