import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type CuriosityLevel = 'settled' | 'moderate' | 'curious' | 'explorer'
type Subscale = 'stretch' | 'embrace'

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
  yourScore: string; overallLabel: string; stretchLabel: string; embraceLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '호기심 테스트',
    subtitle: '나의 탐구심은 얼마나 깊을까?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '보통이다', '대체로 그렇다', '매우 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '호기심 활동의 응답 평균은',
    yourScore: '이번 응답의 평균',
    overallLabel: '전체 응답 평균',
    stretchLabel: '탐색',
    embraceLabel: '불확실성 수용',
    outOf: '/ 5.0',
    tipsLabel: '원하면 시도해 볼 제안',
    note: 'OIYO 자체 14문항 자가성찰 활동이에요. 개념을 참고한 CEI-II 원척도는 10문항이며 이 활동과 달라요. 점수·유형은 임상 기준이나 인구 순위가 아니에요. 언어별 타당도는 확인되지 않았고, 아래 제안도 효과가 검증된 훈련은 아니에요. 불편하거나 위험한 경험을 할 필요는 없어요.',
  },
  en: {
    title: 'Curiosity Test',
    subtitle: 'How deep does your curiosity run?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Not at all', 'Hardly', 'Neutral', 'Mostly', 'Very much'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My response average in the curiosity activity is',
    yourScore: 'Your response average',
    overallLabel: 'Overall response average',
    stretchLabel: 'Stretching (seeking)',
    embraceLabel: 'Embracing uncertainty',
    outOf: '/ 5.0',
    tipsLabel: 'Optional things to try',
    note: 'This is an original OIYO 14-question reflection activity, not the original 10-item CEI-II that inspired it. Scores and types are not clinical thresholds or population rankings. Language-specific validity is unconfirmed, and the suggestions are not validated training. You do not need to seek uncomfortable or unsafe experiences.',
  },
  ja: {
    title: '好奇心テスト',
    subtitle: 'あなたの探究心はどれほど深いか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '普通', 'だいたいそう', 'とてもそう'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '好奇心の活動での回答の平均は',
    yourScore: '今回の回答の平均',
    overallLabel: '全回答の平均',
    stretchLabel: '探索',
    embraceLabel: '不確実性の受容',
    outOf: '/ 5.0',
    tipsLabel: '希望する場合の提案',
    note: 'OIYO独自の14問による自己省察の活動です。参考にした原尺度CEI-IIは10項目で、この活動とは異なります。得点やタイプは臨床基準や人口内の順位ではありません。言語別の妥当性は未確認で、提案も効果が検証された訓練ではありません。不快な経験や危険な経験をする必要はありません。',
  },
  zh: {
    title: '好奇心测验',
    subtitle: '我的求知欲有多深？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['完全不是', '几乎不是', '一般', '大致是', '非常是'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我在好奇心活动中的回答平均分是',
    yourScore: '本次回答的平均分',
    overallLabel: '全部回答平均分',
    stretchLabel: '探索与求新',
    embraceLabel: '对不确定的接纳',
    outOf: '/ 5.0',
    tipsLabel: '可自由选择的建议',
    note: '这是OIYO自编的14题反思活动，不是作为概念参考的10题CEI-II原量表。分数与类型不是临床标准或人群排名，各语言版本的效度尚未确认。建议也不是效果已验证的训练，无需尝试令人不适或危险的体验。',
  },
  fr: {
    title: 'Test de curiosité',
    subtitle: 'Jusqu’où va mon envie d’explorer ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Pas du tout', 'Presque pas', 'Neutre', 'Plutôt oui', 'Tout à fait'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'La moyenne de mes réponses à l’activité de curiosité',
    yourScore: 'La moyenne de vos réponses',
    overallLabel: 'Moyenne de toutes les réponses',
    stretchLabel: 'Exploration et goût du neuf',
    embraceLabel: 'Accueil de l’incertitude',
    outOf: '/ 5.0',
    tipsLabel: 'Suggestions facultatives',
    note: 'Cette activité OIYO de réflexion en 14 questions n’est pas le CEI-II original de 10 items qui l’a inspirée. Scores et types ne sont ni des seuils cliniques ni des rangs dans la population. La validité par langue n’est pas confirmée et les suggestions ne constituent pas un entraînement validé. Vous n’avez pas à rechercher des expériences inconfortables ou dangereuses.',
  },
  es: {
    title: 'Test de curiosidad',
    subtitle: '¿Hasta dónde llegan mis ganas de explorar?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nada', 'Casi nada', 'Neutro', 'Más bien sí', 'Totalmente'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'La media de mis respuestas en la actividad de curiosidad',
    yourScore: 'La media de tus respuestas',
    overallLabel: 'Media de todas las respuestas',
    stretchLabel: 'Exploración y gusto por lo nuevo',
    embraceLabel: 'Acogida de la incertidumbre',
    outOf: '/ 5.0',
    tipsLabel: 'Sugerencias opcionales',
    note: 'Esta actividad OIYO de reflexión de 14 preguntas no es el CEI-II original de 10 ítems que la inspira. Las puntuaciones y los tipos no son umbrales clínicos ni posiciones en la población. La validez por lengua no está confirmada y las sugerencias no son un entrenamiento validado. No necesitas buscar experiencias incómodas o peligrosas.',
  },
}

