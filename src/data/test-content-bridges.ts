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
  linksTitle: string;
  blogLabel: string;
  blogText: string;
  wikiLabel: string;
  wikiText: string;
  note: string;
}

interface TestBridgeEntry {
  content: Record<Locale, TestBridgeContent>;
  blogTargets: Record<Locale, string>;
  wikiTargets?: Partial<Record<Locale, string>>;
}

const tracking = 'utm_source=oiyo&utm_medium=test_page&utm_campaign=content_graph';

const sharedLabels: Record<Locale, Pick<TestBridgeContent, 'linksTitle' | 'blogLabel' | 'wikiLabel'>> = {
  ko: { linksTitle: '더 깊이 읽기', blogLabel: 'blog-oiyo', wikiLabel: 'wiki-oiyo' },
  en: { linksTitle: 'Read deeper', blogLabel: 'blog-oiyo', wikiLabel: 'wiki-oiyo' },
  ja: { linksTitle: 'さらに読む', blogLabel: 'blog-oiyo', wikiLabel: 'wiki-oiyo' },
  zh: { linksTitle: '继续阅读', blogLabel: 'blog-oiyo', wikiLabel: 'wiki-oiyo' },
  fr: { linksTitle: 'Approfondir', blogLabel: 'blog-oiyo', wikiLabel: 'wiki-oiyo' },
  es: { linksTitle: 'Leer más', blogLabel: 'blog-oiyo', wikiLabel: 'wiki-oiyo' },
};

