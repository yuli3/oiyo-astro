import type { Locale } from '../i18n';

export type TestBridgeTopic =
  | 'mbti'
  | 'enneagram'
  | 'big5'
  | 'attachment'
  | 'lazy-perfectionist'
  | 'lethargy'
  | 'habit-builder'
  | 'burnout';

export interface TestBridgeContent {
  introTitle: string;
  introBody: string;
  howTitle: string;
  howItems: string[];
  note: string;
}

interface TestBridgeEntry {
  content: Record<Locale, TestBridgeContent>;
}

const bridges: Record<TestBridgeTopic, TestBridgeEntry> = {
  mbti: {
    content: {
      ko: {
        introTitle: '직업 선택을 위한 MBTI 성향 테스트',
        introBody: '이 페이지는 긴 MBTI 해설 글이 아니라, 실제 업무 장면에서 내가 어떤 방식으로 판단하고 협업하는지 빠르게 확인하는 실행형 테스트입니다. 결과는 직업을 단정하기보다 나에게 편한 업무 환경과 에너지 사용 방식을 이해하는 참고 자료로 활용해 주세요.',
        howTitle: '이렇게 활용해 보세요',
        howItems: [
          '현재 직무가 나와 맞지 않는다고 느낄 때, 어떤 지점에서 에너지가 소모되는지 확인합니다.',
          '추천 직업 목록은 정답이 아니라 탐색 후보로 보고, 흥미·역량·현실 조건과 함께 비교합니다.',
          '결과를 읽은 뒤에는 Big Five나 에니어그램 테스트로 다른 관점의 자기이해를 보완합니다.',
        ],
        note: 'OIYO의 MBTI 기반 테스트는 자기이해와 진로 탐색을 위한 참고 도구이며, 공식 MBTI 진단이나 심리 평가를 대체하지 않습니다.',
      },
      en: {
        introTitle: 'A work-focused MBTI-style preference test',
        introBody: 'This page is an interactive test, not a long MBTI article. It helps you notice how you make decisions, collaborate, and spend energy in work situations. Treat the result as a starting point for reflection, not a fixed career verdict.',
        howTitle: 'How to use your result',
        howItems: [
          'Notice which work situations drain or energize you.',
          'Use recommended careers as exploration prompts, then compare them with your interests, skills, and constraints.',
          'Pair the result with Big Five or Enneagram tests for a broader self-understanding.',
        ],
        note: 'This MBTI-style test is for self-reflection and career exploration. It is not an official MBTI assessment or a clinical evaluation.',
      },
      ja: {
        introTitle: '仕事選びのためのMBTI傾向テスト',
        introBody: 'このページは長いMBTI解説記事ではなく、職場での判断や協働の傾向をすばやく確認するための実行型テストです。結果は職業を決めつけるものではなく、働きやすい環境を考える手がかりとしてお使いください。',
        howTitle: '結果の使い方',
        howItems: [
          '今の仕事で疲れやすい場面や力を発揮しやすい場面を見つけます。',
          'おすすめ職業は正解ではなく、検討候補として興味や能力、現実条件と照らし合わせます。',
          'Big Fiveやエニアグラムも合わせて受けると、別の角度から自分を見直せます。',
        ],
        note: 'このMBTI傾向テストは自己理解と進路探索のための参考ツールであり、公式診断や臨床的評価ではありません。',
      },
      zh: {
        introTitle: '用于职业探索的 MBTI 倾向测试',
        introBody: '这个页面是一个可直接使用的测试，而不是长篇 MBTI 文章。它帮助你快速观察自己在工作情境中的判断方式、协作方式和精力消耗模式。结果适合作为自我理解的起点，而不是固定的职业结论。',
        howTitle: '如何使用结果',
        howItems: [
          '看看哪些工作情境会让你消耗精力，哪些情境会让你更有动力。',
          '把推荐职业当作探索候选，而不是唯一答案。',
          '再结合 Big Five 或九型人格测试，从不同角度理解自己。',
        ],
        note: '本测试用于自我理解和职业探索，并非官方 MBTI 测评，也不能替代专业心理评估。',
      },
      fr: {
        introTitle: 'Un test de préférences MBTI orienté travail',
        introBody: 'Cette page est un test interactif, pas un long article sur le MBTI. Elle vous aide à observer votre manière de décider, de collaborer et d’utiliser votre énergie au travail.',
        howTitle: 'Comment utiliser le résultat',
        howItems: [
          'Repérez les situations professionnelles qui vous fatiguent ou vous donnent de l’élan.',
          'Considérez les métiers suggérés comme des pistes, pas comme une réponse définitive.',
          'Complétez avec Big Five ou Ennéagramme pour une lecture plus large.',
        ],
        note: 'Ce test inspiré du MBTI sert à la réflexion personnelle et à l’exploration professionnelle. Il ne remplace pas une évaluation officielle ou clinique.',
      },
      es: {
        introTitle: 'Un test de preferencias MBTI enfocado en el trabajo',
        introBody: 'Esta página es una prueba interactiva, no un artículo largo sobre MBTI. Te ayuda a observar cómo decides, colaboras y usas tu energía en situaciones laborales.',
        howTitle: 'Cómo usar tu resultado',
        howItems: [
          'Detecta qué situaciones laborales te agotan o te activan.',
          'Toma las carreras sugeridas como pistas de exploración, no como una respuesta cerrada.',
          'Combina el resultado con Big Five o Eneagrama para ampliar la mirada.',
        ],
        note: 'Esta prueba inspirada en MBTI es para autoconocimiento y exploración profesional. No sustituye una evaluación oficial ni clínica.',
      },
    },
  },
  enneagram: {
    content: {
      ko: {
        introTitle: '핵심 동기를 살피는 에니어그램 테스트',
        introBody: '에니어그램은 겉으로 드러나는 성격보다 내가 무엇을 원하고 무엇을 피하려 하는지 살피는 데 유용합니다. 이 페이지에서는 긴 이론 설명보다 테스트 실행과 결과 해석에 필요한 핵심만 제공합니다.',
        howTitle: '결과를 읽는 방법',
        howItems: [
          '가장 높은 유형 하나만 보지 말고, 비슷하게 높은 유형의 공통 동기를 함께 살펴봅니다.',
          '스트레스를 받을 때 반복되는 방어 방식과 회복될 때 자연스러워지는 태도를 구분합니다.',
          '유형 설명이 불편하게 느껴진다면 틀렸다는 뜻보다 아직 맥락이 더 필요하다는 신호일 수 있습니다.',
        ],
        note: '에니어그램 결과는 자기성찰을 돕는 참고 자료입니다. 사람을 고정된 유형으로 판단하는 용도로 사용하지 마세요.',
      },
      en: {
        introTitle: 'An Enneagram test for core motivations',
        introBody: 'The Enneagram is useful when you want to look beneath habits and notice what you seek, avoid, and protect. This page keeps the focus on taking the test and reading your result with care.',
        howTitle: 'How to read your result',
        howItems: [
          'Look at nearby high scores, not only the top type.',
          'Separate stress patterns from the steadier qualities that appear when you feel safe.',
          'If a description feels uncomfortable, treat it as a prompt for context, not a final label.',
        ],
        note: 'Enneagram results are for reflection. They should not be used to box yourself or other people into fixed categories.',
      },
      ja: {
        introTitle: '核心的な動機を見るエニアグラムテスト',
        introBody: 'エニアグラムは表面的な性格だけでなく、何を求め、何を避けようとしているのかを見つめる助けになります。このページでは理論の長い説明より、テストと結果の読み方に集中します。',
        howTitle: '結果の読み方',
        howItems: [
          '最も高いタイプだけでなく、近い点数のタイプも一緒に見ます。',
          'ストレス時の反応と、安心している時に出る自然な強みを分けて考えます。',
          '説明に違和感がある場合は、決めつけではなく追加の文脈として受け止めます。',
        ],
        note: 'エニアグラム結果は自己理解のための参考です。人を固定したタイプとして判断するためのものではありません。',
      },
      zh: {
        introTitle: '观察核心动机的九型人格测试',
        introBody: '九型人格适合帮助你观察自己真正追求什么、回避什么，以及压力下会保护什么。这个页面重点放在测试和结果解读，而不是长篇理论。',
        howTitle: '如何阅读结果',
        howItems: [
          '不要只看最高类型，也看看分数接近的类型有什么共同动机。',
          '区分压力下的防御反应和状态稳定时自然出现的力量。',
          '如果某段描述让你不舒服，可以把它当作进一步理解的线索。',
        ],
        note: '九型人格结果适合自我反思，不应用来把自己或他人固定在某个标签里。',
      },
      fr: {
        introTitle: 'Un test Ennéagramme pour observer vos motivations',
        introBody: 'L’Ennéagramme aide à regarder ce que vous recherchez, évitez et protégez, au-delà des habitudes visibles. Cette page reste centrée sur le test et une lecture prudente du résultat.',
        howTitle: 'Comment lire le résultat',
        howItems: [
          'Regardez aussi les scores proches, pas seulement le type principal.',
          'Distinguez les réactions de stress des qualités qui apparaissent quand vous vous sentez en sécurité.',
          'Si une description vous dérange, prenez-la comme une piste de contexte, pas comme une étiquette définitive.',
        ],
        note: 'Le résultat Ennéagramme sert à la réflexion personnelle. Il ne doit pas enfermer une personne dans une catégorie fixe.',
      },
      es: {
        introTitle: 'Un test de Eneagrama para mirar tus motivaciones',
        introBody: 'El Eneagrama ayuda a mirar qué buscas, qué evitas y qué proteges más allá de los hábitos visibles. Esta página se centra en hacer la prueba y leer el resultado con cuidado.',
        howTitle: 'Cómo leer el resultado',
        howItems: [
          'Observa también las puntuaciones cercanas, no solo el tipo principal.',
          'Distingue las reacciones de estrés de las cualidades que aparecen cuando te sientes seguro.',
          'Si una descripción incomoda, úsala como una pista de contexto, no como una etiqueta final.',
        ],
        note: 'El resultado del Eneagrama es una herramienta de reflexión. No debe usarse para encasillar a una persona.',
      },
    },
  },
  big5: {
    content: {
      ko: {
        introTitle: '다섯 성격 차원을 균형 있게 보는 Big Five 테스트',
        introBody: 'Big Five는 사람을 유형으로 나누기보다 개방성, 성실성, 외향성, 친화성, 정서적 민감성의 정도를 함께 봅니다. 이 페이지는 결과를 일상과 업무 판단에 연결하기 위한 실행형 테스트입니다.',
        howTitle: '결과 활용법',
        howItems: [
          '높고 낮은 점수보다, 어떤 환경에서 그 특성이 장점 또는 부담이 되는지 살펴봅니다.',
          '직업, 관계, 공부 습관을 바꾸기 전에 가장 조정하기 쉬운 행동 하나를 고릅니다.',
          'MBTI나 에니어그램보다 덜 극적인 대신, 장기적인 행동 패턴을 차분히 읽는 데 적합합니다.',
        ],
        note: 'Big Five 결과는 자기이해를 돕는 참고 지표이며, 임상 진단이나 채용 판단을 대체하지 않습니다.',
      },
      en: {
        introTitle: 'A Big Five test for balanced trait reading',
        introBody: 'Big Five looks at dimensions rather than fixed types: Openness, Conscientiousness, Extraversion, Agreeableness, and emotional sensitivity. This test helps connect those scores to everyday choices.',
        howTitle: 'How to use your result',
        howItems: [
          'Ask where each trait becomes helpful and where it becomes costly.',
          'Choose one small behavior to adjust before making a major life or career decision.',
          'Use it for steady pattern-reading; it is quieter than typology, but often more practical.',
        ],
        note: 'Big Five results are self-understanding indicators. They are not clinical diagnoses or hiring decisions.',
      },
      ja: {
        introTitle: '5つの性格次元をバランスよく見るBig Fiveテスト',
        introBody: 'Big Fiveは人を固定タイプに分けるより、開放性・誠実性・外向性・協調性・情緒的な敏感さを次元として見ます。このページは結果を日常や仕事の判断に結びつけるためのテストです。',
        howTitle: '結果の活用法',
        howItems: [
          '点数の高低だけでなく、その特性が助けになる場面と負担になる場面を見ます。',
          '大きな進路判断の前に、まず調整しやすい行動を一つ選びます。',
          'タイプ論より静かですが、長期的な行動傾向を読むのに向いています。',
        ],
        note: 'Big Fiveの結果は自己理解の参考指標であり、臨床診断や採用判断の代わりにはなりません。',
      },
      zh: {
        introTitle: '平衡观察五个维度的 Big Five 测试',
        introBody: 'Big Five 不把人固定成类型，而是从开放性、尽责性、外向性、宜人性和情绪敏感性等维度理解你。这个测试帮助你把分数连接到日常选择。',
        howTitle: '如何使用结果',
        howItems: [
          '不要只看分数高低，也看这个特质在哪些环境中成为优势或负担。',
          '在做重大职业或关系决定前，先选择一个容易调整的小行动。',
          '它不像类型测试那么戏剧化，但适合稳定地观察长期行为模式。',
        ],
        note: 'Big Five 结果是自我理解的参考指标，并非临床诊断或招聘判断。',
      },
      fr: {
        introTitle: 'Un test Big Five pour lire vos traits avec nuance',
        introBody: 'Le Big Five observe des dimensions plutôt que des types fixes: ouverture, conscienciosité, extraversion, agréabilité et sensibilité émotionnelle. Ce test relie ces scores à des choix concrets.',
        howTitle: 'Comment utiliser le résultat',
        howItems: [
          'Repérez quand chaque trait devient une ressource et quand il devient coûteux.',
          'Avant une grande décision, choisissez un petit comportement facile à ajuster.',
          'C’est moins spectaculaire qu’une typologie, mais souvent très utile pour lire les habitudes durables.',
        ],
        note: 'Le résultat Big Five aide à mieux se comprendre. Il ne remplace ni un diagnostic clinique ni une décision de recrutement.',
      },
      es: {
        introTitle: 'Un test Big Five para leer tus rasgos con equilibrio',
        introBody: 'Big Five mira dimensiones en lugar de tipos fijos: apertura, responsabilidad, extraversión, amabilidad y sensibilidad emocional. Esta prueba conecta esas puntuaciones con decisiones cotidianas.',
        howTitle: 'Cómo usar el resultado',
        howItems: [
          'Observa cuándo cada rasgo ayuda y cuándo se vuelve costoso.',
          'Antes de una gran decisión, elige un pequeño comportamiento que puedas ajustar.',
          'Es menos dramático que una tipología, pero muy útil para leer patrones duraderos.',
        ],
        note: 'El resultado Big Five sirve para autoconocimiento. No sustituye un diagnóstico clínico ni una decisión de contratación.',
      },
    },
  },
  attachment: {
    content: {
      ko: {
        introTitle: '관계 패턴을 부드럽게 살피는 애착유형 테스트',
        introBody: '애착유형은 사랑을 잘하느냐 못하느냐의 평가가 아니라, 가까운 관계에서 내가 안전함과 거리를 어떻게 느끼는지 이해하는 언어입니다.',
        howTitle: '결과를 다루는 태도',
        howItems: [
          '결과를 상대를 탓하는 근거로 쓰기보다, 내가 반복하는 요청과 회피 방식을 먼저 살펴봅니다.',
          '안정감은 고정된 유형이 아니라 관계 안에서 조금씩 배울 수 있는 방향으로 봅니다.',
          '강한 불안이나 회피가 일상을 해친다면, 신뢰할 수 있는 전문가와 상의하는 것이 좋습니다.',
        ],
        note: '이 테스트는 관계 성찰을 위한 참고 도구입니다. 트라우마, 우울, 불안 등 전문적 도움이 필요한 문제는 전문가와 상담해 주세요.',
      },
      en: {
        introTitle: 'An attachment style test for gentler relationship insight',
        introBody: 'Attachment style is not a score for whether you love well. It is language for understanding how closeness, distance, and safety feel in important relationships.',
        howTitle: 'How to hold the result',
        howItems: [
          'Use the result to notice your own requests and withdrawals before blaming a partner.',
          'See security as a learnable direction, not a fixed attachment category.',
          'If anxiety or avoidance is harming daily life, consider speaking with a trusted professional.',
        ],
        note: 'This test supports relationship reflection. For trauma, depression, anxiety, or safety concerns, please seek professional help.',
      },
      ja: {
        introTitle: '関係パターンをやさしく見る愛着スタイルテスト',
        introBody: '愛着スタイルは愛し方の良し悪しを決めるものではなく、親密さや距離、安全感をどう感じるかを理解するための言葉です。',
        howTitle: '結果との向き合い方',
        howItems: [
          '相手を責める材料にする前に、自分の求め方や避け方を見つめます。',
          '安心感は固定された資格ではなく、関係の中で少しずつ学べる方向として考えます。',
          '不安や回避が生活を苦しくしている場合は、信頼できる専門家に相談してください。',
        ],
        note: 'このテストは関係を振り返るための参考です。トラウマ、抑うつ、不安などは専門家に相談してください。',
      },
      zh: {
        introTitle: '温和理解关系模式的依恋风格测试',
        introBody: '依恋风格不是评价一个人会不会爱，而是帮助你理解在亲密关系中如何感受安全、距离和靠近的一套语言。',
        howTitle: '如何看待结果',
        howItems: [
          '先观察自己反复提出的需求和回避方式，而不是用结果责怪对方。',
          '把安全感看作可以慢慢学习的方向，而不是某些人才拥有的资格。',
          '如果强烈焦虑或回避影响日常生活，建议寻求可信赖的专业帮助。',
        ],
        note: '本测试用于关系反思。涉及创伤、抑郁、焦虑或安全问题时，请寻求专业支持。',
      },
      fr: {
        introTitle: 'Un test d’attachement pour comprendre vos relations avec douceur',
        introBody: 'Le style d’attachement ne juge pas votre façon d’aimer. Il donne des mots pour comprendre comment proximité, distance et sécurité se vivent dans vos relations importantes.',
        howTitle: 'Comment accueillir le résultat',
        howItems: [
          'Utilisez le résultat pour observer vos demandes et vos retraits avant d’accuser l’autre.',
          'Voyez la sécurité comme une direction qui s’apprend, pas comme un statut définitif.',
          'Si l’anxiété ou l’évitement pèse sur votre vie quotidienne, parlez-en à un professionnel de confiance.',
        ],
        note: 'Ce test soutient la réflexion relationnelle. Pour trauma, dépression, anxiété ou sécurité, cherchez un accompagnement professionnel.',
      },
      es: {
        introTitle: 'Un test de apego para mirar tus relaciones con calma',
        introBody: 'El estilo de apego no juzga si amas bien o mal. Ofrece palabras para entender cómo vives la cercanía, la distancia y la seguridad en relaciones importantes.',
        howTitle: 'Cómo recibir el resultado',
        howItems: [
          'Úsalo para observar tus peticiones y retiradas antes de culpar a la otra persona.',
          'Mira la seguridad como una dirección que se aprende, no como un estatus fijo.',
          'Si la ansiedad o la evitación afectan tu vida diaria, habla con un profesional de confianza.',
        ],
        note: 'Este test apoya la reflexión sobre relaciones. Para trauma, depresión, ansiedad o seguridad, busca ayuda profesional.',
      },
    },
  },
  'lazy-perfectionist': {
    content: {
      ko: {
        introTitle: '미루는 이유를 성격이 아니라 시작 장벽으로 봐요',
        introBody: '게으른 완벽주의자 테스트는 지금 나를 멈추게 하는 미루기 패턴을 바로 점검하는 페이지예요. 결과는 고칠 성격이 아니라, 오늘 넘어야 할 시작 장벽 하나를 알려 줘요.',
        howTitle: '결과를 다루는 방법',
        howItems: [
          '가장 높은 유형을 성격 낙인이 아니라 오늘의 시작 장벽으로 읽습니다.',
          '결과 화면에서 제안하는 첫 행동을 10분 이하로 줄여 즉시 실행합니다.',
          '같은 유형이 반복되면 며칠 뒤 다시 해 보고, 어느 상황에서 장벽이 커지는지 비교해요.',
        ],
        note: '이 페이지는 자기점검 도구입니다. 장기적인 우울, 불안, 수면 문제, 일상 기능 저하가 지속되면 전문적인 도움을 함께 고려하세요.',
      },
      en: {
        introTitle: 'Read procrastination as a starting barrier, not a flaw',
        introBody: 'The lazy perfectionist test checks the delay pattern that is stopping you right now. The result is not a trait to fix but the one starting barrier to get past today.',
        howTitle: 'How to use the result',
        howItems: [
          'Read the top pattern as today’s starting barrier, not a fixed identity.',
          'Shrink the suggested action to ten minutes or less and do it before overplanning.',
          'If the same pattern keeps coming back, retake it in a few days and compare when the barrier grows.',
        ],
        note: 'This is a self-check tool. If depression, anxiety, sleep disruption, or impaired daily functioning persists, consider professional support.',
      },
      ja: {
        introTitle: '先延ばしを性格ではなく、始めの壁として見ます',
        introBody: '怠けた完璧主義者テストは、いまあなたを止めている先延ばしの型をその場で確かめるページです。結果は直すべき性格ではなく、今日越える始めの壁を一つ教えてくれます。',
        howTitle: '結果の使い方',
        howItems: [
          '一番高い型を固定された性格ではなく、今日の開始障壁として読みます。',
          '提案された行動を10分以内に小さくして、考えすぎる前に始めます。',
          '同じ型が続くなら数日後にもう一度受け、どんな場面で壁が大きくなるか比べます。',
        ],
        note: 'このページは自己チェック用です。抑うつ、不安、睡眠問題、日常機能の低下が続く場合は専門的な支援も検討してください。',
      },
      zh: {
        introTitle: '把拖延看作起步障碍，而不是性格缺陷',
        introBody: '懒惰完美主义者测试直接检查此刻让你停下来的拖延模式。结果不是要改掉的性格，而是今天要跨过的那一个起步障碍。',
        howTitle: '如何使用结果',
        howItems: [
          '把最高类型看作今天的启动障碍，而不是固定身份。',
          '把建议行动缩小到10分钟以内，先开始再完善。',
          '同一类型反复出现时，几天后再测一次，比较障碍在什么情境下变大。',
        ],
        note: '本页面用于自我检查。若抑郁、焦虑、睡眠问题或日常功能受损持续存在，请考虑专业支持。',
      },
      fr: {
        introTitle: 'Voir la procrastination comme une barrière de départ, pas un défaut',
        introBody: 'Ce test repère le schéma de procrastination qui vous bloque en ce moment. Le résultat n’est pas un trait à corriger, mais la barrière de départ à franchir aujourd’hui.',
        howTitle: 'Comment utiliser le résultat',
        howItems: [
          'Lisez le profil principal comme une barrière de départ, pas comme une identité fixe.',
          'Réduisez l’action proposée à dix minutes ou moins et commencez avant de trop planifier.',
          'Si le même profil revient, refaites le test quelques jours plus tard et comparez les situations où la barrière grandit.',
        ],
        note: 'Cet outil sert à l’auto-observation. Si dépression, anxiété, troubles du sommeil ou difficultés quotidiennes persistent, cherchez un soutien professionnel.',
      },
      es: {
        introTitle: 'Ver la procrastinación como una barrera de inicio, no un defecto',
        introBody: 'Este test revisa el patrón de procrastinación que te frena ahora mismo. El resultado no es un rasgo que corregir, sino la barrera de inicio que hay que cruzar hoy.',
        howTitle: 'Cómo usar el resultado',
        howItems: [
          'Lee el patrón principal como una barrera de inicio, no como una identidad fija.',
          'Reduce la acción sugerida a diez minutos o menos y empieza antes de sobreplanificar.',
          'Si el mismo patrón se repite, vuelve a hacerlo en unos días y compara en qué situaciones crece la barrera.',
        ],
        note: 'Esta herramienta es de autoobservación. Si persisten depresión, ansiedad, sueño alterado o deterioro diario, busca apoyo profesional.',
      },
    },
  },
  lethargy: {
    content: {
      ko: {
        introTitle: '무기력을 네 갈래로 나눠 가장 낮은 곳부터 봐요',
        introBody: '무기력증 테스트는 에너지·행동 시동·의미감·연결 네 갈래 중 지금 가장 낮은 곳을 찾아 줘요. 한꺼번에 고치려 하지 않고, 가장 낮은 한 곳에서 작게 시작하는 게 목표예요.',
        howTitle: '결과 이후의 작은 순서',
        howItems: [
          '에너지, 행동 시동, 의미감, 연결 중 가장 낮은 축을 하나만 고릅니다.',
          '오늘 할 회복 행동은 물 마시기, 햇빛 보기, 5분 정리처럼 몸이 바로 이해하는 행동으로 정합니다.',
          '무기력이 오래 지속되면 자책보다 상태 기록과 도움 요청을 우선합니다.',
        ],
        note: '심한 우울감, 자해 생각, 일상 기능 저하가 있다면 테스트 결과와 별개로 즉시 지역 응급지원이나 전문가에게 도움을 요청하세요.',
      },
      en: {
        introTitle: 'Split lethargy into four areas and start with the lowest',
        introBody: 'The lethargy test finds which of four areas — energy, activation, meaning, connection — is lowest for you right now. The aim is not to fix everything at once but to start small in that one place.',
        howTitle: 'A small sequence after the result',
        howItems: [
          'Choose only one low area: energy, activation, meaning, or connection.',
          'Pick a body-readable action such as drinking water, seeing sunlight, or tidying for five minutes.',
          'If lethargy persists, prioritize tracking and support over self-blame.',
        ],
        note: 'If you feel unsafe, have self-harm thoughts, or cannot function day to day, seek local emergency or professional support immediately.',
      },
      ja: {
        introTitle: '無気力を四つに分け、いちばん低いところから見ます',
        introBody: '無気力テストは、エネルギー・行動開始・意味・つながりの四つのうち、いまいちばん低いところを見つけます。一度に全部直そうとせず、その一か所で小さく始めるのが目的です。',
        howTitle: '結果後の小さな順番',
        howItems: [
          'エネルギー、行動開始、意味、つながりの中から一つだけ低い軸を選びます。',
          '水を飲む、光を浴びる、5分片づけるなど身体が理解しやすい行動にします。',
          '無気力が続く時は、自責より記録と相談を優先します。',
        ],
        note: '強い抑うつ、自傷の考え、日常機能の低下がある場合は、すぐに地域の緊急支援や専門家に連絡してください。',
      },
      zh: {
        introTitle: '把无力感分成四个方面，从最低处开始',
        introBody: '无力感测试会找出能量、行动启动、意义感、连接感四个方面中此刻最低的一处。目标不是一次全部修好，而是从那一处小小地开始。',
        howTitle: '结果之后的小步骤',
        howItems: [
          '只选择一个最低的轴：能量、行动启动、意义感或连接感。',
          '选择身体容易理解的行动，例如喝水、晒太阳或整理5分钟。',
          '如果无力感持续，请优先记录状态并寻求支持，而不是自责。',
        ],
        note: '若你感到不安全、有自伤想法或日常功能明显受损，请立即联系当地紧急支持或专业人士。',
      },
      fr: {
        introTitle: 'Diviser l’abattement en quatre et commencer par le plus bas',
        introBody: 'Ce test repère lequel de quatre domaines — énergie, activation, sens, lien — est le plus bas pour vous en ce moment. Le but n’est pas de tout régler d’un coup, mais de commencer petit à cet endroit.',
        howTitle: 'Petite séquence après le résultat',
        howItems: [
          'Choisissez une seule zone faible: énergie, activation, sens ou lien.',
          'Prenez une action lisible par le corps: boire de l’eau, voir la lumière, ranger cinq minutes.',
          'Si l’abattement persiste, privilégiez le suivi et le soutien plutôt que l’autocritique.',
        ],
        note: 'En cas de danger, pensées d’automutilation ou incapacité à fonctionner, contactez immédiatement les urgences locales ou un professionnel.',
      },
      es: {
        introTitle: 'Divide la apatía en cuatro áreas y empieza por la más baja',
        introBody: 'Este test encuentra cuál de cuatro áreas — energía, activación, sentido, conexión — está más baja para ti ahora. La meta no es arreglarlo todo a la vez, sino empezar poco a poco en ese punto.',
        howTitle: 'Pequeña secuencia después del resultado',
        howItems: [
          'Elige solo un área baja: energía, activación, sentido o conexión.',
          'Escoge una acción que el cuerpo entienda: beber agua, ver luz, ordenar cinco minutos.',
          'Si la apatía persiste, prioriza registro y apoyo antes que culpa.',
        ],
        note: 'Si te sientes en peligro, tienes pensamientos de autolesión o no puedes funcionar, contacta de inmediato a emergencias locales o a un profesional.',
      },
    },
  },
  'habit-builder': {
    content: {
      ko: {
        introTitle: '끊기지 않는 것보다 다시 돌아오는 30일',
        introBody: '30일 습관형성 도우미는 매일 체크하고, 빠진 날이 있어도 다시 돌아오게 돕는 도구예요. 기록은 이 브라우저에만 남고, 완벽한 연속보다 돌아오는 속도를 봐요.',
        howTitle: '30일을 유지하는 원칙',
        howItems: [
          '완벽한 연속 기록보다 다시 돌아오는 속도를 더 중요하게 봅니다.',
          '하루 행동은 실패해도 부담이 적을 만큼 작게 정합니다.',
          '7일마다 목표를 키우기보다 방해 요인을 하나 줄입니다.',
        ],
        note: '습관 도구는 의료나 상담을 대체하지 않습니다. 건강, 우울, 불안 문제가 깊게 얽혀 있다면 전문가의 도움을 함께 고려하세요.',
      },
      en: {
        introTitle: '30 days of coming back, not an unbroken streak',
        introBody: 'The 30-day habit helper is for checking in daily and coming back even after a missed day. Your record stays in this browser, and what counts is how fast you return, not a perfect streak.',
        howTitle: 'Principles for staying with 30 days',
        howItems: [
          'Value the speed of returning more than a perfect streak.',
          'Make the daily action small enough that failure carries little cost.',
          'Every seven days, reduce one obstacle before increasing ambition.',
        ],
        note: 'A habit tool does not replace medical or counseling support. If health, depression, or anxiety is deeply involved, consider professional help.',
      },
      ja: {
        introTitle: '途切れないことより、戻ってくる30日',
        introBody: '30日習慣形成ヘルパーは、毎日チェックし、抜けた日があってもまた戻ってこられるよう支えるツールです。記録はこのブラウザにだけ残り、完璧な連続より戻る速さを大切にします。',
        howTitle: '30日続ける原則',
        howItems: [
          '完璧な連続記録より、戻る速さを大切にします。',
          '失敗しても負担が少ないほど行動を小さくします。',
          '7日ごとに目標を大きくする前に、妨げを一つ減らします。',
        ],
        note: '習慣ツールは医療や相談の代わりではありません。健康、抑うつ、不安が深く関わる場合は専門家の助けも検討してください。',
      },
      zh: {
        introTitle: '不是不间断，而是能回来的30天',
        introBody: '30天习惯养成助手帮助你每天打卡，即使漏了一天也能再回来。记录只保存在这个浏览器里，看重的是回来的速度，而不是完美的连续。',
        howTitle: '维持30天的原则',
        howItems: [
          '比起完美连续记录，更重视重新回来的速度。',
          '把每日行动缩小到失败成本很低的程度。',
          '每7天先减少一个障碍，再考虑提高目标。',
        ],
        note: '习惯工具不能替代医疗或咨询支持。若健康、抑郁或焦虑问题较深，请考虑专业帮助。',
      },
      fr: {
        introTitle: '30 jours pour revenir, pas une série sans faille',
        introBody: 'L’assistant 30 jours sert à cocher chaque jour et à revenir même après un jour manqué. Votre suivi reste dans ce navigateur, et ce qui compte est la vitesse de retour, pas une série parfaite.',
        howTitle: 'Principes pour tenir 30 jours',
        howItems: [
          'Valorisez la vitesse de retour plus qu’une série parfaite.',
          'Rendez l’action quotidienne assez petite pour que l’échec coûte peu.',
          'Tous les sept jours, réduisez un obstacle avant d’augmenter l’ambition.',
        ],
        note: 'Un outil d’habitude ne remplace pas un soutien médical ou thérapeutique. Si santé, dépression ou anxiété sont en jeu, cherchez une aide professionnelle.',
      },
      es: {
        introTitle: '30 días para volver, no una racha sin fallos',
        introBody: 'El ayudante de 30 días sirve para marcar cada día y volver aunque falles uno. El registro queda solo en este navegador, y lo que cuenta es la rapidez para volver, no una racha perfecta.',
        howTitle: 'Principios para sostener 30 días',
        howItems: [
          'Valora la velocidad de volver más que una racha perfecta.',
          'Haz la acción diaria tan pequeña que fallar cueste poco.',
          'Cada siete días, reduce un obstáculo antes de aumentar la ambición.',
        ],
        note: 'Una herramienta de hábitos no reemplaza apoyo médico o terapéutico. Si hay salud, depresión o ansiedad involucradas, busca ayuda profesional.',
      },
    },
  },
  burnout: {
    content: {
      ko: {
        introTitle: '소진 신호를 조기에 알아차리는 번아웃 테스트',
        introBody: '번아웃은 단순히 의지가 약해서 생기는 문제가 아닙니다. 감정 소진, 냉소감, 성취감 저하가 함께 쌓일 때 몸과 마음이 보내는 중요한 신호일 수 있습니다.',
        howTitle: '결과 이후에 할 일',
        howItems: [
          '높은 점수가 나온 영역을 하나 고르고, 이번 주에 줄일 수 있는 부담을 구체적으로 적어봅니다.',
          '수면, 식사, 회복 시간처럼 기본 리듬이 무너졌는지 먼저 확인합니다.',
          '무기력, 우울, 불면이 오래 지속된다면 혼자 버티지 말고 전문가나 신뢰할 수 있는 사람에게 도움을 요청합니다.',
        ],
        note: '이 테스트는 번아웃 위험을 스스로 점검하기 위한 도구입니다. 위기감, 자해 생각, 심한 우울이 있다면 즉시 지역 응급지원이나 전문가에게 연락하세요.',
      },
      en: {
        introTitle: 'A burnout test for catching depletion early',
        introBody: 'Burnout is not a failure of willpower. When emotional exhaustion, cynicism, and reduced accomplishment build together, they can be important signals from your body and mind.',
        howTitle: 'What to do after the result',
        howItems: [
          'Choose one high-scoring area and name one burden you can reduce this week.',
          'Check the basics first: sleep, food, breaks, and time without demands.',
          'If numbness, depression, or insomnia persists, reach out to a professional or a trusted person.',
        ],
        note: 'This test is a self-check tool. If you feel unsafe, have thoughts of self-harm, or feel severely depressed, contact local emergency support or a professional immediately.',
      },
      ja: {
        introTitle: '消耗のサインに早く気づくバーンアウトテスト',
        introBody: 'バーンアウトは意志が弱いから起こるものではありません。感情的な消耗、冷笑感、達成感の低下が重なる時、心身からの大切なサインかもしれません。',
        howTitle: '結果の後にできること',
        howItems: [
          '高かった領域を一つ選び、今週減らせる負担を具体的に書き出します。',
          '睡眠、食事、休息時間など基本のリズムが崩れていないか確認します。',
          '無気力、抑うつ、不眠が続く場合は、一人で抱え込まず専門家や信頼できる人に相談してください。',
        ],
        note: 'このテストは自己チェックのためのものです。危険を感じる時、自傷の考え、強いうつ状態がある時は、すぐに地域の緊急支援や専門家に連絡してください。',
      },
      zh: {
        introTitle: '及早觉察耗竭信号的职业倦怠测试',
        introBody: '倦怠并不意味着意志薄弱。当情绪耗竭、冷漠感和成就感下降一起累积时，它可能是身心发出的重要信号。',
        howTitle: '得到结果后可以做什么',
        howItems: [
          '选择一个分数较高的领域，写下本周可以减少的一项具体负担。',
          '先检查睡眠、饮食、休息时间等基本节奏是否被打乱。',
          '如果无力感、抑郁或失眠持续，请向专业人士或可信赖的人求助。',
        ],
        note: '本测试用于自我检查。如果你感到不安全、有自伤想法或严重抑郁，请立即联系当地紧急支持或专业人士。',
      },
      fr: {
        introTitle: 'Un test burnout pour repérer l’épuisement tôt',
        introBody: 'Le burnout n’est pas un manque de volonté. Quand l’épuisement émotionnel, le cynisme et la baisse d’accomplissement s’accumulent, le corps et l’esprit envoient un signal important.',
        howTitle: 'Que faire après le résultat',
        howItems: [
          'Choisissez une zone élevée et nommez une charge que vous pouvez réduire cette semaine.',
          'Vérifiez d’abord les bases: sommeil, alimentation, pauses et temps sans demande.',
          'Si l’abattement, la dépression ou l’insomnie persistent, parlez-en à un professionnel ou à une personne de confiance.',
        ],
        note: 'Ce test est un auto-repérage. En cas de danger, pensées d’automutilation ou dépression sévère, contactez immédiatement les urgences locales ou un professionnel.',
      },
      es: {
        introTitle: 'Un test de burnout para detectar el agotamiento temprano',
        introBody: 'El burnout no es falta de voluntad. Cuando se acumulan agotamiento emocional, cinismo y baja sensación de logro, puede ser una señal importante del cuerpo y la mente.',
        howTitle: 'Qué hacer después del resultado',
        howItems: [
          'Elige un área alta y nombra una carga que puedas reducir esta semana.',
          'Revisa primero lo básico: sueño, comida, pausas y tiempo sin demandas.',
          'Si la apatía, la depresión o el insomnio persisten, habla con un profesional o una persona de confianza.',
        ],
        note: 'Este test es una autoevaluación. Si te sientes en peligro, tienes pensamientos de autolesión o depresión severa, contacta de inmediato a emergencias locales o a un profesional.',
      },
    },
  },
};

export function getTestBridge(topic: TestBridgeTopic, locale: Locale) {
  // 2026-09-20: blog/wiki 로 내보내는 링크는 뺐다(세운 지시). oiyo 자체 설명만 준다.
  const entry = bridges[topic];
  return { content: entry.content[locale] ?? entry.content.en };
}