const LEVEL_DATA: Record<CuriosityLevel, Record<SupportedLang, LevelData>> = {
  settled: {
    ko: {
      icon: '🪴',
      title: '안정 선호형',
      description: '이번 응답에서는 새로움과 불확실성 관련 문장에 동의한 정도가 낮았어요. 깊이·능력·성장 가능성을 평가한 결과는 아니에요.',
      tips: [
        '익숙한 길에 작은 변화 하나를 더해 보세요.',
        '관심 가는 주제를 가볍게 5분 검색해 보세요.',
        '"왜 그럴까?" 질문을 하루 한 번 던져 보세요.',
      ],
    },
    en: {
      icon: '🪴',
      title: 'Settled',
      description: 'In these responses, agreement with statements about novelty and uncertainty was lower. This does not assess depth, ability, or potential for growth.',
      tips: [
        'Add one small change to a familiar routine.',
        'Lightly spend 5 minutes exploring a topic that interests you.',
        'Ask "why is that?" once a day.',
      ],
    },
    ja: {
      icon: '🪴',
      title: '安定志向型',
      description: '今回の回答では、新しさや不確実さに関する文への同意が低めでした。深さ、能力、成長の可能性を評価した結果ではありません。',
      tips: [
        '慣れた道に小さな変化を一つ加えてみましょう。',
        '気になる話題を軽く5分調べてみましょう。',
        '「なぜそうなのか？」と一日一回問いかけましょう。',
      ],
    },
    zh: {
      icon: '🪴',
      title: '偏好安稳型',
      description: '本次回答对新事物与不确定性相关陈述的认同程度较低。这并不是对深度、能力或成长潜力的评价。',
      tips: [
        '在走惯的路上加一个小变化。',
        '对感兴趣的题目，轻松查个五分钟。',
        '每天问自己一次「为什么会这样」。',
      ],
    },
    fr: {
      icon: '🪴',
      title: 'Attaché à la stabilité',
      description: 'Dans ces réponses, votre accord avec les affirmations sur la nouveauté et l’incertitude était plus faible. Ce résultat n’évalue ni votre profondeur, ni vos capacités, ni votre potentiel de développement.',
      tips: [
        'Ajoutez un petit changement sur un chemin déjà connu.',
        'Cherchez cinq minutes, sans effort, sur un sujet qui vous attire.',
        'Posez-vous une fois par jour la question « pourquoi est-ce ainsi ? ».',
      ],
    },
    es: {
      icon: '🪴',
      title: 'Prefieres lo estable',
      description: 'En estas respuestas, tu acuerdo con las afirmaciones sobre novedad e incertidumbre fue menor. No es una evaluación de tu profundidad, capacidad o potencial de desarrollo.',
      tips: [
        'Añade un cambio pequeño a un camino ya conocido.',
        'Busca cinco minutos, sin esfuerzo, sobre un tema que te atraiga.',
        'Pregúntate una vez al día «¿por qué es así?».',
      ],
    },
  },
  moderate: {
    ko: {
      icon: '🌱',
      title: '균형 호기심형',
      description: '이번 응답의 전체 평균은 중간 범위였어요. 두 축의 점수는 서로 다를 수 있으니 따로 살펴보세요. 건강이나 성격의 균형을 판정한 결과는 아니에요.',
      tips: [
        '관심이 깊어지는 주제 하나를 정해 꾸준히 파보세요.',
        '낯선 경험을 한 달에 한 번 의도적으로 시도하세요.',
        '호기심을 메모로 모아 탐구 목록을 만드세요.',
      ],
    },
    en: {
      icon: '🌱',
      title: 'Balanced Curiosity',
      description: 'Your overall response average fell in the middle range. The two dimensions may differ, so look at them separately. This does not judge health or a balanced personality.',
      tips: [
        'Pick one topic your interest deepens in and dig steadily.',
        'Intentionally try a new experience once a month.',
        'Collect your curiosities in notes to build an exploration list.',
      ],
    },
    ja: {
      icon: '🌱',
      title: 'バランス好奇心型',
      description: '今回の全回答の平均は中間の範囲でした。2つの側面の得点は異なる場合があるため、別々に見てください。健康や性格のバランスを判定した結果ではありません。',
      tips: [
        '関心が深まる話題を一つ決めて着実に掘りましょう。',
        '月に一度、新しい経験を意図的に試しましょう。',
        '好奇心をメモに集めて探究リストを作りましょう。',
      ],
    },
    zh: {
      icon: '🌱',
      title: '均衡好奇型',
      description: '本次全部回答的平均分处于中间范围。两个维度可能不同，请分别查看。这不是对健康状况或性格平衡的判定。',
      tips: [
        '挑一个越挖越有意思的题目，持续挖下去。',
        '每个月刻意安排一次陌生的体验。',
        '把好奇记成笔记，做成自己的探究清单。',
      ],
    },
    fr: {
      icon: '🌱',
      title: 'Curiosité équilibrée',
      description: 'La moyenne de vos réponses se situait dans la plage intermédiaire. Les deux dimensions peuvent différer : regardez-les séparément. Ce résultat ne juge ni votre santé ni l’équilibre de votre personnalité.',
      tips: [
        'Choisissez un sujet qui vous prend et creusez-le dans la durée.',
        'Une fois par mois, tentez volontairement une expérience inconnue.',
        'Collectez vos curiosités dans des notes : une liste à explorer.',
      ],
    },
    es: {
      icon: '🌱',
      title: 'Curiosidad equilibrada',
      description: 'La media de tus respuestas quedó en el intervalo intermedio. Las dos dimensiones pueden diferir: míralas por separado. El resultado no evalúa tu salud ni el equilibrio de tu personalidad.',
      tips: [
        'Elige un tema que te enganche y escárbalo con constancia.',
        'Una vez al mes, prueba a propósito algo desconocido.',
        'Recoge tus curiosidades en notas: una lista para explorar.',
      ],
    },
  },
  curious: {
    ko: {
      icon: '🔭',
      title: '호기심 풍부형',
      description: '이번 응답에서는 새로움과 불확실성 관련 문장에 동의한 정도가 높았어요. 성장·창의성·학습 능력을 예측하는 점수는 아니에요.',
      tips: [
        '넓은 관심을 한두 가지 깊은 탐구로 모아 보세요.',
        '배운 것을 기록·공유해 지식을 자산으로 만드세요.',
        '호기심을 새로운 사람·분야와의 연결로 확장하세요.',
      ],
    },
    en: {
      icon: '🔭',
      title: 'Highly Curious',
      description: 'In these responses, agreement with statements about novelty and uncertainty was higher. The score does not predict growth, creativity, or learning ability.',
      tips: [
        'Channel broad interests into one or two deep inquiries.',
        'Record and share what you learn to turn knowledge into an asset.',
        'Extend curiosity into connections with new people and fields.',
      ],
    },
    ja: {
      icon: '🔭',
      title: '好奇心豊富型',
      description: '今回の回答では、新しさや不確実さに関する文への同意が高めでした。成長、創造性、学習能力を予測する得点ではありません。',
      tips: [
        '広い関心を一つ二つの深い探究にまとめましょう。',
        '学んだことを記録・共有して知識を資産にしましょう。',
        '好奇心を新しい人や分野とのつながりに広げましょう。',
      ],
    },
    zh: {
      icon: '🔭',
      title: '好奇心丰富型',
      description: '本次回答对新事物与不确定性相关陈述的认同程度较高。分数不能预测成长、创造力或学习能力。',
      tips: [
        '把宽广的兴趣收拢到一两个深的探究上。',
        '把学到的记下来、讲出去，让知识变成资产。',
        '把好奇心扩到新的人和新的领域上。',
      ],
    },
    fr: {
      icon: '🔭',
      title: 'Curiosité abondante',
      description: 'Dans ces réponses, votre accord avec les affirmations sur la nouveauté et l’incertitude était plus élevé. Le score ne prédit ni le développement, ni la créativité, ni les capacités d’apprentissage.',
      tips: [
        'Rassemblez des intérêts larges en une ou deux explorations profondes.',
        'Notez et partagez ce que vous apprenez : le savoir devient un capital.',
        'Étendez cette curiosité vers de nouvelles personnes et de nouveaux domaines.',
      ],
    },
    es: {
      icon: '🔭',
      title: 'Curiosidad abundante',
      description: 'En estas respuestas, tu acuerdo con las afirmaciones sobre novedad e incertidumbre fue mayor. La puntuación no predice el desarrollo, la creatividad ni la capacidad de aprendizaje.',
      tips: [
        'Reúne intereses amplios en una o dos exploraciones hondas.',
        'Anota y comparte lo que aprendes: el saber se vuelve un capital.',
        'Extiende esa curiosidad hacia gente y campos nuevos.',
      ],
    },
  },
  explorer: {
    ko: {
      icon: '🚀',
      title: '탐험가형',
      description: '이번 응답 평균은 자체 분류의 가장 높은 범위였어요. 실제 행동이나 인구 내 순위를 확인한 결과가 아니라 응답을 요약한 이름이에요.',
      tips: [
        '에너지가 분산되지 않게 핵심 탐구 주제를 정하세요.',
        '작게 마칠 수 있는 탐구 하나를 정해 보세요.',
        '발견과 통찰을 글·창작으로 세상과 나눠 보세요.',
      ],
    },
    en: {
      icon: '🚀',
      title: 'Explorer',
      description: 'Your response average fell in this activity’s highest category. The label summarizes responses; it does not establish actual behavior or your rank in the population.',
      tips: [
        'Choose a core inquiry so your energy is not scattered.',
        'Choose one small inquiry you can finish.',
        'Share your discoveries and insights with the world through writing or creating.',
      ],
    },
    ja: {
      icon: '🚀',
      title: '探検家型',
      description: '今回の回答の平均は、この活動独自の分類で最も高い範囲でした。実際の行動や人口内の順位ではなく、回答を要約する名称です。',
      tips: [
        'エネルギーが分散しないよう核心の探究テーマを決めましょう。',
        '小さく区切って終えられる探究を一つ選んでみましょう。',
        '発見や洞察を文章や創作で世界と分かち合いましょう。',
      ],
    },
    zh: {
      icon: '🚀',
      title: '探险家型',
      description: '本次回答平均分处于本活动自定分类的最高范围。类型名称只是回答的摘要，不证明实际行为或在人群中的排名。',
      tips: [
        '定几个核心的探究主题，别让精力散掉。',
        '可以选一个范围小、能完成的探究问题。',
        '把发现和体会写出来、做出来，分享给世界。',
      ],
    },
    fr: {
      icon: '🚀',
      title: 'Explorateur',
      description: 'La moyenne de vos réponses se situait dans la catégorie la plus élevée de cette activité. Ce nom résume les réponses, sans établir votre comportement réel ni votre rang dans la population.',
      tips: [
        'Fixez quelques sujets centraux pour ne pas disperser votre énergie.',
        'Choisissez une petite question que vous pouvez explorer jusqu’au bout.',
        'Partagez vos découvertes par l’écriture ou la création.',
      ],
    },
    es: {
      icon: '🚀',
      title: 'Explorador',
      description: 'La media de tus respuestas quedó en la categoría más alta de esta actividad. El nombre resume las respuestas, sin demostrar tu conducta real ni tu posición en la población.',
      tips: [
        'Fija unos pocos temas centrales para no dispersar la energía.',
        'Elige una pregunta pequeña que puedas explorar hasta el final.',
        'Comparte tus hallazgos por escrito o creando algo.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 's1', subscale: 'stretch', reverse: false, text: '새로운 것을 배우는 데서 즐거움을 느낀다' },
    { id: 's2', subscale: 'stretch', reverse: false, text: '낯선 분야나 주제를 탐색하는 것을 좋아한다' },
    { id: 's3', subscale: 'stretch', reverse: false, text: '흥미로운 질문이 생기면 끝까지 알아본다' },
    { id: 's4', subscale: 'stretch', reverse: false, text: '새로운 경험을 적극적으로 찾아 나선다' },
    { id: 's5', subscale: 'stretch', reverse: false, text: '복잡하거나 도전적인 것에 끌린다' },
    { id: 's6', subscale: 'stretch', reverse: false, text: '일상에서도 "왜?"라는 질문을 자주 한다' },
    { id: 's7', subscale: 'stretch', reverse: false, text: '모르던 것을 알아가는 과정 자체가 즐겁다' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: '예측할 수 없는 상황을 흥미롭게 받아들인다' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: '불확실함을 위협이 아닌 가능성으로 본다' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: '익숙하지 않은 상황에서도 호기심이 앞선다' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: '계획에 없던 일도 새로운 기회로 즐긴다' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: '답이 정해지지 않은 모호한 문제가 재미있다' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: '변화와 새로움이 나를 설레게 한다' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: '낯선 사람·문화·관점을 알아가고 싶다' },
  ],
  en: [
    { id: 's1', subscale: 'stretch', reverse: false, text: 'I find joy in learning new things' },
    { id: 's2', subscale: 'stretch', reverse: false, text: 'I like exploring unfamiliar fields or topics' },
    { id: 's3', subscale: 'stretch', reverse: false, text: 'When an interesting question arises, I look into it thoroughly' },
    { id: 's4', subscale: 'stretch', reverse: false, text: 'I actively seek out new experiences' },
    { id: 's5', subscale: 'stretch', reverse: false, text: 'I am drawn to complex or challenging things' },
    { id: 's6', subscale: 'stretch', reverse: false, text: 'I often ask "why?" even in everyday life' },
    { id: 's7', subscale: 'stretch', reverse: false, text: 'The process of learning what I did not know is enjoyable in itself' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: 'I find unpredictable situations interesting' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: 'I see uncertainty as possibility rather than threat' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: 'Even in unfamiliar situations, curiosity comes first' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: 'I enjoy unplanned events as new opportunities' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: 'I find ambiguous problems without set answers fun' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: 'Change and novelty excite me' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: 'I want to get to know unfamiliar people, cultures, and viewpoints' },
  ],
  ja: [
    { id: 's1', subscale: 'stretch', reverse: false, text: '新しいことを学ぶことに喜びを感じる' },
    { id: 's2', subscale: 'stretch', reverse: false, text: '不慣れな分野や話題を探索するのが好きだ' },
    { id: 's3', subscale: 'stretch', reverse: false, text: '興味深い疑問が生じると最後まで調べる' },
    { id: 's4', subscale: 'stretch', reverse: false, text: '新しい経験を積極的に探し求める' },
    { id: 's5', subscale: 'stretch', reverse: false, text: '複雑で挑戦的なことに惹かれる' },
    { id: 's6', subscale: 'stretch', reverse: false, text: '日常でも「なぜ？」とよく問う' },
    { id: 's7', subscale: 'stretch', reverse: false, text: '知らなかったことを知る過程そのものが楽しい' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: '予測できない状況を興味深く受け止める' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: '不確実さを脅威ではなく可能性と見る' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: '不慣れな状況でも好奇心が先に立つ' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: '計画になかったことも新しい機会として楽しむ' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: '答えが定まらない曖昧な問題が面白い' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: '変化と新しさが自分をわくわくさせる' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: '不慣れな人・文化・視点を知りたい' },
  ],
  zh: [
    { id: 's1', subscale: 'stretch', reverse: false, text: '学新东西让我快乐' },
    { id: 's2', subscale: 'stretch', reverse: false, text: '我喜欢探索没碰过的领域或话题' },
    { id: 's3', subscale: 'stretch', reverse: false, text: '冒出有意思的问题，我会追到底' },
    { id: 's4', subscale: 'stretch', reverse: false, text: '我会主动去找新的体验' },
    { id: 's5', subscale: 'stretch', reverse: false, text: '复杂或有难度的东西会吸引我' },
    { id: 's6', subscale: 'stretch', reverse: false, text: '日常里我也常问「为什么」' },
    { id: 's7', subscale: 'stretch', reverse: false, text: '把不懂的弄懂，这个过程本身就有意思' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: '对料不准的状况，我觉得有意思' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: '我把不确定看成可能性，不是威胁' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: '在不熟的场合，好奇心会先冒出来' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: '计划外的事，我也能当成新机会享受' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: '没有标准答案的模糊问题让我觉得好玩' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: '变化和新鲜让我兴奋' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: '我想去认识陌生的人、文化和视角' },
  ],
  fr: [
    { id: 's1', subscale: 'stretch', reverse: false, text: 'Apprendre du neuf me réjouit' },
    { id: 's2', subscale: 'stretch', reverse: false, text: 'J’aime explorer des domaines ou des sujets inconnus' },
    { id: 's3', subscale: 'stretch', reverse: false, text: 'Quand une question intéressante surgit, je vais jusqu’au bout' },
    { id: 's4', subscale: 'stretch', reverse: false, text: 'Je vais chercher activement de nouvelles expériences' },
    { id: 's5', subscale: 'stretch', reverse: false, text: 'Ce qui est complexe ou exigeant m’attire' },
    { id: 's6', subscale: 'stretch', reverse: false, text: 'Même au quotidien, je demande souvent « pourquoi »' },
    { id: 's7', subscale: 'stretch', reverse: false, text: 'Le chemin qui mène de l’ignorance à la compréhension me plaît en soi' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: 'Les situations imprévisibles me paraissent intéressantes' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: 'Je vois l’incertitude comme une possibilité, non comme une menace' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: 'Dans un cadre inconnu, c’est la curiosité qui parle en premier' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: 'Ce qui n’était pas prévu, je l’accueille comme une occasion' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: 'Les problèmes flous, sans réponse fixée, m’amusent' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: 'Le changement et la nouveauté m’enthousiasment' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: 'J’ai envie de connaître des personnes, des cultures et des points de vue étrangers' },
  ],
  es: [
    { id: 's1', subscale: 'stretch', reverse: false, text: 'Aprender cosas nuevas me alegra' },
    { id: 's2', subscale: 'stretch', reverse: false, text: 'Me gusta explorar campos o temas desconocidos' },
    { id: 's3', subscale: 'stretch', reverse: false, text: 'Cuando surge una pregunta interesante, voy hasta el final' },
    { id: 's4', subscale: 'stretch', reverse: false, text: 'Busco activamente experiencias nuevas' },
    { id: 's5', subscale: 'stretch', reverse: false, text: 'Lo complejo o exigente me atrae' },
    { id: 's6', subscale: 'stretch', reverse: false, text: 'Incluso a diario pregunto a menudo «por qué»' },
    { id: 's7', subscale: 'stretch', reverse: false, text: 'El camino de no saber a entender me gusta en sí mismo' },
    { id: 'e1', subscale: 'embrace', reverse: false, text: 'Las situaciones imprevisibles me parecen interesantes' },
    { id: 'e2', subscale: 'embrace', reverse: false, text: 'Veo la incertidumbre como posibilidad, no como amenaza' },
    { id: 'e3', subscale: 'embrace', reverse: false, text: 'En un sitio desconocido, primero habla la curiosidad' },
    { id: 'e4', subscale: 'embrace', reverse: false, text: 'Lo no previsto lo recibo como una oportunidad' },
    { id: 'e5', subscale: 'embrace', reverse: false, text: 'Los problemas difusos, sin respuesta fija, me divierten' },
    { id: 'e6', subscale: 'embrace', reverse: false, text: 'El cambio y lo nuevo me entusiasman' },
    { id: 'e7', subscale: 'embrace', reverse: false, text: 'Quiero conocer personas, culturas y puntos de vista ajenos' },
  ],
}

// 2026-10-08: preserve the existing editorial cutoffs and saved-result behavior.
// They summarize this activity's answers, not validated CEI-II norms or diagnoses.
function calcLevel(score: number): CuriosityLevel {
  if (score <= 2.5) return 'settled'
  if (score <= 3.5) return 'moderate'
  if (score <= 4.3) return 'curious'
  return 'explorer'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function CuriosityTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "curiosity", title: "CuriosityTest", finished: Boolean(done) });

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
    const sItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'stretch')
    const eItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'embrace')
    const sScore = sItems.reduce((s, x) => s + x.adj, 0) / sItems.length
    const eScore = eItems.reduce((s, x) => s + x.adj, 0) / eItems.length
    const overall = (sScore + eScore) / 2
    return { sScore, eScore, overall }
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

  const { sScore, eScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const sPct = Math.round(((sScore - 1) / 4) * 100)
  const ePct = Math.round(((eScore - 1) / 4) * 100)

  const levelColors: Record<CuriosityLevel, string> = {
    settled: '#6ee7b7',
    moderate: '#34d399',
    curious: '#10b981',
    explorer: '#059669',
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
            <span className="font-bold text-muted-foreground">{lb.stretchLabel}</span>
            <span className="font-bold" style={{ color }}>{sScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={sPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.stretchLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.embraceLabel}</span>
            <span className="font-bold" style={{ color }}>{eScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={ePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.embraceLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ePct}%`, backgroundColor: color }} />
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
