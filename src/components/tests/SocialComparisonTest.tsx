import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import ResultShareImage from '../shared/ResultShareImage'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type CompLevel = 'self' | 'mild' | 'sensitive' | 'intense'
type Subscale = 'ability' | 'opinion'

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
  yourScore: string; overallLabel: string; abilityLabel: string; opinionLabel: string
  outOf: string; tipsLabel: string; note: string
}> = {
  ko: {
    title: '사회적 비교 성향 테스트',
    subtitle: '나는 남과 얼마나 비교하는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['전혀 아니다', '거의 아니다', '가끔 그렇다', '자주 그렇다', '항상 그렇다'],
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '사회적 비교 활동의 응답 평균은',
    yourScore: '이번 응답의 평균',
    overallLabel: '전체 응답 평균',
    abilityLabel: '능력 비교',
    opinionLabel: '의견 비교',
    outOf: '/ 5.0',
    tipsLabel: '원하면 돌아볼 질문과 제안',
    note: '능력·의견 비교 개념을 참고한 OIYO 자체 14문항 활동이에요. 11문항 INCOM 원척도와 다르며 상향·하향 방향을 따로 측정하지 않아요. 유형·막대는 응답 요약이지 진단이나 인구 백분위가 아니에요. 언어별 타당도와 제안의 치료 효과는 확인되지 않았어요.',
  },
  en: {
    title: 'Social Comparison Test',
    subtitle: 'How much do you compare yourself to others?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My response average in the social comparison activity is',
    yourScore: 'Your response average',
    overallLabel: 'Overall response average',
    abilityLabel: 'Ability Comparison',
    opinionLabel: 'Opinion Comparison',
    outOf: '/ 5.0',
    tipsLabel: 'Optional reflection questions and suggestions',
    note: 'This original OIYO 14-question activity draws on ability and opinion comparison. It differs from the original 11-item INCOM and does not measure upward and downward directions separately. Types and bars summarize responses, not diagnoses or population percentiles. Language-specific validity and therapeutic effects of the suggestions are unconfirmed.',
  },
  ja: {
    title: '社会的比較傾向テスト',
    subtitle: '自分は他人とどれくらい比較するか？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['全くない', 'ほとんどない', '時々ある', 'よくある', 'いつもある'],
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '社会的比較の活動での回答の平均は',
    yourScore: '今回の回答の平均',
    overallLabel: '全回答の平均',
    abilityLabel: '能力比較',
    opinionLabel: '意見比較',
    outOf: '/ 5.0',
    tipsLabel: '希望する場合の問いと提案',
    note: '能力・意見比較を参考にしたOIYO独自の14問です。11項目の原INCOMとは異なり、上方・下方の方向を別々に測定しません。タイプや棒は回答の要約で、診断や人口のパーセンタイルではありません。言語別の妥当性や提案の治療効果は未確認です。',
  },
  zh: {
    title: '社会比较倾向测验',
    subtitle: '我有多常跟别人比？',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['从不', '很少', '偶尔如此', '经常如此', '总是如此'],
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我在社会比较活动中的回答平均分是',
    yourScore: '本次回答的平均分',
    overallLabel: '全部回答平均分',
    abilityLabel: '能力比较',
    opinionLabel: '意见比较',
    outOf: '/ 5.0',
    tipsLabel: '可选择的反思问题与建议',
    note: '这是参考能力、意见比较概念的OIYO自编14题活动，与11题INCOM原量表不同，不分别测量向上、向下方向。类型和条形图只是回答摘要，不是诊断或人群百分位。各语言的效度和建议的治疗效果尚未确认。',
  },
  fr: {
    title: 'Test de la tendance à la comparaison sociale',
    subtitle: 'À quel point est-ce que je me compare ?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'La moyenne de mes réponses à l’activité de comparaison sociale',
    yourScore: 'La moyenne de vos réponses',
    overallLabel: 'Moyenne de toutes les réponses',
    abilityLabel: 'Comparaison de capacités',
    opinionLabel: 'Comparaison d’opinions',
    outOf: '/ 5.0',
    tipsLabel: 'Questions et suggestions facultatives',
    note: 'Cette activité OIYO de 14 questions s’inspire des comparaisons de capacités et d’opinions. Elle diffère de l’INCOM original de 11 items et ne mesure pas séparément les directions ascendante et descendante. Types et barres résument les réponses, sans diagnostic ni percentile de population. La validité par langue et les effets thérapeutiques des suggestions ne sont pas confirmés.',
  },
  es: {
    title: 'Test de tendencia a la comparación social',
    subtitle: '¿Cuánto me comparo con los demás?',
    questionOf: (c, t) => `${c} / ${t}`,
    scaleLabels: ['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Siempre'],
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'La media de mis respuestas en la actividad de comparación social',
    yourScore: 'La media de tus respuestas',
    overallLabel: 'Media de todas las respuestas',
    abilityLabel: 'Comparación de capacidades',
    opinionLabel: 'Comparación de opiniones',
    outOf: '/ 5.0',
    tipsLabel: 'Preguntas y sugerencias opcionales',
    note: 'Esta actividad OIYO de 14 preguntas se inspira en las comparaciones de capacidades y opiniones. Difiere del INCOM original de 11 ítems y no mide por separado las direcciones ascendente y descendente. Los tipos y las barras resumen respuestas, sin diagnóstico ni percentil de población. La validez por lengua y los efectos terapéuticos de las sugerencias no están confirmados.',
  },
}

