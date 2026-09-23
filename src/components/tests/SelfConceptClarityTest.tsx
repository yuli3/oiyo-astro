import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type ClarityLevel = 'forming' | 'developing' | 'clear' | 'solid'
type Subscale = 'consistency' | 'certainty'

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
  yourScore: string; overallLabel: string; consistencyLabel: string; certaintyLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '자기개념 명료성 테스트',
    subtitle: '나는 나를 얼마나 또렷이 아는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 자기개념 명료성은',
    yourScore: '나의 자기개념 명료성',
    overallLabel: '종합 자기개념 명료성',
    consistencyLabel: '자기 일관성',
    certaintyLabel: '자기 확신',
    outOf: '/ 5.0',
    tipsLabel: '성장 팁',
    note: '캠벨의 자기개념 명료성 척도(Self-Concept Clarity, 1996) 개념을 바탕으로 한 자가성찰용 테스트입니다. 전문적 진단을 대체하지 않습니다.',
  },
  en: {
    title: 'Self-Concept Clarity Test',
    subtitle: 'How clearly do you know yourself?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My self-concept clarity is',
    yourScore: 'Your Self-Concept Clarity',
    overallLabel: 'Overall Self-Concept Clarity',
    consistencyLabel: 'Self-Consistency',
    certaintyLabel: 'Self-Certainty',
    outOf: '/ 5.0',
    tipsLabel: 'Growth Tips',
    note: 'This self-reflection test is based on the Self-Concept Clarity Scale (Campbell, 1996). It does not replace professional assessment.',
  },
  ja: {
    title: '自己概念明確性テスト',
    subtitle: '自分をどれくらいはっきり知っているか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私の自己概念明確性は',
    yourScore: 'あなたの自己概念明確性',
    overallLabel: '総合自己概念明確性',
    consistencyLabel: '自己一貫性',
    certaintyLabel: '自己確信',
    outOf: '/ 5.0',
    tipsLabel: '成長のヒント',
    note: 'このテストはキャンベルの自己概念明確性尺度（Self-Concept Clarity, 1996）の概念に基づく自己省察用です。専門的な診断の代替ではありません。',
  },
  zh: {
    title: '自我概念清晰度测验',
    subtitle: '我对自己看得有多清楚？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '一般', '大致是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的自我概念清晰度是',
    yourScore: '我的自我概念清晰度',
    overallLabel: '综合清晰度',
    consistencyLabel: '自我一致性',
    certaintyLabel: '自我笃定',
    outOf: '/ 5.0',
    tipsLabel: '成长建议',
    note: '本测验参考 Campbell 的自我概念清晰度量表（Self-Concept Clarity, 1996）概念，用于自我省思，不能替代专业评估。',
  },
  fr: {
    title: 'Test de clarté du concept de soi',
    subtitle: 'À quel point est-ce que je me vois clairement ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Ma clarté de soi',
    yourScore: 'Votre clarté de soi',
    overallLabel: 'Clarté globale',
    consistencyLabel: 'Cohérence de soi',
    certaintyLabel: 'Assurance intérieure',
    outOf: '/ 5.0',
    tipsLabel: 'Piste de progrès',
    note: 'Ce test reprend les notions de l’échelle de clarté du concept de soi de Campbell (1996), à des fins de réflexion personnelle. Il ne remplace pas une évaluation professionnelle.',
  },
  es: {
    title: 'Test de claridad del autoconcepto',
    subtitle: '¿Con qué claridad me veo?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi claridad sobre mí',
    yourScore: 'Tu claridad sobre ti',
    overallLabel: 'Claridad global',
    consistencyLabel: 'Coherencia con uno mismo',
    certaintyLabel: 'Seguridad interior',
    outOf: '/ 5.0',
    tipsLabel: 'Para crecer',
    note: 'Este test recoge las ideas de la escala de claridad del autoconcepto de Campbell (1996), para la reflexión personal. No sustituye una evaluación profesional.',
  },
}

