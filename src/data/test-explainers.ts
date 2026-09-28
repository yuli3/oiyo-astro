import type { Locale } from '../i18n';

/** 해설 한 벌의 모양. TestExplainer.astro 가 이 타입을 다시 내보낸다(.astro 는 tsc 가 못 읽는다). */
export interface TestExplainerContent {
  introTitle: string;
  intro: string;
  conceptTitle: string;
  concepts: { title: string; body: string }[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
  disclaimer: string;
}

/**
 * 깡통이던 테스트 페이지에 붙일 해설.
 *
 * 출처: blog 에 같은 주제로 살아 있던 글에서 실질을 가져와 oiyo 기준으로 다시 썼다
 * (2026-09-03 주제 정렬 4단계). 이론 이름과 연구자를 남겨 두는 것이 원칙이다 —
 * "미루기는 게으름이 아니라 감정 조절 문제"처럼 출처가 있는 주장만 싣는다.
 *
 * 형식은 burnout/test.astro 를 따른다: 도입 · 개념 3항 · FAQ 3항 · 면책.
 */
export type TestExplainerMap = Partial<Record<Locale, TestExplainerContent>>;

export const TEST_EXPLAINERS: Record<string, TestExplainerMap> = {
  'motivation-type': {
    ko: {
      introTitle: '동기는 세기가 아니라 자율성의 정도로 갈린다',
      intro: '에드워드 데시와 리처드 라이언의 자기결정이론(SDT)은 동기를 내적·외적 둘로 나누지 않는다. 무동기에서 외적 조절, 내사된 조절, 확인된 조절, 통합된 조절을 지나 내적 동기까지 이어지는 연속선에 놓는다. 중요한 것은 동기가 얼마나 센가가 아니라 그 행동이 얼마나 내 선택으로 느껴지는가다.',
      conceptTitle: '자기결정이론이 말하는 세 가지 욕구',
      concepts: [
        { title: '자율성', body: '내가 고른 일이라는 감각. "해야 한다"를 "선택한다"로 바꾸는 것만으로도 지속력이 달라진다.' },
        { title: '유능감', body: '너무 쉽지도 어렵지도 않은 과제에서 자란다. 몰입(flow)이 생기는 지점과 같은 조건이다.' },
        { title: '관계성', body: '함께하는 사람이 있을 때 동기가 오래간다. 스터디 그룹이나 운동 파트너가 듣기보다 크게 작동하는 이유다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '외적 동기는 나쁜 것인가요?', answer: '아닙니다. 문제가 되는 것은 이미 즐기던 활동에 보상을 얹을 때 나타나는 구축 효과(crowding out)입니다. 원래 하기 싫던 일에 붙는 보상은 오히려 시작을 돕습니다.' },
        { question: '동기 유형은 고정된 것인가요?', answer: '아닙니다. 같은 사람도 영역마다 다릅니다. 운동은 내적 동기인데 공부는 외적 조절인 경우가 흔합니다.' },
        { question: '결과를 어떻게 쓰면 좋나요?', answer: '지금 하는 일에서 자율성·유능감·관계성 중 무엇이 비어 있는지 찾는 데 쓰세요. 비어 있는 하나를 채우는 것이 의지력을 짜내는 것보다 낫습니다.' },
      ],
      disclaimer: '동기 유형 결과는 자기 이해와 대화를 위한 참고입니다. 진단, 채용, 평가의 근거로 사용하지 마세요.',
    },
    en: {
      introTitle: 'Motivation differs by degree of autonomy, not by strength',
      intro: 'Edward Deci and Richard Ryan’s Self-Determination Theory does not split motivation into internal and external. It places it on a continuum from amotivation through external, introjected, identified and integrated regulation to intrinsic motivation. What matters is not how strong the motivation is but how much the action feels like your own choice.',
      conceptTitle: 'Three needs in Self-Determination Theory',
      concepts: [
        { title: 'Autonomy', body: 'The sense that you chose this. Shifting the words from "I have to" to "I choose to" changes how long it lasts.' },
        { title: 'Competence', body: 'It grows on tasks that are neither too easy nor too hard — the same condition under which flow appears.' },
        { title: 'Relatedness', body: 'Motivation lasts longer with other people in it. That is why a study group or a training partner works better than it sounds.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Is external motivation bad?', answer: 'No. The problem is the crowding-out effect that appears when a reward is added to something you already enjoyed. A reward attached to something you never wanted to start can help you begin.' },
        { question: 'Is a motivation type fixed?', answer: 'No. The same person differs by domain. Intrinsic motivation for exercise alongside external regulation for study is common.' },
        { question: 'How should I use the result?', answer: 'Use it to find which of autonomy, competence or relatedness is missing in what you are doing now. Filling the missing one beats squeezing out willpower.' },
      ],
      disclaimer: 'Motivation type results are for self-understanding and conversation. Do not use them as a basis for diagnosis, hiring, or evaluation.',
    },
    ja: {
      introTitle: '動機は強さではなく自律性の度合いで分かれる',
      intro: 'エドワード・デシとリチャード・ライアンの自己決定理論(SDT)は、動機を内発・外発の二つに分けない。無動機から外的調整、取り入れ的調整、同一化的調整、統合的調整を経て内発的動機まで続く連続線に置く。大事なのは動機がどれだけ強いかではなく、その行動がどれだけ自分の選択に感じられるかだ。',
      conceptTitle: '自己決定理論が言う三つの欲求',
      concepts: [
        { title: '自律性', body: '自分が選んだという感覚。「しなければ」を「選ぶ」に言い換えるだけで続き方が変わる。' },
        { title: '有能感', body: '易しすぎず難しすぎない課題で育つ。フロー が生まれる条件と同じだ。' },
        { title: '関係性', body: '一緒にいる人がいると動機は長持ちする。勉強会や運動仲間が思った以上に効く理由だ。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '外発的動機は悪いものですか？', answer: 'いいえ。問題になるのは、すでに楽しんでいた活動に報酬を足したときに起きるアンダーマイニング効果です。もともと気の進まない事に付く報酬はむしろ着手を助けます。' },
        { question: '動機タイプは固定ですか？', answer: 'いいえ。同じ人でも領域ごとに違います。運動は内発的なのに勉強は外的調整、ということはよくあります。' },
        { question: '結果はどう使えばよいですか？', answer: '今していることで自律性・有能感・関係性のどれが欠けているかを探すのに使ってください。欠けた一つを埋める方が、意志力を絞るより効きます。' },
      ],
      disclaimer: '動機タイプの結果は自己理解と対話のための参考です。診断・採用・評価の根拠には使わないでください。',
    },
    zh: {
      introTitle: '动机的差别在自主程度，而不在强度',
      intro: '德西与瑞安的自我决定理论(SDT)不把动机简单分成内部与外部，而是放在一条连续线上：从无动机，经外部调节、内摄调节、认同调节、整合调节，直到内在动机。关键不是动机有多强，而是这个行为在多大程度上像是自己的选择。',
      conceptTitle: '自我决定理论的三种需要',
      concepts: [
        { title: '自主', body: '这是我选的这种感觉。把"必须做"换成"我选择做"，坚持的时间就不一样。' },
        { title: '胜任', body: '在不太容易也不太难的任务上生长，与心流出现的条件相同。' },
        { title: '联结', body: '有人同行时动机更持久。这就是学习小组或运动搭档比听上去更管用的原因。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '外部动机不好吗？', answer: '不是。真正的问题是"挤出效应"：给本来就喜欢的活动加上奖励时才会出现。给本来不想开始的事加奖励，反而有助于起步。' },
        { question: '动机类型是固定的吗？', answer: '不是。同一个人在不同领域也不同。运动是内在动机、学习是外部调节，这很常见。' },
        { question: '结果该怎么用？', answer: '用它找出你现在做的事里缺少的是自主、胜任还是联结。补上缺的那一个，比硬挤意志力有效。' },
      ],
      disclaimer: '动机类型结果仅用于自我理解与对话，请勿作为诊断、招聘或评价的依据。',
    },
    fr: {
      introTitle: "La motivation se distingue par le degré d'autonomie, pas par sa force",
      intro: "La théorie de l'autodétermination d'Edward Deci et Richard Ryan ne sépare pas la motivation en interne et externe. Elle la place sur un continuum allant de l'amotivation à la motivation intrinsèque, en passant par la régulation externe, introjectée, identifiée et intégrée. Ce qui compte n'est pas la force de la motivation mais à quel point l'action ressemble à votre propre choix.",
      conceptTitle: "Trois besoins selon l'autodétermination",
      concepts: [
        { title: 'Autonomie', body: "Le sentiment d'avoir choisi. Remplacer « je dois » par « je choisis » change déjà la durée." },
        { title: 'Compétence', body: "Elle grandit sur des tâches ni trop faciles ni trop difficiles — la condition même du flow." },
        { title: 'Affiliation', body: "La motivation dure plus longtemps avec d'autres. C'est pourquoi un groupe d'étude ou un partenaire d'entraînement agit plus qu'on ne le croit." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'La motivation externe est-elle mauvaise ?', answer: "Non. Le problème est l'effet d'éviction qui apparaît quand on ajoute une récompense à une activité déjà appréciée. Une récompense sur ce qu'on n'avait pas envie de commencer aide à démarrer." },
        { question: 'Le type de motivation est-il fixe ?', answer: "Non. La même personne diffère selon les domaines : motivation intrinsèque pour le sport et régulation externe pour les études, c'est courant." },
        { question: 'Comment utiliser le résultat ?', answer: "Cherchez lequel de l'autonomie, la compétence ou l'affiliation manque dans ce que vous faites. Combler celui qui manque vaut mieux que forcer la volonté." },
      ],
      disclaimer: "Les résultats du type de motivation servent à la compréhension de soi et au dialogue. Ne les utilisez pas comme base de diagnostic, de recrutement ou d'évaluation.",
    },
    es: {
      introTitle: 'La motivación se distingue por el grado de autonomía, no por su fuerza',
      intro: 'La teoría de la autodeterminación de Edward Deci y Richard Ryan no divide la motivación en interna y externa. La coloca en un continuo que va de la desmotivación a la motivación intrínseca, pasando por la regulación externa, introyectada, identificada e integrada. Lo importante no es cuán fuerte es la motivación, sino cuánto se siente la acción como elección propia.',
      conceptTitle: 'Tres necesidades de la autodeterminación',
      concepts: [
        { title: 'Autonomía', body: 'La sensación de haber elegido. Cambiar «tengo que» por «elijo» ya cambia cuánto dura.' },
        { title: 'Competencia', body: 'Crece en tareas ni demasiado fáciles ni demasiado difíciles: la misma condición en que aparece el flow.' },
        { title: 'Vínculo', body: 'La motivación dura más con otras personas. Por eso un grupo de estudio o un compañero de entrenamiento funciona más de lo que parece.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿La motivación externa es mala?', answer: 'No. El problema es el efecto de desplazamiento que aparece al añadir una recompensa a algo que ya disfrutabas. Una recompensa sobre algo que no querías empezar sí ayuda a arrancar.' },
        { question: '¿El tipo de motivación es fijo?', answer: 'No. La misma persona difiere según el ámbito: motivación intrínseca para el ejercicio y regulación externa para el estudio es habitual.' },
        { question: '¿Cómo uso el resultado?', answer: 'Úsalo para ver cuál falta —autonomía, competencia o vínculo— en lo que haces ahora. Llenar el que falta funciona mejor que exprimir la voluntad.' },
      ],
      disclaimer: 'Los resultados del tipo de motivación son para autoconocimiento y conversación. No los uses como base de diagnóstico, contratación o evaluación.',
    },
  },

  'growth-mindset': {
    ko: {
      introTitle: '마인드셋은 능력에 대한 믿음이지 능력 자체가 아니다',
      intro: '스탠퍼드의 캐럴 드웩은 능력을 노력으로 키울 수 있다고 보는 성장 마인드셋과, 타고난 것으로 보는 고정 마인드셋을 구분했다. 같은 실패를 두고 한쪽은 "무엇을 배웠나"를 묻고 다른 쪽은 "역시 나는 안 된다"로 닫는다. 다만 마인드셋 개입의 효과 크기는 초기 보고보다 작다는 대규모 재현 연구가 이어졌으니, 만능 스위치로 읽지는 않는 편이 좋다.',
      conceptTitle: '두 믿음이 갈라지는 지점',
      concepts: [
        { title: '어려운 과제', body: '성장 쪽은 배울 기회로, 고정 쪽은 내 수준이 아니라는 신호로 읽는다.' },
        { title: '타인의 성공', body: '성장 쪽은 방법을 얻고, 고정 쪽은 위협으로 느낀다.' },
        { title: '비판', body: '성장 쪽은 피드백으로 쓰고, 고정 쪽은 방어로 답한다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '마인드셋은 사람마다 하나로 정해지나요?', answer: '아닙니다. 영역마다 다릅니다. 운동에서는 성장 마인드셋인데 수학에서는 고정 마인드셋인 경우가 흔합니다.' },
        { question: '어떻게 바꾸나요?', answer: '"나는 못해"를 "나는 아직 못해"로 바꾸는 언어 습관, 그리고 결과가 아니라 쓴 전략을 스스로 칭찬하는 방식이 자주 권장됩니다.' },
        { question: '성장 마인드셋만 있으면 되나요?', answer: '아닙니다. 믿음만으로 실력이 오르지는 않습니다. 연습의 양과 질, 피드백을 받을 환경이 함께 있어야 합니다.' },
      ],
      disclaimer: '마인드셋 결과는 자기 이해를 위한 참고입니다. 사람의 잠재력을 단정하거나 평가하는 근거로 쓰지 마세요.',
    },
    en: {
      introTitle: 'A mindset is a belief about ability, not ability itself',
      intro: 'Carol Dweck distinguished a growth mindset, which treats ability as developable through effort, from a fixed mindset, which treats it as given. Facing the same failure, one asks what was learned while the other closes with "I am just not built for this." Note that large replication studies have found mindset interventions smaller in effect than early reports suggested, so it is better not to read this as a master switch.',
      conceptTitle: 'Where the two beliefs diverge',
      concepts: [
        { title: 'A hard task', body: 'Growth reads it as a chance to learn; fixed reads it as a signal of not being good enough.' },
        { title: "Someone else's success", body: 'Growth takes the method from it; fixed feels threatened by it.' },
        { title: 'Criticism', body: 'Growth uses it as feedback; fixed answers with defence.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Does each person have one mindset?', answer: 'No. It differs by domain. A growth mindset about exercise alongside a fixed mindset about maths is common.' },
        { question: 'How do you change it?', answer: 'Two habits are commonly recommended: turning "I can\'t" into "I can\'t yet", and praising the strategy you used rather than the outcome.' },
        { question: 'Is a growth mindset enough on its own?', answer: 'No. Belief alone does not raise skill. It needs the amount and quality of practice, and an environment that gives feedback.' },
      ],
      disclaimer: 'Mindset results are a reference for self-understanding. Do not use them to judge or rank anyone\'s potential.',
    },
    ja: {
      introTitle: 'マインドセットは能力そのものではなく、能力についての信念だ',
      intro: 'スタンフォードのキャロル・ドゥエックは、能力は努力で伸ばせるとみる成長マインドセットと、生まれつき決まっているとみる固定マインドセットを分けた。同じ失敗を前に、一方は「何を学んだか」を問い、他方は「やはり自分には無理だ」と閉じる。ただしマインドセット介入の効果量は初期の報告より小さいという大規模な再現研究が続いており、万能のスイッチとして読まない方がよい。',
      conceptTitle: '二つの信念が分かれる場所',
      concepts: [
        { title: '難しい課題', body: '成長側は学ぶ機会と読み、固定側は自分の水準ではない合図と読む。' },
        { title: '他人の成功', body: '成長側は方法を得て、固定側は脅威に感じる。' },
        { title: '批判', body: '成長側はフィードバックとして使い、固定側は防御で答える。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: 'マインドセットは人ごとに一つですか？', answer: 'いいえ。領域ごとに違います。運動では成長、数学では固定、ということはよくあります。' },
        { question: 'どう変えますか？', answer: '「できない」を「まだできない」に言い換える習慣と、結果ではなく使った工夫を自分でほめる方法がよく勧められます。' },
        { question: '成長マインドセットだけで足りますか？', answer: 'いいえ。信念だけで実力は上がりません。練習の量と質、フィードバックの得られる環境が要ります。' },
      ],
      disclaimer: 'マインドセットの結果は自己理解のための参考です。人の潜在能力を断定したり評価したりする根拠には使わないでください。',
    },
    zh: {
      introTitle: '心态是关于能力的信念，不是能力本身',
      intro: '斯坦福的卡罗尔·德韦克区分了成长型心态与固定型心态：前者认为能力可通过努力发展，后者认为能力是天生的。面对同一次失败，一方问"我学到了什么"，另一方则以"我果然不行"收场。不过大规模重复研究发现，心态干预的效应量小于早期报告，因此不宜把它当成万能开关。',
      conceptTitle: '两种信念分岔的地方',
      concepts: [
        { title: '困难任务', body: '成长型读作学习机会，固定型读作"这不是我的水平"。' },
        { title: '他人的成功', body: '成长型从中拿到方法，固定型感到威胁。' },
        { title: '批评', body: '成长型当作反馈，固定型以防御回应。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '每个人只有一种心态吗？', answer: '不是。它因领域而异。对运动是成长型、对数学是固定型，这很常见。' },
        { question: '如何改变？', answer: '常见的两个习惯：把"我不行"换成"我还不行"；以及称赞自己用的策略而不是结果。' },
        { question: '只有成长型心态就够了吗？', answer: '不够。仅有信念不会提升能力，还需要练习的量与质，以及能获得反馈的环境。' },
      ],
      disclaimer: '心态结果仅供自我理解参考，请勿用来断定或评价他人的潜力。',
    },
    fr: {
      introTitle: "Un état d'esprit est une croyance sur la capacité, pas la capacité elle-même",
      intro: "Carol Dweck a distingué l'état d'esprit de développement, qui tient la capacité pour perfectible par l'effort, de l'état d'esprit fixe, qui la tient pour donnée. Devant le même échec, l'un demande ce qui a été appris, l'autre conclut « je ne suis pas fait pour ça ». Notons que de vastes études de réplication trouvent aux interventions sur l'état d'esprit un effet plus faible que les premiers rapports : mieux vaut ne pas y voir un interrupteur universel.",
      conceptTitle: 'Où les deux croyances divergent',
      concepts: [
        { title: 'Une tâche difficile', body: "Le développement y lit une occasion d'apprendre ; le fixe, un signe que ce n'est pas son niveau." },
        { title: "Le succès d'autrui", body: 'Le développement en tire la méthode ; le fixe se sent menacé.' },
        { title: 'La critique', body: 'Le développement en fait un retour utile ; le fixe répond par la défense.' },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: "Chacun a-t-il un seul état d'esprit ?", answer: 'Non. Il varie selon le domaine : développement pour le sport et fixe pour les mathématiques, c\'est courant.' },
        { question: 'Comment en changer ?', answer: 'Deux habitudes sont souvent recommandées : transformer « je ne sais pas faire » en « je ne sais pas encore faire », et se féliciter de la stratégie employée plutôt que du résultat.' },
        { question: "L'état d'esprit de développement suffit-il ?", answer: "Non. La croyance seule n'augmente pas la compétence. Il faut aussi la quantité et la qualité de la pratique, et un environnement qui donne du retour." },
      ],
      disclaimer: "Les résultats servent à la compréhension de soi. Ne les utilisez pas pour juger ou classer le potentiel de quiconque.",
    },
    es: {
      introTitle: 'Una mentalidad es una creencia sobre la capacidad, no la capacidad misma',
      intro: 'Carol Dweck distinguió la mentalidad de crecimiento, que ve la capacidad como desarrollable con esfuerzo, de la mentalidad fija, que la ve como dada. Ante el mismo fracaso, una pregunta qué se aprendió y la otra cierra con «no estoy hecho para esto». Conviene señalar que amplios estudios de replicación han hallado efectos menores de lo que sugerían los primeros informes, así que no conviene leerlo como un interruptor mágico.',
      conceptTitle: 'Dónde divergen las dos creencias',
      concepts: [
        { title: 'Una tarea difícil', body: 'Crecimiento la lee como ocasión de aprender; fija, como señal de que no es su nivel.' },
        { title: 'El éxito ajeno', body: 'Crecimiento toma el método; fija se siente amenazada.' },
        { title: 'La crítica', body: 'Crecimiento la usa como información; fija responde defendiéndose.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Cada persona tiene una sola mentalidad?', answer: 'No. Varía según el ámbito: mentalidad de crecimiento para el deporte y fija para las matemáticas es habitual.' },
        { question: '¿Cómo se cambia?', answer: 'Se recomiendan dos hábitos: convertir «no puedo» en «todavía no puedo», y felicitarse por la estrategia usada más que por el resultado.' },
        { question: '¿Basta con la mentalidad de crecimiento?', answer: 'No. La creencia sola no sube la habilidad. Hacen falta cantidad y calidad de práctica, y un entorno que dé retroalimentación.' },
      ],
      disclaimer: 'Los resultados son una referencia para el autoconocimiento. No los uses para juzgar o clasificar el potencial de nadie.',
    },
  },

  'leadership-style': {
    ko: {
      introTitle: '뛰어난 리더는 한 스타일을 잘하는 사람이 아니라 상황에 맞게 바꾸는 사람이다',
      intro: '다니엘 골먼은 리더십을 비전형·코칭형·친화형·민주형·선도형·지시형 여섯으로 나누었다. 핵심은 어느 하나가 정답이 아니라는 것이다. 위기에는 지시형이 필요하고, 갈등을 봉합할 때는 친화형이, 합의가 필요할 때는 민주형이 듣는다. 문제는 한 스타일만 반복해서 쓰는 것이다.',
      conceptTitle: '여섯 스타일이 듣는 자리',
      concepts: [
        { title: '방향이 필요할 때', body: '비전형이 "나를 따라오세요"로 그림을 준다. 변화기에 강하다.' },
        { title: '사람을 키울 때', body: '코칭형과 민주형이 자율성을 키운다. 성숙한 팀원에게 특히 맞는다.' },
        { title: '급할 때', body: '지시형과 선도형이 속도를 낸다. 다만 오래 쓰면 분위기와 이직률에 대가를 치른다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '리더십 스타일은 바꿀 수 있나요?', answer: '리더십은 훈련 가능한 역량으로 다뤄집니다. 다만 강점 스타일에서 출발해 레퍼토리를 넓히는 편이 현실적입니다.' },
        { question: '선도형·지시형은 나쁜가요?', answer: '아닙니다. 위기와 마감에는 필요합니다. 다만 상시 모드로 두면 팀 분위기에 부담이 쌓이므로 보조로 쓰는 편이 낫습니다.' },
        { question: '결과가 여러 스타일로 나오면요?', answer: '좋은 신호에 가깝습니다. 상황에 따라 다르게 반응한다는 뜻이니, 어떤 상황에서 어떤 스타일이 나오는지 짚어 보세요.' },
      ],
      disclaimer: '리더십 스타일 결과는 자기 이해와 팀 대화를 위한 참고입니다. 채용·평가·승진의 근거로 사용하지 마세요.',
    },
    en: {
      introTitle: 'Strong leaders are not those with one great style but those who switch to fit the situation',
      intro: 'Daniel Goleman described six styles: visionary, coaching, affiliative, democratic, pacesetting and commanding. The point is that none of them is the right answer. A crisis calls for commanding, repairing conflict calls for affiliative, and building consensus calls for democratic. The problem is using only one of them, always.',
      conceptTitle: 'Where each style fits',
      concepts: [
        { title: 'When direction is missing', body: 'Visionary gives the picture — "come with me". Strong in periods of change.' },
        { title: 'When people need to grow', body: 'Coaching and democratic build autonomy, especially with experienced team members.' },
        { title: 'When speed is required', body: 'Commanding and pacesetting move fast, but used for long they cost you climate and retention.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Can a leadership style be changed?', answer: 'Leadership is treated as a trainable capability. It is more realistic to start from your strong style and widen the repertoire than to replace it.' },
        { question: 'Are pacesetting and commanding bad?', answer: 'No. Crises and deadlines need them. Left as the permanent mode they load the team climate, so they work better as secondary styles.' },
        { question: 'What if several styles come out?', answer: 'That is closer to a good sign — it means you respond differently by situation. Look at which situations bring out which style.' },
      ],
      disclaimer: 'Leadership style results are for self-understanding and team conversation. Do not use them as a basis for hiring, appraisal, or promotion.',
    },
    ja: {
      introTitle: '優れたリーダーは一つの型が上手い人ではなく、状況に合わせて切り替える人だ',
      intro: 'ダニエル・ゴールマンはリーダーシップをビジョン型・コーチ型・関係重視型・民主型・ペースセッター型・強制型の六つに分けた。要点は、どれか一つが正解ではないということだ。危機には強制型が要り、対立の修復には関係重視型が、合意形成には民主型が効く。問題は一つの型だけを使い続けることにある。',
      conceptTitle: '六つの型が効く場所',
      concepts: [
        { title: '方向が要るとき', body: 'ビジョン型が「ついてきてほしい」と絵を渡す。変化期に強い。' },
        { title: '人を育てるとき', body: 'コーチ型と民主型が自律性を育てる。成熟した相手に特に合う。' },
        { title: '急ぐとき', body: '強制型とペースセッター型は速い。ただし長く使うと雰囲気と離職率で代償を払う。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: 'リーダーシップの型は変えられますか？', answer: 'リーダーシップは訓練可能な能力として扱われます。ただし強みの型から出発してレパートリーを広げる方が現実的です。' },
        { question: 'ペースセッター型・強制型は悪いのですか？', answer: 'いいえ。危機や締切には必要です。常時モードにすると雰囲気に負荷が溜まるので、補助として使う方がよいです。' },
        { question: '複数の型が出たら？', answer: 'むしろ良い兆しです。状況で反応が違うということなので、どの状況でどの型が出るかを見てください。' },
      ],
      disclaimer: 'リーダーシップの結果は自己理解とチームの対話のための参考です。採用・評価・昇進の根拠には使わないでください。',
    },
    zh: {
      introTitle: '优秀的领导者不是把一种风格做到极致，而是随情境切换',
      intro: '丹尼尔·戈尔曼把领导风格分为六种：愿景型、教练型、亲和型、民主型、领跑型和命令型。要点在于没有哪一种是标准答案。危机需要命令型，修复冲突需要亲和型，形成共识需要民主型。问题在于只用一种。',
      conceptTitle: '六种风格各自的位置',
      concepts: [
        { title: '缺少方向时', body: '愿景型给出图景——"跟我来"。在变革期尤其有力。' },
        { title: '要培养人时', body: '教练型与民主型培养自主性，对成熟成员尤其合适。' },
        { title: '需要速度时', body: '命令型与领跑型跑得快，但长期使用会在团队氛围和流失率上付出代价。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '领导风格可以改变吗？', answer: '领导力被视为可训练的能力。不过从自己的强项风格出发、逐步拓宽更现实。' },
        { question: '领跑型和命令型不好吗？', answer: '不是。危机和截止需要它们。但作为常态会给团队氛围加压，更适合当作辅助风格。' },
        { question: '如果出现多种风格呢？', answer: '这更接近好迹象，说明你会因情境而异。请看看哪种情境引出哪种风格。' },
      ],
      disclaimer: '领导风格结果用于自我理解与团队对话，请勿作为招聘、考核或晋升的依据。',
    },
    fr: {
      introTitle: "Un bon dirigeant n'excelle pas dans un seul style : il change selon la situation",
      intro: "Daniel Goleman a décrit six styles : visionnaire, coaching, affiliatif, démocratique, chef de file et directif. L'essentiel est qu'aucun n'est la bonne réponse. Une crise appelle le directif, la réparation d'un conflit l'affiliatif, la recherche de consensus le démocratique. Le problème est de n'en utiliser qu'un, toujours.",
      conceptTitle: 'Où chaque style trouve sa place',
      concepts: [
        { title: 'Quand la direction manque', body: 'Le visionnaire donne l\'image — « venez avec moi ». Fort en période de changement.' },
        { title: 'Quand il faut faire grandir', body: "Coaching et démocratique développent l'autonomie, surtout avec des équipiers expérimentés." },
        { title: 'Quand il faut aller vite', body: "Directif et chef de file avancent vite, mais utilisés longtemps ils coûtent en climat et en fidélisation." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Peut-on changer de style ?', answer: "Le leadership est traité comme une compétence qui se travaille. Il est plus réaliste de partir de son style fort et d'élargir le répertoire." },
        { question: 'Chef de file et directif sont-ils mauvais ?', answer: "Non. Les crises et les échéances en ont besoin. En mode permanent ils chargent le climat : mieux vaut les garder en styles secondaires." },
        { question: 'Et si plusieurs styles ressortent ?', answer: "C'est plutôt bon signe : vous réagissez différemment selon la situation. Regardez quelle situation fait sortir quel style." },
      ],
      disclaimer: "Les résultats servent à la compréhension de soi et au dialogue d'équipe. Ne les utilisez pas pour recruter, évaluer ou promouvoir.",
    },
    es: {
      introTitle: 'Un buen líder no domina un solo estilo: cambia según la situación',
      intro: 'Daniel Goleman describió seis estilos: visionario, coaching, afiliativo, democrático, ejemplarizante y coercitivo. Lo importante es que ninguno es la respuesta correcta. Una crisis pide el coercitivo, reparar un conflicto pide el afiliativo y construir consenso pide el democrático. El problema es usar siempre uno solo.',
      conceptTitle: 'Dónde encaja cada estilo',
      concepts: [
        { title: 'Cuando falta dirección', body: 'El visionario da la imagen: «venid conmigo». Fuerte en épocas de cambio.' },
        { title: 'Cuando hay que hacer crecer', body: 'Coaching y democrático desarrollan autonomía, sobre todo con personas con experiencia.' },
        { title: 'Cuando hace falta velocidad', body: 'Coercitivo y ejemplarizante avanzan rápido, pero usados mucho tiempo cuestan clima y retención.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Se puede cambiar de estilo?', answer: 'El liderazgo se trata como una capacidad entrenable. Es más realista partir del estilo fuerte y ampliar el repertorio.' },
        { question: '¿Son malos el ejemplarizante y el coercitivo?', answer: 'No. Las crisis y los plazos los necesitan. Como modo permanente cargan el clima, así que funcionan mejor como secundarios.' },
        { question: '¿Y si salen varios estilos?', answer: 'Es más bien buena señal: respondes distinto según la situación. Mira qué situación saca qué estilo.' },
      ],
      disclaimer: 'Los resultados sirven para el autoconocimiento y la conversación de equipo. No los uses para contratar, evaluar o promocionar.',
    },
  },

  'resilience': {
    ko: {
      introTitle: '회복탄력성은 강함이 아니라 되돌아오는 유연함이다',
      intro: '역경 뒤에 원래의 기능으로 돌아오고 때로 더 나아지는 능력을 회복탄력성이라 부른다. 앤 마스턴은 이를 특별한 사람의 재능이 아니라 평범한 적응 체계가 작동한 결과라는 뜻에서 "보통의 마법"이라 표현했다. 타고나는 부분도 있지만 관계와 환경으로 상당 부분 달라진다.',
      conceptTitle: '회복을 떠받치는 것들',
      concepts: [
        { title: '감정 조절', body: '어려운 상황에서도 충동과 감정을 다룰 수 있는 폭. 마음챙김 훈련이 자주 권장되는 자리다.' },
        { title: '긍정 정서', body: '바버라 프레드릭슨의 확장-구축 이론은 긍정 정서가 시야와 행동 목록을 넓혀 자원을 쌓는다고 본다.' },
        { title: '사회적 지지', body: '신뢰하는 관계가 가장 일관되게 관찰되는 보호 요인이다. 혼자 버티는 것이 회복탄력성이 아니다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '회복탄력성이 높으면 상처를 안 받나요?', answer: '아닙니다. 흔들리지 않는 것이 아니라 흔들린 뒤 돌아오는 폭에 가깝습니다. 고통을 느끼지 않는 상태를 목표로 삼지 마세요.' },
        { question: '훈련으로 늘릴 수 있나요?', answer: '상당 부분 그렇습니다. 다만 개인 훈련만으로는 한계가 있고, 관계와 환경 같은 외부 자원이 함께 있어야 합니다.' },
        { question: '점수가 낮으면 문제인가요?', answer: '지금 부담이 크다는 신호일 수 있습니다. 사람의 등급이 아니라 지금 필요한 지원을 찾는 단서로 읽으세요.' },
      ],
      disclaimer: '회복탄력성 결과는 자기 이해를 위한 참고입니다. 임상 진단이 아니며, 어려움이 오래 지속되면 전문가와 상의하세요.',
    },
    en: {
      introTitle: 'Resilience is not toughness but the flexibility to come back',
      intro: 'Resilience is the capacity to return to functioning after adversity, and sometimes to grow through it. Ann Masten called it "ordinary magic" — not a gift of exceptional people but ordinary adaptive systems doing their work. Some of it is dispositional, but relationships and circumstances move it a great deal.',
      conceptTitle: 'What holds recovery up',
      concepts: [
        { title: 'Emotion regulation', body: 'The room you have to handle impulse and feeling under pressure. This is where mindfulness training is commonly recommended.' },
        { title: 'Positive emotion', body: "Barbara Fredrickson's broaden-and-build theory holds that positive emotion widens attention and action repertoires, accumulating resources." },
        { title: 'Social support', body: 'Trusted relationships are the most consistently observed protective factor. Enduring alone is not resilience.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Does high resilience mean nothing hurts?', answer: 'No. It is closer to how far you come back after being shaken than to not being shaken. Do not make the absence of pain the goal.' },
        { question: 'Can it be trained?', answer: 'Substantially, yes. But individual training alone has limits; external resources such as relationships and circumstances have to be there too.' },
        { question: 'Is a low score a problem?', answer: 'It may signal that the load is heavy right now. Read it as a clue about the support you need, not as a rank of the person.' },
      ],
      disclaimer: 'Resilience results are a reference for self-understanding. This is not a clinical assessment; if difficulty persists, consider speaking with a professional.',
    },
    ja: {
      introTitle: '回復力は強さではなく、戻ってくるしなやかさだ',
      intro: '逆境のあとに元の機能へ戻り、ときにより良くなる力を回復力と呼ぶ。アン・マステンはこれを特別な人の才能ではなく、ふつうの適応システムが働いた結果という意味で「ありふれた魔法」と呼んだ。生まれつきの部分もあるが、関係や環境でかなり変わる。',
      conceptTitle: '回復を支えるもの',
      concepts: [
        { title: '感情調整', body: '難しい状況でも衝動と感情を扱える幅。マインドフルネスの訓練がよく勧められる場所だ。' },
        { title: 'ポジティブ感情', body: 'バーバラ・フレドリクソンの拡張-形成理論は、ポジティブ感情が視野と行動の幅を広げ資源を蓄えるとみる。' },
        { title: '社会的支え', body: '信頼できる関係が最も一貫して観察される保護要因だ。ひとりで耐えることが回復力ではない。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '回復力が高いと傷つかないのですか？', answer: 'いいえ。揺れないことではなく、揺れたあとに戻る幅に近いです。痛みを感じない状態を目標にしないでください。' },
        { question: '訓練で伸びますか？', answer: 'かなりの部分は伸びます。ただ個人の訓練だけでは限界があり、関係や環境という外の資源も要ります。' },
        { question: '点数が低いと問題ですか？', answer: '今の負荷が大きいという合図かもしれません。人の等級ではなく、いま必要な支援を探す手がかりとして読んでください。' },
      ],
      disclaimer: '回復力の結果は自己理解のための参考です。臨床的評価ではありません。困難が続く場合は専門家にご相談ください。',
    },
    zh: {
      introTitle: '心理韧性不是刚强，而是能弹回来的柔韧',
      intro: '心理韧性指逆境之后恢复功能、有时还能因此成长的能力。安·马斯滕称之为"平凡的魔法"——它不是少数人的天赋，而是普通适应系统在起作用。其中有先天成分，但关系与环境会带来很大差别。',
      conceptTitle: '支撑恢复的东西',
      concepts: [
        { title: '情绪调节', body: '在压力下处理冲动与情绪的余地。这是正念训练常被推荐的位置。' },
        { title: '积极情绪', body: '芭芭拉·弗雷德里克森的扩展-建构理论认为，积极情绪拓宽注意与行动范围，从而积累资源。' },
        { title: '社会支持', body: '可信任的关系是被最一致观察到的保护因素。独自硬撑并不是韧性。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '韧性高就不会受伤吗？', answer: '不是。它更接近被动摇之后回来的幅度，而不是不被动摇。不要把"不痛"当作目标。' },
        { question: '可以训练吗？', answer: '很大程度可以。但仅靠个人训练有限，还需要关系与环境这类外部资源。' },
        { question: '分数低是问题吗？', answer: '这可能说明当下负荷很重。请把它读作寻找所需支持的线索，而不是对人的评级。' },
      ],
      disclaimer: '韧性结果仅供自我理解参考。这不是临床评估；若困难持续，请考虑咨询专业人士。',
    },
    fr: {
      introTitle: "La résilience n'est pas la dureté mais la souplesse de revenir",
      intro: "La résilience est la capacité à retrouver son fonctionnement après l'adversité, parfois à en sortir grandi. Ann Masten l'a appelée « magie ordinaire » : non le don de quelques-uns, mais des systèmes adaptatifs ordinaires qui font leur travail. Une part est dispositionnelle, mais relations et circonstances la déplacent beaucoup.",
      conceptTitle: 'Ce qui soutient la récupération',
      concepts: [
        { title: 'Régulation émotionnelle', body: "La marge dont vous disposez pour gérer impulsions et émotions sous pression. C'est là que la pleine conscience est souvent recommandée." },
        { title: 'Émotions positives', body: "La théorie « élargir et construire » de Barbara Fredrickson soutient que les émotions positives élargissent l'attention et le répertoire d'actions, accumulant des ressources." },
        { title: 'Soutien social', body: "Les relations de confiance sont le facteur protecteur le plus constamment observé. Tenir seul n'est pas de la résilience." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Une forte résilience empêche-t-elle de souffrir ?', answer: "Non. Elle tient davantage à l'ampleur du retour après avoir été ébranlé qu'au fait de ne pas l'être. N'en faites pas un objectif d'absence de douleur." },
        { question: 'Peut-on la travailler ?', answer: "En bonne partie, oui. Mais l'entraînement individuel a ses limites : il faut aussi des ressources extérieures, relations et circonstances." },
        { question: 'Un score bas est-il un problème ?', answer: "Il peut signaler une charge lourde en ce moment. Lisez-le comme un indice du soutien nécessaire, pas comme un classement de la personne." },
      ],
      disclaimer: "Les résultats servent à la compréhension de soi. Ce n'est pas une évaluation clinique ; si la difficulté persiste, envisagez de consulter un professionnel.",
    },
    es: {
      introTitle: 'La resiliencia no es dureza sino la flexibilidad de volver',
      intro: 'La resiliencia es la capacidad de recuperar el funcionamiento tras la adversidad y, a veces, de crecer con ella. Ann Masten la llamó «magia ordinaria»: no un don de unos pocos, sino sistemas adaptativos corrientes haciendo su trabajo. Hay una parte disposicional, pero las relaciones y las circunstancias la mueven mucho.',
      conceptTitle: 'Lo que sostiene la recuperación',
      concepts: [
        { title: 'Regulación emocional', body: 'El margen para manejar impulsos y emociones bajo presión. Aquí es donde suele recomendarse el entrenamiento en atención plena.' },
        { title: 'Emoción positiva', body: 'La teoría de ampliación y construcción de Barbara Fredrickson sostiene que la emoción positiva amplía la atención y el repertorio de acción, acumulando recursos.' },
        { title: 'Apoyo social', body: 'Las relaciones de confianza son el factor protector observado con más constancia. Aguantar en soledad no es resiliencia.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Mucha resiliencia significa no sufrir?', answer: 'No. Se parece más a cuánto vuelves tras ser sacudido que a no serlo. No conviertas la ausencia de dolor en el objetivo.' },
        { question: '¿Se puede entrenar?', answer: 'En buena medida, sí. Pero el entrenamiento individual tiene límites: también hacen falta recursos externos, relaciones y circunstancias.' },
        { question: '¿Una puntuación baja es un problema?', answer: 'Puede indicar que la carga es alta ahora. Léela como pista sobre el apoyo que necesitas, no como una calificación de la persona.' },
      ],
      disclaimer: 'Los resultados son una referencia para el autoconocimiento. No es una evaluación clínica; si la dificultad persiste, considera hablar con un profesional.',
    },
  },

  'emotional-mind': {
    ko: {
      introTitle: '감정 지능은 감정을 없애는 능력이 아니라 알아차리고 다루는 능력이다',
      intro: '다니엘 골먼이 대중화한 감정 지능(EQ)은 자기 인식·자기 조절·동기·공감·사회적 기술 다섯 영역으로 이야기된다. 다만 "성공의 80%는 EQ" 같은 주장은 근거가 약하다. 연구에서 EQ 측정치는 대인관계가 큰 비중을 차지하는 일에서 성과와 관련이 관찰되지만, 지능이나 성실성 같은 기존 지표를 넘어서는 설명력은 크지 않은 편이다.',
      conceptTitle: '골먼 모델의 다섯 영역',
      concepts: [
        { title: '알아차리기', body: '자기 인식은 지금 어떤 감정인지, 왜 그런지 실시간으로 아는 것에서 시작한다.' },
        { title: '다루기', body: '자기 조절은 감정을 없애는 것이 아니라 충동적 표출과 행동 사이에 간격을 두는 일이다.' },
        { title: '이어지기', body: '공감과 사회적 기술은 상대의 관점을 읽고 관계를 유지·회복하는 쪽으로 이어진다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: 'EQ가 IQ보다 중요한가요?', answer: '그렇게 단정할 근거는 약합니다. 대인관계 비중이 큰 역할에서 관련이 관찰되지만, 기존 지표를 대체한다는 주장은 과장에 가깝습니다.' },
        { question: 'EQ는 훈련되나요?', answer: '자기 인식과 조절은 연습으로 달라지는 편이라고 보고됩니다. 감정에 이름 붙이기, 반응 전에 간격 두기 같은 구체적 습관이 자주 권장됩니다.' },
        { question: '점수가 낮으면 공감 능력이 없는 건가요?', answer: '아닙니다. 자기 보고 척도는 그날의 상태와 자기 인식 수준에 크게 좌우됩니다. 부족한 영역을 찾는 지도로 쓰세요.' },
      ],
      disclaimer: '감정 지능 결과는 자기 이해와 대화를 위한 참고입니다. 채용·평가·진단의 근거로 사용하지 마세요.',
    },
    en: {
      introTitle: 'Emotional intelligence is not the ability to remove feelings but to notice and work with them',
      intro: 'Emotional intelligence, popularised by Daniel Goleman, is usually described across five areas: self-awareness, self-regulation, motivation, empathy and social skill. Claims such as "80% of success is EQ" are weakly supported. Research finds EQ measures related to performance in roles where interpersonal work matters, but their explanatory power beyond established measures such as intelligence and conscientiousness tends to be modest.',
      conceptTitle: "The five areas in Goleman's model",
      concepts: [
        { title: 'Noticing', body: 'Self-awareness begins with knowing, in real time, what you feel and why.' },
        { title: 'Working with it', body: 'Self-regulation is not removing emotion but putting a gap between impulse and action.' },
        { title: 'Connecting', body: 'Empathy and social skill extend into reading another view and maintaining or repairing a relationship.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Does EQ matter more than IQ?', answer: 'The evidence for that claim is weak. Relationships with performance are observed in interpersonal roles, but the idea that it replaces established measures is closer to overstatement.' },
        { question: 'Can EQ be trained?', answer: 'Self-awareness and regulation are reported to shift with practice. Concrete habits are commonly recommended: naming the emotion, leaving a gap before responding.' },
        { question: 'Does a low score mean I lack empathy?', answer: 'No. Self-report scales depend heavily on the state of the day and on how well you read yourself. Use it as a map of which area is thin.' },
      ],
      disclaimer: 'Emotional intelligence results are for self-understanding and conversation. Do not use them as a basis for hiring, appraisal, or diagnosis.',
    },
    ja: {
      introTitle: '感情知性は感情を消す力ではなく、気づいて扱う力だ',
      intro: 'ダニエル・ゴールマンが広めた感情知性(EQ)は、自己認識・自己調整・動機づけ・共感・社会的スキルの五領域で語られる。ただし「成功の8割はEQ」といった主張の根拠は弱い。対人比重の大きい仕事で成果との関連は観察されるが、知能や誠実性など既存の指標を超える説明力は大きくない方だ。',
      conceptTitle: 'ゴールマン・モデルの五領域',
      concepts: [
        { title: '気づく', body: '自己認識は、今どんな感情か、なぜかをその場で知ることから始まる。' },
        { title: '扱う', body: '自己調整は感情を消すことではなく、衝動と行動の間に隙間を置くことだ。' },
        { title: 'つながる', body: '共感と社会的スキルは、相手の視点を読み関係を保ち修復する方へ伸びる。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: 'EQはIQより重要ですか？', answer: 'そう断じる根拠は弱いです。対人比重の大きい役割では関連が見られますが、既存の指標を置き換えるという主張は誇張に近いです。' },
        { question: 'EQは訓練できますか？', answer: '自己認識と調整は練習で変わると報告されています。感情に名前をつける、反応の前に隙間を置くといった具体的な習慣がよく勧められます。' },
        { question: '点数が低いと共感力がないのですか？', answer: 'いいえ。自己報告の尺度はその日の状態と自己認識の程度に大きく左右されます。どの領域が薄いかの地図として使ってください。' },
      ],
      disclaimer: '感情知性の結果は自己理解と対話のための参考です。採用・評価・診断の根拠には使わないでください。',
    },
    zh: {
      introTitle: '情绪智力不是消除情绪的能力，而是察觉并处理它的能力',
      intro: '由丹尼尔·戈尔曼推广的情绪智力(EQ)通常按五个领域来讲：自我觉察、自我调节、动机、共情与社交技能。不过"成功的八成靠EQ"这类说法证据薄弱。研究发现EQ量表在人际比重大的岗位上与绩效相关，但相对于智力、尽责性等既有指标的增量解释力通常有限。',
      conceptTitle: '戈尔曼模型的五个领域',
      concepts: [
        { title: '察觉', body: '自我觉察从实时知道自己此刻是什么情绪、为什么开始。' },
        { title: '处理', body: '自我调节不是消除情绪，而是在冲动与行动之间留出间隔。' },
        { title: '连接', body: '共情与社交技能延伸为读懂他人视角、维持并修复关系。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: 'EQ比IQ更重要吗？', answer: '这一说法证据薄弱。在人际岗位上能观察到相关，但说它取代既有指标更接近夸大。' },
        { question: 'EQ可以训练吗？', answer: '有报告显示自我觉察与调节会随练习变化。常被推荐的具体习惯包括给情绪命名、在回应前留出间隔。' },
        { question: '分数低意味着没有共情吗？', answer: '不是。自陈量表很大程度受当天状态和自我认识水平影响。请把它当作查看哪个领域较薄的地图。' },
      ],
      disclaimer: '情绪智力结果用于自我理解与对话，请勿作为招聘、考核或诊断的依据。',
    },
    fr: {
      introTitle: "L'intelligence émotionnelle n'est pas la capacité de supprimer les émotions mais de les remarquer et de les travailler",
      intro: "L'intelligence émotionnelle, popularisée par Daniel Goleman, se décrit en cinq domaines : conscience de soi, autorégulation, motivation, empathie et aptitude sociale. Les affirmations du type « 80 % du succès vient de l'EQ » sont faiblement étayées. La recherche observe des liens avec la performance dans les rôles très relationnels, mais leur pouvoir explicatif au-delà de mesures établies comme l'intelligence et la conscienciosité reste modeste.",
      conceptTitle: 'Les cinq domaines du modèle de Goleman',
      concepts: [
        { title: 'Remarquer', body: 'La conscience de soi commence par savoir, en temps réel, ce que vous ressentez et pourquoi.' },
        { title: 'Travailler avec', body: "L'autorégulation ne supprime pas l'émotion : elle place un intervalle entre l'impulsion et l'action." },
        { title: 'Relier', body: "Empathie et aptitude sociale prolongent vers la lecture du point de vue d'autrui et l'entretien ou la réparation du lien." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: "L'EQ compte-t-il plus que le QI ?", answer: "Les preuves sont faibles. Des liens avec la performance apparaissent dans les rôles relationnels, mais l'idée qu'il remplace les mesures établies relève de l'exagération." },
        { question: "L'EQ se travaille-t-il ?", answer: "Conscience de soi et régulation évoluent avec la pratique, d'après les travaux disponibles. On recommande des habitudes concrètes : nommer l'émotion, laisser un intervalle avant de répondre." },
        { question: 'Un score bas signifie-t-il un manque d\'empathie ?', answer: "Non. Les échelles auto-rapportées dépendent beaucoup de l'état du jour et de la lecture qu'on a de soi. Servez-vous-en comme d'une carte des domaines minces." },
      ],
      disclaimer: "Les résultats servent à la compréhension de soi et au dialogue. Ne les utilisez pas pour recruter, évaluer ou diagnostiquer.",
    },
    es: {
      introTitle: 'La inteligencia emocional no es quitar las emociones sino notarlas y manejarlas',
      intro: 'La inteligencia emocional, popularizada por Daniel Goleman, suele describirse en cinco áreas: autoconciencia, autorregulación, motivación, empatía y habilidad social. Afirmaciones como «el 80% del éxito es la IE» tienen poco respaldo. La investigación observa relaciones con el desempeño en puestos muy interpersonales, pero su poder explicativo más allá de medidas ya establecidas —inteligencia, responsabilidad— suele ser modesto.',
      conceptTitle: 'Las cinco áreas del modelo de Goleman',
      concepts: [
        { title: 'Notar', body: 'La autoconciencia empieza por saber, en tiempo real, qué sientes y por qué.' },
        { title: 'Manejar', body: 'La autorregulación no elimina la emoción: pone un intervalo entre el impulso y la acción.' },
        { title: 'Conectar', body: 'Empatía y habilidad social se extienden a leer la perspectiva ajena y sostener o reparar el vínculo.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Importa más la IE que el CI?', answer: 'La evidencia para eso es débil. Se observan relaciones con el desempeño en puestos interpersonales, pero decir que sustituye a las medidas establecidas es una exageración.' },
        { question: '¿Se puede entrenar?', answer: 'Se reporta que la autoconciencia y la regulación cambian con la práctica. Se recomiendan hábitos concretos: nombrar la emoción, dejar un intervalo antes de responder.' },
        { question: '¿Una puntuación baja significa falta de empatía?', answer: 'No. Las escalas autoinformadas dependen mucho del estado del día y de cuánto te lees a ti mismo. Úsala como mapa de qué área está delgada.' },
      ],
      disclaimer: 'Los resultados son para autoconocimiento y conversación. No los uses como base de contratación, evaluación o diagnóstico.',
    },
  },

  'disc-personality': {
    ko: {
      introTitle: 'DISC 는 성격이 아니라 관찰 가능한 행동 성향을 다룬다',
      intro: 'DISC 는 1928년 윌리엄 마스턴의 『보통 사람의 감정』에 뿌리를 두고, 이후 산업심리학자들이 측정 도구로 다듬은 행동 프로파일이다. 주도(D)·사교(I)·안정(S)·신중(C) 네 축으로 반응 방식을 본다. 널리 쓰이지만 학술적 검증은 5요인(Big Five) 계열보다 약하다는 점은 알고 쓰는 편이 좋다 — 자기 이해와 팀 대화에는 유용하고, 채용 선별의 근거로는 적절하지 않다.',
      conceptTitle: '네 축이 보는 것',
      concepts: [
        { title: 'D · I', body: '주도형은 결과와 속도로, 사교형은 사람과 설득으로 상황을 움직인다. 둘 다 바깥을 향하는 힘이다.' },
        { title: 'S · C', body: '안정형은 일관성과 신뢰로, 신중형은 정확성과 기준으로 상황을 지탱한다. 둘 다 안을 다지는 힘이다.' },
        { title: '맹점', body: 'D는 감정을 놓치고, I는 마감이 약하고, S는 의견 표현이 늦고, C는 분석에 갇힐 수 있다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '좋은 유형과 나쁜 유형이 있나요?', answer: '없습니다. 각 축은 어떤 상황에서 강점이 되고 다른 상황에서 비용이 됩니다. 마감이 급할 때와 신뢰를 쌓을 때 필요한 축이 다릅니다.' },
        { question: '결과가 상황마다 달라지는데 정상인가요?', answer: '정상입니다. DISC 는 타고난 본질이 아니라 지금 맥락에서의 행동 경향을 봅니다. 직장과 집에서 다르게 나오는 것이 흔합니다.' },
        { question: '채용에 써도 되나요?', answer: '권하지 않습니다. 검증 수준이 선발 도구로 쓰기에는 충분하지 않습니다. 팀 안에서 서로의 작동 방식을 이야기하는 재료로 쓰세요.' },
      ],
      disclaimer: 'DISC 결과는 자기 이해와 팀 대화를 위한 참고입니다. 채용, 배치, 평가의 근거로 사용하지 마세요.',
    },
    en: {
      introTitle: 'DISC describes observable behavioural tendencies, not personality',
      intro: 'DISC traces back to William Moulton Marston’s 1928 Emotions of Normal People and was later shaped into an assessment by industrial psychologists. It reads how you respond along four axes: dominance, influence, steadiness and conscientiousness. It is widely used, but its academic validation is weaker than Big Five style instruments — useful for self-understanding and team conversation, not appropriate as a basis for hiring decisions.',
      conceptTitle: 'What the four axes look at',
      concepts: [
        { title: 'D and I', body: 'Dominance moves a situation through results and speed; influence through people and persuasion. Both push outward.' },
        { title: 'S and C', body: 'Steadiness holds a situation through consistency and trust; conscientiousness through accuracy and standards. Both consolidate.' },
        { title: 'Blind spots', body: 'D can miss feelings, I can be weak on deadlines, S can be slow to voice a view, C can get stuck in analysis.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Are some types better than others?', answer: 'No. Each axis is a strength in one situation and a cost in another. A tight deadline and a trust-building phase call for different axes.' },
        { question: 'My result changes by situation — is that normal?', answer: 'Yes. DISC reads behavioural tendency in a context, not an inborn essence. Differing at work and at home is common.' },
        { question: 'Can it be used for hiring?', answer: 'Not recommended. Its validation is not sufficient for selection. Use it as material for talking about how people operate inside a team.' },
      ],
      disclaimer: 'DISC results are for self-understanding and team conversation. Do not use them as a basis for hiring, placement, or appraisal.',
    },
    ja: {
      introTitle: 'DISC は性格ではなく、観察できる行動傾向を扱う',
      intro: 'DISC は1928年のウィリアム・マーストン『常人の感情』に由来し、のちに産業心理学者が測定道具として整えた行動プロファイルだ。主導(D)・感化(I)・安定(S)・慎重(C)の四軸で反応の仕方を見る。広く使われるが、学術的な検証は5因子系より弱いことは知って使う方がよい — 自己理解やチームの対話には有用で、採用選抜の根拠には向かない。',
      conceptTitle: '四つの軸が見るもの',
      concepts: [
        { title: 'D・I', body: '主導は結果と速さで、感化は人と説得で状況を動かす。どちらも外に向かう力だ。' },
        { title: 'S・C', body: '安定は一貫性と信頼で、慎重は正確さと基準で状況を支える。どちらも内を固める力だ。' },
        { title: '盲点', body: 'Dは感情を見落とし、Iは締切に弱く、Sは意見表明が遅れ、Cは分析に留まりやすい。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '良いタイプと悪いタイプがありますか？', answer: 'ありません。どの軸もある状況では強みに、別の状況では代償になります。締切が迫るときと信頼を築くときでは必要な軸が違います。' },
        { question: '状況ごとに結果が変わりますが正常ですか？', answer: '正常です。DISC は生まれつきの本質ではなく、その文脈での行動傾向を見ます。職場と家で違って出るのはよくあることです。' },
        { question: '採用に使ってよいですか？', answer: 'お勧めしません。選抜に使うには検証が十分ではありません。チーム内で互いの動き方を話す材料として使ってください。' },
      ],
      disclaimer: 'DISC の結果は自己理解とチームの対話のための参考です。採用・配置・評価の根拠には使わないでください。',
    },
    zh: {
      introTitle: 'DISC 描述的是可观察的行为倾向，而不是人格',
      intro: 'DISC 可追溯到1928年威廉·马斯顿的《常人的情绪》，后由工业心理学家整理为测评工具。它从支配(D)、影响(I)、稳健(S)、审慎(C)四个维度看你如何反应。它使用广泛，但学术验证弱于大五类工具——用于自我理解和团队沟通有价值，不适合作为招聘依据。',
      conceptTitle: '四个维度看什么',
      concepts: [
        { title: 'D 与 I', body: '支配以结果和速度推动局面，影响以人和说服推动。两者都是向外的力量。' },
        { title: 'S 与 C', body: '稳健以一致与信任撑住局面，审慎以准确与标准撑住。两者都是向内夯实。' },
        { title: '盲点', body: 'D 可能忽略情绪，I 可能不擅长截止，S 可能迟迟不表达意见，C 可能困在分析里。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '有好类型和坏类型吗？', answer: '没有。每个维度在一种情境是优势，在另一种情境是代价。赶截止与建立信任需要的维度不同。' },
        { question: '结果随情境变化，正常吗？', answer: '正常。DISC 看的是特定情境下的行为倾向，不是先天本质。在公司和在家不同很常见。' },
        { question: '可以用于招聘吗？', answer: '不建议。其验证程度不足以用作选拔工具。请把它当作团队内讨论彼此工作方式的材料。' },
      ],
      disclaimer: 'DISC 结果用于自我理解与团队对话，请勿作为招聘、岗位安排或考核的依据。',
    },
    fr: {
      introTitle: 'DISC décrit des tendances comportementales observables, pas la personnalité',
      intro: "DISC remonte à Emotions of Normal People de William Moulton Marston (1928), mis en forme ensuite comme outil de mesure par des psychologues du travail. Il lit vos réactions selon quatre axes : dominance, influence, stabilité et conformité. Très répandu, il reste moins validé que les instruments de type Big Five — utile pour la compréhension de soi et le dialogue d'équipe, inapproprié comme base de recrutement.",
      conceptTitle: 'Ce que regardent les quatre axes',
      concepts: [
        { title: 'D et I', body: "La dominance fait bouger par le résultat et la vitesse ; l'influence par les personnes et la persuasion. Deux forces tournées vers l'extérieur." },
        { title: 'S et C', body: "La stabilité tient par la constance et la confiance ; la conformité par la précision et les critères. Deux forces qui consolident." },
        { title: 'Angles morts', body: "D peut manquer les émotions, I les échéances, S tarde à exprimer un avis, C peut rester bloqué dans l'analyse." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Y a-t-il de bons et de mauvais types ?', answer: "Non. Chaque axe est une force dans une situation et un coût dans une autre. Une échéance serrée et une phase de construction de confiance appellent des axes différents." },
        { question: 'Mon résultat change selon la situation, est-ce normal ?', answer: "Oui. DISC lit une tendance comportementale dans un contexte, pas une essence innée. Différer au travail et à la maison est courant." },
        { question: 'Peut-on l\'utiliser pour recruter ?', answer: "Ce n'est pas recommandé : la validation est insuffisante pour la sélection. Servez-vous-en pour parler, en équipe, de la façon dont chacun fonctionne." },
      ],
      disclaimer: "Les résultats servent à la compréhension de soi et au dialogue d'équipe. Ne les utilisez pas pour recruter, affecter ou évaluer.",
    },
    es: {
      introTitle: 'DISC describe tendencias de conducta observables, no la personalidad',
      intro: 'DISC se remonta a Emotions of Normal People de William Moulton Marston (1928) y luego fue convertido en herramienta de medición por psicólogos del trabajo. Lee cómo respondes en cuatro ejes: dominancia, influencia, estabilidad y cumplimiento. Es muy usado, pero su validación académica es más débil que la de instrumentos tipo Big Five: útil para el autoconocimiento y la conversación de equipo, no apropiado como base de contratación.',
      conceptTitle: 'Qué miran los cuatro ejes',
      concepts: [
        { title: 'D e I', body: 'La dominancia mueve por resultado y velocidad; la influencia por personas y persuasión. Ambas empujan hacia fuera.' },
        { title: 'S y C', body: 'La estabilidad sostiene por constancia y confianza; el cumplimiento por precisión y criterios. Ambas consolidan.' },
        { title: 'Puntos ciegos', body: 'D puede perderse las emociones, I flojear en plazos, S tardar en opinar y C quedarse en el análisis.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Hay tipos mejores y peores?', answer: 'No. Cada eje es fortaleza en una situación y coste en otra. Un plazo apretado y una fase de construir confianza piden ejes distintos.' },
        { question: 'Mi resultado cambia según la situación, ¿es normal?', answer: 'Sí. DISC lee tendencia conductual en un contexto, no una esencia innata. Diferir en el trabajo y en casa es habitual.' },
        { question: '¿Se puede usar para contratar?', answer: 'No se recomienda: la validación no basta para selección. Úsalo como material para hablar en equipo de cómo funciona cada persona.' },
      ],
      disclaimer: 'Los resultados sirven para el autoconocimiento y la conversación de equipo. No los uses para contratar, asignar o evaluar.',
    },
  },

  'love-profile': {
    ko: {
      introTitle: '관계는 유형 하나가 아니라 여러 축이 겹쳐 만들어진다',
      intro: '이 프로파일은 애정을 주고받는 방식, 갈등에서 나오는 반응, 가까움과 거리 사이의 조절을 함께 본다. 사람을 한 유형에 넣기 위한 것이 아니라, 지금 이 관계에서 어디가 잘 맞고 어디가 어긋나는지 말로 꺼내기 위한 지도다.',
      conceptTitle: '겹쳐 보는 세 축',
      concepts: [
        { title: '표현 방식', body: '게리 채프먼의 다섯 가지 사랑의 언어는 상담 현장에서 나온 틀이다. 학술적 검증은 제한적이지만, 서로 다른 방식으로 애정을 전한다는 대화의 출발점으로는 쓸모가 있다.' },
        { title: '갈등 반응', body: '다툼에서 다가가는 쪽인지 물러나는 쪽인지를 본다. 요구-철수 패턴은 관계 연구에서 반복 관찰되는 형태다.' },
        { title: '가까움 조절', body: '친밀과 독립 사이의 거리 조절이다. 이 축을 더 자세히 보려면 불안·회피 두 차원으로 재는 애착 테스트를 함께 보세요.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '애착 유형 네 가지로 나오지 않네요?', answer: '의도한 것입니다. oiyo 의 애착 검사는 네 칸에 넣는 대신 불안과 회피를 각각 연속 척도로 봅니다. 같은 사람도 관계와 시기에 따라 달라지기 때문입니다.' },
        { question: '사랑의 언어는 과학인가요?', answer: '엄밀히는 아닙니다. 상담 경험에서 나온 분류이고 검증 연구는 제한적입니다. 진단이 아니라 대화 도구로 쓰세요.' },
        { question: '상대와 결과가 다르면 안 맞는 건가요?', answer: '아닙니다. 다른 것 자체가 문제는 아니고, 다르다는 것을 모르는 채로 각자의 방식대로 주는 것이 문제입니다.' },
      ],
      disclaimer: '연애 프로파일 결과는 자기 이해와 대화를 위한 참고입니다. 관계의 안전을 평가하지 않으며, 통제·위협·폭력이 있다면 유형의 문제가 아닙니다. 한국에서는 긴급 112·119, 여성긴급전화 1366, 자살예방 109 로 연락하세요.',
    },
    en: {
      introTitle: 'A relationship is made of several overlapping axes, not one type',
      intro: 'This profile looks together at how affection is given and received, what comes out in conflict, and how closeness and distance get adjusted. It is not for filing a person under one type but for making it sayable where this relationship fits well and where it grinds.',
      conceptTitle: 'Three overlapping axes',
      concepts: [
        { title: 'How it is expressed', body: "Gary Chapman's five love languages came out of counselling practice. Empirical validation is limited, but as a starting point for talking about differing ways of showing affection it is useful." },
        { title: 'Conflict response', body: 'Whether you move toward or away during a fight. The demand-withdraw pattern is repeatedly observed in relationship research.' },
        { title: 'Closeness regulation', body: 'How distance is adjusted between intimacy and independence. To read this axis more closely, see the attachment test, which measures anxiety and avoidance as two dimensions.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Why is there no four-type attachment result?', answer: 'That is deliberate. Instead of four boxes, the oiyo attachment test reads anxiety and avoidance as continuous dimensions, because the same person shifts by relationship and by period.' },
        { question: 'Are love languages science?', answer: 'Not strictly. They are a classification from counselling experience, with limited validation research. Use them as a conversation tool, not a diagnosis.' },
        { question: 'My partner and I got different results — is that bad?', answer: 'No. Difference itself is not the problem. The problem is each giving in their own way without knowing there is a difference.' },
      ],
      disclaimer: 'Profile results are for self-understanding and conversation. They do not assess whether a relationship is safe. Control, threats, or violence are not a matter of style — contact local emergency or support services.',
    },
    ja: {
      introTitle: '関係は一つの型ではなく、複数の軸が重なってできる',
      intro: 'このプロファイルは、愛情のやりとりの仕方、対立で出る反応、近さと距離の調節をあわせて見る。人を一つの型に入れるためではなく、この関係のどこが合い、どこが軋むのかを言葉にするための地図だ。',
      conceptTitle: '重ねて見る三つの軸',
      concepts: [
        { title: '表し方', body: 'ゲーリー・チャップマンの五つの愛の言語はカウンセリングの現場から出た枠組みだ。学術的検証は限られるが、愛情の伝え方が人ごとに違うという対話の出発点としては使える。' },
        { title: '対立での反応', body: '争いのとき近づく側か退く側かを見る。要求-引きこもりのパターンは関係研究で繰り返し観察される形だ。' },
        { title: '近さの調節', body: '親密と自立のあいだの距離の取り方だ。この軸を詳しく見るには、不安と回避を二次元で測る愛着テストを併せてご覧ください。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '愛着タイプ四つで出ないのですね？', answer: '意図的です。oiyo の愛着検査は四つの枠に入れる代わりに、不安と回避をそれぞれ連続尺度で見ます。同じ人でも関係や時期で変わるからです。' },
        { question: '愛の言語は科学ですか？', answer: '厳密には違います。カウンセリング経験から出た分類で、検証研究は限られています。診断ではなく対話の道具として使ってください。' },
        { question: '相手と結果が違うと合わないのですか？', answer: 'いいえ。違うこと自体は問題ではありません。違いに気づかないまま各自のやり方で与えることが問題です。' },
      ],
      disclaimer: 'プロファイルの結果は自己理解と対話のための参考です。関係の安全性を評価するものではありません。支配・脅し・暴力はスタイルの問題ではありません。お住まいの地域の緊急・支援窓口にご連絡ください。',
    },
    zh: {
      introTitle: '关系由多个交叠的维度构成，而不是一个类型',
      intro: '这份画像同时观察表达与接收情感的方式、冲突中出现的反应，以及亲近与距离如何调节。它不是为了把人归入某一类型，而是为了让"这段关系哪里合拍、哪里卡住"变得可以说出口。',
      conceptTitle: '交叠的三个维度',
      concepts: [
        { title: '表达方式', body: '盖瑞·查普曼的五种爱的语言出自咨询实践。实证验证有限，但作为讨论"人们表达情感的方式不同"的起点仍然有用。' },
        { title: '冲突反应', body: '争执时你是靠近还是退开。要求-退避模式在关系研究中被反复观察到。' },
        { title: '亲近调节', body: '在亲密与独立之间如何调整距离。若想更细看这一维度，请参考以焦虑与回避两个连续维度测量的依恋测试。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '为什么没有四种依恋类型的结果？', answer: '这是有意的。oiyo 的依恋测试不把人放进四个格子，而是把焦虑与回避各自作为连续维度来看，因为同一个人会随关系和时期变化。' },
        { question: '爱的语言是科学吗？', answer: '严格说不是。它是来自咨询经验的分类，验证研究有限。请把它当作对话工具，而不是诊断。' },
        { question: '我和伴侣结果不同，是不合适吗？', answer: '不是。差异本身不是问题，问题是没意识到差异、各自按自己的方式去给。' },
      ],
      disclaimer: '画像结果用于自我理解与对话，并不评估关系是否安全。控制、威胁或暴力不是风格问题，请联系当地紧急或支援服务。',
    },
    fr: {
      introTitle: "Une relation se compose de plusieurs axes qui se superposent, pas d'un type",
      intro: "Ce profil regarde ensemble la façon de donner et de recevoir l'affection, ce qui ressort dans le conflit, et le réglage entre proximité et distance. Il ne s'agit pas de ranger quelqu'un dans un type mais de rendre dicible ce qui s'accorde et ce qui grince dans cette relation.",
      conceptTitle: 'Trois axes superposés',
      concepts: [
        { title: 'La façon de le dire', body: "Les cinq langages de l'amour de Gary Chapman viennent de la pratique du conseil conjugal. La validation empirique est limitée, mais comme point de départ pour parler de manières différentes d'exprimer l'affection, c'est utile." },
        { title: 'Réponse au conflit', body: "Vous approchez-vous ou vous retirez-vous pendant une dispute ? Le schéma exigence-retrait est observé de façon répétée dans la recherche sur les couples." },
        { title: 'Réglage de la proximité', body: "Comment la distance s'ajuste entre intimité et indépendance. Pour cet axe, voyez le test d'attachement, qui mesure anxiété et évitement comme deux dimensions." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: "Pourquoi pas de résultat en quatre types d'attachement ?", answer: "C'est délibéré. Plutôt que quatre cases, le test d'attachement d'oiyo lit l'anxiété et l'évitement comme des dimensions continues, car la même personne varie selon la relation et la période." },
        { question: "Les langages de l'amour sont-ils une science ?", answer: "Pas au sens strict. C'est une classification issue de la pratique clinique, avec peu d'études de validation. À utiliser comme outil de dialogue, pas comme diagnostic." },
        { question: 'Nos résultats diffèrent, est-ce mauvais signe ?', answer: "Non. La différence n'est pas le problème ; le problème est de donner chacun à sa manière sans savoir qu'il y a une différence." },
      ],
      disclaimer: "Les résultats servent à la compréhension de soi et au dialogue. Ils n'évaluent pas la sécurité d'une relation. Contrôle, menaces ou violence ne relèvent pas du style : contactez les services d'urgence ou d'aide de votre région.",
    },
    es: {
      introTitle: 'Una relación se compone de varios ejes superpuestos, no de un tipo',
      intro: 'Este perfil mira a la vez cómo se da y se recibe el afecto, qué aparece en el conflicto y cómo se ajusta la cercanía y la distancia. No sirve para archivar a alguien en un tipo, sino para poder decir dónde encaja y dónde roza esta relación.',
      conceptTitle: 'Tres ejes superpuestos',
      concepts: [
        { title: 'Cómo se expresa', body: 'Los cinco lenguajes del amor de Gary Chapman surgieron de la práctica de consejería. La validación empírica es limitada, pero como punto de partida para hablar de formas distintas de mostrar afecto resulta útil.' },
        { title: 'Respuesta al conflicto', body: 'Si te acercas o te retiras durante una discusión. El patrón demanda-retirada se observa repetidamente en la investigación de pareja.' },
        { title: 'Regulación de la cercanía', body: 'Cómo se ajusta la distancia entre intimidad e independencia. Para este eje, consulta el test de apego, que mide ansiedad y evitación como dos dimensiones.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Por qué no hay resultado de cuatro tipos de apego?', answer: 'Es deliberado. En vez de cuatro casillas, el test de apego de oiyo lee ansiedad y evitación como dimensiones continuas, porque la misma persona varía según la relación y la época.' },
        { question: '¿Los lenguajes del amor son ciencia?', answer: 'En sentido estricto, no. Son una clasificación surgida de la consejería, con poca investigación de validación. Úsalos como herramienta de conversación, no como diagnóstico.' },
        { question: 'Mi pareja y yo tenemos resultados distintos, ¿es malo?', answer: 'No. La diferencia no es el problema; el problema es dar cada uno a su manera sin saber que hay una diferencia.' },
      ],
      disclaimer: 'Los resultados son para autoconocimiento y conversación. No evalúan si una relación es segura. El control, las amenazas o la violencia no son cuestión de estilo: contacta con los servicios de emergencia o apoyo de tu zona.',
    },
  },

  'cognitive-dissonance': {
    ko: {
      introTitle: '부조화는 신념이 틀려서가 아니라 신념과 행동이 함께 있어서 생긴다',
      intro: '레온 페스팅거는 1957년, 서로 맞지 않는 두 인지를 동시에 들고 있을 때 사람은 불편을 느끼고 그 불편을 줄이는 쪽으로 움직인다고 보았다. 핵심은 어느 쪽이 참인지가 아니다. 그 신념이 나에게 중요할수록, 그리고 행동을 설명할 다른 이유가 적을수록 긴장이 커진다.',
      conceptTitle: '긴장을 키우거나 줄이는 것',
      concepts: [
        { title: '중요도', body: '그 신념이 나에게 하찮다면 아무리 어긋나도 긴장이 생기지 않는다. 부조화는 중요한 자리에서만 아프다.' },
        { title: '다른 이유', body: '행동을 설명할 이유가 충분하면 긴장이 줄어든다. 페스팅거와 칼스미스의 1959년 실험에서 20달러를 받은 쪽이 태도를 덜 바꾼 이유다 — 이미 충분한 이유가 있었다.' },
        { title: '줄이는 네 갈래', body: '행동을 바꾸거나, 신념을 바꾸거나, 중요도를 낮추거나, 새 이유를 더한다. 넷 다 긴장은 줄지만 남는 결과가 다르다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '화면의 숫자는 무엇인가요?', answer: '측정값이 아니라 관계를 보여 주는 예시입니다. 페스팅거가 말한 "부조화 인지의 비율에 중요도를 가중한다"는 형태를 그대로 계산해 슬라이더로 만든 것입니다.' },
        { question: '태도를 바꾸는 것이 나쁜 건가요?', answer: '반드시 그렇지는 않습니다. 새로 알게 된 것이 있어 신념을 고치는 일은 학습입니다. 문제는 행동을 이미 해 버린 뒤 그 행동에 맞추려고 신념을 고칠 때입니다.' },
        { question: '왜 합리화를 하게 되나요?', answer: '"새 이유 더하기"가 가장 싸게 긴장을 줄이는 길이기 때문입니다. 행동도 신념도 건드리지 않아도 되니, 사람은 자주 이쪽을 고릅니다.' },
      ],
      disclaimer: '이 랩은 개념을 눈으로 보기 위한 도구입니다. 개인을 진단하거나 평가하지 않습니다.',
    },
    en: {
      introTitle: 'Dissonance arises not because a belief is wrong but because belief and action are held together',
      intro: 'In 1957 Leon Festinger argued that holding two cognitions that do not fit produces discomfort, and that people move to reduce it. The point is not which side is true. Tension grows the more the belief matters to you, and the fewer other reasons there are that explain the action.',
      conceptTitle: 'What raises or lowers the tension',
      concepts: [
        { title: 'Importance', body: 'If the belief is trivial to you, no tension appears however large the gap. Dissonance only hurts where something matters.' },
        { title: 'Other reasons', body: 'Enough justification lowers the tension. That is why, in Festinger and Carlsmith’s 1959 study, those paid twenty dollars changed their attitude less — they already had reason enough.' },
        { title: 'Four ways out', body: 'Change the action, change the belief, trivialise the belief, or add a new reason. All four lower tension, but they leave different things behind.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'What is the number on screen?', answer: 'Not a measurement but an illustration of a relationship. It computes the form Festinger described — the proportion of dissonant cognitions, weighted by importance — and puts it on sliders.' },
        { question: 'Is changing your attitude a bad thing?', answer: 'Not necessarily. Revising a belief because you learned something is learning. The problem is revising it after the fact to fit an action you already took.' },
        { question: 'Why do people rationalise?', answer: 'Because adding a reason is the cheapest way to lower the tension. It requires touching neither the action nor the belief, so people reach for it often.' },
      ],
      disclaimer: 'This lab is a tool for seeing a concept. It does not diagnose or evaluate anyone.',
    },
    ja: {
      introTitle: '不協和は信念が誤っているからではなく、信念と行動が同時にあるから生じる',
      intro: 'レオン・フェスティンガーは1957年、噛み合わない二つの認知を同時に抱えると人は不快を感じ、それを減らす方へ動くとみた。要点はどちらが正しいかではない。その信念が自分にとって重要なほど、そして行動を説明する他の理由が少ないほど緊張は大きくなる。',
      conceptTitle: '緊張を上げるもの・下げるもの',
      concepts: [
        { title: '重要度', body: 'その信念が自分にとって取るに足らないなら、どれだけずれても緊張は生じない。不協和は大事な場所でだけ痛む。' },
        { title: '他の理由', body: '行動を説明する理由が十分なら緊張は下がる。フェスティンガーとカールスミスの1959年の実験で20ドルを受け取った側が態度を変えなかったのはそのためだ — すでに十分な理由があった。' },
        { title: '四つの出口', body: '行動を変える、信念を変える、重要度を下げる、新しい理由を足す。四つとも緊張は下がるが、あとに残るものが違う。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '画面の数値は何ですか？', answer: '測定値ではなく関係を示す例です。フェスティンガーが述べた「不協和認知の比率を重要度で重みづけする」形をそのまま計算し、スライダーにしたものです。' },
        { question: '態度を変えるのは悪いことですか？', answer: '必ずしもそうではありません。新しく知ったことがあって信念を直すのは学習です。問題は、すでにしてしまった行動に合わせて後から直すときです。' },
        { question: 'なぜ人は合理化するのですか？', answer: '「理由を足す」が最も安く緊張を下げる道だからです。行動も信念も触らずに済むので、人はよくこちらを選びます。' },
      ],
      disclaimer: 'このラボは概念を目で見るための道具です。個人を診断したり評価したりしません。',
    },
    zh: {
      introTitle: '失调不是因为信念错了，而是因为信念与行为同时存在',
      intro: '1957年，利昂·费斯廷格提出：同时持有两个不相容的认知会带来不适，人会朝着减少这种不适的方向移动。关键不在于哪一边是对的。信念对你越重要、能解释该行为的其他理由越少，张力就越大。',
      conceptTitle: '什么会抬高或降低张力',
      concepts: [
        { title: '重要度', body: '如果这个信念对你无关紧要，落差再大也不会产生张力。失调只在重要的地方才痛。' },
        { title: '其他理由', body: '足够的理由会降低张力。这正是费斯廷格与卡尔史密斯1959年研究中，拿到二十美元的一组态度改变更少的原因——他们已经有足够的理由。' },
        { title: '四个出口', body: '改变行为、改变信念、降低重要性，或增加新理由。四者都能降低张力，但留下的东西不同。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '屏幕上的数字是什么？', answer: '不是测量值，而是关系的示例。它按费斯廷格描述的形式计算——失调认知所占比例，再以重要度加权——并做成滑块。' },
        { question: '改变态度是坏事吗？', answer: '不一定。因为学到新东西而修正信念，那是学习。问题在于事后为了配合已经做出的行为而修正它。' },
        { question: '人为什么会合理化？', answer: '因为"增加理由"是降低张力最便宜的路径。既不用动行为也不用动信念，所以人们经常选它。' },
      ],
      disclaimer: '这个实验室是用来把概念看见的工具，不诊断也不评价任何人。',
    },
    fr: {
      introTitle: "La dissonance naît non parce qu'une croyance est fausse mais parce que croyance et acte coexistent",
      intro: "En 1957, Leon Festinger avança que tenir ensemble deux cognitions qui ne s'accordent pas produit un inconfort, et que l'on agit pour le réduire. L'enjeu n'est pas de savoir qui a raison. La tension croît d'autant plus que la croyance vous importe et que les autres raisons expliquant l'acte sont rares.",
      conceptTitle: 'Ce qui augmente ou diminue la tension',
      concepts: [
        { title: 'Importance', body: "Si la croyance vous est indifférente, aucune tension n'apparaît, quel que soit l'écart. La dissonance ne fait mal que là où quelque chose compte." },
        { title: 'Autres raisons', body: "Une justification suffisante abaisse la tension. C'est pourquoi, dans l'étude de Festinger et Carlsmith (1959), ceux payés vingt dollars ont moins changé d'attitude : ils avaient déjà une raison suffisante." },
        { title: 'Quatre sorties', body: "Changer l'acte, changer la croyance, banaliser la croyance, ou ajouter une raison. Les quatre baissent la tension, mais ne laissent pas la même chose derrière." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: "Que représente le nombre affiché ?", answer: "Pas une mesure, mais l'illustration d'une relation. Il calcule la forme décrite par Festinger — la proportion de cognitions dissonantes, pondérée par l'importance — et la met sur des curseurs." },
        { question: "Changer d'attitude est-il mauvais ?", answer: "Pas nécessairement. Réviser une croyance parce qu'on a appris quelque chose, c'est apprendre. Le problème est de la réviser après coup pour l'ajuster à un acte déjà commis." },
        { question: 'Pourquoi rationalise-t-on ?', answer: "Parce qu'ajouter une raison est la manière la moins coûteuse de baisser la tension : ni l'acte ni la croyance ne bougent. On y recourt donc souvent." },
      ],
      disclaimer: "Ce labo sert à voir un concept. Il ne diagnostique ni n'évalue personne.",
    },
    es: {
      introTitle: 'La disonancia surge no porque una creencia sea falsa sino porque creencia y acto conviven',
      intro: 'En 1957 Leon Festinger sostuvo que sostener a la vez dos cogniciones que no encajan produce incomodidad, y que la persona se mueve para reducirla. La cuestión no es cuál de las dos es cierta. La tensión crece cuanto más importa la creencia y cuantas menos razones existen para explicar el acto.',
      conceptTitle: 'Qué sube o baja la tensión',
      concepts: [
        { title: 'Importancia', body: 'Si la creencia te resulta indiferente, no aparece tensión por grande que sea la distancia. La disonancia solo duele donde algo importa.' },
        { title: 'Otras razones', body: 'Una justificación suficiente baja la tensión. Por eso, en el estudio de Festinger y Carlsmith (1959), quienes cobraron veinte dólares cambiaron menos de actitud: ya tenían razón suficiente.' },
        { title: 'Cuatro salidas', body: 'Cambiar el acto, cambiar la creencia, restarle importancia o añadir una razón. Las cuatro bajan la tensión, pero dejan cosas distintas detrás.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Qué es el número en pantalla?', answer: 'No una medición, sino la ilustración de una relación. Calcula la forma que describió Festinger —la proporción de cogniciones disonantes, ponderada por la importancia— y la pone en controles deslizantes.' },
        { question: '¿Cambiar de actitud es malo?', answer: 'No necesariamente. Revisar una creencia porque aprendiste algo es aprender. El problema es revisarla después para encajar con un acto ya realizado.' },
        { question: '¿Por qué racionalizamos?', answer: 'Porque añadir una razón es la vía más barata para bajar la tensión: no hay que tocar ni el acto ni la creencia. Por eso se recurre a ella con frecuencia.' },
      ],
      disclaimer: 'Este laboratorio sirve para ver un concepto. No diagnostica ni evalúa a nadie.',
    },
  },

  'procrastination-type': {
    ko: {
      introTitle: '미루기는 게으름이 아니라 감정을 다루는 방식이다',
      intro: '팀 피칠(Timothy Pychyl)을 비롯한 연구자들은 미루기를 시간 관리 문제가 아니라 감정 조절 문제로 본다. 어떤 과제가 불안·지루함·자기 의심을 일으킬 때, 그 불쾌한 감정을 지금 당장 줄이려고 과제를 미룬다. 그래서 계획표를 더 촘촘히 짜는 것으로는 잘 풀리지 않는다.',
      conceptTitle: '미루기가 나타나는 자리',
      concepts: [
        { title: '완벽주의', body: '기준이 높아 시작 자체가 불가능하게 느껴진다. 완성이 완벽보다 낫다는 쪽으로 기준을 먼저 낮춘다.' },
        { title: '회피', body: '과제가 불안을 일으킨다. 2분만 시작하는 규칙처럼 착수 마찰을 낮추는 장치가 듣는다.' },
        { title: '즉시 보상', body: '지금의 재미가 미래 보상을 이긴다. 25분 집중 뒤 짧은 보상처럼 주기를 짧게 만든다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '마감이 닥쳐야 집중되는 것도 미루기인가요?', answer: '네. 압박형이라 부르는 패턴입니다. 성과가 나기도 하지만 회복 비용이 크고, 실제 마감보다 이른 개인 마감을 세우는 편이 안전합니다.' },
        { question: '의지력을 기르면 해결되나요?', answer: '의지력만으로는 잘 안 됩니다. 방해 요소를 없애고 시작 마찰을 낮추는 환경 설계가 더 효과적이라는 것이 반복해서 관찰됩니다.' },
        { question: '유형이 여러 개로 나오면요?', answer: '자연스럽습니다. 과제 종류에 따라 다른 이유로 미룹니다. 지금 가장 걸리는 과제 하나를 놓고 읽어 보세요.' },
      ],
      disclaimer: '미루기 유형 결과는 자기 이해와 대화를 위한 참고입니다. 진단이나 평가의 근거로 사용하지 마세요. 일상이 오래 어려우면 전문가와 상의하세요.',
    },
    en: {
      introTitle: 'Procrastination is not laziness but a way of handling feelings',
      intro: 'Timothy Pychyl and others treat procrastination as a problem of emotion regulation rather than time management. When a task provokes anxiety, boredom or self-doubt, delaying it lowers that discomfort right now. That is why a tighter schedule rarely fixes it.',
      conceptTitle: 'Where procrastination shows up',
      concepts: [
        { title: 'Perfectionism', body: 'The bar is so high that starting feels impossible. Lower the bar first: finished beats perfect.' },
        { title: 'Avoidance', body: 'The task itself provokes anxiety. Devices that reduce friction to begin — like starting for just two minutes — work here.' },
        { title: 'Immediate reward', body: 'Present fun outruns future payoff. Shorten the cycle: focused work, then a brief reward.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'Is needing a deadline to focus also procrastination?', answer: 'Yes — the pattern often called pressure-driven. It can produce results, but the recovery cost is high, and setting a personal deadline earlier than the real one is safer.' },
        { question: 'Will building willpower solve it?', answer: 'Willpower alone rarely does. Designing the environment — removing distractions, lowering the friction to start — is repeatedly observed to work better.' },
        { question: 'What if several types come out?', answer: 'That is normal. People delay different tasks for different reasons. Read the result against one task that is bothering you now.' },
      ],
      disclaimer: 'Procrastination type results are for self-understanding and conversation. Do not use them for diagnosis or evaluation. If daily life stays hard for a long period, consider speaking with a professional.',
    },
    ja: {
      introTitle: '先延ばしは怠けではなく、感情の扱い方だ',
      intro: 'ティモシー・ピチルらは、先延ばしを時間管理ではなく感情調整の問題として捉える。ある課題が不安・退屈・自己不信を呼ぶとき、その不快さを今すぐ下げるために課題を後回しにする。だから計画表を細かくしても解けにくい。',
      conceptTitle: '先延ばしが現れる場所',
      concepts: [
        { title: '完璧主義', body: '基準が高く、着手そのものが不可能に感じる。完成は完璧に勝る、という方へ基準を先に下げる。' },
        { title: '回避', body: '課題そのものが不安を呼ぶ。まず2分だけ始める、のように着手の摩擦を下げる仕掛けが効く。' },
        { title: '即時報酬', body: '今の楽しさが将来の報酬に勝つ。集中のあとに短い報酬、と周期を短くする。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '締切が近づかないと集中できないのも先延ばしですか？', answer: 'はい。プレッシャー型と呼ばれるパターンです。成果は出ることもありますが回復コストが大きく、実際より早い個人締切を置く方が安全です。' },
        { question: '意志力を鍛えれば解決しますか？', answer: '意志力だけでは難しいです。妨げを取り除き着手の摩擦を下げる環境設計の方が効く、と繰り返し観察されています。' },
        { question: '複数のタイプが出たら？', answer: '自然なことです。課題の種類ごとに理由が違います。今いちばん気になっている課題を一つ置いて読んでください。' },
      ],
      disclaimer: '先延ばしタイプの結果は自己理解と対話のための参考です。診断や評価の根拠には使わないでください。日常が長く難しい場合は専門家にご相談ください。',
    },
    zh: {
      introTitle: '拖延不是懒惰，而是处理情绪的一种方式',
      intro: '皮切尔等研究者把拖延看作情绪调节问题，而不是时间管理问题。当某项任务引发焦虑、无聊或自我怀疑时，推迟它可以立刻降低这份不适。所以把计划表排得更密，往往解决不了。',
      conceptTitle: '拖延出现的位置',
      concepts: [
        { title: '完美主义', body: '标准太高，以致开始本身变得不可能。先把标准降到"完成胜过完美"。' },
        { title: '回避', body: '任务本身引发焦虑。降低启动摩擦的装置有效，比如只做两分钟。' },
        { title: '即时奖励', body: '当下的乐趣胜过未来的回报。缩短周期：专注一段，再给一个短暂奖励。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '非要临近截止才能专注，也算拖延吗？', answer: '算。这种模式常被称为压力驱动型。它有时能出成果，但恢复成本高，设一个比真实截止更早的个人截止更安全。' },
        { question: '锻炼意志力能解决吗？', answer: '仅靠意志力很难。反复观察到更有效的是环境设计：移除干扰、降低开始的摩擦。' },
        { question: '如果出现多个类型呢？', answer: '很正常。人会因不同原因推迟不同任务。请针对当下最困扰你的那一件来读结果。' },
      ],
      disclaimer: '拖延类型结果仅用于自我理解与对话，请勿作为诊断或评价依据。若日常长期困难，请考虑咨询专业人士。',
    },
    fr: {
      introTitle: "La procrastination n'est pas de la paresse mais une façon de gérer ses émotions",
      intro: "Timothy Pychyl et d'autres traitent la procrastination comme un problème de régulation émotionnelle plutôt que de gestion du temps. Quand une tâche provoque anxiété, ennui ou doute de soi, la repousser fait baisser cet inconfort tout de suite. C'est pourquoi un planning plus serré la règle rarement.",
      conceptTitle: 'Où apparaît la procrastination',
      concepts: [
        { title: 'Perfectionnisme', body: "La barre est si haute que commencer semble impossible. Abaissez-la d'abord : terminé vaut mieux que parfait." },
        { title: 'Évitement', body: "La tâche elle-même provoque l'anxiété. Les dispositifs qui réduisent la friction de départ — commencer deux minutes — fonctionnent ici." },
        { title: 'Récompense immédiate', body: "Le plaisir présent dépasse le gain futur. Raccourcissez le cycle : un temps de concentration, puis une brève récompense." },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: "Avoir besoin d'une échéance proche pour se concentrer, est-ce aussi de la procrastination ?", answer: "Oui — le schéma dit « sous pression ». Il produit parfois des résultats, mais le coût de récupération est élevé ; poser une échéance personnelle plus tôt est plus sûr." },
        { question: 'Renforcer la volonté suffit-il ?', answer: "Rarement seule. On observe régulièrement que la conception de l'environnement — retirer les distractions, abaisser la friction de départ — agit mieux." },
        { question: 'Et si plusieurs types ressortent ?', answer: "C'est normal. On repousse des tâches différentes pour des raisons différentes. Lisez le résultat en pensant à une tâche précise qui vous pèse aujourd'hui." },
      ],
      disclaimer: "Les résultats du type de procrastination servent à la compréhension de soi et au dialogue. Ne les utilisez pas pour un diagnostic ou une évaluation. Si le quotidien reste difficile longtemps, envisagez de consulter un professionnel.",
    },
    es: {
      introTitle: 'La procrastinación no es pereza sino una forma de manejar las emociones',
      intro: 'Timothy Pychyl y otros tratan la procrastinación como un problema de regulación emocional más que de gestión del tiempo. Cuando una tarea provoca ansiedad, aburrimiento o duda sobre uno mismo, aplazarla reduce esa incomodidad ahora mismo. Por eso una agenda más apretada rara vez lo resuelve.',
      conceptTitle: 'Dónde aparece la procrastinación',
      concepts: [
        { title: 'Perfeccionismo', body: 'El listón está tan alto que empezar parece imposible. Baja primero el listón: terminado vale más que perfecto.' },
        { title: 'Evitación', body: 'La tarea misma provoca ansiedad. Aquí funcionan los recursos que bajan la fricción de inicio, como empezar solo dos minutos.' },
        { title: 'Recompensa inmediata', body: 'El placer presente gana al beneficio futuro. Acorta el ciclo: un tramo de concentración y luego una recompensa breve.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿Necesitar la fecha límite encima para concentrarse también es procrastinar?', answer: 'Sí: el patrón llamado impulsado por presión. A veces da resultados, pero el coste de recuperación es alto; poner una fecha personal anterior a la real es más seguro.' },
        { question: '¿Se resuelve entrenando la fuerza de voluntad?', answer: 'Rara vez sola. Se observa repetidamente que diseñar el entorno —quitar distracciones, bajar la fricción de inicio— funciona mejor.' },
        { question: '¿Y si salen varios tipos?', answer: 'Es normal. Se aplazan tareas distintas por razones distintas. Lee el resultado pensando en la tarea que más te pesa ahora.' },
      ],
      disclaimer: 'Los resultados del tipo de procrastinación son para autoconocimiento y conversación. No los uses para diagnóstico ni evaluación. Si la vida diaria sigue difícil mucho tiempo, considera consultar a un profesional.',
    },
  },
  // 2026-09-28 O9 B: 검사만 있던 57개 중 GSC 노출이 있던 다섯. 새 글 규칙대로 여섯 언어 모두 친절한 존댓말.
  "imposter-syndrome": {
    "ko": {
      "introTitle": "잘 해내고도 \"운이 좋았을 뿐\"이라고 느낀다면",
      "intro": "가면 현상(Impostor Phenomenon)은 1978년 심리학자 Pauline Clance와 Suzanne Imes가 뚜렷한 성취를 거둔 사람들에게서 관찰한 경험이에요. 실력으로 해낸 일을 운이나 타이밍 덕으로 돌리고, 언젠가 부족함이 들통날 거라는 불안을 품는 것이 특징이에요. 질병 진단명이 아니라 많은 사람이 한때 겪는 흔한 경험의 이름이에요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "성공을 밖으로 돌리기",
          "body": "성과를 내 능력이 아니라 운, 도움, 우연의 결과로 설명해요."
        },
        {
          "title": "들킬 것 같은 불안",
          "body": "주변이 나를 과대평가한다고 느끼고, 부족함이 드러날까 걱정해요."
        },
        {
          "title": "과잉 준비와 미루기",
          "body": "실패를 피하려고 지나치게 준비하거나, 반대로 시작을 미루는 고리가 생기기 쉬워요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "가면 증후군은 정신질환인가요?",
          "answer": "아니에요. 진단 기준에 있는 질환이 아니라 경험을 부르는 이름이에요. 다만 불안이나 우울이 함께 심하다면 전문가와 이야기해 보세요."
        },
        {
          "question": "점수가 높으면 어떻게 하면 좋을까요?",
          "answer": "해낸 일을 기록해 두기, 칭찬을 반박하지 않고 받아들이기, 믿을 만한 사람과 느낌을 나누기가 도움이 된다고 알려져 있어요."
        },
        {
          "question": "이 검사는 Clance 척도와 같은가요?",
          "answer": "Clance 가면 현상 척도(CIPS)의 개념을 참고해 OIYO가 새로 쓴 문항이에요. 그래서 원래 척도의 점수와 직접 비교할 수는 없어요."
        }
      ],
      "disclaimer": "이 결과는 나를 이해하기 위한 참고예요. 진단이나 채용·평가의 근거로 쓰지 마세요."
    },
    "en": {
      "introTitle": "When you succeed and still think \"I just got lucky\"",
      "intro": "The impostor phenomenon was described in 1978 by psychologists Pauline Clance and Suzanne Imes, who noticed it in people with clear achievements. It means crediting your own work to luck or timing and fearing that one day you will be found out. It is not a diagnosis, just a name for a common experience many people have at some point.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Explaining success away",
          "body": "You put results down to luck, help or chance rather than your own ability."
        },
        {
          "title": "Fear of being found out",
          "body": "You feel others overrate you and worry that your gaps will show."
        },
        {
          "title": "Over-preparing or putting off",
          "body": "To avoid failing you either over-prepare or delay starting, and the loop repeats."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Is impostor syndrome a mental illness?",
          "answer": "No. It is not a diagnostic category but a name for an experience. If strong anxiety or low mood come with it, talking to a professional can help."
        },
        {
          "question": "What if my score is high?",
          "answer": "Keeping a record of what you achieved, accepting praise without arguing, and sharing the feeling with someone you trust are commonly reported to help."
        },
        {
          "question": "Is this the Clance scale?",
          "answer": "The items were written by OIYO using the ideas behind the Clance Impostor Phenomenon Scale (CIPS), so scores are not comparable with the original scale."
        }
      ],
      "disclaimer": "This result is a reference for understanding yourself. Do not use it as grounds for diagnosis, hiring or evaluation."
    },
    "ja": {
      "introTitle": "うまくいっても「運がよかっただけ」と感じるなら",
      "intro": "インポスター現象は、1978年に心理学者のポーリン・クランスとスザンヌ・アイムスが、はっきりした成果を持つ人たちに見いだした経験です。実力で成し遂げたことを運やタイミングのおかげだと考え、いつか力不足がばれるのではと不安になるのが特徴です。病名ではなく、多くの人が一度は経験するありふれた感覚の呼び名です。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "成功を外に帰する",
          "body": "成果を自分の力ではなく、運や助け、偶然の結果として説明します。"
        },
        {
          "title": "見抜かれる不安",
          "body": "周りが自分を買いかぶっていると感じ、足りなさが表に出るのを心配します。"
        },
        {
          "title": "準備しすぎと先延ばし",
          "body": "失敗を避けようと準備しすぎたり、逆に始めるのを先延ばしにしたりする循環が起こりがちです。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "インポスター症候群は精神疾患ですか？",
          "answer": "いいえ。診断基準にある病気ではなく、経験の呼び名です。強い不安や落ち込みが続くときは、専門家に相談してみてください。"
        },
        {
          "question": "点数が高かったらどうすればいいですか？",
          "answer": "できたことを記録する、ほめ言葉を否定せずに受け取る、信頼できる人に気持ちを話すことが役立つと言われています。"
        },
        {
          "question": "このテストはクランス尺度と同じですか？",
          "answer": "クランスのインポスター現象尺度（CIPS）の考え方を参考に、OIYOが新しく作った質問です。元の尺度の点数とは直接比べられません。"
        }
      ],
      "disclaimer": "この結果は自分を理解するための参考です。診断や採用・評価の根拠には使わないでください。"
    },
    "zh": {
      "introTitle": "明明做得很好，却觉得“只是运气好”",
      "intro": "冒名顶替现象是心理学家 Pauline Clance 和 Suzanne Imes 在 1978 年描述的，她们在成绩突出的人身上观察到这种体验：把靠实力完成的事归功于运气或时机，并担心有一天会被人看穿。它不是疾病诊断，而是很多人都曾有过的一种常见体验。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "把成功归于外部",
          "body": "把成果解释为运气、别人的帮助或偶然，而不是自己的能力。"
        },
        {
          "title": "怕被看穿",
          "body": "觉得别人高估了自己，担心不足之处会暴露。"
        },
        {
          "title": "过度准备或拖延",
          "body": "为了避免失败，要么准备过头，要么迟迟不开始，形成循环。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "冒名顶替综合征是精神疾病吗？",
          "answer": "不是。它不在诊断标准里，只是对一种体验的称呼。如果同时伴有严重的焦虑或低落，可以找专业人士聊聊。"
        },
        {
          "question": "分数高该怎么办？",
          "answer": "记录自己完成的事、不反驳地接受称赞、和信任的人分享感受，通常被认为有帮助。"
        },
        {
          "question": "这是 Clance 量表吗？",
          "answer": "题目由 OIYO 参考 Clance 冒名顶替现象量表（CIPS）的概念重新编写，因此分数不能与原量表直接比较。"
        }
      ],
      "disclaimer": "这个结果是帮助了解自己的参考，请不要把它当作诊断、招聘或评价的依据。"
    },
    "fr": {
      "introTitle": "Quand vous réussissez et pensez encore « j’ai eu de la chance »",
      "intro": "Le phénomène de l’imposteur a été décrit en 1978 par les psychologues Pauline Clance et Suzanne Imes chez des personnes aux réussites bien réelles. Il consiste à attribuer ses résultats à la chance ou au bon moment, et à craindre d’être un jour « démasqué ». Ce n’est pas un diagnostic, mais le nom d’une expérience courante que beaucoup vivent à un moment donné.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Attribuer la réussite à l’extérieur",
          "body": "Vous expliquez vos résultats par la chance, l’aide des autres ou le hasard plutôt que par vos compétences."
        },
        {
          "title": "La peur d’être démasqué",
          "body": "Vous avez l’impression d’être surestimé et craignez que vos lacunes se voient."
        },
        {
          "title": "Trop préparer ou remettre à plus tard",
          "body": "Pour éviter l’échec, vous vous préparez à l’excès ou repoussez le début, et le cercle recommence."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Le syndrome de l’imposteur est-il une maladie mentale ?",
          "answer": "Non. Ce n’est pas une catégorie diagnostique, mais le nom d’une expérience. Si une forte anxiété ou un moral très bas l’accompagnent, parlez-en à un professionnel."
        },
        {
          "question": "Que faire si mon score est élevé ?",
          "answer": "Noter ce que vous avez accompli, accepter un compliment sans le contester et partager ce ressenti avec une personne de confiance sont souvent cités comme utiles."
        },
        {
          "question": "Ce test est-il l’échelle de Clance ?",
          "answer": "Les questions ont été écrites par OIYO à partir des idées de l’échelle du phénomène de l’imposteur de Clance (CIPS). Les scores ne sont donc pas comparables à ceux de l’échelle d’origine."
        }
      ],
      "disclaimer": "Ce résultat sert de repère pour mieux vous connaître. Ne l’utilisez pas comme base d’un diagnostic, d’un recrutement ou d’une évaluation."
    },
    "es": {
      "introTitle": "Cuando lo logras y aun así piensas «solo tuve suerte»",
      "intro": "El fenómeno del impostor lo describieron en 1978 las psicólogas Pauline Clance y Suzanne Imes en personas con logros claros. Consiste en atribuir lo que conseguiste a la suerte o al momento, y temer que algún día descubran que no eres tan capaz. No es un diagnóstico, sino el nombre de una experiencia común que mucha gente vive alguna vez.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Explicar el éxito desde fuera",
          "body": "Atribuyes tus resultados a la suerte, a la ayuda de otros o al azar, no a tu capacidad."
        },
        {
          "title": "Miedo a que te descubran",
          "body": "Sientes que los demás te sobrevaloran y temes que se noten tus carencias."
        },
        {
          "title": "Prepararte de más o aplazar",
          "body": "Para evitar fallar te preparas en exceso o retrasas el inicio, y el ciclo se repite."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿El síndrome del impostor es una enfermedad mental?",
          "answer": "No. No es una categoría diagnóstica, sino el nombre de una experiencia. Si viene con mucha ansiedad o ánimo bajo, hablar con un profesional puede ayudarte."
        },
        {
          "question": "¿Qué hago si mi puntuación es alta?",
          "answer": "Anotar lo que has logrado, aceptar un elogio sin rebatirlo y compartir lo que sientes con alguien de confianza suelen ayudar."
        },
        {
          "question": "¿Este test es la escala de Clance?",
          "answer": "Las preguntas las escribió OIYO a partir de las ideas de la Escala del Fenómeno del Impostor de Clance (CIPS), así que la puntuación no se puede comparar con la escala original."
        }
      ],
      "disclaimer": "Este resultado es una referencia para conocerte. No lo uses como base para un diagnóstico, una contratación o una evaluación."
    }
  },
  "sensory-processing": {
    "ko": {
      "introTitle": "예민함은 결함이 아니라 정보를 깊게 처리하는 방식이에요",
      "intro": "심리학자 Elaine Aron은 1997년 감각 처리 민감성(Sensory Processing Sensitivity)이라는 기질을 제안했어요. 소리, 빛, 분위기 같은 자극을 더 깊게 받아들이고 오래 곱씹는 성향으로, 연구에서는 인구의 약 15~20%가 여기에 가깝다고 봐요. 병이나 장애가 아니라 기질의 한 방향이에요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "깊은 처리",
          "body": "경험을 여러 번 되새기고, 결정하기 전에 오래 살펴요."
        },
        {
          "title": "쉽게 과부하",
          "body": "자극이 많은 곳에서 다른 사람보다 빨리 지쳐요."
        },
        {
          "title": "정서 반응과 공감",
          "body": "다른 사람의 감정과 작은 변화를 잘 알아채요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "HSP는 진단명인가요?",
          "answer": "아니에요. 연구에서 쓰는 개념이고, 감각처리장애나 자폐 스펙트럼 같은 임상 진단과는 달라요."
        },
        {
          "question": "예민함을 줄여야 하나요?",
          "answer": "기질은 바꾸기보다 다루는 쪽이 현실적이에요. 회복할 조용한 시간과 자극을 조절할 환경을 미리 마련해 두면 도움이 돼요."
        },
        {
          "question": "결과를 어디까지 믿어도 되나요?",
          "answer": "Aron의 개념을 참고한 자기 탐색용 문항이에요. 한 번의 점수보다 여러 상황에서 겪은 경험을 함께 보세요."
        }
      ],
      "disclaimer": "이 결과는 나를 이해하기 위한 참고예요. 진단이나 채용·평가의 근거로 쓰지 마세요."
    },
    "en": {
      "introTitle": "Sensitivity is not a flaw but a way of processing deeply",
      "intro": "In 1997 psychologist Elaine Aron proposed a temperament trait called sensory processing sensitivity. People high in it take in sounds, light and atmosphere more deeply and mull things over longer; research suggests roughly 15–20% of people are close to this end. It is a direction of temperament, not an illness or disorder.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Depth of processing",
          "body": "You go over experiences several times and look carefully before deciding."
        },
        {
          "title": "Easily overstimulated",
          "body": "You tire faster than others in busy, noisy places."
        },
        {
          "title": "Emotional response and empathy",
          "body": "You notice other people’s feelings and small changes easily."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Is HSP a diagnosis?",
          "answer": "No. It is a research concept and differs from clinical diagnoses such as sensory processing disorder or autism."
        },
        {
          "question": "Should I try to be less sensitive?",
          "answer": "Temperament is easier to manage than to change. Planning quiet recovery time and adjusting how much stimulation you take in tends to help."
        },
        {
          "question": "How far can I trust the result?",
          "answer": "The items are for self-exploration and draw on Aron’s concept. Look at your experiences across many situations, not one score."
        }
      ],
      "disclaimer": "This result is a reference for understanding yourself. Do not use it as grounds for diagnosis, hiring or evaluation."
    },
    "ja": {
      "introTitle": "敏感さは欠点ではなく、情報を深く処理するあり方です",
      "intro": "心理学者のエレイン・アーロンは1997年に、感覚処理感受性（Sensory Processing Sensitivity）という気質を提案しました。音や光、場の雰囲気といった刺激を深く受け取り、長く考え続ける傾向で、研究では人口のおよそ15〜20%がこれに近いとされます。病気や障害ではなく、気質のひとつの方向です。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "深い処理",
          "body": "経験を何度も振り返り、決める前にじっくり確かめます。"
        },
        {
          "title": "刺激で疲れやすい",
          "body": "刺激の多い場所では、人より早く疲れます。"
        },
        {
          "title": "感情の反応と共感",
          "body": "人の気持ちや小さな変化によく気づきます。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "HSPは診断名ですか？",
          "answer": "いいえ。研究で使われる概念で、感覚処理障害や自閉スペクトラム症のような臨床診断とは異なります。"
        },
        {
          "question": "敏感さを減らしたほうがいいですか？",
          "answer": "気質は変えるより付き合い方を工夫するほうが現実的です。回復のための静かな時間や、刺激を調整できる環境を用意しておくと助けになります。"
        },
        {
          "question": "結果はどこまで信じていいですか？",
          "answer": "アーロンの考え方を参考にした自己探索用の質問です。一度の点数より、さまざまな場面での経験と合わせて見てください。"
        }
      ],
      "disclaimer": "この結果は自分を理解するための参考です。診断や採用・評価の根拠には使わないでください。"
    },
    "zh": {
      "introTitle": "敏感不是缺点，而是深度处理信息的方式",
      "intro": "心理学家 Elaine Aron 在 1997 年提出了一种叫“感觉处理敏感性”的气质。高敏感的人会更深地接收声音、光线和氛围，并反复琢磨；研究认为大约 15%–20% 的人接近这一端。它是一种气质取向，不是疾病或障碍。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "深度加工",
          "body": "会反复回味经历，做决定前仔细斟酌。"
        },
        {
          "title": "容易过载",
          "body": "在嘈杂、刺激多的地方比别人更快感到疲惫。"
        },
        {
          "title": "情绪反应与共情",
          "body": "容易察觉别人的情绪和细微变化。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "高敏感人群（HSP）是诊断吗？",
          "answer": "不是。它是研究中使用的概念，与感觉统合障碍或自闭症谱系等临床诊断不同。"
        },
        {
          "question": "需要让自己不那么敏感吗？",
          "answer": "气质与其改变，不如学会应对。预留安静的恢复时间、调节接收的刺激量，通常会有帮助。"
        },
        {
          "question": "结果可以信到什么程度？",
          "answer": "这是参考 Aron 概念的自我探索题目。与其看一次分数，不如结合自己在不同情境下的体验来看。"
        }
      ],
      "disclaimer": "这个结果是帮助了解自己的参考，请不要把它当作诊断、招聘或评价的依据。"
    },
    "fr": {
      "introTitle": "La sensibilité n’est pas un défaut, mais une façon de traiter l’information en profondeur",
      "intro": "En 1997, la psychologue Elaine Aron a proposé un trait de tempérament appelé sensibilité du traitement sensoriel. Les personnes concernées perçoivent plus intensément les sons, la lumière ou l’ambiance et y repensent longtemps ; la recherche estime qu’environ 15 à 20 % des gens s’en rapprochent. C’est une orientation du tempérament, pas une maladie ni un trouble.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Un traitement en profondeur",
          "body": "Vous revenez souvent sur vos expériences et prenez le temps avant de décider."
        },
        {
          "title": "Vite surstimulé",
          "body": "Dans les lieux bruyants et animés, vous vous fatiguez plus vite que les autres."
        },
        {
          "title": "Émotions et empathie",
          "body": "Vous remarquez facilement les émotions des autres et les petits changements."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "L’hypersensibilité (HSP) est-elle un diagnostic ?",
          "answer": "Non. C’est un concept de recherche, différent des diagnostics cliniques comme le trouble du traitement sensoriel ou l’autisme."
        },
        {
          "question": "Faut-il chercher à être moins sensible ?",
          "answer": "Un tempérament se gère plus facilement qu’il ne se change. Prévoir des moments calmes pour récupérer et doser les stimulations aide souvent."
        },
        {
          "question": "Jusqu’où puis-je me fier au résultat ?",
          "answer": "Ces questions servent à l’exploration de soi et s’inspirent du concept d’Aron. Regardez vos expériences dans plusieurs situations plutôt qu’un seul score."
        }
      ],
      "disclaimer": "Ce résultat sert de repère pour mieux vous connaître. Ne l’utilisez pas comme base d’un diagnostic, d’un recrutement ou d’une évaluation."
    },
    "es": {
      "introTitle": "La sensibilidad no es un defecto, sino una forma de procesar a fondo",
      "intro": "En 1997 la psicóloga Elaine Aron propuso un rasgo de temperamento llamado sensibilidad de procesamiento sensorial. Quienes lo tienen perciben con más intensidad los sonidos, la luz o el ambiente y le dan más vueltas a las cosas; la investigación estima que entre un 15 y un 20 % de las personas se acerca a este extremo. Es una orientación del temperamento, no una enfermedad ni un trastorno.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Procesamiento profundo",
          "body": "Repasas tus experiencias varias veces y miras con calma antes de decidir."
        },
        {
          "title": "Te saturas con facilidad",
          "body": "En lugares ruidosos y con muchos estímulos te cansas antes que los demás."
        },
        {
          "title": "Emoción y empatía",
          "body": "Notas con facilidad las emociones de los demás y los pequeños cambios."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿Ser PAS (HSP) es un diagnóstico?",
          "answer": "No. Es un concepto de investigación y se diferencia de diagnósticos clínicos como el trastorno del procesamiento sensorial o el autismo."
        },
        {
          "question": "¿Debería intentar ser menos sensible?",
          "answer": "El temperamento se maneja mejor de lo que se cambia. Reservar ratos tranquilos para recuperarte y regular cuántos estímulos recibes suele ayudar."
        },
        {
          "question": "¿Hasta qué punto puedo fiarme del resultado?",
          "answer": "Son preguntas de autoexploración basadas en el concepto de Aron. Mira tus experiencias en distintas situaciones, no solo una puntuación."
        }
      ],
      "disclaimer": "Este resultado es una referencia para conocerte. No lo uses como base para un diagnóstico, una contratación o una evaluación."
    }
  },
  "tci-personality": {
    "ko": {
      "introTitle": "타고난 기질과 자라나는 성격을 나눠서 봐요",
      "intro": "정신과 의사 Robert Cloninger의 기질·성격 모델(TCI)은 성격을 두 층으로 나눠요. 비교적 타고나는 기질 네 가지(자극 추구, 위험 회피, 사회적 민감성, 인내력)와, 경험을 통해 자라는 성격 세 가지(자율성, 연대감, 자기초월)예요. 이 검사는 모델을 이해하도록 줄인 교육용 판이라 공식 TCI 점수와는 달라요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "기질 네 가지",
          "body": "새로움을 찾는 정도, 위험을 피하는 정도, 다른 사람의 인정에 반응하는 정도, 보상이 없어도 버티는 정도예요."
        },
        {
          "title": "성격 세 가지",
          "body": "스스로 방향을 정하는 힘, 다른 사람과 협력하는 힘, 나를 넘어선 가치를 느끼는 힘이에요."
        },
        {
          "title": "두 층의 조합",
          "body": "같은 기질이라도 성격이 어떻게 자랐는지에 따라 삶에서 드러나는 모습이 달라져요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "병원에서 하는 TCI와 같은가요?",
          "answer": "아니에요. 공식 TCI는 전문 기관이 쓰는 저작권 검사예요. 여기서는 모델을 이해하도록 줄여 만든 교육용 문항을 써요."
        },
        {
          "question": "기질은 바뀌지 않나요?",
          "answer": "기질은 비교적 안정적이지만 성격 차원은 경험과 노력으로 자라요. 그래서 결과를 정해진 운명처럼 읽지 않아요."
        },
        {
          "question": "점수가 높고 낮은 게 좋고 나쁜 건가요?",
          "answer": "아니에요. 예를 들어 위험 회피가 높으면 신중하고, 낮으면 과감해요. 상황에 따라 장단점이 달라요."
        }
      ],
      "disclaimer": "이 결과는 나를 이해하기 위한 참고예요. 진단이나 채용·평가의 근거로 쓰지 마세요."
    },
    "en": {
      "introTitle": "Separating the temperament you’re born with from the character you grow",
      "intro": "Psychiatrist Robert Cloninger’s Temperament and Character model (TCI) splits personality into two layers: four largely inborn temperament traits (novelty seeking, harm avoidance, reward dependence, persistence) and three character traits that grow with experience (self-directedness, cooperativeness, self-transcendence). This is a shortened educational version, so its scores differ from the official TCI.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Four temperaments",
          "body": "How much you seek novelty, avoid harm, respond to others’ approval, and keep going without reward."
        },
        {
          "title": "Three character traits",
          "body": "Setting your own direction, working with others, and feeling a value beyond yourself."
        },
        {
          "title": "How the layers combine",
          "body": "The same temperament can look very different in life depending on how character has grown."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Is this the TCI used in clinics?",
          "answer": "No. The official TCI is a copyrighted instrument used by professionals. This page uses shortened educational items to explain the model."
        },
        {
          "question": "Does temperament never change?",
          "answer": "Temperament is fairly stable, but the character dimensions grow with experience and effort, so the result is not a fixed fate."
        },
        {
          "question": "Is a high or low score good or bad?",
          "answer": "No. High harm avoidance, for example, means caution; low means boldness. Each has strengths depending on the situation."
        }
      ],
      "disclaimer": "This result is a reference for understanding yourself. Do not use it as grounds for diagnosis, hiring or evaluation."
    },
    "ja": {
      "introTitle": "生まれ持った気質と、育っていく性格を分けて見ます",
      "intro": "精神科医ロバート・クロニンジャーの気質・性格モデル（TCI）は、パーソナリティを二つの層に分けます。比較的生まれつきの気質四つ（新奇性追求・損害回避・報酬依存・固執）と、経験を通して育つ性格三つ（自己志向・協調・自己超越）です。このテストはモデルを理解するための短縮版なので、公式のTCIの得点とは異なります。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "四つの気質",
          "body": "新しさを求める度合い、危険を避ける度合い、人の評価に反応する度合い、報酬がなくても続ける度合いです。"
        },
        {
          "title": "三つの性格",
          "body": "自分で方向を決める力、人と協力する力、自分を超えた価値を感じる力です。"
        },
        {
          "title": "二つの層の組み合わせ",
          "body": "同じ気質でも、性格の育ち方によって生活での表れ方は変わります。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "病院で受けるTCIと同じですか？",
          "answer": "いいえ。公式のTCIは専門機関が使う著作権のある検査です。ここではモデルを理解するための短い教育用の質問を使っています。"
        },
        {
          "question": "気質は変わらないのですか？",
          "answer": "気質は比較的安定していますが、性格の次元は経験と努力で育ちます。結果を決まった運命として読む必要はありません。"
        },
        {
          "question": "点数の高い低いに良し悪しはありますか？",
          "answer": "ありません。たとえば損害回避が高ければ慎重、低ければ大胆です。場面によって長所も短所も変わります。"
        }
      ],
      "disclaimer": "この結果は自分を理解するための参考です。診断や採用・評価の根拠には使わないでください。"
    },
    "zh": {
      "introTitle": "把与生俱来的气质和逐渐成长的性格分开来看",
      "intro": "精神科医生 Robert Cloninger 的气质与性格模型（TCI）把人格分成两层：相对天生的四种气质（新奇寻求、伤害回避、奖赏依赖、坚持），以及随经验成长的三种性格（自我导向、合作性、自我超越）。本测试是为理解模型而简化的教学版，分数与正式 TCI 不同。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "四种气质",
          "body": "寻求新鲜感、回避风险、回应他人认可、没有奖励也能坚持的程度。"
        },
        {
          "title": "三种性格",
          "body": "自己定方向的能力、与人合作的能力、感受超越自我价值的能力。"
        },
        {
          "title": "两层的组合",
          "body": "同样的气质，会因性格的成长方式不同，在生活中表现得很不一样。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "和医院做的 TCI 一样吗？",
          "answer": "不一样。正式 TCI 是专业机构使用的受版权保护的量表。这里用的是为理解模型而简化的教学题目。"
        },
        {
          "question": "气质不会改变吗？",
          "answer": "气质相对稳定，但性格维度会随经验和努力而成长，所以不必把结果当成定数。"
        },
        {
          "question": "分数高低有好坏之分吗？",
          "answer": "没有。比如伤害回避高代表谨慎，低代表大胆，在不同情境下各有长短。"
        }
      ],
      "disclaimer": "这个结果是帮助了解自己的参考，请不要把它当作诊断、招聘或评价的依据。"
    },
    "fr": {
      "introTitle": "Distinguer le tempérament inné du caractère qui se construit",
      "intro": "Le modèle tempérament-caractère (TCI) du psychiatre Robert Cloninger sépare la personnalité en deux couches : quatre traits de tempérament en grande partie innés (recherche de nouveauté, évitement du danger, dépendance à la récompense, persistance) et trois traits de caractère qui se développent avec l’expérience (autodétermination, coopération, transcendance de soi). Ce test est une version pédagogique abrégée : ses scores diffèrent du TCI officiel.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Quatre tempéraments",
          "body": "Votre goût pour la nouveauté, votre prudence face au danger, votre sensibilité à l’approbation des autres et votre persévérance sans récompense."
        },
        {
          "title": "Trois traits de caractère",
          "body": "Choisir sa propre direction, coopérer avec les autres et ressentir une valeur qui vous dépasse."
        },
        {
          "title": "La combinaison des deux",
          "body": "Un même tempérament peut se manifester très différemment selon la façon dont le caractère s’est développé."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Est-ce le TCI utilisé en clinique ?",
          "answer": "Non. Le TCI officiel est un outil protégé utilisé par des professionnels. Cette page utilise des questions pédagogiques abrégées pour expliquer le modèle."
        },
        {
          "question": "Le tempérament ne change-t-il jamais ?",
          "answer": "Il est assez stable, mais les dimensions du caractère évoluent avec l’expérience et l’effort. Le résultat n’est donc pas un destin figé."
        },
        {
          "question": "Un score élevé ou faible est-il bon ou mauvais ?",
          "answer": "Non. Un fort évitement du danger signifie la prudence, un faible, l’audace. Chacun a ses atouts selon la situation."
        }
      ],
      "disclaimer": "Ce résultat sert de repère pour mieux vous connaître. Ne l’utilisez pas comme base d’un diagnostic, d’un recrutement ou d’une évaluation."
    },
    "es": {
      "introTitle": "Separar el temperamento con el que naces del carácter que se desarrolla",
      "intro": "El modelo de temperamento y carácter (TCI) del psiquiatra Robert Cloninger divide la personalidad en dos capas: cuatro rasgos de temperamento en gran parte innatos (búsqueda de novedad, evitación del daño, dependencia de la recompensa y persistencia) y tres rasgos de carácter que crecen con la experiencia (autodirección, cooperación y autotrascendencia). Este test es una versión educativa abreviada, así que sus puntuaciones no equivalen al TCI oficial.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Cuatro temperamentos",
          "body": "Cuánto buscas lo nuevo, evitas el riesgo, respondes a la aprobación de los demás y sigues adelante sin recompensa."
        },
        {
          "title": "Tres rasgos de carácter",
          "body": "Marcar tu propio rumbo, cooperar con otros y sentir un valor que va más allá de ti."
        },
        {
          "title": "Cómo se combinan",
          "body": "Un mismo temperamento puede verse muy distinto en la vida según cómo haya crecido el carácter."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿Es el TCI que se usa en consulta?",
          "answer": "No. El TCI oficial es un instrumento con derechos de autor que usan profesionales. Aquí se usan preguntas educativas abreviadas para explicar el modelo."
        },
        {
          "question": "¿El temperamento no cambia nunca?",
          "answer": "Es bastante estable, pero las dimensiones del carácter crecen con la experiencia y el esfuerzo, así que el resultado no es un destino fijo."
        },
        {
          "question": "¿Una puntuación alta o baja es buena o mala?",
          "answer": "No. Una evitación del daño alta indica prudencia; baja, audacia. Cada una tiene ventajas según la situación."
        }
      ],
      "disclaimer": "Este resultado es una referencia para conocerte. No lo uses como base para un diagnóstico, una contratación o una evaluación."
    }
  },
  "optimism": {
    "ko": {
      "introTitle": "낙관은 \"잘될 거야\"라고 기대하는 습관이에요",
      "intro": "심리학자 Michael Scheier와 Charles Carver는 앞으로 좋은 일이 일어나리라 기대하는 일반적인 경향을 '성향적 낙관주의'라고 불렀고, 이를 재는 LOT-R(1994)을 만들었어요. 이 검사는 LOT-R 문항 일부에 OIYO가 네 문항을 더해 만들었어요. 낙관은 문제를 외면하는 태도가 아니라, 어려움 속에서도 목표를 붙잡게 하는 기대의 방식으로 연구돼 왔어요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "성향적 낙관",
          "body": "상황이 불확실할 때 좋은 결과를 먼저 기대하는 경향이에요."
        },
        {
          "title": "현실적인 낙관",
          "body": "좋은 결과를 기대하면서도 위험을 함께 보는 균형이에요."
        },
        {
          "title": "비관의 쓸모",
          "body": "최악을 미리 떠올리는 '방어적 비관'은 불안한 사람에게 준비하는 도구가 되기도 해요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "낙관적일수록 좋은가요?",
          "answer": "스트레스 대처와 건강 행동에 대체로 도움이 된다고 알려져 있어요. 다만 위험을 과소평가하는 지나친 낙관은 오히려 해가 될 수 있어요."
        },
        {
          "question": "낙관은 연습으로 바뀌나요?",
          "answer": "기대하는 습관은 조금씩 바뀔 수 있어요. 잘된 일을 기록하거나, 나쁜 일을 영원하고 전부인 것처럼 해석하는 습관을 알아채는 연습이 쓰여요."
        },
        {
          "question": "LOT-R 점수와 같은가요?",
          "answer": "같지 않아요. 낙관 문항과 비관 문항을 함께 묻고 비관 문항은 거꾸로 세는 방식은 같지만, OIYO가 더한 네 문항까지 열 문항을 모두 채점해요. 그래서 LOT-R 점수와 직접 비교할 수는 없어요."
        }
      ],
      "disclaimer": "이 결과는 나를 이해하기 위한 참고예요. 진단이나 채용·평가의 근거로 쓰지 마세요."
    },
    "en": {
      "introTitle": "Optimism is a habit of expecting things to turn out well",
      "intro": "Psychologists Michael Scheier and Charles Carver called the general tendency to expect good outcomes “dispositional optimism” and built the LOT-R (1994) to measure it. This test uses several LOT-R items plus four added by OIYO. Optimism has been studied not as ignoring problems but as a way of expecting that keeps people holding on to their goals through difficulty.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Dispositional optimism",
          "body": "The tendency to expect a good outcome first when things are uncertain."
        },
        {
          "title": "Realistic optimism",
          "body": "Expecting good outcomes while still looking at the risks."
        },
        {
          "title": "When pessimism helps",
          "body": "“Defensive pessimism”, picturing the worst in advance, can be a way for anxious people to prepare."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Is more optimism always better?",
          "answer": "It is generally linked to better coping and health habits, but over-optimism that underrates risk can backfire."
        },
        {
          "question": "Can optimism be practised?",
          "answer": "Expectation habits can shift a little at a time — for example by noting what went well, or catching the habit of reading bad events as permanent and all-encompassing."
        },
        {
          "question": "Is this the same as a LOT-R score?",
          "answer": "No. Like the LOT-R it mixes optimistic and pessimistic items and reverses the pessimistic ones, but all ten items are scored, including the four OIYO added, so the total cannot be compared with LOT-R scores."
        }
      ],
      "disclaimer": "This result is a reference for understanding yourself. Do not use it as grounds for diagnosis, hiring or evaluation."
    },
    "ja": {
      "introTitle": "楽観とは「うまくいくはず」と期待する習慣です",
      "intro": "心理学者のマイケル・シャイアーとチャールズ・カーヴァーは、これから良いことが起こると期待する一般的な傾向を「特性的楽観性」と呼び、それを測るLOT-R（1994）を作りました。このテストは、LOT-Rの質問の一部にOIYOが4問を加えて作りました。楽観は問題から目をそらす態度ではなく、困難の中でも目標を手放さないための期待のあり方として研究されてきました。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "特性的楽観性",
          "body": "先が見えないとき、まず良い結果を期待する傾向です。"
        },
        {
          "title": "現実的な楽観",
          "body": "良い結果を期待しながら、リスクも一緒に見るバランスです。"
        },
        {
          "title": "悲観の効用",
          "body": "最悪を先に思い描く「防衛的悲観主義」は、不安の強い人にとって準備の道具にもなります。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "楽観的であるほど良いのですか？",
          "answer": "ストレスへの対処や健康的な行動におおむね役立つとされますが、リスクを軽く見る行きすぎた楽観はかえって害になることがあります。"
        },
        {
          "question": "楽観は練習で変わりますか？",
          "answer": "期待の習慣は少しずつ変わります。うまくいったことを記録したり、悪い出来事をずっと続く全面的なものとして解釈する癖に気づいたりする練習が使われます。"
        },
        {
          "question": "LOT-Rの点数と同じですか？",
          "answer": "同じではありません。楽観と悲観の質問を両方尋ね、悲観の質問を反転して数える点はLOT-Rと同じですが、OIYOが加えた4問も含めて10問すべてを採点します。そのためLOT-Rの点数とは直接比べられません。"
        }
      ],
      "disclaimer": "この結果は自分を理解するための参考です。診断や採用・評価の根拠には使わないでください。"
    },
    "zh": {
      "introTitle": "乐观是一种“会好起来”的期待习惯",
      "intro": "心理学家 Michael Scheier 和 Charles Carver 把期待未来会有好结果的一般倾向称为“特质性乐观”，并编制了测量它的 LOT-R（1994）。本测试在部分 LOT-R 题目的基础上，由 OIYO 增加了四道题。研究中的乐观并不是回避问题，而是一种让人在困难中仍能坚持目标的期待方式。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "特质性乐观",
          "body": "在情况不确定时，先期待好结果的倾向。"
        },
        {
          "title": "现实的乐观",
          "body": "既期待好结果，也同时看到风险的平衡。"
        },
        {
          "title": "悲观的用处",
          "body": "提前设想最坏情况的“防御性悲观”，对焦虑的人来说也可以是做准备的方法。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "越乐观越好吗？",
          "answer": "乐观通常有助于应对压力和保持健康习惯，但低估风险的过度乐观反而可能有害。"
        },
        {
          "question": "乐观可以练习吗？",
          "answer": "期待的习惯可以一点点改变，比如记录做得好的事，或留意自己把坏事解读为永久、全面的习惯。"
        },
        {
          "question": "和 LOT-R 的分数一样吗？",
          "answer": "不一样。和 LOT-R 一样同时询问乐观与悲观题目、悲观题反向计分，但包括 OIYO 增加的四题在内，十道题全部计分，因此不能与 LOT-R 分数直接比较。"
        }
      ],
      "disclaimer": "这个结果是帮助了解自己的参考，请不要把它当作诊断、招聘或评价的依据。"
    },
    "fr": {
      "introTitle": "L’optimisme est l’habitude de s’attendre à ce que les choses tournent bien",
      "intro": "Les psychologues Michael Scheier et Charles Carver ont appelé « optimisme dispositionnel » la tendance générale à s’attendre à de bons résultats, et ont créé le LOT-R (1994) pour la mesurer. Ce test reprend plusieurs questions du LOT-R et en ajoute quatre écrites par OIYO. L’optimisme n’y est pas étudié comme une façon d’ignorer les problèmes, mais comme une attente qui aide à garder ses objectifs face aux difficultés.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Optimisme dispositionnel",
          "body": "La tendance à attendre d’abord une issue favorable quand la situation est incertaine."
        },
        {
          "title": "Optimisme réaliste",
          "body": "Espérer un bon résultat tout en regardant les risques en face."
        },
        {
          "title": "L’utilité du pessimisme",
          "body": "Le « pessimisme défensif », qui imagine le pire à l’avance, peut aider les personnes anxieuses à se préparer."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Plus d’optimisme, est-ce toujours mieux ?",
          "answer": "Il est en général associé à une meilleure gestion du stress et à de bonnes habitudes de santé, mais un excès d’optimisme qui sous-estime les risques peut se retourner contre vous."
        },
        {
          "question": "L’optimisme se travaille-t-il ?",
          "answer": "Les habitudes d’attente peuvent évoluer peu à peu, par exemple en notant ce qui s’est bien passé ou en repérant la tendance à voir un événement négatif comme durable et général."
        },
        {
          "question": "Est-ce le même score que le LOT-R ?",
          "answer": "Non. Comme le LOT-R, il mêle des questions optimistes et pessimistes et inverse ces dernières, mais les dix questions sont comptées, y compris les quatre ajoutées par OIYO. Le total n’est donc pas comparable à un score LOT-R."
        }
      ],
      "disclaimer": "Ce résultat sert de repère pour mieux vous connaître. Ne l’utilisez pas comme base d’un diagnostic, d’un recrutement ou d’une évaluation."
    },
    "es": {
      "introTitle": "El optimismo es la costumbre de esperar que las cosas salgan bien",
      "intro": "Los psicólogos Michael Scheier y Charles Carver llamaron «optimismo disposicional» a la tendencia general a esperar buenos resultados y crearon el LOT-R (1994) para medirla. Este test usa varias preguntas del LOT-R y cuatro añadidas por OIYO. El optimismo no se ha estudiado como una forma de ignorar los problemas, sino como una manera de esperar que ayuda a mantener los objetivos en momentos difíciles.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Optimismo disposicional",
          "body": "La tendencia a esperar primero un buen resultado cuando la situación es incierta."
        },
        {
          "title": "Optimismo realista",
          "body": "Esperar lo mejor sin dejar de mirar los riesgos."
        },
        {
          "title": "Para qué sirve el pesimismo",
          "body": "El «pesimismo defensivo», imaginar lo peor de antemano, puede ayudar a las personas ansiosas a prepararse."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿Cuanto más optimista, mejor?",
          "answer": "Suele asociarse con un mejor manejo del estrés y hábitos más sanos, pero el optimismo excesivo que subestima los riesgos puede volverse en contra."
        },
        {
          "question": "¿Se puede practicar el optimismo?",
          "answer": "Los hábitos de expectativa cambian poco a poco, por ejemplo anotando lo que salió bien o detectando la costumbre de ver lo malo como permanente y total."
        },
        {
          "question": "¿Es la misma puntuación que el LOT-R?",
          "answer": "No. Como el LOT-R, combina ítems optimistas y pesimistas e invierte los pesimistas, pero se puntúan los diez, incluidos los cuatro añadidos por OIYO, así que el total no se puede comparar con el LOT-R."
        }
      ],
      "disclaimer": "Este resultado es una referencia para conocerte. No lo uses como base para un diagnóstico, una contratación o una evaluación."
    }
  },
  "egogram": {
    "ko": {
      "introTitle": "마음속 다섯 개의 나를 그래프로 그려 봐요",
      "intro": "에고그램은 교류분석(TA)을 만든 Eric Berne의 자아 상태 개념을, 그의 제자 John Dusay가 1970년대에 막대그래프로 그려 보인 방법이에요. 부모·어른·아이 세 자아를 다섯으로 나눠, 지금 어떤 목소리가 크고 어떤 목소리가 작은지 봐요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "부모 자아 (CP·NP)",
          "body": "규칙과 책임을 강조하는 비판적 부모(CP), 돌보고 감싸는 양육적 부모(NP)예요."
        },
        {
          "title": "어른 자아 (A)",
          "body": "감정보다 사실과 자료로 판단하는 부분이에요."
        },
        {
          "title": "아이 자아 (FC·AC)",
          "body": "자유롭게 즐기는 자유로운 아이(FC), 다른 사람에게 맞추는 순응하는 아이(AC)예요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "어떤 모양이 가장 좋은가요?",
          "answer": "정답인 모양은 없어요. 어느 한 자아가 유난히 크거나 작다면, 그 부분이 관계에서 어떻게 드러나는지 살펴보는 데 써요."
        },
        {
          "question": "결과는 바뀌나요?",
          "answer": "에고그램은 지금 마음의 에너지가 어떻게 나뉘어 있는지 보는 것이라, 상황과 시기에 따라 달라져요."
        },
        {
          "question": "교류분석은 어디에 쓰이나요?",
          "answer": "상담, 교육, 조직의 소통에서 대화가 어긋나는 지점을 찾는 틀로 쓰여 왔어요."
        }
      ],
      "disclaimer": "이 결과는 나를 이해하기 위한 참고예요. 진단이나 채용·평가의 근거로 쓰지 마세요."
    },
    "en": {
      "introTitle": "Draw the five voices inside you as a graph",
      "intro": "The egogram is John Dusay’s 1970s way of drawing Eric Berne’s ego states — the core idea of Transactional Analysis (TA) — as a bar chart. It splits the Parent, Adult and Child ego states into five and shows which voices are loud and which are quiet right now.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Parent (CP · NP)",
          "body": "The Critical Parent stresses rules and duty; the Nurturing Parent cares and protects."
        },
        {
          "title": "Adult (A)",
          "body": "The part that judges from facts and information rather than feelings."
        },
        {
          "title": "Child (FC · AC)",
          "body": "The Free Child enjoys and plays freely; the Adapted Child fits in with others."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Which shape is best?",
          "answer": "There is no right shape. If one state is unusually high or low, use it to look at how that part shows up in your relationships."
        },
        {
          "question": "Does the result change?",
          "answer": "An egogram shows how your energy is spread right now, so it shifts with situations and phases of life."
        },
        {
          "question": "Where is Transactional Analysis used?",
          "answer": "In counselling, education and workplace communication, as a frame for spotting where conversations go wrong."
        }
      ],
      "disclaimer": "This result is a reference for understanding yourself. Do not use it as grounds for diagnosis, hiring or evaluation."
    },
    "ja": {
      "introTitle": "心の中の五つの自分をグラフにしてみましょう",
      "intro": "エゴグラムは、交流分析（TA）を創始したエリック・バーンの自我状態の考え方を、弟子のジョン・デュセイが1970年代に棒グラフで示した方法です。親・大人・子どもの三つの自我を五つに分け、いまどの声が大きく、どの声が小さいかを見ます。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "親の自我（CP・NP）",
          "body": "規則や責任を重んじる批判的な親（CP）と、世話をして包み込む養育的な親（NP）です。"
        },
        {
          "title": "大人の自我（A）",
          "body": "感情より事実や情報をもとに判断する部分です。"
        },
        {
          "title": "子どもの自我（FC・AC）",
          "body": "自由に楽しむ自由な子ども（FC）と、周りに合わせる順応した子ども（AC）です。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "どんな形がいちばん良いのですか？",
          "answer": "正解の形はありません。ある自我がとくに高い・低いときに、その部分が人間関係でどう表れているかを見るのに使います。"
        },
        {
          "question": "結果は変わりますか？",
          "answer": "エゴグラムはいまの心のエネルギー配分を見るものなので、状況や時期によって変わります。"
        },
        {
          "question": "交流分析はどこで使われていますか？",
          "answer": "カウンセリングや教育、職場のコミュニケーションで、会話のすれ違いを見つける枠組みとして使われてきました。"
        }
      ],
      "disclaimer": "この結果は自分を理解するための参考です。診断や採用・評価の根拠には使わないでください。"
    },
    "zh": {
      "introTitle": "把心里的五个“我”画成图表",
      "intro": "自我图（Egogram）是 John Dusay 在 20 世纪 70 年代，把其老师 Eric Berne 创立的交互分析（TA）中的自我状态画成柱状图的方法。它把父母、成人、儿童三种自我分成五个部分，看看现在哪个声音大、哪个声音小。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "父母自我（CP · NP）",
          "body": "强调规则和责任的批判型父母（CP），以及照顾和包容的养育型父母（NP）。"
        },
        {
          "title": "成人自我（A）",
          "body": "依据事实和信息而不是情绪来判断的部分。"
        },
        {
          "title": "儿童自我（FC · AC）",
          "body": "自由享受的自由型儿童（FC），以及迁就他人的顺应型儿童（AC）。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "哪种形状最好？",
          "answer": "没有标准答案。如果某个自我特别高或特别低，可以借此看看这部分在人际关系中是怎样表现的。"
        },
        {
          "question": "结果会变吗？",
          "answer": "自我图反映的是此刻心理能量的分配，会随情境和人生阶段而变化。"
        },
        {
          "question": "交互分析用在哪里？",
          "answer": "在咨询、教育和职场沟通中，它常被用作找出对话哪里出了偏差的框架。"
        }
      ],
      "disclaimer": "这个结果是帮助了解自己的参考，请不要把它当作诊断、招聘或评价的依据。"
    },
    "fr": {
      "introTitle": "Représentez en graphique les cinq voix qui sont en vous",
      "intro": "L’égogramme est la façon dont John Dusay, dans les années 1970, a mis sous forme de diagramme en barres les états du moi d’Eric Berne, fondateur de l’analyse transactionnelle (AT). Il divise les états Parent, Adulte et Enfant en cinq et montre quelles voix sont fortes ou discrètes en ce moment.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Parent (PN · PC)",
          "body": "Le Parent critique insiste sur les règles et le devoir ; le Parent nourricier prend soin et protège."
        },
        {
          "title": "Adulte (A)",
          "body": "La part qui juge à partir des faits et des informations plutôt que des émotions."
        },
        {
          "title": "Enfant (EL · EA)",
          "body": "L’Enfant libre profite et joue librement ; l’Enfant adapté s’ajuste aux autres."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Quelle forme est la meilleure ?",
          "answer": "Il n’y a pas de bonne forme. Si un état est particulièrement haut ou bas, servez-vous-en pour observer comment cette part se manifeste dans vos relations."
        },
        {
          "question": "Le résultat change-t-il ?",
          "answer": "L’égogramme montre la répartition actuelle de votre énergie : il varie selon les situations et les périodes de la vie."
        },
        {
          "question": "À quoi sert l’analyse transactionnelle ?",
          "answer": "On l’utilise en accompagnement, en éducation et en communication au travail pour repérer où les échanges se grippent."
        }
      ],
      "disclaimer": "Ce résultat sert de repère pour mieux vous connaître. Ne l’utilisez pas comme base d’un diagnostic, d’un recrutement ou d’une évaluation."
    },
    "es": {
      "introTitle": "Dibuja en un gráfico las cinco voces que hay en ti",
      "intro": "El egograma es la forma en que John Dusay, en los años setenta, representó en un gráfico de barras los estados del yo de Eric Berne, creador del análisis transaccional (AT). Divide los estados Padre, Adulto y Niño en cinco y muestra qué voces suenan más fuerte y cuáles más bajo ahora mismo.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Padre (PC · PN)",
          "body": "El Padre crítico insiste en las normas y el deber; el Padre nutricio cuida y protege."
        },
        {
          "title": "Adulto (A)",
          "body": "La parte que decide a partir de hechos y datos, no de emociones."
        },
        {
          "title": "Niño (NL · NA)",
          "body": "El Niño libre disfruta y juega con libertad; el Niño adaptado se acomoda a los demás."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿Qué forma es la mejor?",
          "answer": "No hay una forma correcta. Si un estado está muy alto o muy bajo, úsalo para ver cómo aparece esa parte en tus relaciones."
        },
        {
          "question": "¿El resultado cambia?",
          "answer": "El egograma muestra cómo se reparte tu energía ahora, así que cambia con las situaciones y las etapas de la vida."
        },
        {
          "question": "¿Para qué se usa el análisis transaccional?",
          "answer": "En la orientación, la educación y la comunicación en el trabajo, como marco para detectar dónde se tuercen las conversaciones."
        }
      ],
      "disclaimer": "Este resultado es una referencia para conocerte. No lo uses como base para un diagnóstico, una contratación o una evaluación."
    }
  },
  // 2026-09-29 O9 B 2차: 노출 0인 52개 중 GA4 90일 방문 상위 다섯. resilience-boost 는 resilience 와 주제가 겹쳐 빼고(같은 날 resilience-test 로 301 통합) 6위 creativity-type 을 넣었다.
  "social-media-personality": {
    "ko": {
      "introTitle": "SNS에서 나는 만드는 사람일까, 지켜보는 사람일까",
      "intro": "이 검사는 10개 질문으로 SNS를 쓰는 방식을 창작자, 퍼포머, 관찰자, 연결자의 네 가지로 나눠 보여 줘요. 연구자들도 SNS 사용을 게시·소통 같은 능동적 사용과 둘러보기 같은 수동적 사용으로 나눠 살펴 왔어요(Verduyn 외, 2017). 네 유형은 OIYO가 이 구분을 쉽게 풀어 만든 틀이에요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "능동적 사용과 수동적 사용",
          "body": "글을 올리고 대화하는 것과 피드를 조용히 넘겨 보는 것은 마음에 남기는 흔적이 다를 수 있다는 관점이에요."
        },
        {
          "title": "사회적 비교",
          "body": "다른 사람의 잘 다듬어진 일상과 내 일상을 견주게 되는 경향이에요. 둘러보는 시간이 길수록 신경 써 볼 만해요."
        },
        {
          "title": "반응에 대한 기대",
          "body": "좋아요와 댓글이 동기가 되기도 하지만, 반응에 기분이 크게 흔들린다면 쉬어 가는 신호로 볼 수 있어요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "조용히 구경만 하면 행복감이 떨어지나요?",
          "answer": "초기 연구에서는 그런 경향이 보고됐지만, 이후 연구들에서는 효과가 작거나 사람마다 다르다는 결과도 많이 나왔어요. 구경하는 것 자체보다 보고 난 뒤의 기분을 살펴보는 편이 좋아요."
        },
        {
          "question": "유형이 바뀔 수도 있나요?",
          "answer": "네, 바뀔 수 있어요. 쓰는 앱, 시기, 기분에 따라 SNS를 대하는 방식은 달라져요. 지금의 습관을 보는 스냅숏으로 여겨 주세요."
        },
        {
          "question": "SNS 사용을 줄여야 할지 어떻게 알 수 있나요?",
          "answer": "잠이나 일, 대면 관계를 밀어낼 때, 또는 보고 나서 자주 허탈하다면 사용 시간을 정해 두거나 알림을 줄여 보세요."
        }
      ],
      "disclaimer": "이 결과는 SNS 습관을 돌아보기 위한 재미 삼은 참고예요. 심리 진단이나 중독 판정이 아니에요."
    },
    "en": {
      "introTitle": "On social media, are you a maker or a watcher?",
      "intro": "This quiz uses 10 questions to sort how you use social media into four styles: creator, performer, lurker and connector. Researchers have long split social media use into active use, like posting and chatting, and passive use, like scrolling (Verduyn et al., 2017). The four styles are OIYO's friendly way of turning that split into a quiz.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Active vs. passive use",
          "body": "Posting and talking may leave a different mark on your mood than quietly scrolling through a feed."
        },
        {
          "title": "Social comparison",
          "body": "It is easy to measure your everyday life against other people's polished highlights, especially after long scrolling sessions."
        },
        {
          "title": "Waiting for reactions",
          "body": "Likes and comments can be motivating, but if they swing your mood a lot, that may be a sign to take a break."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Does lurking make you less happy?",
          "answer": "Early studies reported that pattern, but later research often found the effect to be small or different from person to person. It is more useful to notice how you feel after scrolling than to judge scrolling itself."
        },
        {
          "question": "Can my style change?",
          "answer": "Yes. The app you use, the season of life you are in and your mood all change how you behave online. Think of your result as a snapshot of current habits."
        },
        {
          "question": "How do I know if I should cut back?",
          "answer": "If it pushes out sleep, work or face-to-face time, or you often feel drained afterwards, try setting time limits or turning off some notifications."
        }
      ],
      "disclaimer": "This result is a light-hearted way to reflect on your social media habits. It is not a psychological diagnosis or an addiction assessment."
    },
    "ja": {
      "introTitle": "SNSでのあなたは、発信する人？それとも見守る人？",
      "intro": "このテストは10の質問で、SNSの使い方をクリエイター、パフォーマー、観察者、コネクターの4タイプに分けて見せます。研究者たちもSNSの利用を、投稿や会話のような能動的な利用と、眺めるだけの受動的な利用に分けて調べてきました（Verduyn ら、2017年）。4タイプは、OIYOがこの区別をわかりやすく言い換えた枠組みです。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "能動的な利用と受動的な利用",
          "body": "投稿して会話することと、タイムラインを黙って眺めることでは、心に残るものが違うかもしれないという考え方です。"
        },
        {
          "title": "社会的比較",
          "body": "他の人のきれいに整えられた日常と自分の日常を比べてしまう傾向です。眺める時間が長いときは少し気にしてみましょう。"
        },
        {
          "title": "反応への期待",
          "body": "いいねやコメントは励みになりますが、反応で気分が大きく揺れるなら、ひと休みのサインかもしれません。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "見るだけだと幸福感が下がりますか？",
          "answer": "初期の研究ではそうした傾向が報告されましたが、その後の研究では効果は小さい、あるいは人によって違うという結果も多く出ています。見ること自体より、見たあとの気分に目を向けるのがおすすめです。"
        },
        {
          "question": "タイプは変わることがありますか？",
          "answer": "はい、変わります。使うアプリや時期、気分によってSNSとの付き合い方は変わります。今の習慣のスナップショットとして受け取ってください。"
        },
        {
          "question": "SNSを減らすべきかどうか、どうすればわかりますか？",
          "answer": "睡眠や仕事、対面の関係を押しのけているとき、または見たあとによく虚しくなるときは、利用時間を決めたり通知を減らしたりしてみてください。"
        }
      ],
      "disclaimer": "この結果はSNSの習慣を振り返るための、気軽な参考です。心理的な診断や依存の判定ではありません。"
    },
    "zh": {
      "introTitle": "在社交媒体上，你是创作者还是旁观者？",
      "intro": "这个测试用 10 个问题，把你使用社交媒体的方式分成创作者、表演者、观察者和连接者四种类型。研究者也一直把社交媒体使用分为发帖、聊天这样的主动使用，和刷动态这样的被动使用（Verduyn 等，2017）。这四种类型是 OIYO 为了好懂而把这种区分改写成的框架。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "主动使用与被动使用",
          "body": "发帖聊天和默默刷动态，给心情留下的影响可能不一样。"
        },
        {
          "title": "社会比较",
          "body": "人很容易拿自己的日常去和别人精心修饰过的生活比较。刷得越久，越值得留意。"
        },
        {
          "title": "对反馈的期待",
          "body": "点赞和评论能带来动力，但如果心情随之大起大落，可能就是该歇一歇的信号。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "只看不发会让人不开心吗？",
          "answer": "早期研究曾报告过这种倾向，但后来的许多研究发现效果很小，或者因人而异。与其评判“看”本身，不如留意看完之后的心情。"
        },
        {
          "question": "类型会变吗？",
          "answer": "会的。使用的应用、所处的阶段和心情，都会改变你在网上的方式。请把结果当作当前习惯的一张快照。"
        },
        {
          "question": "怎么判断该不该少用社交媒体？",
          "answer": "如果它挤占了睡眠、工作或面对面的相处，或者你看完后常常觉得空虚，可以试着给自己定个时长，或关掉一部分通知。"
        }
      ],
      "disclaimer": "这个结果是帮你轻松回顾社交媒体习惯的参考，不是心理诊断，也不是成瘾评估。"
    },
    "fr": {
      "introTitle": "Sur les réseaux sociaux, créez-vous ou observez-vous ?",
      "intro": "Ce test utilise 10 questions pour classer votre façon d’utiliser les réseaux sociaux en quatre styles : créateur, performer, observateur et connecteur. Les chercheurs distinguent depuis longtemps l’usage actif, comme publier et discuter, de l’usage passif, comme faire défiler son fil (Verduyn et al., 2017). Les quatre styles sont une manière accessible, proposée par OIYO, de traduire cette distinction.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Usage actif et usage passif",
          "body": "Publier et échanger ne laisse peut-être pas la même trace sur votre humeur que faire défiler un fil en silence."
        },
        {
          "title": "Comparaison sociale",
          "body": "On compare facilement son quotidien aux moments soigneusement choisis des autres, surtout après de longues séances de défilement."
        },
        {
          "title": "L’attente des réactions",
          "body": "Les likes et les commentaires motivent, mais s’ils font beaucoup varier votre humeur, c’est peut-être le signe qu’une pause vous ferait du bien."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Observer sans publier rend-il moins heureux ?",
          "answer": "Les premières études ont rapporté cette tendance, mais des travaux plus récents ont souvent trouvé un effet faible ou variable selon les personnes. Il est plus utile d’observer comment vous vous sentez après avoir fait défiler votre fil."
        },
        {
          "question": "Mon style peut-il changer ?",
          "answer": "Oui. L’application, la période de votre vie et votre humeur changent votre manière d’être en ligne. Voyez votre résultat comme une photo de vos habitudes actuelles."
        },
        {
          "question": "Comment savoir si je devrais réduire mon usage ?",
          "answer": "S’il empiète sur votre sommeil, votre travail ou vos moments en face à face, ou si vous vous sentez souvent vidé ensuite, essayez de fixer une durée ou de couper certaines notifications."
        }
      ],
      "disclaimer": "Ce résultat est un repère ludique pour réfléchir à vos habitudes sur les réseaux sociaux. Ce n’est ni un diagnostic psychologique ni une évaluation de dépendance."
    },
    "es": {
      "introTitle": "En redes sociales, ¿creas o miras?",
      "intro": "Este test usa 10 preguntas para clasificar tu forma de usar las redes sociales en cuatro estilos: creador, performer, observador y conector. Los investigadores llevan tiempo distinguiendo el uso activo, como publicar y conversar, del uso pasivo, como desplazarse por el feed (Verduyn et al., 2017). Los cuatro estilos son la forma sencilla en que OIYO convierte esa distinción en un test.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Uso activo y uso pasivo",
          "body": "Publicar y conversar puede dejar en tu ánimo una huella distinta que mirar el feed en silencio."
        },
        {
          "title": "Comparación social",
          "body": "Es fácil comparar tu día a día con los momentos cuidadosamente elegidos de otras personas, sobre todo tras largos ratos mirando."
        },
        {
          "title": "La espera de reacciones",
          "body": "Los likes y comentarios motivan, pero si mueven mucho tu estado de ánimo, quizá sea señal de tomarte un descanso."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿Solo mirar hace que seas menos feliz?",
          "answer": "Los primeros estudios informaron esa tendencia, pero investigaciones posteriores encontraron a menudo un efecto pequeño o distinto según la persona. Es más útil fijarte en cómo te sientes después de mirar."
        },
        {
          "question": "¿Puede cambiar mi estilo?",
          "answer": "Sí. La aplicación, la etapa de tu vida y tu estado de ánimo cambian tu forma de estar en línea. Toma tu resultado como una foto de tus hábitos actuales."
        },
        {
          "question": "¿Cómo sé si debería usarlas menos?",
          "answer": "Si te quitan sueño, trabajo o tiempo cara a cara, o si a menudo te sientes vacío después, prueba a fijar un límite de tiempo o a desactivar algunas notificaciones."
        }
      ],
      "disclaimer": "Este resultado es una referencia ligera para reflexionar sobre tus hábitos en redes sociales. No es un diagnóstico psicológico ni una evaluación de adicción."
    }
  },
  "mbti-love": {
    "ko": {
      "introTitle": "MBTI의 네 가지 축으로 내 연애 방식을 들여다봐요",
      "intro": "이 검사는 연애 상황을 담은 12개 질문으로 외향·내향, 감각·직관, 사고·감정, 판단·인식의 네 축을 가늠해 16가지 유형 중 하나를 보여 줘요. 공식 MBTI 검사(Myers-Briggs Type Indicator)가 아니라, 그 유형 언어를 연애에 빌려 온 OIYO의 재미용 검사예요. 결과의 '잘 맞는 유형'과 '사랑의 언어'도 대화의 소재로 가볍게 봐 주세요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "네 가지 선호 축",
          "body": "에너지를 어디서 얻는지, 정보를 어떻게 받아들이는지, 어떻게 결정하는지, 일상을 어떻게 꾸리는지를 봐요. 연애에서는 데이트 방식이나 다툼을 푸는 방식으로 드러나기 쉬워요."
        },
        {
          "title": "궁합이라는 이야기",
          "body": "특정 유형끼리 잘 맞는다는 말은 널리 퍼져 있지만, 성격이 비슷한지 여부가 관계 만족도에 주는 영향은 연구에서 작게 나타나요."
        },
        {
          "title": "사랑의 언어",
          "body": "Gary Chapman(1992)이 대중서에서 소개한 다섯 가지 표현 방식이에요. 서로의 표현 차이를 이야기하는 데는 쓸모 있지만, 과학적 근거는 아직 제한적이에요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "공식 MBTI 결과와 다르게 나와요.",
          "answer": "자연스러운 일이에요. 이 검사는 연애 장면만 묻는 짧은 검사라서 공식 검사와 결과가 다를 수 있어요. 더 믿을 만한 기준은 공식 검사나 전문가 해석이에요."
        },
        {
          "question": "잘 안 맞는 유형과는 사귀면 안 되나요?",
          "answer": "그렇지 않아요. 유형 궁합보다 서로의 필요를 말로 나누고 갈등을 다루는 방식이 관계에 훨씬 중요하다고 알려져 있어요."
        },
        {
          "question": "연애할 때 유형이 달라질 수도 있나요?",
          "answer": "네. 사람은 상대와 상황에 따라 다르게 행동해요. 결과를 고정된 꼬리표가 아니라 지금의 연애 습관을 돌아보는 거울로 써 주세요."
        }
      ],
      "disclaimer": "이 검사는 공식 MBTI가 아닌 재미용 참고예요. 관계를 결정하거나 상대를 판단하는 근거로 쓰지 마세요."
    },
    "en": {
      "introTitle": "Look at your love style through the four MBTI axes",
      "intro": "This quiz uses 12 dating scenarios to estimate the four MBTI axes (extraversion–introversion, sensing–intuition, thinking–feeling, judging–perceiving) and shows one of 16 types. It is not the official Myers-Briggs Type Indicator; it is OIYO's just-for-fun quiz that borrows the type language for relationships. Please treat the 'best match' and 'love languages' parts lightly, as conversation starters.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Four preference axes",
          "body": "Where you get your energy, how you take in information, how you decide and how you organise daily life. In dating they often show up in date plans and in how you resolve arguments."
        },
        {
          "title": "The idea of compatibility",
          "body": "Claims that certain types go well together are everywhere, but research finds that personality similarity has only a small effect on relationship satisfaction."
        },
        {
          "title": "Love languages",
          "body": "Five ways of expressing love introduced by Gary Chapman in a 1992 popular book. They are handy for talking about differences, but scientific support is still limited."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "My result differs from my official MBTI.",
          "answer": "That is normal. This is a short quiz that only asks about romantic situations, so it can land somewhere else. The official instrument or a trained interpreter is the more reliable reference."
        },
        {
          "question": "Should I avoid dating a 'poor match' type?",
          "answer": "Not at all. How you share needs and handle conflict matters far more to a relationship than type pairing."
        },
        {
          "question": "Can my type be different when I'm in love?",
          "answer": "Yes. People behave differently depending on the partner and the situation. Use your result as a mirror for your current dating habits, not a fixed label."
        }
      ],
      "disclaimer": "This quiz is not the official MBTI; it is a just-for-fun reference. Please do not use it to make relationship decisions or to judge a partner."
    },
    "ja": {
      "introTitle": "MBTIの4つの軸で、自分の恋愛スタイルをのぞいてみましょう",
      "intro": "このテストは恋愛の場面を扱った12の質問で、外向・内向、感覚・直観、思考・感情、判断・知覚の4つの軸を見積もり、16タイプのうち1つを示します。公式のMBTI（Myers-Briggs Type Indicator）ではなく、そのタイプの言葉を恋愛に借りたOIYOのお楽しみテストです。結果の「相性のいいタイプ」や「愛の言語」も、会話のきっかけとして気軽に見てください。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "4つの好みの軸",
          "body": "エネルギーをどこから得るか、情報をどう受け取るか、どう決めるか、日常をどう組み立てるかを見ます。恋愛ではデートの過ごし方やけんかの収め方に表れやすいです。"
        },
        {
          "title": "相性という話",
          "body": "特定のタイプ同士が合うという話は広まっていますが、性格が似ているかどうかが関係の満足度に与える影響は、研究では小さいとされています。"
        },
        {
          "title": "愛の言語",
          "body": "Gary Chapman が1992年の一般書で紹介した5つの愛情表現です。表現の違いを話し合うには役立ちますが、科学的な裏づけはまだ限られています。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "公式のMBTIの結果と違います。",
          "answer": "よくあることです。このテストは恋愛の場面だけを尋ねる短いテストなので、公式の検査と違う結果になることがあります。より信頼できるのは公式の検査や専門家の解釈です。"
        },
        {
          "question": "相性の悪いタイプとは付き合わないほうがいいですか？",
          "answer": "そんなことはありません。タイプの組み合わせより、互いの気持ちを言葉にし、衝突をどう扱うかのほうがずっと大切だと言われています。"
        },
        {
          "question": "恋愛中はタイプが変わることもありますか？",
          "answer": "はい。人は相手や状況によって違うふるまいをします。結果を固定したラベルではなく、今の恋愛の習慣を映す鏡として使ってください。"
        }
      ],
      "disclaimer": "このテストは公式のMBTIではなく、お楽しみのための参考です。関係を決めたり相手を判断したりする根拠には使わないでください。"
    },
    "zh": {
      "introTitle": "用 MBTI 的四个维度看看你的恋爱方式",
      "intro": "这个测试用 12 个恋爱情境问题，估算外向—内向、感觉—直觉、思考—情感、判断—知觉四个维度，给出 16 种类型中的一种。它不是官方的 MBTI（Myers-Briggs Type Indicator），而是 OIYO 借用类型语言做的恋爱趣味测试。结果里的“契合类型”和“爱的语言”，也请当作聊天话题轻松看待。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "四个偏好维度",
          "body": "看你从哪里获得能量、如何接收信息、如何做决定、如何安排日常。在恋爱中，常常体现在约会方式和化解争吵的方式上。"
        },
        {
          "title": "关于“合不合”",
          "body": "某些类型特别般配的说法流传很广，但研究发现，性格是否相似对关系满意度的影响很小。"
        },
        {
          "title": "爱的语言",
          "body": "Gary Chapman 在 1992 年的一本大众读物中提出的五种表达爱的方式。用来聊聊彼此的差异很方便，但科学依据仍然有限。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "结果和我的官方 MBTI 不一样。",
          "answer": "这很正常。这个测试很短，只问恋爱场景，所以结果可能和官方测评不同。更可靠的参考是官方测评或专业人士的解读。"
        },
        {
          "question": "和“不合”的类型就不该交往吗？",
          "answer": "当然不是。比起类型搭配，能不能把各自的需要说出来、怎样处理冲突，对关系重要得多。"
        },
        {
          "question": "恋爱时类型会不一样吗？",
          "answer": "会的。人会因为对象和情境不同而表现不同。请把结果当作照见当下恋爱习惯的一面镜子，而不是固定的标签。"
        }
      ],
      "disclaimer": "这个测试不是官方 MBTI，只是趣味参考。请不要用它来决定一段关系或评判对方。"
    },
    "fr": {
      "introTitle": "Regardez votre façon d’aimer à travers les quatre axes du MBTI",
      "intro": "Ce test utilise 12 situations amoureuses pour estimer les quatre axes du MBTI (extraversion–introversion, sensation–intuition, pensée–sentiment, jugement–perception) et vous attribue l’un des 16 types. Ce n’est pas le Myers-Briggs Type Indicator officiel, mais un test ludique d’OIYO qui emprunte ce vocabulaire pour parler de relations. Prenez les parties « types compatibles » et « langages de l’amour » avec légèreté, comme des sujets de conversation.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Quatre axes de préférence",
          "body": "D’où vous tirez votre énergie, comment vous recevez l’information, comment vous décidez et comment vous organisez votre quotidien. En amour, cela se voit souvent dans les rendez-vous et la façon de régler les disputes."
        },
        {
          "title": "L’idée de compatibilité",
          "body": "On entend partout que certains types vont bien ensemble, mais la recherche montre que la ressemblance de personnalité n’a qu’un petit effet sur la satisfaction dans le couple."
        },
        {
          "title": "Les langages de l’amour",
          "body": "Cinq façons d’exprimer l’amour présentées par Gary Chapman dans un livre grand public de 1992. Pratiques pour parler de vos différences, leur appui scientifique reste limité."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Mon résultat diffère de mon MBTI officiel.",
          "answer": "C’est normal. Ce test est court et ne porte que sur des situations amoureuses, il peut donc aboutir à un autre type. Le questionnaire officiel ou un professionnel formé restent la référence la plus fiable."
        },
        {
          "question": "Faut-il éviter un type « peu compatible » ?",
          "answer": "Pas du tout. La façon de partager vos besoins et de gérer les conflits compte bien plus que l’association des types."
        },
        {
          "question": "Mon type peut-il changer quand je suis amoureux ?",
          "answer": "Oui. On se comporte différemment selon la personne et la situation. Utilisez votre résultat comme un miroir de vos habitudes actuelles, pas comme une étiquette figée."
        }
      ],
      "disclaimer": "Ce test n’est pas le MBTI officiel ; c’est un repère ludique. Ne l’utilisez pas pour prendre une décision sur une relation ni pour juger quelqu’un."
    },
    "es": {
      "introTitle": "Mira tu forma de amar a través de los cuatro ejes del MBTI",
      "intro": "Este test usa 12 situaciones de pareja para estimar los cuatro ejes del MBTI (extraversión–introversión, sensación–intuición, pensamiento–sentimiento, juicio–percepción) y te muestra uno de los 16 tipos. No es el Myers-Briggs Type Indicator oficial, sino un test de OIYO para pasar el rato que toma prestado ese vocabulario para hablar de relaciones. Toma las partes de «tipos compatibles» y «lenguajes del amor» con ligereza, como temas de conversación.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Cuatro ejes de preferencia",
          "body": "De dónde sacas energía, cómo recibes la información, cómo decides y cómo organizas tu día a día. En pareja suele notarse en las citas y en la forma de resolver discusiones."
        },
        {
          "title": "La idea de compatibilidad",
          "body": "Se oye por todas partes que ciertos tipos encajan mejor, pero la investigación encuentra que parecerse en personalidad tiene un efecto pequeño en la satisfacción de pareja."
        },
        {
          "title": "Los lenguajes del amor",
          "body": "Cinco formas de expresar amor que Gary Chapman presentó en un libro divulgativo de 1992. Sirven para hablar de diferencias, pero su respaldo científico aún es limitado."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "Mi resultado no coincide con mi MBTI oficial.",
          "answer": "Es normal. Este test es corto y solo pregunta por situaciones de pareja, así que puede dar otro tipo. La referencia más fiable es el cuestionario oficial o la interpretación de un profesional."
        },
        {
          "question": "¿Debo evitar salir con un tipo «poco compatible»?",
          "answer": "Para nada. Compartir lo que necesitas y cómo manejáis los conflictos importa mucho más que la combinación de tipos."
        },
        {
          "question": "¿Puede cambiar mi tipo cuando estoy enamorado?",
          "answer": "Sí. Nos comportamos distinto según la persona y la situación. Usa tu resultado como un espejo de tus hábitos actuales, no como una etiqueta fija."
        }
      ],
      "disclaimer": "Este test no es el MBTI oficial; es una referencia para pasar el rato. No lo uses para tomar decisiones sobre una relación ni para juzgar a otra persona."
    }
  },
  "communication-style": {
    "ko": {
      "introTitle": "갈등 앞에서 나는 어떻게 말할까요",
      "intro": "이 검사는 회의, 약속, 의견 충돌 같은 7가지 장면에서 고른 반응으로 소통 방식을 봐요. 결과는 주장형, 공격형, 수동형, 수동공격형, 분석형 다섯 가지예요. 앞의 네 가지는 1970년대 자기주장 훈련에서 널리 쓰인 구분이고, 분석형은 사실과 논리부터 따지는 반응을 담으려고 OIYO가 더한 유형이에요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "자기주장",
          "body": "상대를 존중하면서 내 생각과 필요를 분명하게 말하는 방식이에요. 흔히 가장 건강한 소통의 기준점으로 쓰여요."
        },
        {
          "title": "수동과 공격 사이",
          "body": "참고 넘기거나(수동), 몰아붙이거나(공격), 겉으로는 괜찮은 척하며 다른 방식으로 불만을 드러내는(수동공격) 반응은 모두 내 필요를 제대로 전하지 못한다는 점에서 닮았어요."
        },
        {
          "title": "나-전달법",
          "body": "\"너는 왜 늘…\" 대신 \"나는 …할 때 …하게 느껴\"처럼 내 경험을 중심으로 말하는 방법이에요. Thomas Gordon이 부모 교육에서 소개한 뒤 널리 쓰이고 있어요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "분석형은 좋은 건가요, 나쁜 건가요?",
          "answer": "좋고 나쁨이 따로 있지 않아요. 사실을 확인하는 힘이 되지만, 감정이 먼저 필요한 대화에서는 차갑게 들릴 수 있어요. 상황에 맞춰 공감의 말을 먼저 건네 보세요."
        },
        {
          "question": "자기주장은 연습으로 늘 수 있나요?",
          "answer": "네. 자기주장 훈련은 역할극과 짧은 문장 연습으로 이루어지는 경우가 많아요. 작은 부탁이나 거절부터 연습해 보면 좋아요."
        },
        {
          "question": "상대에 따라 방식이 달라지는데요.",
          "answer": "자연스러운 일이에요. 가까운 사람과 직장 동료 앞에서 다르게 말하는 사람이 많아요. 어떤 관계에서 어떤 방식이 나오는지 살펴보면 도움이 돼요."
        }
      ],
      "disclaimer": "이 결과는 소통 습관을 돌아보기 위한 참고예요. 검증된 심리 척도가 아니며, 사람을 평가하는 데 쓰지 마세요."
    },
    "en": {
      "introTitle": "How do you speak up when conflict shows up?",
      "intro": "This quiz looks at your communication style through your reactions to 7 situations, from meetings to late friends to disagreements. The result is one of five styles: assertive, aggressive, passive, passive-aggressive or analytical. The first four come from the assertiveness-training tradition that spread in the 1970s; OIYO added the analytical style to capture people who reach for facts and logic first.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Assertiveness",
          "body": "Stating your thoughts and needs clearly while respecting the other person. It is often used as the benchmark for healthy communication."
        },
        {
          "title": "Between passive and aggressive",
          "body": "Swallowing it (passive), pushing hard (aggressive) and seeming fine while showing displeasure in other ways (passive-aggressive) all have one thing in common: your real need does not get across."
        },
        {
          "title": "I-messages",
          "body": "Saying \"I feel … when …\" instead of \"Why do you always …\". Thomas Gordon introduced the idea in parent training, and it is now widely used."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Is the analytical style good or bad?",
          "answer": "Neither. It helps you check the facts, but in conversations where feelings need to come first it can sound cold. Try offering a word of empathy before the analysis."
        },
        {
          "question": "Can I become more assertive with practice?",
          "answer": "Yes. Assertiveness training often uses role-play and short phrase practice. Start with small requests or small refusals."
        },
        {
          "question": "My style changes depending on who I'm with.",
          "answer": "That is common. Many people talk differently with close friends than with coworkers. Noticing which relationships bring out which style can be useful."
        }
      ],
      "disclaimer": "This result is a reference for reflecting on your communication habits. It is not a validated psychological scale; please do not use it to evaluate people."
    },
    "ja": {
      "introTitle": "対立が起きたとき、あなたはどう話しますか",
      "intro": "このテストは、会議や約束、意見の食い違いなど7つの場面で選んだ反応から、コミュニケーションのスタイルを見ます。結果は主張型、攻撃型、受動型、受動攻撃型、分析型の5つです。最初の4つは1970年代に広まったアサーション・トレーニングで使われてきた区分で、分析型は事実や論理から確かめる反応をとらえるためにOIYOが加えたタイプです。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "アサーション",
          "body": "相手を尊重しながら、自分の考えや気持ちをはっきり伝える話し方です。健やかなコミュニケーションの目安としてよく使われます。"
        },
        {
          "title": "受け身と攻撃のあいだ",
          "body": "我慢して流す（受け身）、押し切る（攻撃）、平気なふりをして別の形で不満を出す（受動攻撃）。どれも本当の気持ちがうまく伝わらない点で似ています。"
        },
        {
          "title": "わたしメッセージ",
          "body": "「どうしていつも…」ではなく「わたしは…のとき…と感じる」と自分の体験を中心に話す方法です。Thomas Gordon が親向けの講座で紹介し、広く使われています。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "分析型はいいことですか、よくないことですか？",
          "answer": "どちらでもありません。事実を確かめる力になりますが、気持ちを先に受け止めてほしい会話では冷たく聞こえることがあります。場面に合わせて、まず共感のひと言を添えてみてください。"
        },
        {
          "question": "アサーションは練習で身につきますか？",
          "answer": "はい。アサーション・トレーニングはロールプレイや短いフレーズの練習で行われることが多いです。小さなお願いや断りから練習してみましょう。"
        },
        {
          "question": "相手によって話し方が変わります。",
          "answer": "よくあることです。親しい人と職場の人とで話し方が違う人は多いです。どんな関係でどのスタイルが出るかを見てみると役に立ちます。"
        }
      ],
      "disclaimer": "この結果はコミュニケーションの習慣を振り返るための参考です。検証された心理尺度ではないので、人を評価するためには使わないでください。"
    },
    "zh": {
      "introTitle": "面对冲突时，你会怎么说？",
      "intro": "这个测试通过你在会议、约会迟到、意见不合等 7 个情境中的选择，来看你的沟通风格。结果分为坚定表达型、攻击型、被动型、被动攻击型和分析型五种。前四种来自 20 世纪 70 年代流行起来的自信训练（assertiveness training），分析型是 OIYO 为了描述先讲事实和逻辑的反应而加上的。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "果断表达",
          "body": "在尊重对方的同时，清楚说出自己的想法和需要。常被当作健康沟通的参照点。"
        },
        {
          "title": "介于被动和攻击之间",
          "body": "忍着不说（被动）、强硬施压（攻击）、表面没事却用别的方式表达不满（被动攻击），共同点都是真正的需要没有传达出去。"
        },
        {
          "title": "“我”信息",
          "body": "用“当……时，我感到……”代替“你为什么总是……”，以自己的感受为中心来表达。这是 Thomas Gordon 在父母培训中提出的方法，如今被广泛使用。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "分析型是好还是不好？",
          "answer": "没有好坏之分。它能帮你核实事实，但在需要先照顾情绪的对话里，可能听起来有点冷。可以先说一句体谅的话，再开始分析。"
        },
        {
          "question": "果断表达能练出来吗？",
          "answer": "可以。自信训练常用角色扮演和短句练习。先从小小的请求或拒绝开始练吧。"
        },
        {
          "question": "我面对不同的人说话方式不一样。",
          "answer": "这很常见。很多人对亲近的人和对同事说话方式不同。留意在哪种关系里会出现哪种风格，会很有帮助。"
        }
      ],
      "disclaimer": "这个结果是帮你回顾沟通习惯的参考，不是经过验证的心理量表，请不要用来评价他人。"
    },
    "fr": {
      "introTitle": "Face à un conflit, comment prenez-vous la parole ?",
      "intro": "Ce test observe votre style de communication à travers vos réactions dans 7 situations : réunion, retard d’un ami, désaccord… Le résultat correspond à l’un de cinq styles : affirmé, agressif, passif, passif-agressif ou analytique. Les quatre premiers viennent de l’entraînement à l’affirmation de soi qui s’est répandu dans les années 1970 ; OIYO a ajouté le style analytique pour les personnes qui commencent par les faits et la logique.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "L’affirmation de soi",
          "body": "Exprimer clairement ses idées et ses besoins tout en respectant l’autre. On s’en sert souvent comme repère d’une communication saine."
        },
        {
          "title": "Entre passif et agressif",
          "body": "Tout encaisser (passif), forcer (agressif) ou faire comme si tout allait bien tout en montrant son mécontentement autrement (passif-agressif) : dans les trois cas, votre vrai besoin ne passe pas."
        },
        {
          "title": "Le message « je »",
          "body": "Dire « je me sens … quand … » plutôt que « pourquoi tu fais toujours … ». Thomas Gordon a présenté cette idée dans ses formations pour parents, et elle est aujourd’hui très répandue."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Le style analytique, c’est bien ou pas ?",
          "answer": "Ni l’un ni l’autre. Il aide à vérifier les faits, mais dans une conversation où l’émotion doit passer d’abord, il peut paraître froid. Essayez de glisser un mot d’empathie avant l’analyse."
        },
        {
          "question": "Peut-on s’affirmer davantage avec de l’entraînement ?",
          "answer": "Oui. L’entraînement à l’affirmation de soi passe souvent par des jeux de rôle et de courtes phrases à pratiquer. Commencez par de petites demandes ou de petits refus."
        },
        {
          "question": "Mon style change selon les personnes.",
          "answer": "C’est courant. Beaucoup de gens ne parlent pas de la même façon à leurs proches et à leurs collègues. Repérer quelles relations font ressortir quel style peut vous aider."
        }
      ],
      "disclaimer": "Ce résultat est un repère pour réfléchir à vos habitudes de communication. Ce n’est pas une échelle psychologique validée ; ne l’utilisez pas pour évaluer quelqu’un."
    },
    "es": {
      "introTitle": "Cuando aparece un conflicto, ¿cómo hablas?",
      "intro": "Este test observa tu estilo de comunicación a partir de tus reacciones en 7 situaciones: una reunión, un amigo que llega tarde, un desacuerdo… El resultado es uno de cinco estilos: asertivo, agresivo, pasivo, pasivo-agresivo o analítico. Los cuatro primeros vienen del entrenamiento en asertividad que se difundió en los años setenta; OIYO añadió el estilo analítico para quienes empiezan por los hechos y la lógica.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Asertividad",
          "body": "Decir con claridad lo que piensas y necesitas respetando a la otra persona. Suele usarse como referencia de una comunicación sana."
        },
        {
          "title": "Entre pasivo y agresivo",
          "body": "Aguantarte (pasivo), presionar (agresivo) o fingir que todo va bien mientras muestras el malestar de otra forma (pasivo-agresivo): en los tres casos, lo que de verdad necesitas no llega."
        },
        {
          "title": "Mensajes en primera persona",
          "body": "Decir «me siento … cuando …» en vez de «¿por qué siempre …?». Thomas Gordon presentó esta idea en su formación para padres y hoy se usa mucho."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿El estilo analítico es bueno o malo?",
          "answer": "Ninguna de las dos cosas. Te ayuda a comprobar los hechos, pero en conversaciones donde primero hace falta atender la emoción puede sonar frío. Prueba a decir algo empático antes de analizar."
        },
        {
          "question": "¿Se puede ganar asertividad con práctica?",
          "answer": "Sí. El entrenamiento en asertividad suele usar juegos de rol y frases cortas para practicar. Empieza por pequeñas peticiones o pequeños «no»."
        },
        {
          "question": "Mi estilo cambia según con quién esté.",
          "answer": "Es muy común. Mucha gente habla distinto con sus seres queridos que con sus compañeros de trabajo. Fijarte en qué relaciones sacan cada estilo puede ayudarte."
        }
      ],
      "disclaimer": "Este resultado es una referencia para reflexionar sobre tus hábitos de comunicación. No es una escala psicológica validada; no lo uses para evaluar a otras personas."
    }
  },
  "hexaco-personality": {
    "ko": {
      "introTitle": "빅파이브에 '정직-겸손'을 더한 여섯 가지 성격 요인",
      "intro": "HEXACO 모형은 Michael Ashton과 Kibeom Lee가 여러 언어의 성격 형용사를 분석해 제안한 성격 구조예요. 정직-겸손(H), 정서성(E), 외향성(X), 원만성(A), 성실성(C), 경험에 대한 개방성(O)의 여섯 요인으로 성격을 설명해요. 이 검사는 요인마다 10문항씩 60문항으로 된 교육용 축약판이고, 공식 HEXACO-PI-R 문항과는 달라요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "정직-겸손(H)",
          "body": "빅파이브에는 따로 없는 요인이에요. 공정함, 욕심을 덜 부리는 태도, 특권 의식이 적은 정도를 봐요."
        },
        {
          "title": "정서성(E)과 원만성(A)의 재구성",
          "body": "빅파이브의 신경증과 친화성과 비슷해 보이지만 묶는 방식이 달라요. 화를 잘 참는 성향은 원만성에, 감상적이거나 걱정이 많은 성향은 정서성에 들어가요."
        },
        {
          "title": "역채점 문항",
          "body": "일부 문항은 반대로 채점해요. 비슷한 내용을 반대 방향으로도 물어서 한쪽으로 쏠려 답하는 경향을 줄이려는 장치예요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "빅파이브 검사와 무엇이 다른가요?",
          "answer": "요인이 다섯 개가 아니라 여섯 개이고, 정직-겸손이 따로 있다는 점이 가장 커요. 나머지 요인도 이름은 비슷하지만 담는 내용이 조금씩 달라요."
        },
        {
          "question": "점수(%)는 다른 사람과 비교한 순위인가요?",
          "answer": "아니에요. 이 검사의 퍼센트는 내 응답이 그 요인의 최대 점수에서 어느 정도인지를 보여 줄 뿐, 집단 규준과 비교한 백분위가 아니에요."
        },
        {
          "question": "공식 검사는 어디서 받을 수 있나요?",
          "answer": "HEXACO 연구진은 공식 사이트(hexaco.org)에서 연구용 문항과 자기 보고 버전을 안내하고 있어요. 정확한 비교가 필요하다면 공식 버전을 권해요."
        }
      ],
      "disclaimer": "이 결과는 성격 이론을 배우고 자신을 돌아보기 위한 참고예요. 공식 HEXACO-PI-R이 아니며, 채용이나 진단에 쓰지 마세요."
    },
    "en": {
      "introTitle": "Six personality factors: the Big Five plus Honesty-Humility",
      "intro": "The HEXACO model is a personality structure proposed by Michael Ashton and Kibeom Lee after analysing personality adjectives across many languages. It describes personality with six factors: Honesty-Humility (H), Emotionality (E), eXtraversion (X), Agreeableness (A), Conscientiousness (C) and Openness to Experience (O). This quiz is an abridged educational version with 10 items per factor, 60 in total, and its items are not the official HEXACO-PI-R items.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Honesty-Humility (H)",
          "body": "The factor the Big Five does not have. It looks at fairness, modesty about wealth and status, and a low sense of entitlement."
        },
        {
          "title": "Emotionality and Agreeableness, reshaped",
          "body": "They resemble Big Five Neuroticism and Agreeableness but are grouped differently: patience with anger belongs to Agreeableness, while sentimentality and worry belong to Emotionality."
        },
        {
          "title": "Reverse-keyed items",
          "body": "Some items are scored in reverse. Asking about the same idea in both directions helps reduce the pull to agree with everything."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "How is this different from a Big Five test?",
          "answer": "The biggest difference is six factors instead of five, with Honesty-Humility as its own factor. The other factors have similar names but slightly different content."
        },
        {
          "question": "Is my percentage a rank against other people?",
          "answer": "No. The percentage shows where your answers sit relative to the maximum score for that factor. It is not a percentile compared with a norm group."
        },
        {
          "question": "Where can I take the official inventory?",
          "answer": "The HEXACO researchers provide research items and self-report versions on their official site, hexaco.org. For accurate comparisons, the official version is the better choice."
        }
      ],
      "disclaimer": "This result is a reference for learning about personality theory and reflecting on yourself. It is not the official HEXACO-PI-R and should not be used for hiring or diagnosis."
    },
    "ja": {
      "introTitle": "ビッグファイブに「正直さ-謙虚さ」を加えた6つの性格因子",
      "intro": "HEXACOモデルは、Michael Ashton と Kibeom Lee が多くの言語の性格形容詞を分析して提案した性格の構造です。正直さ-謙虚さ（H）、情動性（E）、外向性（X）、協調性（A）、誠実性（C）、経験への開放性（O）の6因子で性格を説明します。このテストは各因子10問、計60問の教育用の簡略版で、公式のHEXACO-PI-Rの項目とは異なります。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "正直さ-謙虚さ（H）",
          "body": "ビッグファイブにはない因子です。公正さ、欲張らない姿勢、特権意識の少なさを見ます。"
        },
        {
          "title": "情動性（E）と協調性（A）の組み直し",
          "body": "ビッグファイブの神経症傾向や協調性に似ていますが、まとめ方が違います。怒りをこらえる傾向は協調性に、感傷的で心配しやすい傾向は情動性に入ります。"
        },
        {
          "title": "逆転項目",
          "body": "一部の項目は逆向きに採点します。同じ内容を反対向きにも尋ねることで、何にでも「はい」と答える偏りを減らすしくみです。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "ビッグファイブのテストと何が違いますか？",
          "answer": "因子が5つではなく6つで、正直さ-謙虚さが独立している点がいちばんの違いです。ほかの因子も名前は似ていますが、中身が少しずつ違います。"
        },
        {
          "question": "パーセントは他の人と比べた順位ですか？",
          "answer": "いいえ。このテストのパーセントは、その因子の最高点に対して自分の回答がどのあたりかを示すだけで、集団の基準と比べたパーセンタイルではありません。"
        },
        {
          "question": "公式の検査はどこで受けられますか？",
          "answer": "HEXACOの研究者は公式サイト（hexaco.org）で研究用の項目や自己報告版を案内しています。正確に比べたいときは公式版をおすすめします。"
        }
      ],
      "disclaimer": "この結果は性格理論を学び、自分を振り返るための参考です。公式のHEXACO-PI-Rではないので、採用や診断には使わないでください。"
    },
    "zh": {
      "introTitle": "在大五人格之外加上“诚实-谦逊”的六大人格因素",
      "intro": "HEXACO 模型是 Michael Ashton 和 Kibeom Lee 分析多种语言中的人格形容词后提出的人格结构。它用六个因素描述人格：诚实-谦逊（H）、情绪性（E）、外向性（X）、宜人性（A）、尽责性（C）和经验开放性（O）。这个测试是每个因素 10 题、共 60 题的教学用简化版，题目与官方 HEXACO-PI-R 不同。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "诚实-谦逊（H）",
          "body": "这是大五人格里没有的因素，看的是公正、不贪心和特权意识的高低。"
        },
        {
          "title": "重新划分的情绪性（E）和宜人性（A）",
          "body": "它们和大五的神经质、宜人性相似，但归类方式不同：能忍住怒气的倾向归入宜人性，多愁善感、容易担心的倾向归入情绪性。"
        },
        {
          "title": "反向计分题",
          "body": "部分题目反向计分。从正反两个方向问相近的内容，可以减少一味同意的作答倾向。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "和大五人格测试有什么不同？",
          "answer": "最大的不同是有六个因素而不是五个，其中诚实-谦逊单独成为一个因素。其他因素名称相似，但包含的内容略有不同。"
        },
        {
          "question": "百分比是和别人比较的排名吗？",
          "answer": "不是。这里的百分比只表示你的作答在该因素满分中所处的位置，并不是和常模群体比较得出的百分位。"
        },
        {
          "question": "在哪里可以做官方测评？",
          "answer": "HEXACO 研究团队在官方网站 hexaco.org 上提供研究用题目和自评版本。如果需要准确比较，建议使用官方版本。"
        }
      ],
      "disclaimer": "这个结果是学习人格理论、回顾自己的参考。它不是官方 HEXACO-PI-R，请不要用于招聘或诊断。"
    },
    "fr": {
      "introTitle": "Six facteurs de personnalité : le Big Five plus l’Honnêteté-Humilité",
      "intro": "Le modèle HEXACO est une structure de la personnalité proposée par Michael Ashton et Kibeom Lee après l’analyse d’adjectifs de personnalité dans de nombreuses langues. Il décrit la personnalité par six facteurs : Honnêteté-Humilité (H), Émotivité (E), eXtraversion (X), Agréabilité (A), Conscienciosité (C) et Ouverture à l’expérience (O). Ce test est une version pédagogique abrégée de 10 items par facteur, soit 60 au total, et ses items ne sont pas ceux du HEXACO-PI-R officiel.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Honnêteté-Humilité (H)",
          "body": "Le facteur que le Big Five n’a pas. Il porte sur l’équité, la modestie face à l’argent et au statut, et un faible sentiment de privilège."
        },
        {
          "title": "Émotivité et Agréabilité redécoupées",
          "body": "Elles ressemblent au Névrosisme et à l’Agréabilité du Big Five, mais sont regroupées autrement : la patience face à la colère relève de l’Agréabilité, la sentimentalité et l’inquiétude de l’Émotivité."
        },
        {
          "title": "Items inversés",
          "body": "Certains items sont notés à l’envers. Poser la même idée dans les deux sens aide à limiter la tendance à tout approuver."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "En quoi est-ce différent d’un test Big Five ?",
          "answer": "La principale différence : six facteurs au lieu de cinq, avec l’Honnêteté-Humilité comme facteur à part entière. Les autres facteurs portent des noms proches mais un contenu un peu différent."
        },
        {
          "question": "Mon pourcentage est-il un classement par rapport aux autres ?",
          "answer": "Non. Il indique où se situent vos réponses par rapport au score maximal du facteur. Ce n’est pas un rang centile calculé sur un groupe de référence."
        },
        {
          "question": "Où passer l’inventaire officiel ?",
          "answer": "Les chercheurs du modèle HEXACO proposent des items de recherche et des versions d’auto-évaluation sur leur site officiel, hexaco.org. Pour une comparaison précise, la version officielle est préférable."
        }
      ],
      "disclaimer": "Ce résultat sert à découvrir une théorie de la personnalité et à réfléchir sur vous-même. Ce n’est pas le HEXACO-PI-R officiel ; ne l’utilisez pas pour un recrutement ou un diagnostic."
    },
    "es": {
      "introTitle": "Seis factores de personalidad: el Big Five más Honestidad-Humildad",
      "intro": "El modelo HEXACO es una estructura de la personalidad que propusieron Michael Ashton y Kibeom Lee tras analizar adjetivos de personalidad en muchos idiomas. Describe la personalidad con seis factores: Honestidad-Humildad (H), Emocionalidad (E), eXtraversión (X), Amabilidad (A), Responsabilidad (C) y Apertura a la experiencia (O). Este test es una versión educativa abreviada de 10 ítems por factor, 60 en total, y sus ítems no son los del HEXACO-PI-R oficial.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Honestidad-Humildad (H)",
          "body": "El factor que el Big Five no tiene. Mira la justicia, la modestia ante el dinero y el estatus, y un bajo sentido de privilegio."
        },
        {
          "title": "Emocionalidad y Amabilidad reorganizadas",
          "body": "Se parecen al Neuroticismo y la Amabilidad del Big Five, pero se agrupan de otra manera: la paciencia ante el enfado pertenece a la Amabilidad, y la sensibilidad y la preocupación a la Emocionalidad."
        },
        {
          "title": "Ítems invertidos",
          "body": "Algunos ítems se puntúan al revés. Preguntar por la misma idea en ambos sentidos ayuda a reducir la tendencia a estar de acuerdo con todo."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿En qué se diferencia de un test Big Five?",
          "answer": "La mayor diferencia es que hay seis factores en lugar de cinco, con Honestidad-Humildad como factor propio. Los demás tienen nombres parecidos pero un contenido algo distinto."
        },
        {
          "question": "¿Mi porcentaje es una posición frente a otras personas?",
          "answer": "No. Indica dónde quedan tus respuestas respecto a la puntuación máxima de ese factor. No es un percentil calculado con un grupo de referencia."
        },
        {
          "question": "¿Dónde puedo hacer el inventario oficial?",
          "answer": "Los investigadores de HEXACO ofrecen ítems de investigación y versiones de autoinforme en su sitio oficial, hexaco.org. Si necesitas una comparación precisa, conviene la versión oficial."
        }
      ],
      "disclaimer": "Este resultado sirve para aprender sobre una teoría de la personalidad y reflexionar sobre ti. No es el HEXACO-PI-R oficial; no lo uses para contratar ni para diagnosticar."
    }
  },
  "creativity-type": {
    "ko": {
      "introTitle": "나의 아이디어는 어디에서 시작될까요",
      "intro": "이 검사는 아이디어가 떠오르는 순간과 막힘을 푸는 방법 등을 물어 창의성의 스타일을 다섯 가지로 보여 줘요. 발산적 창의형, 수렴적 문제해결형, 내러티브 스토리텔링형, 시스템 설계형, 미적 표현형이에요. 발산과 수렴이라는 말은 심리학자 J. P. Guilford가 창의적 사고를 설명하며 쓴 개념에서 왔고, 다섯 유형은 OIYO가 이를 바탕으로 만든 틀이에요.",
      "conceptTitle": "핵심 개념",
      "concepts": [
        {
          "title": "발산적 사고",
          "body": "한 문제에서 여러 방향의 답을 넓게 떠올리는 사고예요. 브레인스토밍이 대표적인 예예요."
        },
        {
          "title": "수렴적 사고",
          "body": "여러 가능성 가운데 가장 알맞은 하나로 좁혀 가는 사고예요. 창의적인 작업은 보통 두 사고를 오가며 이루어져요."
        },
        {
          "title": "창의적 과정의 단계",
          "body": "Graham Wallas(1926)는 창의적 과정을 준비, 부화, 발현, 검증의 단계로 설명했어요. 막혔을 때 잠시 떠나 있는 것이 '부화'에 해당해요."
        }
      ],
      "faqTitle": "자주 묻는 질문",
      "faqs": [
        {
          "question": "한 가지 유형만 창의적인가요?",
          "answer": "아니에요. 창의성 연구에서는 누구나 발산과 수렴을 함께 쓴다고 봐요. 유형은 내가 자주 기대는 출발점을 보여 줄 뿐이에요."
        },
        {
          "question": "창의성은 타고나는 건가요?",
          "answer": "타고난 성향도 있지만, 경험의 폭, 연습, 환경이 크게 영향을 줘요. 다른 분야를 접하거나 제약을 바꿔 보는 연습이 도움이 돼요."
        },
        {
          "question": "결과를 일에 어떻게 활용할 수 있나요?",
          "answer": "내가 약한 쪽의 사고를 잘하는 사람과 짝을 이뤄 보세요. 예를 들어 발산형은 수렴형과, 미적 표현형은 시스템 설계형과 함께하면 서로를 보완할 수 있어요."
        }
      ],
      "disclaimer": "이 결과는 창의적인 습관을 돌아보기 위한 참고예요. 검증된 창의성 검사가 아니며, 능력을 평가하는 데 쓰지 마세요."
    },
    "en": {
      "introTitle": "Where do your ideas begin?",
      "intro": "This quiz asks when ideas come to you and how you get past creative blocks, then shows one of five creative styles: divergent, convergent, narrative, systems or aesthetic. The words divergent and convergent come from psychologist J. P. Guilford's account of creative thinking; the five styles are a framework OIYO built on top of it.",
      "conceptTitle": "Key ideas",
      "concepts": [
        {
          "title": "Divergent thinking",
          "body": "Generating many possible answers to one problem in different directions. Brainstorming is the classic example."
        },
        {
          "title": "Convergent thinking",
          "body": "Narrowing many possibilities down to the best fit. Creative work usually moves back and forth between the two."
        },
        {
          "title": "Stages of the creative process",
          "body": "Graham Wallas (1926) described creativity in stages: preparation, incubation, illumination and verification. Stepping away when you are stuck is the incubation stage."
        }
      ],
      "faqTitle": "Frequently asked questions",
      "faqs": [
        {
          "question": "Is only one style truly creative?",
          "answer": "No. Creativity research sees everyone using both divergent and convergent thinking. Your style simply shows the starting point you lean on most."
        },
        {
          "question": "Is creativity something you're born with?",
          "answer": "Temperament plays a part, but breadth of experience, practice and environment matter a lot. Exploring other fields or changing your constraints can help."
        },
        {
          "question": "How can I use my result at work?",
          "answer": "Pair up with someone strong in the thinking you use less. A divergent thinker and a convergent thinker, or an aesthetic and a systems thinker, can fill each other's gaps."
        }
      ],
      "disclaimer": "This result is a reference for reflecting on your creative habits. It is not a validated creativity test; please do not use it to assess ability."
    },
    "ja": {
      "introTitle": "あなたのアイデアはどこから始まりますか",
      "intro": "このテストは、アイデアが浮かぶ瞬間や行き詰まりの抜け方などを尋ねて、創造性のスタイルを5つのうちから示します。発散型、収束型、ナラティブ型、システム設計型、美的表現型です。発散と収束という言葉は心理学者 J. P. Guilford が創造的思考を説明するのに使った概念から来ており、5タイプはそれをもとにOIYOが作った枠組みです。",
      "conceptTitle": "主な考え方",
      "concepts": [
        {
          "title": "発散的思考",
          "body": "ひとつの問題に対して、いろいろな方向の答えを幅広く思い浮かべる考え方です。ブレインストーミングが代表例です。"
        },
        {
          "title": "収束的思考",
          "body": "たくさんの可能性の中から、いちばん合うものに絞り込んでいく考え方です。創造的な仕事はふつう両方を行き来しながら進みます。"
        },
        {
          "title": "創造のプロセスの段階",
          "body": "Graham Wallas（1926年）は創造の過程を準備、あたため、ひらめき、検証の段階で説明しました。行き詰まったときに少し離れるのが「あたため」にあたります。"
        }
      ],
      "faqTitle": "よくある質問",
      "faqs": [
        {
          "question": "創造的なのはひとつのタイプだけですか？",
          "answer": "いいえ。創造性の研究では、だれもが発散と収束の両方を使うと考えます。タイプは、あなたがよく頼る出発点を示しているだけです。"
        },
        {
          "question": "創造性は生まれつきのものですか？",
          "answer": "生まれ持った傾向もありますが、経験の幅や練習、環境が大きく影響します。別の分野に触れたり、制約を変えてみたりする練習が役立ちます。"
        },
        {
          "question": "結果を仕事にどう生かせますか？",
          "answer": "自分が苦手な考え方の得意な人と組んでみてください。たとえば発散型は収束型と、美的表現型はシステム設計型と組むと、互いを補い合えます。"
        }
      ],
      "disclaimer": "この結果は創造的な習慣を振り返るための参考です。検証された創造性テストではないので、能力の評価には使わないでください。"
    },
    "zh": {
      "introTitle": "你的点子从哪里开始？",
      "intro": "这个测试会问你灵感出现的时刻、怎样突破卡壳等问题，然后给出五种创造力风格之一：发散型、收敛型、叙事型、系统设计型和美学表达型。“发散”和“收敛”来自心理学家 J. P. Guilford 描述创造性思维时提出的概念，五种风格是 OIYO 在此基础上设计的框架。",
      "conceptTitle": "核心概念",
      "concepts": [
        {
          "title": "发散思维",
          "body": "针对一个问题，从不同方向想出很多可能的答案。头脑风暴就是典型的例子。"
        },
        {
          "title": "收敛思维",
          "body": "从众多可能中收窄到最合适的一个。创造性工作通常在这两种思维之间来回切换。"
        },
        {
          "title": "创造过程的阶段",
          "body": "Graham Wallas（1926）把创造过程分为准备、酝酿、明朗和验证几个阶段。卡住时暂时走开，就属于“酝酿”。"
        }
      ],
      "faqTitle": "常见问题",
      "faqs": [
        {
          "question": "只有某一种类型才算有创造力吗？",
          "answer": "不是。创造力研究认为每个人都会同时用到发散和收敛。类型只是显示你最常依赖的起点。"
        },
        {
          "question": "创造力是天生的吗？",
          "answer": "有天生倾向的成分，但经验的广度、练习和环境影响很大。多接触其他领域，或者换一换限制条件来练习，都会有帮助。"
        },
        {
          "question": "结果可以怎样用在工作中？",
          "answer": "试着和擅长你较弱那种思维的人搭档。比如发散型和收敛型、美学表达型和系统设计型一起合作，就能互相补足。"
        }
      ],
      "disclaimer": "这个结果是帮你回顾创作习惯的参考，不是经过验证的创造力测验，请不要用来评估能力。"
    },
    "fr": {
      "introTitle": "Où naissent vos idées ?",
      "intro": "Ce test vous interroge sur le moment où les idées vous viennent et sur la façon dont vous surmontez les blocages, puis vous attribue l’un de cinq styles créatifs : divergent, convergent, narratif, systémique ou esthétique. Les mots divergent et convergent viennent de la description de la pensée créative par le psychologue J. P. Guilford ; les cinq styles sont un cadre construit par OIYO à partir de là.",
      "conceptTitle": "Notions clés",
      "concepts": [
        {
          "title": "Pensée divergente",
          "body": "Produire de nombreuses réponses possibles, dans plusieurs directions, à partir d’un même problème. Le brainstorming en est l’exemple type."
        },
        {
          "title": "Pensée convergente",
          "body": "Réduire les possibilités jusqu’à la plus adaptée. Le travail créatif alterne généralement entre les deux."
        },
        {
          "title": "Les étapes du processus créatif",
          "body": "Graham Wallas (1926) a décrit la création en étapes : préparation, incubation, illumination et vérification. Prendre du recul quand on bloque correspond à l’incubation."
        }
      ],
      "faqTitle": "Questions fréquentes",
      "faqs": [
        {
          "question": "Un seul style est-il vraiment créatif ?",
          "answer": "Non. La recherche sur la créativité considère que chacun utilise à la fois la pensée divergente et convergente. Votre style indique simplement le point de départ sur lequel vous vous appuyez le plus."
        },
        {
          "question": "La créativité est-elle innée ?",
          "answer": "Le tempérament joue un rôle, mais l’étendue de vos expériences, la pratique et l’environnement comptent beaucoup. Découvrir d’autres domaines ou changer vos contraintes peut aider."
        },
        {
          "question": "Comment utiliser mon résultat au travail ?",
          "answer": "Associez-vous à quelqu’un qui excelle dans le mode de pensée que vous utilisez moins. Un profil divergent avec un convergent, ou un esthétique avec un systémique, se complètent bien."
        }
      ],
      "disclaimer": "Ce résultat est un repère pour réfléchir à vos habitudes créatives. Ce n’est pas un test de créativité validé ; ne l’utilisez pas pour évaluer des capacités."
    },
    "es": {
      "introTitle": "¿Dónde empiezan tus ideas?",
      "intro": "Este test te pregunta cuándo te llegan las ideas y cómo superas los bloqueos, y te muestra uno de cinco estilos creativos: divergente, convergente, narrativo, sistémico o estético. Las palabras divergente y convergente vienen de cómo el psicólogo J. P. Guilford describió el pensamiento creativo; los cinco estilos son un marco que OIYO construyó a partir de ahí.",
      "conceptTitle": "Ideas clave",
      "concepts": [
        {
          "title": "Pensamiento divergente",
          "body": "Generar muchas respuestas posibles, en distintas direcciones, para un mismo problema. La lluvia de ideas es el ejemplo clásico."
        },
        {
          "title": "Pensamiento convergente",
          "body": "Reducir las posibilidades hasta quedarte con la más adecuada. El trabajo creativo suele ir y venir entre los dos."
        },
        {
          "title": "Etapas del proceso creativo",
          "body": "Graham Wallas (1926) describió la creación en etapas: preparación, incubación, iluminación y verificación. Alejarte un rato cuando te atascas corresponde a la incubación."
        }
      ],
      "faqTitle": "Preguntas frecuentes",
      "faqs": [
        {
          "question": "¿Solo un estilo es realmente creativo?",
          "answer": "No. La investigación sobre creatividad considera que todas las personas usan pensamiento divergente y convergente. Tu estilo solo muestra el punto de partida en el que más te apoyas."
        },
        {
          "question": "¿La creatividad es innata?",
          "answer": "El temperamento influye, pero la amplitud de experiencias, la práctica y el entorno pesan mucho. Explorar otros campos o cambiar tus restricciones puede ayudarte."
        },
        {
          "question": "¿Cómo puedo usar mi resultado en el trabajo?",
          "answer": "Forma equipo con alguien fuerte en el tipo de pensamiento que usas menos. Un perfil divergente con uno convergente, o uno estético con uno sistémico, se complementan bien."
        }
      ],
      "disclaimer": "Este resultado es una referencia para reflexionar sobre tus hábitos creativos. No es un test de creatividad validado; no lo uses para evaluar capacidades."
    }
  },
};
