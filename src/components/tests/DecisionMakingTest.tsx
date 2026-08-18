import { useState, useEffect } from "react";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type DecisionType =
  | "rational"
  | "intuitive"
  | "dependent"
  | "avoidant"
  | "spontaneous";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  options: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    fr: string;
    es: string;
    type: DecisionType;
  }[];
}

const questions: Question[] = [
  {
    ko: "중요한 결정을 내려야 할 때 당신은?",
    en: "When facing an important decision, you:",
    ja: "重要な決定を下す必要があるとき、あなたは？",
    zh: "面对重要决定时，你会？",
    fr: "Face à une décision importante, vous :",
    es: "Cuando tienes que tomar una decisión importante, tú:",
    options: [
      { ko: "장단점을 목록으로 작성하고 체계적으로 비교한다", en: "Make a pros/cons list and compare systematically", ja: "長所・短所をリストアップして体系的に比較する", zh: "列出优缺点，并进行系统比较", fr: "Lister les avantages et les inconvénients, puis comparer méthodiquement", es: "Hacer una lista de pros y contras y comparar de forma sistemática", type: "rational" },
      { ko: "직감적으로 무엇이 맞는지 느낌으로 안다", en: "Trust my gut feeling about what's right", ja: "直感的に何が正しいか感じでわかる", zh: "相信自己对什么是对的直觉", fr: "Me fier à mon intuition sur ce qui semble juste", es: "Confiar en mi intuición sobre lo que se siente correcto", type: "intuitive" },
      { ko: "신뢰할 수 있는 사람들에게 의견을 구한다", en: "Seek advice from trusted people", ja: "信頼できる人々に意見を求める", zh: "向值得信任的人寻求建议", fr: "Demander conseil à des personnes de confiance", es: "Pedir consejo a personas de confianza", type: "dependent" },
      { ko: "최대한 결정을 미루고 더 많은 정보를 모은다", en: "Postpone as long as possible and gather more information", ja: "できるだけ先延ばしにしてより多くの情報を集める", zh: "尽量推迟决定，并收集更多信息", fr: "Repousser autant que possible et recueillir plus d'informations", es: "Posponerlo todo lo posible y reunir más información", type: "avoidant" },
      { ko: "그냥 바로 느낌 가는 대로 결정한다", en: "Just decide immediately based on how I feel in the moment", ja: "その瞬間の気分でそのまま決める", zh: "直接按当下的感觉马上决定", fr: "Décider tout de suite selon ce que je ressens sur le moment", es: "Decidir de inmediato según lo que siento en ese momento", type: "spontaneous" },
    ],
  },
  {
    ko: "새 직장을 제안받았습니다. 지금 직장보다 급여는 높지만 안정성이 낮습니다. 어떻게 하시겠습니까?",
    en: "You've been offered a new job — higher pay but less stability. What do you do?",
    ja: "給料は高いが安定性が低い新しい仕事を提案されました。どうしますか？",
    zh: "你收到一份新工作邀请，薪资更高，但稳定性更低。你会怎么做？",
    fr: "On vous propose un nouvel emploi : mieux payé, mais moins stable. Que faites-vous ?",
    es: "Te ofrecen un nuevo trabajo: mejor salario, pero menos estabilidad. ¿Qué haces?",
    options: [
      { ko: "장기적 커리어 전망, 재정 계획, 시장 데이터를 분석한다", en: "Analyze long-term career prospects, financial plans, and market data", ja: "長期的キャリア展望、財務計画、市場データを分析する", zh: "分析长期职业前景、财务计划和市场数据", fr: "Analyser les perspectives de carrière, le plan financier et les données du marché", es: "Analizar las perspectivas profesionales, el plan financiero y los datos del mercado", type: "rational" },
      { ko: "이 제안을 받아들이는 것이 '옳다'는 느낌이 드는지 본다", en: "Check if accepting this offer 'feels right'", ja: "このオファーを受け入れることが「正しい」と感じるかどうか確認する", zh: "看看接受这份邀请是否“感觉是对的”", fr: "Voir si accepter cette offre me semble vraiment juste", es: "Ver si aceptar la oferta me parece lo correcto", type: "intuitive" },
      { ko: "멘토나 가족과 깊이 이야기하고 그들의 조언을 따른다", en: "Have a deep conversation with a mentor or family and follow their advice", ja: "メンターや家族と深く話し合い、アドバイスに従う", zh: "和导师或家人深入讨论，并听从他们的建议", fr: "En parler longuement avec un mentor ou ma famille, puis suivre leur conseil", es: "Hablarlo a fondo con un mentor o mi familia y seguir su consejo", type: "dependent" },
      { ko: "결정을 계속 미루면서 더 좋은 옵션이 나타나길 기다린다", en: "Keep delaying and wait for a better option to appear", ja: "決定をし続け、より良い選択肢が現れるのを待つ", zh: "继续拖延，等待更好的选择出现", fr: "Continuer à reporter la décision en attendant une meilleure option", es: "Seguir aplazando la decisión y esperar a que aparezca una opción mejor", type: "avoidant" },
      { ko: "기분이 좋을 때 바로 수락하거나 거절한다", en: "Accept or reject immediately when I'm in a good mood", ja: "気分がいいときすぐに承諾または拒否する", zh: "在心情好的时候马上接受或拒绝", fr: "Accepter ou refuser aussitôt quand je suis de bonne humeur", es: "Aceptar o rechazar de inmediato cuando estoy de buen humor", type: "spontaneous" },
    ],
  },
  {
    ko: "결정을 내린 후 예상치 못한 문제가 생겼습니다. 어떻게 반응하시겠습니까?",
    en: "After making a decision, unexpected problems arise. How do you react?",
    ja: "決定後、予期せぬ問題が発生しました。どう反応しますか？",
    zh: "做出决定后，出现了意想不到的问题。你会如何反应？",
    fr: "Après avoir pris une décision, des problèmes imprévus apparaissent. Comment réagissez-vous ?",
    es: "Después de tomar una decisión, surgen problemas inesperados. ¿Cómo reaccionas?",
    options: [
      { ko: "문제를 분석하고 조정 계획을 만들어 체계적으로 대응한다", en: "Analyze the problem, create an adjustment plan, and respond systematically", ja: "問題を分析し、調整計画を立て、体系的に対応する", zh: "分析问题，制定调整计划，并系统应对", fr: "Analyser le problème, préparer un plan d'ajustement et répondre méthodiquement", es: "Analizar el problema, crear un plan de ajuste y responder de forma sistemática", type: "rational" },
      { ko: "상황이 어떻게 전개될지 직감적으로 느끼고 그에 맞게 행동한다", en: "Intuitively sense how the situation will unfold and act accordingly", ja: "状況がどう展開するか直感的に感じ、それに合わせて行動する", zh: "凭直觉判断局势会如何发展，并相应行动", fr: "Sentir intuitivement comment la situation va évoluer et agir en conséquence", es: "Intuir cómo evolucionará la situación y actuar en consecuencia", type: "intuitive" },
      { ko: "주변 사람들에게 어떻게 해야 할지 물어본다", en: "Ask people around me what I should do", ja: "周りの人に何をすべきか聞く", zh: "询问身边的人自己该怎么做", fr: "Demander aux personnes autour de moi ce que je devrais faire", es: "Preguntar a las personas cercanas qué debería hacer", type: "dependent" },
      { ko: "문제가 저절로 해결되기를 바라며 회피한다", en: "Avoid and hope the problem resolves itself", ja: "問題が自然に解決されることを期待して回避する", zh: "选择回避，希望问题自行解决", fr: "Éviter la situation en espérant que le problème se règle de lui-même", es: "Evitarlo y esperar que el problema se resuelva solo", type: "avoidant" },
      { ko: "그냥 즉흥적으로 생각나는 해결책을 시도해본다", en: "Try whatever solution comes to mind spontaneously", ja: "思いついた解決策を即興で試してみる", zh: "想到什么解决办法就即兴试试看", fr: "Essayer spontanément la première solution qui me vient", es: "Probar de forma espontánea la solución que se me ocurra", type: "spontaneous" },
    ],
  },
  {
    ko: "오늘 저녁 무엇을 먹을지 결정할 때 당신은?",
    en: "When deciding what to eat for dinner:",
    ja: "今夜の夕食を決めるとき、あなたは？",
    zh: "决定今晚吃什么时，你会？",
    fr: "Quand vous choisissez quoi manger ce soir :",
    es: "Cuando decides qué cenar:",
    options: [
      { ko: "영양, 비용, 준비 시간을 고려해 최선의 선택을 한다", en: "Consider nutrition, cost, and prep time to make the best choice", ja: "栄養、コスト、準備時間を考慮して最善の選択をする", zh: "考虑营养、成本和准备时间，做出最佳选择", fr: "Tenir compte de la nutrition, du coût et du temps de préparation", es: "Considerar nutrición, costo y tiempo de preparación para elegir mejor", type: "rational" },
      { ko: "무엇이 먹고 싶은지 몸의 신호를 따른다", en: "Follow my body's signals for what I crave", ja: "何が食べたいか体のシグナルに従う", zh: "跟随身体对想吃什么的信号", fr: "Suivre les signaux de mon corps sur ce dont j'ai envie", es: "Seguir las señales de mi cuerpo sobre lo que se me antoja", type: "intuitive" },
      { ko: "동거인이나 가족이 원하는 것에 맞춘다", en: "Adjust to what my housemates or family want", ja: "同居人や家族が望むものに合わせる", zh: "配合同住的人或家人想吃的东西", fr: "M'adapter à ce que veulent mes colocataires ou ma famille", es: "Adaptarme a lo que quieran mis compañeros de casa o mi familia", type: "dependent" },
      { ko: "결정하기 귀찮아서 평소 먹던 것을 그냥 먹는다", en: "Too lazy to decide, so just eat the usual", ja: "決めるのが面倒で、いつも食べるものをそのまま食べる", zh: "懒得决定，就吃平时常吃的", fr: "Avoir la flemme de choisir et prendre mon plat habituel", es: "Me da pereza decidir, así que como lo de siempre", type: "avoidant" },
      { ko: "냉장고를 열어보고 그때 눈에 들어오는 것을 만든다", en: "Open the fridge and cook whatever catches my eye", ja: "冷蔵庫を開けてその時目に入ったものを作る", zh: "打开冰箱，做当下看顺眼的东西", fr: "Ouvrir le frigo et cuisiner ce qui attire mon regard", es: "Abrir la nevera y cocinar lo que me llame la atención", type: "spontaneous" },
    ],
  },
  {
    ko: "당신은 결정 후 후회를 얼마나 자주 합니까?",
    en: "How often do you regret your decisions after making them?",
    ja: "決定後、どのくらいの頻度で後悔しますか？",
    zh: "做出决定后，你多常会后悔？",
    fr: "À quelle fréquence regrettez-vous vos décisions après coup ?",
    es: "¿Con qué frecuencia te arrepientes de tus decisiones después de tomarlas?",
    options: [
      { ko: "거의 안 한다 — 충분히 분석했으므로", en: "Rarely — I've analyzed thoroughly", ja: "ほとんどしない — 十分に分析したから", zh: "很少——因为我已经充分分析过", fr: "Rarement, car j'ai analysé la situation en profondeur", es: "Rara vez, porque lo analicé a fondo", type: "rational" },
      { ko: "가끔 — 직감이 틀릴 때만", en: "Sometimes — only when my gut was wrong", ja: "たまに — 直感が外れたときだけ", zh: "有时——只有直觉出错的时候", fr: "Parfois, seulement quand mon intuition s'est trompée", es: "A veces, solo cuando mi intuición falló", type: "intuitive" },
      { ko: "자주 — 타인의 조언이 잘못됐을 때 더 힘들다", en: "Often — it's harder when others' advice was wrong", ja: "よく — 他人のアドバイスが間違いだったとき特につらい", zh: "经常——别人建议错了时会更难受", fr: "Souvent, surtout quand le conseil des autres était mauvais", es: "A menudo, y me pesa más cuando el consejo de otros fue equivocado", type: "dependent" },
      { ko: "매우 자주 — 어떤 선택을 해도 다른 게 더 좋았을 것 같다", en: "Very often — any choice feels like the other was better", ja: "とてもよく — どの選択をしても他の方が良かったと感じる", zh: "非常经常——无论选什么，都觉得另一个更好", fr: "Très souvent, chaque option me donne l'impression que l'autre était meilleure", es: "Muy a menudo, cualquier elección me hace pensar que la otra era mejor", type: "avoidant" },
      { ko: "가끔 — 충동적으로 결정했을 때 후회한다", en: "Sometimes — I regret when I decided impulsively", ja: "たまに — 衝動的に決めたときに後悔する", zh: "有时——冲动决定时会后悔", fr: "Parfois, quand j'ai décidé sur une impulsion", es: "A veces, cuando decidí impulsivamente", type: "spontaneous" },
    ],
  },
  {
    ko: "복잡한 선택 앞에서 당신의 가장 큰 두려움은?",
    en: "When facing a complex choice, your biggest fear is:",
    ja: "複雑な選択に直面したとき、最大の恐れは？",
    zh: "面对复杂选择时，你最大的担心是？",
    fr: "Face à un choix complexe, votre plus grande crainte est :",
    es: "Ante una elección compleja, tu mayor miedo es:",
    options: [
      { ko: "중요한 데이터를 놓치는 것", en: "Missing important data", ja: "重要なデータを見逃すこと", zh: "错过重要数据", fr: "Passer à côté de données importantes", es: "Pasar por alto datos importantes", type: "rational" },
      { ko: "직감을 무시하고 후회하는 것", en: "Ignoring my gut and regretting it", ja: "直感を無視して後悔すること", zh: "忽视直觉然后后悔", fr: "Ignorer mon intuition et le regretter", es: "Ignorar mi intuición y arrepentirme", type: "intuitive" },
      { ko: "혼자 결정해서 잘못되는 것", en: "Deciding alone and getting it wrong", ja: "一人で決めて間違えること", zh: "独自决定后出错", fr: "Décider seul et me tromper", es: "Decidir solo y equivocarme", type: "dependent" },
      { ko: "잘못된 선택으로 상황이 더 나빠지는 것", en: "Making the wrong choice and things getting worse", ja: "間違った選択で状況が悪化すること", zh: "做错选择，让情况变得更糟", fr: "Faire le mauvais choix et aggraver la situation", es: "Tomar la decisión equivocada y empeorar la situación", type: "avoidant" },
      { ko: "너무 오래 생각하다 기회를 놓치는 것", en: "Overthinking and missing the opportunity", ja: "考えすぎてチャンスを逃すこと", zh: "想太久而错过机会", fr: "Trop réfléchir et manquer l'occasion", es: "Pensarlo demasiado y perder la oportunidad", type: "spontaneous" },
    ],
  },
];