const LEVEL_DATA: Record<ClarityLevel, Record<SupportedLang, LevelData>> = {
  forming: {
    ko: {
      icon: '🌫️',
      title: '형성 단계',
      description: '아직 "나다움"이 또렷하게 잡히지 않은 탐색기입니다. 자기개념이 상황과 타인에 따라 흔들릴 수 있지만, 이는 성장의 자연스러운 과정입니다.',
      tips: [
        '가치관·강점·욕구를 글로 적어 나의 윤곽을 그려 보세요.',
        '다양한 경험을 "나에게 맞는가"의 관점으로 점검하세요.',
        '남의 기대와 나의 바람을 구분하는 연습을 하세요.',
      ],
    },
    en: {
      icon: '🌫️',
      title: 'Forming',
      description: 'You are in an exploratory phase where "who you are" is not yet clearly defined. Your self-concept may shift with situations and people—a natural part of growth.',
      tips: [
        'Write down your values, strengths, and needs to sketch your outline.',
        'Review experiences through the lens of "does this fit me?"',
        'Practice separating others\' expectations from your own wishes.',
      ],
    },
    ja: {
      icon: '🌫️',
      title: '形成段階',
      description: 'まだ「自分らしさ」がはっきり掴めていない探索期です。自己概念が状況や他人によって揺れることがありますが、これは成長の自然な過程です。',
      tips: [
        '価値観・強み・欲求を書き出して自分の輪郭を描きましょう。',
        '様々な経験を「自分に合うか」の視点で点検しましょう。',
        '他人の期待と自分の願いを区別する練習をしましょう。',
      ],
    },
    zh: {
      icon: '🌫️',
      title: '形成阶段',
      description: '「我像什么样子」还没定下来，正处在摸索期。自我概念会随场合和他人晃动，但这是成长里很自然的一段。',
      tips: [
        '把价值观、长处、想要的东西写下来，给自己画个轮廓。',
        '用「这适不适合我」的角度，去检视各种经历。',
        '练习分清楚：哪些是别人的期待，哪些是自己的想要。',
      ],
    },
    fr: {
      icon: '🌫️',
      title: 'En formation',
      description: '« Ce que je suis » n’est pas encore net : vous êtes en exploration. Le concept de soi peut vaciller selon les situations et les personnes, mais c’est une étape naturelle de la croissance.',
      tips: [
        'Écrivez vos valeurs, vos forces et vos désirs pour dessiner vos contours.',
        'Passez vos expériences au crible de la question « est-ce que cela me convient ? ».',
        'Entraînez-vous à distinguer les attentes des autres de vos propres envies.',
      ],
    },
    es: {
      icon: '🌫️',
      title: 'En formación',
      description: '«Lo que soy» aún no está nítido: estás explorando. El autoconcepto puede tambalearse según la situación y la gente, pero es una etapa natural del crecimiento.',
      tips: [
        'Escribe tus valores, tus fortalezas y lo que quieres, para dibujar tu contorno.',
        'Pasa tus experiencias por la pregunta «¿esto me encaja?».',
        'Practica distinguir las expectativas ajenas de tus propios deseos.',
      ],
    },
  },
  developing: {
    ko: {
      icon: '🌤️',
      title: '발전 단계',
      description: '자신에 대한 그림이 어느 정도 잡혀 있지만, 흔들리는 영역도 남아 있습니다. 명료성을 더 키워갈 좋은 시점입니다.',
      tips: [
        '결정의 기준이 흔들렸던 순간을 돌아보며 패턴을 찾으세요.',
        '"나는 ~한 사람"이라는 핵심 문장을 몇 개 정리해 보세요.',
        '피드백을 참고하되 최종 정의는 스스로 내리세요.',
      ],
    },
    en: {
      icon: '🌤️',
      title: 'Developing',
      description: 'You have a fairly defined picture of yourself, but some areas still waver. It is a good time to grow your clarity further.',
      tips: [
        'Look back at moments your decision criteria wavered and find patterns.',
        'Draft a few core sentences like "I am someone who…"',
        'Use feedback as reference, but make the final definition yourself.',
      ],
    },
    ja: {
      icon: '🌤️',
      title: '発展段階',
      description: '自分についての像はある程度掴めていますが、揺れる領域も残っています。明確性をさらに育てる良い時期です。',
      tips: [
        '決断の基準が揺れた瞬間を振り返ってパターンを探しましょう。',
        '「私は〜な人」という核心の文をいくつか整理しましょう。',
        'フィードバックを参考にしつつ最終的な定義は自分で下しましょう。',
      ],
    },
    zh: {
      icon: '🌤️',
      title: '发展阶段',
      description: '你对自己已经有个大致的轮廓，但还有些地方会晃。现在正是把清晰度再拉高的好时机。',
      tips: [
        '回看那些标准晃动的时刻，找出自己的规律。',
        '整理几句「我是一个……的人」的核心句子。',
        '参考别人的回馈，但最后的定义留给自己。',
      ],
    },
    fr: {
      icon: '🌤️',
      title: 'En développement',
      description: 'Vous avez déjà une image de vous-même, avec des zones qui bougent encore. C’est un bon moment pour gagner en clarté.',
      tips: [
        'Repensez aux moments où vos critères ont vacillé : cherchez le schéma.',
        'Formulez quelques phrases clés : « je suis quelqu’un qui… ».',
        'Tenez compte des retours, mais gardez la définition finale pour vous.',
      ],
    },
    es: {
      icon: '🌤️',
      title: 'En desarrollo',
      description: 'Ya tienes una imagen de ti, con zonas que aún se mueven. Es buen momento para ganar claridad.',
      tips: [
        'Repasa los momentos en que tus criterios se tambalearon: busca el patrón.',
        'Formula unas cuantas frases clave: «soy alguien que…».',
        'Ten en cuenta lo que te dicen, pero deja la definición final en tus manos.',
      ],
    },
  },
  clear: {
    ko: {
      icon: '🧭',
      title: '명료 단계',
      description: '자신이 어떤 사람인지 비교적 또렷이 알고, 그 정체성이 상황과 시간에 걸쳐 일관됩니다. 흔들림 속에서도 중심을 잘 잡습니다.',
      tips: [
        '명료한 자기 인식을 의사결정·관계에 적극 활용하세요.',
        '정체성이 경직되지 않도록 새로운 경험에 열려 있으세요.',
        '나의 가치를 행동으로 표현해 일관성을 더 단단히 하세요.',
      ],
    },
    en: {
      icon: '🧭',
      title: 'Clear',
      description: 'You know fairly clearly who you are, and that identity stays consistent across situations and time. You stay centered even amid turbulence.',
      tips: [
        'Actively use your clear self-knowledge in decisions and relationships.',
        'Stay open to new experiences so your identity does not become rigid.',
        'Express your values through action to make consistency more solid.',
      ],
    },
    ja: {
      icon: '🧭',
      title: '明確段階',
      description: '自分がどんな人かを比較的はっきり知り、その同一性が状況や時間を通じて一貫しています。揺れの中でも中心をよく保てます。',
      tips: [
        '明確な自己認識を意思決定・人間関係に積極的に活かしましょう。',
        '同一性が硬直しないよう新しい経験に開かれていましょう。',
        '自分の価値を行動で表現し一貫性をさらに固めましょう。',
      ],
    },
    zh: {
      icon: '🧭',
      title: '清晰阶段',
      description: '你比较清楚自己是什么样的人，这个身份跨越场合和时间也保持一致。就算晃动，你也稳得住重心。',
      tips: [
        '把这份清楚的自我认识用在决定和关系里。',
        '别让身份变僵，保持对新经验的开放。',
        '把价值用行动表达出来，一致性会更结实。',
      ],
    },
    fr: {
      icon: '🧭',
      title: 'Clair',
      description: 'Vous savez assez nettement qui vous êtes, et cette identité tient à travers les situations et le temps. Même secoué, vous gardez votre centre.',
      tips: [
        'Servez-vous de cette clarté dans vos décisions et vos relations.',
        'Veillez à ce que l’identité ne se fige pas : restez ouvert au neuf.',
        'Exprimez vos valeurs par des actes : la cohérence s’en trouve renforcée.',
      ],
    },
    es: {
      icon: '🧭',
      title: 'Claro',
      description: 'Sabes con bastante nitidez quién eres, y esa identidad se mantiene a través de situaciones y tiempo. Aunque te sacudan, conservas el centro.',
      tips: [
        'Usa esa claridad en tus decisiones y en tus vínculos.',
        'Cuida que la identidad no se vuelva rígida: sigue abierto a lo nuevo.',
        'Expresa tus valores con actos: la coherencia se afianza.',
      ],
    },
  },
  solid: {
    ko: {
      icon: '🗿',
      title: '확고 단계',
      description: '자기개념이 매우 또렷하고 안정적입니다. 외부의 평가나 변화 속에서도 "나는 누구인가"가 흔들리지 않습니다.',
      tips: [
        '확고한 정체성을 장기 비전·소명과 연결하세요.',
        '확신이 폐쇄로 굳지 않게 다른 관점에 귀 기울이세요.',
        '자기 이해를 바탕으로 타인의 정체성 탐색을 도와주세요.',
      ],
    },
    en: {
      icon: '🗿',
      title: 'Solid',
      description: 'Your self-concept is very clear and stable. "Who am I" does not waver even amid external judgment or change.',
      tips: [
        'Connect your solid identity to a long-term vision or calling.',
        'Keep listening to other perspectives so certainty does not harden into closure.',
        'Use your self-understanding to help others explore their identity.',
      ],
    },
    ja: {
      icon: '🗿',
      title: '確固段階',
      description: '自己概念が非常に明確で安定しています。外部の評価や変化の中でも「自分は誰か」が揺れません。',
      tips: [
        '確固たる同一性を長期ビジョン・使命と結びつけましょう。',
        '確信が閉鎖に固まらないよう他の視点に耳を傾けましょう。',
        '自己理解をもとに他人の同一性探索を助けましょう。',
      ],
    },
    zh: {
      icon: '🗿',
      title: '稳固阶段',
      description: '你的自我概念非常清楚也很稳。外界的评价和变化都动摇不了「我是谁」。',
      tips: [
        '把这份稳固的身份接到长期的愿景和使命上。',
        '别让笃定变成封闭，也听听别的角度。',
        '用你对自己的理解，去帮别人探索他们的身份。',
      ],
    },
    fr: {
      icon: '🗿',
      title: 'Solide',
      description: 'Votre concept de soi est très net et stable. Ni les jugements extérieurs ni les changements n’ébranlent le « qui je suis ».',
      tips: [
        'Reliez cette identité solide à une vision et à une vocation de long terme.',
        'Veillez à ce que l’assurance ne se ferme pas : écoutez d’autres points de vue.',
        'Servez-vous de cette connaissance de soi pour aider d’autres à explorer la leur.',
      ],
    },
    es: {
      icon: '🗿',
      title: 'Sólido',
      description: 'Tu autoconcepto es muy nítido y estable. Ni los juicios de fuera ni los cambios mueven el «quién soy».',
      tips: [
        'Conecta esa identidad sólida con una visión y una vocación de largo plazo.',
        'Cuida que la seguridad no se cierre: escucha otros puntos de vista.',
        'Usa ese conocimiento de ti para ayudar a otros a explorar el suyo.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'c1', subscale: 'consistency', reverse: false, text: '나는 시간이 지나도 변하지 않는 핵심 가치가 분명하다' },
    { id: 'c2', subscale: 'consistency', reverse: false, text: '상황이 달라져도 "나다움"이 일관되게 유지된다' },
    { id: 'c3', subscale: 'consistency', reverse: false, text: '내 신념과 행동이 대체로 일치한다' },
    { id: 'c4', subscale: 'consistency', reverse: false, text: '어떤 사람들과 있어도 나는 같은 사람으로 느껴진다' },
    { id: 'c5', subscale: 'consistency', reverse: false, text: '과거의 나와 지금의 나 사이에 연속성이 느껴진다' },
    { id: 'c6', subscale: 'consistency', reverse: false, text: '내 성격을 한마디로 설명할 수 있다' },
    { id: 'c7', subscale: 'consistency', reverse: false, text: '나의 감정이 왜 생기는지 대체로 이해한다' },
    { id: 't1', subscale: 'certainty', reverse: false, text: '나는 내가 어떤 사람인지 잘 안다' },
    { id: 't2', subscale: 'certainty', reverse: false, text: '내가 무엇을 원하는지 비교적 분명히 안다' },
    { id: 't3', subscale: 'certainty', reverse: false, text: '중요한 선택에서 내 기준이 분명하다' },
    { id: 't4', subscale: 'certainty', reverse: false, text: '남이 뭐라 해도 내가 누구인지 헷갈리지 않는다' },
    { id: 't5', subscale: 'certainty', reverse: false, text: '내 강점과 약점을 또렷이 알고 있다' },
    { id: 't6', subscale: 'certainty', reverse: false, text: '내 의견은 쉽게 흔들리지 않는다' },
    { id: 't7', subscale: 'certainty', reverse: false, text: '내 삶의 방향에 대한 확신이 있다' },
  ],
  en: [
    { id: 'c1', subscale: 'consistency', reverse: false, text: 'I have clear core values that do not change over time' },
    { id: 'c2', subscale: 'consistency', reverse: false, text: 'My "true self" stays consistent even when situations change' },
    { id: 'c3', subscale: 'consistency', reverse: false, text: 'My beliefs and actions are generally consistent' },
    { id: 'c4', subscale: 'consistency', reverse: false, text: 'I feel like the same person no matter who I am with' },
    { id: 'c5', subscale: 'consistency', reverse: false, text: 'I feel continuity between who I was and who I am now' },
    { id: 'c6', subscale: 'consistency', reverse: false, text: 'I can describe my personality in a single phrase' },
    { id: 'c7', subscale: 'consistency', reverse: false, text: 'I generally understand why my emotions arise' },
    { id: 't1', subscale: 'certainty', reverse: false, text: 'I know well what kind of person I am' },
    { id: 't2', subscale: 'certainty', reverse: false, text: 'I know fairly clearly what I want' },
    { id: 't3', subscale: 'certainty', reverse: false, text: 'My criteria are clear in important choices' },
    { id: 't4', subscale: 'certainty', reverse: false, text: 'I do not get confused about who I am no matter what others say' },
    { id: 't5', subscale: 'certainty', reverse: false, text: 'I clearly know my strengths and weaknesses' },
    { id: 't6', subscale: 'certainty', reverse: false, text: 'My opinions are not easily swayed' },
    { id: 't7', subscale: 'certainty', reverse: false, text: 'I am confident about the direction of my life' },
  ],
  ja: [
    { id: 'c1', subscale: 'consistency', reverse: false, text: '時間が経っても変わらない核心的な価値観が明確だ' },
    { id: 'c2', subscale: 'consistency', reverse: false, text: '状況が変わっても「自分らしさ」が一貫して保たれる' },
    { id: 'c3', subscale: 'consistency', reverse: false, text: '自分の信念と行動がだいたい一致する' },
    { id: 'c4', subscale: 'consistency', reverse: false, text: '誰といても自分は同じ人だと感じる' },
    { id: 'c5', subscale: 'consistency', reverse: false, text: '過去の自分と今の自分の間に連続性を感じる' },
    { id: 'c6', subscale: 'consistency', reverse: false, text: '自分の性格を一言で説明できる' },
    { id: 'c7', subscale: 'consistency', reverse: false, text: '自分の感情がなぜ生じるかだいたい理解している' },
    { id: 't1', subscale: 'certainty', reverse: false, text: '自分がどんな人かよく分かっている' },
    { id: 't2', subscale: 'certainty', reverse: false, text: '自分が何を望んでいるか比較的はっきり分かる' },
    { id: 't3', subscale: 'certainty', reverse: false, text: '重要な選択で自分の基準が明確だ' },
    { id: 't4', subscale: 'certainty', reverse: false, text: '他人に何を言われても自分が誰か迷わない' },
    { id: 't5', subscale: 'certainty', reverse: false, text: '自分の強みと弱みをはっきり知っている' },
    { id: 't6', subscale: 'certainty', reverse: false, text: '自分の意見は簡単に揺らがない' },
    { id: 't7', subscale: 'certainty', reverse: false, text: '自分の人生の方向に確信がある' },
  ],
  zh: [
    { id: 'c1', subscale: 'consistency', reverse: false, text: '我有一些核心价值，时间过去也不会变' },
    { id: 'c2', subscale: 'consistency', reverse: false, text: '就算处境变了，「我这个人」还是一致的' },
    { id: 'c3', subscale: 'consistency', reverse: false, text: '我的信念和行为大体上对得上' },
    { id: 'c4', subscale: 'consistency', reverse: false, text: '跟什么人在一起，我都觉得自己是同一个人' },
    { id: 'c5', subscale: 'consistency', reverse: false, text: '过去的我和现在的我之间，有连得起来的线' },
    { id: 'c6', subscale: 'consistency', reverse: false, text: '我能用一句话说清自己的性格' },
    { id: 'c7', subscale: 'consistency', reverse: false, text: '我的情绪为什么冒出来，我大体上懂' },
    { id: 't1', subscale: 'certainty', reverse: false, text: '我很清楚自己是什么样的人' },
    { id: 't2', subscale: 'certainty', reverse: false, text: '我想要什么，我比较清楚' },
    { id: 't3', subscale: 'certainty', reverse: false, text: '重要的选择上，我的标准是明确的' },
    { id: 't4', subscale: 'certainty', reverse: false, text: '别人怎么说，都不会让我搞不清自己是谁' },
    { id: 't5', subscale: 'certainty', reverse: false, text: '我的长处和短处，我看得清楚' },
    { id: 't6', subscale: 'certainty', reverse: false, text: '我的意见不容易被动摇' },
    { id: 't7', subscale: 'certainty', reverse: false, text: '对自己人生的方向，我是有把握的' },
  ],
  fr: [
    { id: 'c1', subscale: 'consistency', reverse: false, text: 'J’ai des valeurs centrales qui ne changent pas avec le temps' },
    { id: 'c2', subscale: 'consistency', reverse: false, text: 'Même quand la situation change, « ce que je suis » reste cohérent' },
    { id: 'c3', subscale: 'consistency', reverse: false, text: 'Mes convictions et mes actes concordent en général' },
    { id: 'c4', subscale: 'consistency', reverse: false, text: 'Avec n’importe qui, j’ai le sentiment d’être la même personne' },
    { id: 'c5', subscale: 'consistency', reverse: false, text: 'Je sens une continuité entre celui que j’étais et celui que je suis' },
    { id: 'c6', subscale: 'consistency', reverse: false, text: 'Je peux décrire mon caractère en une phrase' },
    { id: 'c7', subscale: 'consistency', reverse: false, text: 'Je comprends en général d’où viennent mes émotions' },
    { id: 't1', subscale: 'certainty', reverse: false, text: 'Je sais bien quelle sorte de personne je suis' },
    { id: 't2', subscale: 'certainty', reverse: false, text: 'Je sais assez clairement ce que je veux' },
    { id: 't3', subscale: 'certainty', reverse: false, text: 'Dans les choix importants, mes critères sont nets' },
    { id: 't4', subscale: 'certainty', reverse: false, text: 'Quoi qu’on dise de moi, je ne perds pas de vue qui je suis' },
    { id: 't5', subscale: 'certainty', reverse: false, text: 'Je connais clairement mes forces et mes faiblesses' },
    { id: 't6', subscale: 'certainty', reverse: false, text: 'Mes opinions ne vacillent pas facilement' },
    { id: 't7', subscale: 'certainty', reverse: false, text: 'J’ai une certitude sur la direction de ma vie' },
  ],
  es: [
    { id: 'c1', subscale: 'consistency', reverse: false, text: 'Tengo valores centrales que no cambian con el tiempo' },
    { id: 'c2', subscale: 'consistency', reverse: false, text: 'Aunque cambie la situación, «lo que soy» se mantiene coherente' },
    { id: 'c3', subscale: 'consistency', reverse: false, text: 'Mis convicciones y mis actos suelen coincidir' },
    { id: 'c4', subscale: 'consistency', reverse: false, text: 'Con cualquier persona siento que soy el mismo' },
    { id: 'c5', subscale: 'consistency', reverse: false, text: 'Noto continuidad entre quien era y quien soy' },
    { id: 'c6', subscale: 'consistency', reverse: false, text: 'Puedo describir mi carácter en una frase' },
    { id: 'c7', subscale: 'consistency', reverse: false, text: 'Entiendo en general de dónde vienen mis emociones' },
    { id: 't1', subscale: 'certainty', reverse: false, text: 'Sé bien qué clase de persona soy' },
    { id: 't2', subscale: 'certainty', reverse: false, text: 'Sé con bastante claridad qué quiero' },
    { id: 't3', subscale: 'certainty', reverse: false, text: 'En las decisiones importantes mis criterios son claros' },
    { id: 't4', subscale: 'certainty', reverse: false, text: 'Digan lo que digan de mí, no pierdo de vista quién soy' },
    { id: 't5', subscale: 'certainty', reverse: false, text: 'Conozco con claridad mis fortalezas y mis debilidades' },
    { id: 't6', subscale: 'certainty', reverse: false, text: 'Mis opiniones no se tambalean con facilidad' },
    { id: 't7', subscale: 'certainty', reverse: false, text: 'Tengo certeza sobre la dirección de mi vida' },
  ],
}

function calcLevel(score: number): ClarityLevel {
  if (score <= 2.5) return 'forming'
  if (score <= 3.5) return 'developing'
  if (score <= 4.3) return 'clear'
  return 'solid'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function SelfConceptClarityTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "self-concept-clarity", title: "SelfConceptClarityTest", finished: Boolean(done) });

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
    const cItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'consistency')
    const tItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'certainty')
    const cScore = cItems.reduce((s, x) => s + x.adj, 0) / cItems.length
    const tScore = tItems.reduce((s, x) => s + x.adj, 0) / tItems.length
    const overall = (cScore + tScore) / 2
    return { cScore, tScore, overall }
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

  const { cScore, tScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const cPct = Math.round(((cScore - 1) / 4) * 100)
  const tPct = Math.round(((tScore - 1) / 4) * 100)

  const levelColors: Record<ClarityLevel, string> = {
    forming: '#6ee7b7',
    developing: '#34d399',
    clear: '#10b981',
    solid: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.consistencyLabel}</span>
            <span className="font-bold" style={{ color }}>{cScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={cPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.consistencyLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.certaintyLabel}</span>
            <span className="font-bold" style={{ color }}>{tScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={tPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.certaintyLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${tPct}%`, backgroundColor: color }} />
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
