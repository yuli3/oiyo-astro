export type IntrovertLocale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
export type IntrovertBand = 'deep_introvert' | 'introvert' | 'ambivert' | 'extrovert' | 'deep_extrovert';

// These editorial bands describe this questionnaire's answers, not population norms or ability (2026-10-09).
export const introvertResultCopy: Record<IntrovertLocale, {
  bands: Record<IntrovertBand, { label: string; description: string }>;
  note: string;
  sharedNote: string;
  sharedTitle: string;
  reflectionTitle: string;
  prompts: string[];
  articleLink: string;
  scoreLabel: string;
  low: string;
  high: string;
  metaDescription: string;
}> = {
  ko: {
    bands: {
      deep_introvert: { label: '내향 쪽 · 낮은 합계', description: '이 12문항에 낮은 동의를 보여 내향 쪽의 낮은 합계 범위에 들어갔어요. 점수 범위의 차이는 응답 정도의 차이이지 능력의 차이가 아니에요.' },
      introvert: { label: '내향 쪽', description: '이 12문항의 합계가 편집부가 정한 내향 쪽 범위에 들어갔어요. 상황에 따른 경험을 함께 살펴보세요.' },
      ambivert: { label: '중간 범위', description: '이 12문항의 합계가 중간 범위에 들어갔어요. 별도의 성격 유형이나 인구에서의 위치를 확정하는 뜻은 아니에요.' },
      extrovert: { label: '외향 쪽', description: '이 12문항의 합계가 편집부가 정한 외향 쪽 범위에 들어갔어요. 상황에 따른 경험을 함께 살펴보세요.' },
      deep_extrovert: { label: '외향 쪽 · 높은 합계', description: '이 12문항에서는 외향 쪽으로 분류한 답변에 더 강하게 동의했어요. 점수 범위의 차이는 응답 정도의 차이이지 능력의 차이가 아니에요.' },
    },
    note: 'OIYO에서 제공하는 12문항의 값을 단순 합산한 0~48점과 편집부가 정한 다섯 범위예요. 인구 백분위나 표준화된 진단이 아니며, 재능·직업 적합성·뇌의 작동 방식·회복 방법을 측정하지 않아요.',
    sharedTitle: '공유된 결과',
    sharedNote: '링크로 전달받은 결과예요. 이 방문자의 답변을 추정할 수 없으며, 검증된 응답 기록도 아니에요.',
    reflectionTitle: '실제 경험과 함께 돌아봐요',
    prompts: ['최근 편안했던 모임과 부담스러웠던 모임은 시간·소음·역할이 어떻게 달랐나요?', '회의에서 말하기, 미리 글로 정리하기 등 어떤 방식으로 참여했을 때 의견을 전달하기 좋았나요?', '휴식 시간이나 방식을 조금 바꿔보면 실제 기분과 피로는 어떻게 달라지나요?'],
    articleLink: '내향·외향 연구의 근거와 한계 읽기', scoreLabel: '12문항 합계', low: '내향 쪽 응답', high: '외향 쪽 응답',
    metaDescription: 'OIYO에서 제공하는 12문항으로 현재 답변의 내향·외향 경향을 돌아봐요. 단순 합계의 의미와 한계를 확인하고 실제 경험과 비교해보세요. 표준화된 진단은 아니에요.',
  },
  en: {
    bands: {
      deep_introvert: { label: 'Introversion side · lower total', description: 'Lower agreement across these 12 questions places the total in the lower, introversion-leaning band. The score bands reflect degrees of response, not differences in ability.' },
      introvert: { label: 'Introversion side', description: 'Your total on these 12 questions falls in the editorial introversion-leaning band. Consider how your experiences vary by situation.' },
      ambivert: { label: 'Middle band', description: 'Your total on these 12 questions falls in the middle band. This does not establish a separate personality type or your position in the population.' },
      extrovert: { label: 'Extraversion side', description: 'Your total on these 12 questions falls in the editorial extraversion-leaning band. Consider how your experiences vary by situation.' },
      deep_extrovert: { label: 'Extraversion side · higher total', description: 'Across these 12 questions, you agreed more strongly with responses grouped toward extraversion. The score bands reflect degrees of response, not differences in ability.' },
    },
    note: 'This is a simple total of 0–48 from 12 questions provided by OIYO, divided into five editorial bands. It is not a population percentile or a standardized diagnostic assessment, and does not measure talent, career suitability, brain function, or how you recover.',
    sharedTitle: 'Shared result',
    sharedNote: 'This result was passed through a link. It does not reveal this visitor’s answers and is not a verified response record.',
    reflectionTitle: 'Reflect on your actual experiences',
    prompts: ['How did the timing, noise, or your role differ between a recent comfortable gathering and a demanding one?', 'Which way of contributing to a meeting helped you express your ideas: speaking, preparing notes beforehand, or something else?', 'If you make a small change to when or how you rest, what actually happens to your mood and tiredness?'],
    articleLink: 'Read the evidence and limits of introversion and extraversion research', scoreLabel: '12-question total', low: 'Introversion-leaning responses', high: 'Extraversion-leaning responses',
    metaDescription: 'Reflect on your current introversion and extraversion responses with 12 questions provided by OIYO. Explore what the simple total does and does not mean, and compare it with real experiences. Not a standardized diagnosis.',
  },
  ja: {
    bands: {
      deep_introvert: { label: '内向寄り・低い合計', description: 'この12問への同意の程度が低く、内向寄りの低い合計の範囲に入りました。点数帯の違いは回答の程度の違いであり、能力の差ではありません。' },
      introvert: { label: '内向寄り', description: 'この12問の合計が、編集部の定めた内向寄りの範囲に入りました。状況によって経験がどう変わるかも振り返ってみてください。' },
      ambivert: { label: '中間の範囲', description: 'この12問の合計が中間の範囲に入りました。独立した性格タイプや、人口全体での位置を確定するものではありません。' },
      extrovert: { label: '外向寄り', description: 'この12問の合計が、編集部の定めた外向寄りの範囲に入りました。状況によって経験がどう変わるかも振り返ってみてください。' },
      deep_extrovert: { label: '外向寄り・高い合計', description: 'この12問では、外向寄りに分類した回答により強く同意していました。点数帯の違いは回答の程度の違いであり、能力の差ではありません。' },
    },
    note: 'OIYOが提供する12問を単純に合計した0〜48点と、編集部が定めた5つの範囲です。人口のパーセンタイルや標準化された診断ではなく、才能・職業適性・脳の働き・回復方法を測定するものではありません。',
    sharedTitle: '共有された結果',
    sharedNote: 'リンクで共有された結果です。この訪問者の回答は推定できず、確認済みの回答記録でもありません。',
    reflectionTitle: '実際の経験と照らし合わせましょう',
    prompts: ['最近の心地よかった集まりと負担だった集まりでは、時間・音・役割にどんな違いがありましたか？', '会議では、話す、事前に文章にまとめるなど、どんな参加方法で意見を伝えやすかったですか？', '休憩の時間や方法を少し変えると、実際の気分や疲れはどう変わりますか？'],
    articleLink: '内向性・外向性研究の根拠と限界を読む', scoreLabel: '12問の合計', low: '内向寄りの回答', high: '外向寄りの回答',
    metaDescription: 'OIYOが提供する12問で、今回の回答に表れた内向・外向の傾向を振り返ります。単純合計の意味と限界を確認し、実際の経験と比べてみましょう。標準化された診断ではありません。',
  },
  zh: {
    bands: {
      deep_introvert: { label: '偏内向·较低总分', description: '对这12道题的认同程度较低，因此总分落在偏内向的较低区间。分数区间反映的是认同程度，不是能力差异。' },
      introvert: { label: '偏内向', description: '这12道题的总分落在编辑部划定的偏内向区间。您也可以结合不同情境中的实际体验来理解。' },
      ambivert: { label: '中间区间', description: '这12道题的总分落在中间区间。这并不确定一种独立的人格类型，也不代表您在人群中的位置。' },
      extrovert: { label: '偏外向', description: '这12道题的总分落在编辑部划定的偏外向区间。您也可以结合不同情境中的实际体验来理解。' },
      deep_extrovert: { label: '偏外向·较高总分', description: '在这12道题中，您更认同被归为外向一侧的回答。分数区间反映的是认同程度，不是能力差异。' },
    },
    note: '这是OIYO提供的12道题的简单加总，范围为0～48分，并划分为编辑部设定的五个区间。它不是人群百分位，也不是标准化诊断，不测量天赋、职业适配性、大脑运作或恢复方式。',
    sharedTitle: '分享的结果',
    sharedNote: '这是通过链接传递的结果，无法据此推断当前访客的回答，也不是经过核实的答题记录。',
    reflectionTitle: '结合您的实际经历想一想',
    prompts: ['最近让您自在和感到负担的聚会，在时长、噪声或您的角色上有什么不同？', '在会议中，直接发言、提前写下想法或其他参与方式，哪种更方便您表达意见？', '如果稍微调整休息时间或方式，您的实际心情和疲劳感会怎样变化？'],
    articleLink: '阅读内向与外向研究的依据和局限', scoreLabel: '12道题总分', low: '偏内向的回答', high: '偏外向的回答',
    metaDescription: '通过OIYO提供的12道题，回顾当前回答中的内向与外向倾向。了解简单总分的含义与局限，并与实际经历对照。这不是标准化诊断。',
  },
  fr: {
    bands: {
      deep_introvert: { label: 'Côté introversion · total plus bas', description: 'Un degré d’accord plus faible avec ces 12 questions place le total dans la plage basse, à tendance introvertie. Les plages de score reflètent le degré d’accord, pas des différences de capacité.' },
      introvert: { label: 'Côté introversion', description: 'Votre total sur ces 12 questions se situe dans la plage à tendance introvertie définie par la rédaction. Pensez aussi à la façon dont vos expériences changent selon les situations.' },
      ambivert: { label: 'Plage intermédiaire', description: 'Votre total sur ces 12 questions se situe dans la plage intermédiaire. Cela ne définit ni un type de personnalité distinct ni votre position dans la population.' },
      extrovert: { label: 'Côté extraversion', description: 'Votre total sur ces 12 questions se situe dans la plage à tendance extravertie définie par la rédaction. Pensez aussi à la façon dont vos expériences changent selon les situations.' },
      deep_extrovert: { label: 'Côté extraversion · total plus élevé', description: 'Sur ces 12 questions, vous avez davantage approuvé les réponses classées du côté de l’extraversion. Les plages de score reflètent le degré d’accord, pas des différences de capacité.' },
    },
    note: 'Il s’agit d’une simple somme de 0 à 48 pour 12 questions proposées par OIYO, répartie en cinq plages éditoriales. Ce n’est ni un percentile de population ni une évaluation diagnostique standardisée. Ce résultat ne mesure pas le talent, l’aptitude professionnelle, le fonctionnement cérébral ou la manière de récupérer.',
    sharedTitle: 'Résultat partagé',
    sharedNote: 'Ce résultat a été transmis par un lien. Il ne permet pas de déduire les réponses de la personne qui visite cette page et ne constitue pas un relevé de réponses vérifié.',
    reflectionTitle: 'Revenez sur vos expériences concrètes',
    prompts: ['Quelles différences de durée, de bruit ou de rôle distinguaient une rencontre agréable d’une rencontre éprouvante récente ?', 'En réunion, quelle façon de participer vous a aidé à exprimer vos idées : prendre la parole, préparer des notes ou autre chose ?', 'Si vous modifiez légèrement le moment ou la manière de vous reposer, qu’observez-vous réellement sur votre humeur et votre fatigue ?'],
    articleLink: 'Lire les données et les limites des recherches sur l’introversion et l’extraversion', scoreLabel: 'Total des 12 questions', low: 'Réponses à tendance introvertie', high: 'Réponses à tendance extravertie',
    metaDescription: 'Explorez vos réponses actuelles sur l’introversion et l’extraversion avec 12 questions proposées par OIYO. Découvrez le sens et les limites de cette simple somme et comparez-la à votre vécu. Ce n’est pas un diagnostic standardisé.',
  },
  es: {
    bands: {
      deep_introvert: { label: 'Hacia la introversión · total más bajo', description: 'Un menor grado de acuerdo con estas 12 preguntas sitúa el total en el intervalo bajo, hacia la introversión. Los intervalos reflejan el grado de respuesta, no diferencias de capacidad.' },
      introvert: { label: 'Hacia la introversión', description: 'Su total en estas 12 preguntas entra en el intervalo de tendencia introvertida definido por la redacción. Considere también cómo varían sus experiencias según la situación.' },
      ambivert: { label: 'Intervalo intermedio', description: 'Su total en estas 12 preguntas entra en el intervalo intermedio. Esto no determina un tipo de personalidad independiente ni su posición en la población.' },
      extrovert: { label: 'Hacia la extraversión', description: 'Su total en estas 12 preguntas entra en el intervalo de tendencia extravertida definido por la redacción. Considere también cómo varían sus experiencias según la situación.' },
      deep_extrovert: { label: 'Hacia la extraversión · total más alto', description: 'En estas 12 preguntas, mostró mayor acuerdo con las respuestas agrupadas hacia la extraversión. Los intervalos reflejan el grado de respuesta, no diferencias de capacidad.' },
    },
    note: 'Es una suma simple de 0 a 48 de 12 preguntas ofrecidas por OIYO, dividida en cinco intervalos editoriales. No es un percentil de población ni una evaluación diagnóstica estandarizada. No mide el talento, la idoneidad profesional, el funcionamiento cerebral ni cómo recuperarse.',
    sharedTitle: 'Resultado compartido',
    sharedNote: 'Este resultado se ha recibido mediante un enlace. No permite deducir las respuestas de quien visita la página ni constituye un registro de respuestas verificado.',
    reflectionTitle: 'Reflexione sobre sus experiencias reales',
    prompts: ['¿Qué diferencias de duración, ruido o papel personal hubo entre una reunión reciente agradable y otra exigente?', '¿Qué forma de participar en una reunión le ayudó a expresar sus ideas: hablar, preparar notas u otra opción?', 'Si cambia un poco cuándo o cómo descansa, ¿qué observa realmente en su ánimo y cansancio?'],
    articleLink: 'Leer las pruebas y los límites de la investigación sobre introversión y extraversión', scoreLabel: 'Total de las 12 preguntas', low: 'Respuestas hacia la introversión', high: 'Respuestas hacia la extraversión',
    metaDescription: 'Reflexione sobre sus respuestas actuales de introversión y extraversión con 12 preguntas ofrecidas por OIYO. Conozca el significado y los límites de la suma y compárela con experiencias reales. No es un diagnóstico estandarizado.',
  },
};