type ResultCopy = { title: string; description: string; strength: string; weakness: string; tip: string };

const results: Record<
  DecisionType,
  {
    emoji: string;
    color: string;
    ko: ResultCopy;
    en: ResultCopy;
    ja: ResultCopy;
    zh: ResultCopy;
    fr: ResultCopy;
    es: ResultCopy;
  }
> = {
  rational: {
    emoji: "🧮",
    color: "#3b82f6",
    ko: {
      title: "이성적 분석형",
      description: "당신은 결정을 내리기 전 충분한 정보를 수집하고 체계적으로 분석합니다. 감정보다 논리와 데이터를 신뢰하며, 장단점을 꼼꼼히 비교하는 스타일입니다.",
      strength: "일관성 있는 의사결정, 후회가 적음, 복잡한 문제에 강함",
      weakness: "과도한 분석 마비(Analysis Paralysis), 직관적 정보를 놓칠 수 있음, 시간이 오래 걸림",
      tip: "데이터가 완벽하지 않아도 충분할 수 있습니다. '80% 준비됐을 때 결정하기' 원칙을 적용해보세요.",
    },
    en: {
      title: "Rational Analyst",
      description: "You gather sufficient information before making decisions and analyze systematically. You trust logic and data over emotions, carefully comparing pros and cons.",
      strength: "Consistent decision-making, fewer regrets, strong with complex problems",
      weakness: "Risk of analysis paralysis, may miss intuitive information, time-consuming",
      tip: "Data doesn't need to be perfect to be sufficient. Try applying the '80% ready, then decide' principle.",
    },
    ja: {
      title: "合理的分析型",
      description: "決定を下す前に十分な情報を収集し、体系的に分析します。感情よりも論理とデータを信頼し、長所・短所を丁寧に比較するスタイルです。",
      strength: "一貫した意思決定、後悔が少ない、複雑な問題に強い",
      weakness: "過度な分析麻痺リスク、直感的情報を見逃す可能性、時間がかかる",
      tip: "データが完璧でなくても十分な場合があります。「80%準備できたら決める」原則を試してみましょう。",
    },
    zh: {
      title: "理性分析型",
      description: "你在做决定前会收集足够的信息，并进行系统分析。相比情绪，你更信任逻辑和数据，也会仔细比较利弊。",
      strength: "决策一致性高、后悔较少、擅长处理复杂问题",
      weakness: "可能陷入过度分析导致的决策瘫痪，忽略直觉信息，耗时较长",
      tip: "数据不必完美才算足够。试着采用“准备到80%就做决定”的原则。",
    },
    fr: {
      title: "Analyste rationnel",
      description: "Vous rassemblez assez d'informations avant de décider et vous les analysez avec méthode. Vous faites davantage confiance à la logique et aux données qu'aux émotions, en comparant soigneusement les avantages et les inconvénients.",
      strength: "Décisions cohérentes, moins de regrets, à l'aise avec les problèmes complexes",
      weakness: "Risque de paralysie par l'analyse, informations intuitives parfois négligées, décisions plus lentes",
      tip: "Les données n'ont pas besoin d'être parfaites pour être suffisantes. Essayez le principe : décider quand vous êtes prêt à 80 %.",
    },
    es: {
      title: "Analista racional",
      description: "Reúnes suficiente información antes de decidir y la analizas de forma sistemática. Confías más en la lógica y los datos que en las emociones, y comparas cuidadosamente pros y contras.",
      strength: "Decisiones consistentes, menos arrepentimiento, fortaleza ante problemas complejos",
      weakness: "Riesgo de parálisis por análisis, posible pérdida de información intuitiva, proceso más lento",
      tip: "Los datos no tienen que ser perfectos para ser suficientes. Prueba el principio de decidir cuando estés preparado al 80%.",
    },
  },
  intuitive: {
    emoji: "✨",
    color: "#435D31",
    ko: {
      title: "직관적 감지형",
      description: "당신은 축적된 경험과 패턴 인식에서 나오는 직관을 신뢰합니다. 논리적 분석보다 '느낌'이나 '감이 온다'는 신호를 중시하며, 빠르게 결정할 수 있습니다.",
      strength: "빠른 결정, 경험에서 나온 지혜 활용, 창의적 해결책",
      weakness: "직관이 편향에서 나올 수 있음, 데이터를 무시할 위험, 설명하기 어려움",
      tip: "직관을 신뢰하되, 중요한 결정은 데이터로 한 번 검증하는 습관을 가져보세요.",
    },
    en: {
      title: "Intuitive Perceiver",
      description: "You trust intuition that comes from accumulated experience and pattern recognition. You value 'gut feelings' over logical analysis and can decide quickly.",
      strength: "Quick decisions, leverages experiential wisdom, creative solutions",
      weakness: "Intuition can come from biases, risk of ignoring data, hard to explain to others",
      tip: "Trust your intuition, but for important decisions, validate with data at least once.",
    },
    ja: {
      title: "直感的知覚型",
      description: "蓄積された経験とパターン認識から生まれる直感を信頼します。論理的分析よりも「感じ」や「直感がきた」というシグナルを重視し、素早く決定できます。",
      strength: "迅速な決定、経験からの知恵の活用、創造的な解決策",
      weakness: "直感が偏見から来る可能性、データを無視するリスク、説明が難しい",
      tip: "直感を信頼しつつも、重要な決定はデータで一度検証する習慣を持ちましょう。",
    },
    zh: {
      title: "直觉感知型",
      description: "你信任由累积经验和模式识别形成的直觉。相比逻辑分析，你更重视“感觉”或“预感”的信号，并且能够快速做决定。",
      strength: "决策迅速、善用经验智慧、能提出有创意的解决方案",
      weakness: "直觉可能来自偏见，有忽视数据的风险，也不容易向他人解释",
      tip: "可以信任直觉，但重要决定最好养成至少用数据验证一次的习惯。",
    },
    fr: {
      title: "Percepteur intuitif",
      description: "Vous faites confiance à l'intuition issue de l'expérience accumulée et de la reconnaissance de schémas. Vous accordez plus d'importance aux ressentis qu'à l'analyse logique et vous pouvez décider rapidement.",
      strength: "Décisions rapides, sagesse tirée de l'expérience, solutions créatives",
      weakness: "L'intuition peut venir de biais, risque d'ignorer les données, difficile à expliquer aux autres",
      tip: "Faites confiance à votre intuition, mais pour les décisions importantes, prenez l'habitude de la vérifier au moins une fois avec des données.",
    },
    es: {
      title: "Perceptor intuitivo",
      description: "Confías en la intuición que surge de la experiencia acumulada y del reconocimiento de patrones. Valoras las corazonadas más que el análisis lógico y puedes decidir con rapidez.",
      strength: "Decisiones rápidas, uso de sabiduría experiencial, soluciones creativas",
      weakness: "La intuición puede venir de sesgos, riesgo de ignorar datos, difícil de explicar a otros",
      tip: "Confía en tu intuición, pero en decisiones importantes acostúmbrate a validarla al menos una vez con datos.",
    },
  },
  dependent: {
    emoji: "🤝",
    color: "#10b981",
    ko: {
      title: "의존적 협의형",
      description: "당신은 중요한 결정을 혼자 내리기보다 신뢰하는 사람들의 의견을 구합니다. 집단 지혜를 활용하고 관계 안에서 안정감을 찾는 스타일입니다.",
      strength: "다양한 관점 수집, 사회적 지지 활용, 독단적 실수 방지",
      weakness: "자율성 부족, 타인 의존 시 책임감 희석, 조언자 선택이 중요",
      tip: "타인의 조언을 '정보'로 활용하되, 최종 결정은 자신이 내리는 연습을 해보세요.",
    },
    en: {
      title: "Collaborative Consulter",
      description: "You seek input from trusted people rather than deciding alone on important matters. You leverage collective wisdom and find stability within relationships.",
      strength: "Collects diverse perspectives, leverages social support, prevents unilateral mistakes",
      weakness: "Lack of autonomy, diffused accountability when relying on others, choice of advisor matters greatly",
      tip: "Use others' advice as 'information,' but practice making the final decision yourself.",
    },
    ja: {
      title: "協調的相談型",
      description: "重要な決定を一人で下すよりも、信頼できる人々の意見を求めます。集合知を活用し、関係の中で安定感を見つけるスタイルです。",
      strength: "多様な視点の収集、社会的支援の活用、独断的なミスの防止",
      weakness: "自律性の不足、他者依存時の責任感希薄化、アドバイザー選びが重要",
      tip: "他者のアドバイスを「情報」として活用しつつ、最終決定は自分で下す練習をしましょう。",
    },
    zh: {
      title: "协作咨询型",
      description: "面对重要事项时，你更倾向于征求值得信任的人的意见，而不是独自决定。你会运用集体智慧，并在关系中获得稳定感。",
      strength: "收集多元视角、善用社会支持、减少独断带来的错误",
      weakness: "自主性可能不足，依赖他人时责任感容易被稀释，顾问选择非常重要",
      tip: "把他人的建议当作“信息”来使用，同时练习由自己做出最终决定。",
    },
    fr: {
      title: "Consultant collaboratif",
      description: "Pour les décisions importantes, vous préférez solliciter l'avis de personnes de confiance plutôt que décider seul. Vous utilisez la sagesse collective et trouvez de la stabilité dans les relations.",
      strength: "Recueil de points de vue variés, appui sur le soutien social, prévention des erreurs solitaires",
      weakness: "Manque possible d'autonomie, responsabilité diluée si vous dépendez trop des autres, choix des conseillers crucial",
      tip: "Utilisez les conseils des autres comme de l'information, tout en vous entraînant à prendre vous-même la décision finale.",
    },
    es: {
      title: "Consultor colaborativo",
      description: "En asuntos importantes, prefieres pedir opinión a personas de confianza antes que decidir a solas. Aprovechas la sabiduría colectiva y encuentras estabilidad en las relaciones.",
      strength: "Recoge perspectivas diversas, aprovecha el apoyo social, evita errores unilaterales",
      weakness: "Falta de autonomía, responsabilidad diluida al depender de otros, la elección del asesor importa mucho",
      tip: "Usa los consejos de otros como “información”, pero practica tomar la decisión final por tu cuenta.",
    },
  },
  avoidant: {
    emoji: "🌀",
    color: "#f59e0b",
    ko: {
      title: "회피적 지연형",
      description: "당신은 잘못된 결정에 대한 두려움으로 결정을 최대한 미루는 경향이 있습니다. 더 많은 정보를 기다리거나, 상황이 저절로 해결되길 바라는 패턴을 보입니다.",
      strength: "충동적 결정 방지, 시간이 해결해주는 문제도 있음",
      weakness: "결정 지연으로 기회 상실, 불확실성 불안 증가, 타인에게 결정 위임",
      tip: "모든 결정에 '마감 기한'을 설정하고, 불완전한 선택도 선택임을 기억하세요.",
    },
    en: {
      title: "Avoidant Delayer",
      description: "You tend to delay decisions as long as possible out of fear of making the wrong choice. You wait for more information or hope situations resolve themselves.",
      strength: "Prevents impulsive decisions, some problems do resolve with time",
      weakness: "Lost opportunities from delays, increasing anxiety over uncertainty, delegating decisions to others",
      tip: "Set a 'deadline' for every decision, and remember that an imperfect choice is still a choice.",
    },
    ja: {
      title: "回避的遅延型",
      description: "間違った決定への恐れから、できる限り決定を先延ばしにする傾向があります。より多くの情報を待ったり、状況が自然に解決されることを期待するパターンを示します。",
      strength: "衝動的な決定の防止、時間が解決する問題もある",
      weakness: "決定遅延による機会損失、不確実性の不安増大、他者への決定委任",
      tip: "すべての決定に「締め切り」を設定し、不完全な選択も選択であることを覚えておきましょう。",
    },
    zh: {
      title: "回避拖延型",
      description: "你因为害怕做出错误选择，往往会尽量推迟决定。你可能等待更多信息，或希望情况自己解决。",
      strength: "能避免冲动决定，有些问题确实会随着时间改善",
      weakness: "拖延导致机会流失，对不确定性的焦虑增加，可能把决定交给别人",
      tip: "为每个决定设定一个“截止时间”，并记住：不完美的选择依然是选择。",
    },
    fr: {
      title: "Temporisateur évitant",
      description: "Vous avez tendance à repousser les décisions autant que possible par peur de faire le mauvais choix. Vous attendez plus d'informations ou espérez que la situation se règle d'elle-même.",
      strength: "Évite les décisions impulsives, certains problèmes se résolvent avec le temps",
      weakness: "Occasions perdues à force d'attendre, anxiété accrue face à l'incertitude, décisions déléguées aux autres",
      tip: "Fixez une échéance pour chaque décision et rappelez-vous qu'un choix imparfait reste un choix.",
    },
    es: {
      title: "Aplazador evitativo",
      description: "Tiendes a retrasar las decisiones todo lo posible por miedo a elegir mal. Esperas más información o deseas que la situación se resuelva sola.",
      strength: "Evita decisiones impulsivas, algunos problemas sí se resuelven con el tiempo",
      weakness: "Pérdida de oportunidades por demora, más ansiedad ante la incertidumbre, delegación de decisiones en otros",
      tip: "Pon una fecha límite para cada decisión y recuerda que una elección imperfecta también es una elección.",
    },
  },
  spontaneous: {
    emoji: "⚡",
    color: "#ef4444",
    ko: {
      title: "즉흥적 충동형",
      description: "당신은 그 순간의 감정과 직관으로 빠르게 결정합니다. 분석보다 행동을 선호하며, 상황에 즉각 반응하는 유연성이 강점입니다.",
      strength: "빠른 행동력, 기회 포착, 심사숙고의 스트레스 없음",
      weakness: "충동적 결정으로 인한 후회, 장기적 결과 고려 부족, 감정 상태에 따라 결정 품질이 달라짐",
      tip: "중요한 결정에는 '하루 수면 후 결정하기' 규칙을 적용해보세요. 감정이 식은 후에도 같은 선택을 하시겠습니까?",
    },
    en: {
      title: "Spontaneous Impulsive",
      description: "You make quick decisions based on in-the-moment emotions and intuition. You prefer action over analysis, and your immediate responsiveness is a strength.",
      strength: "Fast action, opportunity capture, no stress from over-deliberation",
      weakness: "Regret from impulsive choices, insufficient consideration of long-term consequences, decision quality varies with emotional state",
      tip: "For important decisions, apply the 'sleep on it' rule. Would you make the same choice after your emotions have settled?",
    },
    ja: {
      title: "即興的衝動型",
      description: "その瞬間の感情と直感で素早く決定します。分析よりも行動を好み、状況への即時対応力が強みです。",
      strength: "速い行動力、機会の把握、熟考のストレスなし",
      weakness: "衝動的な決定による後悔、長期的結果の考慮不足、感情状態によって決定の質が変わる",
      tip: "重要な決定には「一晩寝てから決める」ルールを適用しましょう。感情が落ち着いた後でも同じ選択をしますか？",
    },
    zh: {
      title: "即兴冲动型",
      description: "你会根据当下的情绪和直觉快速做决定。相比分析，你更偏好行动，并且能灵活地即时回应情况。",
      strength: "行动迅速、善于抓住机会、不会承受过度思考的压力",
      weakness: "冲动选择可能带来后悔，对长期后果考虑不足，决策质量会随情绪状态变化",
      tip: "面对重要决定时，试试“睡一晚再决定”的规则。情绪平复后，你还会做同样的选择吗？",
    },
    fr: {
      title: "Impulsif spontané",
      description: "Vous décidez vite à partir de vos émotions et de votre intuition du moment. Vous préférez l'action à l'analyse, et votre capacité à réagir immédiatement est une vraie force.",
      strength: "Passage à l'action rapide, saisie des occasions, pas de stress lié à l'excès de réflexion",
      weakness: "Regrets liés aux choix impulsifs, conséquences à long terme parfois négligées, qualité des décisions variable selon l'état émotionnel",
      tip: "Pour les décisions importantes, appliquez la règle : dormir dessus. Feriez-vous le même choix une fois vos émotions retombées ?",
    },
    es: {
      title: "Impulsivo espontáneo",
      description: "Tomas decisiones rápidas según las emociones y la intuición del momento. Prefieres la acción al análisis, y tu capacidad de responder de inmediato es una fortaleza.",
      strength: "Acción rápida, capacidad para aprovechar oportunidades, sin estrés por deliberar demasiado",
      weakness: "Arrepentimiento por decisiones impulsivas, poca consideración de consecuencias a largo plazo, calidad variable según el estado emocional",
      tip: "Para decisiones importantes, aplica la regla de “consultarlo con la almohada”. ¿Elegirías lo mismo después de que bajen tus emociones?",
    },
  },
};