const bridges: Record<TestBridgeTopic, TestBridgeEntry> = {
  mbti: {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '직업 선택을 위한 MBTI 성향 테스트',
        introBody: '이 페이지는 긴 MBTI 해설 글이 아니라, 실제 업무 장면에서 내가 어떤 방식으로 판단하고 협업하는지 빠르게 확인하는 실행형 테스트입니다. 결과는 직업을 단정하기보다 나에게 편한 업무 환경과 에너지 사용 방식을 이해하는 참고 자료로 활용해 주세요.',
        howTitle: '이렇게 활용해 보세요',
        howItems: [
          '현재 직무가 나와 맞지 않는다고 느낄 때, 어떤 지점에서 에너지가 소모되는지 확인합니다.',
          '추천 직업 목록은 정답이 아니라 탐색 후보로 보고, 흥미·역량·현실 조건과 함께 비교합니다.',
          '결과를 읽은 뒤에는 Big Five나 에니어그램 테스트로 다른 관점의 자기이해를 보완합니다.',
        ],
        blogText: 'MBTI 직업·관계·인지기능을 긴 글로 읽고 싶다면 블로그 해설을 참고하세요.',
        wikiText: 'MBTI 개념이나 각 유형의 짧은 정의가 필요하다면 위키 사전을 확인하세요.',
        note: 'OIYO의 MBTI 기반 테스트는 자기이해와 진로 탐색을 위한 참고 도구이며, 공식 MBTI 진단이나 심리 평가를 대체하지 않습니다.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'A work-focused MBTI-style preference test',
        introBody: 'This page is an interactive test, not a long MBTI article. It helps you notice how you make decisions, collaborate, and spend energy in work situations. Treat the result as a starting point for reflection, not a fixed career verdict.',
        howTitle: 'How to use your result',
        howItems: [
          'Notice which work situations drain or energize you.',
          'Use recommended careers as exploration prompts, then compare them with your interests, skills, and constraints.',
          'Pair the result with Big Five or Enneagram tests for a broader self-understanding.',
        ],
        blogText: 'For long-form MBTI career and relationship essays, continue with the blog guides.',
        wikiText: 'For concise definitions and type references, use the wiki entries.',
        note: 'This MBTI-style test is for self-reflection and career exploration. It is not an official MBTI assessment or a clinical evaluation.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '仕事選びのためのMBTI傾向テスト',
        introBody: 'このページは長いMBTI解説記事ではなく、職場での判断や協働の傾向をすばやく確認するための実行型テストです。結果は職業を決めつけるものではなく、働きやすい環境を考える手がかりとしてお使いください。',
        howTitle: '結果の使い方',
        howItems: [
          '今の仕事で疲れやすい場面や力を発揮しやすい場面を見つけます。',
          'おすすめ職業は正解ではなく、検討候補として興味や能力、現実条件と照らし合わせます。',
          'Big Fiveやエニアグラムも合わせて受けると、別の角度から自分を見直せます。',
        ],
        blogText: 'MBTIの仕事・関係・認知機能をじっくり読みたい場合はブログ解説へ。',
        wikiText: 'MBTIの用語やタイプ定義を短く確認したい場合はWikiへ。',
        note: 'このMBTI傾向テストは自己理解と進路探索のための参考ツールであり、公式診断や臨床的評価ではありません。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '用于职业探索的 MBTI 倾向测试',
        introBody: '这个页面是一个可直接使用的测试，而不是长篇 MBTI 文章。它帮助你快速观察自己在工作情境中的判断方式、协作方式和精力消耗模式。结果适合作为自我理解的起点，而不是固定的职业结论。',
        howTitle: '如何使用结果',
        howItems: [
          '看看哪些工作情境会让你消耗精力，哪些情境会让你更有动力。',
          '把推荐职业当作探索候选，而不是唯一答案。',
          '再结合 Big Five 或九型人格测试，从不同角度理解自己。',
        ],
        blogText: '想阅读 MBTI 职业、关系与认知功能的长篇解析，请查看博客。',
        wikiText: '想快速了解 MBTI 概念或类型定义，请查看 Wiki 词条。',
        note: '本测试用于自我理解和职业探索，并非官方 MBTI 测评，也不能替代专业心理评估。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Un test de préférences MBTI orienté travail',
        introBody: 'Cette page est un test interactif, pas un long article sur le MBTI. Elle vous aide à observer votre manière de décider, de collaborer et d’utiliser votre énergie au travail.',
        howTitle: 'Comment utiliser le résultat',
        howItems: [
          'Repérez les situations professionnelles qui vous fatiguent ou vous donnent de l’élan.',
          'Considérez les métiers suggérés comme des pistes, pas comme une réponse définitive.',
          'Complétez avec Big Five ou Ennéagramme pour une lecture plus large.',
        ],
        blogText: 'Pour des essais plus longs sur carrière, relations et fonctions cognitives MBTI, consultez le blog.',
        wikiText: 'Pour des définitions courtes et des fiches de types, utilisez le wiki.',
        note: 'Ce test inspiré du MBTI sert à la réflexion personnelle et à l’exploration professionnelle. Il ne remplace pas une évaluation officielle ou clinique.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Un test de preferencias MBTI enfocado en el trabajo',
        introBody: 'Esta página es una prueba interactiva, no un artículo largo sobre MBTI. Te ayuda a observar cómo decides, colaboras y usas tu energía en situaciones laborales.',
        howTitle: 'Cómo usar tu resultado',
        howItems: [
          'Detecta qué situaciones laborales te agotan o te activan.',
          'Toma las carreras sugeridas como pistas de exploración, no como una respuesta cerrada.',
          'Combina el resultado con Big Five o Eneagrama para ampliar la mirada.',
        ],
        blogText: 'Para ensayos más largos sobre carrera, relaciones y funciones cognitivas MBTI, sigue en el blog.',
        wikiText: 'Para definiciones breves y referencias por tipo, consulta el wiki.',
        note: 'Esta prueba inspirada en MBTI es para autoconocimiento y exploración profesional. No sustituye una evaluación oficial ni clínica.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/mbti-career-test',
      en: 'https://blog.oiyo.net/en/magazine-mbti-career-psychology',
      ja: 'https://blog.oiyo.net/ja/magazine-mbti-compass-test',
      zh: 'https://blog.oiyo.net/zh/meaning-of-mbti',
      fr: 'https://blog.oiyo.net/fr/meaning-of-mbti',
      es: 'https://blog.oiyo.net/es/meaning-of-mbti',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-mbti',
      en: 'https://wiki.oiyo.net/en/meaning-of-mbti',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-mbti',
      zh: 'https://wiki.oiyo.net/ko/meaning-of-mbti',
      fr: 'https://wiki.oiyo.net/en/meaning-of-mbti',
      es: 'https://wiki.oiyo.net/en/meaning-of-mbti',
    },
  },
  enneagram: {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '핵심 동기를 살피는 에니어그램 테스트',
        introBody: '에니어그램은 겉으로 드러나는 성격보다 내가 무엇을 원하고 무엇을 피하려 하는지 살피는 데 유용합니다. 이 페이지에서는 긴 이론 설명보다 테스트 실행과 결과 해석에 필요한 핵심만 제공합니다.',
        howTitle: '결과를 읽는 방법',
        howItems: [
          '가장 높은 유형 하나만 보지 말고, 비슷하게 높은 유형의 공통 동기를 함께 살펴봅니다.',
          '스트레스를 받을 때 반복되는 방어 방식과 회복될 때 자연스러워지는 태도를 구분합니다.',
          '유형 설명이 불편하게 느껴진다면 틀렸다는 뜻보다 아직 맥락이 더 필요하다는 신호일 수 있습니다.',
        ],
        blogText: '날개, 본능, 관계 패턴처럼 깊은 해설은 블로그의 에니어그램 글에서 이어서 읽을 수 있습니다.',
        wikiText: '9가지 유형의 짧은 정의와 기본 용어는 위키 사전에서 확인하세요.',
        note: '에니어그램 결과는 자기성찰을 돕는 참고 자료입니다. 사람을 고정된 유형으로 판단하는 용도로 사용하지 마세요.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'An Enneagram test for core motivations',
        introBody: 'The Enneagram is useful when you want to look beneath habits and notice what you seek, avoid, and protect. This page keeps the focus on taking the test and reading your result with care.',
        howTitle: 'How to read your result',
        howItems: [
          'Look at nearby high scores, not only the top type.',
          'Separate stress patterns from the steadier qualities that appear when you feel safe.',
          'If a description feels uncomfortable, treat it as a prompt for context, not a final label.',
        ],
        blogText: 'For wings, instincts, relationships, and longer essays, continue with the Enneagram guides on the blog.',
        wikiText: 'For short definitions of the nine types and key terms, use the wiki reference.',
        note: 'Enneagram results are for reflection. They should not be used to box yourself or other people into fixed categories.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '核心的な動機を見るエニアグラムテスト',
        introBody: 'エニアグラムは表面的な性格だけでなく、何を求め、何を避けようとしているのかを見つめる助けになります。このページでは理論の長い説明より、テストと結果の読み方に集中します。',
        howTitle: '結果の読み方',
        howItems: [
          '最も高いタイプだけでなく、近い点数のタイプも一緒に見ます。',
          'ストレス時の反応と、安心している時に出る自然な強みを分けて考えます。',
          '説明に違和感がある場合は、決めつけではなく追加の文脈として受け止めます。',
        ],
        blogText: 'ウィング、本能、関係性などの深い解説はブログで読めます。',
        wikiText: '9タイプの短い定義や基本用語はWikiで確認できます。',
        note: 'エニアグラム結果は自己理解のための参考です。人を固定したタイプとして判断するためのものではありません。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '观察核心动机的九型人格测试',
        introBody: '九型人格适合帮助你观察自己真正追求什么、回避什么，以及压力下会保护什么。这个页面重点放在测试和结果解读，而不是长篇理论。',
        howTitle: '如何阅读结果',
        howItems: [
          '不要只看最高类型，也看看分数接近的类型有什么共同动机。',
          '区分压力下的防御反应和状态稳定时自然出现的力量。',
          '如果某段描述让你不舒服，可以把它当作进一步理解的线索。',
        ],
        blogText: '关于侧翼、本能、关系模式和更深入的文章，请继续阅读博客。',
        wikiText: '九种类型的简短定义和基本术语可在 Wiki 中查看。',
        note: '九型人格结果适合自我反思，不应用来把自己或他人固定在某个标签里。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Un test Ennéagramme pour observer vos motivations',
        introBody: 'L’Ennéagramme aide à regarder ce que vous recherchez, évitez et protégez, au-delà des habitudes visibles. Cette page reste centrée sur le test et une lecture prudente du résultat.',
        howTitle: 'Comment lire le résultat',
        howItems: [
          'Regardez aussi les scores proches, pas seulement le type principal.',
          'Distinguez les réactions de stress des qualités qui apparaissent quand vous vous sentez en sécurité.',
          'Si une description vous dérange, prenez-la comme une piste de contexte, pas comme une étiquette définitive.',
        ],
        blogText: 'Pour les ailes, les instincts, les relations et les essais plus longs, poursuivez sur le blog.',
        wikiText: 'Pour des définitions courtes des neuf types et des termes clés, utilisez le wiki.',
        note: 'Le résultat Ennéagramme sert à la réflexion personnelle. Il ne doit pas enfermer une personne dans une catégorie fixe.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Un test de Eneagrama para mirar tus motivaciones',
        introBody: 'El Eneagrama ayuda a mirar qué buscas, qué evitas y qué proteges más allá de los hábitos visibles. Esta página se centra en hacer la prueba y leer el resultado con cuidado.',
        howTitle: 'Cómo leer el resultado',
        howItems: [
          'Observa también las puntuaciones cercanas, no solo el tipo principal.',
          'Distingue las reacciones de estrés de las cualidades que aparecen cuando te sientes seguro.',
          'Si una descripción incomoda, úsala como una pista de contexto, no como una etiqueta final.',
        ],
        blogText: 'Para alas, instintos, relaciones y ensayos más largos, continúa en el blog.',
        wikiText: 'Para definiciones breves de los nueve tipos y términos clave, consulta el wiki.',
        note: 'El resultado del Eneagrama es una herramienta de reflexión. No debe usarse para encasillar a una persona.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/psychology-enneagram-full-test',
      en: 'https://blog.oiyo.net/en/psychology-enneagram-full-test',
      ja: 'https://blog.oiyo.net/ja/enneagram-wings-instincts-deep',
      zh: 'https://blog.oiyo.net/zh/meaning-of-enneagram',
      fr: 'https://blog.oiyo.net/fr/meaning-of-enneagram',
      es: 'https://blog.oiyo.net/es/meaning-of-enneagram',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-enneagram',
      en: 'https://wiki.oiyo.net/en/meaning-of-enneagram',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-enneagram',
      zh: 'https://wiki.oiyo.net/en/meaning-of-enneagram',
      fr: 'https://wiki.oiyo.net/en/meaning-of-enneagram',
      es: 'https://wiki.oiyo.net/en/meaning-of-enneagram',
    },
  },
  big5: {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '다섯 성격 차원을 균형 있게 보는 Big Five 테스트',
        introBody: 'Big Five는 사람을 유형으로 나누기보다 개방성, 성실성, 외향성, 친화성, 정서적 민감성의 정도를 함께 봅니다. 이 페이지는 결과를 일상과 업무 판단에 연결하기 위한 실행형 테스트입니다.',
        howTitle: '결과 활용법',
        howItems: [
          '높고 낮은 점수보다, 어떤 환경에서 그 특성이 장점 또는 부담이 되는지 살펴봅니다.',
          '직업, 관계, 공부 습관을 바꾸기 전에 가장 조정하기 쉬운 행동 하나를 고릅니다.',
          'MBTI나 에니어그램보다 덜 극적인 대신, 장기적인 행동 패턴을 차분히 읽는 데 적합합니다.',
        ],
        blogText: 'Big Five의 차원별 의미와 직업 적용은 블로그의 심리 해설에서 더 길게 읽을 수 있습니다.',
        wikiText: 'OCEAN 각 차원의 짧은 정의와 기본 개념은 위키를 참고하세요.',
        note: 'Big Five 결과는 자기이해를 돕는 참고 지표이며, 임상 진단이나 채용 판단을 대체하지 않습니다.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'A Big Five test for balanced trait reading',
        introBody: 'Big Five looks at dimensions rather than fixed types: Openness, Conscientiousness, Extraversion, Agreeableness, and emotional sensitivity. This test helps connect those scores to everyday choices.',
        howTitle: 'How to use your result',
        howItems: [
          'Ask where each trait becomes helpful and where it becomes costly.',
          'Choose one small behavior to adjust before making a major life or career decision.',
          'Use it for steady pattern-reading; it is quieter than typology, but often more practical.',
        ],
        blogText: 'For longer explanations of each trait and career use cases, continue with the blog.',
        wikiText: 'For short definitions of OCEAN and the five dimensions, use the wiki reference.',
        note: 'Big Five results are self-understanding indicators. They are not clinical diagnoses or hiring decisions.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '5つの性格次元をバランスよく見るBig Fiveテスト',
        introBody: 'Big Fiveは人を固定タイプに分けるより、開放性・誠実性・外向性・協調性・情緒的な敏感さを次元として見ます。このページは結果を日常や仕事の判断に結びつけるためのテストです。',
        howTitle: '結果の活用法',
        howItems: [
          '点数の高低だけでなく、その特性が助けになる場面と負担になる場面を見ます。',
          '大きな進路判断の前に、まず調整しやすい行動を一つ選びます。',
          'タイプ論より静かですが、長期的な行動傾向を読むのに向いています。',
        ],
        blogText: '各次元の意味や仕事への応用はブログで詳しく読めます。',
        wikiText: 'OCEANと5次元の短い定義はWikiで確認できます。',
        note: 'Big Fiveの結果は自己理解の参考指標であり、臨床診断や採用判断の代わりにはなりません。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '平衡观察五个维度的 Big Five 测试',
        introBody: 'Big Five 不把人固定成类型，而是从开放性、尽责性、外向性、宜人性和情绪敏感性等维度理解你。这个测试帮助你把分数连接到日常选择。',
        howTitle: '如何使用结果',
        howItems: [
          '不要只看分数高低，也看这个特质在哪些环境中成为优势或负担。',
          '在做重大职业或关系决定前，先选择一个容易调整的小行动。',
          '它不像类型测试那么戏剧化，但适合稳定地观察长期行为模式。',
        ],
        blogText: '想阅读各维度意义和职业应用，请继续查看博客文章。',
        wikiText: 'OCEAN 和五个维度的简短定义可在 Wiki 中查看。',
        note: 'Big Five 结果是自我理解的参考指标，并非临床诊断或招聘判断。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Un test Big Five pour lire vos traits avec nuance',
        introBody: 'Le Big Five observe des dimensions plutôt que des types fixes: ouverture, conscienciosité, extraversion, agréabilité et sensibilité émotionnelle. Ce test relie ces scores à des choix concrets.',
        howTitle: 'Comment utiliser le résultat',
        howItems: [
          'Repérez quand chaque trait devient une ressource et quand il devient coûteux.',
          'Avant une grande décision, choisissez un petit comportement facile à ajuster.',
          'C’est moins spectaculaire qu’une typologie, mais souvent très utile pour lire les habitudes durables.',
        ],
        blogText: 'Pour des explications plus longues et des usages professionnels, continuez sur le blog.',
        wikiText: 'Pour les définitions courtes d’OCEAN et des cinq dimensions, consultez le wiki.',
        note: 'Le résultat Big Five aide à mieux se comprendre. Il ne remplace ni un diagnostic clinique ni une décision de recrutement.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Un test Big Five para leer tus rasgos con equilibrio',
        introBody: 'Big Five mira dimensiones en lugar de tipos fijos: apertura, responsabilidad, extraversión, amabilidad y sensibilidad emocional. Esta prueba conecta esas puntuaciones con decisiones cotidianas.',
        howTitle: 'Cómo usar el resultado',
        howItems: [
          'Observa cuándo cada rasgo ayuda y cuándo se vuelve costoso.',
          'Antes de una gran decisión, elige un pequeño comportamiento que puedas ajustar.',
          'Es menos dramático que una tipología, pero muy útil para leer patrones duraderos.',
        ],
        blogText: 'Para explicaciones más largas y usos profesionales, continúa en el blog.',
        wikiText: 'Para definiciones breves de OCEAN y las cinco dimensiones, consulta el wiki.',
        note: 'El resultado Big Five sirve para autoconocimiento. No sustituye un diagnóstico clínico ni una decisión de contratación.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/psychology-big-five-test',
      en: 'https://blog.oiyo.net/en/psychology-big-five-test',
      ja: 'https://blog.oiyo.net/ja/',
      zh: 'https://blog.oiyo.net/zh/meaning-of-big5',
      fr: 'https://blog.oiyo.net/fr/meaning-of-big5',
      es: 'https://blog.oiyo.net/es/meaning-of-big5',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-big5',
      en: 'https://wiki.oiyo.net/en/meaning-of-big5',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-big5',
      zh: 'https://wiki.oiyo.net/en/meaning-of-big5',
      fr: 'https://wiki.oiyo.net/en/meaning-of-big5',
      es: 'https://wiki.oiyo.net/en/meaning-of-big5',
    },
  },
  attachment: {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '관계 패턴을 부드럽게 살피는 애착유형 테스트',
        introBody: '애착유형은 사랑을 잘하느냐 못하느냐의 평가가 아니라, 가까운 관계에서 내가 안전함과 거리를 어떻게 느끼는지 이해하는 언어입니다.',
        howTitle: '결과를 다루는 태도',
        howItems: [
          '결과를 상대를 탓하는 근거로 쓰기보다, 내가 반복하는 요청과 회피 방식을 먼저 살펴봅니다.',
          '안정감은 고정된 유형이 아니라 관계 안에서 조금씩 배울 수 있는 방향으로 봅니다.',
          '강한 불안이나 회피가 일상을 해친다면, 신뢰할 수 있는 전문가와 상의하는 것이 좋습니다.',
        ],
        blogText: '성인 애착, 연애 패턴, 관계 회복에 관한 긴 해설은 블로그에서 이어서 읽을 수 있습니다.',
        wikiText: '애착이론과 불안·회피 연속 차원의 짧은 정의는 위키를 참고하세요.',
        note: '이 테스트는 관계 성찰을 위한 참고 도구입니다. 트라우마, 우울, 불안 등 전문적 도움이 필요한 문제는 전문가와 상담해 주세요.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'An attachment style test for gentler relationship insight',
        introBody: 'Attachment style is not a score for whether you love well. It is language for understanding how closeness, distance, and safety feel in important relationships.',
        howTitle: 'How to hold the result',
        howItems: [
          'Use the result to notice your own requests and withdrawals before blaming a partner.',
          'See security as a learnable direction, not a fixed attachment category.',
          'If anxiety or avoidance is harming daily life, consider speaking with a trusted professional.',
        ],
        blogText: 'For adult attachment, dating patterns, and repair work, continue with the blog guides.',
        wikiText: 'For concise definitions of attachment theory and its anxiety/avoidance dimensions, use the wiki.',
        note: 'This test supports relationship reflection. For trauma, depression, anxiety, or safety concerns, please seek professional help.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '関係パターンをやさしく見る愛着スタイルテスト',
        introBody: '愛着スタイルは愛し方の良し悪しを決めるものではなく、親密さや距離、安全感をどう感じるかを理解するための言葉です。',
        howTitle: '結果との向き合い方',
        howItems: [
          '相手を責める材料にする前に、自分の求め方や避け方を見つめます。',
          '安心感は固定された資格ではなく、関係の中で少しずつ学べる方向として考えます。',
          '不安や回避が生活を苦しくしている場合は、信頼できる専門家に相談してください。',
        ],
        blogText: '成人愛着、恋愛パターン、関係の修復についてはブログで詳しく読めます。',
        wikiText: '愛着理論と不安・回避の連続次元の短い定義はWikiで確認できます。',
        note: 'このテストは関係を振り返るための参考です。トラウマ、抑うつ、不安などは専門家に相談してください。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '温和理解关系模式的依恋风格测试',
        introBody: '依恋风格不是评价一个人会不会爱，而是帮助你理解在亲密关系中如何感受安全、距离和靠近的一套语言。',
        howTitle: '如何看待结果',
        howItems: [
          '先观察自己反复提出的需求和回避方式，而不是用结果责怪对方。',
          '把安全感看作可以慢慢学习的方向，而不是某些人才拥有的资格。',
          '如果强烈焦虑或回避影响日常生活，建议寻求可信赖的专业帮助。',
        ],
        blogText: '关于成人依恋、恋爱模式和关系修复的长篇内容，请继续阅读博客。',
        wikiText: '依恋理论及焦虑、回避连续维度的简短定义可在 Wiki 中查看。',
        note: '本测试用于关系反思。涉及创伤、抑郁、焦虑或安全问题时，请寻求专业支持。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Un test d’attachement pour comprendre vos relations avec douceur',
        introBody: 'Le style d’attachement ne juge pas votre façon d’aimer. Il donne des mots pour comprendre comment proximité, distance et sécurité se vivent dans vos relations importantes.',
        howTitle: 'Comment accueillir le résultat',
        howItems: [
          'Utilisez le résultat pour observer vos demandes et vos retraits avant d’accuser l’autre.',
          'Voyez la sécurité comme une direction qui s’apprend, pas comme un statut définitif.',
          'Si l’anxiété ou l’évitement pèse sur votre vie quotidienne, parlez-en à un professionnel de confiance.',
        ],
        blogText: 'Pour l’attachement adulte, les relations amoureuses et la réparation, continuez sur le blog.',
        wikiText: 'Pour des définitions courtes de la théorie de l’attachement et des dimensions anxiété/évitement, consultez le wiki.',
        note: 'Ce test soutient la réflexion relationnelle. Pour trauma, dépression, anxiété ou sécurité, cherchez un accompagnement professionnel.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Un test de apego para mirar tus relaciones con calma',
        introBody: 'El estilo de apego no juzga si amas bien o mal. Ofrece palabras para entender cómo vives la cercanía, la distancia y la seguridad en relaciones importantes.',
        howTitle: 'Cómo recibir el resultado',
        howItems: [
          'Úsalo para observar tus peticiones y retiradas antes de culpar a la otra persona.',
          'Mira la seguridad como una dirección que se aprende, no como un estatus fijo.',
          'Si la ansiedad o la evitación afectan tu vida diaria, habla con un profesional de confianza.',
        ],
        blogText: 'Para apego adulto, patrones de pareja y reparación relacional, continúa en el blog.',
        wikiText: 'Para definiciones breves de la teoría del apego y las dimensiones de ansiedad y evitación, consulta el wiki.',
        note: 'Este test apoya la reflexión sobre relaciones. Para trauma, depresión, ansiedad o seguridad, busca ayuda profesional.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/psychology-attachment-style-test',
      en: 'https://blog.oiyo.net/en/magazine-attachment-test',
      ja: 'https://blog.oiyo.net/ja/attachment-theory-love-patterns',
      zh: 'https://blog.oiyo.net/zh/meaning-of-attachment-theory',
      fr: 'https://blog.oiyo.net/fr/meaning-of-attachment-theory',
      es: 'https://blog.oiyo.net/es/meaning-of-attachment-theory',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-attachment-theory',
      en: 'https://wiki.oiyo.net/en/meaning-of-attachment-theory',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-attachment-theory',
      zh: 'https://wiki.oiyo.net/en/meaning-of-attachment-theory',
      fr: 'https://wiki.oiyo.net/en/meaning-of-attachment-theory',
      es: 'https://wiki.oiyo.net/en/meaning-of-attachment-theory',
    },
  },
  'lazy-perfectionist': {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '테스트는 oiyo.net, 회복 해설은 blog/wiki로 나눕니다',
        introBody: '게으른 완벽주의자 테스트는 미루기 패턴을 바로 점검하는 실행형 페이지입니다. 긴 심리 해설, 회복 루틴, 개념 정의는 각각 blog와 wiki에서 이어 보도록 분리했습니다.',
        howTitle: '결과를 다루는 방법',
        howItems: [
          '가장 높은 유형을 성격 낙인이 아니라 오늘의 시작 장벽으로 읽습니다.',
          '결과 화면에서 제안하는 첫 행동을 10분 이하로 줄여 즉시 실행합니다.',
          '반복되는 미루기 이유가 궁금하면 blog 해설을, 용어 정리가 필요하면 wiki 정의를 확인합니다.',
        ],
        blogText: '완벽주의형 미루기와 무기력 회복을 30일 계획으로 풀어낸 장문 가이드를 읽습니다.',
        wikiText: '게으른 완벽주의, 완벽주의, 회피 동기의 짧은 정의를 확인합니다.',
        note: '이 페이지는 자기점검 도구입니다. 장기적인 우울, 불안, 수면 문제, 일상 기능 저하가 지속되면 전문적인 도움을 함께 고려하세요.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'Keep the test here, read the recovery guides elsewhere',
        introBody: 'The lazy perfectionist test is the interactive home for checking your delay pattern. Long recovery essays and concise definitions belong to the blog and wiki.',
        howTitle: 'How to use the result',
        howItems: [
          'Read the top pattern as today’s starting barrier, not a fixed identity.',
          'Shrink the suggested action to ten minutes or less and do it before overplanning.',
          'Use the blog for recovery routines and the wiki for short concept definitions.',
        ],
        blogText: 'Read the long-form guide on perfectionist procrastination, lethargy, and a 30-day recovery plan.',
        wikiText: 'Review concise definitions for lazy perfectionism, perfectionism, and avoidance motivation.',
        note: 'This is a self-check tool. If depression, anxiety, sleep disruption, or impaired daily functioning persists, consider professional support.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: 'テストはoiyo.net、回復の解説はblog/wikiへ',
        introBody: '怠けた完璧主義者テストは、先延ばしの型をその場で確認する実行型ページです。長い解説や定義はblogとwikiに分けています。',
        howTitle: '結果の使い方',
        howItems: [
          '一番高い型を固定された性格ではなく、今日の開始障壁として読みます。',
          '提案された行動を10分以内に小さくして、考えすぎる前に始めます。',
          '回復ルーティンはblog、概念の短い確認はwikiを使います。',
        ],
        blogText: '完璧主義の先延ばし、無気力、30日回復計画の長いガイドを読みます。',
        wikiText: '怠けた完璧主義、完璧主義、回避動機の短い定義を確認します。',
        note: 'このページは自己チェック用です。抑うつ、不安、睡眠問題、日常機能の低下が続く場合は専門的な支援も検討してください。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '测试留在 oiyo.net，恢复指南放在 blog/wiki',
        introBody: '懒惰完美主义者测试用于直接检查拖延模式。长篇心理解释、恢复计划和简短定义分别放在 blog 与 wiki 中。',
        howTitle: '如何使用结果',
        howItems: [
          '把最高类型看作今天的启动障碍，而不是固定身份。',
          '把建议行动缩小到10分钟以内，先开始再完善。',
          '需要恢复计划看 blog，需要概念定义看 wiki。',
        ],
        blogText: '阅读关于完美主义拖延、无力感和30天恢复计划的长篇指南。',
        wikiText: '查看懒惰完美主义、完美主义和回避动机的简短定义。',
        note: '本页面用于自我检查。若抑郁、焦虑、睡眠问题或日常功能受损持续存在，请考虑专业支持。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Le test reste sur oiyo.net, les guides sur blog/wiki',
        introBody: 'Ce test sert à repérer directement votre schéma de procrastination perfectionniste. Les essais longs et les définitions courtes restent séparés sur le blog et le wiki.',
        howTitle: 'Comment utiliser le résultat',
        howItems: [
          'Lisez le profil principal comme une barrière de départ, pas comme une identité fixe.',
          'Réduisez l’action proposée à dix minutes ou moins et commencez avant de trop planifier.',
          'Utilisez le blog pour les routines de récupération et le wiki pour les définitions.',
        ],
        blogText: 'Lire le guide long sur procrastination perfectionniste, léthargie et plan de récupération sur 30 jours.',
        wikiText: 'Consulter les définitions brèves du perfectionnisme paresseux, du perfectionnisme et de l’évitement.',
        note: 'Cet outil sert à l’auto-observation. Si dépression, anxiété, troubles du sommeil ou difficultés quotidiennes persistent, cherchez un soutien professionnel.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'El test vive en oiyo.net; las guías en blog/wiki',
        introBody: 'Este test revisa directamente tu patrón de procrastinación perfeccionista. Los ensayos largos y las definiciones breves quedan separados en el blog y el wiki.',
        howTitle: 'Cómo usar el resultado',
        howItems: [
          'Lee el patrón principal como una barrera de inicio, no como una identidad fija.',
          'Reduce la acción sugerida a diez minutos o menos y empieza antes de sobreplanificar.',
          'Usa el blog para rutinas de recuperación y el wiki para definiciones breves.',
        ],
        blogText: 'Lee la guía larga sobre procrastinación perfeccionista, apatía y plan de recuperación de 30 días.',
        wikiText: 'Consulta definiciones breves de perfeccionismo perezoso, perfeccionismo y evitación.',
        note: 'Esta herramienta es de autoobservación. Si persisten depresión, ansiedad, sueño alterado o deterioro diario, busca apoyo profesional.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/lazy-perfectionism-lethargy-30-day-recovery',
      en: 'https://blog.oiyo.net/en/lazy-perfectionism-lethargy-30-day-recovery',
      ja: 'https://blog.oiyo.net/ja/lazy-perfectionism-lethargy-30-day-recovery',
      zh: 'https://blog.oiyo.net/zh/meaning-of-perfectionism',
      fr: 'https://blog.oiyo.net/fr/meaning-of-perfectionism',
      es: 'https://blog.oiyo.net/es/meaning-of-perfectionism',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-neuroplasticity',
      en: 'https://wiki.oiyo.net/en/meaning-of-neuroplasticity',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-neuroplasticity',
      zh: 'https://wiki.oiyo.net/en/meaning-of-neuroplasticity',
      fr: 'https://wiki.oiyo.net/en/meaning-of-neuroplasticity',
      es: 'https://wiki.oiyo.net/en/meaning-of-neuroplasticity',
    },
  },
  lethargy: {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '무기력 점검은 여기서, 회복 방법은 깊게 이어서',
        introBody: '무기력증 테스트는 지금 나에게 필요한 회복 포인트를 빠르게 찾는 실행형 페이지입니다. 원인 해설과 극복 방법은 blog, 개념 정리는 wiki로 연결합니다.',
        howTitle: '결과 이후의 작은 순서',
        howItems: [
          '에너지, 행동 시동, 의미감, 연결 중 가장 낮은 축을 하나만 고릅니다.',
          '오늘 할 회복 행동은 물 마시기, 햇빛 보기, 5분 정리처럼 몸이 바로 이해하는 행동으로 정합니다.',
          '무기력이 오래 지속되면 자책보다 상태 기록과 도움 요청을 우선합니다.',
        ],
        blogText: '무기력, 번아웃, 우울 신호를 구분하고 회복 루틴을 세우는 장문 가이드로 이동합니다.',
        wikiText: '무기력, 번아웃, 행동 활성화의 짧은 정의를 확인합니다.',
        note: '심한 우울감, 자해 생각, 일상 기능 저하가 있다면 테스트 결과와 별개로 즉시 지역 응급지원이나 전문가에게 도움을 요청하세요.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'Check low energy here, continue recovery in depth',
        introBody: 'The lethargy test is the interactive place for finding your current recovery focus. Long explanations live on the blog, while concise definitions live on the wiki.',
        howTitle: 'A small sequence after the result',
        howItems: [
          'Choose only one low area: energy, activation, meaning, or connection.',
          'Pick a body-readable action such as drinking water, seeing sunlight, or tidying for five minutes.',
          'If lethargy persists, prioritize tracking and support over self-blame.',
        ],
        blogText: 'Read a long-form guide that separates lethargy, burnout, and depression signals with recovery routines.',
        wikiText: 'Review concise definitions for lethargy, burnout, and behavioral activation.',
        note: 'If you feel unsafe, have self-harm thoughts, or cannot function day to day, seek local emergency or professional support immediately.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '無気力の確認はここで、回復方法は深く読む',
        introBody: '無気力テストは、今必要な回復ポイントをすばやく見つける実行型ページです。原因や方法はblog、概念整理はwikiに分けています。',
        howTitle: '結果後の小さな順番',
        howItems: [
          'エネルギー、行動開始、意味、つながりの中から一つだけ低い軸を選びます。',
          '水を飲む、光を浴びる、5分片づけるなど身体が理解しやすい行動にします。',
          '無気力が続く時は、自責より記録と相談を優先します。',
        ],
        blogText: '無気力、バーンアウト、抑うつサインを分け、回復ルーティンを作る長いガイドへ。',
        wikiText: '無気力、バーンアウト、行動活性化の短い定義を確認します。',
        note: '強い抑うつ、自傷の考え、日常機能の低下がある場合は、すぐに地域の緊急支援や専門家に連絡してください。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '在这里检查无力感，再深入阅读恢复方法',
        introBody: '无力感测试用于快速找到当前恢复重点。原因解释和恢复方法放在 blog，概念定义放在 wiki。',
        howTitle: '结果之后的小步骤',
        howItems: [
          '只选择一个最低的轴：能量、行动启动、意义感或连接感。',
          '选择身体容易理解的行动，例如喝水、晒太阳或整理5分钟。',
          '如果无力感持续，请优先记录状态并寻求支持，而不是自责。',
        ],
        blogText: '阅读区分无力感、倦怠和抑郁信号，并建立恢复例程的长篇指南。',
        wikiText: '查看无力感、倦怠和行为激活的简短定义。',
        note: '若你感到不安全、有自伤想法或日常功能明显受损，请立即联系当地紧急支持或专业人士。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Repérez l’abattement ici, approfondissez la récupération ensuite',
        introBody: 'Ce test sert à trouver rapidement votre point de récupération actuel. Les explications longues sont sur le blog et les définitions courtes sur le wiki.',
        howTitle: 'Petite séquence après le résultat',
        howItems: [
          'Choisissez une seule zone faible: énergie, activation, sens ou lien.',
          'Prenez une action lisible par le corps: boire de l’eau, voir la lumière, ranger cinq minutes.',
          'Si l’abattement persiste, privilégiez le suivi et le soutien plutôt que l’autocritique.',
        ],
        blogText: 'Lire un guide long pour distinguer léthargie, burnout et signaux dépressifs avec des routines de récupération.',
        wikiText: 'Consulter les définitions brèves de la léthargie, du burnout et de l’activation comportementale.',
        note: 'En cas de danger, pensées d’automutilation ou incapacité à fonctionner, contactez immédiatement les urgences locales ou un professionnel.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Revisa la apatía aquí y profundiza la recuperación después',
        introBody: 'Este test encuentra tu foco de recuperación actual. Las explicaciones largas van al blog y las definiciones breves al wiki.',
        howTitle: 'Pequeña secuencia después del resultado',
        howItems: [
          'Elige solo un área baja: energía, activación, sentido o conexión.',
          'Escoge una acción que el cuerpo entienda: beber agua, ver luz, ordenar cinco minutos.',
          'Si la apatía persiste, prioriza registro y apoyo antes que culpa.',
        ],
        blogText: 'Lee una guía larga para distinguir apatía, burnout y señales depresivas con rutinas de recuperación.',
        wikiText: 'Consulta definiciones breves de apatía, burnout y activación conductual.',
        note: 'Si te sientes en peligro, tienes pensamientos de autolesión o no puedes funcionar, contacta de inmediato a emergencias locales o a un profesional.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/lazy-perfectionism-lethargy-30-day-recovery',
      en: 'https://blog.oiyo.net/en/lazy-perfectionism-lethargy-30-day-recovery',
      ja: 'https://blog.oiyo.net/ja/lazy-perfectionism-lethargy-30-day-recovery',
      zh: 'https://blog.oiyo.net/zh/sisyphus-burnout',
      fr: 'https://blog.oiyo.net/fr/sisyphus-burnout',
      es: 'https://blog.oiyo.net/es/sisyphus-burnout',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-lazy-perfectionism',
      en: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-lazy-perfectionism',
      zh: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
      fr: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
      es: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
    },
  },
  'habit-builder': {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '30일 실행은 oiyo.net, 습관 이론은 blog/wiki로',
        introBody: '30일 습관형성 도우미는 매일 체크하고 다시 돌아오기 위한 실행형 도구입니다. 습관 과학과 자기계발 해설은 blog, 핵심 개념은 wiki로 나누어 둡니다.',
        howTitle: '30일을 유지하는 원칙',
        howItems: [
          '완벽한 연속 기록보다 다시 돌아오는 속도를 더 중요하게 봅니다.',
          '하루 행동은 실패해도 부담이 적을 만큼 작게 정합니다.',
          '7일마다 목표를 키우기보다 방해 요인을 하나 줄입니다.',
        ],
        blogText: '습관 형성, 신경가소성, 게으른 완벽주의 회복을 연결한 장문 가이드를 읽습니다.',
        wikiText: '습관 형성, 행동 활성화, 신경가소성의 짧은 정의를 확인합니다.',
        note: '습관 도구는 의료나 상담을 대체하지 않습니다. 건강, 우울, 불안 문제가 깊게 얽혀 있다면 전문가의 도움을 함께 고려하세요.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'Run the 30 days here, read habit theory elsewhere',
        introBody: 'The 30-day habit helper is the interactive tool for checking in and returning. Habit science and long recovery essays live on the blog; core definitions live on the wiki.',
        howTitle: 'Principles for staying with 30 days',
        howItems: [
          'Value the speed of returning more than a perfect streak.',
          'Make the daily action small enough that failure carries little cost.',
          'Every seven days, reduce one obstacle before increasing ambition.',
        ],
        blogText: 'Read long-form guides connecting habit formation, neuroplasticity, and recovery from perfectionist delay.',
        wikiText: 'Review concise definitions for habit formation, behavioral activation, and neuroplasticity.',
        note: 'A habit tool does not replace medical or counseling support. If health, depression, or anxiety is deeply involved, consider professional help.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '30日の実行はoiyo.net、習慣理論はblog/wikiへ',
        introBody: '30日習慣形成ヘルパーは、毎日確認して戻ってくるための実行型ツールです。習慣科学や長い解説はblog、核心概念はwikiに分けています。',
        howTitle: '30日続ける原則',
        howItems: [
          '完璧な連続記録より、戻る速さを大切にします。',
          '失敗しても負担が少ないほど行動を小さくします。',
          '7日ごとに目標を大きくする前に、妨げを一つ減らします。',
        ],
        blogText: '習慣形成、神経可塑性、完璧主義的先延ばしの回復をつなぐ長いガイドを読みます。',
        wikiText: '習慣形成、行動活性化、神経可塑性の短い定義を確認します。',
        note: '習慣ツールは医療や相談の代わりではありません。健康、抑うつ、不安が深く関わる場合は専門家の助けも検討してください。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '30天执行在 oiyo.net，习惯理论在 blog/wiki',
        introBody: '30天习惯养成助手是用于每日打卡和重新回来的互动工具。习惯科学与长篇恢复文章放在 blog，核心定义放在 wiki。',
        howTitle: '维持30天的原则',
        howItems: [
          '比起完美连续记录，更重视重新回来的速度。',
          '把每日行动缩小到失败成本很低的程度。',
          '每7天先减少一个障碍，再考虑提高目标。',
        ],
        blogText: '阅读连接习惯养成、神经可塑性和完美主义拖延恢复的长篇指南。',
        wikiText: '查看习惯形成、行为激活和神经可塑性的简短定义。',
        note: '习惯工具不能替代医疗或咨询支持。若健康、抑郁或焦虑问题较深，请考虑专业帮助。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Les 30 jours ici, la théorie des habitudes sur blog/wiki',
        introBody: 'L’assistant 30 jours est l’outil interactif pour cocher, revenir et continuer. Les essais longs restent sur le blog; les définitions courtes sur le wiki.',
        howTitle: 'Principes pour tenir 30 jours',
        howItems: [
          'Valorisez la vitesse de retour plus qu’une série parfaite.',
          'Rendez l’action quotidienne assez petite pour que l’échec coûte peu.',
          'Tous les sept jours, réduisez un obstacle avant d’augmenter l’ambition.',
        ],
        blogText: 'Lire des guides longs reliant formation d’habitudes, neuroplasticité et récupération du perfectionnisme.',
        wikiText: 'Consulter les définitions brèves de formation d’habitude, activation comportementale et neuroplasticité.',
        note: 'Un outil d’habitude ne remplace pas un soutien médical ou thérapeutique. Si santé, dépression ou anxiété sont en jeu, cherchez une aide professionnelle.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Los 30 días aquí; la teoría de hábitos en blog/wiki',
        introBody: 'El ayudante de 30 días es la herramienta interactiva para registrar, volver y continuar. Los ensayos largos viven en el blog; las definiciones breves en el wiki.',
        howTitle: 'Principios para sostener 30 días',
        howItems: [
          'Valora la velocidad de volver más que una racha perfecta.',
          'Haz la acción diaria tan pequeña que fallar cueste poco.',
          'Cada siete días, reduce un obstáculo antes de aumentar la ambición.',
        ],
        blogText: 'Lee guías largas que conectan formación de hábitos, neuroplasticidad y recuperación del perfeccionismo.',
        wikiText: 'Consulta definiciones breves de formación de hábitos, activación conductual y neuroplasticidad.',
        note: 'Una herramienta de hábitos no reemplaza apoyo médico o terapéutico. Si hay salud, depresión o ansiedad involucradas, busca ayuda profesional.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/magazine-habit-formation-guide',
      en: 'https://blog.oiyo.net/en/magazine-habit-formation-guide',
      ja: 'https://blog.oiyo.net/ja/habit-neuroplasticity',
      zh: 'https://blog.oiyo.net/zh/neuroplasticity-habit-formation',
      fr: 'https://blog.oiyo.net/fr/neuroplasticity-habit-formation',
      es: 'https://blog.oiyo.net/es/neuroplasticity-habit-formation',
    },
    wikiTargets: {
      ko: 'https://wiki.oiyo.net/ko/meaning-of-lazy-perfectionism',
      en: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
      ja: 'https://wiki.oiyo.net/ja/meaning-of-lazy-perfectionism',
      zh: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
      fr: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
      es: 'https://wiki.oiyo.net/en/meaning-of-lazy-perfectionism',
    },
  },
  burnout: {
    content: {
      ko: {
        ...sharedLabels.ko,
        introTitle: '소진 신호를 조기에 알아차리는 번아웃 테스트',
        introBody: '번아웃은 단순히 의지가 약해서 생기는 문제가 아닙니다. 감정 소진, 냉소감, 성취감 저하가 함께 쌓일 때 몸과 마음이 보내는 중요한 신호일 수 있습니다.',
        howTitle: '결과 이후에 할 일',
        howItems: [
          '높은 점수가 나온 영역을 하나 고르고, 이번 주에 줄일 수 있는 부담을 구체적으로 적어봅니다.',
          '수면, 식사, 회복 시간처럼 기본 리듬이 무너졌는지 먼저 확인합니다.',
          '무기력, 우울, 불면이 오래 지속된다면 혼자 버티지 말고 전문가나 신뢰할 수 있는 사람에게 도움을 요청합니다.',
        ],
        blogText: '번아웃 회복, 도파민 리셋, 스트레스 관리에 관한 긴 글은 블로그에서 이어서 읽을 수 있습니다.',
        wikiText: '번아웃과 스트레스 관련 개념 정리가 필요하면 위키/블로그 사전형 글을 참고하세요.',
        note: '이 테스트는 번아웃 위험을 스스로 점검하기 위한 도구입니다. 위기감, 자해 생각, 심한 우울이 있다면 즉시 지역 응급지원이나 전문가에게 연락하세요.',
      },
      en: {
        ...sharedLabels.en,
        introTitle: 'A burnout test for catching depletion early',
        introBody: 'Burnout is not a failure of willpower. When emotional exhaustion, cynicism, and reduced accomplishment build together, they can be important signals from your body and mind.',
        howTitle: 'What to do after the result',
        howItems: [
          'Choose one high-scoring area and name one burden you can reduce this week.',
          'Check the basics first: sleep, food, breaks, and time without demands.',
          'If numbness, depression, or insomnia persists, reach out to a professional or a trusted person.',
        ],
        blogText: 'For recovery planning, dopamine reset, and stress management essays, continue with the blog.',
        wikiText: 'For concise concept references around burnout and stress, use the available reference articles.',
        note: 'This test is a self-check tool. If you feel unsafe, have thoughts of self-harm, or feel severely depressed, contact local emergency support or a professional immediately.',
      },
      ja: {
        ...sharedLabels.ja,
        introTitle: '消耗のサインに早く気づくバーンアウトテスト',
        introBody: 'バーンアウトは意志が弱いから起こるものではありません。感情的な消耗、冷笑感、達成感の低下が重なる時、心身からの大切なサインかもしれません。',
        howTitle: '結果の後にできること',
        howItems: [
          '高かった領域を一つ選び、今週減らせる負担を具体的に書き出します。',
          '睡眠、食事、休息時間など基本のリズムが崩れていないか確認します。',
          '無気力、抑うつ、不眠が続く場合は、一人で抱え込まず専門家や信頼できる人に相談してください。',
        ],
        blogText: '回復、ドーパミンリセット、ストレス管理の長い記事はブログで読めます。',
        wikiText: 'バーンアウトやストレス関連の概念を短く確認したい場合は参照記事をご利用ください。',
        note: 'このテストは自己チェックのためのものです。危険を感じる時、自傷の考え、強いうつ状態がある時は、すぐに地域の緊急支援や専門家に連絡してください。',
      },
      zh: {
        ...sharedLabels.zh,
        introTitle: '及早觉察耗竭信号的职业倦怠测试',
        introBody: '倦怠并不意味着意志薄弱。当情绪耗竭、冷漠感和成就感下降一起累积时，它可能是身心发出的重要信号。',
        howTitle: '得到结果后可以做什么',
        howItems: [
          '选择一个分数较高的领域，写下本周可以减少的一项具体负担。',
          '先检查睡眠、饮食、休息时间等基本节奏是否被打乱。',
          '如果无力感、抑郁或失眠持续，请向专业人士或可信赖的人求助。',
        ],
        blogText: '关于倦怠恢复、多巴胺重置和压力管理的长篇内容，请继续阅读博客。',
        wikiText: '如果需要快速了解倦怠和压力相关概念，可查看参考文章。',
        note: '本测试用于自我检查。如果你感到不安全、有自伤想法或严重抑郁，请立即联系当地紧急支持或专业人士。',
      },
      fr: {
        ...sharedLabels.fr,
        introTitle: 'Un test burnout pour repérer l’épuisement tôt',
        introBody: 'Le burnout n’est pas un manque de volonté. Quand l’épuisement émotionnel, le cynisme et la baisse d’accomplissement s’accumulent, le corps et l’esprit envoient un signal important.',
        howTitle: 'Que faire après le résultat',
        howItems: [
          'Choisissez une zone élevée et nommez une charge que vous pouvez réduire cette semaine.',
          'Vérifiez d’abord les bases: sommeil, alimentation, pauses et temps sans demande.',
          'Si l’abattement, la dépression ou l’insomnie persistent, parlez-en à un professionnel ou à une personne de confiance.',
        ],
        blogText: 'Pour la récupération, le reset dopaminergique et la gestion du stress, continuez sur le blog.',
        wikiText: 'Pour des repères courts autour du burnout et du stress, consultez les articles de référence.',
        note: 'Ce test est un auto-repérage. En cas de danger, pensées d’automutilation ou dépression sévère, contactez immédiatement les urgences locales ou un professionnel.',
      },
      es: {
        ...sharedLabels.es,
        introTitle: 'Un test de burnout para detectar el agotamiento temprano',
        introBody: 'El burnout no es falta de voluntad. Cuando se acumulan agotamiento emocional, cinismo y baja sensación de logro, puede ser una señal importante del cuerpo y la mente.',
        howTitle: 'Qué hacer después del resultado',
        howItems: [
          'Elige un área alta y nombra una carga que puedas reducir esta semana.',
          'Revisa primero lo básico: sueño, comida, pausas y tiempo sin demandas.',
          'Si la apatía, la depresión o el insomnio persisten, habla con un profesional o una persona de confianza.',
        ],
        blogText: 'Para recuperación, reinicio de dopamina y manejo del estrés, continúa en el blog.',
        wikiText: 'Para referencias breves sobre burnout y estrés, consulta los artículos disponibles.',
        note: 'Este test es una autoevaluación. Si te sientes en peligro, tienes pensamientos de autolesión o depresión severa, contacta de inmediato a emergencias locales o a un profesional.',
      },
    },
    blogTargets: {
      ko: 'https://blog.oiyo.net/ko/psychology-burnout-test',
      en: 'https://blog.oiyo.net/en/magazine-burnout-recovery-guide',
      ja: 'https://blog.oiyo.net/ja/burnout-recovery-dopamine-reset',
      zh: 'https://blog.oiyo.net/zh/sisyphus-burnout',
      fr: 'https://blog.oiyo.net/fr/sisyphus-burnout',
      es: 'https://blog.oiyo.net/es/sisyphus-burnout',
    },
    wikiTargets: {
    },
  },
};

export function getTestBridge(topic: TestBridgeTopic, locale: Locale) {
  const entry = bridges[topic];
  const content = entry.content[locale] ?? entry.content.en;
  const blogTarget = entry.blogTargets[locale] ?? entry.blogTargets.en;
  const wikiTarget = entry.wikiTargets?.[locale] ?? entry.wikiTargets?.en;

  return {
    content,
    blogUrl: `${blogTarget}?${tracking}_${topic}`,
    wikiUrl: wikiTarget ? `${wikiTarget}?${tracking}_${topic}` : undefined,
  };
}