const LEVEL_DATA: Record<CompLevel, Record<SupportedLang, LevelData>> = {
  self: {
    ko: {
      icon: '🧭',
      title: '자기 기준형',
      description: '이번 활동의 비교 관련 질문에 낮은 값을 선택한 편이에요. 자기 기준이 단단하다거나 타인의 평가에 흔들리지 않는다고 확인한 결과는 아니에요.',
      tips: [
        '원하면 이번 선택에서 중요하게 본 기준을 적어 보세요.',
        '가끔의 비교는 배움의 기회로 가볍게 활용하세요.',
        '나만의 가치와 진척을 정기적으로 점검하세요.',
      ],
    },
    en: {
      icon: '🧭',
      title: 'Self-Referenced',
      description: 'You selected lower values on this activity’s comparison questions. This does not establish firm personal standards or immunity to others’ judgments.',
      tips: [
        'If you wish, note which criterion mattered in a recent choice.',
        'Use the occasional comparison lightly, as a chance to learn.',
        'Regularly review your own values and progress.',
      ],
    },
    ja: {
      icon: '🧭',
      title: '自己基準型',
      description: '今回の比較に関する質問では低めの値を選んでいました。自己基準が確かだ、他人の評価に揺れないと確認した結果ではありません。',
      tips: [
        '希望する場合、最近の選択で重視した基準を書いてみましょう。',
        '時々の比較は学びの機会として軽く活用しましょう。',
        '自分の価値と進捗を定期的に点検しましょう。',
      ],
    },
    zh: {
      icon: '🧭',
      title: '自我标准型',
      description: '本次比较相关问题中，你选择的数值较低。这不证明个人标准坚实，也不证明你不会受他人评价影响。',
      tips: [
        '如果愿意，可以写下最近一次选择中看重的标准。',
        '偶尔的比较，就轻轻当成学习的机会。',
        '定期回看自己的价值和进度。',
      ],
    },
    fr: {
      icon: '🧭',
      title: 'Critères propres',
      description: 'Vous avez choisi des valeurs plus faibles aux questions de comparaison de cette activité. Cela ne démontre ni des critères personnels solides ni une insensibilité aux jugements d’autrui.',
      tips: [
        'Si vous le souhaitez, notez le critère qui comptait dans un choix récent.',
        'Prenez les comparaisons occasionnelles comme de simples occasions d’apprendre.',
        'Faites le point régulièrement sur vos valeurs et vos progrès.',
      ],
    },
    es: {
      icon: '🧭',
      title: 'Criterios propios',
      description: 'Elegiste valores más bajos en las preguntas de comparación de esta actividad. Esto no demuestra criterios personales firmes ni inmunidad a los juicios ajenos.',
      tips: [
        'Si quieres, anota qué criterio importaba en una elección reciente.',
        'Toma las comparaciones ocasionales como simples ocasiones de aprender.',
        'Revisa con regularidad tus valores y tus avances.',
      ],
    },
  },
  mild: {
    ko: {
      icon: '🙂',
      title: '가벼운 비교형',
      description: '이번 응답 평균은 자체 분류의 낮은 중간 범위였어요. 대부분 사람과 같은 수준이라는 뜻은 아니며 두 축은 따로 살펴볼 수 있어요.',
      tips: [
        '비교가 시작되면 "내 기준은 무엇인가" 자문하세요.',
        '비교한 대상과 그 뒤에 떠오른 생각을 따로 적어 보세요.',
        'SNS 피드는 편집된 하이라이트임을 떠올리세요.',
      ],
    },
    en: {
      icon: '🙂',
      title: 'Mild Comparer',
      description: 'Your response average fell in this activity’s lower intermediate range. It does not mean you match most people; the two dimensions can be considered separately.',
      tips: [
        'When comparison starts, ask "what is my own standard?"',
        'Note the person you compared with and the thought that followed separately.',
        'Remember that feeds are edited highlight reels.',
      ],
    },
    ja: {
      icon: '🙂',
      title: '軽い比較型',
      description: '今回の平均は独自の分類の低めの中間範囲でした。多くの人と同じ程度という意味ではなく、2つの側面を別々に見られます。',
      tips: [
        '比較が始まったら「自分の基準は何か」と自問しましょう。',
        '比較した相手と、その後に浮かんだ考えを分けて書いてみましょう。',
        'SNSのフィードは編集されたハイライトだと思い出しましょう。',
      ],
    },
    zh: {
      icon: '🙂',
      title: '轻度比较型',
      description: '本次回答平均分处于自定分类中较低的中间范围。不代表与大多数人相同，两个维度可以分别查看。',
      tips: [
        '比较一开始，就问自己「我的标准是什么」。',
        '可以分别记下比较的对象和之后出现的想法。',
        '提醒自己：社交媒体上的动态是剪过的精华。',
      ],
    },
    fr: {
      icon: '🙂',
      title: 'Comparaison légère',
      description: 'La moyenne de vos réponses se situait dans la plage intermédiaire basse de cette activité. Cela ne signifie pas que vous correspondez à la plupart des gens ; les deux dimensions peuvent être examinées séparément.',
      tips: [
        'Dès que la comparaison commence, demandez-vous : « quel est mon critère ? ».',
        'Notez séparément la personne de référence et la pensée qui a suivi.',
        'Rappelez-vous qu’un fil d’actualité est un montage de moments choisis.',
      ],
    },
    es: {
      icon: '🙂',
      title: 'Comparación leve',
      description: 'La media de tus respuestas quedó en el intervalo intermedio bajo de esta actividad. No significa que coincidas con la mayoría; puedes mirar las dos dimensiones por separado.',
      tips: [
        'En cuanto empieza la comparación, pregúntate «¿cuál es mi criterio?».',
        'Anota por separado la persona con la que te comparaste y el pensamiento posterior.',
        'Recuerda que un feed es un montaje de momentos escogidos.',
      ],
    },
  },
  sensitive: {
    ko: {
      icon: '⚖️',
      title: '비교 민감형',
      description: '이번 응답 평균은 자체 분류의 높은 중간 범위였어요. 자존감이나 기분에 어떤 영향을 받는지 측정한 결과는 아니에요.',
      tips: [
        '비교가 잦은 계정·환경을 정리하거나 음소거하세요.',
        '"어제의 나"와 비교하는 자기 기준 비교로 전환하세요.',
        '비교 직후 떠오르는 감정에 이름을 붙여 거리를 두세요.',
      ],
    },
    en: {
      icon: '⚖️',
      title: 'Comparison-Sensitive',
      description: 'Your response average fell in this activity’s upper intermediate range. It does not measure effects on your self-esteem or mood.',
      tips: [
        'Clean up or mute accounts and environments that trigger comparison.',
        'Shift to self-referenced comparison with "yesterday\'s you."',
        'Name the feelings that arise right after comparing to create distance.',
      ],
    },
    ja: {
      icon: '⚖️',
      title: '比較敏感型',
      description: '今回の平均は独自の分類の高めの中間範囲でした。自尊心や気分への影響を測定した結果ではありません。',
      tips: [
        '比較を誘発するアカウントや環境を整理・ミュートしましょう。',
        '「昨日の自分」と比べる自己基準比較に切り替えましょう。',
        '比較直後に湧く感情に名前をつけて距離を取りましょう。',
      ],
    },
    zh: {
      icon: '⚖️',
      title: '比较敏感型',
      description: '本次回答平均分处于自定分类中较高的中间范围。这不是对自尊或情绪影响的测量。',
      tips: [
        '把容易引起比较的账号或环境整理掉，或静音。',
        '把比较的对象换成「昨天的自己」。',
        '比较刚过去时，给冒出来的情绪取个名字，拉开一点距离。',
      ],
    },
    fr: {
      icon: '⚖️',
      title: 'Sensible à la comparaison',
      description: 'La moyenne de vos réponses se situait dans la plage intermédiaire haute de cette activité. Elle ne mesure pas les effets sur votre estime de vous ou votre humeur.',
      tips: [
        'Faites le tri ou mettez en sourdine les comptes et les contextes qui nourrissent la comparaison.',
        'Déplacez la comparaison vers « moi d’hier ».',
        'Juste après une comparaison, nommez l’émotion qui monte pour prendre de la distance.',
      ],
    },
    es: {
      icon: '⚖️',
      title: 'Sensible a la comparación',
      description: 'La media de tus respuestas quedó en el intervalo intermedio alto de esta actividad. No mide efectos en tu autoestima ni en tu ánimo.',
      tips: [
        'Limpia o silencia las cuentas y los contextos que alimentan la comparación.',
        'Cambia la comparación hacia «el yo de ayer».',
        'Justo después de compararte, ponle nombre a la emoción para tomar distancia.',
      ],
    },
  },
  intense: {
    ko: {
      icon: '🔁',
      title: '비교 과민형',
      description: '이번 응답 평균은 자체 분류의 가장 높은 범위였어요. 유형명은 응답 요약일 뿐 자존감 손상이나 정신건강 문제를 확인한 진단이 아니에요.',
      tips: [
        '하루 일정 시간 SNS·비교 자극을 차단해 보세요.',
        '나의 가치를 성취가 아닌 존재 자체에서 찾는 연습을 하세요.',
        '비교가 고통이 될 정도라면 상담 등 도움을 고려하세요.',
      ],
    },
    en: {
      icon: '🔁',
      title: 'Comparison-Overwhelmed',
      description: 'Your response average fell in this activity’s highest range. The type name summarizes responses, not a diagnosis of damaged self-esteem or a mental health problem.',
      tips: [
        'Block social media and comparison triggers for set hours each day.',
        'Practice finding your worth in your being, not in achievements.',
        'If comparison becomes painful, consider help such as counseling.',
      ],
    },
    ja: {
      icon: '🔁',
      title: '比較過敏型',
      description: '今回の平均は独自の分類の最も高い範囲でした。タイプ名は回答の要約で、自尊心の傷つきや精神的健康の問題を確認する診断ではありません。',
      tips: [
        '一日の一定時間、SNSや比較刺激を遮断してみましょう。',
        '自分の価値を成果ではなく存在そのものに見出す練習をしましょう。',
        '比較が苦痛になるほどならカウンセリングなど助けを検討しましょう。',
      ],
    },
    zh: {
      icon: '🔁',
      title: '强烈比较型',
      description: '本次回答平均分处于自定分类的最高范围。类型名称只是回答摘要，不是对自尊损害或心理健康问题的诊断。',
      tips: [
        '每天留一段时间，把社交媒体和会引起比较的刺激断掉。',
        '练习把自己的价值放在「存在」上，而不是成绩上。',
        '如果比较已经到了痛苦的程度，考虑咨询等协助。',
      ],
    },
    fr: {
      icon: '🔁',
      title: 'Comparaison intense',
      description: 'La moyenne de vos réponses se situait dans la plage la plus élevée de cette activité. Le nom du type résume les réponses, sans diagnostiquer une estime de vous endommagée ou un problème de santé mentale.',
      tips: [
        'Réservez chaque jour un temps sans réseaux ni stimulus de comparaison.',
        'Entraînez-vous à situer votre valeur dans le fait d’être, plutôt que dans les résultats.',
        'Si la comparaison devient douloureuse, envisagez un accompagnement.',
      ],
    },
    es: {
      icon: '🔁',
      title: 'Comparación intensa',
      description: 'La media de tus respuestas quedó en el intervalo más alto de esta actividad. El nombre resume respuestas, no diagnostica daños en la autoestima ni problemas de salud mental.',
      tips: [
        'Reserva cada día un rato sin redes ni estímulos de comparación.',
        'Practica situar tu valor en el hecho de ser, más que en los logros.',
        'Si la comparación se vuelve dolorosa, valora acompañamiento.',
      ],
    },
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'a1', subscale: 'ability', reverse: false, text: '내가 일을 얼마나 잘하는지 남과 비교해 판단한다' },
    { id: 'a2', subscale: 'ability', reverse: false, text: '다른 사람의 성취를 보면 내 수준을 가늠하게 된다' },
    { id: 'a3', subscale: 'ability', reverse: false, text: 'SNS에서 남의 삶을 보며 내 처지와 비교한다' },
    { id: 'a4', subscale: 'ability', reverse: false, text: '나와 비슷한 사람이 나보다 잘되면 신경이 쓰인다' },
    { id: 'a5', subscale: 'ability', reverse: false, text: '내 외모나 능력을 자주 남과 견주어 본다' },
    { id: 'a6', subscale: 'ability', reverse: false, text: '주변 사람들의 성공이 나를 초조하게 만들 때가 있다' },
    { id: 'a7', subscale: 'ability', reverse: false, text: '남들이 나를 어떻게 평가하는지 자주 궁금하다' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: '무엇을 생각해야 할지 남들의 의견을 살펴 정한다' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: '결정을 내리기 전에 다른 사람은 어떻게 하는지 본다' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: '내 생각이 맞는지 남과 비교해 확인하려 한다' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: '유행이나 다수의 선택을 따르는 편이다' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: '내 감정이나 반응이 "정상"인지 남과 견주어 본다' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: '중요한 일은 주변 사람의 반응을 보고 판단한다' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: '다른 사람의 평가에 따라 내 생각이 자주 바뀐다' },
  ],
  en: [
    { id: 'a1', subscale: 'ability', reverse: false, text: 'I judge how well I am doing by comparing with others' },
    { id: 'a2', subscale: 'ability', reverse: false, text: "Seeing others' achievements makes me gauge my own level" },
    { id: 'a3', subscale: 'ability', reverse: false, text: "I compare my situation with others' lives on social media" },
    { id: 'a4', subscale: 'ability', reverse: false, text: 'It bothers me when someone similar to me does better than I do' },
    { id: 'a5', subscale: 'ability', reverse: false, text: 'I often compare my looks or abilities with others' },
    { id: 'a6', subscale: 'ability', reverse: false, text: "Other people's successes sometimes make me anxious" },
    { id: 'a7', subscale: 'ability', reverse: false, text: 'I often wonder how others evaluate me' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: "I decide what to think by looking at other people's opinions" },
    { id: 'o2', subscale: 'opinion', reverse: false, text: 'Before making a decision, I look at how others do it' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: 'I try to confirm whether my thinking is right by comparing with others' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: 'I tend to follow trends or the choices of the majority' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: 'I measure against others whether my feelings or reactions are "normal"' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: "I judge important matters by watching the reactions of people around me" },
    { id: 'o7', subscale: 'opinion', reverse: false, text: "My thinking often changes based on others' evaluations" },
  ],
  ja: [
    { id: 'a1', subscale: 'ability', reverse: false, text: '自分がどれだけうまくやれているかを他人と比較して判断する' },
    { id: 'a2', subscale: 'ability', reverse: false, text: '他人の成果を見ると自分のレベルを測ってしまう' },
    { id: 'a3', subscale: 'ability', reverse: false, text: 'SNSで他人の生活を見て自分の状況と比較する' },
    { id: 'a4', subscale: 'ability', reverse: false, text: '自分に似た人が自分より成功すると気になる' },
    { id: 'a5', subscale: 'ability', reverse: false, text: '自分の外見や能力をよく他人と比べてみる' },
    { id: 'a6', subscale: 'ability', reverse: false, text: '周りの人の成功が自分を焦らせることがある' },
    { id: 'a7', subscale: 'ability', reverse: false, text: '他人が自分をどう評価するかよく気になる' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: '何を考えるべきか他人の意見を見て決める' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: '決断を下す前に他の人はどうするか見る' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: '自分の考えが正しいか他人と比較して確認しようとする' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: '流行や多数の選択に従う方だ' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: '自分の感情や反応が「普通」か他人と比べてみる' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: '重要なことは周りの人の反応を見て判断する' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: '他人の評価によって自分の考えがよく変わる' },
  ],
  zh: [
    { id: 'a1', subscale: 'ability', reverse: false, text: '我会拿别人来衡量自己做得好不好' },
    { id: 'a2', subscale: 'ability', reverse: false, text: '看到别人的成绩，我就会估量自己的水平' },
    { id: 'a3', subscale: 'ability', reverse: false, text: '在社交媒体上看别人的生活时，我会跟自己的处境比' },
    { id: 'a4', subscale: 'ability', reverse: false, text: '跟我差不多的人过得比我好时，我会在意' },
    { id: 'a5', subscale: 'ability', reverse: false, text: '我常拿自己的外表或能力去跟别人比' },
    { id: 'a6', subscale: 'ability', reverse: false, text: '身边的人有成就时，我有时会着急' },
    { id: 'a7', subscale: 'ability', reverse: false, text: '我常好奇别人怎么评价我' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: '该怎么想这件事，我会看看别人的意见再定' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: '做决定前，我会看看别人是怎么做的' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: '我会拿别人来对照，确认自己的想法对不对' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: '我偏向跟着流行或多数人的选择' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: '我的情绪或反应是不是「正常」，我会拿别人来比' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: '重要的事，我会看周围人的反应再判断' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: '别人的评价常常会改变我的想法' },
  ],
  fr: [
    { id: 'a1', subscale: 'ability', reverse: false, text: 'Je juge si je m’en sors bien en me comparant aux autres' },
    { id: 'a2', subscale: 'ability', reverse: false, text: 'En voyant les réussites des autres, je mesure où j’en suis' },
    { id: 'a3', subscale: 'ability', reverse: false, text: 'Sur les réseaux, je compare ma situation à la vie des autres' },
    { id: 'a4', subscale: 'ability', reverse: false, text: 'Quand quelqu’un qui me ressemble réussit mieux, cela me travaille' },
    { id: 'a5', subscale: 'ability', reverse: false, text: 'Je compare souvent mon apparence ou mes capacités à celles des autres' },
    { id: 'a6', subscale: 'ability', reverse: false, text: 'La réussite de mon entourage me met parfois sous pression' },
    { id: 'a7', subscale: 'ability', reverse: false, text: 'Je me demande souvent comment les autres me jugent' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: 'Pour savoir quoi penser, je regarde l’avis des autres' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: 'Avant de décider, je regarde comment font les autres' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: 'Je compare pour vérifier si ma façon de voir est juste' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: 'J’ai tendance à suivre la mode ou le choix du plus grand nombre' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: 'Je compare pour savoir si mes émotions ou mes réactions sont « normales »' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: 'Pour les choses importantes, je juge d’après la réaction de mon entourage' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: 'L’avis des autres change souvent ma façon de voir' },
  ],
  es: [
    { id: 'a1', subscale: 'ability', reverse: false, text: 'Juzgo lo bien que lo hago comparándome con otros' },
    { id: 'a2', subscale: 'ability', reverse: false, text: 'Al ver los logros ajenos, calculo en qué punto estoy' },
    { id: 'a3', subscale: 'ability', reverse: false, text: 'En redes comparo mi situación con la vida de los demás' },
    { id: 'a4', subscale: 'ability', reverse: false, text: 'Cuando a alguien parecido a mí le va mejor, me afecta' },
    { id: 'a5', subscale: 'ability', reverse: false, text: 'Comparo a menudo mi aspecto o mis capacidades con los de otros' },
    { id: 'a6', subscale: 'ability', reverse: false, text: 'El éxito de quienes me rodean a veces me mete prisa' },
    { id: 'a7', subscale: 'ability', reverse: false, text: 'Me pregunto a menudo cómo me juzgan los demás' },
    { id: 'o1', subscale: 'opinion', reverse: false, text: 'Para saber qué pensar, miro la opinión de otros' },
    { id: 'o2', subscale: 'opinion', reverse: false, text: 'Antes de decidir, miro cómo lo hacen los demás' },
    { id: 'o3', subscale: 'opinion', reverse: false, text: 'Comparo para comprobar si mi forma de ver es acertada' },
    { id: 'o4', subscale: 'opinion', reverse: false, text: 'Tiendo a seguir la moda o lo que elige la mayoría' },
    { id: 'o5', subscale: 'opinion', reverse: false, text: 'Comparo para saber si mis emociones o reacciones son «normales»' },
    { id: 'o6', subscale: 'opinion', reverse: false, text: 'En lo importante, juzgo por la reacción de quienes me rodean' },
    { id: 'o7', subscale: 'opinion', reverse: false, text: 'La opinión ajena cambia a menudo mi forma de ver' },
  ],
}