const t: Record<SupportedLocale, {
  title: string;
  subtitle: string;
  progress: (cur: number, total: number) => string;
  resultTitle: string;
  strength: string;
  weakness: string;
  tip: string;
  scoreLabel: string;
  restart: string;
  share: string;
  copied: string;
}> = {
  ko: {
    title: "의사결정 스타일 테스트",
    subtitle: "나는 어떻게 결정을 내리는가?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "나의 의사결정 스타일",
    strength: "강점",
    weakness: "약점",
    tip: "성장 팁",
    scoreLabel: "유형별 점수",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Decision-Making Style Test",
    subtitle: "How Do You Make Decisions?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Your Decision-Making Style",
    strength: "Strengths",
    weakness: "Weaknesses",
    tip: "Growth Tip",
    scoreLabel: "Score by Style",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "意思決定スタイルテスト",
    subtitle: "あなたはどのように決定を下しますか？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "あなたの意思決定スタイル",
    strength: "強み",
    weakness: "弱点",
    tip: "成長のヒント",
    scoreLabel: "スタイル別スコア",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "决策风格测试",
    subtitle: "你是如何做决定的？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "你的决策风格",
    strength: "优势",
    weakness: "弱点",
    tip: "成长建议",
    scoreLabel: "各风格得分",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test de style décisionnel",
    subtitle: "Comment prenez-vous vos décisions ?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Votre style décisionnel",
    strength: "Forces",
    weakness: "Faiblesses",
    tip: "Conseil de progression",
    scoreLabel: "Score par style",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de estilo de decisión",
    subtitle: "¿Cómo tomas decisiones?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Tu estilo de decisión",
    strength: "Fortalezas",
    weakness: "Debilidades",
    tip: "Consejo de crecimiento",
    scoreLabel: "Puntuación por estilo",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

export default function DecisionMakingTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<DecisionType, number>>({
    rational: 0,
    intuitive: 0,
    dependent: 0,
    avoidant: 0,
    spontaneous: 0,
  });
  const [result, setResult] = useState<DecisionType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const dm = p.get("dm") as DecisionType | null;
    if (dm && results[dm]) setResult(dm);
  }, []);

  function pick(type: DecisionType) {
    const next = { ...scores, [type]: scores[type] + 1 };
    const answeredCount = Object.values(next).reduce((a, b) => a + b, 0);

    if (answeredCount < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(answeredCount), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as DecisionType[]).reduce((a, b) =>
        next[a] >= next[b] ? a : b
      );
      setResult(winner);
      const url = new URL(window.location.href);
      url.searchParams.set("dm", winner);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0);
    setScores({ rational: 0, intuitive: 0, dependent: 0, avoidant: 0, spontaneous: 0 });
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("dm");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: tx.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const typeLabels: Record<DecisionType, Record<SupportedLocale, string>> = {
    rational: { ko: "이성형", en: "Rational", ja: "合理型", zh: "理性型", fr: "Rationnel", es: "Racional" },
    intuitive: { ko: "직관형", en: "Intuitive", ja: "直感型", zh: "直觉型", fr: "Intuitif", es: "Intuitivo" },
    dependent: { ko: "협의형", en: "Collaborative", ja: "相談型", zh: "协作型", fr: "Collaboratif", es: "Colaborativo" },
    avoidant: { ko: "회피형", en: "Avoidant", ja: "回避型", zh: "回避型", fr: "Évitant", es: "Evitativo" },
    spontaneous: { ko: "즉흥형", en: "Spontaneous", ja: "即興型", zh: "即兴型", fr: "Spontané", es: "Espontáneo" },
  };

  if (result) {
    const r = results[result];
    const rd = r[locale];
    const chartData = (Object.keys(scores) as DecisionType[]).map((k) => ({
      name: typeLabels[k][locale],
      value: scores[k],
      fill: results[k].color,
      fillOpacity: k === result ? 1 : 0.45,
    }));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-50 p-6 text-center">
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-3 text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-green-700">✅ {tx.strength}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.strength}</p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600">⚠️ {tx.weakness}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.weakness}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <h3 className="font-semibold text-green-700">💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-green-800">{rd.tip}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-700">{tx.scoreLabel}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
              <XAxis type="number" domain={[0, questions.length]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {tx.restart}
          </button>
          <button
            onClick={share}
            className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-medium text-white transition hover:bg-green-700"
          >
            {copied ? tx.copied : tx.share}
          </button>
        </div>
        <ShareResultButton locale={locale} heading={tx.title} resultTitle={rd.title} emoji={r.emoji} description={rd.description} />
      </div>
    );
  }

  const q = questions[idx];

  return (
    <Questionnaire
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={(idx / questions.length) * 100}
      options={q.options.map((opt, optionIndex) => ({ label: opt[locale], value: optionIndex + 1 }))}
      onSelect={(value) => pick(q.options[value - 1].type)}
    />
  );
}
