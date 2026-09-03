import type { Locale } from '../i18n';
import type { TestExplainerContent } from '../components/shared/TestExplainer.astro';

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
};