// 2026-10-08: these existing editorial cutoffs summarize this activity's answers.
// Preserve saved-result behavior; neither these cutoffs nor bars are INCOM norms.
function calcLevel(score: number): CompLevel {
  if (score <= 2.3) return 'self'
  if (score <= 3.2) return 'mild'
  if (score <= 4.0) return 'sensitive'
  return 'intense'
}

function adjustScore(raw: number, reverse: boolean): number {
  return reverse ? 6 - raw : raw
}

interface Props { locale?: string }

export default function SocialComparisonTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp ?? 'ko')
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  useRecordFinishedTest({ testId: "social-comparison", title: "SocialComparisonTest", finished: Boolean(done) });

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
    const aItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'ability')
    const oItems = questions.map((q, i) => ({ sub: q.subscale, adj: adjusted[i] })).filter(x => x.sub === 'opinion')
    const aScore = aItems.reduce((s, x) => s + x.adj, 0) / aItems.length
    const oScore = oItems.reduce((s, x) => s + x.adj, 0) / oItems.length
    const overall = (aScore + oScore) / 2
    return { aScore, oScore, overall }
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

  const { aScore, oScore, overall } = calcScores(answers)
  const level = calcLevel(overall)
  const ld = LEVEL_DATA[level][l]
  const overallPct = Math.round(((overall - 1) / 4) * 100)
  const aPct = Math.round(((aScore - 1) / 4) * 100)
  const oPct = Math.round(((oScore - 1) / 4) * 100)

  const levelColors: Record<CompLevel, string> = {
    self: '#10b981',
    mild: '#0ea5e9',
    sensitive: '#f59e0b',
    intense: '#ef4444',
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
            <span className="font-bold text-muted-foreground">{lb.abilityLabel}</span>
            <span className="font-bold" style={{ color }}>{aScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={aPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.abilityLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${aPct}%`, backgroundColor: color }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground">{lb.opinionLabel}</span>
            <span className="font-bold" style={{ color }}>{oScore.toFixed(1)} {lb.outOf}</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={oPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={lb.opinionLabel}
          >
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${oPct}%`, backgroundColor: color }} />
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
